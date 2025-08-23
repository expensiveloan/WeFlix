import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tv, Play, Star, Shield, Download, Zap, X, Clock, Calendar, Users } from 'lucide-react'

// Netflix-style trending algorithm - prioritizes recent releases, high engagement, and current popularity
const allTrendingContent = [
  // Current Netflix #1 Trending (TV Show)
  {
    id: "tv-119051",
    title: "Wednesday",
    poster: "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
    rating: "8.1",
    year: "2022",
    genre: "Comedy",
    duration: "1 Season",
    description: "Follows Wednesday Addams' years as a student at Nevermore Academy, where she attempts to master her emerging psychic ability.",
    mediaType: "tv"
  },
  // Recent blockbuster releases (Movies)
  {
    id: "movie-76600",
    title: "Avatar: The Way of Water",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    rating: "7.6",
    year: "2022",
    genre: "Adventure",
    duration: "192 min",
    description: "Set more than a decade after the events of the first film, Avatar: The Way of Water tells the story of the Sully family and the trouble that follows them.",
    mediaType: "movie"
  },
  {
    id: "movie-361743",
    title: "Top Gun: Maverick",
    poster: "https://image.tmdb.org/t/p/w500/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    rating: "8.3",
    year: "2022",
    genre: "Action",
    duration: "130 min",
    description: "After thirty years, Maverick is still pushing the envelope as a top naval aviator, training a new generation of pilots for a specialized mission.",
    mediaType: "movie"
  },
  // Current Netflix trending series (TV Shows)
  {
    id: "tv-66732",
    title: "Stranger Things",
    poster: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    rating: "8.7",
    year: "2016-2022",
    genre: "Horror",
    duration: "4 Seasons",
    description: "When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.",
    mediaType: "tv"
  },
  {
    id: "tv-71912",
    title: "The Witcher",
    poster: "https://image.tmdb.org/t/p/w500/cZ0d3rtvXPVvuiX22sP79K3Hmjz.jpg",
    rating: "8.2",
    year: "2019-2023",
    genre: "Fantasy",
    duration: "3 Seasons",
    description: "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
    mediaType: "tv"
  },
  // Recent Marvel/DC hits (Movies)
  {
    id: "movie-505642",
    title: "Black Panther: Wakanda Forever",
    poster: "https://image.tmdb.org/t/p/w500/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    rating: "7.3",
    year: "2022",
    genre: "Action",
    duration: "161 min",
    description: "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers after King T'Challa's death.",
    mediaType: "movie"
  },
  {
    id: "movie-414906",
    title: "The Batman",
    poster: "https://image.tmdb.org/t/p/w500/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    rating: "7.8",
    year: "2022",
    genre: "Action",
    duration: "176 min",
    description: "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    mediaType: "movie"
  },
  // Current trending international content (TV Shows)
  {
    id: "tv-93405",
    title: "Squid Game",
    poster: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
    rating: "8.0",
    year: "2021",
    genre: "Thriller",
    duration: "1 Season",
    description: "Hundreds of cash-strapped players accept a strange invitation to compete in children's games for a tempting prize, but the stakes are deadly.",
    mediaType: "tv"
  },
  {
    id: "tv-71446",
    title: "Money Heist",
    poster: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
    rating: "8.2",
    year: "2017-2021",
    genre: "Crime",
    duration: "5 Seasons",
    description: "An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.",
    mediaType: "tv"
  },
  // Recent sci-fi and fantasy hits
  {
    id: "tv-94997",
    title: "House of the Dragon",
    poster: "https://image.tmdb.org/t/p/w500/z2yahl2uefxDCl0nogcRBstwruJ.jpg",
    rating: "8.5",
    year: "2022",
    genre: "Fantasy",
    duration: "1 Season",
    description: "The Targaryen dynasty is at the absolute apex of its power, with more than 15 dragons under their yoke. But civil war looms.",
    mediaType: "tv"
  },
  {
    id: "movie-438631",
    title: "Dune",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    rating: "8.0",
    year: "2021",
    genre: "Sci-Fi",
    duration: "155 min",
    description: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe.",
    mediaType: "movie"
  },
  // Current Disney+ trending (TV Show)
  {
    id: "tv-82856",
    title: "The Mandalorian",
    poster: "https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
    rating: "8.8",
    year: "2019-2023",
    genre: "Sci-Fi",
    duration: "3 Seasons",
    description: "The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.",
    mediaType: "tv"
  },
  // Recent horror/thriller trending (Movie)
  {
    id: "movie-646385",
    title: "Scream",
    poster: "https://image.tmdb.org/t/p/w500/1m3W6cpgwuIyjtg5nSnPx7yFkXW.jpg",
    rating: "6.3",
    year: "2022",
    genre: "Horror",
    duration: "114 min",
    description: "Twenty-five years after a streak of brutal murders shocked the quiet town of Woodsboro, a new killer has donned the Ghostface mask.",
    mediaType: "movie"
  },
  // Current drama trending (TV Show)
  {
    id: "tv-1399",
    title: "Game of Thrones",
    poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    rating: "9.2",
    year: "2011-2019",
    genre: "Fantasy",
    duration: "8 Seasons",
    description: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
    mediaType: "tv"
  },
  // Recent comedy trending (TV Show)
  {
    id: "tv-85552",
    title: "Euphoria",
    poster: "https://image.tmdb.org/t/p/w500/3Q0hd3heuWwDWpwcDkhQOA6TYWI.jpg",
    rating: "8.4",
    year: "2019-2022",
    genre: "Drama",
    duration: "2 Seasons",
    description: "A group of high school students navigate love and friendships in a world of drugs, sex, trauma and social media.",
    mediaType: "tv"
  },
  // Recent action trending (Movie)
  {
    id: "movie-603692",
    title: "John Wick: Chapter 4",
    poster: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    rating: "7.8",
    year: "2023",
    genre: "Action",
    duration: "169 min",
    description: "With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table.",
    mediaType: "movie"
  },
  // Current documentary trending (TV Show)
  {
    id: "tv-63174",
    title: "Lucifer",
    poster: "https://image.tmdb.org/t/p/w500/ekZobS8isE6mA53RAiGDG93hBxL.jpg",
    rating: "8.1",
    year: "2016-2021",
    genre: "Crime",
    duration: "6 Seasons",
    description: "Bored and unhappy as the Lord of Hell, Lucifer Morningstar abandoned his throne and retired to Los Angeles, where he has teamed up with LAPD detective Chloe Decker.",
    mediaType: "tv"
  },
  // Recent international hit (Movie)
  {
    id: "movie-634649",
    title: "Spider-Man: No Way Home",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    rating: "8.2",
    year: "2021",
    genre: "Action",
    duration: "148 min",
    description: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear.",
    mediaType: "movie"
  }
]

const Landing: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<typeof allTrendingContent[0] | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero Section */}
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.8) 0%, rgba(15,23,42,0.9) 50%, rgba(0,0,0,0.8) 100%), url('https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
        }}
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        {/* Navigation */}
        <nav className="absolute top-0 left-0 right-0 z-50 p-4 lg:p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.svg" 
                alt="WeFlix" 
                className="h-12 lg:h-16 w-auto filter drop-shadow-lg"
              />
            </div>
            <Link
              to="/login"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm text-sm lg:text-base"
            >
              Sign In
            </Link>
          </div>
        </nav>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="mb-4 lg:mb-6">
            <span className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-medium mb-4 animate-bounce">
              ✨ Now with 4K Ultra HD
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 lg:mb-8 leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Premium Streaming
            <span className="block bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Redefined
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-6 lg:mb-8 text-gray-300 max-w-4xl mx-auto leading-relaxed px-2">
            Experience cinema-quality entertainment with our curated collection of blockbuster movies and exclusive content
          </p>
          <div className="flex items-center justify-center mb-12">
            <Link
              to="/signup"
              className="group bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-3"
            >
              <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span>Start Watching Free</span>
            </Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8 text-xs sm:text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500" />
              <span>4.8/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span>Ad-Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span>Offline Downloads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 lg:py-32 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-red-900/10 rounded-3xl"></div>
          {/* Trending Now Section - Homepage Style */}
          <div className="px-4 lg:px-8 space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                  Trending Now
                </h2>
              </div>
              
              <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-4">
                {allTrendingContent.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedMovie(item)}
                    className="flex-none w-52 group cursor-pointer transform transition-all duration-500 hover:scale-110 hover:z-10"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 group-hover:border-red-500/50 transition-all duration-500">
                      {/* Movie Poster */}
                      <div className="relative overflow-hidden">
                        <img
                          src={item.poster}
                          alt={item.title}
                          className="w-full h-80 object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                          loading="lazy"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                        
                        {/* Rating Badge */}
                        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded-lg text-xs font-bold flex items-center">
                          <span className="mr-1">★</span>
                          <span>{item.rating}</span>
                        </div>
                        
                        {/* Media Type Badge */}
                        <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                          {item.duration?.includes('Season') ? 'Series' : 'Movie'}
                        </div>
                      </div>

                      {/* Enhanced Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-between">
                        {/* Action Buttons */}
                        <div className="flex justify-center items-center h-full space-x-3">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedMovie(item)
                            }}
                            className="bg-red-600/90 backdrop-blur-sm text-white p-4 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
                          >
                            <Play className="h-6 w-6 fill-current" />
                          </button>
                        </div>
                        
                        {/* Movie Info */}
                        <div className="p-4">
                          <h3 className="text-white font-bold text-base mb-2 line-clamp-2 leading-tight">{item.title}</h3>
                          <div className="flex items-center justify-between text-xs text-gray-300">
                            <div className="flex items-center space-x-2">
                              <span className="bg-white/20 px-2 py-1 rounded">{item.year}</span>
                              <span className="bg-red-600/20 px-2 py-1 rounded">{item.genre}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Info Bar (Always Visible) */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 group-hover:opacity-0 transition-opacity duration-300">
                        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <span>{item.year}</span>
                          <span>•</span>
                          <span>{item.genre}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <br/>
          <br/>
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 lg:mb-8 bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
              Why Choose WeFlix?
            </h2>
            <p className="text-lg lg:text-2xl text-gray-300 max-w-4xl mx-auto px-4 leading-relaxed">
              Experience entertainment like never before with our cutting-edge streaming platform
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            <div className="group text-center p-8 lg:p-10 rounded-3xl bg-gradient-to-b from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/60 hover:border-red-500/60 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/20">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                <Tv className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">Any Device</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Stream seamlessly across all your devices with automatic sync
              </p>
            </div>
            <div className="group text-center p-8 lg:p-10 rounded-3xl bg-gradient-to-b from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/60 hover:border-blue-500/60 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">Ad-Free</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Enjoy uninterrupted viewing with zero ads and no commitments
              </p>
            </div>
            <div className="group text-center p-8 lg:p-10 rounded-3xl bg-gradient-to-b from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/60 hover:border-green-500/60 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                <Download className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">Offline Mode</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Download content and watch anywhere, even without internet
              </p>
            </div>
            <div className="group text-center p-8 lg:p-10 rounded-3xl bg-gradient-to-b from-gray-800/60 to-gray-900/60 backdrop-blur-md border border-gray-700/60 hover:border-yellow-500/60 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-2xl">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">4K Quality</h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Crystal-clear 4K Ultra HD with Dolby Atmos sound
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-gray-900 to-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700/50">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 flex-shrink-0">
                <img
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-full h-64 md:h-96 object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none"
                />
              </div>
              <div className="flex-1 p-6 relative">
                <button
                  onClick={() => setSelectedMovie(null)}
                  className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="pt-2">
                  <h2 className="text-white text-2xl font-bold mb-4">{selectedMovie.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>{selectedMovie.rating}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{selectedMovie.year}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{selectedMovie.duration}</span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="inline-block bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 text-red-300 px-3 py-1 rounded-full text-sm">
                      {selectedMovie.genre}
                    </span>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {selectedMovie.description}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                      to="/login"
                      className="group flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <span>Sign In to Watch</span>
                    </Link>
                    <Link
                      to="/signup"
                      className="flex-1 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center space-x-2"
                    >
                      <Users className="h-5 w-5" />
                      <span>Join Free</span>
                    </Link>
                  </div>
                  <p className="text-center text-gray-400 text-sm mt-4">
                    Sign up for free to start watching instantly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-gray-700/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo2.png" 
                alt="WeFlix" 
                className="h-8 w-8 opacity-80"
              />
              <span className="text-white font-semibold text-lg">WeFlix</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-sm font-medium">
                Developed by <span className="text-white font-semibold">Phyo Min Thein</span>
              </p>
              <p className="text-gray-500 text-xs mt-1">
                © 2025 WeFlix. All rights reserved.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
            <p className="text-gray-400 text-xs">
              Experience premium streaming • Unlimited entertainment • Zero commitments
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing