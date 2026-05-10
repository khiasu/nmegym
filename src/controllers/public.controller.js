const prisma = require('../lib/prisma');

// POST /api/public/booking - Submit a trial booking (no auth required)
exports.submitBooking = async (req, res) => {
  try {
    const { name, phone, age, interest, preferredDate, preferredTimeSlot, message } = req.body;
    if (!name || !phone || !interest) {
      return res.status(400).json({ error: 'Name, phone, and interest are required' });
    }

    const booking = await prisma.booking.create({
      data: {
        name,
        phone,
        age: age ? parseInt(age) : null,
        interest,
        preferredDate: preferredDate ? new Date(preferredDate) : new Date(),
        preferredTimeSlot: preferredTimeSlot || 'Morning',
        message: message || null,
        status: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Trial booked successfully!', bookingId: booking.id });
  } catch (error) {
    console.error('Submit booking error:', error);
    res.status(500).json({ error: 'Failed to submit booking' });
  }
};

// GET /api/public/posts - Get published blog posts (no auth required)
exports.getPublicPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 10
    });
    res.json(posts);
  } catch (error) {
    console.error('Get public posts error:', error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
};

// GET /api/public/trainers
exports.getPublicTrainers = async (req, res) => {
  try {
    const trainers = await prisma.trainer.findMany({ orderBy: { name: 'asc' } });
    res.json(trainers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load trainers' });
  }
};

// GET /api/public/facilities
exports.getPublicFacilities = async (req, res) => {
  try {
    const facilities = await prisma.facility.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(facilities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load facilities' });
  }
};
// GET /api/public/settings
exports.getSettings = async (req, res) => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    res.json(settings || { gymName: 'NME GYM', logoUrl: '/newlogo.png' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
};
