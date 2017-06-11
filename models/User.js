const mongoose = require('mongoose');
const { Image } = require('./index');

class User {

  get profilePicture() {
    return Image.findById(this.profilePicture);
  }

  get images() {
    return Image.find({ people: this.id });
  }
  
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  profilePicture: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  passwordDigest: { type: String, required: true },
  sessionToken: { type: String, required: true, unique: true }
}, {
  timestamps: true
});

UserSchema.loadClass(User);

module.exports = mongoose.model('User', UserSchema);