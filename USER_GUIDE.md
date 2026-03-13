# CineBook — User Guide

> Welcome to **CineBook** — your platform for booking movie and event tickets online.  
> This guide explains everything you need to know as a regular user.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Creating an Account](#2-creating-an-account)
3. [Logging In](#3-logging-in)
4. [Browsing Movies](#4-browsing-movies)
5. [Browsing Events](#5-browsing-events)
6. [Booking a Ticket — Step by Step](#6-booking-a-ticket--step-by-step)
7. [Paying with Razorpay](#7-paying-with-razorpay)
8. [Viewing My Bookings](#8-viewing-my-bookings)
9. [Switching Cities](#9-switching-cities)
10. [Logging Out](#10-logging-out)

---

## 1. Getting Started

Open your browser and go to:

```
http://localhost:5173
```

You will see the **CineBook home page** with:
- A **hero banner** showing trending movies/events (auto-changes every 5 seconds)
- A **Now Showing** section with movies available in your city
- An **Events Near You** section

> You can browse movies and events without logging in.  
> You must **log in** to book tickets.

---

## 2. Creating an Account

1. Click **Sign Up** in the top-right corner of the page
2. Fill in the form:

| Field | What to enter |
|-------|--------------|
| Full Name | Your full name |
| Email | Your email address |
| Password | At least 6 characters |
| Confirm Password | Repeat the same password |

3. Click **Create Account**
4. You will be redirected to the Login page

> ✅ Account created! Now log in to start booking.

---

## 3. Logging In

1. Click **Login** in the top-right corner
2. Enter your **email** and **password**
3. Click **Sign In**

After logging in:
- The top-right corner shows your **profile initial** (first letter of your name)
- Click on it to see a dropdown with your name, email, and options

---

## 4. Browsing Movies

### From the Home Page
- Scroll to the **Now Showing** section
- Click any movie card to see its details and book tickets
- Click **See All →** to view the full movie list

### From the Movies Page

Click **Movies** in the top navigation bar, or go to:
```
http://localhost:5173/movies
```

**Filtering movies:**
- 🔍 **Search box** — type any part of the movie title to filter instantly
- **Genre pills** — click a genre (Action, Drama, Comedy…) to filter by genre
- Click **All** to clear the filter

---

## 5. Browsing Events

Click **Events** in the navigation bar, or go to:
```
http://localhost:5173/events
```

Events include concerts 🎵, comedy shows 🎭, sports ⚽, and more.

- Use the **search box** to find events by name
- Use **category pills** (Music, Comedy, Sports…) to filter by type

---

## 6. Booking a Ticket — Step by Step

### Step 1 — Pick a Movie or Event

Click on any movie or event card to open its detail page.

You will see:
- Movie/Event title, poster, and description
- Genre, language, and status (Now Showing / Coming Soon)
- Cast information (for movies)

### Step 2 — Choose a Show Time

Scroll down to the **Book Tickets** section.

Show timings are grouped by date:

```
Friday, 7 March
  [10:00]  [14:30]  [18:00]  [21:30]
  PVR Cinemas     ₹200    Theatre Name
  45 seats left
```

Each slot shows:
- ⏰ Show time
- 🏟️ Theatre name
- ₹ Price per seat
- Number of seats remaining (turns **red** when fewer than 20 left)

Click on a time slot to select it.

> ⚠️ If no shows appear, no shows are scheduled yet in your city. Try switching to a different city.

### Step 3 — Select Your Seats

You will see a **10×10 seat grid** (100 seats total):

| Seat Colour | Meaning |
|-------------|---------|
| Dark grey | Available — click to select |
| 🔴 Red | You have selected this seat |
| Dimmed/striped | Already booked — cannot select |

- Click any available seat to select it (it turns red)
- Click it again to deselect
- You can select **multiple seats** (e.g., book 2 seats for yourself and a friend)

The **bottom bar** shows:
- How many seats you selected
- Total amount (seats × price)

When happy with your selection, click **Proceed to Pay →**

### Step 4 — Review Your Booking

A summary screen shows:

- Venue name
- Show date and time
- Your selected seat labels (e.g., C4, C5)
- Total amount to pay

Click **Pay ₹X via Razorpay** to go to payment.

---

## 7. Paying with Razorpay

A **Razorpay payment window** will pop up.

**Test mode payment (for testing):**

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g., `12/26`) |
| CVV | Any 3 digits (e.g., `123`) |
| OTP | `1234` |

> In test mode, no real money is charged. Use the test card above.

After successful payment:

- ✅ A **"Booking Confirmed!"** screen appears with your seat numbers
- You can click **View My Bookings** to see the ticket

> ⚠️ If you **close the Razorpay window** without paying, your seats are temporarily held. You can go back and try again.

---

## 8. Viewing My Bookings

1. Click on your **profile initial** (top-right corner)
2. Click **🎟️ My Bookings** from the dropdown

Or go directly to:
```
http://localhost:5173/my-bookings
```

Each booking card shows:

| Info | Details |
|------|---------|
| Movie/Event | Title of what you booked |
| Venue | Theatre name |
| Date & Time | Show date and start time |
| Seats | Your seat labels (e.g., B3, B4) |
| Amount | Total amount paid |
| Status | Confirmed ✅ / Pending ⏳ |

---

## 9. Switching Cities

By default, CineBook shows movies and events available in the first city.

**To change your city:**

1. Look at the top navigation bar — you will see a **📍 city selector** dropdown
2. Click on it and select a different city
3. The home page, movies, and events all update **automatically** to show content for that city

Available cities: Mumbai, Delhi, Bangalore, Chennai, Hyderabad

---

## 10. Logging Out

1. Click on your **profile initial** (top-right corner)
2. Click **🚪 Logout** from the dropdown

You will be taken back to the home page as a guest.

---

## Quick Reference

| Action | How to do it |
|--------|-------------|
| Create account | Top-right → Sign Up |
| Log in | Top-right → Login |
| Browse movies | Navbar → Movies |
| Browse events | Navbar → Events |
| Switch city | Navbar → 📍 city dropdown |
| Book a ticket | Movie/Event → pick showtime → select seats → pay |
| View my tickets | Profile icon → My Bookings |
| Log out | Profile icon → Logout |
