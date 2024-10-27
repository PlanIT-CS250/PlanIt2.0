const User = require('../schema/User');
const Planet = require('../schema/Planet');
const PlanetCollaborator = require('../schema/PlanetCollaborator');
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

module.exports = {
    getPlanet,
    createPlanet,
};