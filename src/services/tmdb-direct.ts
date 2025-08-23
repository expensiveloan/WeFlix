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
    console.log('🌐 TMDB Request URL:', url);
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TMDB API error: ${response.status} - ${errorText}`);
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ TMDB Response:', data);
    return data;
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

  getKoreanMovies: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/discover/movie?with_origin_country=KR&with_original_language=ko&sort_by=vote_average.desc&vote_count.gte=100&page=${page}&include_adult=false&without_genres=10402`);
    return {
      results: response.results.map(transformMovie).filter(movie => {
        // Filter out music/concert content by checking title and overview
        const title = movie.title.toLowerCase();
        const overview = movie.overview?.toLowerCase() || '';
        
        // Exclude BTS, BLACKPINK, and other K-pop/music content
        const musicKeywords = ['bts', 'blackpink', 'concert', 'tour', 'live', 'world tour', 'k-pop', 'kpop', 'music video', 'mv', 'album', 'song'];
        const isMusic = musicKeywords.some(keyword => title.includes(keyword) || overview.includes(keyword));
        
        return movie.posterPath && movie.voteAverage >= 6.0 && !isMusic;
      }),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },

  getChineseMovies: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/discover/movie?with_origin_country=CN&with_original_language=zh&sort_by=vote_average.desc&vote_count.gte=50&page=${page}&include_adult=false`);
    return {
      results: response.results.map(transformMovie).filter(movie => movie.posterPath && movie.voteAverage >= 6.0),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },

  getAsianMovies: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/discover/movie?with_origin_country=KR,CN,JP,TH,IN&sort_by=vote_average.desc&vote_count.gte=50&page=${page}&include_adult=false`);
    return {
      results: response.results.map(transformMovie).filter(movie => movie.posterPath && movie.voteAverage >= 6.5),
      totalResults: response.total_results,
      totalPages: response.total_pages,
      page: response.page
    };
  },
  
  getPopular: async (page = 1): Promise<ApiResponse<Movie>> => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/movie/popular?page=${page}`);
    return {
      results: response.results
        .map(transformMovie)
        .filter(movie => movie.posterPath && movie.voteAverage >= 6.0)
        .sort((a, b) => b.voteAverage - a.voteAverage),
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
  
  getSeasonDetails: async (tvId: number, seasonNumber: number): Promise<{ episodes: {
    id: number;
    name: string;
    episode_number: number;
    season_number: number;
    overview: string;
    still_path: string | null;
    air_date: string;
    runtime: number | null;
  }[] }> => {
    const response = await tmdbRequest<{
      episodes: {
        id: number;
        name: string;
        episode_number: number;
        season_number: number;
        overview: string;
        still_path: string | null;
        air_date: string;
        runtime: number | null;
      }[];
    }>(`/tv/${tvId}/season/${seasonNumber}`);
    
    return {
      episodes: response.episodes || []
    };
  }
};

// Search API functions
// Genre mapping for TMDB API
const GENRE_MAP = {
  // Movie and TV genres
  'action': 28,
  'adventure': 12,
  'animation': 16,
  'comedy': 35,
  'crime': 80,
  'documentary': 99,
  'drama': 18,
  'family': 10751,
  'fantasy': 14,
  'history': 36,
  'horror': 27,
  'music': 10402,
  'mystery': 9648,
  'romance': 10749,
  'science fiction': 878,
  'sci-fi': 878,
  'thriller': 53,
  'war': 10752,
  'western': 37,
  // TV specific genres
  'action & adventure': 10759,
  'kids': 10762,
  'news': 10763,
  'reality': 10764,
  'soap': 10766,
  'talk': 10767,
  'war & politics': 10768
};

// Helper function to detect category searches
const detectCategorySearch = (query: string): { isCategory: boolean; category?: string; mediaType?: 'tv' | 'movie'; genre?: number; country?: string } => {
  const lowerQuery = query.toLowerCase().trim();
  
  // Validate query length to prevent API errors
  if (lowerQuery.length === 0 || lowerQuery.length > 100) {
    return { isCategory: false };
  }
  
  // Check for combined country + genre searches FIRST (most specific)
  const countries = ['korean', 'chinese', 'japanese', 'thai', 'turkish', 'indian'];
  
  for (const country of countries) {
    if (lowerQuery.includes(country)) {
      for (const [genreName, genreId] of Object.entries(GENRE_MAP)) {
        if (lowerQuery.includes(genreName) && genreName !== 'drama') { // Exclude 'drama' to avoid conflicts
          return { isCategory: true, category: 'country-genre', country, genre: genreId };
        }
      }
    }
  }
  
  // Check for country/category searches SECOND (more specific patterns)
  // Korean drama patterns
  if (lowerQuery.includes('kdrama') || lowerQuery.includes('korean drama') || 
      lowerQuery.includes('korean tv') || lowerQuery.includes('k-drama')) {
    return { isCategory: true, category: 'korean', mediaType: 'tv' };
  }
  
  // Chinese drama patterns
  if (lowerQuery.includes('cdrama') || lowerQuery.includes('chinese drama') || 
      lowerQuery.includes('chinese tv') || lowerQuery.includes('c-drama')) {
    return { isCategory: true, category: 'chinese', mediaType: 'tv' };
  }
  
  // Thai drama patterns
  if (lowerQuery.includes('thai drama') || lowerQuery.includes('thai tv')) {
    return { isCategory: true, category: 'thai', mediaType: 'tv' };
  }
  
  // Turkish drama patterns
  if (lowerQuery.includes('turkish drama') || lowerQuery.includes('turkish tv')) {
    return { isCategory: true, category: 'turkish', mediaType: 'tv' };
  }
  
  // Japanese anime patterns
  if (lowerQuery.includes('anime') || lowerQuery.includes('japanese anime')) {
    return { isCategory: true, category: 'anime', mediaType: 'tv' };
  }
  
  // Indian movie patterns
  if (lowerQuery.includes('bollywood') || lowerQuery.includes('indian movie')) {
    return { isCategory: true, category: 'bollywood', mediaType: 'movie' };
  }
  
  // Check for genre searches LAST (less specific patterns)
  for (const [genreName, genreId] of Object.entries(GENRE_MAP)) {
    if (lowerQuery.includes(genreName)) {
      return { isCategory: true, category: 'genre', genre: genreId };
    }
  }
  
  return { isCategory: false };
};

export const searchApi = {
  search: async function(query: string, page = 1, type: 'multi' | 'movie' | 'tv' = 'multi'): Promise<ApiResponse<Movie | TVShow>> {
    try {
      // Validate input parameters
      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return {
          results: [],
          totalResults: 0,
          totalPages: 0,
          page: page
        };
      }

      // Ensure page is a valid integer and within TMDB limits
      page = Math.max(1, Math.min(500, Math.floor(Number(page) || 1)));

      const detectedCategory = detectCategorySearch(query);
      
      // Handle category-based searches
      if (detectedCategory.isCategory && detectedCategory.category) {
        if (detectedCategory.category === 'genre' && detectedCategory.genre !== undefined) {
          return await searchApi.searchByGenre(detectedCategory.genre, page);
        } else if (detectedCategory.category === 'country-genre' && detectedCategory.country && detectedCategory.genre !== undefined) {
          return await searchApi.searchByCountryGenre(detectedCategory.country, detectedCategory.genre, page);
        } else if (detectedCategory.mediaType) {
          return await searchApi.searchByCategory(detectedCategory.category, detectedCategory.mediaType, page);
        }
      }
      
      const endpoint = type === 'multi' ? '/search/multi' : `/search/${type}`;
      const response = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>(`${endpoint}?query=${encodeURIComponent(query.trim())}&page=${page}&include_adult=false`);
      
      console.log('🔍 Search API response for query:', query, 'page:', page, response);
      
      if (!response || !response.results) {
        console.warn('⚠️ Empty or invalid response from TMDB API');
        return {
          results: [],
          totalResults: 0,
          totalPages: 0,
          page: page
        };
      }
      
      let results = response.results.filter(item => item && item.id && item.poster_path).map((item: TMDBMovie | TMDBTVShow) => {
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
      
      // Sort by popularity for better results
      results = results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      
      // If we have fewer than 20 results due to filtering, try to fetch more from next pages
      if (results.length < 20 && page < 500 && response.total_pages && page < response.total_pages) {
        try {
          const nextPageResponse = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>(`${endpoint}?query=${encodeURIComponent(query.trim())}&page=${page + 1}&include_adult=false`);
          if (nextPageResponse?.results) {
            const additionalResults = nextPageResponse.results.filter(item => item && item.id && item.poster_path).map((item: TMDBMovie | TMDBTVShow) => {
              try {
                if ('media_type' in item && item.media_type === 'tv' || type === 'tv' || 'name' in item) {
                  return transformTVShow(item as TMDBTVShow);
                } else {
                  return transformMovie(item as TMDBMovie);
                }
              } catch (transformError) {
                console.error('❌ Error transforming additional item:', item, transformError);
                return null;
              }
            }).filter(Boolean) as (Movie | TVShow)[];
            
            results.push(...additionalResults);
            results = results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 20);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch additional results:', error);
        }
      }
      
      console.log('✅ Processed search results:', results.length, 'items for page', page);
      
      return {
        results,
        totalResults: response.total_results || 0,
        totalPages: Math.min(500, response.total_pages || 0),
        page: response.page || page
      };
    } catch (error) {
      console.error('❌ Search API error for query:', query, error);
      throw error;
    }
  },

  searchByCategory: async (category: string, mediaType: 'tv' | 'movie', page = 1): Promise<ApiResponse<Movie | TVShow>> => {
    try {
      let endpoint = '';
      let params = '';
      
      if (category === 'korean') {
        // Use discover endpoint for Korean content with proper country and language filter
        endpoint = `/discover/${mediaType}`;
        params = `with_origin_country=KR&with_original_language=ko&sort_by=popularity.desc&page=${page}&include_adult=false`;
      } else if (category === 'chinese') {
        // Use discover endpoint for Chinese content with proper country and language filter
        endpoint = `/discover/${mediaType}`;
        params = `with_origin_country=CN&with_original_language=zh&sort_by=popularity.desc&page=${page}&include_adult=false`;
      } else if (category === 'anime') {
        // Use discover endpoint for anime (Japanese animation)
        endpoint = `/discover/${mediaType}`;
        params = `with_origin_country=JP&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}&include_adult=false`;
      } else if (category === 'bollywood') {
        // Use discover endpoint for Bollywood movies
        endpoint = `/discover/${mediaType}`;
        params = `with_origin_country=IN&with_original_language=hi&sort_by=popularity.desc&page=${page}&include_adult=false`;
      } else if (category === 'thai') {
        // Use discover endpoint for Thai content
        endpoint = `/discover/${mediaType}`;
        params = `with_origin_country=TH&with_original_language=th&sort_by=popularity.desc&page=${page}&include_adult=false`;
      } else if (category === 'turkish') {
        // Use discover endpoint for Turkish content
        endpoint = `/discover/${mediaType}`;
        params = `with_origin_country=TR&with_original_language=tr&sort_by=popularity.desc&page=${page}&include_adult=false`;
      }
      
      const response = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>(`${endpoint}?${params}`);
      
      console.log(`🔍 Category search API response for ${category} ${mediaType}:`, response);
      
      if (!response || !response.results) {
        console.warn('⚠️ Empty or invalid response from TMDB API');
        return {
          results: [],
          totalResults: 0,
          totalPages: 0,
          page: page
        };
      }
      
      let results = response.results.filter(item => item && item.id && item.poster_path).map((item: TMDBMovie | TMDBTVShow) => {
        try {
          if (mediaType === 'tv' || 'name' in item) {
            return transformTVShow(item as TMDBTVShow);
          } else {
            return transformMovie(item as TMDBMovie);
          }
        } catch (transformError) {
          console.error('❌ Error transforming item:', item, transformError);
          return null;
        }
      }).filter(Boolean) as (Movie | TVShow)[];
      
      // If we have fewer than 20 results due to filtering, try to fetch more from next pages
      if (results.length < 20 && page < 500 && response.total_pages && page < response.total_pages) {
        try {
          const nextPageResponse = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>(`${endpoint}?${params.replace(`page=${page}`, `page=${page + 1}`)}`);
          if (nextPageResponse?.results) {
            const additionalResults = nextPageResponse.results.filter(item => item && item.id && item.poster_path).map((item: TMDBMovie | TMDBTVShow) => {
              try {
                if (mediaType === 'tv' || 'name' in item) {
                  return transformTVShow(item as TMDBTVShow);
                } else {
                  return transformMovie(item as TMDBMovie);
                }
              } catch (transformError) {
                console.error('❌ Error transforming additional item:', item, transformError);
                return null;
              }
            }).filter(Boolean) as (Movie | TVShow)[];
            
            results.push(...additionalResults);
            results = results.slice(0, 20);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch additional results:', error);
        }
      }
      
      console.log(`✅ Processed ${category} ${mediaType} results:`, results.length, 'items for page', page);
      
      return {
        results,
        totalResults: response.total_results || 0,
        totalPages: Math.min(500, response.total_pages || 0),
        page: response.page || page
      };
    } catch (error) {
      console.error(`❌ Category search API error for ${category} ${mediaType}:`, error);
      throw error;
    }
  },

  searchByGenre: async (genreId: number, page = 1): Promise<ApiResponse<Movie | TVShow>> => {
    try {
      // Use discover endpoint for movies with the specific genre - this ensures proper pagination
      const response = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}&include_adult=false`);
      
      console.log(`🔍 Genre search API response for genre ${genreId}, page ${page}:`, response);
      
      if (!response || !response.results) {
        console.warn('⚠️ Empty or invalid response from TMDB API');
        return {
          results: [],
          totalResults: 0,
          totalPages: 0,
          page: page
        };
      }
      
      let results = response.results.filter(item => item && item.id && item.poster_path).map((item: TMDBMovie) => {
        try {
          return transformMovie(item);
        } catch (transformError) {
          console.error('❌ Error transforming movie:', item, transformError);
          return null;
        }
      }).filter(Boolean) as Movie[];
      
      // If we have fewer than 20 results due to filtering, try to fetch more from next pages
      if (results.length < 20 && page < 500 && response.total_pages && page < response.total_pages) {
        try {
          const nextPageResponse = await tmdbRequest<TMDBResponse<TMDBMovie>>(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page + 1}&include_adult=false`);
          if (nextPageResponse?.results) {
            const additionalResults = nextPageResponse.results.filter(item => item && item.id && item.poster_path).map((item: TMDBMovie) => {
              try {
                return transformMovie(item);
              } catch (transformError) {
                console.error('❌ Error transforming additional movie:', item, transformError);
                return null;
              }
            }).filter(Boolean) as Movie[];
            
            results.push(...additionalResults);
            results = results.slice(0, 20);
          }
        } catch (error) {
          console.warn('⚠️ Could not fetch additional genre results:', error);
        }
      }
      
      console.log(`✅ Processed genre ${genreId} results:`, results.length, 'items for page', page);
      
      return {
        results,
        totalResults: response.total_results || 0,
        totalPages: response.total_pages || 0,
        page: response.page || page
      };
    } catch (error) {
      console.error(`❌ Genre search API error for genre ${genreId}:`, error);
      throw error;
    }
  },

  searchByCountryGenre: async (country: string, genreId: number, page = 1): Promise<ApiResponse<Movie | TVShow>> => {
    try {
      // Ensure page is a valid integer and within TMDB limits
      page = Math.max(1, Math.min(500, Math.floor(Number(page) || 1)));
      
      // Map countries to their codes and languages
      const countryMap: { [key: string]: { code: string; language: string } } = {
        'korean': { code: 'KR', language: 'ko' },
        'chinese': { code: 'CN', language: 'zh' },
        'japanese': { code: 'JP', language: 'ja' },
        'thai': { code: 'TH', language: 'th' },
        'turkish': { code: 'TR', language: 'tr' },
        'indian': { code: 'IN', language: 'hi' }
      };
      
      const countryInfo = countryMap[country];
      if (!countryInfo) {
        throw new Error(`Unsupported country: ${country}`);
      }
      
      // Use discover endpoint for both movies and TV shows, then combine results
      const movieEndpoint = `/discover/movie`;
      const tvEndpoint = `/discover/tv`;
      const params = `with_origin_country=${countryInfo.code}&with_original_language=${countryInfo.language}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&include_adult=false`;
      
      const [movieResponse, tvResponse] = await Promise.all([
        tmdbRequest<TMDBResponse<TMDBMovie>>(`${movieEndpoint}?${params}`).catch(() => null),
        tmdbRequest<TMDBResponse<TMDBTVShow>>(`${tvEndpoint}?${params}`).catch(() => null)
      ]);
      
      console.log(`🔍 Country-Genre search API response for ${country} ${genreId}:`, { movieResponse, tvResponse });
      
      const allResults: (Movie | TVShow)[] = [];
      
      // Process movie results
      if (movieResponse?.results) {
        const movieResults = movieResponse.results.filter(item => item && item.id && item.poster_path).map((item: TMDBMovie) => {
          try {
            return transformMovie(item);
          } catch (transformError) {
            console.error('❌ Error transforming movie:', item, transformError);
            return null;
          }
        }).filter(Boolean) as Movie[];
        allResults.push(...movieResults);
      }
      
      // Process TV results
      if (tvResponse?.results) {
        const tvResults = tvResponse.results.filter(item => item && item.id && item.poster_path).map((item: TMDBTVShow) => {
          try {
            return transformTVShow(item);
          } catch (transformError) {
            console.error('❌ Error transforming TV show:', item, transformError);
            return null;
          }
        }).filter(Boolean) as TVShow[];
        allResults.push(...tvResults);
      }
      
      // Sort combined results by popularity
      allResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      
      const totalMovieResults = movieResponse?.total_results || 0;
      const totalTVResults = tvResponse?.total_results || 0;
      const totalResults = totalMovieResults + totalTVResults;
      
      // Calculate total pages based on combined results (approximate)
      const totalPages = Math.min(500, Math.ceil(totalResults / 20));
      
      console.log(`✅ Processed ${country} ${genreId} results:`, allResults.length, 'items for page', page);
      
      return {
        results: allResults,
        totalResults,
        totalPages,
        page
      };
    } catch (error) {
      console.error(`❌ Country-Genre search API error for ${country} genre ${genreId}:`, error);
      throw error;
    }
  },
  
  getSuggestions: async (query: string) => {
    const response = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>(`/search/multi?query=${encodeURIComponent(query)}&include_adult=false`);
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
  overview: string | null;
  release_date: string | null;
  vote_average: number;
  added_at: string;
}

export interface WatchHistoryItem {
  id: string;
  user_id: string;
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string | null;
  release_date: string | null;
  vote_average: number;
  watched_at: string;
  season_number?: number;
  episode_number?: number;
}

export interface WatchHistoryAddItem {
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
  season_number?: number;
  episode_number?: number;
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

    // Remove duplicates based on media_id and media_type, keeping the most recent entry
    const uniqueWatchlist = (data || []).reduce((acc: WatchlistItem[], current: WatchlistItem) => {
      const existingIndex = acc.findIndex(item => 
        item.media_id === current.media_id && item.media_type === current.media_type
      );
      
      if (existingIndex === -1) {
        acc.push(current);
      } else {
        // Keep the more recent one (data is already sorted by added_at desc)
        if (new Date(current.added_at) > new Date(acc[existingIndex].added_at)) {
          acc[existingIndex] = current;
        }
      }
      
      return acc;
    }, []);

    return { watchlist: uniqueWatchlist };
  },

  getWatchHistory: async (): Promise<{ history: WatchHistoryItem[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { history: [] };
    }

    try {
      // Get user's recently watched content from watch_history table
      // Use DISTINCT ON to get only the most recent entry per media item
      const { data: historyData, error: historyError } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('media_id, media_type, watched_at', { ascending: false })
        .limit(50); // Get more to filter duplicates

      if (historyError || !historyData) {
        return { history: [] };
      }

      // Remove duplicates by keeping only the most recent entry per media_id + media_type
      const uniqueHistory = historyData.reduce((acc: WatchHistoryItem[], current) => {
        const existingIndex = acc.findIndex(item => 
          item.media_id === current.media_id && item.media_type === current.media_type
        );
        
        if (existingIndex === -1) {
          acc.push(current);
        } else {
          // Keep the more recent one
          if (new Date(current.watched_at) > new Date(acc[existingIndex].watched_at)) {
            acc[existingIndex] = current;
          }
        }
        
        return acc;
      }, []);

      // Sort by watched_at descending and limit to 20
      const sortedHistory = uniqueHistory
        .sort((a, b) => new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime())
        .slice(0, 20);

      return { history: sortedHistory };
    } catch (error) {
      console.error('Error getting watch history:', error);
      return { history: [] };
    }
  },

  addToWatchHistory: async (item: WatchHistoryAddItem): Promise<{ success: boolean }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Authorization token required');
    }

    try {
      // Use upsert to handle duplicates automatically
      const watchHistoryItem = {
        user_id: user.id,
        media_id: item.media_id,
        media_type: item.media_type,
        title: item.title,
        poster_path: item.poster_path || null,
        backdrop_path: item.backdrop_path || null,
        overview: item.overview || null,
        release_date: item.release_date || null,
        vote_average: item.vote_average || 0,
        season_number: item.season_number || null,
        episode_number: item.episode_number || null,
        watched_at: new Date().toISOString()
      };

      // Use upsert with conflict resolution on unique constraint
      const { error: upsertError } = await supabase
        .from('watch_history')
        .upsert(watchHistoryItem, {
          onConflict: 'user_id,media_id,media_type',
          ignoreDuplicates: false
        });

      if (upsertError) {
        throw new Error(`Failed to add/update watch history: ${upsertError.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding to watch history:', error);
      throw error;
    }
  },

  getWatchHistorySuggestions: async (): Promise<{ suggestions: (Movie | TVShow)[] }> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { suggestions: [] };
    }

    try {
      // Get user's actual watch history
      const { data: watchHistoryData, error: watchHistoryError } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })
        .limit(10);

      if (watchHistoryError || !watchHistoryData || watchHistoryData.length === 0) {
        // If no watch history, return trending content as fallback
        const trendingResponse = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>('/trending/all/week');
        return {
          suggestions: trendingResponse.results.slice(0, 20).map((item: TMDBMovie | TMDBTVShow) => {
            if ('title' in item) {
              return transformMovie(item);
            } else {
              return transformTVShow(item);
            }
          })
        };
      }

      // Get detailed info for each watched item to extract genres
      const watchedItemsWithDetails = await Promise.all(
        watchHistoryData.slice(0, 5).map(async (historyItem) => {
          try {
            if (historyItem.media_type === 'movie') {
              const movieDetails = await tmdbRequest<TMDBMovie>(`/movie/${historyItem.media_id}`);
              return { ...movieDetails, mediaType: 'movie' as const };
            } else {
              const tvDetails = await tmdbRequest<TMDBTVShow>(`/tv/${historyItem.media_id}`);
              return { ...tvDetails, mediaType: 'tv' as const };
            }
          } catch (error) {
            console.warn(`Failed to get details for ${historyItem.media_type} ${historyItem.media_id}:`, error);
            return null;
          }
        })
      );

      // Extract genres from watched content
      const userGenres = new Set<number>();
      watchedItemsWithDetails.forEach(item => {
        if (item && item.genres) {
          item.genres.forEach((genre: { id: number }) => userGenres.add(genre.id));
        }
      });

      // Get suggestions based on user's preferred genres
      const suggestions: (Movie | TVShow)[] = [];
      
      if (userGenres.size > 0) {
        // Get movies and TV shows with similar genres
        const genreIds = Array.from(userGenres).slice(0, 3).join(',');
        
        try {
          const [movieSuggestions, tvSuggestions] = await Promise.all([
            tmdbRequest<TMDBResponse<TMDBMovie>>(`/discover/movie?with_genres=${genreIds}&sort_by=popularity.desc&vote_average.gte=6.0&page=1`),
            tmdbRequest<TMDBResponse<TMDBTVShow>>(`/discover/tv?with_genres=${genreIds}&sort_by=popularity.desc&vote_average.gte=6.0&page=1`)
          ]);

          suggestions.push(
            ...movieSuggestions.results.slice(0, 10).map(transformMovie),
            ...tvSuggestions.results.slice(0, 10).map(transformTVShow)
          );
        } catch (error) {
          console.warn('Failed to get genre-based suggestions:', error);
        }
      }

      // Add trending content to fill gaps
      const trendingResponse = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>('/trending/all/week');
      suggestions.push(
        ...trendingResponse.results.slice(0, 10).map((item: TMDBMovie | TMDBTVShow) => {
          if ('title' in item) {
            return transformMovie(item);
          } else {
            return transformTVShow(item);
          }
        })
      );

      // Remove duplicates, exclude already watched items, and filter by quality
      const watchedIds = new Set(watchHistoryData.map(item => `${item.media_id}-${item.media_type}`));
      const uniqueSuggestions = suggestions.filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id && t.mediaType === item.mediaType) &&
        !watchedIds.has(`${item.id}-${item.mediaType}`) &&
        item.posterPath && 
        item.voteAverage >= 6.0
      ).slice(0, 20);

      return { suggestions: uniqueSuggestions };
    } catch (error) {
      console.error('Error getting watch history suggestions:', error);
      // Fallback to trending content
      const trendingResponse = await tmdbRequest<TMDBResponse<TMDBMovie | TMDBTVShow>>('/trending/all/week');
      return {
        suggestions: trendingResponse.results.slice(0, 20).map((item: TMDBMovie | TMDBTVShow) => {
          if ('title' in item) {
            return transformMovie(item);
          } else {
            return transformTVShow(item);
          }
        })
      };
    }
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
