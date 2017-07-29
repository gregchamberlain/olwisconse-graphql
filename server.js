require('dotenv').load();
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import { execute, subscribe } from 'graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';

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
  console.log(req.headers);
  if (req.header('x-forwarded-for') && req.header('x-forwarded-for').origin) {
    const ips = req.header('x-forwarded-for').origin.split(',');
    const ip = ips[ips.length - 1];
    console.log(ip);
  } else {
    console.log('no ip');
  }
  const sessionToken = req.cookies[process.env.SESSION_COOKIE_NAME];
  if (sessionToken) {
    User.findOne({ 'sessions.token': sessionToken }).then(user => {
      req.sessionToken = sessionToken;
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
let subscriptionsEndpoint = `ws://localhost:${PORT}/subscriptions`
if (process.env.NODE_ENV === 'production') {
  subscriptionsEndpoint = 'wss://olwisconse-graphql.herokuapp.com/subscriptions'
}

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
  subscriptionsEndpoint
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