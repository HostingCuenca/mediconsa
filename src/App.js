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
import CourseView from './panel/CourseView'
import MyMateriales from './panel/MyMateriales'
import RealizarSimulacro from './panel/RealizarSimulacro'
import ResultadoSimulacro from './panel/ResultadoSimulacro'

// 🆕 NUEVAS PÁGINAS ESTUDIANTE - MATERIALES Y COMUNICACIÓN
// import Marketplace from './panel/Marketplace'
// import MisClasesVirtuales from './panel/MisClasesVirtuales'
// import MisCanales from './panel/MisCanales'
// import MaterialDetail from './panel/MaterialDetail'
// import Carrito from './panel/Carrito'

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
import SimulacroManager from './adminpanel/SimulacroManager'

// 🆕 NUEVAS PÁGINAS ADMIN - GESTIÓN COMPLETA
import MaterialManager from './adminpanel/MaterialManager'
import Materiales from './adminpanel/Materiales'
import ClasesVirtualesManager from './adminpanel/ClasesVirtualesManager'
import CanalesManager from './adminpanel/CanalesManager'
import ClasesVirtualesGlobal from "./adminpanel/ClasesVirtualesGlobal";
import MaterialesPublic from "./public/MaterialesPublic";
import CarritoPage from "./public/CarritoPage";
import Canales from "./panel/Canales";
import ClasesVirtuales from "./panel/ClasesVirtuales";
import PrivacyPage from "./public/PrivacyPage";


function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* ================================================ */}
                    {/* RUTAS PÚBLICAS */}
                    {/* ================================================ */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage mode="login" />} />
                    <Route path="/registro" element={<LoginPage mode="registro" />} />
                    <Route path="/cursos" element={<CoursesPage />} />
                    <Route path="/materiales" element={<MaterialesPublic />} />
                    <Route path="/politica-de-privacidad" element={<PrivacyPage />} />
                    <Route path="/carrito" element={<CarritoPage />} />
                    <Route path="/curso/:id" element={<CourseDetail />} />


                    {/* 🆕 MARKETPLACE PÚBLICO */}
                    {/*<Route path="/marketplace" element={<Marketplace />} />*/}
                    {/*<Route path="/material/:materialId" element={<MaterialDetail />} />*/}

                    {/* ================================================ */}
                    {/* RUTAS DE ESTUDIANTE/USUARIO */}
                    {/* ================================================ */}

                    {/* Dashboard y perfil */}
                    <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
                    <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                    {/* Cursos y progreso */}
                    <Route path="/mis-cursos" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
                    <Route path="/mi-progreso" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
                    <Route path="/canales" element={<ProtectedRoute><Canales /></ProtectedRoute>} />
                    <Route path="/mis-materiales" element={<ProtectedRoute><MyMateriales /></ProtectedRoute>} />
                    <Route path="/clases-virtuales" element={<ProtectedRoute><ClasesVirtuales /></ProtectedRoute>} />
                    <Route path="/estudiar/:cursoId" element={<ProtectedRoute><CourseView /></ProtectedRoute>} />

                    {/* Simulacros */}
                    <Route path="/simulacros" element={<ProtectedRoute><Simulacros /></ProtectedRoute>} />
                    <Route path="/simulacro/:simulacroId/realizar" element={<ProtectedRoute><RealizarSimulacro /></ProtectedRoute>} />
                    <Route path="/simulacros/resultado" element={<ProtectedRoute><ResultadoSimulacro /></ProtectedRoute>} />

                    {/* 🆕 MATERIALES Y MARKETPLACE */}
                    {/*<Route path="/mis-materiales" element={<ProtectedRoute><Marketplace mode="myMaterials" /></ProtectedRoute>} />*/}
                    {/*<Route path="/carrito" element={<ProtectedRoute><Carrito /></ProtectedRoute>} />*/}

                    {/* 🆕 CLASES VIRTUALES */}
                    {/*<Route path="/mis-clases-virtuales" element={<ProtectedRoute><MisClasesVirtuales /></ProtectedRoute>} />*/}
                    {/*<Route path="/clases-virtuales/:cursoId" element={<ProtectedRoute><MisClasesVirtuales mode="course" /></ProtectedRoute>} />*/}

                    {/* 🆕 CANALES DE COMUNICACIÓN */}
                    {/*<Route path="/mis-canales" element={<ProtectedRoute><MisCanales /></ProtectedRoute>} />*/}
                    {/*<Route path="/canales/:cursoId" element={<ProtectedRoute><MisCanales mode="course" /></ProtectedRoute>} />*/}

                    {/* ================================================ */}
                    {/* RUTAS DE ADMINISTRADOR */}
                    {/* ================================================ */}

                    {/* Dashboard y gestión básica */}
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/usuarios" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
                    <Route path="/admin/pagos" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
                    <Route path="/admin/reportes" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
                    <Route path="/admin/api-docs" element={<ProtectedRoute role="admin"><AdminApiDocs /></ProtectedRoute>} />

                    {/* Gestión de cursos */}
                    <Route path="/admin/cursos" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
                    <Route path="/admin/curso/:cursoId/gestionar" element={<ProtectedRoute role="admin"><CourseManager /></ProtectedRoute>} />

                    {/* Gestión de simulacros */}
                    <Route path="/admin/simulacros" element={<ProtectedRoute role="admin"><AdminSimulacros /></ProtectedRoute>} />
                    <Route path="/admin/simulacro/:simulacroId" element={<ProtectedRoute role="admin"><SimulacroManager /></ProtectedRoute>} />
                    <Route path="/admin/questions/:simulacroId" element={<ProtectedRoute role="admin"><QuestionManager /></ProtectedRoute>} />

                    {/* 🆕 GESTIÓN DE MATERIALES */}
                    <Route path="/admin/materiales" element={<ProtectedRoute role="admin"><Materiales /></ProtectedRoute>} />
                    <Route path="/admin/materiales/:cursoId" element={<ProtectedRoute role="admin"><MaterialManager /></ProtectedRoute>} />

                    {/* 🆕 GESTIÓN DE CLASES VIRTUALES */}
                    <Route path="/admin/clases-virtuales" element={<ProtectedRoute role="admin"><ClasesVirtualesManager /></ProtectedRoute>} />
                    <Route path="/admin/clases-virtuales/:cursoId" element={<ProtectedRoute role="admin"><ClasesVirtualesManager /></ProtectedRoute>} />

                    {/* 🆕 GESTIÓN DE CANALES */}
                    <Route path="/admin/canales" element={<ProtectedRoute role="admin"><CanalesManager /></ProtectedRoute>} />

                    {/* ================================================ */}
                    {/* RUTAS DE ERROR */}
                    {/* ================================================ */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App