// src/components/Sidebar.jsx - Sidebar actualizado con documentación
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

const Sidebar = () => {
    const location = useLocation()
    const { isAdmin, isInstructor } = useAuth()

    const isActive = (path) => location.pathname === path

    const linkClass = (path) => `
    flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors
    ${isActive(path)
        ? 'bg-medico-blue text-white'
        : 'text-medico-gray hover:bg-medico-light hover:text-medico-blue'
    }
  `

    return (
        <div className="h-full bg-white border-r border-gray-200">
            <div className="p-4">

                {/* Estudiante Navigation */}
                {!isAdmin && !isInstructor && (
                    <div>
                        <h3 className="text-xs font-semibold text-medico-gray uppercase tracking-wider mb-3">
                            Mi Aprendizaje
                        </h3>
                        <nav className="space-y-1">
                            <Link to="/dashboard" className={linkClass('/dashboard')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                                </svg>
                                <span>Dashboard</span>
                            </Link>

                            <Link to="/mis-cursos" className={linkClass('/mis-cursos')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span>Mis Cursos</span>
                            </Link>

                            <Link to="/mi-progreso" className={linkClass('/mi-progreso')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Mi Progreso</span>
                            </Link>

                            <Link to="/simulacros" className={linkClass('/simulacros')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span>Simulacros</span>
                            </Link>

                            <Link to="/perfil" className={linkClass('/perfil')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Mi Perfil</span>
                            </Link>
                        </nav>
                    </div>
                )}

                {/* Admin Navigation */}
                {isAdmin && (
                    <div>
                        <h3 className="text-xs font-semibold text-medico-gray uppercase tracking-wider mb-3">
                            Administración
                        </h3>
                        <nav className="space-y-1">
                            <Link to="/admin" className={linkClass('/admin')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                                <span>Dashboard Admin</span>
                            </Link>

                            <Link to="/admin/cursos" className={linkClass('/admin/cursos')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span>Gestión Cursos</span>
                            </Link>

                            <Link to="/admin/usuarios" className={linkClass('/admin/usuarios')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <span>Usuarios</span>
                            </Link>

                            <Link to="/admin/pagos" className={linkClass('/admin/pagos')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span>Pagos Pendientes</span>
                            </Link>

                            <Link to="/admin/simulacros" className={linkClass('/admin/simulacros')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span>Simulacros</span>
                            </Link>

                            <Link to="/admin/reportes" className={linkClass('/admin/reportes')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Reportes</span>
                            </Link>

                            <div className="pt-4 mt-4 border-t border-gray-200">
                                <h4 className="text-xs font-semibold text-medico-gray uppercase tracking-wider mb-2">
                                    Desarrollo
                                </h4>
                                <Link to="/admin/api-docs" className={linkClass('/admin/api-docs')}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>API Docs</span>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}

                {/* Instructor Navigation */}
                {isInstructor && !isAdmin && (
                    <div>
                        <h3 className="text-xs font-semibold text-medico-gray uppercase tracking-wider mb-3">
                            Instructor
                        </h3>
                        <nav className="space-y-1">
                            <Link to="/dashboard" className={linkClass('/dashboard')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                                <span>Dashboard</span>
                            </Link>

                            <Link to="/admin/cursos" className={linkClass('/admin/cursos')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <span>Mis Cursos</span>
                            </Link>

                            <Link to="/admin/simulacros" className={linkClass('/admin/simulacros')}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                                <span>Simulacros</span>
                            </Link>
                        </nav>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-8">
                    <h3 className="text-xs font-semibold text-medico-gray uppercase tracking-wider mb-3">
                        Acciones Rápidas
                    </h3>
                    <div className="space-y-2">
                    <a
                        href="https://wa.me/593985036066?text=Hola, necesito soporte técnico en Mediconsa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-medico-green hover:text-green-700 text-sm transition-colors p-2 rounded-lg hover:bg-green-50"
                        >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        <span>Soporte WhatsApp</span>
                    </a>

                    {process.env.NODE_ENV === 'development' && (
                        <a
                        href={process.env.REACT_APP_API_URL || 'http://localhost:5001'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm transition-colors p-2 rounded-lg hover:bg-blue-50"
                        >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        <span>API Backend</span>
                        </a>
                        )}
                </div>
            </div>

            {/* Environment Info (Development only) */}
            {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    🔧 Dev Info
                </h4>
                <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>API:</strong> {process.env.REACT_APP_API_URL || 'Local'}</p>
                    <p><strong>Node:</strong> {process.env.NODE_ENV}</p>
                    <p><strong>Debug:</strong> {process.env.REACT_APP_DEBUG || 'Off'}</p>
                </div>
            </div>
            )}
        </div>
</div>
)
}

export default Sidebar