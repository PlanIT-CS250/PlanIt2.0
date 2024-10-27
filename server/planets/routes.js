const { Router } = require('express');
const controller = require('./controller');
const middleware = require('../middleware');
const router = Router();

//Returns a planet given its id
router.get("/:id", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.getPlanet);

//Creates a new planet given its name and description
router.post("/", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.createPlanet);

module.exports = router;