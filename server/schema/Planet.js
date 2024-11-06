const mongoose = require('mongoose');
const { userSchema } = require('./User');
 
const planetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: {
        validator: v => v.length > 1 && v.length < 20,
        message: "Planet name must be between 1 and 20 characters"
    }
  },
  description: {
    type: String,
    required: true,
    validate: {
        validator: v => v.length > 1 && v.length < 50,
        message: "Description must be between 1 and 50 characters"
    }
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
 
module.exports = mongoose.model("Planet", planetSchema); //Entries are added to 'planets' collection