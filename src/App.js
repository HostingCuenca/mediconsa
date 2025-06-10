// App.js - Mediconsa 2025 - COMPLETO
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './utils/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Pages - Públicas ✅ IMPLEMENTADAS
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
// import CoursesPage from './pages/CoursesPage';        // ⏳ PENDIENTE
// import CourseDetail from './pages/CourseDetail';      // ⏳ PENDIENTE
// import NotFound from './pages/NotFound';              // ⏳ PENDIENTE

// Dashboard Estudiante ✅ IMPLEMENTANDO AHORA
import Dashboard from './dashboard/Dashboard';
import MyCourses from './dashboard/MyCourses';        // ⏳ PENDIENTE
// import MyProgress from './dashboard/MyProgress';      // ⏳ PENDIENTE
// import Simulacros from './dashboard/Simulacros';     // ⏳ PENDIENTE
// import Profile from './dashboard/Profile';           // ⏳ PENDIENTE

// Admin Panel ⏳ CREANDO AHORA - DESCOMENTA CUANDO ESTÉ LISTO
// import AdminDashboard from './admin/AdminDashboard';     // 🔧 CREANDO
import AdminCourses from './admin/AdminCourses';
import AdminDashboard from "./admin/AdminDashboard";         // 🔧 CREANDO
import AdminUsers from './admin/AdminUsers';             // 🔧 CREANDO
// import AdminPayments from './admin/AdminPayments';       // 🔧 CREANDO
// import AdminSimulacros from './admin/AdminSimulacros';   // 🔧 CREANDO

function App() {
    return (
        <Router>
            <ScrollToTop />
            <AuthProvider>
                <div className="min-h-screen bg-medico-light">
                    <Routes>

                        {/* ===== RUTAS PÚBLICAS ===== ✅ FUNCIONANDO */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage mode="login" />} />
                        <Route path="/registro" element={<LoginPage mode="registro" />} />

                        {/* ===== PÁGINAS PÚBLICAS PENDIENTES ===== */}
                        {/*
            <Route path="/cursos" element={<CoursesPage />} />
            <Route path="/curso/:slug" element={<CourseDetail />} />
            */}

                        {/* ===== DASHBOARD ESTUDIANTE ===== ✅ IMPLEMENTANDO */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        {/* ===== DASHBOARD ESTUDIANTE - MÓDULOS PENDIENTES ===== */}

            <Route path="/dashboard/cursos" element={
              <ProtectedRoute>
                <MyCourses />
              </ProtectedRoute>
            } />
 {/*
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

                        {/* ===== PANEL ADMINISTRACIÓN ===== 🔧 DESCOMENTA CUANDO ESTÉ LISTO */}

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
{/*
            <Route path="/admin/pagos" element={
              <ProtectedRoute requiredRole="admin">
                <AdminPayments />
              </ProtectedRoute>
            } />

            <Route path="/admin/simulacros" element={
              <ProtectedRoute requiredRole="admin">
                <AdminSimulacros />
              </ProtectedRoute>
            } />
            */}

                        {/* ===== 404 PAGE ===== */}
                        {/* <Route path="*" element={<NotFound />} /> */}

                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;

// =============================================
// 📋 ESTADO ACTUAL DEL PROYECTO
// =============================================

/*
✅ COMPLETADO:
- Autenticación completa (login/registro)
- ProtectedRoute con roles
- Layout separado (sitio web vs plataforma)
- Navbar/Footer diferenciados
- ScrollToTop automático
- Dashboard básico estudiante
- Configuración Supabase + RLS

🔧 CREANDO AHORA:
- AdminDashboard (resumen general)
- AdminCourses (CRUD cursos completo)
- AdminUsers (gestión usuarios)
- AdminPayments (aprobar pagos)
- AdminSimulacros (gestión simulacros)

⏳ PENDIENTE:
- Páginas públicas (CoursesPage, CourseDetail)
- Módulos dashboard estudiante
- Sistema de simulacros completo
- Subida de archivos/videos
- Sistema de notificaciones

📁 ESTRUCTURA ACTUAL:
src/
├── components/           ✅ Layout, Navbar, Footer, etc.
├── pages/               ✅ Landing, Login
├── dashboard/           ✅ Dashboard estudiante básico
├── admin/               🔧 CREANDO AHORA
├── services/            ✅ Supabase, Auth
└── utils/               ✅ AuthContext, helpers

🎯 PRÓXIMOS PASOS:
1. Crear panel admin completo
2. Probar con usuarios admin/estudiante
3. Implementar CRUD de cursos
4. Sistema de pagos manual
5. Gestión de simulacros

USUARIOS DE PRUEBA:
- admin@mediconsa.com / admin123med
- estudiante@mediconsa.com / estudiante123
*/