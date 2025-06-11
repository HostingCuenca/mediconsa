import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

const Navbar = () => {
    const { user, isAuthenticated, logout, isAdmin, isInstructor } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const getDefaultRoute = () => {
        if (isAdmin) return '/admin'
        if (isInstructor) return '/admin/cursos'
        return '/dashboard'
    }

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <Link to={isAuthenticated ? getDefaultRoute() : "/"} className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-medico-blue rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        <span className="text-xl font-bold text-medico-blue">Mediconsa</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {!isAuthenticated ? (
                            // Navegación pública
                            <>
                                <Link to="/cursos" className="text-medico-gray hover:text-medico-blue transition-colors">
                                    Cursos
                                </Link>
                                <Link to="/login" className="text-medico-gray hover:text-medico-blue transition-colors">
                                    Iniciar Sesión
                                </Link>
                                <Link to="/registro" className="bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Registrarse
                                </Link>
                            </>
                        ) : (
                            // Navegación autenticada
                            <>
                                <Link to={getDefaultRoute()} className="text-medico-gray hover:text-medico-blue transition-colors">
                                    Dashboard
                                </Link>

                                {!isAdmin && !isInstructor && (
                                    <Link to="/mis-cursos" className="text-medico-gray hover:text-medico-blue transition-colors">
                                        Mis Cursos
                                    </Link>
                                )}

                                {(isAdmin || isInstructor) && (
                                    <Link to="/admin/cursos" className="text-medico-gray hover:text-medico-blue transition-colors">
                                        Gestión
                                    </Link>
                                )}

                                {/* User Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="flex items-center space-x-2 text-medico-gray hover:text-medico-blue transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-medico-blue rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {user?.nombreCompleto?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <span className="text-sm">{user?.nombreCompleto}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                            <div className="py-1">
                                                <div className="px-4 py-2 border-b border-gray-200">
                                                    <p className="text-sm text-medico-gray">{user?.email}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{user?.tipoUsuario}</p>
                                                </div>

                                                {!isAdmin && !isInstructor && (
                                                    <Link
                                                        to="/perfil"
                                                        className="block px-4 py-2 text-sm text-medico-gray hover:bg-medico-light"
                                                        onClick={() => setIsMenuOpen(false)}
                                                    >
                                                        Mi Perfil
                                                    </Link>
                                                )}

                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    Cerrar Sesión
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-medico-gray hover:text-medico-blue focus:outline-none"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/cursos" className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                        Cursos
                                    </Link>
                                    <Link to="/login" className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                        Iniciar Sesión
                                    </Link>
                                    <Link to="/registro" className="block px-3 py-2 text-medico-blue font-semibold">
                                        Registrarse
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <div className="px-3 py-2 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-medico-blue">{user?.nombreCompleto}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                    </div>
                                    <Link to={getDefaultRoute()} className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                        Dashboard
                                    </Link>
                                    {!isAdmin && !isInstructor && (
                                        <>
                                            <Link to="/mis-cursos" className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                                Mis Cursos
                                            </Link>
                                            <Link to="/perfil" className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                                Mi Perfil
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
