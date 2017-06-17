const bcrypt = require('bcrypt');
const aws = require('aws-sdk');

const { User, Location, Quote, Image } = require('../models');

const s3 = new aws.S3();

const generateSessionToken = () => Math.random().toString(36).substring(7);

const resolvers = {
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
    image({ id }) {
      return Image.findById(id);
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
    updateProfilePicture(_, { url }, { req }) {
      Image.create({ url, peopleIds: [req.user.id], ownerId: req.user.id }).then(image => {
        req.user.profilePictureId = image.id;
        return req.user.save().then(() => image);
      });
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
    createImages(_, { urls }, { req }) {
      const images = urls.map(url => ({ url, ownerId: req.user.id }));
      return Image.insertMany(images);
    },
    updateImage(_, { image }) {
      return Image.findByIdAndUpdate(image.id, image, { new: true });
    }
  }
};

module.exports = resolvers;