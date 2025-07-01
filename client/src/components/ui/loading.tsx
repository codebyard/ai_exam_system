import { cn } from "@/lib/utils"
import { Loader2, Clock, BookOpen, Users, TrendingUp, Target } from "lucide-react"

// Basic Spinner
export function Spinner({ className, size = "default" }: { className?: string; size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  }
  
  return (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  )
}

// Page Loader
export function PageLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

// Content Loader
export function ContentLoader({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  )
}

// Card Loader
export function CardLoader({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-48 bg-muted rounded-lg"></div>
      <div className="space-y-2 mt-4">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  )
}

// Exam Card Loader
export function ExamCardLoader() {
  return (
    <div className="animate-pulse bg-card rounded-lg border p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-muted rounded-lg"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-8 bg-muted rounded"></div>
        <div className="h-8 bg-muted rounded"></div>
      </div>
    </div>
  )
}

// Question Loader
export function QuestionLoader() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-6 bg-muted rounded w-1/4"></div>
        <div className="h-4 bg-muted rounded w-full"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Dashboard Stats Loader
export function StatsLoader() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse bg-card rounded-lg border p-6 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-20"></div>
          </div>
          <div className="h-8 bg-muted rounded w-16"></div>
          <div className="h-3 bg-muted rounded w-24"></div>
        </div>
      ))}
    </div>
  )
}

// Table Loader
export function TableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 bg-muted rounded"></div>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded"></div>
      ))}
    </div>
  )
}

// Navigation Loader
export function NavigationLoader() {
  return (
    <div className="animate-pulse flex items-center space-x-6">
      <div className="h-8 bg-muted rounded w-24"></div>
      <div className="h-8 bg-muted rounded w-20"></div>
      <div className="h-8 bg-muted rounded w-16"></div>
      <div className="h-8 bg-muted rounded w-20"></div>
    </div>
  )
}

// Message Loader (for chat)
export function MessageLoader() {
  return (
    <div className="flex gap-3 max-w-[80%] mr-auto">
      <div className="w-8 h-8 bg-muted rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-4 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  )
}

// Progress Loader
export function ProgressLoader() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="flex justify-between text-sm">
        <div className="h-4 bg-muted rounded w-16"></div>
        <div className="h-4 bg-muted rounded w-12"></div>
      </div>
      <div className="h-2 bg-muted rounded-full"></div>
    </div>
  )
}

// Chart Loader
export function ChartLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-muted rounded w-1/3"></div>
      <div className="h-64 bg-muted rounded"></div>
      <div className="flex justify-center space-x-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-12"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton with custom width
export function Skeleton({ className, width }: { className?: string; width?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      style={width ? { width } : undefined}
    />
  )
}

// Pulse animation for buttons
export function ButtonLoader({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-5 w-5",
    lg: "h-6 w-6"
  }
  
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      <span>Loading...</span>
    </div>
  )
}

// Icon-based loaders for different contexts
export function IconLoader({ 
  icon: Icon, 
  message, 
  className 
}: { 
  icon: any; 
  message: string; 
  className?: string 
}) {
  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <Icon className="h-12 w-12 text-muted-foreground animate-pulse" />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  )
}

// Contextual loaders
export const ExamLoader = () => <IconLoader icon={BookOpen} message="Loading exam..." />
export const UserLoader = () => <IconLoader icon={Users} message="Loading user data..." />
export const AnalyticsLoader = () => <IconLoader icon={TrendingUp} message="Loading analytics..." />
export const TimerLoader = () => <IconLoader icon={Clock} message="Preparing timer..." />
export const TargetLoader = () => <IconLoader icon={Target} message="Loading targets..." /> 