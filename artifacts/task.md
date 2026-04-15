# QwikShow — UI Restructure Task List

## 🔴 Priority 1 — Bug Fixes

- [ ] **Fix 1**: Add `booking_ref` column to [init_db.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/init_db.js) + `bookings` table
- [ ] **Fix 1b**: Generate `booking_ref` in [bookings.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/bookings.controller.js)
- [ ] **Fix 1c**: Display `booking_ref` in [BookingConfirm.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/BookingConfirm.jsx) + [MyBookings.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/MyBookings.jsx)
- [ ] **Fix 2**: Fix portrait background in [BookingConfirm.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/BookingConfirm.css) / [SeatSelection.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/SeatSelection.css)
- [ ] **Fix 3**: Home page shows movies from `movies` table directly (not via shows join)
  - [ ] Update [movies.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/movies.controller.js) — new public `getMovies` by status
  - [ ] Update [Home.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.jsx) to call `/api/movies` not city-filtered shows endpoint

## 🔴 Priority 2 — Color Schema & Design Alignment

- [ ] Update [src/index.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/index.css) — match original static site colors (`#0f0f1a`, `#a855f7`, gradients)
- [ ] Update [Navbar.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/Navbar.jsx) + [Navbar.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/Navbar.css) — text logo, city dropdown, theme toggle
- [ ] Update [MovieCard.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/MovieCard.css) — match card style from static site
- [ ] Update [Footer.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/Footer.jsx) — fix broken QR code, color alignment

## 🔴 Priority 3 — Home Page Redesign

- [ ] [Home.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.jsx) — horizontal scrollable movie rows (Trending, Now Showing, Coming Soon)
- [ ] [Home.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.jsx) — genre filter pills above movie rows
- [ ] [Home.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.jsx) — "Explore by City" section
- [ ] [Home.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.css) — styles for horizontal rows, genre pills, city cards

## 🟡 Priority 4 — New Features

- [ ] **Light/Dark Mode**
  - [ ] `context/ThemeContext.jsx`
  - [ ] [index.css](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/index.css) light mode variables
  - [ ] [main.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/main.jsx) wrap with ThemeProvider
- [ ] **Trailer Modal**
  - [ ] [backend/controllers/admin/movies.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/admin/movies.controller.js) — expose trailer URL
  - [ ] `src/components/TrailerModal.jsx` + `TrailerModal.css`
  - [ ] [MovieDetail.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/MovieDetail.jsx) — Watch Trailer button
- [ ] **Admin Bulk TMDb Import**
  - [ ] [movies.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/movies.controller.js) — `bulkImportFromTmdb` function
  - [ ] Admin panel UI — bulk import section
- [ ] **Offers & Discounts**
  - [ ] [init_db.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/init_db.js) — offers table
  - [ ] `backend/routes/offers.route.js` + `offers.controller.js`
  - [ ] [SeatSelection.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/SeatSelection.jsx) — coupon input
  - [ ] [Home.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.jsx) — offers banner
- [ ] **Reward Points**
  - [ ] [init_db.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/init_db.js) — reward_points field on users
  - [ ] [bookings.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/bookings.controller.js) — award points on confirm
  - [ ] [Navbar.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/components/Navbar.jsx) — show points badge
  - [ ] [BookingConfirm.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/BookingConfirm.jsx) — redeem points UI
- [ ] **AI Suggestions**
  - [ ] `backend/controllers/recommendations.controller.js`
  - [ ] [Home.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Home.jsx) — AI picks row
- [ ] **Email OTP Login**
  - [ ] `backend/utils/mailer.js`
  - [ ] [auth.controller.js](file:///d:/Thynx/College%20Projects/Cinebook/backend/controllers/auth.controller.js) — sendOtp + verifyOtp
  - [ ] [Login.jsx](file:///d:/Thynx/College%20Projects/Cinebook/frontend/src/pages/Login.jsx) — OTP tab
