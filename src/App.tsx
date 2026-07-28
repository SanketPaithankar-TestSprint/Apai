import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Loader2 } from "lucide-react";

// Lazy-loaded pages (only downloaded when user navigates to them)
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const AnalyticsPage = lazy(() => import("@/pages/dashboard/AnalyticsPage/AnalyticsPage"));
const BlogsPage = lazy(() => import("@/pages/dashboard/blogs/BlogsPage"));
const BlogNewPage = lazy(() => import("@/pages/dashboard/blogs/BlogNewPage"));
const BlogEditPage = lazy(() => import("@/pages/dashboard/blogs/BlogEditPage"));
const BlogViewPage = lazy(() => import("@/pages/dashboard/blogs/BlogViewPage"));
const UsersPage = lazy(() => import("@/pages/dashboard/UsersPage"));
const UserAnalysisPage = lazy(() => import("@/pages/dashboard/UserAnalysisPage"));
const SupportPage = lazy(() => import("@/pages/dashboard/support/SupportPage"));
const AuditLogsPage = lazy(() => import("@/pages/dashboard/AuditLogsPage"));
const ArticleCreatePage = lazy(() => import("@/pages/dashboard/support/ArticleCreatePage"));
const ArticleEditPage = lazy(() => import("@/pages/dashboard/support/ArticleEditPage"));
const ArticlePreviewPage = lazy(() => import("@/pages/dashboard/support/ArticlePreviewPage"));

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<AnalyticsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs/new" element={<BlogNewPage />} />
          <Route path="/blogs/edit" element={<BlogEditPage />} />
          <Route path="/blogs/view" element={<BlogViewPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/user-analysis/:userId" element={<UserAnalysisPage />} />
          <Route path="/users/:userId/analysis" element={<UserAnalysisPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/articles/create" element={<ArticleCreatePage />} />
          <Route path="/support/articles/preview/:id" element={<ArticlePreviewPage />} />
          <Route path="/support/articles/edit/:id" element={<ArticleEditPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

