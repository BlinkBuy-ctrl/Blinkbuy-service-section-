import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from "@/components/ErrorBoundary";

const ServicesPage      = lazy(() => import("@/pages/services"));
const ServiceDetailPage = lazy(() => import("@/pages/service-detail"));
const NotFound          = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
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

function App() {
  return (
    <ErrorBoundary>
      <WouterRouter base="">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/"             component={ServicesPage} />
            <Route path="/services"     component={ServicesPage} />
            <Route path="/services/:id" component={ServiceDetailPage} />
            <Route                      component={NotFound} />
          </Switch>
        </Suspense>
      </WouterRouter>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
