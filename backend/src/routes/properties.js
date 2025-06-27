const express = require('express');
const router = express.Router();
const propertyService = require('../services/propertyService');

// Get all properties
router.get('/', (req, res) => {
  const properties = propertyService.getAllProperties();
  res.json(properties);
});

// Search properties
router.post('/search', (req, res) => {
  const criteria = req.body;
  const results = propertyService.searchProperties(criteria);
  res.json(results);
});

// Get property by ID
router.get('/:id', (req, res) => {
  const property = propertyService.getPropertyById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: 'Property not found' });
  }
  res.json(property);
});

module.exports = router;