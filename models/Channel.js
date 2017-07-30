const mongoose = require('mongoose');

class Channel {

  get owner() {
    return mongoose.connection.models.User.findById(this.ownerId);
  }

  get people() {
    if (!this.peopleIds.length) return this.peopleIds;
    return mongoose.connection.models.User.find({ _id: { $in: this.peopleIds } });
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
  timestamps: true
});

ChannelSchema.loadClass(Channel);

module.exports = mongoose.model('Channel', ChannelSchema);