export const mainLayout = (settings: any, content: string, scripts: string = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${settings.site_name || 'SATYAM GOLD'} - Premium Quality Products</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: ${settings.primary_color || '#ff8c42'};
            --secondary-color: ${settings.secondary_color || '#2c3e50'};
        }
        .btn-primary {
            background-color: var(--primary-color);
            color: white;
        }
        .btn-primary:hover {
            opacity: 0.9;
        }
        .text-primary { color: var(--primary-color); }
        .bg-primary { background-color: var(--primary-color); }
        .bg-secondary { background-color: var(--secondary-color); }
        .hero-slider {
            height: 400px;
            background-size: cover;
            background-position: center;
        }
        @media (max-width: 768px) {
            .hero-slider { height: 250px; }
        }
        .cart-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            background: red;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
        }
        .floating-whatsapp {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 999;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-50">
        <div class="container mx-auto px-4">
            <div class="flex items-center justify-between py-4">
                <!-- Logo -->
                <a href="/" class="flex items-center space-x-3">
                    ${settings.site_logo ? `<img src="${settings.site_logo}" alt="${settings.site_name}" class="h-12 w-12 rounded">` : ''}
                    <div>
                        <h1 class="text-xl font-bold text-primary">${settings.site_name || 'SATYAM GOLD'}</h1>
                        <p class="text-xs text-gray-600">Premium Quality Products</p>
                    </div>
                </a>
                
                <!-- Navigation -->
                <nav class="hidden md:flex space-x-6">
                    <a href="/" class="text-gray-700 hover:text-primary transition">Home</a>
                    <a href="/products" class="text-gray-700 hover:text-primary transition">Products</a>
                    <a href="/orders" class="text-gray-700 hover:text-primary transition">My Orders</a>
                    <a href="/contact" class="text-gray-700 hover:text-primary transition">Contact</a>
                </nav>
                
                <!-- Cart Icon -->
                <div class="flex items-center space-x-4">
                    <a href="/cart" class="relative">
                        <i class="fas fa-shopping-cart text-2xl text-gray-700 hover:text-primary transition"></i>
                        <span id="cart-count" class="cart-badge">0</span>
                    </a>
                    <button id="mobile-menu-btn" class="md:hidden">
                        <i class="fas fa-bars text-2xl text-gray-700"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t">
            <div class="container mx-auto px-4 py-4 space-y-3">
                <a href="/" class="block text-gray-700 hover:text-primary transition">Home</a>
                <a href="/products" class="block text-gray-700 hover:text-primary transition">Products</a>
                <a href="/orders" class="block text-gray-700 hover:text-primary transition">My Orders</a>
                <a href="/contact" class="block text-gray-700 hover:text-primary transition">Contact</a>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="min-h-screen">
        ${content}
    </main>

    <!-- Footer -->
    <footer class="bg-secondary text-white mt-12">
        <div class="container mx-auto px-4 py-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- About -->
                <div>
                    <h3 class="text-lg font-bold mb-4">About Us</h3>
                    <p class="text-sm text-gray-300">
                        We deliver the finest quality Atta, Sattu, and Besan directly to your doorstep. 
                        Made with traditional methods for authentic taste and nutrition.
                    </p>
                </div>
                
                <!-- Contact -->
                <div>
                    <h3 class="text-lg font-bold mb-4">Contact Us</h3>
                    <div class="space-y-2 text-sm text-gray-300">
                        <p><i class="fas fa-phone mr-2"></i> ${settings.phone_number || '9631816666'}</p>
                        <p><i class="fas fa-envelope mr-2"></i> ${settings.email || 'avinash@gmail.com'}</p>
                    </div>
                </div>
                
                <!-- Follow Us -->
                <div>
                    <h3 class="text-lg font-bold mb-4">Follow Us</h3>
                    <div class="flex space-x-4">
                        ${settings.facebook_url ? `<a href="${settings.facebook_url}" target="_blank" class="text-2xl hover:text-primary transition"><i class="fab fa-facebook"></i></a>` : ''}
                        ${settings.instagram_url ? `<a href="${settings.instagram_url}" target="_blank" class="text-2xl hover:text-primary transition"><i class="fab fa-instagram"></i></a>` : ''}
                        ${settings.whatsapp_number ? `<a href="https://wa.me/91${settings.whatsapp_number}" target="_blank" class="text-2xl hover:text-primary transition"><i class="fab fa-whatsapp"></i></a>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="border-t border-gray-600 mt-8 pt-6 text-center text-sm text-gray-400">
                ${settings.footer_text || '© 2024 SATYAM GOLD. All rights reserved. Delivering freshness to your doorstep.'}
            </div>
        </div>
    </footer>

    <!-- Floating WhatsApp Button -->
    ${settings.whatsapp_chat_url ? `
    <a href="${settings.whatsapp_chat_url}" target="_blank" class="floating-whatsapp">
        <img src="${settings.whatsapp_logo_url || 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg'}" 
             alt="WhatsApp" class="w-16 h-16 rounded-full shadow-lg">
    </a>
    ` : ''}

    <!-- Scripts -->
    <script>
        // Mobile menu toggle
        document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
            document.getElementById('mobile-menu').classList.toggle('hidden');
        });

        // Update cart count
        function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const count = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cart-count').textContent = count;
        }
        updateCartCount();

        // Add to cart function
        function addToCart(productId, name, price, image, weight = '1kg') {
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            const existingItem = cart.find(item => item.id === productId && item.weight === weight);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name,
                    price,
                    image,
                    weight,
                    quantity: 1
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            alert('Product added to cart!');
        }
    </script>
    ${scripts}
</body>
</html>
`