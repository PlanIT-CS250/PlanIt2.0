const { User } = require('../schema/User');
const Planet = require('../schema/Planet');
const secret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

//GET request on /planets/user/:id
//Returns all planets where user with given id is a collaborator
async function getPlanets(req, res)
{
    userId = req.params.id;

    try 
    {
        const user = await User.findOne({ _id: userId });
    
        if (!user) {
          return res.status(404).json({ message: `User with id ${userId} does not exist.` });
        }

        //If requested id matches id of token
        else if (userId == req.user.userId) {
            //Find all planets user is a collaborator of
            const planets = await Planet.find({ collaborators: { $elemMatch: { _id: userId } } })
            if (planets.length) {
                //Return planets
                return res.status(200).json({ message: `Planets retrieved successfully.`, planets: planets});
            }
            //User is not a collaborator of any planets
            else {
                return res.status(404).json({ message: `No planets found for user with id ${userId}.`});
            }
        }

        //If requested id does not match id of token
        else {
            res.status(403).json({ message: `Access denied for user with id ${userId}.` });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error. Contact support or try again later." });
    }
}

//GET request on /planets/:id
//Returns a planet given its id
async function getPlanet(req, res)
{
    planetId = req.params.id;

    try
    {
        //Find planet with given id
        const planet = await Planet.findOne({ _id: planetId });
        if (planet) {
            //If requesting user is a collaborator of planet with given id
            if (planet.collaborators._id == req.user.userId) {
                return res.status(200).json({ message: `Planet retrieved successfully.`, planet: planet});
            }
            else {
                return res.status(403).json({ message: `Access denied. Requesting user is not a collaborator of planet with id ${planetId}`});
            }
        }

        //Planet with given id does not exist
        else {
            return res.status(404).json({ message: `No planet found with id ${planetId}.`});
        }
    } catch (error) {
        res.status(500).json({ message: "Server error. Contact support or try again later." });
    }
}



module.exports = {
    getPlanet,
    getPlanets,
};