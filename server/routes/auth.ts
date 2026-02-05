import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../database/db.js';
import { generateToken, authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// In-memory store for reset tokens (in production, use Redis or database)
const resetTokens: Map<string, { userId: number; expires: Date }> = new Map();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register (for managers claiming listings)
router.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name required' });
  }

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const result = db.prepare(
      'INSERT INTO users (email, password, role, name) VALUES (?, ?, ?, ?)'
    ).run(email, hashedPassword, 'manager', name);

    const token = generateToken({
      id: result.lastInsertRowid as number,
      email,
      role: 'manager',
      name
    });

    res.status(201).json({
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        role: 'manager',
        name
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const authReq = req as AuthRequest;
  res.json({ user: authReq.user });
});

// Change password
router.post('/change-password', authenticateToken, (req, res) => {
  const authReq = req as AuthRequest;
  const { currentPassword, newPassword } = req.body;
  const userId = authReq.user!.id;

  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!user || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedNewPassword, userId);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Request password reset
router.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If an account exists, a reset link has been sent' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    resetTokens.set(token, { userId: user.id, expires });

    // In production, send email here
    // For now, return the token in development
    console.log(`Password reset token for ${email}: ${token}`);

    res.json({ 
      message: 'If an account exists, a reset link has been sent',
      // Include token in development only
      ...(process.env.NODE_ENV !== 'production' && { token })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify reset token
router.get('/verify-reset-token/:token', (req, res) => {
  const { token } = req.params;

  const resetData = resetTokens.get(token);

  if (!resetData || resetData.expires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  res.json({ valid: true });
});

// Reset password with token
router.post('/reset-password', (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const resetData = resetTokens.get(token);

  if (!resetData || resetData.expires < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedPassword, resetData.userId);

    // Remove used token
    resetTokens.delete(token);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, (req, res) => {
  try {
    const users = db.prepare('SELECT id, email, role, name, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, (req, res) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  
  // Prevent deleting yourself
  if (parseInt(id) === authReq.user!.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }

  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
