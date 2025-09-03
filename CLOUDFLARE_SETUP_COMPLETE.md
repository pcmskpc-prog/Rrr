# 🚀 CLOUDFLARE PAGES SETUP - COMPLETE GUIDE

## ⚠️ VERY IMPORTANT - Framework Preset Selection

### **Cloudflare Pages Import करते समय:**

#### **Step 1: Import Git Repository**
1. Cloudflare Dashboard → Pages → Create a project
2. "Connect to Git" select करें
3. GitHub account connect करें
4. Repository select करें: `Satyam-`

#### **Step 2: Framework Preset (MOST IMPORTANT)**
**Framework preset में `None` select करें!**

✅ **CORRECT Selection**: `None`
❌ **DO NOT Select**: React, Next.js, Vue, या कोई भी अन्य framework

**क्यों None?** - क्योंकि हमारा project Hono framework use करता है जो list में नहीं है

#### **Step 3: Build Configuration**
```
Build command: npm run build
Build output directory: dist
Root directory: /
```

#### **Step 4: Environment Variables (Optional)**
```
NODE_VERSION = 18
```

---

## 📋 **Complete Setup Process**

### **1. Cloudflare Dashboard Login**
```
https://dash.cloudflare.com
```

### **2. Pages Create करें**
1. Click "Pages" in sidebar
2. Click "Create a project"
3. Select "Connect to Git"

### **3. GitHub Connect करें**
1. "Connect GitHub account" पर click करें
2. Authorize करें
3. Repository select करें: `avinashrajmsk/Satyam-`

### **4. Build Settings (EXACT VALUES):**
```
Project name: satyam-gold
Production branch: main
Framework preset: None  ← VERY IMPORTANT!
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)
Environment variables:
  NODE_VERSION = 18
```

### **5. Advanced Settings (If needed):**
```
Node.js version: 18.x
```

### **6. Deploy करें**
Click "Save and Deploy"

---

## ✅ **Your Bindings Configuration is CORRECT**

आपने जो bindings add की हैं वो perfect हैं:
- ✅ **KV namespace**: `production-kv-data`
- ✅ **D1 database**: `satyam-gold-db`
- ✅ **R2 bucket**: `satyam-gold-images`

---

## 🗄️ **Database Setup Commands**

### **After First Deployment:**
```bash
# 1. Clone repository locally
git clone https://github.com/avinashrajmsk/Satyam-.git
cd Satyam-

# 2. Install dependencies
npm install

# 3. Login to Cloudflare
npx wrangler login

# 4. Apply database migrations
npx wrangler d1 migrations apply satyam-gold-db

# 5. Seed initial data
npx wrangler d1 execute satyam-gold-db --file=./seed.sql
```

---

## 📝 **Important Notes**

### **Hero Slider Size:**
- **Recommended**: 1920 x 400 pixels
- **Mobile**: Automatically resizes
- **Format**: JPG or PNG
- **Max file size**: 2MB per image

### **Product Display:**
- ✅ Homepage now shows ALL products (not just 3)
- ✅ No "View All" button needed
- ✅ Grid layout: 3 columns on desktop, 1 on mobile

### **Hero Slide Text:**
- ✅ Text is optional - admin can leave empty
- ✅ "Shop Now" button only shows if link is added
- ✅ No default text appears

### **Settings Save Error - FIXED:**
- ✅ D1_TYPE_ERROR fixed
- ✅ Color picker values properly converted to strings
- ✅ All settings now save correctly

---

## 🔧 **Troubleshooting**

### **If deployment fails:**
1. Check Framework preset is `None`
2. Check build command is `npm run build`
3. Check output directory is `dist`

### **If database errors:**
```bash
# Re-apply migrations
npx wrangler d1 migrations apply satyam-gold-db --remote

# Check database
npx wrangler d1 execute satyam-gold-db --command="SELECT * FROM products" --remote
```

### **If settings don't save:**
- Clear browser cache
- Check browser console for errors
- Verify D1 database binding is correct

---

## 🌐 **After Deployment URLs**

```
Main Site: https://satyam-gold.pages.dev
Admin Panel: https://satyam-gold.pages.dev/admin
Admin Login:
  Username: admin
  Password: admin123
```

---

## 📱 **Test Checklist**

- [ ] Homepage loads with products
- [ ] Hero slider works
- [ ] Cart functionality works
- [ ] Admin login works
- [ ] Products can be added/edited
- [ ] Settings save without error
- [ ] Hero slides can be updated
- [ ] Orders can be managed

---

## 🎯 **Quick Deploy Summary**

1. **Import Git**: Select `avinashrajmsk/Satyam-`
2. **Framework**: Select `None`
3. **Build**: `npm run build`
4. **Output**: `dist`
5. **Deploy**: Click deploy button

That's it! Your site will be live in 2-3 minutes.

---

**Support**: If any issues, check:
- Cloudflare Pages logs
- Browser console
- D1 database status