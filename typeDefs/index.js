module.exports = `
type User {
  id: ID!
  profilePicture: Image
  username: String!
  displayName: String!
  images: [Image]
}

type Image {
  id: ID!
  url: String!
  owner: User
  caption: String
  location: Location
  people: [User]
  createdAtISO: String
  updatedAt: String
}

type Location {
  id: ID!
  name: String!
  images: [Image]
  createdAt: String
  updatedAt: String
}

type Query {
  currentUser: User
  users: [User]
  user(username: String!): User
  locations: [Location]
  location(id: String!): Location
  images: [Image]
  image(id: String!): Image
}

input UserInput {
  username: String!
  displayName: String
  password: String!
}

input LocationInput {
  name: String!
}

input FileInput {
  name: String!
  type: String!
}

input ImageInput {
  id: String!
  url: String
  caption: String
  locationId: String
  peopleIds: [String]!
}

type Mutation {
  signup(user: UserInput!): User
  login(user: UserInput!): User
  logout: User
  getSignedUrl(filename: String!, filetype: String!): String
  getSignedUrls(files: [FileInput]!): [String]
  updateProfilePicture(url: String!): Image
  createLocation(location: LocationInput!): Location
  createImages(urls: [String]!): [Image]
  updateImage(image: ImageInput!): Image
}
`;