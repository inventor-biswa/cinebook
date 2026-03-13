# CineBook — Admin User Guide

> This guide is for **admins** of CineBook.  
> As an admin you can manage all content on the platform — movies, events, theatres, and show schedules.

---

## Table of Contents

1. [How to Log In as Admin](#1-how-to-log-in-as-admin)
2. [The Admin Dashboard](#2-the-admin-dashboard)
3. [Managing Movies](#3-managing-movies)
4. [Managing Events](#4-managing-events)
5. [Managing Theatres](#5-managing-theatres)
6. [Scheduling Shows](#6-scheduling-shows)
7. [Common Workflows](#7-common-workflows)

---

## 1. How to Log In as Admin

1. Go to **`http://localhost:5173/login`**
2. Enter your admin email and password
3. Click **Sign In**

> ✅ If your account has admin role, you will be **automatically redirected to `/admin`** (the Admin Dashboard).  
> ❌ If you see the home page instead, your account is a regular user — ask the developer to run the SQL promotion command.

**Check you're on the admin area:** The left sidebar should show:
- 📊 Dashboard
- 🎬 Movies
- 🎤 Events
- 🏟️ Theatres
- 📅 Shows

---

## 2. The Admin Dashboard

**URL:** `http://localhost:5173/admin`

The Dashboard is your overview page. It shows:

| Card | What it Shows |
|------|--------------|
| **Total Revenue** | Sum of all confirmed booking amounts (₹) |
| **Total Bookings** | Number of bookings ever made |
| **Registered Users** | Total user accounts |
| **Movies** | Number of movies in the system |
| **Events** | Number of events in the system |

Below the stat cards there are **Quick Action** buttons to jump directly to Add Movie, Add Event, Add Theatre, or Schedule Show.

At the bottom, the **10 Most Recent Bookings** table shows:
- Booking ID
- Username who booked
- Movie/Event title
- Amount paid
- Date of booking

---

## 3. Managing Movies

**URL:** `http://localhost:5173/admin/movies`

### View All Movies
All movies are listed in a table with: Title, Genre, Language, Status (Now Showing / Coming Soon), and whether it's Trending.

### Add a New Movie

1. Click the **+ Add Movie** button (top right)
2. Fill in the form:

| Field | Required | Notes |
|-------|----------|-------|
| Title | ✅ Yes | Movie name |
| Genre | No | e.g. Action, Comedy, Drama |
| Language | No | e.g. Hindi, English, Tamil |
| Poster URL | No | Direct link to a poster image |
| Trailer URL | No | YouTube or video link |
| Release Date | No | Date picker |
| Description | No | Movie synopsis |
| Cast | No | Comma-separated actor names |
| Status | ✅ Yes | `Now Showing` or `Coming Soon` |
| Mark as Trending | No | ☑️ Checked = appears in hero banner |

3. Click **Save Movie**

> 💡 **Tip:** The hero banner on the Home page shows movies/events that are marked as **Trending**. Always mark your most popular content as trending.

### Edit a Movie
1. Find the movie in the table
2. Click **Edit** → the same form opens pre-filled
3. Change any fields → click **Save Movie**

### Delete a Movie
1. Click **Delete** next to the movie
2. Confirm the popup

> ⚠️ Deleting a movie will fail if it has **active shows** scheduled. Delete the shows first.

---

## 4. Managing Events

**URL:** `http://localhost:5173/admin/events`

Events are live performances — concerts, comedy shows, sports etc.

The workflow is identical to Movies:

### Add a New Event

1. Click **+ Add Event**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Title | ✅ Yes | Event name |
| Category | No | e.g. Music, Comedy, Sports, Dance |
| Poster URL | No | Direct link to poster image |
| Promo URL | No | Link to promo video |
| Description | No | Event details |

3. Click **Save Event**

### Edit / Delete
Same as movies — click **Edit** or **Delete** in the table row.

---

## 5. Managing Theatres

**URL:** `http://localhost:5173/admin/theatres`

Theatres are the venues where shows happen. A show must be linked to a theatre.

### Add a Theatre

1. Click **+ Add Theatre**
2. Fill in:

| Field | Required | Notes |
|-------|----------|-------|
| Name | ✅ Yes | Theatre name |
| City | ✅ Yes | Select from dropdown |
| Total Seats | No | Defaults to 100 |
| Address | No | Full address |

3. Click **Save Theatre**

> 💡 **Tip:** The seat grid is always 10 rows (A-J) × 10 columns = 100 seats. Keep Total Seats at 100 unless you customise the seat logic.

### Edit / Delete
Same pattern. Deleting a theatre that has scheduled shows will show an error — delete the shows first.

---

## 6. Scheduling Shows

**URL:** `http://localhost:5173/admin/shows`

A **Show** is a specific screening of a movie or event at a specific theatre on a specific date and time.

> 🔑 **Shows are what users actually book tickets for.**  
> Without shows, users cannot book anything even if movies exist.

### Create a Show

1. Click **+ Schedule Show**
2. Fill in the form:

| Field | Required | Notes |
|-------|----------|-------|
| Show Type | ✅ Yes | `Movie` or `Event` — switches the dropdown below |
| Movie / Event | ✅ Yes | Select from the dropdown |
| Theatre | ✅ Yes | Select a theatre |
| Date | ✅ Yes | Show date |
| Time | ✅ Yes | Show start time |
| Price (₹) | ✅ Yes | Ticket price per seat |

3. Click **Schedule Show**

> ✅ **100 seats (A1–J10) are automatically created** in the database when you save a show. Users can immediately start booking.

### Shows Table

The shows table lists all scheduled shows with:
- Title (Movie or Event name)
- Theatre name
- Date and Time
- Price per seat
- **Seats Left** badge (turns red when fewer than 20 seats remain)

### Delete a Show
Click **Delete** → confirm. This removes the show and all seat records for it.

---

## 7. Common Workflows

### Workflow A — Add a new movie and make it bookable

```
1. Go to Movies → Add Movie → fill details → mark as Trending → Save
2. Go to Theatres → confirm you have a theatre (add one if needed)
3. Go to Shows → Schedule Show → pick the movie, theatre, date, time, price → Save
4. Go to home page (click "← Back to Site") — movie appears in hero + grid
5. Click the movie → show timings appear → user can book
```

### Workflow B — Add a live event

```
1. Go to Events → Add Event → fill details → Save
2. Go to Shows → Schedule Show → switch to "Event" → pick your event → Save
3. Event now appears in "Events Near You" on the home page
```

### Workflow C — Check recent bookings

```
1. Go to Dashboard → scroll down to "Recent Bookings" table
2. Shows the 10 most recent bookings with user name, title, and amount
```

### Workflow D — Monitor low seat availability

```
1. Go to Shows
2. Look at the "Seats Left" column
3. Red badge = fewer than 20 seats remaining
4. Consider scheduling another show for popular content
```
