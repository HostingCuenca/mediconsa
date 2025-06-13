// src/panel/MyProgress.jsx - PÁGINA DE PROGRESO COMPLETA
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import progressService from '../services/progress'

const MyProgress = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [loading, setLoading] = useState(true)
    const [estadisticas, setEstadisticas] = useState({})
    const [cursos, setCursos] = useState([])
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [detalleCurso, setDetalleCurso] = useState(null)
    const [loadingDetalle, setLoadingDetalle] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadProgressData()
    }, [isAuthenticated])

    const loadProgressData = async () => {
        try {
            setLoading(true)
            const result = await progressService.getMyOverallProgress()

            if (result.success) {
                setEstadisticas(result.data.estadisticas || {})
                setCursos(result.data.cursos || [])
            }
        } catch (error) {
            console.error('Error cargando progreso:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadCourseDetail = async (cursoId) => {
        try {
            setLoadingDetalle(true)
            const result = await progressService.getCourseProgress(cursoId)

            if (result.success) {
                setDetalleCurso(result.data)
                setSelectedCourse(cursoId)
            }
        } catch (error) {
            console.error('Error cargando detalle:', error)
        } finally {
            setLoadingDetalle(false)
        }
    }

    const getProgressColor = (porcentaje) => {
        if (porcentaje >= 90) return 'bg-green-500'
        if (porcentaje >= 70) return 'bg-blue-500'
        if (porcentaje >= 40) return 'bg-yellow-500'
        if (porcentaje >= 10) return 'bg-orange-500'
        return 'bg-gray-300'
    }

    const getProgressStats = (porcentaje) => {
        return progressService.getProgressStats({ porcentaje_progreso: porcentaje })
    }

    const handleContinueCourse = (curso) => {
        navigate(`/estudiar/${curso.curso_id}`)
    }

    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Progreso</h1>
                    <p className="text-gray-600">
                        Revisa tu avance en los cursos y mantén el momentum de aprendizaje
                    </p>
                </div>

                {/* Estadísticas Generales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {estadisticas.cursos_inscritos || 0}
                                </p>
                                <p className="text-gray-600">Cursos Inscritos</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {estadisticas.total_clases_completadas || 0}
                                </p>
                                <p className="text-gray-600">Clases Completadas</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {estadisticas.simulacros_realizados || 0}
                                </p>
                                <p className="text-gray-600">Simulacros Realizados</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow border">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-2xl font-semibold text-gray-900">
                                    {estadisticas.promedio_simulacros ? Math.round(estadisticas.promedio_simulacros) : 0}%
                                </p>
                                <p className="text-gray-600">Promedio Simulacros</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lista de Cursos */}
                <div className="bg-white rounded-lg shadow border">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900">Progreso por Curso</h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {cursos.map((curso) => {
                            const stats = getProgressStats(curso.porcentaje_progreso)

                            return (
                                <div key={curso.curso_id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            {curso.miniatura_url && (
                                                <img
                                                    src={curso.miniatura_url}
                                                    alt={curso.titulo}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            )}
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {curso.titulo}
                                                </h3>
                                                <div className="flex items-center space-x-4 mt-1">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stats.bgColor} ${stats.textColor}`}>
                                                        {stats.nivel}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {curso.clases_completadas}/{curso.total_clases} clases
                                                    </span>
                                                    {curso.ultima_actividad && (
                                                        <span className="text-sm text-gray-500">
                                                            Última vez: {new Date(curso.ultima_actividad).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {Math.round(curso.porcentaje_progreso)}%
                                                </div>
                                                <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(curso.porcentaje_progreso)}`}
                                                        style={{ width: `${curso.porcentaje_progreso}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => loadCourseDetail(curso.curso_id)}
                                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                                                >
                                                    Ver Detalle
                                                </button>
                                                <button
                                                    onClick={() => handleContinueCourse(curso)}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                                >
                                                    Continuar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {cursos.length === 0 && (
                        <div className="p-12 text-center">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No tienes cursos en progreso
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Inscríbete a un curso para comenzar tu aprendizaje
                            </p>
                            <button
                                onClick={() => navigate('/cursos')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                            >
                                Explorar Cursos
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal de Detalle del Curso */}
                {selectedCourse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Detalle del Progreso
                                    </h3>
                                    <button
                                        onClick={() => {setSelectedCourse(null); setDetalleCurso(null)}}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {loadingDetalle ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : detalleCurso ? (
                                    <div>
                                        {/* Resumen del curso */}
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <h4 className="font-semibold text-gray-900 mb-2">
                                                {detalleCurso.curso.titulo}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Progreso Total:</span>
                                                    <span className="font-medium ml-2">
                                                        {detalleCurso.resumen.porcentaje_progreso}%
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Clases:</span>
                                                    <span className="font-medium ml-2">
                                                        {detalleCurso.resumen.clases_completadas}/{detalleCurso.resumen.total_clases}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Módulos:</span>
                                                    <span className="font-medium ml-2">
                                                        {detalleCurso.resumen.total_modulos}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Módulos y clases */}
                                        <div className="space-y-4">
                                            {detalleCurso.modulos?.map((modulo) => {
                                                const moduloProgress = progressService.calculateModuleProgress(modulo)

                                                return (
                                                    <div key={modulo.modulo_id} className="border border-gray-200 rounded-lg">
                                                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                                                            <div className="flex items-center justify-between">
                                                                <h5 className="font-medium text-gray-900">
                                                                    {modulo.modulo_titulo}
                                                                </h5>
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="text-sm text-gray-600">
                                                                        {moduloProgress.completadas}/{moduloProgress.total}
                                                                    </span>
                                                                    <div className="w-20 bg-gray-200 rounded-full h-2">
                                                                        <div
                                                                            className={`h-2 rounded-full ${getProgressColor(moduloProgress.porcentaje)}`}
                                                                            style={{ width: `${moduloProgress.porcentaje}%` }}
                                                                        ></div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-4">
                                                            <div className="space-y-3">
                                                                {modulo.clases?.map((clase) => (
                                                                    <div key={clase.id} className="flex items-center justify-between">
                                                                        <div className="flex items-center space-x-3">
                                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                                                clase.completada ? 'bg-green-500' : 'bg-gray-300'
                                                                            }`}>
                                                                                {clase.completada ? (
                                                                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                                    </svg>
                                                                                ) : (
                                                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                                                )}
                                                                            </div>
                                                                            <span className={`${clase.completada ? 'text-gray-900' : 'text-gray-600'}`}>
                                                                                {clase.titulo}
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex items-center space-x-2">
                                                                            <span className="text-sm text-gray-500">
                                                                                {clase.porcentaje_visto}%
                                                                            </span>
                                                                            {clase.duracion_minutos && (
                                                                                <span className="text-sm text-gray-500">
                                                                                    {progressService.formatDuration(clase.duracion_minutos)}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-500">No se pudo cargar el detalle del curso</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default MyProgress