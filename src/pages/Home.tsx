import React from 'react'
import Sidebar from '../components/Sidebar'
import MobileNavbar from '../components/MobileNavbar'
import NetflixHero from '../components/NetflixHero'
import MovieRow from '../components/MovieRow'
import LoadingSpinner from '../components/LoadingSpinner'
import { useMovies } from '../hooks/useMovies'
import { useVideoPlayer } from '../contexts/VideoPlayerContext'

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

  if (loading) {
    return (
      <div className="bg-black min-h-screen">
        {!isVideoPlayerActive && <Sidebar />}
        <div className={`${isVideoPlayerActive ? '' : 'ml-24'} flex items-center justify-center min-h-screen`}>
          <LoadingSpinner />
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
  const formatMoviesForRow = (movies: import('../services/api').Movie[]) => movies.map(movie => ({
    id: movie.id.toString(),
    title: movie.title,
    image: movie.posterPath || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
    year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear().toString() : '2024',
    genre: 'Movie'
  }));

  // Use real data or fallback
  const displayTrendingMovies = trendingMovies.length > 0 ? formatMoviesForRow(trendingMovies) : [
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


  const displayPopularMovies = popularMovies.length > 0 ? formatMoviesForRow(popularMovies) : displayTrendingMovies;
  const displayTopRatedMovies = topRatedMovies.length > 0 ? formatMoviesForRow(topRatedMovies) : displayTrendingMovies;
  const displayUpcomingMovies = upcomingMovies.length > 0 ? formatMoviesForRow(upcomingMovies) : displayTrendingMovies;

  return (
    <div className="bg-black min-h-screen">
      {!isVideoPlayerActive && <Sidebar />}
      {!isVideoPlayerActive && <MobileNavbar />}
      <div className={isVideoPlayerActive ? '' : 'ml-0 lg:ml-20'}>
        <NetflixHero />
        <div className="px-4 sm:px-6 lg:px-8 pb-24 lg:pb-20 -mt-32 relative z-20">
          <MovieRow title="Trending Now" movies={displayTrendingMovies} />
          <MovieRow title="Popular Movies" movies={displayPopularMovies} />
          <MovieRow title="Top Rated" movies={displayTopRatedMovies} />
          <MovieRow title="Coming Soon" movies={displayUpcomingMovies} />
        </div>
      </div>
    </div>
  )
}

export default Home