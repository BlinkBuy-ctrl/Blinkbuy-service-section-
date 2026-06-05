import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthContext, useAuthState } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useScrollToTop } from "@/hooks/useScrollToTop";

const ServicesPage      = lazy(() => import("@/pages/services"));
const ServiceDetailPage = lazy(() => import("@/pages/service-detail"));
const PostServicePage   = lazy(() => import("@/pages/post-service"));
const LoginPage         = lazy(() => import("@/pages/login"));
const RegisterPage      = lazy(() => import("@/pages/register"));
const DashboardPage     = lazy(() => import("@/pages/dashboard"));
const NotFound          = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 1,
      retryDelay: 2000,
      refetchOnWindowFocus: false,
      networkMode: "offlineFirst",
    },
    mutations: { retry: 0 },
  },
});

const BARE_ROUTES = ["/login", "/register"];

function AuthLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center animate-pulse">
          <span className="text-white font-black text-base">B</span>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center animate-pulse">
          <span className="text-white font-black text-sm">B</span>
        </div>
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function RouterContent() {
  const [loc] = useLocation();
  const isBare = BARE_ROUTES.includes(loc);
  useScrollToTop();

  const routes = (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/"                component={ServicesPage} />
        <Route path="/services"        component={ServicesPage} />
        <Route path="/services/:id"    component={ServiceDetailPage} />
        <Route path="/post-service"    component={PostServicePage} />
        <Route path="/login"           component={LoginPage} />
        <Route path="/register"        component={RegisterPage} />
        <Route path="/dashboard"       component={DashboardPage} />
        <Route                         component={NotFound} />
      </Switch>
    </Suspense>
  );

  if (isBare) return routes;
  return <Layout>{routes}</Layout>;
}

function AppInner() {
  const auth = useAuthState();
  if (auth.isLoading) return <AuthLoader />;
  return (
    <AuthContext.Provider value={auth}>
      <WouterRouter base="">
        <RouterContent />
      </WouterRouter>
      <Toaster />
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppInner />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
