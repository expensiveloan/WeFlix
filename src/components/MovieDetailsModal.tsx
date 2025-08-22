import React, { useState, useEffect } from 'react'
import { X, Play, Plus, Check, Star, Calendar, Clock, Users } from 'lucide-react'
import { movieApi } from '../services/api'
import { useWatchlist } from '../hooks/useWatchlist'
import VideoPlayer from './VideoPlayer'

interface MovieDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  movieId: number | null
}

interface MovieDetails {
  id: number
  title: string
  originalTitle?: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  voteCount: number
  releaseDate?: string
  runtime?: number
  budget?: number
  revenue?: number
  genres: { id: number; name: string }[]
  productionCompanies: { id: number; name: string; logoPath: string | null }[]
  cast: { id: number; name: string; character: string; profile_path: string | null }[]
  videos: { id: string; key: string; name: string; type: string; site: string }[]
  director?: string
  tagline?: string
}

const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({ isOpen, onClose, movieId }) => {
  const [details, setDetails] = useState<MovieDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const isInUserWatchlist = details ? isInWatchlist(details.id, 'movie') : false


  const handleWatchlistToggle = async () => {
    if (!details) return
    
    try {
      if (isInUserWatchlist) {
        await removeFromWatchlist(details.id, 'movie')
      } else {
        await addToWatchlist({
          id: details.id,
          title: details.title,
          originalTitle: details.originalTitle || details.title,
          mediaType: 'movie' as const,
          posterPath: details.posterPath || '',
          backdropPath: details.backdropPath || '',
          overview: details.overview,
          releaseDate: details.releaseDate || '',
          voteAverage: details.voteAverage,
          voteCount: details.voteCount,
          popularity: 0,
          adult: false,
          genreIds: details.genres.map(g => g.id),
          originalLanguage: 'en',
        })
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!movieId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const data = await movieApi.getDetails(movieId)
        setDetails({
          ...data,
          cast: data.cast || [],
          videos: data.videos || [],
          genres: data.genres || [],
          productionCompanies: (data.productionCompanies || []).map(company => ({
            id: company.id,
            name: company.name,
            logoPath: company.logo_path || null
          }))
        })
      } catch (err) {
        setError('Failed to load movie details')
        console.error('Error fetching movie details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && movieId) {
      fetchData()
    }
  }, [isOpen, movieId])

  const getMovieStreamUrl = (movieId: number): string => {
    return `https://moviesapi.club/movie/${movieId}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-96">
            <div className="text-red-500 text-center">
              <p className="text-xl mb-2">Error loading movie</p>
              <p className="text-gray-400">{error}</p>
            </div>
          </div>
        )}

        {details && (
          <>
            {/* Header with backdrop */}
            <div className="relative">
              {details.backdropPath && (
                <img
                  src={`https://image.tmdb.org/t/p/w1280${details.backdropPath}`}
                  alt={details.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent rounded-t-lg" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 transition-all duration-200"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Title and basic info */}
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-3xl font-bold text-white mb-2">{details.title}</h2>
                <div className="flex items-center gap-4 text-gray-300">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{details.voteAverage.toFixed(1)}</span>
                  </div>
                  {details.releaseDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(details.releaseDate).getFullYear()}</span>
                    </div>
                  )}
                  {details.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{details.runtime}m</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Action buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setShowVideoPlayer(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  <Play className="w-5 h-5" />
                  Play Movie
                </button>
                
                <button
                  onClick={handleWatchlistToggle}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  {isInUserWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {isInUserWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              {/* Overview */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                <p className="text-gray-300 leading-relaxed">{details.overview}</p>
              </div>

              {/* Movie Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Movie Details</h4>
                  <div className="space-y-2 text-gray-300">
                    {details.releaseDate && (
                      <p><span className="text-gray-400">Release Date:</span> {new Date(details.releaseDate).toLocaleDateString()}</p>
                    )}
                    {details.runtime && (
                      <p><span className="text-gray-400">Runtime:</span> {details.runtime} minutes</p>
                    )}
                    {details.budget && details.budget > 0 && (
                      <p><span className="text-gray-400">Budget:</span> ${details.budget.toLocaleString()}</p>
                    )}
                    {details.revenue && details.revenue > 0 && (
                      <p><span className="text-gray-400">Revenue:</span> ${details.revenue.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Production Companies */}
              {details.productionCompanies && details.productionCompanies.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Production Companies</h4>
                  <div className="flex flex-wrap gap-4">
                    {details.productionCompanies.map((company) => (
                      <div key={company.id} className="text-gray-300">
                        {company.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast */}
              {details.cast && details.cast.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Cast</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {details.cast.slice(0, 8).map((actor) => (
                      <div key={actor.id} className="text-center">
                        {actor.profile_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                            alt={actor.name}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                        ) : (
                          <div className="w-full h-32 bg-gray-700 rounded-lg mb-2 flex items-center justify-center">
                            <Users className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                        <p className="text-white text-sm font-medium">{actor.name}</p>
                        <p className="text-gray-400 text-xs">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Video Player */}
      {showVideoPlayer && details && movieId && (
        <VideoPlayer
          src={getMovieStreamUrl(movieId)}
          title={details.title}
          onClose={() => setShowVideoPlayer(false)}
          contentType="movie"
          tmdbId={movieId}
        />
      )}
    </div>
  )
}

export default MovieDetailsModal
