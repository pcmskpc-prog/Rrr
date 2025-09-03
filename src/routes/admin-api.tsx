import { Hono } from 'hono'
import { generateId, hashPassword } from '../utils/auth'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
}

export const adminApiRoutes = new Hono<{ Bindings: Bindings }>()

// Save all settings including hero slides
adminApiRoutes.post('/settings', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  try {
    // Save general settings
    const settings = body.settings || {}
    for (const [key, value] of Object.entries(settings)) {
      // Convert any values to string for D1 storage
      const stringValue = typeof value === 'string' ? value : String(value)
      
      if (stringValue !== null && stringValue !== undefined && stringValue !== '') {
        // Check if setting exists
        const existing = await DB.prepare('SELECT key FROM settings WHERE key = ?').bind(key).first()
        
        if (existing) {
          await DB.prepare('UPDATE settings SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = ?')
            .bind(stringValue, key).run()
        } else {
          await DB.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').bind(key, stringValue).run()
        }
      }
    }
    
    // Handle hero slides
    if (body.slides && Array.isArray(body.slides)) {
      // Delete all existing slides first
      await DB.prepare('DELETE FROM hero_slides').run()
      
      // Insert new slides
      let displayOrder = 1
      for (const slide of body.slides) {
        if (slide.image_url) {
          await DB.prepare(`
            INSERT INTO hero_slides (id, image_url, title, description, link, display_order, active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).bind(
            generateId(),
            slide.image_url || '',
            slide.title || '',
            slide.description || '',
            slide.link || '',
            displayOrder++,
            1
          ).run()
        }
      }
    }
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Settings save error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Create/Update product
adminApiRoutes.post('/products', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const id = body.id || generateId()
  const weightOptions = body.weight_options ? 
    (typeof body.weight_options === 'string' ? 
      JSON.stringify(body.weight_options.split(',').map(w => w.trim())) : 
      JSON.stringify(body.weight_options)) : null
  
  try {
    if (body.id) {
      // Update existing product
      await DB.prepare(`
        UPDATE products SET 
          name = ?, description = ?, category = ?, price = ?, 
          unit = ?, weight_options = ?, image_url = ?, 
          in_stock = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        body.name,
        body.description || '',
        body.category,
        body.price,
        body.unit || 'kg',
        weightOptions,
        body.image_url || '',
        body.in_stock ? 1 : 0,
        body.featured ? 1 : 0,
        body.id
      ).run()
    } else {
      // Create new product
      await DB.prepare(`
        INSERT INTO products (
          id, name, description, category, price, unit, 
          weight_options, image_url, in_stock, featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        body.name,
        body.description || '',
        body.category,
        body.price,
        body.unit || 'kg',
        weightOptions,
        body.image_url || '',
        body.in_stock ? 1 : 0,
        body.featured ? 1 : 0
      ).run()
    }
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Product save error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Update product
adminApiRoutes.put('/products/:id', async (c) => {
  const { DB } = c.env
  const productId = c.req.param('id')
  const body = await c.req.json()
  
  const weightOptions = body.weight_options ? 
    (typeof body.weight_options === 'string' ? 
      JSON.stringify(body.weight_options.split(',').map(w => w.trim())) : 
      JSON.stringify(body.weight_options)) : null
  
  try {
    await DB.prepare(`
      UPDATE products SET 
        name = ?, description = ?, category = ?, price = ?, 
        unit = ?, weight_options = ?, image_url = ?, 
        in_stock = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.name,
      body.description || '',
      body.category,
      body.price,
      body.unit || 'kg',
      weightOptions,
      body.image_url || '',
      body.in_stock ? 1 : 0,
      body.featured ? 1 : 0,
      productId
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Product update error:', error)
    return c.json({ error: error.message }, 500)
  }
})

// Delete product
adminApiRoutes.delete('/products/:id', async (c) => {
  const { DB } = c.env
  const productId = c.req.param('id')
  
  try {
    await DB.prepare('DELETE FROM products WHERE id = ?').bind(productId).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Update order status
adminApiRoutes.put('/orders/:id', async (c) => {
  const { DB } = c.env
  const orderId = c.req.param('id')
  const { status } = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `).bind(status, orderId).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Change admin password
adminApiRoutes.post('/change-password', async (c) => {
  const { DB } = c.env
  const { password } = await c.req.json()
  
  if (!password || password.length < 6) {
    return c.json({ error: 'Password must be at least 6 characters' }, 400)
  }
  
  const hashedPassword = await hashPassword(password)
  
  try {
    await DB.prepare(`
      UPDATE admin_users SET password_hash = ? WHERE username = ?
    `).bind(hashedPassword, 'admin').run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete hero slide
adminApiRoutes.delete('/slides/:id', async (c) => {
  const { DB } = c.env
  const slideId = c.req.param('id')
  
  try {
    await DB.prepare('DELETE FROM hero_slides WHERE id = ?').bind(slideId).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Upload image
adminApiRoutes.post('/upload', async (c) => {
  const { R2 } = c.env
  
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    const key = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const arrayBuffer = await file.arrayBuffer()
    
    await R2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    // Return the R2 public URL (you'll need to configure this in Cloudflare)
    const url = `https://your-r2-bucket.r2.dev/${key}`
    
    return c.json({ success: true, url })
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: error.message }, 500)
  }
})

export default adminApiRoutes