const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const { graphqlExpress, graphiqlExpress } = require('graphql-server-express');
const { makeExecutableSchema } = require('graphql-tools');

const { User } = require('./models');

const app = express();

const getSession = (req, res, next) => {
  
  next();
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  if (err) return console.error(err);
  console.log('Listening at http://localhost:' + PORT);
});