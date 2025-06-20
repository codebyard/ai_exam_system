import {
  mysqlTable,
  varchar,
  text,
  int,
  boolean,
  decimal,
  json,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = mysqlTable(
  "sessions",
  {
    sid: varchar("sid", { length: 255 }).primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  email: varchar("email", { length: 255 }).unique(),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  profileImageUrl: varchar("profile_image_url", { length: 255 }),
  passwordHash: varchar("password_hash", { length: 255 }), // For local auth
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exams table
export const exams = mysqlTable("exams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  category: varchar("category", { length: 255 }),
  isPopular: boolean("is_popular").default(false),
  totalQuestions: int("total_questions").default(0),
  yearsAvailable: int("years_available").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Papers table (year-wise papers for each exam)
export const papers = mysqlTable("papers", {
  id: int("id").autoincrement().primaryKey(),
  examId: int("exam_id").notNull().references(() => exams.id),
  year: int("year").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  totalQuestions: int("total_questions").default(0),
  duration: int("duration"), // in minutes
  isFree: boolean("is_free").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions table
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  paperId: int("paper_id").notNull().references(() => papers.id),
  questionNumber: int("question_number").notNull(),
  questionText: text("question_text").notNull(),
  options: json("options").notNull(), // Array of options
  correctAnswer: varchar("correct_answer", { length: 255 }).notNull(),
  explanation: text("explanation"),
  subject: varchar("subject", { length: 255 }),
  topic: varchar("topic", { length: 255 }),
  difficulty: varchar("difficulty", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// User purchases table
export const purchases = mysqlTable("purchases", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  examId: int("exam_id").notNull().references(() => exams.id),
  type: varchar("type", { length: 255 }).notNull(), // 'free' or 'premium'
  amount: decimal("amount", { precision: 10, scale: 2 }).default("0"),
  stripePaymentId: varchar("stripe_payment_id", { length: 255 }),
  status: varchar("status", { length: 255 }).default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User attempts table
export const attempts = mysqlTable("attempts", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id),
  paperId: int("paper_id").notNull().references(() => papers.id),
  mode: varchar("mode", { length: 255 }).notNull(), // 'exam', 'browse', 'instant'
  responses: json("responses").notNull(), // User responses
  score: int("score"),
  totalQuestions: int("total_questions"),
  timeSpent: int("time_spent"), // in seconds
  status: varchar("status", { length: 255 }).default("completed"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  attempts: many(attempts),
}));

export const examsRelations = relations(exams, ({ many }) => ({
  papers: many(papers),
  purchases: many(purchases),
}));

export const papersRelations = relations(papers, ({ one, many }) => ({
  exam: one(exams, {
    fields: [papers.examId],
    references: [exams.id],
  }),
  questions: many(questions),
  attempts: many(attempts),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  paper: one(papers, {
    fields: [questions.paperId],
    references: [papers.id],
  }),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  exam: one(exams, {
    fields: [purchases.examId],
    references: [exams.id],
  }),
}));

export const attemptsRelations = relations(attempts, ({ one }) => ({
  user: one(users, {
    fields: [attempts.userId],
    references: [users.id],
  }),
  paper: one(papers, {
    fields: [attempts.paperId],
    references: [papers.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertExamSchema = createInsertSchema(exams);
export const insertPaperSchema = createInsertSchema(papers);
export const insertQuestionSchema = createInsertSchema(questions);
export const insertPurchaseSchema = createInsertSchema(purchases);
export const insertAttemptSchema = createInsertSchema(attempts);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Exam = typeof exams.$inferSelect;
export type Paper = typeof papers.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type InsertPaper = z.infer<typeof insertPaperSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
