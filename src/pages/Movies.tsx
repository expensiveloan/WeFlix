import React from 'react'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import MovieRow from '../components/MovieRow'
import { useMovies } from '../hooks/useMovies'

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

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        <Sidebar />
        <div className="ml-24 flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black min-h-screen">
        <Sidebar />
        <div className="ml-24 flex items-center justify-center min-h-screen">
          <div className="text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Movies</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Convert API data to component format
  const formatMoviesForRow = (movies: import('../services/api').Movie[]) => movies.map(movie => ({
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
      <Sidebar />
      <div className="ml-24 p-8">
        <h1 className="text-white text-4xl font-bold mb-8">Movies</h1>
        <div className="text-white/80 mb-8">
          <p>Discover amazing movies from around the world.</p>
        </div>
        
        <div className="space-y-8">
          {displayTrendingMovies.length > 0 && (
            <MovieRow title="Trending Movies" movies={displayTrendingMovies} />
          )}
          {displayPopularMovies.length > 0 && (
            <MovieRow title="Popular Movies" movies={displayPopularMovies} />
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
    </div>
  )
}

export default Movies
