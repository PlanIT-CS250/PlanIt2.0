const { Router } = require('express');
const controller = require('./controller');
const middleware = require('../middleware');
const router = Router();

//Returns a planet given its id
router.get("/:id", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.getPlanet);
//Returns all columns and their tasks of a planet given its id
router.get("/:id/columns", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.getColumns);

//Creates a new planet given its name and description
router.post("/", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.createPlanet);
//Creates a new task given its columnid and content
router.post("/columns/:id/task", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.createTask);
//Creates a new column given its name and planet id
router.post("/:id/columns", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.createColumn);

//Updates a task given its updated fields
router.put("/tasks/:id", middleware.authenticateJWT, middleware.authenticateRole(["user", "admin"]), controller.updateTask);

module.exports = router;