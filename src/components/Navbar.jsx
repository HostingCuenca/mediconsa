// src/components/Navbar.jsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import { logoutUsuario } from '../services/auth'

const Navbar = () => {
    const { user, perfil, isAuthenticated, isAdmin } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const navigate = useNavigate()

    const handleLogout = async () => {
        const result = await logoutUsuario()
        if (result.success) {
            navigate('/')
        }
    }

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-medico-blue rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">M</span>
                            </div>
                            <span className="text-xl font-bold text-medico-blue">Mediconsa</span>
                            <span className="text-xs bg-medico-green text-white px-2 py-1 rounded-full">2025</span>
                        </Link>
                    </div>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-medico-gray hover:text-medico-blue transition-colors">
                            Inicio
                        </Link>
                        <Link to="/cursos" className="text-medico-gray hover:text-medico-blue transition-colors">
                            Cursos
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="text-medico-gray hover:text-medico-blue transition-colors">
                                    Dashboard
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" className="text-medico-gray hover:text-medico-blue transition-colors">
                                        Admin
                                    </Link>
                                )}
                            </>
                        ) : null}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative group">
                                <button className="flex items-center space-x-2 text-medico-gray hover:text-medico-blue">
                                    <div className="w-8 h-8 bg-medico-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {perfil?.nombre_completo?.charAt(0) || 'U'}
                    </span>
                                    </div>
                                    <span className="hidden sm:block">{perfil?.nombre_usuario}</span>
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{perfil?.nombre_completo}</p>
                                        <p className="text-xs text-medico-gray capitalize">{perfil?.tipo_usuario}</p>
                                    </div>
                                    <div className="py-1">
                                        <Link to="/perfil" className="block px-3 py-2 text-sm text-medico-gray hover:bg-medico-light">
                                            Mi Perfil
                                        </Link>
                                        <Link to="/mis-cursos" className="block px-3 py-2 text-sm text-medico-gray hover:bg-medico-light">
                                            Mis Cursos
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    className="text-medico-gray hover:text-medico-blue transition-colors"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/registro"
                                    className="bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Registrarse
                                </Link>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-medico-light"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link to="/" className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                Inicio
                            </Link>
                            <Link to="/cursos" className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                Cursos
                            </Link>
                            {isAuthenticated && (
                                <>
                                    <Link to="/dashboard" className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                        Dashboard
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="block px-3 py-2 text-medico-gray hover:text-medico-blue">
                                            Admin
                                        </Link>
                                    )}
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