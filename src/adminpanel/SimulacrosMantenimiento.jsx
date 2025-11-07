// src/adminpanel/SimulacrosMantenimiento.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import simulacrosAdminService from '../services/simulacrosAdmin'
import coursesService from '../services/courses'

const SimulacrosMantenimiento = () => {
    const navigate = useNavigate()

    // Estados principales
    const [intentos, setIntentos] = useState([])
    const [cursos, setCursos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Filtros
    const [selectedCurso, setSelectedCurso] = useState('')
    const [vistaActual, setVistaActual] = useState('cursos') // 'cursos' | 'simulacros'

    // Selección y eliminación
    const [selectedIntentos, setSelectedIntentos] = useState([])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    // Estadísticas
    const [estadisticas, setEstadisticas] = useState({})
    const [estadisticasCompletas, setEstadisticasCompletas] = useState(null)
    const [loadingStats, setLoadingStats] = useState(false)

    useEffect(() => {
        loadInitialData()
    }, [])

    useEffect(() => {
        if (selectedCurso) {
            loadIntentos()
        }
    }, [selectedCurso])

    const loadInitialData = async () => {
        try {
            setLoading(true)
            setError('')

            // Cargar cursos
            const cursosResult = await coursesService.getAllCourses()
            if (cursosResult.success) {
                setCursos(cursosResult.data.cursos || [])
            }

            // Cargar todos los intentos para estadísticas generales
            const intentosResult = await simulacrosAdminService.getIntentos()
            if (intentosResult.success) {
                setIntentos(intentosResult.data.intentos || [])
                const stats = simulacrosAdminService.calcularEstadisticas(intentosResult.data.intentos || [])
                setEstadisticas(stats)
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error cargando datos iniciales')
        } finally {
            setLoading(false)
        }
    }

    const loadIntentos = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await simulacrosAdminService.getIntentos({
                cursoId: selectedCurso
            })

            if (result.success) {
                setIntentos(result.data.intentos || [])
                const stats = simulacrosAdminService.calcularEstadisticas(result.data.intentos || [])
                setEstadisticas(stats)
            } else {
                setError(result.error || 'Error cargando intentos')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const loadCompleteStats = async () => {
        try {
            setLoadingStats(true)
            setError('')

            if (!selectedCurso) {
                setError('Por favor selecciona un curso para ver las estadísticas completas')
                setLoadingStats(false)
                return
            }

            const result = await simulacrosAdminService.getStats(selectedCurso)

            if (result.success) {
                setEstadisticasCompletas(result.data)
                setSuccess('✅ Estadísticas completas cargadas correctamente')
                setTimeout(() => setSuccess(''), 3000)
            } else {
                setError(result.error || 'Error cargando estadísticas completas')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoadingStats(false)
        }
    }

    const handleSelectIntento = (intentoId) => {
        setSelectedIntentos(prev => {
            if (prev.includes(intentoId)) {
                return prev.filter(id => id !== intentoId)
            } else {
                return [...prev, intentoId]
            }
        })
    }

    const handleSelectAll = () => {
        if (selectedIntentos.length === intentos.length) {
            setSelectedIntentos([])
        } else {
            setSelectedIntentos(intentos.map(i => i.id))
        }
    }

    const handleDeleteConfirm = () => {
        if (selectedIntentos.length === 0) {
            setError('Selecciona al menos un intento para eliminar')
            return
        }
        setShowDeleteModal(true)
    }

    const handleDeleteExecute = async () => {
        try {
            setDeleteLoading(true)
            setError('')

            const result = await simulacrosAdminService.eliminarIntentos(selectedIntentos)

            if (result.success) {
                setSuccess(`✅ ${result.data.intentos_eliminados} intentos y ${result.data.respuestas_eliminadas} respuestas eliminadas correctamente`)
                setSelectedIntentos([])
                setShowDeleteModal(false)

                // Recargar datos
                if (selectedCurso) {
                    await loadIntentos()
                } else {
                    await loadInitialData()
                }
            } else {
                setError(result.error || 'Error eliminando intentos')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setDeleteLoading(false)
        }
    }

    // Agrupar datos
    const gruposPorCurso = simulacrosAdminService.agruparPorCurso(intentos)
    const gruposPorSimulacro = simulacrosAdminService.agruparPorSimulacro(intentos)

    return (
        <Layout showSidebar={true}>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">
                                    🗑️ Mantenimiento de Simulacros
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Purificación de intentos antiguos para optimizar la base de datos
                                </p>
                                <div className="mt-3 space-y-1">
                                    <p className="text-sm text-amber-600">
                                        ⚠️ Esta sección NO permite crear/editar simulacros. Solo purificar intentos viejos.
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        ℹ️ Por motivos de optimización, solo se muestran los últimos 100 intentos más recientes.
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <button
                                    onClick={loadCompleteStats}
                                    disabled={loadingStats || !selectedCurso}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    title={!selectedCurso ? 'Selecciona un curso primero' : 'Ver estadísticas completas de la base de datos'}
                                >
                                    {loadingStats ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Cargando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                            Ver Estadísticas Completas
                                        </>
                                    )}
                                </button>
                                {!selectedCurso && (
                                    <p className="text-xs text-gray-500">
                                        Selecciona un curso para ver estadísticas
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mensajes */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {success}
                        </div>
                    )}

                    {/* Estadísticas Completas (si están cargadas) */}
                    {estadisticasCompletas && (
                        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold">📊 Estadísticas Completas de Base de Datos</h2>
                                    {estadisticasCompletas.curso && (
                                        <p className="text-purple-100 text-sm mt-1">
                                            Curso: {estadisticasCompletas.curso.titulo}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => setEstadisticasCompletas(null)}
                                    className="text-white hover:text-gray-200 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <p className="text-purple-100 text-sm">Total Intentos (DB)</p>
                                    <p className="text-3xl font-bold">{estadisticasCompletas.resumen?.total_intentos?.toLocaleString() || 0}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <p className="text-purple-100 text-sm">Total Respuestas (DB)</p>
                                    <p className="text-3xl font-bold">{estadisticasCompletas.resumen?.total_respuestas_almacenadas?.toLocaleString() || 0}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <p className="text-purple-100 text-sm">Espacio Estimado</p>
                                    <p className="text-3xl font-bold">{estadisticasCompletas.almacenamiento?.espacio_estimado_mb || 0} MB</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <p className="text-purple-100 text-sm">Usuarios Únicos</p>
                                    <p className="text-3xl font-bold">{estadisticasCompletas.resumen?.usuarios_unicos || 0}</p>
                                </div>
                                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                    <p className="text-purple-100 text-sm">Promedio General</p>
                                    <p className="text-3xl font-bold">{estadisticasCompletas.resumen?.puntaje_promedio?.toFixed(1) || 0}%</p>
                                </div>
                            </div>
                            <p className="text-purple-100 text-sm mt-4">
                                ℹ️ Estas son las estadísticas totales de TODA la base de datos{selectedCurso ? ' para este curso' : ''}, no solo los 100 registros mostrados.
                            </p>
                        </div>
                    )}

                    {/* Estadísticas Generales */}
                    <div className="space-y-2 mb-6">
                        <h3 className="text-sm font-medium text-gray-600">
                            Estadísticas de los 100 intentos más recientes mostrados:
                        </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Intentos Mostrados</p>
                                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalIntentos || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Total Respuestas</p>
                                    <p className="text-2xl font-bold text-gray-900">{estadisticas.totalRespuestas?.toLocaleString() || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-amber-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Espacio Estimado</p>
                                    <p className="text-2xl font-bold text-gray-900">{estadisticas.espacioEstimadoMB || 0} MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Seleccionados</p>
                                    <p className="text-2xl font-bold text-gray-900">{selectedIntentos.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros y Acciones */}
                    <div className="bg-white rounded-lg shadow mb-6 p-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                            {/* Selector de Curso */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filtrar por Curso
                                </label>
                                <select
                                    value={selectedCurso}
                                    onChange={(e) => setSelectedCurso(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Todos los cursos</option>
                                    {cursos.map(curso => (
                                        <option key={curso.id} value={curso.id}>
                                            {curso.titulo}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Vista */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vista
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setVistaActual('cursos')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            vistaActual === 'cursos'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Por Curso
                                    </button>
                                    <button
                                        onClick={() => setVistaActual('simulacros')}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                            vistaActual === 'simulacros'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        Por Simulacro
                                    </button>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Acciones
                                </label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSelectAll}
                                        disabled={intentos.length === 0}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {selectedIntentos.length === intentos.length ? 'Deseleccionar' : 'Seleccionar'} Todos
                                    </button>
                                    <button
                                        onClick={handleDeleteConfirm}
                                        disabled={selectedIntentos.length === 0}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Eliminar Seleccionados
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido */}
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : vistaActual === 'cursos' ? (
                        <VistaPorCurso
                            grupos={gruposPorCurso}
                            selectedIntentos={selectedIntentos}
                            onSelectIntento={handleSelectIntento}
                        />
                    ) : (
                        <VistaPorSimulacro
                            grupos={gruposPorSimulacro}
                            selectedIntentos={selectedIntentos}
                            onSelectIntento={handleSelectIntento}
                        />
                    )}
                </div>
            </div>

            {/* Modal de Confirmación */}
            {showDeleteModal && (
                <DeleteConfirmModal
                    selectedCount={selectedIntentos.length}
                    estadisticas={estadisticas}
                    intentos={intentos.filter(i => selectedIntentos.includes(i.id))}
                    onConfirm={handleDeleteExecute}
                    onCancel={() => setShowDeleteModal(false)}
                    loading={deleteLoading}
                />
            )}
        </Layout>
    )
}

// Componente: Vista por Curso
const VistaPorCurso = ({ grupos, selectedIntentos, onSelectIntento }) => {
    if (Object.keys(grupos).length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">No hay intentos para mostrar</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {Object.entries(grupos).map(([cursoId, grupo]) => (
                <div key={cursoId} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">{grupo.curso.titulo}</h3>
                                <p className="text-blue-100 text-sm mt-1">
                                    {grupo.totalIntentos} intentos • {grupo.totalRespuestas.toLocaleString()} respuestas almacenadas
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={grupo.intentos.every(i => selectedIntentos.includes(i.id))}
                                                onChange={() => {
                                                    const allSelected = grupo.intentos.every(i => selectedIntentos.includes(i.id))
                                                    grupo.intentos.forEach(i => {
                                                        if (allSelected && selectedIntentos.includes(i.id)) {
                                                            onSelectIntento(i.id)
                                                        } else if (!allSelected && !selectedIntentos.includes(i.id)) {
                                                            onSelectIntento(i.id)
                                                        }
                                                    })
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Simulacro</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuestas</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {grupo.intentos.map(intento => (
                                        <tr key={intento.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIntentos.includes(intento.id)}
                                                    onChange={() => onSelectIntento(intento.id)}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{intento.usuario.nombre}</div>
                                                <div className="text-sm text-gray-500">{intento.usuario.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{intento.simulacro.titulo}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(intento.fecha_intento).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    intento.resultados.puntaje >= 80 ? 'bg-green-100 text-green-800' :
                                                    intento.resultados.puntaje >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {intento.resultados.puntaje}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {intento.almacenamiento.respuestas_guardadas}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Componente: Vista por Simulacro
const VistaPorSimulacro = ({ grupos, selectedIntentos, onSelectIntento }) => {
    if (Object.keys(grupos).length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-lg">No hay intentos para mostrar</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {Object.entries(grupos).map(([simulacroId, grupo]) => (
                <div key={simulacroId} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-white">{grupo.simulacro.titulo}</h3>
                                <p className="text-purple-100 text-sm mt-1">
                                    {grupo.curso.titulo} • {grupo.totalIntentos} intentos • {grupo.totalRespuestas.toLocaleString()} respuestas
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            <input
                                                type="checkbox"
                                                checked={grupo.intentos.every(i => selectedIntentos.includes(i.id))}
                                                onChange={() => {
                                                    const allSelected = grupo.intentos.every(i => selectedIntentos.includes(i.id))
                                                    grupo.intentos.forEach(i => {
                                                        if (allSelected && selectedIntentos.includes(i.id)) {
                                                            onSelectIntento(i.id)
                                                        } else if (!allSelected && !selectedIntentos.includes(i.id)) {
                                                            onSelectIntento(i.id)
                                                        }
                                                    })
                                                }}
                                                className="rounded border-gray-300"
                                            />
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Respuestas</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {grupo.intentos.map(intento => (
                                        <tr key={intento.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIntentos.includes(intento.id)}
                                                    onChange={() => onSelectIntento(intento.id)}
                                                    className="rounded border-gray-300"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{intento.usuario.nombre}</div>
                                                <div className="text-sm text-gray-500">{intento.usuario.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(intento.fecha_intento).toLocaleDateString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    intento.resultados.puntaje >= 80 ? 'bg-green-100 text-green-800' :
                                                    intento.resultados.puntaje >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {intento.resultados.puntaje}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {intento.resultados.tiempo_empleado_minutos} min
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {intento.almacenamiento.respuestas_guardadas}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Modal de Confirmación
const DeleteConfirmModal = ({ selectedCount, estadisticas, intentos, onConfirm, onCancel, loading }) => {
    const selectedStats = simulacrosAdminService.calcularEstadisticas(intentos)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h3>
                            <p className="text-gray-600">Esta acción no se puede deshacer</p>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-amber-800">
                            ⚠️ <strong>IMPORTANTE:</strong> Esta acción eliminará permanentemente los intentos seleccionados y todas sus respuestas asociadas.
                            Los simulacros, preguntas y opciones NO serán afectados.
                        </p>
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Intentos a eliminar</p>
                                <p className="text-2xl font-bold text-gray-900">{selectedStats.totalIntentos}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Respuestas a eliminar</p>
                                <p className="text-2xl font-bold text-gray-900">{selectedStats.totalRespuestas.toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Espacio a liberar</p>
                                <p className="text-2xl font-bold text-green-600">{selectedStats.espacioEstimadoMB} MB</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600">Porcentaje del total</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {((selectedStats.totalIntentos / estadisticas.totalIntentos) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Eliminando...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Sí, Eliminar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SimulacrosMantenimiento
