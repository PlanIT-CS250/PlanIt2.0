const mongoose = require('mongoose');
 
//Schema matches a collaborator or owner userId to a planetId
const planetColumnSchema = new mongoose.Schema({
    planetId: {
        type: mongoose.Schema.Types.ObjectId, //Object id of planet
        required: true
    },
    name: {
        type: String,
        required: true,
        validate: {
            validator: v => v.length > 1 && v.length < 15,
            message: "Column name must be between 1 and 15 characters"
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
}, { collection: "planet_columns" }); 
 
module.exports = mongoose.model("planet_columns", planetColumnSchema); //Entries are added to 'planet_collaborators' collection