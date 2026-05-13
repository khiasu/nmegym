const express = require('express');
const router = express.Router();
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const adminController = require('../controllers/admin.controller');
const publicController = require('../controllers/public.controller');
const mediaController = require('../controllers/media.controller');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

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
router.get('/public/trainers', publicController.getPublicTrainers);
router.get('/public/facilities', publicController.getPublicFacilities);
router.get('/public/settings', publicController.getSettings);

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

router.get('/admin/trainers', authenticate, isAdmin, adminController.getTrainers);
router.post('/admin/trainers', authenticate, isAdmin, adminController.addTrainer);
router.delete('/admin/trainers/:id', authenticate, isAdmin, adminController.deleteTrainer);

router.get('/admin/facilities', authenticate, isAdmin, adminController.getFacilities);
router.post('/admin/facilities', authenticate, isAdmin, adminController.addFacility);
router.delete('/admin/facilities/:id', authenticate, isAdmin, adminController.deleteFacility);

router.get('/admin/plans', authenticate, isAdmin, adminController.getPlans);
router.put('/admin/plans/:id', authenticate, isAdmin, adminController.updatePlan);

router.get('/admin/offers', authenticate, isAdmin, adminController.getOffers);
router.post('/admin/offers', authenticate, isAdmin, adminController.addOffer);
router.delete('/admin/offers/:id', authenticate, isAdmin, adminController.deleteOffer);

router.get('/admin/settings', authenticate, isAdmin, adminController.getSettings);
router.put('/admin/settings', authenticate, isAdmin, adminController.updateSettings);

// ========== MEDIA (protected) ==========
router.post('/admin/upload', authenticate, isAdmin, upload.single('image'), mediaController.uploadImage);

module.exports = router;
