/**
 * DashboardShell — lazy-loaded wrapper for all authenticated/login routes.
 *
 * Everything in here (QueryClient, react-query, Radix providers, cmdk, supabase,
 * recharts, react-hook-form, zod, etc.) is in a separate async chunk that is
 * NEVER downloaded by marketing visitors who only visit "/".
 *
 * Loaded via:
 *   const DashboardShell = lazy(() => import("@/components/shared/dashboard-shell"))
 *
 * Routing: this component is mounted at both /login and /admin/* from App.tsx.
 * It renders its own route tree using useRoutes (react-router v7 compatible).
 */
import { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CommandPaletteProvider } from "@/hooks/use-command-palette";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { AppLayout } from "@/layouts/app-layout";
import { PageLoader } from "@/components/shared/page-loader";
import { ProtectedRoute } from "@/components/shared/protected-route";

// All dashboard/login pages — each in its own async chunk
const LoginPage = lazy(() =>
  import("@/pages/login").then((m) => ({ default: m.LoginPage }))
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage }))
);
const ClientsPage = lazy(() =>
  import("@/pages/clients").then((m) => ({ default: m.ClientsPage }))
);
const LeadsPage = lazy(() =>
  import("@/pages/leads").then((m) => ({ default: m.LeadsPage }))
);
const ProjectsPage = lazy(() =>
  import("@/pages/projects").then((m) => ({ default: m.ProjectsPage }))
);
const RevenuePage = lazy(() =>
  import("@/pages/revenue").then((m) => ({ default: m.RevenuePage }))
);
const ExpensesPage = lazy(() =>
  import("@/pages/expenses").then((m) => ({ default: m.ExpensesPage }))
);
const ProfitPage = lazy(() =>
  import("@/pages/profit").then((m) => ({ default: m.ProfitPage }))
);
const TasksPage = lazy(() =>
  import("@/pages/tasks").then((m) => ({ default: m.TasksPage }))
);
const CalendarPage = lazy(() =>
  import("@/pages/calendar").then((m) => ({ default: m.CalendarPage }))
);
const DocumentsPage = lazy(() =>
  import("@/pages/documents").then((m) => ({ default: m.DocumentsPage }))
);
const ReportsPage = lazy(() =>
  import("@/pages/reports").then((m) => ({ default: m.ReportsPage }))
);
const AnalyticsPage = lazy(() =>
  import("@/pages/analytics").then((m) => ({ default: m.AnalyticsPage }))
);

// Singleton QueryClient created once per dashboard chunk load (once per session)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
    },
  },
});

/**
 * Inner component that actually renders the route tree.
 * Wrapped by DashboardShell which provides all required contexts.
 */
function DashboardRoutes() {
  const element = useRoutes([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/admin",
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { index: true, element: <DashboardPage /> },
            { path: "clients", element: <ClientsPage /> },
            { path: "leads", element: <LeadsPage /> },
            { path: "projects", element: <ProjectsPage /> },
            { path: "revenue", element: <RevenuePage /> },
            { path: "expenses", element: <ExpensesPage /> },
            { path: "profit", element: <ProfitPage /> },
            { path: "tasks", element: <TasksPage /> },
            { path: "calendar", element: <CalendarPage /> },
            { path: "documents", element: <DocumentsPage /> },
            { path: "reports", element: <ReportsPage /> },
            { path: "analytics", element: <AnalyticsPage /> },
          ],
        },
      ],
    },
  ]);
  return element;
}

/**
 * All providers and routes needed for the authenticated dashboard experience.
 * This component is itself the lazy chunk boundary — everything it imports is in
 * the dashboard chunk, not the marketing chunk.
 */
export function DashboardShell() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ToastProvider>
          <CommandPaletteProvider>
            <SidebarProvider>
              <Suspense fallback={<PageLoader />}>
                <DashboardRoutes />
              </Suspense>
            </SidebarProvider>
          </CommandPaletteProvider>
        </ToastProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
