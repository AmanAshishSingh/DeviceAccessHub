import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import { useAuthStore } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import ErrorModal from "@/components/ErrorModal";

function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  // Check auth status on app load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/" component={isAuthenticated ? Dashboard : LoginPage} />
        <Route component={NotFound} />
      </Switch>
      <Toaster />
      <ErrorModal />
    </>
  );
}

export default App;
