const mongoose = require('mongoose');

import { User, Location, Era } from './';
import BaseModel from './BaseModel';

class Post extends BaseModel {

  get owner() {
    if (!this.ownerId) return null;
    return User.findById(this.ownerId);
  }

  get people() {
    if (!this.peopleIds.length) return this.peopleIds;
    return User.find({ _id: { $in: this.peopleIds } });
  }

  get location() {
    if (!this.locationId) return null;
    return Location.findById(this.locationId);
  }

  get era() {
    if (!this.eraId) return null;
    return Era.findById(this.eraId);
  }

}

const PostSchema = new mongoose.Schema({
  body: { type: mongoose.Schema.Types.Mixed },
  ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  peopleIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' },
  eraId: { type: mongoose.Schema.Types.ObjectId, ref: 'Era' },
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

PostSchema.loadClass(Post);

export default mongoose.model('Post', PostSchema);