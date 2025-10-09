// backend/src/routes/announcementRoutes.js
const express = require('express');
const {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'resident'), getAnnouncements)
    .post(protect, authorize('admin'), createAnnouncement);

router.route('/:id')
    .get(protect, authorize('admin', 'resident'), getAnnouncementById)
    .put(protect, authorize('admin'), updateAnnouncement)
    .delete(protect, authorize('admin'), deleteAnnouncement);


module.exports = router;    