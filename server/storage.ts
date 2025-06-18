import {
  users,
  exams,
  papers,
  questions,
  purchases,
  attempts,
  type User,
  type UpsertUser,
  type Exam,
  type Paper,
  type Question,
  type Purchase,
  type Attempt,
  type InsertExam,
  type InsertPaper,
  type InsertQuestion,
  type InsertPurchase,
  type InsertAttempt,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Exam operations
  getAllExams(): Promise<Exam[]>;
  getExamById(id: number): Promise<Exam | undefined>;
  getExamPapers(examId: number): Promise<Paper[]>;
  
  // Paper operations
  getPaperById(id: number): Promise<Paper | undefined>;
  getPaperQuestions(paperId: number): Promise<Question[]>;
  
  // Purchase operations
  getUserPurchases(userId: string): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  hasUserPurchased(userId: string, examId: number): Promise<boolean>;
  getUserExamAccess(userId: string, examId: number): Promise<{ hasAccess: boolean; type: 'free' | 'premium' | null }>;
  enrollUserForFree(userId: string, examId: number): Promise<Purchase>;
  
  // Attempt operations
  getUserAttempts(userId: string): Promise<Attempt[]>;
  createAttempt(attempt: InsertAttempt): Promise<Attempt>;
  getAttemptById(id: number): Promise<Attempt | undefined>;
  updateAttempt(id: number, updates: Partial<Attempt>): Promise<Attempt>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  // Exam operations
  async getAllExams(): Promise<Exam[]> {
    return await db.select().from(exams).orderBy(desc(exams.isPopular));
  }

  async getExamById(id: number): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam;
  }

  async getExamPapers(examId: number): Promise<Paper[]> {
    return await db
      .select()
      .from(papers)
      .where(eq(papers.examId, examId))
      .orderBy(desc(papers.year));
  }

  // Paper operations
  async getPaperById(id: number): Promise<Paper | undefined> {
    const [paper] = await db.select().from(papers).where(eq(papers.id, id));
    return paper;
  }

  async getPaperQuestions(paperId: number): Promise<Question[]> {
    return await db
      .select()
      .from(questions)
      .where(eq(questions.paperId, paperId))
      .orderBy(questions.questionNumber);
  }

  // Purchase operations
  async getUserPurchases(userId: string): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt));
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const [newPurchase] = await db
      .insert(purchases)
      .values(purchase)
      .returning();
    return newPurchase;
  }

  async hasUserPurchased(userId: string, examId: number): Promise<boolean> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(
        and(
          eq(purchases.userId, userId),
          eq(purchases.examId, examId),
          eq(purchases.status, "completed")
        )
      );
    return !!purchase;
  }

  async getUserExamAccess(userId: string, examId: number): Promise<{ hasAccess: boolean; type: 'free' | 'premium' | null }> {
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(
        and(
          eq(purchases.userId, userId),
          eq(purchases.examId, examId),
          eq(purchases.status, "completed")
        )
      );
    
    if (!purchase) {
      return { hasAccess: false, type: null };
    }
    
    return { 
      hasAccess: true, 
      type: purchase.type as 'free' | 'premium' 
    };
  }

  async enrollUserForFree(userId: string, examId: number): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values({
        userId,
        examId,
        type: 'free',
        amount: '0',
        status: 'completed',
      })
      .returning();
    return purchase;
  }

  // Attempt operations
  async getUserAttempts(userId: string): Promise<Attempt[]> {
    return await db
      .select()
      .from(attempts)
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.startedAt));
  }

  async createAttempt(attempt: InsertAttempt): Promise<Attempt> {
    const [newAttempt] = await db
      .insert(attempts)
      .values(attempt)
      .returning();
    return newAttempt;
  }

  async getAttemptById(id: number): Promise<Attempt | undefined> {
    const [attempt] = await db.select().from(attempts).where(eq(attempts.id, id));
    return attempt;
  }

  async updateAttempt(id: number, updates: Partial<Attempt>): Promise<Attempt> {
    const [updatedAttempt] = await db
      .update(attempts)
      .set(updates)
      .where(eq(attempts.id, id))
      .returning();
    return updatedAttempt;
  }
}

export const storage = new DatabaseStorage();
