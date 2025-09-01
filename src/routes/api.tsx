import { Hono } from 'hono'
import { generateOrderNumber, generateId } from '../utils/auth'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
}

export const apiRoutes = new Hono<{ Bindings: Bindings }>()

// Place order
apiRoutes.post('/orders', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const {
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    payment_method,
    items
  } = body
  
  // Calculate total
  let totalAmount = 0
  items.forEach(item => {
    totalAmount += item.price * item.quantity
  })
  
  const orderId = generateId()
  const orderNumber = generateOrderNumber()
  
  try {
    await DB.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, customer_email, 
        customer_phone, customer_address, items, total_amount, 
        status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId,
      orderNumber,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      JSON.stringify(items),
      totalAmount,
      'pending',
      payment_method || 'cod'
    ).run()
    
    return c.json({
      success: true,
      order_number: orderNumber,
      order_id: orderId
    })
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Search orders
apiRoutes.get('/orders/search', async (c) => {
  const { DB } = c.env
  const query = c.req.query('q')
  
  if (!query) {
    return c.json([])
  }
  
  try {
    const orders = await DB.prepare(`
      SELECT * FROM orders 
      WHERE order_number = ? OR customer_email = ?
      ORDER BY created_at DESC
    `).bind(query, query).all()
    
    return c.json(orders.results)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Get products
apiRoutes.get('/products', async (c) => {
  const { DB } = c.env
  
  try {
    const products = await DB.prepare('SELECT * FROM products WHERE in_stock = 1').all()
    return c.json(products.results)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Get single product
apiRoutes.get('/products/:id', async (c) => {
  const { DB } = c.env
  const productId = c.req.param('id')
  
  try {
    const product = await DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first()
    if (!product) {
      return c.json({ error: 'Product not found' }, 404)
    }
    return c.json(product)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Upload image to R2
apiRoutes.post('/upload', async (c) => {
  const { R2 } = c.env
  
  try {
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    const key = `uploads/${Date.now()}-${file.name}`
    const arrayBuffer = await file.arrayBuffer()
    
    await R2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type
      }
    })
    
    // Generate public URL (this would need to be configured with your R2 public bucket)
    const url = `https://your-r2-bucket.com/${key}`
    
    return c.json({ success: true, url })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

export default apiRoutes