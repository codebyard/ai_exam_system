import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Exams table
export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  icon: varchar("icon"),
  category: varchar("category"),
  isPopular: boolean("is_popular").default(false),
  totalQuestions: integer("total_questions").default(0),
  yearsAvailable: integer("years_available").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Papers table (year-wise papers for each exam)
export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull().references(() => exams.id),
  year: integer("year").notNull(),
  title: varchar("title").notNull(),
  totalQuestions: integer("total_questions").default(0),
  duration: integer("duration"), // in minutes
  isFree: boolean("is_free").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  questionNumber: integer("question_number").notNull(),
  questionText: text("question_text").notNull(),
  options: jsonb("options").notNull(), // Array of options
  correctAnswer: varchar("correct_answer").notNull(),
  explanation: text("explanation"),
  subject: varchar("subject"),
  topic: varchar("topic"),
  difficulty: varchar("difficulty"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User purchases table
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  examId: integer("exam_id").notNull().references(() => exams.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentId: varchar("stripe_payment_id"),
  status: varchar("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User attempts table
export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  mode: varchar("mode").notNull(), // 'exam', 'browse', 'instant'
  responses: jsonb("responses").notNull(), // User responses
  score: integer("score"),
  totalQuestions: integer("total_questions"),
  timeSpent: integer("time_spent"), // in seconds
  status: varchar("status").default("completed"),
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
