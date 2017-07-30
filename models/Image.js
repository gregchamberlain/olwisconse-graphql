const mongoose = require('mongoose');

import { User, Location, Era } from './';
import BaseModel from './BaseModel';

class Image extends BaseModel {

  get owner() {
    return User.findById(this.ownerId);
  }

  get location() {
    return Location.findById(this.locationId);
  }

  get people() {
    if (!this.peopleIds.length) return this.peopleIds;
    return User.find({ _id: { $in: this.peopleIds } });
  }

  get createdAtISO() {
    return this.createdAt.toISOString();
  }

  get era() {
    return Era.findById(this.eraId);
  }

  get thumbnailUrl() {
    const split = this.url.split('/');
    const file = split[split.length - 1];
    const name = file.split('.')[0]
    return `https://s3.amazonaws.com/olwisconseresized/resized-${name}.jpg`
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
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

ImageSchema.loadClass(Image);

export default mongoose.model('Image', ImageSchema);