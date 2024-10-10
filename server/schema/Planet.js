const mongoose = require('mongoose');
const { userSchema } = require('./User');
 
const planetSchema = new mongoose.Schema({
  _id: {
    type: Number,
    min: 1,
    required: true
  },
  name: {
    type: String,
    required: true,
    validate: {
        validator: v => v.length > 1 && v.length < 10,
        message: "Planet name must be between 1 and 10 characters"
    }
  },
  description: {
    type: String,
    required: true,
    validate: {
        validator: v => v.length > 1 && v.length < 100,
        message: "Description must be between 1 and 100 characters"
    }
  },
  collaborators: {
    type: [userSchema],
  },
  createdAt: {
    type: Date,
    default: () => Date.now(),
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: () => Date.now()
  }
  
}, { collection: "planets" }); 
 
module.exports = mongoose.model("planets", planetSchema); //Entries are added to 'planets' collection