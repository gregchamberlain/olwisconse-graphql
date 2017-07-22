const mongoose = require('mongoose');

class Post {

  get owner() {
    if (!this.ownerId) return null;
    return mongoose.connection.models.User.findById(this.ownerId);
  }

  get people() {
    if (!this.peopleIds.length) return this.peopleIds;
    return mongoose.connection.models.User.find({ _id: { $in: this.peopleIds } });
  }

  get location() {
    if (!this.locationId) return null;
    return mongoose.connection.models.Location.findById(this.locationId);
  }

  get era() {
    if (!this.eraId) return null;
    return mongoose.connection.models.Era.findById(this.eraId);
  }

}

const PostSchema = new mongoose.Schema({
  body: { type: mongoose.Schema.Types.Mixed },
  ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  peopleIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  eraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Era' },
}, {
  timestamps: true
});

PostSchema.loadClass(Post);

module.exports = mongoose.model('Post', PostSchema);