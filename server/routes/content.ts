import express from 'express';
import db from '../database/db.js';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get about page content (public)
router.get('/about', (req, res) => {
  try {
    let content = db.prepare('SELECT * FROM page_content WHERE page_key = ?').get('about') as any;
    
    // If no content exists, return default content
    if (!content) {
      return res.json({
        id: 1,
        title: 'About BNBinsights',
        subtitle: 'The leading directory for Dubai vacation rental managers',
        mission: 'Our mission is to empower property owners with transparent, data-driven insights to make informed decisions about their vacation rental management. We believe that access to high-quality information leads to better partnerships and greater success.',
        story: 'BNBinsights was founded in 2024 with a simple vision: create a comprehensive, unbiased directory of Dubai\'s vacation rental management companies. What started as a small project has grown into the region\'s most trusted resource for property owners seeking professional management services.\n\nWe\'ve analyzed hundreds of management companies, collected thousands of reviews, and built a platform that brings transparency to an industry that desperately needed it. Our team of experts continuously monitors the market to ensure our data remains accurate and up-to-date.',
        values: '• Transparency: We provide unbiased, data-driven information\n• Quality: We carefully vet and verify all listed companies\n• Innovation: We constantly improve our platform and methodology\n• Community: We build connections between owners and managers\n• Excellence: We strive for the highest standards in everything we do',
        stats: JSON.stringify({
          managers: 190,
          properties: 25000,
          cities: 1,
          satisfaction: 98
        }),
        updated_at: new Date().toISOString()
      });
    }
    
    res.json({
      ...content,
      stats: content.stats ? JSON.parse(content.stats) : {}
    });
  } catch (error) {
    console.error('Get about content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update about page content (admin only)
router.put('/about', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  const { title, subtitle, mission, story, values, stats } = req.body;

  try {
    // Check if content exists
    const existing = db.prepare('SELECT * FROM page_content WHERE page_key = ?').get('about');
    
    if (existing) {
      // Update existing
      db.prepare(`
        UPDATE page_content 
        SET title = ?, subtitle = ?, mission = ?, story = ?, values_text = ?, stats = ?, updated_at = CURRENT_TIMESTAMP
        WHERE page_key = ?
      `).run(
        title,
        subtitle,
        mission,
        story,
        values,
        stats ? JSON.stringify(stats) : '{}',
        'about'
      );
    } else {
      // Create new
      db.prepare(`
        INSERT INTO page_content (page_key, title, subtitle, mission, story, values_text, stats)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        'about',
        title,
        subtitle,
        mission,
        story,
        values,
        stats ? JSON.stringify(stats) : '{}'
      );
    }

    res.json({ message: 'About page updated successfully' });
  } catch (error) {
    console.error('Update about content error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Contact form submission (public)
router.post('/contact', (req, res) => {
  const { name, email, subject, message, inquiryType } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Store contact submission
    db.prepare(`
      INSERT INTO contact_submissions (name, email, subject, message, inquiry_type, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(name, email, subject, message, inquiryType || 'general');

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get contact submissions (admin only)
router.get('/contact/submissions', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const submissions = db.prepare(
      'SELECT * FROM contact_submissions ORDER BY created_at DESC'
    ).all();
    res.json(submissions);
  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
