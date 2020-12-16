const express = require('express');
const router = express.Router();
const admin = require('../../controllers/admin/admin');


router.post('/login', clientValidators.validateClientLoginEmail, client.clientLoginEmail);



module.exports = router;