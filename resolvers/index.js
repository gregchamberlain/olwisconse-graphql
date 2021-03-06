import GraphQLJSON from 'graphql-type-json';
import bcrypt from 'bcrypt';
import aws from 'aws-sdk';
import { PubSub, withFilter } from 'graphql-subscriptions';
import Expo from 'exponent-server-sdk';

import { sendNotifications } from '../utils/Notification';

import {
  User,
  Location,
  Quote,
  Image,
  Era,
  Post,
  Channel,
  Message,
} from '../models';

const s3 = new aws.S3();
const pubsub = new PubSub();

const generateSessionToken = () =>
  Math.random()
    .toString(36)
    .substring(7);

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
    userById(_, { id }) {
      return User.findById(id);
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
      return Era.find().sort('-_startDate');
    },
    era(_, { id }) {
      return Era.findById(id);
    },
    posts() {
      return Post.find();
    },
    channels(_, args, { req }) {
      if (!req.user) throw new Error('You must sign in.');
      return Channel.find({ peopleIds: req.user.id });
    },
    channel(_, { id }, { req }) {
      if (!req.user) throw new Error('You must sign in.');
      return Channel.findById(id);
    },
    messages(_, { channelId, limit = 20 }) {
      return Message.find({ channelId })
        .sort('-_createdAt')
        .limit(limit);
    },
  },
  Mutation: {
    async signup(_, { user, device }, { res }) {
      const salt = bcrypt.genSaltSync(10);
      const passwordDigest = bcrypt.hashSync(user.password, salt);
      const sessionToken = generateSessionToken();
      const newUser = await User.create({
        username: user.username.toLowerCase(),
        displayName: user.displayName,
        passwordDigest,
        sessions: [
          {
            token: sessionToken,
            device,
          },
        ],
      });
      res.cookie(process.env.SESSION_COOKIE_NAME, sessionToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      return newUser;
    },
    async login(_, { user, device }, { res }) {
      const currentUser = await User.findOne({
        username: user.username.toLowerCase(),
      });
      if (!currentUser)
        throw new Error('Account with that username does not exist');
      if (!bcrypt.compareSync(user.password, currentUser.passwordDigest)) {
        throw new Error('Incorrect password for that username.');
      }
      const sessionToken = generateSessionToken();
      res.cookie(process.env.SESSION_COOKIE_NAME, sessionToken, {
        maxAge: 1000 * 60 * 60 * 24 * 365,
      });
      // Remove old sessions from the same device.
      currentUser.session = currentUser.sessions.filter((session) => {
        if (!(session.device && device)) return true;
        return session.device.id !== device.id;
      });
      currentUser.sessions.push({
        token: sessionToken,
        device,
      });
      return currentUser.save();
    },
    async logout(_, args, { req, res }) {
      if (!req.user) return null;
      res.clearCookie(process.env.SESSION_COOKIE_NAME);
      req.user.sessions = req.user.sessions.filter(
        (session) => session.token !== req.sessionToken,
      );
      return req.user.save();
      // return req.user;
    },
    updateProfilePicture(_, { id }, { req }) {
      req.user.profilePictureId = id;
      return req.user.save();
    },
    getSignedUrl(_, { filename, filetype }) {
      const params = {
        Bucket: 'olwisconse',
        Key: filename,
        Expires: 60,
        ContentType: filetype,
        ACL: 'public-read',
      };
      return s3.getSignedUrl('putObject', params);
    },
    getSignedUrls(_, { files }) {
      return files.map((file) => {
        const params = {
          Bucket: 'olwisconse',
          Key: file.name,
          Expires: 60,
          ContentType: file.type,
          ACL: 'public-read',
        };
        return s3.getSignedUrl('putObject', params);
      });
    },
    createLocation(_, { location }) {
      return Location.create(location);
    },
    updateLocation(_, { location }) {
      return Location.findByIdAndUpdate(location.id, location, { new: true });
    },
    createImages(_, { urls }, { req }) {
      const images = urls.map((url) => ({ url, ownerId: req.user.id }));
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
      post.ownerId = req.user.id;
      return Post.create(post);
    },
    updatePost(_, { post }) {
      return Post.findByIdAndUpdate(post.id, post, { new: true });
    },
    createChannel(_, { channel }, { req }) {
      if (!req.user) throw new Error('You must sign in to create a channel');
      if (!channel.peopleIds) channel.peopleIds = [req.user.id];
      if (!channel.peopleIds.includes(req.user.id))
        channel.peopleIds.unshift(req.user.id);
      channel.ownerId = req.user.id;
      return Channel.create(channel);
    },
    updateChannel(_, { channel }, { req }) {
      if (!req.user) throw new Error('You must sign in to update a channel');
      if (!channel.peopleIds.includes(req.user.id))
        channel.peopleIds.unshift(req.user.id);
      return Channel.findByIdAndUpdate(channel.id, channel, { new: true });
    },
    sendMessage(_, { channelId, message }, { req }) {
      if (!req.user) throw new Error('You must sign in to send a message');
      message.channelId = channelId;
      message.ownerId = req.user.id;
      return Message.create(message).then((newMessage) => {
        Channel.findById(channelId)
          .populate('peopleIds')
          .then((channel) => {
            const tokens = [];
            channel.peopleIds.forEach((user) => {
              if (user.id === req.user.id) return;
              user.sessions.forEach((session) => {
                if (
                  session.pushTokens &&
                  session.pushTokens.expo &&
                  Expo.isExponentPushToken(session.pushTokens.expo)
                )
                  tokens.push(session.pushTokens.expo);
              });
            });
            const notifications = tokens.map((to) => ({
              to,
              title: channel.name,
              body: `${req.user.displayName}: ${newMessage.text}`,
              priority: 'high',
              data: {
                routeName: 'Chat',
                params: {
                  channelId: channel.id,
                  channelName: channel.name,
                },
              },
            }));
            sendNotifications(notifications);
          });
        pubsub.publish('newMessage', { newMessage, channelId });
        return newMessage;
      });
    },
    setPushTokens(_, { pushTokens }, { req }) {
      const session = req.user.sessions.filter(
        (s) => s.token === req.sessionToken,
      )[0];
      Object.keys(pushTokens).forEach((key) => {
        session.pushTokens[key] = pushTokens[key];
      });
      return req.user.save().then(() => true);
    },
  },
  Subscription: {
    newMessage: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('newMessage'),
        (payload, variables) => payload.channelId === variables.channelId,
      ),
    },
  },
};

module.exports = resolvers;
