const mongoose = require('mongoose');
 
//Schema matches a collaborator or owner userId to a planetId
const planetTaskSchema = new mongoose.Schema({
    columnId: {
        type: mongoose.Schema.Types.ObjectId, //Object id of column that task belongs to
        required: true
    },
    assignedUserId: {
        type: mongoose.Schema.Types.ObjectId, //Object id of user assigned to task
        default: null,
        required: false,
    },
    content: {
        type: String,
        required: true,
        validate: {
            validator: v => v.length > 1 && v.length < 30,
            message: "Task content must be between 1 and 30 characters"
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
}, { collection: "planet_tasks" }); 
 
module.exports = mongoose.model("planet_tasks", planetTaskSchema); //Entries are added to 'planet_collaborators' collection