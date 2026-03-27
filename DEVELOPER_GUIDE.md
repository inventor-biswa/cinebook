# CineBook — Developer Guide

> A complete guide for setting up, running, and understanding the CineBook project.  
> Intended for developers and students working on this codebase on **Windows**.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Project Structure](#4-project-structure)
5. [First-Time Setup](#5-first-time-setup)
6. [Starting the Project](#6-starting-the-project)
7. [Creating an Admin Account](#7-creating-an-admin-account)
8. [Environment Variables](#8-environment-variables)
9. [Useful Commands](#9-useful-commands)
10. [Common Issues & Fixes](#10-common-issues--fixes)

---

## 1. Project Overview

**CineBook** is a full-stack movie and event booking platform.

- Users can browse movies and events, pick seats, and pay via Razorpay.
- Admins can manage movies, events, theatres, and show schedules.

---

## 2. Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React (Vite), React Router, Axios   |
| Backend   | Node.js, Express.js                 |
| Database  | MySQL                               |
| Auth      | JWT (JSON Web Tokens) + bcrypt      |
| Payments  | Razorpay                            |

---

## 3. Prerequisites

Make sure the following are installed on your Windows machine:

| Tool        | Minimum Version | Check with          | Download |
|-------------|-----------------|---------------------|----------|
| Node.js     | v18+            | `node --version`    | [nodejs.org](https://nodejs.org) |
| npm         | v9+             | `npm --version`     | Included with Node.js |
| MySQL       | v8+             | `mysql --version`   | [dev.mysql.com](https://dev.mysql.com/downloads/installer/) |

> ⚠️ After installing MySQL, make sure to add it to your **System PATH**:  
> `C:\Program Files\MySQL\MySQL Server 8.0\bin`  
> (Settings → System → Advanced → Environment Variables → Path)

---

## 4. Project Structure

```
Cinebook/
│
├── backend/                  ← Express API server
│   ├── server.js             ← Entry point
│   ├── .env                  ← Environment variables (secrets)
│   ├── config/
│   │   └── db.js             ← MySQL connection pool
│   ├── routes/               ← API route definitions
│   ├── controllers/          ← Business logic
│   ├── middleware/            ← Auth guards (verifyToken, isAdmin)
│   └── scripts/
│       └── init_db.js        ← Creates all tables + seeds cities
│
├── frontend/                 ← React app
│   ├── src/
│   │   ├── api/axios.js      ← Axios instance (auto-attaches JWT)
│   │   ├── context/          ← AuthContext, CityContext
│   │   ├── components/       ← Navbar, Footer, MovieCard, Layout
│   │   └── pages/            ← All page components
│   │       └── admin/        ← Admin-only pages
│   ├── .env                  ← Frontend env (Vite variables)
│   └── index.html
│
├── api_docs.md               ← Full backend API reference
├── Frontend_setup.md         ← Step-by-step frontend build log
└── DEVELOPER_GUIDE.md        ← This file
```

---

## 5. First-Time Setup

Follow these steps **once** when setting up on a new machine.

### Step 1 — Clone / Open the project

Open **PowerShell** or **Command Prompt** and navigate to your project folder:

```powershell
cd "D:\Thynx\College Projects\Cinebook"
```

### Step 2 — Set up the Database

Open the **MySQL Command Line Client** (installed with MySQL), or use **MySQL Workbench**.

In the MySQL CLI, it will ask for your root password. Then run the init script from PowerShell:

```powershell
cd backend
node scripts/init_db.js
```

This creates all tables and seeds 5 default cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad).

> 💡 To start MySQL if it's not running: open **Services** (press `Win + R`, type `services.msc`) and start **MySQL80**.  
> Or in PowerShell (run as Administrator):
> ```powershell
> net start MySQL80
> ```

### Step 3 — Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 4 — Configure Backend Environment

Check that `backend/.env` exists and has the correct values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=           # your MySQL root password (blank if none)
DB_NAME=cinebook
JWT_SECRET=your_secret_key
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
PORT=5000
```

### Step 5 — Install Frontend Dependencies

```powershell
cd frontend
npm install
```

### Step 6 — Configure Frontend Environment

Check that `frontend/.env` exists:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

> ⚠️ `VITE_RAZORPAY_KEY_ID` must match the key in `backend/.env`.  
> Get your test keys from [razorpay.com/dashboard](https://dashboard.razorpay.com/) → Settings → API Keys.

---

## 6. Starting the Project

You need **two PowerShell windows** — one for the backend, one for the frontend.

### Terminal 1 — Start the Backend

```powershell
cd "D:\Thynx\College Projects\Cinebook\backend"
node server.js
```

Expected output:
```
Server running on http://localhost:5000
```

### Terminal 2 — Start the Frontend

```powershell
cd "D:\Thynx\College Projects\Cinebook\frontend"
npm run dev
```

Expected output:
```
VITE v7.x.x  ready in ~800ms
➜  Local:   http://localhost:5173/
```

### Open in Browser

```
http://localhost:5173
```

> Both terminals must stay open while you use the app.

---

## 7. Creating an Admin Account

### Option A — Register + Promote via MySQL (Recommended)

**Step 1:** Register a new account through the app at `http://localhost:5173/register`

**Step 2:** Open MySQL CLI and promote that account to admin:

```powershell
mysql -u root -p cinebook
```

```sql
-- Check the user was created
SELECT user_id, name, email, role FROM users;

-- Promote to admin (replace the email with yours)
UPDATE users SET role = 'admin' WHERE email = 'youremail@example.com';

-- Verify
SELECT user_id, name, email, role FROM users;

EXIT;
```

**Step 3:** Log in again at `http://localhost:5173/login`

> After logging in as admin, you will be **automatically redirected to `/admin`** (the Admin Dashboard).

### Option B — Direct MySQL Insert

```sql
INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin User',
  'admin@cinebook.com',
  '$2b$10$REPLACE_WITH_BCRYPT_HASH',
  'admin'
);
```

> Use Option A — it's easier and the password is properly hashed.

---

## 8. Environment Variables

### Backend — `backend/.env`

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `DB_HOST`           | MySQL host (usually `localhost`)     |
| `DB_USER`           | MySQL username                       |
| `DB_PASSWORD`       | MySQL password                       |
| `DB_NAME`           | Database name (`cinebook`)           |
| `JWT_SECRET`        | Secret key for signing JWTs          |
| `RAZORPAY_KEY_ID`   | Razorpay test/live key ID            |
| `RAZORPAY_KEY_SECRET` | Razorpay secret (never send to frontend) |
| `PORT`              | Server port (default: `5000`)        |

### Frontend — `frontend/.env`

| Variable               | Description                              |
|------------------------|------------------------------------------|
| `VITE_API_BASE_URL`    | Backend API base URL                     |
| `VITE_RAZORPAY_KEY_ID` | Razorpay public key (safe to expose)     |

> ⚠️ **Never commit `.env` files to Git.** Both are in `.gitignore`.

---

## 9. Useful Commands

```powershell
# Test backend is running
curl http://localhost:5000/api/health

# Build the frontend for production
cd frontend; npm run build

# Re-initialise the database (drops & recreates all tables)
cd backend; node scripts/init_db.js

# Start MySQL service (run PowerShell as Administrator)
net start MySQL80

# Stop MySQL service
net stop MySQL80

# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill a process using port 5000 (replace <PID> with the number from above)
taskkill /PID <PID> /F
```

---

## 10. Common Issues & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| `connect ECONNREFUSED` on API calls | Backend not running | Run `node server.js` in `backend/` |
| `ER_ACCESS_DENIED_ERROR` | Wrong MySQL password | Check `DB_PASSWORD` in `backend/.env` |
| City dropdown empty | Backend not reachable | Make sure backend is running on port `5000` |
| Razorpay window doesn't open | Wrong key or missing `.env` | Check `VITE_RAZORPAY_KEY_ID` in `frontend/.env` |
| Admin link not showing in Navbar | Not logged in as admin | Run the `UPDATE users SET role='admin'` SQL command |
| `npm install` errors | Node version too old | Update Node.js to v18+ from [nodejs.org](https://nodejs.org) |
| Port 5000 already in use | Another process using the port | Run `netstat -ano \| findstr :5000` then `taskkill /PID <PID> /F` |
| `mysql` not recognized in terminal | MySQL not in PATH | Add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to System PATH |
| TMDb Fetch button fails | `api.themoviedb.org` blocked by ISP/network | Enable a VPN (e.g. ProtonVPN) and retry |
