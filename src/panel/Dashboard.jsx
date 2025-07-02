// src/panel/Dashboard.jsx - CON VALIDACIÓN DE ROLES
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import dashboardService from '../services/dashboard'

const StudentDashboard = () => {
    const navigate = useNavigate()
    const { perfil, isAuthenticated, isAdmin, isInstructor } = useAuth()

    // ========== ESTADOS PRINCIPALES ==========
    const [dashboardData, setDashboardData] = useState({
        estadisticas: {},
        cursosRecientes: [],
        actividadReciente: []
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // ========== VALIDACIÓN DE ROLES ==========
    useEffect(() => {
        if (isAuthenticated) {
            // ✅ REDIRIGIR ADMIN Y INSTRUCTORES A SUS DASHBOARDS CORRESPONDIENTES
            if (isAdmin) {
                // console.log('Admin detectado, redirigiendo a /admin')
                navigate('/admin', { replace: true })
                return
            }

            if (isInstructor) {
                // console.log('Instructor detectado, redirigiendo a /admin/cursos')
                navigate('/admin/cursos', { replace: true })
                return
            }

            // Solo estudiantes pueden continuar
            loadDashboardData()
        }
    }, [isAuthenticated, isAdmin, isInstructor, navigate])

    // ========== FUNCIONES DE CARGA ==========
    const loadDashboardData = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await dashboardService.getStudentDashboard()

            if (result.success) {
                setDashboardData(result.data)
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

    // ========== FUNCIONES DE UTILIDAD ==========
    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const calculateProgress = (completadas, total) => {
        if (!total || total === 0) return 0
        return Math.round((completadas / total) * 100)
    }

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500'
        if (percentage >= 50) return 'bg-blue-500'
        if (percentage >= 25) return 'bg-yellow-500'
        return 'bg-gray-300'
    }

    const getActivityIcon = (tipo) => {
        if (tipo === 'clase') {
            return (
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        } else {
            return (
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        }
    }

    // ========== PROTECCIÓN ADICIONAL ==========
    // Si por alguna razón no se ejecutó el useEffect de redirección
    if (isAuthenticated && (isAdmin || isInstructor)) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Redirigiendo...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // ========== RENDER LOADING ==========
    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando dashboard...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    // ========== RENDER PRINCIPAL (SOLO PARA ESTUDIANTES) ==========
    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* ========== HEADER ========== */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">
                        ¡Hola, {perfil?.nombre_completo?.split(' ')[0] || 'Estudiante'}! 👋
                    </h1>
                    <p className="text-medico-gray mt-2">Aquí tienes un resumen de tu progreso académico</p>
                </div>

                {/* ========== MENSAJES ========== */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600">{error}</p>
                        </div>
                        <button
                            onClick={() => setError('')}
                            className="mt-2 text-red-700 underline hover:no-underline text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                {/* ========== ESTADÍSTICAS GENERALES ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Cursos Inscritos</h3>
                                <p className="text-3xl font-bold text-medico-blue">{dashboardData.estadisticas.cursos_inscritos || 0}</p>
                            </div>
                            <div className="bg-medico-blue bg-opacity-10 rounded-full p-3">
                                <svg className="w-8 h-8 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Clases Completadas</h3>
                                <p className="text-3xl font-bold text-green-600">{dashboardData.estadisticas.clases_completadas || 0}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Simulacros Realizados</h3>
                                <p className="text-3xl font-bold text-purple-600">{dashboardData.estadisticas.simulacros_realizados || 0}</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Promedio Simulacros</h3>
                                <p className="text-3xl font-bold text-orange-600">
                                    {dashboardData.estadisticas.promedio_simulacros ?
                                        Math.round(dashboardData.estadisticas.promedio_simulacros) + '%' : '0%'}
                                </p>
                            </div>
                            <div className="bg-orange-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ========== CURSOS RECIENTES ========== */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Mis Cursos</h2>
                                <button
                                    onClick={() => navigate('/mis-cursos')}
                                    className="text-medico-blue hover:text-blue-700 text-sm font-medium"
                                >
                                    Ver todos →
                                </button>
                            </div>

                            {dashboardData.cursosRecientes.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.cursosRecientes.map((curso) => {
                                        const progress = calculateProgress(curso.clases_completadas, curso.total_clases)
                                        return (
                                            <div key={curso.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        {curso.miniatura_url ? (
                                                            <img
                                                                src={curso.miniatura_url}
                                                                alt={curso.titulo}
                                                                className="w-16 h-16 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-medico-blue rounded-lg flex items-center justify-center">
                                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900">{curso.titulo}</h3>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            {curso.clases_completadas} de {curso.total_clases} clases completadas
                                                        </p>
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-sm mb-1">
                                                                <span className="text-gray-600">Progreso</span>
                                                                <span className="font-medium">{progress}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                                                                    style={{ width: `${progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => navigate(`/estudiar/${curso.id}`)}
                                                        className="bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                                    >
                                                        Continuar
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes cursos inscritos</h3>
                                    <p className="text-gray-500 mb-4">Explora nuestro catálogo y encuentra el curso perfecto para ti</p>
                                    <button
                                        onClick={() => navigate('/mis-cursos')}
                                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Explorar Cursos
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ========== ACTIVIDAD RECIENTE ========== */}
                    <div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h2>

                            {dashboardData.actividadReciente.length > 0 ? (
                                <div className="space-y-4">
                                    {dashboardData.actividadReciente.map((actividad, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getActivityIcon(actividad.tipo)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {actividad.tipo === 'clase' ? 'Completaste la clase' : 'Realizaste el simulacro'}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">{actividad.titulo}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {actividad.curso_titulo} • {formatDate(actividad.fecha)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-gray-500">No hay actividad reciente</p>
                                </div>
                            )}
                        </div>

                        {/* ========== ACCESOS RÁPIDOS ========== */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6">Accesos Rápidos</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/mi-progreso')}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <svg className="w-5 h-5 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    <span className="font-medium text-gray-900">Ver Mi Progreso</span>
                                </button>

                                <button
                                    onClick={() => navigate('/simulacros')}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                    <span className="font-medium text-gray-900">Practicar Simulacros</span>
                                </button>

                                <button
                                    onClick={() => navigate('/perfil')}
                                    className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                >
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="font-medium text-gray-900">Mi Perfil</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default StudentDashboard