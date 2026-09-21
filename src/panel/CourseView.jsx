import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Check, Rocket, BookOpen, Video as VideoIcon, ArrowLeft, PanelLeftClose, PanelLeftOpen, ChevronDown, ChevronLeft, ChevronRight, Lock, CheckCircle2, PlayCircle, Clock, AlertCircle, MessageCircle } from 'lucide-react'
import { Card, Button, Pill, ProgressBar, EmptyState, Modal } from '../simulador/ui'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import VideoPlayer from '../components/VideoPlayer'
import coursesService from '../services/courses'
import progressService from '../services/progress'
import enrollmentsService from '../services/enrollments'

const CourseView = () => {
    const { cursoId } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
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
    // Último avance guardado en el servidor (ref: el reproductor llama con closures que no ven el estado)
    const ultimoGuardadoRef = useRef({ claseId: null, pct: 0, t: 0, enviando: false })
    const completadaEnviadaRef = useRef(null)
    const videoProgressRef = useRef(0)

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
        ultimoGuardadoRef.current = { claseId, pct: progress.porcentaje, t: Date.now(), enviando: false }
    }

    // Aplica un avance al estado local (sin volver a pedir todo el progreso del curso al servidor)
    const aplicarProgresoLocal = (claseId, porcentaje, completada) => {
        setProgressData(prev => {
            if (!prev?.modulos) return prev
            let total = 0, hechas = 0
            const modulos = prev.modulos.map(m => ({
                ...m,
                clases: (m.clases || []).map(c => {
                    const upd = c.id === claseId
                        ? { ...c, porcentaje_visto: Math.max(c.porcentaje_visto || 0, porcentaje), completada: !!(c.completada || completada) }
                        : c
                    total++; if (upd.completada) hechas++
                    return upd
                })
            }))
            const resumen = { ...(prev.resumen || {}), total_clases: total, clases_completadas: hechas, porcentaje_progreso: total ? Math.round((100 * hechas) / total) : 0 }
            return { ...prev, modulos, resumen }
        })
    }

    // Guardado con keepalive para cuando el alumno cierra o cambia de página (fetch normal se cancela)
    const guardarKeepalive = (claseId, porcentaje) => {
        try {
            const token = localStorage.getItem('mediconsa_token')
            const base = process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'
            fetch(`${base}/progress/class/${claseId}`, {
                method: 'PATCH', keepalive: true,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ porcentajeVisto: porcentaje, completada: porcentaje >= 95 })
            }).catch(() => {})
        } catch (_) { /* noop */ }
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
    // Guarda como máximo una vez cada 30 s o cada 10 % de avance (y siempre al pausar/terminar: flush).
    // Antes se enviaba cada segundo a partir del 5 % y además se recargaba todo el progreso del curso.
    const handleVideoProgress = async (porcentajeVisto, { flush = false } = {}) => {
        if (!currentClass) return
        const u = ultimoGuardadoRef.current
        if (u.claseId !== currentClass.id) ultimoGuardadoRef.current = { claseId: currentClass.id, pct: 0, t: 0, enviando: false }
        const ahora = Date.now()
        const salto = porcentajeVisto - ultimoGuardadoRef.current.pct
        const debe = flush ? salto > 0 : (salto >= 10 || (salto > 0 && ahora - ultimoGuardadoRef.current.t >= 30000))
        if (!debe || ultimoGuardadoRef.current.enviando) return
        ultimoGuardadoRef.current.enviando = true
        try {
            const result = await progressService.updateClassProgress(currentClass.id, porcentajeVisto, porcentajeVisto >= 95)
            if (result.success) {
                ultimoGuardadoRef.current = { claseId: currentClass.id, pct: porcentajeVisto, t: ahora, enviando: false }
                aplicarProgresoLocal(currentClass.id, porcentajeVisto, porcentajeVisto >= 95)
            } else {
                ultimoGuardadoRef.current.enviando = false
                console.error('❌ Error actualizando progreso:', result.error)
            }
        } catch (error) {
            ultimoGuardadoRef.current.enviando = false
            console.error('❌ Error actualizando progreso del video:', error)
        }
    }

    const handleVideoComplete = async () => {
        if (!currentClass) return

        try {
            console.log('🎯 Video completado:', currentClass.id)

            // Marcar como completada al 100% (una sola vez por clase: ENDED puede repetirse)
            if (completadaEnviadaRef.current === currentClass.id) return
            completadaEnviadaRef.current = currentClass.id
            const result = await progressService.updateClassProgress(currentClass.id, 100, true)

            if (result.success) {
                console.log('✅ Clase marcada como completada')
                ultimoGuardadoRef.current = { claseId: currentClass.id, pct: 100, t: Date.now(), enviando: false }
                aplicarProgresoLocal(currentClass.id, 100, true)

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

    useEffect(() => { videoProgressRef.current = videoProgress }, [videoProgress])

    // Al cerrar la pestaña o cambiar de clase se guarda el último avance no enviado
    useEffect(() => {
        const flush = () => {
            const u = ultimoGuardadoRef.current
            const pct = Math.floor(videoProgressRef.current)
            if (u.claseId && pct > u.pct) { guardarKeepalive(u.claseId, pct); ultimoGuardadoRef.current = { ...u, pct, t: Date.now() } }
        }
        window.addEventListener('pagehide', flush)
        return () => { window.removeEventListener('pagehide', flush); flush() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentClass?.id])

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
                aplicarProgresoLocal(currentClass.id, 100, true)
                setVideoProgress(100)
                ultimoGuardadoRef.current = { claseId: currentClass.id, pct: 100, t: Date.now(), enviando: false }
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
                aplicarProgresoLocal(currentClass.id, 50, false)
                if (videoProgress < 50) setVideoProgress(50)
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
                    const whatsappUrl = `https://wa.me/+593985036066?text=${encodeURIComponent(result.whatsappMessage)}`
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
    const totalClases = courseData?.modulos?.reduce((t, m) => t + (m.clases?.length || 0), 0) || 0

    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-5rem)] supports-[height:100dvh]:h-[calc(100dvh-3.5rem)] lg:supports-[height:100dvh]:h-[calc(100dvh-5rem)] flex flex-col animate-pulse">
                    <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-gray-200" />
                        <div className="flex-1 max-w-md space-y-2"><div className="h-4 bg-gray-200 rounded w-2/3" /><div className="h-3 bg-gray-100 rounded w-1/3" /></div>
                        <div className="h-6 w-28 bg-gray-200 rounded-full hidden sm:block" />
                    </div>
                    <div className="flex-1 flex overflow-hidden">
                        <div className="hidden md:block w-80 bg-white border-r border-gray-100 p-4 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl" />)}
                        </div>
                        <div className="flex-1 p-6"><div className="h-full bg-gray-200 rounded-3xl" /></div>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !courseData) {
        return (
            <Layout showSidebar={true}>
                <div className="p-6 md:p-8">
                    <EmptyState
                        icon={AlertCircle}
                        title={error ? 'No pudimos cargar el curso' : 'Curso no encontrado'}
                        description={error || 'El curso que buscas no existe o no tienes acceso.'}
                        action={<div className="flex gap-3 justify-center">
                            <Button to="/mis-cursos" variant="secondary">Volver a mis cursos</Button>
                            {error && <Button onClick={loadCourseData}>Reintentar</Button>}
                        </div>}
                    />
                </div>
            </Layout>
        )
    }

    const overallProgress = calculateOverallProgress()
    const nextClass = getNextClass()
    const prevClass = getPreviousClass()
    const hasAccess = enrollmentStatus.accessStatus === 'habilitado' || courseData.es_gratuito
    const claseProgreso = currentClass ? getClassProgress(currentClass.id) : null

    const estadoPill = enrollmentStatus.isEnrolled
        ? (enrollmentStatus.accessStatus === 'habilitado'
            ? <Pill className="bg-emerald-50 text-medico-green border-emerald-100">Acceso completo</Pill>
            : <Pill className="bg-orange-50 text-medico-orange border-orange-100">Pago pendiente</Pill>)
        : courseData.es_gratuito
            ? <Pill className="bg-blue-50 text-medico-blue border-blue-100">Curso gratuito</Pill>
            : <Pill className="bg-gray-50 text-gray-600 border-gray-100">No inscrito</Pill>

    return (
        <Layout showSidebar={true}>
            <div className="h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-5rem)] supports-[height:100dvh]:h-[calc(100dvh-3.5rem)] lg:supports-[height:100dvh]:h-[calc(100dvh-5rem)] flex flex-col">
                {/* ===== Barra superior del curso ===== */}
                <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4 flex-shrink-0">
                    <button onClick={() => navigate('/mis-cursos')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" title="Volver a mis cursos">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="min-w-0 flex-1">
                        <h1 className="text-base md:text-lg font-semibold text-gray-900 truncate">{courseData.titulo}</h1>
                        {currentClass && <p className="text-xs md:text-sm text-medico-gray truncate">{currentClass.moduloTitulo} · {currentClass.titulo}</p>}
                    </div>
                    <div className="hidden sm:flex items-center gap-3">
                        {estadoPill}
                        {hasAccess && (
                            <div className="flex items-center gap-2" title="Progreso del curso">
                                <ProgressBar value={overallProgress} className="w-28" />
                                <span className="text-xs font-semibold text-gray-700 w-9">{overallProgress}%</span>
                            </div>
                        )}
                    </div>
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" title={sidebarCollapsed ? 'Mostrar contenido' : 'Ocultar contenido'}>
                        {sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                    </button>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* ===== Contenido del curso (módulos y clases) ===== */}
                    {!sidebarCollapsed && (
                        <aside className="w-80 lg:w-96 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto">
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <h2 className="font-sans text-sm font-semibold text-gray-900">Contenido del curso</h2>
                                    <span className="text-xs text-medico-gray">{courseData.modulos?.length || 0} módulos · {totalClases} clases</span>
                                </div>

                                {courseData.modulos && courseData.modulos.length > 0 ? (
                                    <div className="space-y-2">
                                        {courseData.modulos.map((modulo, moduloIndex) => {
                                            const moduleProgress = getModuleProgress(modulo.id)
                                            const isExpanded = showModuleContent[modulo.id]
                                            const moduloCompleto = moduleProgress.total > 0 && moduleProgress.porcentaje === 100
                                            return (
                                                <div key={modulo.id} className="rounded-2xl border border-gray-100 overflow-hidden">
                                                    <button onClick={() => toggleModuleContent(modulo.id)} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors">
                                                        <div className="flex items-start gap-3">
                                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${moduloCompleto ? 'bg-medico-green text-white' : moduleProgress.porcentaje > 0 ? 'bg-medico-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                                {moduloCompleto ? <Check className="w-4 h-4" strokeWidth={3} /> : moduloIndex + 1}
                                                            </span>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-gray-900 leading-snug">{modulo.titulo}</p>
                                                                <div className="flex items-center gap-2 mt-1.5">
                                                                    <ProgressBar value={moduleProgress.porcentaje} height="h-1.5" color={moduloCompleto ? 'bg-medico-green' : 'bg-medico-blue'} className="flex-1" />
                                                                    <span className="text-[11px] text-medico-gray whitespace-nowrap">{moduleProgress.completadas}/{moduleProgress.total}</span>
                                                                </div>
                                                            </div>
                                                            <ChevronDown className={`w-4 h-4 text-gray-400 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                        </div>
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="border-t border-gray-100">
                                                            {modulo.clases && modulo.clases.length > 0 ? modulo.clases.map((clase, claseIndex) => {
                                                                const claseConModulo = { ...clase, moduloId: modulo.id, moduloTitulo: modulo.titulo }
                                                                const canAccess = canAccessClass(clase)
                                                                const isActive = currentClass?.id === clase.id
                                                                const progress = getClassProgress(clase.id)
                                                                let Icon = PlayCircle, iconCls = 'text-gray-300'
                                                                if (!canAccess) { Icon = Lock; iconCls = 'text-gray-300' }
                                                                else if (progress.completada) { Icon = CheckCircle2; iconCls = 'text-medico-green' }
                                                                else if (progress.porcentaje > 0) { Icon = PlayCircle; iconCls = 'text-medico-blue' }
                                                                return (
                                                                    <button key={clase.id} onClick={() => handleClassSelect(claseConModulo)} disabled={!canAccess}
                                                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isActive ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                                        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-medico-blue' : iconCls}`} />
                                                                        <span className="flex-1 min-w-0">
                                                                            <span className={`block text-sm truncate ${isActive ? 'font-semibold text-medico-blue' : 'text-gray-800'}`}>{claseIndex + 1}. {clase.titulo}</span>
                                                                            {progress.porcentaje > 0 && !progress.completada && (
                                                                                <ProgressBar value={progress.porcentaje} height="h-1" className="mt-1.5 w-24" />
                                                                            )}
                                                                        </span>
                                                                        <span className="text-[11px] text-medico-gray flex-shrink-0">{clase.duracion_minutos ? `${clase.duracion_minutos} min` : ''}</span>
                                                                    </button>
                                                                )
                                                            }) : (
                                                                <p className="px-4 py-4 text-xs text-medico-gray text-center">No hay clases en este módulo</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 px-4">
                                        <VideoIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-900">Sin contenido</p>
                                        <p className="text-xs text-medico-gray mt-1">Este curso aún no tiene módulos disponibles</p>
                                    </div>
                                )}
                            </div>
                        </aside>
                    )}

                    {/* ===== Área principal ===== */}
                    <main className="flex-1 flex flex-col overflow-y-auto bg-medico-light">
                        {hasAccess && currentClass ? (
                            <>
                                <div className="bg-black flex-shrink-0">
                                    <div className="aspect-video w-full mx-auto max-w-[calc(62vh*16/9)]">
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
                                </div>

                                <div className="p-4 md:p-6 space-y-4">
                                    {/* Título de la clase + navegación */}
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-medico-blue">{currentClass.moduloTitulo}</p>
                                            <h2 className="font-sans text-xl md:text-2xl font-semibold text-gray-900 mt-0.5">{currentClass.titulo}</h2>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                {currentClass.duracion_minutos && <Pill className="bg-white text-gray-700 border-gray-200"><Clock className="w-3 h-3" /> {currentClass.duracion_minutos} min</Pill>}
                                                <Pill className="bg-white text-gray-700 border-gray-200">{Math.floor(videoProgress)}% visto</Pill>
                                                {claseProgreso?.completada && <Pill className="bg-emerald-50 text-medico-green border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Completada</Pill>}
                                                {currentClass.es_gratuita && <Pill className="bg-blue-50 text-medico-blue border-blue-100">Clase gratuita</Pill>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <Button variant="secondary" size="sm" onClick={handlePreviousClass} disabled={!prevClass}><ChevronLeft className="w-4 h-4" /> Anterior</Button>
                                            <Button size="sm" onClick={handleNextClass} disabled={!nextClass}>Siguiente <ChevronRight className="w-4 h-4" /></Button>
                                        </div>
                                    </div>

                                    {/* Acciones de progreso */}
                                    <Card className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <p className="text-sm text-medico-gray flex-1">Tu progreso se guarda automáticamente mientras ves el video. También puedes marcarla a mano:</p>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" onClick={handleMarkAsPartiallyViewed}>Vista parcialmente</Button>
                                            <Button variant="success" size="sm" onClick={handleMarkAsCompleted} disabled={claseProgreso?.completada}><Check className="w-4 h-4" /> {claseProgreso?.completada ? 'Completada' : 'Marcar como completada'}</Button>
                                        </div>
                                    </Card>

                                    {currentClass.descripcion && (
                                        <Card className="p-5">
                                            <h3 className="font-sans text-sm font-semibold text-gray-900 mb-2">Sobre esta clase</h3>
                                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{currentClass.descripcion}</p>
                                        </Card>
                                    )}
                                </div>
                            </>
                        ) : !hasAccess ? (
                            <div className="flex-1 flex items-center justify-center p-6 md:p-10">
                                <Card className="p-8 max-w-lg w-full text-center">
                                    <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 text-medico-blue flex items-center justify-center mb-4"><Lock className="w-7 h-7" /></div>
                                    <h2 className="font-sans text-2xl font-semibold text-gray-900">Acceso requerido</h2>
                                    <p className="text-medico-gray mt-2">
                                        {enrollmentStatus.isEnrolled
                                            ? 'Tu pago está pendiente de aprobación. Cuando se confirme tendrás acceso completo al curso.'
                                            : 'Para ver este contenido necesitas inscribirte al curso.'}
                                    </p>
                                    <div className="mt-6 flex items-center gap-4 text-left rounded-2xl border border-gray-100 p-4">
                                        {courseData.miniatura_url
                                            ? <img src={courseData.miniatura_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                                            : <div className="w-14 h-14 rounded-xl bg-medico-blue text-white flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-gray-900 truncate">{courseData.titulo}</p>
                                            <p className="text-xs text-medico-gray">{courseData.modulos?.length || 0} módulos · {totalClases} clases · {courseData.es_gratuito ? 'Gratis' : `$${courseData.precio}`}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                        {enrollmentStatus.isEnrolled ? (
                                            <Button variant="success" href={`https://wa.me/+593985036066?text=${encodeURIComponent(`Hola, soy estudiante y quiero que aprueben mi acceso al curso "${courseData.titulo}". Ya me inscribí pero el pago está pendiente.`)}`} target="_blank" rel="noopener noreferrer">
                                                <MessageCircle className="w-4 h-4" /> Contactar por WhatsApp
                                            </Button>
                                        ) : (
                                            <Button onClick={() => setShowAccessModal(true)}><Rocket className="w-4 h-4" /> Inscribirse al curso</Button>
                                        )}
                                        <Button variant="secondary" to="/mis-cursos">Volver</Button>
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center p-6 md:p-10">
                                <EmptyState
                                    icon={VideoIcon}
                                    title="¡Bienvenido al curso!"
                                    description={courseData.modulos && courseData.modulos.length > 0
                                        ? 'Selecciona una clase del contenido para comenzar.'
                                        : 'Este curso aún no tiene contenido disponible. Mantente atento a las actualizaciones.'}
                                    action={(!courseData.modulos || courseData.modulos.length === 0) && <Button to="/mis-cursos">Volver a mis cursos</Button>}
                                />
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* ===== Modal de inscripción ===== */}
            <Modal open={showAccessModal} title="Inscribirse al curso" onClose={() => !enrolling && setShowAccessModal(false)}
                   footer={<>
                       <Button variant="secondary" onClick={() => setShowAccessModal(false)} disabled={enrolling}>Cancelar</Button>
                       <Button onClick={enrollInCourse} loading={enrolling}>Confirmar inscripción</Button>
                   </>}>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        {courseData.miniatura_url
                            ? <img src={courseData.miniatura_url} alt="" className="w-14 h-14 rounded-xl object-cover" />
                            : <div className="w-14 h-14 rounded-xl bg-medico-blue text-white flex items-center justify-center"><BookOpen className="w-6 h-6" /></div>}
                        <div className="min-w-0">
                            <p className="font-semibold text-gray-900">{courseData.titulo}</p>
                            {courseData.instructor_nombre && <p className="text-xs text-medico-gray">{courseData.instructor_nombre}</p>}
                        </div>
                    </div>
                    <div className="rounded-2xl bg-gray-50 p-4 text-center">
                        {courseData.es_gratuito ? (
                            <>
                                <p className="text-lg font-semibold text-gray-900">Curso gratuito</p>
                                <p className="text-sm text-medico-gray">Tendrás acceso inmediato</p>
                            </>
                        ) : (
                            <>
                                <p className="text-2xl font-semibold text-gray-900">${courseData.precio}</p>
                                {courseData.descuento > 0 && <p className="text-sm text-medico-green">{courseData.descuento}% de descuento aplicado</p>}
                                <p className="text-xs text-medico-gray mt-1">Completa el pago por WhatsApp para obtener acceso</p>
                            </>
                        )}
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl border border-gray-100 p-3"><dt className="text-xs text-medico-gray">Módulos</dt><dd className="font-semibold text-gray-900">{courseData.modulos?.length || 0}</dd></div>
                        <div className="rounded-xl border border-gray-100 p-3"><dt className="text-xs text-medico-gray">Clases</dt><dd className="font-semibold text-gray-900">{totalClases}</dd></div>
                        {courseData.tipo_examen && <div className="rounded-xl border border-gray-100 p-3"><dt className="text-xs text-medico-gray">Tipo</dt><dd className="font-semibold text-gray-900">{courseData.tipo_examen}</dd></div>}
                        {courseData.instructor_nombre && <div className="rounded-xl border border-gray-100 p-3"><dt className="text-xs text-medico-gray">Instructor</dt><dd className="font-semibold text-gray-900 truncate">{courseData.instructor_nombre}</dd></div>}
                    </dl>
                </div>
            </Modal>
        </Layout>
    )
}

export default CourseView
