import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import enrollmentsService from '../services/enrollments'
import coursesService from '../services/courses'
import api from '../services/api' // Para llamadas directas a materiales

const MyCourses = () => {
    const navigate = useNavigate()
    const { perfil, isAuthenticated } = useAuth()

    // ========== ESTADOS PRINCIPALES ==========
    const [activeTab, setActiveTab] = useState('my-courses') // 'my-courses' | 'explore-courses' | 'course-materials'

    // Estados para MIS CURSOS
    const [myCoursesData, setMyCoursesData] = useState({
        inscripciones: [],
        total: 0
    })

    // Estados para EXPLORAR CURSOS
    const [availableCoursesData, setAvailableCoursesData] = useState({
        cursos: [],
        total: 0
    })

    // ⭐ NUEVOS ESTADOS PARA MATERIALES
    const [materialsData, setMaterialsData] = useState({
        materiales: [],
        curso: null,
        estadisticas: {
            total_materiales: 0,
            gratuitos: 0,
            de_pago: 0
        }
    })
    const [selectedCourseId, setSelectedCourseId] = useState(null)
    const [selectedCourseName, setSelectedCourseName] = useState('')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [materialsLoading, setMaterialsLoading] = useState(false)

    // ========== ESTADOS DE FILTROS ==========
    const [myCoursesFilters, setMyCoursesFilters] = useState({
        search: '',
        status: 'all',
        progress: 'all'
    })

    const [exploreFilters, setExploreFilters] = useState({
        search: '',
        tipo: '',
        gratuito: 'all'
    })

    // ⭐ FILTROS PARA MATERIALES
    const [materialsFilters, setMaterialsFilters] = useState({
        search: '',
        tipo: 'all'
    })

    // ========== ESTADOS DE UI ==========
    const [sortBy, setSortBy] = useState('fecha_inscripcion')
    const [exploreSortBy, setExploreSortBy] = useState('fecha_creacion')
    const [materialsSortBy, setMaterialsSortBy] = useState('fecha_creacion')

    const [showStats, setShowStats] = useState(true)

    // Estados para inscripción
    const [enrollingCourseId, setEnrollingCourseId] = useState(null)
    const [enrollmentModal, setEnrollmentModal] = useState({
        show: false,
        course: null,
        loading: false
    })

    // ========== EFECTOS ==========
    useEffect(() => {
        if (isAuthenticated) {
            loadInitialData()
        }
    }, [isAuthenticated])

    useEffect(() => {
        if (isAuthenticated && activeTab === 'my-courses') {
            applyMyCoursesFilters()
        }
    }, [myCoursesFilters, sortBy, activeTab])

    useEffect(() => {
        if (isAuthenticated && activeTab === 'explore-courses') {
            applyExploreFilters()
        }
    }, [exploreFilters, exploreSortBy, activeTab])

    // ⭐ NUEVO EFECTO PARA MATERIALES
    useEffect(() => {
        if (isAuthenticated && activeTab === 'course-materials' && selectedCourseId) {
            loadCourseMaterials()
        }
    }, [selectedCourseId, materialsFilters, materialsSortBy, activeTab])

    // ========== FUNCIONES DE CARGA ==========
    const loadInitialData = async () => {
        try {
            setLoading(true)
            setError('')

            if (activeTab === 'my-courses') {
                await loadMyCoursesData()
            } else if (activeTab === 'explore-courses') {
                await loadAvailableCoursesData()
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const loadMyCoursesData = async () => {
        const result = await enrollmentsService.getMyEnrollments()
        if (result.success) {
            setMyCoursesData(result.data)
        } else {
            setError(result.error || 'Error cargando tus cursos')
        }
    }

    const loadAvailableCoursesData = async () => {
        const result = await coursesService.getAllCourses()
        if (result.success) {
            setAvailableCoursesData(result.data)
        } else {
            setError(result.error || 'Error cargando cursos disponibles')
        }
    }

    // ⭐ NUEVA FUNCIÓN PARA CARGAR MATERIALES
    const loadCourseMaterials = async () => {
        if (!selectedCourseId) return

        try {
            setMaterialsLoading(true)
            setError('')

            const response = await api.get(`/materiales/course/${selectedCourseId}`)

            if (response.data.success) {
                let materiales = response.data.data.materiales

                // Aplicar filtros
                if (materialsFilters.search.trim()) {
                    const searchTerm = materialsFilters.search.toLowerCase()
                    materiales = materiales.filter(material =>
                        material.titulo.toLowerCase().includes(searchTerm) ||
                        (material.descripcion && material.descripcion.toLowerCase().includes(searchTerm))
                    )
                }

                if (materialsFilters.tipo !== 'all') {
                    if (materialsFilters.tipo === 'gratuito') {
                        materiales = materiales.filter(material => material.es_gratuito === true)
                    } else if (materialsFilters.tipo === 'pago') {
                        materiales = materiales.filter(material => material.es_gratuito === false)
                    }
                }

                // Aplicar ordenamiento
                materiales.sort((a, b) => {
                    switch (materialsSortBy) {
                        case 'titulo':
                            return a.titulo.localeCompare(b.titulo)
                        case 'precio':
                            return (a.precio || 0) - (b.precio || 0)
                        case 'fecha_creacion':
                        default:
                            return new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
                    }
                })

                // Recalcular estadísticas con filtros aplicados
                const stats = {
                    total_materiales: materiales.length,
                    gratuitos: materiales.filter(m => m.es_gratuito).length,
                    de_pago: materiales.filter(m => !m.es_gratuito).length
                }

                setMaterialsData({
                    materiales,
                    curso: response.data.data.curso,
                    estadisticas: stats
                })
            } else {
                setError(response.data.message || 'Error cargando materiales del curso')
            }
        } catch (error) {
            console.error('Error cargando materiales:', error)
            setError('Error de conexión al cargar materiales')
        } finally {
            setMaterialsLoading(false)
        }
    }

    const applyMyCoursesFilters = async () => {
        try {
            setLoading(true)
            const filterParams = {}

            if (myCoursesFilters.search.trim()) {
                filterParams.search = myCoursesFilters.search.trim()
            }
            if (myCoursesFilters.status !== 'all') {
                filterParams.estado_pago = myCoursesFilters.status
            }

            const result = await enrollmentsService.getMyEnrollments(filterParams)

            if (result.success) {
                let filteredData = result.data.inscripciones

                // Filtrar por progreso
                if (myCoursesFilters.progress !== 'all') {
                    filteredData = filteredData.filter(curso => {
                        const progreso = parseFloat(curso.porcentaje_progreso) || 0
                        switch (myCoursesFilters.progress) {
                            case 'completed':
                                return progreso >= 100
                            case 'in_progress':
                                return progreso > 0 && progreso < 100
                            case 'not_started':
                                return progreso === 0
                            default:
                                return true
                        }
                    })
                }

                // Ordenar
                filteredData.sort((a, b) => {
                    switch (sortBy) {
                        case 'progreso':
                            return (b.porcentaje_progreso || 0) - (a.porcentaje_progreso || 0)
                        case 'titulo':
                            return a.titulo.localeCompare(b.titulo)
                        case 'fecha_inscripcion':
                        default:
                            return new Date(b.fecha_inscripcion) - new Date(a.fecha_inscripcion)
                    }
                })

                setMyCoursesData({
                    inscripciones: filteredData,
                    total: filteredData.length
                })
            }
        } catch (error) {
            console.error('Error aplicando filtros:', error)
        } finally {
            setLoading(false)
        }
    }

    const applyExploreFilters = async () => {
        try {
            setLoading(true)
            const filterParams = {}

            if (exploreFilters.search.trim()) {
                filterParams.search = exploreFilters.search.trim()
            }
            if (exploreFilters.tipo) {
                filterParams.tipo = exploreFilters.tipo
            }
            if (exploreFilters.gratuito !== 'all') {
                filterParams.gratuito = exploreFilters.gratuito
            }

            const result = await coursesService.getAllCourses(filterParams)

            if (result.success) {
                let filteredData = result.data.cursos

                // Ordenar
                filteredData.sort((a, b) => {
                    switch (exploreSortBy) {
                        case 'titulo':
                            return a.titulo.localeCompare(b.titulo)
                        case 'precio':
                            return a.precio - b.precio
                        case 'estudiantes':
                            return (b.estudiantes_inscritos || 0) - (a.estudiantes_inscritos || 0)
                        case 'fecha_creacion':
                        default:
                            return new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
                    }
                })

                setAvailableCoursesData({
                    cursos: filteredData,
                    total: filteredData.length
                })
            }
        } catch (error) {
            console.error('Error aplicando filtros de exploración:', error)
        } finally {
            setLoading(false)
        }
    }

    // ========== FUNCIONES DE INSCRIPCIÓN ==========
    const handleEnrollCourse = async (curso) => {
        setEnrollmentModal({
            show: true,
            course: curso,
            loading: false
        })
    }

    const confirmEnrollment = async () => {
        try {
            setEnrollmentModal(prev => ({ ...prev, loading: true }))

            const result = await enrollmentsService.enrollCourse(enrollmentModal.course.id)

            if (result.success) {
                setEnrollmentModal({ show: false, course: null, loading: false })

                if (enrollmentModal.course.es_gratuito) {
                    alert('¡Inscripción exitosa! Ya puedes acceder al curso.')
                    if (activeTab === 'my-courses') {
                        await loadMyCoursesData()
                    }
                } else {
                    const whatsappMessage = `Hola, quiero acceso al curso "${enrollmentModal.course.titulo}". Precio: $${enrollmentModal.course.precio}`
                    const whatsappUrl = `https://wa.me/+593981833667?text=${encodeURIComponent(whatsappMessage)}`

                    if (window.confirm(`Solicitud enviada. ¿Quieres contactar por WhatsApp para completar el pago?`)) {
                        window.open(whatsappUrl, '_blank')
                    }
                }
            } else {
                alert(result.error || 'Error en la inscripción')
            }
        } catch (error) {
            console.error('Error inscripción:', error)
            alert('Error de conexión')
        } finally {
            setEnrollmentModal(prev => ({ ...prev, loading: false }))
        }
    }

    // ========== NAVEGACIÓN ==========
    const goToCourse = (curso) => {
        const cursoId = curso.curso_id || curso.id
        if (!cursoId) {
            console.error('No se encontró ID del curso:', curso)
            alert('Error: No se puede abrir el curso')
            return
        }
        navigate(`/estudiar/${cursoId}`)
    }

    const goToCourseProgress = (curso) => {
        const cursoId = curso.curso_id || curso.id
        if (!cursoId) {
            console.error('No se encontró ID del curso:', curso)
            return
        }
        navigate(`/estudiar/${cursoId}`)
    }

    // ⭐ NUEVA FUNCIÓN PARA IR A MATERIALES
    const goToCourseMaterials = (curso) => {
        const cursoId = curso.curso_id || curso.id
        const cursoTitulo = curso.titulo || curso.curso_titulo

        if (!cursoId) {
            console.error('No se encontró ID del curso:', curso)
            alert('Error: No se puede acceder a los materiales')
            return
        }

        setSelectedCourseId(cursoId)
        setSelectedCourseName(cursoTitulo)
        setActiveTab('course-materials')
        setMaterialsFilters({ search: '', tipo: 'all' })
        setMaterialsSortBy('fecha_creacion')
    }

    // ⭐ FUNCIÓN PARA DESCARGAR MATERIAL
    const downloadMaterial = (material) => {
        if (!material.archivo_url) {
            alert('URL de archivo no disponible')
            return
        }
        window.open(material.archivo_url, '_blank')
    }

    // ========== FUNCIONES DE UTILIDAD ==========
    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount) => {
        if (!amount) return 'Gratis'
        return `$${parseFloat(amount).toFixed(2)}`
    }

    const getProgressColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500'
        if (percentage >= 50) return 'bg-blue-500'
        if (percentage >= 25) return 'bg-yellow-500'
        return 'bg-gray-300'
    }

    const getStatusColor = (estado) => {
        const colors = {
            'habilitado': 'bg-green-100 text-green-800',
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'rechazado': 'bg-red-100 text-red-800'
        }
        return colors[estado] || 'bg-gray-100 text-gray-800'
    }

    const getStatusText = (estado) => {
        const texts = {
            'habilitado': 'Activo',
            'pendiente': 'Pago Pendiente',
            'rechazado': 'Rechazado'
        }
        return texts[estado] || 'Desconocido'
    }

    // ⭐ FUNCIÓN PARA ICONO DE ARCHIVO
    const getFileIcon = (tipoArchivo) => {
        const icons = {
            'pdf': '📄',
            'doc': '📝', 'docx': '📝',
            'xls': '📊', 'xlsx': '📊',
            'ppt': '📽️', 'pptx': '📽️',
            'zip': '🗜️', 'rar': '🗜️',
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️',
            'mp4': '🎥', 'avi': '🎥', 'mov': '🎥',
            'mp3': '🎵', 'wav': '🎵'
        }
        return icons[tipoArchivo?.toLowerCase()] || '📎'
    }

    const calculateMyCoursesStats = () => {
        const stats = {
            total: myCoursesData.inscripciones.length,
            activos: 0,
            pendientes: 0,
            completados: 0,
            progresoPromedio: 0
        }

        let sumaProgreso = 0

        myCoursesData.inscripciones.forEach(curso => {
            const progreso = parseFloat(curso.porcentaje_progreso) || 0
            sumaProgreso += progreso

            if (curso.estado_pago === 'habilitado') {
                stats.activos++
            } else if (curso.estado_pago === 'pendiente') {
                stats.pendientes++
            }

            if (progreso >= 100) {
                stats.completados++
            }
        })

        stats.progresoPromedio = stats.total > 0 ? Math.round(sumaProgreso / stats.total) : 0
        return stats
    }

    const isEnrolledInCourse = (cursoId) => {
        return myCoursesData.inscripciones.some(inscripcion =>
            (inscripcion.curso_id === cursoId) || (inscripcion.id === cursoId)
        )
    }

    // ========== FUNCIONES DE EVENTOS ==========
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setError('')
        setLoading(true)

        if (tab !== 'course-materials') {
            loadInitialData()
        } else {
            setLoading(false)
        }
    }

    const handleMyCoursesFilterChange = (key, value) => {
        setMyCoursesFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const handleExploreFilterChange = (key, value) => {
        setExploreFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    // ⭐ NUEVA FUNCIÓN PARA FILTROS DE MATERIALES
    const handleMaterialsFilterChange = (key, value) => {
        setMaterialsFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const clearMyCoursesFilters = () => {
        setMyCoursesFilters({
            search: '',
            status: 'all',
            progress: 'all'
        })
        setSortBy('fecha_inscripcion')
    }

    const clearExploreFilters = () => {
        setExploreFilters({
            search: '',
            tipo: '',
            gratuito: 'all'
        })
        setExploreSortBy('fecha_creacion')
    }

    // ⭐ NUEVA FUNCIÓN PARA LIMPIAR FILTROS DE MATERIALES
    const clearMaterialsFilters = () => {
        setMaterialsFilters({
            search: '',
            tipo: 'all'
        })
        setMaterialsSortBy('fecha_creacion')
    }

    const myCoursesStats = calculateMyCoursesStats()

    // ========== RENDER ==========
    if (loading && activeTab === 'my-courses' && myCoursesData.inscripciones.length === 0) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* ========== HEADER CON PESTAÑAS ========== */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue mb-4">
                        {activeTab === 'course-materials' ? `Materiales: ${selectedCourseName}` : 'Mis Cursos'}
                    </h1>

                    {/* Pestañas */}
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => handleTabChange('my-courses')}
                            className={`px-6 py-3 rounded-md font-medium transition-colors ${
                                activeTab === 'my-courses'
                                    ? 'bg-white text-medico-blue shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Mis Cursos ({myCoursesData.total})
                        </button>
                        <button
                            onClick={() => handleTabChange('explore-courses')}
                            className={`px-6 py-3 rounded-md font-medium transition-colors ${
                                activeTab === 'explore-courses'
                                    ? 'bg-white text-medico-blue shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            Explorar Cursos ({availableCoursesData.total})
                        </button>
                        {/* ⭐ NUEVA PESTAÑA DE MATERIALES */}
                        {selectedCourseId && (
                            <button
                                onClick={() => handleTabChange('course-materials')}
                                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                                    activeTab === 'course-materials'
                                        ? 'bg-white text-medico-blue shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                📚 Materiales ({materialsData.estadisticas.total_materiales})
                            </button>
                        )}
                    </div>

                    {/* ⭐ BOTÓN PARA VOLVER DESDE MATERIALES */}
                    {activeTab === 'course-materials' && (
                        <button
                            onClick={() => handleTabChange('my-courses')}
                            className="mt-4 flex items-center text-medico-blue hover:text-blue-700 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver a mis cursos
                        </button>
                    )}
                </div>

                {/* Mensaje de error */}
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

                {/* ========== CONTENIDO SEGÚN PESTAÑA ========== */}
                {activeTab === 'my-courses' ? (
                    <div>
                        {/* Estadísticas para Mis Cursos */}
                        {showStats && myCoursesData.inscripciones.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-medico-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                        </svg>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{myCoursesStats.total}</p>
                                            <p className="text-sm text-gray-600">Total Cursos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{myCoursesStats.activos}</p>
                                            <p className="text-sm text-gray-600">Activos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{myCoursesStats.pendientes}</p>
                                            <p className="text-sm text-gray-600">Pendientes</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{myCoursesStats.progresoPromedio}%</p>
                                            <p className="text-sm text-gray-600">Progreso Prom.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filtros para Mis Cursos */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Buscar mis cursos..."
                                            value={myCoursesFilters.search}
                                            onChange={(e) => handleMyCoursesFilterChange('search', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <select
                                        value={myCoursesFilters.status}
                                        onChange={(e) => handleMyCoursesFilterChange('status', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                    >
                                        <option value="all">Todos los estados</option>
                                        <option value="habilitado">Activos</option>
                                        <option value="pendiente">Pendientes</option>
                                    </select>

                                    <select
                                        value={myCoursesFilters.progress}
                                        onChange={(e) => handleMyCoursesFilterChange('progress', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                    >
                                        <option value="all">Todo el progreso</option>
                                        <option value="completed">Completados</option>
                                        <option value="in_progress">En progreso</option>
                                        <option value="not_started">Sin empezar</option>
                                    </select>

                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                    >
                                        <option value="fecha_inscripcion">Más recientes</option>
                                        <option value="progreso">Por progreso</option>
                                        <option value="titulo">Alfabético</option>
                                    </select>

                                    <button
                                        onClick={clearMyCoursesFilters}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Mis Cursos */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medico-blue mx-auto"></div>
                                <p className="mt-2 text-medico-gray">Cargando mis cursos...</p>
                            </div>
                        )}

                        {!loading && myCoursesData.inscripciones.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myCoursesData.inscripciones.map((curso) => {
                                    const progress = parseFloat(curso.porcentaje_progreso) || 0
                                    return (
                                        <div key={curso.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Miniatura */}
                                            <div className="relative">
                                                {curso.miniatura_url ? (
                                                    <img
                                                        src={curso.miniatura_url}
                                                        alt={curso.titulo}
                                                        className="w-full h-48 object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none'
                                                            e.target.nextSibling.style.display = 'flex'
                                                        }}
                                                    />
                                                ) : null}

                                                {/* Fallback para imagen */}
                                                <div className="w-full h-48 bg-medico-blue flex items-center justify-center" style={{ display: curso.miniatura_url ? 'none' : 'flex' }}>
                                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                                    </svg>
                                                </div>

                                                <div className="absolute top-3 right-3">
                                                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(curso.estado_pago)}`}>
                                                       {getStatusText(curso.estado_pago)}
                                                   </span>
                                                </div>

                                                {/* Badge de precio */}
                                                <div className="absolute top-3 left-3">
                                                    {curso.es_gratuito ? (
                                                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                           Gratuito
                                                       </span>
                                                    ) : (
                                                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                           {formatCurrency(curso.precio)}
                                                       </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contenido */}
                                            <div className="p-6">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                                    {curso.titulo || curso.curso_titulo}
                                                </h3>

                                                {curso.instructor_nombre && (
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        Instructor: {curso.instructor_nombre}
                                                    </p>
                                                )}

                                                {/* Progreso */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-gray-600">Progreso del curso</span>
                                                        <span className="font-medium">{progress}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                                                            style={{ width: `${progress}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {curso.clases_completadas || 0} de {curso.total_clases || 0} clases completadas
                                                    </p>
                                                </div>

                                                {/* Información adicional */}
                                                <div className="text-sm text-gray-600 mb-4 space-y-1">
                                                    <p>Inscrito: {formatDate(curso.fecha_inscripcion)}</p>
                                                    {curso.tipo_examen && (
                                                        <p>Tipo: {curso.tipo_examen}</p>
                                                    )}
                                                    {curso.fecha_habilitacion && (
                                                        <p>Habilitado: {formatDate(curso.fecha_habilitacion)}</p>
                                                    )}
                                                </div>

                                                {/* Acciones CORREGIDAS */}
                                                <div className="flex gap-2">
                                                    {curso.estado_pago === 'habilitado' ? (
                                                        <>
                                                            <button
                                                                onClick={() => goToCourse(curso)}
                                                                className="flex-1 bg-medico-blue text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                {progress > 0 ? 'Continuar' : 'Empezar'}
                                                            </button>
                                                            {/* ⭐ NUEVO BOTÓN DE MATERIALES */}
                                                            <button
                                                                onClick={() => goToCourseMaterials(curso)}
                                                                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                                title="Ver materiales del curso"
                                                            >
                                                                📚
                                                            </button>
                                                        </>
                                                    ) : (
<a
                                                        href={`https://wa.me/+593981833667?text=${encodeURIComponent(`Hola, soy ${perfil?.nombre_usuario} y quiero acceso al curso "${curso.titulo || curso.curso_titulo}". Precio: ${curso.precio}`)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center flex items-center justify-center"
                                                        >
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                        </svg>
                                                        Contactar WhatsApp
                                                        </a>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Estado vacío para Mis Cursos */}
                        {!loading && myCoursesData.inscripciones.length === 0 && (
                            <div className="text-center py-16">
                                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes cursos inscritos</h3>
                                <p className="text-gray-500 mb-6">Explora nuestro catálogo y encuentra el curso perfecto para tu carrera médica</p>
                                <button
                                    onClick={() => handleTabChange('explore-courses')}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Explorar Cursos
                                </button>
                            </div>
                        )}
                    </div>
                ) : activeTab === 'explore-courses' ? (
                    <div>
                        {/* Filtros para Explorar Cursos */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Buscar cursos disponibles..."
                                            value={exploreFilters.search}
                                            onChange={(e) => handleExploreFilterChange('search', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <select
                                        value={exploreFilters.tipo}
                                        onChange={(e) => handleExploreFilterChange('tipo', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                    >
                                        <option value="">Todos los tipos</option>
                                        <option value="medicina_rural">Medicina Rural</option>
                                        <option value="medicina_general">Medicina General</option>
                                        <option value="especialidades">Especialidades</option>
                                        <option value="residencia">Residencia</option>
                                    </select>

                                    <select
                                        value={exploreFilters.gratuito}
                                        onChange={(e) => handleExploreFilterChange('gratuito', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                    >
                                        <option value="all">Todos los precios</option>
                                        <option value="true">Cursos gratuitos</option>
                                        <option value="false">Cursos de pago</option>
                                    </select>

                                    <select
                                        value={exploreSortBy}
                                        onChange={(e) => setExploreSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                    >
                                        <option value="fecha_creacion">Más recientes</option>
                                        <option value="titulo">Alfabético</option>
                                        <option value="precio">Por precio</option>
                                        <option value="estudiantes">Más populares</option>
                                    </select>

                                    <button
                                        onClick={clearExploreFilters}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Cursos Disponibles */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medico-blue mx-auto"></div>
                                <p className="mt-2 text-medico-gray">Cargando cursos disponibles...</p>
                            </div>
                        )}

                        {!loading && availableCoursesData.cursos.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {availableCoursesData.cursos.map((curso) => {
                                    const isEnrolled = isEnrolledInCourse(curso.id)
                                    return (
                                        <div key={curso.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Miniatura */}
                                            <div className="relative">
                                                {curso.miniatura_url ? (
                                                    <img
                                                        src={curso.miniatura_url}
                                                        alt={curso.titulo}
                                                        className="w-full h-48 object-cover"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none'
                                                            e.target.nextSibling.style.display = 'flex'
                                                        }}
                                                    />
                                                ) : null}

                                                {/* Fallback para imagen */}
                                                <div className="w-full h-48 bg-medico-blue flex items-center justify-center" style={{ display: curso.miniatura_url ? 'none' : 'flex' }}>
                                                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                                    </svg>
                                                </div>

                                                {/* Badges */}
                                                <div className="absolute top-3 left-3">
                                                    {curso.es_gratuito ? (
                                                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                           Gratuito
                                                       </span>
                                                    ) : (
                                                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                           {formatCurrency(curso.precio)}
                                                       </span>
                                                    )}
                                                </div>

                                                {isEnrolled && (
                                                    <div className="absolute top-3 right-3">
                                                       <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                           ✓ Inscrito
                                                       </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contenido */}
                                            <div className="p-6">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                                                    {curso.titulo}
                                                </h3>

                                                {curso.instructor_nombre && (
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        Instructor: {curso.instructor_nombre}
                                                    </p>
                                                )}

                                                {curso.descripcion && (
                                                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                        {curso.descripcion}
                                                    </p>
                                                )}

                                                {/* Información del curso */}
                                                <div className="text-sm text-gray-600 mb-4 space-y-1">
                                                    {curso.tipo_examen && (
                                                        <p>Tipo: {curso.tipo_examen}</p>
                                                    )}
                                                    <p>Estudiantes: {curso.estudiantes_inscritos || 0}</p>
                                                    <p>Creado: {formatDate(curso.fecha_creacion)}</p>
                                                    {curso.descuento > 0 && (
                                                        <p className="text-green-600">Descuento: {curso.descuento}%</p>
                                                    )}
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex gap-2">
                                                    {isEnrolled ? (
                                                        <button
                                                            onClick={() => goToCourse({ id: curso.id })}
                                                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            Ir al Curso
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleEnrollCourse(curso)}
                                                                disabled={enrollingCourseId === curso.id}
                                                                className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center"
                                                            >
                                                                {enrollingCourseId === curso.id ? (
                                                                    <>
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                        Inscribiendo...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                                        </svg>
                                                                        Inscribirse
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/curso/${curso.id}`)}
                                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                                title="Ver información del curso"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Estado vacío para Explorar Cursos */}
                        {!loading && availableCoursesData.cursos.length === 0 && (
                            <div className="text-center py-16">
                                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
                                <p className="text-gray-500 mb-6">Intenta ajustar los filtros para encontrar lo que buscas</p>
                                <button
                                    onClick={clearExploreFilters}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // ⭐ NUEVA SECCIÓN DE MATERIALES DEL CURSO
                    <div>
                        {/* Estadísticas para Materiales */}
                        {materialsData.estadisticas.total_materiales > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-medico-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                        </svg>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{materialsData.estadisticas.total_materiales}</p>
                                            <p className="text-sm text-gray-600">Total Materiales</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{materialsData.estadisticas.gratuitos}</p>
                                            <p className="text-sm text-gray-600">Gratuitos</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                    <div className="flex items-center">
                                        <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{materialsData.estadisticas.de_pago}</p>
                                            <p className="text-sm text-gray-600">De Pago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Información del curso */}
                        {materialsData.curso && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-16 h-16 bg-medico-blue rounded-lg flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900">{materialsData.curso.titulo}</h3>
                                        <div className="flex items-center space-x-4 mt-2">
                                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                               materialsData.curso.es_gratuito
                                                   ? 'bg-green-100 text-green-800'
                                                   : 'bg-blue-100 text-blue-800'
                                           }`}>
                                               {materialsData.curso.es_gratuito ? 'Curso Gratuito' : 'Curso de Pago'}
                                           </span>
                                            <span className="text-sm text-gray-600">
                                               {materialsData.estadisticas.total_materiales} materiales disponibles
                                           </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filtros para Materiales */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1 max-w-md">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Buscar materiales..."
                                            value={materialsFilters.search}
                                            onChange={(e) => handleMaterialsFilterChange('search', e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <select
                                        value={materialsFilters.tipo}
                                        onChange={(e) => handleMaterialsFilterChange('tipo', e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                    >
                                        <option value="all">Todos los tipos</option>
                                        <option value="gratuito">Solo gratuitos</option>
                                        <option value="pago">Solo de pago</option>
                                    </select>

                                    <select
                                        value={materialsSortBy}
                                        onChange={(e) => setMaterialsSortBy(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
                                    >
                                        <option value="fecha_creacion">Más recientes</option>
                                        <option value="titulo">Alfabético</option>
                                        <option value="precio">Por precio</option>
                                    </select>

                                    <button
                                        onClick={clearMaterialsFilters}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Materiales */}
                        {materialsLoading && (
                            <div className="text-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medico-blue mx-auto"></div>
                                <p className="mt-2 text-medico-gray">Cargando materiales...</p>
                            </div>
                        )}

                        {!materialsLoading && materialsData.materiales.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {materialsData.materiales.map((material) => (
                                    <div key={material.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                        {/* Header del material */}
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-2xl">
                                                        {getFileIcon(material.tipo_archivo)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                                                            {material.titulo}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {material.es_gratuito ? (
                                                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                           Gratuito
                                                       </span>
                                                    ) : (
                                                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                           {formatCurrency(material.precio)}
                                                       </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Descripción */}
                                            {material.descripcion && (
                                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                    {material.descripcion}
                                                </p>
                                            )}

                                            {/* Información del archivo */}
                                            <div className="text-sm text-gray-600 mb-4 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span>Tipo de archivo:</span>
                                                    <span className="font-medium uppercase">{material.tipo_archivo || 'Desconocido'}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span>Subido:</span>
                                                    <span>{formatDate(material.fecha_creacion)}</span>
                                                </div>
                                                {material.categoria && (
                                                    <div className="flex items-center justify-between">
                                                        <span>Categoría:</span>
                                                        <span className="font-medium">{material.categoria}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => downloadMaterial(material)}
                                                    className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                                                >
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    {material.es_gratuito ? 'Descargar' : 'Ver'}
                                                </button>

                                                {/* Botón de información adicional */}
                                                <button
                                                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                    title="Información del material"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Estado vacío para materiales */}
                        {!materialsLoading && materialsData.materiales.length === 0 && selectedCourseId && (
                            <div className="text-center py-16">
                                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron materiales</h3>
                                <p className="text-gray-500 mb-6">
                                    {materialsFilters.search || materialsFilters.tipo !== 'all'
                                        ? 'Intenta ajustar los filtros para encontrar lo que buscas'
                                        : 'Este curso aún no tiene materiales disponibles'
                                    }
                                </p>
                                {(materialsFilters.search || materialsFilters.tipo !== 'all') && (
                                    <button
                                        onClick={clearMaterialsFilters}
                                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        Limpiar Filtros
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Estado inicial - sin curso seleccionado */}
                        {!selectedCourseId && (
                            <div className="text-center py-16">
                                <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">Selecciona un curso</h3>
                                <p className="text-gray-500 mb-6">Ve a "Mis Cursos" y haz clic en el botón 📚 para ver los materiales de ese curso</p>
                                <button
                                    onClick={() => handleTabChange('my-courses')}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                >
                                    Ir a Mis Cursos
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== MODAL DE CONFIRMACIÓN DE INSCRIPCIÓN ========== */}
                {enrollmentModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Confirmar Inscripción
                            </h3>

                            <div className="mb-6">
                                <div className="flex items-center space-x-4 mb-4">
                                    {enrollmentModal.course?.miniatura_url ? (
                                        <img
                                            src={enrollmentModal.course.miniatura_url}
                                            alt={enrollmentModal.course.titulo}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 bg-medico-blue rounded-lg flex items-center justify-center">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                            </svg>
                                        </div>
                                    )}
                                    <div>
                                        <h4 className="font-medium text-gray-900">{enrollmentModal.course?.titulo}</h4>
                                        <p className="text-sm text-gray-600">
                                            {enrollmentModal.course?.instructor_nombre}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    {enrollmentModal.course?.es_gratuito ? (
                                        <div className="text-center">
                                            <div className="text-green-600 mb-2">
                                                <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">Curso Gratuito</p>
                                            <p className="text-xs text-gray-600">Tendrás acceso inmediato</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-lg font-bold text-gray-900 mb-1">
                                                {formatCurrency(enrollmentModal.course?.precio)}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">Curso de pago</p>
                                            <p className="text-xs text-gray-500">
                                                Deberás completar el pago por WhatsApp para obtener acceso
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEnrollmentModal({ show: false, course: null, loading: false })}
                                    disabled={enrollmentModal.loading}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmEnrollment}
                                    disabled={enrollmentModal.loading}
                                    className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                >
                                    {enrollmentModal.loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Inscribiendo...
                                        </>
                                    ) : (
                                        'Confirmar Inscripción'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== ACCIONES RÁPIDAS ========== */}
                {activeTab === 'my-courses' && myCoursesData.inscripciones.length > 0 && (
                    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                                <svg className="w-8 h-8 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-gray-900">Ver Dashboard</h4>
                                    <p className="text-sm text-gray-600">Resumen de tu progreso</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/simulacros')}
                                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-gray-900">Practicar Simulacros</h4>
                                    <p className="text-sm text-gray-600">Pon a prueba tus conocimientos</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/mi-progreso')}
                                className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-gray-900">Mi Progreso</h4>
                                    <p className="text-sm text-gray-600">Analiza tu rendimiento</p>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default MyCourses