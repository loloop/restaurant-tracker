# Restaurant Status Tracker

A web application that monitors restaurant availability and displays operational status on a calendar view.

## Features

- **Real-time Monitoring**: Checks restaurant status every 15 minutes using Puppeteer
- **Calendar View**: Visual calendar showing daily operational status
- **Event Details**: Click on calendar dates to view detailed logs
- **Status Categories**:
  - ✅ Fully Open: Restaurant operated during expected hours
  - ⏰ Opened Late: Restaurant opened after expected time
  - ⏰ Closed Early: Restaurant closed before expected time
  - ❌ Never Opened: Restaurant never opened on expected day

## Tech Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Monitoring**: Puppeteer (headless Chrome)
- **Deployment**: Docker + Docker Compose

## Quick Start

### Development

1. **Clone and install dependencies**:
   ```bash
   git clone <repository-url>
   cd restaurant-tracker
   npm run install:all
   ```

2. **Install Chrome/Chromium** (for restaurant monitoring):
   ```bash
   # macOS
   brew install --cask google-chrome
   
   # Ubuntu/Debian
   sudo apt-get install google-chrome-stable
   
   # Windows (using Chocolatey)
   choco install googlechrome
   
   # Or let Puppeteer download Chromium automatically
   cd backend && npm install puppeteer
   ```

3. **Start PostgreSQL database**:
   ```bash
   npm run db:start
   ```

4. **Set up environment variables**:
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Frontend  
   cp frontend/.env.example frontend/.env
   # Optional: Set custom Chrome path in backend/.env if needed
   ```

5. **Start development servers**:
   ```bash
   npm run dev
   ```

   This starts both frontend (http://localhost:3000) and backend (http://localhost:3001).

### Production Deployment

#### Docker Compose (Recommended)

```bash
# Set database password
export DB_PASSWORD=your_secure_password

# Start all services
docker-compose up -d
```

#### Individual Services

1. **Database Setup**:
   ```bash
   # Using Docker
   docker run -d \
     --name restaurant-tracker-db \
     -e POSTGRES_DB=restaurant_tracker \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=your_password \
     -p 5432:5432 \
     postgres:15
   ```

2. **Backend**:
   ```bash
   cd backend
   npm install
   npm run build
   DATABASE_URL=postgresql://postgres:password@localhost:5432/restaurant_tracker npm start
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run build
   # Serve the build folder with your preferred web server
   ```

### Supabase Setup

1. **Create Supabase project** at https://supabase.com
2. **Get connection string** from Project Settings > Database
3. **Update environment variables**:
   ```bash
   # In backend/.env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
4. **Run database schema**:
   ```bash
   # The schema will be automatically applied when the backend starts
   ```

## Configuration

### Restaurant Settings

The application monitors "I Love Pastel" by default with these settings:
- **URL**: https://pedido.anota.ai/loja/ilovepastel
- **Schedule**: Thursday - Tuesday, 4:00 PM - 11:00 PM
- **Check Interval**: Every 15 minutes
- **Closed Indicator**: "Loja fechada" text on the page

These settings are stored in the database and can be modified by updating the `restaurant_config` table.

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://username:password@localhost:5432/restaurant_tracker
PORT=3001
NODE_ENV=development
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

## API Endpoints

- `GET /api/calendar?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` - Get calendar data
- `GET /api/events/:date` - Get detailed events for a specific date
- `GET /api/status-checks?limit=100` - Get recent status checks
- `GET /health` - Health check endpoint

## Database Schema

### Tables

- **status_checks**: Individual status checks with timestamps
- **daily_events**: Aggregated daily events and patterns
- **restaurant_config**: Restaurant configuration and settings

## Monitoring Logic

The application analyzes status checks to determine daily patterns:

1. **Fully Open**: Restaurant was available during all expected hours
2. **Opened Late**: First availability was after expected opening time
3. **Closed Early**: Last availability was before expected closing time
4. **Never Opened**: No availability detected during expected hours

## Deployment Options

### AWS with Docker
```bash
# Build and push to ECR
docker build -t restaurant-tracker-backend ./backend
docker build -t restaurant-tracker-frontend ./frontend
# Push to ECR and deploy with ECS or EC2
```

### Home Assistant OS
```bash
# Copy docker-compose.yml to your HAOS system
# Run with Docker add-on or SSH
docker-compose up -d
```

### Free Cloud Services
- **Railway**: Deploy with GitHub integration
- **Render**: Connect repository and deploy
- **Vercel/Netlify**: Frontend deployment (configure API_URL)

## Troubleshooting

### Common Issues

1. **Puppeteer fails to launch**:
   - Ensure Chrome dependencies are installed
   - Check Docker Alpine packages in Dockerfile

2. **Database connection fails**:
   - Verify PostgreSQL is running
   - Check DATABASE_URL format
   - Ensure database exists

3. **Frontend can't reach backend**:
   - Check REACT_APP_API_URL in frontend/.env
   - Verify backend is running on correct port
   - Check CORS settings

### Development Tips

- Use `docker-compose -f docker-compose.dev.yml up -d` for development database
- Backend API is available at http://localhost:3001
- Frontend dev server is at http://localhost:3000
- Check browser console for API errors
- Monitor backend logs for Puppeteer issues

## License

MIT License