require('dotenv').config();
const axios  = require('axios');
const pool   = require('./config/db');

const TMDB_KEY  = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE  = 'https://image.tmdb.org/t/p/original';

const TARGET = 200; // movies to insert
const DELAY  = 250; // ms between API calls — stay well under rate limit

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── helpers ──────────────────────────────────────────────────────────────────

async function tmdbGet(path, params = {}) {
  const res = await axios.get(`${TMDB_BASE}${path}`, {
    params: { api_key: TMDB_KEY, language: 'en-US', ...params },
    timeout: 15000,
  });
  return res.data;
}

/** Determine status from release_date */
function getStatus(releaseDate) {
  if (!releaseDate) return 'coming_soon';
  const rel  = new Date(releaseDate);
  const now  = new Date();
  const diff = (now - rel) / (1000 * 60 * 60 * 24); // days
  if (diff < 0)   return 'coming_soon';
  if (diff > 180) return 'ended';          // older than 6 months
  return 'now_showing';
}

/** Fetch full detail + videos + credits for one movie */
async function fetchFull(id) {
  try {
    const data = await tmdbGet(`/movie/${id}`, {
      append_to_response: 'videos,credits',
    });
    return data;
  } catch (e) {
    console.warn(`  ⚠ Skipping id=${id}: ${e.message}`);
    return null;
  }
}

/** Map TMDb full detail → DB row */
function toRow(m) {
  const poster   = m.poster_path  ? `${IMG_BASE}${m.poster_path}`  : null;
  const trailer  = (m.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;

  const cast = (m.credits?.cast || [])
    .slice(0, 8)
    .map(a => a.name)
    .join(', ');

  const genre = (m.genres || []).map(g => g.name).join(', ');

  return {
    title:        m.title,
    genre:        genre        || 'General',
    language:     (m.original_language || 'en').toUpperCase(),
    description:  m.overview  || '',
    cast_info:    cast,
    poster_url:   poster,
    trailer_url:  trailerUrl,
    release_date: m.release_date || null,
    status:       getStatus(m.release_date),
    is_trending:  m.popularity > 200 ? 1 : 0,
  };
}

// ── collect TMDb IDs across categories ───────────────────────────────────────

async function collectIds() {
  const seen = new Set();
  const ids  = [];

  const endpoints = [
    '/movie/popular',
    '/movie/top_rated',
    '/movie/now_playing',
    '/movie/upcoming',
  ];

  // 10 pages × 4 endpoints = up to 800 candidates → pick first 200 unique
  for (const ep of endpoints) {
    for (let page = 1; page <= 10; page++) {
      if (ids.length >= TARGET) break;
      try {
        const data = await tmdbGet(ep, { page });
        for (const m of data.results) {
          if (!seen.has(m.id)) {
            seen.add(m.id);
            ids.push(m.id);
          }
          if (ids.length >= TARGET) break;
        }
        await sleep(DELAY);
      } catch (e) {
        console.warn(`  ⚠ ${ep} page ${page} failed: ${e.message}`);
      }
    }
    if (ids.length >= TARGET) break;
  }

  return ids.slice(0, TARGET);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🎬  QwikShow Movie Seeder — fetching 200 movies from TMDb...\n');

  // 1. Collect IDs
  console.log('📋  Collecting movie IDs from TMDb...');
  const ids = await collectIds();
  console.log(`    Found ${ids.length} unique movie IDs.\n`);

  // 2. Fetch details + insert
  let inserted = 0, skipped = 0;

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    process.stdout.write(`[${String(i + 1).padStart(3)}/${ids.length}] Fetching id=${id} ... `);

    const full = await fetchFull(id);
    await sleep(DELAY);

    if (!full) { skipped++; console.log('skipped'); continue; }

    const row = toRow(full);

    try {
      await pool.query(
        `INSERT INTO movies
           (title, genre, language, description, cast_info,
            poster_url, trailer_url, release_date, status, is_trending)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.title, row.genre, row.language, row.description, row.cast_info,
          row.poster_url, row.trailer_url, row.release_date, row.status, row.is_trending,
        ]
      );
      inserted++;
      console.log(`✅  "${row.title}" [${row.status}]`);
    } catch (e) {
      skipped++;
      console.log(`❌  "${row.title}" — ${e.message}`);
    }
  }

  console.log(`
════════════════════════════════════════
  ✅  Inserted : ${inserted}
  ⚠   Skipped  : ${skipped}
  🎬  Total    : ${inserted + skipped}
════════════════════════════════════════`);

  process.exit(0);
}

seed().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
