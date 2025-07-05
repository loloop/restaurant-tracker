import puppeteer, { Browser, Page } from 'puppeteer';
import * as cron from 'node-cron';
import { DatabaseService } from './database';
import { pool } from '../database/connection';

export class MonitoringService {
  private browser: Browser | null = null;
  private dbService: DatabaseService;
  private cronJob: cron.ScheduledTask | null = null;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async start() {
    console.log('Starting monitoring service...');
    
    // Launch browser with cross-platform Chrome detection
    const launchOptions: any = {
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    };

    // Only set executablePath if explicitly provided in env
    if (process.env.CHROME_PATH) {
      launchOptions.executablePath = process.env.CHROME_PATH;
    }
    // Otherwise, let Puppeteer auto-detect or use bundled Chromium

    this.browser = await puppeteer.launch(launchOptions);

    // Schedule checks every 15 minutes
    this.cronJob = cron.schedule('*/15 * * * *', () => {
      this.checkRestaurantStatus();
    });

    // Run initial check
    await this.checkRestaurantStatus();
    
    console.log('Monitoring service started - checking every 15 minutes');
  }

  async stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob = null;
    }
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    
    console.log('Monitoring service stopped');
  }

  private async checkRestaurantStatus() {
    const startTime = Date.now();
    let page: Page | null = null;

    try {
      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      // Get restaurant config
      const configResult = await pool.query('SELECT * FROM restaurant_config LIMIT 1');
      if (configResult.rows.length === 0) {
        throw new Error('Restaurant configuration not found');
      }
      
      const config = configResult.rows[0];
      
      page = await this.browser.newPage();
      
      // Navigate to the restaurant page
      await page.goto(config.url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for page to load
      await page.waitForTimeout(2000);
      
      // Check if the page contains the closed indicator
      const pageContent = await page.content();
      const isOpen = !pageContent.includes(config.closed_indicator);
      
      const responseTime = Date.now() - startTime;
      
      // Save status check
      await this.dbService.saveStatusCheck(
        isOpen,
        responseTime,
        undefined,
        pageContent.substring(0, 1000) // Store first 1000 chars
      );
      
      console.log(`Status check: ${isOpen ? 'OPEN' : 'CLOSED'} (${responseTime}ms)`);
      
      // Analyze daily patterns
      await this.analyzeDailyPattern(config, isOpen);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error('Error checking restaurant status:', errorMessage);
      
      // Save error status
      await this.dbService.saveStatusCheck(
        false,
        responseTime,
        errorMessage
      );
      
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  private async analyzeDailyPattern(config: any, currentStatus: boolean) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Check if today is an operating day
    const isOperatingDay = config.operating_days.includes(dayOfWeek);
    
    if (!isOperatingDay) {
      return; // Don't analyze non-operating days
    }
    
    // Check if we're within operating hours
    const expectedOpenTime = config.open_time;
    const expectedCloseTime = config.close_time;
    
    const isWithinOperatingHours = currentTime >= expectedOpenTime && currentTime <= expectedCloseTime;
    
    // Get today's status checks to analyze patterns
    const checksQuery = `
      SELECT timestamp, is_open
      FROM status_checks
      WHERE DATE(timestamp) = $1
      ORDER BY timestamp ASC
    `;
    
    const checksResult = await pool.query(checksQuery, [today]);
    const todaysChecks = checksResult.rows;
    
    if (todaysChecks.length === 0) {
      return;
    }
    
    // Analyze the pattern
    const openChecks = todaysChecks.filter(check => check.is_open);
    const closedChecks = todaysChecks.filter(check => !check.is_open);
    
    let eventType: string | null = null;
    let actualOpenTime: string | null = null;
    let actualCloseTime: string | null = null;
    
    // Find first time it was open today
    if (openChecks.length > 0) {
      const firstOpenCheck = openChecks[0];
      actualOpenTime = firstOpenCheck.timestamp.toTimeString().split(' ')[0].substring(0, 5);
    }
    
    // Find last time it was open today
    if (openChecks.length > 0) {
      const lastOpenCheck = openChecks[openChecks.length - 1];
      const nextCheck = todaysChecks.find(check => 
        check.timestamp > lastOpenCheck.timestamp && !check.is_open
      );
      
      if (nextCheck) {
        actualCloseTime = nextCheck.timestamp.toTimeString().split(' ')[0].substring(0, 5);
      }
    }
    
    // Determine event type
    if (openChecks.length === 0) {
      eventType = 'never_opened';
    } else if (actualOpenTime && actualOpenTime > expectedOpenTime) {
      eventType = 'opened_late';
    } else if (actualCloseTime && actualCloseTime < expectedCloseTime) {
      eventType = 'closed_early';
    } else if (openChecks.length > 0 && isWithinOperatingHours) {
      eventType = 'fully_open';
    }
    
    // Only update if we have a significant pattern
    if (eventType && (!isWithinOperatingHours || todaysChecks.length > 4)) {
      await this.dbService.saveDailyEvent({
        date: today,
        event_type: eventType as any,
        expected_open_time: expectedOpenTime,
        expected_close_time: expectedCloseTime,
        actual_open_time: actualOpenTime || undefined,
        actual_close_time: actualCloseTime || undefined,
        details: {
          total_checks: todaysChecks.length,
          open_checks: openChecks.length,
          closed_checks: closedChecks.length,
          last_updated: now.toISOString()
        }
      });
      
      console.log(`Daily event updated: ${eventType} for ${today}`);
    }
  }
}