const { Router } = require('express');
const controller = require('./controller');
const middleware = require('../middleware');
const router = Router();

//----------Protected Routes----------

//----------GET REQUESTS----------
//Returns a user given its id
router.get('/:userId', middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.getUser);
//Returns all planets user with given id is an owner or collaborator in
router.get("/:userId/planets", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.getPlanets);
//Returns all planet invites for a user given their id
router.get("/:userId/invites", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.getInvites);



module.exports = router;