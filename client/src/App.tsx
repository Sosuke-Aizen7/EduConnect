import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Search from "@/pages/search";
import CourseDetails from "@/pages/course-details";
import Comparison from "@/pages/comparison";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/search" component={Search} />
          <Route path="/courses/:id" component={CourseDetails} />
          <Route path="/compare" component={Comparison} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/search" component={Search} />
          <Route path="/courses/:id" component={CourseDetails} />
          <Route path="/compare" component={Comparison} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
