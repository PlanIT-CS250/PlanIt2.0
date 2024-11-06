const User = require('../schema/User');
const Planet = require('../schema/Planet');
const PlanetCollaborator = require('../schema/PlanetCollaborator');
const PlanetInvite = require('../schema/PlanetInvite');
const secret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10; //Salt hashed password 10 times
const mongoose = require('mongoose');

/*GET request at /users/:userId
Returns information about user with given id*/
async function getUser(req, res) 
{
    try 
    {
        const { userId } = req.params; // /users/___ <-
        
        //Find user
        const user = await User.findById(userId);
        if (user) 
        {
            //If requested id matches id of token
            if (userId == req.user.userId || req.user.role == "admin")
            {
                const { password, ...userInfo } = user._doc; //Omit password from returned information
                return res.status(200).json({ 
                    message: `Successfully retrieved user data.`, 
                    user: userInfo
                });
            }
            return res.status(403).json({ 
                message: `You do not have permission to access this user's data.`
            });
        }
        //User does not exist
        return res.status(404).json({
             message: `Cannot retrieve information of non-existent user.` 
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ 
            message: 'Internal server error. Contact support or try again later.' 
        });
    }
}

//GET request on /user/:userId/planets
//Returns all planets where user with given id is a collaborator
async function getPlanets(req, res)
{
    try 
    {
        const { userId } = req.params; // /user/___<-/planets

        //Find user
        const user = await User.findById(userId);
        if (user)
        {
            //If requested id matches id of token
            if (userId == req.user.userId || req.user.role == "admin") 
            {
                //Find all planets user is the owner of
                const planetOwnerMatches = await PlanetCollaborator.find({ userId, role: "owner" });
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
                const planetCollaboratorMatches = await PlanetCollaborator.find({ userId, role: "collaborator" });
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
                    return res.status(200).json({ 
                        message: `Successfully retrieved user's planets.`, 
                        ownedPlanets, 
                        collaboratedPlanets
                    });
                }
                //User has no planets
                return res.status(200).json({ 
                    message: `User has no planets.`,
                    ownedPlanets,
                    collaboratedPlanets
                });
            }
            //Request id does not match id of token
            return res.status(403).json({ 
                message: `You do not have permission to access this user's planets.`
            });
        }
        //User does not exist
        return res.status(404).json({
            message: "Cannot retrieve planets for non-existent user."
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

//GET request for /users/:userId/invites
async function getInvites(req, res)
{
    try
    {
        const { userId } = req.params;

        //Check if user exists
        const user = await User.exists({ _id: userId });
        if (user)
        {
            //If requested id matches id of token
            if (userId == req.user.userId || req.user.role == "admin")
            {
                //Find invites
                const invites = await PlanetInvite.find({ invitedUserId: userId });
                if (invites)
                {
                    return res.status(200).json({
                        message: "Successfully retrieved invites.",
                        invites
                    });
                }
                return res.status(200).json({
                    message: "No invites found.",
                    invites
                });
            }
            //Requested id does not match id of token
            return res.status(403).json({
                message: "You do not have permission to access this user's invites."
            });
        }
        //User not found
        return res.status(404).json({
            message: "Cannot retreive invites for non-existent user."
        });
    } catch (error) {
        res.status(500).json({ 
            message: "Server error. Contact support or try again later." 
        });
    }
}

module.exports = {
    getUser,
    getPlanets,
    getInvites,
}