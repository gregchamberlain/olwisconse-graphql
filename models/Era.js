const mongoose = require('mongoose');

import { Image, User } from './';
import BaseModel from './BaseModel';

class Era extends BaseModel {

  get startDate() {
    return this._startDate && this._startDate.toISOString();
  }

  get endDate() {
    return this._endDate && this._endDate.toISOString();
  }

  get coverPhoto() {
    if (!this.coverPhotoId) return null;
    return Image.findById(this.coverPhotoId);
  }

  get images() {
    return Image.find({ eraId: this.id });
  }

  get people() {
    if (!this.peopleIds.length) return this.peopleIds;
    return User.find({ _id: { $in: this.peopleIds } });
  }

}

const EraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  peopleIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  coverPhotoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  _startDate: { type: Date },
  _endDate: { type: Date }
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

EraSchema.loadClass(Era);

export default mongoose.model('Era', EraSchema);