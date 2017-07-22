const GraphQLJSON = require('graphql-type-json');
const bcrypt = require('bcrypt');
const aws = require('aws-sdk');

const { User, Location, Quote, Image, Era, Post } = require('../models');

const s3 = new aws.S3();

const generateSessionToken = () => Math.random().toString(36).substring(7);

const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    currentUser(_, args, { req }) {
      return req.user;
    },
    users() {
      return User.find();
    },
    user(_, { username }) {
      return User.findOne({ username });
    },
    locations() {
      return Location.find();
    },
    location(_, { id }) {
      return Location.findById(id);
    },
    images() {
      return Image.find();
    },
    image(_, { id }) {
      return Image.findById(id);
    },
    eras() {
      return Era.find().sort('-startDate');
    },
    era(_, { id }) {
      return Era.findById(id);
    },
    posts() {
      return Post.find();
    }
  },
  Mutation: {
    signup(_, { user }, { res }) {
      const salt = bcrypt.genSaltSync(10);
      const passwordDigest = bcrypt.hashSync(user.password, salt);
      return User.create({
        username: user.username.toLowerCase(),
        displayName: user.displayName,
        passwordDigest,
        sessionToken: generateSessionToken()
      }).then(newUser => {
        res.cookie(process.env.SESSION_COOKIE_NAME, newUser.sessionToken, { maxAge: 1000 * 60 * 60 * 24 * 365 });
        return newUser;
      });
    },
    login(_, { user }, { res }) {
      return User.findOne({ username: user.username.toLowerCase() }).then(currentUser => {
        if (!currentUser) throw new Error('User does not exist.');
        if (bcrypt.compareSync(user.password, currentUser.passwordDigest)) {
          res.cookie(process.env.SESSION_COOKIE_NAME, currentUser.sessionToken, { maxAge: 1000 * 60 * 60 * 24 * 365 });
          return currentUser;
        } else {
          throw new Error('Invalid password for that username.')
        }
      })
    },
    logout(_, args, { req, res }) {
      if (req.user) {
        res.clearCookie(process.env.SESSION_COOKIE_NAME);
        req.user.sessionToken = generateSessionToken();
        return req.user.save().then(() => req.user);
      } else {
        return null;
      }
    },
    updateProfilePicture(_, { id }, { req }) {
      req.user.profilePictureId = id;
      return req.user.save();
      // Image.create({ url, peopleIds: [req.user.id], ownerId: req.user.id }).then(image => {
      //   req.user.profilePictureId = image.id;
      //   return req.user.save().then(() => image);
      // });
    },
    getSignedUrl(_, { filename, filetype}) {
      const params = {
        Bucket: 'olwisconse',
        Key: filename,
        Expires: 60,
        ContentType: filetype,
        ACL: 'public-read'
      };
      return s3.getSignedUrl('putObject', params);
    },
    getSignedUrls(_, { files }) {
      return files.map(file => {
        const params = {
          Bucket: 'olwisconse',
          Key: file.name,
          Expires: 60,
          ContentType: file.type,
          ACL: 'public-read'
        };
        return s3.getSignedUrl('putObject', params);
      });
    },
    createLocation(_, { location }) {
      return Location.create(location);
    },
    updateLocation(_, { location }) {
      return Location.findByIdAndUpdate(location.id, location, { new: true })
    },
    createImages(_, { urls }, { req }) {
      const images = urls.map(url => ({ url, ownerId: req.user.id }));
      return Image.insertMany(images);
    },
    updateImage(_, { image }) {
      return Image.findByIdAndUpdate(image.id, image, { new: true });
    },
    createEra(_, { era }) {
      return Era.create(era);
    },
    updateEra(_, { era }) {
      return Era.findByIdAndUpdate(era.id, era, { new: true });
    },
    createPost(_, { post }, { req }) {
      if (!req.user) throw new Error('You must sign in to create a post');
      post.ownerId = req.user.id
      return Post.create(post);
    },
    updatePost(_, { post }) {
      return Post.findByIdAndUpdate(post.id, post, { new: true });
    }
  }
};

module.exports = resolvers;