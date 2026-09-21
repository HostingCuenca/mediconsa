import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './utils/AuthContext'
import ProtectedRoute from './utils/ProtectedRoute'

// PÚBLICAS
import LandingPage from './public/LandingPage'
import LoginPage from './public/LoginPage'
import ForgotPasswordPage from './public/ForgotPasswordPage'
import ResetPasswordPage from './public/ResetPasswordPage'
import VerifyEmailPage from './public/VerifyEmailPage'
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

// 🆕 SIMULADOR INTERACTIVO (módulo nuevo, convive con Simulacros legacy)
import SimuladorInicio from './simulador/SimuladorInicio'
import EntrenadorInicio from './simulador/EntrenadorInicio'
import PlanEstudio from './simulador/PlanEstudio'
import SimuladorProgreso from './simulador/SimuladorProgreso'
import SimuladorNueva from './simulador/SimuladorNueva'
import SimuladorSesion from './simulador/SimuladorSesion'
import SimuladorResultado from './simulador/SimuladorResultado'
import SimuladorHistorial from './simulador/SimuladorHistorial'
import SimuladorAdmin from './adminpanel/SimuladorAdmin'
import Biblioteca from './biblioteca/Biblioteca'
import CronogramaCurso from './cronograma/CronogramaCurso'
import { CronogramaIndex } from './cronograma/CronogramaWidgets'
import CronogramasAdmin from './adminpanel/CronogramasAdmin'
import SeguridadAdmin from './adminpanel/SeguridadAdmin'
import FichaEstudiante from './adminpanel/FichaEstudiante'

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
import SimulacrosMantenimiento from './adminpanel/SimulacrosMantenimiento'

import CourseManager from './adminpanel/CourseManager'
import QuestionManager from './adminpanel/QuestionManager'
import SimulacroManager from './adminpanel/SimulacroManager'

// 🆕 NUEVAS PÁGINAS ADMIN - GESTIÓN COMPLETA
import MaterialManager from './adminpanel/MaterialManager'
import Materiales from './adminpanel/Materiales'
import ClasesVirtualesManager from './adminpanel/ClasesVirtualesManager'
import CanalesManager from './adminpanel/CanalesManager'
import MaterialesPublic from "./public/MaterialesPublic";
import CarritoPage from "./public/CarritoPage";
import Canales from "./panel/Canales";
import ClasesVirtuales from "./panel/ClasesVirtuales";
import PrivacyPage from "./public/PrivacyPage";
import PorQueMediconsa from "./public/PorqueMediconsa";

// El lector de la Biblioteca carga PDF.js (~100 kB gzip): se trae solo cuando se abre un material
const Lector = React.lazy(() => import('./biblioteca/Lector'))
const LectorLazy = () => (
    <React.Suspense fallback={<div className="min-h-screen bg-medico-light flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-medico-blue" /></div>}>
        <Lector />
    </React.Suspense>
)


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
                    <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
                    <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
                    <Route path="/verificar-correo" element={<VerifyEmailPage />} />
                    <Route path="/cursos" element={<CoursesPage />} />
                    <Route path="/materiales" element={<MaterialesPublic />} />
                    <Route path="/politica-de-privacidad" element={<PrivacyPage />} />
                    <Route path="/sobre-nosotros" element={<PorQueMediconsa />} />
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

                    {/* 🆕 Simulador Interactivo */}
                    <Route path="/simulador" element={<ProtectedRoute><EntrenadorInicio /></ProtectedRoute>} />
                    <Route path="/simulador/ruta" element={<ProtectedRoute><SimuladorInicio /></ProtectedRoute>} />
                    <Route path="/simulador/plan" element={<ProtectedRoute><PlanEstudio /></ProtectedRoute>} />
                    <Route path="/simulador/progreso" element={<ProtectedRoute><SimuladorProgreso /></ProtectedRoute>} />
                    <Route path="/simulador/nueva" element={<ProtectedRoute><SimuladorNueva /></ProtectedRoute>} />
                    <Route path="/simulador/sesion/:id" element={<ProtectedRoute><SimuladorSesion /></ProtectedRoute>} />
                    <Route path="/simulador/resultado/:id" element={<ProtectedRoute><SimuladorResultado /></ProtectedRoute>} />
                    <Route path="/simulador/historial" element={<ProtectedRoute><SimuladorHistorial /></ProtectedRoute>} />

                    {/* Cronograma del curso (guía día a día) */}
                    <Route path="/cronograma" element={<ProtectedRoute><CronogramaIndex /></ProtectedRoute>} />
                    <Route path="/cronograma/:cursoId" element={<ProtectedRoute><CronogramaCurso /></ProtectedRoute>} />

                    {/* Biblioteca: lectura de materiales dentro de la plataforma */}
                    <Route path="/biblioteca" element={<ProtectedRoute><Biblioteca /></ProtectedRoute>} />
                    <Route path="/biblioteca/leer/:id" element={<ProtectedRoute><LectorLazy /></ProtectedRoute>} />

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
                    <Route path="/admin/mantenimiento" element={<ProtectedRoute role="admin"><SimulacrosMantenimiento /></ProtectedRoute>} />
                    <Route path="/admin/reportes" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />

                    {/* Gestión de cursos */}
                    <Route path="/admin/cursos" element={<ProtectedRoute role="admin"><AdminCourses /></ProtectedRoute>} />
                    <Route path="/admin/curso/:cursoId/gestionar" element={<ProtectedRoute role="admin"><CourseManager /></ProtectedRoute>} />

                    {/* Gestión de simulacros */}
                    <Route path="/admin/simulacros" element={<ProtectedRoute role="admin"><AdminSimulacros /></ProtectedRoute>} />
                    <Route path="/admin/simulacro/:simulacroId" element={<ProtectedRoute role="admin"><SimulacroManager /></ProtectedRoute>} />
                    <Route path="/admin/questions/:simulacroId" element={<ProtectedRoute role="admin"><QuestionManager /></ProtectedRoute>} />
                    <Route path="/admin/simulador" element={<ProtectedRoute role="admin"><SimuladorAdmin /></ProtectedRoute>} />
                    <Route path="/admin/cronogramas" element={<ProtectedRoute role="admin"><CronogramasAdmin /></ProtectedRoute>} />
                    <Route path="/admin/cronogramas/:id" element={<ProtectedRoute role="admin"><CronogramasAdmin /></ProtectedRoute>} />
                    <Route path="/admin/seguridad" element={<ProtectedRoute role="admin"><SeguridadAdmin /></ProtectedRoute>} />
                    <Route path="/admin/seguridad/:id" element={<ProtectedRoute role="admin"><SeguridadAdmin /></ProtectedRoute>} />
                    <Route path="/admin/usuarios/:id" element={<ProtectedRoute role="admin"><FichaEstudiante /></ProtectedRoute>} />
                    <Route path="/admin/usuario/:id/progreso" element={<ProtectedRoute role="admin"><FichaEstudiante /></ProtectedRoute>} />

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