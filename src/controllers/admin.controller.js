const prisma = require('../lib/prisma');

// GET /api/admin/dashboard - Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await prisma.user.count({ where: { role: 'MEMBER' } });
    const activeMemberships = await prisma.membership.count({ where: { status: 'ACTIVE' } });
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const pendingPayments = await prisma.payment.count({ where: { status: 'PENDING_VERIFICATION' } });

    // Revenue this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const payments = await prisma.payment.findMany({
      where: { status: 'VERIFIED', createdAt: { gte: startOfMonth } }
    });
    const monthlyRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Recent members
    const recentMembers = await prisma.user.findMany({
      where: { role: 'MEMBER' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { memberships: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });

    res.json({
      totalMembers,
      activeMemberships,
      pendingBookings,
      pendingPayments,
      monthlyRevenue,
      recentMembers: recentMembers.map(m => ({
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        plan: m.memberships[0]?.planTier || '—',
        joined: m.createdAt,
        expires: m.memberships[0]?.endDate || null,
        status: m.memberships[0]?.status || 'NONE'
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
};

// GET /api/admin/members - All members
exports.getMembers = async (req, res) => {
  try {
    const search = req.query.search || '';
    const members = await prisma.user.findMany({
      where: {
        role: 'MEMBER',
        ...(search ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } }
          ]
        } : {})
      },
      include: { memberships: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { createdAt: 'desc' }
    });

    res.json(members.map(m => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      phone: m.phone,
      plan: m.memberships[0]?.planTier || '—',
      joined: m.createdAt,
      expires: m.memberships[0]?.endDate || null,
      status: m.memberships[0]?.status || 'NONE'
    })));
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to load members' });
  }
};

// POST /api/admin/members - Add member (admin adds directly)
const bcrypt = require('bcryptjs');
exports.addMember = async (req, res) => {
  try {
    const { name, phone, plan, joinDate } = req.body;
    if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '';

    // Check if member exists
    const existing = await prisma.user.findFirst({ where: { phone } });
    if (existing) return res.status(400).json({ error: 'Member with this phone already exists' });

    // Create user with a default password
    const passwordHash = await bcrypt.hash('nme2025', 10);
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        email: `${phone.replace(/[^0-9]/g, '')}@nmegym.local`,
        passwordHash,
        role: 'MEMBER'
      }
    });

    // Create membership
    const start = joinDate ? new Date(joinDate) : new Date();
    let months = 1;
    if (plan === 'WARRIOR') months = 3;
    if (plan === 'ELITE') months = 12;
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);

    await prisma.membership.create({
      data: {
        userId: user.id,
        planTier: plan || 'STARTER',
        status: 'ACTIVE',
        startDate: start,
        endDate: end
      }
    });

    res.status(201).json({ message: 'Member added', userId: user.id });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};

// DELETE /api/admin/members/:id
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.membership.deleteMany({ where: { userId: id } });
    await prisma.payment.deleteMany({ where: { userId: id } });
    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
};

// GET /api/admin/payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(payments.map(p => ({
      id: p.id,
      member: `${p.user.firstName} ${p.user.lastName}`,
      amount: Number(p.amount),
      plan: p.paymentMethod,
      method: p.paymentMethod,
      date: p.createdAt,
      status: p.status
    })));
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to load payments' });
  }
};

// PUT /api/admin/payments/:id/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.payment.update({
      where: { id },
      data: { status: 'VERIFIED', verifiedById: req.user.userId }
    });
    res.json({ message: 'Payment verified' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
};

// GET /api/admin/bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings.map(b => ({
      id: b.id,
      name: b.name || (b.user ? `${b.user.firstName} ${b.user.lastName}` : 'Unknown'),
      phone: b.phone || b.user?.phone || '',
      date: b.preferredDate,
      time: b.preferredTimeSlot,
      interest: b.interest,
      status: b.status
    })));
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to load bookings' });
  }
};

// PUT /api/admin/bookings/:id/confirm
exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.booking.update({
      where: { id },
      data: { status: 'CONFIRMED' }
    });
    res.json({ message: 'Booking confirmed' });
  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
};

// GET /api/admin/posts
exports.getPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({ orderBy: { publishedAt: 'desc' } });
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to load posts' });
  }
};

// POST /api/admin/posts
exports.createPost = async (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const post = await prisma.post.create({
      data: { title, slug: `${slug}-${Date.now()}`, category: category || 'General', content: content || '' }
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// DELETE /api/admin/posts/:id
exports.deletePost = async (req, res) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// PUT /api/admin/settings
exports.updateSettings = async (req, res) => {
  // For now, settings are hardcoded in the front-end.
  // This placeholder can be expanded with a Settings model later.
  res.json({ message: 'Settings saved (placeholder)' });
};
