// // // // // App.js - Mediconsa 2025 - COMPLETO
// // // // import React from 'react';
// // // // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // // //
// // // // // Context Providers
// // // // import { AuthProvider } from './utils/AuthContext';
// // // //
// // // // // Components
// // // // import ProtectedRoute from './components/ProtectedRoute';
// // // // import ScrollToTop from './components/ScrollToTop';
// // // //
// // // // // Pages - Públicas ✅ IMPLEMENTADAS
// // // // import LandingPage from './pages/LandingPage';
// // // // import LoginPage1 from './pages/LoginPage1';
// // // // // import CoursesPage from './pages/CoursesPage';        // ⏳ PENDIENTE
// // // // // import CourseDetail from './pages/CourseDetail';      // ⏳ PENDIENTE
// // // // // import NotFound from './pages/NotFound';              // ⏳ PENDIENTE
// // // //
// // // // // Dashboard Estudiante ✅ IMPLEMENTANDO AHORA
// // // // import Dashboard from './dashboard/Dashboard';
// // // // import MyCourses from './dashboard/MyCourses';        // ⏳ PENDIENTE
// // // // // import MyProgress from './dashboard/MyProgress';      // ⏳ PENDIENTE
// // // // // import Simulacros from './dashboard/Simulacros';     // ⏳ PENDIENTE
// // // // // import Profile from './dashboard/Profile';           // ⏳ PENDIENTE
// // // //
// // // // // Admin Panel ⏳ CREANDO AHORA - DESCOMENTA CUANDO ESTÉ LISTO
// // // // // import AdminDashboard from './admin/AdminDashboard';     // 🔧 CREANDO
// // // // import AdminCourses from './admin/AdminCourses';
// // // // import AdminDashboard from "./admin/AdminDashboard";         // 🔧 CREANDO
// // // // import AdminUsers from './admin/AdminUsers';             // 🔧 CREANDO
// // // // // import AdminPayments from './admin/AdminPayments';       // 🔧 CREANDO
// // // // // import AdminSimulacros from './admin/AdminSimulacros';   // 🔧 CREANDO
// // // //
// // // // function App() {
// // // //     return (
// // // //         <Router>
// // // //             <ScrollToTop />
// // // //             <AuthProvider>
// // // //                 <div className="min-h-screen bg-medico-light">
// // // //                     <Routes>
// // // //
// // // //                         {/* ===== RUTAS PÚBLICAS ===== ✅ FUNCIONANDO */}
// // // //                         <Route path="/" element={<LandingPage />} />
// // // //                         <Route path="/login" element={<LoginPage1 mode="login" />} />
// // // //                         <Route path="/registro" element={<LoginPage1 mode="registro" />} />
// // // //
// // // //                         {/* ===== PÁGINAS PÚBLICAS PENDIENTES ===== */}
// // // //                         {/*
// // // //             <Route path="/cursos" element={<CoursesPage />} />
// // // //             <Route path="/curso/:slug" element={<CourseDetail />} />
// // // //             */}
// // // //
// // // //                         {/* ===== DASHBOARD ESTUDIANTE ===== ✅ IMPLEMENTANDO */}
// // // //                         <Route path="/dashboard" element={
// // // //                             <ProtectedRoute>
// // // //                                 <Dashboard />
// // // //                             </ProtectedRoute>
// // // //                         } />
// // // //
// // // //                         {/* ===== DASHBOARD ESTUDIANTE - MÓDULOS PENDIENTES ===== */}
// // // //
// // // //             <Route path="/dashboard/cursos" element={
// // // //               <ProtectedRoute>
// // // //                 <MyCourses />
// // // //               </ProtectedRoute>
// // // //             } />
// // // //  {/*
// // // //             <Route path="/dashboard/progreso" element={
// // // //               <ProtectedRoute>
// // // //                 <MyProgress />
// // // //               </ProtectedRoute>
// // // //             } />
// // // //
// // // //             <Route path="/dashboard/simulacros" element={
// // // //               <ProtectedRoute>
// // // //                 <Simulacros />
// // // //               </ProtectedRoute>
// // // //             } />
// // // //
// // // //             <Route path="/dashboard/perfil" element={
// // // //               <ProtectedRoute>
// // // //                 <Profile />
// // // //               </ProtectedRoute>
// // // //             } />
// // // //             */}
// // // //
// // // //                         {/* ===== PANEL ADMINISTRACIÓN ===== 🔧 DESCOMENTA CUANDO ESTÉ LISTO */}
// // // //
// // // //             <Route path="/admin" element={
// // // //               <ProtectedRoute requiredRole="admin">
// // // //                 <AdminDashboard />
// // // //               </ProtectedRoute>
// // // //             } />
// // // //
// // // //              <Route path="/admin/cursos" element={
// // // //                <ProtectedRoute requiredRole="admin">
// // // //                  <AdminCourses />
// // // //                </ProtectedRoute>
// // // //             } />
// // // //
// // // //             <Route path="/admin/usuarios" element={
// // // //               <ProtectedRoute requiredRole="admin">
// // // //                 <AdminUsers />
// // // //               </ProtectedRoute>
// // // //             } />
// // // // {/*
// // // //             <Route path="/admin/pagos" element={
// // // //               <ProtectedRoute requiredRole="admin">
// // // //                 <AdminPayments />
// // // //               </ProtectedRoute>
// // // //             } />
// // // //
// // // //             <Route path="/admin/simulacros" element={
// // // //               <ProtectedRoute requiredRole="admin">
// // // //                 <AdminSimulacros />
// // // //               </ProtectedRoute>
// // // //             } />
// // // //             */}
// // // //
// // // //                         {/* ===== 404 PAGE ===== */}
// // // //                         {/* <Route path="*" element={<NotFound />} /> */}
// // // //
// // // //                     </Routes>
// // // //                 </div>
// // // //             </AuthProvider>
// // // //         </Router>
// // // //     );
// // // // }
// // // //
// // // // export default App;
// // // //
// // // // // =============================================
// // // // // 📋 ESTADO ACTUAL DEL PROYECTO
// // // // // =============================================
// // // //
// // // // /*
// // // // ✅ COMPLETADO:
// // // // - Autenticación completa (login/registro)
// // // // - ProtectedRoute con roles
// // // // - Layout separado (sitio web vs plataforma)
// // // // - Navbar/Footer diferenciados
// // // // - ScrollToTop automático
// // // // - Dashboard básico estudiante
// // // // - Configuración Supabase + RLS
// // // //
// // // // 🔧 CREANDO AHORA:
// // // // - AdminDashboard (resumen general)
// // // // - AdminCourses (CRUD cursos completo)
// // // // - AdminUsers (gestión usuarios)
// // // // - AdminPayments (aprobar pagos)
// // // // - AdminSimulacros (gestión simulacros)
// // // //
// // // // ⏳ PENDIENTE:
// // // // - Páginas públicas (CoursesPage, CourseDetail)
// // // // - Módulos dashboard estudiante
// // // // - Sistema de simulacros completo
// // // // - Subida de archivos/videos
// // // // - Sistema de notificaciones
// // // //
// // // // 📁 ESTRUCTURA ACTUAL:
// // // // src/
// // // // ├── components/           ✅ Layout, Navbar, Footer, etc.
// // // // ├── pages/               ✅ Landing, Login
// // // // ├── dashboard/           ✅ Dashboard estudiante básico
// // // // ├── admin/               🔧 CREANDO AHORA
// // // // ├── services/            ✅ Supabase, Auth
// // // // └── utils/               ✅ AuthContext, helpers
// // // //
// // // // 🎯 PRÓXIMOS PASOS:
// // // // 1. Crear panel admin completo
// // // // 2. Probar con usuarios admin/estudiante
// // // // 3. Implementar CRUD de cursos
// // // // 4. Sistema de pagos manual
// // // // 5. Gestión de simulacros
// // // //
// // // // USUARIOS DE PRUEBA:
// // // // - admin@mediconsa.com / admin123med
// // // // - estudiante@mediconsa.com / estudiante123
// // // // */
// // // //
// // // //
// // // //
// // //
// // //
// // //
// // // // App.js - Mediconsa 2025 - COMPLETO REFACTORIZADO
// // // import React from 'react';
// // // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// // //
// // // // Context Providers
// // // import { AuthProvider } from './utils/AuthContext';
// // //
// // // // Components
// // // import ProtectedRoute from './components/ProtectedRoute';
// // // import ScrollToTop from './components/ScrollToTop';
// // // import ConnectionTest from './components/ConnectionTest';
// // //
// // // // Pages - Públicas ✅ IMPLEMENTADAS
// // // import LandingPage from './pages/LandingPage';
// // // import LoginPage1 from './pages/LoginPage1';
// // // import CoursesPage from './pages/CoursesPage';
// // // import CourseDetail from './pages/CourseDetail';
// // // import NotFound from './pages/NotFound';
// // //
// // // // Dashboard Estudiante ✅ IMPLEMENTADO
// // // import Dashboard from './dashboard/Dashboard';
// // // import MyCourses from './dashboard/MyCourses';
// // // // import MyProgress from './dashboard/MyProgress';
// // // // import Simulacros from './dashboard/Simulacros';
// // // // import Profile from './dashboard/Profile';
// // //
// // // // Admin Panel ✅ IMPLEMENTADO COMPLETO
// // // import AdminDashboard from './admin/AdminDashboard';
// // // import AdminCourses from './admin/AdminCourses';
// // // import AdminUsers from './admin/AdminUsers';
// // // // import AdminPayments from './admin/AdminPayments';
// // // // import AdminSimulacros from './admin/AdminSimulacros';
// // // // import AdminReports from './admin/AdminReports';
// // // // import CourseEditor from './admin/CourseEditor';
// // // // import SimulacroEditor from './admin/SimulacroEditor';
// // //
// // // function App() {
// // //     return (
// // //         <Router>
// // //             <ScrollToTop />
// // //             <AuthProvider>
// // //                 <div className="min-h-screen bg-medico-light">
// // //                     <Routes>
// // //
// // //                         {/* ===== RUTAS PÚBLICAS ===== */}
// // //                         <Route path="/" element={<LandingPage />} />
// // //                         <Route path="/login" element={<LoginPage1 mode="login" />} />
// // //                         <Route path="/registro" element={<LoginPage1 mode="registro" />} />
// // //                         <Route path="/cursos" element={<CoursesPage />} />
// // //                         <Route path="/curso/:id" element={<CourseDetail />} />
// // //
// // //                         {/* ===== DASHBOARD ESTUDIANTE ===== */}
// // //                         <Route path="/dashboard" element={
// // //                             <ProtectedRoute>
// // //                                 <Dashboard />
// // //                             </ProtectedRoute>
// // //                         } />
// // //
// // //                         <Route path="/mis-cursos" element={
// // //                             <ProtectedRoute>
// // //                                 <MyCourses />
// // //                             </ProtectedRoute>
// // //                         } />
// // //
// // //                         {/*<Route path="/mi-progreso" element={*/}
// // //                         {/*    <ProtectedRoute>*/}
// // //                         {/*        <MyProgress />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/*<Route path="/simulacros" element={*/}
// // //                         {/*    <ProtectedRoute>*/}
// // //                         {/*        <Simulacros />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/*<Route path="/perfil" element={*/}
// // //                         {/*    <ProtectedRoute>*/}
// // //                         {/*        <Profile />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/* ===== PANEL ADMINISTRACIÓN ===== */}
// // //                         <Route path="/admin" element={
// // //                             <ProtectedRoute requiredRole="admin">
// // //                                 <AdminDashboard />
// // //                             </ProtectedRoute>
// // //                         } />
// // //
// // //                         <Route path="/admin/cursos" element={
// // //                             <ProtectedRoute requiredRole="admin">
// // //                                 <AdminCourses />
// // //                             </ProtectedRoute>
// // //                         } />
// // //
// // //                         {/*<Route path="/admin/curso/crear" element={*/}
// // //                         {/*    <ProtectedRoute requiredRole="admin">*/}
// // //                         {/*        <CourseEditor />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/*<Route path="/admin/curso/:id/editar" element={*/}
// // //                         {/*    <ProtectedRoute requiredRole="admin">*/}
// // //                         {/*        <CourseEditor />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         <Route path="/admin/usuarios" element={
// // //                             <ProtectedRoute requiredRole="admin">
// // //                                 <AdminUsers />
// // //                             </ProtectedRoute>
// // //                         } />
// // //
// // //                         {/*<Route path="/admin/pagos" element={*/}
// // //                         {/*    <ProtectedRoute requiredRole="admin">*/}
// // //                         {/*        <AdminPayments />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/*<Route path="/admin/simulacros" element={*/}
// // //                         {/*    <ProtectedRoute requiredRole="admin">*/}
// // //                         {/*        <AdminSimulacros />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/*<Route path="/admin/simulacro/crear" element={*/}
// // //                         {/*    <ProtectedRoute requiredRole="admin">*/}
// // //                         {/*        <SimulacroEditor />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/*<Route path="/admin/simulacro/:id/editar" element={*/}
// // //                         {/*    <ProtectedRoute requiredRole="admin">*/}
// // //                         {/*        <SimulacroEditor />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/*<Route path="/admin/reportes" element={*/}
// // //                         {/*    <ProtectedRoute requiredRole="admin">*/}
// // //                         {/*        <AdminReports />*/}
// // //                         {/*    </ProtectedRoute>*/}
// // //                         {/*} />*/}
// // //
// // //                         {/* ===== 404 PAGE ===== */}
// // //                         <Route path="*" element={<NotFound />} />
// // //
// // //                     </Routes>
// // //
// // //                     {/* Connection Test solo en desarrollo */}
// // //                     {process.env.NODE_ENV === 'development' && <ConnectionTest />}
// // //                 </div>
// // //             </AuthProvider>
// // //         </Router>
// // //     );
// // // }
// // //
// // // export default App;
// //
// //
// // // src/App.jsx - REFACTORIZADO SIMPLE
// // import React from 'react'
// // import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// // import { AuthProvider } from './utils/AuthContext'
// // import ProtectedRoute from './utils/ProtectedRoute'
// //
// // // Public Pages
// // import LandingPage from './public/LandingPage'
// // import LoginPage from './public/LoginPage'
// // import CoursesPage from './public/CoursesPage'
// // import CourseDetail from './public/CourseDetail'
// // import NotFound from './public/NotFound'
// //
// // // Student Panel
// // import StudentDashboard from './panel/Dashboard'
// // import MyCourses from './panel/MyCourses'
// // import MyProgress from './panel/MyProgress'
// // import Simulacros from './panel/Simulacros'
// // import Profile from './panel/Profile'
// //
// // // Admin Panel
// // import AdminDashboard from './adminpanel/Dashboard'
// // import AdminCourses from './adminpanel/Courses'
// // import AdminUsers from './adminpanel/Users'
// // import AdminPayments from './adminpanel/Payments'
// // import AdminSimulacros from './adminpanel/Simulacros'
// // import AdminReports from './adminpanel/Reports'
// // import AdminApiDocs from './adminpanel/ApiDocs'
// //
// // function App() {
// //     return (
// //         <Router>
// //             <AuthProvider>
// //                 <Routes>
// //                     {/* 🌐 PÚBLICAS */}
// //                     <Route path="/" element={<LandingPage />} />
// //                     <Route path="/login" element={<LoginPage mode="login" />} />
// //                     <Route path="/registro" element={<LoginPage mode="registro" />} />
// //                     <Route path="/cursos" element={<CoursesPage />} />
// //                     <Route path="/curso/:id" element={<CourseDetail />} />
// //
// //                     {/* 👨‍🎓 PANEL ESTUDIANTE */}
// //                     <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
// //                     <Route path="/mis-cursos" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
// //                     <Route path="/mi-progreso" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
// //                     <Route path="/simulacros" element={<ProtectedRoute><Simulacros /></ProtectedRoute>} />
// //                     <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
// //
// //                     {/* 👑 PANEL ADMIN */}
// //                     <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
// //                     <Route path="/admin/cursos" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
// //                     <Route path="/admin/usuarios" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
// //                     <Route path="/admin/pagos" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
// //                     <Route path="/admin/simulacros" element={<ProtectedRoute role="admin"><AdminSimulacros /></ProtectedRoute>} />
// //                     <Route path="/admin/reportes" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
// //                     <Route path="/admin/api-docs" element={<ProtectedRoute role="admin"><AdminApiDocs /></ProtectedRoute>} />
// //
// //                     {/* 404 */}
// //                     <Route path="*" element={<NotFound />} />
// //                 </Routes>
// //             </AuthProvider>
// //         </Router>
// //     )
// // }
// //
// // export default App
//
// import React from 'react'
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
// import { AuthProvider } from './utils/AuthContext'
// import ProtectedRoute from './utils/ProtectedRoute'
//
// // PÚBLICAS
// import LandingPage from './public/LandingPage'
// import LoginPage from './public/LoginPage'
// import CoursesPage from './public/CoursesPage'
// import CourseDetail from './public/CourseDetail'
// import NotFound from './public/NotFound'
//
// // PANEL ESTUDIANTE
// import StudentDashboard from './panel/Dashboard'
// import MyCourses from './panel/MyCourses'
// import MyProgress from './panel/MyProgress'
// import Simulacros from './panel/Simulacros'
// import Profile from './panel/Profile'
//
// // ADMIN PANEL
// import AdminDashboard from './adminpanel/Dashboard'
// import AdminCourses from './adminpanel/Courses'
// import AdminUsers from './adminpanel/Users'
// import AdminPayments from './adminpanel/Payments'
// import AdminSimulacros from './adminpanel/Simulacros'
// import AdminReports from './adminpanel/Reports'
// import AdminApiDocs from './adminpanel/ApiDocs'
//
// import CourseManager from './adminpanel/CourseManager'
// import QuestionManager from './adminpanel/QuestionManager'
//
// function App() {
//     return (
//         <Router>
//             <AuthProvider>
//                 <Routes>
//                     {/* PÚBLICAS */}
//                     <Route path="/" element={<LandingPage />} />
//                     <Route path="/login" element={<LoginPage mode="login" />} />
//                     <Route path="/registro" element={<LoginPage mode="registro" />} />
//                     <Route path="/cursos" element={<CoursesPage />} />
//                     <Route path="/curso/:id" element={<CourseDetail />} />
//
//                     {/* ESTUDIANTE */}
//                     <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
//                     <Route path="/mis-cursos" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
//                     <Route path="/mi-progreso" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
//                     <Route path="/simulacros" element={<ProtectedRoute><Simulacros /></ProtectedRoute>} />
//                     <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
//
//                     {/* ADMIN */}
//                     <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
//                     <Route path="/admin/cursos" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
//
//                     <Route path="/admin/curso/:cursoId/gestionar" element={<ProtectedRoute role="admin"><CourseManager /></ProtectedRoute>} />
//
//                     <Route path="/admin/simulacro/:simulacroId/preguntas" element={<ProtectedRoute role="admin"><QuestionManager /></ProtectedRoute>} />
//
//                     <Route path="/admin/usuarios" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
//                     <Route path="/admin/pagos" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
//                     <Route path="/admin/simulacros" element={<ProtectedRoute role="admin"><AdminSimulacros /></ProtectedRoute>} />
//                     <Route path="/admin/reportes" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
//                     <Route path="/admin/api-docs" element={<ProtectedRoute role="admin"><AdminApiDocs /></ProtectedRoute>} />
//
//                     {/* 404 */}
//                     <Route path="*" element={<NotFound />} />
//                 </Routes>
//             </AuthProvider>
//         </Router>
//     )
// }
//
// export default App

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'
import ProtectedRoute from './utils/ProtectedRoute'

// PÚBLICAS
import LandingPage from './public/LandingPage'
import LoginPage from './public/LoginPage'
import CoursesPage from './public/CoursesPage'
import CourseDetail from './public/CourseDetail'
import NotFound from './public/NotFound'

// PANEL ESTUDIANTE
import StudentDashboard from './panel/Dashboard'
import MyCourses from './panel/MyCourses'
import MyProgress from './panel/MyProgress'
import Simulacros from './panel/Simulacros'
import Profile from './panel/Profile'
import CourseView from './panel/CourseView'  // ✅ NUEVO IMPORT

// ADMIN PANEL
import AdminDashboard from './adminpanel/Dashboard'
import AdminCourses from './adminpanel/Courses'
import AdminUsers from './adminpanel/Users'
import AdminPayments from './adminpanel/Payments'
import AdminSimulacros from './adminpanel/Simulacros'
import AdminReports from './adminpanel/Reports'
import AdminApiDocs from './adminpanel/ApiDocs'

import CourseManager from './adminpanel/CourseManager'
import QuestionManager from './adminpanel/QuestionManager'

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* PÚBLICAS */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage mode="login" />} />
                    <Route path="/registro" element={<LoginPage mode="registro" />} />
                    <Route path="/cursos" element={<CoursesPage />} />
                    <Route path="/curso/:id" element={<CourseDetail />} />

                    {/* ESTUDIANTE */}
                    <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/mis-cursos" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
                    <Route path="/mi-progreso" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
                    <Route path="/simulacros" element={<ProtectedRoute><Simulacros /></ProtectedRoute>} />
                    <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                    {/* ✅ NUEVA RUTA - ESTUDIAR CURSO */}
                    <Route path="/estudiar/:cursoId" element={<ProtectedRoute><CourseView /></ProtectedRoute>} />
                    {/* ADMIN */}
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/cursos" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />

                    <Route path="/admin/curso/:cursoId/gestionar" element={<ProtectedRoute role="admin"><CourseManager /></ProtectedRoute>} />

                    <Route path="/admin/simulacro/:simulacroId/preguntas" element={<ProtectedRoute role="admin"><QuestionManager /></ProtectedRoute>} />

                    <Route path="/admin/usuarios" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
                    <Route path="/admin/pagos" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
                    <Route path="/admin/simulacros" element={<ProtectedRoute role="admin"><AdminSimulacros /></ProtectedRoute>} />
                    <Route path="/admin/reportes" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
                    <Route path="/admin/api-docs" element={<ProtectedRoute role="admin"><AdminApiDocs /></ProtectedRoute>} />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App