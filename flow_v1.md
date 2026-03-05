# CineBook — Complete Developer Guide
### MCA Final Year Project | Learn by Building

> **Philosophy:** This guide does NOT hand you code. It tells you WHAT to build, WHY it works that way,
> and WHAT to think about at each step. You write the code. You learn by doing.

---

## HOW TO USE THIS GUIDE

- Read the explanation before writing a single line.
- Understand the "why" behind every decision.
- Only move to the next section after the current one works.
- When something breaks — debug it yourself first. That is where real learning happens.
- Use AI as a last resort to explain concepts, not to write code for you.

---

## TABLE OF CONTENTS

1. [Project Overview & Vision](#1-project-overview--vision)
2. [Tech Stack Explained](#2-tech-stack-explained)
3. [Folder Structure — Full Map](#3-folder-structure--full-map)
4. [Database Design — Every Table Explained](#4-database-design--every-table-explained)
5. [Backend — Building Layer by Layer](#5-backend--building-layer-by-layer)
6. [Frontend — Pages, Components & Flow](#6-frontend--pages-components--flow)
7. [Feature Deep Dives](#7-feature-deep-dives)
8. [Phase-wise Build Plan](#8-phase-wise-build-plan)
9. [How Things Connect — The Big Picture](#9-how-things-connect--the-big-picture)
10. [Common Mistakes to Avoid](#10-common-mistakes-to-avoid)
11. [Glossary](#11-glossary)

---

---

# 1. Project Overview & Vision

## What are we building?

A web platform like BookMyShow where:
- Users can browse movies and events happening in their city
- Watch trailers, select seats on a visual map, and pay online
- Admins can manage all movies, events, theatres, showtimes, and view reports

## Two types of users

**Regular User:** Visits the site → selects city → browses movies/events → books tickets → pays via Razorpay

**Admin:** Logs into a separate dashboard → adds movies/events → assigns them to cities + theatres + dates → monitors bookings and revenue

## What makes this project special for learning?

This project touches EVERY major concept in full-stack development:
- Relational database design with foreign keys and joins
- REST API design and how frontend talks to backend
- JWT authentication and role-based access control
- Real payment gateway integration
- React state management across multiple pages
- Preventing race conditions (two users booking the same seat)

If you understand this project end-to-end, you understand full-stack web development.

---

---

# 2. Tech Stack Explained

## Why React for Frontend?

React uses a component-based architecture. Instead of writing one giant HTML page,
you build small reusable pieces (components) and compose them together.
A MovieCard component, for example, can be reused on the home page, search results,
and the admin panel — write once, use everywhere.

React also gives you a virtual DOM which efficiently updates only what changed on screen,
making UIs feel fast and smooth.

## Why Node.js + Express for Backend?

Node.js lets you write server-side code in JavaScript — the same language as your frontend.
Express is a minimal framework that helps you define routes (URLs) and what happens when they are called.

Together they make it very easy to build a REST API:
a set of URLs that your React app calls to get or send data.

## Why MySQL with XAMPP?

MySQL is a relational database — data is stored in structured tables with clear relationships.
This project has complex relationships: a movie has many shows, a show has many seats,
a booking has many seats. Relational databases handle this perfectly.

XAMPP gives you MySQL + phpMyAdmin running locally without any cloud setup.
It is perfect for learning and local development.

## Why Razorpay?

Razorpay is an Indian payment gateway with a very developer-friendly test mode.
You can simulate real payments with test card numbers without spending a rupee.
It teaches you how real-world payment flows work: order creation, checkout popup, signature verification.

---

---

# 3. Folder Structure — Full Map

## Why folder structure matters

Before writing code, decide where everything lives.
A messy folder structure leads to messy code and confusion.
This structure separates concerns: each folder has ONE responsibility.

---

## Backend Folder Structure

```
backend/
│
├── server.js                  ← Entry point. Starts the Express app.
│
├── .env                       ← Secret config (DB password, JWT secret, Razorpay keys)
│                                 NEVER commit this to GitHub
│
├── config/
│   └── db.js                  ← MySQL connection setup. One place to manage DB config.
│
├── middleware/
│   ├── auth.js                ← Reads JWT token from request, verifies it, attaches user to request
│   └── isAdmin.js             ← Checks if the logged-in user has role = 'admin'
│
├── routes/
│   ├── auth.js                ← /api/auth/register and /api/auth/login
│   ├── cities.js              ← /api/cities
│   ├── movies.js              ← /api/movies (public, for users)
│   ├── events.js              ← /api/events (public, for users)
│   ├── shows.js               ← /api/shows
│   ├── seats.js               ← /api/shows/:id/seats
│   ├── bookings.js            ← /api/bookings
│   ├── payment.js             ← /api/payment/create-order and /api/payment/verify
│   └── admin/
│       ├── movies.js          ← Admin CRUD for movies
│       ├── events.js          ← Admin CRUD for events
│       ├── theatres.js        ← Admin CRUD for theatres
│       ├── shows.js           ← Admin schedule management
│       └── reports.js         ← Revenue and booking analytics
│
└── controllers/
    ├── auth.controller.js     ← Business logic for register/login
    ├── movies.controller.js   ← Business logic for movie queries
    ├── bookings.controller.js ← Business logic for booking + seat locking
    ├── payment.controller.js  ← Razorpay order creation + verification
    └── admin/
        └── (mirrors routes above)
```

### Why separate routes and controllers?

Routes define the URL and HTTP method (GET /api/movies).
Controllers contain the actual logic (query the DB, return data).
This separation keeps each file small and focused.
If your booking logic changes, you only touch bookings.controller.js.

---

## Frontend Folder Structure

```
frontend/
│
├── public/
│   └── index.html             ← Single HTML file. React mounts inside <div id="root"> here.
│
└── src/
    │
    ├── main.jsx               ← Entry point. Renders <App /> into the DOM.
    │
    ├── App.jsx                ← Defines all routes using React Router.
    │                            Wraps everything in Context providers.
    │
    ├── pages/                 ← One file per "screen" the user sees
    │   ├── Home.jsx
    │   ├── MovieDetail.jsx
    │   ├── EventDetail.jsx
    │   ├── SeatSelection.jsx
    │   ├── Checkout.jsx
    │   ├── BookingConfirmation.jsx
    │   ├── MyBookings.jsx
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   └── admin/
    │       ├── AdminDashboard.jsx
    │       ├── ManageMovies.jsx
    │       ├── ManageEvents.jsx
    │       ├── ManageTheatres.jsx
    │       └── ManageShows.jsx
    │
    ├── components/            ← Reusable UI pieces used across multiple pages
    │   ├── Navbar.jsx         ← Top navigation bar
    │   ├── CitySelector.jsx   ← City dropdown/modal shown on first visit
    │   ├── MovieCard.jsx      ← Card showing poster + title + genre
    │   ├── EventCard.jsx      ← Similar card for events
    │   ├── SeatGrid.jsx       ← The visual seat map (most complex component)
    │   ├── TrailerEmbed.jsx   ← YouTube iframe wrapper
    │   ├── TrendingBanner.jsx ← Highlighted section on home page
    │   └── ProtectedRoute.jsx ← Wrapper that redirects to login if not authenticated
    │
    ├── context/
    │   ├── AuthContext.jsx    ← Stores logged-in user + JWT token. Available everywhere.
    │   └── CityContext.jsx    ← Stores selected city. Available everywhere.
    │
    └── services/
        └── api.js             ← Single Axios instance. All API calls go through here.
                                 Base URL set once. Auth token attached automatically.
```

### Why a services/api.js file?

Without it, every component makes its own fetch call with its own URL and headers.
With it, you set the base URL and auth token in ONE place.
If your backend URL changes, you update one line, not fifty.

---

---

# 4. Database Design — Every Table Explained

## Core Principle: Think before you create tables

Ask yourself for every piece of data:
- Does this belong to its own table, or is it a column in another table?
- What is the relationship — one-to-one, one-to-many, or many-to-many?
- What happens if a parent record is deleted?

---

## Table 1: users

**Purpose:** Stores everyone who can log in — both regular users and admins.

```sql
CREATE TABLE users (
  user_id       INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100)        NOT NULL,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255)        NOT NULL,
  role          ENUM('user','admin') DEFAULT 'user',
  created_at    DATETIME            DEFAULT CURRENT_TIMESTAMP
);
```

**Why password_hash and not password?**
You NEVER store plain-text passwords. Ever. Use bcrypt to hash the password before saving.
When a user logs in, you hash what they typed and compare it to the stored hash.
Even if your database is stolen, passwords cannot be read.

**Why role as ENUM?**
ENUM limits the value to only 'user' or 'admin'. No accidents like storing 'Admin' or 'ADMIN'.

---

## Table 2: cities

**Purpose:** Stores all supported cities. Users select a city on first visit.

```sql
CREATE TABLE cities (
  city_id   INT PRIMARY KEY AUTO_INCREMENT,
  name      VARCHAR(100) NOT NULL
);
```

**Sample data to insert:**
```sql
INSERT INTO cities (name) VALUES ('Mumbai'), ('Delhi'), ('Bangalore'), ('Hyderabad'), ('Chennai');
```

---

## Table 3: theatres

**Purpose:** Stores physical theatres/venues. Each belongs to a city.

```sql
CREATE TABLE theatres (
  theatre_id    INT PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(100) NOT NULL,
  city_id       INT          NOT NULL,
  total_rows    INT          NOT NULL,   -- e.g. 8 means rows A to H
  seats_per_row INT          NOT NULL,   -- e.g. 10 means columns 1 to 10
  FOREIGN KEY (city_id) REFERENCES cities(city_id)
);
```

**Think about it:** If total_rows = 8 and seats_per_row = 10, the theatre has 80 seats.
Row A = A1 to A10, Row B = B1 to B10, ..., Row H = H1 to H10.
You can auto-generate all seat labels from these two numbers. That is powerful.

**What is a FOREIGN KEY?**
It means city_id in theatres MUST match an existing city_id in the cities table.
The database itself enforces this rule. You cannot insert a theatre with a city that doesn't exist.

---

## Table 4: movies

**Purpose:** All movie information. One row per movie.

```sql
CREATE TABLE movies (
  movie_id     INT PRIMARY KEY AUTO_INCREMENT,
  title        VARCHAR(200) NOT NULL,
  genre        VARCHAR(100),
  language     VARCHAR(50),
  description  TEXT,
  cast_info    TEXT,
  poster_url   VARCHAR(255),
  trailer_url  VARCHAR(255),
  release_date DATE,
  is_trending  BOOLEAN DEFAULT FALSE,
  status       ENUM('now_showing','coming_soon','ended') DEFAULT 'coming_soon',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Why trailer_url as YouTube link and not an uploaded video?**
Video files are huge (hundreds of MBs). Hosting them costs money and slows your server.
YouTube already hosts the video for free. You just embed it with an iframe.
The trailer_url will look like: https://www.youtube.com/embed/VIDEO_ID

---

## Table 5: events

**Purpose:** Similar to movies but for events like concerts, stand-up shows, sports.

```sql
CREATE TABLE events (
  event_id     INT PRIMARY KEY AUTO_INCREMENT,
  title        VARCHAR(200) NOT NULL,
  category     VARCHAR(100),
  description  TEXT,
  poster_url   VARCHAR(255),
  trailer_url  VARCHAR(255),
  is_trending  BOOLEAN DEFAULT FALSE,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## Table 6: shows ← THE MOST IMPORTANT TABLE

**Purpose:** This table is the bridge that connects everything.
A show = "Movie X is playing at Theatre Y in City Z on Date D at Time T for price P"

```sql
CREATE TABLE shows (
  show_id         INT PRIMARY KEY AUTO_INCREMENT,
  movie_id        INT,
  event_id        INT,
  theatre_id      INT NOT NULL,
  show_date       DATE NOT NULL,
  show_time       TIME NOT NULL,
  price           DECIMAL(8,2) NOT NULL,
  available_seats INT NOT NULL,
  FOREIGN KEY (movie_id)   REFERENCES movies(movie_id),
  FOREIGN KEY (event_id)   REFERENCES events(event_id),
  FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id)
);
```

**Why can movie_id and event_id both be NULL-able?**
A show is EITHER for a movie OR for an event, never both.
So one of them will always be NULL.
When querying, check: if movie_id IS NOT NULL, it's a movie show. Otherwise it's an event show.

**What is available_seats for?**
When a user successfully books 3 seats, you do:
UPDATE shows SET available_seats = available_seats - 3
This lets you quickly show "Only 5 seats left!" without counting rows in the seats table every time.

---

## Table 7: seats

**Purpose:** Represents every individual seat for every show.
When a show is created, seats are auto-generated from the theatre's row/column config.

```sql
CREATE TABLE seats (
  seat_id    INT PRIMARY KEY AUTO_INCREMENT,
  show_id    INT         NOT NULL,
  seat_label VARCHAR(10) NOT NULL,
  is_booked  BOOLEAN     DEFAULT FALSE,
  FOREIGN KEY (show_id) REFERENCES shows(show_id)
);
```

**Why create seat rows when a show is created, not when a user opens the page?**
If you generate seats on-the-fly every time a user views the seat map, it's slow and fragile.
Pre-generating them when the show is created means they always exist in the DB,
ready to be queried instantly, and ready to be marked as booked.

**How to auto-generate seats (logic to implement yourself):**
When admin creates a show for Theatre X:
1. Query the theatre to get total_rows and seats_per_row
2. Loop: for each row index (0 to total_rows-1), convert to letter (0=A, 1=B...)
3. For each row, loop from 1 to seats_per_row
4. INSERT into seats: (show_id, 'A1'), (show_id, 'A2'), ..., (show_id, 'H10')

---

## Table 8: bookings

**Purpose:** One row per completed booking transaction.

```sql
CREATE TABLE bookings (
  booking_id    INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT            NOT NULL,
  show_id       INT            NOT NULL,
  total_amount  DECIMAL(10,2)  NOT NULL,
  payment_id    VARCHAR(100),
  status        ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
  booked_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (show_id) REFERENCES shows(show_id)
);
```

**Why status starts as 'pending'?**
The booking is created BEFORE payment is completed.
Only after Razorpay confirms payment do you update status to 'confirmed'.
This way if payment fails, you know to release the seats back.

---

## Table 9: booking_seats (Junction Table)

**Purpose:** Links which specific seats belong to which booking.
A booking can have many seats. A seat belongs to one booking.
This is a many-to-many relationship resolved with a junction table.

```sql
CREATE TABLE booking_seats (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  seat_id    INT NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
  FOREIGN KEY (seat_id)    REFERENCES seats(seat_id)
);
```

**Example:** User books seats A1, A2, A3 for show #5.
- One row in bookings (booking_id = 101)
- Three rows in booking_seats: (101, seat_id_of_A1), (101, seat_id_of_A2), (101, seat_id_of_A3)

---

## Entity Relationship Summary

```
cities ──< theatres ──< shows >── movies
                           │
                           └──< seats
                           │
                           └──< bookings >── booking_seats >── seats
                                    │
                                 users

shows can also link to events (same structure as movies)
```

---

---

# 5. Backend — Building Layer by Layer

## How Express works (conceptually)

Every incoming HTTP request travels through a pipeline:

```
Incoming Request
      ↓
  server.js         ← Express app starts here, registers middleware and routes
      ↓
  Middleware         ← cors(), express.json(), logging, etc. runs on EVERY request
      ↓
  Route matching     ← Does the URL match GET /api/movies? Then go to movies route.
      ↓
  Auth Middleware     ← If route is protected, verify JWT token here
      ↓
  Controller          ← Actual business logic: query DB, process data, send response
      ↓
  Response sent back to client
```

---

## server.js — What it should do

This is your app's starting point. It should:
1. Import Express and create an app instance
2. Apply global middleware: cors (allow React frontend to call the API), express.json (parse request bodies)
3. Import and register all route files under their base path (e.g. /api/movies, /api/auth)
4. Start listening on a port (e.g. 5000)

**Environment variables to put in .env:**
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=cinebook
JWT_SECRET=some_long_random_string_here
RAZORPAY_KEY_ID=your_test_key
RAZORPAY_KEY_SECRET=your_test_secret
```

---

## config/db.js — Database Connection

Use the `mysql2` package (not the older `mysql` package — mysql2 supports async/await).

This file should:
1. Import mysql2
2. Create a connection pool (not a single connection — pools handle multiple simultaneous requests)
3. Export the pool so any controller can import and use it

**Why a pool and not a single connection?**
If 50 users make requests at the same time, a single DB connection would queue them all.
A pool maintains multiple open connections and hands them out as needed. Much faster.

---

## middleware/auth.js — JWT Verification

JWT = JSON Web Token. When a user logs in, you give them a signed token.
They send this token with every future request to prove who they are.

This middleware should:
1. Look for the token in the request header: Authorization: Bearer <token>
2. If no token, return 401 Unauthorized
3. Use jwt.verify() to decode and validate the token
4. If valid, attach the decoded user info to req.user
5. Call next() to continue to the controller

**Why attach to req.user?**
The controller can then access req.user.user_id or req.user.role
without decoding the token again. Clean and efficient.

---

## middleware/isAdmin.js — Role Check

This runs AFTER auth.js (the user must be authenticated first).

It should:
1. Check if req.user.role === 'admin'
2. If not, return 403 Forbidden
3. If yes, call next()

In your admin routes, you use both middleware together:
```
router.get('/movies', auth, isAdmin, getMovies)
```

---

## How to write a Controller (pattern to follow)

Every controller function follows the same pattern:
1. Get data from request (req.params, req.body, req.query)
2. Validate the data
3. Query the database
4. Send back a response

```
exports.getAllMovies = async (req, res) => {
  try {
    const { city_id } = req.query
    // Build SQL query based on city_id
    // Execute query using DB pool
    // Return results as JSON
  } catch (error) {
    // Log the error
    // Return 500 Internal Server Error
  }
}
```

**Always use try/catch with async database calls.**
If the DB query fails without a try/catch, your server crashes.

---

## Important Queries to Know How to Write

**Get all movies showing in a specific city:**
You need to JOIN movies → shows → theatres → cities.
Think: "Give me all movies where there exists at least one show in a theatre in this city."

**Get the seat map for a show:**
Simple: SELECT * FROM seats WHERE show_id = ? ORDER BY seat_label

**Create a booking (most complex — needs a transaction):**
A transaction means: do ALL these DB operations, or if ANY fails, undo ALL of them.

Steps inside one transaction:
1. Check that all selected seat_ids belong to the correct show_id
2. Check that none of the seats have is_booked = true (prevent double booking)
3. INSERT into bookings
4. INSERT into booking_seats for each seat
5. UPDATE seats SET is_booked = true for each seat_id
6. UPDATE shows SET available_seats = available_seats - N
7. COMMIT (finalize everything)

If step 2 finds an already-booked seat, ROLLBACK (undo everything). Return error.

This is how you prevent two users from booking the same seat simultaneously.

---

---

# 6. Frontend — Pages, Components & Flow

## How React Routing Works

React Router lets you define which component renders at which URL.
The URL changes without a full page reload. That is what makes it feel like a real app.

Your App.jsx defines all routes:
- `/` → Home page
- `/movie/:id` → Movie detail page (the :id is dynamic)
- `/event/:id` → Event detail page
- `/show/:show_id/seats` → Seat selection
- `/checkout` → Order summary + payment
- `/booking-confirmation` → After payment success
- `/my-bookings` → User's booking history
- `/login` and `/register` → Auth pages
- `/admin/*` → All admin pages (protected by isAdmin check)

---

## Context API — Sharing State Across the App

Problem: The selected city is chosen on the home page, but needs to be used on the movies page,
events page, seat selection, etc. How do you share it?

Answer: React Context. It is like a global variable that any component can read.

### AuthContext

Stores: current user object, JWT token, isLoggedIn boolean
Functions: login() (saves token to localStorage + state), logout() (clears everything)

Every component that needs to know "is the user logged in?" imports useAuth() from this context.

### CityContext

Stores: selected city object {city_id, name}
On first load, check localStorage. If a city was saved before, use that. Otherwise show the city selector.

---

## services/api.js — All API Calls in One Place

Create one Axios instance with:
- baseURL set to http://localhost:5000/api
- A request interceptor that automatically reads the JWT from localStorage
  and adds it to every request header as: Authorization: Bearer <token>

Then export functions for every API call:
- getMovies(city_id) → GET /movies?city_id=1
- getMovieById(id) → GET /movies/5
- getSeatMap(show_id) → GET /shows/3/seats
- createBooking(data) → POST /bookings
- etc.

**Why export functions instead of calling axios directly in components?**
If the API endpoint changes, you change it in one place.
If you need to add error handling to all API calls, you add it in one place.
Components stay clean and focused on rendering.

---

## Pages — What Each One Does

### Home.jsx
- On mount: fetch cities (for the selector), fetch trending items, fetch now-showing movies for selected city
- Layout: Hero/banner section → Trending carousel → Now Showing grid → Events section
- When a MovieCard is clicked, navigate to /movie/:id

### MovieDetail.jsx
- URL parameter: /movie/:id — extract the id using useParams()
- On mount: fetch movie details (title, description, cast, trailer_url, poster_url)
- Also fetch: all shows for this movie filtered by selected city
- Render: poster + info on left, TrailerEmbed on right, list of show dates/times below
- When user clicks a showtime, navigate to /show/:show_id/seats

### SeatSelection.jsx
- On mount: fetch the seat map from GET /shows/:show_id/seats
- Each seat comes back as {seat_id, seat_label, is_booked}
- Build a grid: group seats by row letter, display in order
- User clicks seats to toggle selection (cannot click is_booked seats)
- Store selected seats in local state as an array of seat objects
- "Proceed" button navigates to /checkout and passes selected seats via router state

### Checkout.jsx
- Receives selected seats and show info (from router state or a global state)
- Display: show name, date/time, theatre, selected seats, price per seat, convenience fee, total
- "Pay Now" button triggers the Razorpay payment flow (see Feature Deep Dives)

### BookingConfirmation.jsx
- Shown after payment succeeds
- Display booking ID, movie/event name, seats booked, amount paid
- Show a "Download Ticket" button (optional: generate a simple printable page)

### Admin Pages
Each admin page follows a pattern: table of existing records + a form to add/edit.
- ManageMovies: list all movies, button to add new, edit/delete buttons per row
- When adding a movie: form with all movie fields + a section to assign shows (city + theatre + date + time + price)
- ManageTheatres: list theatres, add new theatre with rows and seats_per_row config
- AdminDashboard: charts showing total bookings, revenue per movie, city-wise breakdown

---

## ProtectedRoute.jsx — The Auth Guard

Wrap any route that requires login with this component.
It should:
1. Read the auth state from AuthContext
2. If logged in, render the actual page component
3. If not logged in, redirect to /login

For admin routes, also check that role === 'admin'. If not, redirect to home.

---

## SeatGrid Component — The Most Complex UI Piece

This component receives: an array of seat objects from the API.
Internal state: selectedSeats array (seats the current user has clicked)

Logic:
1. Group seats by their row letter (A1, A2, A3 belong to row A)
2. For each row, render a horizontal line of seat buttons
3. Each seat button has a class based on its status:
   - is_booked = true → red, disabled (cannot click)
   - seat is in selectedSeats → yellow/orange (user selected this)
   - otherwise → green (available, can click)
4. On click: if already selected, remove from selectedSeats. Otherwise add to it.
5. Show a count at the bottom: "3 seats selected — ₹450"

---

## TrailerEmbed Component

Receives: trailer_url (a YouTube embed URL)
Renders: an HTML iframe with the URL as src

YouTube embed URLs look like: https://www.youtube.com/embed/dQw4w9WgXcQ

---

---

# 7. Feature Deep Dives

## A. Razorpay Payment Integration

### The flow step by step:

**Step 1 — Frontend: User clicks "Pay Now"**
Your Checkout.jsx calls your backend API: POST /api/payment/create-order
It sends: { amount, booking_id }

**Step 2 — Backend: Create Razorpay order**
Your payment controller calls the Razorpay API (using the razorpay npm package)
Razorpay returns an order_id
Your backend sends this order_id + amount + your Razorpay key_id back to frontend

**Step 3 — Frontend: Open Razorpay popup**
Load the Razorpay checkout script in your HTML.
Create a new Razorpay instance with the options (key, amount, order_id, name, etc.)
Call rzp.open() — the Razorpay payment modal appears

**Step 4 — User completes payment**
Test card number: 4111 1111 1111 1111, any future expiry, any CVV
Razorpay calls your success handler with: { razorpay_payment_id, razorpay_order_id, razorpay_signature }

**Step 5 — Frontend: Verify payment with your backend**
Call POST /api/payment/verify with those three values

**Step 6 — Backend: Verify the signature**
The signature is an HMAC-SHA256 hash of (order_id + "|" + payment_id) using your Razorpay secret key
Generate the expected signature and compare it to the received signature
If they match: payment is genuine. Mark booking as 'confirmed'. Mark seats as booked.
If they don't match: someone tampered with the response. Reject it.

**Step 7 — Backend: Send confirmation**
Return the confirmed booking details to frontend.
Frontend navigates to /booking-confirmation.

---

## B. Preventing Double Booking (Race Condition)

Imagine two users open the seat selection page at the same time.
Both see seat A1 as available. Both select A1 and click Pay.
Both payments succeed. Now both have a booking for the same seat.
This is a race condition.

**Solution: Database Transaction with SELECT FOR UPDATE**

When you process the booking (after payment verification), run inside a transaction:

1. BEGIN TRANSACTION
2. SELECT * FROM seats WHERE seat_id IN (selected_ids) FOR UPDATE
   (The FOR UPDATE locks these rows — no other transaction can touch them simultaneously)
3. Check: is any seat already is_booked = true? If yes → ROLLBACK, return error
4. If all clear → INSERT booking → INSERT booking_seats → UPDATE seats → COMMIT

The ROLLBACK + error response tells the second user "Sorry, seat is no longer available."
This is the professional way to handle concurrent requests. Learn this concept well.

---

## C. Trending Section

Admin toggles is_trending on a movie or event from the admin panel.
Frontend fetches GET /api/trending which returns all items where is_trending = true.
These are shown in a highlighted banner/carousel on the home page.

**Make the UI feel dynamic:** auto-scroll the trending banner every 3 seconds using setInterval in a useEffect.
Clean up the interval when the component unmounts (return a cleanup function from useEffect).

---

## D. Multi-City Architecture

On first visit, show a city selector modal/page.
Store the selected city in CityContext AND in localStorage (so it persists on refresh).
On every API call that fetches movies or events, include city_id as a query parameter.
The backend filters results by joining with theatres and cities tables.

**Think about this:** A movie might be showing in Mumbai but not in Kolkata.
Your shows table handles this perfectly — the movie exists once in the movies table,
but it has show records only for the theatres in cities where it's actually playing.

---

---

# 8. Phase-wise Build Plan

## Important: Build in this exact order.

Each phase builds on the previous. Do not jump ahead.
A working login system is more valuable than a half-built payment system.

---

### Phase 1: Foundation (Week 1–2)
**Goal:** Users can register, log in, and the basic DB is set up.

Backend tasks:
- Set up XAMPP, create the cinebook database
- Create all 9 tables with correct data types and foreign keys
- Initialize Node + Express project, install dependencies
- Set up db.js with mysql2 connection pool
- Build auth routes: POST /register (hash password with bcrypt, insert user) and POST /login (compare hash, return JWT)
- Test all auth routes using Postman or Thunder Client

Frontend tasks:
- Create React app with React Router
- Build Login.jsx and Register.jsx pages with forms
- Build AuthContext to store token and user
- Connect forms to backend API via api.js
- After login, token is stored in localStorage and user is redirected to home

**Milestone:** User can register and log in. Token is stored. Logged-in user's name appears in navbar.

---

### Phase 2: Content Browsing (Week 3–4)
**Goal:** Users can browse movies and events by city.

Backend tasks:
- Build CRUD routes for cities, movies, events (admin-only add/edit/delete, public read)
- Build GET /movies?city_id= with the JOIN query across movies → shows → theatres → cities
- Build GET /movies/:id for full movie detail
- Build GET /trending

Frontend tasks:
- Build CityContext with city selector component
- Build Home.jsx: city-filtered movie grid + trending banner
- Build MovieCard.jsx and EventCard.jsx components
- Build MovieDetail.jsx: display all movie info + embedded YouTube trailer
- Build TrailerEmbed.jsx component

**Milestone:** User selects a city, sees movies, clicks a movie, sees the detail page with trailer playing.

---

### Phase 3: Shows and Seat Booking (Week 5–6)
**Goal:** Users can select seats and complete a booking with payment.

Backend tasks:
- Build shows routes: admin creates shows (and auto-generates seats)
- Build GET /shows/:show_id/seats
- Build POST /bookings (with the transaction + SELECT FOR UPDATE logic)
- Integrate Razorpay: POST /payment/create-order and POST /payment/verify

Frontend tasks:
- On MovieDetail page, display list of shows for selected city
- Build SeatSelection.jsx with SeatGrid component (color-coded available/booked/selected)
- Build Checkout.jsx with order summary
- Integrate Razorpay checkout popup
- Build BookingConfirmation.jsx
- Build MyBookings.jsx for booking history

**Milestone:** Full end-to-end booking works. User selects seats, pays (test mode), sees confirmation.

---

### Phase 4: Admin Panel (Week 7–8)
**Goal:** Admin can manage all content from a dashboard.

Backend tasks:
- Build all admin routes (protected with auth + isAdmin middleware)
- Build reports endpoint: total revenue, bookings per movie, city breakdown

Frontend tasks:
- Build ProtectedRoute.jsx with admin check
- Build ManageMovies.jsx: list + add/edit/delete form (including show assignment)
- Build ManageEvents.jsx: similar to movies
- Build ManageTheatres.jsx: configure rows and seats_per_row
- Build ManageShows.jsx: view and manage show schedules
- Build AdminDashboard.jsx: charts using a library like recharts

**Milestone:** Admin can log in, add a movie with showtimes, and see revenue reports.

---

### Phase 5: Polish and Presentation (Week 9–10)
**Goal:** App is complete, clean, and ready to present.

Tasks:
- Add loading spinners while API calls are in progress
- Add proper error messages (seat unavailable, payment failed, login required)
- Make the UI responsive for mobile screens
- Add form validation on all admin and user forms
- Test every flow end-to-end: register → browse → book → pay → confirm → view booking
- Write a README with setup instructions (how to start XAMPP, run backend, run frontend)
- Prepare a 10-minute demo walkthrough

---

---

# 9. How Things Connect — The Big Picture

## The Request Lifecycle (trace every booking end-to-end)

```
USER CLICKS "Book Now" on a seat selection page

  [React - SeatGrid.jsx]
  User selects 3 seats: A1, A2, A3
  State: selectedSeats = [{seat_id:1, label:'A1'}, {seat_id:2, label:'A2'}, {seat_id:3, label:'A3'}]

        ↓ User clicks "Proceed to Checkout"

  [React - Checkout.jsx]
  Displays: Show info, 3 seats, total = ₹450
  User clicks "Pay Now"
  → calls api.js → createOrder({ amount: 450 })

        ↓ HTTP POST /api/payment/create-order

  [Express - payment.js route]
  → auth middleware: reads JWT from header, verifies, attaches user_id to req.user
  → payment controller: calls Razorpay API, gets order_id back
  → sends { order_id, amount, key_id } back to frontend

        ↓ Response arrives at React

  [React - Checkout.jsx]
  Opens Razorpay popup with order_id and amount
  User enters test card, clicks Pay
  Razorpay calls success handler with { payment_id, order_id, signature }

        ↓ HTTP POST /api/payment/verify

  [Express - payment.js route]
  → auth middleware: verifies JWT again
  → payment controller:
      1. Verifies HMAC signature (security check)
      2. Begins MySQL TRANSACTION
      3. SELECT seats FOR UPDATE (lock them)
      4. Check none are already booked
      5. INSERT into bookings → get booking_id
      6. INSERT into booking_seats (booking_id, seat_id) × 3
      7. UPDATE seats SET is_booked = true WHERE seat_id IN (1,2,3)
      8. UPDATE shows SET available_seats = available_seats - 3
      9. COMMIT
  → sends { booking_id, status: 'confirmed' } back to frontend

        ↓ Response arrives at React

  [React - React Router]
  navigate('/booking-confirmation') with booking data

  [React - BookingConfirmation.jsx]
  Shows booking ID, seats, movie, theatre, date, amount paid
```

---

## JWT Token Lifecycle

```
REGISTER / LOGIN
  → Backend creates JWT: jwt.sign({ user_id, role }, JWT_SECRET, { expiresIn: '7d' })
  → Token sent to frontend

FRONTEND
  → Stores token in localStorage
  → AuthContext reads token on every page load (persist login across refreshes)
  → api.js attaches token to every request: Authorization: Bearer <token>

BACKEND (auth middleware)
  → jwt.verify(token, JWT_SECRET) decodes and validates token
  → If valid: req.user = { user_id, role }
  → If expired or tampered: returns 401

LOGOUT
  → Frontend removes token from localStorage
  → AuthContext resets to logged-out state
```

---

---

# 10. Common Mistakes to Avoid

## Backend Mistakes

**1. Storing plain-text passwords**
Always hash with bcrypt before inserting into DB. This is non-negotiable.

**2. Not using parameterized queries**
Never do: "SELECT * FROM users WHERE email = '" + email + "'"
This is vulnerable to SQL injection. Always use placeholders:
SELECT * FROM users WHERE email = ?

**3. Not handling async errors**
Every async function that touches the DB must be inside try/catch.
An unhandled promise rejection will crash your entire Node server.

**4. Not closing DB connections**
When using a pool, the connection is returned automatically after query completes.
But if you manually acquire a connection, always release it in a finally block.

**5. Exposing .env secrets**
Add .env to your .gitignore. Never push API keys or DB passwords to GitHub.

---

## Frontend Mistakes

**6. Calling APIs directly inside components without api.js**
This leads to duplicated base URLs, missing auth headers, and hard-to-maintain code.
Always go through api.js.

**7. Not handling loading and error states**
If a component fetches data, it has three states: loading, success, error.
Show a spinner during loading. Show an error message on failure. Do not show blank screens.

**8. Mutating state directly**
Never do: user.name = "new name"
Always create a new object: setUser({ ...user, name: "new name" })

**9. Using array index as React key**
When rendering lists with .map(), use a unique ID from your data as the key, not the array index.
key={movie.movie_id} not key={index}

**10. Not cleaning up useEffect**
If you start a timer, open a WebSocket, or add an event listener in useEffect,
return a cleanup function that stops/removes it.
Otherwise you get memory leaks and bugs when the component unmounts.

---

## Database Mistakes

**11. Not using transactions for multi-step operations**
Booking creation involves 4 DB operations. If step 3 fails, steps 1 and 2 must be rolled back.
Without a transaction, you get partial data corruption.

**12. Forgetting indexes**
For large tables, add indexes on frequently queried columns.
Example: INDEX on shows(movie_id), shows(theatre_id), seats(show_id).
Without indexes, full table scans slow your app noticeably.

**13. Using VARCHAR for dates**
Use DATE for dates, TIME for times, DATETIME for timestamps.
Never store "2024-01-15" as a string. You cannot do date comparisons or sorting on strings correctly.

---

---

# 11. Glossary

**REST API** — A way for frontend and backend to communicate using standard HTTP methods
(GET to read, POST to create, PUT to update, DELETE to remove).

**JWT (JSON Web Token)** — A signed token given to a user after login. Contains encoded user info.
The server verifies it on every protected request without needing to check the DB every time.

**Middleware** — A function in Express that runs on every request before it reaches the route handler.
Used for authentication, logging, parsing request bodies, etc.

**Foreign Key** — A column in one table that references the primary key of another table.
Enforces that related records must exist. Prevents orphan data.

**Transaction** — A group of database operations that either ALL succeed or ALL fail together.
Guarantees data consistency even when multiple operations are needed.

**bcrypt** — A hashing algorithm designed specifically for passwords. Slow by design (to prevent brute force).
Adds a random salt to prevent rainbow table attacks.

**Race Condition** — A bug where the result depends on timing. Two users booking the same seat simultaneously
is a race condition. Solved with DB transactions and SELECT FOR UPDATE.

**Axios** — A popular JavaScript library for making HTTP requests.
Works in both browser (React) and Node.js. Easier to use than the built-in fetch API.

**CORS (Cross-Origin Resource Sharing)** — A browser security rule that blocks requests from one domain
to another by default. You must enable CORS on your Express server so React (port 3000) can call it (port 5000).

**SELECT FOR UPDATE** — A SQL clause that locks the selected rows during a transaction.
Other transactions must wait until the lock is released. Prevents double booking.

**ENUM** — A MySQL column type that restricts values to a predefined list.
Used for fields like role ('user','admin') and status ('pending','confirmed','cancelled').

**Environment Variables (.env)** — Configuration values stored outside your code.
API keys, DB passwords, JWT secrets. Never hardcode these. Never commit them to version control.

**Connection Pool** — A set of pre-opened database connections reused across requests.
More efficient than opening a new connection for every single query.

**Parameterized Query** — A database query where user input is passed as separate parameters,
not concatenated into the query string. Prevents SQL injection attacks.

---

*This guide was prepared for the CineBook MCA Final Year Project.*
*Build it yourself. Break it. Fix it. That is how you grow.*