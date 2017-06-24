const mongoose = require('mongoose');


class Era {

  get startDateISO() {
    return this.startDate && this.startDate.toISOString();
  }

  get endDateISO() {
    return this.endDate && this.endDate.toISOString();
  }

  get images() {
    return mongoose.connection.models.Image.find({ EraId: this.id });
  }

}

const EraSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date }
}, {
  timestamps: true
});

EraSchema.loadClass(Era);

module.exports = mongoose.model('Era', EraSchema);