# 🎬 QwikShow — Windows Setup Guide

---

## ✅ Prerequisites (Install These First)

| Tool | Download | Notes |
|------|----------|-------|
| **Node.js** (v18+) | https://nodejs.org | Choose LTS version |
| **XAMPP** | https://www.apachefriends.org | Includes MySQL |
| **Git** | https://git-scm.com | For cloning the repo |

---

## 📦 Step 1 — Clone the Repository

Open **PowerShell** and run:

```bash
git clone https://github.com/YOUR_USERNAME/cinebook.git
cd cinebook
```

---

## 🗄️ Step 2 — Start MySQL via XAMPP

1. Open **XAMPP Control Panel**
2. Start **MySQL** (Apache is optional)
3. Verify MySQL shows green status

---

## ⚙️ Step 3 — Configure Environment Files

**Backend:**
```powershell
copy backend\.env.example backend\.env
```

Open `backend\.env` and set:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          # leave blank for default XAMPP
DB_NAME=qwikshow
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_test_SdSsUCiCBYjwKr
RAZORPAY_KEY_SECRET=OZtlI3ID3cWJBgIXqy3c09Fw
TMDB_API_KEY=c0599f52a1af7d47f4d93554818ec884
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

**Frontend:**
```powershell
copy frontend\.env.example frontend\.env
```
> `frontend\.env` works as-is — no changes needed for local setup.

---

## 🏗️ Step 4 — Install Dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

---

## 🗃️ Step 5 — Set Up the Database

### ⚡ Option A — Fast Way (Recommended): Import the DB Dump

> Use this if you were given the `qwikshow_db.sql` file.
> It includes all tables, 194 movies, 30 theatres, cities, offers & admin user. **No seeding needed.**

**5a. Create the empty database:**
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS qwikshow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**5b. Import the dump:**
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root qwikshow < qwikshow_db.sql
```

Done! Skip to **Step 6**.

---

### 🔧 Option B — Manual Setup (Fresh Install)

**5a. Create the database:**
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "CREATE DATABASE IF NOT EXISTS qwikshow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**5b. Create all tables + seed admin:**
```powershell
cd backend
node init_db.js
```
Expected output:
```
Database initialized successfully!
Admin user seeded → admin@qwikshow.com / admin123
```

**5c. Seed 30 theatres (3 per city):**
```powershell
node seed_theatres.js
```

**5d. Seed 194 movies from TMDb** *(needs internet, ~4 mins)*:
```powershell
node seed_movies.js
```

---

## 🚀 Step 6 — Run the App

Open **two separate PowerShell terminals**:

**Terminal 1 — Backend:**
```powershell
cd backend
node server.js
```
> ✅ Runs on: http://localhost:5000

**Terminal 2 — Frontend:**
```powershell
cd frontend
npm run dev
```
> ✅ Runs on: http://localhost:5173

---

## 🔐 Default Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@qwikshow.com` |
| Password | `admin123` |

---

## 🎬 What's in the Database

| Data | Count |
|------|-------|
| Movies | 194 |
| &nbsp;&nbsp; Now Showing | 13 (blockbusters) |
| &nbsp;&nbsp; Coming Soon | 144 (admin can enable these) |
| &nbsp;&nbsp; Ended | ~37 (old classics) |
| Theatres | 30 (3 per city) |
| Cities | 10 |
| Offers | 3 (sample promo codes) |

> **Tip for Admin:** Go to Admin → Manage Movies → Edit any movie → change status to **Now Showing** to make it bookable.

---

## ❗ Troubleshooting

### `mysql` not recognized
Always use the full XAMPP path:
```powershell
& "C:\xampp\mysql\bin\mysql.exe" -u root -e "SHOW DATABASES;"
```

### Port 5000 already in use
```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### `node_modules` missing / errors
```powershell
# In backend/
Remove-Item -Recurse -Force node_modules
npm install

# In frontend/
Remove-Item -Recurse -Force node_modules
npm install
```

### MySQL access denied
Open XAMPP → MySQL → **Admin (phpMyAdmin)** → User Accounts → Set root password to blank.

---

## 📁 Project Structure

```
cinebook/
├── qwikshow_db.sql          ← DB dump (share this!)
├── SETUP.md                 ← this file
├── backend/
│   ├── .env                 ← your config (never commit!)
│   ├── .env.example         ← template to copy
│   ├── server.js            ← entry point
│   ├── init_db.js           ← creates all tables + admin
│   ├── seed_theatres.js     ← seeds 30 theatres
│   ├── seed_movies.js       ← seeds 194 movies from TMDb
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   └── utils/
└── frontend/
    ├── .env                 ← your config (never commit!)
    ├── .env.example         ← template to copy
    └── src/
```
