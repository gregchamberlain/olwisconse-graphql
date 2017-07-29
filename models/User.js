const mongoose = require('mongoose');

class User {

  get profilePicture() {
    if (!this.profilePictureId) return null;
    return mongoose.connection.models.Image.findById(this.profilePictureId);
  }

  get images() {
    return mongoose.connection.models.Image.find({ peopleIds: this.id });
  }

  get posts() {
    return mongoose.connection.models.Post.find({ peopleIds: this.id });
  }
  
}

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  profilePictureId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  passwordDigest: { type: String, required: true },
  sessionToken: { type: String, required: true, unique: true },
  sessions: [{
    token: { type: String, require: true, unique: true },
    device: {
      id: String,
      name: String
    },
    pushTokens: {
      expo: String
    }
  }] 
}, {
  timestamps: true
});

UserSchema.loadClass(User);

module.exports = mongoose.model('User', UserSchema);