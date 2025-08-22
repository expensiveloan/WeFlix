import React from 'react'
import { X, Play, Plus, Check } from 'lucide-react'
import { useWatchlist } from '../hooks/useWatchlist'

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

interface ViewAllModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  movies: Movie[]
  onPlayMovie?: (movie: Movie) => void
}

const ViewAllModal: React.FC<ViewAllModalProps> = ({ isOpen, onClose, title, movies, onPlayMovie }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()

  if (!isOpen) return null

  const handlePlayMovie = (movie: Movie, event: React.MouseEvent) => {
    event.stopPropagation()
    if (onPlayMovie) {
      onPlayMovie(movie)
    }
  }

  const handleWatchlistToggle = async (movie: Movie, event: React.MouseEvent) => {
    event.stopPropagation()
    
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 group-hover:border-red-500/50 transition-all duration-300">
                  {/* Movie Poster */}
                  <div className="relative overflow-hidden">
                    <img
                      src={movie.image}
                      alt={movie.title}
                      className="w-full h-64 object-cover transition-all duration-500 group-hover:scale-110"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Rating Badge */}
                    {movie.voteAverage && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center">
                        <span className="mr-1">★</span>
                        <span>{movie.voteAverage.toFixed(1)}</span>
                      </div>
                    )}
                    
                    {/* Media Type Badge */}
                    <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                      {movie.mediaType === 'tv' ? 'Series' : 'Movie'}
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between">
                    {/* Action Buttons */}
                    <div className="flex justify-center items-center h-full space-x-2">
                      <button 
                        onClick={(e) => handlePlayMovie(movie, e)}
                        className="bg-red-600/90 backdrop-blur-sm text-white p-3 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                      >
                        <Play className="h-4 w-4 fill-current" />
                      </button>
                      <button 
                        onClick={(e) => handleWatchlistToggle(movie, e)}
                        className={`backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 transform hover:scale-110 shadow-lg ${
                          isInWatchlist(parseInt(movie.id, 10), movie.mediaType || 'movie') 
                            ? 'bg-green-600/90 hover:bg-green-700' 
                            : 'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        {isInWatchlist(parseInt(movie.id, 10), movie.mediaType || 'movie') ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    
                    {/* Movie Info */}
                    <div className="p-3">
                      <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 leading-tight">{movie.title}</h3>
                      <div className="flex items-center space-x-1 text-xs text-gray-300">
                        {movie.year && <span className="bg-white/20 px-1 py-0.5 rounded">{movie.year}</span>}
                        {movie.genre && <span className="bg-red-600/20 px-1 py-0.5 rounded">{movie.genre}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Info Bar (Always Visible) */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 group-hover:opacity-0 transition-opacity duration-300">
                    <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{movie.title}</h3>
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
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
          </div>
          
          {movies.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">No shows found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ViewAllModal
