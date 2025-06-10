// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { user, perfil, loading, isAuthenticated } = useAuth()
    const location = useLocation()

    // Mostrar loading mientras verifica autenticación
    if (loading) {
        return (
            <div className="min-h-screen bg-medico-light flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue"></div>
                    <p className="mt-4 text-medico-gray">Verificando acceso...</p>
                </div>
            </div>
        )
    }

    // Redirigir a login si no está autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Verificar rol específico si es requerido
    if (requiredRole) {
        const userRole = perfil?.tipo_usuario

        if (!userRole) {
            return (
                <div className="min-h-screen bg-medico-light flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue"></div>
                        <p className="mt-4 text-medico-gray">Cargando perfil...</p>
                    </div>
                </div>
            )
        }

        // Verificar si tiene el rol requerido
        if (requiredRole === 'admin' && userRole !== 'admin') {
            return (
                <div className="min-h-screen bg-medico-light flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-medico-blue mb-2">Acceso Denegado</h2>
                        <p className="text-medico-gray mb-6">No tienes permisos para acceder a esta sección.</p>
                        <Navigate to="/dashboard" replace />
                    </div>
                </div>
            )
        }

        if (requiredRole === 'instructor' && !['admin', 'instructor'].includes(userRole)) {
            return <Navigate to="/dashboard" replace />
        }
    }

    // Todo correcto, mostrar el componente
    return children
}

export default ProtectedRoute