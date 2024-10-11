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
        setLastTimeLoggedIn(teamId: ID!): Boolean
      }
      
      extend type Query {
        getBestPlayers(limit: Int!): [String!]
        getNumUnreadMessages(teamId : ID!): Int! 
        getMessages(teamId: ID!, auctionId: ID, limit: Int, offset: Int): Messages!
      }

      type Message {
        id: String
        destinatary: String!
        category: String!
        auctionId: String
        title: String!
        text: String!
        customImageUrl: String
        metadata: String
        isRead: Boolean
        createdAt: String
      }

      type Messages {
        totalCount: Int!
        nodes: [Message]
      }

      type PlayerHistoryGraphEncodedSkills {
        encodedSkills: String
      }
      
      type PlayerHistoryGraph {
        nodes: [PlayerHistoryGraphEncodedSkills]
      }
      
      extend type Player {
        playerHistoryGraphByPlayerId(first: Int!): PlayerHistoryGraph
      }
      `,
      
    resolvers: Resolvers(sql),
  }
});