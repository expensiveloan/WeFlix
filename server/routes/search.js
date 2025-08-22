import express from 'express';
import { tmdbApi, TMDB_ENDPOINTS, formatMediaItem } from '../config/tmdb.js';
import { cache } from '../server.js';

const router = express.Router();

// Search movies, TV shows, and people
router.get('/', async (req, res) => {
  try {
    const { query, page = 1, type = 'multi' } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const cacheKey = `search_${type}_${query}_${page}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    let endpoint;
    switch (type) {
      case 'movie':
        endpoint = TMDB_ENDPOINTS.SEARCH_MOVIES;
        break;
      case 'tv':
        endpoint = TMDB_ENDPOINTS.SEARCH_TV;
        break;
      default:
        endpoint = TMDB_ENDPOINTS.SEARCH_MULTI;
    }

    const response = await tmdbApi.get(endpoint, {
      params: { 
        query: query.trim(),
        page 
      }
    });

    const formattedResults = response.data.results
      .filter(item => item.media_type !== 'person') // Filter out people
      .map(item => {
        const mediaType = item.media_type || type;
        return formatMediaItem(item, mediaType);
      });
    
    const result = {
      results: formattedResults,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
      page: response.data.page,
      query: query.trim()
    };

    // Cache for longer time in development to reduce TMDB API calls
    const cacheTime = process.env.NODE_ENV === 'development' ? 3600 : 900; // 1 hour in dev, 15 min in prod
    cache.set(cacheKey, result, cacheTime);
    res.json(result);
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Get search suggestions/autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const cacheKey = `suggestions_${query}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const response = await tmdbApi.get(TMDB_ENDPOINTS.SEARCH_MULTI, {
      params: { 
        query: query.trim(),
        page: 1
      }
    });

    const suggestions = response.data.results
      .filter(item => item.media_type !== 'person')
      .slice(0, 8) // Limit to 8 suggestions
      .map(item => {
        const formattedItem = formatMediaItem(item, item.media_type);
        return {
          id: formattedItem.id,
          title: formattedItem.title,
          mediaType: formattedItem.mediaType,
          posterPath: formattedItem.posterPath,
          releaseDate: formattedItem.releaseDate
        };
      });

    const result = { suggestions };

    // Cache suggestions for longer time in development
    const cacheTime = process.env.NODE_ENV === 'development' ? 7200 : 1800; // 2 hours in dev, 30 min in prod
    cache.set(cacheKey, result, cacheTime);
    res.json(result);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

export default router;
