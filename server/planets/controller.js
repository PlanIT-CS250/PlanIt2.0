const User = require('../schema/User');
const Planet = require('../schema/Planet');
const PlanetCollaborator = require('../schema/PlanetCollaborator');
const PlanetColumn = require('../schema/PlanetColumn');
const PlanetTask = require('../schema/PlanetTask');
const PlanetInvite = require('../schema/PlanetInvite');
const secret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

//GET request on /planets/:planetId
//Returns a planet given its id
async function getPlanet(req, res)
{
    try
    {
        const { planetId } = req.params; // /planets/___ <-

        //Find planet
        const planet = await Planet.findById(planetId);
        if (planet) {
            //Find entry containing planet id AND id of requesting token
            const planetUserMatch = await PlanetCollaborator.findOne({ planetId, userId: req.user.userId });
            if (planetUserMatch || req.user.role == "admin")
            {
                //Retrieve all users for planet
                const allMatches = await PlanetCollaborator.find({ planetId });

                //Populate collaborators list with relevant info about planet collaborators
                const collaborators = [];
                for (let i = 0; i < allMatches.length; i++)
                {
                    const user = await User.findOne(allMatches[i].userId);
                    const { password, createdAt, updatedAt, role, ...userInfo} = user._doc; //Omit fields from user
                    userInfo.role = allMatches[i].role; //Add users role in planet to object

                    //Put planet owner first in list
                    if (userInfo.role == "owner") {
                        collaborators.unshift(userInfo);
                    }
                    else {
                        collaborators.push(userInfo);
                    }
                }

                return res.status(200).json({ 
                    message: `Successfully retrieved planet.`, 
                    planet,
                    collaborators,
                    role: planetUserMatch.role
                });
            }
            //User is not a member of planet
            return res.status(403).json({ 
                message: `You do not have permission to access this planet.`
            });
        }
        //Planet does not exist
        return res.status(404).json({ 
            message: `Cannot retrieve non-existent planet.`
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            message: "Internal server error. Contact support or try again later." 
        });
    }
}

//POST request on /planets
//Adds a new planet to the database
async function createPlanet(req, res)
{
    try
    {
        const { name, description, ownerId } = req.body;
        if (!name || !description || !ownerId)
        {
            return res.status(400).json({
                message: "Missing information: Cannot create planet without name, description, and ownerId."
            });
        }

        //Find owner
        const owner = await User.findById(ownerId);
        if (owner)
        {
            //If ownerId matches id of token
            if (owner._id == req.user.userId || req.user.role == "admin")
            {
                //Create planet
                newPlanet = new Planet({
                    name: name,
                    description: description,
                });

                try {
                    await newPlanet.save();
                } catch (error) 
                {
                    console.error(error.message);
                    await Planet.deleteOne({ _id: newPlanet._id }); //Delete any unintentionally saved documents

                    //Mongoose schema validation error
                    if (error instanceof mongoose.Error.ValidationError) 
                    {
                        return res.status(400).json({
                            message: error.message
                        });
                    }
                    //Other error
                    return res.status(500).json({ 
                        message: "Internal server error. Contact support or try again later." 
                    });
                }
                
                //Create planet collaborator entry to make user owner of planet
                newPlanetCollaborator = new PlanetCollaborator({
                    planetId: newPlanet._id,
                    userId: ownerId,
                    role: "owner"
                });
                
                try {
                    await newPlanetCollaborator.save();
                } catch (error) 
                {
                    console.error(error.message);
                    await PlanetCollaborator.deleteOne({ _id: newPlanetCollaborator._id }); //Delete any unintentionally saved documents

                    //Mongoose schema validation error
                    if (error instanceof mongoose.Error.ValidationError) 
                    {
                        return res.status(400).json({
                            message: error.message
                        });
                    }
                    //Other error
                    return res.status(500).json({ 
                        message: "Internal server error. Contact support or try again later." 
                    });
                }

                return res.status(201).json({
                    message: `Planet successfully created.`,
                     planet: newPlanet
                });
            }
            //If ownerId does not match id of token
            return res.status(403).json({
                 message: `You do not have permission to create a planet on behalf of this user.` 
            });
        }
        //Owner does not exist
        return res.status(404).json({
             message: `User (owner) not found.` 
        });

    } catch (error) {
        res.status(400).json({ 
            message: error.message
        });
    }
}

//GET request on /planets/:planetId/columns
//Returns a planet's columns and tasks given its id
async function getColumns(req, res)
{
    try
    {
        const { planetId } = req.params; // /planets/___<-/columns

        //Find planet
        const planet = await Planet.findById(planetId);
        if (planet)
        {
            //If user is a member of planet
            const planetUserMatch = PlanetCollaborator.exists({ planetId, userId: req.user.userId });
            if (planetUserMatch || req.user.role == "admin")
            {
                //Find all columns for planet
                const columns = await PlanetColumn.find({ planetId: planetId });
                if (columns)
                {
                    const columnsList = [];
                    for (let i = 0; i<columns.length; i++)
                    {
                        const column = columns[i].toObject();

                        //Find all tasks in column in ascending order
                        const tasks = await PlanetTask.find({ columnId: column._id }).sort({ order: 1 });
                        column.tasks = tasks;

                        columnsList.push(column);
                    }
                    return res.status(200).json({
                        message: "Planet columns retrieved successfully.",
                        columns: columnsList
                    });
                }
                return res.status(200).json({
                    message: "Planet has no columns.", 
                    columns: [] 
                });
            }
            //Id of token is not a member of planet
            return res.status(403).json({
                message: "You do not have permission to access the columns of this planet."
            });
        }
        //Planet with given id does not exist
        return res.status(404).json({ 
            message: `No planet found with id ${planetId}.`
        });
    } catch(error) {
        res.status(500).json({ 
            message: "Internal server error. Contact support or try again later." 
        });
    }
}

//POST request on /planets/columns/:columnId/task
//Creates a task in given column
async function createTask(req, res)
{
    try
    {
        const { columnId } = req.params; // /planets/columns/___<-/task
        const content = req.body.content;

        if (!content) {
            //Content is required
            return res.status(400).json({
                message: "Missing information. Cannot create task without task content."
            });
        }

        //Find column with given id
        const column = await PlanetColumn.findById(columnId);
        if (column)
        {
            //If user is a collaborator of planet that task is being created in
            const planetUserMatch = await PlanetCollaborator.exists({ planetId: column.planetId, userId: req.user.userId });
            if (planetUserMatch || req.user.role == "admin")
            {
                const allColumnTasks = await PlanetTask.find({ columnId }).sort({ order: 1 });
                var newTaskOrder = 1;

                if (allColumnTasks.length)
                {
                    //By default, place task at bottom of column (highest order)
                    newTaskOrder = allColumnTasks[allColumnTasks.length - 1].order + 1;
                }

                const newTask = new PlanetTask({
                    columnId,
                    content,
                    order: newTaskOrder
                });

                try {
                    await newTask.save();
                } catch (error) 
                {
                    console.error(error.message);
                    await PlanetTask.deleteOne({ _id: newTask._id }); //Delete any unintentionally saved documents

                    //Mongoose schema validation error
                    if (error instanceof mongoose.Error.ValidationError) 
                    {
                        return res.status(400).json({
                            message: error.message
                        });
                    }
                    //Other error
                    console.error(error);
                    return res.status(500).json({ 
                        message: "Internal server error. Contact support or try again later." 
                    });
                }

                //Task saved without fail
                return res.status(201).json({
                    message: "Task created successfully",
                    newTask
                });
            }
            //Id of token is not a member of planet
            return res.status(403).json({
                message: "User does not have permission to create a task in this planet."
            });
        }
        //Column not found
        return res.status(404).json({
            message: "Cannot add task to non-existent column."
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ 
            message: "Internal server error. Contact support or try again later." 
        });
    }
}

//POST request for /planets/:planetId/columns
async function createColumn(req, res)
{
    try
    {
        const { planetId } = req.params;
        const name = req.body.name;

        if (!name) {
            //Name is required
            return res.status(400).json({
                message: "Missing information. Cannot create column without name."
            })
        }

        const planet = await Planet.findById(planetId);
        if (planet)
        {
            const planetUserMatch = await PlanetCollaborator.exists({ planetId, userId: req.user.userId });
            if (planetUserMatch || req.user.role == "admin")
            {
                const newColumn = new PlanetColumn({
                    planetId,
                    name
                });

                try {
                    await newColumn.save();
                } catch (error) 
                {
                    console.error(error.message);
                    await PlanetColumn.deleteOne({ _id: newColumn._id }); //Delete any unintentionally saved documents

                    //Mongoose schema validation error
                    if (error instanceof mongoose.Error.ValidationError) 
                    {
                        return res.status(400).json({
                            message: error.message
                        });
                    }
                    //Other error
                    return res.status(500).json({ 
                        message: "Internal server error. Contact support or try again later." 
                    });
                }

                //Column saved without fail
                return res.status(201).json({
                    message: "Column created successfully.",
                    newColumn
                });
            }
            //Id of token is not a member of planet
            return res.status(403).json({
                message: "You do not have permission to create a column in this planet."
            });
        }
        //Planet not found
        return res.status(404).json({
            message: "Cannot create column for non-existent planet."
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Internal server error. Contact support or try again later." 
        });
    }
}

//POST request for /planets/:planetId/invite
//Creates a planet invite send to a user given their email and an optional message
async function sendInvite(req, res)
{
    try
    {
        const { planetId } = req.params;
        const { userEmail, message } = req.body;

        //If userEmail is not properly sent
        if (!userEmail) {
            return res.status(400).json({
                message: "Invite must contain user email."
            });
        }
        //If user tries to invite the admin account
        if (userEmail == "admin@admin.com")
        {
            return res.status(400).json({
                message: `Cannot invite user with email ${userEmail} to planet.`
            });
        }

        //Find planet
        const planet = await Planet.findById(planetId);
        if (planet)
        {
            //If invite sender is a collaborator of planet
            const planetInviterMatch = await PlanetCollaborator.findOne({ planetId, userId: req.user.userId });
            if (planetInviterMatch)
            {
                //If invite sender is owner
                if (planetInviterMatch.role == "owner")
                {
                    //Find user being invited
                    const invitedUser = await User.findOne({ email: userEmail });
                    if (invitedUser)
                    {
                        //If user is not a already a member of planet
                        const planetInvitedMatch = await PlanetCollaborator.exists({ planetId, userId: invitedUser._id });
                        if (!planetInvitedMatch)
                        {
                            //If user has not already been invited
                            const existingInvite = await PlanetInvite.exists({ planetId, invitedUserId: invitedUser._id });
                            if (!existingInvite)
                            {
                                //Create (send) invite
                                const newInvite = new PlanetInvite({
                                    planetId,
                                    planetName: planet.name,
                                    invitedUserId: invitedUser._id,
                                    invitingUserEmail: req.user.userEmail,
                                    message
                                });

                                try {
                                    await newInvite.save();
                                } catch (error) 
                                {
                                    console.error(error.message);
                                    await PlanetInvite.deleteOne({ _id: newInvite._id }); //Delete any unintentionally saved documents

                                    //Mongoose schema validation error
                                    if (error instanceof mongoose.Error.ValidationError) 
                                    {
                                        return res.status(400).json({
                                            message: error.message
                                        });
                                    }
                                    //Other error
                                    return res.status(500).json({ 
                                        message: "Internal server error. Contact support or try again later." 
                                    });
                                }
                                
                                //Invite saved without fail
                                return res.status(201).json({
                                    message: "Invite sent successfully.",
                                    newInvite
                                });
                            }
                            //User has a pending invite to planet
                            return res.status(409).json({
                                message: "User has already been invited to this planet."
                            });
                        }
                        //User is a collaborator of planet
                        return res.status(409).json({
                            message: "User is already a member of this planet."
                        });
                    }
                    //User not found
                    return res.status(404).json({
                        message: "Cannot send invite to non-existent user."
                    });
                }
                //User is a collaborator, not the owner
                return res.status(403).json({
                    message: "Only the planet owner has permission to send invites for this planet."
                });
            }
            //Id of token is not a member of planet
            return res.status(403).json({
                message: "You do not have permission to send invites for this planet."
            })
        }
        //Planet not found
        return res.status(404).json({
            message: "Cannot send invite for non-existent planet."
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: "Internal server error. Contact support or try again later"
        });
    }
}

//PUT request for /planets/tasks/:taskId
//Updates a task given specified fields
async function updateTask(req, res)
{
    try
    {
        const { taskId } = req.params; // /planets/tasks/___ <-
        const { columnId, assignedUserId, content, order } = req.body;

        //Find task
        const task = await PlanetTask.findById(taskId);
        const originalTask = task; //Copy of original task in case of potential data loss
        if (task)
        {
            //Find column
            const currColumn = await PlanetColumn.findById(task.columnId);
            if (currColumn)
            {
                //If id of token is a collaborator of planet which task belongs to
                const planetUserMatch = await PlanetCollaborator.exists({ planetId: currColumn.planetId, userId: req.user.userId });
                if (planetUserMatch || req.user.role == "admin")
                {
                    //If column is being changed
                    if (columnId)
                    {
                        //If new column exists
                        const newColumn = await PlanetColumn.findById(columnId);
                        if (newColumn)
                        {
                            //If new column is not the current column
                            if (columnId != task.columnId)
                            {
                                //Reorder current column tasks
                                const currColTasks = await PlanetTask.find({ columnId: task.columnId }).sort({ order: 1});
                                for (let i = task.order; i < currColTasks.length; i++)
                                {
                                    currColTasks[i].order -= 1;
                                    await currColTasks[i].save();
                                }

                                //Insert task into new column
                                const newColTasks = await PlanetTask.find({ columnId }).sort({ order: 1});
                                task.columnId = columnId;

                                //If order is provided
                                if (order)
                                {
                                    //If valid order
                                    if (order <= newColTasks.length + 1 && order > 0)
                                    {
                                        for (let i = order - 1; i < newColTasks.length; i++)
                                        {
                                            newColTasks[i].order += 1;
                                            await newColTasks[i].save();
                                        }
                                        task.order = order;
                                    }
                                    //Place task at bottom of column by default
                                    else if (newColTasks.length) {
                                        task.order = newColTasks[newColTasks.length - 1].order + 1;
                                    }
                                    //Place task at top of empty column
                                    else {
                                        task.order = 1;
                                    }
                                }
                                //Place task at bottom of column by default
                                else if (newColTasks.length) {
                                    task.order = newColTasks[newColTasks.length - 1].order + 1;
                                }
                                //Place task at top of empty column
                                else {
                                    task.order = 1;
                                }
                            }
                        }
                        //Column not found
                        else {
                            return res.status(404).json({
                                message: "Cannot move task to non-existent column."
                            });
                        }
                    }
                    //If assigned user is being changed
                    if (assignedUserId)
                    {
                        //If valid assigned user change
                        const newUser = await User.findById(assignedUserId);
                        if (newUser)
                        {
                            task.assignedUserId = assignedUserId;
                        }
                        //User not found
                        else {
                            return res.status(404).json({
                                message: "Cannot assign task to non-existent user."
                            });
                        }
                    }
                    //If order is being changed in the current column
                    if (order && !newColumn)
                    {
                        //If valid order
                        if (order <= currColTasks.length + 1 && order > 0)
                        {
                            for (let i = order - 1; i < currColTasks.length; i++)
                            {
                                currColTasks[i].order += 1;
                                await currColTasks[i].save();
                            }
                            task.order = order;
                        }
                        //Place task at bottom of column by default
                        else if (currColTasks.length) {
                            task.order = currColTasks[currColTasks.length - 1].order + 1;
                        }
                        //Place task at top of empty column
                        else {
                            task.order = 1;
                        }
                    }
                    //If content is being changed
                    if (content)
                    {
                        task.content = content;
                    }

                    task.updatedAt = Date.now();
                    currColumn.updatedAt = Date.now();
                    const planet = await Planet.findById(currColumn.planetId);
                    if (planet) {
                        planet.updatedAt = Date.now();
                    }
                    if (typeof newColumn != undefined) { //If task was moved to a new column
                        newColumn.updatedAt = Date.now();
                    }

                    //Attempt to save task
                    try {
                        await task.save();
                    } catch (error) 
                    {
                        console.error(error.message);
                        await PlanetTask.deleteOne({ _id: task._id }); //Delete possibly unintentionally created document
                        await originalTask.save(); //Save original task

                        //Mongoose schema validation error
                        if (error instanceof mongoose.Error.ValidationError) 
                        {
                            return res.status(400).json({
                                message: error.message
                            });
                        }
                        //Other error
                        return res.status(500).json({ 
                            message: "Internal server error. Contact support or try again later." 
                        });
                    }

                    //Task saved without fail
                    return res.status(200).json({
                        message: "Task updated successfully.",
                        updatedTask: task
                    });
                }
                //Id of token is not a collaborator of planet which task belongs to
                return res.status(403).json({
                    message: "User does not have permission to edit this task."
                });
            }
            //Column not found
            return res.status(404).json({
                message: "Cannot find column that tasks belongs to."
            })
        }
        //Task not found
        return res.status(404).json({
            message: "Cannot edit non-existent task."
        });
    }
    catch(error) {
        console.error(error);
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//PUT request for /planets/:planetId
//Updates a planet given its updated fields
async function updatePlanet(req, res)
{
    try
    {
        const { planetId } = req.params;
        const { name, description, theme, color } = req.body;

        //Find planet
        const planet = Planet.findById(planetId);
        const originalPlanet = planet; //Copy of planet to prevent potential data loss
        if (planet)
        {
            //If id of token is owner of planet
            const planetUserMatch = await PlanetCollaborator.findOne({ planetId, userId: req.user.userId });
            if (planetUserMatch?.role == "owner" || req.user.role == "admin")
            {
                const fields = Object.keys(req.body);
                fields.forEach(field => {
                    if (req.body[field]) {
                        planet[field] = req.body[field];
                    }
                });

                planet.updatedAt = Date.now();

                //Attempt to save planet
                try {
                    await planet.save();
                } catch (error) 
                {
                    console.error(error.message);
                    await originalPlanet.save(); //Resave original document

                    //Mongoose schema validation error
                    if (error instanceof mongoose.Error.ValidationError) 
                    {
                        return res.status(400).json({
                            message: error.message
                        });
                    }
                    //Other error
                    return res.status(500).json({ 
                        message: "Internal server error. Contact support or try again later." 
                    });
                }

                //Planet saved without error
                return res.status(200).json({
                    message: "Planet updated successfully."
                });
            }
            //Id of token is not owner
            return res.status(403).json({
                message: "You do not have permission to edit this planet."
            });
        }
        //Planet not found
        return res.status(404).json({
            message: "Cannot edit non-existent planet."
        });
    } 
    catch(error) {
        console.error(error);
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//DELETE request for /planets/:planetId
//Deletes a planet given its id
async function deletePlanet(req, res)
{
    try
    {
        const { planetId } = req.params; // /planets/___ <-

        //Find planet
        const planet = await Planet.findById(planetId);
        if (planet)
        {
            //If id of token is a member of planet
            const planetUserMatch = await PlanetCollaborator.findOne({ planetId, userId: req.user.userId });
            if (planetUserMatch || req.user.role == "admin")
            {
                if (planetUserMatch.role == "owner")
                {
                    //Delete all tasks and columns
                    const columns = await PlanetColumn.find({ planetId });
                    for (let i = 0; i < columns.length; i++)
                    {
                        await PlanetTask.deleteMany({ columnId: columns[i]._id });
                        await PlanetColumn.deleteOne({ _id: columns[i]._id });
                    }
                    //Delete planet and remove all collaborators and invites
                    await Planet.deleteOne({ _id: planetId });
                    await PlanetCollaborator.deleteMany({ planetId });
                    await PlanetInvite.deleteMany({ planetId });

                    return res.status(200).json({
                        message: "Planet deleted successfully."
                    });
                }
                //Id of token is a collaborator, not owner
                return res.status(403).json({
                    message: "Only the planet owner can delete the planet."
                });
            }
            //Id of token is not a member of planet
            return res.status(403).json({
                message: "You do not have permission to delete this planet."
            });
        }
        //Planet not found
        return res.status(404).json({
            message: "Cannot delete non-existent planet."
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//DELETE request for /planets/columns/:columnId
//Deletes a column given its id
async function deleteColumn(req, res)
{
    try
    {
        const { columnId } = req.params; // /planets/columns/___ <-

        //Find column
        const column = await PlanetColumn.findById(columnId);
        if (column)
        {
            //Find planet
            const planet = await Planet.findById(column.planetId);
            if (planet)
            {
                //If user is a member of planet which column belongs to
                const planetUserMatch = await PlanetCollaborator.exists({ planetId: column.planetId, userId: req.user.userId });
                if (planetUserMatch)
                {
                    //Delete column and all tasks which belong to it
                    await PlanetColumn.deleteOne({ _id: columnId });
                    await PlanetTask.deleteMany({ columnId });

                    return res.status(200).json({
                        message: "Column and all its tasks deleted successfully."
                    });
                }
                //Id of token is not a member of planet
                return res.status(403).json({
                    message: "You do not have permission to delete this column."
                });
            }
            //Planet not found
            const orphanedColumns = await PlanetColumn.find({ planetId: column.planetId }).select('_id');
            console.log("Orphaned data of type planet_column found: " + orphanedColumns);
            return res.status(404).json({
                message: "Column's planet not found, column was NOT deleted."
            });
        }
        //Column not found
        return res.status(404).json({
            message: "Cannot delete non-existent column."
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//DELETE request for /planets/tasks/:taskId
//Deletes a task given its id
async function deleteTask(req, res)
{
    try
    {
        const { taskId } = req.params; // /planets/tasks/___ <-

        //Find task
        const task = await PlanetTask.findById(taskId);
        if (task)
        {
            //Find column
            const column = await PlanetColumn.findById(task.columnId);
            if (column)
            {
                //If id of token is a member of planet which task belongs to
                const planetUserMatch = await PlanetCollaborator.exists({ planetId: column.planetId });
                if (planetUserMatch)
                {
                    await task.deleteOne({ _id: taskId });
                    return res.status(200).json({
                        message: "Task deleted successfully."
                    });
                }
                //Id of token is not a member of planet which task belongs to
                return res.status(403).json({
                    message: "You do not have permission to delete this task."
                });
            }
            //Column not found
            const orphanedTasks = await PlanetTask.find({ columnId: task.columnId }).select('_id');
            console.log("Orphaned data of type planet_task found: " + orphanedTasks);
            return res.status(404).json({
                message: "Task's column not found, task was NOT deleted."
            });
        }
        //Task not found
        return res.status(404).json({
            message: "Cannot delete non-existent task."
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//DELETE request for /planets/:planetId/users/:userId
//Remove user from planet given userId and planetId
async function removeUser(req, res)
{
    try
    {
        const { planetId, userId } = req.params;

        //Find planet
        const planet = await Planet.findById(planetId);
        if (planet)
        {
            //Find user
            const user = await User.findById(userId);
            if (user)
            {
                //If user is member of planet
                const planetUserMatch = await PlanetCollaborator.findOne({ planetId, userId });
                if (planetUserMatch)
                {
                    //If id of token is owner of planet
                    const planetRequesterMatch = await PlanetCollaborator.findOne({ planetId, userId: req.user.userId });
                    if (planetRequesterMatch?.role == "owner" || req.user.role == "admin")
                    {
                        //Remove user
                        await PlanetCollaborator.deleteOne({ planetId, userId });

                        return res.status(204);
                    }
                    //Id of token is not owner of planet
                    return res.status(403).json({
                        message: "You do not have permission to remove users from this planet."
                    });
                }
                //User not a member of planet
                return res.status(404).json({
                    message: "User is not a member of this planet."
                });
            }
            //User not found
            return res.status(404).json({
                message: "User not found."
            });
        }
        //Planet not found
        return res.status(404).json({
            message: "Planet not found."
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//PUT request for /planets/:planetId/users/:userId/promote
//Promote a user to owner of planet given planetId and userId, and demotes the current owner to collaborator
async function promoteUser(req, res)
{
    try
    {
        const { planetId, userId } = req.params;

        //Find planet
        const planet = await Planet.findById(planetId);
        if (planet)
        {
            //Find user
            const user = await User.findById(userId);
            if (user)
            {
                //If user is member of planet
                const planetUserMatch = await PlanetCollaborator.findOne({ planetId, userId });
                if (planetUserMatch)
                {
                    //If id of token is owner of planet
                    const planetRequesterMatch = await PlanetCollaborator.findOne({ planetId, userId: req.user.userId });
                    if (planetRequesterMatch?.role == "owner" || req.user.role == "admin")
                    {
                        //Promote user
                        planetUserMatch.role = "owner";
                        await planetUserMatch.save();

                        //Demote current owner
                        planetRequesterMatch.role = "collaborator";
                        await planetRequesterMatch.save();

                        return res.status(200).json({
                            message: "User promoted successfully."
                        });
                    }
                    //Id of token is not owner of planet
                    return res.status(403).json({
                        message: "You do not have permission to promote users in this planet."
                    });
                }
                //User not a member of planet
                return res.status(404).json({
                    message: "User is not a member of this planet."
                });
            }
            //User not found
            return res.status(404).json({
                message: "User not found."
            });
        }
        //Planet not found
        return res.status(404).json({
            message: "Planet not found."
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

module.exports = {
    getPlanet,
    createPlanet,
    createTask,
    getColumns,
    updateTask,
    createColumn,
    sendInvite,
    deletePlanet,
    deleteColumn,
    deleteTask,
    removeUser,
    promoteUser,
    updatePlanet,
};