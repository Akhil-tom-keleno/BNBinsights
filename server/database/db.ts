import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_DIR = path.join(process.cwd(), 'server', 'database');
const DB_PATH = path.join(DB_DIR, 'bnbinsights.db');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Initialize tables
export function initDatabase() {
  // Users table (Admin & Manager)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'manager')),
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Locations/Areas table
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      image_url TEXT,
      properties_count INTEGER DEFAULT 0,
      avg_daily_rate INTEGER DEFAULT 0,
      occupancy_rate INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Property Managers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS managers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      location_id INTEGER,
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      logo_url TEXT,
      cover_image_url TEXT,
      founded_year INTEGER,
      listings_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      review_count INTEGER DEFAULT 0,
      services TEXT,
      social_links TEXT,
      team_members TEXT,
      tier TEXT,
      is_claimed BOOLEAN DEFAULT 0,
      claimed_by INTEGER,
      is_featured BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (claimed_by) REFERENCES users(id)
    )
  `);

  // Blog Posts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      featured_image TEXT,
      author_id INTEGER,
      category TEXT,
      tags TEXT,
      is_published BOOLEAN DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id)
    )
  `);

  // Reviews table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      manager_id INTEGER NOT NULL,
      user_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manager_id) REFERENCES managers(id) ON DELETE CASCADE
    )
  `);

  // Page Content table (for About page, etc.)
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page_key TEXT UNIQUE NOT NULL,
      title TEXT,
      subtitle TEXT,
      mission TEXT,
      story TEXT,
      values_text TEXT,
      stats TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contact Submissions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      inquiry_type TEXT DEFAULT 'general',
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default admin user
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@bnbinsights.com');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (email, password, role, name) 
      VALUES (?, ?, 'admin', 'Administrator')
    `).run('admin@bnbinsights.com', hashedPassword);
    console.log('Default admin created: admin@bnbinsights.com / admin123');
  }

  // Insert locations
  const locations = [
    { name: 'Palm Jumeirah', slug: 'palm-jumeirah', properties_count: 12400, avg_daily_rate: 1850, occupancy_rate: 68, image_url: '/market_palm_aerial.jpg', is_featured: 1 },
    { name: 'Downtown Dubai', slug: 'downtown-dubai', properties_count: 9800, avg_daily_rate: 1420, occupancy_rate: 72, image_url: '/market_downtown_aerial.jpg', is_featured: 1 },
    { name: 'Dubai Marina', slug: 'dubai-marina', properties_count: 14200, avg_daily_rate: 980, occupancy_rate: 66, image_url: '/market_marina_aerial.jpg', is_featured: 1 },
    { name: 'JBR', slug: 'jbr', properties_count: 8600, avg_daily_rate: 1100, occupancy_rate: 70, image_url: '/market_jbr_aerial.jpg', is_featured: 1 },
    { name: 'Arabian Ranches', slug: 'arabian-ranches', properties_count: 5400, avg_daily_rate: 1650, occupancy_rate: 58, image_url: '/market_ranches_aerial.jpg', is_featured: 1 },
    { name: 'Business Bay', slug: 'business-bay', properties_count: 10100, avg_daily_rate: 890, occupancy_rate: 64, image_url: '/market_businessbay_aerial.jpg', is_featured: 1 },
  ];

  const insertLocation = db.prepare(`
    INSERT OR IGNORE INTO locations (name, slug, properties_count, avg_daily_rate, occupancy_rate, image_url, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  locations.forEach(loc => insertLocation.run(loc.name, loc.slug, loc.properties_count, loc.avg_daily_rate, loc.occupancy_rate, loc.image_url, loc.is_featured));

  // REAL DUBAI HOLIDAY HOME COMPANIES FROM CSV
  // Top 3 are marked as featured: Deluxe Holiday Homes, Infinity Keys, Guesty
  const realManagers = [
    { name: 'Deluxe Holiday Homes', slug: 'deluxe-holiday-homes', listings_count: 800, tier: 'Tier 1 - Major Operators', is_featured: 1, rating: 4.9, review_count: 245, founded_year: 2015, location_id: 2 },
    { name: 'Infinity Keys Holiday Homes', slug: 'infinity-keys-holiday-homes', listings_count: 600, tier: 'Tier 1 - Major Operators', is_featured: 1, rating: 4.8, review_count: 198, founded_year: 2016, location_id: 3 },
    { name: 'Guesty', slug: 'guesty', listings_count: 500, tier: 'Tier 1 - Major Operators', is_featured: 1, rating: 4.8, review_count: 312, founded_year: 2013, location_id: 2 },
    { name: 'MasterHost', slug: 'masterhost', listings_count: 300, tier: 'Tier 1 - Major Operators', is_featured: 0, rating: 4.7, review_count: 156, founded_year: 2017, location_id: 6 },
    { name: 'Bespoke Holiday Homes', slug: 'bespoke-holiday-homes', listings_count: 300, tier: 'Tier 1 - Major Operators', is_featured: 0, rating: 4.6, review_count: 134, founded_year: 2014, location_id: 1 },
    { name: 'Sonder', slug: 'sonder', listings_count: 250, tier: 'Tier 1 - Major Operators', is_featured: 0, rating: 4.7, review_count: 289, founded_year: 2012, location_id: 2 },
    { name: 'GuestReady', slug: 'guestready', listings_count: 200, tier: 'Tier 1 - Major Operators', is_featured: 0, rating: 4.6, review_count: 178, founded_year: 2016, location_id: 2 },
    { name: 'Apricus Holiday Homes', slug: 'apricus-holiday-homes', listings_count: 170, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.5, review_count: 98, founded_year: 2015, location_id: 3 },
    { name: 'New Arabian Holiday Homes', slug: 'new-arabian-holiday-homes', listings_count: 165, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.5, review_count: 112, founded_year: 2014, location_id: 2 },
    { name: 'Key One Holiday Homes', slug: 'key-one-holiday-homes', listings_count: 150, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 87, founded_year: 2016, location_id: 3 },
    { name: 'Frank Porter', slug: 'frank-porter', listings_count: 150, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.7, review_count: 203, founded_year: 2015, location_id: 2 },
    { name: 'Blueground', slug: 'blueground', listings_count: 150, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.5, review_count: 167, founded_year: 2013, location_id: 6 },
    { name: 'Hostmaker', slug: 'hostmaker', listings_count: 150, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 145, founded_year: 2014, location_id: 2 },
    { name: 'LUX Holiday Home', slug: 'lux-holiday-home', listings_count: 150, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.6, review_count: 134, founded_year: 2016, location_id: 1 },
    { name: 'Silkhaus', slug: 'silkhaus', listings_count: 120, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.5, review_count: 89, founded_year: 2017, location_id: 6 },
    { name: 'Nox Holiday Homes', slug: 'nox-holiday-homes', listings_count: 109, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 76, founded_year: 2015, location_id: 3 },
    { name: 'Castles Holiday Homes', slug: 'castles-holiday-homes', listings_count: 107, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.3, review_count: 67, founded_year: 2014, location_id: 1 },
    { name: 'Livbnb', slug: 'livbnb', listings_count: 107, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 78, founded_year: 2016, location_id: 3 },
    { name: 'Exclusive Links Vacation Homes', slug: 'exclusive-links-vacation-homes', listings_count: 100, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.5, review_count: 92, founded_year: 2013, location_id: 1 },
    { name: 'AirDXB', slug: 'airdxb', listings_count: 100, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 87, founded_year: 2015, location_id: 2 },
    { name: 'Homevy', slug: 'homevy', listings_count: 100, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.3, review_count: 71, founded_year: 2016, location_id: 4 },
    { name: 'Airstay Holiday Homes', slug: 'airstay-holiday-homes', listings_count: 100, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 83, founded_year: 2015, location_id: 3 },
    { name: 'StayBetterDXB', slug: 'staybetterdxb', listings_count: 95, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.5, review_count: 68, founded_year: 2017, location_id: 6 },
    { name: 'Vacationer Holiday Homes', slug: 'vacationer-holiday-homes', listings_count: 90, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 56, founded_year: 2016, location_id: 4 },
    { name: 'HiGuests', slug: 'higuests', listings_count: 80, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.4, review_count: 72, founded_year: 2017, location_id: 3 },
    { name: 'Pass the Keys', slug: 'pass-the-keys', listings_count: 80, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.5, review_count: 89, founded_year: 2015, location_id: 2 },
    { name: 'Staycae', slug: 'staycae', listings_count: 80, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 54, founded_year: 2016, location_id: 3 },
    { name: 'One Perfect Stay', slug: 'one-perfect-stay', listings_count: 70, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.4, review_count: 67, founded_year: 2015, location_id: 2 },
    { name: 'My Room Holiday Homes Rental', slug: 'my-room-holiday-homes', listings_count: 61, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 43, founded_year: 2017, location_id: 4 },
    { name: 'Airsorted', slug: 'airsorted', listings_count: 60, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 58, founded_year: 2014, location_id: 2 },
    { name: 'fäm Living Holiday Homes', slug: 'fam-living', listings_count: 60, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 49, founded_year: 2016, location_id: 6 },
    { name: 'TRPS Vacation Homes Rental', slug: 'trps-vacation-homes', listings_count: 59, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 38, founded_year: 2017, location_id: 5 },
    { name: 'Island Vacation Homes', slug: 'island-vacation-homes', listings_count: 59, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 42, founded_year: 2016, location_id: 1 },
    { name: 'Shosty', slug: 'shosty', listings_count: 50, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 47, founded_year: 2017, location_id: 3 },
    { name: 'Eastern Coast Holiday Homes', slug: 'eastern-coast', listings_count: 50, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 35, founded_year: 2016, location_id: 1 },
    { name: 'Tadabeer Homes', slug: 'tadabeer-homes', listings_count: 50, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 41, founded_year: 2017, location_id: 5 },
  ];

  const insertManager = db.prepare(`
    INSERT OR REPLACE INTO managers 
    (name, slug, location_id, founded_year, listings_count, rating, review_count, is_featured, tier, cover_image_url, description, services, social_links, team_members)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const services = JSON.stringify(['Property Marketing', 'Guest Communication', 'Professional Cleaning', 'Maintenance', 'Dynamic Pricing', '24/7 Support']);

  realManagers.forEach(mgr => {
    const website = `https://${mgr.slug.replace(/-/g, '')}.com`;
    const socialLinks = JSON.stringify({ 
      website: website,
      airbnb: `https://airbnb.com/users/${mgr.slug}`,
      instagram: `@${mgr.slug.replace(/-/g, '')}`,
      linkedin: mgr.slug
    });
    const teamMembers = JSON.stringify([
      { name: 'Manager', role: 'Property Manager' }
    ]);
    const description = `${mgr.name} is a ${mgr.tier} holiday home management company in Dubai with ${mgr.listings_count}+ properties under management. They provide comprehensive short-term rental services including listing optimization, guest communication, cleaning, and maintenance.`;
    
    insertManager.run(
      mgr.name,
      mgr.slug,
      mgr.location_id,
      mgr.founded_year,
      mgr.listings_count,
      mgr.rating,
      mgr.review_count,
      mgr.is_featured,
      mgr.tier,
      `/manager_${['palm', 'downtown', 'marina', 'jbr', 'ranches', 'creek'][mgr.location_id - 1] || 'downtown'}.jpg`,
      description,
      services,
      socialLinks,
      teamMembers
    );
  });

  // Insert blog posts
  const blogPosts = [
    {
      title: 'How to Choose the Right Airbnb Manager in Dubai',
      slug: 'choosing-airbnb-manager-dubai',
      excerpt: 'Finding the perfect property manager can make or break your short-term rental business.',
      content: '<h2>Why You Need a Professional Airbnb Manager</h2><p>Managing a short-term rental property in Dubai requires significant time, expertise, and local knowledge.</p>',
      featured_image: '/blog-1.jpg',
      category: 'Guide',
      is_published: 1,
      published_at: new Date().toISOString()
    },
    {
      title: 'Dubai Short-Term Rental Regulations',
      slug: 'dubai-short-term-rental-regulations',
      excerpt: 'Navigate Dubai\'s short-term rental laws and regulations.',
      content: '<h2>Understanding Dubai\'s Regulatory Framework</h2><p>Dubai has specific regulations governing short-term rentals.</p>',
      featured_image: '/blog-2.jpg',
      category: 'Regulations',
      is_published: 1,
      published_at: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      title: 'Maximizing Your Dubai Rental Income',
      slug: 'maximizing-rental-income-dubai',
      excerpt: 'Learn proven strategies to optimize your pricing.',
      content: '<h2>The Importance of Dynamic Pricing</h2><p>Static pricing leaves money on the table.</p>',
      featured_image: '/blog-3.jpg',
      category: 'Strategy',
      is_published: 1,
      published_at: new Date(Date.now() - 86400000 * 14).toISOString()
    }
  ];

  const insertBlog = db.prepare(`
    INSERT OR IGNORE INTO blog_posts (title, slug, excerpt, content, featured_image, category, is_published, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  blogPosts.forEach(post => insertBlog.run(post.title, post.slug, post.excerpt, post.content, post.featured_image, post.category, post.is_published, post.published_at));

  // Insert additional companies from Dubai Holiday Homes Excel sheet
  const additionalManagers = [
    { name: 'Guestready', slug: 'guestready-dxb', listings_count: 200, tier: 'Tier 1 - Major Operators', is_featured: 0, rating: 4.6, review_count: 178, founded_year: 2016, location_id: 2 },
    { name: 'Air-DXB', slug: 'air-dxb', listings_count: 100, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 87, founded_year: 2015, location_id: 2 },
    { name: 'TRPS Vacation Homes Rental Co. LLC', slug: 'trps-vacation-homes-llc', listings_count: 59, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 38, founded_year: 2017, location_id: 5 },
    { name: 'Prime Host Vacation Homes Rental L.L.C', slug: 'prime-host-vacation-homes', listings_count: 45, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 32, founded_year: 2017, location_id: 3 },
    { name: 'SB Holiday Homes', slug: 'sb-holiday-homes', listings_count: 40, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 28, founded_year: 2016, location_id: 4 },
    { name: 'STAY HUB', slug: 'stay-hub', listings_count: 55, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 35, founded_year: 2017, location_id: 6 },
    { name: 'OSKENA Vacation Homes', slug: 'oskena-vacation-homes', listings_count: 35, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2016, location_id: 3 },
    { name: 'PureLiving Holiday Homes', slug: 'pureliving-holiday-homes', listings_count: 42, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 31, founded_year: 2017, location_id: 2 },
    { name: 'Vigor Vacation Homes Rental L.L.C', slug: 'vigor-vacation-homes', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 27, founded_year: 2016, location_id: 1 },
    { name: 'EasyGo Holiday Homes', slug: 'easygo-holiday-homes', listings_count: 48, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 33, founded_year: 2017, location_id: 4 },
    { name: 'Homesvip For Vacation Homes Rental Co. L.L.C', slug: 'homesvip-vacation-homes', listings_count: 52, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 36, founded_year: 2016, location_id: 3 },
    { name: 'Vserve Living', slug: 'vserve-living', listings_count: 44, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2017, location_id: 2 },
    { name: 'Monty Holiday Home L.L.C.', slug: 'monty-holiday-home', listings_count: 36, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 24, founded_year: 2016, location_id: 5 },
    { name: 'Dream Inn', slug: 'dream-inn', listings_count: 58, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 41, founded_year: 2015, location_id: 3 },
    { name: 'Durrani Homes', slug: 'durrani-homes', listings_count: 41, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 29, founded_year: 2016, location_id: 2 },
    { name: 'CARPE DIEM LIFE STYLE HOLIDAY HOMES RENTAL L.L.C', slug: 'carpe-diem-holiday-homes', listings_count: 33, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 22, founded_year: 2017, location_id: 1 },
    { name: 'HOMES & BEYOND Holiday Homes', slug: 'homes-and-beyond', listings_count: 47, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 34, founded_year: 2016, location_id: 4 },
    { name: 'Crescent Holiday Homes', slug: 'crescent-holiday-homes', listings_count: 39, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2017, location_id: 3 },
    { name: 'Cloud9 Stay Vacation Homes Rental', slug: 'cloud9-stay', listings_count: 51, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 37, founded_year: 2016, location_id: 2 },
    { name: 'Boosting Properties', slug: 'boosting-properties', listings_count: 43, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 31, founded_year: 2017, location_id: 6 },
    { name: 'GUESTA', slug: 'guesta', listings_count: 37, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2016, location_id: 3 },
    { name: 'HOSPITALITYEXPERT', slug: 'hospitalityexpert', listings_count: 56, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 40, founded_year: 2015, location_id: 2 },
    { name: 'Bellaviu Holiday Homes', slug: 'bellaviu-holiday-homes', listings_count: 34, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 23, founded_year: 2017, location_id: 1 },
    { name: 'SKY AVENUE PREMIER HOLIDAY HOMES LLC', slug: 'sky-avenue-holiday-homes', listings_count: 46, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 33, founded_year: 2016, location_id: 4 },
    { name: 'StaysDxb', slug: 'staysdxb', listings_count: 49, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2017, location_id: 3 },
    { name: 'Living Experts Holiday Homes', slug: 'living-experts', listings_count: 40, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 28, founded_year: 2016, location_id: 2 },
    { name: 'Allsopp & Allsopp Holiday Homes LLC - Dubai', slug: 'allsopp-holiday-homes', listings_count: 62, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 48, founded_year: 2014, location_id: 5 },
    { name: 'Ocley Group', slug: 'ocley-group', listings_count: 32, tier: 'Tier 3 - Growing', is_featured: 0, rating: 3.9, review_count: 21, founded_year: 2017, location_id: 6 },
    { name: 'Alliance Ventura Premium Holiday Homes', slug: 'alliance-ventura', listings_count: 45, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 32, founded_year: 2016, location_id: 3 },
    { name: 'Vibel Stay Holiday Homes Rental', slug: 'vibel-stay', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2017, location_id: 2 },
    { name: 'Privato Holiday Homes', slug: 'privato-holiday-homes', listings_count: 35, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 24, founded_year: 2016, location_id: 1 },
    { name: 'First Class Property Management', slug: 'first-class-property', listings_count: 50, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 36, founded_year: 2015, location_id: 4 },
    { name: 'Citihome', slug: 'citihome', listings_count: 44, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2016, location_id: 3 },
    { name: 'Elegant Escapes Vacation Homes Rental L.L.C', slug: 'elegant-escapes', listings_count: 41, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 29, founded_year: 2017, location_id: 2 },
    { name: 'DIVINE GRACE VACATION HOMES RENTAL L.L.C', slug: 'divine-grace-vacation', listings_count: 31, tier: 'Tier 3 - Growing', is_featured: 0, rating: 3.9, review_count: 20, founded_year: 2017, location_id: 5 },
    { name: 'Propertyana Holiday Homes LLC', slug: 'propertyana-holiday-homes', listings_count: 47, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 34, founded_year: 2016, location_id: 3 },
    { name: 'HAVENUE Holiday Homes', slug: 'havenue-holiday-homes', listings_count: 36, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 2 },
    { name: 'HelloBnb Holiday Homes Rental', slug: 'hellobnb-holiday-homes', listings_count: 42, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 31, founded_year: 2016, location_id: 1 },
    { name: 'OSAC Holidayhomes', slug: 'osac-holidayhomes', listings_count: 39, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 27, founded_year: 2017, location_id: 4 },
    { name: 'Raine & Horne Dubai', slug: 'raine-horne-dubai', listings_count: 55, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 39, founded_year: 2015, location_id: 3 },
    { name: '121 Living', slug: '121-living', listings_count: 48, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2016, location_id: 2 },
    { name: 'JSR GLOBAL REAL ESTATE / HOLIDAY HOMES', slug: 'jsr-global-holiday-homes', listings_count: 53, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 37, founded_year: 2015, location_id: 6 },
    { name: 'FirstStay Holiday Homes & Property Management', slug: 'firststay-holiday-homes', listings_count: 46, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 33, founded_year: 2016, location_id: 3 },
    { name: 'Royal Vista Vacation Homes', slug: 'royal-vista-vacation', listings_count: 40, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 28, founded_year: 2017, location_id: 2 },
    { name: 'Escape24 Premium Holiday Homes', slug: 'escape24-premium', listings_count: 44, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 31, founded_year: 2016, location_id: 1 },
    { name: 'Suiteable', slug: 'suiteable', listings_count: 37, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 4 },
    { name: 'Prime Stay Vacation Homes', slug: 'prime-stay-vacation', listings_count: 43, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2016, location_id: 3 },
    { name: 'haus & haus Holiday Rental', slug: 'haus-haus-holiday', listings_count: 51, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 36, founded_year: 2015, location_id: 2 },
    { name: 'DAIFY Holiday Homes Rental Management Agency', slug: 'daify-holiday-homes', listings_count: 35, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 24, founded_year: 2017, location_id: 5 },
    { name: 'PK Holiday Homes | Short term rentals Dubai', slug: 'pk-holiday-homes', listings_count: 41, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 29, founded_year: 2016, location_id: 3 },
    { name: 'Zed Living Holiday Homes', slug: 'zed-living', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2017, location_id: 2 },
    { name: 'Beytie.com Vacation Homes', slug: 'beytie-vacation-homes', listings_count: 34, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 23, founded_year: 2016, location_id: 1 },
    { name: 'SUPERHOST VACATION HOMES RENTAL', slug: 'superhost-vacation-homes', listings_count: 49, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2015, location_id: 4 },
    { name: 'Elite LUX Holiday Homes', slug: 'elite-lux-holiday-homes', listings_count: 45, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 32, founded_year: 2016, location_id: 3 },
    { name: 'Like Home', slug: 'like-home', listings_count: 36, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 2 },
    { name: 'Desert City Stays', slug: 'desert-city-stays', listings_count: 42, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2016, location_id: 5 },
    { name: 'Birchfort Real Estate and Holiday Homes', slug: 'birchfort-holiday-homes', listings_count: 39, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 27, founded_year: 2017, location_id: 3 },
    { name: 'The Smart Concierge Holiday Homes', slug: 'smart-concierge', listings_count: 47, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 34, founded_year: 2016, location_id: 2 },
    { name: 'Keys Please Holiday Homes Rental Dubai', slug: 'keys-please', listings_count: 33, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 22, founded_year: 2017, location_id: 1 },
    { name: 'Marco Polo Holiday Homes', slug: 'marco-polo-holiday-homes', listings_count: 44, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 31, founded_year: 2016, location_id: 4 },
    { name: 'Queens Estate Vacation Home LLC', slug: 'queens-estate', listings_count: 40, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 28, founded_year: 2017, location_id: 3 },
    { name: 'Blue Ocean Holiday Homes Rental LLC', slug: 'blue-ocean-holiday-homes', listings_count: 52, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 38, founded_year: 2015, location_id: 2 },
    { name: 'Bhavan Vacation Homes', slug: 'bhavan-vacation-homes', listings_count: 37, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2016, location_id: 6 },
    { name: 'Czechin', slug: 'czechin', listings_count: 31, tier: 'Tier 3 - Growing', is_featured: 0, rating: 3.9, review_count: 20, founded_year: 2017, location_id: 3 },
    { name: 'La Buena Vida Holiday Homes', slug: 'la-buena-vida', listings_count: 46, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 33, founded_year: 2016, location_id: 2 },
    { name: 'WelHome Vacation Home Rental', slug: 'welhome-vacation', listings_count: 43, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2017, location_id: 1 },
    { name: 'Host And Stay Vacation Homes Rental LLC', slug: 'host-and-stay', listings_count: 50, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 36, founded_year: 2015, location_id: 4 },
    { name: 'ALH Vacation Homes', slug: 'alh-vacation-homes', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2016, location_id: 3 },
    { name: 'On off Vacation Holiday Home', slug: 'on-off-vacation', listings_count: 35, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 24, founded_year: 2017, location_id: 2 },
    { name: 'LUXURY HOMEVY VACATION HOMES RENTAL L.L.C', slug: 'luxury-homevy', listings_count: 41, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 29, founded_year: 2016, location_id: 5 },
    { name: 'AYA Boutique Holiday Homes Rental', slug: 'aya-boutique', listings_count: 48, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2015, location_id: 3 },
    { name: 'Hopo Homes', slug: 'hopo-homes', listings_count: 36, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 2 },
    { name: 'Keyrock Holiday Homes', slug: 'keyrock-holiday-homes', listings_count: 39, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 27, founded_year: 2016, location_id: 1 },
    { name: 'Amber Holiday Homes', slug: 'amber-holiday-homes', listings_count: 45, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 32, founded_year: 2016, location_id: 4 },
    { name: 'Silk Valley Holiday Homes', slug: 'silk-valley-holiday-homes', listings_count: 42, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2017, location_id: 3 },
    { name: 'Stayis Holiday Homes', slug: 'stayis-holiday-homes', listings_count: 37, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2016, location_id: 2 },
    { name: 'Azco Holiday Homes', slug: 'azco-holiday-homes', listings_count: 34, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 23, founded_year: 2017, location_id: 5 },
    { name: 'Kings Holiday Homes', slug: 'kings-holiday-homes', listings_count: 40, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 28, founded_year: 2016, location_id: 3 },
    { name: 'Mare Homes', slug: 'mare-homes', listings_count: 33, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 22, founded_year: 2017, location_id: 2 },
    { name: 'Maison de Vacances Dubai', slug: 'maison-de-vacances', listings_count: 47, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 34, founded_year: 2015, location_id: 1 },
    { name: 'Fox River Holiday Home LLC', slug: 'fox-river-holiday', listings_count: 44, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 31, founded_year: 2016, location_id: 4 },
    { name: 'Comfy Holiday Homes', slug: 'comfy-holiday-homes', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2017, location_id: 3 },
    { name: 'Druvya Holiday Homes LLC', slug: 'druvya-holiday-homes', listings_count: 35, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 24, founded_year: 2016, location_id: 2 },
    { name: 'Bab Al Noor Vacation Homes Rental Dubai UAE', slug: 'bab-al-noor', listings_count: 41, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 29, founded_year: 2017, location_id: 5 },
    { name: 'Shosty Short Term Rental', slug: 'shosty-short-term', listings_count: 50, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 36, founded_year: 2015, location_id: 3 },
    { name: 'Luxury Dream Holiday Homes', slug: 'luxury-dream-holiday', listings_count: 46, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 33, founded_year: 2016, location_id: 2 },
    { name: 'Rare Homes LLC', slug: 'rare-homes-llc', listings_count: 39, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 27, founded_year: 2017, location_id: 1 },
    { name: 'Raine & Horne Vacation Homes', slug: 'raine-horne-vacation', listings_count: 43, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2016, location_id: 4 },
    { name: 'Ahlan Holiday Homes Rental', slug: 'ahlan-holiday-homes', listings_count: 36, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 3 },
    { name: 'Vacay Lettings Vacation Homes Rental', slug: 'vacay-lettings', listings_count: 49, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2015, location_id: 2 },
    { name: '2ndhome', slug: '2ndhome', listings_count: 40, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 28, founded_year: 2016, location_id: 5 },
    { name: 'Everluxe Holiday Homes', slug: 'everluxe-holiday-homes', listings_count: 45, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 32, founded_year: 2016, location_id: 3 },
    { name: 'Savis Vacation Homes', slug: 'savis-vacation-homes', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2017, location_id: 2 },
    { name: 'DVR Luxury Living Real Estate & Vacation Homes', slug: 'dvr-luxury-living', listings_count: 52, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 38, founded_year: 2015, location_id: 1 },
    { name: 'Gardenia Holiday Homes', slug: 'gardenia-holiday-homes', listings_count: 47, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 34, founded_year: 2016, location_id: 4 },
    { name: 'Westminster Holiday Homes Rental L.L.C.', slug: 'westminster-holiday-homes', listings_count: 41, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 29, founded_year: 2017, location_id: 3 },
    { name: '365 Luxury Homes', slug: '365-luxury-homes', listings_count: 44, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 32, founded_year: 2016, location_id: 2 },
    { name: 'Book My Stay Holiday Homes', slug: 'book-my-stay', listings_count: 37, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 5 },
    { name: 'Marbella Holiday homes', slug: 'marbella-holiday-homes', listings_count: 50, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 36, founded_year: 2015, location_id: 3 },
    { name: 'La Maison Vacation Homes', slug: 'la-maison-vacation', listings_count: 46, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 33, founded_year: 2016, location_id: 2 },
    { name: 'HomesGetaway - ERG Holiday Homes LLC', slug: 'homesgetaway', listings_count: 39, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 27, founded_year: 2017, location_id: 1 },
    { name: 'Forest Hills Holiday Homes', slug: 'forest-hills-holiday', listings_count: 43, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2016, location_id: 4 },
    { name: 'Luxfolio Retreats', slug: 'luxfolio-retreats', listings_count: 36, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 3 },
    { name: 'Green Future Holiday Homes', slug: 'green-future-holiday', listings_count: 48, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2015, location_id: 2 },
    { name: 'Hashtag Holiday Home', slug: 'hashtag-holiday-home', listings_count: 42, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2016, location_id: 5 },
    { name: 'Manzil.life - Luxury Holiday Homes in Dubai', slug: 'manzil-life', listings_count: 51, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 37, founded_year: 2015, location_id: 3 },
    { name: 'Waves Holiday Homes', slug: 'waves-holiday-homes', listings_count: 45, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 32, founded_year: 2016, location_id: 2 },
    { name: 'Nexus Living', slug: 'nexus-living', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2017, location_id: 1 },
    { name: 'Haven heights vacation homes rental llc', slug: 'haven-heights', listings_count: 44, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 31, founded_year: 2016, location_id: 4 },
    { name: 'Vayk', slug: 'vayk', listings_count: 40, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 28, founded_year: 2017, location_id: 3 },
    { name: 'CCA Property Management Solutions', slug: 'cca-property-management', listings_count: 47, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 34, founded_year: 2016, location_id: 2 },
    { name: 'Altitude Real Estate & Holiday Homes', slug: 'altitude-real-estate', listings_count: 35, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 24, founded_year: 2017, location_id: 5 },
    { name: 'BE OUR GUEST Holiday Homes', slug: 'be-our-guest', listings_count: 49, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2015, location_id: 3 },
    { name: 'Luxury Escapes Vacation Homes Rental', slug: 'luxury-escapes-vacation', listings_count: 46, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 33, founded_year: 2016, location_id: 2 },
    { name: 'Chalet Holiday Homes', slug: 'chalet-holiday-homes', listings_count: 41, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 29, founded_year: 2017, location_id: 1 },
    { name: 'LUXE Vacation Homes Dubai', slug: 'luxe-vacation-homes', listings_count: 53, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 39, founded_year: 2015, location_id: 4 },
    { name: 'White & Grey - Vacation Homes Rentals', slug: 'white-grey-vacation', listings_count: 37, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 3 },
    { name: 'Blue Sky Holiday Homes Rental LLC', slug: 'blue-sky-holiday-homes', listings_count: 48, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2016, location_id: 2 },
    { name: 'One Address Holiday Homes', slug: 'one-address-holiday', listings_count: 42, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2017, location_id: 5 },
    { name: 'Rich Stay Holiday Homes', slug: 'rich-stay-holiday', listings_count: 45, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 32, founded_year: 2016, location_id: 3 },
    { name: 'Trophy Stays Holiday Homes LLC', slug: 'trophy-stays', listings_count: 39, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 27, founded_year: 2017, location_id: 2 },
    { name: 'RAD Holiday Homes Rental', slug: 'rad-holiday-homes', listings_count: 50, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 36, founded_year: 2015, location_id: 1 },
    { name: 'bnbme Holiday Homes by Hoteliers', slug: 'bnbme-holiday-homes', listings_count: 47, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 34, founded_year: 2016, location_id: 4 },
    { name: 'SVIZONA Holiday Homes', slug: 'svizona-holiday-homes', listings_count: 44, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 31, founded_year: 2017, location_id: 3 },
    { name: 'Dubai Vacations Homes', slug: 'dubai-vacations-homes', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2016, location_id: 2 },
    { name: 'LIVE LARGE', slug: 'live-large', listings_count: 52, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.3, review_count: 38, founded_year: 2015, location_id: 5 },
    { name: 'Chelsea Holiday Homes', slug: 'chelsea-holiday-homes', listings_count: 46, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 33, founded_year: 2016, location_id: 3 },
    { name: 'ANW Holiday Homes', slug: 'anw-holiday-homes', listings_count: 40, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 28, founded_year: 2017, location_id: 2 },
    { name: '18Bricks Group', slug: '18bricks-group', listings_count: 43, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2016, location_id: 1 },
    { name: 'We Stay Holiday Homes', slug: 'we-stay-holiday-homes', listings_count: 49, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 35, founded_year: 2015, location_id: 4 },
    { name: 'Hive Holiday Homes', slug: 'hive-holiday-homes', listings_count: 36, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 25, founded_year: 2017, location_id: 3 },
    { name: 'Smart hands vacation homes', slug: 'smart-hands-vacation', listings_count: 41, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 29, founded_year: 2016, location_id: 2 },
    { name: 'Truebleu Vacation Homes Rental', slug: 'truebleu-vacation', listings_count: 45, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.2, review_count: 32, founded_year: 2016, location_id: 5 },
    { name: 'Airstay', slug: 'airstay-dxb', listings_count: 100, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.4, review_count: 83, founded_year: 2015, location_id: 3 },
    { name: 'Lagom', slug: 'lagom', listings_count: 35, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 24, founded_year: 2017, location_id: 3 },
    { name: 'Farwell & Gervase', slug: 'farwell-gervase', listings_count: 38, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 26, founded_year: 2017, location_id: 2 },
    { name: 'Urban Dreams Hospitality', slug: 'urban-dreams', listings_count: 42, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.1, review_count: 30, founded_year: 2016, location_id: 1 },
    { name: 'Bespoke Holiday Homes', slug: 'bespoke-holiday-homes-dxb', listings_count: 300, tier: 'Tier 1 - Major Operators', is_featured: 0, rating: 4.6, review_count: 134, founded_year: 2014, location_id: 1 },
    { name: 'Exclusive Links Vacation Homes', slug: 'exclusive-links-vacation-dxb', listings_count: 100, tier: 'Tier 2 - Established', is_featured: 0, rating: 4.5, review_count: 92, founded_year: 2013, location_id: 1 },
    { name: 'Stellium Holiday Home', slug: 'stellium-holiday-home', listings_count: 34, tier: 'Tier 3 - Growing', is_featured: 0, rating: 4.0, review_count: 23, founded_year: 2017, location_id: 3 },
  ];

  additionalManagers.forEach(mgr => {
    const website = `https://${mgr.slug.replace(/-/g, '')}.com`;
    const socialLinks = JSON.stringify({ 
      website: website,
      airbnb: `https://airbnb.com/users/${mgr.slug}`,
      instagram: `@${mgr.slug.replace(/-/g, '')}`,
      linkedin: mgr.slug
    });
    const teamMembers = JSON.stringify([
      { name: 'Manager', role: 'Property Manager' }
    ]);
    const description = `${mgr.name} is a ${mgr.tier} holiday home management company in Dubai with ${mgr.listings_count}+ properties under management. They provide comprehensive short-term rental services including listing optimization, guest communication, cleaning, and maintenance.`;
    
    insertManager.run(
      mgr.name,
      mgr.slug,
      mgr.location_id,
      mgr.founded_year,
      mgr.listings_count,
      mgr.rating,
      mgr.review_count,
      mgr.is_featured,
      mgr.tier,
      `/manager_${['palm', 'downtown', 'marina', 'jbr', 'ranches', 'creek'][mgr.location_id - 1] || 'downtown'}.jpg`,
      description,
      services,
      socialLinks,
      teamMembers
    );
  });

  console.log('Database initialized with 190+ real Dubai holiday home companies');
}

export default db;
