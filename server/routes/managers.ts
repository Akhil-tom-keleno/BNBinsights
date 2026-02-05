import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import { authenticateToken, requireAdmin, requireManager, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Pending claims storage (in production, use database table)
const pendingClaims: Map<string, any> = new Map();

// Get all managers (public)
router.get('/', (req, res) => {
  const { location, featured, search } = req.query;
  
  let query = `
    SELECT m.*, l.name as location_name, l.slug as location_slug
    FROM managers m
    LEFT JOIN locations l ON m.location_id = l.id
    WHERE m.is_active = 1
  `;
  const params: any[] = [];

  if (location) {
    query += ' AND l.slug = ?';
    params.push(location);
  }

  if (featured === 'true') {
    query += ' AND m.is_featured = 1';
  }

  if (search) {
    query += ' AND (m.name LIKE ? OR m.description LIKE ? OR l.name LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY m.is_featured DESC, m.rating DESC';

  try {
    const managers = db.prepare(query).all(...params);
    res.json(managers.map(m => ({
      ...m,
      services: m.services ? JSON.parse(m.services) : []
    })));
  } catch (error) {
    console.error('Get managers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single manager by slug (public)
router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  try {
    const manager = db.prepare(`
      SELECT m.*, l.name as location_name, l.slug as location_slug
      FROM managers m
      LEFT JOIN locations l ON m.location_id = l.id
      WHERE m.slug = ? AND m.is_active = 1
    `).get(slug) as any;

    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    // Get reviews
    const reviews = db.prepare(
      'SELECT * FROM reviews WHERE manager_id = ? ORDER BY created_at DESC'
    ).all(manager.id);

    res.json({
      ...manager,
      services: manager.services ? JSON.parse(manager.services) : [],
      reviews
    });
  } catch (error) {
    console.error('Get manager error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create manager (admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const {
    name,
    slug,
    description,
    location_id,
    address,
    phone,
    email,
    website,
    founded_year,
    services,
    is_featured
  } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO managers (name, slug, description, location_id, address, phone, email, website, founded_year, services, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      slug,
      description,
      location_id,
      address,
      phone,
      email,
      website,
      founded_year,
      services ? JSON.stringify(services) : '[]',
      is_featured ? 1 : 0
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Manager created successfully' });
  } catch (error) {
    console.error('Create manager error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update manager (admin or claimed manager)
router.put('/:id', authenticateToken, (req: AuthRequest, res) => {
  const { id } = req.params;
  const user = req.user!;

  // Check if user has permission
  const manager = db.prepare('SELECT * FROM managers WHERE id = ?').get(id) as any;

  if (!manager) {
    return res.status(404).json({ error: 'Manager not found' });
  }

  if (user.role !== 'admin' && manager.claimed_by !== user.id) {
    return res.status(403).json({ error: 'Not authorized to edit this manager' });
  }

  const updates: string[] = [];
  const values: any[] = [];

  const allowedFields = ['name', 'description', 'address', 'phone', 'email', 'website', 'logo_url', 'cover_image_url', 'services'];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(field === 'services' ? JSON.stringify(req.body[field]) : req.body[field]);
    }
  });

  // Only admin can update these fields
  if (user.role === 'admin') {
    ['location_id', 'founded_year', 'is_featured', 'is_active', 'slug'].forEach(field => {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    });
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);

  try {
    db.prepare(`UPDATE managers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    res.json({ message: 'Manager updated successfully' });
  } catch (error) {
    console.error('Update manager error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete manager (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM managers WHERE id = ?').run(id);
    res.json({ message: 'Manager deleted successfully' });
  } catch (error) {
    console.error('Delete manager error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Claim manager listing
router.post('/:id/claim', authenticateToken, requireManager, (req: AuthRequest, res) => {
  const { id } = req.params;
  const userId = req.user!.id;

  try {
    const manager = db.prepare('SELECT * FROM managers WHERE id = ?').get(id) as any;

    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    if (manager.is_claimed) {
      return res.status(409).json({ error: 'This listing has already been claimed' });
    }

    db.prepare('UPDATE managers SET is_claimed = 1, claimed_by = ? WHERE id = ?').run(userId, id);
    res.json({ message: 'Listing claimed successfully' });
  } catch (error) {
    console.error('Claim manager error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add review (public)
router.post('/:id/reviews', (req, res) => {
  const { id } = req.params;
  const { user_name, rating, comment } = req.body;

  if (!user_name || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Name and rating (1-5) required' });
  }

  try {
    const manager = db.prepare('SELECT * FROM managers WHERE id = ?').get(id);
    if (!manager) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    db.prepare('INSERT INTO reviews (manager_id, user_name, rating, comment) VALUES (?, ?, ?, ?)')
      .run(id, user_name, rating, comment);

    // Update manager rating
    const avgRating = db.prepare(
      'SELECT AVG(rating) as avg FROM reviews WHERE manager_id = ?'
    ).get(id) as any;

    const reviewCount = db.prepare(
      'SELECT COUNT(*) as count FROM reviews WHERE manager_id = ?'
    ).get(id) as any;

    db.prepare('UPDATE managers SET rating = ?, review_count = ? WHERE id = ?')
      .run(Math.round(avgRating.avg * 10) / 10, reviewCount.count, id);

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete review (admin or claimed manager only)
router.delete('/reviews/:reviewId', authenticateToken, (req: AuthRequest, res) => {
  const { reviewId } = req.params;
  const user = req.user!;

  try {
    // Get the review and associated manager
    const review = db.prepare(`
      SELECT r.*, m.claimed_by 
      FROM reviews r 
      JOIN managers m ON r.manager_id = m.id 
      WHERE r.id = ?
    `).get(reviewId) as any;

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user has permission (admin or claimed manager)
    if (user.role !== 'admin' && review.claimed_by !== user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Delete the review
    db.prepare('DELETE FROM reviews WHERE id = ?').run(reviewId);

    // Update manager rating
    const avgRating = db.prepare(
      'SELECT AVG(rating) as avg FROM reviews WHERE manager_id = ?'
    ).get(review.manager_id) as any;

    const reviewCount = db.prepare(
      'SELECT COUNT(*) as count FROM reviews WHERE manager_id = ?'
    ).get(review.manager_id) as any;

    db.prepare('UPDATE managers SET rating = ?, review_count = ? WHERE id = ?')
      .run(Math.round((avgRating?.avg || 0) * 10) / 10, reviewCount?.count || 0, review.manager_id);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit claim listing request (public)
router.post('/claim', async (req, res) => {
  const {
    managerId,
    companyName,
    website,
    yearFounded,
    teamSize,
    fullName,
    jobTitle,
    email,
    phone,
    password,
    howDidYouHear,
    message
  } = req.body;

  // Validation
  if (!companyName || !website || !fullName || !email || !phone || !password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if email already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // If claiming existing manager, check if already claimed
    if (managerId) {
      const manager = db.prepare('SELECT * FROM managers WHERE id = ?').get(managerId) as any;
      if (!manager) {
        return res.status(404).json({ error: 'Manager not found' });
      }
      if (manager.is_claimed) {
        return res.status(409).json({ error: 'This listing has already been claimed' });
      }
    }

    // Create user account
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userResult = db.prepare(
      'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)'
    ).run(email, hashedPassword, 'manager', fullName);

    const userId = userResult.lastInsertRowid as number;

    let finalManagerId = managerId;

    // If new company, create manager record
    if (!managerId) {
      const slug = companyName.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const managerResult = db.prepare(`
        INSERT INTO managers (name, slug, description, website, founded_year, is_claimed, claimed_by, is_active)
        VALUES (?, ?, ?, ?, ?, 1, ?, 1)
      `).run(
        companyName,
        slug,
        `${companyName} is a property management company in Dubai.`,
        website,
        yearFounded || null,
        userId
      );

      finalManagerId = managerResult.lastInsertRowid;
    } else {
      // Update existing manager as claimed
      db.prepare('UPDATE managers SET is_claimed = 1, claimed_by = ? WHERE id = ?')
        .run(userId, managerId);
    }

    // Store claim details for admin review
    const claimId = `claim_${Date.now()}_${userId}`;
    pendingClaims.set(claimId, {
      id: claimId,
      userId,
      managerId: finalManagerId,
      companyName,
      website,
      yearFounded,
      teamSize,
      fullName,
      jobTitle,
      email,
      phone,
      howDidYouHear,
      message,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    console.log(`New claim submitted: ${claimId} for ${companyName}`);

    res.status(201).json({
      message: 'Claim submitted successfully',
      claimId,
      user: {
        id: userId,
        email,
        name: fullName,
        role: 'manager'
      }
    });
  } catch (error) {
    console.error('Claim submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get pending claims (admin only)
router.get('/claims/pending', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const claims = Array.from(pendingClaims.values()).filter(c => c.status === 'pending');
  res.json(claims);
});

// Approve/reject claim (admin only)
router.post('/claims/:claimId/review', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { claimId } = req.params;
  const { status, notes } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const claim = pendingClaims.get(claimId);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  claim.status = status;
  claim.reviewedAt = new Date().toISOString();
  claim.reviewedBy = req.user!.id;
  claim.notes = notes;

  pendingClaims.set(claimId, claim);

  res.json({ message: `Claim ${status}`, claim });
});

export default router;
