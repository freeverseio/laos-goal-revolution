const {getMessagesResolver, getNumUnreadMessagesResolver} = require("./resolvers/messagesResolver");
const {updateTeamNameResolver} = require("./resolvers/teamNameResolver");
const {updateTeamManagerNameResolver} = require("./resolvers/teamManagerNameResolver");

const resolvers = (sql) => {
  return {
    Query: {
      getBestPlayers: async (parent, args, context, info) => {
        const { limit } = args;
        const query = sql.query`SELECT player_id, SUM(defence + speed + pass + shoot + endurance) AS sum_of_skills 
        FROM players GROUP BY player_id ORDER BY sum_of_skills DESC LIMIT ${sql.value(limit)};`

        const { text, values } = sql.compile(query);
        const result = await context.pgClient.query(text, values);
        return result.rows.map(obj => obj.player_id);
      },
      getNumUnreadMessages: async (parent, args, context, info) => {
        const { teamId } = args;
        return getNumUnreadMessagesResolver(context, { teamId });
      },      
      getMessages: async (parent, args, context, info) => {
        const { teamId, auctionId, limit, offset } = args;
        return getMessagesResolver(context, { teamId, auctionId, limit, offset });
      },
    },
    Mutation: {
      createSpecialPlayer: async (_, params, context) => {
        const { playerId, name, defence, speed, pass, shoot, endurance, preferredPosition, potential, dayOfBirth } = params;
        const query = sql.query`INSERT INTO players (
              name,
              player_id,
              team_id, 
              defence, 
              speed, 
              pass, 
              shoot, 
              endurance, 
              shirt_number, 
              preferred_position, 
              potential,
              day_of_birth,
              encoded_skills,
              encoded_state,
              red_card,
              block_number,
              injury_matches_left) VALUES (
                ${sql.value(name)},
                ${sql.value(playerId)},
                ${sql.value('1')}, 
                ${sql.value(defence)}, 
                ${sql.value(speed)},
                ${sql.value(pass)},
                ${sql.value(shoot)},
                ${sql.value(endurance)},
                ${sql.value(0)},
                ${sql.value(preferredPosition)},
                ${sql.value(potential)},
                ${sql.value(dayOfBirth)},
                ${sql.value('')},
                ${sql.value('')},
                ${sql.value(0)},
                ${sql.value(0)},
                ${sql.value(0)}
            )`;
        const { text, values } = sql.compile(query);
        await context.pgClient.query(text, values);
        return true;// TODO return something with sense
      },
      deleteSpecialPlayer: async (_, { playerId }, context) => {
        const query = sql.query`DELETE FROM players WHERE team_id=${sql.value('1')} AND player_id=${sql.value(playerId)};`;
        const { text, values } = sql.compile(query);
        await context.pgClient.query(text, values);
        return true;// TODO return something with sense
      },
      setLastTimeLoggedIn: async (_, { teamId }, context) => {
        try{ 
          console.log("setLastTimeLoggedIn for team: ",teamId);
          var query = {
            text: 'INSERT INTO team_props(team_id, last_time_logged_in) VALUES($1, CURRENT_TIMESTAMP) ON CONFLICT (team_id) DO UPDATE SET last_time_logged_in = CURRENT_TIMESTAMP',
            values: [teamId],
          };                   
          await context.pgClient.query(query);

          return true;
        } catch (e) {
          console.error("Error in setLastTimeLoggedIn",e);
          throw e;
        }
      },
      setTeamName: async (_, { input: { teamId, name, signature } }, context) => {
        console.log("setTeamName for team: ",teamId, name, signature);
        updateTeamNameResolver(context, { teamId, name, signature });
        return teamId + " - " + name;
      },
      setTeamManagerName: async (_, { input: { teamId, name, signature } }, context) => {
        console.log("setTeamManagerName for team: ",teamId, name, signature);
        updateTeamManagerNameResolver(context, { teamId, name, signature });
        return teamId + " - " + name;
      },
    }
  };
};

module.exports = resolvers;