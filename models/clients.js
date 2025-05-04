const mongoose = require('mongoose');

const clientScheme = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

clientScheme.plugin(require('mongoose-delete'), { overrideMethods: 'all', deletedAt: true });

module.exports = mongoose.model('Client', clientScheme);
