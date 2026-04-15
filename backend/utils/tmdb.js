const axios = require('axios');

const BASE_URL = 'https://api.themoviedb.org/3';
const BASE_URL_ALT = 'https://api.tmdb.org/3'; // alt domain, sometimes unblocked on mobile ISPs

// network error codes that commonly appear on mobile-data connections
const NETWORK_CODES = new Set(['ETIMEDOUT','ECONNREFUSED','ENOTFOUND','ECONNRESET','ENETUNREACH','EHOSTUNREACH','EAI_AGAIN']);

// helper: try primary URL, then alt URL on network failure
const tmdbGet = async (path, params) => {
    const urls = [BASE_URL, BASE_URL_ALT];
    let lastErr;
    for (const base of urls) {
        try {
            const response = await axios.get(`${base}${path}`, {
                params,
                timeout: 12000,   // 12 s — mobile networks are slower
            });
            return response;
        } catch (error) {
            lastErr = error;
            if (NETWORK_CODES.has(error.code)) {
                // try next base URL
                continue;
            }
            throw error; // non-network error — no point retrying
        }
    }
    // both URLs failed with a network error
    const networkErr = new Error(`Cannot reach TMDb API (network blocked or no internet). Error code: ${lastErr.code}`);
    networkErr.code = 'NETWORK_ERROR';
    throw networkErr;
};

/**
 * Search for a movie by title.
 * @param {string} title 
 * @returns {Promise<Array>} List of movie results
 */
const searchMovie = async (title) => {
    try {
        const response = await tmdbGet('/search/movie', {
            api_key: process.env.TMDB_API_KEY,
            query: title
        });
        return response.data.results;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') throw error;
        console.error('TMDb searchMovie error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Get detailed movie info by TMDb ID.
 * @param {number} tmdbId 
 * @returns {Promise<Object>} Movie details
 */
const getMovieDetails = async (tmdbId) => {
    try {
        const response = await tmdbGet(`/movie/${tmdbId}`, {
            api_key: process.env.TMDB_API_KEY,
            append_to_response: 'videos'
        });
        return response.data;
    } catch (error) {
        if (error.code === 'NETWORK_ERROR') throw error;
        console.error('TMDb getMovieDetails error:', error.response?.data || error.message);
        throw error;
    }
};

/**
 * Format TMDb movie data to match Cinebook schema.
 * @param {Object} tmdbMovie 
 * @returns {Object} Formatted movie data
 */
const formatMovieData = (tmdbMovie) => {
    const posterPath = tmdbMovie.poster_path;
    const highResPoster = posterPath ? `https://image.tmdb.org/t/p/original${posterPath}` : '';
    
    // Find a trailer URL if available
    const trailer = tmdbMovie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const trailerUrl = trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '';

    return {
        title: tmdbMovie.title,
        genre: tmdbMovie.genres?.map(g => g.name).join(', ') || '',
        language: tmdbMovie.original_language,
        description: tmdbMovie.overview,
        cast_info: '', // TMDb requires 'credits' for cast, available via separate call or append_to_response: 'credits'
        poster_url: highResPoster,
        trailer_url: trailerUrl,
        release_date: tmdbMovie.release_date,
    };
};

module.exports = {
    searchMovie,
    getMovieDetails,
    formatMovieData
};
