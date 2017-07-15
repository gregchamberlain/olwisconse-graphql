module.exports = `
type User {
  id: ID!
  profilePicture: Image
  username: String!
  displayName: String!
  images: [Image]
}

type Era {
  id: ID!
  name: String!
  coverPhoto: Image
  people: [User]
  images: [Image]
  startDateISO: String
  endDateISO: String
}

type Image {
  id: ID!
  url: String!
  owner: User
  caption: String
  location: Location
  era: Era
  people: [User]
  createdAtISO: String
  updatedAt: String
}

type Location {
  id: ID!
  name: String!
  coverPhoto: Image
  images: [Image]
  createdAt: String
  updatedAt: String
}

type Query {
  currentUser: User
  users: [User]
  user(username: String!): User
  eras: [Era]
  era(id: String!): Era
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
  id: String!
  url: String
  caption: String
  locationId: String
  eraId: String
  peopleIds: [String]!
}

type Mutation {
  signup(user: UserInput!): User
  login(user: UserInput!): User
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
}
`;