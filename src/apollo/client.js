/**
 * Apollo Client configuration — connects React to the Django GraphQL API.
 */
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
    uri: 'http://localhost:8000/graphql/',
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            ...headers,
            authorization: token ? `JWT ${token}` : '',
        },
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});

export default client;
