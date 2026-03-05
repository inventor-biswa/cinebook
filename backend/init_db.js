const pool = require('./config/db');

async function createTables() {
    try {
        console.log("Starting database initialization...");

        // 1. Users Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('user','admin') DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log("Users table created.");

        // 2. Cities Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS cities (
        city_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL
      )
    `);
        console.log("Cities table created.");

        // Insert Default Cities (Ignores duplicates if they already exist)
        await pool.query(`
      INSERT IGNORE INTO cities (name) VALUES 
      ('Mumbai'), ('Delhi'), ('Bangalore'), ('Hyderabad'), ('Chennai')
    `);

        // 3. Theatres Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS theatres (
        theatre_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        city_id INT NOT NULL,
        total_rows INT NOT NULL,
        seats_per_row INT NOT NULL,
        FOREIGN KEY (city_id) REFERENCES cities(city_id)
      )
    `);
        console.log("Theatres table created.");

        // 4. Movies Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS movies (
        movie_id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        genre VARCHAR(100),
        language VARCHAR(50),
        description TEXT,
        cast_info TEXT,
        poster_url VARCHAR(255),
        trailer_url VARCHAR(255),
        release_date DATE,
        is_trending BOOLEAN DEFAULT FALSE,
        status ENUM('now_showing','coming_soon','ended') DEFAULT 'coming_soon',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log("Movies table created.");

        // 5. Events Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        event_id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        poster_url VARCHAR(255),
        trailer_url VARCHAR(255),
        is_trending BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log("Events table created.");

        // 6. Shows Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS shows (
        show_id INT PRIMARY KEY AUTO_INCREMENT,
        movie_id INT,
        event_id INT,
        theatre_id INT NOT NULL,
        show_date DATE NOT NULL,
        show_time TIME NOT NULL,
        price DECIMAL(8,2) NOT NULL,
        available_seats INT NOT NULL,
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id),
        FOREIGN KEY (event_id) REFERENCES events(event_id),
        FOREIGN KEY (theatre_id) REFERENCES theatres(theatre_id)
      )
    `);
        console.log("Shows table created.");

        // 7. Seats Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS seats (
        seat_id INT PRIMARY KEY AUTO_INCREMENT,
        show_id INT NOT NULL,
        seat_label VARCHAR(10) NOT NULL,
        is_booked BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (show_id) REFERENCES shows(show_id)
      )
    `);
        console.log("Seats table created.");

        // 8. Bookings Table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        booking_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        show_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_id VARCHAR(100),
        status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
        booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (show_id) REFERENCES shows(show_id)
      )
    `);
        console.log("Bookings table created.");

        // 9. Booking Seats (Junction Table)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS booking_seats (
        id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        seat_id INT NOT NULL,
        FOREIGN KEY (booking_id) REFERENCES bookings(booking_id),
        FOREIGN KEY (seat_id) REFERENCES seats(seat_id)
      )
    `);
        console.log("Booking_seats junction table created.");

        console.log("====================================");
        console.log("Database initialized successfully!");
        console.log("====================================");

        // Explicitly exit the process when done so the script doesn't hang
        process.exit(0);
    } catch (error) {
        console.error("Error creating tables:", error);
        process.exit(1);
    }
}

createTables();
