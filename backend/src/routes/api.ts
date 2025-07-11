import { Router } from 'express';
import { DatabaseService } from '../services/database';

const router = Router();
const dbService = new DatabaseService();

// Get calendar data for a date range
router.get('/calendar', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }
    
    const [calendarData, timezone] = await Promise.all([
      dbService.getCalendarData(startDate as string, endDate as string),
      dbService.getRestaurantTimezone()
    ]);
    
    res.json({
      calendar: calendarData,
      timezone: timezone
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed events for a specific date
router.get('/events/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const events = await dbService.getEventsForDate(date);
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent status checks
router.get('/status-checks', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const checks = await dbService.getStatusChecks(limit);
    res.json(checks);
  } catch (error) {
    console.error('Error fetching status checks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get latest status check
router.get('/status/latest', async (req, res) => {
  try {
    const latestCheck = await dbService.getStatusChecks(1);
    if (latestCheck.length === 0) {
      return res.status(404).json({ error: 'No status checks found' });
    }
    res.json(latestCheck[0]);
  } catch (error) {
    console.error('Error fetching latest status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;