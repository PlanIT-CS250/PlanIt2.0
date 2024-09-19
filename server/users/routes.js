const { Router } = require('express');
const controller = require('./controller');
const authenticateJWT = require('../middleware');
const router = Router();

router.post('/login', controller.validateLogin);
router.get('/name', authenticateJWT, controller.getName); //Protected route

module.exports = router;