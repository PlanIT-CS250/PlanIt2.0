const User = require('../schema/User');
const secret = 'your_jwt_secret'; 
const jwt = require('jsonwebtoken');

async function validateLogin(req, res) {
    const { email, password } = req.body;

    try 
    {
        //Find user by email
        const user = await User.findOne({ email: email });
        //If user is found
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
        // Email does not exist
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

async function getName(req, res) {
    try {
      const user = await User.findOne({ _id: req.user.userId });
  
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ firstName: user.fName });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

module.exports = {
    validateLogin,
    getName,
}