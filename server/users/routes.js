const { Router } = require('express');
const controller = require('./controller');
const middleware = require('../middleware');
const router = Router();

//----------Unprotected Routes----------

//Validates a login with requested email/username and password
router.post('/login', controller.validateLogin);
//Registers a new user with requested information
router.post('/register', controller.registerUser);

//----------Protected Routes----------
//Returns a user given its id
router.get('/:id', middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.getUser);
//Returns all planets user with given id is an owner or collaborator in
router.get("/:id/planets", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.getPlanets);

module.exports = router;