const mongoose = require('mongoose');

const { User, Location } = require('./index');

class Image {

  get owner() {
    return User.findById(this.owner);
  }

  get location() {
    return Location.findById(this.location);
  }

  get people() {
    if (!this.people.length) return this.people;
    return User.find({ _id: { $in: this.people } });
  }

  get createdAt() {
    return this.createdAt.toISOString();
  }

}

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  caption: { type: String },
  owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  people: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

ImageSchema.loadClass(Image);

module.exports = mongoose.model('Image', ImageSchema);