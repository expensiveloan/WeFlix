import React, { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Plus, Check } from 'lucide-react'
import { useWatchlist } from '../hooks/useWatchlist'
import MovieDetailsModal from './MovieDetailsModal'
import TVShowDetailsModal from './TVShowDetailsModal'

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

interface MovieRowProps {
  title: string
  movies: Movie[]
  showViewAll?: boolean
  onViewAll?: () => void
}

const MovieRow: React.FC<MovieRowProps> = ({ title, movies, showViewAll = false, onViewAll }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const [selectedMovie, setSelectedMovie] = useState<{ id: number; mediaType: 'movie' | 'tv' } | null>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const containerWidth = scrollRef.current.clientWidth
      const scrollAmount = containerWidth * 0.8 // Scroll 80% of visible width
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  const handleWatchlistToggle = async (movie: Movie, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent triggering parent click events
    
    const mediaType = movie.mediaType || 'movie'
    const movieId = parseInt(movie.id, 10)
    const isInList = isInWatchlist(movieId, mediaType)
    
    if (isInList) {
      await removeFromWatchlist(movieId, mediaType)
    } else {
      const watchlistItem = mediaType === 'movie' ? {
        id: movieId,
        title: movie.title,
        originalTitle: movie.title,
        posterPath: movie.image,
        backdropPath: movie.image,
        overview: movie.overview || '',
        releaseDate: movie.releaseDate || '',
        voteAverage: movie.voteAverage || 0,
        voteCount: 0,
        popularity: 0,
        adult: false,
        genreIds: [],
        originalLanguage: 'en',
        video: false,
        mediaType: 'movie' as const
      } : {
        id: movieId,
        title: movie.title,
        originalTitle: movie.title,
        name: movie.title,
        originalName: movie.title,
        posterPath: movie.image,
        backdropPath: movie.image,
        overview: movie.overview || '',
        releaseDate: movie.releaseDate || '',
        firstAirDate: movie.firstAirDate || '',
        voteAverage: movie.voteAverage || 0,
        voteCount: 0,
        popularity: 0,
        adult: false,
        genreIds: [],
        originalLanguage: 'en',
        video: false,
        originCountry: [],
        mediaType: 'tv' as const
      }
      await addToWatchlist(watchlistItem)
    }
  }

  return (
    <div className="mb-12">
      <h2 className="text-white text-2xl font-bold mb-6 px-4 sm:px-6 lg:px-8">{title}</h2>
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/90 hover:scale-110 shadow-lg"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div
          ref={scrollRef}
          className="flex space-x-3 overflow-x-hidden px-4 sm:px-6 lg:px-8 pb-4 scroll-smooth"
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-none w-52 group cursor-pointer transform transition-all duration-500 hover:scale-110 hover:z-10"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 group-hover:border-red-500/50 transition-all duration-500">
                {/* Movie Poster */}
                <div className="relative overflow-hidden">
                  <img
                    src={movie.image}
                    alt={movie.title}
                    className="w-full h-80 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                  
                  {/* Rating Badge */}
                  {movie.voteAverage && (
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center">
                      <span className="mr-1">★</span>
                      <span>{movie.voteAverage.toFixed(1)}</span>
                    </div>
                  )}
                  
                  {/* Media Type Badge */}
                  <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                    {movie.mediaType === 'tv' ? 'Series' : 'Movie'}
                  </div>
                </div>

                {/* Enhanced Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between">
                  {/* Action Buttons */}
                  <div className="flex justify-center items-center h-full space-x-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMovie({ id: parseInt(movie.id, 10), mediaType: movie.mediaType || 'movie' })
                      }}
                      className="bg-red-600/90 backdrop-blur-sm text-white p-4 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                    >
                      <Play className="h-6 w-6 fill-current" />
                    </button>
                    <button 
                      onClick={(e) => handleWatchlistToggle(movie, e)}
                      className={`backdrop-blur-sm text-white p-4 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                        isInWatchlist(parseInt(movie.id, 10), movie.mediaType || 'movie') 
                          ? 'bg-green-600/90 hover:bg-green-700' 
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {isInWatchlist(parseInt(movie.id, 10), movie.mediaType || 'movie') ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <Plus className="h-6 w-6" />
                      )}
                    </button>
                  </div>
                  
                  {/* Movie Info */}
                  <div className="p-4">
                    <h3 className="text-white font-bold text-base mb-2 line-clamp-2 leading-tight">{movie.title}</h3>
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <div className="flex items-center space-x-2">
                        {movie.year && <span className="bg-white/20 px-2 py-1 rounded">{movie.year}</span>}
                        {movie.genre && <span className="bg-red-600/20 px-2 py-1 rounded">{movie.genre}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Info Bar (Always Visible) */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 group-hover:opacity-0 transition-opacity duration-300">
                  <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{movie.title}</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    {movie.year && <span>{movie.year}</span>}
                    {movie.genre && (
                      <>
                        <span>•</span>
                        <span>{movie.genre}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* View All Card */}
          {showViewAll && onViewAll && (
            <div
              className="flex-none w-52 group cursor-pointer transform transition-all duration-500 hover:scale-110 hover:z-10"
              onClick={onViewAll}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-red-900/20 to-red-600/20 border-2 border-red-500/50 group-hover:border-red-400 transition-all duration-500 h-80 flex flex-col items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-red-600/30 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-red-600/50 transition-all duration-300">
                    <ChevronRight className="h-8 w-8 text-red-400 group-hover:text-red-300" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">View All</h3>
                  <p className="text-gray-300 text-sm">See complete collection</p>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 via-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/90 hover:scale-110 shadow-lg"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Movie Details Modal */}
      {selectedMovie?.mediaType === 'tv' ? (
        <TVShowDetailsModal
          isOpen={selectedMovie !== null}
          onClose={() => setSelectedMovie(null)}
          showId={selectedMovie?.id || null}
        />
      ) : (
        <MovieDetailsModal
          isOpen={selectedMovie !== null}
          onClose={() => setSelectedMovie(null)}
          movieId={selectedMovie?.id || null}
        />
      )}
    </div>
  )
}

export default MovieRow