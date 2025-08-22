import express from 'express';
import { tmdbApi, TMDB_ENDPOINTS, formatMediaItem, buildImageUrl, IMAGE_SIZES } from '../config/tmdb.js';
import { cache } from '../server.js';

const router = express.Router();

// Get trending TV shows
router.get('/trending', async (req, res) => {
  try {
    const cacheKey = 'trending_tv';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }


    const response = await tmdbApi.get(TMDB_ENDPOINTS.TRENDING_TV);
    const formattedShows = response.data.results.map(show => formatMediaItem(show, 'tv'));
    
    const result = {
      results: formattedShows,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
    };

    cache.set(cacheKey, result, 1800); // Cache for 30 minutes
    await new Promise(resolve => setTimeout(resolve, 100));
    res.json(result);
  } catch (error) {
    console.error('Error fetching trending TV shows:', error.message);
    
    if (error.response?.status === 429) {
      res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch trending TV shows' });
    }
  }
});

// Get popular TV shows
router.get('/popular', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const cacheKey = `popular_tv_${page}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const response = await tmdbApi.get(TMDB_ENDPOINTS.POPULAR_TV, {
      params: { page }
    });
    
    const formattedShows = response.data.results.map(show => formatMediaItem(show, 'tv'));
    
    const result = {
      results: formattedShows,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
      page: response.data.page
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching popular TV shows:', error);
    res.status(500).json({ error: 'Failed to fetch popular TV shows' });
  }
});

// Get top rated TV shows
router.get('/top-rated', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const cacheKey = `top_rated_tv_${page}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const response = await tmdbApi.get(TMDB_ENDPOINTS.TOP_RATED_TV, {
      params: { page }
    });
    
    const formattedShows = response.data.results.map(show => formatMediaItem(show, 'tv'));
    
    const result = {
      results: formattedShows,
      totalResults: response.data.total_results,
      totalPages: response.data.total_pages,
      page: response.data.page
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Error fetching top rated TV shows:', error);
    res.status(500).json({ error: 'Failed to fetch top rated TV shows' });
  }
});

// Get TV show details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `tv_details_${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Get TV show details, videos, and credits in parallel
    const [detailsResponse, videosResponse, creditsResponse] = await Promise.all([
      tmdbApi.get(TMDB_ENDPOINTS.TV_DETAILS(id)),
      tmdbApi.get(TMDB_ENDPOINTS.TV_VIDEOS(id)),
      tmdbApi.get(TMDB_ENDPOINTS.TV_CREDITS(id))
    ]);

    const tvShow = formatMediaItem(detailsResponse.data, 'tv');
    
    // Add additional details
    const result = {
      ...tvShow,
      numberOfEpisodes: detailsResponse.data.number_of_episodes,
      numberOfSeasons: detailsResponse.data.number_of_seasons,
      episodeRunTime: detailsResponse.data.episode_run_time,
      genres: detailsResponse.data.genres,
      productionCompanies: detailsResponse.data.production_companies,
      productionCountries: detailsResponse.data.production_countries,
      spokenLanguages: detailsResponse.data.spoken_languages,
      networks: detailsResponse.data.networks,
      createdBy: detailsResponse.data.created_by,
      seasons: detailsResponse.data.seasons,
      lastAirDate: detailsResponse.data.last_air_date,
      nextEpisodeToAir: detailsResponse.data.next_episode_to_air,
      lastEpisodeToAir: detailsResponse.data.last_episode_to_air,
      inProduction: detailsResponse.data.in_production,
      status: detailsResponse.data.status,
      type: detailsResponse.data.type,
      tagline: detailsResponse.data.tagline,
      homepage: detailsResponse.data.homepage,
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
    console.error('Error fetching TV show details:', error);
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'TV show not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch TV show details' });
    }
  }
});

export default router;
