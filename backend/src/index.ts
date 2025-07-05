import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/connection';
import apiRoutes from './routes/api';
import { MonitoringService } from './services/monitoring';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration for development and production
const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Development origins
    const allowedOrigins = [
      'http://localhost:3000',          // React dev server
      'http://localhost:3001',          // Backend server
      'http://localhost',               // Production frontend
      'http://127.0.0.1:3000',         // Alternative localhost
      'http://127.0.0.1:3001',         // Alternative localhost
    ];
    
    // Add production domain if specified
    if (process.env.FRONTEND_URL) {
      allowedOrigins.push(process.env.FRONTEND_URL);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log(`CORS: Allowed request from origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      console.warn(`CORS: Allowed origins are: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

async function startServer() {
  try {
    // Initialize database
    await initDatabase();
    
    // Start server first
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    
    // Start monitoring service (don't block server startup)
    const monitoringService = new MonitoringService();
    monitoringService.start().catch(error => {
      console.error('Monitoring service failed to start:', error);
      console.log('Server will continue running without monitoring');
      console.log('To fix: Install Chrome or set CHROME_PATH in .env');
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();