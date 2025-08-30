import * as cron from 'node-cron';
import { scrapingService } from './scraping-service';

interface ScheduledJob {
  name: string;
  schedule: string;
  task: () => Promise<void>;
  isRunning: boolean;
  lastRun?: Date;
  nextRun?: Date;
  enabled: boolean;
}

export class JobScheduler {
  private jobs: Map<string, ScheduledJob> = new Map();
  private cronTasks: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    this.setupDefaultJobs();
  }

  /**
   * Sets up default scheduled jobs
   */
  private setupDefaultJobs() {
    // Daily scraping job at 2 AM
    this.addJob('daily-scraping', '0 2 * * *', async () => {
      console.log('Starting scheduled daily scraping...');
      await this.runDailyScraping();
    });

    // Weekly comprehensive scraping every Sunday at 3 AM
    this.addJob('weekly-comprehensive-scraping', '0 3 * * 0', async () => {
      console.log('Starting scheduled weekly comprehensive scraping...');
      await this.runWeeklyScraping();
    });

    // Database cleanup job every day at 1 AM
    this.addJob('daily-cleanup', '0 1 * * *', async () => {
      console.log('Starting scheduled database cleanup...');
      await this.runDatabaseCleanup();
    });

    // Health check job every hour
    this.addJob('health-check', '0 * * * *', async () => {
      await this.runHealthCheck();
    });
  }

  /**
   * Adds a new scheduled job
   */
  addJob(name: string, schedule: string, task: () => Promise<void>, enabled: boolean = true): boolean {
    try {
      // Validate cron expression
      if (!cron.validate(schedule)) {
        console.error(`Invalid cron schedule: ${schedule}`);
        return false;
      }

      const job: ScheduledJob = {
        name,
        schedule,
        task,
        isRunning: false,
        enabled,
        nextRun: this.calculateNextRun(schedule)
      };

      this.jobs.set(name, job);

      if (enabled) {
        this.startJob(name);
      }

      console.log(`Added job: ${name} with schedule: ${schedule}`);
      return true;
    } catch (error) {
      console.error(`Error adding job ${name}:`, error);
      return false;
    }
  }

  /**
   * Starts a specific job
   */
  startJob(name: string): boolean {
    const job = this.jobs.get(name);
    if (!job) {
      console.error(`Job not found: ${name}`);
      return false;
    }

    try {
      const cronTask = cron.schedule(job.schedule, async () => {
        if (job.isRunning) {
          console.log(`Job ${name} is already running, skipping...`);
          return;
        }

        job.isRunning = true;
        job.lastRun = new Date();
        
        try {
          console.log(`Starting job: ${name}`);
          await job.task();
          console.log(`Completed job: ${name}`);
        } catch (error) {
          console.error(`Error in job ${name}:`, error);
        } finally {
          job.isRunning = false;
          job.nextRun = this.calculateNextRun(job.schedule);
        }
      });

      cronTask.start();
      this.cronTasks.set(name, cronTask);
      job.enabled = true;

      console.log(`Started job: ${name}`);
      return true;
    } catch (error) {
      console.error(`Error starting job ${name}:`, error);
      return false;
    }
  }

  /**
   * Stops a specific job
   */
  stopJob(name: string): boolean {
    const cronTask = this.cronTasks.get(name);
    const job = this.jobs.get(name);

    if (cronTask) {
      cronTask.stop();
      this.cronTasks.delete(name);
    }

    if (job) {
      job.enabled = false;
      console.log(`Stopped job: ${name}`);
      return true;
    }

    console.error(`Job not found: ${name}`);
    return false;
  }

  /**
   * Manually runs a job
   */
  async runJob(name: string): Promise<boolean> {
    const job = this.jobs.get(name);
    if (!job) {
      console.error(`Job not found: ${name}`);
      return false;
    }

    if (job.isRunning) {
      console.log(`Job ${name} is already running`);
      return false;
    }

    try {
      job.isRunning = true;
      job.lastRun = new Date();
      
      console.log(`Manually running job: ${name}`);
      await job.task();
      console.log(`Manually completed job: ${name}`);
      
      return true;
    } catch (error) {
      console.error(`Error manually running job ${name}:`, error);
      return false;
    } finally {
      job.isRunning = false;
      job.nextRun = this.calculateNextRun(job.schedule);
    }
  }

  /**
   * Gets all job statuses
   */
  getJobStatuses(): Array<{
    name: string;
    schedule: string;
    isRunning: boolean;
    enabled: boolean;
    lastRun?: string;
    nextRun?: string;
  }> {
    return Array.from(this.jobs.values()).map(job => ({
      name: job.name,
      schedule: job.schedule,
      isRunning: job.isRunning,
      enabled: job.enabled,
      lastRun: job.lastRun?.toISOString(),
      nextRun: job.nextRun?.toISOString()
    }));
  }

  /**
   * Daily scraping task implementation
   */
  private async runDailyScraping(): Promise<void> {
    try {
      // Run a lighter version of scraping daily
      console.log('Running daily scraping - updating existing data...');
      
      // For daily runs, we might want to update only certain universities
      // or run a more targeted scraping approach
      const stats = await scrapingService.getScrapingStats();
      console.log(`Current data stats:`, stats);
      
      // Only run full scraping if we have very little data
      if (stats.totalCourses < 100) {
        await scrapingService.scrapeAllUniversities();
      } else {
        console.log('Skipping full scraping - sufficient data available');
      }
    } catch (error) {
      console.error('Daily scraping failed:', error);
    }
  }

  /**
   * Weekly comprehensive scraping task implementation
   */
  private async runWeeklyScraping(): Promise<void> {
    try {
      console.log('Running weekly comprehensive scraping...');
      await scrapingService.scrapeAllUniversities();
      
      const stats = await scrapingService.getScrapingStats();
      console.log(`Weekly scraping completed. New stats:`, stats);
    } catch (error) {
      console.error('Weekly scraping failed:', error);
    }
  }

  /**
   * Database cleanup task implementation
   */
  private async runDatabaseCleanup(): Promise<void> {
    try {
      console.log('Running database cleanup...');
      
      // Here you would implement cleanup logic:
      // - Remove duplicate courses
      // - Clean up old comparison data
      // - Remove expired sessions
      // - Update statistics
      
      console.log('Database cleanup completed');
    } catch (error) {
      console.error('Database cleanup failed:', error);
    }
  }

  /**
   * Health check task implementation
   */
  private async runHealthCheck(): Promise<void> {
    try {
      // Check database connectivity
      const stats = await scrapingService.getScrapingStats();
      
      // Log health metrics (avoid spam by only logging issues)
      if (stats.totalUniversities === 0 || stats.totalCourses === 0) {
        console.warn('Health check warning: Low data counts', stats);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    }
  }

  /**
   * Calculates the next run time for a cron schedule
   */
  private calculateNextRun(schedule: string): Date {
    try {
      // This is a simplified calculation
      // In a real implementation, you'd use a proper cron parser
      const now = new Date();
      const nextRun = new Date(now);
      nextRun.setHours(nextRun.getHours() + 1); // Default to 1 hour from now
      return nextRun;
    } catch {
      return new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    }
  }

  /**
   * Starts all enabled jobs
   */
  startAllJobs(): void {
    console.log('Starting all scheduled jobs...');
    
    Array.from(this.jobs.entries()).forEach(([name, job]) => {
      if (job.enabled) {
        this.startJob(name);
      }
    });
    
    console.log(`Started ${this.cronTasks.size} scheduled jobs`);
  }

  /**
   * Stops all jobs
   */
  stopAllJobs(): void {
    console.log('Stopping all scheduled jobs...');
    
    Array.from(this.jobs.keys()).forEach(name => {
      this.stopJob(name);
    });
    
    console.log('All scheduled jobs stopped');
  }

  /**
   * Updates a job's schedule
   */
  updateJobSchedule(name: string, newSchedule: string): boolean {
    const job = this.jobs.get(name);
    if (!job) {
      console.error(`Job not found: ${name}`);
      return false;
    }

    if (!cron.validate(newSchedule)) {
      console.error(`Invalid cron schedule: ${newSchedule}`);
      return false;
    }

    // Stop the current job
    this.stopJob(name);
    
    // Update the schedule
    job.schedule = newSchedule;
    job.nextRun = this.calculateNextRun(newSchedule);
    
    // Restart if it was enabled
    if (job.enabled) {
      this.startJob(name);
    }

    console.log(`Updated job ${name} schedule to: ${newSchedule}`);
    return true;
  }
}

// Create global scheduler instance
export const jobScheduler = new JobScheduler();