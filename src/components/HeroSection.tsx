import React from 'react'
import { Play, Info, Plus } from 'lucide-react'

const HeroSection: React.FC = () => {
  return (
    <div className="relative h-screen flex items-center justify-start">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.1) 100%), url('https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
        }}
      />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
            The Dark Knight
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
            When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, 
            Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button className="flex items-center justify-center space-x-2 bg-white text-black px-8 py-3 rounded font-semibold text-lg hover:bg-gray-200 transition-colors">
              <Play className="h-5 w-5 fill-current" />
              <span>Play</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-gray-600 bg-opacity-70 text-white px-8 py-3 rounded font-semibold text-lg hover:bg-opacity-60 transition-colors">
              <Info className="h-5 w-5" />
              <span>More Info</span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded font-semibold text-lg hover:bg-white hover:text-black transition-colors">
              <Plus className="h-5 w-5" />
              <span>My List</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection