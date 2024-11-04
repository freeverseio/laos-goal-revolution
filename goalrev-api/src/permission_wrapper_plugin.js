//import ethers
const ethers = require('ethers');

async function verifyToken(token, grace) {
  // Split the token based on ":"
  const tokenFields = token.split(":");
  if (tokenFields.length !== 2) {
    return { address: "", timestamp: null, error: new Error("Malformed token") };
  }

  // Parse the timestamp
  const tsunix = parseInt(tokenFields[0], 10);
  const ts = new Date(tsunix * 1000); // Convert seconds to milliseconds
  const now = new Date();

  // Check if token is out of time
  if (Math.abs(now - ts) / 1000 > grace) {
    return { address: "", timestamp: null, error: new Error("Token out of time") };
  }

  // Hash the token (ensure it's a bytes32)
  const signature = Buffer.from(tokenFields[1], 'base64');
  if (signature.length !== 65) {
      return { address: "", timestamp: null, error: new Error("Invalid signature length") };
  }
  const r = '0x' + signature.slice(0, 32).toString('hex');
  const s = '0x' + signature.slice(32, 64).toString('hex');
  const v = signature[64] + 27;
  const hash = ethers.hashMessage(tokenFields[0]);

  let recoveredSignerAddress;
  try {
      recoveredSignerAddress = ethers.recoverAddress(hash, { r, s, v });
  } catch (error) {
      return { address: "", timestamp: null, error: new Error("Invalid signature") };
  }

  return { address: recoveredSignerAddress, timestamp: ts, error: null };
}

const extractBearerToken = (req) => {
  if (!req?.headers?.authorization) {
    return 'no-token';
  }

  const authHeader = req.headers.authorization;
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }

  return authHeader;
};


const getTeamIdByOwner = async (pgClient, { owner }) => {
  const query = {
      text: 'SELECT team_id FROM teams WHERE owner =  $1',
      values: [owner],
  };

  const result = await pgClient.query(query);
  if (result.rowCount === 0) {
      return null;
  }
  return result.rows[0].team_id;
};

module.exports = function makePermissionPlugin(builder) {
  builder.hook('GraphQLObjectType:fields', (fields, build, context) => {
    const { scope: { isRootQuery, isRootMutation } } = context;

    // Only wrap root level queries and mutations
    // if (!isRootQuery && !isRootMutation) return fields;
    if (!isRootMutation) return fields; // only check mutations

    // Create new field definitions with wrapped resolvers
    const newFields = {};

    for (const [fieldName, field] of Object.entries(fields)) {
      const originalResolve = field.resolve;

      newFields[fieldName] = {
        ...field,
        resolve: async (...args) => {
          const [source, arguments_, context, info] = args;
          const operationType = isRootQuery ? 'Query' : 'Mutation';

          // Extract token from request headers using the req object from context
          const token = extractBearerToken(context?.req);

          try {

            // Check signer
            const { address, timestamp: ts, error } = await verifyToken(token, 10000);
            if (error || address === '') {
              console.log({
                type: operationType,
                operation: fieldName,
                token: token,
                timestamp: new Date().toISOString(),
                args: arguments_,
              });
              console.warn("Access Denied to token: " + token + " linked address: [" + address + "]");
              throw new Error('Access Denied to token: ' + token);
            }

            // Check teamId of the signer
            const { pgClient } = context;
            const teamId = await getTeamIdByOwner(pgClient, { owner: address });
  
            if (!teamId) {
              // Mutation executed with invalid token - Owner does not exist
              console.warn(`mutation executed with invalid token - that owner does not exist: ${address}`);
              throw new Error('Access Denied to token: ' + token);

            } else if (arguments_?.teamId) {
              // check if mutation teamId matches with the owner team
              if (arguments_.teamId !== teamId) {
                console.log({
                  type: operationType,
                  operation: fieldName,
                  token: token,
                  timestamp: new Date().toISOString(),
                  args: arguments_,
                });
                console.warn("Access Denied to teamId: " + arguments_.teamId + " from " + address);
                throw new Error('Access Denied to teamId: ' + arguments_.teamId);
              }

            }

            const result = await (originalResolve ? originalResolve(...args) : field.resolve(...args));
            return result;
          } catch (error) {
            console.error({
              type: operationType,
              operation: fieldName,
              token: token,
              timestamp: new Date().toISOString(),
              status: 'Error in verifyToken',
              error: error.message
            });
            throw error;
          }
        },
      };
    }

    return newFields;
  });
};