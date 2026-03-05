# CineBook — Frontend Build Guide

> **Purpose:** A step-by-step instructional guide for building the CineBook React frontend.  
> Designed for students — every step explains *what* is being built, *why* it is needed, and *how* it connects to the backend.

---

## Technology Stack

| Tool | Purpose |
|------|---------|
| **Vite + React** | Fast frontend build tool and UI framework |
| **React Router v6** | Client-side routing between pages |
| **Axios** | HTTP client to call the backend API |
| **Context API** | Global state management (no Redux needed) |
| **React Hot Toast** | Lightweight toast notifications |

---

## Page Map — All Pages in the App

```
CineBook (12 Pages Total)
│
├── 🌐 Public Pages (No login required)
│   ├── /                → Home.jsx
│   ├── /movies          → AllMovies.jsx
│   ├── /movies/:id      → MovieDetail.jsx
│   ├── /events          → AllEvents.jsx
│   └── /events/:id      → EventDetail.jsx
│
├── 🔑 Auth Pages
│   ├── /login           → Login.jsx
│   └── /register        → Register.jsx
│
├── 🔒 Protected Pages (Login required)
│   ├── /shows/:id/seats → SeatSelection.jsx
│   ├── /booking/confirm → BookingConfirm.jsx
│   └── /my-bookings     → MyBookings.jsx
│
└── 🛡️ Admin Pages (Admin role required)
    ├── /admin           → Dashboard.jsx
    ├── /admin/movies    → ManageMovies.jsx
    ├── /admin/events    → ManageEvents.jsx
    ├── /admin/theatres  → ManageTheatres.jsx
    └── /admin/shows     → ManageShows.jsx
```

---

## Folder Structure

```
frontend/src/
│
├── api/
│   └── axios.js            ← Axios instance (base URL + token)
│
├── context/
│   ├── AuthContext.jsx      ← User login state, token, role
│   └── CityContext.jsx      ← Currently selected city
│
├── components/
│   ├── Navbar.jsx           ← Top navigation bar
│   ├── Footer.jsx           ← Footer
│   ├── MovieCard.jsx        ← Reusable movie/event tile card
│   └── PrivateRoute.jsx     ← Redirects to login if not authenticated
│
├── pages/
│   ├── Home.jsx
│   ├── AllMovies.jsx
│   ├── MovieDetail.jsx
│   ├── AllEvents.jsx
│   ├── EventDetail.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── SeatSelection.jsx
│   ├── BookingConfirm.jsx
│   ├── MyBookings.jsx
│   ├── NotFound.jsx
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── Dashboard.jsx
│       ├── ManageMovies.jsx
│       ├── ManageEvents.jsx
│       ├── ManageTheatres.jsx
│       └── ManageShows.jsx
│
├── App.jsx                  ← Router — wires all pages to URLs
├── main.jsx                 ← React root mount
└── index.css                ← Global styles & design tokens
```

---

## Build Phases (Chunks)

---

## CHUNK 1 — Setup & Global Infrastructure

> **Goal:** Before building any page, we need the foundation — how does the app talk to the backend, and how does it know if a user is logged in?

### Step 1: Install Dependencies

```bash
cd frontend
npm install react-router-dom axios react-hot-toast
```

| Package | Why we need it |
|---------|---------------|
| `react-router-dom` | Enables `/movies`, `/login` etc. as separate pages |
| `axios` | Cleaner way to call our Express API than `fetch()` |
| `react-hot-toast` | Shows "Booking confirmed!" and error popups |

---

### Step 2: `src/api/axios.js` — The API Gateway

**What it does:** Creates a pre-configured Axios instance that automatically attaches the JWT token to every request header.

**Why:** Without this, we'd need to manually type `Authorization: Bearer <token>` in every API call across 10+ files.

**Connection to backend:** Every call from `axios.js` hits `http://localhost:5000/api`.

```js
// Connects to our Express server
const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Automatically adds: Authorization: Bearer <token>
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

### Step 3: `src/context/AuthContext.jsx` — Who is logged in?

**What it does:** Stores the current user object and their JWT token in React's global Context so any component can access it without prop-drilling.

**Why:** The Navbar needs to know if the user is logged in to show "Login" or "My Profile". The `PrivateRoute` component needs it to protect pages.

**Key exported values:**
- `user` — `{ user_id, name, email, role }`
- `token` — the JWT string
- `login(userData, token)` — saves to state + localStorage
- `logout()` — clears state + localStorage

---

### Step 4: `src/context/CityContext.jsx` — Which city?

**What it does:** Stores the city the user has selected (e.g., Mumbai). This is passed as a query param to movie/event API calls.

**Why:** `GET /api/movies?city_id=1` filters movies by city. Every page that lists movies needs this city_id automatically.

---

### Step 5: `src/App.jsx` — The Router

**What it does:** Defines which URL maps to which page component using React Router.

**Key patterns used:**
- `<BrowserRouter>` — Enables the whole routing system
- `<PrivateRoute>` — Wraps pages that need a logged-in user
- `<AdminRoute>` — Wraps pages that need `role === 'admin'`

---

## CHUNK 2 — Layout & Shared Components

> **Goal:** Build the visual shell that wraps every page.

### `Navbar.jsx`
- Dropdown to select city → updates `CityContext`
- Links to `/movies` and `/events`
- If logged out: shows **Login** button
- If logged in as user: shows **My Bookings** + **Logout**
- If logged in as admin: shows **Admin Dashboard** link

### `MovieCard.jsx`
**Props:** `{ id, title, poster_url, type }` (`type` = `"movie"` or `"event"`)

**Renders:** A clickable card that navigates to `/movies/:id` or `/events/:id`.

**Used by:** Home, AllMovies, AllEvents pages.

### `PrivateRoute.jsx`
**Logic:** Checks if `AuthContext` has a user. If not, redirects to `/login`. If yes, renders the child component.

---

## CHUNK 3 — Public User Pages

> **Goal:** The pages a visitor can see without logging in.

### `Home.jsx`
- Calls `GET /api/movies/trending` → hero carousel/banner
- Calls `GET /api/movies?city_id=X` → "Now Showing" section
- Calls `GET /api/events?city_id=X` → "Events Near You" section

### `MovieDetail.jsx` (`/movies/:id`)
- Calls `GET /api/movies/:id?city_id=X`
- Shows: Title, poster, cast, genre, description
- Below: List of available show timings with a **Book Now** button
- Clicking **Book Now** navigates to `/shows/:show_id/seats`

### `EventDetail.jsx` (`/events/:id`)
- Same structure as MovieDetail but for events.

---

## CHUNK 4 — Auth Pages

> **Goal:** Allow users to create accounts and log in.

### `Register.jsx`
- Form fields: Name, Email, Password
- Calls `POST /api/auth/register`
- On success → redirect to `/login`

### `Login.jsx`
- Form fields: Email, Password
- Calls `POST /api/auth/login`
- On success → calls `login()` from AuthContext → saves token → redirect to `/`

---

## CHUNK 5 — Booking Flow (Protected)

> **Goal:** The core buying experience. This is what makes the app feel real.

### `SeatSelection.jsx` (`/shows/:id/seats`)
- Calls `GET /api/shows/:id/seats`
- Renders a **10×10 grid** of seats (A1-J10)
- 🟩 Green = available, 🟥 Red = already booked
- User clicks to select/deselect seats
- "Confirm" button passes selected `seat_ids` to the next step

### `BookingConfirm.jsx`
1. Calls `POST /api/bookings` with `{ show_id, seat_ids }`
2. On success, receives `{ booking_id, total_amount }`
3. Launches **Razorpay checkout** with the `total_amount`
4. After payment, calls `POST /api/payment/verify`
5. On verification → shows success toast + redirect to `/my-bookings`

> **Razorpay key (Frontend):** Use the `VITE_RAZORPAY_KEY_ID` environment variable.

### `MyBookings.jsx`
- Calls `GET /api/bookings`
- Lists all past bookings in a table: Movie, Date, Seats, Amount, Status

---

## CHUNK 6 — Admin Dashboard (Protected + Admin Only)

> **Goal:** Give the admin a management interface for the entire platform.

### `Dashboard.jsx` (`/admin`)
- 4 stat cards: Revenue, Bookings, Users, Movies count
- Table: 10 most recent bookings
- API: `GET /api/admin/reports/stats` + `GET /api/admin/reports/recent`

### `ManageMovies.jsx` (`/admin/movies`)
- Table: lists all movies
- **Add Movie** button → opens a form modal
- **Edit** button → pre-fills the form
- **Delete** button → confirmation modal then API call
- APIs: `GET/POST/PUT/DELETE /api/admin/movies`

### `ManageEvents.jsx`, `ManageTheatres.jsx`
- Same pattern as ManageMovies but for their respective resources.

### `ManageShows.jsx` (`/admin/shows`)
- **Create Show** form: choose Movie OR Event, Theatre, Date, Time, Price
- Submitting automatically generates 100 seats in the backend
- APIs: `GET/POST/DELETE /api/admin/shows`

---

## Environment Variables

Create `frontend/.env`:
```bash
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

> ⚠️ **Never push `.env` to GitHub.** It is already in `.gitignore`.

---

## How Components Talk to the Backend (Summary)

```
User visits /movies
    → Home.jsx mounts
    → Calls API.get('/movies?city_id=1') from axios.js
    → axios.js adds Authorization header automatically
    → Backend returns movie list
    → MovieCard renders each movie
    → User clicks a card → navigates to /movies/1
    → MovieDetail.jsx calls API.get('/movies/1')
    → Shows timings → User clicks Book Now
    → SeatSelection.jsx calls API.get('/shows/10/seats')
    → User picks seats → BookingConfirm.jsx
    → POST /api/bookings → POST /api/payment/create-order
    → Razorpay opens → POST /api/payment/verify
    → Booking confirmed!
```

---

*Document maintained by the CineBook project. Each section will be filled in as the code is built.*

---

## Build Log

### ✅ CHUNK 1 — Completed

**Packages installed:**
```bash
npm install react-router-dom axios react-hot-toast
# Added 30 packages. 0 vulnerabilities.
```

**Files created:**

| File | Purpose |
|------|---------|
| `src/api/axios.js` | Axios instance — auto-attaches JWT token to every request |
| `src/context/AuthContext.jsx` | Global user login state + `login()` / `logout()` |
| `src/context/CityContext.jsx` | Global city selector state + persists to localStorage |
| `src/components/PrivateRoute.jsx` | Redirects to `/login` if user not authenticated |
| `src/components/AdminRoute.jsx` | Redirects if user is not an admin |
| `src/App.jsx` | Complete router wiring all 14 pages |
| `frontend/.env` | Environment variables (API URL + Razorpay key) |
| `src/pages/*.jsx` | Placeholder stubs for all 11 public/protected pages |
| `src/pages/admin/*.jsx` | Placeholder stubs for all 5 admin pages |
