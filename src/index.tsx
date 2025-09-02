import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { nanoid } from 'nanoid'
import { hashPassword } from './utils/auth'

// Import routes
import { websiteRoutes } from './routes/website'
import { adminRoutes } from './routes/admin'
import { apiRoutes } from './routes/api'
import { adminApiRoutes } from './routes/admin-api'

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
    // Create all tables if they don't exist
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
      ['site_logo', 'https://via.placeholder.com/100x100/ff8c42/ffffff?text=SG'],
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

    // Insert sample products if none exist
    const productCount = await DB.prepare('SELECT COUNT(*) as count FROM products').first()
    if (productCount?.count === 0) {
      const sampleProducts = [
        {
          id: nanoid(),
          name: 'Premium Wheat Atta',
          description: 'Stone-milled whole wheat flour made from the finest quality wheat grains',
          category: 'Atta',
          price: 40,
          unit: 'kg',
          weight_options: JSON.stringify(['1kg', '5kg', '10kg']),
          image_url: 'https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Wheat+Atta',
          in_stock: 1,
          featured: 1
        },
        {
          id: nanoid(),
          name: 'Sattu',
          description: 'Premium quality roasted gram flour, rich in protein',
          category: 'Sattu',
          price: 60,
          unit: 'kg',
          weight_options: JSON.stringify(['500g', '1kg', '5kg']),
          image_url: 'https://via.placeholder.com/300x300/D2691E/FFFFFF?text=Sattu',
          in_stock: 1,
          featured: 1
        },
        {
          id: nanoid(),
          name: 'Besan',
          description: 'Fine quality gram flour perfect for all recipes',
          category: 'Besan',
          price: 80,
          unit: 'kg',
          weight_options: JSON.stringify(['500g', '1kg', '2kg']),
          image_url: 'https://via.placeholder.com/300x300/FFD700/333333?text=Besan',
          in_stock: 1,
          featured: 1
        },
        {
          id: nanoid(),
          name: 'Multi-Grain Atta',
          description: 'Healthy blend of multiple grains for enhanced nutrition',
          category: 'Atta',
          price: 65,
          unit: 'kg',
          weight_options: JSON.stringify(['1kg', '5kg']),
          image_url: 'https://via.placeholder.com/300x300/8B7355/FFFFFF?text=MultiGrain',
          in_stock: 1,
          featured: 0
        }
      ]

      for (const product of sampleProducts) {
        await DB.prepare(`
          INSERT INTO products (id, name, description, category, price, unit, weight_options, image_url, in_stock, featured)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          product.id,
          product.name,
          product.description,
          product.category,
          product.price,
          product.unit,
          product.weight_options,
          product.image_url,
          product.in_stock,
          product.featured
        ).run()
      }
    }

    // Insert sample hero slide if none exist
    const slideCount = await DB.prepare('SELECT COUNT(*) as count FROM hero_slides').first()
    if (slideCount?.count === 0) {
      await DB.prepare(`
        INSERT INTO hero_slides (id, image_url, title, description, link, display_order, active)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        nanoid(),
        'https://via.placeholder.com/1920x400/ff8c42/ffffff?text=Welcome+to+SATYAM+GOLD',
        'Premium Quality Products',
        'Delivering freshness to your doorstep',
        '/',
        1,
        1
      ).run()
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
app.route('/admin/api', adminApiRoutes)

// Default 404 handler
app.notFound((c) => {
  return c.text('404 - Page not found', 404)
})

// Error handler
app.onError((err, c) => {
  console.error(`${err}`)
  return c.text('Internal Server Error', 500)
})

export default app