# CineBook — Windows Setup Guide (with XAMPP)

> This guide explains how to run CineBook on a **Windows laptop** using XAMPP for MySQL.

---

## What You Need

| Tool | What it does | Download |
|------|-------------|----------|
| **XAMPP** | Provides MySQL database | [apachefriends.org](https://www.apachefriends.org/download.html) |
| **Node.js** | Runs the backend + frontend | [nodejs.org](https://nodejs.org) → LTS version |
| **Git** | Clone the project | [git-scm.com](https://git-scm.com/download/win) |

> ⚠️ XAMPP comes with Apache and PHP too — you **don't need those**. Only **MySQL** from XAMPP is used.

---

## Step-by-Step Setup

### Step 1 — Install XAMPP

1. Download XAMPP from [apachefriends.org](https://www.apachefriends.org)
2. Run the installer → install to `C:\xampp` (default)
3. Open **XAMPP Control Panel** (`C:\xampp\xampp-control.exe`)
4. Click **Start** next to **MySQL** (Apache is not needed)
5. MySQL should show green — running on port `3306`

### Step 2 — Install Node.js

1. Download from [nodejs.org](https://nodejs.org) — pick **LTS**
2. Run the installer — tick "Add to PATH" when asked
3. Open **Command Prompt** and verify:
   ```
   node --version   → v18.x.x or higher
   npm --version    → v9.x.x or higher
   ```

### Step 3 — Install Git

1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Install with defaults
3. Verify: `git --version`

### Step 4 — Clone the Project

Open **Command Prompt** or **Git Bash**:

```bash
cd C:\Users\YourName\Documents
git clone https://github.com/inventor-biswa/cinebook.git
cd cinebook
```

### Step 5 — Set Up the Database

1. Open XAMPP Control Panel → click **Start** on MySQL
2. Open your browser → go to `http://localhost/phpmyadmin`
3. Click **New** (left sidebar) → create database named `cinebook` → click Create

Then run the database init script:

```bash
cd cinebook\backend
node scripts\init_db.js
```

This creates all tables and seeds the 5 default cities.

> **If `init_db.js` is not in `scripts/` folder** — run it directly:
> ```bash
> node init_db.js
> ```

### Step 6 — Configure Environment Variables

#### Backend — `cinebook\backend\.env`

Open with Notepad and update:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=          ← XAMPP MySQL default password is BLANK (leave empty)
DB_NAME=cinebook
JWT_SECRET=your_super_secret_jwt_key
RAZORPAY_KEY_ID=rzp_test_SN2rSt0kqwYV5S
RAZORPAY_KEY_SECRET=53fkOJ6LfajI6d7CNxR2Ig42
```

> ⚠️ XAMPP MySQL default user is `root` with **no password**. Leave `DB_PASSWORD=` empty.

#### Frontend — `cinebook\frontend\.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_SN2rSt0kqwYV5S
```

### Step 7 — Install Dependencies

Open **two Command Prompt windows**:

**Window 1 — Backend:**
```bash
cd C:\Users\YourName\Documents\cinebook\backend
npm install
```

**Window 2 — Frontend:**
```bash
cd C:\Users\YourName\Documents\cinebook\frontend
npm install
```

### Step 8 — Start the Project

Keep both Command Prompt windows open:

**Window 1 — Start Backend:**
```bash
cd cinebook\backend
node server.js
```
Expected output: `Server running on http://localhost:5000`

**Window 2 — Start Frontend:**
```bash
cd cinebook\frontend
npm run dev
```
Expected output: `Local: http://localhost:5173/`

### Step 9 — Open in Browser

```
http://localhost:5173
```

---

## Creating Your Admin Account

1. Register a new account at `http://localhost:5173/register`
2. Open phpMyAdmin: `http://localhost/phpmyadmin`
3. Click `cinebook` database → `users` table → **SQL** tab
4. Run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'youremail@example.com';
   ```
5. Log in again → you'll be redirected to `/admin` automatically

---

## Startup Routine (Every Time)

Every time you want to run the project:

```
1. Open XAMPP Control Panel → Start MySQL
2. Terminal 1: cd cinebook\backend  →  node server.js
3. Terminal 2: cd cinebook\frontend →  npm run dev
4. Browser: http://localhost:5173
```

---

## Common Windows Issues

| Problem | Fix |
|---------|-----|
| `npm` not found | Reinstall Node.js and tick "Add to PATH" |
| `ER_ACCESS_DENIED_ERROR` | Set `DB_PASSWORD=` (blank) in `.env` |
| MySQL won't start in XAMPP | Port 3306 already in use — check Task Manager for another MySQL process |
| `EADDRINUSE port 5000` | Another process using 5000 — change `PORT=5001` in `.env` and `VITE_API_BASE_URL=http://localhost:5001/api` |
| `git` not found | Restart terminal after installing Git |
| City dropdown empty | Backend not running — start it first |
| phpMyAdmin blank page | Start Apache in XAMPP (only needed for phpMyAdmin) |

---

## Folder Structure on Windows

```
C:\Users\YourName\Documents\cinebook\
├── backend\
│   ├── server.js        ← Run with: node server.js
│   ├── .env             ← DB and API keys
│   └── scripts\
│       └── init_db.js   ← Run once to create DB tables
└── frontend\
    ├── .env             ← Frontend API URL
    └── src\             ← React source code
```

---

## Summary Checklist

- [ ] XAMPP installed — MySQL started ✅
- [ ] Node.js v18+ installed ✅
- [ ] Project cloned from GitHub ✅
- [ ] `cinebook` database created in phpMyAdmin ✅
- [ ] `node scripts\init_db.js` run once ✅
- [ ] Both `.env` files configured ✅
- [ ] `npm install` in both `backend\` and `frontend\` ✅
- [ ] Backend running on port 5000 ✅
- [ ] Frontend running on port 5173 ✅
- [ ] Admin account created via phpMyAdmin SQL ✅
