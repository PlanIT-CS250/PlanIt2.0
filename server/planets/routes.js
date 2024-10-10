const { Router } = require('express');
const controller = require('./controller');
const authenticateJWT = require('../middleware');
const router = Router();

//Returns all planets user with given id is a collaborator in
router.get("/user/:id", authenticateJWT, controller.getPlanets);

//Returns a planet given its id
router.get("/:id", authenticateJWT, controller.getPlanet);

module.exports = router;