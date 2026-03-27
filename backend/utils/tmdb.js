const axios = require('axios');

const BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Search for a movie by title.
 * @param {string} title 
 * @returns {Promise<Array>} List of movie results
 */
const searchMovie = async (title) => {
    try {
        const response = await axios.get(`${BASE_URL}/search/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: title
            }
        });
        return response.data.results;
    } catch (error) {
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
            const networkErr = new Error(`Cannot reach TMDb API (network blocked or no internet). Error code: ${error.code}`);
            networkErr.code = 'NETWORK_ERROR';
            console.error('TMDb searchMovie network error:', error.code);
            throw networkErr;
        }
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
        const response = await axios.get(`${BASE_URL}/movie/${tmdbId}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                append_to_response: 'videos'
            }
        });
        return response.data;
    } catch (error) {
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ECONNRESET') {
            const networkErr = new Error(`Cannot reach TMDb API (network blocked or no internet). Error code: ${error.code}`);
            networkErr.code = 'NETWORK_ERROR';
            console.error('TMDb getMovieDetails network error:', error.code);
            throw networkErr;
        }
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
