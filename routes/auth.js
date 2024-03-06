var express = require('express');
var router = express.Router();

const authController = require('../controllers/auth');

router.get('/', authController.index);

module.exports = router;