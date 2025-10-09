// backend/src/routes/apartmentRoutes.js
const express = require('express');
const {
    getApartments,
    getApartmentById,
    createApartment,
    updateApartment,
    deleteApartment,
    getApartmentResidents
} = require('../controllers/apartmentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'resident'), getApartments) // Residents can see apartment list
    .post(protect, authorize('admin'), createApartment);

router.route('/:id')
    .get(protect, authorize('admin', 'resident'), getApartmentById)
    .put(protect, authorize('admin'), updateApartment)
    .delete(protect, authorize('admin'), deleteApartment);

// Get residents for a specific apartment
router.get('/:id/residents', protect, authorize('admin', 'resident'), getApartmentResidents);


module.exports = router;