const User = require('../schema/User');
const Planet = require('../schema/Planet');
const PlanetCollaborators = require('../schema/PlanetCollaborator');
const secret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

//GET request on /planets/user/:id
//Returns all planets where user with given id is a collaborator
async function getPlanets(req, res)
{
    userId = req.params.id; // /planets/user/___ <-

    try 
    {
        //User not found
        const user = await User.findOne({ _id: userId });
        if (!user) {
          return res.status(404).json({ message: `User with id ${userId} does not exist.` });
        }

        //If requested id matches id of token
        if (userId == req.user.userId) {
            //Find all planets user is the owner of
            const planetOwnerMatches = await PlanetCollaborators.find({ userId: userId, role: "owner" });
            const ownedPlanets = [];
            if (planetOwnerMatches.length)
            {
                for (i = 0; i < planetOwnerMatches.length; i++)
                {
                    ownedPlanet = await Planet.findOne({ _id: planetOwnerMatches[i].planetId });
                    if (ownedPlanet)
                    {
                        ownedPlanets.push(ownedPlanet);
                    }
                }
            }
            //Find all planets user is a collaborator of
            const planetCollaboratorMatches = await PlanetCollaborators.find({ userId: userId, role: "collaborator" });
            const collaboratedPlanets = [];
            if (planetCollaboratorMatches.length)
            {
                for (i = 0; i < planetCollaboratorMatches.length; i++)
                {
                    collaboratedPlanet = await Planet.findOne({ _id: planetCollaboratorMatches[i].planetId });
                    if (collaboratedPlanet)
                    {
                        collaboratedPlanets.push(collaboratedPlanet);
                    }
                }
            }

            //If user has at least 1 planet, either owned or collaborated
            if (ownedPlanets.length || collaboratedPlanets.length)
            {
                return res.status(200).json({ message: `Planets successfully retrieved for user with id ${userId}.`, 
                    ownedPlanets: ownedPlanets, collaboratedPlanets: collaboratedPlanets});
            }
            //User has no planets
            return res.status(404).json({ message: `No planets found for user with id ${userId}.` })
        }
        //If requested id does not match id of token
        return res.status(403).json({ message: `Access denied. Token of requester does not match requested user id ${userId}.` });
    } catch (error) {
        res.status(500).json({ message: "Server error. Contact support or try again later." });
    }
}

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
            //Find entry containing planet id AND id of requesting token
            const planetUserMatch = await PlanetCollaborators.findOne({ planetId: planetId, userId: req.user.userId });
            if (planetUserMatch)
            {
                return res.status(200).json({ 
                    message: `Successfully retrieved planet with id ${planetId}.`, planet: planet, role: planetUserMatch.role});
            }
            //User does not have access to planet
            return res.status(403).json({ message: `Access denied. Requesting user is not a member of planet with id ${planetId}`});
        }
        //Planet with given id does not exist
        return res.status(404).json({ message: `No planet found with id ${planetId}.`});
    } catch (error) {
        res.status(500).json({ message: "Server error. Contact support or try again later." });
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
        console.log(owner);
        if (owner)
        {
            //If ownerId matches id of token
            if (owner._id == req.user.userId)
            {
                newPlanet = new Planet({
                    name: name,
                    description: description,
                    owner: owner,
                    collaborators: []
                });
                await newPlanet.save();
                return res.status(201).json({ message: `Planet successfully created with id ${planetId}.`, planet: planet});
            }
            //If ownerId does not match id of token
            return res.status(403).json({ message: 
                `Access denied. Requesting user does not match provided ownerId` });
        }
        //Owner does not exist
        return res.status(404).json({ message: `User not found with provided ownerId ${ownerId}.` });

    } catch (error) {
        res.status(400).json({ message: (error.message.split(": ")[2] + '.') });
    }
}



module.exports = {
    getPlanet,
    getPlanets,
    createPlanet,
};