// src/admin/AdminDashboard.jsx - Dashboard principal del administrador
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import dashboardService from '../services/dashboard'

const AdminDashboard = () => {
    const [data, setData] = useState({
        estadisticas: {},
        usuariosRecientes: [],
        pagosPendientes: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        cargarDashboard()
    }, [])

    const cargarDashboard = async () => {
        try {
            setLoading(true)
            const response = await dashboardService.getAdminDashboard()

            if (response.success) {
                setData({
                    estadisticas: dashboardService.formatAdminStats(response.estadisticas),
                    usuariosRecientes: response.usuariosRecientes,
                    pagosPendientes: response.pagosPendientes
                })
            } else {
                setError(response.error || 'Error cargando dashboard')
            }
        } catch (error) {
            setError('Error de conexión')
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-24 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Panel de Administración</h1>
                    <p className="text-medico-gray mt-2">
                        Gestiona tu plataforma educativa Mediconsa
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={cargarDashboard}
                            className="mt-2 text-red-700 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Total Usuarios</p>
                                <p className="text-2xl font-bold text-medico-blue">{data.estadisticas.totalUsuarios || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Total Cursos</p>
                                <p className="text-2xl font-bold text-green-600">{data.estadisticas.totalCursos || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Pagos Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-600">{data.estadisticas.pagosPendientes || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Inscrip. Activas</p>
                                <p className="text-2xl font-bold text-purple-600">{data.estadisticas.inscripcionesActivas || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <Link to="/admin/curso/crear" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-medico-blue rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Crear Curso</h3>
                                <p className="text-sm text-medico-gray">Nuevo curso médico</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/simulacro/crear" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-medico-green rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Crear Simulacro</h3>
                                <p className="text-sm text-medico-gray">Nuevo examen</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/pagos" className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Aprobar Pagos</h3>
                                <p className="text-sm text-medico-gray">{data.estadisticas.pagosPendientes || 0} pendientes</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Usuarios Recientes */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-medico-blue mb-4">Usuarios Recientes</h3>
                        {data.usuariosRecientes.length > 0 ? (
                            <div className="space-y-4">
                                {data.usuariosRecientes.slice(0, 5).map((usuario) => (
                                    <div key={usuario.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-medico-light transition-colors">
                                        <div className="w-10 h-10 bg-medico-blue rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-semibold">
                                                {usuario.nombre_completo?.charAt(0) || 'U'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{usuario.nombre_completo}</p>
                                            <p className="text-sm text-medico-gray">{usuario.email}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            usuario.tipo_usuario === 'admin' ? 'bg-red-100 text-red-800' :
                                                usuario.tipo_usuario === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                        }`}>
                                            {usuario.tipo_usuario}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-medico-gray text-center py-8">No hay usuarios recientes</p>
                        )}
                    </div>

                    {/* Pagos Pendientes */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-medico-blue">Pagos Pendientes</h3>
                            <Link to="/admin/pagos" className="text-sm text-medico-blue hover:text-blue-700">
                                Ver todos
                            </Link>
                        </div>
                        {data.pagosPendientes.length > 0 ? (
                            <div className="space-y-4">
                                {data.pagosPendientes.slice(0, 5).map((pago) => (
                                    <div key={pago.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-medico-light transition-colors">
                                        <div>
                                            <p className="font-medium text-gray-900">{pago.nombre_completo}</p>
                                            <p className="text-sm text-medico-gray">{pago.curso_titulo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-medico-green">${pago.precio}</p>
                                            <p className="text-xs text-medico-gray">
                                                {new Date(pago.fecha_inscripcion).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-medico-gray text-center py-8">No hay pagos pendientes</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AdminDashboard