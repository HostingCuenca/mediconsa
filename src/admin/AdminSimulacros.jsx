// src/admin/AdminSimulacros.jsx - Gestión completa de simulacros
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import coursesService from '../services/courses'
import simulacrosService from '../services/simulacros'

const AdminSimulacros = () => {
    const [cursos, setCursos] = useState([])
    const [simulacros, setSimulacros] = useState([])
    const [cursoSeleccionado, setCursoSeleccionado] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        cargarCursos()
    }, [])

    useEffect(() => {
        if (cursoSeleccionado) {
            cargarSimulacros(cursoSeleccionado)
        } else {
            setSimulacros([])
        }
    }, [cursoSeleccionado])

    const cargarCursos = async () => {
        try {
            setLoading(true)
            const response = await coursesService.getCourses()

            if (response.success) {
                setCursos(response.cursos)
                if (response.cursos.length > 0) {
                    setCursoSeleccionado(response.cursos[0].id.toString())
                }
            } else {
                setError(response.error || 'Error cargando cursos')
            }
        } catch (error) {
            setError('Error de conexión')
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const cargarSimulacros = async (cursoId) => {
        try {
            const response = await simulacrosService.getSimulacrosByCourse(cursoId)

            if (response.success) {
                setSimulacros(response.simulacros)
            } else {
                setError(response.error || 'Error cargando simulacros')
            }
        } catch (error) {
            setError('Error de conexión')
            console.error('Error:', error)
        }
    }

    const getModeColor = (modo) => {
        switch (modo) {
            case 'practica':
                return 'bg-blue-100 text-blue-800'
            case 'realista':
                return 'bg-yellow-100 text-yellow-800'
            case 'examen':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getModeLabel = (modo) => {
        switch (modo) {
            case 'practica':
                return 'Práctica'
            case 'realista':
                return 'Realista'
            case 'examen':
                return 'Examen'
            default:
                return 'Desconocido'
        }
    }

    const cursoActual = cursos.find(c => c.id.toString() === cursoSeleccionado)

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue">Gestión de Simulacros</h1>
                        <p className="text-medico-gray mt-2">Administra simulacros y exámenes por curso</p>
                    </div>
                    <Link
                        to="/admin/simulacro/crear"
                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Nuevo Simulacro</span>
                    </Link>
                </div>

                {/* Course Selector */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-medico-gray mb-2">
                                Seleccionar Curso
                            </label>
                            <select
                                value={cursoSeleccionado}
                                onChange={(e) => setCursoSeleccionado(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Selecciona un curso...</option>
                                {cursos.map((curso) => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.titulo} ({curso.tipo_examen || 'General'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {cursoActual && (
                            <div className="text-sm text-medico-gray">
                                <p><strong>Estudiantes:</strong> {cursoActual.estudiantes_inscritos || 0}</p>
                                <p><strong>Precio:</strong> {cursoActual.es_gratuito ? 'Gratuito' : `$${cursoActual.precio}`}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => cursoSeleccionado ? cargarSimulacros(cursoSeleccionado) : cargarCursos()}
                            className="mt-2 text-red-700 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Simulacros List */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : cursoSeleccionado ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {simulacros.map((simulacro) => (
                            <div key={simulacro.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{simulacro.titulo}</h3>
                                        <p className="text-sm text-medico-gray mb-3 line-clamp-2">{simulacro.descripcion}</p>

                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(simulacro.modo_evaluacion)}`}>
                                                {getModeLabel(simulacro.modo_evaluacion)}
                                            </span>

                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                simulacro.activo
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {simulacro.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-medico-gray">
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{simulacro.numero_preguntas || 0} preguntas</span>
                                            </div>

                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>
                                                    {simulacro.tiempo_limite_minutos
                                                        ? `${simulacro.tiempo_limite_minutos} min`
                                                        : 'Sin límite'
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span>
                                                    {simulacro.intentos_permitidos === -1
                                                        ? 'Ilimitados'
                                                        : `${simulacro.intentos_permitidos} intentos`
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                </svg>
                                                <span>{simulacro.total_preguntas_disponibles || 0} preguntas creadas</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Link
                                        to={`/admin/simulacro/${simulacro.id}/editar`}
                                        className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                                    >
                                        Editar
                                    </Link>

                                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>

                                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un curso</h3>
                        <p className="text-medico-gray">Elige un curso para ver sus simulacros</p>
                    </div>
                )}

                {/* Empty State for Course */}
                {!loading && cursoSeleccionado && simulacros.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin simulacros</h3>
                        <p className="text-medico-gray mb-6">Este curso no tiene simulacros creados</p>
                        <Link
                            to="/admin/simulacro/crear"
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Crear Primer Simulacro</span>
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default AdminSimulacros