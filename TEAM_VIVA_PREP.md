# 🎬 CineBook / QwikShow — Team Viva Preparation Guide

> **Project**: QwikShow — An online movie and event booking system  
> **Stack**: React (Frontend) · Node.js + Express (Backend) · MySQL (Database)  
> **Purpose**: This document prepares each team member with natural, role-specific Q&A so they can confidently explain their contributions.

---

## 📌 How to Use This Guide

- Read your section thoroughly **2–3 times**.
- Don't memorize word-for-word — understand the *idea*, then speak in your own words.
- Know the **"why"** behind every decision you made.
- Be ready to draw a rough diagram if asked (component structure, ER diagram, API flow).

---

---

# 👤 CHITTARANJAN MAHARANA & OMM PRAKASH PANDA
## Role: Front-End Developer

---

### Q1. What was your role in the QwikShow project?

**A:**  
I worked as a front-end developer. My main responsibility was to build the user interface — everything the user actually sees and interacts with. I designed the layout using HTML, CSS, and JavaScript (React), and I also integrated the frontend with the backend APIs so the data could flow correctly. For example, I connected the movie listing page to the API that fetches available movies, and I handled the booking flow on the UI side.

---

### Q2. Which pages or components did you build?

**A:**  
I built several key pages:
- **Home Page** — Displays featured movies and events.
- **Movie Listing Page** — Shows all available movies with filters.
- **Seat Selection UI** — An interactive grid where users can pick their seats.
- **Booking Confirmation Page** — Summarizes the booking and shows the QR code after confirmation.
- **User Profile Page** — Displays booking history and reward points.

Each page was built as a React component so it was reusable and modular.

---

### Q3. Why did you use React for the frontend?

**A:**  
React made it easy to build a dynamic, component-based UI. Since our application had lots of interactive parts — like the seat selection grid updating in real time — React's state management made it much simpler. Also, React's virtual DOM ensures the page updates efficiently without reloading. It also made it easy for the backend team to integrate APIs through `fetch` or `axios` calls.

---

### Q4. How did you integrate the frontend with the backend?

**A:**  
I used `axios` to make HTTP requests to our backend REST APIs. For example, when a user opens the movie listing page, the component calls a `GET /api/movies` endpoint, gets the JSON response, and renders the movie cards dynamically. For protected routes like booking, we passed the JWT token stored in `localStorage` in the request header so the backend could verify the user.

---

### Q5. How did you handle the seat selection UI?

**A:**  
The seat selection was one of the trickier parts. I built a grid layout using CSS where each seat was a clickable element. When a seat was already booked, it came from the backend as `status: "booked"` and I styled it differently (greyed out, non-clickable). When a user clicks an available seat, it gets highlighted and added to a local state array. On confirmation, those seat IDs are sent to the backend booking API.

---

### Q6. What challenges did you face on the frontend?

**A:**  
One challenge was making sure the seat state stayed consistent — if the user went back and came forward, the selection shouldn't reset unexpectedly. I solved this by lifting the state up to a parent component. Another challenge was handling loading states: when the API was slow, we needed to show a spinner instead of a blank page, so I added a `loading` boolean in the state.

---

### Q7. How did you make the UI responsive?

**A:**  
I used CSS Flexbox and Grid for layout so the pages could adapt to different screen sizes. I also used media queries to adjust font sizes and column counts for mobile vs. desktop. For the seat grid specifically, I made the seat boxes shrink on smaller screens while still being tappable.

---

### Q8. What is the role of `useEffect` in your components?

**A:**  
`useEffect` is used to perform side effects — things like fetching data from the API when a component loads. For example, in the Movie Listing page, `useEffect` runs when the component mounts and triggers the API call to get the movie list. Without `useEffect`, the call would run on every re-render, which would cause infinite loops or unnecessary requests.

---

### Q9. How did you display the QR code after booking?

**A:**  
After the booking confirmation API responded with a success status, the backend returned a QR code image (or we generated it on the frontend using the booking ID). I displayed it using an `<img>` tag inside the Booking Confirmation component. This QR code acts as the user's digital ticket, which can be scanned at the venue.

---

### Q10. What is props vs state in React? Give an example from your project.

**A:**  
**State** is data that a component manages internally and can change over time. **Props** are data passed from a parent to a child component.  
In our project: the seat grid's selected seats list was stored as **state** in the parent Booking component. The individual Seat button component received seat details (like seat ID, status) as **props** and rendered accordingly. When the user clicked a seat, an event was passed back up via a callback prop to update the parent's state.

---

### Q11. How did you handle form validation for login/registration?

**A:**  
I used controlled inputs in React — each input field's value was bound to a state variable. Before submitting, I added validation checks: if the email didn't match a regex pattern, or the password was less than 6 characters, I'd set an error message state and display it below the field. Only if all validations passed did I make the API call.

---

### Q12. How does routing work in your React app?

**A:**  
We used **React Router** for client-side navigation. Each page like `/movies`, `/booking/:id`, `/profile` was mapped to a component. We also used protected routes — if a user wasn't logged in (no token in localStorage), navigating to `/booking` would redirect them to the login page.

---

---

# 👤 SUVENDU PRASAD BEHERA & CHITTARANJAN MAHARANA
## Role: Back-End Developer

---

### Q1. What was your responsibility in the backend?

**A:**  
I was responsible for building and maintaining the backend server using Node.js and Express. My work included creating REST APIs for user authentication, movie listings, event management, seat booking, and booking history. I also implemented the business logic — like checking if a seat is available before confirming a booking, or calculating reward points after a transaction.

---

### Q2. How did you handle user authentication?

**A:**  
We used **JWT (JSON Web Token)** for authentication. When a user logs in with correct credentials, the backend verifies the password (using `bcrypt` to compare hashed passwords), and if valid, it generates a JWT signed with a secret key. This token is sent to the frontend and stored in `localStorage`. For protected routes, we wrote a middleware that checks if the token is present and valid before allowing access.

---

### Q3. Why did you use bcrypt for passwords?

**A:**  
Storing plain text passwords is a major security risk. If the database ever gets compromised, all passwords would be exposed. `bcrypt` hashes the password with a salt, making it computationally very hard to reverse. Even if someone gets the hash, they can't easily find the original password. When the user logs in, we use `bcrypt.compare()` to match the input against the stored hash.

---

### Q4. Explain the booking API flow.

**A:**  
When a user confirms a booking:
1. Frontend sends a `POST /api/bookings` request with: `userId`, `movieId`, `showId`, `seatIds[]`, `totalAmount`.
2. The backend middleware verifies the JWT token.
3. We check in the `seats` table if the selected seats are still available (not already booked).
4. If available, we insert a record in the `bookings` table and update each seat's status to `"booked"`.
5. We also update the user's reward points.
6. Finally, we return a success response with the `bookingId`.

This entire operation is wrapped in a **database transaction** so that if any step fails, none of the changes are committed.

---

### Q5. What REST API endpoints did you create?

**A:**  
Key endpoints include:
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and get JWT
- `GET /api/movies` — Get all movies
- `GET /api/movies/:id` — Get a specific movie's details
- `GET /api/shows/:movieId` — Get show timings for a movie
- `GET /api/seats/:showId` — Get seat availability for a show
- `POST /api/bookings` — Create a booking
- `GET /api/bookings/:userId` — Get user's booking history

---

### Q6. What is middleware in Express? What middleware did you use?

**A:**  
Middleware in Express is a function that runs between receiving a request and sending a response. It has access to `req`, `res`, and `next`. We used:
- **`express.json()`** — To parse JSON request bodies
- **`cors()`** — To allow the frontend (different port) to communicate with the backend
- **Custom `verifyToken` middleware** — Checks if a valid JWT exists in the request header before protecting routes
- **Error-handling middleware** — Catches any unhandled errors and returns a clean error response

---

### Q7. How did you handle errors in the API?

**A:**  
We used `try-catch` blocks around all async database calls. If an error occurred, we'd send an appropriate HTTP status code and message. For example:
- `400` — Bad request (missing fields)
- `401` — Unauthorized (no/invalid token)
- `404` — Resource not found
- `500` — Internal server error

This made it easy for the frontend to handle errors gracefully.

---

### Q8. How did you manage movie listings and event details?

**A:**  
We created separate tables for movies and events in MySQL. The backend had `GET` endpoints that query these tables and return data as JSON. For the home page, we had an endpoint that returns "featured" movies (a `is_featured` flag in the database). Movie details included: title, genre, duration, poster URL, cast, and available shows.

---

### Q9. What is the difference between GET and POST requests?

**A:**  
**GET** requests are used to *retrieve* data — they don't modify anything on the server. The data is passed via URL parameters or query strings. **POST** requests are used to *send* data to the server, typically to create something new (like a booking or registering a user). The data is sent in the request body. In our project, fetching movies used GET, while creating a booking used POST.

---

### Q10. How did you prevent double-booking of the same seat?

**A:**  
We used a **database transaction** and a seat status check. Before inserting a booking record, we query the seat's current status. If it's already `"booked"`, we return an error immediately. The transaction ensures that even if two users are booking simultaneously, the database lock prevents both from succeeding — only the first commit goes through, and the second gets a conflict error.

---

### Q11. What is CORS and why did you need it?

**A:**  
CORS stands for Cross-Origin Resource Sharing. Since our frontend runs on `localhost:3000` and the backend runs on `localhost:5000`, they are on different origins. Browsers block such cross-origin requests by default for security. We used the `cors` npm package and configured it to allow requests from our frontend's origin, which solved the issue.

---

---

# 👤 SREYASIS NAYAK
## Role: Database Designer

---

### Q1. What was your role in the project?

**A:**  
I was responsible for designing and managing the MySQL database for the QwikShow project. This included deciding what tables to create, what columns each table needs, defining relationships between tables, and ensuring data integrity through primary keys, foreign keys, and constraints.

---

### Q2. What tables did you design and why?

**A:**  
The main tables I designed are:

| Table | Purpose |
|---|---|
| `users` | Stores user account information |
| `movies` | Stores movie details |
| `events` | Stores event details |
| `shows` | Stores show timings linked to movies |
| `seats` | Stores seat layout and availability per show |
| `bookings` | Stores booking records |
| `booking_items` | Maps bookings to specific seats (junction table) |
| `payments` | Stores payment records linked to bookings |

Each table was designed to store only what it needs, following normalization principles.

---

### Q3. What is database normalization? Did you apply it?

**A:**  
Normalization is the process of organizing a database to reduce redundancy and improve data integrity. We followed **3rd Normal Form (3NF)**:
- **1NF**: Each column has atomic values — no lists in a cell.
- **2NF**: Every non-key column depends on the whole primary key (no partial dependencies).
- **3NF**: No transitive dependencies — columns don't depend on other non-key columns.

For example, instead of storing movie title directly in the bookings table, we store just the `movie_id` and use a JOIN to get the title. This prevents inconsistency if the title ever changes.

---

### Q4. Explain the relationship between your tables.

**A:**  
- A **User** can have many **Bookings** → One-to-Many
- A **Movie** can have many **Shows** → One-to-Many
- A **Show** has many **Seats** → One-to-Many
- A **Booking** can include many **Seats** → Many-to-Many (resolved via `booking_items` table)
- A **Booking** has one **Payment** → One-to-One

These relationships are enforced using foreign keys in MySQL.

---

### Q5. What is a foreign key and why is it important?

**A:**  
A foreign key is a column in one table that references the primary key of another table. It enforces **referential integrity** — meaning you can't insert a `booking` record with a `user_id` that doesn't exist in the `users` table. Similarly, deleting a user can be configured to cascade-delete their bookings, or restrict the deletion if bookings exist. This keeps the data consistent.

---

### Q6. How did you store seat availability?

**A:**  
Each seat is a row in the `seats` table. It has columns: `seat_id`, `show_id`, `seat_number`, `row`, `type` (regular/premium), and `status` (available/booked). When a booking is confirmed, the backend updates those specific seat rows to `status = 'booked'`. This makes it easy to query available seats for any show with a simple `WHERE status = 'available'` filter.

---

### Q7. How did you handle payment records?

**A:**  
The `payments` table stores: `payment_id`, `booking_id`, `amount`, `payment_status` (success/failed/pending), `payment_method`, and `timestamp`. It's linked to the `bookings` table via `booking_id`. This separation allows us to track failed payments separately and not confuse them with confirmed bookings.

---

### Q8. What is an index in MySQL? Did you use any?

**A:**  
An index is a data structure that speeds up query performance on frequently searched columns. Without an index, MySQL scans every row (full table scan). I added indexes on:
- `user_id` in the bookings table (for fetching user's booking history quickly)
- `show_id` in the seats table (for quickly loading seat availability per show)
- `email` in the users table (for fast login lookup)

---

### Q9. What is the difference between `INNER JOIN` and `LEFT JOIN`?

**A:**  
- `INNER JOIN` returns only rows that have matching values in **both** tables.
- `LEFT JOIN` returns all rows from the left table, and matching rows from the right table. If no match, the right side columns are NULL.

In our project, when fetching a user's booking history, we used `LEFT JOIN` with payments so that even if a payment record was missing (e.g., pending payment), the booking still appeared.

---

### Q10. How did you ensure data consistency during booking?

**A:**  
The backend uses **MySQL transactions**. All database operations for a booking (inserting into `bookings`, `booking_items`, updating `seats`) happen inside a `BEGIN TRANSACTION ... COMMIT` block. If any query fails, a `ROLLBACK` reverts all changes. This ensures the database never ends up in a partial/inconsistent state.

---

### Q11. How would you scale the database if the user base grows significantly?

**A:**  
For scaling, I would consider:
- **Indexing** heavily queried columns (already done).
- **Connection pooling** to manage multiple simultaneous DB connections.
- **Read replicas** — a secondary database for read-only queries so the primary isn't overloaded.
- **Caching** frequently requested data (like movie listings) using Redis, so not every request hits MySQL.
- Eventually, **horizontal partitioning (sharding)** if data grows extremely large.

---

---

# 👤 OMM PRAKASH PANDA & SREYASIS NAYAK
## Role: Testing

---

### Q1. What was your testing role in this project?

**A:**  
My responsibility was to test the backend APIs and database operations to make sure everything worked correctly end-to-end. This included verifying that each API returned the right data, that the booking logic was airtight, and that the database was updated correctly after each operation. I also tested for edge cases and failure scenarios to make the system robust.

---

### Q2. What types of testing did you perform?

**A:**  
We performed:
- **Functional Testing** — Does the feature work as expected? (e.g., can a user book a seat?)
- **API Testing** — Using Postman to test each endpoint with different inputs.
- **Negative Testing** — What happens if invalid data is sent? (e.g., booking a seat that's already booked, login with wrong password)
- **Database Testing** — Verifying that the correct records are created/updated in MySQL after each operation.
- **Integration Testing** — Checking that the frontend and backend work together correctly.

---

### Q3. How did you test the APIs? What tools did you use?

**A:**  
We used **Postman** to test each API endpoint. For every endpoint, we created test cases with:
- Valid inputs → expected successful response
- Missing fields → expected 400 error
- Invalid token → expected 401 error
- Non-existent resource → expected 404 error

We verified both the HTTP status code and the response body JSON for each test.

---

### Q4. Give an example of a bug you found during testing.

**A:**  
One issue we found was in the seat booking — when two requests came in nearly simultaneously for the same seat, both initially showed the seat as available. Without the database transaction and row-level locking, both could have succeeded, causing a double-booking. We reported this to the backend team, and they fixed it by wrapping the booking logic in a proper SQL transaction with a seat status check before inserting.

---

### Q5. How did you test the login and registration flow?

**A:**  
Test cases included:
- Register with a new email → should succeed and return a user ID
- Register with an already existing email → should return a 409 conflict error
- Login with correct credentials → should return a JWT token
- Login with wrong password → should return 401 unauthorized
- Login with non-existent email → should return 404 not found
- Access a protected route without token → should return 401

We verified each of these in Postman and confirmed the frontend handled each response correctly.

---

### Q6. What is the difference between functional testing and non-functional testing?

**A:**  
**Functional testing** checks that the system does what it's supposed to do — like "can a user book a ticket?" or "does the API return the correct movie data?"  
**Non-functional testing** checks qualities like performance (is it fast enough?), security (is the authentication safe?), and reliability (does it crash under load?).  
For this project, we focused mainly on functional and integration testing, but we also manually checked response times to ensure APIs weren't too slow.

---

### Q7. How did you verify that the database was updated correctly after a booking?

**A:**  
After triggering a booking through Postman, I manually queried the MySQL database using MySQL Workbench or command line to verify:
1. A new row appeared in the `bookings` table with the correct `user_id`, `show_id`, and `total_amount`.
2. The corresponding rows in the `seats` table had their `status` updated to `'booked'`.
3. A new row was added to the `booking_items` table linking the booking to each seat.
4. The user's reward points in the `users` table were incremented.

---

### Q8. What is regression testing? Did you do it?

**A:**  
Regression testing means re-testing existing features after new changes are made, to ensure nothing that was working before got broken. We did this informally — whenever the backend team updated an API, we re-ran our Postman tests for all related endpoints to make sure existing functionality still worked. In a larger project, this would be automated using tools like Jest or Mocha.

---

---

# 👤 SIPUN SAHOO & CHITTARANJAN MAHARANA
## Role: Documentation

---

### Q1. What was your contribution to the project documentation?

**A:**  
I was responsible for compiling the final project report and documentation for QwikShow. This included writing up the project overview, objectives, system requirements, architecture diagrams, database schema descriptions, API documentation, and the testing summary. I also ensured the document followed a professional structure that would be presentable for academic evaluation.

---

### Q2. What diagrams did you prepare for the project?

**A:**  
I prepared the following diagrams:
- **ER Diagram (Entity-Relationship)** — Shows the database tables and their relationships.
- **Use Case Diagram** — Illustrates what actions different users (Guest, Registered User, Admin) can perform.
- **Data Flow Diagram (DFD)** — Shows how data moves between the user, frontend, backend, and database.
- **System Architecture Diagram** — High-level diagram showing the client-server architecture with React frontend, Express backend, and MySQL database.
- **Flowchart** — Step-by-step booking flow from movie selection to confirmation.

---

### Q3. What did the system requirements section include?

**A:**  
The system requirements section covered:
- **Functional Requirements** — What the system must do: user registration, login, movie listing, seat selection, booking, payment, booking history, etc.
- **Non-Functional Requirements** — Performance, security, reliability, and usability expectations.
- **Hardware Requirements** — Server and client machine specifications needed to run the system.
- **Software Requirements** — Node.js version, MySQL version, browser compatibility, etc.

---

### Q4. How did you document the APIs?

**A:**  
For each API endpoint, I documented:
- **Endpoint URL** (e.g., `POST /api/auth/login`)
- **Method** (GET/POST/PUT/DELETE)
- **Request Body / Parameters** with field names, types, and whether they're required
- **Response format** — what JSON structure is returned on success
- **Error responses** — possible HTTP status codes and their meanings
- **Authentication** — whether a JWT token is required

This made it easy for the frontend team to understand exactly how to call each API.

---

### Q5. What is a Use Case Diagram? Explain one use case from your project.

**A:**  
A Use Case Diagram shows the interactions between different types of users (actors) and the system. It represents what the system does from the user's perspective.  
For example, the **"Book a Ticket"** use case:
- **Actor**: Registered User
- **Precondition**: User must be logged in
- **Steps**: Select movie → Choose show timing → Select seats → Confirm booking → View QR code
- **Postcondition**: A booking record is created, seats are marked as booked, QR code is issued

---

### Q6. What is a Data Flow Diagram (DFD)? Explain Level 0 for QwikShow.

**A:**  
A DFD shows how data flows through the system. **Level 0 (Context Diagram)** is the highest level and shows the entire system as a single process with its external entities.  
For QwikShow at Level 0:
- **External Entities**: User, Admin
- **System**: QwikShow System (single bubble)
- **Data Flows**:
  - User → System: Login credentials, booking requests
  - System → User: Movie list, booking confirmation, QR code
  - Admin → System: Movie/event data management

---

### Q7. Why is documentation important in a software project?

**A:**  
Documentation serves multiple purposes:
1. **For developers**: Helps team members understand the system without asking each other constantly.
2. **For future maintenance**: When someone new joins or the system needs to be updated, documentation is the reference guide.
3. **For clients/evaluators**: Shows professionalism and that the project was planned and executed systematically.
4. **For testing**: Test cases and expected results need to be documented to ensure nothing is missed.

Without documentation, even a great project becomes difficult to understand and maintain after some time.

---

### Q8. What challenges did you face while writing the documentation?

**A:**  
The main challenge was keeping the documentation updated as the project evolved. The backend team would add a new API or change a response format, and I had to track those changes and update the relevant sections. I solved this by staying in regular communication with the backend team and reviewing the code occasionally to catch any undocumented changes. Another challenge was explaining technical concepts clearly for non-technical evaluators — I had to find a balance between accuracy and simplicity.

---

---

# 🌐 ALL TEAM MEMBERS
## Common Questions — Planning & Project Overview

---

### Q1. What is QwikShow / CineBook? Give an overview.

**A:**  
QwikShow (also referred to as CineBook) is an online movie and event ticket booking system. It allows users to register, browse available movies and events, check show timings, select seats interactively, and book tickets. After booking, users receive a QR code as a digital ticket. The system also tracks booking history and rewards users with points for each booking. It's built with a React frontend, Node.js + Express backend, and MySQL database.

---

### Q2. What problem does this project solve?

**A:**  
Traditional ticket booking involves going to the cinema counter physically, which wastes time and can result in sold-out shows. QwikShow allows users to book tickets from anywhere, at any time. It also solves the problem of seat availability transparency — users can see exactly which seats are free and choose their preferred ones in real time.

---

### Q3. How did your team divide the work?

**A:**  
We had a clear division based on expertise:
- **Frontend team** handled all UI design and React development.
- **Backend team** built the REST APIs and server-side logic.
- **Database designer** designed the MySQL schema and relationships.
- **Testing team** validated all features and APIs.
- **Documentation team** compiled the project report and diagrams.

We held regular discussions to align on the API contracts (what endpoints exist and what data they return) so all teams could work in parallel without blocking each other.

---

### Q4. What technology stack did you use and why?

**A:**  
- **React** — For dynamic, component-based UI without full page reloads.
- **Node.js + Express** — Lightweight, fast, and JavaScript-based, so it matched the frontend language, making it easier for the team.
- **MySQL** — A reliable relational database with strong support for relationships and transactions, which is important for booking systems where data consistency is critical.
- **JWT** — For stateless, scalable authentication without server-side sessions.

---

### Q5. What is the biggest technical challenge your team faced?

**A:**  
The most complex challenge was the **seat booking race condition** — ensuring that two users couldn't book the same seat simultaneously. We solved it using database transactions and seat status validation before committing a booking. Another challenge was CORS configuration when connecting the React frontend (port 3000) to the Express backend (port 5000), which was resolved by configuring the `cors` middleware properly.

---

### Q6. If you were to improve this project, what would you add?

**A:**  
- **Payment Gateway Integration** (Razorpay/Stripe) for real transactions.
- **Email/SMS Notifications** for booking confirmations.
- **Admin Panel** for managing movies, shows, and viewing analytics.
- **Real-time seat updates** using WebSockets — so if someone else books a seat while you're on the seat selection page, it updates live.
- **Mobile App** version using React Native.

---

> 💡 **Tip**: Always mention *why* you made a decision, not just *what* you did. Examiners are more impressed by reasoning than by code.

---

*Document prepared for QwikShow Project Viva — CineBook Team*
