const mongoose = require('mongoose');

import { User } from './';
import BaseModel from './BaseModel';

class Message extends BaseModel {

  get owner() {
    return User.findById(this.ownerId);
  }

  get createdAtISO() {
    return this.createdAt.toISOString();
  }

}

const MessageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' },
  ownerId: {type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: {
    createdAt: '_createdAt',
    updatedAt: '_updatedAt'
  }
});

MessageSchema.loadClass(Message);

export default mongoose.model('Message', MessageSchema);