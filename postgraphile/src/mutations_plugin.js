const { makeExtendSchemaPlugin, gql } = require("graphile-utils");
const Resolvers = require("./resolvers");

module.exports = makeExtendSchemaPlugin(build => {
  // Get any helpers we need from `build`
  const { pgSql: sql, inflection } = build;

  return {
    typeDefs: gql`
      extend type Mutation {
        createSpecialPlayer(
          playerId: String!,
          name: String!,
          defence: Int!,
          speed: Int!,
          pass: Int!,
          shoot: Int!,
          endurance: Int!,
          preferredPosition: String!,
          potential: Int!,
          dayOfBirth: Int!
        ): Boolean,
        deleteSpecialPlayer(
          playerId: String!
        ): Boolean
      }
      
      extend type Query {
        getBestPlayers(limit: Int!): [String!]
      }`,
    resolvers: Resolvers(sql),
  }
});