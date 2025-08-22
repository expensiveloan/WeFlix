import React from 'react'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import MovieRow from '../components/MovieRow'
import { useMovies, useTVShows } from '../hooks/useMovies'

const Trending: React.FC = () => {
  const { trendingMovies, loading: moviesLoading, error: moviesError } = useMovies()
  const { trendingTVShows, loading: tvLoading, error: tvError } = useTVShows()

  const loading = moviesLoading || tvLoading
  const error = moviesError || tvError

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
            <h2 className="text-2xl font-bold mb-4">Error Loading Trending Content</h2>
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

  const formatTVShowsForRow = (tvShows: import('../services/tmdb-direct').TVShow[]) => tvShows.map(show => ({
    id: show.id.toString(),
    title: show.title,
    image: show.posterPath || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
    year: show.releaseDate ? new Date(show.releaseDate).getFullYear().toString() : '2024',
    genre: 'TV Show'
  }));

  const displayTrendingMovies = trendingMovies.length > 0 ? formatMoviesForRow(trendingMovies) : [];
  const displayTrendingTVShows = trendingTVShows.length > 0 ? formatTVShowsForRow(trendingTVShows) : [];

  return (
    <div className="bg-black min-h-screen">
      <Sidebar />
      <div className="ml-24 p-8">
        <h1 className="text-white text-4xl font-bold mb-8">Trending</h1>
        <div className="text-white/80 mb-8">
          <p>What's trending now across movies and TV shows.</p>
        </div>
        
        <div className="space-y-8">
          {displayTrendingMovies.length > 0 && (
            <MovieRow title="Trending Movies" movies={displayTrendingMovies} />
          )}
          {displayTrendingTVShows.length > 0 && (
            <MovieRow title="Trending TV Shows" movies={displayTrendingTVShows} />
          )}
          
          {displayTrendingMovies.length === 0 && displayTrendingTVShows.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-2">No trending content available</div>
              <div className="text-gray-500">Check back later for the latest trending movies and shows</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Trending
