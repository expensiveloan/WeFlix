import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import VideoPlayer from '../components/VideoPlayer'
import MovieDetailsModal from '../components/MovieDetailsModal'
import TVShowDetailsModal from '../components/TVShowDetailsModal'
import { useSearch } from '../hooks/useSearch'
import { useWatchlist } from '../hooks/useWatchlist'
import { useVideoPlayer } from '../contexts/VideoPlayerContext'
import { Search as SearchIcon, X, Plus, Check } from 'lucide-react'

const Search: React.FC = () => {
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showMovieDetails, setShowMovieDetails] = useState(false)
  const [selectedMovie, setSelectedMovie] = useState<{
    id: number;
    title: string;
    mediaType: 'movie' | 'tv';
    posterPath: string | null;
    overview?: string;
    releaseDate?: string;
    voteAverage: number;
  } | null>(null)
  const { 
    results, 
    suggestions, 
    loading, 
    error, 
    totalResults, 
    search, 
    getSuggestions, 
    clearSearch 
  } = useSearch()
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const { isVideoPlayerActive } = useVideoPlayer()

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput.trim().length >= 2) {
        getSuggestions(searchInput)
        setShowSuggestions(true)
      } else {
        setShowSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, getSuggestions])

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (trimmedQuery && trimmedQuery.length <= 100) {
      search(trimmedQuery)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion: { title: string }) => {
    setSearchInput(suggestion.title)
    handleSearch(suggestion.title)
  }

  const handleClearSearch = () => {
    setSearchInput('')
    clearSearch()
    setShowSuggestions(false)
  }

  const handleMovieClick = (item: {
    id: number;
    title: string;
    mediaType: 'movie' | 'tv';
    posterPath: string | null;
    overview?: string;
    releaseDate?: string;
    voteAverage: number;
  }) => {
    setSelectedMovie(item)
    setShowMovieDetails(true)
  }


  const getMovieStreamUrl = (movieId: number): string => {
    return `https://moviesapi.club/movie/${movieId}?quality=auto&sub=en`
  }

  const handleWatchlistToggle = async (item: { id: number; title: string; mediaType: 'movie' | 'tv'; posterPath: string | null; overview?: string; releaseDate?: string; voteAverage: number }, event: React.MouseEvent) => {
    event.stopPropagation()
    
    const isInList = isInWatchlist(item.id, item.mediaType)
    
    if (isInList) {
      await removeFromWatchlist(item.id, item.mediaType)
    } else {
      const watchlistItem = item.mediaType === 'movie' ? {
        id: item.id,
        title: item.title,
        originalTitle: item.title,
        posterPath: item.posterPath || '',
        backdropPath: item.posterPath || '',
        overview: item.overview || '',
        releaseDate: item.releaseDate || '',
        voteAverage: item.voteAverage || 0,
        voteCount: 0,
        popularity: 0,
        adult: false,
        genreIds: [],
        originalLanguage: 'en',
        video: false,
        mediaType: 'movie' as const
      } : {
        id: item.id,
        title: item.title,
        originalTitle: item.title,
        name: item.title,
        originalName: item.title,
        posterPath: item.posterPath || '',
        backdropPath: item.posterPath || '',
        overview: item.overview || '',
        releaseDate: item.releaseDate || '',
        firstAirDate: item.releaseDate || '',
        voteAverage: item.voteAverage || 0,
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
    <div className="bg-black min-h-screen">
      {!isVideoPlayerActive && <Sidebar />}
      <div className={`${isVideoPlayerActive ? '' : 'ml-24'} p-8`}>
        <h1 className="text-white text-4xl font-bold mb-8">Search</h1>
        
        {/* Enhanced Search Input */}
        <div className="relative max-w-4xl mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl border border-gray-700 group-focus-within:border-red-500/50 transition-all duration-300 shadow-2xl">
              <SearchIcon className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6 group-focus-within:text-red-400 transition-colors" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Limit input to 100 characters to prevent issues
                  if (value.length <= 100) {
                    setSearchInput(value);
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchInput)}
                placeholder="Search for movies, TV shows, actors, genres..."
                className="w-full pl-16 pr-16 py-6 bg-transparent text-white text-lg placeholder-gray-400 focus:outline-none rounded-2xl overflow-hidden text-ellipsis"
                maxLength={100}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={`${suggestion.id}-${suggestion.mediaType}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center p-4 hover:bg-gray-700 transition-colors text-left"
                >
                  {suggestion.posterPath ? (
                    <img
                      src={suggestion.posterPath}
                      alt={suggestion.title}
                      className="w-12 h-16 object-cover rounded mr-4"
                    />
                  ) : (
                    <div className="w-12 h-16 bg-gray-600 rounded mr-4 flex items-center justify-center">
                      <SearchIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="text-white font-medium">{suggestion.title}</div>
                    <div className="text-gray-400 text-sm capitalize">
                      {suggestion.mediaType} • {suggestion.releaseDate ? new Date(suggestion.releaseDate).getFullYear() : 'N/A'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Results */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-2">Search Error</div>
            <div className="text-gray-400 mb-4">{error}</div>
            <div className="text-gray-500 text-sm">
              {error.includes('Network error') ? (
                <>Please make sure the backend server is running on port 5000</>
              ) : (
                <>Try searching again or check your connection</>
              )}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="text-white mb-6">
              <span className="text-xl">Search Results</span>
              <span className="text-gray-400 ml-2">({totalResults} results)</span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {results.map((item) => (
                <div
                  key={`${item.id}-${item.mediaType}`}
                  className="group cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleMovieClick(item)}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    {item.posterPath ? (
                      <img
                        src={item.posterPath}
                        alt={item.title}
                        className="w-full h-80 object-cover"
                      />
                    ) : (
                      <div className="w-full h-80 bg-gray-700 flex items-center justify-center">
                        <SearchIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex flex-col justify-between">
                      <div className="p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={(e) => handleWatchlistToggle(item, e)}
                          className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300"
                        >
                          {isInWatchlist(item.id, item.mediaType) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="font-semibold text-sm mb-1">{item.title}</div>
                        <div className="text-xs text-gray-300 capitalize">
                          {item.mediaType} • ⭐ {item.voteAverage.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && results.length === 0 && searchInput && (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-xl mb-2">No results found</div>
            <div className="text-gray-500 mb-2">Try searching with different keywords</div>
            {searchInput.length > 50 && (
              <div className="text-yellow-500 text-sm">
                Long search queries may not return optimal results
              </div>
            )}
          </div>
        )}

        {!searchInput && !loading && results.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <div className="text-gray-400 text-xl mb-2">Search for movies and TV shows</div>
            <div className="text-gray-500">Enter a title, actor, or genre to get started</div>
          </div>
        )}
      </div>

      {/* Video Player */}
      {showVideoPlayer && selectedMovie && (
        <VideoPlayer
          src={getMovieStreamUrl(selectedMovie.id)}
          title={selectedMovie.title}
          onClose={() => {
            setShowVideoPlayer(false)
            setSelectedMovie(null)
          }}
          contentType={selectedMovie.mediaType}
          tmdbId={selectedMovie.id}
        />
      )}

      {/* Movie/TV Show Details Modal */}
      {showMovieDetails && selectedMovie && (
        <>
          {selectedMovie.mediaType === 'movie' ? (
            <MovieDetailsModal
              isOpen={showMovieDetails}
              movieId={selectedMovie.id}
              onClose={() => {
                setShowMovieDetails(false)
                setSelectedMovie(null)
              }}
            />
          ) : (
            <TVShowDetailsModal
              isOpen={showMovieDetails}
              showId={selectedMovie.id}
              onClose={() => {
                setShowMovieDetails(false)
                setSelectedMovie(null)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

export default Search
