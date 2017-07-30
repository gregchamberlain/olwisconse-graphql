import mongoose from 'mongoose';


import { User, Message } from './';
import BaseModel from './BaseModel';

class Channel extends BaseModel {

  get owner() {
    return User.findById(this.ownerId);
  }

  get people() {
    if (!this.peopleIds.length) return this.peopleIds;
    return User.find({ _id: { $in: this.peopleIds } });
  }

  get createdAtISO() {
    return this.createdAt.toISOString();
  }

  messages({ limit = 20 }) {
    return mongoose.connection.models.Message.find({ channelId: this._id }).sort('-createdAt').limit(limit);
  }

}

const ChannelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  peopleIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

ChannelSchema.loadClass(Channel);

export default mongoose.model('Channel', ChannelSchema);