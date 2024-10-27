const User = require('../schema/User');
const Planet = require('../schema/Planet');
const PlanetCollaborator = require('../schema/PlanetCollaborator');
const secret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10; //Salt hashed password 10 times
const mongoose = require('mongoose');

/*POST request at /users/login
Compares email to password and determines if login is valid*/
async function validateLogin(req, res) 
{
    const { email, password } = req.body;

    try 
    {
        //Find user by email
        const user = await User.findOne({ email: email });
        if (user) 
        {
            //If password matches account
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                //Successful login, generate JWT
                const token = jwt.sign({ userId: user._id, role: user.role }, secret, { expiresIn: '15m' });
                res.status(200).json({ token: token, message: "Successful login" });
                console.log(`Successful login for account ${email}`);
            } 
            //If password does not match account
            else {
                res.status(401).json({ message: "Incorrect password" });
                console.log(`Unsuccessful login for account ${email}`);
            }
        } 
        //Email does not exist
        else {
            res.status(404).json({ message: "Email not found" });
            console.log(`Unsuccessful login for non-existing account ${email}`);
        }
    } catch (error) {
        //Server error
        res.status(500).json({ message: `Server error: ${error.message}` });
        console.log("Get request on users/login resulted in a server error");
    }
}

/*POST request on /users/register
Adds new user to database if provided information meets criteria*/
async function registerUser(req, res)
{
    const { firstName, lastName, username, email, password } = req.body;

    try {
        //Check if username or email already exists in database
        existingEmail = await User.findOne({ email: email });
        existingUsername = await User.findOne({ username: username });
        if (existingEmail) {
            return res.status(409).json({ message: `Email ${email} is taken.` });
        } 
        else if (existingUsername) {
            return res.status(409).json({ message: `Username ${username} is taken.` });
        }
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        const newUser = new User({ fName: firstName, lName: lastName, 
                                username: username, email: email, password: hash});

        await newUser.save();
        const token = jwt.sign({ userId: newUser._id, role: newUser.role }, secret, { expiresIn: '15m' });
        return res.status(201).json({ token: token, message: "User added successfully." })
    } 
    catch(error) {
        res.status(400).json({ message: (error.message.split(": ")[2] + '.') });
        console.log(error.message);
    }
}

/*GET request at /users/:id
Returns information about user with given id*/
async function getUser(req, res) 
{
    try {
        const userId = req.params.id; // /users/___ <-
        
        //Search for user with given id
        const user = await User.findOne({ _id: userId });
        if (user) {
            //If request comes from user whose information they are requesting
            if (userId == req.user.userId || req.user.role == "admin")
            {
                const { password, ...userInfo } = user._doc; //Omit password from returned information
                return res.status(200).json({ 
                    message: `Successfully retrieved data of user with id ${userId}.`, user: userInfo
                });
            }
            return res.status(403).json({ message: 
                `Access denied. Token of requester does not match requested user id ${userId}.`});
        }
        //User with given id does not exist
        return res.status(404).json({ message: `No user found with id ${userId}.` });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error. Contact support or try again later.' });
    }
}

//GET request on /user/:id/planets
//Returns all planets where user with given id is a collaborator
async function getPlanets(req, res)
{
    userId = req.params.id; // /user/___<-/planets

    try 
    {
        //User not found
        const user = await User.findOne({ _id: userId });
        if (!user) {
          return res.status(404).json({ message: `User with id ${userId} does not exist.` });
        }

        //If requested id matches id of token
        if (userId == req.user.userId || req.user.role == "admin") {
            //Find all planets user is the owner of
            const planetOwnerMatches = await PlanetCollaborator.find({ userId: userId, role: "owner" });
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
            const planetCollaboratorMatches = await PlanetCollaborator.find({ userId: userId, role: "collaborator" });
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

module.exports = {
    validateLogin,
    getUser,
    registerUser,
    getPlanets,
}