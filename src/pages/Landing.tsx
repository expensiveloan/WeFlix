import React from 'react'
import { Link } from 'react-router-dom'
import { Tv, Play, Star, Shield, Download, Zap } from 'lucide-react'

const Landing: React.FC = () => {
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
        <nav className="absolute top-0 left-0 right-0 z-50 p-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-2">
              <img 
                src="/src/assets/logo.svg" 
                alt="WeFlix" 
                className="h-16 w-auto filter drop-shadow-lg"
              />
            </div>
            <Link
              to="/login"
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-3 rounded-full font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </nav>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <span className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4 animate-bounce">
              ✨ Now with 4K Ultra HD
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            Stream Without
            <span className="block bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
              Limits
            </span>
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Discover unlimited entertainment with crystal-clear quality and zero interruptions
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto mb-12">
            <Link
              to="/signup"
              className="group w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-4 rounded-full text-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-3"
            >
              <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span>Start Watching Free</span>
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              Learn More
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.8/5 Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Ad-Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <Download className="h-4 w-4 text-blue-500" />
              <span>Offline Downloads</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-b from-black via-gray-900 to-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Why Choose WeFlix?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience entertainment like never before with our cutting-edge streaming platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Tv className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Any Device</h3>
              <p className="text-gray-400 leading-relaxed">
                Stream seamlessly across all your devices with automatic sync
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Ad-Free</h3>
              <p className="text-gray-400 leading-relaxed">
                Enjoy uninterrupted viewing with zero ads and no commitments
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Download className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">Offline Mode</h3>
              <p className="text-gray-400 leading-relaxed">
                Download content and watch anywhere, even without internet
              </p>
            </div>
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white">4K Quality</h3>
              <p className="text-gray-400 leading-relaxed">
                Crystal-clear 4K Ultra HD with Dolby Atmos sound
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-red-900/20 via-black to-red-900/20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-red-600/5"></div>
        </div>
        <div className="relative max-w-5xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Join millions of viewers worldwide and discover your next favorite show
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-lg mx-auto">
            <Link
              to="/signup"
              className="group w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-700 text-white px-12 py-5 rounded-full text-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-3"
            >
              <Play className="h-6 w-6 group-hover:scale-110 transition-transform" />
              <span>Start Free Trial</span>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-8">
            No credit card required • Cancel anytime • 30-day free trial
          </p>
        </div>
      </div>
    </div>
  )
}

export default Landing