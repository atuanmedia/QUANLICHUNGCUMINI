// backend/src/routes/residentRoutes.js
const express = require('express');
const {
    getResidents,
    getResidentById,
    createResident,
    updateResident,
    deleteResident
} = require('../controllers/residentController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, authorize('admin'), getResidents)
    .post(protect, authorize('admin'), createResident);
     // Admin creates resident profiles

router.route('/:id')
    .get(protect, authorize('admin', 'resident'), getResidentById) // Resident can get their own, Admin can get any
    .put(protect, authorize('admin', 'resident'), updateResident) // Resident can update their own, Admin can update any
    .delete(protect, authorize('admin'), deleteResident);


module.exports = router;