import { useState, useEffect } from 'react';
import { movieApi, tvApi } from '../services/tmdb-direct';
import type { Movie, TVShow, ApiResponse } from '../services/tmdb-direct';

export const useMovies = () => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);

        // Sequential requests to respect rate limiting
        const trending = await movieApi.getTrending();
        setTrendingMovies(trending.results);
        
        const popular = await movieApi.getPopular();
        setPopularMovies(popular.results);
        
        const topRated = await movieApi.getTopRated();
        setTopRatedMovies(topRated.results);
        
        const upcoming = await movieApi.getUpcoming();
        setUpcomingMovies(upcoming.results);
        
        const nowPlaying = await movieApi.getNowPlaying();
        setNowPlayingMovies(nowPlaying.results);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch movies');
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  return {
    trendingMovies,
    popularMovies,
    topRatedMovies,
    upcomingMovies,
    nowPlayingMovies,
    loading,
    error
  };
};

export const useTVShows = () => {
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<TVShow[]>([]);
  const [koreanShows, setKoreanShows] = useState<TVShow[]>([]);
  const [chineseShows, setChineseShows] = useState<TVShow[]>([]);
  const [asianShows, setAsianShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to filter Asian content by language
  const filterAsianContent = (shows: TVShow[]) => {
    const asianLanguages = ['ko', 'zh', 'ja', 'th', 'vi', 'id', 'ms', 'hi', 'ta', 'te'];
    const asianKeywords = ['korean', 'chinese', 'japanese', 'thai', 'drama', 'k-drama', 'cdrama', 'jdrama', 'bollywood'];
    
    return shows.filter(show => 
      asianLanguages.includes(show.originalLanguage) ||
      show.title.match(/[\u4e00-\u9fff\u3400-\u4dbf\uac00-\ud7af\u3040-\u309f\u30a0-\u30ff]/g) || // Asian characters
      asianKeywords.some(keyword => 
        show.title.toLowerCase().includes(keyword) ||
        (show.overview && show.overview.toLowerCase().includes(keyword))
      )
    );
  };

  const filterKoreanContent = (shows: TVShow[]) => {
    const koreanKeywords = ['korean', 'k-drama', 'kdrama', 'korea', 'seoul'];
    
    return shows.filter(show => 
      show.originalLanguage === 'ko' ||
      show.title.match(/[\uac00-\ud7af]/g) || // Korean characters
      koreanKeywords.some(keyword => 
        show.title.toLowerCase().includes(keyword) ||
        (show.overview && show.overview.toLowerCase().includes(keyword))
      )
    );
  };

  const filterChineseContent = (shows: TVShow[]) => {
    const chineseKeywords = ['chinese', 'cdrama', 'china', 'mandarin', 'cantonese', 'taiwan', 'hong kong'];
    
    return shows.filter(show => 
      show.originalLanguage === 'zh' ||
      show.title.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || // Chinese characters
      chineseKeywords.some(keyword => 
        show.title.toLowerCase().includes(keyword) ||
        (show.overview && show.overview.toLowerCase().includes(keyword))
      )
    );
  };

  useEffect(() => {
    const fetchTVShows = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch multiple pages to get more content
        const fetchMultiplePages = async (apiCall: (page: number) => Promise<ApiResponse<TVShow>>, maxPages = 3) => {
          const allResults: TVShow[] = [];
          for (let page = 1; page <= maxPages; page++) {
            try {
              const response = await apiCall(page);
              allResults.push(...response.results);
              // Small delay to respect rate limiting
              await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
              console.warn(`Failed to fetch page ${page}:`, err);
              break; // Stop if a page fails
            }
          }
          return allResults;
        };

        // Fetch extensive data for View All functionality
        const fetchExtensiveData = async (apiCall: (page: number) => Promise<ApiResponse<TVShow>>, maxPages = 10) => {
          const allResults: TVShow[] = [];
          for (let page = 1; page <= maxPages; page++) {
            try {
              const response = await apiCall(page);
              allResults.push(...response.results);
              // Small delay to respect rate limiting
              await new Promise(resolve => setTimeout(resolve, 150));
            } catch (err) {
              console.warn(`Failed to fetch extensive page ${page}:`, err);
              break; // Stop if a page fails
            }
          }
          return allResults;
        };

        // Sequential requests to respect rate limiting
        const trending = await tvApi.getTrending();
        setTrendingTVShows(trending.results);
        
        const popularShows = await fetchMultiplePages(tvApi.getPopular, 5);
        setPopularTVShows(popularShows);
        
        const topRatedShows = await fetchMultiplePages(tvApi.getTopRated, 5);
        setTopRatedTVShows(topRatedShows);

        // Fetch extensive data for comprehensive Asian content
        const extensivePopular = await fetchExtensiveData(tvApi.getPopular, 10);
        const extensiveTopRated = await fetchExtensiveData(tvApi.getTopRated, 10);

        // Filter Asian content from all fetched shows (more data = more Asian content)
        const allShows = [...trending.results, ...extensivePopular, ...extensiveTopRated];
        
        // Remove duplicates based on ID
        const uniqueShows = allShows.filter((show, index, self) => 
          index === self.findIndex(s => s.id === show.id)
        );
        
        // Filter and sort alphabetically
        const koreanContent = filterKoreanContent(uniqueShows).sort((a, b) => a.title.localeCompare(b.title));
        const chineseContent = filterChineseContent(uniqueShows).sort((a, b) => a.title.localeCompare(b.title));
        const asianContent = filterAsianContent(uniqueShows).sort((a, b) => a.title.localeCompare(b.title));
        
        setKoreanShows(koreanContent);
        setChineseShows(chineseContent);
        setAsianShows(asianContent);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch TV shows');
        console.error('Error fetching TV shows:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, []);

  return {
    trendingTVShows,
    popularTVShows,
    topRatedTVShows,
    koreanShows,
    chineseShows,
    asianShows,
    loading,
    error
  };
};

export const useMovieDetails = (id: number | null) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setMovie(null);
      return;
    }

    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const movieDetails = await movieApi.getDetails(id);
        setMovie(movieDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch movie details');
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  return { movie, loading, error };
};

export const useTVShowDetails = (id: number | null) => {
  const [tvShow, setTVShow] = useState<TVShow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setTVShow(null);
      return;
    }

    const fetchTVShowDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const tvShowDetails = await tvApi.getDetails(id);
        setTVShow(tvShowDetails);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch TV show details');
        console.error('Error fetching TV show details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTVShowDetails();
  }, [id]);

  return { tvShow, loading, error };
};
