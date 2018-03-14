module.exports = `
scalar JSON

type User {
  id: ID!
  profilePicture: Image
  posts: [Post]
  username: String!
  displayName: String!
  images: [Image]
  pushTokens: PushTokens
  createdAt: String!
  updatedAt: String!
}

type PushTokens {
  expo: String
}

type Post {
  id: ID!
  body: JSON!
  owner: User
  people: [User]
  location: Location
  era: Era
  createdAt: String!
  updatedAt: String!
}

type Era {
  id: ID!
  name: String!
  coverPhoto: Image
  people: [User]
  images: [Image]
  startDate: String
  endDate: String
  createdAt: String!
  updatedAt: String!
}

type Image {
  id: ID!
  url: String!
  thumbnailUrl: String
  owner: User
  caption: String
  location: Location
  era: Era
  people: [User]
  createdAt: String!
  updatedAT: String!
}

type Location {
  id: ID!
  name: String!
  coverPhoto: Image
  images: [Image]
  createdAt: String
  updatedAt: String
}

type Channel {
  id: ID!
  name: String!
  owner: User!
  people: [User]
  messages(limit: Int): [Message]
  createdAt: String!
  updatedAt: String!
}

type Message {
  id: ID!
  text: String!
  owner: User!
  ownerId: ID!
  createdAt: String!
  updatedAT: String!
}

type Query {
  currentUser: User
  users: [User]
  user(username: String!): User
  userById(id: String!): User
  eras: [Era]
  era(id: String!): Era
  locations: [Location]
  location(id: String!): Location
  images: [Image]
  image(id: String!): Image
  posts: [Post]
  channels: [Channel]
  channel(id: String!): Channel
  messages(channelId: String!, limit: Int): [Message]
}

input UserInput {
  username: String!
  displayName: String
  password: String!
}

input DeviceInput {
  id: String
  name: String
}

input PushTokensInput {
  expo: String
}

input PostInput {
  id: String
  body: JSON!
  peopleIds: [String]
  locationId: String
  eraId: String
}

input LocationInput {
  id: String
  name: String!
  coverPhotoId: String
}

input FileInput {
  name: String!
  type: String!
}

input EraInput {
  id: String
  name: String!
  coverPhotoId: String
  peopleIds: [String]
  startDate: String
  endDate: String
}

input ImageInput {
  id: String
  url: String
  caption: String
  locationId: String
  eraId: String
  peopleIds: [String]!
}

input ChannelInput {
  id: String
  name: String!
  peopleIds: [String]
}

input MessageInput {
  text: String!
}

type Mutation {
  signup(user: UserInput!, device: DeviceInput): User
  login(user: UserInput!, device: DeviceInput): User
  logout: User
  getSignedUrl(filename: String!, filetype: String!): String
  getSignedUrls(files: [FileInput]!): [String]
  updateProfilePicture(id: String!): User
  createLocation(location: LocationInput!): Location
  createImages(urls: [String]!): [Image]
  updateLocation(location: LocationInput!): Location!
  updateImage(image: ImageInput!): Image
  createEra(era: EraInput): Era
  updateEra(era: EraInput): Era
  createPost(post: PostInput): Post
  updatePost(post: PostInput): Post
  createChannel(channel: ChannelInput!): Channel
  updateChannel(channel: ChannelInput!): Channel
  sendMessage(channelId: String, message: MessageInput): Message
  setPushTokens(pushTokens: PushTokensInput!): Boolean
}

type Subscription {
  newMessage(channelId: String!): Message
}
`;
