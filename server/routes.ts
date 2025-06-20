import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { isAuthenticated } from "./clerkAuth";
import { seedDatabase } from "./seed";
import { insertPurchaseSchema, insertAttemptSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export async function registerRoutes(app: Express): Promise<Server> {
  // No more setupAuth needed

  // Check if database needs seeding and seed if empty
  const existingExams = await storage.getAllExams();
  if (existingExams.length === 0) {
    console.log("Database is empty, seeding with sample data...");
    await seedDatabase();
  }

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Exam routes
  app.get('/api/exams', async (req, res) => {
    try {
      const exams = await storage.getAllExams();
      res.json(exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.get('/api/exams/:id', async (req, res) => {
    try {
      const examId = parseInt(req.params.id);
      const exam = await storage.getExamById(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      console.error("Error fetching exam:", error);
      res.status(500).json({ message: "Failed to fetch exam" });
    }
  });

  app.get('/api/exams/:id/papers', async (req, res) => {
    try {
      const examId = parseInt(req.params.id);
      const papers = await storage.getExamPapers(examId);
      res.json(papers);
    } catch (error) {
      console.error("Error fetching papers:", error);
      res.status(500).json({ message: "Failed to fetch papers" });
    }
  });

  // Paper routes
  app.get('/api/papers/:id', async (req, res) => {
    try {
      const paperId = parseInt(req.params.id);
      const paper = await storage.getPaperById(paperId);
      if (!paper) {
        return res.status(404).json({ message: "Paper not found" });
      }
      res.json(paper);
    } catch (error) {
      console.error("Error fetching paper:", error);
      res.status(500).json({ message: "Failed to fetch paper" });
    }
  });

  app.get('/api/papers/:id/questions', async (req, res) => {
    try {
      const paperId = parseInt(req.params.id);
      const questions = await storage.getPaperQuestions(paperId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Protected routes
  app.get('/api/user/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post('/api/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const purchaseData = insertPurchaseSchema.parse({
        ...req.body,
        userId
      });
      const purchase = await storage.createPurchase(purchaseData);
      res.json(purchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  // Free enrollment route
  app.post('/api/exams/:examId/enroll-free', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const examId = parseInt(req.params.examId);
      
      // Check if user already has access
      const access = await storage.getUserExamAccess(userId, examId);
      if (access.hasAccess) {
        return res.json({ message: "Already enrolled", purchase: access });
      }
      
      const purchase = await storage.enrollUserForFree(userId, examId);
      res.json(purchase);
    } catch (error) {
      console.error("Error enrolling user for free:", error);
      res.status(500).json({ message: "Failed to enroll for free access" });
    }
  });

  // Get user's exam access status
  app.get('/api/exams/:examId/access', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const examId = parseInt(req.params.examId);
      
      const access = await storage.getUserExamAccess(userId, examId);
      res.json(access);
    } catch (error) {
      console.error("Error checking exam access:", error);
      res.status(500).json({ message: "Failed to check access" });
    }
  });

  app.get('/api/user/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const attempts = await storage.getUserAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  app.post('/api/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const attemptData = insertAttemptSchema.parse({
        ...req.body,
        userId
      });
      const attempt = await storage.createAttempt(attemptData);
      res.json(attempt);
    } catch (error) {
      console.error("Error creating attempt:", error);
      res.status(500).json({ message: "Failed to create attempt" });
    }
  });

  app.get('/api/attempts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      const attempt = await storage.getAttemptById(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: "Attempt not found" });
      }
      
      // Check if user owns this attempt
      const userId = req.user.id;
      if (attempt.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(attempt);
    } catch (error) {
      console.error("Error fetching attempt:", error);
      res.status(500).json({ message: "Failed to fetch attempt" });
    }
  });

  app.patch('/api/attempts/:id', isAuthenticated, async (req: any, res) => {
    try {
      const attemptId = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user owns this attempt
      const attempt = await storage.getAttemptById(attemptId);
      if (!attempt || attempt.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updatedAttempt = await storage.updateAttempt(attemptId, req.body);
      res.json(updatedAttempt);
    } catch (error) {
      console.error("Error updating attempt:", error);
      res.status(500).json({ message: "Failed to update attempt" });
    }
  });

  // Check access to exam
  app.get('/api/exams/:id/access', isAuthenticated, async (req: any, res) => {
    try {
      const examId = parseInt(req.params.id);
      const userId = req.user.id;
      const hasPurchased = await storage.hasUserPurchased(userId, examId);
      res.json({ hasAccess: hasPurchased });
    } catch (error) {
      console.error("Error checking access:", error);
      res.status(500).json({ message: "Failed to check access" });
    }
  });

  // Register route
  app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    try {
      // Check if user already exists
      const existingUser = await storage.getUser(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.upsertUser({
        id: email, // Use email as id for simplicity
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // Issue JWT
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login route
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    try {
      const user = await storage.getUser(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      // Issue JWT
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: { id: user.id, email: user.email } });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
