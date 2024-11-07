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
        transferFirstBotToAddr(timezone: Int!, countryIdxInTimezone: ID!, address: String!): Boolean
        setMessage(input: SetMessageInput!): ID!
        setMessageRead(id: ID!): Boolean
        setTeamName(input: SetTeamNameInput!): ID!
        setTeamManagerName(input: SetTeamManagerNameInput!): ID!
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

      input SetMessageInput {
        destinatary: String!
        category: String!
        auctionId: String
        title: String!
        text: String!
        customImageUrl: String
        metadata: String
      }

      input SetTeamNameInput {
        signature: String!
        teamId: ID!
        name: String!
      }
    
      input SetTeamManagerNameInput {
        signature: String!
        teamId: ID!
        name: String!
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