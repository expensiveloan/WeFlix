import React, { useState, useEffect } from 'react'
import { X, Play, Plus, Check, Star, Calendar, Clock, Users, Loader2 } from 'lucide-react'
import { movieApi } from '../services/tmdb-direct'
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
  const [watchlistLoading, setWatchlistLoading] = useState(false)
  
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const isInUserWatchlist = details ? isInWatchlist(details.id, 'movie') : false


  const handleWatchlistToggle = async () => {
    if (!details || watchlistLoading) return
    
    try {
      setWatchlistLoading(true)
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
    } finally {
      setWatchlistLoading(false)
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
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-2 lg:p-6 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900/95 via-black/95 to-gray-900/95 backdrop-blur-xl rounded-3xl max-w-6xl w-full max-h-[96vh] overflow-y-auto scroll-smooth overscroll-contain border border-gray-600/30 shadow-2xl transform animate-scaleIn">
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
            <div className="relative overflow-hidden rounded-t-lg">
              {details.backdropPath ? (
                <>
                  <img
                    src={`https://image.tmdb.org/t/p/original${details.backdropPath}`}
                    alt={details.title}
                    className="w-full h-80 lg:h-96 object-cover transform hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  {/* Enhanced gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 via-transparent to-gray-900/60" />
                  {/* Subtle vignette effect */}
                  <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40" />
                </>
              ) : (
                <div className="w-full h-80 lg:h-96 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                      <Play className="w-12 h-12" />
                    </div>
                    <p className="text-lg font-medium">{details.title}</p>
                  </div>
                </div>
              )}
              
              {/* Close button - Enhanced for mobile */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 lg:top-4 lg:right-4 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-3 lg:p-2 transition-all duration-300 hover:scale-110 group border border-white/10 z-10 touch-manipulation"
              >
                <X className="w-5 h-5 lg:w-6 lg:h-6 text-white group-hover:text-red-400 transition-colors" />
              </button>

              {/* Title and basic info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                  <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 drop-shadow-2xl leading-tight">{details.title}</h2>
                  {details.tagline && (
                    <p className="text-gray-200 text-lg italic mb-4 drop-shadow-lg">"{details.tagline}"</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-500/30">
                      <Star className="w-5 h-5 text-yellow-400 fill-current drop-shadow-sm" />
                      <span className="font-bold text-white">{details.voteAverage.toFixed(1)}</span>
                      <span className="text-sm text-gray-300">({details.voteCount.toLocaleString()})</span>
                    </div>
                    {details.releaseDate && (
                      <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-500/30">
                        <Calendar className="w-5 h-5 text-blue-400 drop-shadow-sm" />
                        <span className="font-semibold text-white">{new Date(details.releaseDate).getFullYear()}</span>
                      </div>
                    )}
                    {details.runtime && (
                      <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-500/30">
                        <Clock className="w-5 h-5 text-green-400 drop-shadow-sm" />
                        <span className="font-semibold text-white">{details.runtime}m</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content with Poster */}
            <div className="p-6 lg:p-8">
              {/* Main Content Layout with Poster */}
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-6">
                {/* Poster Section */}
                <div className="flex-shrink-0 mx-auto lg:mx-0">
                  {details.posterPath ? (
                    <div className="relative group">
                      <img
                        src={`https://image.tmdb.org/t/p/w500${details.posterPath}`}
                        alt={details.title}
                        className="w-48 h-72 lg:w-56 lg:h-84 object-cover rounded-xl shadow-2xl border-2 border-gray-700/50 group-hover:border-red-500/50 transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                  ) : (
                    <div className="w-48 h-72 lg:w-56 lg:h-84 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl flex items-center justify-center border-2 border-gray-700/50">
                      <div className="text-center text-gray-400">
                        <Play className="w-12 h-12 mx-auto mb-3" />
                        <p className="text-sm font-medium">No Poster Available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 min-w-0">
                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <button
                      onClick={() => setShowVideoPlayer(true)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 flex-1 sm:flex-initial min-w-[140px]"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Watch Now
                    </button>
                    <button
                      onClick={handleWatchlistToggle}
                      disabled={watchlistLoading}
                      className={`flex items-center justify-center px-4 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                        isInUserWatchlist 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-green-500/25' 
                          : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white hover:shadow-gray-500/25'
                      }`}
                    >
                      {watchlistLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : isInUserWatchlist ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Plus className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {/* Movie Details */}
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 mb-6">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                      Movie Details
                    </h4>
                    <div className="space-y-3 text-gray-200">
                      {details.releaseDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">Release:</span>
                          <span>{new Date(details.releaseDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {details.runtime && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span className="font-medium">Runtime:</span>
                          <span>{details.runtime} minutes</span>
                        </div>
                      )}
                      {details.budget && details.budget > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-yellow-400 text-center font-bold">$</span>
                          <span className="font-medium">Budget:</span>
                          <span>${details.budget.toLocaleString()}</span>
                        </div>
                      )}
                      {details.revenue && details.revenue > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 text-green-400 text-center font-bold">$</span>
                          <span className="font-medium">Revenue:</span>
                          <span>${details.revenue.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  Overview
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">{details.overview}</p>
              </div>


              {/* Additional Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {details.genres && details.genres.length > 0 && (
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                      Genres
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {details.genres.map((genre) => (
                        <span key={genre.id} className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium border border-gray-600/50 hover:border-gray-500/50 transition-colors">
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {details.productionCompanies && details.productionCompanies.length > 0 && (
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
                    <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                      Production
                    </h4>
                    <div className="space-y-2">
                      {details.productionCompanies.slice(0, 3).map((company) => (
                        <p key={company.id} className="text-gray-300 font-medium">{company.name}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

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
