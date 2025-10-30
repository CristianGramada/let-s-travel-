const express = require('express');
const router = express.Router();
const {
    getAllTrips,
    createTrip,
    getTripById,
    getTripsByUserId
} = require('../controllers/trips');

// Basic CRUD routes
router.get('/', getAllTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);

// Get trips by user ID
router.get('/user/:userId', getTripsByUserId);

module.exports = router;