import React, { useState, useEffect } from 'react'
import Layout from '../utils/Layout'
import dashboardService from '../services/dashboard'

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadDashboardData()
    }, [])

    const loadDashboardData = async () => {
        try {
            setLoading(true)
            // ✅ CORREGIDO: Usar getAdminDashboard en lugar de getAdminStats
            const result = await dashboardService.getAdminDashboard()

            if (result.success) {
                setStats(result.data)
            } else {
                setError(result.error || 'Error cargando dashboard')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="p-8 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando dashboard...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Dashboard Administrativo</h1>
                    <p className="text-medico-gray mt-2">Resumen general de la plataforma Mediconsa</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={loadDashboardData}
                            className="mt-2 text-red-700 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Usuarios Totales */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Usuarios Totales</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.estadisticas?.totalUsuarios || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Cursos Activos */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.estadisticas?.totalCursos || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Inscripciones */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Inscripciones</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.estadisticas?.inscripcionesActivas || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Pagos Pendientes */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.estadisticas?.pagosPendientes || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actividad Reciente */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuarios Recientes</h3>
                        {stats?.usuariosRecientes?.length > 0 ? (
                            <div className="space-y-3">
                                {stats.usuariosRecientes.map((user, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-medico-blue rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {user.nombreCompleto?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.nombreCompleto}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No hay usuarios recientes</p>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                        <div className="space-y-3">
                            <a href="/admin/cursos" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                <p className="font-medium text-blue-900">Gestionar Cursos</p>
                                <p className="text-sm text-blue-700">Crear, editar y organizar cursos</p>
                            </a>
                            <a href="/admin/usuarios" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                <p className="font-medium text-green-900">Gestionar Usuarios</p>
                                <p className="text-sm text-green-700">Administrar perfiles y permisos</p>
                            </a>
                            <a href="/admin/pagos" className="block p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                                <p className="font-medium text-yellow-900">Revisar Pagos</p>
                                <p className="text-sm text-yellow-700">Aprobar inscripciones pendientes</p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AdminDashboard