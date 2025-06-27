const express = require('express');
const router = express.Router();
const vapiController = require('../controllers/vapiController');

// Vapi webhook endpoint
router.post('/webhook', (req, res) => {
  vapiController.handleWebhook(req, res);
});

module.exports = router;