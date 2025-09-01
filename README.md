# SATYAM GOLD - E-Commerce Platform

## Project Overview
- **Name**: SATYAM GOLD
- **Goal**: Premium quality Atta, Sattu, and Besan e-commerce platform with complete admin management
- **Features**: 
  - Product catalog with categories
  - Shopping cart functionality
  - Order management system
  - Admin panel (separate URL)
  - WhatsApp integration
  - Hero slider management
  - Responsive design

## URLs
- **Main Website**: https://3000-iz99lnktjjnn0v2nffudw-6532622b.e2b.dev
- **Admin Panel**: https://3000-iz99lnktjjnn0v2nffudw-6532622b.e2b.dev/admin
- **Admin Login**: https://3000-iz99lnktjjnn0v2nffudw-6532622b.e2b.dev/admin/login
  - Username: `admin`
  - Password: `admin123`

## Currently Completed Features
✅ Complete website with homepage, products, cart, checkout
✅ Admin panel with separate URL
✅ Product management (add/edit/delete)
✅ Order management with status tracking
✅ Site settings management
✅ Hero slider configuration
✅ Social media links management
✅ WhatsApp integration
✅ Image URL and upload support
✅ Responsive design
✅ Local D1 database setup

## Functional Entry Points

### Main Website Routes
- `/` - Homepage with hero slider and featured products
- `/products` - All products listing
- `/products/:id` - Individual product details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order tracking page

### Admin Panel Routes
- `/admin` - Dashboard with statistics
- `/admin/login` - Admin login page
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/settings` - Site settings and customization

### API Endpoints
- `POST /api/orders` - Place new order
- `GET /api/orders/search?q=` - Search orders by number or email
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/upload` - Upload image to R2 storage

### Admin API Endpoints
- `POST /admin/api/products` - Create product
- `PUT /admin/api/products/:id` - Update product
- `DELETE /admin/api/products/:id` - Delete product
- `PUT /admin/api/orders/:id` - Update order status
- `POST /admin/api/settings` - Update site settings
- `POST /admin/api/change-password` - Change admin password
- `DELETE /admin/api/slides/:id` - Delete hero slide

## Data Architecture
- **Database**: Cloudflare D1 (SQLite)
- **Storage Services**: 
  - D1 Database for products, orders, settings
  - KV for session management
  - R2 for image uploads
- **Data Models**:
  - Products (name, price, category, images)
  - Orders (customer info, items, status)
  - Settings (site configuration)
  - Admin users (authentication)
  - Hero slides (homepage banners)

## User Guide

### For Customers
1. Browse products on homepage or products page
2. Add items to cart with "Add to Cart" button
3. View cart and adjust quantities
4. Proceed to checkout
5. Fill delivery information
6. Place order (Cash on Delivery)
7. Track order using order number or email

### For Admin
1. Login at `/admin/login` with credentials
2. **Product Management**: Add, edit, delete products with images
3. **Order Management**: View orders and update status (Pending → Confirmed → Processing → Shipped → Delivered)
4. **Site Settings**: 
   - Update site name and logo
   - Manage hero slider images
   - Configure contact information
   - Set social media links
   - Customize colors and footer text

## Tech Stack
- **Framework**: Hono (lightweight web framework)
- **Runtime**: Cloudflare Workers/Pages
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **Icons**: Font Awesome
- **Build Tool**: Vite
- **Process Manager**: PM2

## Development Commands
```bash
# Install dependencies
npm install

# Build application
npm run build

# Start development server (with PM2)
pm2 start ecosystem.config.cjs

# Apply database migrations
npm run db:init

# Seed database with sample data
npm run db:seed

# Clean port 3000
npm run clean-port

# Check logs
pm2 logs satyam-gold --nostream

# Stop server
pm2 delete all
```

## Deployment Status
- **Platform**: Cloudflare Pages (ready for deployment)
- **Status**: ✅ Active (Local Development)
- **Environment**: Sandbox with PM2
- **Last Updated**: August 22, 2025

## Features Not Yet Implemented
- Payment gateway integration (currently COD only)
- Email notifications
- Customer accounts/login
- Product reviews and ratings
- Advanced search and filters
- Inventory management
- Analytics dashboard

## Recommended Next Steps
1. Deploy to Cloudflare Pages production
2. Configure custom domain
3. Add payment gateway (Razorpay/Stripe)
4. Implement email notifications
5. Add customer authentication
6. Enhance mobile app experience
7. Add product variants (size/weight options)
8. Implement promotional offers/coupons
9. Add multi-language support
10. Set up automated backups