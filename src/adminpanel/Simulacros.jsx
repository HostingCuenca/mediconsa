import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import courseManagementService from '../services/courseManagement'
import coursesService from '../services/courses'

const Simulacros = () => {
    const navigate = useNavigate()

    // ========== ESTADOS ==========
    const [simulacros, setSimulacros] = useState([])
    const [cursos, setCursos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Filtros
    const [filters, setFilters] = useState({
        search: '',
        curso: '',
        estado: '',
        modo: ''
    })

    // ========== EFECTOS ==========
    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadData = async () => {
        try {
            setLoading(true)
            setError('')

            // Usar el servicio que YA TIENES para obtener cursos
            const cursosResult = await coursesService.getAllCourses()

            if (!cursosResult.success) {
                throw new Error(cursosResult.error || 'Error obteniendo cursos')
            }

            const cursosData = cursosResult.data.cursos || []
            setCursos(cursosData)

            // Para cada curso, obtener sus simulacros usando el endpoint que ya funciona
            const allSimulacros = []

            for (const curso of cursosData) {
                try {
                    const courseResult = await courseManagementService.getCourseForEditing(curso.id)

                    if (courseResult.success && courseResult.data?.simulacros) {
                        courseResult.data.simulacros.forEach(simulacro => {
                            allSimulacros.push({
                                ...simulacro,
                                curso_titulo: curso.titulo,
                                curso_id: curso.id
                            })
                        })
                    }
                } catch (courseError) {
                    // Si un curso falla, continuar con los demás
                    console.warn(`Error cargando simulacros del curso ${curso.titulo}:`, courseError)
                }
            }

            setSimulacros(allSimulacros)

        } catch (error) {
            console.error('Error cargando datos:', error)
            setError('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // ========== FUNCIONES DE FILTRADO ==========
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const getFilteredSimulacros = () => {
        let filtered = [...simulacros]

        // Filtro por búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(sim =>
                sim.titulo.toLowerCase().includes(searchLower) ||
                sim.curso_titulo?.toLowerCase().includes(searchLower) ||
                sim.descripcion?.toLowerCase().includes(searchLower)
            )
        }

        // Filtro por curso
        if (filters.curso) {
            filtered = filtered.filter(sim => sim.curso_id === parseInt(filters.curso))
        }

        // Filtro por estado
        if (filters.estado) {
            if (filters.estado === 'completo') {
                filtered = filtered.filter(sim => (sim.total_preguntas || 0) >= sim.numero_preguntas)
            } else if (filters.estado === 'incompleto') {
                filtered = filtered.filter(sim => (sim.total_preguntas || 0) < sim.numero_preguntas)
            } else if (filters.estado === 'sin_preguntas') {
                filtered = filtered.filter(sim => !sim.total_preguntas || sim.total_preguntas === 0)
            }
        }

        // Filtro por modo
        if (filters.modo) {
            filtered = filtered.filter(sim =>
                sim.modo_estudio === filters.modo ||
                sim.modo_evaluacion === filters.modo
            )
        }

        // Ordenar por fecha más reciente
        return filtered.sort((a, b) => {
            const dateA = new Date(a.created_at || a.fecha_creacion || 0)
            const dateB = new Date(b.created_at || b.fecha_creacion || 0)
            return dateB - dateA
        })
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            curso: '',
            estado: '',
            modo: ''
        })
    }

    // ========== ACCIONES ==========
    const handleDeleteSimulacro = async (simulacroId, titulo) => {
        if (!window.confirm(`¿Estás seguro de eliminar el simulacro "${titulo}"? Esta acción no se puede deshacer.`)) {
            return
        }

        try {
            const result = await courseManagementService.deleteSimulacro(simulacroId)
            if (result.success) {
                setSimulacros(prev => prev.filter(sim => sim.id !== simulacroId))
                setSuccess(result.message || 'Simulacro eliminado exitosamente')
            } else {
                setError(result.error || 'Error eliminando simulacro')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        }
    }

    // ========== UTILIDADES ==========
    const getModoLabel = (modo) => {
        const modos = {
            'estudio': '📚 Estudio',
            'revision': '🔄 Revisión',
            'evaluacion': '📝 Evaluación',
            'examen_real': '🎯 Examen Real',
            'practica': '📚 Práctica',
            'realista': '📝 Realista',
            'examen': '🎯 Examen'
        }
        return modos[modo] || modo
    }

    const getModoColor = (modo) => {
        const colors = {
            'estudio': 'bg-green-100 text-green-800',
            'revision': 'bg-blue-100 text-blue-800',
            'evaluacion': 'bg-yellow-100 text-yellow-800',
            'examen_real': 'bg-red-100 text-red-800',
            'practica': 'bg-green-100 text-green-800',
            'realista': 'bg-yellow-100 text-yellow-800',
            'examen': 'bg-red-100 text-red-800'
        }
        return colors[modo] || 'bg-gray-100 text-gray-800'
    }

    const getStatusInfo = (simulacro) => {
        const actual = simulacro.total_preguntas || 0
        const total = simulacro.numero_preguntas || 0

        if (total === 0) {
            return {
                status: 'Configurar',
                color: 'bg-gray-100 text-gray-800',
                percentage: 0
            }
        }

        const percentage = Math.round((actual / total) * 100)

        if (actual >= total) {
            return {
                status: 'Completo',
                color: 'bg-green-100 text-green-800',
                percentage
            }
        } else if (actual === 0) {
            return {
                status: 'Sin preguntas',
                color: 'bg-gray-100 text-gray-800',
                percentage: 0
            }
        } else {
            return {
                status: `${actual}/${total}`,
                color: 'bg-orange-100 text-orange-800',
                percentage
            }
        }
    }

    const getTiempoLabel = (simulacro) => {
        if (simulacro.tipo_tiempo === 'sin_limite') return 'Sin límite'
        if (simulacro.tiempo_limite_minutos) {
            const horas = Math.floor(simulacro.tiempo_limite_minutos / 60)
            const minutos = simulacro.tiempo_limite_minutos % 60
            if (horas > 0) {
                return `${horas}h ${minutos}min`
            }
            return `${minutos} min`
        }
        return 'No definido'
    }

    // ========== RENDER ==========
    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando simulacros...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    const filteredSimulacros = getFilteredSimulacros()

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue mb-2">Gestión de Simulacros</h1>
                        <p className="text-medico-gray">Administra todos los simulacros de tus cursos</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{simulacros.length} simulacros totales</span>
                            <span>•</span>
                            <span>{filteredSimulacros.length} mostrados</span>
                            <span>•</span>
                            <span>{cursos.length} cursos</span>
                        </div>
                    </div>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600">{error}</p>
                        </div>
                        <button onClick={() => setError('')} className="mt-2 text-red-700 underline text-sm">
                            Cerrar
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-600">{success}</p>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                placeholder="Buscar simulacros..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                            <select
                                name="curso"
                                value={filters.curso}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos los cursos</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>{curso.titulo}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                name="estado"
                                value={filters.estado}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                <option value="completo">✅ Completo</option>
                                <option value="incompleto">⚠️ Incompleto</option>
                                <option value="sin_preguntas">❌ Sin preguntas</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Modo</label>
                            <select
                                name="modo"
                                value={filters.modo}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos los modos</option>
                                <option value="estudio">📚 Estudio</option>
                                <option value="revision">🔄 Revisión</option>
                                <option value="evaluacion">📝 Evaluación</option>
                                <option value="examen_real">🎯 Examen Real</option>
                                <option value="practica">📚 Práctica</option>
                                <option value="realista">📝 Realista</option>
                                <option value="examen">🎯 Examen</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={resetFilters}
                                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de simulacros */}
                {filteredSimulacros.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSimulacros.map((simulacro) => {
                            const statusInfo = getStatusInfo(simulacro)
                            const modo = simulacro.modo_estudio || simulacro.modo_evaluacion || 'estudio'

                            return (
                                <div key={simulacro.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                    {/* Header de la tarjeta */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getModoColor(modo)}`}>
                                                {getModoLabel(modo)}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${statusInfo.color}`}>
                                            {statusInfo.status}
                                        </span>
                                    </div>

                                    {/* Título y curso */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {simulacro.titulo}
                                    </h3>

                                    <p className="text-sm text-medico-blue mb-3 font-medium">
                                        📚 {simulacro.curso_titulo}
                                    </p>

                                    {simulacro.descripcion && (
                                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                            {simulacro.descripcion}
                                        </p>
                                    )}

                                    {/* Información del simulacro */}
                                    <div className="text-sm text-gray-600 mb-4 space-y-1">
                                        <div className="flex justify-between">
                                            <span>Preguntas:</span>
                                            <span className="font-medium">{simulacro.total_preguntas || 0}/{simulacro.numero_preguntas}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tiempo:</span>
                                            <span className="font-medium">{getTiempoLabel(simulacro)}</span>
                                        </div>
                                        {simulacro.intentos_permitidos && (
                                            <div className="flex justify-between">
                                                <span>Intentos:</span>
                                                <span className="font-medium">
                                                    {simulacro.intentos_permitidos === -1 ? 'Ilimitados' : simulacro.intentos_permitidos}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Barra de progreso */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                                            <span>Progreso</span>
                                            <span>{statusInfo.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-medico-blue h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${statusInfo.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Acciones */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <button
                                            onClick={() => navigate(`/admin/simulacro/${simulacro.id}`)}
                                            className="bg-purple-100 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                        >
                                            <span>⚙️</span>
                                            <span>Configurar</span>
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/questions/${simulacro.id}`)}
                                            className="bg-green-100 text-green-700 py-2 px-3 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                        >
                                            <span>❓</span>
                                            <span>Preguntas</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/course/${simulacro.curso_id}`)}
                                            className="bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                        >
                                            <span>📚</span>
                                            <span>Ver Curso</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteSimulacro(simulacro.id, simulacro.titulo)}
                                            className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                        >
                                            <span>🗑️</span>
                                            <span>Eliminar</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🧪</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {simulacros.length === 0 ? 'No hay simulacros' : 'No se encontraron simulacros'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {simulacros.length === 0
                                ? 'Los simulacros se crean desde la gestión de cada curso'
                                : 'Intenta cambiar los filtros de búsqueda'
                            }
                        </p>
                        {simulacros.length > 0 && (
                            <button
                                onClick={resetFilters}
                                className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Simulacros