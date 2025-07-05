import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/connection';
import apiRoutes from './routes/api';
import { MonitoringService } from './services/monitoring';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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