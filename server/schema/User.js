const mongoose = require('mongoose');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Regex pattern of typical email format
 
const userSchema = new mongoose.Schema({
  _id: {
    type: Number,
    min: 1,
    required: true
  },
  fName: {
    type: String,
    required: true,
    validate: {
      validator: v => v.length > 1 && v.length < 20,
      message: "First name must be between 1 and 20 characters"
    }
  },
  lName: {
    type: String,
    required: true,
    validate: {
      validator: v => v.length > 1 && v.length < 20,
      message: "Last name must be between 1 and 20 characters"
    }
  },
  email: {
    type: String,
    lowercase: true,
    validate: {
      validator: v => emailPattern.test(v), //Email must be in proper format
      message: "Invalid email"
    }
  },
  password: {
    type: String,
    required: true
  }

});
 
module.exports = mongoose.model("User", userSchema);