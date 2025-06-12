
// src/utils/Sidebar.jsx - SIMPLIFICADO
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

const Sidebar = () => {
    const location = useLocation()
    const { isAdmin, isInstructor } = useAuth()

    const isActive = (path) => location.pathname === path
    const linkClass = (path) => `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
        isActive(path) ? 'bg-medico-blue text-white' : 'text-medico-gray hover:bg-medico-light hover:text-medico-blue'
    }`

    return (
        <div className="h-full bg-white border-r border-gray-200 p-4">

            {/* 👨‍🎓 ESTUDIANTE */}
            {!isAdmin && !isInstructor && (
                <nav className="space-y-1">
                    <h3 className="text-xs font-semibold text-medico-gray uppercase tracking-wider mb-3">Mi Aprendizaje</h3>
                    <Link to="/dashboard" className={linkClass('/dashboard')}>📊 Dashboard</Link>
                    <Link to="/mis-cursos" className={linkClass('/mis-cursos')}>📚 Mis Cursos</Link>
                    <Link to="/mi-progreso" className={linkClass('/mi-progreso')}>📈 Mi Progreso</Link>
                    <Link to="/simulacros" className={linkClass('/simulacros')}>🧪 Simulacros</Link>
                    <Link to="/perfil" className={linkClass('/perfil')}>👤 Mi Perfil</Link>
                </nav>
            )}

            {/* 👑 ADMIN */}
            {isAdmin && (
                <nav className="space-y-1">
                    <h3 className="text-xs font-semibold text-medico-gray uppercase tracking-wider mb-3">Administración</h3>
                    <Link to="/admin" className={linkClass('/admin')}>📊 Dashboard</Link>
                    <Link to="/admin/cursos" className={linkClass('/admin/cursos')}>📚 Cursos</Link>
                    <Link to="/admin/usuarios" className={linkClass('/admin/usuarios')}>👥 Usuarios</Link>
                    <Link to="/admin/pagos" className={linkClass('/admin/pagos')}>💳 Pagos</Link>
                    <Link to="/admin/simulacros" className={linkClass('/admin/simulacros')}>🧪 Simulacros</Link>
                    <Link to="/admin/reportes" className={linkClass('/admin/reportes')}>📈 Reportes</Link>
                    <Link to="/admin/api-docs" className={linkClass('/admin/api-docs')}>📖 API Docs</Link>
                </nav>
            )}

            {/* 👨‍🏫 INSTRUCTOR */}
            {isInstructor && !isAdmin && (
                <nav className="space-y-1">
                    <h3 className="text-xs font-semibold text-medico-gray uppercase tracking-wider mb-3">Instructor</h3>
                    <Link to="/dashboard" className={linkClass('/dashboard')}>📊 Dashboard</Link>
                    <Link to="/admin/cursos" className={linkClass('/admin/cursos')}>📚 Mis Cursos</Link>
                    <Link to="/admin/simulacros" className={linkClass('/admin/simulacros')}>🧪 Simulacros</Link>
                </nav>
            )}

            {/* WhatsApp */}
            <div className="mt-8 pt-4 border-t border-gray-200">
                <a href="https://wa.me/593985036066" target="_blank" rel="noopener noreferrer"
                   className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm p-2 rounded-lg hover:bg-green-50">
                    📱 Soporte WhatsApp
                </a>
            </div>
        </div>
    )
}

export default Sidebar