require('dotenv').load();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const { execute, subscribe } = require('graphql');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('Connected to mLab Database');
}, err => {
  console.error(err);
})

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://olwisconse.surge.sh', 'http://www.olwisconse.com'],
  credentials: true
}));

const User = require('./models/User');

app.use(cookieParser(), (req, res, next) => {
  const sessionToken = req.cookies[process.env.SESSION_COOKIE_NAME];
  if (sessionToken) {
    User.findOne({ sessionToken }).then(user => {
      req.user = user;
      next();
    }).catch(err => {
      next();
    })
  } else {
    next();
  }
});

app.use('/graphql', bodyParser.json(), (req, res, next) => graphqlExpress({
  schema,
  context: { req, res }
})(req, res, next));

const PORT = process.env.PORT || 3000;
let HOST = 'ws://localhost'
if (process.env.NODE_ENV === 'production') {
  HOST = 'wss://olwisconse-graphql.herokuapp.com'
}

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint: `${HOST}:${PORT}/subscriptions`
}));

const ws = createServer(app);
ws.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log('Server listening at http://localhost:' + PORT, '(with subscriptions!)');
  new SubscriptionServer({
    execute,
    subscribe,
    schema
  }, {
    server: ws,
    path: '/subscriptions',
  });
});