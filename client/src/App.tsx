import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppContextProvider } from "@/context/AppContext";
import TableAwareRouter from "@/components/TableAwareRouter";
import Staff from "@/pages/Staff";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={TableAwareRouter} />
      <Route path="/staff" component={Staff} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContextProvider>
          <Toaster />
          <Router />
        </AppContextProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
