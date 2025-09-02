import { Hono } from 'hono'
import { adminLayout } from '../templates/admin-layout'
import { verifyPassword, hashPassword, generateId } from '../utils/auth'
import { adminSettingsScript } from './admin-settings'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
  R2: R2Bucket
}

export const adminRoutes = new Hono<{ Bindings: Bindings }>()

// Admin login page
adminRoutes.get('/login', async (c) => {
  const content = `
    <div class="max-w-md mx-auto mt-20">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        <form id="login-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Username</label>
            <input type="text" name="username" required 
                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500">
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Password</label>
            <input type="password" name="password" required 
                   class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500">
          </div>
          <button type="submit" class="w-full btn-admin py-3 rounded-lg">
            Login
          </button>
        </form>
        <p class="text-sm text-gray-600 mt-4 text-center">
          Default: username: admin, password: admin123
        </p>
      </div>
    </div>
    
    <script>
      document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const response = await fetch('/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.get('username'),
            password: formData.get('password')
          })
        });
        
        const result = await response.json();
        if (result.success) {
          localStorage.setItem('admin_token', result.token);
          window.location.href = '/admin';
        } else {
          alert('Invalid credentials');
        }
      });
    </script>
  `
  
  return c.html(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Admin Login - SATYAM GOLD</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        .btn-admin {
          background: #ff8c42;
          color: white;
        }
      </style>
    </head>
    <body class="bg-gray-100">
      ${content}
    </body>
    </html>
  `)
})

// Admin authentication
adminRoutes.post('/auth', async (c) => {
  const { DB } = c.env
  const { username, password } = await c.req.json()
  
  try {
    const admin = await DB.prepare('SELECT * FROM admin_users WHERE username = ?').bind(username).first()
    
    if (admin && await verifyPassword(password, admin.password_hash)) {
      // Generate simple token (in production, use JWT)
      const token = btoa(`${username}:${Date.now()}`)
      return c.json({ success: true, token })
    }
    
    return c.json({ success: false }, 401)
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// Admin dashboard
adminRoutes.get('/', async (c) => {
  const { DB } = c.env
  
  // Get statistics
  const orders = await DB.prepare('SELECT COUNT(*) as count FROM orders').first()
  const products = await DB.prepare('SELECT COUNT(*) as count FROM products').first()
  const pendingOrders = await DB.prepare('SELECT COUNT(*) as count FROM orders WHERE status = ?').bind('pending').first()
  
  const content = `
    <div>
      <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <p class="text-gray-600 mb-8">Manage your store, products, and settings.</p>
      
      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600">Total Orders</p>
              <p class="text-3xl font-bold">${orders?.count || 0}</p>
            </div>
            <i class="fas fa-shopping-bag text-4xl text-orange-500"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600">Total Products</p>
              <p class="text-3xl font-bold">${products?.count || 0}</p>
            </div>
            <i class="fas fa-box text-4xl text-blue-500"></i>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600">Pending Orders</p>
              <p class="text-3xl font-bold">${pendingOrders?.count || 0}</p>
            </div>
            <i class="fas fa-clock text-4xl text-yellow-500"></i>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/admin/orders" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <i class="fas fa-shopping-bag text-3xl text-orange-500 mb-4"></i>
          <h3 class="font-bold text-lg">Orders</h3>
          <p class="text-gray-600">View and manage orders</p>
        </a>
        
        <a href="/admin/products" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <i class="fas fa-box text-3xl text-blue-500 mb-4"></i>
          <h3 class="font-bold text-lg">Products</h3>
          <p class="text-gray-600">Manage your products</p>
        </a>
        
        <a href="/admin/settings" class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
          <i class="fas fa-cog text-3xl text-green-500 mb-4"></i>
          <h3 class="font-bold text-lg">Site Settings</h3>
          <p class="text-gray-600">Configure website settings</p>
        </a>
      </div>
    </div>
  `
  
  return c.html(adminLayout('Dashboard', content))
})

// Products management
adminRoutes.get('/products', async (c) => {
  const { DB } = c.env
  const products = await DB.prepare('SELECT * FROM products ORDER BY created_at DESC').all()
  
  const content = `
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Product Management</h1>
        <button onclick="addProduct()" class="btn-admin">
          <i class="fas fa-plus mr-2"></i> Add Product
        </button>
      </div>
      
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 space-y-4">
          ${products.results.map(product => `
            <div class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center space-x-4">
                <img src="${product.image_url || 'https://via.placeholder.com/60'}" 
                     alt="${product.name}" class="w-16 h-16 object-cover rounded">
                <div>
                  <h3 class="font-bold">${product.name}</h3>
                  <p class="text-sm text-gray-600">${product.weight_options || '1 weight options'}</p>
                </div>
              </div>
              <div class="flex space-x-2">
                <button onclick="editProduct('${product.id}')" class="p-2 text-blue-500 hover:bg-blue-50 rounded">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteProduct('${product.id}')" class="p-2 text-red-500 hover:bg-red-50 rounded">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Product Modal -->
    <div id="product-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6">Add/Edit Product</h2>
        <form id="product-form" class="space-y-4">
          <input type="hidden" name="product_id">
          
          <div>
            <label class="block text-sm font-medium mb-2">Product Name *</label>
            <input type="text" name="name" required class="w-full px-4 py-2 border rounded-lg">
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Description</label>
            <textarea name="description" rows="3" class="w-full px-4 py-2 border rounded-lg"></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Category *</label>
              <select name="category" required class="w-full px-4 py-2 border rounded-lg">
                <option value="Atta">Atta</option>
                <option value="Sattu">Sattu</option>
                <option value="Besan">Besan</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Price *</label>
              <input type="number" name="price" required min="0" step="0.01" class="w-full px-4 py-2 border rounded-lg">
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Unit</label>
              <select name="unit" class="w-full px-4 py-2 border rounded-lg">
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="pack">pack</option>
              </select>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Weight Options (comma separated)</label>
              <input type="text" name="weight_options" placeholder="500g, 1kg, 5kg" class="w-full px-4 py-2 border rounded-lg">
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-2">Image</label>
            <div class="space-y-2">
              <input type="url" name="image_url" placeholder="Image URL" class="w-full px-4 py-2 border rounded-lg">
              <p class="text-sm text-gray-600">OR</p>
              <input type="file" name="image_file" accept="image/*" class="w-full px-4 py-2 border rounded-lg">
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input type="checkbox" name="in_stock" checked class="mr-2">
              <span>In Stock</span>
            </label>
            
            <label class="flex items-center">
              <input type="checkbox" name="featured" class="mr-2">
              <span>Featured Product</span>
            </label>
          </div>
          
          <div class="flex space-x-4">
            <button type="submit" class="flex-1 btn-admin py-2 rounded-lg">Save Product</button>
            <button type="button" onclick="closeProductModal()" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </div>
    
    <script>
      function addProduct() {
        document.getElementById('product-form').reset();
        document.getElementById('product-modal').classList.remove('hidden');
      }
      
      function closeProductModal() {
        document.getElementById('product-modal').classList.add('hidden');
      }
      
      async function editProduct(id) {
        const response = await fetch('/api/products/' + id);
        const product = await response.json();
        
        const form = document.getElementById('product-form');
        form.product_id.value = product.id;
        form.name.value = product.name;
        form.description.value = product.description || '';
        form.category.value = product.category;
        form.price.value = product.price;
        form.unit.value = product.unit;
        form.weight_options.value = product.weight_options || '';
        form.image_url.value = product.image_url || '';
        form.in_stock.checked = product.in_stock;
        form.featured.checked = product.featured;
        
        document.getElementById('product-modal').classList.remove('hidden');
      }
      
      async function deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        const response = await fetch('/admin/api/products/' + id, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          location.reload();
        }
      }
      
      document.getElementById('product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const productData = {
          id: formData.get('product_id') || null,
          name: formData.get('name'),
          description: formData.get('description'),
          category: formData.get('category'),
          price: parseFloat(formData.get('price')),
          unit: formData.get('unit'),
          weight_options: formData.get('weight_options'),
          image_url: formData.get('image_url'),
          in_stock: formData.get('in_stock') ? 1 : 0,
          featured: formData.get('featured') ? 1 : 0
        };
        
        const method = productData.id ? 'PUT' : 'POST';
        const url = productData.id ? '/admin/api/products/' + productData.id : '/admin/api/products';
        
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        
        if (response.ok) {
          location.reload();
        }
      });
    </script>
  `
  
  return c.html(adminLayout('Products', content))
})

// Orders management
adminRoutes.get('/orders', async (c) => {
  const { DB } = c.env
  const orders = await DB.prepare('SELECT * FROM orders ORDER BY created_at DESC').all()
  
  const content = `
    <div>
      <h1 class="text-3xl font-bold mb-8">Order Management</h1>
      
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 space-y-4">
          ${orders.results.map(order => {
            const items = JSON.parse(order.items)
            return `
              <div class="border rounded-lg p-4">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-bold">Order #${order.order_number}</h3>
                    <p class="text-sm text-gray-600">${order.customer_name} - ${order.customer_email}</p>
                    <p class="text-xs text-gray-500">${new Date(order.created_at).toLocaleString()}</p>
                  </div>
                  <select onchange="updateOrderStatus('${order.id}', this.value)" 
                          class="px-4 py-2 border rounded-lg status-${order.status}">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="out_for_delivery" ${order.status === 'out_for_delivery' ? 'selected' : ''}>Out for Delivery</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                  </select>
                </div>
                
                <div class="text-sm">
                  <p class="font-semibold mb-2">Items:</p>
                  ${items.map(item => `
                    <p class="ml-4">${item.name} x ${item.quantity}</p>
                  `).join('')}
                </div>
                
                <div class="mt-4 pt-4 border-t flex justify-between">
                  <span class="font-bold">Total: ₹${order.total_amount}</span>
                  <button onclick="viewOrderDetails('${order.id}')" class="text-blue-500 hover:underline">
                    View Details
                  </button>
                </div>
              </div>
            `
          }).join('')}
        </div>
      </div>
    </div>
    
    <script>
      async function updateOrderStatus(orderId, status) {
        const response = await fetch('/admin/api/orders/' + orderId, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        
        if (response.ok) {
          alert('Order status updated');
          location.reload();
        }
      }
      
      function viewOrderDetails(orderId) {
        // In a real app, this would open a modal or navigate to details page
        alert('Order details for: ' + orderId);
      }
    </script>
  `
  
  return c.html(adminLayout('Orders', content))
})

// Site settings
adminRoutes.get('/settings', async (c) => {
  const { DB } = c.env
  const settings = {}
  const settingsResult = await DB.prepare('SELECT key, value FROM settings').all()
  settingsResult.results.forEach(row => {
    settings[row.key] = row.value
  })
  
  const heroSlides = await DB.prepare('SELECT * FROM hero_slides ORDER BY display_order').all()
  
  const content = `
    <div>
      <h1 class="text-3xl font-bold mb-8">Site Settings</h1>
      
      <div class="bg-white rounded-lg shadow p-6">
        <form id="settings-form" class="space-y-6">
          <!-- Website Branding -->
          <div>
            <h2 class="text-xl font-bold mb-4">Website Branding</h2>
            <p class="text-sm text-gray-600 mb-4">Customize your website's name and logo</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Site Name</label>
                <input type="text" name="site_name" value="${settings.site_name || ''}" 
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Logo</label>
                <div class="flex items-center space-x-4">
                  <input type="url" name="site_logo" value="${settings.site_logo || ''}" 
                         placeholder="https://base44.app/api/apps/68a375197577ce82d3f4980e/files/04925dbc9_1000012467.png"
                         class="flex-1 px-4 py-2 border rounded-lg">
                  <button type="button" class="text-blue-500">Upload</button>
                </div>
                ${settings.site_logo ? `
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 mb-2">Preview & Adjust</p>
                    <img src="${settings.site_logo}" alt="Logo" class="h-20 rounded">
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <!-- Hero Slider Images -->
          <div>
            <h2 class="text-xl font-bold mb-4">Hero Slider Images</h2>
            <p class="text-sm text-gray-600 mb-4">Manage the sliding images on your homepage (Recommended: 1920 x 1080 pixels)</p>
            
            <div id="hero-slides-container" class="space-y-4">
              ${heroSlides.results.map((slide, index) => `
                <div class="border rounded-lg p-4" data-slide-id="${slide.id}">
                  <div class="flex justify-between items-start mb-4">
                    <h3 class="font-medium">Hero Image ${index + 1}</h3>
                    <button type="button" onclick="deleteSlide('${slide.id}')" class="text-red-500">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                  <input type="url" name="slide_url_${slide.id}" value="${slide.image_url}" 
                         placeholder="Image URL (Required)"
                         class="w-full px-4 py-2 border rounded-lg mb-2">
                  ${slide.image_url ? `
                    <img src="${slide.image_url}" alt="Slide" class="h-32 rounded mb-2">
                  ` : ''}
                  <input type="text" name="slide_title_${slide.id}" value="${slide.title || ''}" 
                         placeholder="Title (optional)" class="w-full px-4 py-2 border rounded-lg mb-2">
                  <input type="text" name="slide_description_${slide.id}" value="${slide.description || ''}" 
                         placeholder="Description (optional)" class="w-full px-4 py-2 border rounded-lg mb-2">
                  <input type="text" name="slide_link_${slide.id}" value="${slide.link || '/'}" 
                         placeholder="Link URL (default: /)" class="w-full px-4 py-2 border rounded-lg">
                </div>
              `).join('')}
            </div>
            
            <button type="button" onclick="addHeroSlide()" class="mt-4 text-blue-500">
              <i class="fas fa-plus mr-2"></i> Add New Hero Image
            </button>
          </div>
          
          <!-- Contact Information -->
          <div>
            <h2 class="text-xl font-bold mb-4">Contact Information</h2>
            <p class="text-sm text-gray-600 mb-4">Update your contact details</p>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-2">Phone Number</label>
                <input type="tel" name="phone_number" value="${settings.phone_number || ''}" 
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">WhatsApp Number</label>
                <input type="tel" name="whatsapp_number" value="${settings.whatsapp_number || ''}" 
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Email Address</label>
                <input type="email" name="email" value="${settings.email || ''}" 
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Business Address</label>
                <input type="text" name="address" value="${settings.address || ''}" 
                       placeholder="Address"
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
            </div>
          </div>
          
          <!-- Social Media Links & Logos -->
          <div>
            <h2 class="text-xl font-bold mb-4">Social Media Links & Logos</h2>
            <p class="text-sm text-gray-600 mb-4">Add your social media profiles and upload custom logos</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Facebook Page URL</label>
                <input type="url" name="facebook_url" value="${settings.facebook_url || ''}" 
                       placeholder="16:9 aspect ratio"
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Instagram Profile URL</label>
                <input type="url" name="instagram_url" value="${settings.instagram_url || ''}" 
                       placeholder="16:9 aspect ratio"
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">WhatsApp Chat URL</label>
                <input type="url" name="whatsapp_chat_url" value="${settings.whatsapp_chat_url || ''}" 
                       placeholder="https://wa.me/916201530654"
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Custom WhatsApp Logo (Optional)</label>
                <div class="flex items-center space-x-4">
                  <input type="url" name="whatsapp_logo_url" value="${settings.whatsapp_logo_url || ''}" 
                         placeholder="https://base44.app/api/apps/68a375197577ce82d3f4980e/files/01a0a43b4_1000016121.png"
                         class="flex-1 px-4 py-2 border rounded-lg">
                  <button type="button" class="text-blue-500">Upload</button>
                </div>
                ${settings.whatsapp_logo_url ? `
                  <div class="mt-2">
                    <p class="text-sm text-gray-600 mb-2">Preview & Adjust</p>
                    <img src="${settings.whatsapp_logo_url}" alt="WhatsApp Logo" class="h-16 rounded">
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
          
          <!-- Website Customization -->
          <div>
            <h2 class="text-xl font-bold mb-4">Website Customization</h2>
            <p class="text-sm text-gray-600 mb-4">Customize colors and footer text</p>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">Primary Color</label>
                <div class="flex items-center space-x-2">
                  <input type="color" name="primary_color" value="${settings.primary_color || '#ff8c42'}" 
                         class="h-10 w-20">
                  <input type="text" value="${settings.primary_color || '#ff8c42'}" 
                         class="flex-1 px-4 py-2 border rounded-lg" readonly>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Secondary Color</label>
                <div class="flex items-center space-x-2">
                  <input type="color" name="secondary_color" value="${settings.secondary_color || '#2c3e50'}" 
                         class="h-10 w-20">
                  <input type="text" value="${settings.secondary_color || '#2c3e50'}" 
                         class="flex-1 px-4 py-2 border rounded-lg" readonly>
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-2">Footer Text</label>
                <input type="text" name="footer_text" value="${settings.footer_text || ''}" 
                       placeholder="© 2024 SATYAM GOLD. All rights reserved. Delivering freshness to your doorstep."
                       class="w-full px-4 py-2 border rounded-lg">
              </div>
            </div>
          </div>
          
          <!-- Security -->
          <div>
            <h2 class="text-xl font-bold mb-4">Security</h2>
            <p class="text-sm text-gray-600 mb-4">Manage admin panel password</p>
            
            <button type="button" onclick="changePassword()" class="btn-admin">
              Change Admin Password
            </button>
          </div>
          
          <button type="submit" class="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800">
            <i class="fas fa-save mr-2"></i> Save All Settings
          </button>
        </form>
      </div>
    </div>
    
    ${adminSettingsScript}
  `
  
  return c.html(adminLayout('Settings', content))
})

// Admin API routes
adminRoutes.post('/api/products', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const id = generateId()
  const weightOptions = body.weight_options ? JSON.stringify(body.weight_options.split(',').map(w => w.trim())) : null
  
  try {
    await DB.prepare(`
      INSERT INTO products (
        id, name, description, category, price, unit, 
        weight_options, image_url, in_stock, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      body.name,
      body.description,
      body.category,
      body.price,
      body.unit,
      weightOptions,
      body.image_url,
      body.in_stock,
      body.featured
    ).run()
    
    return c.json({ success: true, id })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

adminRoutes.put('/api/products/:id', async (c) => {
  const { DB } = c.env
  const productId = c.req.param('id')
  const body = await c.req.json()
  
  const weightOptions = body.weight_options ? JSON.stringify(body.weight_options.split(',').map(w => w.trim())) : null
  
  try {
    await DB.prepare(`
      UPDATE products SET 
        name = ?, description = ?, category = ?, price = ?, 
        unit = ?, weight_options = ?, image_url = ?, 
        in_stock = ?, featured = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      body.name,
      body.description,
      body.category,
      body.price,
      body.unit,
      weightOptions,
      body.image_url,
      body.in_stock,
      body.featured,
      productId
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

adminRoutes.delete('/api/products/:id', async (c) => {
  const { DB } = c.env
  const productId = c.req.param('id')
  
  try {
    await DB.prepare('DELETE FROM products WHERE id = ?').bind(productId).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

adminRoutes.put('/api/orders/:id', async (c) => {
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

adminRoutes.post('/api/settings', async (c) => {
  const { DB } = c.env
  const settings = await c.req.json()
  
  try {
    for (const [key, value] of Object.entries(settings)) {
      await DB.prepare(`
        INSERT INTO settings (key, value) VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP
      `).bind(key, value, value).run()
    }
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

adminRoutes.post('/api/change-password', async (c) => {
  const { DB } = c.env
  const { password } = await c.req.json()
  
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

adminRoutes.delete('/api/slides/:id', async (c) => {
  const { DB } = c.env
  const slideId = c.req.param('id')
  
  try {
    await DB.prepare('DELETE FROM hero_slides WHERE id = ?').bind(slideId).run()
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

adminRoutes.get('/logout', (c) => {
  return c.html(`
    <script>
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    </script>
  `)
})

export default adminRoutes