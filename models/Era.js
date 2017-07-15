const mongoose = require('mongoose');


class Era {

  get startDateISO() {
    return this.startDate && this.startDate.toISOString();
  }

  get endDateISO() {
    return this.endDate && this.endDate.toISOString();
  }

  get coverPhoto() {
    if (!this.coverPhotoId) return null;
    return mongoose.connection.models.Image.findById(this.coverPhotoId);
  }

  get images() {
    return mongoose.connection.models.Image.find({ eraId: this.id });
  }

  get people() {
    if (!this.peopleIds.length) return this.peopleIds;
    return mongoose.connection.models.User.find({ _id: { $in: this.peopleIds } });
  }

}

const EraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  peopleIds: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  coverPhotoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Image' },
  startDate: { type: Date },
  endDate: { type: Date }
}, {
  timestamps: true
});

EraSchema.loadClass(Era);

module.exports = mongoose.model('Era', EraSchema);