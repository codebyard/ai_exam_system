# ExamPYQ - Previous Year Questions Platform

## Overview

ExamPYQ is a comprehensive exam preparation platform that provides authentic previous year questions for various competitive exams like JEE Main, NEET, GATE, and CAT. The application features exam simulation, performance analysis, AI-powered doubt clearing, and progress tracking to help students prepare effectively for their target exams.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing (lightweight React Router alternative)
- **TanStack Query** for server state management and API caching
- **Zustand** for client-side state management (exam sessions)
- **Tailwind CSS** with shadcn/ui components for consistent styling
- **Radix UI** primitives for accessible component foundations

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with structured error handling
- **Session-based authentication** using Express sessions
- **PostgreSQL** database with connection pooling
- **Drizzle ORM** for type-safe database operations

### Authentication System
- **Replit Auth** integration for user authentication
- OpenID Connect (OIDC) implementation
- Secure session management with PostgreSQL session store
- User profile management with social login capabilities

## Key Components

### Database Schema
- **Users**: Profile information from Replit Auth
- **Exams**: Competitive exam metadata (JEE, NEET, etc.)
- **Papers**: Individual question papers by year
- **Questions**: Question content with multiple choice options
- **Purchases**: User access tracking for premium content
- **Attempts**: Exam session results and analytics
- **Sessions**: Secure session storage for authentication

### Exam System
- **Real-time exam simulation** with timer functionality
- **Question palette** for navigation and status tracking
- **Multiple modes**: Exam mode, browse mode, and review mode
- **Progress tracking** with detailed analytics
- **Performance insights** and improvement suggestions

### AI Features
- **Doubt clearing chatbot** for instant question resolution
- **Contextual help** based on question content
- **Interactive message interface** with typing indicators

### Analytics Dashboard
- **Performance metrics** visualization using Recharts
- **Progress tracking** across multiple exam attempts
- **Subject-wise analysis** and weakness identification
- **Historical performance** trends and comparisons

## Data Flow

1. **Authentication Flow**:
   - User initiates login through Replit Auth
   - OIDC verification and token exchange
   - Session creation in PostgreSQL
   - User profile creation/update in database

2. **Exam Flow**:
   - User selects exam and paper
   - Access verification (free/premium content)
   - Question loading and session initialization
   - Real-time progress tracking during attempt
   - Results calculation and storage

3. **Analytics Flow**:
   - Attempt data aggregation from database
   - Performance metrics calculation
   - Visualization data preparation
   - Real-time dashboard updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection with Neon compatibility
- **drizzle-orm**: Type-safe database operations
- **connect-pg-simple**: PostgreSQL session store
- **openid-client**: Authentication provider integration
- **@tanstack/react-query**: Server state management

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **recharts**: Chart visualization library
- **wouter**: Lightweight routing

### Development Dependencies
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Frontend build tool and dev server

## Deployment Strategy

### Development Environment
- **Replit integration** with live reloading
- **PostgreSQL 16** database provisioning
- **Environment-based configuration** for different stages
- **Hot module replacement** for rapid development

### Production Build
- **Vite build** for optimized frontend assets
- **esbuild bundling** for server-side code
- **Static asset serving** with Express
- **Database migrations** using Drizzle Kit

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Secure session encryption key
- **REPLIT_DOMAINS**: Allowed domains for OIDC
- **ISSUER_URL**: Authentication provider endpoint

## Changelog

```
Changelog:
- June 18, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```