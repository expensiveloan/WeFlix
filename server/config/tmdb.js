import axios from 'axios';
import http from 'http';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// Create axios instance for TMDB API with optimized settings
export const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  },
  timeout: 5000, // Reduced to 5 seconds
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  // Enable HTTP/2 and connection reuse
  maxRedirects: 3,
  maxContentLength: 50 * 1024 * 1024, // 50MB limit
  // Connection pooling
  httpAgent: new http.Agent({
    keepAlive: true,
    maxSockets: 10,
    timeout: 5000
  }),
  httpsAgent: new https.Agent({
    keepAlive: true,
    maxSockets: 10,
    timeout: 5000
  })
});

// Optimized request interceptor with reduced rate limiting
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 250; // Reduced to 250ms - TMDB allows 40 requests/10 seconds
let requestQueue = [];
let isProcessingQueue = false;

// Process requests in batches to improve throughput
const processRequestQueue = async () => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  const batch = requestQueue.splice(0, 5); // Process 5 requests at once
  
  await Promise.all(batch.map(async ({ config, resolve, reject }) => {
    try {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(r => setTimeout(r, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
      }
      
      lastRequestTime = Date.now();
      resolve(config);
    } catch (error) {
      reject(error);
    }
  }));
  
  isProcessingQueue = false;
  
  // Process remaining queue
  if (requestQueue.length > 0) {
    setTimeout(processRequestQueue, 50);
  }
};

tmdbApi.interceptors.request.use(async (config) => {
  return new Promise((resolve, reject) => {
    requestQueue.push({ config, resolve, reject });
    processRequestQueue();
  });
});

// Optimized response interceptor with faster retry logic
tmdbApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 429) {
      // Prevent infinite retry loops
      if (error.config._retryCount >= 2) { // Reduced max retries
        console.log('Max retries reached for rate limit. Failing request.');
        return Promise.reject(error);
      }
      
      error.config._retryCount = (error.config._retryCount || 0) + 1;
      // Exponential backoff: 1s, 2s max instead of 15s, 60s
      const backoffTime = Math.min(1000 * Math.pow(2, error.config._retryCount), 2000);
      
      console.log(`Rate limit hit - backing off for ${backoffTime}ms... (attempt ${error.config._retryCount})`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Update the last request time to prevent immediate subsequent requests
      lastRequestTime = Date.now();
      
      return tmdbApi.request(error.config);
    }
    
    // Handle network timeouts more gracefully
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.log('Request timeout - failing fast');
      return Promise.reject(new Error('Request timeout'));
    }
    
    return Promise.reject(error);
  }
);

// TMDB API endpoints
export const TMDB_ENDPOINTS = {
  TRENDING_MOVIES: '/trending/movie/day',
  TRENDING_TV: '/trending/tv/day',
  POPULAR_MOVIES: '/movie/popular',
  POPULAR_TV: '/tv/popular',
  TOP_RATED_MOVIES: '/movie/top_rated',
  TOP_RATED_TV: '/tv/top_rated',
  UPCOMING_MOVIES: '/movie/upcoming',
  NOW_PLAYING_MOVIES: '/movie/now_playing',
  MOVIE_DETAILS: (id) => `/movie/${id}`,
  TV_DETAILS: (id) => `/tv/${id}`,
  MOVIE_VIDEOS: (id) => `/movie/${id}/videos`,
  TV_VIDEOS: (id) => `/tv/${id}/videos`,
  MOVIE_CREDITS: (id) => `/movie/${id}/credits`,
  TV_CREDITS: (id) => `/tv/${id}/credits`,
  SEARCH_MULTI: '/search/multi',
  SEARCH_MOVIES: '/search/movie',
  SEARCH_TV: '/search/tv',
  GENRES_MOVIES: '/genre/movie/list',
  GENRES_TV: '/genre/tv/list'
};

// Image configuration
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
export const IMAGE_SIZES = {
  POSTER: {
    SMALL: 'w185',
    MEDIUM: 'w342',
    LARGE: 'w500',
    XLARGE: 'w780',
    ORIGINAL: 'original'
  },
  BACKDROP: {
    SMALL: 'w300',
    MEDIUM: 'w780',
    LARGE: 'w1280',
    ORIGINAL: 'original'
  }
};

// Helper function to build image URLs
export const buildImageUrl = (path, size = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
};

// Helper function to format movie/TV data
export const formatMediaItem = (item, type = 'movie') => {
  const isMovie = type === 'movie' || item.media_type === 'movie';
  
  return {
    id: item.id,
    title: isMovie ? item.title : item.name,
    originalTitle: isMovie ? item.original_title : item.original_name,
    overview: item.overview,
    releaseDate: isMovie ? item.release_date : item.first_air_date,
    posterPath: buildImageUrl(item.poster_path, IMAGE_SIZES.POSTER.MEDIUM),
    backdropPath: buildImageUrl(item.backdrop_path, IMAGE_SIZES.BACKDROP.LARGE),
    voteAverage: item.vote_average,
    voteCount: item.vote_count,
    popularity: item.popularity,
    genreIds: item.genre_ids,
    adult: item.adult,
    originalLanguage: item.original_language,
    mediaType: item.media_type || type
  };
};
