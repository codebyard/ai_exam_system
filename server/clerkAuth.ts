import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

// Replace this with your actual secret in production (use env vars!)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Custom middleware to protect routes using JWT
export const isAuthenticated: RequestHandler = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach user info to request if needed
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}; 