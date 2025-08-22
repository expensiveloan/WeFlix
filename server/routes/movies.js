import express from 'express';
import { tmdbApi, TMDB_ENDPOINTS, formatMediaItem, buildImageUrl, IMAGE_SIZES } from '../config/tmdb.js';
import { cache } from '../server.js';

const router = express.Router();

// Get trending movies
router.get('/trending', async (req, res) => {
  try {
    const cacheKey = 'trending_movies';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    
    const response = await tmdbApi.get(TMDB_ENDPOINTS.TRENDING_MOVIES);
    const formattedMovies = response.data.results.map(movie => formatMediaItem(movie, 'movie'));
    
    const result = {
      results: formattedMovies,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
      page: response.data.page
    };

    // Cache for longer time in development to reduce TMDB API calls
    const cacheTime = process.env.NODE_ENV === 'development' ? 3600 : 1800; // 1 hour in dev, 30 min in prod
    cache.set(cacheKey, result, cacheTime); // Cache for 30 minutes
    res.json(result);
  } catch (error) {
    console.error('Error fetching trending movies:', error.message);
    
    if (error.response?.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
  }
});

// Get popular movies
router.get('/popular', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const cacheKey = `popular_movies_${page}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const response = await tmdbApi.get(TMDB_ENDPOINTS.POPULAR_MOVIES, {
      params: { page }
    });
    
    const formattedMovies = response.data.results.map(movie => formatMediaItem(movie, 'movie'));
    
    const result = {
      results: formattedMovies,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
      page: response.data.page
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

// Get top rated movies
router.get('/top-rated', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const cacheKey = `top_rated_movies_${page}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const response = await tmdbApi.get(TMDB_ENDPOINTS.TOP_RATED_MOVIES, {
      params: { page }
    });
    
    const formattedMovies = response.data.results.map(movie => formatMediaItem(movie, 'movie'));
    
    const result = {
      results: formattedMovies,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
      page: response.data.page
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    res.status(500).json({ error: 'Failed to fetch top rated movies' });
  }
});

// Get upcoming movies
router.get('/upcoming', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const cacheKey = `upcoming_movies_${page}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const response = await tmdbApi.get(TMDB_ENDPOINTS.UPCOMING_MOVIES, {
      params: { page }
    });
    
    const formattedMovies = response.data.results.map(movie => formatMediaItem(movie, 'movie'));
    
    const result = {
      results: formattedMovies,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
      page: response.data.page
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming movies' });
  }
});

// Get now playing movies
router.get('/now-playing', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const cacheKey = `now_playing_movies_${page}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const response = await tmdbApi.get(TMDB_ENDPOINTS.NOW_PLAYING_MOVIES, {
      params: { page }
    });
    
    const formattedMovies = response.data.results.map(movie => formatMediaItem(movie, 'movie'));
    
    const result = {
      results: formattedMovies,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
      page: response.data.page
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    res.status(500).json({ error: 'Failed to fetch now playing movies' });
  }
});

// Get movie details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `movie_details_${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Get movie details, videos, and credits in parallel
    const [detailsResponse, videosResponse, creditsResponse] = await Promise.all([
      tmdbApi.get(TMDB_ENDPOINTS.MOVIE_DETAILS(id)),
      tmdbApi.get(TMDB_ENDPOINTS.MOVIE_VIDEOS(id)),
      tmdbApi.get(TMDB_ENDPOINTS.MOVIE_CREDITS(id))
    ]);

    const movie = formatMediaItem(detailsResponse.data, 'movie');
    
    // Reduced delay for faster response
    await new Promise(resolve => setTimeout(resolve, 100));

    const result = {
      ...movie,
      runtime: detailsResponse.data.runtime,
      genres: detailsResponse.data.genres,
      productionCompanies: detailsResponse.data.production_companies,
      productionCountries: detailsResponse.data.production_countries,
      spokenLanguages: detailsResponse.data.spoken_languages,
      budget: detailsResponse.data.budget,
      revenue: detailsResponse.data.revenue,
      tagline: detailsResponse.data.tagline,
      homepage: detailsResponse.data.homepage,
      imdbId: detailsResponse.data.imdb_id,
      status: detailsResponse.data.status,
      videos: videosResponse.data.results,
      cast: creditsResponse.data.cast.slice(0, 20).map(actor => ({
        ...actor,
        profile_path: buildImageUrl(actor.profile_path, IMAGE_SIZES.POSTER.SMALL)
      })), // Top 20 cast members with full image URLs
      crew: creditsResponse.data.crew.slice(0, 10)   // Top 10 crew members
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Movie not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch movie details' });
    }
  }
});

export default router;
