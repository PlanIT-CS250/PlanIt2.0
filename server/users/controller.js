const User = require('../schema/User');
const secret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');
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
            if (user.password === password) {
                //Successful login, generate JWT
                const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '15m' });
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

        const newUser = new User({ fName: firstName, lName: lastName, 
                                username: username, email: email, password: password});

        await newUser.save();
        const token = jwt.sign({ userId: newUser._id }, secret, { expiresIn: '15m' });
        return res.status(201).json({ token: token, message: "User added successfully." })
    } 
    catch(error) {
        res.status(400).json({ message: (error.message.split(": ")[2] + '.') });
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
            if (toString(userId) == toString(req.user.userId))
            {
                return res.status(200).json({ 
                    message: `Successfully retrieved data of user with id ${userId}.`, user: user});
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

module.exports = {
    validateLogin,
    getUser,
    registerUser,
}