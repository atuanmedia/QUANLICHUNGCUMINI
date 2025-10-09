// backend/src/routes/authRoutes.js
const express = require('express');
const { loginUser, registerUser, getUserProfile } = require('../controllers/authController');
const { loginAdmin, registerAdmin } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();


router.post('/login-admin', loginAdmin);
router.post('/register-admin', registerAdmin);
router.post('/login', loginUser);
router.post('/register', registerUser); // Public for resident self-registration
router.route('/profile').get(protect, getUserProfile); // Get profile of logged-in user

// Admin can also register users (e.g., creating admin accounts or pre-registering residents)
router.post('/register-admin', protect, authorize('admin'), registerUser);

module.exports = router;