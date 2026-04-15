const pool = require('./config/db');

const theatres = [
  // Mumbai (city_id will be looked up)
  { city: 'Mumbai', name: 'PVR ICON Versova',         address: 'Infiniti Mall, New Link Rd, Andheri West, Mumbai',       rows: 12, seats: 20 },
  { city: 'Mumbai', name: 'INOX R-City Mall',          address: 'R City Mall, LBS Marg, Ghatkopar West, Mumbai',          rows: 10, seats: 18 },
  { city: 'Mumbai', name: 'Cinepolis Viviana Mall',    address: 'Viviana Mall, Thane West, Mumbai',                       rows: 11, seats: 19 },

  // Delhi
  { city: 'Delhi',  name: 'PVR Select Citywalk',      address: 'Select Citywalk Mall, Saket, New Delhi',                 rows: 12, seats: 20 },
  { city: 'Delhi',  name: 'INOX Nehru Place',         address: 'DLF Star Mall, Nehru Place, New Delhi',                  rows: 10, seats: 18 },
  { city: 'Delhi',  name: 'Cinepolis DLF Promenade',  address: 'DLF Promenade, Vasant Kunj, New Delhi',                  rows: 11, seats: 19 },

  // Bangalore
  { city: 'Bangalore', name: 'PVR Forum Mall',        address: 'Forum Mall, Koramangala, Bengaluru',                     rows: 12, seats: 20 },
  { city: 'Bangalore', name: 'INOX Garuda Mall',      address: 'Garuda Mall, Magrath Rd, Ashok Nagar, Bengaluru',        rows: 10, seats: 18 },
  { city: 'Bangalore', name: 'Cinepolis Orion Mall',  address: 'Orion Mall, Dr Rajkumar Rd, Rajajinagar, Bengaluru',     rows: 11, seats: 19 },

  // Hyderabad
  { city: 'Hyderabad', name: 'PVR INOX Inorbit',     address: 'Inorbit Mall, Cyberabad, Hyderabad',                     rows: 12, seats: 20 },
  { city: 'Hyderabad', name: 'AMB Cinemas',           address: 'AMB Mall, Financial District, Hyderabad',                rows: 14, seats: 22 },
  { city: 'Hyderabad', name: 'Cinepolis Bhavani',     address: 'Asian Cinemas, SR Nagar, Hyderabad',                     rows: 10, seats: 18 },

  // Chennai
  { city: 'Chennai', name: 'SPI Sathyam Cinemas',    address: 'Royapettah High Rd, Chennai',                            rows: 13, seats: 20 },
  { city: 'Chennai', name: 'PVR VR Chennai',          address: 'VR Chennai Mall, Anna Salai, Chennai',                   rows: 11, seats: 19 },
  { city: 'Chennai', name: 'INOX Sapphire',           address: 'Sapphire Mall, Old Mahabalipuram Rd, Chennai',           rows: 10, seats: 18 },

  // Bhubaneswar
  { city: 'Bhubaneswar', name: 'INOX Esplanade',     address: 'Esplanade One Mall, Rasulgarh, Bhubaneswar',             rows: 10, seats: 16 },
  { city: 'Bhubaneswar', name: 'Cinepolis Bharathi',  address: 'Bharathi Central Mall, Bhubaneswar',                     rows:  9, seats: 15 },
  { city: 'Bhubaneswar', name: 'Capital Cinema',      address: 'Janpath, Bhubaneswar',                                   rows:  8, seats: 14 },

  // Cuttack
  { city: 'Cuttack', name: 'Big Cinemas Cuttack',    address: 'Madhupatna, Cuttack',                                    rows:  8, seats: 14 },
  { city: 'Cuttack', name: 'Annapurna Cinema',        address: 'College Square, Cuttack',                                rows:  7, seats: 12 },
  { city: 'Cuttack', name: 'Jay Cinema Hall',          address: 'Link Road, Cuttack',                                     rows:  7, seats: 12 },

  // Puri
  { city: 'Puri', name: 'Shreekhetra Talkies',       address: 'Grand Road, Puri',                                       rows:  7, seats: 12 },
  { city: 'Puri', name: 'Konark Cinema',              address: 'Sea Beach Rd, Puri',                                     rows:  6, seats: 12 },
  { city: 'Puri', name: 'Nilachal Cineplex',          address: 'VIP Road, Puri',                                         rows:  7, seats: 12 },

  // Rourkela
  { city: 'Rourkela', name: 'Usha Cinema',           address: 'Udit Nagar, Rourkela',                                   rows:  8, seats: 14 },
  { city: 'Rourkela', name: 'City Star Cinema',       address: 'Civil Township, Rourkela',                               rows:  7, seats: 12 },
  { city: 'Rourkela', name: 'Rourkela Cineplex',      address: 'Bisra Road, Rourkela',                                   rows:  7, seats: 12 },

  // Kolkata
  { city: 'Kolkata', name: 'PVR Mani Square',        address: 'Mani Square Mall, EM Bypass, Kolkata',                   rows: 12, seats: 20 },
  { city: 'Kolkata', name: 'INOX South City',         address: 'South City Mall, Prince Anwar Shah Rd, Kolkata',        rows: 11, seats: 19 },
  { city: 'Kolkata', name: 'Cinepolis Acropolis',     address: 'Acropolis Mall, Rashbehari Connector, Kolkata',         rows: 10, seats: 18 },
];

async function seed() {
  try {
    // Fetch all cities to build a name→id map
    const [cities] = await pool.query('SELECT city_id, name FROM cities');
    const cityMap = {};
    cities.forEach(c => { cityMap[c.name] = c.city_id; });

    let inserted = 0;
    for (const t of theatres) {
      const city_id = cityMap[t.city];
      if (!city_id) { console.warn(`City not found: ${t.city}`); continue; }

      await pool.query(
        `INSERT INTO theatres (name, address, city_id, total_rows, seats_per_row)
         VALUES (?, ?, ?, ?, ?)`,
        [t.name, t.address, city_id, t.rows, t.seats]
      );
      console.log(`  ✅ ${t.city} → ${t.name}`);
      inserted++;
    }

    console.log(`\n🎬 Done! Inserted ${inserted} theatres across ${Object.keys(cityMap).length} cities.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
