// Direct TMDB API service for production deployment
const TMDB_API_KEY = '402567ca0e69cc587f0506845b7f5181';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// TMDB API response interfaces
interface TMDBMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  media_type?: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
  production_companies?: { id: number; name: string; logo_path: string | null; origin_country: string }[];
}

interface TMDBTVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  first_air_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  media_type?: string;
  number_of_episodes?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  networks?: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  seasons?: { id: number; name: string; overview: string; poster_path: string | null; season_number: number; episode_count: number; air_date: string }[];
}

interface TMDBResponse<T> {
  results: T[];
  total_results: number;
  total_pages: number;
  page: number;
}

interface TMDBCreditsResponse {
  cast: {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }[];
  crew: {
    id: number;
    name: string;
    job: string;
    department: string;
    profile_path: string | null;
  }[];
}

interface TMDBVideosResponse {
  results: {
    id: string;
    key: string;
    name: string;
    type: string;
    site: string;
    official: boolean;
  }[];
}

export interface Movie {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  adult: boolean;
  originalLanguage: string;
  mediaType: 'movie';
  runtime?: number;
  genres?: { id: number; name: string }[];
  productionCompanies?: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  videos?: { id: string; key: string; name: string; type: string; site: string; official: boolean }[];
  cast?: { id: number; name: string; character: string; profile_path: string | null }[];
  crew?: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
}

export interface TVShow {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  adult: boolean;
  originalLanguage: string;
  mediaType: 'tv';
  numberOfEpisodes?: number;
  numberOfSeasons?: number;
  episodeRunTime?: number[];
  genres?: { id: number; name: string }[];
  networks?: { id: number; name: string; logo_path: string | null; origin_country: string }[];
  seasons?: { id: number; name: string; overview: string; poster_path: string | null; season_number: number; episode_count: number; air_date: string }[];
  videos?: { id: string; key: string; name: string; type: string; site: string; official: boolean }[];
  cast?: { id: number; name: string; character: string; profile_path: string | null }[];
  crew?: { id: number; name: string; job: string; department: string; profile_path: string | null }[];
}

export interface ApiResponse<T> {
  results: T[];
  totalResults: number;
  totalPages: number;
  page: number;
}

// Helper function to transform TMDB response to our format
const transformMovie = (movie: TMDBMovie): Movie => ({
  id: movie.id,
  title: movie.title,
  originalTitle: movie.original_title,
  overview: movie.overview,
  releaseDate: movie.release_date,
  posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
  backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
  voteAverage: movie.vote_average,
  voteCount: movie.vote_count,
  popularity: movie.popularity,
  genreIds: movie.genre_ids || [],
  adult: movie.adult,
  originalLanguage: movie.original_language,
  mediaType: 'movie'
});

const transformTVShow = (show: TMDBTVShow): TVShow => ({
  id: show.id,
  title: show.name,
  originalTitle: show.original_name,
  overview: show.overview,
  releaseDate: show.first_air_date,
  posterPath: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
  backdropPath: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
  voteAverage: show.vote_average,
  voteCount: show.vote_count,
  popularity: show.popularity,
  genreIds: show.genre_ids || [],
  adult: show.adult,
  originalLanguage: show.original_language,
  mediaType: 'tv'
});

// Generic TMDB API request function
const tmdbRequest = async <T>(endpoint: string): Promise<T> => {
  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`TMDB request failed: ${endpoint}`, error);
    throw error;
  }
};

// Movie API functions
export const movieApi = {
  getTrending: async (): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>('/trending/movie/week');
    return {
      results: response.results.map(transformMovie),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getPopular: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/movie/popular?page=${page}`);
    return {
      results: response.results.map(transformMovie),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getTopRated: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/movie/top_rated?page=${page}`);
    return {
      results: response.results.map(transformMovie),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getUpcoming: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/movie/upcoming?page=${page}`);
    return {
      results: response.results.map(transformMovie),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getNowPlaying: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/movie/now_playing?page=${page}`);
    return {
      results: response.results.map(transformMovie),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getDetails: async (id: number): Promise<Movie> => {
    const [movieResponse, creditsResponse, videosResponse] = await Promise.all([
      tmdbRequest<TMDBMovie>(`/movie/${id}`),
      tmdbRequest<TMDBCreditsResponse>(`/movie/${id}/credits`),
      tmdbRequest<TMDBVideosResponse>(`/movie/${id}/videos`)
    ]);
    
    const movie = transformMovie(movieResponse);
    return {
      ...movie,
      runtime: movieResponse.runtime,
      genres: movieResponse.genres || [],
      productionCompanies: movieResponse.production_companies || [],
      cast: creditsResponse.cast.slice(0, 10),
      crew: creditsResponse.crew,
      videos: videosResponse.results
    };
  },
};

// TV Show API functions
export const tvApi = {
  getTrending: async (): Promise<ApiResponse<TVShow>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBTVShow>>('/trending/tv/week');
    return {
      results: response.results.map(transformTVShow),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getPopular: async (page = 1): Promise<ApiResponse<TVShow>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBTVShow>>(`/tv/popular?page=${page}`);
    return {
      results: response.results.map(transformTVShow),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getTopRated: async (page = 1): Promise<ApiResponse<TVShow>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBTVShow>>(`/tv/top_rated?page=${page}`);
    return {
      results: response.results.map(transformTVShow),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getDetails: async (id: number): Promise<TVShow> => {
    const [showResponse, creditsResponse, videosResponse] = await Promise.all([
      tmdbRequest<TMDBTVShow>(`/tv/${id}`),
      tmdbRequest<TMDBCreditsResponse>(`/tv/${id}/credits`),
      tmdbRequest<TMDBVideosResponse>(`/tv/${id}/videos`)
    ]);
    
    const show = transformTVShow(showResponse);
    return {
      ...show,
      numberOfEpisodes: showResponse.number_of_episodes,
      numberOfSeasons: showResponse.number_of_seasons,
      episodeRunTime: showResponse.episode_run_time,
      genres: showResponse.genres || [],
      networks: showResponse.networks || [],
      seasons: showResponse.seasons || [],
      cast: creditsResponse.cast.slice(0, 10),
      crew: creditsResponse.crew,
      videos: videosResponse.results
    };
  },
};

// Search API functions
export const searchApi = {
  search: async (query: string, page = 1, type: 'multi' | 'movie' | 'tv' = 'multi'): Promise<ApiResponse<Movie | TVShow>> => {
    try {
      const endpoint = type === 'multi' ? '/search/multi' : `/search/${type}`;
      const response = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>(`${endpoint}?query=${encodeURIComponent(query)}&page=${page}`);
      
      console.log('🔍 Search API response for query:', query, response);
      
      if (!response || !response.results) {
        console.warn('⚠️ Empty or invalid response from TMDB API');
        return {
          results: [],
          totalResults: 0,
          totalPages: 0,
          page: page
        };
      }
      
      const results = response.results.filter(item => item && item.id).map((item: TMDBMovie | TMDBTVShow) => {
        try {
          if ('media_type' in item && item.media_type === 'tv' || type === 'tv' || 'name' in item) {
            return transformTVShow(item as TMDBTVShow);
          } else {
            return transformMovie(item as TMDBMovie);
          }
        } catch (transformError) {
          console.error('❌ Error transforming item:', item, transformError);
          return null;
        }
      }).filter(Boolean) as (Movie | TVShow)[];
      
      console.log('✅ Processed search results:', results.length, 'items');
      
      return {
        results,
        totalResults: response.total_results || 0,
        totalPages: response.total_pages || 0,
        page: response.page || page
      };
    } catch (error) {
      console.error('❌ Search API error for query:', query, error);
      throw error;
    }
  },
  
  getSuggestions: async (query: string) => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>(`/search/multi?query=${encodeURIComponent(query)}`);
    const suggestions = response.results.slice(0, 5).map((item: TMDBMovie | TMDBTVShow) => ({
      id: item.id,
      title: 'title' in item ? item.title : (item as TMDBTVShow).name,
      mediaType: ('media_type' in item && item.media_type) || ('name' in item ? 'tv' : 'movie'),
      posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
      releaseDate: 'release_date' in item ? item.release_date : (item as TMDBTVShow).first_air_date
    }));
    
    return { suggestions };
  },
};

// Watchlist interfaces and API
export interface WatchlistItem {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  added_at: string;
}

interface WatchlistAddItem {
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

// Import Supabase client
import { supabase } from '../lib/supabase';

export const watchlistApi = {
  getWatchlist: async (): Promise<{ watchlist: WatchlistItem[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authorization token required');
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch watchlist: ${error.message}`);
    }

    return { watchlist: data || [] };
  },

  addToWatchlist: async (item: WatchlistAddItem): Promise<{ item: WatchlistItem }> => {
    console.log('🔍 Starting addToWatchlist with item:', item);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('👤 Auth check - User:', user?.id, 'Error:', authError);
    
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('Authorization token required');
    }

    // Check if item already exists
    console.log('🔍 Checking for existing item...');
    const { data: existingItem, error: checkError } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('media_id', item.media_id)
      .eq('media_type', item.media_type)
      .maybeSingle();

    console.log('📋 Existing item check - Data:', existingItem, 'Error:', checkError);

    if (checkError) {
      console.error('❌ Error checking existing item:', checkError);
    }

    if (existingItem) {
      console.log('⚠️ Item already exists in watchlist');
      throw new Error('Item already in watchlist');
    }

    const watchlistItem = {
      user_id: user.id,
      media_id: item.media_id,
      media_type: item.media_type,
      title: item.title,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      overview: item.overview,
      release_date: item.release_date || null, // Convert empty string to null
      vote_average: item.vote_average
    };

    console.log('💾 Inserting watchlist item:', watchlistItem);

    const { data, error } = await supabase
      .from('watchlist')
      .insert([watchlistItem])
      .select()
      .single();

    console.log('📝 Insert result - Data:', data, 'Error:', error);

    if (error) {
      console.error('❌ Failed to insert:', error);
      throw new Error(`Failed to add to watchlist: ${error.message}`);
    }

    console.log('✅ Successfully added to watchlist:', data);
    return { item: data };
  },

  removeFromWatchlist: async (mediaId: number, mediaType: 'movie' | 'tv'): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authorization token required');
    }

    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('user_id', user.id)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType);

    if (error) {
      throw new Error(`Failed to remove from watchlist: ${error.message}`);
    }

    return { success: true };
  },

  checkInWatchlist: async (mediaId: number, mediaType: 'movie' | 'tv'): Promise<{ inWatchlist: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { inWatchlist: false };
    }

    const { data, error } = await supabase
      .from('watchlist')
      .select('id')
      .eq('user_id', user.id)
      .eq('media_id', mediaId)
      .eq('media_type', mediaType)
      .maybeSingle();

    if (error) {
      console.error('Error checking watchlist:', error);
      return { inWatchlist: false };
    }

    return { inWatchlist: !!data };
  }
};
