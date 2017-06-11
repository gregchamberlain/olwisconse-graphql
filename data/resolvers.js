const bcrypt = require('bcrypt');
const aws = require('aws-sdk');

const { User, Location, Quote, Image } = require('../models');

const s3 = new aws.S3();

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
    signup(_, { user }) {
      const salt = bcrypt.genSaltSync(10);
      const passwordDigest = bcrypt.hashSync(user.password, salt);
      return User.create({
        username: user.username.toLowerCase(),
        displayName: user.displayName,
        passwordDigest,
        sessionToken: ( Math.floor( Math.random() * 100000 ) ).toString() }
      );
    },
    login(_, { user }, { res }) {
      return User.findOne({ username: user.username.toLowerCase() }).then(currentUser => {
        if (!currentUser) throw new Error('User does not exist.');
        if (bcrypt.compareSync(user.password, currentUser.passwordDigest)) {
          res.cookie('OLWISCONSE_SESSION', currentUser.sessionToken, { maxAge: 1000 * 60 * 60 * 24 * 365 });
          return currentUser;
        } else {
          throw new Error('Invalid password for that username.')
        }
      })
    },
    async logout(_, args, { req, res }) {
      if (req.user) {
        res.clearCookie('OLWISCONE_SESSION');
        req.user.sessionToken = generateSessionToken();
        await req.user.save();
        return req.user;
      } else {
        return null;
      }
    },
    async updateProfilePicture(_, { url }, { req }) {
      const image = await Image.create({ url, people: [req.user.id], owner: req.user.id });
      req.user.profilePicture = image.id;
      await req.user.save();
      return image;
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
    createQuote(_, { quote }, { req }) {
      return Quote.create({ ...quote, owner: req.user.id });
    },
    createImages(_, { urls }, { req }) {
      const images = urls.map(url => ({ url, owner: req.user.id }));
      return Image.insertMany(images);
    },
    updateImage(_, { image }) {
      return Image.findByIdAndUpdate(image.id, image, { new: true });
    }
  }
};

module.exports = resolvers;