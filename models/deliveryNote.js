const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const deliveryNoteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  format: { type: String, enum: ['hours', 'materials'], required: true },
  material: { type: String, default: "N/A"},
  hours: { type: Number, default: 0 }, 
  description: { type: String, required: true },
  sign: { type: String },
  pending: { type: Boolean, default: true }, 
}, { timestamps: true });


deliveryNoteSchema.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);
