const { Router } = require('express');
const controller = require('./controller');
const authenticateJWT = require('../middleware');
const router = Router();

//Unprotected routes
router.post('/login', controller.validateLogin);
router.post('/register', controller.registerUser);

//Protected routes
router.get('/name', authenticateJWT, controller.getName);

module.exports = router;