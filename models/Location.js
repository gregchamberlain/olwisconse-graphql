const mongoose = require('mongoose');


class Location {

  get images() {
    return mongoose.connection.models.Image.find({ locationId: this.id });
  }

  get coverPhoto() {
    if (!this.coverPhotoId) return null;
    return mongoose.connection.models.Image.findById(this.coverPhotoId);
  }

}

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coverPhotoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
}, {
  timestamps: true
});

LocationSchema.loadClass(Location);

module.exports = mongoose.model('Location', LocationSchema);