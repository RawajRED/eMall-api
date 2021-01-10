const express = require('express');
const router = express.Router();
const search = require('../controllers/search');

router.post('/input', search.searchInput);

module.exports = router;