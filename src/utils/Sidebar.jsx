//
// import React from 'react'
// import { Link, useLocation } from 'react-router-dom'
// import { useAuth } from './AuthContext'
//
// const Sidebar = () => {
//     const location = useLocation()
//     const { isAdmin, isInstructor, perfil } = useAuth()
//
//     const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')
//
//     const linkClass = (path) => `group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
//         isActive(path)
//             ? 'bg-medico-blue text-white shadow-sm'
//             : 'text-gray-700 hover:bg-blue-50 hover:text-medico-blue'
//     }`
//
//     return (
//         <div className="h-full bg-white border-r border-gray-200 flex flex-col">
//
//             <div className="flex-1 p-4 overflow-y-auto">
//                 {/* 👨‍🎓 ESTUDIANTE */}
//                 {!isAdmin && !isInstructor && (
//                     <nav className="space-y-1">
//                         <div className="mb-4">
//                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
//                                 Mi Aprendizaje
//                             </h3>
//                             <div className="space-y-1">
//                                 <Link to="/dashboard" className={linkClass('/dashboard')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v.01" />
//                                     </svg>
//                                     <span className="font-medium">Dashboard</span>
//                                 </Link>
//
//                                 <Link to="/mis-cursos" className={linkClass('/mis-cursos')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                                     </svg>
//                                     <span className="font-medium">Mis Cursos</span>
//                                 </Link>
//
//                                 <Link to="/mi-progreso" className={linkClass('/mi-progreso')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                                     </svg>
//                                     <span className="font-medium">Mi Progreso</span>
//                                 </Link>
//
//                                 <Link to="/simulacros" className={linkClass('/simulacros')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
//                                     </svg>
//                                     <span className="font-medium">Simulacros</span>
//                                 </Link>
//                                 <Link to="/canales" className={linkClass('/canales')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
//                                     </svg>
//                                     <span className="font-medium">Canales</span>
//                                 </Link>
//                                 <Link to="/clases-virtuales" className={linkClass('/clases-virtuales')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
//                                     </svg>
//                                     <span className="font-medium">Clases Virtuales</span>
//                                 </Link>
//
//                                 <Link to="/perfil" className={linkClass('/perfil')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                     </svg>
//                                     <span className="font-medium">Mi Perfil</span>
//                                 </Link>
//                             </div>
//                         </div>
//                     </nav>
//                 )}
//
//                 {/* 👑 ADMINISTRADOR */}
//                 {isAdmin && (
//                     <nav className="space-y-1">
//                         <div className="mb-4">
//                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
//                                 Panel de Control
//                             </h3>
//                             <div className="space-y-1">
//                                 <Link to="/admin" className={linkClass('/admin')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                                     </svg>
//                                     <span className="font-medium">Dashboard</span>
//                                 </Link>
//                             </div>
//                         </div>
//
//                         <div className="mb-4">
//                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
//                                 Gestión de Contenido
//                             </h3>
//                             <div className="space-y-1">
//                                 <Link to="/admin/cursos" className={linkClass('/admin/cursos')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                                     </svg>
//                                     <span className="font-medium">Cursos</span>
//                                 </Link>
//
//                                 <Link to="/admin/simulacros" className={linkClass('/admin/simulacros')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                                     </svg>
//                                     <span className="font-medium">Simulacros</span>
//                                 </Link>
//
//                                 <Link to="/admin/materiales" className={linkClass('/admin/materiales')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                                     </svg>
//                                     <span className="font-medium">Materiales</span>
//                                 </Link>
//                             </div>
//                         </div>
//
//                         <div className="mb-4">
//                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
//                                 Comunicación
//                             </h3>
//                             <div className="space-y-1">
//                                 <Link to="/admin/clases-virtuales" className={linkClass('/admin/clases-virtuales')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                                     </svg>
//                                     <span className="font-medium">Clases Virtuales</span>
//                                 </Link>
//
//                                 <Link to="/admin/canales" className={linkClass('/admin/canales')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                                     </svg>
//                                     <span className="font-medium">Canales</span>
//                                 </Link>
//                             </div>
//                         </div>
//
//                         <div className="mb-4">
//                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
//                                 Administración
//                             </h3>
//                             <div className="space-y-1">
//                                 <Link to="/admin/usuarios" className={linkClass('/admin/usuarios')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                                     </svg>
//                                     <span className="font-medium">Usuarios</span>
//                                 </Link>
//
//                                 <Link to="/admin/pagos" className={linkClass('/admin/pagos')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                                     </svg>
//                                     <span className="font-medium">Pagos</span>
//                                 </Link>
//
//                                 <Link to="/admin/reportes" className={linkClass('/admin/reportes')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                                     </svg>
//                                     <span className="font-medium">Reportes</span>
//                                 </Link>
//
//                                 <Link to="/admin/api-docs" className={linkClass('/admin/api-docs')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                     </svg>
//                                     <span className="font-medium">API Docs</span>
//                                 </Link>
//                             </div>
//                         </div>
//                     </nav>
//                 )}
//
//                 {/* 👨‍🏫 INSTRUCTOR */}
//                 {isInstructor && !isAdmin && (
//                     <nav className="space-y-1">
//                         <div className="mb-4">
//                             <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
//                                 Panel Instructor
//                             </h3>
//                             <div className="space-y-1">
//                                 <Link to="/dashboard" className={linkClass('/dashboard')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
//                                     </svg>
//                                     <span className="font-medium">Dashboard</span>
//                                 </Link>
//
//                                 <Link to="/admin/cursos" className={linkClass('/admin/cursos')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                                     </svg>
//                                     <span className="font-medium">Mis Cursos</span>
//                                 </Link>
//
//                                 <Link to="/admin/simulacros" className={linkClass('/admin/simulacros')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                                     </svg>
//                                     <span className="font-medium">Simulacros</span>
//                                 </Link>
//
//                                 <Link to="/admin/materiales" className={linkClass('/admin/materiales')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
//                                     </svg>
//                                     <span className="font-medium">Materiales</span>
//                                 </Link>
//
//                                 <Link to="/admin/clases-virtuales" className={linkClass('/admin/clases-virtuales')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                                     </svg>
//                                     <span className="font-medium">Clases Virtuales</span>
//                                 </Link>
//
//                                 <Link to="/admin/canales" className={linkClass('/admin/canales')}>
//                                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
//                                     </svg>
//                                     <span className="font-medium">Canales</span>
//                                 </Link>
//                             </div>
//                         </div>
//                     </nav>
//                 )}
//             </div>
//
//             {/* Footer del Sidebar */}
//             <div className="p-4 border-t border-gray-100 space-y-3">
//                 {/* Información del usuario */}
//                 {perfil && (
//                     <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
//                         <div className="w-8 h-8 bg-medico-blue rounded-full flex items-center justify-center">
//                            <span className="text-white text-sm font-medium">
//                                {perfil.nombre_completo?.charAt(0)?.toUpperCase() || perfil.nombre_usuario?.charAt(0)?.toUpperCase() || 'U'}
//                            </span>
//                         </div>
//                         <div className="flex-1 min-w-0">
//                             <p className="text-sm font-medium text-gray-900 truncate">
//                                 {perfil.nombre_completo || perfil.nombre_usuario}
//                             </p>
//                             <p className="text-xs text-gray-500 truncate">
//                                 {isAdmin ? 'Administrador' : isInstructor ? 'Instructor' : 'Estudiante'}
//                             </p>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* Soporte WhatsApp */}
//                 <a
//                     href="https://wa.me/593985036066"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center space-x-3 px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors group"
//                 >
//                     <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
//                     </svg>
//                     <div className="flex-1">
//                         <span className="text-sm font-medium">Soporte</span>
//                         <p className="text-xs text-green-500">¿Necesitas ayuda?</p>
//                     </div>
//                     <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                     </svg>
//                 </a>
//             </div>
//         </div>
//     )
// }
//
// export default Sidebar


import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

const Sidebar = () => {
    const location = useLocation()
    const { isAdmin, isInstructor, perfil } = useAuth()

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

    const linkClass = (path) => `group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isActive(path)
            ? 'bg-medico-blue text-white shadow-sm'
            : 'text-gray-700 hover:bg-blue-50 hover:text-medico-blue'
    }`

    return (
        <div className="h-full bg-white border-r border-gray-200 flex flex-col">

            <div className="flex-1 p-4 overflow-y-auto">
                {/* 👨‍🎓 ESTUDIANTE */}
                {!isAdmin && !isInstructor && (
                    <nav className="space-y-1">
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                                Mi Aprendizaje
                            </h3>
                            <div className="space-y-1">
                                <Link to="/dashboard" className={linkClass('/dashboard')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v.01" />
                                    </svg>
                                    <span className="font-medium">Dashboard</span>
                                </Link>

                                <Link to="/mis-cursos" className={linkClass('/mis-cursos')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="font-medium">Mis Cursos</span>
                                </Link>

                                <Link to="/mi-progreso" className={linkClass('/mi-progreso')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="font-medium">Mi Progreso</span>
                                </Link>

                                <Link to="/simulacros" className={linkClass('/simulacros')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <span className="font-medium">Simulacros</span>
                                </Link>
                                <Link to="/canales" className={linkClass('/canales')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span className="font-medium">Canales</span>
                                </Link>
                                <Link to="/clases-virtuales" className={linkClass('/clases-virtuales')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Clases Virtuales</span>
                                </Link>

                                <Link to="/perfil" className={linkClass('/perfil')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium">Mi Perfil</span>
                                </Link>
                            </div>
                        </div>
                    </nav>
                )}

                {/* 👑 ADMINISTRADOR */}
                {isAdmin && (
                    <nav className="space-y-1">
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                                Panel de Control
                            </h3>
                            <div className="space-y-1">
                                <Link to="/admin" className={linkClass('/admin')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <span className="font-medium">Dashboard</span>
                                </Link>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                                Gestión de Contenido
                            </h3>
                            <div className="space-y-1">
                                <Link to="/admin/cursos" className={linkClass('/admin/cursos')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="font-medium">Cursos</span>
                                </Link>

                                <Link to="/admin/simulacros" className={linkClass('/admin/simulacros')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <span className="font-medium">Simulacros</span>
                                </Link>

                                <Link to="/admin/materiales" className={linkClass('/admin/materiales')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Materiales</span>
                                </Link>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                                Comunicación
                            </h3>
                            <div className="space-y-1">
                                <Link to="/admin/clases-virtuales" className={linkClass('/admin/clases-virtuales')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Clases Virtuales</span>
                                </Link>

                                <Link to="/admin/canales" className={linkClass('/admin/canales')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span className="font-medium">Canales</span>
                                </Link>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                                Administración
                            </h3>
                            <div className="space-y-1">
                                <Link to="/admin/usuarios" className={linkClass('/admin/usuarios')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <span className="font-medium">Usuarios</span>
                                </Link>

                                <Link to="/admin/pagos" className={linkClass('/admin/pagos')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                    <span className="font-medium">Pagos</span>
                                </Link>

                                {/*<Link to="/admin/reportes" className={linkClass('/admin/reportes')}>*/}
                                {/*    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                                {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />*/}
                                {/*    </svg>*/}
                                {/*    <span className="font-medium">Reportes</span>*/}
                                {/*</Link>*/}

                                {/*<Link to="/admin/api-docs" className={linkClass('/admin/api-docs')}>*/}
                                {/*    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">*/}
                                {/*        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />*/}
                                {/*    </svg>*/}
                                {/*    <span className="font-medium">API Docs</span>*/}
                                {/*</Link>*/}
                            </div>
                        </div>
                    </nav>
                )}

                {/* 👨‍🏫 INSTRUCTOR */}
                {isInstructor && !isAdmin && (
                    <nav className="space-y-1">
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                                Panel Instructor
                            </h3>
                            <div className="space-y-1">
                                <Link to="/dashboard" className={linkClass('/dashboard')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    <span className="font-medium">Dashboard</span>
                                </Link>

                                <Link to="/admin/cursos" className={linkClass('/admin/cursos')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span className="font-medium">Mis Cursos</span>
                                </Link>

                                <Link to="/admin/simulacros" className={linkClass('/admin/simulacros')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                    <span className="font-medium">Simulacros</span>
                                </Link>

                                <Link to="/admin/materiales" className={linkClass('/admin/materiales')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Materiales</span>
                                </Link>

                                <Link to="/admin/clases-virtuales" className={linkClass('/admin/clases-virtuales')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-medium">Clases Virtuales</span>
                                </Link>

                                <Link to="/admin/canales" className={linkClass('/admin/canales')}>
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span className="font-medium">Canales</span>
                                </Link>
                            </div>
                        </div>
                    </nav>
                )}
            </div>

            {/* Footer del Sidebar */}
            <div className="p-4 border-t border-gray-100 space-y-3">
                {/* Información del usuario */}
                {perfil && (
                    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-medico-blue rounded-full flex items-center justify-center">
                           <span className="text-white text-sm font-medium">
                               {perfil.nombre_completo?.charAt(0)?.toUpperCase() || perfil.nombre_usuario?.charAt(0)?.toUpperCase() || 'U'}
                           </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {perfil.nombre_completo || perfil.nombre_usuario}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {isAdmin ? 'Administrador' : isInstructor ? 'Instructor' : 'Estudiante'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Soporte WhatsApp */}
                <a
                    href="https://wa.me/593985036066"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 px-3 py-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors group"
                >
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106"/>
                    </svg>
                    <div className="flex-1">
                        <span className="text-sm font-medium">Soporte</span>
                        <p className="text-xs text-green-500">¿Necesitas ayuda?</p>
                    </div>
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                </a>
            </div>
        </div>
    )
}

export default Sidebar