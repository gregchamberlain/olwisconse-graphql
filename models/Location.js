const mongoose = require('mongoose');

const Image = require('./Image');

class Location {

  get images() {
    return Image.find({ location: this.id });
  }

}

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, {
  timestamps: true
});

LocationSchema.loadClass(Location);

module.exports = mongoose.model('Location', LocationSchema);