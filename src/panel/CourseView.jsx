import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import coursesService from '../services/courses'
import progressService from '../services/progress'
import enrollmentsService from '../services/enrollments'

const CourseView = () => {
    const { cursoId } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, perfil } = useAuth()
    const [searchParams, setSearchParams] = useSearchParams()

    // ========== ESTADOS PRINCIPALES ==========
    const [courseData, setCourseData] = useState(null)
    const [progressData, setProgressData] = useState(null)
    const [currentClass, setCurrentClass] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // ========== ESTADOS DE UI ==========
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showAccessModal, setShowAccessModal] = useState(false)
    const [enrolling, setEnrolling] = useState(false)
    const [showModuleContent, setShowModuleContent] = useState({})

    // ========== ESTADOS DE INSCRIPCIÓN ==========
    const [enrollmentStatus, setEnrollmentStatus] = useState({
        isEnrolled: false,
        accessStatus: 'checking',
        needsPayment: false
    })

    // ========== ESTADOS DEL VIDEO PLAYER ==========
    const [videoProgress, setVideoProgress] = useState(0)
    const [lastReportedProgress, setLastReportedProgress] = useState(0)

    // ========== EFECTOS ==========
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        if (!cursoId) {
            setError('ID de curso no válido')
            return
        }

        loadCourseData()
    }, [cursoId, isAuthenticated])

    useEffect(() => {
        if (courseData && courseData.modulos) {
            const claseIdFromUrl = searchParams.get('clase')

            if (claseIdFromUrl) {
                const claseEncontrada = findClassById(claseIdFromUrl)
                if (claseEncontrada && canAccessClass(claseEncontrada)) {
                    setCurrentClass(claseEncontrada)
                    loadVideoProgress(claseEncontrada.id)
                    return
                }
            }

            const firstAvailableClass = getFirstAvailableClass()
            if (firstAvailableClass) {
                setCurrentClass(firstAvailableClass)
                setSearchParams({ clase: firstAvailableClass.id })
                loadVideoProgress(firstAvailableClass.id)
            }
        }
    }, [courseData, searchParams, enrollmentStatus])

    // ========== FUNCIONES DE CARGA ==========
    const loadCourseData = async () => {
        try {
            setLoading(true)
            setError('')

            // console.log('Cargando curso con ID:', cursoId)
            const courseResult = await coursesService.getCourseById(cursoId)

            if (!courseResult.success) {
                setError(courseResult.error || 'Curso no encontrado')
                return
            }

            const curso = courseResult.data.curso
            setCourseData(curso)
            console.log('Curso cargado:', curso)

            // Expandir todos los módulos por defecto
            const initialModuleState = {}
            curso.modulos?.forEach(modulo => {
                initialModuleState[modulo.id] = true
            })
            setShowModuleContent(initialModuleState)

            await checkAccessAndProgress(curso)

        } catch (error) {
            console.error('Error cargando curso:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const checkAccessAndProgress = async (curso) => {
        try {
            const accessResult = await enrollmentsService.checkCourseAccess(cursoId)

            if (accessResult.success) {
                const accessData = accessResult.data

                // ✅ ACTUALIZADO: Usar tieneAcceso que considera acceso_activo
                const tieneAccesoReal = accessData.tieneAcceso || curso.es_gratuito

                setEnrollmentStatus({
                    isEnrolled: accessData.inscrito || false,
                    accessStatus: tieneAccesoReal ? 'habilitado' : (accessData.estadoPago || 'denied'),
                    needsPayment: !curso.es_gratuito && !tieneAccesoReal
                })

                if (tieneAccesoReal) {
                    await loadProgressData()
                }
            } else {
                setEnrollmentStatus({
                    isEnrolled: false,
                    accessStatus: 'denied',
                    needsPayment: !curso.es_gratuito
                })
            }
        } catch (error) {
            console.error('Error verificando acceso:', error)
            setEnrollmentStatus({
                isEnrolled: false,
                accessStatus: 'denied',
                needsPayment: !curso.es_gratuito
            })
        }
    }

    const loadProgressData = async () => {
        try {
            // Usar la nueva API de progreso
            const progressResult = await progressService.getCourseProgress(cursoId)

            if (progressResult.success) {
                setProgressData(progressResult.data)
                console.log('Progreso cargado:', progressResult.data)
            } else {
                console.log('Sin progreso disponible:', progressResult.error)
                setProgressData(null)
            }
        } catch (error) {
            console.error('Error cargando progreso:', error)
            setProgressData(null)
        }
    }

    const loadVideoProgress = (claseId) => {
        const progress = getClassProgress(claseId)
        setVideoProgress(progress.porcentaje)
        setLastReportedProgress(progress.porcentaje)
    }

    // ========== FUNCIONES DE UTILIDAD ==========
    const findClassById = (claseId) => {
        if (!courseData || !courseData.modulos) return null

        for (const modulo of courseData.modulos) {
            if (modulo.clases) {
                const clase = modulo.clases.find(c => c.id === claseId)
                if (clase) return { ...clase, moduloId: modulo.id, moduloTitulo: modulo.titulo }
            }
        }
        return null
    }

    const getFirstAvailableClass = () => {
        if (!courseData || !courseData.modulos) return null

        for (const modulo of courseData.modulos) {
            if (modulo.clases && modulo.clases.length > 0) {
                const firstClass = modulo.clases[0]
                if (canAccessClass(firstClass)) {
                    return { ...firstClass, moduloId: modulo.id, moduloTitulo: modulo.titulo }
                }
            }
        }
        return null
    }

    const canAccessClass = (clase) => {
        if (courseData?.es_gratuito) return true
        if (clase?.es_gratuita) return true
        if (enrollmentStatus.accessStatus === 'habilitado') return true
        return false
    }

    const getNextClass = () => {
        if (!currentClass || !courseData.modulos) return null

        let foundCurrent = false
        for (const modulo of courseData.modulos) {
            if (modulo.clases) {
                for (const clase of modulo.clases) {
                    if (foundCurrent && canAccessClass(clase)) {
                        return { ...clase, moduloId: modulo.id, moduloTitulo: modulo.titulo }
                    }
                    if (clase.id === currentClass.id) {
                        foundCurrent = true
                    }
                }
            }
        }
        return null
    }

    const getPreviousClass = () => {
        if (!currentClass || !courseData.modulos) return null

        let previousClass = null
        for (const modulo of courseData.modulos) {
            if (modulo.clases) {
                for (const clase of modulo.clases) {
                    if (clase.id === currentClass.id) {
                        return previousClass
                    }
                    if (canAccessClass(clase)) {
                        previousClass = { ...clase, moduloId: modulo.id, moduloTitulo: modulo.titulo }
                    }
                }
            }
        }
        return null
    }

    // ========== FUNCIONES DE EVENTOS ==========
    const handleClassSelect = (clase) => {
        if (!canAccessClass(clase)) {
            setShowAccessModal(true)
            return
        }

        setCurrentClass(clase)
        setSearchParams({ clase: clase.id })
        loadVideoProgress(clase.id)
    }

    // ========== PROGRESO DEL VIDEO - CONECTADO CON API ==========
    const handleVideoProgress = async (porcentajeVisto) => {
        if (!currentClass) return

        // Solo actualizar si hay un cambio significativo (5% o más)
        if (Math.abs(porcentajeVisto - lastReportedProgress) >= 5) {
            try {
                console.log('Actualizando progreso del video:', {
                    claseId: currentClass.id,
                    porcentajeVisto
                })

                const result = await progressService.updateClassProgress(
                    currentClass.id,
                    porcentajeVisto,
                    porcentajeVisto >= 95
                )

                if (result.success) {
                    setLastReportedProgress(porcentajeVisto)
                    setVideoProgress(porcentajeVisto)
                    // Recargar progreso general
                    await loadProgressData()
                    console.log('✅ Progreso actualizado:', result.message)
                } else {
                    console.error('❌ Error actualizando progreso:', result.error)
                }
            } catch (error) {
                console.error('❌ Error actualizando progreso del video:', error)
            }
        }
    }

    const handleVideoComplete = async () => {
        if (!currentClass) return

        try {
            console.log('🎯 Video completado:', currentClass.id)

            // Marcar como completada al 100%
            const result = await progressService.updateClassProgress(currentClass.id, 100, true)

            if (result.success) {
                console.log('✅ Clase marcada como completada')
                // Recargar progreso
                await loadProgressData()

                // Auto-navegar a la siguiente clase después de 2 segundos
                setTimeout(() => {
                    const nextClass = getNextClass()
                    if (nextClass) {
                        console.log('🔄 Auto-navegando a siguiente clase:', nextClass.titulo)
                        handleClassSelect(nextClass)
                    }
                }, 2000)
            }

        } catch (error) {
            console.error('❌ Error completando video:', error)
        }
    }

    const handleVideoTimeUpdate = (currentTime, duration) => {
        // Actualizar información de tiempo en tiempo real
        if (duration > 0) {
            const newProgress = (currentTime / duration) * 100
            setVideoProgress(newProgress)
        }
    }

    // ========== FUNCIONES MANUALES DE PROGRESO ==========
    const handleMarkAsCompleted = async () => {
        if (!currentClass) return

        try {
            const result = await progressService.updateClassProgress(currentClass.id, 100, true)

            if (result.success) {
                console.log('✅ Clase marcada manualmente como completada')
                await loadProgressData()
                loadVideoProgress(currentClass.id)
            } else {
                console.error('❌ Error marcando como completada:', result.error)
            }
        } catch (error) {
            console.error('❌ Error marcando como completada:', error)
        }
    }

    const handleMarkAsPartiallyViewed = async () => {
        if (!currentClass) return

        try {
            const result = await progressService.updateClassProgress(currentClass.id, 50, false)

            if (result.success) {
                console.log('✅ Clase marcada como vista parcialmente')
                await loadProgressData()
                loadVideoProgress(currentClass.id)
            } else {
                console.error('❌ Error marcando como vista parcialmente:', result.error)
            }
        } catch (error) {
            console.error('❌ Error marcando como vista parcialmente:', error)
        }
    }

    const handleNextClass = () => {
        const nextClass = getNextClass()
        if (nextClass) {
            handleClassSelect(nextClass)
        }
    }

    const handlePreviousClass = () => {
        const prevClass = getPreviousClass()
        if (prevClass) {
            handleClassSelect(prevClass)
        }
    }

    const toggleModuleContent = (moduloId) => {
        setShowModuleContent(prev => ({
            ...prev,
            [moduloId]: !prev[moduloId]
        }))
    }

    const enrollInCourse = async () => {
        try {
            setEnrolling(true)
            const result = await enrollmentsService.enrollCourse(cursoId)

            if (result.success) {
                await checkAccessAndProgress(courseData)
                setShowAccessModal(false)

                if (!courseData.es_gratuito && result.whatsappMessage) {
                    const whatsappUrl = `https://wa.me/+593981833667?text=${encodeURIComponent(result.whatsappMessage)}`
                    if (window.confirm('¿Quieres contactar por WhatsApp para completar el pago?')) {
                        window.open(whatsappUrl, '_blank')
                    }
                } else if (courseData.es_gratuito) {
                    alert('¡Inscripción exitosa! Ya puedes acceder al curso.')
                    window.location.reload()
                }
            } else {
                alert(result.error || 'Error en la inscripción')
            }
        } catch (error) {
            console.error('Error inscribiéndose:', error)
            alert('Error de conexión')
        } finally {
            setEnrolling(false)
        }
    }

    // ========== FUNCIONES DE FORMATEO - USANDO DATOS DEL API ==========
    const calculateOverallProgress = () => {
        if (!progressData || !progressData.resumen) return 0
        return progressData.resumen.porcentaje_progreso || 0
    }

    const getClassProgress = (claseId) => {
        if (!progressData || !progressData.modulos) return { porcentaje: 0, completada: false }

        for (const modulo of progressData.modulos) {
            if (modulo.clases) {
                const claseProgreso = modulo.clases.find(c => c.id === claseId)
                if (claseProgreso) {
                    return {
                        porcentaje: claseProgreso.porcentaje_visto || 0,
                        completada: claseProgreso.completada || false
                    }
                }
            }
        }
        return { porcentaje: 0, completada: false }
    }

    const getModuleProgress = (moduloId) => {
        if (!progressData || !progressData.modulos) return { completadas: 0, total: 0, porcentaje: 0 }

        const moduloProgreso = progressData.modulos.find(m => m.modulo_id === moduloId)
        if (!moduloProgreso || !moduloProgreso.clases) return { completadas: 0, total: 0, porcentaje: 0 }

        const total = moduloProgreso.clases.length
        const completadas = moduloProgreso.clases.filter(c => c.completada).length
        const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0

        return { completadas, total, porcentaje }
    }

    // ========== RENDER ==========
    if (loading) {
        return (
            <Layout showSidebar={false}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando curso...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error) {
        return (
            <Layout showSidebar={false}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md">
                        <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error cargando curso</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => navigate('/mis-cursos')}
                                className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Volver a Mis Cursos
                            </button>
                            <button
                                onClick={loadCourseData}
                                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!courseData) {
        return (
            <Layout showSidebar={false}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Curso no encontrado</h3>
                        <p className="text-gray-600 mb-4">El curso que buscas no existe o no tienes acceso</p>
                        <button
                            onClick={() => navigate('/mis-cursos')}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Volver a Mis Cursos
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    const overallProgress = calculateOverallProgress()
    const nextClass = getNextClass()
    const prevClass = getPreviousClass()
    const hasAccess = enrollmentStatus.accessStatus === 'habilitado' || courseData.es_gratuito

    return (
        <Layout showSidebar={true}>
            <div className="h-screen flex flex-col">
                {/* ========== HEADER DEL CURSO ========== */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/mis-cursos')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Volver a mis cursos"
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg font-semibold text-gray-900 truncate">
                                    {courseData.titulo}
                                </h1>
                                {currentClass && (
                                    <p className="text-sm text-gray-600 truncate">
                                        {currentClass.moduloTitulo} - {currentClass.titulo}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                             Estado de inscripción
                            <div className="flex items-center space-x-3">
                                {enrollmentStatus.isEnrolled ? (
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        enrollmentStatus.accessStatus === 'habilitado'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                       {enrollmentStatus.accessStatus === 'habilitado' ? 'Acceso Completo' : 'Pago Pendiente'}
                                   </span>
                                ) : (
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                       No Inscrito
                                   </span>
                                )}
                            </div>

                            {/* Barra de progreso */}
                            {hasAccess && (
                                <div className="flex items-center space-x-3">
                                   <span className="text-sm text-gray-600 whitespace-nowrap">
                                       Progreso: {overallProgress}%
                                   </span>
                                    <div className="w-32 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-medico-blue h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${overallProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Toggle sidebar */}
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title={sidebarCollapsed ? 'Mostrar contenido' : 'Ocultar contenido'}
                            >
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {sidebarCollapsed ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========== CONTENIDO PRINCIPAL ========== */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar de módulos y clases */}
                    {!sidebarCollapsed && (
                        <div className="w-96 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Contenido del Curso</h3>
                                    <span className="text-sm text-gray-500">
                                       {courseData.modulos?.length || 0} módulos
                                   </span>
                                </div>

                                {courseData.modulos && courseData.modulos.length > 0 ? (
                                    <div className="space-y-3">
                                        {courseData.modulos.map((modulo, moduloIndex) => {
                                            const moduleProgress = getModuleProgress(modulo.id)
                                            const isExpanded = showModuleContent[modulo.id]

                                            return (
                                                <div key={modulo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    {/* Header del módulo */}
                                                    <button
                                                        onClick={() => toggleModuleContent(modulo.id)}
                                                        className="w-full bg-gray-50 hover:bg-gray-100 px-4 py-4 border-b border-gray-200 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1 text-left">
                                                                <h4 className="font-medium text-gray-900 text-sm">
                                                                    Módulo {moduloIndex + 1}: {modulo.titulo}
                                                                </h4>
                                                                {modulo.descripcion && (
                                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                                        {modulo.descripcion}
                                                                    </p>
                                                                )}

                                                                {/* Progreso del módulo */}
                                                                <div className="flex items-center mt-2 space-x-2">
                                                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                                        <div
                                                                            className="bg-medico-blue h-1.5 rounded-full transition-all duration-300"
                                                                            style={{ width: `${moduleProgress.porcentaje}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">
                                                                       {moduleProgress.completadas}/{moduleProgress.total}
                                                                   </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-2 ml-3">
                                                                {moduleProgress.porcentaje === 100 ? (
                                                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                ) : moduleProgress.porcentaje > 0 ? (
                                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                                                                )}

                                                                <svg
                                                                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </button>

                                                    {/* Lista de clases */}
                                                    {isExpanded && modulo.clases && modulo.clases.length > 0 && (
                                                        <div className="divide-y divide-gray-100">
                                                            {modulo.clases.map((clase, claseIndex) => {
                                                                const claseConModulo = { ...clase, moduloId: modulo.id, moduloTitulo: modulo.titulo }
                                                                const canAccess = canAccessClass(clase)
                                                                const isActive = currentClass?.id === clase.id
                                                                const progress = getClassProgress(clase.id)

                                                                return (
                                                                    <button
                                                                        key={clase.id}
                                                                        onClick={() => handleClassSelect(claseConModulo)}
                                                                        disabled={!canAccess}
                                                                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                            isActive ? 'bg-blue-50 border-r-4 border-medico-blue' : ''
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-center space-x-2 mb-1">
                                                                                    <p className={`text-sm font-medium truncate ${
                                                                                        isActive ? 'text-medico-blue' : 'text-gray-900'
                                                                                    }`}>
                                                                                        {claseIndex + 1}. {clase.titulo}
                                                                                    </p>

                                                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                                                                                       {clase.duracion_minutos}min
                                                                                   </span>
                                                                                </div>

                                                                                {clase.descripcion && (
                                                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                                                        {clase.descripcion}
                                                                                    </p>
                                                                                )}






{/* Progreso de la clase */}
                                                                               {progress.porcentaje > 0 && (
                                                                                   <div className="flex items-center mt-2 space-x-2">
                                                                                       <div className="flex-1 bg-gray-200 rounded-full h-1">
                                                                                           <div
                                                                                               className={`h-1 rounded-full transition-all duration-300 ${
                                                                                                   progress.completada ? 'bg-green-500' : 'bg-blue-500'
                                                                                               }`}
                                                                                               style={{ width: `${progress.porcentaje}%` }}
                                                                                           ></div>
                                                                                       </div>
                                                                                       <span className="text-xs text-gray-500">
                                                                                          {progress.porcentaje}%
                                                                                      </span>
                                                                                   </div>
                                                                               )}
                                                                           </div>

                                                                           <div className="flex items-center space-x-2 ml-3">
                                                                               {!canAccess ? (
                                                                                   <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                                    </svg>
                                                                                ) : progress.completada ? (
                                                                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                        </svg>
                                                                    </div>
                                                                ) : progress.porcentaje > 0 ? (
                                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                                                                )}

                                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                            </div>
                                                            </button>
                                                            )
                                                            })}
                                                        </div>
                                                    )}

                                                    {/* Estado vacío de clases */}
                                                    {isExpanded && (!modulo.clases || modulo.clases.length === 0) && (
                                                        <div className="px-4 py-6 text-center">
                                                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            <p className="text-sm text-gray-500">No hay clases en este módulo</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">Sin contenido</h4>
                                        <p className="text-sm text-gray-500">Este curso aún no tiene módulos disponibles</p>
                                    </div>
                                )}

                                {/* Resumen del progreso total */}
                                {hasAccess && courseData.modulos && courseData.modulos.length > 0 && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-3">Resumen de Progreso</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Progreso general</span>
                                                <span className="font-medium">{overallProgress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-medico-blue h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${overallProgress}%` }}
                                                ></div>
                                            </div>

                                            {progressData && progressData.modulos && progressData.modulos.map(modulo => {
                                                const moduleProgress = getModuleProgress(modulo.modulo_id)
                                                return (
                                                    <div key={modulo.modulo_id} className="flex justify-between text-xs text-gray-600">
                                                        <span className="truncate mr-2">{modulo.modulo_titulo}</span>
                                                        <span>{moduleProgress.completadas}/{moduleProgress.total}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Área principal del video */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {hasAccess && currentClass ? (
                            <>
                                {/* VideoPlayer Seguro */}
                                <div className="flex-1 relative">
                                    <VideoPlayer
                                        videoUrl={currentClass.video_youtube_url}
                                        title={`${currentClass.moduloTitulo} - ${currentClass.titulo}`}
                                        onProgress={handleVideoProgress}
                                        onComplete={handleVideoComplete}
                                        onTimeUpdate={handleVideoTimeUpdate}
                                        currentProgress={videoProgress}
                                        autoplay={false}
                                        className="w-full h-full"
                                    />
                                </div>

                                {/* Controles de navegación */}
                                <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
                                    <div className="flex items-center justify-between mb-4">
                                        {/* Clase anterior */}
                                        <button
                                            onClick={handlePreviousClass}
                                            disabled={!prevClass}
                                            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            <span className="text-sm">Anterior</span>
                                        </button>

                                        {/* Información de la clase actual */}
                                        <div className="text-center flex-1 mx-8">
                                            <p className="text-sm text-gray-600 mb-1">
                                                {currentClass.moduloTitulo}
                                            </p>
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {currentClass.titulo}
                                            </h3>
                                            <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-500">
                                                <span>{currentClass.duracion_minutos} minutos</span>
                                                {getClassProgress(currentClass.id).completada && (
                                                    <span className="flex items-center text-green-600">
                                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                      </svg>
                                                      Completada
                                                  </span>
                                                )}
                                                <span className="flex items-center">
                                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                  </svg>
                                                    {Math.floor(videoProgress)}% visto
                                              </span>
                                            </div>
                                        </div>

                                        {/* Siguiente clase */}
                                        <button
                                            onClick={handleNextClass}
                                            disabled={!nextClass}
                                            className="flex items-center space-x-2 px-4 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="text-sm">Siguiente</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Botones de control manual */}
                                    <div className="flex items-center justify-center space-x-4 mb-4">
                                        <button
                                            onClick={handleMarkAsCompleted}
                                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            ✓ Marcar como completada
                                        </button>

                                        <button
                                            onClick={handleMarkAsPartiallyViewed}
                                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            📝 Marcar como vista parcialmente
                                        </button>
                                    </div>

                                    {/* Descripción de la clase */}
                                    {currentClass.descripcion && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <h4 className="text-sm font-medium text-gray-900 mb-1">Descripción:</h4>
                                            <p className="text-sm text-gray-600">
                                                {currentClass.descripcion}
                                            </p>
                                        </div>
                                    )}

                                    {/* Información adicional */}
                                    <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-500">
                                        <div className="flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Duración: {currentClass.duracion_minutos} min
                                        </div>
                                        <div className="flex items-center">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Progreso: {Math.floor(videoProgress)}%
                                        </div>
                                        {currentClass.es_gratuita && (
                                            <div className="flex items-center">
                                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                                </svg>
                                                Clase Gratuita
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : !hasAccess ? (
                            /* Estado sin acceso */
                            <div className="flex-1 flex items-center justify-center p-8">
                                <div className="text-center max-w-lg">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>

                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                                        Acceso Requerido
                                    </h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {enrollmentStatus.isEnrolled
                                            ? 'Tu pago está pendiente de aprobación. Una vez confirmado el pago, tendrás acceso completo al curso.'
                                            : 'Para acceder a este contenido necesitas inscribirte al curso. ¡Es fácil y rápido!'
                                        }
                                    </p>

                                    {/* Información del curso */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                                        <div className="flex items-center space-x-4 mb-4">
                                            {courseData.miniatura_url ? (
                                                <img
                                                    src={courseData.miniatura_url}
                                                    alt={courseData.titulo}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-medico-blue rounded-lg flex items-center justify-center">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <h4 className="font-bold text-gray-900 text-lg">{courseData.titulo}</h4>
                                                <p className="text-sm text-gray-600">{courseData.instructor_nombre}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="text-center p-3 bg-white rounded-lg">
                                                <div className="font-semibold text-gray-900">
                                                    {courseData.es_gratuito ? 'GRATIS' : `$${courseData.precio}`}
                                                </div>
                                                <div className="text-gray-600">Precio</div>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded-lg">
                                                <div className="font-semibold text-gray-900">
                                                    {courseData.modulos?.length || 0}
                                                </div>
                                                <div className="text-gray-600">Módulos</div>
                                            </div>
                                        </div>
                                    </div>
                                    {/*${perfil?.nombre_usuario}*/}
                                    <div className="flex gap-4">
                                        {enrollmentStatus.isEnrolled ? (
<a
                                            href={`https://wa.me/+593981833667?text=${encodeURIComponent(`Hola, soy estudiante y quiero que aprueben mi acceso al curso "${courseData.titulo}". Ya me inscribí pero el pago está pendiente.`)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium text-center flex items-center justify-center"
                                            >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            Contactar por WhatsApp
                                            </a>
                                            ) : (
                                            <button
                                            onClick={() => setShowAccessModal(true)}
                                         className="flex-1 bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        🚀 Inscribirse al Curso
                                    </button>
                                    )}
                                    <button
                                        onClick={() => navigate('/mis-cursos')}
                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        ← Volver
                                    </button>
                                </div>
                            </div>
                            </div>
                            ) : (
                            /* Estado sin clase seleccionada */
                            <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center max-w-md">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                ¡Bienvenido al curso!
            </h3>
            <p className="text-gray-600 mb-6">
                {courseData.modulos && courseData.modulos.length > 0
                    ? 'Selecciona una clase del menú lateral para comenzar tu aprendizaje.'
                    : 'Este curso aún no tiene contenido disponible. Mantente atento a las actualizaciones.'
                }
            </p>

            {courseData.modulos && courseData.modulos.length === 0 && (
                <button
                    onClick={() => navigate('/mis-cursos')}
                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Volver a Mis Cursos
                </button>
            )}
        </div>
</div>
)}
</div>
</div>

{/* Modal de inscripción */}
{showAccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                        Inscribirse al Curso
                    </h3>

                    <div className="mb-6">
                        <div className="flex items-center space-x-4 mb-4">
                            {courseData.miniatura_url ? (
                                <img
                                    src={courseData.miniatura_url}
                                    alt={courseData.titulo}
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
                                <h4 className="font-semibold text-gray-900">{courseData.titulo}</h4>
                                <p className="text-sm text-gray-600">
                                    {courseData.instructor_nombre}
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            {courseData.es_gratuito ? (
                                <div className="text-center">
                                    <div className="text-green-600 mb-2">
                                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">¡Curso Gratuito!</p>
                                    <p className="text-sm text-gray-600">Tendrás acceso inmediato</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 mb-1">
                                        ${courseData.precio}
                                    </p>
                                    {courseData.descuento > 0 && (
                                        <p className="text-sm text-green-600 mb-2">
                                            🎉 {courseData.descuento}% de descuento aplicado
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-600 mb-2">Curso de pago</p>
                                    <p className="text-xs text-gray-500">
                                        Completa el pago por WhatsApp para obtener acceso
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Información adicional del curso */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>📚 Módulos:</span>
                                <span className="font-medium">{courseData.modulos?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>🎥 Clases:</span>
                                <span className="font-medium">
                                               {courseData.modulos?.reduce((total, modulo) =>
                                                   total + (modulo.clases?.length || 0), 0
                                               ) || 0}
                                           </span>
                            </div>
                            {courseData.tipo_examen && (
                                <div className="flex justify-between">
                                    <span>🎯 Tipo:</span>
                                    <span className="font-medium">{courseData.tipo_examen}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>👨‍🏫 Instructor:</span>
                                <span className="font-medium">{courseData.instructor_nombre}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">

                            <button
                                onClick={() => setShowAccessModal(false)}
                                disabled={enrolling}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={enrollInCourse}
                                disabled={enrolling}
                                className="flex-1 bg-medico-blue text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center font-medium"
                            >
                                {enrolling ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Inscribiendo...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Confirmar Inscripción
                                    </>
                                )}
                            </button>
                    </div>
                </div>
            </div>
        </div>
    )}

                {/* Información flotante cuando sidebar está colapsado */}
                {sidebarCollapsed && hasAccess && currentClass && (
                    <div className="fixed bottom-6 left-6 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-40">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 text-sm">Información de la Clase</h4>
                            <button
                                onClick={() => setSidebarCollapsed(false)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Mostrar contenido completo"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Módulo:</span>
                                <span className="font-medium text-gray-900 truncate ml-2">
                                   {currentClass.moduloTitulo}
                               </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Clase:</span>
                                <span className="font-medium text-gray-900 truncate ml-2">
                                   {currentClass.titulo}
                               </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Duración:</span>
                                <span className="font-medium text-gray-900">
                                   {currentClass.duracion_minutos} min
                               </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Progreso:</span>
                                <span className="font-medium text-gray-900">
                                   {Math.floor(videoProgress)}%
                               </span>
                            </div>
                        </div>

                        {/* Mini controles */}
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handlePreviousClass}
                                disabled={!prevClass}
                                className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                ← Anterior
                            </button>
                            <button
                                onClick={handleNextClass}
                                disabled={!nextClass}
                                className="flex-1 px-3 py-2 text-xs bg-medico-blue text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                Siguiente →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
)
}

export default CourseView
