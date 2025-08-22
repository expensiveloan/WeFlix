import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import MovieRow from '../components/MovieRow'
import ViewAllModal from '../components/ViewAllModal'
import VideoPlayer from '../components/VideoPlayer'
import { useTVShows } from '../hooks/useMovies'

const TVShows: React.FC = () => {
  const { 
    trendingTVShows, 
    popularTVShows, 
    topRatedTVShows,
    koreanShows,
    chineseShows,
    asianShows,
    loading, 
    error 
  } = useTVShows()

  interface Movie {
    id: string
    title: string
    image: string
    year?: string
    genre?: string
    mediaType?: 'movie' | 'tv'
    voteAverage?: number
    overview?: string
    releaseDate?: string
    firstAirDate?: string
  }

  const [viewAllModal, setViewAllModal] = useState<{ isOpen: boolean; title: string; movies: Movie[] }>({
    isOpen: false,
    title: '',
    movies: []
  })

  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)

  const handleViewAll = (title: string, movies: Movie[]) => {
    setViewAllModal({
      isOpen: true,
      title,
      movies
    })
  }

  const closeViewAllModal = () => {
    setViewAllModal({
      isOpen: false,
      title: '',
      movies: []
    })
  }

  const handlePlayMovie = (movie: Movie) => {
    setSelectedMovie(movie)
    setShowVideoPlayer(true)
    closeViewAllModal()
  }

  const getTVShowStreamUrl = (showId: string): string => {
    return `https://vidsrc.me/embed/tv?tmdb=${showId}&season=1&episode=1`
  }

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
            <h2 className="text-2xl font-bold mb-4">Error Loading TV Shows</h2>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Convert API data to component format
  const formatTVShowsForRow = (tvShows: import('../services/api').TVShow[]) => tvShows.map(show => ({
    id: show.id.toString(),
    title: show.title,
    image: show.posterPath || 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=400&h=225&fit=crop',
    year: show.releaseDate ? new Date(show.releaseDate).getFullYear().toString() : '2024',
    genre: 'TV Show',
    mediaType: 'tv' as const
  }));

  const displayTrendingTVShows = trendingTVShows.length > 0 ? formatTVShowsForRow(trendingTVShows) : [];
  const displayPopularTVShows = popularTVShows.length > 0 ? formatTVShowsForRow(popularTVShows) : [];
  const displayTopRatedTVShows = topRatedTVShows.length > 0 ? formatTVShowsForRow(topRatedTVShows) : [];
  const displayKoreanShows = koreanShows.length > 0 ? formatTVShowsForRow(koreanShows) : [];
  const displayChineseShows = chineseShows.length > 0 ? formatTVShowsForRow(chineseShows) : [];
  const displayAsianShows = asianShows.length > 0 ? formatTVShowsForRow(asianShows) : [];

  return (
    <div className="bg-black min-h-screen">
      <Sidebar />
      <div className="ml-24 p-8">
        <h1 className="text-white text-4xl font-bold mb-8">TV Shows</h1>
        <div className="text-white/80 mb-8">
          <p>Explore the best TV series and shows.</p>
        </div>
        
        <div className="space-y-8">
          {displayTrendingTVShows.length > 0 && (
            <MovieRow title="Trending TV Shows" movies={displayTrendingTVShows} />
          )}
          {displayPopularTVShows.length > 0 && (
            <MovieRow title="Popular TV Shows" movies={displayPopularTVShows} />
          )}
          {displayTopRatedTVShows.length > 0 && (
            <MovieRow title="Top Rated TV Shows" movies={displayTopRatedTVShows} />
          )}
          {displayKoreanShows.length > 0 && (
            <MovieRow 
              title="🇰🇷 Korean Dramas & Shows" 
              movies={displayKoreanShows} 
              showViewAll={true}
              onViewAll={() => handleViewAll("🇰🇷 Korean Dramas & Shows", displayKoreanShows)}
            />
          )}
          {displayChineseShows.length > 0 && (
            <MovieRow 
              title="🇨🇳 Chinese Dramas & Shows" 
              movies={displayChineseShows}
              showViewAll={true}
              onViewAll={() => handleViewAll("🇨🇳 Chinese Dramas & Shows", displayChineseShows)}
            />
          )}
          {displayAsianShows.length > 0 && (
            <MovieRow title="🌏 Asian Collection" movies={displayAsianShows} />
          )}
        </div>
      </div>

      {/* View All Modal */}
      <ViewAllModal
        isOpen={viewAllModal.isOpen}
        onClose={closeViewAllModal}
        title={viewAllModal.title}
        movies={viewAllModal.movies}
        onPlayMovie={handlePlayMovie}
      />

      {/* Video Player */}
      {showVideoPlayer && selectedMovie && (
        <VideoPlayer
          src={getTVShowStreamUrl(selectedMovie.id)}
          title={selectedMovie.title}
          onClose={() => setShowVideoPlayer(false)}
          contentType="tv"
          seasonNumber={1}
          episodeNumber={1}
        />
      )}
    </div>
  )
}

export default TVShows
