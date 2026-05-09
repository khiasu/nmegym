const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const adminController = require('../controllers/admin.controller');
const publicController = require('../controllers/public.controller');

// ========== HEALTH CHECK ==========
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'NME Gym API is running', timestamp: new Date().toISOString() });
});

// ========== AUTH (public) ==========
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// ========== PUBLIC (no auth) ==========
router.post('/public/booking', publicController.submitBooking);
router.get('/public/posts', publicController.getPublicPosts);

// ========== ADMIN (protected) ==========
router.get('/admin/dashboard', authenticate, isAdmin, adminController.getDashboardStats);

router.get('/admin/members', authenticate, isAdmin, adminController.getMembers);
router.post('/admin/members', authenticate, isAdmin, adminController.addMember);
router.delete('/admin/members/:id', authenticate, isAdmin, adminController.deleteMember);

router.get('/admin/payments', authenticate, isAdmin, adminController.getPayments);
router.put('/admin/payments/:id/verify', authenticate, isAdmin, adminController.verifyPayment);

router.get('/admin/bookings', authenticate, isAdmin, adminController.getBookings);
router.put('/admin/bookings/:id/confirm', authenticate, isAdmin, adminController.confirmBooking);

router.get('/admin/posts', authenticate, isAdmin, adminController.getPosts);
router.post('/admin/posts', authenticate, isAdmin, adminController.createPost);
router.delete('/admin/posts/:id', authenticate, isAdmin, adminController.deletePost);

router.put('/admin/settings', authenticate, isAdmin, adminController.updateSettings);

module.exports = router;
