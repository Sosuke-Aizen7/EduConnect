import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  studyInterest: varchar("study_interest"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Universities table
export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: varchar("country").notNull(),
  city: varchar("city").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  website: text("website"),
  ranking: integer("ranking"),
  established: integer("established"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  universityId: integer("university_id").references(() => universities.id),
  level: varchar("level").notNull(), // Bachelor's, Master's, PhD, Certificate
  subject: varchar("subject").notNull(),
  duration: varchar("duration").notNull(),
  format: varchar("format").notNull(), // On-campus, Online, Hybrid
  fees: decimal("fees", { precision: 10, scale: 2 }),
  feesType: varchar("fees_type").default("total"), // total, yearly, monthly
  credits: integer("credits"),
  applicationDeadline: timestamp("application_deadline"),
  startDate: timestamp("start_date"),
  requirements: text("requirements"),
  courseStructure: jsonb("course_structure"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User saved courses
export const savedCourses = pgTable("saved_courses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Course comparisons
export const courseComparisons = pgTable("course_comparisons", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  courseIds: text("course_ids").array(), // Array of course IDs
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const universityRelations = relations(universities, ({ many }) => ({
  courses: many(courses),
}));

export const courseRelations = relations(courses, ({ one, many }) => ({
  university: one(universities, {
    fields: [courses.universityId],
    references: [universities.id],
  }),
  savedBy: many(savedCourses),
}));

export const userRelations = relations(users, ({ many }) => ({
  savedCourses: many(savedCourses),
  comparisons: many(courseComparisons),
}));

export const savedCourseRelations = relations(savedCourses, ({ one }) => ({
  user: one(users, {
    fields: [savedCourses.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [savedCourses.courseId],
    references: [courses.id],
  }),
}));

// Schemas
export const insertUniversitySchema = createInsertSchema(universities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSavedCourseSchema = createInsertSchema(savedCourses).omit({
  id: true,
  createdAt: true,
});

export const insertCourseComparisonSchema = createInsertSchema(courseComparisons).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type University = typeof universities.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type SavedCourse = typeof savedCourses.$inferSelect;
export type CourseComparison = typeof courseComparisons.$inferSelect;
export type InsertUniversity = z.infer<typeof insertUniversitySchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertSavedCourse = z.infer<typeof insertSavedCourseSchema>;
export type InsertCourseComparison = z.infer<typeof insertCourseComparisonSchema>;

// Course with university info
export type CourseWithUniversity = Course & {
  university: University;
};
