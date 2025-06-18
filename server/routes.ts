import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertPurchaseSchema, insertAttemptSchema } from "@shared/schema";

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
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post('/api/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/user/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const attempts = await storage.getUserAttempts(userId);
      res.json(attempts);
    } catch (error) {
      console.error("Error fetching attempts:", error);
      res.status(500).json({ message: "Failed to fetch attempts" });
    }
  });

  app.post('/api/attempts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      
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
      const userId = req.user.claims.sub;
      const hasPurchased = await storage.hasUserPurchased(userId, examId);
      res.json({ hasAccess: hasPurchased });
    } catch (error) {
      console.error("Error checking access:", error);
      res.status(500).json({ message: "Failed to check access" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
