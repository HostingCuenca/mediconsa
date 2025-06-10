// App.js - Con auth completo
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './utils/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
// import CoursesPage from './pages/CoursesPage';
// import CourseDetail from './pages/CourseDetail';
// import NotFound from './pages/NotFound';

// Dashboard (comentados hasta crear)
// import Dashboard from './dashboard/Dashboard';
// import MyCourses from './dashboard/MyCourses';
// import MyProgress from './dashboard/MyProgress';
// import Simulacros from './dashboard/Simulacros';
// import Profile from './dashboard/Profile';

// Admin (comentados hasta crear)
// import AdminDashboard from './admin/Dashboard';
// import AdminCourses from './admin/Courses';
// import AdminUsers from './admin/Users';
// import AdminPayments from './admin/Payments';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-medico-light">
                    <Routes>
                        {/* Rutas Públicas */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage mode="login" />} />
                        <Route path="/registro" element={<LoginPage mode="registro" />} />

                        {/* Temporalmente comentadas */}
                        {/*
            <Route path="/cursos" element={<CoursesPage />} />
            <Route path="/curso/:slug" element={<CourseDetail />} />
            */}

                        {/* Dashboard Estudiante - Rutas Protegidas */}
                        {/*
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/cursos" element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/progreso" element={
              <ProtectedRoute>
                <MyProgress />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/simulacros" element={
              <ProtectedRoute>
                <Simulacros />
              </ProtectedRoute>
            } />

            <Route path="/dashboard/perfil" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            */}

                        {/* Admin - Rutas Protegidas */}
                        {/*
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="/admin/cursos" element={
              <ProtectedRoute requiredRole="admin">
                <AdminCourses />
              </ProtectedRoute>
            } />

            <Route path="/admin/usuarios" element={
              <ProtectedRoute requiredRole="admin">
                <AdminUsers />
              </ProtectedRoute>
            } />

            <Route path="/admin/pagos" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPayments />
              </ProtectedRoute>
            } />
            */}

                        {/* 404 */}
                        {/* <Route path="*" element={<NotFound />} /> */}
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;