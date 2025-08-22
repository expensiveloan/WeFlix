import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import NodeCache from 'node-cache';

// Import routes
import movieRoutes from './routes/movies.js';
import tvRoutes from './routes/tv.js';
import searchRoutes from './routes/search.js';
import watchlistRoutes from './routes/watchlist.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize cache with longer TTL for development
export const cache = new NodeCache({ 
  stdTTL: process.env.NODE_ENV === 'development' ? 3600 : 1800, // Cache for 1 hour in dev, 30 min in prod
  checkperiod: 120 // Check for expired keys every 2 minutes
});

// Rate limiting - disabled in development, enabled in production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs in production
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
  console.log('🛡️  Rate limiting enabled for production');
} else {
  console.log('🚀 Rate limiting disabled for development');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'WeFlix Backend API'
  });
});

// API Routes
app.use('/api/movies', movieRoutes);
app.use('/api/tv', tvRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/watchlist', watchlistRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 WeFlix Backend API running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🎬 TMDB API: ${process.env.TMDB_API_KEY ? 'Connected' : 'Not configured'}`);
});
