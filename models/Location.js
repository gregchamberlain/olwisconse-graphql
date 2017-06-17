const mongoose = require('mongoose');


class Location {

  get images() {
    return mongoose.connection.models.Image.find({ locationId: this.id });
  }

}

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, {
  timestamps: true
});

LocationSchema.loadClass(Location);

module.exports = mongoose.model('Location', LocationSchema);