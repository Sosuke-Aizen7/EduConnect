import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCourseSchema, insertUniversitySchema, insertSavedCourseSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
