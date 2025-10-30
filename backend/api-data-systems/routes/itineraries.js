const express = require('express');
const router = express.Router();
const {
    getAllItineraries,
    createItinerary,
    getItineraryById,
    getItinerariesByTripId,
    updateItinerary,
    deleteItinerary
} = require('../controllers/itineraries');

// Basic CRUD routes
router.get('/', getAllItineraries);
router.post('/', createItinerary);
router.get('/:id', getItineraryById);
router.put('/:id', updateItinerary);
router.delete('/:id', deleteItinerary);

// Get itineraries by trip ID
router.get('/trip/:tripId', getItinerariesByTripId);

module.exports = router;