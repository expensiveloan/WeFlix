import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import MobileNavbar from '../components/MobileNavbar'
import NetflixHero from '../components/NetflixHero'
import MovieRow from '../components/MovieRow'
import LoadingSpinner from '../components/LoadingSpinner'
import { useMovies } from '../hooks/useMovies'
import { useVideoPlayer } from '../contexts/VideoPlayerContext'
import { movieApi, tvApi, watchlistApi, Movie, TVShow, WatchHistoryItem } from '../services/tmdb-direct'
import trendingIcon from '../assets/trending.png'

const Home: React.FC = () => {
  const { 
    trendingMovies, 
    popularMovies, 
    topRatedMovies, 
    upcomingMovies, 
    loading, 
    error 
  } = useMovies();
  
  const { isVideoPlayerActive } = useVideoPlayer();

  // State for Asian movie sections
  const [koreanMovies, setKoreanMovies] = useState<Movie[]>([])
  const [chineseMovies, setChineseMovies] = useState<Movie[]>([])
  const [asianMovies, setAsianMovies] = useState<Movie[]>([])
  
  // State for TV shows
  const [trendingTVShows, setTrendingTVShows] = useState<TVShow[]>([])
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([])
  const [topRatedTVShows, setTopRatedTVShows] = useState<TVShow[]>([])
  
  // State for watch history
  const [watchHistory, setWatchHistory] = useState<WatchHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(true)

  // Function to refresh watch history
  const refreshWatchHistory = async () => {
    try {
      const historyResponse = await watchlistApi.getWatchHistory()
      setWatchHistory(historyResponse.history)
    } catch (error) {
      console.error('Error refreshing watch history:', error)
    }
  }

  // Fetch Asian movies, TV shows, and watch history
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setHistoryLoading(true)
        const [
          koreanResponse, 
          chineseResponse, 
          asianResponse,
          trendingTVResponse,
          popularTVResponse,
          topRatedTVResponse,
          historyResponse
        ] = await Promise.all([
          movieApi.getKoreanMovies(),
          movieApi.getChineseMovies(),
          movieApi.getAsianMovies(),
          tvApi.getTrending(),
          tvApi.getPopular(),
          tvApi.getTopRated(),
          watchlistApi.getWatchHistory()
        ])
        
        setKoreanMovies(koreanResponse.results)
        setChineseMovies(chineseResponse.results)
        setAsianMovies(asianResponse.results)
        setTrendingTVShows(trendingTVResponse.results)
        setPopularTVShows(popularTVResponse.results)
        setTopRatedTVShows(topRatedTVResponse.results)
        setWatchHistory(historyResponse.history)
      } catch (error) {
        console.error('Error fetching content:', error)
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchContent()
  }, [])

  // Listen for watch history updates
  useEffect(() => {
    const handleWatchHistoryUpdate = () => {
      refreshWatchHistory()
    }

    // Listen for custom event when video player adds to history
    window.addEventListener('watchHistoryUpdated', handleWatchHistoryUpdate)
    
    // Also refresh when user returns to home page (focus event)
    window.addEventListener('focus', handleWatchHistoryUpdate)

    return () => {
      window.removeEventListener('watchHistoryUpdated', handleWatchHistoryUpdate)
      window.removeEventListener('focus', handleWatchHistoryUpdate)
    }
  }, [])

  // Auto-refresh watch history every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshWatchHistory()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        {!isVideoPlayerActive && <Sidebar />}
        <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} flex items-center justify-center min-h-screen`}>
          <LoadingSpinner variant="minimal" size="md" text="Loading content..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        {!isVideoPlayerActive && <Sidebar />}
        <div className={`${isVideoPlayerActive ? '' : 'ml-24'} flex items-center justify-center min-h-screen`}>
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Content</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Convert API data to component format
  const formatMoviesForRow = (movies: import('../services/tmdb-direct').Movie[]) => movies.map(movie => ({
    id: movie.id.toString(),
    title: movie.title,
    image: movie.posterPath || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
    year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : '2024',
    genre: 'Movie',
    mediaType: 'movie' as const,
    tmdbId: movie.id
  }));

  // Convert TV shows to component format
  const formatTVShowsForRow = (shows: TVShow[]) => shows.map(show => ({
    id: show.id.toString(),
    title: show.title,
    image: show.posterPath || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
    year: show.releaseDate ? new Date(show.releaseDate).getFullYear().toString() : '2024',
    genre: 'TV Show',
    mediaType: 'tv' as const,
    tmdbId: show.id
  }));

  // Convert watch history to component format - most recent first
  const formatWatchHistoryForRow = (history: WatchHistoryItem[]) => {
    // Sort by watched_at timestamp descending (most recent first)
    const sortedHistory = [...history].sort((a, b) => 
      new Date(b.watched_at).getTime() - new Date(a.watched_at).getTime()
    );
    
    return sortedHistory.map(item => ({
      id: item.media_id.toString(),
      title: item.title,
      image: item.poster_path || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
      year: item.release_date ? new Date(item.release_date).getFullYear().toString() : '2024',
      genre: item.media_type === 'movie' ? 'Movie' : 'TV Show',
      mediaType: item.media_type,
      seasonNumber: item.season_number || 1,
      episodeNumber: item.episode_number || 1,
      tmdbId: item.media_id
    }));
  };

  // Use real data or fallback
  // Format trending movies for display
  const formattedTrendingMovies = formatMoviesForRow(trendingMovies).length > 0 ? formatMoviesForRow(trendingMovies) : [
    {
      id: '1',
      title: 'Stranger Things',
      image: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
      year: '2024',
      genre: 'Sci-Fi'
    },
    {
      id: '2',
      title: 'The Crown',
      image: 'https://images.pexels.com/photos/7869063/pexels-photo-7869063.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
      year: '2023',
      genre: 'Drama'
    },
    {
      id: '3',
      title: 'Cyberpunk 2077',
      image: 'https://images.pexels.com/photos/3945681/pexels-photo-3945681.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
      year: '2024',
      genre: 'Action'
    },
    {
      id: '4',
      title: 'Dark Knight',
      image: 'https://images.pexels.com/photos/436413/pexels-photo-436413.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
      year: '2023',
      genre: 'Action'
    },
    {
      id: '5',
      title: 'Ocean Adventure',
      image: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
      year: '2024',
      genre: 'Adventure'
    },
    {
      id: '6',
      title: 'Space Odyssey',
      image: 'https://images.pexels.com/photos/586063/pexels-photo-586063.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
      year: '2023',
      genre: 'Sci-Fi'
    }
  ]


  // Remove unused display variables - using movies directly in MovieRow components

  return (
    <div className="bg-black min-h-screen">
      {!isVideoPlayerActive && <Sidebar />}
      <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} bg-black min-h-screen`}>
        <NetflixHero />
        
        <div className="px-4 lg:px-8 pb-20 lg:pb-8 space-y-6 lg:space-y-8">
          {/* Continue Watching Section */}
          {historyLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center animate-pulse">
                  <div className="w-4 h-4 bg-white/20 rounded"></div>
                </div>
                <div className="h-6 bg-gray-700 rounded w-48 animate-pulse"></div>
              </div>
              <div className="flex gap-4 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-48 lg:w-56 space-y-2">
                    <div className="aspect-[16/9] bg-gray-700 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : watchHistory.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  Continue Watching
                </h2>
              </div>
              <MovieRow 
                title="" 
                movies={formatWatchHistoryForRow(watchHistory)}
                hideWatchlistButton={true}
              />
            </div>
          ) : null}
          
          <MovieRow 
            title="Trending Now" 
            movies={formattedTrendingMovies}
          />
          
          <MovieRow 
            title="Popular Movies" 
            movies={formatMoviesForRow(popularMovies)}
          />
          
          {koreanMovies.length > 0 && (
            <MovieRow title="🇰🇷 Korean Movies" movies={formatMoviesForRow(koreanMovies)} />
          )}
          
          {chineseMovies.length > 0 && (
            <MovieRow title="🇨🇳 Chinese Movies" movies={formatMoviesForRow(chineseMovies)} />
          )}
          
          {asianMovies.length > 0 && (
            <MovieRow title="🌏 Asian Movies" movies={formatMoviesForRow(asianMovies)} />
          )}
          
          {trendingTVShows.length > 0 && (
            <MovieRow 
              title={
                <div className="flex items-center gap-2">
                  <img src={trendingIcon} alt="Trending" className="w-5 h-5" />
                  Trending TV Shows
                </div>
              } 
              movies={formatTVShowsForRow(trendingTVShows)} 
            />
          )}
          
          {popularTVShows.length > 0 && (
            <MovieRow title="🔥 Popular TV Shows" movies={formatTVShowsForRow(popularTVShows)} />
          )}
          
          {topRatedTVShows.length > 0 && (
            <MovieRow title="⭐ Top Rated TV Shows" movies={formatTVShowsForRow(topRatedTVShows)} />
          )}
          
          <MovieRow 
            title="Top Rated" 
            movies={formatMoviesForRow(topRatedMovies)}
          />
          
          <MovieRow 
            title="Coming Soon" 
            movies={formatMoviesForRow(upcomingMovies)}
          />
        </div>
      </div>
      
      <MobileNavbar />
    </div>
  )
}

export default Home