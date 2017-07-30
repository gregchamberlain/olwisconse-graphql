const mongoose = require('mongoose');

import { Image } from './';
import BaseModel from './BaseModel';

class Location extends BaseModel {

  get images() {
    return Image.find({ locationId: this.id });
  }

  get coverPhoto() {
    if (!this.coverPhotoId) return null;
    return Image.findById(this.coverPhotoId);
  }

}

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coverPhotoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

LocationSchema.loadClass(Location);

export default mongoose.model('Location', LocationSchema);