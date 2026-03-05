# Project Setup Commands and Logs

This file documents every command used to set up the CineBook project, along with the reasoning behind each step.

---

## 1. Database & GUI Installation (Alternative to XAMPP)

Since XAMPP is quite heavy and installs unnecessary services (like Apache and PHP), we are opting for a native, lightweight approach tailored for a Node.js project on Linux.

### Installing MySQL Server natively
We installed the standalone MySQL database engine. It runs quietly in the background as a Linux service and uses very little RAM.

**Command Executed:**
```bash
sudo apt update && sudo apt install mysql-server -y
```

### Installing Beekeeper Studio
Instead of phpMyAdmin, we installed Beekeeper Studio. It is a modern, clean, and lightweight cross-platform GUI that makes it very easy to view and manage tables, run queries, and design the database.

**Commands Executed:**
```bash
# Add Beekeeper Studio security key and repository
wget --quiet -O - https://deb.beekeeperstudio.io/beekeeper.key | sudo apt-key add -
echo "deb https://deb.beekeeperstudio.io stable main" | sudo tee /etc/apt/sources.list.d/beekeeper-studio-app.list

# Update package list and install
sudo apt update
sudo apt install beekeeper-studio -y
```

*Status:* Both MySQL Server and Beekeeper Studio installed successfully.

---

### 2. Database Creation & Configuration

We configured the database to use the default `auth_socket` authentication (no password needed for local `root` user). We also created the `cinebook` database.

**Command Executed:**
```bash
sudo mysql -e "CREATE DATABASE IF NOT EXISTS cinebook;"
```

### 3. How to use Beekeeper Studio (The GUI)

To view your tables visually without typing MySQL commands:

1. Open **Beekeeper Studio** from your Ubuntu application menu.
2. Click **New Connection**.
3. Select **MySQL**.
4. Fill in these exact details:
   - **Host:** `localhost`
   - **Port:** `3306`
   - **User:** `root`
   - **Password:** *[Leave completely blank]*
   - **Database:** `cinebook`
5. Click **Connect**. 

You will now see the `cinebook` database on the left sidebar. As we build the backend and run migrations, your tables will automatically appear here!

---
Fixing Beekeeper Studio root access denied issue by changing MySQL authentication method

Ran command
~/Booking_project $ sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY ''; FLUSH PRIVILEGES;"

---

## 2. Backend Initialization

We structured the `backend` folder according to `flow_v1.md` and installed the necessary Node.js packages to handle our API, database connection, security, and authentication.

### Installing Node.js and npm
Since Node.js was not installed on the system, we installed it first.
```bash
sudo apt update && sudo apt install nodejs npm -y
```

### Initializing the Backend Project
We created the folder structure to separate routing, controllers, configuration, and middleware. Then, we initialized the project and installed our core packages.
- `express`: The web server framework.
- `mysql2`: To connect to MySQL and use connection pools.
- `cors`: Allows the React frontend to communicate with the backend.
- `dotenv`: To load variables from a `.env` file securely.
- `bcrypt`: To hash and verify user passwords securely.
- `jsonwebtoken`: To generate and read JWT tokens for login sessions.

**Commands Executed:**
```bash
# Create the standard folder structure inside backend
mkdir -p backend/config backend/middleware backend/routes/admin backend/controllers/admin

# Initialize the project and install dependencies
cd backend
npm init -y
npm install express mysql2 cors dotenv bcrypt jsonwebtoken

# Note: After upgrading Node.js to v22 (during frontend setup), we re-ran npm install 
# inside the backend folder to ensure package-lock.json accurately reflects the v22 environment.
```

---

## 3. Frontend Initialization

We initialized a new React project inside the `frontend` folder. Since `create-react-app` is outdated and slow, we used **Vite**, which provides a lightning-fast modern development environment (especially important since you mentioned your laptop struggles with heavy applications like XAMPP).

**Commands Executed:**
```bash
# Create the frontend project using Vite's React template
# Node.js 20+ is required for Vite 7. If the system has an older version (like Node 18 on Ubuntu 24.04), we must install nvm and upgrade Node first:
# curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# nvm install 22 && nvm use 22 && nvm alias default 22

npx -y create-vite@latest frontend --template react

# Move into the folder and install routing and API packages
cd frontend
npm install react-router-dom axios

# Create the standard frontend folder structure
mkdir -p src/pages/admin src/components src/context src/services
```

We now have the foundation completely ready to start Phase 1.

---

## 4. Phase 1: Database Setup and Connections

### Environment Configuration
We created `backend/.env` to hold the secret MySQL credentials, server port, and JWT secrets so they aren't hardcoded in the application.

### Database Connection Pool
We created `backend/config/db.js` using the `mysql2/promise` library. A **connection pool** was chosen over a single connection because it allows multiple simultaneous API requests to fetch data without blocking each other.

### Automated Schema Creation
Instead of manually typing SQL commands one by one, we created an initialization script (`backend/init_db.js`). This script automatically drops/recreates all 9 tables in the exact order required by Foreign Keys (Cities -> Theatres -> Movies -> Events -> Shows -> Seats -> Users -> Bookings -> Booking_Seats).

**Command Executed:**
```bash
node init_db.js
```
*Result:* All 9 tables have been successfully created inside the `cinebook` database. You can view them right now by refreshing your Beekeeper Studio connection!

---

## 5. Phase 1: Backend — server.js (Entry Point)

`backend/server.js` is the very first file Node.js runs. It is the heart of the Express app.

### What it does:
- `app.use(cors())` — Allows the React frontend (port 5173) to call this API without browser CORS errors.
- `app.use(express.json())` — Tells Express to automatically parse incoming JSON request bodies so controllers can read `req.body`.
- `GET /api/health` — A test endpoint to check if the API server is alive without needing a database.
- Route imports are included as **commented-out placeholders** and will be uncommented one by one as each route is built.

### How to test the server is running:
```bash
# Start the server
node server.js

# In another terminal, test the health check endpoint
curl http://localhost:5000/api/health
# Expected response: {"status":"OK","message":"CineBook API is running!"}
```

---

## 6. Phase 1: Backend — middleware/auth.js (JWT Verification)

`backend/middleware/auth.js` is a reusable function that sits **in front of every protected route**.

### How it works (step by step):
1. Reads the `Authorization` header from the request (format: `Bearer <token>`)
2. If missing → returns **401 Unauthorized** immediately
3. Splits out just the token string after `"Bearer "`
4. Calls `jwt.verify(token, JWT_SECRET)` — if the token is valid, it decodes it into `{ user_id, role }`
5. Attaches that decoded object to `req.user` — so any controller after this can access `req.user.user_id` or `req.user.role`
6. Calls `next()` to hand off to the controller that follows

### Why it's a middleware (not code inside each route):
Without this pattern, every protected controller would need to duplicate the token-check logic.
With middleware, one function handles it for all protected routes by plugging it in like:
```js
router.get('/bookings', auth, getMyBookings)
//                       ^^^^
//               This runs auth.js first
```

---

## 7. Phase 1: Backend — middleware/isAdmin.js (Role Check)

`backend/middleware/isAdmin.js` runs **after** `auth.js`. It checks that the logged-in user is an admin.

### Key design decision — 401 vs 403:
| Code | Meaning |
|------|---------|
| **401** Unauthorized | "Who are you?" — No token or invalid token |
| **403** Forbidden | "I know who you are, but you can't do this" — Logged in, but not admin |

### Usage on admin-only routes:
```js
router.delete('/movies/:id', auth, isAdmin, deleteMovie)
//                            ^^^^  ^^^^^^^
//                  Must be logged in AND admin
```

### The Foundation layer is now complete:
- `server.js` → starts the Express app
- `config/db.js` → connects to MySQL
- `middleware/auth.js` → verifies all logged-in users
- `middleware/isAdmin.js` → restricts admin-only routes

---

## 8. Phase 1: Backend — controllers/auth.controller.js

Contains two exported functions: `register` and `login`.

### register (POST /api/auth/register)
1. Validate that `name`, `email`, `password` are all present.
2. Check DB for duplicate email → return **409 Conflict** if found.
3. Hash password with `bcrypt.hash(password, 10)` — the `10` is salt rounds.
4. `INSERT` new user row, return `201 Created` with the new `user_id`.

### login (POST /api/auth/login)
1. Find user by email in DB.
2. If not found → return `401` with vague message *(security: never reveal if an email exists)*.
3. `bcrypt.compare(entered_password, stored_hash)` — if no match → same vague `401`.
4. Sign a JWT: `jwt.sign({ user_id, role }, JWT_SECRET, { expiresIn: '7d' })`.
5. Return token + sanitized user object *(no password_hash in response)*.

---

## 9. Phase 1: Backend — routes/auth.js + server.js wired

`backend/routes/auth.js` simply maps HTTP verbs + paths to controller functions:
```js
router.post('/register', register);
router.post('/login',    login);
```

`server.js` was updated to import and mount this router under `/api/auth`:
```js
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
```

Final URLs exposed:
| Method | URL | Action |
|--------|-----|--------|
| POST | `/api/auth/register` | Create new user |
| POST | `/api/auth/login` | Login, return JWT |

### How to test manually:
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

---

## 10. Phase 1: Backend — Movies Controller & Routes

### controllers/movies.controller.js (3 functions)

| Function | Endpoint | What it does |
|----------|----------|-------------|
| `getAllMovies` | `GET /api/movies?city_id=1` | JOINs movies→shows→theatres→cities, returns `now_showing` movies in that city |
| `getMovieById` | `GET /api/movies/:id` | Returns full movie details + upcoming shows (optionally city-filtered) |
| `getTrending` | `GET /api/movies/trending` | Returns all trending movies AND events combined (for the home page banner) |

### Important route ordering in routes/movies.js:
```js
router.get('/trending', getTrending); // MUST be first
router.get('/',         getAllMovies);
router.get('/:id',      getMovieById); // :id would swallow "trending" if placed first
```

### server.js updated:
```js
const moviesRoutes = require('./routes/movies');
app.use('/api/movies', moviesRoutes);
```

---

## 11. Phase 1: Backend — Events Controller & Routes

Events follow the **exact same pattern** as movies (city-filtered JOIN, full detail + shows).

| Function | Endpoint | What it does |
|----------|----------|-------------|
| `getAllEvents` | `GET /api/events?city_id=1` | Returns events that have shows in the given city |
| `getEventById` | `GET /api/events/:id` | Returns full event + upcoming shows |

> **Note:** No separate `/trending` route for events — they are already included in `GET /api/movies/trending` which returns both movies and events together.

---

## 12. Phase 1: Backend — routes/events.js + server.js wired

```js
router.get('/',    getAllEvents);  // GET /api/events?city_id=1
router.get('/:id', getEventById); // GET /api/events/:id
```

### server.js updated:
```js
const eventsRoutes = require('./routes/events');
app.use('/api/events', eventsRoutes);
```

| Method | URL | Action |
|--------|-----|--------|
| GET | `/api/events` | All events |
| GET | `/api/events?city_id=1` | Events in a city |
| GET | `/api/events/:id` | Full event + upcoming shows |

---

## 13. Phase 1: Backend — Cities Controller & Routes

The cities module provides a minimal public data feed for the frontend city-selector dropdown.

### `controllers/cities.controller.js`
- `getAllCities`: Issues a simple `SELECT city_id, name FROM cities ORDER BY name ASC` and returns the alphabetically sorted list of cities.

### `routes/cities.js` + `server.js` wired
```js
router.get('/', getAllCities);
// ... inside server.js:
app.use('/api/cities', citiesRoutes);
```

| Method | URL | Action |
|--------|-----|--------|
| GET | `/api/cities` | Returns all available cities |

---

## 14. Phase 1: Backend — Shows Controller & Routes

The shows module connects the frontend seat-selection screen to the `seats` table for real-time booking status.

### `controllers/shows.controller.js`
- `getShowSeats`: Takes a `:id` (representing `show_id`).
  1. Fetches show-specific details (date, time, price, theatre name).
  2. Fetches all seats belonging to that show, including their `is_booked` flag.
  3. Returns a combined `{ show, seats }` object.

### `routes/shows.js` + `server.js` wired
```js
router.get('/:id/seats', getShowSeats);
// ... inside server.js:
app.use('/api/shows', showsRoutes);
```

| Method | URL | Action |
|--------|-----|--------|
| GET | `/api/shows/:id/seats` | Gets show metadata and layout of all seats |

---

## 15. Phase 1: Backend — Bookings Controller (Transactions & Locks)

Booking seats is the most complex operation in the app because of **Concurrency**. If two users click "Book" on the exact same seat at the exact same millisecond, they could both end up getting it. We solved this using a **MySQL Transaction + Row Locks**.

### `controllers/bookings.controller.js` -> `createBooking`
1. **`connection.beginTransaction()`**: Starts an all-or-nothing operation. If any line of code fails, the entire database rolls back to its previous state.
2. **`FOR UPDATE` lock on Show**: We query the price and available seats with `FOR UPDATE`. This prevents other simultaneous bookings from changing the seat count while we are working.
3. **`FOR UPDATE` lock on Seats**: We fetch the requested seats array with `FOR UPDATE`. If any seat's `is_booked` is already true, we throw an error.
4. **Insert Booking (Pending)**: We create the order in `pending` state.
5. **Update Tables**: We set the seats to `is_booked = true`, insert rows into `booking_seats` (junction table), and decrement the `available_seats` count in the `shows` table.
6. **`connection.commit()`**: Saves all the changes simultaneously.

### `routes/bookings.js` + `server.js` wired
```js
router.post('/', auth, createBooking);
router.get('/', auth, getMyBookings);
```

| Method | URL | Auth Required? | Action |
|--------|-----|----------------|--------|
| POST | `/api/bookings` | Yes | Locks seat and creates pending booking |
| GET | `/api/bookings` | Yes | Returns user's booking history |

---

## 16. Phase 1: Backend — Payments Controller (Razorpay)

This module handles real monetary transactions by tying the pending bookings to India's Razorpay payment gateway.

### `controllers/payment.controller.js`
It exposes two critical functions:
1. **`createOrder`**:
   - Takes a `booking_id`. Verifies the user owns it and it's still `pending`.
   - Asks Razorpay to create an order. Converts the INR amount to **paise** (`amount * 100`).
   - Returns the Razorpay `order_id` back to the frontend to launch the checkout UI.
2. **`verifyPayment`**:
   - Called by the frontend right after Razorpay processes a card/UPI payment.
   - Takes the Razorpay signature and **cryptographically hashes it** using the `KEY_SECRET` stored in the `.env` file (which only our server knows).
   - If the hash matches, the payment is guaranteed to be authentic.
   - We then update the booking in the DB to `status = 'confirmed'`.

### `routes/payment.js` + `server.js` wired
```js
router.post('/create-order', auth, createOrder);
router.post('/verify', auth, verifyPayment);
// ... inside server.js:
app.use('/api/payment', paymentRoutes);
```

| Method | URL | Auth Required | Action |
|--------|-----|---------------|--------|
| POST | `/api/payment/create-order` | Yes | Starts a Razorpay transaction |
| POST | `/api/payment/verify` | Yes | Authenticates Razorpay webhook and confirms booking |

---

## 17. Phase 1: Backend — Admin Movies (CRUD)

This module handles creating, reading, updating, and deleting (CRUD) movies from the database. It is intended strictly for the admin dashboard.

### Security
All routes in this module are protected by a dual-middleware layer in `routes/admin/movies.js`:
```js
// Ensures the user has a valid JWT, AND has role === 'admin'
router.use(auth, isAdmin);
```

### `controllers/admin/movies.controller.js`
- **`getAllMovies`**: Returns all movies (unlike the public route, this might eventually include soft-deleted movies or draft movies).
- **`createMovie`**: Inserts a new row. Default status is `coming_soon`, default `is_trending` is `false`.
- **`updateMovie`**: Edits an existing movie.
- **`deleteMovie`**: Deletes a movie from the DB. **Note:** This explicitly checks for MySQL error `1451` (foreign key constraint) and returns a user-friendly 400 error ("Cannot delete movie because it has associated shows") instead of crashing.

| Method | URL | Auth Required | Admin Required | Action |
|--------|-----|---------------|----------------|--------|
| GET | `/api/admin/movies` | Yes | Yes | List all movies |
| POST | `/api/admin/movies` | Yes | Yes | Create a new movie |
| PUT | `/api/admin/movies/:id` | Yes | Yes | Update a movie |
| DELETE | `/api/admin/movies/:id` | Yes | Yes | Delete a movie |

---

## 18. Phase 1: Backend — Admin Events (CRUD)

Behaves identically to the Admin Movies module, providing CRUD operations for concerts, comedy shows, and other events.

### `controllers/admin/events.controller.js`
- **`getAllEvents`**: Returns all events ordered by creation date.
- **`createEvent`**: Checks that `title` and `category` are provided.
- **`updateEvent`**: Replaces the event data.
- **`deleteEvent`**: Also catches the MySQL `1451` constraint error to prevent deleting an event that has active shows, returning a friendly 400 response.

### `routes/admin/events.js` + `server.js` wired
```js
// Protected by dual auth
router.use(auth, isAdmin);

router.get('/', getAllEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

// ... inside server.js:
app.use('/api/admin/events', adminEventsRoutes);
```

| Method | URL | Auth Required | Admin Required | Action |
|--------|-----|---------------|----------------|--------|
| GET | `/api/admin/events` | Yes | Yes | List all events |
| POST | `/api/admin/events` | Yes | Yes | Create a new event |
| PUT | `/api/admin/events/:id` | Yes | Yes | Update an event |
| DELETE | `/api/admin/events/:id` | Yes | Yes | Delete an event |

---

## 19. Phase 1: Backend — Admin Theatres (CRUD)

Manages the physical locations (venues) where movies and events are hosted.

### `controllers/admin/theatres.controller.js`
- **`getAllTheatres`**: Executes a `JOIN` with the `cities` table to return the actual `city_name` alongside the `city_id`, making it much easier for the admin frontend dashboard to display the data.
- **`createTheatre`**: Requires `city_id`, `name`, and `address`. `layout_plan` (JSON for the physical shape of the theatre) is optional.
- **`updateTheatre`**: Standard SQL `UPDATE`.
- **`deleteTheatre`**: Protected by a catch for MySQL error `1451` (so you can't accidentally delete a theatre that has active shows booked).

### `routes/admin/theatres.js` + `server.js` wired
```js
// Protected by dual auth
router.use(auth, isAdmin);

router.get('/', getAllTheatres);
router.post('/', createTheatre);
router.put('/:id', updateTheatre);
router.delete('/:id', deleteTheatre);

// ... inside server.js:
app.use('/api/admin/theatres', adminTheatresRoutes);
```

| Method | URL | Auth Required | Admin Required | Action |
|--------|-----|---------------|----------------|--------|
| GET | `/api/admin/theatres` | Yes | Yes | List all theatres (with city names) |
| POST | `/api/admin/theatres` | Yes | Yes | Create a new theatre |
| PUT | `/api/admin/theatres/:id` | Yes | Yes | Update a theatre |
| DELETE | `/api/admin/theatres/:id` | Yes | Yes | Delete a theatre |

---

## 20. Phase 1: Backend — Admin Shows(CRUD) + Auto Seat Generation

The Shows module is the only part of the admin panel that does heavy lifting during creation. Instead of manually adding 100 seats per show, the backend does this automatically.

### `controllers/admin/shows.controller.js`
- **`getAllShows`**: Joins with `theatres`, `cities`, `movies`, and `events` to return a human-readable list for the dashboard table.
- **`createShow`**: 
    1. Starts a **MySQL Transaction**.
    2. Inserts the show record.
    3. Runs a large batch insert to generate **100 seats** labeled A1-A10, B1-B10, ..., J1-J10.
    4. Commits the transaction.
- **`deleteShow`**: Deleting a show automatically triggers an `ON DELETE CASCADE` in the database, which deletes all the seats for that show as well.

### `routes/admin/shows.js` + `server.js` wired
```js
// Protected by dual auth
router.use(auth, isAdmin);

router.get('/', getAllShows);
router.post('/', createShow);
router.delete('/:id', deleteShow);

// ... inside server.js:
app.use('/api/admin/shows', adminShowsRoutes);
```

| Method | URL | Auth Required | Admin Required | Action |
|--------|-----|---------------|----------------|--------|
| GET | `/api/admin/shows` | Yes | Yes | List all shows |
| POST | `/api/admin/shows` | Yes | Yes | Create a show (generates 100 seats) |
| DELETE | `/api/admin/shows/:id` | Yes | Yes | Delete a show (cascades delete seats) |

---

## 21. Phase 1: Backend — Admin Reports & Analytics

The final piece of the backend provides the data needed for the Admin Dashboard visualizations.

### `controllers/admin/reports.controller.js`
- **`getStats`**: Aggregates total revenue, confirmed booking count, total user count, and inventory counts (movies/events).
- **`getRevenueByItem`**: Groups confirmed bookings by movie/event title to show which content is generating the most money.
- **`getRecentBookings`**: Returns the 10 most recent transactions across the whole platform.

### `routes/admin/reports.js` + `server.js` wired
```js
// Protected by dual auth
router.use(auth, isAdmin);

router.get('/stats', getStats);
router.get('/revenue-by-item', getRevenueByItem);
router.get('/recent', getRecentBookings);

// ... inside server.js:
app.use('/api/admin/reports', adminReportsRoutes);
```

| Method | URL | Action |
|--------|-----|--------|
| GET | `/api/admin/reports/stats` | High-level business metrics |
| GET | `/api/admin/reports/revenue-by-item` | Revenue breakdown by movie/event |
| GET | `/api/admin/reports/recent` | List of 10 most recent bookings |

---

**BACKEND INFRASTRUCTURE IS NOW COMPLETE.**
Next step: Phase 2 — Frontend Development.
