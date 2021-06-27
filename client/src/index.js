import 'bulma/css/bulma.css';
import './style.css';
import React from 'react';
import ReactDOM from 'react-dom';

// ApolloProvider to connect React & GraphQL World
// To provide Data from the Apollo Store into our React App
import { ApolloProvider } from '@apollo/client';

// ApolloClient instance to interact with our GraphQL server on the backend
import client from './graphql/client';

import App from './App';

ReactDOM.render(
  // ApolloProvider is to access GraphQL data
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
