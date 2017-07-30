const mongoose = require('mongoose');

import { Image, Post } from './';
import BaseModel from './BaseModel';

class User extends BaseModel {

  get profilePicture() {
    if (!this.profilePictureId) return null;
    return Image.findById(this.profilePictureId);
  }

  get images() {
    return Image.find({ peopleIds: this.id });
  }

  get posts() {
    return Post.find({ peopleIds: this.id });
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
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

UserSchema.loadClass(User);
export default mongoose.model('User', UserSchema);