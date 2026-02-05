import express from 'express';
import db from '../database/db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all blog posts (public)
router.get('/', (req, res) => {
  const { category, search, limit = '10', offset = '0' } = req.query;
  
  let query = `
    SELECT bp.*, u.name as author_name
    FROM blog_posts bp
    LEFT JOIN users u ON bp.author_id = u.id
    WHERE bp.is_published = 1
  `;
  const params: any[] = [];

  if (category) {
    query += ' AND bp.category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (bp.title LIKE ? OR bp.excerpt LIKE ? OR bp.content LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY bp.published_at DESC';
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(limit as string), parseInt(offset as string));

  try {
    const posts = db.prepare(query).all(...params);
    res.json(posts.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : []
    })));
  } catch (error) {
    console.error('Get blog posts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single blog post by slug (public)
router.get('/:slug', (req, res) => {
  const { slug } = req.params;

  try {
    const post = db.prepare(`
      SELECT bp.*, u.name as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.slug = ? AND bp.is_published = 1
    `).get(slug) as any;

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({
      ...post,
      tags: post.tags ? JSON.parse(post.tags) : []
    });
  } catch (error) {
    console.error('Get blog post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create blog post (admin only)
router.post('/', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    featured_image,
    category,
    tags,
    is_published
  } = req.body;

  try {
    const result = db.prepare(`
      INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_id, category, tags, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      slug,
      excerpt,
      content,
      featured_image,
      req.user!.id,
      category,
      tags ? JSON.stringify(tags) : '[]',
      is_published ? 1 : 0,
      is_published ? new Date().toISOString() : null
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Blog post created successfully' });
  } catch (error) {
    console.error('Create blog post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update blog post (admin only)
router.put('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;

  const updates: string[] = [];
  const values: any[] = [];

  const allowedFields = ['title', 'slug', 'excerpt', 'content', 'featured_image', 'category', 'tags', 'is_published'];
  
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      if (field === 'tags') {
        updates.push(`${field} = ?`);
        values.push(JSON.stringify(req.body[field]));
      } else if (field === 'is_published' && req.body[field] && !req.body.published_at) {
        updates.push(`${field} = ?, published_at = ?`);
        values.push(1, new Date().toISOString());
      } else {
        updates.push(`${field} = ?`);
        values.push(req.body[field]);
      }
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  values.push(id);

  try {
    db.prepare(`UPDATE blog_posts SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    res.json({ message: 'Blog post updated successfully' });
  } catch (error) {
    console.error('Update blog post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete blog post (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { id } = req.params;

  try {
    db.prepare('DELETE FROM blog_posts WHERE id = ?').run(id);
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Delete blog post error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = db.prepare(
      'SELECT DISTINCT category FROM blog_posts WHERE is_published = 1 ORDER BY category'
    ).all();
    res.json(categories.map((c: any) => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
