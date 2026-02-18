import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database/db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, name, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `).all();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single user (admin only)
router.get('/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  
  try {
    const user = db.prepare(`
      SELECT id, email, name, role, created_at 
      FROM users 
      WHERE id = ?
    `).get(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (admin only)
router.post('/users', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { email, name, role, password } = req.body;

  if (!email || !name || !role || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // Check if email already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const result = db.prepare(`
      INSERT INTO users (email, password, role, name) 
      VALUES (?, ?, ?, ?)
    `).run(email, hashedPassword, role, name);

    res.status(201).json({ 
      id: result.lastInsertRowid, 
      email, 
      name, 
      role,
      message: 'User created successfully' 
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (admin only)
router.put('/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;
  const { email, name, role, password } = req.body;

  try {
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and already exists
    if (email && email !== user.email) {
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ? AND id != ?').get(email, id);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (name) {
      updates.push('name = ?');
      values.push(name);
    }
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      updates.push('password = ?');
      values.push(bcrypt.hashSync(password, 10));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    db.prepare(`
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(...values);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    // Check if user exists
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting yourself
    if (parseInt(id) === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const totalManagers = db.prepare('SELECT COUNT(*) as count FROM managers').get() as any;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalLocations = db.prepare('SELECT COUNT(*) as count FROM locations').get() as any;
    const totalBlogPosts = db.prepare('SELECT COUNT(*) as count FROM blog_posts').get() as any;
    const pendingManagers = db.prepare('SELECT COUNT(*) as count FROM managers WHERE is_active = 0').get() as any;
    const featuredManagers = db.prepare('SELECT COUNT(*) as count FROM managers WHERE is_featured = 1').get() as any;
    const claimedManagers = db.prepare('SELECT COUNT(*) as count FROM managers WHERE is_claimed = 1').get() as any;

    res.json({
      totalManagers: totalManagers.count,
      totalUsers: totalUsers.count,
      totalLocations: totalLocations.count,
      totalBlogPosts: totalBlogPosts.count,
      pendingManagers: pendingManagers.count,
      featuredManagers: featuredManagers.count,
      claimedManagers: claimedManagers.count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
