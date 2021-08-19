// loading schema.graphql file with built in Node JS API (fs - file system)
const fs = require('fs');

// To enable Websocket, we need to first import HTTP module - node js built in module
const http = require('http');

// to integrate GraphQL with the Express Backend
const { ApolloServer } = require('apollo-server-express');

const cors = require('cors');
const express = require('express');
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const port = 9000;
const jwtSecret = Buffer.from('xkMBdsE+P6242Z2dPV3RD91BPbLIko7t', 'base64');

const app = express();
app.use(
  cors(),
  express.json(),
  expressJwt({
    credentialsRequired: false,
    secret: jwtSecret,
    algorithms: ['HS256'],
  })
);

const typeDefs = fs.readFileSync('./schema.graphql', { encoding: 'utf8' });
const resolvers = require('./resolvers');

// extracting http token into websocket
function context({ req, connection }) {
  if (req && req.user) {
    return { userId: req.user.sub };
  }

  // to check if this is a websocket connection, if so extract token
  if (connection && connection.context && connection.context.accessToken) {
    // for subscription, we have to decode token by ourself
    const decodedToken = jwt.verify(connection.context.accessToken, jwtSecret);
    return { userId: decodedToken.sub };
  }
  return {};
}

// NOTE - Basic setup for using Apollo Server with Express
// Apollo server instance with our type definitions & resolver objects
// Note - We pass 'context' property into an instance of Apollo Server in server.js as initial setup
// 'context' will be an func which gets Object that contains Express Request Object
// NOTE - this function will return 'context' object in the Resolver
const apolloServer = new ApolloServer({ typeDefs, resolvers, context });

// applyMiddleware func - to connect Apollo server into our existing Express app
// Passing instance of express app from above - const app = express() &
// optionally we can also set a path that is where we want to expose graphQL endpoint on our server
apolloServer.applyMiddleware({ app, path: '/graphql' });
// http://localhost:9000/graphql

app.post('/login', (req, res) => {
  const { name, password } = req.body;
  const user = db.users.get(name);
  if (!(user && user.password === password)) {
    res.sendStatus(401);
    return;
  }
  const token = jwt.sign({ sub: user.id }, jwtSecret);
  res.send({ token });
});

// Creating New Http server to enable websocket by passing Express App as argument
const httpServer = http.createServer(app);

// now we can tell apolloServer to install 'Subscription Handlers' on the http server
apolloServer.installSubscriptionHandlers(httpServer);
// NOTE - this enables a Websocket to be use for GraphQL

// app.listen(port, () => console.log(`Server started on port ${port}`));
// Instead of calling with 'app' like above, we call it with httpServer.listen()
httpServer.listen(port, () => console.log(`Server started on port ${port}`));
// now we have our own httpServer as before it was created by Express App
