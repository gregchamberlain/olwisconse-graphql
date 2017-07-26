const mongoose = require('mongoose');

class Message {

  get owner() {
    return mongoose.connection.models.User.findById(this.ownerId);
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
  timestamps: true
});

MessageSchema.loadClass(Message);

module.exports = mongoose.model('Message', MessageSchema);