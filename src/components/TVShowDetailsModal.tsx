import React, { useState, useEffect } from 'react'
import { X, Play, Plus, Check, Star, Calendar, Clock, Users, Tv } from 'lucide-react'
import { tvApi } from '../services/api'
import { useWatchlist } from '../hooks/useWatchlist'
import VideoPlayer from './VideoPlayer'

interface TVShowDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  showId: number | null
}

interface TVShowDetails {
  id: number
  name: string
  title: string
  originalName?: string
  originalTitle: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  voteCount: number
  popularity: number
  genreIds: number[]
  adult: boolean
  originalLanguage: string
  mediaType: 'tv'
  firstAirDate?: string
  lastAirDate?: string
  releaseDate: string
  numberOfEpisodes?: number
  numberOfSeasons?: number
  episodeRunTime?: number[]
  status: string
  genres: { id: number; name: string }[]
  productionCompanies: { id: number; name: string; logoPath: string | null }[]
  cast: { id: number; name: string; character: string; profile_path: string | null }[]
  videos: { id: string; key: string; name: string; type: string; site: string }[]
  seasons?: Season[]
  createdBy: { id: number; name: string }[]
  networks: { id: number; name: string; logoPath: string | null }[]
}

interface Season {
  id: number
  name: string
  overview: string
  posterPath: string | null
  seasonNumber: number
  episodeCount: number
  airDate: string
}

const TVShowDetailsModal: React.FC<TVShowDetailsModalProps> = ({ isOpen, onClose, showId }) => {
  const [details, setDetails] = useState<TVShowDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const isInUserWatchlist = details ? isInWatchlist(details.id, 'tv') : false


  const handleWatchlistToggle = async () => {
    if (!details) return
    
    try {
      if (isInUserWatchlist) {
        await removeFromWatchlist(details.id, 'tv')
      } else {
        await addToWatchlist({
          id: details.id,
          title: details.name,
          originalTitle: details.originalName || details.name,
          mediaType: 'tv' as const,
          posterPath: details.posterPath || '',
          backdropPath: details.backdropPath || '',
          overview: details.overview,
          releaseDate: details.firstAirDate || '',
          voteAverage: details.voteAverage,
          voteCount: details.voteCount,
          popularity: 0,
          adult: false,
          genreIds: details.genres.map(g => g.id),
          originalLanguage: 'en'
        })
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!showId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const data = await tvApi.getDetails(showId)
        setDetails({
          ...data,
          name: data.title,
          title: data.title,
          originalTitle: data.originalTitle,
          releaseDate: data.releaseDate || '',
          status: 'Airing',
          cast: data.cast || [],
          videos: data.videos || [],
          genres: data.genres || [],
          productionCompanies: [],
          createdBy: [],
          networks: (data.networks || []).map(network => ({
            id: network.id,
            name: network.name,
            logoPath: network.logo_path || null
          })),
          seasons: (data.seasons || []).map(season => ({
            id: season.id,
            name: season.name,
            overview: season.overview,
            posterPath: season.poster_path || null,
            seasonNumber: season.season_number,
            episodeCount: season.episode_count,
            airDate: season.air_date
          }))
        })
      } catch (err) {
        setError('Failed to load TV show details')
        console.error('Error fetching TV show details:', err)
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && showId) {
      fetchData()
    }
  }, [isOpen, showId])

  const getTVShowStreamUrl = (showId: number): string => {
    // TV show streaming URL with season and episode
    return `https://vidsrc.me/embed/tv?tmdb=${showId}&season=${selectedSeason}&episode=${selectedEpisode}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border border-gray-700/50 shadow-2xl transform animate-scaleIn">
        {loading && (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-600 border-t-red-500"></div>
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-pulse"></div>
            </div>
            <p className="text-white/80 text-lg font-medium">Loading TV show details...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-96 space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-xl mb-2 text-white font-semibold">Failed to load TV show</p>
              <p className="text-gray-400">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
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
                  alt={details.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent rounded-t-lg" />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-3 transition-all duration-300 hover:scale-110 group border border-white/10"
              >
                <X className="w-6 h-6 text-white group-hover:text-red-400 transition-colors" />
              </button>

              {/* Title and basic info */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                  <h2 className="text-4xl font-black text-white mb-3 drop-shadow-lg">{details.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-gray-200">
                    <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-semibold">{details.voteAverage.toFixed(1)}</span>
                      <span className="text-sm text-gray-300">({details.voteCount.toLocaleString()})</span>
                    </div>
                    {details.firstAirDate && (
                      <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        <span className="font-medium">{new Date(details.firstAirDate).getFullYear()}</span>
                      </div>
                    )}
                    {details.numberOfSeasons && (
                      <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full">
                        <Tv className="w-5 h-5 text-purple-400" />
                        <span className="font-medium">{details.numberOfSeasons} Season{details.numberOfSeasons > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {details.episodeRunTime && details.episodeRunTime[0] && (
                      <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                        <Clock className="w-5 h-5 text-green-400" />
                        <span className="font-medium">{details.episodeRunTime[0]}m</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Action buttons */}
              <div className="flex flex-wrap gap-4 mb-8">
                <button
                  onClick={() => setShowVideoPlayer(true)}
                  className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
                >
                  <Play className="w-6 h-6 fill-current" />
                  Play Episode
                </button>
                
                <button
                  onClick={handleWatchlistToggle}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    isInUserWatchlist 
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white hover:shadow-green-500/25' 
                      : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white hover:shadow-gray-500/25'
                  }`}
                >
                  {isInUserWatchlist ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                  {isInUserWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
              </div>

              {/* Season and Episode Selection */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                  Episode Selection
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-3">Season</label>
                    <select
                      value={selectedSeason}
                      onChange={(e) => setSelectedSeason(Number(e.target.value))}
                      className="w-full bg-gray-900/80 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    >
                      {Array.from({ length: details.numberOfSeasons || 1 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Season {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-3">Episode</label>
                    <select
                      value={selectedEpisode}
                      onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                      className="w-full bg-gray-900/80 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all"
                    >
                      {/* Default to 20 episodes per season if no specific data */}
                      {Array.from({ length: 20 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          Episode {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Overview */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  Overview
                </h3>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <p className="text-gray-200 leading-relaxed text-lg">{details.overview}</p>
                </div>
              </div>

              {/* Show Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                    Show Details
                  </h4>
                  <div className="space-y-3 text-gray-200">
                    <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                      <span className="text-gray-400 font-medium">Status:</span>
                      <span className="font-semibold">{details.status}</span>
                    </div>
                    {details.firstAirDate && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400 font-medium">First Air Date:</span>
                        <span className="font-semibold">{new Date(details.firstAirDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {details.lastAirDate && (
                      <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400 font-medium">Last Air Date:</span>
                        <span className="font-semibold">{new Date(details.lastAirDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {details.numberOfEpisodes && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-400 font-medium">Total Episodes:</span>
                        <span className="font-semibold">{details.numberOfEpisodes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                    Genres
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {details.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-200 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm hover:scale-105 transition-transform"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Networks */}
              {details.networks && details.networks.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-white mb-3">Networks</h4>
                  <div className="flex flex-wrap gap-4">
                    {details.networks.map((network) => (
                      <div key={network.id} className="text-gray-300">
                        {network.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cast */}
              {details.cast && details.cast.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    Cast
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {details.cast.slice(0, 12).map((actor) => (
                      <div key={actor.id} className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-xl mb-3 transform transition-all duration-300 group-hover:scale-105">
                          {actor.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                              alt={actor.name}
                              className="w-full h-40 object-cover"
                            />
                          ) : (
                            <div className="w-full h-40 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                              <Users className="w-10 h-10 text-gray-500" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="text-center">
                          <p className="text-white text-sm font-semibold mb-1 group-hover:text-red-400 transition-colors">{actor.name}</p>
                          <p className="text-gray-400 text-xs leading-tight">{actor.character}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasons */}
              {details.seasons && details.seasons.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Seasons</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.seasons.filter(season => season.seasonNumber > 0).map((season) => (
                      <div key={season.id} className="bg-gray-800 rounded-lg p-4">
                        <div className="flex gap-4">
                          {season.posterPath && (
                            <img
                              src={`https://image.tmdb.org/t/p/w154${season.posterPath}`}
                              alt={season.name}
                              className="w-16 h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="text-white font-semibold">{season.name}</h5>
                            <p className="text-gray-400 text-sm mb-2">{season.episodeCount} episodes</p>
                            {season.airDate && (
                              <p className="text-gray-400 text-sm mb-2">
                                {new Date(season.airDate).getFullYear()}
                              </p>
                            )}
                            {season.overview && (
                              <p className="text-gray-300 text-sm line-clamp-3">{season.overview}</p>
                            )}
                          </div>
                        </div>
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
      {showVideoPlayer && details && showId && (
        <VideoPlayer
          src={getTVShowStreamUrl(showId)}
          title={`${details.name} - S${selectedSeason}E${selectedEpisode}`}
          onClose={() => setShowVideoPlayer(false)}
          contentType="tv"
          seasonNumber={selectedSeason}
          episodeNumber={selectedEpisode}
          tmdbId={showId}
        />
      )}
    </div>
  )
}

export default TVShowDetailsModal
