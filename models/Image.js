const mongoose = require('mongoose');

const User = require('./User');
const Location = require('./Location');

class Image {

  get owner() {
    return mongoose.connection.models.User.findById(this.ownerId);
  }

  get location() {
    return mongoose.connection.models.Location.findById(this.locationId);
  }

  get people() {
    if (!this.peopleIds.length) return this.peopleIds;
    return mongoose.connection.models.User.find({ _id: { $in: this.peopleIds } });
  }

  get createdAtISO() {
    return this.createdAt.toISOString();
  }

}

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  caption: { type: String },
  eraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Era' },
  ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  peopleIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: true
});

ImageSchema.loadClass(Image);

module.exports = mongoose.model('Image', ImageSchema);