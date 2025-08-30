import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertUniversitySchema, insertSavedCourseSchema } from "@shared/schema";
import { z } from "zod";
import { isAdmin, requireAdminPermission, getAdminInfo, type AdminRequest } from "./admin-middleware";
import { scrapingService } from "./scraping-service";
import { jobScheduler } from "./scheduler";
import { monitoring } from "./monitoring";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // University routes
  app.get('/api/universities', async (req, res) => {
    try {
      const { country, search, limit = 50, offset = 0 } = req.query;
      const universities = await storage.getUniversities({
        country: country as string,
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(universities);
    } catch (error) {
      console.error("Error fetching universities:", error);
      res.status(500).json({ message: "Failed to fetch universities" });
    }
  });

  app.get('/api/universities/:id', async (req, res) => {
    try {
      const universityId = parseInt(req.params.id);
      const university = await storage.getUniversity(universityId);
      if (!university) {
        return res.status(404).json({ message: "University not found" });
      }
      res.json(university);
    } catch (error) {
      console.error("Error fetching university:", error);
      res.status(500).json({ message: "Failed to fetch university" });
    }
  });

  app.post('/api/universities', isAuthenticated, async (req, res) => {
    try {
      const universityData = insertUniversitySchema.parse(req.body);
      const university = await storage.createUniversity(universityData);
      res.status(201).json(university);
    } catch (error) {
      console.error("Error creating university:", error);
      res.status(500).json({ message: "Failed to create university" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const {
        search,
        country,
        level,
        subject,
        duration,
        minFees,
        maxFees,
        format,
        sortBy = 'relevance',
        limit = 20,
        offset = 0
      } = req.query;

      const courses = await storage.getCourses({
        search: search as string,
        country: country as string,
        level: level as string,
        subject: subject as string,
        duration: duration as string,
        minFees: minFees ? parseFloat(minFees as string) : undefined,
        maxFees: maxFees ? parseFloat(maxFees as string) : undefined,
        format: format as string,
        sortBy: sortBy as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/popular', async (req, res) => {
    try {
      const { limit = 6 } = req.query;
      const courses = await storage.getPopularCourses(parseInt(limit as string));
      res.json(courses);
    } catch (error) {
      console.error("Error fetching popular courses:", error);
      res.status(500).json({ message: "Failed to fetch popular courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Saved courses routes
  app.get('/api/saved-courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedCourses = await storage.getSavedCourses(userId);
      res.json(savedCourses);
    } catch (error) {
      console.error("Error fetching saved courses:", error);
      res.status(500).json({ message: "Failed to fetch saved courses" });
    }
  });

  app.post('/api/saved-courses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId } = req.body;
      
      const savedCourseData = insertSavedCourseSchema.parse({
        userId,
        courseId: parseInt(courseId),
      });

      const savedCourse = await storage.saveCourse(savedCourseData);
      res.status(201).json(savedCourse);
    } catch (error) {
      console.error("Error saving course:", error);
      res.status(500).json({ message: "Failed to save course" });
    }
  });

  app.delete('/api/saved-courses/:courseId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = parseInt(req.params.courseId);
      
      await storage.removeSavedCourse(userId, courseId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing saved course:", error);
      res.status(500).json({ message: "Failed to remove saved course" });
    }
  });

  app.get('/api/saved-courses/:courseId/check', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = parseInt(req.params.courseId);
      
      const isWishlisted = await storage.isCourseWishlisted(userId, courseId);
      res.json({ isWishlisted });
    } catch (error) {
      console.error("Error checking saved course:", error);
      res.status(500).json({ message: "Failed to check saved course" });
    }
  });

  // Comparison routes
  app.get('/api/comparisons', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const comparisons = await storage.getUserComparisons(userId);
      res.json(comparisons);
    } catch (error) {
      console.error("Error fetching comparisons:", error);
      res.status(500).json({ message: "Failed to fetch comparisons" });
    }
  });

  app.post('/api/comparisons', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseIds } = req.body;
      
      const comparisonData = {
        userId,
        courseIds: courseIds.map(String),
      };

      const comparison = await storage.createComparison(comparisonData);
      res.status(201).json(comparison);
    } catch (error) {
      console.error("Error creating comparison:", error);
      res.status(500).json({ message: "Failed to create comparison" });
    }
  });

  app.delete('/api/comparisons/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const comparisonId = parseInt(req.params.id);
      
      await storage.deleteComparison(comparisonId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comparison:", error);
      res.status(500).json({ message: "Failed to delete comparison" });
    }
  });

  // Comparison with courses data
  app.post('/api/compare-courses', async (req, res) => {
    try {
      const { courseIds } = req.body;
      
      if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({ message: "Course IDs are required" });
      }

      const courses = await storage.getCoursesById(courseIds.map(id => parseInt(id)));
      res.json(courses);
    } catch (error) {
      console.error("Error comparing courses:", error);
      res.status(500).json({ message: "Failed to compare courses" });
    }
  });

  // Admin routes
  app.get('/api/admin/profile', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const adminInfo = getAdminInfo(req);
      res.json(adminInfo);
    } catch (error) {
      console.error("Error fetching admin profile:", error);
      res.status(500).json({ message: "Failed to fetch admin profile" });
    }
  });

  // Admin data management routes
  app.get('/api/admin/stats', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await scrapingService.getScrapingStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Admin university management
  app.get('/api/admin/universities', isAuthenticated, requireAdminPermission('read'), async (req, res) => {
    try {
      const { limit = 100, offset = 0, search } = req.query;
      const universities = await storage.getUniversities({
        search: search as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });
      res.json(universities);
    } catch (error) {
      console.error("Error fetching universities for admin:", error);
      res.status(500).json({ message: "Failed to fetch universities" });
    }
  });

  app.put('/api/admin/universities/:id', isAuthenticated, requireAdminPermission('write'), async (req, res) => {
    try {
      const universityId = parseInt(req.params.id);
      const updateData = insertUniversitySchema.parse(req.body);
      
      // For now, we'll create a new university since we don't have update method
      // In a real app, you'd add an update method to storage
      res.status(501).json({ message: "University update not implemented yet" });
    } catch (error) {
      console.error("Error updating university:", error);
      res.status(500).json({ message: "Failed to update university" });
    }
  });

  // Admin course management
  app.get('/api/admin/courses', isAuthenticated, requireAdminPermission('read'), async (req, res) => {
    try {
      const {
        search,
        universityId,
        level,
        subject,
        limit = 100,
        offset = 0
      } = req.query;

      const courses = await storage.getCourses({
        search: search as string,
        level: level as string,
        subject: subject as string,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      });

      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses for admin:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.put('/api/admin/courses/:id', isAuthenticated, requireAdminPermission('write'), async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const updateData = insertCourseSchema.parse(req.body);
      
      // For now, return not implemented
      res.status(501).json({ message: "Course update not implemented yet" });
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(500).json({ message: "Failed to update course" });
    }
  });

  app.delete('/api/admin/courses/:id', isAuthenticated, requireAdminPermission('delete'), async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // For now, return not implemented
      res.status(501).json({ message: "Course deletion not implemented yet" });
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  // Admin scraping management
  app.post('/api/admin/scrape/start', isAuthenticated, requireAdminPermission('scrape'), async (req, res) => {
    try {
      // Start scraping process in background
      scrapingService.scrapeAllUniversities()
        .then(() => {
          console.log('Scraping completed successfully');
        })
        .catch((error) => {
          console.error('Scraping failed:', error);
        });

      res.json({ 
        message: "Scraping process started",
        status: "started",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error starting scrape:", error);
      res.status(500).json({ message: "Failed to start scraping process" });
    }
  });

  app.get('/api/admin/scrape/status', isAuthenticated, requireAdminPermission('read'), async (req, res) => {
    try {
      const stats = await scrapingService.getScrapingStats();
      res.json({
        ...stats,
        status: 'idle', // In a real app, you'd track actual scraping status
        lastChecked: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error fetching scrape status:", error);
      res.status(500).json({ message: "Failed to fetch scraping status" });
    }
  });

  // Admin bulk operations
  app.post('/api/admin/bulk/delete-courses', isAuthenticated, requireAdminPermission('delete'), async (req, res) => {
    try {
      const { courseIds } = req.body;
      
      if (!Array.isArray(courseIds) || courseIds.length === 0) {
        return res.status(400).json({ message: "Course IDs are required" });
      }

      // For now, return not implemented
      res.status(501).json({ message: "Bulk course deletion not implemented yet" });
    } catch (error) {
      console.error("Error bulk deleting courses:", error);
      res.status(500).json({ message: "Failed to bulk delete courses" });
    }
  });

  // Admin scheduler management routes
  app.get('/api/admin/scheduler/jobs', isAuthenticated, requireAdminPermission('read'), async (req, res) => {
    try {
      const jobStatuses = jobScheduler.getJobStatuses();
      res.json(jobStatuses);
    } catch (error) {
      console.error("Error fetching job statuses:", error);
      res.status(500).json({ message: "Failed to fetch job statuses" });
    }
  });

  app.post('/api/admin/scheduler/jobs/:jobName/start', isAuthenticated, requireAdminPermission('write'), async (req, res) => {
    try {
      const { jobName } = req.params;
      const success = jobScheduler.startJob(jobName);
      
      if (success) {
        res.json({ message: `Job ${jobName} started successfully` });
      } else {
        res.status(400).json({ message: `Failed to start job ${jobName}` });
      }
    } catch (error) {
      console.error(`Error starting job ${req.params.jobName}:`, error);
      res.status(500).json({ message: "Failed to start job" });
    }
  });

  app.post('/api/admin/scheduler/jobs/:jobName/stop', isAuthenticated, requireAdminPermission('write'), async (req, res) => {
    try {
      const { jobName } = req.params;
      const success = jobScheduler.stopJob(jobName);
      
      if (success) {
        res.json({ message: `Job ${jobName} stopped successfully` });
      } else {
        res.status(400).json({ message: `Failed to stop job ${jobName}` });
      }
    } catch (error) {
      console.error(`Error stopping job ${req.params.jobName}:`, error);
      res.status(500).json({ message: "Failed to stop job" });
    }
  });

  app.post('/api/admin/scheduler/jobs/:jobName/run', isAuthenticated, requireAdminPermission('scrape'), async (req, res) => {
    try {
      const { jobName } = req.params;
      
      // Run job in background
      jobScheduler.runJob(jobName)
        .then(() => {
          console.log(`Manual job execution completed: ${jobName}`);
        })
        .catch((error) => {
          console.error(`Manual job execution failed: ${jobName}`, error);
        });
      
      res.json({ 
        message: `Job ${jobName} started manually`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error running job ${req.params.jobName}:`, error);
      res.status(500).json({ message: "Failed to run job manually" });
    }
  });

  app.put('/api/admin/scheduler/jobs/:jobName/schedule', isAuthenticated, requireAdminPermission('write'), async (req, res) => {
    try {
      const { jobName } = req.params;
      const { schedule } = req.body;
      
      if (!schedule || typeof schedule !== 'string') {
        return res.status(400).json({ message: "Valid cron schedule is required" });
      }
      
      const success = jobScheduler.updateJobSchedule(jobName, schedule);
      
      if (success) {
        res.json({ message: `Job ${jobName} schedule updated successfully` });
      } else {
        res.status(400).json({ message: `Failed to update job ${jobName} schedule` });
      }
    } catch (error) {
      console.error(`Error updating job schedule ${req.params.jobName}:`, error);
      res.status(500).json({ message: "Failed to update job schedule" });
    }
  });

  // Admin monitoring and logging routes
  app.get('/api/admin/monitoring/health', isAuthenticated, requireAdminPermission('read'), async (req, res) => {
    try {
      const healthStatus = monitoring.getHealthStatus();
      res.json(healthStatus);
    } catch (error) {
      console.error("Error fetching health status:", error);
      res.status(500).json({ message: "Failed to fetch health status" });
    }
  });

  app.get('/api/admin/monitoring/scraping-stats', isAuthenticated, requireAdminPermission('read'), async (req, res) => {
    try {
      const { timeRange = '24h' } = req.query;
      const stats = monitoring.getScrapingStats(timeRange as '1h' | '24h' | '7d' | '30d');
      res.json(stats);
    } catch (error) {
      console.error("Error fetching scraping stats:", error);
      res.status(500).json({ message: "Failed to fetch scraping statistics" });
    }
  });

  app.get('/api/admin/monitoring/scraping-logs', isAuthenticated, requireAdminPermission('read'), async (req, res) => {
    try {
      const { 
        limit = 50, 
        status, 
        since, 
        universityName 
      } = req.query;

      const options: any = {
        limit: parseInt(limit as string),
      };

      if (status) options.status = status;
      if (since) options.since = new Date(since as string);
      if (universityName) options.universityName = universityName;

      const logs = monitoring.getScrapingLogs(options);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching scraping logs:", error);
      res.status(500).json({ message: "Failed to fetch scraping logs" });
    }
  });

  app.get('/api/admin/monitoring/system-metrics', isAuthenticated, requireAdminPermission('read'), async (req, res) => {
    try {
      const metrics = monitoring.getCurrentSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      res.status(500).json({ message: "Failed to fetch system metrics" });
    }
  });

  app.post('/api/admin/monitoring/log-event', isAuthenticated, requireAdminPermission('write'), async (req, res) => {
    try {
      const { type, message, context } = req.body;
      
      if (!type || !message) {
        return res.status(400).json({ message: "Type and message are required" });
      }

      if (!['info', 'warning', 'error'].includes(type)) {
        return res.status(400).json({ message: "Type must be one of: info, warning, error" });
      }

      monitoring.logEvent({ type, message, context });
      res.json({ message: "Event logged successfully" });
    } catch (error) {
      console.error("Error logging event:", error);
      res.status(500).json({ message: "Failed to log event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
