import {
  users,
  universities,
  courses,
  savedCourses,
  courseComparisons,
  type User,
  type UpsertUser,
  type University,
  type Course,
  type SavedCourse,
  type CourseComparison,
  type InsertUniversity,
  type InsertCourse,
  type InsertSavedCourse,
  type InsertCourseComparison,
  type CourseWithUniversity,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, or, sql, desc, asc, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // University operations
  getUniversities(filters?: {
    country?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<University[]>;
  getUniversity(id: number): Promise<University | undefined>;
  createUniversity(university: InsertUniversity): Promise<University>;

  // Course operations
  getCourses(filters?: {
    search?: string;
    country?: string;
    level?: string;
    subject?: string;
    duration?: string;
    minFees?: number;
    maxFees?: number;
    format?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<CourseWithUniversity[]>;
  getCourse(id: number): Promise<CourseWithUniversity | undefined>;
  getCoursesById(ids: number[]): Promise<CourseWithUniversity[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  getPopularCourses(limit?: number): Promise<CourseWithUniversity[]>;

  // Saved courses operations
  getSavedCourses(userId: string): Promise<CourseWithUniversity[]>;
  saveCourse(data: InsertSavedCourse): Promise<SavedCourse>;
  removeSavedCourse(userId: string, courseId: number): Promise<void>;
  isCourseWishlisted(userId: string, courseId: number): Promise<boolean>;

  // Comparison operations
  getUserComparisons(userId: string): Promise<CourseComparison[]>;
  createComparison(comparison: InsertCourseComparison): Promise<CourseComparison>;
  deleteComparison(id: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // University operations
  async getUniversities(filters?: {
    country?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<University[]> {
    const conditions = [];
    if (filters?.country) {
      conditions.push(eq(universities.country, filters.country));
    }
    if (filters?.search) {
      conditions.push(
        or(
          ilike(universities.name, `%${filters.search}%`),
          ilike(universities.city, `%${filters.search}%`)
        )
      );
    }

    let query = db.select().from(universities);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    query = query.orderBy(asc(universities.name));

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    return await query;
  }

  async getUniversity(id: number): Promise<University | undefined> {
    const [university] = await db
      .select()
      .from(universities)
      .where(eq(universities.id, id));
    return university;
  }

  async createUniversity(university: InsertUniversity): Promise<University> {
    const [newUniversity] = await db
      .insert(universities)
      .values(university)
      .returning();
    return newUniversity;
  }

  // Course operations
  async getCourses(filters?: {
    search?: string;
    country?: string;
    level?: string;
    subject?: string;
    duration?: string;
    minFees?: number;
    maxFees?: number;
    format?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<CourseWithUniversity[]> {
    const conditions = [];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(courses.title, `%${filters.search}%`),
          ilike(courses.description, `%${filters.search}%`),
          ilike(courses.subject, `%${filters.search}%`)
        )
      );
    }

    if (filters?.country) {
      conditions.push(eq(universities.country, filters.country));
    }

    if (filters?.level) {
      conditions.push(eq(courses.level, filters.level));
    }

    if (filters?.subject) {
      conditions.push(eq(courses.subject, filters.subject));
    }

    if (filters?.duration) {
      conditions.push(eq(courses.duration, filters.duration));
    }

    if (filters?.format) {
      conditions.push(eq(courses.format, filters.format));
    }

    if (filters?.minFees !== undefined) {
      conditions.push(sql`${courses.fees} >= ${filters.minFees}`);
    }

    if (filters?.maxFees !== undefined) {
      conditions.push(sql`${courses.fees} <= ${filters.maxFees}`);
    }

    // Build base query
    let query = db
      .select()
      .from(courses)
      .leftJoin(universities, eq(courses.universityId, universities.id));

    // Apply filters
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case "fees_low":
        query = query.orderBy(asc(courses.fees));
        break;
      case "fees_high":
        query = query.orderBy(desc(courses.fees));
        break;
      case "duration":
        query = query.orderBy(asc(courses.duration));
        break;
      case "rating":
        query = query.orderBy(desc(courses.rating));
        break;
      default:
        query = query.orderBy(desc(courses.rating), asc(courses.title));
    }

    // Apply pagination
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    const results = await query;
    return results.map(result => ({
      ...result.courses,
      university: result.universities!,
    }));
  }

  async getCourse(id: number): Promise<CourseWithUniversity | undefined> {
    const [result] = await db
      .select()
      .from(courses)
      .leftJoin(universities, eq(courses.universityId, universities.id))
      .where(eq(courses.id, id));

    if (!result) return undefined;

    return {
      ...result.courses,
      university: result.universities!,
    };
  }

  async getCoursesById(ids: number[]): Promise<CourseWithUniversity[]> {
    if (ids.length === 0) return [];

    const results = await db
      .select()
      .from(courses)
      .leftJoin(universities, eq(courses.universityId, universities.id))
      .where(inArray(courses.id, ids));

    return results.map(result => ({
      ...result.courses,
      university: result.universities!,
    }));
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async getPopularCourses(limit = 6): Promise<CourseWithUniversity[]> {
    const results = await db
      .select()
      .from(courses)
      .leftJoin(universities, eq(courses.universityId, universities.id))
      .orderBy(desc(courses.rating), desc(courses.createdAt))
      .limit(limit);

    return results.map(result => ({
      ...result.courses,
      university: result.universities!,
    }));
  }

  // Saved courses operations
  async getSavedCourses(userId: string): Promise<CourseWithUniversity[]> {
    const results = await db
      .select()
      .from(savedCourses)
      .leftJoin(courses, eq(savedCourses.courseId, courses.id))
      .leftJoin(universities, eq(courses.universityId, universities.id))
      .where(eq(savedCourses.userId, userId))
      .orderBy(desc(savedCourses.createdAt));

    return results.map(result => ({
      ...result.courses!,
      university: result.universities!,
    }));
  }

  async saveCourse(data: InsertSavedCourse): Promise<SavedCourse> {
    const [savedCourse] = await db
      .insert(savedCourses)
      .values(data)
      .returning();
    return savedCourse;
  }

  async removeSavedCourse(userId: string, courseId: number): Promise<void> {
    await db
      .delete(savedCourses)
      .where(
        and(
          eq(savedCourses.userId, userId),
          eq(savedCourses.courseId, courseId)
        )
      );
  }

  async isCourseWishlisted(userId: string, courseId: number): Promise<boolean> {
    const [saved] = await db
      .select()
      .from(savedCourses)
      .where(
        and(
          eq(savedCourses.userId, userId),
          eq(savedCourses.courseId, courseId)
        )
      );
    return !!saved;
  }

  // Comparison operations
  async getUserComparisons(userId: string): Promise<CourseComparison[]> {
    return await db
      .select()
      .from(courseComparisons)
      .where(eq(courseComparisons.userId, userId))
      .orderBy(desc(courseComparisons.createdAt));
  }

  async createComparison(comparison: InsertCourseComparison): Promise<CourseComparison> {
    const [newComparison] = await db
      .insert(courseComparisons)
      .values(comparison)
      .returning();
    return newComparison;
  }

  async deleteComparison(id: number, userId: string): Promise<void> {
    await db
      .delete(courseComparisons)
      .where(
        and(
          eq(courseComparisons.id, id),
          eq(courseComparisons.userId, userId)
        )
      );
  }
}

export const storage = new DatabaseStorage();
