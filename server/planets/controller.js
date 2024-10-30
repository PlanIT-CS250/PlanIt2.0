const User = require('../schema/User');
const Planet = require('../schema/Planet');
const PlanetCollaborator = require('../schema/PlanetCollaborator');
const PlanetColumn = require('../schema/PlanetColumn');
const PlanetTask = require('../schema/PlanetTask');
const secret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

//GET request on /planets/:id
//Returns a planet given its id
async function getPlanet(req, res)
{
    try
    {
        planetId = req.params.id; // /planets/___ <-

        if (!mongoose.isValidObjectId(planetId)) {
            return res.status(400).json({ message: `${planetId} is an invalid id.` });
        }

        //Find planet with given id
        const planet = await Planet.findOne({ _id: planetId });
        if (planet) {
            if (req.user.role == "admin")
            {
                return res.status(200).json({
                    message: `Successfully retrieved planet with id ${planetId}.`,
                    planet: planet,
                    role: "admin"
                });
            }
            //Find entry containing planet id AND id of requesting token
            const planetUserMatch = await PlanetCollaborator.findOne({ planetId: planetId, userId: req.user.userId });
            if (planetUserMatch)
            {
                //Retrieve all users for planet
                const allMatches = await PlanetCollaborator.find({ planetId: planetId });

                //Populate collaborators list with relevant info about planet collaborators
                const collaborators = [];
                for (let i=0; i<allMatches.length; i++)
                {
                    const user = await User.findOne(allMatches[i].userId);
                    const { _id, password, createdAt, updatedAt, role, ...userInfo} = user._doc; //Omit fields from user
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
                    message: `Successfully retrieved planet with id ${planetId}.`, 
                    planet: planet,
                    collaborators: collaborators,
                    role: planetUserMatch.role
                });
            }
            //User does not have access to planet
            return res.status(403).json({ 
                message: `Access denied. Requesting user is not a member of planet with id ${planetId}`
            });
        }
        //Planet with given id does not exist
        return res.status(404).json({ 
            message: `No planet found with id ${planetId}.`
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
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

        //Find owner with given id
        const owner = await User.findOne({ _id: ownerId });
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
                await newPlanet.save();

                //Create planet collaborator entry to make user owner of planet
                newPlanetCollaborator = new PlanetCollaborator({
                    planetId: newPlanet._id,
                    userId: ownerId,
                    role: "owner"
                });
                await newPlanetCollaborator.save();

                return res.status(201).json({
                    message: `Planet successfully created with id ${newPlanet.planetId}.`,
                     planet: newPlanet
                });
            }
            //If ownerId does not match id of token
            return res.status(403).json({
                 message: `Access denied. Requesting user does not match provided ownerId` 
            });
        }
        //Owner does not exist
        return res.status(404).json({
             message: `User not found with provided ownerId ${ownerId}.` 
        });

    } catch (error) {
        res.status(400).json({ 
            message: (error.message.split(": ")[2] + '.') 
        });
    }
}

//GET request on /planets/:id/columns
//Returns a planet's columns and tasks given its id
async function getColumns(req, res)
{
    try
    {
        const planetId = req.params.id; // /planets/___<-/columns

        //Find planet with given id
        const planet = await Planet.findOne({ _id: planetId });
        if (planet)
        {
            //Find all columns for planet
            const columns = await PlanetColumn.find({ planetId: planetId });
            if (columns)
            {
                const columnsList = [];
                for (let i = 0; i<columns.length; i++)
                {
                    const column = columns[i].toObject();
                    column.tasks = [];

                    //Find all tasks in column
                    const tasks = await PlanetTask.find({ columnId: column._id });
                    if (tasks)
                    {
                        //Add task to list
                        tasks.forEach(task => {
                            column.tasks.push(task);
                        });
                    }
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
        //Planet with given id does not exist
        return res.status(404).json({ 
            message: `No planet found with id ${planetId}.`
        });
    } catch(error) {
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//POST request on /planets/columns/:id/task
async function createTask(req, res)
{
    try
    {
        const columnId = req.params.id; // /planets/columns/___<-/task
        const content = req.body.content;

        //Find column with given id
        const column = await PlanetColumn.findById(columnId);
        if (column)
        {
            //If user is a collaborator of planet that task is being created in
            const planetUserMatch = await PlanetCollaborator.exists({ planetId: column.planetId, userId: req.user.userId });
            if (planetUserMatch || req.user.role == "admin")
            {
                const newTask = new PlanetTask({
                    columnId,
                    content
                });
                await newTask.save();
                return res.status(201).json({
                    message: "Task created successfully",
                    newTask
                });
            }
            return res.status(403).json({
                message: "User does not have permission to create a task in this planet."
            });
        }
        return res.status(404).json({
            message: "Column not found."
        });
    } catch(error) {
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

async function createColumn(req, res)
{
    try
    {
        const planetId = req.params.id;
        const name = req.body.name;

        const planet = await Planet.findById(planetId);
        if (planet)
        {
            const planetUserMatch = await PlanetCollaborator.exists({ planetId: planetId, userId: req.user.userId });
            if (planetUserMatch || req.user.role == "admin")
            {
                const newColumn = new PlanetColumn({
                    planetId,
                    name
                });
                await newColumn.save();
                return res.status(201).json({
                    message: "Column created successfully.",
                    newColumn
                });
            }
            return res.status(403).json({
                message: "User does not have permission to create a column in this planet."
            });
        }
        return res.status(404).json({
            message: "Cannot create column for non-existent planet."
        });
    } catch(error) {
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//PUT request for /planets/tasks/:id
//Updates a task given specified fields
async function updateTask(req, res)
{
    try
    {
        const taskId = req.params.id; // /planets/tasks/___ <-

        const task = await PlanetTask.findById(taskId);
        if(task)
        {
            const column = await PlanetColumn.findById(task.columnId);
            planetId = column.planetId;

            //If user is a collaborator of requested planet that task belongs to
            planetUserMatch = await PlanetCollaborator.exists({ planetId, userId: req.user.userId });
            if (planetUserMatch || req.user.role == "admin")
            {
                //Update each field passed in body of request
                const keys = Object.keys(req.body);
                for(let i = 0; i < keys.length; i++)
                {
                    //If column changes, make sure column exists
                    if (keys[i] == "columnId")
                    {
                        columnExists = await PlanetColumn.exists({ _id: req.body[keys[i]]})
                        if (!columnExists)
                        {
                            return res.status(404).json({
                                message: "Cannot move task to non-existent column."
                            });
                        }
                    }
                    //If assigned user changes, make sure user exists
                    else if (keys[i] == "assignedUserId")
                    {
                        userExists = await User.exists({ _id: req.body[keys[i]]})
                        if (!userExists)
                        {
                            return res.status(404).json({
                                message: "Cannot assign task to non-existent user."
                            });
                        }
                    }
                    task[keys[i]] = req.body[keys[i]];
                }
                await task.save();

                return res.status(200).json({
                    message: "Task updated successfully.",
                    updatedTask: task
                });
            }
            return res.status(403).json({
                message: "User does not have permission to edit this task."
            });
        }
        return res.status(404).json({
            message: "No task found."
        });
    }
    catch(error) {
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
};