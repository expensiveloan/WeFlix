import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import MobileNavbar from '../components/MobileNavbar'
import LoadingSpinner from '../components/LoadingSpinner'
import MovieRow from '../components/MovieRow'
import { useMovies } from '../hooks/useMovies'
import { useVideoPlayer } from '../contexts/VideoPlayerContext'
import { movieApi, Movie } from '../services/tmdb-direct'

const Movies: React.FC = () => {
  const { 
    trendingMovies, 
    popularMovies, 
    topRatedMovies, 
    upcomingMovies, 
    nowPlayingMovies, 
    loading, 
    error 
  } = useMovies()
  
  const { isVideoPlayerActive } = useVideoPlayer()
  
  // State for Asian movie sections
  const [koreanMovies, setKoreanMovies] = useState<Movie[]>([])
  const [chineseMovies, setChineseMovies] = useState<Movie[]>([])
  const [asianMovies, setAsianMovies] = useState<Movie[]>([])
  const [asianMoviesLoading, setAsianMoviesLoading] = useState(true)

  // Fetch Asian movies
  useEffect(() => {
    const fetchAsianMovies = async () => {
      try {
        setAsianMoviesLoading(true)
        const [koreanResponse, chineseResponse, asianResponse] = await Promise.all([
          movieApi.getKoreanMovies(),
          movieApi.getChineseMovies(),
          movieApi.getAsianMovies()
        ])
        
        setKoreanMovies(koreanResponse.results)
        setChineseMovies(chineseResponse.results)
        setAsianMovies(asianResponse.results)
      } catch (error) {
        console.error('Error fetching Asian movies:', error)
      } finally {
        setAsianMoviesLoading(false)
      }
    }

    fetchAsianMovies()
  }, [])

  if (loading || asianMoviesLoading) {
    return (
      <div className="bg-black min-h-screen">
        {!isVideoPlayerActive && <Sidebar />}
        <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} flex items-center justify-center min-h-screen`}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        {!isVideoPlayerActive && <Sidebar />}
        <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} flex items-center justify-center min-h-screen`}>
          <div className="text-white text-center">
            <h2 className="text-xl lg:text-2xl font-bold mb-4">Error Loading Movies</h2>
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
    genre: 'Movie'
  }));

  const displayTrendingMovies = trendingMovies.length > 0 ? formatMoviesForRow(trendingMovies) : [];
  const displayPopularMovies = popularMovies.length > 0 ? formatMoviesForRow(popularMovies) : [];
  const displayTopRatedMovies = topRatedMovies.length > 0 ? formatMoviesForRow(topRatedMovies) : [];
  const displayUpcomingMovies = upcomingMovies.length > 0 ? formatMoviesForRow(upcomingMovies) : [];
  const displayNowPlayingMovies = nowPlayingMovies.length > 0 ? formatMoviesForRow(nowPlayingMovies) : [];

  return (
    <div className="bg-black min-h-screen">
      {!isVideoPlayerActive && <Sidebar />}
      <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} p-4 lg:p-8 pb-20 lg:pb-8`}>
        <h1 className="text-white text-2xl lg:text-4xl font-bold mb-6 lg:mb-8">Movies</h1>
        <div className="text-white/80 mb-6 lg:mb-8">
          <p className="text-sm lg:text-base">Discover amazing movies from around the world.</p>
        </div>
        
        <div className="space-y-6 lg:space-y-8">
          {displayTrendingMovies.length > 0 && (
            <MovieRow title="Trending Movies" movies={displayTrendingMovies} />
          )}
          {displayPopularMovies.length > 0 && (
            <MovieRow title="Popular Movies" movies={displayPopularMovies} />
          )}
          {koreanMovies.length > 0 && (
            <MovieRow title="🇰🇷 Korean Movies" movies={formatMoviesForRow(koreanMovies)} />
          )}
          {chineseMovies.length > 0 && (
            <MovieRow title="🇨🇳 Chinese Movies" movies={formatMoviesForRow(chineseMovies)} />
          )}
          {asianMovies.length > 0 && (
            <MovieRow title="🌏 Asian Movies" movies={formatMoviesForRow(asianMovies)} />
          )}
          {displayNowPlayingMovies.length > 0 && (
            <MovieRow title="Now Playing" movies={displayNowPlayingMovies} />
          )}
          {displayTopRatedMovies.length > 0 && (
            <MovieRow title="Top Rated Movies" movies={displayTopRatedMovies} />
          )}
          {displayUpcomingMovies.length > 0 && (
            <MovieRow title="Coming Soon" movies={displayUpcomingMovies} />
          )}
        </div>
      </div>
      
      <MobileNavbar />
    </div>
  )
}

export default Movies
