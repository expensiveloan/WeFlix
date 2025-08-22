# WeFlix - Netflix-Style Streaming Platform

A full-stack movie streaming platform built with React, TypeScript, Express.js, and Supabase. Features real movie data from TMDB API, user authentication, search functionality, and personal watchlists.

## Features

- **User Authentication**: Secure signup/login with email confirmation via Supabase
- **Real Movie Data**: Integration with TMDB API for movies and TV shows
- **Search Functionality**: Advanced search with suggestions and real-time results
- **Personal Watchlist**: Add/remove movies and TV shows to your personal list
- **Responsive Design**: Modern Netflix-style UI with smooth animations
- **Content Categories**: Trending, Popular, Top Rated, Now Playing, and more

## Tech Stack

### Frontend
- React 18 with TypeScript
- React Router v7 for navigation
- Tailwind CSS for styling
- Supabase for authentication
- Custom hooks for API integration

### Backend
- Node.js with Express.js
- TMDB API for movie/TV data
- Supabase for user data and watchlists
- Redis-like caching with node-cache
- Security middleware (Helmet, CORS, Rate Limiting)

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- TMDB API account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd WeFlix

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

#### Frontend Environment (.env)
Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000/api
```

#### Backend Environment (server/.env)
Create a `.env` file in the `server/` directory:

```env
PORT=5000
TMDB_API_KEY=your_tmdb_api_key
TMDB_BASE_URL=https://api.themoviedb.org/3
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
FRONTEND_URL=http://localhost:5173
```

### 3. Get API Keys

#### TMDB API Key
1. Go to [TMDB](https://www.themoviedb.org/)
2. Create an account and verify your email
3. Go to Settings > API
4. Request an API key (choose "Developer" option)
5. Fill out the form and get your API key

#### Supabase Setup
1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Settings > API to get your keys:
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: Your anon/public key
   - `SUPABASE_SERVICE_KEY`: Your service role key (keep this secret!)

### 4. Database Setup

#### Supabase Database Schema
Run this SQL in your Supabase SQL editor:

```sql
-- Create watchlist table
CREATE TABLE watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    media_id INTEGER NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'tv')),
    title TEXT NOT NULL,
    poster_path TEXT,
    backdrop_path TEXT,
    overview TEXT,
    release_date TEXT,
    vote_average DECIMAL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, media_id, media_type)
);

-- Enable Row Level Security
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only access their own watchlist
CREATE POLICY "Users can only access their own watchlist" ON watchlist
    FOR ALL USING (auth.uid() = user_id);

-- Create policy for users to insert their own watchlist items
CREATE POLICY "Users can insert their own watchlist items" ON watchlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);
```

#### Enable Email Confirmation
1. Go to Authentication > Settings in Supabase
2. Enable "Confirm email" under Email Auth
3. Customize email templates if desired

### 5. Run the Application

#### Start Backend Server
```bash
cd server
npm run dev
```
The backend will run on `http://localhost:5000`

#### Start Frontend Development Server
```bash
# In the root directory
npm run dev
```
The frontend will run on `http://localhost:5173`

## Project Structure

```
WeFlix/
├── src/                          # Frontend source code
│   ├── components/              # Reusable React components
│   │   ├── HeroSection.tsx     # Netflix-style hero banner
│   │   ├── LoadingSpinner.tsx  # Loading component
│   │   ├── MovieRow.tsx        # Horizontal movie scrolling row
│   │   ├── ProtectedRoute.tsx  # Route protection wrapper
│   │   └── Sidebar.tsx         # Navigation sidebar
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── hooks/                  # Custom React hooks
│   │   ├── useMovies.ts        # Movie/TV data fetching hooks
│   │   ├── useSearch.ts        # Search functionality hook
│   │   └── useWatchlist.ts     # Watchlist management hook
│   ├── pages/                  # Page components
│   │   ├── Home.tsx           # Home page with trending content
│   │   ├── Login.tsx          # Login page
│   │   ├── Movies.tsx         # Movies catalog page
│   │   ├── MyList.tsx         # User's watchlist page
│   │   ├── Search.tsx         # Search page
│   │   ├── SignUp.tsx         # Registration page
│   │   ├── Trending.tsx       # Trending content page
│   │   └── TVShows.tsx        # TV shows catalog page
│   ├── services/              # API services
│   │   └── api.ts             # API client and type definitions
│   └── assets/                # Static assets (images, icons)
├── server/                     # Backend source code
│   ├── config/                # Configuration files
│   │   ├── supabase.js        # Supabase client setup
│   │   └── tmdb.js            # TMDB API client
│   ├── routes/                # API route handlers
│   │   ├── movies.js          # Movie-related endpoints
│   │   ├── search.js          # Search endpoints
│   │   ├── tv.js              # TV show endpoints
│   │   └── watchlist.js       # Watchlist endpoints
│   ├── server.js              # Express server setup
│   └── package.json           # Backend dependencies
├── public/                     # Public assets
└── README.md                   # This file
```

## API Endpoints

### Movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/top-rated` - Get top rated movies
- `GET /api/movies/upcoming` - Get upcoming movies
- `GET /api/movies/now-playing` - Get now playing movies
- `GET /api/movies/:id` - Get movie details

### TV Shows
- `GET /api/tv/trending` - Get trending TV shows
- `GET /api/tv/popular` - Get popular TV shows
- `GET /api/tv/top-rated` - Get top rated TV shows
- `GET /api/tv/:id` - Get TV show details

### Search
- `GET /api/search/multi?query=:query` - Multi-search (movies + TV)
- `GET /api/search/suggestions?query=:query` - Get search suggestions

### Watchlist (Protected Routes)
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add item to watchlist
- `DELETE /api/watchlist/:mediaId/:mediaType` - Remove item from watchlist
- `GET /api/watchlist/check/:mediaId/:mediaType` - Check if item is in watchlist

## Authentication Flow

1. User signs up with email, first name, and last name
2. Email confirmation is sent via Supabase
3. User confirms email and can then log in
4. JWT token is stored in localStorage
5. Protected routes require valid authentication
6. User profile data is stored in Supabase auth metadata

## Deployment

### Frontend Deployment
The frontend can be deployed to Vercel, Netlify, or any static hosting service:

```bash
npm run build
```

### Backend Deployment
The backend can be deployed to Heroku, Railway, or any Node.js hosting service. Make sure to:

1. Set all environment variables
2. Use production database URLs
3. Configure CORS for your frontend domain

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `FRONTEND_URL` in backend `.env` matches your frontend URL
2. **Authentication Issues**: Verify Supabase keys and enable email confirmation
3. **TMDB API Errors**: Check your API key and rate limits
4. **Database Errors**: Ensure RLS policies are set up correctly

### Development Tips

1. Check browser console for frontend errors
2. Check backend server logs for API errors
3. Use Supabase dashboard to monitor database and auth
4. Test API endpoints with tools like Postman

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Movie data is provided by TMDB.

---

For support or questions, please open an issue in the repository.
