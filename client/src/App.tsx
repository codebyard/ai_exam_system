import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import ExamDetails from "@/pages/exam-details";
import ExamSimulation from "@/pages/exam-simulation";
import Analysis from "@/pages/analysis";
import DoubtClearing from "@/pages/doubt-clearing";
import ReviewAttempt from "@/pages/review-attempt";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import BrowsePaper from "@/pages/browse-paper";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/exams/:examId" component={ExamDetails} />
          <Route path="/exam-simulation/:paperId" component={ExamSimulation} />
          <Route path="/analysis" component={Analysis} />
          <Route path="/doubt-clearing" component={DoubtClearing} />
          <Route path="/review/:attemptId" component={ReviewAttempt} />
          <Route path="/browse-paper/:paperId" component={BrowsePaper} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LoadingProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </LoadingProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
