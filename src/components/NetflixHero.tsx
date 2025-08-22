import React, { useState, useEffect } from 'react'
import { Play, Info, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react'
import { useMovies, useTVShows } from '../hooks/useMovies'
import { useWatchlist } from '../hooks/useWatchlist'
import VideoPlayer from './VideoPlayer'
import MovieDetailsModal from './MovieDetailsModal'
import TVShowDetailsModal from './TVShowDetailsModal'

const NetflixHero: React.FC = () => {
  const { trendingMovies } = useMovies();
  const { trendingTVShows } = useTVShows();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showMovieDetails, setShowMovieDetails] = useState(false);
  
  // Combine movies and TV shows for featured content
  const allContent = [
    ...trendingMovies.slice(0, 3).map(movie => ({ ...movie, mediaType: 'movie' as const })),
    ...trendingTVShows.slice(0, 2).map(show => ({ 
      ...show, 
      mediaType: 'tv' as const,
      title: show.title // TV shows use 'title' in the API response
    }))
  ];
  const featuredMovies = allContent;
  const featuredMovie = featuredMovies[currentIndex] || null;
  
  // Check if current movie is in watchlist
  const isCurrentMovieInWatchlist = featuredMovie ? isInWatchlist(featuredMovie.id, featuredMovie.mediaType) : false;
  
  const handleWatchlistToggle = async () => {
    if (!featuredMovie) return;
    
    if (isCurrentMovieInWatchlist) {
      await removeFromWatchlist(featuredMovie.id, featuredMovie.mediaType);
    } else {
      await addToWatchlist(featuredMovie);
    }
  };
  
  const handlePlayMovie = () => {
    if (!featuredMovie) return;
    setShowVideoPlayer(true);
  };
  
  const handleShowDetails = () => {
    if (!featuredMovie) return;
    setShowMovieDetails(true);
  };
  
  // Get movie streaming URL with quality and subtitle options
  const getMovieStreamUrl = (movieId: number, quality: string = 'auto'): string => {
    // Multiple reliable streaming sources with quality and subtitle support
    const streamingSources = [
      `https://moviesapi.club/movie/${movieId}?quality=${quality}&sub=en`,
      `https://autoembed.cc/movie/tmdb/${movieId}?q=${quality}&lang=en`,
      `https://vidsrc.me/embed/movie?tmdb=${movieId}&sub=en&quality=${quality}`
    ];
    
    // Return primary streaming source
    return streamingSources[0];
  };
  
  // Auto-rotate every 8 seconds
  useEffect(() => {
    if (featuredMovies.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [featuredMovies.length]);
  
  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => 
      prev === 0 ? featuredMovies.length - 1 : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 600);
  };
  
  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    setTimeout(() => setIsTransitioning(false), 600);
  };
  return (
    <div className="relative h-screen bg-black overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0">
        {featuredMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: movie.backdropPath 
                ? `url(${movie.backdropPath})` 
                : `url('https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80')`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-start px-12 z-20">
        <div className="max-w-2xl">
          <h1 className="text-white text-6xl font-bold mb-4 leading-tight">
            {featuredMovie?.title || 'No Title'}
          </h1>
          
          {featuredMovie && (
            <p className="text-white text-xl mb-4">
              {new Date(featuredMovie.releaseDate).getFullYear()}
            </p>
          )}

          <div className="flex items-center mb-6">
            <div className="flex items-center bg-yellow-500 text-black px-3 py-1 rounded text-sm font-bold mr-4">
              <span className="mr-1">★</span>
              <span>{featuredMovie?.voteAverage.toFixed(1) || '8.8'}</span>
            </div>
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-medium uppercase">
              Trending
            </span>
          </div>

          <div className="flex gap-4 mb-8">
            <button 
              onClick={handlePlayMovie}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded flex items-center space-x-2 font-semibold transition-colors"
            >
              <Play size={20} fill="white" />
              <span>Play</span>
            </button>
            <button 
              onClick={handleShowDetails}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded flex items-center space-x-2 font-semibold transition-colors"
            >
              <Info size={20} />
              <span>More Info</span>
            </button>
            <button 
              onClick={handleWatchlistToggle}
              className={`px-6 py-3 rounded flex items-center space-x-2 font-semibold transition-colors ${
                isCurrentMovieInWatchlist 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {isCurrentMovieInWatchlist ? (
                <>
                  <Check size={20} />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Watchlist</span>
                </>
              )}
            </button>
          </div>

          <p className="text-gray-300 text-lg leading-relaxed max-w-xl">
            {featuredMovie?.overview?.length > 200 
              ? `${featuredMovie.overview.substring(0, 200)}...` 
              : featuredMovie?.overview || 'Experience premium entertainment with stunning visuals and immersive storytelling.'}
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-8 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-20 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
            aria-label="Previous movie"
            disabled={isTransitioning}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className={`absolute right-8 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 z-20 ${
              isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
            }`}
            aria-label="Next movie"
            disabled={isTransitioning}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Movie Indicators */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentIndex(index);
                  setTimeout(() => setIsTransitioning(false), 600);
                }
              }}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? 'bg-red-600' 
                  : 'bg-white/40 hover:bg-white/60'
              } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              aria-label={`Go to movie ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}
      
      {/* Video Player */}
      {showVideoPlayer && featuredMovie && (
        <VideoPlayer
          src={getMovieStreamUrl(featuredMovie.id)}
          title={featuredMovie.title}
          onClose={() => setShowVideoPlayer(false)}
          contentType={featuredMovie.mediaType}
          tmdbId={featuredMovie.id}
        />
      )}
      
      {/* Movie/TV Show Details Modal */}
      {showMovieDetails && featuredMovie && (
        <>
          {featuredMovie.mediaType === 'movie' ? (
            <MovieDetailsModal
              isOpen={showMovieDetails}
              onClose={() => setShowMovieDetails(false)}
              movieId={featuredMovie.id}
            />
          ) : (
            <TVShowDetailsModal
              isOpen={showMovieDetails}
              onClose={() => setShowMovieDetails(false)}
              showId={featuredMovie.id}
            />
          )}
        </>
      )}
    </div>
  )
}

export default NetflixHero
