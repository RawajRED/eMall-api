const express = require('express');
const { getContact } = require('../../general/contact');
const { getFAQs } = require('../../general/FAQs');
const router = express.Router();

router.get('/faqs', (req, res) => res.json(getFAQs()));
router.get('/contact', (req, res) => res.json(getContact()));

module.exports = router;