const express = require('express');
const router = express.Router();
const { submitRequest } = require('../controllers/getListedController');

router.post('/get-listed', submitRequest);

module.exports = router;
