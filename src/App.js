
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

import RealizarSimulacro from './panel/RealizarSimulacro'

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

                    <Route path="/simulacro/:simulacroId/realizar" element={<ProtectedRoute><RealizarSimulacro /></ProtectedRoute>} />

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