import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import MobileNavbar from '../components/MobileNavbar'
import LoadingSpinner from '../components/LoadingSpinner'
import VideoPlayer from '../components/VideoPlayer'
import MovieDetailsModal from '../components/MovieDetailsModal'
import TVShowDetailsModal from '../components/TVShowDetailsModal'
import { useSearch } from '../hooks/useSearch'
import { useWatchlist } from '../hooks/useWatchlist'
import { useVideoPlayer } from '../contexts/VideoPlayerContext'
import { watchlistApi, Movie, TVShow } from '../services/tmdb-direct'
import { Search as SearchIcon, X, Plus, Check } from 'lucide-react'

const Search: React.FC = () => {
  const [searchInput, setSearchInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showVideoPlayer, setShowVideoPlayer] = useState(false)
  const [showMovieDetails, setShowMovieDetails] = useState(false)
  const [watchHistorySuggestions, setWatchHistorySuggestions] = useState<(Movie | TVShow)[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
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
    clearSearch,
    currentPage,
    totalPages
  } = useSearch()
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
  const { isVideoPlayerActive } = useVideoPlayer()

  // Load watch history suggestions on component mount
  useEffect(() => {
    const loadWatchHistorySuggestions = async () => {
      try {
        setLoadingSuggestions(true)
        const response = await watchlistApi.getWatchHistorySuggestions()
        setWatchHistorySuggestions(response.suggestions)
      } catch (error) {
        console.error('Failed to load watch history suggestions:', error)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    loadWatchHistorySuggestions()
  }, [])

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
      <div className={`${isVideoPlayerActive ? '' : 'lg:ml-24'} p-2 sm:p-4 lg:p-8 pb-24 lg:pb-8`}>
        <h1 className="text-white text-xl sm:text-2xl lg:text-4xl font-bold mb-4 sm:mb-6 lg:mb-8">Search</h1>
        
        {/* Enhanced Search Input */}
        <div className="relative max-w-4xl mb-6 sm:mb-8 lg:mb-12">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-xl lg:rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl lg:rounded-2xl border border-gray-700 group-focus-within:border-red-500/50 transition-all duration-300 shadow-2xl">
              <SearchIcon className="absolute left-4 lg:left-6 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 lg:h-6 lg:w-6 group-focus-within:text-red-400 transition-colors" />
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
                placeholder="Search movies, TV shows..."
                className="w-full pl-10 sm:pl-12 lg:pl-16 pr-10 sm:pr-12 lg:pr-16 py-3 sm:py-4 lg:py-6 bg-transparent text-white text-sm sm:text-base lg:text-lg placeholder-gray-400 focus:outline-none rounded-xl lg:rounded-2xl overflow-hidden text-ellipsis"
                maxLength={100}
              />
              {searchInput && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 lg:right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <X className="h-5 w-5 lg:h-6 lg:w-6" />
                </button>
              )}
            </div>
          </div>

          {/* Enhanced Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-hidden">
              {/* Suggestions Header */}
              <div className="px-4 py-3 border-b border-gray-700/50 bg-gradient-to-r from-gray-700/30 to-gray-800/30">
                <div className="flex items-center space-x-2">
                  <SearchIcon className="h-4 w-4 text-red-400" />
                  <span className="text-sm font-semibold text-gray-300">Suggestions</span>
                </div>
              </div>
              
              {/* Suggestions List */}
              <div className="max-h-80 overflow-y-auto scrollbar-hide">
                {suggestions.map((suggestion) => (
                  <button
                    key={`${suggestion.id}-${suggestion.mediaType}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center p-4 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-red-600/10 transition-all duration-300 text-left group border-b border-gray-700/30 last:border-b-0"
                  >
                    {/* Poster Image */}
                    <div className="relative flex-shrink-0 mr-4">
                      {suggestion.posterPath ? (
                        <img
                          src={suggestion.posterPath}
                          alt={suggestion.title}
                          className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:shadow-red-500/20 transition-shadow duration-300"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center shadow-lg">
                          <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Media Type Badge */}
                      <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white shadow-lg ${
                        suggestion.mediaType === 'movie' 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-r from-purple-500 to-purple-600'
                      }`}>
                        {suggestion.mediaType === 'movie' ? 'M' : 'TV'}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-base group-hover:text-red-300 transition-colors duration-300 truncate">
                        {suggestion.title}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-gray-400 text-sm capitalize font-medium">
                          {suggestion.mediaType === 'movie' ? 'Movie' : 'TV Show'}
                        </span>
                        <span className="text-gray-500 text-xs">•</span>
                        <span className="text-gray-400 text-sm">
                          {suggestion.releaseDate ? new Date(suggestion.releaseDate).getFullYear() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Arrow Icon */}
                    <div className="flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                        <SearchIcon className="h-3 w-3 text-red-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Footer */}
              <div className="px-4 py-2 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-t border-gray-700/30">
                <div className="text-xs text-gray-500 text-center">
                  Press Enter to search • Click to select
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {loading && (
          <LoadingSpinner text="Searching..." />
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
            <div className="flex items-center justify-between mb-6">
              <div className="text-white">
                <span className="text-xl lg:text-2xl font-bold">
                  {(() => {
                    const query = searchInput.toLowerCase();
                    
                    // Genre searches
                    if (query.includes('action')) return '🎬 Action Movies';
                    if (query.includes('comedy')) return '😂 Comedy Movies';
                    if (query.includes('drama')) return '🎭 Drama Movies';
                    if (query.includes('horror')) return '👻 Horror Movies';
                    if (query.includes('romance')) return '💕 Romance Movies';
                    if (query.includes('thriller')) return '😱 Thriller Movies';
                    if (query.includes('sci-fi') || query.includes('science fiction')) return '🚀 Sci-Fi Movies';
                    if (query.includes('fantasy')) return '🧙 Fantasy Movies';
                    if (query.includes('animation')) return '🎨 Animation Movies';
                    if (query.includes('documentary')) return '📺 Documentary Movies';
                    if (query.includes('crime')) return '🔍 Crime Movies';
                    if (query.includes('mystery')) return '🕵️ Mystery Movies';
                    if (query.includes('adventure')) return '🗺️ Adventure Movies';
                    if (query.includes('family')) return '👨‍👩‍👧‍👦 Family Movies';
                    if (query.includes('western')) return '🤠 Western Movies';
                    if (query.includes('war')) return '⚔️ War Movies';
                    if (query.includes('music')) return '🎵 Music Movies';
                    if (query.includes('history')) return '📚 History Movies';
                    
                    // Combined country + genre searches (most specific)
                    const countries = ['korean', 'chinese', 'japanese', 'thai', 'turkish', 'indian'];
                    const genres = ['action', 'comedy', 'horror', 'romance', 'thriller', 'sci-fi', 'fantasy', 'animation', 'documentary', 'crime', 'mystery', 'adventure', 'family', 'western', 'war', 'music', 'history', 'reality'];
                    
                    for (const country of countries) {
                      if (query.includes(country)) {
                        for (const genre of genres) {
                          if (query.includes(genre)) {
                            const countryFlag = country === 'korean' ? '🇰🇷' : country === 'chinese' ? '🇨🇳' : country === 'japanese' ? '🇯🇵' : country === 'thai' ? '🇹🇭' : country === 'turkish' ? '🇹🇷' : '🇮🇳';
                            const genreEmoji = genre === 'action' ? '💥' : genre === 'comedy' ? '😂' : genre === 'horror' ? '😱' : genre === 'romance' ? '💕' : genre === 'thriller' ? '😰' : genre === 'sci-fi' ? '🚀' : genre === 'fantasy' ? '🧙‍♂️' : genre === 'animation' ? '🎬' : genre === 'documentary' ? '📹' : genre === 'crime' ? '🔍' : genre === 'mystery' ? '🕵️' : genre === 'adventure' ? '🗺️' : genre === 'family' ? '👨‍👩‍👧‍👦' : genre === 'western' ? '🤠' : genre === 'war' ? '⚔️' : genre === 'music' ? '🎵' : genre === 'history' ? '📚' : '📺';
                            return `${countryFlag} ${country.charAt(0).toUpperCase() + country.slice(1)} ${genreEmoji} ${genre.charAt(0).toUpperCase() + genre.slice(1)}`;
                          }
                        }
                      }
                    }
                    
                    // Country/category searches
                    if (query.includes('kdrama') || query.includes('korean drama') || query.includes('k-drama')) 
                      return '🇰🇷 Korean Dramas';
                    if (query.includes('cdrama') || query.includes('chinese drama') || query.includes('c-drama')) 
                      return '🇨🇳 Chinese Dramas';
                    if (query.includes('anime')) 
                      return '🇯🇵 Anime Series';
                    if (query.includes('bollywood') || query.includes('indian movie')) 
                      return '🇮🇳 Bollywood Movies';
                    if (query.includes('thai drama') || query.includes('thai tv')) 
                      return '🇹🇭 Thai Dramas';
                    if (query.includes('turkish drama') || query.includes('turkish tv')) 
                      return '🇹🇷 Turkish Dramas';
                    
                    return 'Search Results';
                  })()}
                </span>
                <span className="text-gray-400 ml-2 text-sm lg:text-base">
                  ({totalResults} results • sorted by popularity)
                  {(() => {
                    const query = searchInput.toLowerCase();
                    const isGenreSearch = ['action', 'comedy', 'drama', 'horror', 'romance', 'thriller', 'sci-fi', 'science fiction', 'fantasy', 'animation', 'documentary', 'crime', 'mystery', 'adventure', 'family', 'western', 'war', 'music', 'history'].some(genre => query.includes(genre));
                    // Check for combined country + genre searches
                    const countries = ['korean', 'chinese', 'japanese', 'thai', 'turkish', 'indian'];
                    const genres = ['action', 'comedy', 'horror', 'romance', 'thriller', 'sci-fi', 'fantasy', 'animation', 'documentary', 'crime', 'mystery', 'adventure', 'family', 'western', 'war', 'music', 'history', 'reality'];
                    const isCountryGenreSearch = countries.some(country => query.includes(country)) && genres.some(genre => query.includes(genre) && genre !== 'drama');
                    
                    const isCategorySearch = query.includes('kdrama') || query.includes('korean drama') || query.includes('k-drama') || query.includes('cdrama') || query.includes('chinese drama') || query.includes('c-drama') || query.includes('anime') || query.includes('bollywood') || query.includes('thai drama') || query.includes('turkish drama');
                    
                    if (isCountryGenreSearch) {
                      return <span className="block sm:inline sm:ml-2 text-xs text-green-400">Country + Genre search detected</span>;
                    } else if (isGenreSearch) {
                      return <span className="block sm:inline sm:ml-2 text-xs text-purple-400">Genre search detected</span>;
                    } else if (isCategorySearch) {
                      return <span className="block sm:inline sm:ml-2 text-xs text-blue-400">Category search detected</span>;
                    }
                    return null;
                  })()}
                </span>
              </div>
              
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-2 sm:gap-3 lg:gap-4">
              {results.map((item) => (
                <div
                  key={`${item.id}-${item.mediaType}`}
                  className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                  onClick={() => handleMovieClick(item)}
                >
                  <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl group-hover:shadow-red-500/20 transition-all duration-300">
                    {item.posterPath ? (
                      <img
                        src={item.posterPath}
                        alt={item.title}
                        className="w-full h-48 sm:h-64 md:h-72 lg:h-80 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-48 sm:h-64 md:h-72 lg:h-80 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                        <SearchIcon className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Enhanced Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between">
                      {/* Top Actions */}
                      <div className="p-2 sm:p-3 flex justify-between items-start">
                        <div className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                          item.mediaType === 'movie' 
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-r from-purple-500 to-purple-600'
                        }`}>
                          {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                        </div>
                        
                        <button 
                          onClick={(e) => handleWatchlistToggle(item, e)}
                          className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600/80 transition-all duration-300 transform hover:scale-110"
                        >
                          {isInWatchlist(item.id, item.mediaType) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      {/* Bottom Info */}
                      <div className="p-2 sm:p-3 text-white">
                        <div className="font-bold text-xs sm:text-sm mb-1 line-clamp-2 leading-tight">{item.title}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-yellow-400 font-medium">
                            ⭐ {item.voteAverage ? item.voteAverage.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-gray-300">
                            {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Controls */}
            <div className="flex flex-col items-center mt-8 space-y-4">
              <div className="text-gray-500 text-sm">
                Showing {results.length} of {totalResults} results • Page {currentPage} of {totalPages}
                {totalPages === 500 && <span className="text-yellow-400 ml-2">(Limited to 500 pages)</span>}
              </div>
              
              {/* Pagination Buttons */}
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => search(searchInput, 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                  >
                    First
                  </button>
                  
                  <button
                    onClick={() => search(searchInput, currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => search(searchInput, pageNum)}
                          disabled={loading}
                          className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                            pageNum === currentPage
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => search(searchInput, currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                  >
                    Next
                  </button>
                  
                  <button
                    onClick={() => search(searchInput, totalPages)}
                    disabled={currentPage >= totalPages || loading || totalPages <= 1}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                  >
                    Last
                  </button>
                </div>
              )}
              
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
          <div className="space-y-8">
            {/* Watch History Suggestions */}
            {watchHistorySuggestions.length > 0 && (
              <div>
                <h2 className="text-white text-xl lg:text-2xl font-bold mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  Suggested for You
                  <span className="text-gray-400 text-sm font-normal ml-2">
                    Based on your watchlist
                  </span>
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 lg:gap-4">
                  {watchHistorySuggestions.map((item) => (
                    <div
                      key={`${item.id}-${item.mediaType}`}
                      className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                      onClick={() => handleMovieClick({
                        id: item.id,
                        title: item.title,
                        mediaType: item.mediaType,
                        posterPath: item.posterPath,
                        overview: item.overview,
                        releaseDate: item.releaseDate,
                        voteAverage: item.voteAverage
                      })}
                    >
                      <div className="relative overflow-hidden rounded-xl shadow-lg group-hover:shadow-2xl group-hover:shadow-red-500/20 transition-all duration-300">
                        {item.posterPath ? (
                          <img
                            src={item.posterPath}
                            alt={item.title}
                            className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                            <SearchIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        
                        {/* Enhanced Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between">
                          {/* Top Actions */}
                          <div className="p-2 flex justify-between items-start">
                            <div className={`px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                              item.mediaType === 'movie' 
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                                : 'bg-gradient-to-r from-purple-500 to-purple-600'
                            }`}>
                              {item.mediaType === 'movie' ? 'Movie' : 'TV'}
                            </div>
                            
                            <button 
                              onClick={(e) => handleWatchlistToggle({
                                id: item.id,
                                title: item.title,
                                mediaType: item.mediaType,
                                posterPath: item.posterPath,
                                overview: item.overview,
                                releaseDate: item.releaseDate,
                                voteAverage: item.voteAverage
                              }, e)}
                              className="bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-red-600/80 transition-all duration-300 transform hover:scale-110"
                            >
                              {isInWatchlist(item.id, item.mediaType) ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          
                          {/* Bottom Info */}
                          <div className="p-2 text-white">
                            <div className="font-bold text-xs mb-1 line-clamp-2 leading-tight">{item.title}</div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-yellow-400 font-medium">
                                ⭐ {item.voteAverage ? item.voteAverage.toFixed(1) : 'N/A'}
                              </span>
                              <span className="text-gray-300">
                                {item.releaseDate ? new Date(item.releaseDate).getFullYear() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Loading Suggestions State */}
            {loadingSuggestions && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                  <h2 className="text-white text-xl lg:text-2xl font-bold">
                    Suggested for You
                  </h2>
                  <span className="text-gray-400 text-sm font-normal">
                    Based on your watchlist
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 lg:gap-4">
                  {Array.from({ length: 20 }, (_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl h-48 sm:h-56 lg:h-64 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Default Search State - Only show if no suggestions and not loading */}
            {!loadingSuggestions && watchHistorySuggestions.length === 0 && (
              <div className="text-center py-12">
                <SearchIcon className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <div className="text-gray-400 text-xl mb-2">Search for movies and TV shows</div>
                <div className="text-gray-500">Enter a title, actor, or genre to get started</div>
              </div>
            )}
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
      
      <MobileNavbar />
    </div>
  )
}

export default Search
