import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useProjectStore } from './store/projectStore';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage, RegisterPage } from './pages/auth/AuthPages';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectPage } from './pages/ProjectPage';
import { MyTasksPage } from './pages/MyTasksPage';
import './components/layout/layout.css';
import './pages/pages.css';

function AppLayout() {
  const { projects, fetchProjects } = useProjectStore();
  useEffect(() => { fetchProjects(); }, []);

  return (
    <div className="app-layout">
      <Sidebar projects={projects} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function ProtectedRoute() {
  const { user, loading } = useAuthStore();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicRoute() {
  const { user, loading } = useAuthStore();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><div className="spinner" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/project/:id" element={<ProjectPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
