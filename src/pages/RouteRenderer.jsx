import { useApp } from "../context/AppContext.jsx";
import { Suspense, lazy } from "react";
import { LoadingScreen } from "../components/LoadingScreen.jsx";

// Migrated pages
import GuestLandingPage from "./GuestLandingPage.jsx";
import StartGuidePage from "./StartGuidePage.jsx";
import NotFoundPage from "./NotFoundPage.jsx";

// Lazy-load pages to reduce bundle size
const LazyLoginPage = lazy(() => import("./auth/LoginPage.jsx"));
const LazyRegisterPage = lazy(() => import("./auth/RegisterPage.jsx"));
const LazyVerifyPage = lazy(() => import("./auth/VerifyPage.jsx"));
const LazyForgotPasswordPage = lazy(
  () => import("./auth/ForgotPasswordPage.jsx"),
);
const LazyResetPasswordPage = lazy(
  () => import("./auth/ResetPasswordPage.jsx"),
);
const LazyTeacherHomePage = lazy(() => import("./TeacherHomePage.jsx"));
const LazyDashboardPage = lazy(() => import("./DashboardPage.jsx"));
const LazyNotificationsPage = lazy(() => import("./NotificationsPage.jsx"));
const LazyCreateModulesPage = lazy(() => import("./CreateModulesPage.jsx"));
const LazyModulesListPage = lazy(() => import("./ModulesListPage.jsx"));
const LazyProfilePage = lazy(() => import("./ProfilePage.jsx"));
const LazySettingsPage = lazy(() => import("./SettingsPage.jsx"));
const LazyModuleDetailPage = lazy(
  () => import("./modules/ModuleDetailPage.jsx"),
);
const LazyModuleSharePage = lazy(() => import("./modules/ModuleSharePage.jsx"));
const LazyModuleEditPage = lazy(() => import("./modules/ModuleEditPage.jsx"));
const LazyModuleStudentsPage = lazy(
  () => import("./modules/ModuleStudentsPage.jsx"),
);
const LazyStudentProfilePage = lazy(
  () => import("./students/StudentProfilePage.jsx"),
);
const LazyStudentRecordsPage = lazy(
  () => import("./students/StudentRecordsPage.jsx"),
);

function PageLoader({ children }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
}

function ProtectedRoute({ children }) {
  const { session, navigate } = useApp();

  if (!session.authenticated) {
    navigate("/login", { replace: true });
    return <LoadingScreen />;
  }

  return children;
}

export function RouteRenderer() {
  const { route, workspaceLive, workspaceLoading } = useApp();

  switch (route.kind) {
    case "guest-landing":
      return <GuestLandingPage />;
    case "login":
      return (
        <PageLoader>
          <LazyLoginPage />
        </PageLoader>
      );
    case "register":
      return (
        <PageLoader>
          <LazyRegisterPage />
        </PageLoader>
      );
    case "verify":
      return (
        <PageLoader>
          <LazyVerifyPage />
        </PageLoader>
      );
    case "forgot-password":
      return (
        <PageLoader>
          <LazyForgotPasswordPage />
        </PageLoader>
      );
    case "reset-password":
      return (
        <PageLoader>
          <LazyResetPasswordPage />
        </PageLoader>
      );
    case "start":
      return <StartGuidePage />;
    case "teacher-home":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyTeacherHomePage />
          </ProtectedRoute>
        </PageLoader>
      );
    case "dashboard":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyDashboardPage />
          </ProtectedRoute>
        </PageLoader>
      );
    case "notifications":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyNotificationsPage />
          </ProtectedRoute>
        </PageLoader>
      );
    case "create":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyCreateModulesPage />
          </ProtectedRoute>
        </PageLoader>
      );
    case "modules":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyModulesListPage />
          </ProtectedRoute>
        </PageLoader>
      );
    case "profile":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyProfilePage />
          </ProtectedRoute>
        </PageLoader>
      );
    case "settings":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazySettingsPage />
          </ProtectedRoute>
        </PageLoader>
      );
    case "module":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyModuleDetailPage moduleId={route.moduleId} />
          </ProtectedRoute>
        </PageLoader>
      );
    case "module-share":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyModuleSharePage
              key={`${route.moduleId}-${workspaceLoading ? "loading" : "ready"}`}
              moduleId={route.moduleId}
            />
          </ProtectedRoute>
        </PageLoader>
      );
    case "module-edit":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyModuleEditPage
              key={`${route.moduleId}-${workspaceLoading ? "loading" : workspaceLive ? "live" : "fallback"}`}
              moduleId={route.moduleId}
            />
          </ProtectedRoute>
        </PageLoader>
      );
    case "module-students":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyModuleStudentsPage moduleId={route.moduleId} />
          </ProtectedRoute>
        </PageLoader>
      );
    case "student":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyStudentProfilePage studentId={route.studentId} />
          </ProtectedRoute>
        </PageLoader>
      );
    case "student-records":
      return (
        <PageLoader>
          <ProtectedRoute>
            <LazyStudentRecordsPage studentId={route.studentId} />
          </ProtectedRoute>
        </PageLoader>
      );
    default:
      return <NotFoundPage />;
  }
}
