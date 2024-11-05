import { ApolloClient, InMemoryCache } from '@apollo/client';

export const gqlClient = new ApolloClient({
  uri: process.env.GRAPHQL_ENDPOINT!,
  cache: new InMemoryCache(),
  headers: {
    "x-api-key": `${process.env.GRAPHQL_ACCESS_TOKEN}`,
  },
});