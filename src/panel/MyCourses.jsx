// // src/panel/MyCourses.jsx - MIS CURSOS + EXPLORAR CURSOS COMPLETO
// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Layout from '../utils/Layout'
// import { useAuth } from '../utils/AuthContext'
// import enrollmentsService from '../services/enrollments'
// import coursesService from '../services/courses'
//
// const MyCourses = () => {
//     const navigate = useNavigate()
//     const { perfil, isAuthenticated } = useAuth()
//
//     // ========== ESTADOS PRINCIPALES ==========
//     const [activeTab, setActiveTab] = useState('my-courses') // 'my-courses' | 'explore-courses'
//
//     // Estados para MIS CURSOS
//     const [myCoursesData, setMyCoursesData] = useState({
//         inscripciones: [],
//         total: 0
//     })
//
//     // Estados para EXPLORAR CURSOS
//     const [availableCoursesData, setAvailableCoursesData] = useState({
//         cursos: [],
//         total: 0
//     })
//
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//
//     // ========== ESTADOS DE FILTROS ==========
//     const [myCoursesFilters, setMyCoursesFilters] = useState({
//         search: '',
//         status: 'all', // all, habilitado, pendiente
//         progress: 'all' // all, completed, in_progress, not_started
//     })
//
//     const [exploreFilters, setExploreFilters] = useState({
//         search: '',
//         tipo: '',
//         gratuito: 'all' // all, true, false
//     })
//
//     // ========== ESTADOS DE UI ==========
//     const [viewMode, setViewMode] = useState('grid') // grid, list
//     const [sortBy, setSortBy] = useState('fecha_inscripcion') // Para mis cursos
//     const [exploreSortBy, setExploreSortBy] = useState('fecha_creacion') // Para explorar
//     const [showStats, setShowStats] = useState(true)
//
//     // Estados para inscripción
//     const [enrollingCourseId, setEnrollingCourseId] = useState(null)
//     const [enrollmentModal, setEnrollmentModal] = useState({
//         show: false,
//         course: null,
//         loading: false
//     })
//
//     // ========== EFECTOS ==========
//     useEffect(() => {
//         if (isAuthenticated) {
//             loadInitialData()
//         }
//     }, [isAuthenticated])
//
//     useEffect(() => {
//         if (isAuthenticated && activeTab === 'my-courses') {
//             applyMyCoursesFilters()
//         }
//     }, [myCoursesFilters, sortBy, activeTab])
//
//     useEffect(() => {
//         if (isAuthenticated && activeTab === 'explore-courses') {
//             applyExploreFilters()
//         }
//     }, [exploreFilters, exploreSortBy, activeTab])
//
//     // ========== FUNCIONES DE CARGA ==========
//     const loadInitialData = async () => {
//         try {
//             setLoading(true)
//             setError('')
//
//             if (activeTab === 'my-courses') {
//                 await loadMyCoursesData()
//             } else {
//                 await loadAvailableCoursesData()
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error de conexión')
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     const loadMyCoursesData = async () => {
//         const result = await enrollmentsService.getMyEnrollments()
//         if (result.success) {
//             setMyCoursesData(result.data)
//         } else {
//             setError(result.error || 'Error cargando tus cursos')
//         }
//     }
//
//     const loadAvailableCoursesData = async () => {
//         const result = await coursesService.getAllCourses()
//         if (result.success) {
//             setAvailableCoursesData(result.data)
//         } else {
//             setError(result.error || 'Error cargando cursos disponibles')
//         }
//     }
//
//     const applyMyCoursesFilters = async () => {
//         try {
//             setLoading(true)
//             const filterParams = {}
//
//             if (myCoursesFilters.search.trim()) {
//                 filterParams.search = myCoursesFilters.search.trim()
//             }
//             if (myCoursesFilters.status !== 'all') {
//                 filterParams.estado_pago = myCoursesFilters.status
//             }
//
//             const result = await enrollmentsService.getMyEnrollments(filterParams)
//
//             if (result.success) {
//                 let filteredData = result.data.inscripciones
//
//                 // Filtrar por progreso
//                 if (myCoursesFilters.progress !== 'all') {
//                     filteredData = filteredData.filter(curso => {
//                         const progreso = parseFloat(curso.porcentaje_progreso) || 0
//                         switch (myCoursesFilters.progress) {
//                             case 'completed':
//                                 return progreso >= 100
//                             case 'in_progress':
//                                 return progreso > 0 && progreso < 100
//                             case 'not_started':
//                                 return progreso === 0
//                             default:
//                                 return true
//                         }
//                     })
//                 }
//
//                 // Ordenar
//                 filteredData.sort((a, b) => {
//                     switch (sortBy) {
//                         case 'progreso':
//                             return (b.porcentaje_progreso || 0) - (a.porcentaje_progreso || 0)
//                         case 'titulo':
//                             return a.titulo.localeCompare(b.titulo)
//                         case 'fecha_inscripcion':
//                         default:
//                             return new Date(b.fecha_inscripcion) - new Date(a.fecha_inscripcion)
//                     }
//                 })
//
//                 setMyCoursesData({
//                     inscripciones: filteredData,
//                     total: filteredData.length
//                 })
//             }
//         } catch (error) {
//             console.error('Error aplicando filtros:', error)
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     const applyExploreFilters = async () => {
//         try {
//             setLoading(true)
//             const filterParams = {}
//
//             if (exploreFilters.search.trim()) {
//                 filterParams.search = exploreFilters.search.trim()
//             }
//             if (exploreFilters.tipo) {
//                 filterParams.tipo = exploreFilters.tipo
//             }
//             if (exploreFilters.gratuito !== 'all') {
//                 filterParams.gratuito = exploreFilters.gratuito
//             }
//
//             const result = await coursesService.getAllCourses(filterParams)
//
//             if (result.success) {
//                 let filteredData = result.data.cursos
//
//                 // Ordenar
//                 filteredData.sort((a, b) => {
//                     switch (exploreSortBy) {
//                         case 'titulo':
//                             return a.titulo.localeCompare(b.titulo)
//                         case 'precio':
//                             return a.precio - b.precio
//                         case 'estudiantes':
//                             return (b.estudiantes_inscritos || 0) - (a.estudiantes_inscritos || 0)
//                         case 'fecha_creacion':
//                         default:
//                             return new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
//                     }
//                 })
//
//                 setAvailableCoursesData({
//                     cursos: filteredData,
//                     total: filteredData.length
//                 })
//             }
//         } catch (error) {
//             console.error('Error aplicando filtros de exploración:', error)
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     // ========== FUNCIONES DE INSCRIPCIÓN ==========
//     const handleEnrollCourse = async (curso) => {
//         setEnrollmentModal({
//             show: true,
//             course: curso,
//             loading: false
//         })
//     }
//
//     const confirmEnrollment = async () => {
//         try {
//             setEnrollmentModal(prev => ({ ...prev, loading: true }))
//
//             const result = await enrollmentsService.enrollCourse(enrollmentModal.course.id)
//
//             if (result.success) {
//                 setEnrollmentModal({ show: false, course: null, loading: false })
//
//                 // Mostrar mensaje de éxito
//                 if (enrollmentModal.course.es_gratuito) {
//                     alert('¡Inscripción exitosa! Ya puedes acceder al curso.')
//                     // Recargar mis cursos si estamos en esa pestaña
//                     if (activeTab === 'my-courses') {
//                         await loadMyCoursesData()
//                     }
//                 } else {
//                     // Mostrar modal para WhatsApp
//                     const whatsappUrl = `https://wa.me/+593985036066?text=${encodeURIComponent(result.whatsappMessage)}`
//                     if (window.confirm(`Solicitud enviada. ¿Quieres contactar por WhatsApp para completar el pago?`)) {
//                         window.open(whatsappUrl, '_blank')
//                     }
//                 }
//             } else {
//                 alert(result.error || 'Error en la inscripción')
//             }
//         } catch (error) {
//             console.error('Error inscripción:', error)
//             alert('Error de conexión')
//         } finally {
//             setEnrollmentModal(prev => ({ ...prev, loading: false }))
//         }
//     }
//
//     // ========== FUNCIONES DE UTILIDAD ==========
//     const formatDate = (dateString) => {
//         if (!dateString) return 'No disponible'
//         return new Date(dateString).toLocaleDateString('es-ES', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric'
//         })
//     }
//
//     const calculateProgress = (completadas, total) => {
//         if (!total || total === 0) return 0
//         return Math.round((completadas / total) * 100)
//     }
//
//     const getProgressColor = (percentage) => {
//         if (percentage >= 80) return 'bg-green-500'
//         if (percentage >= 50) return 'bg-blue-500'
//         if (percentage >= 25) return 'bg-yellow-500'
//         return 'bg-gray-300'
//     }
//
//     const getStatusColor = (estado) => {
//         const colors = {
//             'habilitado': 'bg-green-100 text-green-800',
//             'pendiente': 'bg-yellow-100 text-yellow-800',
//             'rechazado': 'bg-red-100 text-red-800'
//         }
//         return colors[estado] || 'bg-gray-100 text-gray-800'
//     }
//
//     const getStatusText = (estado) => {
//         const texts = {
//             'habilitado': 'Activo',
//             'pendiente': 'Pago Pendiente',
//             'rechazado': 'Rechazado'
//         }
//         return texts[estado] || 'Desconocido'
//     }
//
//     const calculateMyCoursesStats = () => {
//         const stats = {
//             total: myCoursesData.inscripciones.length,
//             activos: 0,
//             pendientes: 0,
//             completados: 0,
//             progresoPromedio: 0
//         }
//
//         let sumaProgreso = 0
//
//         myCoursesData.inscripciones.forEach(curso => {
//             const progreso = parseFloat(curso.porcentaje_progreso) || 0
//             sumaProgreso += progreso
//
//             if (curso.estado_pago === 'habilitado') {
//                 stats.activos++
//             } else if (curso.estado_pago === 'pendiente') {
//                 stats.pendientes++
//             }
//
//             if (progreso >= 100) {
//                 stats.completados++
//             }
//         })
//
//         stats.progresoPromedio = stats.total > 0 ? Math.round(sumaProgreso / stats.total) : 0
//         return stats
//     }
//
//     const isEnrolledInCourse = (cursoId) => {
//         return myCoursesData.inscripciones.some(inscripcion => inscripcion.curso_id === cursoId)
//     }
//
//     // ========== FUNCIONES DE EVENTOS ==========
//     const handleTabChange = (tab) => {
//         setActiveTab(tab)
//         setError('')
//         loadInitialData()
//     }
//
//     const handleMyCoursesFilterChange = (key, value) => {
//         setMyCoursesFilters(prev => ({
//             ...prev,
//             [key]: value
//         }))
//     }
//
//     const handleExploreFilterChange = (key, value) => {
//         setExploreFilters(prev => ({
//             ...prev,
//             [key]: value
//         }))
//     }
//
//     const clearMyCoursesFilters = () => {
//         setMyCoursesFilters({
//             search: '',
//             status: 'all',
//             progress: 'all'
//         })
//         setSortBy('fecha_inscripcion')
//     }
//
//     const clearExploreFilters = () => {
//         setExploreFilters({
//             search: '',
//             tipo: '',
//             gratuito: 'all'
//         })
//         setExploreSortBy('fecha_creacion')
//     }
//
//     const myCoursesStats = calculateMyCoursesStats()
//
//     // ========== RENDER ==========
//     if (loading && activeTab === 'my-courses' && myCoursesData.inscripciones.length === 0) {
//         return (
//             <Layout showSidebar={true}>
//                 <div className="flex items-center justify-center min-h-screen">
//                     <div className="text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
//                         <p className="mt-4 text-medico-gray">Cargando...</p>
//                     </div>
//                 </div>
//             </Layout>
//         )
//     }
//
//     return (
//         <Layout showSidebar={true}>
//             <div className="p-8">
//                 {/* ========== HEADER CON PESTAÑAS ========== */}
//                 <div className="mb-8">
//                     <h1 className="text-3xl font-bold text-medico-blue mb-4">Mis Cursos</h1>
//
//                     {/* Pestañas */}
//                     <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
//                         <button
//                             onClick={() => handleTabChange('my-courses')}
//                             className={`px-6 py-3 rounded-md font-medium transition-colors ${
//                                 activeTab === 'my-courses'
//                                     ? 'bg-white text-medico-blue shadow-sm'
//                                     : 'text-gray-600 hover:text-gray-900'
//                             }`}
//                         >
//                             Mis Cursos ({myCoursesData.total})
//                         </button>
//                         <button
//                             onClick={() => handleTabChange('explore-courses')}
//                             className={`px-6 py-3 rounded-md font-medium transition-colors ${
//                                 activeTab === 'explore-courses'
//                                     ? 'bg-white text-medico-blue shadow-sm'
//                                     : 'text-gray-600 hover:text-gray-900'
//                             }`}
//                         >
//                             Explorar Cursos ({availableCoursesData.total})
//                         </button>
//                     </div>
//                 </div>
//
//                 {/* ========== MENSAJES ========== */}
//                 {error && (
//                     <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
//                         <div className="flex items-center">
//                             <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <p className="text-red-600">{error}</p>
//                         </div>
//                         <button
//                             onClick={() => setError('')}
//                             className="mt-2 text-red-700 underline hover:no-underline text-sm"
//                         >
//                             Cerrar
//                         </button>
//                     </div>
//                 )}
//
//                 {/* ========== CONTENIDO SEGÚN PESTAÑA ========== */}
//                 {activeTab === 'my-courses' ? (
//                     <div>
//                         {/* Estadísticas para Mis Cursos */}
//                         {showStats && myCoursesData.inscripciones.length > 0 && (
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//                                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//                                     <div className="flex items-center">
//                                         <svg className="w-8 h-8 text-medico-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
//                                         </svg>
//                                         <div>
//                                             <p className="text-2xl font-bold text-gray-900">{myCoursesStats.total}</p>
//                                             <p className="text-sm text-gray-600">Total Cursos</p>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//                                     <div className="flex items-center">
//                                         <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         <div>
//                                             <p className="text-2xl font-bold text-gray-900">{myCoursesStats.activos}</p>
//                                             <p className="text-sm text-gray-600">Activos</p>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//                                     <div className="flex items-center">
//                                         <svg className="w-8 h-8 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         <div>
//                                             <p className="text-2xl font-bold text-gray-900">{myCoursesStats.pendientes}</p>
//                                             <p className="text-sm text-gray-600">Pendientes</p>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
//                                     <div className="flex items-center">
//                                         <svg className="w-8 h-8 text-orange-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                                         </svg>
//                                         <div>
//                                             <p className="text-2xl font-bold text-gray-900">{myCoursesStats.progresoPromedio}%</p>
//                                             <p className="text-sm text-gray-600">Progreso Prom.</p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//
//                         {/* Filtros para Mis Cursos */}
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//                             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                                 <div className="flex-1 max-w-md">
//                                     <div className="relative">
//                                         <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                         </svg>
//                                         <input
//                                             type="text"
//                                             placeholder="Buscar mis cursos..."
//                                             value={myCoursesFilters.search}
//                                             onChange={(e) => handleMyCoursesFilterChange('search', e.target.value)}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                         />
//                                     </div>
//                                 </div>
//
//                                 <div className="flex flex-wrap gap-4">
//                                     <select
//                                         value={myCoursesFilters.status}
//                                         onChange={(e) => handleMyCoursesFilterChange('status', e.target.value)}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
//                                     >
//                                         <option value="all">Todos los estados</option>
//                                         <option value="habilitado">Activos</option>
//                                         <option value="pendiente">Pendientes</option>
//                                     </select>
//
//                                     <select
//                                         value={myCoursesFilters.progress}
//                                         onChange={(e) => handleMyCoursesFilterChange('progress', e.target.value)}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
//                                     >
//                                         <option value="all">Todo el progreso</option>
//                                         <option value="completed">Completados</option>
//                                         <option value="in_progress">En progreso</option>
//                                         <option value="not_started">Sin empezar</option>
//                                     </select>
//
//                                     <select
//                                         value={sortBy}
//                                         onChange={(e) => setSortBy(e.target.value)}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
//                                     >
//                                         <option value="fecha_inscripcion">Más recientes</option>
//                                         <option value="progreso">Por progreso</option>
//                                         <option value="titulo">Alfabético</option>
//                                     </select>
//
//                                     <button
//                                         onClick={clearMyCoursesFilters}
//                                         className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
//                                     >
//                                         Limpiar filtros
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//
//                         {/* Lista de Mis Cursos */}
//                         {loading && (
//                             <div className="text-center py-8">
//                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medico-blue mx-auto"></div>
//                                 <p className="mt-2 text-medico-gray">Cargando mis cursos...</p>
//                             </div>
//                         )}
//
//                         {!loading && myCoursesData.inscripciones.length > 0 && (
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                 {myCoursesData.inscripciones.map((curso) => {
//                                     const progress = parseFloat(curso.porcentaje_progreso) || 0
//                                     return (
//                                         <div key={curso.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
//                                             {/* Miniatura */}
//                                             <div className="relative">
//                                                 {curso.miniatura_url ? (
//                                                     <img
//                                                         src={curso.miniatura_url}
//                                                         alt={curso.titulo}
//                                                         className="w-full h-48 object-cover"
//                                                     />
//                                                 ) : (
//                                                     <div className="w-full h-48 bg-medico-blue flex items-center justify-center">
//                                                         <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
//                                                         </svg>
//                                                     </div>
//                                                 )}
//
//                                                 <div className="absolute top-3 right-3">
//                                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(curso.estado_pago)}`}>
//                                                         {getStatusText(curso.estado_pago)}
//                                                     </span>
//                                                 </div>
//                                             </div>
//
//                                             {/* Contenido */}
//                                             <div className="p-6">
//                                                 <h3 className="font-semibold text-lg text-gray-900 mb-2">{curso.titulo}</h3>
//
//                                                 {curso.instructor_nombre && (
//                                                     <p className="text-sm text-gray-600 mb-3">
//                                                         Instructor: {curso.instructor_nombre}
//                                                     </p>
//                                                 )}
//
//                                                 {/* Progreso */}
//                                                 <div className="mb-4">
//                                                     <div className="flex items-center justify-between text-sm mb-2">
//                                                         <span className="text-gray-600">Progreso del curso</span>
//                                                         <span className="font-medium">{progress}%</span>
//                                                     </div>
//                                                     <div className="w-full bg-gray-200 rounded-full h-2">
//                                                         <div
//                                                             className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
//                                                             style={{ width: `${progress}%` }}
//                                                         ></div>
//                                                     </div>
//                                                     <p className="text-xs text-gray-500 mt-1">
//                                                         {curso.clases_completadas} de {curso.total_clases} clases completadas
//                                                     </p>
//                                                 </div>
//
//                                                 {/* Información adicional */}
//                                                 <div className="text-sm text-gray-600 mb-4 space-y-1">
//                                                     <p>Inscrito: {formatDate(curso.fecha_inscripcion)}</p>
//                                                     {!curso.es_gratuito && (
//                                                         <p>Precio: ${curso.precio}</p>
//                                                     )}
//                                                 </div>
//
//                                                 {/* Acciones */}
//                                                 <div className="flex gap-2">
//                                                     {curso.estado_pago === 'habilitado' ? (
//                                                         <>
//                                                             <button
//                                                                 onClick={() => navigate(`/curso/${curso.slug}`)}
//                                                                 className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
//                                                             >
//                                                                 {progress > 0 ? 'Continuar' : 'Empezar'}
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => navigate(`/mi-progreso/${curso.slug}`)}
//                                                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
//                                                             >
//                                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                                                                 </svg>
//                                                             </button>
//                                                         </>
//                                                     ) : (
//                                                         <a
//                                                             href={`https://wa.me/+593985036066?text=Hola, soy ${perfil?.nombre_usuario} y quiero acceso al curso "${curso.titulo}". Precio: ${curso.precio}`}
//                                                             target="_blank"
//                                                             rel="noopener noreferrer"
//                                                             className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium text-center"
//                                                         >
//                                                             Contactar por WhatsApp
//                                                         </a>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )
//                                 })}
//                             </div>
//                         )}
//
//                         {/* Estado vacío para Mis Cursos */}
//                         {!loading && myCoursesData.inscripciones.length === 0 && (
//                             <div className="text-center py-16">
//                                 <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
//                                 </svg>
//                                 <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes cursos inscritos</h3>
//                                 <p className="text-gray-500 mb-6">Explora nuestro catálogo y encuentra el curso perfecto para tu carrera médica</p>
//                                 <button
//                                     onClick={() => handleTabChange('explore-courses')}
//                                     className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
//                                 >
//                                     Explorar Cursos
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 ) : (
//                     <div>
//                         {/* Filtros para Explorar Cursos */}
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//                             <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//                                 <div className="flex-1 max-w-md">
//                                     <div className="relative">
//                                         <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                         </svg>
//                                         <input
//                                             type="text"
//                                             placeholder="Buscar cursos disponibles..."
//                                             value={exploreFilters.search}
//                                             onChange={(e) => handleExploreFilterChange('search', e.target.value)}
//                                             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                         />
//                                     </div>
//                                 </div>
//
//                                 <div className="flex flex-wrap gap-4">
//                                     <select
//                                         value={exploreFilters.tipo}
//                                         onChange={(e) => handleExploreFilterChange('tipo', e.target.value)}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
//                                     >
//                                         <option value="">Todos los tipos</option>
//                                         <option value="ENARM">ENARM</option>
//                                         <option value="ENAM">ENAM</option>
//                                         <option value="Residencia">Residencia</option>
//                                         <option value="Especialización">Especialización</option>
//                                     </select>
//
//                                     <select
//                                         value={exploreFilters.gratuito}
//                                         onChange={(e) => handleExploreFilterChange('gratuito', e.target.value)}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
//                                     >
//                                         <option value="all">Todos los precios</option>
//                                         <option value="true">Cursos gratuitos</option>
//                                         <option value="false">Cursos de pago</option>
//                                     </select>
//
//                                     <select
//                                         value={exploreSortBy}
//                                         onChange={(e) => setExploreSortBy(e.target.value)}
//                                         className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue"
//                                     >
//                                         <option value="fecha_creacion">Más recientes</option>
//                                         <option value="titulo">Alfabético</option>
//                                         <option value="precio">Por precio</option>
//                                         <option value="estudiantes">Más populares</option>
//                                     </select>
//
//                                     <button
//                                         onClick={clearExploreFilters}
//                                         className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
//                                     >
//                                         Limpiar filtros
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//
//                         {/* Lista de Cursos Disponibles */}
//                         {loading && (
//                             <div className="text-center py-8">
//                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medico-blue mx-auto"></div>
//                                 <p className="mt-2 text-medico-gray">Cargando cursos disponibles...</p>
//                             </div>
//                         )}
//
//                         {!loading && availableCoursesData.cursos.length > 0 && (
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                 {availableCoursesData.cursos.map((curso) => {
//                                     const isEnrolled = isEnrolledInCourse(curso.id)
//                                     return (
//                                         <div key={curso.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
//                                             {/* Miniatura */}
//                                             <div className="relative">
//                                                 {curso.miniatura_url ? (
//                                                     <img
//                                                         src={curso.miniatura_url}
//                                                         alt={curso.titulo}
//                                                         className="w-full h-48 object-cover"
//                                                     />
//                                                 ) : (
//                                                     <div className="w-full h-48 bg-medico-blue flex items-center justify-center">
//                                                         <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
//                                                         </svg>
//                                                     </div>
//                                                 )}
//
//                                                 {/* Badges */}
//                                                 <div className="absolute top-3 left-3">
//                                                     {curso.es_gratuito ? (
//                                                         <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
//                                                             Gratuito
//                                                         </span>
//                                                     ) : (
//                                                         <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
//                                                             ${curso.precio}
//                                                         </span>
//                                                     )}
//                                                 </div>
//
//                                                 {isEnrolled && (
//                                                     <div className="absolute top-3 right-3">
//                                                         <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
//                                                             ✓ Inscrito
//                                                         </span>
//                                                     </div>
//                                                 )}
//                                             </div>
//
//                                             {/* Contenido */}
//                                             <div className="p-6">
//                                                 <h3 className="font-semibold text-lg text-gray-900 mb-2">{curso.titulo}</h3>
//
//                                                 {curso.instructor_nombre && (
//                                                     <p className="text-sm text-gray-600 mb-3">
//                                                         Instructor: {curso.instructor_nombre}
//                                                     </p>
//                                                 )}
//
//                                                 {curso.descripcion && (
//                                                     <p className="text-sm text-gray-600 mb-4 line-clamp-3">
//                                                         {curso.descripcion}
//                                                     </p>
//                                                 )}
//
//                                                 {/* Información del curso */}
//                                                 <div className="text-sm text-gray-600 mb-4 space-y-1">
//                                                     {curso.tipo_examen && (
//                                                         <p>Tipo: {curso.tipo_examen}</p>
//                                                     )}
//                                                     <p>Estudiantes: {curso.estudiantes_inscritos || 0}</p>
//                                                     <p>Creado: {formatDate(curso.fecha_creacion)}</p>
//                                                 </div>
//
//                                                 {/* Acciones */}
//                                                 <div className="flex gap-2">
//                                                     {isEnrolled ? (
//                                                         <button
//                                                             onClick={() => navigate(`/curso/${curso.slug}`)}
//                                                             className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
//                                                         >
//                                                             Ir al Curso
//                                                         </button>
//                                                     ) : (
//                                                         <>
//                                                             <button
//                                                                 onClick={() => handleEnrollCourse(curso)}
//                                                                 disabled={enrollingCourseId === curso.id}
//                                                                 className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
//                                                             >
//                                                                 {enrollingCourseId === curso.id ? 'Inscribiendo...' : 'Inscribirse'}
//                                                             </button>
//                                                             <button
//                                                                 onClick={() => navigate(`/curso/${curso.slug}`)}
//                                                                 className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
//                                                             >
//                                                                 Ver Detalles
//                                                             </button>
//                                                         </>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     )
//                                 })}
//                             </div>
//                         )}
//
//                         {/* Estado vacío para Explorar Cursos */}
//                         {!loading && availableCoursesData.cursos.length === 0 && (
//                             <div className="text-center py-16">
//                                 <svg className="w-24 h-24 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                                 </svg>
//                                 <h3 className="text-xl font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
//                                 <p className="text-gray-500 mb-6">Intenta ajustar los filtros para encontrar lo que buscas</p>
//                                 <button
//                                     onClick={clearExploreFilters}
//                                     className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
//                                 >
//                                     Limpiar Filtros
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                 )}
//
//                 {/* ========== MODAL DE CONFIRMACIÓN DE INSCRIPCIÓN ========== */}
//                 {enrollmentModal.show && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//                             <h3 className="text-lg font-semibold text-gray-900 mb-4">
//                                 Confirmar Inscripción
//                             </h3>
//
//                             <div className="mb-6">
//                                 <div className="flex items-center space-x-4 mb-4">
//                                     {enrollmentModal.course?.miniatura_url ? (
//                                         <img
//                                             src={enrollmentModal.course.miniatura_url}
//                                             alt={enrollmentModal.course.titulo}
//                                             className="w-16 h-16 rounded-lg object-cover"
//                                         />
//                                     ) : (
//                                         <div className="w-16 h-16 bg-medico-blue rounded-lg flex items-center justify-center">
//                                             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
//                                             </svg>
//                                         </div>
//                                     )}
//                                     <div>
//                                         <h4 className="font-medium text-gray-900">{enrollmentModal.course?.titulo}</h4>
//                                         <p className="text-sm text-gray-600">
//                                             {enrollmentModal.course?.instructor_nombre}
//                                         </p>
//                                     </div>
//                                 </div>
//
//                                 <div className="bg-gray-50 rounded-lg p-4">
//                                     {enrollmentModal.course?.es_gratuito ? (
//                                         <div className="text-center">
//                                             <div className="text-green-600 mb-2">
//                                                 <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                 </svg>
//                                             </div>
//                                             <p className="text-sm font-medium text-gray-900">Curso Gratuito</p>
//                                             <p className="text-xs text-gray-600">Tendrás acceso inmediato</p>
//                                         </div>
//                                     ) : (
//                                         <div className="text-center">
//                                             <p className="text-lg font-bold text-gray-900 mb-1">
//                                                 ${enrollmentModal.course?.precio}
//                                             </p>
//                                             <p className="text-sm text-gray-600 mb-2">Curso de pago</p>
//                                             <p className="text-xs text-gray-500">
//                                                 Deberás completar el pago por WhatsApp para obtener acceso
//                                             </p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>
//
//                             <div className="flex gap-3">
//                                 <button
//                                     onClick={() => setEnrollmentModal({ show: false, course: null, loading: false })}
//                                     disabled={enrollmentModal.loading}
//                                     className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
//                                 >
//                                     Cancelar
//                                 </button>
//                                 <button
//                                     onClick={confirmEnrollment}
//                                     disabled={enrollmentModal.loading}
//                                     className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
//                                 >
//                                     {enrollmentModal.loading ? 'Inscribiendo...' : 'Confirmar Inscripción'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </Layout>
//     )
// }
//
// export default MyCourses


// src/panel/MyCourses.jsx - MIS CURSOS + EXPLORAR + REPRODUCTOR COMPLETO
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import enrollmentsService from '../services/enrollments'
import coursesService from '../services/courses'

const MyCourses = () => {
    const navigate = useNavigate()
    const { perfil, isAuthenticated } = useAuth()

    // ========== ESTADOS PRINCIPALES ==========
    const [activeTab, setActiveTab] = useState('my-courses') // 'my-courses' | 'explore-courses'

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

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // ========== ESTADOS DE FILTROS ==========
    const [myCoursesFilters, setMyCoursesFilters] = useState({
        search: '',
        status: 'all', // all, habilitado, pendiente
        progress: 'all' // all, completed, in_progress, not_started
    })

    const [exploreFilters, setExploreFilters] = useState({
        search: '',
        tipo: '',
        gratuito: 'all' // all, true, false
    })

    // ========== ESTADOS DE UI ==========
    const [viewMode, setViewMode] = useState('grid') // grid, list
    const [sortBy, setSortBy] = useState('fecha_inscripcion') // Para mis cursos
    const [exploreSortBy, setExploreSortBy] = useState('fecha_creacion') // Para explorar
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

    // ========== FUNCIONES DE CARGA ==========
    const loadInitialData = async () => {
        try {
            setLoading(true)
            setError('')

            if (activeTab === 'my-courses') {
                await loadMyCoursesData()
            } else {
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

                // Mostrar mensaje de éxito
                if (enrollmentModal.course.es_gratuito) {
                    alert('¡Inscripción exitosa! Ya puedes acceder al curso.')
                    // Recargar mis cursos si estamos en esa pestaña
                    if (activeTab === 'my-courses') {
                        await loadMyCoursesData()
                    }
                } else {
                    // Mostrar modal para WhatsApp
                    const whatsappUrl = `https://wa.me/+593985036066?text=${encodeURIComponent(result.whatsappMessage)}`
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

    // ========== FUNCIONES DE NAVEGACIÓN ==========
    const goToCourse = (curso) => {
        // Navegar a la vista del curso con reproductor
        navigate(`/curso/${curso.slug}`)
    }

    const goToCourseProgress = (curso) => {
        // Navegar al progreso detallado del curso
        navigate(`/progreso/${curso.slug}`)
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
        return myCoursesData.inscripciones.some(inscripcion => inscripcion.curso_id === cursoId)
    }

    // ========== FUNCIONES DE EVENTOS ==========
    const handleTabChange = (tab) => {
        setActiveTab(tab)
        setError('')
        setLoading(true)
        loadInitialData()
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
                    <h1 className="text-3xl font-bold text-medico-blue mb-4">Mis Cursos</h1>

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
                    </div>
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
                                                    />
                                                ) : (
                                                    <div className="w-full h-48 bg-medico-blue flex items-center justify-center">
                                                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                                        </svg>
                                                    </div>
                                                )}

                                                <div className="absolute top-3 right-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(curso.estado_pago)}`}>
                                                        {getStatusText(curso.estado_pago)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Contenido */}
                                            <div className="p-6">
                                                <h3 className="font-semibold text-lg text-gray-900 mb-2">{curso.titulo}</h3>

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
                                                        {curso.clases_completadas} de {curso.total_clases} clases completadas
                                                    </p>
                                                </div>

                                                {/* Información adicional */}
                                                <div className="text-sm text-gray-600 mb-4 space-y-1">
                                                    <p>Inscrito: {formatDate(curso.fecha_inscripcion)}</p>
                                                    {!curso.es_gratuito && (
                                                        <p>Precio: ${curso.precio}</p>
                                                    )}
                                                </div>

                                                {/* Acciones MEJORADAS */}
                                                <div className="flex gap-2">
                                                    {curso.estado_pago === 'habilitado' ? (
                                                        <>
                                                            <button
                                                                onClick={() => goToCourse(curso)}
                                                                className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                                                            >
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                                {progress > 0 ? 'Continuar' : 'Empezar'}
                                                            </button>
                                                            <button
                                                                onClick={() => goToCourseProgress(curso)}
                                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                                                                title="Ver progreso detallado"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <a
                                                            href={`https://wa.me/+593985036066?text=Hola, soy ${perfil?.nombre_usuario} y quiero acceso al curso "${curso.titulo}". Precio: ${curso.precio}`}
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
                ) : (
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
                                        <option value="ENARM">ENARM</option>
                                        <option value="ENAM">ENAM</option>
                                        <option value="Residencia">Residencia</option>
                                        <option value="Especialización">Especialización</option>
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
                                                    />
                                                ) : (
                                                    <div className="w-full h-48 bg-medico-blue flex items-center justify-center">
                                                        <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                                        </svg>
                                                    </div>
                                                )}

                                                {/* Badges */}
                                                <div className="absolute top-3 left-3">
                                                    {curso.es_gratuito ? (
                                                        <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                            Gratuito
                                                        </span>
                                                    ) : (
                                                        <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                            ${curso.precio}
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
                                                <h3 className="font-semibold text-lg text-gray-900 mb-2">{curso.titulo}</h3>

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
                                                </div>

                                                {/* Acciones MEJORADAS */}
                                                <div className="flex gap-2">
                                                    {isEnrolled ? (
                                                        <button
                                                            onClick={() => goToCourse({ slug: curso.slug })}
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
                                                                onClick={() => goToCourse({ slug: curso.slug })}
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
                                                ${enrollmentModal.course?.precio}
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
                                onClick={() => navigate('/progreso')}
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