# 🚀 CLOUDFLARE DEPLOYMENT GUIDE - SATYAM GOLD

## ⚠️ IMPORTANT: सभी Steps को ध्यान से Follow करें

---

## 📋 **STEP 1: Cloudflare Account Setup**

### 1.1 Account बनाएं
1. https://dash.cloudflare.com पर जाएं
2. "Sign Up" पर click करें
3. Email और Password डालकर account बनाएं
4. Email verify करें

### 1.2 Dashboard में Login करें
- Login करने के बाद आप Cloudflare Dashboard में पहुंच जाएंगे

---

## 🔑 **STEP 2: API Token Generate करें**

### 2.1 API Token Page पर जाएं
1. Dashboard के top-right corner में Profile icon पर click करें
2. "My Profile" select करें
3. Left sidebar में "API Tokens" पर click करें

### 2.2 Create Token
1. "Create Token" button पर click करें
2. "Custom token" select करें और "Get started" पर click करें
3. Token name: `Satyam Gold Deployment`
4. Permissions add करें:
   - **Account** → `Cloudflare Pages:Edit`
   - **Account** → `Cloudflare Pages:Read`
   - **Account** → `D1:Edit`
   - **Account** → `Workers KV Storage:Edit`
   - **Account** → `Workers R2 Storage:Edit`
5. "Continue to summary" → "Create Token"
6. **Token को COPY करके SAFE रखें** (यह दोबारा नहीं दिखेगा!)

---

## 💻 **STEP 3: Local Setup (आपके Computer पर)**

### 3.1 Code Download करें
```bash
# GitHub से code clone करें
git clone https://github.com/avinashrajmsk/W.git satyam-gold
cd satyam-gold

# Dependencies install करें
npm install
```

### 3.2 Wrangler CLI Install करें
```bash
# Global install (एक बार)
npm install -g wrangler

# Check version
wrangler --version
```

### 3.3 API Token Setup करें
```bash
# Method 1: Direct login with token
export CLOUDFLARE_API_TOKEN="your-api-token-here"

# Method 2: Interactive login
wrangler login
# Browser open होगा, authorize करें
```

---

## 🗄️ **STEP 4: D1 Database Setup (Production)**

### 4.1 Database Create करें
```bash
# Production database बनाएं
npx wrangler d1 create satyamgold-production

# Output example:
# ✅ Successfully created DB 'satyamgold-production' in region APAC
# Created your new D1 database.
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "satyamgold-production"
# database_id = "abc123-def456-ghi789"  <-- COPY THIS ID
```

### 4.2 wrangler.jsonc Update करें
```jsonc
// wrangler.jsonc file में database_id update करें
{
  "name": "satyam-gold",
  "compatibility_date": "2024-01-01",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "satyamgold-production",
      "database_id": "YOUR-DATABASE-ID-HERE"  // <-- Paste यहाँ
    }
  ]
}
```

### 4.3 Database Migrations Apply करें
```bash
# Production database में tables create करें
npx wrangler d1 migrations apply satyamgold-production

# Initial data seed करें (optional)
npx wrangler d1 execute satyamgold-production --file=./seed.sql
```

---

## 📦 **STEP 5: KV और R2 Storage Setup (Optional)**

### 5.1 KV Namespace (Session Storage)
```bash
# KV namespace create करें
npx wrangler kv:namespace create "satyam_kv"

# Output ID को wrangler.jsonc में add करें
```

### 5.2 R2 Bucket (Image Storage)
```bash
# R2 bucket create करें
npx wrangler r2 bucket create satyam-images

# wrangler.jsonc में add करें
```

---

## 🌍 **STEP 6: Cloudflare Pages Deployment**

### 6.1 Project Create करें
```bash
# Pages project create करें
npx wrangler pages project create satyam-gold \
  --production-branch main \
  --compatibility-date 2024-01-01
```

### 6.2 Build करें
```bash
# Application build करें
npm run build

# dist folder create होगा
```

### 6.3 Deploy करें
```bash
# Production deploy
npx wrangler pages deploy dist --project-name satyam-gold

# Output:
# ✅ Deployment successful!
# 🔗 https://satyam-gold.pages.dev
# 🔗 https://abc123.satyam-gold.pages.dev
```

---

## 🔐 **STEP 7: Environment Variables Setup**

### 7.1 Cloudflare Dashboard में जाएं
1. https://dash.cloudflare.com → Pages
2. "satyam-gold" project select करें
3. "Settings" → "Environment variables"

### 7.2 Variables Add करें
```
ADMIN_PASSWORD = admin123
JWT_SECRET = your-secret-key-here
```

### 7.3 Bindings Setup (D1, KV, R2)
1. "Settings" → "Functions" → "Bindings"
2. Add bindings:
   - D1 Database: `DB` → Select `satyamgold-production`
   - KV Namespace: `KV` → Select your KV namespace
   - R2 Bucket: `R2` → Select your R2 bucket

---

## 🌐 **STEP 8: Custom Domain Setup (Optional)**

### 8.1 Domain Add करें
```bash
# Custom domain add करें
npx wrangler pages domain add satyamgold.com --project-name satyam-gold
```

### 8.2 DNS Settings
1. Cloudflare Dashboard → Pages → satyam-gold
2. "Custom domains" → "Set up a custom domain"
3. Follow DNS instructions

---

## ✅ **STEP 9: Testing और Verification**

### 9.1 URLs Check करें
- **Production URL**: https://satyam-gold.pages.dev
- **Admin Panel**: https://satyam-gold.pages.dev/admin
- **Admin Login**:
  - Username: `admin`
  - Password: `admin123`

### 9.2 Features Test करें
1. Homepage पर products check करें
2. Cart functionality test करें
3. Admin panel में login करें
4. Product add/edit करें
5. Settings update करें

---

## 🔄 **STEP 10: Future Updates**

### Code Update करने के लिए:
```bash
# Changes करें
git pull origin main
npm install

# Build और Deploy
npm run build
npx wrangler pages deploy dist --project-name satyam-gold
```

---

## ⚠️ **Common Issues और Solutions**

### Issue 1: Authentication Error
```bash
# Solution: Token re-generate करें
export CLOUDFLARE_API_TOKEN="new-token"
```

### Issue 2: Database Not Found
```bash
# Solution: Database ID check करें
npx wrangler d1 list
```

### Issue 3: Deploy Failed
```bash
# Solution: Build clean करें
rm -rf dist .wrangler
npm run build
npx wrangler pages deploy dist --project-name satyam-gold
```

### Issue 4: Admin Panel Not Working
- Database migrations check करें
- Browser console में errors check करें
- PM2 logs check करें (local)

---

## 📞 **Support और Help**

### Resources:
- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **D1 Docs**: https://developers.cloudflare.com/d1

### Commands Summary:
```bash
# Quick Deploy Commands
npm install
npm run build
npx wrangler pages deploy dist --project-name satyam-gold

# Database Commands
npx wrangler d1 list
npx wrangler d1 migrations apply satyamgold-production
npx wrangler d1 execute satyamgold-production --command="SELECT * FROM products"

# Logs Check
npx wrangler pages deployment tail --project-name satyam-gold
```

---

## 🎯 **Final Checklist**

- [ ] Cloudflare account created
- [ ] API token generated और saved
- [ ] Wrangler CLI installed
- [ ] D1 database created
- [ ] Database ID in wrangler.jsonc updated
- [ ] Migrations applied
- [ ] Build successful
- [ ] Deployment successful
- [ ] Website accessible
- [ ] Admin panel working
- [ ] Products visible
- [ ] Cart functional
- [ ] Settings updatable

---

## 🚀 **Congratulations!**

आपकी SATYAM GOLD website अब Cloudflare Pages पर LIVE है!

**Live URLs:**
- Main Site: https://satyam-gold.pages.dev
- Admin Panel: https://satyam-gold.pages.dev/admin

**Note:** सभी changes admin panel से करने पर instantly live होंगे।

---