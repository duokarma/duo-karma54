import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy, useEffect } from "react";
import { ThemeProvider } from "@/hooks/use-theme";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { CommandPaletteProvider } from "@/hooks/use-command-palette";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/layouts/app-layout";
import { PageLoader } from "@/components/shared/page-loader";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/shared/protected-route";

const LoginPage = lazy(() => import("@/pages/login").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage })));
const ClientsPage = lazy(() => import("@/pages/clients").then((m) => ({ default: m.ClientsPage })));
const LeadsPage = lazy(() => import("@/pages/leads").then((m) => ({ default: m.LeadsPage })));
const ProjectsPage = lazy(() => import("@/pages/projects").then((m) => ({ default: m.ProjectsPage })));
const RevenuePage = lazy(() => import("@/pages/revenue").then((m) => ({ default: m.RevenuePage })));
const ExpensesPage = lazy(() => import("@/pages/expenses").then((m) => ({ default: m.ExpensesPage })));
const ProfitPage = lazy(() => import("@/pages/profit").then((m) => ({ default: m.ProfitPage })));
const InvoicesPage = lazy(() => import("@/pages/invoices").then((m) => ({ default: m.InvoicesPage })));
const TasksPage = lazy(() => import("@/pages/tasks").then((m) => ({ default: m.TasksPage })));
const CalendarPage = lazy(() => import("@/pages/calendar").then((m) => ({ default: m.CalendarPage })));
const DocumentsPage = lazy(() => import("@/pages/documents").then((m) => ({ default: m.DocumentsPage })));
const ReportsPage = lazy(() => import("@/pages/reports").then((m) => ({ default: m.ReportsPage })));
const AnalyticsPage = lazy(() => import("@/pages/analytics").then((m) => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import("@/pages/settings").then((m) => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import("@/pages/not-found").then((m) => ({ default: m.NotFoundPage })));

// The crystal scene (three.js + drei) is used on Login, Dashboard, and 404 — it's the single
// heaviest chunk in the app. Prefetching it during idle time avoids a visible skeleton on
// whichever of those three routes the user lands on first, without blocking initial paint.
function usePrefetchCrystalScene() {
  useEffect(() => {
    const prefetch = () => {
      import("@/components/three/crystal-scene");
    };
    if ("requestIdleCallback" in window) {
      const id = (window as any).requestIdleCallback(prefetch, { timeout: 2000 });
      return () => (window as any).cancelIdleCallback?.(id);
    }
    const timer = setTimeout(prefetch, 300);
    return () => clearTimeout(timer);
  }, []);
}

const queryClient = new QueryClient();

function App() {
  usePrefetchCrystalScene();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <TooltipProvider>
            <ToastProvider>
              <BrowserRouter>
                <CommandPaletteProvider>
                  <SidebarProvider>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route element={<ProtectedRoute />}>
                          <Route element={<AppLayout />}>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/clients" element={<ClientsPage />} />
                      <Route path="/leads" element={<LeadsPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/revenue" element={<RevenuePage />} />
                      <Route path="/expenses" element={<ExpensesPage />} />
                      <Route path="/profit" element={<ProfitPage />} />
                      <Route path="/invoices" element={<InvoicesPage />} />
                      <Route path="/tasks" element={<TasksPage />} />
                      <Route path="/calendar" element={<CalendarPage />} />
                      <Route path="/documents" element={<DocumentsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/analytics" element={<AnalyticsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                          </Route>
                        </Route>
                        <Route path="*" element={<NotFoundPage />} />
                      </Routes>
                    </Suspense>
                  </SidebarProvider>
                </CommandPaletteProvider>
              </BrowserRouter>
            </ToastProvider>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
