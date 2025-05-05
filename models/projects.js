const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
},
  projectCode: { 
    type: String, 
    required: true 
},
  code: { 
    type: String, 
    required: true 
},
  address: { 
    street: { type: String, required: true },
    number: { type: Number, required: true },
    postal: { type: Number, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true }
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
},
  clientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
},
  begin: { 
    type: String, 
    required: true 
},
  end: { 
    type: String, 
    required: true 
},
  notes: { 
    type: String, 
    required: true 
},

}, { timestamps: true });

projectSchema.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt:true });

module.exports = mongoose.model('Project', projectSchema);
