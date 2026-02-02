import express from 'express';
import db from '../database/db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all locations (public)
router.get('/', (req, res) => {
  const { featured } = req.query;
  
  let query = 'SELECT * FROM locations WHERE 1=1';
  const params: any[] = [];

  if (featured === 'true') {
    query += ' AND is_featured = 1';
  }

  query += ' ORDER BY is_featured DESC, name ASC';

  try {
    const locations = db.prepare(query).all(...params);
    res.json(locations);
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single location by slug (public)
router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  try {
    const location = db.prepare('SELECT * FROM locations WHERE slug = ?').get(slug) as any;

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Get managers in this location
    const managers = db.prepare(`
      SELECT m.*, l.name as location_name
      FROM managers m
      LEFT JOIN locations l ON m.location_id = l.id
      WHERE l.slug = ? AND m.is_active = 1
      ORDER BY m.is_featured DESC, m.rating DESC
    `).all(slug);

    res.json({
      ...location,
      managers: managers.map((m: any) => ({
        ...m,
        services: m.services ? JSON.parse(m.services) : []
      }))
    });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create location (admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  const {
    name,
    slug,
    description,
    image_url,
    properties_count,
    avg_daily_rate,
    occupancy_rate,
    is_featured
  } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO locations (name, slug, description, image_url, properties_count, avg_daily_rate, occupancy_rate, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      slug,
      description,
      image_url,
      properties_count || 0,
      avg_daily_rate || 0,
      occupancy_rate || 0,
      is_featured ? 1 : 0
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Location created successfully' });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update location (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  const updates: string[] = [];
  const values: any[] = [];

  const allowedFields = ['name', 'slug', 'description', 'image_url', 'properties_count', 'avg_daily_rate', 'occupancy_rate', 'is_featured'];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);

  try {
    db.prepare(`UPDATE locations SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete location (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { id } = req.params;

  try {
    // Check if location has managers
    const managerCount = db.prepare('SELECT COUNT(*) as count FROM managers WHERE location_id = ?').get(id) as any;
    
    if (managerCount.count > 0) {
      return res.status(400).json({ error: 'Cannot delete location with existing managers' });
    }

    db.prepare('DELETE FROM locations WHERE id = ?').run(id);
    res.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Delete location error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
