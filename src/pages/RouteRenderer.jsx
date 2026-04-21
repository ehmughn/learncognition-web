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

export function RouteRenderer() {
  const { route } = useApp();

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
          <LazyTeacherHomePage />
        </PageLoader>
      );
    case "dashboard":
      return (
        <PageLoader>
          <LazyDashboardPage />
        </PageLoader>
      );
    case "notifications":
      return (
        <PageLoader>
          <LazyNotificationsPage />
        </PageLoader>
      );
    case "create":
      return (
        <PageLoader>
          <LazyCreateModulesPage />
        </PageLoader>
      );
    case "modules":
      return (
        <PageLoader>
          <LazyModulesListPage />
        </PageLoader>
      );
    case "profile":
      return (
        <PageLoader>
          <LazyProfilePage />
        </PageLoader>
      );
    case "settings":
      return (
        <PageLoader>
          <LazySettingsPage />
        </PageLoader>
      );
    case "module":
      return (
        <PageLoader>
          <LazyModuleDetailPage moduleId={route.moduleId} />
        </PageLoader>
      );
    case "module-share":
      return (
        <PageLoader>
          <LazyModuleSharePage moduleId={route.moduleId} />
        </PageLoader>
      );
    case "module-edit":
      return (
        <PageLoader>
          <LazyModuleEditPage moduleId={route.moduleId} />
        </PageLoader>
      );
    case "module-students":
      return (
        <PageLoader>
          <LazyModuleStudentsPage moduleId={route.moduleId} />
        </PageLoader>
      );
    case "student":
      return (
        <PageLoader>
          <LazyStudentProfilePage studentId={route.studentId} />
        </PageLoader>
      );
    case "student-records":
      return (
        <PageLoader>
          <LazyStudentRecordsPage studentId={route.studentId} />
        </PageLoader>
      );
    default:
      return <NotFoundPage />;
  }
}
