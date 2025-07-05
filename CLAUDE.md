# Claude Code Memory - Restaurant Tracker Project

## Project Overview
A React + Node.js application that monitors restaurant availability and displays operational status on a calendar view.

**Restaurant Details:**
- Name: I Love Pastel
- URL: https://pedido.anota.ai/loja/ilovepastel
- Schedule: Thursday → Tuesday, 4pm-11pm
- Timezone: America/Sao_Paulo (GMT-3, Brasília time)
- Closed Indicator: "Loja fechada" text on page

## Technology Stack
- **Frontend:** React + TypeScript
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL (Supabase-ready)
- **Monitoring:** Puppeteer (every 15 minutes)
- **Deployment:** Docker + Docker Compose

## Important Development Guidelines

### Git and PR Management
**🚨 CRITICAL: Always check PR status before pushing to branches**

Before making any commits or pushes:
1. Run `gh pr status` to check if current branch has an active PR
2. If PR is merged, create a new branch from main/master
3. Never push to branches with merged PRs
4. Use `gh pr list` to see all open PRs

### Branch Management Process
```bash
# Check PR status first
gh pr status

# If PR is merged, create new branch
git checkout main
git pull origin main
git checkout -b feature/new-feature-name

# Make changes and push to new branch
git add .
git commit -m "Description"
git push -u origin feature/new-feature-name
```

## Architecture Notes

### Database Schema
- `status_checks`: Individual status checks with timezone-aware timestamps
- `daily_events`: Aggregated daily patterns and events
- `restaurant_config`: Restaurant settings including timezone configuration

### Timezone Handling
- All dates/times stored as `TIMESTAMP WITH TIME ZONE`
- Monitoring service uses `moment-timezone` for proper timezone calculations
- Restaurant timezone: `America/Sao_Paulo` (configured in database)
- All business logic operates in restaurant's local time

### Status Categories
- **fully_open**: Operating normally during expected hours
- **opened_late**: Started service after expected opening time
- **closed_early**: Stopped service before expected closing time
- **never_opened**: No availability detected during expected hours
- **outside_hours**: Requests made outside operating hours

### Docker Configuration
- Multi-stage build for backend (build stage + production stage)
- Frontend uses nginx for serving static files
- All services defined in docker-compose.yml

## Recent Changes

### Latest Features Added
1. **Outside Hours Status**: Added detection for requests made outside operating hours
2. **Timezone Fixes**: Proper GMT-3 (Brasília time) handling throughout the application
3. **Docker Production Fix**: Multi-stage build to resolve TypeScript compilation issues

### Known Issues
- Frontend ESLint warnings for useEffect dependencies (non-critical)
- Some npm audit vulnerabilities (mainly in puppeteer dependencies)

## Development Commands

### Local Development
```bash
# Install all dependencies
npm run install:all

# Start development database
docker-compose -f docker-compose.dev.yml up -d

# Start development servers
npm run dev
```

### Production Deployment
```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs backend
```

### Testing
```bash
# Backend health check
curl http://localhost:3001/health

# Calendar API test
curl "http://localhost:3001/api/calendar?startDate=2025-07-01&endDate=2025-07-31"
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/restaurant_tracker
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## Deployment Considerations

### Supabase Setup
1. Create project at https://supabase.com
2. Get connection string from Project Settings > Database
3. Update DATABASE_URL in backend/.env
4. Schema is automatically applied on startup

### AWS/Cloud Deployment
- Use docker-compose.yml for production
- Set DB_PASSWORD environment variable
- Ensure proper security groups/firewall rules for ports 80, 3001, 5432

## Troubleshooting

### Common Issues
1. **Backend connection errors**: Check DATABASE_URL format and database availability
2. **Timezone issues**: Verify restaurant_config table has correct timezone
3. **Puppeteer failures**: Ensure Chrome dependencies in Docker Alpine image
4. **Frontend API errors**: Check REACT_APP_API_URL and CORS settings

## Notes for Future Development
- Consider adding authentication for admin features
- Implement email notifications for restaurant status changes
- Add historical analytics and reporting features
- Consider rate limiting for API endpoints