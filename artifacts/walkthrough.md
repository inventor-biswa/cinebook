# QwikShow UI Restructure & Feature Rollout — Walkthrough

## What Was Done

### Frontend

| File | Change |
|---|---|
| [src/index.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/index.css) | Full rewrite — matched original static site colors (`#0f0f1a` bg, `#a855f7` primary, gradient `#a855f7→#ec4899`), ambient glow, light mode tokens, horizontal movie row utility class |
| [src/main.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/main.jsx) | Wrapped `<App>` with `<ThemeProvider>` |
| [context/ThemeContext.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/context/ThemeContext.jsx) | **[NEW]** Light/dark toggle, persisted via `localStorage`, applies `data-theme` attribute to `<html>` |
| [components/Navbar.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/Navbar.jsx) | **QwikShow** text logo (purple/white), theme toggle ☀️/🌙, city dropdown, reward points badge in dropdown, Home + Offers nav links, mobile drawer |
| [components/Navbar.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/Navbar.css) | Full rewrite — glassmorphism, sticky scroll shadow, drawer animation |
| [components/MovieCard.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/MovieCard.css) | Book-now button changed from red to purple gradient |
| [components/TrailerModal.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/TrailerModal.jsx) | **[NEW]** Reusable YouTube trailer modal (handles URL/ID formats), closes on Escape or overlay click |
| [components/TrailerModal.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/TrailerModal.css) | **[NEW]** Dark overlay, slide-up animation |
| [pages/Home.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.jsx) | **Full rewrite** — global all-cities movies (no city filter), horizontal scrollable rows, genre filter pills, offers banner, Browse Category cards, Coming Soon row, AI Picks row (logged-in), Explore by City grid |
| [pages/Home.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.css) | **Full rewrite** — cinematic hero, offer pills, category gradient cards, genre pills, city grid |
| [pages/MyBookings.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/MyBookings.jsx) | Shows `booking_ref` (purple monospace) and movie poster thumbnail on each ticket card |
| [pages/MyBookings.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/MyBookings.css) | Added `.booking-card__ref` and `.booking-card__poster` styles |
| [pages/BookingConfirm.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/BookingConfirm.jsx) | Success screen shows `booking_ref`, reward points earned, Razorpay theme changed to purple |
| [pages/BookingConfirm.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/BookingConfirm.css) | Portrait-image background replaced with cinematic dark gradient, booking ref + points card styles |
| [pages/OffersPage.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/OffersPage.jsx) | **[NEW]** Public page listing all active coupons with one-click copy-to-clipboard |
| [pages/admin/AdminLayout.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/admin/AdminLayout.jsx) | Added 🎁 Offers to sidebar nav, QwikShow branding |
| [pages/admin/ManageMovies.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/admin/ManageMovies.jsx) | Added **📥 Bulk Import** button + modal — paste movie titles one per line, fetches from TMDb, reports imported/skipped/failed |
| [pages/admin/ManageOffers.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/admin/ManageOffers.jsx) | **[NEW]** Admin CRUD for offers: create form, toggle enable/disable, usage count |
| [App.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/App.jsx) | Added `/offers` route and `/admin/offers` route |

### Backend

| File | Change |
|---|---|
| [controllers/movies.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/movies.controller.js) | [getAllMovies](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/admin/movies.controller.js#5-16) now supports `?status=` param — fetches globally (all cities) by status |
| [controllers/bookings.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/bookings.controller.js) | `booking_ref` generation (`QS-YYYYMMDD-XXXX`) + reward points (₹1 = 1 point) |
| [controllers/offers.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/offers.controller.js) | **[NEW]** [getActiveOffers](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/offers.controller.js#3-21), [validateOffer](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/offers.controller.js#22-67) (percent/flat), admin CRUD + toggle |
| [controllers/recommendations.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/recommendations.controller.js) | **[NEW]** Genre-based AI recommendations from booking history; falls back to trending |
| [controllers/admin/movies.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/admin/movies.controller.js) | Added [bulkImportMovies](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/admin/movies.controller.js#120-175) — fetches up to 20 titles from TMDb, skips duplicates |
| [routes/offers.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/routes/offers.js) | **[NEW]** `/api/offers/active`, `/api/offers/validate`, admin CRUD |
| [routes/recommendations.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/routes/recommendations.js) | **[NEW]** `/api/recommendations` (auth required) |
| [routes/admin/movies.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/routes/admin/movies.js) | Added `POST /bulk-import` route |
| [server.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/server.js) | Wired in `/api/offers` and `/api/recommendations` |
| [init_db.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/init_db.js) | `booking_ref` column, `reward_points` on users, `offers` table with sample data, expanded cities |

---

## How to Test

### 1. Restart Backend
```bash
cd backend && node init_db.js   # first time only — to create offers table
npm run dev
```

### 2. Start Frontend
```bash
cd frontend && npm run dev
```

### 3. Verify Key Features

| Feature | Where to test |
|---|---|
| **Color scheme matched** | Home page — dark `#0f0f1a` bg, purple primary |
| **QwikShow logo** | Navbar — `Qwik` (purple) `Show` (white) |
| **Theme toggle** | Click ☀️/🌙 in navbar |
| **Global movies** | Home page — all movies shown, not city-filtered |
| **Horizontal rows** | Home — scroll ← → on "Now Showing", "Trending", etc. |
| **Genre filter** | Pill buttons below "Now Showing" |
| **Offers banner** | Scrolling pills below hero on home page |
| **Offers page** | `/offers` — copy code with one click |
| **City grid** | Bottom of home page |
| **Booking ref** | Book a show → success screen shows `QS-YYYYMMDD-XXXX` |
| **Reward points** | After booking → success shows points earned |
| **My Bookings** | `/my-bookings` — poster thumbnail + booking_ref in purple |
| **AI Recommendations** | Home page (when logged in) → "Recommended For You" row |
| **Bulk Import** | Admin → Movies → 📥 Bulk Import → paste titles |
| **Manage Offers** | Admin → 🎁 Offers |
