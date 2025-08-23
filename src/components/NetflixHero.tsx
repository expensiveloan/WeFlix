import React, { useState, useEffect } from 'react'
import { Play, Info, ChevronLeft, ChevronRight, Plus, Check, Loader2 } from 'lucide-react'
import { useMovies, useTVShows } from '../hooks/useMovies'
import { useWatchlist } from '../hooks/useWatchlist'
import VideoPlayer from './VideoPlayer'
import MovieDetailsModal from './MovieDetailsModal'
import TVShowDetailsModal from './TVShowDetailsModal'

const NetflixHero: React.FC = () => {
  const { trendingMovies } = useMovies();
  const { trendingTVShows } = useTVShows();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, refetch } = useWatchlist();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showMovieDetails, setShowMovieDetails] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  
  // Combine movies and TV shows for featured content with rotation
  const [contentRotation, setContentRotation] = useState(0);
  
  // Rotate content selection every minute to show different trending items (pause when modal is open)
  useEffect(() => {
    if (showMovieDetails || showVideoPlayer) return;
    
    const rotationInterval = setInterval(() => {
      setContentRotation(prev => prev + 1);
    }, 60000); // 1 minute
    
    return () => clearInterval(rotationInterval);
  }, [showMovieDetails, showVideoPlayer]);
  
  const allContent = [
    ...trendingMovies.slice(contentRotation % 3, (contentRotation % 3) + 3).map(movie => ({ ...movie, mediaType: 'movie' as const })),
    ...trendingTVShows.slice(contentRotation % 2, (contentRotation % 2) + 2).map(show => ({ 
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
    if (!featuredMovie || watchlistLoading) return;
    
    setWatchlistLoading(true);
    
    try {
      if (isCurrentMovieInWatchlist) {
        await removeFromWatchlist(featuredMovie.id, featuredMovie.mediaType);
      } else {
        await addToWatchlist(featuredMovie);
      }
      // Force a refetch to ensure sync with My List page
      await refetch();
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      // Refetch on error to ensure state consistency
      try {
        await refetch();
      } catch (refetchError) {
        console.error('Error refetching watchlist:', refetchError);
      }
    } finally {
      setWatchlistLoading(false);
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
  
  // Auto-rotate every 8 seconds (pause when video player or modal is active)
  useEffect(() => {
    if (featuredMovies.length <= 1 || showVideoPlayer || showMovieDetails) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [featuredMovies.length, showVideoPlayer, showMovieDetails]);

  // Auto-refresh trending content every 5 minutes (pause when modal is open)
  useEffect(() => {
    if (showMovieDetails || showVideoPlayer) return;
    
    const refreshInterval = setInterval(() => {
      // Trigger a refresh of trending movies and TV shows
      window.location.reload();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [showMovieDetails, showVideoPlayer]);
  
  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => 
      prev === 0 ? featuredMovies.length - 1 : prev - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };
  
  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };
  // Touch/swipe handlers for mobile
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  
  const handleTouchStart = (e: React.TouchEvent) => {
    // Don't handle swipes when modals are open
    if (showMovieDetails || showVideoPlayer) return
    setTouchStartX(e.targetTouches[0].clientX)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    // Don't handle swipes when modals are open
    if (showMovieDetails || showVideoPlayer) return
    setTouchEndX(e.targetTouches[0].clientX)
  }
  
  const handleTouchEnd = () => {
    // Don't handle swipes when modals are open
    if (showMovieDetails || showVideoPlayer) return
    if (!touchStartX || !touchEndX) return
    
    const distance = touchStartX - touchEndX
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe && !isTransitioning) {
      goToNext()
    }
    if (isRightSwipe && !isTransitioning) {
      goToPrevious()
    }
    
    // Reset touch positions
    setTouchStartX(0)
    setTouchEndX(0)
  }
  
  return (
    <div 
      className="relative h-screen bg-black overflow-hidden touch-pan-y group"
      onTouchStart={showMovieDetails || showVideoPlayer ? undefined : handleTouchStart}
      onTouchMove={showMovieDetails || showVideoPlayer ? undefined : handleTouchMove}
      onTouchEnd={showMovieDetails || showVideoPlayer ? undefined : handleTouchEnd}
    >
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
            {/* Enhanced gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20 md:from-black/80 md:via-black/40 md:to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-start px-4 sm:px-6 md:px-8 lg:px-12 z-20">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl">
          {/* Title with better mobile scaling */}
          <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 lg:mb-6 leading-tight drop-shadow-2xl">
            {featuredMovie?.title || 'No Title'}
          </h1>
          
          {/* Year and media type */}
          {featuredMovie && (
            <div className="flex items-center gap-3 mb-3 sm:mb-4 lg:mb-6">
              <p className="text-white/90 text-lg sm:text-xl lg:text-2xl font-medium">
                {new Date(featuredMovie.releaseDate).getFullYear()}
              </p>
              <span className="text-white/70 text-base sm:text-lg lg:text-xl">
                • {featuredMovie.mediaType === 'movie' ? 'Movie' : 'TV Series'}
              </span>
            </div>
          )}

          {/* Rating and trending badge */}
          <div className="flex items-center gap-3 mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center bg-yellow-500 text-black px-3 py-1.5 rounded-lg text-sm sm:text-base font-bold shadow-lg">
              <span className="mr-1.5">★</span>
              <span>{featuredMovie?.voteAverage.toFixed(1) || '8.8'}</span>
            </div>
            <span className="bg-red-600 text-white text-sm sm:text-base px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wide shadow-lg">
              Trending
            </span>
          </div>

          {/* Action buttons with improved mobile layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 lg:mb-10">
            <button 
              onClick={handlePlayMovie}
              className="bg-red-600/95 backdrop-blur-md hover:bg-red-700 text-white px-8 sm:px-10 lg:px-12 py-4 lg:py-5 rounded-xl flex items-center justify-center space-x-3 font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl touch-manipulation order-1"
            >
              <Play size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" fill="white" />
              <span>Play</span>
            </button>
            <button 
              onClick={handleShowDetails}
              className="bg-gray-700/95 backdrop-blur-md hover:bg-gray-600 text-white px-8 sm:px-10 lg:px-12 py-4 lg:py-5 rounded-xl flex items-center justify-center space-x-3 font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl touch-manipulation order-3 sm:order-2"
            >
              <Info size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
              <span>More Info</span>
            </button>
            <button 
              onClick={handleWatchlistToggle}
              disabled={watchlistLoading}
              className={`px-8 sm:px-10 lg:px-12 py-4 lg:py-5 rounded-xl flex items-center justify-center space-x-3 font-bold text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl touch-manipulation backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 order-2 sm:order-3 ${
                isCurrentMovieInWatchlist 
                  ? 'bg-green-600/95 hover:bg-green-700 text-white' 
                  : 'bg-gray-800/95 hover:bg-gray-700 text-white'
              }`}
            >
              {watchlistLoading ? (
                <>
                  <Loader2 size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : isCurrentMovieInWatchlist ? (
                <>
                  <Check size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus size={20} className="sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                  <span>My List</span>
                </>
              )}
            </button>
          </div>

          {/* Overview with responsive text sizing */}
          <p className="text-gray-200 text-base sm:text-lg lg:text-xl leading-relaxed max-w-full sm:max-w-lg lg:max-w-2xl drop-shadow-lg">
            {featuredMovie?.overview?.length > (window.innerWidth < 640 ? 140 : window.innerWidth < 1024 ? 180 : 250) 
              ? `${featuredMovie.overview.substring(0, window.innerWidth < 640 ? 140 : window.innerWidth < 1024 ? 180 : 250)}...` 
              : featuredMovie?.overview || 'Experience premium entertainment with stunning visuals and immersive storytelling that will keep you on the edge of your seat.'}
          </p>
        </div>
      </div>

      {/* Navigation Arrows - Better positioning */}
      {featuredMovies.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={`absolute left-2 md:left-4 lg:left-6 xl:left-8 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/60 text-white/50 hover:text-white p-2.5 md:p-3.5 lg:p-4 rounded-full transition-all duration-300 z-30 hidden md:flex items-center justify-center hover:scale-105 border border-transparent hover:border-white/10 opacity-0 group-hover:opacity-80 ${
              isTransitioning ? 'opacity-0 cursor-not-allowed pointer-events-none' : ''
            }`}
            aria-label="Previous movie"
            disabled={isTransitioning}
          >
            <ChevronLeft size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
          </button>
          <button
            onClick={goToNext}
            className={`absolute right-2 md:right-4 lg:right-6 xl:right-8 top-1/2 transform -translate-y-1/2 bg-black/20 backdrop-blur-sm hover:bg-black/60 text-white/50 hover:text-white p-2.5 md:p-3.5 lg:p-4 rounded-full transition-all duration-300 z-30 hidden md:flex items-center justify-center hover:scale-105 border border-transparent hover:border-white/10 opacity-0 group-hover:opacity-80 ${
              isTransitioning ? 'opacity-0 cursor-not-allowed pointer-events-none' : ''
            }`}
            aria-label="Next movie"
            disabled={isTransitioning}
          >
            <ChevronRight size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6" strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Movie Indicators - Enhanced */}
      {featuredMovies.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
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
              className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full transition-all duration-300 touch-manipulation shadow-lg ${
                index === currentIndex 
                  ? 'bg-red-600 scale-125' 
                  : 'bg-white/50 hover:bg-white/80 hover:scale-110'
              } ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}
              aria-label={`Go to movie ${index + 1}`}
              disabled={isTransitioning}
            />
          ))}
        </div>
      )}
      
      {/* Mobile Swipe Hint - Enhanced */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 transform -translate-x-1/2 md:hidden z-20">
        <div className="bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <p className="text-white/80 text-sm font-medium">← Swipe to browse →</p>
        </div>
      </div>
      
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
