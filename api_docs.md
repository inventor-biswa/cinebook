# CineBook — Backend API Reference

> **Base URL (Development):** `http://localhost:5000/api`  
> **Auth:** Protected routes require `Authorization: Bearer <JWT_TOKEN>` header.  
> **JWT obtained from:** `POST /api/auth/login`

---

## Authentication

### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "Biswa Kumar",
  "email": "biswa@cinebook.com",
  "password": "secret123"
}
```
**Response `201`:**
```json
{ "message": "Registration successful.", "user_id": 5 }
```
**Errors:** `400` (missing fields), `409` (email already exists)

---

### `POST /api/auth/login`
Log in and receive a JWT.

**Request Body:**
```json
{ "email": "biswa@cinebook.com", "password": "secret123" }
```
**Response `200`:**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": { "user_id": 5, "name": "Biswa Kumar", "email": "biswa@cinebook.com", "role": "user" }
}
```
**Errors:** `400` (missing fields), `401` (invalid credentials)

---

## Cities

### `GET /api/cities`
Returns all cities for the city-selector dropdown. **No auth required.**

**Response `200`:**
```json
[
  { "city_id": 1, "name": "Mumbai" },
  { "city_id": 2, "name": "Delhi" }
]
```

---

## Movies

### `GET /api/movies`
Get all movies. Optional `city_id` query param filters by city (only movies with shows in that city).

**Query Params:** `?city_id=1` *(optional)*

**Response `200`:**
```json
[
  {
    "movie_id": 1, "title": "Inception", "genre": "Sci-Fi",
    "language": "English", "poster_url": "...", "release_date": "2010-07-16",
    "is_trending": 1, "status": "now_showing"
  }
]
```

---

### `GET /api/movies/trending`
Get trending movies AND events combined. Used for the home page banner/carousel.

> ⚠️ This route **must** be called before `/api/movies/:id` as it has priority in routing.

**Response `200`:**
```json
[
  { "id": 1, "title": "Inception", "poster_url": "...", "type": "movie" },
  { "id": 1, "title": "Coldplay Live Mumbai", "poster_url": "...", "type": "event" }
]
```

---

### `GET /api/movies/:id`
Get full details of a single movie + its upcoming shows.

**Query Params:** `?city_id=1` *(optional, filters shows by city)*

**Response `200`:**
```json
{
  "movie_id": 1, "title": "Inception", "genre": "Sci-Fi",
  "description": "A mind-bending thriller.",
  "cast_info": "Leonardo DiCaprio",
  "poster_url": "...", "trailer_url": "...",
  "shows": [
    {
      "show_id": 10, "show_date": "2026-03-10", "show_time": "18:30:00",
      "price": 350, "available_seats": 98,
      "theatre_name": "PVR Juhu", "theatre_id": 2, "city_name": "Mumbai"
    }
  ]
}
```
**Errors:** `404` (movie not found)

---

## Events

### `GET /api/events`
Get all events. Optional `city_id` param filters by city.

**Query Params:** `?city_id=1` *(optional)*

**Response `200`:**
```json
[
  { "event_id": 1, "title": "Coldplay Live Mumbai", "category": "Music", "poster_url": "...", "is_trending": 1 }
]
```

---

### `GET /api/events/:id`
Get full event details + its upcoming shows.

**Query Params:** `?city_id=1` *(optional)*

**Response `200`:** Same structure as `/api/movies/:id` but with event fields.

---

## Shows

### `GET /api/shows/:id/seats`
Get the seat layout for a specific show. Used on the Seat Selection page.

**Response `200`:**
```json
{
  "show": {
    "show_id": 10, "show_date": "2026-03-10", "show_time": "18:30:00",
    "price": 350, "available_seats": 98,
    "theatre_name": "PVR Juhu"
  },
  "seats": [
    { "seat_id": 101, "seat_label": "A1", "is_booked": false },
    { "seat_id": 102, "seat_label": "A2", "is_booked": true }
  ]
}
```
**Errors:** `404` (show not found)

---

## Bookings 🔐

> All booking routes require `Authorization: Bearer <token>`.

### `POST /api/bookings`
Book one or more seats for a show. Protected by a DB transaction to prevent double-booking.

**Request Body:**
```json
{ "show_id": 10, "seat_ids": [101, 103, 105] }
```
**Response `201`:**
```json
{
  "message": "Booking created successfully. Status is pending payment.",
  "booking_id": 42,
  "total_amount": 1050
}
```
**Errors:** `400` (seats already booked / invalid), `401` (no token)

> **Flow:** After this, call `POST /api/payment/create-order` with the returned `booking_id`.

---

### `GET /api/bookings`
Get all bookings for the currently logged-in user.

**Response `200`:**
```json
[
  {
    "booking_id": 42, "total_amount": 1050, "status": "confirmed",
    "booked_at": "2026-03-05T15:00:00Z",
    "show_date": "2026-03-10", "show_time": "18:30:00",
    "theatre_name": "PVR Juhu",
    "title": "Inception",
    "seat_labels": "A1,A3,A5"
  }
]
```

---

## Payments 🔐

> All payment routes require `Authorization: Bearer <token>`.

### `POST /api/payment/create-order`
Creates a Razorpay order for a pending booking. Call this to launch the Razorpay checkout UI.

**Request Body:**
```json
{ "booking_id": 42 }
```
**Response `200`:**
```json
{
  "order_id": "order_PQ1234xyz",
  "amount": 105000,
  "currency": "INR"
}
```
> `amount` is in **paise** (INR × 100). Pass this directly to the Razorpay JS SDK.

---

### `POST /api/payment/verify`
Called by the frontend after the Razorpay payment dialog succeeds. Verifies the SHA256 signature cryptographically and confirms the booking.

**Request Body:**
```json
{
  "razorpay_order_id": "order_PQ1234xyz",
  "razorpay_payment_id": "pay_ABC123",
  "razorpay_signature": "abc123signature...",
  "booking_id": 42
}
```
**Response `200`:**
```json
{ "message": "Payment verified successfully. Booking confirmed!" }
```
**Errors:** `400` (invalid signature / already processed)

---

## Admin Routes 🔐🛡️

> All admin routes require both `Authorization: Bearer <token>` **AND** the user's `role` must be `"admin"`.  
> **401** → Missing/invalid token | **403** → Valid token but not admin.

---

### Movies Admin

| Method | URL | Body Fields | Action |
|--------|-----|-------------|--------|
| `GET` | `/api/admin/movies` | — | List all movies |
| `POST` | `/api/admin/movies` | `title`*, `genre`, `language`, `description`, `cast_info`, `poster_url`, `trailer_url`, `release_date`, `is_trending`, `status` | Create movie |
| `PUT` | `/api/admin/movies/:id` | Same as POST | Update movie |
| `DELETE` | `/api/admin/movies/:id` | — | Delete (fails with 400 if it has shows) |

**`status` values:** `"coming_soon"` | `"now_showing"` | `"past"`

---

### Events Admin

| Method | URL | Body Fields | Action |
|--------|-----|-------------|--------|
| `GET` | `/api/admin/events` | — | List all events |
| `POST` | `/api/admin/events` | `title`*, `category`*, `description`, `poster_url`, `is_trending` | Create event |
| `PUT` | `/api/admin/events/:id` | Same as POST | Update event |
| `DELETE` | `/api/admin/events/:id` | — | Delete |

---

### Theatres Admin

| Method | URL | Body Fields | Action |
|--------|-----|-------------|--------|
| `GET` | `/api/admin/theatres` | — | List all theatres (includes `city_name`) |
| `POST` | `/api/admin/theatres` | `city_id`*, `name`*, `address`*, `layout_plan` | Create theatre |
| `PUT` | `/api/admin/theatres/:id` | Same as POST | Update theatre |
| `DELETE` | `/api/admin/theatres/:id` | — | Delete |

---

### Shows Admin

| Method | URL | Body Fields | Action |
|--------|-----|-------------|--------|
| `GET` | `/api/admin/shows` | — | List all shows (with title, theatre, city) |
| `POST` | `/api/admin/shows` | `theatre_id`*, `show_date`*, `show_time`*, `price`*, `movie_id` OR `event_id` | Create show **+ auto-generates 100 seats (A1-J10)** |
| `DELETE` | `/api/admin/shows/:id` | — | Delete (cascades — deletes seats too) |

---

### Reports Admin

| Method | URL | Response |
|--------|-----|----------|
| `GET` | `/api/admin/reports/stats` | `{ revenue, bookings, users, movies, events }` |
| `GET` | `/api/admin/reports/revenue-by-item` | Array: `[{ title, revenue, ticket_count }]` |
| `GET` | `/api/admin/reports/recent` | Last 10 bookings: `[{ booking_id, user_name, title, total_amount, booked_at }]` |

---

## Frontend Integration Flow

```
1. Page Load
   └─ GET /api/cities         → populate city selector

2. Home Page
   └─ GET /api/movies/trending → banner carousel
   └─ GET /api/movies?city_id=X → movie grid
   └─ GET /api/events?city_id=X → events grid

3. Movie Detail Page
   └─ GET /api/movies/:id?city_id=X → movie info + show list

4. Seat Selection Page
   └─ GET /api/shows/:id/seats → seat grid

5. Booking Flow (User must be logged in)
   └─ POST /api/bookings       → lock seats, get booking_id + amount
   └─ POST /api/payment/create-order  → get Razorpay order_id
   └─ [Razorpay Checkout UI runs]
   └─ POST /api/payment/verify → confirm booking

6. My Bookings Page
   └─ GET /api/bookings        → booking history

7. Admin Dashboard
   └─ GET /api/admin/reports/stats
   └─ GET /api/admin/reports/recent
   └─ GET /api/admin/movies | events | theatres | shows
```
