// API service layer for WeFlix frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
  genres?: Genre[];
  productionCompanies?: ProductionCompany[];
  videos?: Video[];
  cast?: CastMember[];
  crew?: CrewMember[];
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
  genres?: Genre[];
  networks?: Network[];
  seasons?: Season[];
  videos?: Video[];
  cast?: CastMember[];
  crew?: CrewMember[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface ApiResponse<T> {
  results: T[];
  totalResults: number;
  totalPages: number;
  page: number;
}

export interface SearchResponse<T> extends ApiResponse<T> {
  query: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  release_date: string | null;
  vote_average: number | null;
  added_at: string;
}

// Token cache to avoid repeated auth calls
let tokenCache: { token: string | null; expiry: number } = { token: null, expiry: 0 };

// Helper function to get auth token with caching
const getAuthToken = async () => {
  try {
    // Check if cached token is still valid (cache for 5 minutes)
    const now = Date.now();
    if (tokenCache.token && now < tokenCache.expiry) {
      return tokenCache.token;
    }

    // Import supabase client to get current session
    const { supabase } = await import('../lib/supabase');
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token || null;
    
    // Cache the token for 5 minutes
    tokenCache = {
      token,
      expiry: now + (5 * 60 * 1000) // 5 minutes
    };
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Generic API request function
const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token for protected routes
  if (endpoint.includes('watchlist')) {
    const token = await getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      console.error(`API request failed: ${endpoint}`, {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        url,
        headers: config.headers
      });
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error for ${endpoint}:`, error);
      throw new Error('Network error - please check if the server is running');
    }
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

// Movie API functions
export const movieApi = {
  getTrending: (): Promise<ApiResponse<Movie>> => 
    apiRequest('/movies/trending'),
  
  getPopular: (page = 1): Promise<ApiResponse<Movie>> => 
    apiRequest(`/movies/popular?page=${page}`),
  
  getTopRated: (page = 1): Promise<ApiResponse<Movie>> => 
    apiRequest(`/movies/top-rated?page=${page}`),
  
  getUpcoming: (page = 1): Promise<ApiResponse<Movie>> => 
    apiRequest(`/movies/upcoming?page=${page}`),
  
  getNowPlaying: (page = 1): Promise<ApiResponse<Movie>> => 
    apiRequest(`/movies/now-playing?page=${page}`),
  
  getDetails: (id: number): Promise<Movie> => 
    apiRequest(`/movies/${id}`),
};

// TV Show API functions
export const tvApi = {
  getTrending: (): Promise<ApiResponse<TVShow>> => 
    apiRequest('/tv/trending'),
  
  getPopular: (page = 1): Promise<ApiResponse<TVShow>> => 
    apiRequest(`/tv/popular?page=${page}`),
  
  getTopRated: (page = 1): Promise<ApiResponse<TVShow>> => 
    apiRequest(`/tv/top-rated?page=${page}`),
  
  getDetails: (id: number): Promise<TVShow> => 
    apiRequest(`/tv/${id}`),
};

// Search API functions
export const searchApi = {
  search: (query: string, page = 1, type: 'multi' | 'movie' | 'tv' = 'multi'): Promise<SearchResponse<Movie | TVShow>> => 
    apiRequest(`/search?query=${encodeURIComponent(query)}&page=${page}&type=${type}`),
  
  getSuggestions: (query: string): Promise<{ suggestions: Array<{ id: number; title: string; mediaType: string; posterPath: string | null; releaseDate: string }> }> => 
    apiRequest(`/search/suggestions?query=${encodeURIComponent(query)}`),
};

// Watchlist API functions
export const watchlistApi = {
  getWatchlist: (): Promise<{ watchlist: WatchlistItem[] }> => 
    apiRequest('/watchlist'),
  
  addToWatchlist: (item: {
    media_id: number;
    media_type: 'movie' | 'tv';
    title: string;
    poster_path?: string | null;
    backdrop_path?: string | null;
    overview?: string | null;
    release_date?: string | null;
    vote_average?: number | null;
  }): Promise<{ message: string; item: WatchlistItem }> => 
    apiRequest('/watchlist', {
      method: 'POST',
      body: JSON.stringify(item),
    }),
  
  removeFromWatchlist: (mediaId: number, mediaType: 'movie' | 'tv'): Promise<{ message: string; removed: WatchlistItem }> => 
    apiRequest(`/watchlist/${mediaId}/${mediaType}`, {
      method: 'DELETE',
    }),
  
  checkInWatchlist: (mediaId: number, mediaType: 'movie' | 'tv'): Promise<{ inWatchlist: boolean }> => 
    apiRequest(`/watchlist/check/${mediaId}/${mediaType}`),
};
