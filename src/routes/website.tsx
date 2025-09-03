import { Hono } from 'hono'
import { mainLayout } from '../templates/layout'
import { generateOrderNumber } from '../utils/auth'

type Bindings = {
  DB: D1Database
  KV: KVNamespace
}

export const websiteRoutes = new Hono<{ Bindings: Bindings }>()

// Homepage
websiteRoutes.get('/', async (c) => {
  const { DB } = c.env
  
  // Get settings
  const settings = {}
  const settingsResult = await DB.prepare('SELECT key, value FROM settings').all()
  settingsResult.results.forEach(row => {
    settings[row.key] = row.value
  })
  
  // Get hero slides
  const heroSlides = await DB.prepare('SELECT * FROM hero_slides WHERE active = 1 ORDER BY display_order').all()
  
  // Get all products (not just featured)
  const allProducts = await DB.prepare('SELECT * FROM products WHERE in_stock = 1').all()
  
  const content = `
    <!-- Hero Slider -->
    <div class="relative overflow-hidden">
      <div id="hero-slider" class="flex transition-transform duration-500">
        ${heroSlides.results.map((slide, index) => `
          <div class="hero-slider w-full flex-shrink-0 relative" style="background-image: url('${slide.image_url}');">
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent">
              <div class="container mx-auto px-4 h-full flex items-center">
                <div class="text-white max-w-lg">
                  ${slide.title ? `<h2 class="text-4xl md:text-5xl font-bold mb-4">${slide.title}</h2>` : ''}
                  ${slide.description ? `<p class="text-lg mb-6">${slide.description}</p>` : ''}
                  ${slide.link && slide.link !== '/' && slide.link !== '' ? `<a href="${slide.link}" class="btn-primary px-6 py-3 rounded-lg inline-block">${slide.link.startsWith('http') ? 'Learn More' : 'Shop Now'}</a>` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      ${heroSlides.results.length > 1 ? `
        <button onclick="prevSlide()" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button onclick="nextSlide()" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/30">
          <i class="fas fa-chevron-right"></i>
        </button>
      ` : ''}
    </div>

    <!-- Features Section -->
    <section class="py-12 bg-white">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-award text-3xl text-orange-500"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">MADE TO ORDER FRESHNESS</h3>
            <p class="text-gray-600 text-sm">All our products are manufactured only after an order is received ensuring true freshness</p>
          </div>
          <div class="text-center">
            <div class="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-mortar-pestle text-3xl text-blue-500"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">TRADITIONAL STONE MILLING</h3>
            <p class="text-gray-600 text-sm">We embrace the age-old technique of stone-milling to retain maximum nutritional value</p>
          </div>
          <div class="text-center">
            <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-truck text-3xl text-green-500"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">FRESHLY DELIVERED IN 24 HOURS</h3>
            <p class="text-gray-600 text-sm">All our products are freshly packed and delivered to customer's doorstep in 24 hours</p>
          </div>
        </div>
      </div>
    </section>

    <!-- All Products -->
    <section class="py-12">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-8">Shop From Our Premium Range</h2>
        <p class="text-center text-gray-600 mb-12">Discover our carefully curated selection of traditional Indian products</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          ${allProducts.results.map(product => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              ${product.in_stock ? '<span class="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded text-sm">In Stock</span>' : ''}
              <img src="${product.image_url || 'https://via.placeholder.com/300x300'}" alt="${product.name}" class="w-full h-64 object-cover">
              <div class="p-6">
                <h3 class="font-bold text-xl mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-4">${product.description || 'Premium quality product'}</p>
                <div class="flex items-center justify-between mb-4">
                  <span class="text-2xl font-bold text-orange-500">₹${product.price}/${product.unit}</span>
                </div>
                <div class="space-y-2">
                  <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}', '1${product.unit}')" 
                          class="w-full btn-primary py-3 rounded-lg flex items-center justify-center">
                    <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
                  </button>
                  <a href="/products/${product.id}" class="block w-full text-center py-3 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 transition">
                    View Details
                  </a>
                  <button onclick="bulkOrder('${product.id}')" class="w-full bg-green-500 text-white py-3 rounded-lg flex items-center justify-center hover:bg-green-600 transition">
                    <i class="fas fa-boxes mr-2"></i> Bulk Order
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">Experience India's Finest Traditional Products</h2>
        <p class="text-lg mb-8">From our kitchen to yours - taste the difference of authentic, stone-milled products made with centuries-old techniques</p>
        <div class="flex flex-col md:flex-row gap-4 justify-center">
          <a href="/products" class="bg-white text-orange-500 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
            <i class="fas fa-shopping-cart mr-2"></i> Start Shopping
          </a>
          <button onclick="bulkOrder()" class="bg-transparent border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-orange-500 transition">
            <i class="fas fa-boxes mr-2"></i> Bulk Orders
          </button>
        </div>
      </div>
    </section>
  `

  const scripts = `
    <script>
      let currentSlide = 0;
      const slides = document.querySelectorAll('#hero-slider > div');
      const totalSlides = ${heroSlides.results.length};
      
      function showSlide(index) {
        if (totalSlides > 0) {
          currentSlide = (index + totalSlides) % totalSlides;
          document.getElementById('hero-slider').style.transform = \`translateX(-\${currentSlide * 100}%)\`;
        }
      }
      
      function nextSlide() { showSlide(currentSlide + 1); }
      function prevSlide() { showSlide(currentSlide - 1); }
      
      // Auto-slide every 5 seconds
      if (totalSlides > 1) {
        setInterval(nextSlide, 5000);
      }
      
      function bulkOrder(productId = '') {
        const message = productId ? 
          'I would like to place a bulk order for product ID: ' + productId :
          'I would like to inquire about bulk orders';
        window.open('https://wa.me/91${settings.whatsapp_number || '9631816666'}?text=' + encodeURIComponent(message), '_blank');
      }
    </script>
  `

  return c.html(mainLayout(settings, content, scripts))
})

// Products page
websiteRoutes.get('/products', async (c) => {
  const { DB } = c.env
  
  const settings = {}
  const settingsResult = await DB.prepare('SELECT key, value FROM settings').all()
  settingsResult.results.forEach(row => {
    settings[row.key] = row.value
  })
  
  const products = await DB.prepare('SELECT * FROM products WHERE in_stock = 1').all()
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">All Products</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${products.results.map(product => `
          <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            <img src="${product.image_url || 'https://via.placeholder.com/300x300'}" alt="${product.name}" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="font-bold text-lg mb-2">${product.name}</h3>
              <p class="text-gray-600 text-sm mb-3">${product.description || 'Premium quality product'}</p>
              <div class="flex items-center justify-between mb-3">
                <span class="text-xl font-bold text-orange-500">₹${product.price}/${product.unit}</span>
              </div>
              <button onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.image_url}')" 
                      class="w-full btn-primary py-2 rounded-lg text-sm">
                <i class="fas fa-cart-plus mr-2"></i> Add to Cart
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  return c.html(mainLayout(settings, content))
})

// Cart page
websiteRoutes.get('/cart', async (c) => {
  const { DB } = c.env
  
  const settings = {}
  const settingsResult = await DB.prepare('SELECT key, value FROM settings').all()
  settingsResult.results.forEach(row => {
    settings[row.key] = row.value
  })
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Your Shopping Cart</h1>
      
      <div id="cart-container" class="bg-white rounded-lg shadow-lg p-6">
        <!-- Cart items will be loaded here by JavaScript -->
      </div>
    </div>
    
    <script>
      function loadCart() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const container = document.getElementById('cart-container');
        
        if (cart.length === 0) {
          container.innerHTML = \`
            <div class="text-center py-12">
              <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
              <h2 class="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h2>
              <p class="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet</p>
              <a href="/products" class="btn-primary px-6 py-3 rounded-lg inline-block">
                Start Shopping
              </a>
            </div>
          \`;
        } else {
          let total = 0;
          let itemsHtml = '<div class="space-y-4">';
          
          cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            itemsHtml += \`
              <div class="flex items-center space-x-4 border-b pb-4">
                <img src="\${item.image || 'https://via.placeholder.com/100x100'}" alt="\${item.name}" class="w-20 h-20 object-cover rounded">
                <div class="flex-1">
                  <h3 class="font-bold">\${item.name}</h3>
                  <p class="text-gray-600">₹\${item.price} x \${item.quantity} = ₹\${itemTotal}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <button onclick="updateQuantity(\${index}, -1)" class="bg-gray-200 px-3 py-1 rounded">-</button>
                  <span class="px-3">\${item.quantity}</span>
                  <button onclick="updateQuantity(\${index}, 1)" class="bg-gray-200 px-3 py-1 rounded">+</button>
                </div>
                <button onclick="removeFromCart(\${index})" class="text-red-500 hover:text-red-700">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            \`;
          });
          
          itemsHtml += '</div>';
          itemsHtml += \`
            <div class="mt-6 pt-6 border-t">
              <div class="flex justify-between items-center mb-6">
                <span class="text-2xl font-bold">Total:</span>
                <span class="text-3xl font-bold text-orange-500">₹\${total}</span>
              </div>
              <div class="flex space-x-4">
                <a href="/products" class="flex-1 text-center py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Continue Shopping
                </a>
                <button onclick="checkout()" class="flex-1 btn-primary py-3 rounded-lg">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          \`;
          
          container.innerHTML = itemsHtml;
        }
      }
      
      function updateQuantity(index, change) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
          cart.splice(index, 1);
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
      }
      
      function removeFromCart(index) {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
        updateCartCount();
      }
      
      function checkout() {
        window.location.href = '/checkout';
      }
      
      loadCart();
    </script>
  `

  return c.html(mainLayout(settings, content))
})

// Checkout page
websiteRoutes.get('/checkout', async (c) => {
  const { DB } = c.env
  
  const settings = {}
  const settingsResult = await DB.prepare('SELECT key, value FROM settings').all()
  settingsResult.results.forEach(row => {
    settings[row.key] = row.value
  })
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Checkout</h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4">Delivery Information</h2>
          <form id="checkout-form" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Full Name *</label>
              <input type="text" name="name" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Email *</label>
              <input type="email" name="email" required class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Phone Number *</label>
              <input type="tel" name="phone" required pattern="[0-9]{10}" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500">
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Delivery Address *</label>
              <textarea name="address" required rows="3" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Payment Method</label>
              <select name="payment_method" class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500">
                <option value="cod">Cash on Delivery</option>
                <option value="online">Online Payment</option>
              </select>
            </div>
          </form>
        </div>
        
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold mb-4">Order Summary</h2>
          <div id="order-summary"></div>
        </div>
      </div>
    </div>
    
    <script>
      function loadOrderSummary() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const container = document.getElementById('order-summary');
        
        if (cart.length === 0) {
          window.location.href = '/cart';
          return;
        }
        
        let total = 0;
        let itemsHtml = '<div class="space-y-3 mb-4">';
        
        cart.forEach(item => {
          const itemTotal = item.price * item.quantity;
          total += itemTotal;
          
          itemsHtml += \`
            <div class="flex justify-between py-2 border-b">
              <span>\${item.name} x \${item.quantity}</span>
              <span>₹\${itemTotal}</span>
            </div>
          \`;
        });
        
        itemsHtml += '</div>';
        itemsHtml += \`
          <div class="pt-4 border-t">
            <div class="flex justify-between items-center mb-6">
              <span class="text-xl font-bold">Total Amount:</span>
              <span class="text-2xl font-bold text-orange-500">₹\${total}</span>
            </div>
            <button onclick="placeOrder()" class="w-full btn-primary py-3 rounded-lg">
              Place Order
            </button>
          </div>
        \`;
        
        container.innerHTML = itemsHtml;
      }
      
      async function placeOrder() {
        const form = document.getElementById('checkout-form');
        const formData = new FormData(form);
        
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) return;
        
        const orderData = {
          customer_name: formData.get('name'),
          customer_email: formData.get('email'),
          customer_phone: formData.get('phone'),
          customer_address: formData.get('address'),
          payment_method: formData.get('payment_method'),
          items: cart
        };
        
        try {
          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
          });
          
          const result = await response.json();
          
          if (result.success) {
            localStorage.removeItem('cart');
            alert('Order placed successfully! Order Number: ' + result.order_number);
            window.location.href = '/orders?order=' + result.order_number;
          } else {
            alert('Failed to place order. Please try again.');
          }
        } catch (error) {
          alert('Error placing order. Please try again.');
        }
      }
      
      loadOrderSummary();
    </script>
  `

  return c.html(mainLayout(settings, content))
})

// Orders page
websiteRoutes.get('/orders', async (c) => {
  const { DB } = c.env
  
  const settings = {}
  const settingsResult = await DB.prepare('SELECT key, value FROM settings').all()
  settingsResult.results.forEach(row => {
    settings[row.key] = row.value
  })
  
  const content = `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">My Orders</h1>
      
      <div class="bg-white rounded-lg shadow-lg p-6">
        <div class="mb-6">
          <label class="block text-sm font-medium mb-2">Enter Order Number or Email</label>
          <div class="flex space-x-2">
            <input type="text" id="order-search" placeholder="Order number or email" 
                   class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-orange-500">
            <button onclick="searchOrders()" class="btn-primary px-6 py-2 rounded-lg">
              Search
            </button>
          </div>
        </div>
        
        <div id="orders-container">
          <!-- Orders will be loaded here -->
        </div>
      </div>
    </div>
    
    <script>
      async function searchOrders() {
        const search = document.getElementById('order-search').value;
        if (!search) return;
        
        try {
          const response = await fetch('/api/orders/search?q=' + encodeURIComponent(search));
          const orders = await response.json();
          
          const container = document.getElementById('orders-container');
          
          if (orders.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No orders found</p>';
            return;
          }
          
          let html = '<div class="space-y-6">';
          
          orders.forEach(order => {
            const items = JSON.parse(order.items);
            const statusColors = {
              pending: 'bg-yellow-100 text-yellow-800',
              confirmed: 'bg-blue-100 text-blue-800',
              processing: 'bg-gray-100 text-gray-800',
              shipped: 'bg-orange-100 text-orange-800',
              delivered: 'bg-green-100 text-green-800',
              cancelled: 'bg-red-100 text-red-800'
            };
            
            html += \`
              <div class="border rounded-lg p-4">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="font-bold text-lg">Order #\${order.order_number}</h3>
                    <p class="text-sm text-gray-600">Placed on \${new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <span class="px-3 py-1 rounded-full text-sm font-medium \${statusColors[order.status] || 'bg-gray-100'}">
                    \${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                
                <div class="space-y-2 mb-4">
                  \${items.map(item => \`
                    <div class="flex justify-between text-sm">
                      <span>\${item.name} x \${item.quantity}</span>
                      <span>₹\${item.price * item.quantity}</span>
                    </div>
                  \`).join('')}
                </div>
                
                <div class="flex justify-between items-center pt-4 border-t">
                  <span class="font-bold">Total: ₹\${order.total_amount}</span>
                </div>
                
                <!-- Order tracking -->
                <div class="mt-6">
                  <div class="flex justify-between items-center">
                    \${['Confirmed', 'Processing', 'Shipped', 'Out For Delivery', 'Delivered'].map((step, index) => \`
                      <div class="flex flex-col items-center">
                        <div class="\${getStepStatus(order.status, step) ? 'bg-green-500' : 'bg-gray-300'} w-8 h-8 rounded-full flex items-center justify-center text-white">
                          \${getStepStatus(order.status, step) ? '✓' : ''}
                        </div>
                        <span class="text-xs mt-1">\${step}</span>
                      </div>
                      \${index < 4 ? '<div class="flex-1 h-1 bg-gray-300 mx-2"></div>' : ''}
                    \`).join('')}
                  </div>
                </div>
              </div>
            \`;
          });
          
          html += '</div>';
          container.innerHTML = html;
        } catch (error) {
          alert('Error searching orders');
        }
      }
      
      function getStepStatus(orderStatus, step) {
        const statusMap = {
          'Confirmed': ['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'],
          'Processing': ['processing', 'shipped', 'out_for_delivery', 'delivered'],
          'Shipped': ['shipped', 'out_for_delivery', 'delivered'],
          'Out For Delivery': ['out_for_delivery', 'delivered'],
          'Delivered': ['delivered']
        };
        
        return statusMap[step]?.includes(orderStatus) || false;
      }
      
      // Check if order parameter is present
      const urlParams = new URLSearchParams(window.location.search);
      const orderNumber = urlParams.get('order');
      if (orderNumber) {
        document.getElementById('order-search').value = orderNumber;
        searchOrders();
      }
    </script>
  `

  return c.html(mainLayout(settings, content))
})

export default websiteRoutes