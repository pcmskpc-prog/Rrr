import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { nanoid } from 'nanoid'
import { hashPassword } from './utils/auth'

// Import routes
import { websiteRoutes } from './routes/website'
import { adminRoutes } from './routes/admin'
import { apiRoutes } from './routes/api'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Initialize database on first request
app.use('*', async (c, next) => {
  const { DB } = c.env
  
  try {
    // Check if tables exist, if not create them
    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        unit TEXT NOT NULL DEFAULT 'kg',
        weight_options TEXT,
        image_url TEXT,
        in_stock INTEGER DEFAULT 1,
        featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_email TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_address TEXT NOT NULL,
        items TEXT NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_method TEXT DEFAULT 'cod',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    await DB.prepare(`
      CREATE TABLE IF NOT EXISTS hero_slides (
        id TEXT PRIMARY KEY,
        image_url TEXT NOT NULL,
        title TEXT,
        description TEXT,
        link TEXT,
        display_order INTEGER DEFAULT 0,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // Insert default admin if not exists
    const adminCheck = await DB.prepare(`SELECT id FROM admin_users WHERE username = ?`).bind('admin').first()
    if (!adminCheck) {
      const hashedPassword = await hashPassword('admin123')
      await DB.prepare(`
        INSERT INTO admin_users (id, username, password_hash) 
        VALUES (?, ?, ?)
      `).bind(nanoid(), 'admin', hashedPassword).run()
    }

    // Insert default settings if not exist
    const defaultSettings = [
      ['site_name', 'SATYAM GOLD'],
      ['site_logo', 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/04925dbc9_1000012467.png'],
      ['primary_color', '#ff8c42'],
      ['secondary_color', '#2c3e50'],
      ['footer_text', '© 2024 SATYAM GOLD. All rights reserved. Delivering freshness to your doorstep.'],
      ['phone_number', '9631816666'],
      ['whatsapp_number', '9631816666'],
      ['email', 'avinash@gmail.com'],
      ['whatsapp_chat_url', 'https://wa.me/916201530654']
    ]

    for (const [key, value] of defaultSettings) {
      const existing = await DB.prepare(`SELECT key FROM settings WHERE key = ?`).bind(key).first()
      if (!existing) {
        await DB.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)`).bind(key, value).run()
      }
    }
  } catch (error) {
    console.error('Database initialization error:', error)
  }

  await next()
})

// Mount routes
app.route('/', websiteRoutes)
app.route('/api', apiRoutes)
app.route('/admin', adminRoutes)

export default app