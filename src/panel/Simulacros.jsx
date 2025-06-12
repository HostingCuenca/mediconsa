// src/panel/Simulacros.jsx - PÁGINA COMPLETA DE SIMULACROS
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import simulacrosService from '../services/simulacros'
import enrollmentsService from '../services/enrollments'

const Simulacros = () => {
    const navigate = useNavigate()
    const { isAuthenticated, perfil } = useAuth()

    // ========== ESTADOS PRINCIPALES ==========
    const [activeTab, setActiveTab] = useState('available') // available, my-attempts, stats
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Estados para simulacros disponibles
    const [availableSimulacros, setAvailableSimulacros] = useState([])
    const [myCoursesWithSimulacros, setMyCoursesWithSimulacros] = useState([])

    // Estados para mis intentos
    const [myAttempts, setMyAttempts] = useState([])
    const [attemptsStats, setAttemptsStats] = useState({})

    // Estados de UI
    const [selectedCourse, setSelectedCourse] = useState('all')
    const [filters, setFilters] = useState({
        search: '',
        modoEvaluacion: 'all',
        difficulty: 'all'
    })

    // Estados para modal de simulacro
    const [simulacroModal, setSimulacroModal] = useState({
        show: false,
        simulacro: null,
        loading: false
    })

    // Estados para modal de resultados
    const [resultsModal, setResultsModal] = useState({
        show: false,
        intento: null
    })

    // ========== EFECTOS ==========
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadInitialData()
    }, [isAuthenticated])

    useEffect(() => {
        if (activeTab === 'available') {
            loadAvailableSimulacros()
        } else if (activeTab === 'my-attempts') {
            loadMyAttempts()
        }
    }, [activeTab, selectedCourse, filters])

    // ========== FUNCIONES DE CARGA ==========
    const loadInitialData = async () => {
        try {
            setLoading(true)
            setError('')

            // Cargar mis cursos para obtener simulacros
            const enrollmentsResult = await enrollmentsService.getMyEnrollments()
            if (enrollmentsResult.success) {
                setMyCoursesWithSimulacros(enrollmentsResult.data.inscripciones || [])
            }

            await loadAvailableSimulacros()
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const loadAvailableSimulacros = async () => {
        try {
            const allSimulacros = []

            // Cargar simulacros de cada curso inscrito
            for (const inscripcion of myCoursesWithSimulacros) {
                if (inscripcion.estado_pago === 'habilitado' || inscripcion.es_gratuito) {
                    const simulacrosResult = await simulacrosService.getSimulacrosByCourse(inscripcion.curso_id)
                    if (simulacrosResult.success) {
                        const simulacrosWithCourse = simulacrosResult.data.simulacros.map(simulacro => ({
                            ...simulacro,
                            curso_titulo: inscripcion.titulo || inscripcion.curso_titulo,
                            curso_slug: inscripcion.slug,
                            curso_id: inscripcion.curso_id
                        }))
                        allSimulacros.push(...simulacrosWithCourse)
                    }
                }
            }

            setAvailableSimulacros(allSimulacros)
        } catch (error) {
            console.error('Error cargando simulacros:', error)
        }
    }

    const loadMyAttempts = async () => {
        try {
            const attemptsResult = await simulacrosService.getMyAttempts()
            if (attemptsResult.success) {
                setMyAttempts(attemptsResult.data.intentos || [])
                setAttemptsStats(attemptsResult.data.estadisticas || {})
            }
        } catch (error) {
            console.error('Error cargando intentos:', error)
        }
    }

    // ========== FUNCIONES DE EVENTOS ==========
    const handleStartSimulacro = (simulacro) => {
        setSimulacroModal({
            show: true,
            simulacro,
            loading: false
        })
    }

    const confirmStartSimulacro = async () => {
        try {
            setSimulacroModal(prev => ({ ...prev, loading: true }))

            // Navegar a la página del simulacro
            navigate(`/simulacro/${simulacroModal.simulacro.id}/realizar`)
        } catch (error) {
            console.error('Error:', error)
            alert('Error iniciando simulacro')
        } finally {
            setSimulacroModal({ show: false, simulacro: null, loading: false })
        }
    }

    const handleViewResults = async (intento) => {
        try {
            const detailResult = await simulacrosService.getAttemptDetail(intento.id)
            if (detailResult.success) {
                setResultsModal({
                    show: true,
                    intento: detailResult.data
                })
            } else {
                alert('No se pudo cargar el detalle del intento')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error cargando resultados')
        }
    }

    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setError('')
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            modoEvaluacion: 'all',
            difficulty: 'all'
        })
        setSelectedCourse('all')
    }

    // ========== FUNCIONES DE UTILIDAD ==========
    const getFilteredSimulacros = () => {
        let filtered = availableSimulacros

        // Filtrar por curso
        if (selectedCourse !== 'all') {
            filtered = filtered.filter(sim => sim.curso_id === selectedCourse)
        }

        // Filtrar por búsqueda
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase()
            filtered = filtered.filter(sim =>
                sim.titulo.toLowerCase().includes(searchTerm) ||
                sim.descripcion?.toLowerCase().includes(searchTerm) ||
                sim.curso_titulo.toLowerCase().includes(searchTerm)
            )
        }

        // Filtrar por modo de evaluación
        if (filters.modoEvaluacion !== 'all') {
            filtered = filtered.filter(sim => sim.modo_evaluacion === filters.modoEvaluacion)
        }

        return filtered
    }

    const getFilteredAttempts = () => {
        let filtered = myAttempts

        // Filtrar por curso
        if (selectedCourse !== 'all') {
            filtered = filtered.filter(attempt => attempt.curso_id === selectedCourse)
        }

        // Filtrar por búsqueda
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase()
            filtered = filtered.filter(attempt =>
                attempt.simulacro_titulo.toLowerCase().includes(searchTerm) ||
                attempt.curso_titulo.toLowerCase().includes(searchTerm)
            )
        }

        return filtered
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible'
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getGradeColor = (puntaje) => {
        if (puntaje >= 80) return 'text-green-600 bg-green-50'
        if (puntaje >= 60) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    const getModoColor = (modo) => {
        const colors = {
            'practica': 'bg-blue-100 text-blue-800',
            'realista': 'bg-yellow-100 text-yellow-800',
            'examen': 'bg-red-100 text-red-800'
        }
        return colors[modo] || 'bg-gray-100 text-gray-800'
    }

    const getModoLabel = (modo) => {
        const labels = {
            'practica': 'Práctica',
            'realista': 'Realista',
            'examen': 'Examen'
        }
        return labels[modo] || modo
    }

    const canRetakeSimulacro = (simulacro) => {
        if (simulacro.intentos_permitidos === -1) return true // Ilimitados
        if (!simulacro.intentos_realizados) return true
        return simulacro.intentos_realizados < simulacro.intentos_permitidos
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
    const filteredAttempts = getFilteredAttempts()

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* ========== HEADER ========== */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue mb-4">Simulacros de Examen</h1>
                    <p className="text-gray-600">
                        Practica con simulacros realistas y mejora tu preparación para los exámenes médicos
                    </p>

                    {/* Pestañas */}
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mt-6">
                        <button
                            onClick={() => handleTabChange('available')}
                            className={`px-6 py-3 rounded-md font-medium transition-colors ${
                                activeTab === 'available'
                                    ? 'bg-white text-medico-blue shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Simulacros Disponibles ({filteredSimulacros.length})
                        </button>
                        <button
                            onClick={() => handleTabChange('my-attempts')}
                            className={`px-6 py-3 rounded-md font-medium transition-colors ${
                                activeTab === 'my-attempts'
                                    ? 'bg-white text-medico-blue shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Mis Intentos ({filteredAttempts.length})
                        </button>
                        <button
                            onClick={() => handleTabChange('stats')}
                            className={`px-6 py-3 rounded-md font-medium transition-colors ${
                                activeTab === 'stats'
                                    ? 'bg-white text-medico-blue shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Estadísticas
                        </button>
                    </div>
                </div>

                {/* ========== MENSAJES DE ERROR ========== */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* ========== FILTROS ========== */}
                {(activeTab === 'available' || activeTab === 'my-attempts') && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Buscar simulacros..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                >
                                    <option value="all">Todos los cursos</option>
                                    {myCoursesWithSimulacros.map(curso => (
                                        <option key={curso.curso_id} value={curso.curso_id}>
                                            {curso.titulo || curso.curso_titulo}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={filters.modoEvaluacion}
                                    onChange={(e) => handleFilterChange('modoEvaluacion', e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                >
                                    <option value="all">Todos los modos</option>
                                    <option value="practica">Práctica</option>
                                    <option value="realista">Realista</option>
                                    <option value="examen">Examen</option>
                                </select>

                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== CONTENIDO SEGÚN PESTAÑA ========== */}
                {activeTab === 'available' && (
                    <div>
                        {filteredSimulacros.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredSimulacros.map((simulacro) => (
                                    <div key={simulacro.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Header */}
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                                        {simulacro.titulo}
                                                    </h3>
                                                    <p className="text-sm text-medico-blue font-medium">
                                                        {simulacro.curso_titulo}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModoColor(simulacro.modo_evaluacion)}`}>
                                                    {getModoLabel(simulacro.modo_evaluacion)}
                                                </span>
                                            </div>

                                            {simulacro.descripcion && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                    {simulacro.descripcion}
                                                </p>
                                            )}

                                            {/* Estadísticas del simulacro */}
                                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="font-semibold text-gray-900">
                                                        {simulacro.numero_preguntas}
                                                    </div>
                                                    <div className="text-gray-600">Preguntas</div>
                                                </div>
                                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                                    <div className="font-semibold text-gray-900">
                                                        {simulacro.tiempo_limite_minutos ? `${simulacro.tiempo_limite_minutos}min` : 'Sin límite'}
                                                    </div>
                                                    <div className="text-gray-600">Tiempo</div>
                                                </div>
                                            </div>

                                            {/* Información de intentos */}
                                            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                                <span>
                                                    Intentos: {simulacro.intentos_realizados || 0}
                                                    {simulacro.intentos_permitidos !== -1 && ` / ${simulacro.intentos_permitidos}`}
                                                </span>
                                                {simulacro.mejor_puntaje && (
                                                    <span className={`font-medium ${getGradeColor(simulacro.mejor_puntaje)}`}>
                                                        Mejor: {simulacro.mejor_puntaje}%
                                                    </span>
                                                )}
                                            </div>

                                            {/* Acciones */}
                                            <div className="space-y-2">
                                                {canRetakeSimulacro(simulacro) ? (
                                                    <button
                                                        onClick={() => handleStartSimulacro(simulacro)}
                                                        className="w-full bg-medico-blue text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center"
                                                    >
                                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {simulacro.intentos_realizados > 0 ? 'Repetir Simulacro' : 'Iniciar Simulacro'}
                                                    </button>
                                                ) : (
                                                    <div className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-lg text-center font-medium">
                                                        Sin intentos disponibles
                                                    </div>
                                                )}

                                                {simulacro.intentos_realizados > 0 && (
                                                    <button
                                                        onClick={() => navigate(`/simulacro/${simulacro.id}/historial`)}
                                                        className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                    >
                                                        Ver Historial
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No hay simulacros disponibles</h3>
                                <p className="text-gray-500 mb-6">
                                    Inscríbete a cursos para acceder a sus simulacros de práctica
                                </p>
                                <button
                                    onClick={() => navigate('/mis-cursos')}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Explorar Cursos
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'my-attempts' && (
                    <div>
                        {filteredAttempts.length > 0 ? (
                            <div className="space-y-4">
                                {filteredAttempts.map((intento) => (
                                    <div key={intento.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-2">
                                                    <h3 className="font-semibold text-lg text-gray-900">
                                                        {intento.simulacro_titulo}
                                                    </h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModoColor(intento.modo_evaluacion)}`}>
                                                        {getModoLabel(intento.modo_evaluacion)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-medico-blue font-medium mb-1">
                                                    {intento.curso_titulo}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(intento.fecha_intento)}
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className={`text-2xl font-bold mb-1 ${getGradeColor(intento.puntaje).split(' ')[0]}`}>
                                                    {intento.puntaje}%
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {intento.respuestas_correctas}/{intento.total_preguntas} correctas
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Tiempo: {simulacrosService.formatTime(intento.tiempo_empleado_minutos)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => handleViewResults(intento)}
                                                className="px-4 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                            >
                                                Ver Resultados
                                            </button>
                                            <button
                                                onClick={() => navigate(`/simulacro/${intento.simulacro_id}/realizar`)}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                            >
                                                Repetir
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No has realizado simulacros aún</h3>
                                <p className="text-gray-500 mb-6">
                                    Comienza a practicar con los simulacros disponibles
                                </p>
                                <button
                                    onClick={() => handleTabChange('available')}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Ver Simulacros Disponibles
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div>
                        {/* Estadísticas generales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {attemptsStats.mejor_puntaje || 0}%
                                        </p>
                                        <p className="text-sm text-gray-600">Mejor Puntaje</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center">
                                    <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {attemptsStats.tiempo_promedio ? simulacrosService.formatTime(attemptsStats.tiempo_promedio) : '0m'}
                                        </p>
                                        <p className="text-sm text-gray-600">Tiempo Promedio</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Gráfico de progreso (simulado) */}
                        {myAttempts.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso en el Tiempo</h3>
                                <div className="space-y-4">
                                    {myAttempts.slice(-5).map((intento, index) => (
                                        <div key={intento.id} className="flex items-center space-x-4">
                                            <div className="w-32 text-sm text-gray-600">
                                                {new Date(intento.fecha_intento).toLocaleDateString('es-ES')}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-900 truncate">
                                                        {intento.simulacro_titulo}
                                                    </span>
                                                    <span className={`text-sm font-medium ${getGradeColor(intento.puntaje).split(' ')[0]}`}>
                                                        {intento.puntaje}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            intento.puntaje >= 80 ? 'bg-green-500' :
                                                                intento.puntaje >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${intento.puntaje}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Análisis por curso */}
                        {myAttempts.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Curso</h3>
                                <div className="space-y-4">
                                    {Object.entries(
                                        myAttempts.reduce((acc, intento) => {
                                            const curso = intento.curso_titulo
                                            if (!acc[curso]) {
                                                acc[curso] = { intentos: 0, puntajeTotal: 0, mejorPuntaje: 0 }
                                            }
                                            acc[curso].intentos++
                                            acc[curso].puntajeTotal += intento.puntaje
                                            acc[curso].mejorPuntaje = Math.max(acc[curso].mejorPuntaje, intento.puntaje)
                                            return acc
                                        }, {})
                                    ).map(([curso, stats]) => (
                                        <div key={curso} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-gray-900">{curso}</h4>
                                                <span className="text-sm text-gray-600">
                                                    {stats.intentos} intento{stats.intentos !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Promedio: </span>
                                                    <span className={`font-medium ${getGradeColor(Math.round(stats.puntajeTotal / stats.intentos)).split(' ')[0]}`}>
                                                        {Math.round(stats.puntajeTotal / stats.intentos)}%
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Mejor: </span>
                                                    <span className={`font-medium ${getGradeColor(stats.mejorPuntaje).split(' ')[0]}`}>
                                                        {stats.mejorPuntaje}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {myAttempts.length === 0 && (
                            <div className="text-center py-16">
                                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No hay estadísticas disponibles</h3>
                                <p className="text-gray-500 mb-6">
                                    Realiza algunos simulacros para ver tus estadísticas de rendimiento
                                </p>
                                <button
                                    onClick={() => handleTabChange('available')}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Comenzar a Practicar
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== MODAL DE CONFIRMACIÓN DE SIMULACRO ========== */}
                {simulacroModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-md mx-4">
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                    Iniciar Simulacro
                                </h3>

                                <div className="mb-6">
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {simulacroModal.simulacro?.titulo}
                                        </h4>
                                        <p className="text-sm text-medico-blue font-medium mb-1">
                                            {simulacroModal.simulacro?.curso_titulo}
                                        </p>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getModoColor(simulacroModal.simulacro?.modo_evaluacion)}`}>
                                            {getModoLabel(simulacroModal.simulacro?.modo_evaluacion)}
                                        </span>
                                    </div>

                                    {simulacroModal.simulacro?.descripcion && (
                                        <p className="text-sm text-gray-600 mb-4">
                                            {simulacroModal.simulacro.descripcion}
                                        </p>
                                    )}

                                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Número de preguntas:</span>
                                            <span className="font-medium">{simulacroModal.simulacro?.numero_preguntas}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tiempo límite:</span>
                                            <span className="font-medium">
                                                {simulacroModal.simulacro?.tiempo_limite_minutos ?
                                                    `${simulacroModal.simulacro.tiempo_limite_minutos} minutos` :
                                                    'Sin límite'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Intentos disponibles:</span>
                                            <span className="font-medium">
                                                {simulacroModal.simulacro?.intentos_permitidos === -1 ?
                                                    'Ilimitados' :
                                                    `${(simulacroModal.simulacro?.intentos_permitidos || 0) - (simulacroModal.simulacro?.intentos_realizados || 0)}`
                                                }
                                            </span>
                                        </div>
                                        {simulacroModal.simulacro?.randomizar_preguntas && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Orden de preguntas:</span>
                                                <span className="font-medium">Aleatorio</span>
                                            </div>
                                        )}
                                    </div>

                                    {simulacroModal.simulacro?.modo_evaluacion === 'examen' && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                                </svg>
                                                <div>
                                                    <p className="text-sm font-medium text-red-800">Modo Examen</p>
                                                    <p className="text-xs text-red-600 mt-1">
                                                        No podrás ver las respuestas correctas hasta completar el simulacro
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSimulacroModal({ show: false, simulacro: null, loading: false })}
                                        disabled={simulacroModal.loading}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmStartSimulacro}
                                        disabled={simulacroModal.loading}
                                        className="flex-1 bg-medico-blue text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center font-medium"
                                    >
                                        {simulacroModal.loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Iniciando...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Iniciar Simulacro
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== MODAL DE RESULTADOS ========== */}
                {resultsModal.show && resultsModal.intento && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Resultados del Simulacro
                                    </h3>
                                    <button
                                        onClick={() => setResultsModal({ show: false, intento: null })}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-2">
                                        {resultsModal.intento.intento.simulacro_titulo}
                                    </h4>
                                    <p className="text-sm text-medico-blue font-medium mb-1">
                                        {resultsModal.intento.intento.curso_titulo}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatDate(resultsModal.intento.intento.fecha_intento)}
                                    </p>
                                </div>

                                {/* Resumen de resultados */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className={`text-2xl font-bold ${getGradeColor(resultsModal.intento.intento.puntaje).split(' ')[0]}`}>
                                            {resultsModal.intento.intento.puntaje}%
                                        </div>
                                        <div className="text-sm text-gray-600">Puntaje</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {resultsModal.intento.intento.respuestas_correctas}
                                        </div>
                                        <div className="text-sm text-gray-600">Correctas</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {resultsModal.intento.intento.total_preguntas - resultsModal.intento.intento.respuestas_correctas}
                                        </div>
                                        <div className="text-sm text-gray-600">Incorrectas</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {simulacrosService.formatTime(resultsModal.intento.intento.tiempo_empleado_minutos)}
                                        </div>
                                        <div className="text-sm text-gray-600">Tiempo</div>
                                    </div>
                                </div>

                                {/* Análisis detallado */}
                                {resultsModal.intento.analisis && (
                                    <div className="mb-6">
                                        <h5 className="font-medium text-gray-900 mb-3">Análisis de Rendimiento</h5>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-blue-800">
                                                {resultsModal.intento.analisis.comentario || 'Buen trabajo completando el simulacro.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Recomendaciones */}
                                {resultsModal.intento.recomendaciones && resultsModal.intento.recomendaciones.length > 0 && (
                                    <div className="mb-6">
                                        <h5 className="font-medium text-gray-900 mb-3">Recomendaciones</h5>
                                        <div className="space-y-2">
                                            {resultsModal.intento.recomendaciones.map((rec, index) => (
                                                <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                    <p className="text-sm text-yellow-800">{rec}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Respuestas detalladas (solo para modo práctica) */}
                                {resultsModal.intento.respuestas && resultsModal.intento.intento.modo_evaluacion === 'practica' && (
                                    <div className="mb-6">
                                        <h5 className="font-medium text-gray-900 mb-3">Revisión de Respuestas</h5>
                                        <div className="space-y-4 max-h-96 overflow-y-auto">
                                            {resultsModal.intento.respuestas.slice(0, 5).map((respuesta, index) => (
                                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            Pregunta {index + 1}
                                                        </p>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            respuesta.es_correcta ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                            {respuesta.es_correcta ? 'Correcta' : 'Incorrecta'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        {respuesta.enunciado}
                                                    </p>
                                                    <div className="text-xs text-gray-600">
                                                        <p>Tu respuesta: <span className="font-medium">{respuesta.respuesta_seleccionada}</span></p>
                                                        {!respuesta.es_correcta && (
                                                            <p>Respuesta correcta: <span className="font-medium text-green-600">{respuesta.respuesta_correcta}</span></p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {resultsModal.intento.respuestas.length > 5 && (
                                                <div className="text-center">
                                                    <p className="text-sm text-gray-500">
                                                        Y {resultsModal.intento.respuestas.length - 5} preguntas más...
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setResultsModal({ show: false, intento: null })}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setResultsModal({ show: false, intento: null })
                                            navigate(`/simulacro/${resultsModal.intento.intento.simulacro_id}/realizar`)
                                        }}
                                        className="flex-1 bg-medico-blue text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Repetir Simulacro
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Simulacros