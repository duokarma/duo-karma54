/**
 * DashboardShell — lazy-loaded wrapper for all authenticated/login routes.
 *
 * Everything in here is in a separate async chunk that is NEVER downloaded
 * by marketing visitors who only visit "/".
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

// ── Page chunks ───────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import("@/pages/login").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("@/pages/dashboard").then((m) => ({ default: m.DashboardPage })));
const PipelinePage = lazy(() => import("@/pages/pipeline").then((m) => ({ default: m.PipelinePage })));
const FinancePage = lazy(() => import("@/pages/finance").then((m) => ({ default: m.FinancePage })));
const ProjectsPage = lazy(() => import("@/pages/projects").then((m) => ({ default: m.ProjectsPage })));
const TasksPage = lazy(() => import("@/pages/tasks").then((m) => ({ default: m.TasksPage })));
const CalendarPage = lazy(() => import("@/pages/calendar").then((m) => ({ default: m.CalendarPage })));
const DocumentsPage = lazy(() => import("@/pages/documents").then((m) => ({ default: m.DocumentsPage })));
const NotesPage = lazy(() => import("@/pages/notes").then((m) => ({ default: m.NotesPage })));
const SchemaBuilderPage = lazy(() => import("@/pages/schema-builder").then((m) => ({ default: m.SchemaBuilderPage })));
const DynamicCollectionPage = lazy(() => import("@/pages/dynamic-collection").then((m) => ({ default: m.DynamicCollectionPage })));
const NotFoundPage = lazy(() => import("@/pages/not-found").then((m) => ({ default: m.NotFoundPage })));

// Singleton QueryClient (once per session)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 }, // 5 min
  },
});

function DashboardRoutes() {
  const element = useRoutes([
    { path: "/login", element: <LoginPage /> },
    {
      path: "/admin",
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { index: true,                          element: <DashboardPage /> },
            { path: "pipeline",                     element: <PipelinePage /> },
            { path: "finance",                      element: <FinancePage /> },
            { path: "projects",                     element: <ProjectsPage /> },
            { path: "tasks",                        element: <TasksPage /> },
            { path: "calendar",                     element: <CalendarPage /> },
            { path: "documents",                    element: <DocumentsPage /> },
            { path: "notes",                        element: <NotesPage /> },
            { path: "schema-builder",               element: <SchemaBuilderPage /> },
            { path: "custom/:schemaSlug",            element: <DynamicCollectionPage /> },
            // Legacy redirects so old links don't 404
            { path: "clients",                      element: <PipelinePage /> },
            { path: "leads",                        element: <PipelinePage /> },
            { path: "revenue",                      element: <FinancePage /> },
            { path: "expenses",                     element: <FinancePage /> },
            { path: "profit",                       element: <FinancePage /> },
          ],
        },
      ],
    },
    { path: "*", element: <NotFoundPage /> },
  ]);
  return element;
}

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
