//Contains middleware to authenticate JWT and allow user to access protected routes

const jwt = require('jsonwebtoken');
const secret = 'your_jwt_secret'; 

function authenticateJWT(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]; //Extract token from request headers

  if (!token) return res.status(401).json({ message: "Access denied, no token found."}); //Token not found

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ message: "Access denied, invalid token."}); //Invalid token

    //Add user information to the request and proceed
    req.user = user;
    next();
  });
}

module.exports = authenticateJWT;