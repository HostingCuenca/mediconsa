
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import courseManagementService from '../services/courseManagement'

const CourseManager = () => {
    const { cursoId } = useParams()
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [course, setCourse] = useState(null)
    const [modules, setModules] = useState([])
    const [simulacros, setSimulacros] = useState([])
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Estados de modales
    const [showModuleForm, setShowModuleForm] = useState(false)
    const [showClassForm, setShowClassForm] = useState(false)
    const [showSimulacroForm, setShowSimulacroForm] = useState(false)
    const [selectedModule, setSelectedModule] = useState(null)
    const [selectedClass, setSelectedClass] = useState(null)
    const [selectedSimulacro, setSelectedSimulacro] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    // Estados de formularios
    const [moduleForm, setModuleForm] = useState({
        titulo: '',
        descripcion: '',
        orden: 1
    })

    const [classForm, setClassForm] = useState({
        titulo: '',
        descripcion: '',
        videoYoutubeUrl: '',
        duracionMinutos: 0,
        esGratuita: false,
        orden: 1
    })

    // Estado de simulacro básico (solo para crear inicial)
    const [simulacroForm, setSimulacroForm] = useState({
        titulo: '',
        descripcion: '',
        numeroPreguntas: 10,
        modoEvaluacion: 'practica'
    })

    const [activeTab, setActiveTab] = useState('overview')

    // ========== EFECTOS ==========
    useEffect(() => {
        if (cursoId) {
            loadCourseData()
        }
    }, [cursoId])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadCourseData = async () => {
        try {
            setLoading(true)
            setError('')

            const [courseResult, statsResult] = await Promise.all([
                courseManagementService.getCourseForEditing(cursoId),
                courseManagementService.getCourseStats(cursoId)
            ])

            if (courseResult.success) {
                setCourse(courseResult.data.curso)
                setModules(courseResult.data.modulos || [])
                setSimulacros(courseResult.data.simulacros || [])
            } else {
                setError(courseResult.error || 'Error cargando el curso')
            }

            if (statsResult.success) {
                setStats(statsResult.data)
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // ========== GESTIÓN DE MÓDULOS ==========
    const handleCreateModule = () => {
        setSelectedModule(null)
        setModuleForm({
            titulo: '',
            descripcion: '',
            orden: (modules.length || 0) + 1
        })
        setShowModuleForm(true)
    }

    const handleEditModule = (module) => {
        setSelectedModule(module)
        setModuleForm({
            titulo: module.titulo,
            descripcion: module.descripcion || '',
            orden: module.orden
        })
        setShowModuleForm(true)
    }

    const handleSubmitModule = async (e) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const moduleData = {
                ...moduleForm,
                cursoId: cursoId
            }

            let result
            if (selectedModule) {
                result = await courseManagementService.updateModule(selectedModule.id, moduleData)
            } else {
                result = await courseManagementService.createModule(moduleData)
            }

            if (result.success) {
                setShowModuleForm(false)
                setSelectedModule(null)
                await loadCourseData()
                setSuccess(result.message)
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteModule = async (moduleId) => {
        if (!window.confirm('¿Estás seguro de eliminar este módulo? Se eliminarán todas sus clases.')) return

        try {
            setFormLoading(true)
            const result = await courseManagementService.deleteModule(moduleId)

            if (result.success) {
                await loadCourseData()
                setSuccess(result.message)
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    // ========== GESTIÓN DE CLASES ==========
    const handleCreateClass = (moduleId) => {
        const module = modules.find(m => m.id === moduleId)
        const classCount = module?.clases?.length || 0

        setSelectedClass(null)
        setClassForm({
            titulo: '',
            descripcion: '',
            videoYoutubeUrl: '',
            duracionMinutos: 0,
            esGratuita: false,
            orden: classCount + 1,
            moduloId: moduleId
        })
        setShowClassForm(true)
    }

    const handleEditClass = (clase) => {
        setSelectedClass(clase)
        setClassForm({
            titulo: clase.titulo,
            descripcion: clase.descripcion || '',
            videoYoutubeUrl: clase.video_youtube_url || '',
            duracionMinutos: clase.duracion_minutos || 0,
            esGratuita: clase.es_gratuita || false,
            orden: clase.orden,
            moduloId: clase.modulo_id
        })
        setShowClassForm(true)
    }

    const handleSubmitClass = async (e) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            let result
            if (selectedClass) {
                result = await courseManagementService.updateClass(selectedClass.id, classForm)
            } else {
                result = await courseManagementService.createClass(classForm)
            }

            if (result.success) {
                setShowClassForm(false)
                setSelectedClass(null)
                await loadCourseData()
                setSuccess(result.message)
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteClass = async (classId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta clase?')) return

        try {
            setFormLoading(true)
            const result = await courseManagementService.deleteClass(classId)

            if (result.success) {
                await loadCourseData()
                setSuccess(result.message)
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    // ========== GESTIÓN DE SIMULACROS BÁSICOS ==========
    const handleCreateSimulacro = () => {
        setSelectedSimulacro(null)
        setSimulacroForm({
            titulo: '',
            descripcion: '',
            numeroPreguntas: 10,
            modoEvaluacion: 'practica'
        })
        setShowSimulacroForm(true)
    }

    const handleSubmitSimulacro = async (e) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const simulacroData = {
                ...simulacroForm,
                cursoId: cursoId,
                // Configuración básica por defecto
                modoEstudio: 'estudio',
                tipoTiempo: 'sin_limite',
                tipoNavegacion: 'libre',
                intentosPermitidos: -1,
                randomizarPreguntas: false,
                randomizarOpciones: false,
                mostrarRespuestasDespues: 1
            }

            const result = await courseManagementService.createSimulacro(simulacroData)

            if (result.success) {
                setShowSimulacroForm(false)
                setSelectedSimulacro(null)
                await loadCourseData()
                setSuccess(`${result.message} - ¡Ahora configúralo!`)

                // Redirigir a configuración avanzada después de crear
                setTimeout(() => {
                    navigate(`/admin/simulacro/${result.data.simulacro.id}`)
                }, 1500)
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteSimulacro = async (simulacroId) => {
        if (!window.confirm('¿Estás seguro de eliminar este simulacro? Se eliminarán todas sus preguntas.')) return

        try {
            setFormLoading(true)
            const result = await courseManagementService.deleteSimulacro(simulacroId)

            if (result.success) {
                await loadCourseData()
                setSuccess(result.message)
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    // ========== UTILIDADES ==========
    const getModoEstudioLabel = (modo) => {
        const modos = {
            'estudio': { name: 'Modo Estudio', color: 'bg-green-100 text-green-800', icon: '📚' },
            'revision': { name: 'Modo Revisión', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
            'evaluacion': { name: 'Modo Evaluación', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
            'examen_real': { name: 'Modo Examen Real', color: 'bg-red-100 text-red-800', icon: '🎯' },
            // Compatibilidad con modo anterior
            'practica': { name: 'Práctica', color: 'bg-green-100 text-green-800', icon: '📚' },
            'realista': { name: 'Realista', color: 'bg-yellow-100 text-yellow-800', icon: '📝' },
            'examen': { name: 'Examen', color: 'bg-red-100 text-red-800', icon: '🎯' }
        }
        return modos[modo] || { name: modo, color: 'bg-gray-100 text-gray-800', icon: '📋' }
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
                        <p className="mt-4 text-medico-gray">Cargando curso...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!course) {
        return (
            <Layout showSidebar={true}>
                <div className="p-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Curso no encontrado</h1>
                        <button
                            onClick={() => navigate(-1)}
                            className="mt-4 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                            Volver
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* ========== HEADER ========== */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center space-x-4 mb-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-medico-blue hover:text-blue-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-3xl font-bold text-medico-blue">Gestionar Curso</h1>
                        </div>
                        <h2 className="text-xl text-gray-700 mb-2">{course.titulo}</h2>
                        {course.descripcion && (
                            <p className="text-medico-gray">{course.descripcion}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.es_gratuito ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {course.es_gratuito ? 'Gratuito' : `$${course.precio}`}
                            </span>
                            <span>•</span>
                            <span>{modules.length} módulos</span>
                            <span>•</span>
                            <span>{simulacros.length} simulacros</span>
                            <span>•</span>
                            <span>{modules.reduce((acc, mod) => acc + (mod.clases?.length || 0), 0)} clases</span>
                        </div>
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

                {/* ========== TABS ========== */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', name: 'Resumen', icon: '📊' },
                            { id: 'modules', name: 'Módulos', icon: '📚' },
                            { id: 'simulacros', name: 'Simulacros', icon: '🧪' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-medico-blue text-medico-blue'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <span className="mr-2">{tab.icon}</span>
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* ========== CONTENIDO POR TAB ========== */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {stats && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="text-2xl font-bold text-medico-blue">{stats.contenido?.modulos || 0}</div>
                                        <div className="ml-auto text-blue-500">📚</div>
                                    </div>
                                    <div className="text-sm text-gray-500">Módulos</div>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="text-2xl font-bold text-green-600">{stats.contenido?.clases || 0}</div>
                                        <div className="ml-auto text-green-500">🎓</div>
                                    </div>
                                    <div className="text-sm text-gray-500">Clases</div>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="text-2xl font-bold text-purple-600">{stats.contenido?.simulacros || 0}</div>
                                        <div className="ml-auto text-purple-500">🧪</div>
                                    </div>
                                    <div className="text-sm text-gray-500">Simulacros</div>
                                </div>

                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center">
                                        <div className="text-2xl font-bold text-orange-600">{stats.contenido?.preguntas || 0}</div>
                                        <div className="ml-auto text-orange-500">❓</div>
                                    </div>
                                    <div className="text-sm text-gray-500">Preguntas</div>
                                </div>
                            </div>
                        )}

                        {stats?.resumen?.completitud && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Curso</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${stats.resumen.completitud.tiene_contenido ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>Tiene contenido (clases)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${stats.resumen.completitud.tiene_evaluacion ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>Tiene evaluaciones (simulacros)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${stats.resumen.completitud.tiene_preguntas ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span>Tiene preguntas configuradas</span>
                                    </div>
                                    {stats.resumen.completitud.esta_completo && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex items-center">
                                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-green-800 font-medium">¡Curso completo y listo para estudiantes!</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'modules' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Módulos del Curso</h3>
                            <button
                                onClick={handleCreateModule}
                                className="bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Nuevo Módulo</span>
                            </button>
                        </div>

                        {modules.length > 0 ? (
                            <div className="space-y-4">
                                {modules.map((module, index) => (
                                    <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                   <span className="bg-medico-blue text-white px-2 py-1 rounded text-sm font-medium">
                                                       Módulo {module.orden}
                                                   </span>
                                                </div>
                                                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {module.titulo}
                                                </h4>
                                                {module.descripcion && (
                                                    <p className="text-gray-600 text-sm mb-3">
                                                        {module.descripcion}
                                                    </p>
                                                )}
                                                <div className="text-sm text-gray-500">
                                                    {module.clases?.length || 0} clases
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleCreateClass(module.id)}
                                                    className="text-green-600 hover:text-green-800 text-sm bg-green-50 px-3 py-1 rounded-md transition-colors"
                                                >
                                                    + Clase
                                                </button>
                                                <button
                                                    onClick={() => handleEditModule(module)}
                                                    className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded-md transition-colors"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteModule(module.id)}
                                                    className="text-red-600 hover:text-red-800 text-sm bg-red-50 px-3 py-1 rounded-md transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>

                                        {/* Clases del módulo */}
                                        {module.clases && module.clases.length > 0 && (
                                            <div className="border-t border-gray-200 pt-4">
                                                <h5 className="font-medium text-gray-900 mb-3">Clases:</h5>
                                                <div className="space-y-2">
                                                    {module.clases.map((clase) => (
                                                        <div key={clase.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="text-sm text-gray-500 font-medium bg-white px-2 py-1 rounded">#{clase.orden}</span>
                                                                <span className="font-medium">{clase.titulo}</span>
                                                                {clase.duracion_minutos && (
                                                                    <span className="text-sm text-gray-500 bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                                       🕐 {clase.duracion_minutos} min
                                                                   </span>
                                                                )}
                                                                {clase.es_gratuita && (
                                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">
                                                                       Gratuita
                                                                   </span>
                                                                )}
                                                                {clase.video_youtube_url && (
                                                                    <span className="text-red-500 text-sm">
                                                                       📹 YouTube
                                                                   </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <button
                                                                    onClick={() => handleEditClass(clase)}
                                                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                                                >
                                                                    ✏️ Editar
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteClass(clase.id)}
                                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                                >
                                                                    🗑️ Eliminar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📚</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay módulos</h3>
                                <p className="text-gray-500 mb-4">Comienza creando el primer módulo de tu curso</p>
                                <button
                                    onClick={handleCreateModule}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Crear Primer Módulo
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'simulacros' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Simulacros del Curso</h3>
                            <button
                                onClick={handleCreateSimulacro}
                                className="bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Nuevo Simulacro</span>
                            </button>
                        </div>

                        {simulacros.length > 0 ? (
                            <div className="space-y-4">
                                {simulacros.map((simulacro) => {
                                    const modoInfo = getModoEstudioLabel(simulacro.modo_estudio || simulacro.modo_evaluacion || 'estudio')
                                    return (
                                        <div key={simulacro.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                       <span className={`px-3 py-1 rounded-full text-sm font-medium ${modoInfo.color}`}>
                                                           {modoInfo.icon} {modoInfo.name}
                                                       </span>
                                                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                                                           ⏰ {getTiempoLabel(simulacro)}
                                                       </span>
                                                        {simulacro.tipo_navegacion === 'secuencial' && (
                                                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm">
                                                               ➡️ Secuencial
                                                           </span>
                                                        )}
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                                        {simulacro.titulo}
                                                    </h4>
                                                    {simulacro.descripcion && (
                                                        <p className="text-gray-600 text-sm mb-3">
                                                            {simulacro.descripcion}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>{simulacro.total_preguntas || 0}/{simulacro.numero_preguntas} preguntas</span>
                                                        {simulacro.tiempo_limite_minutos && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{simulacro.tiempo_limite_minutos} min</span>
                                                            </>
                                                        )}
                                                        <span>•</span>
                                                        <span>
                                                           {simulacro.intentos_permitidos === -1
                                                               ? 'Intentos ilimitados'
                                                               : `${simulacro.intentos_permitidos} intentos`
                                                           }
                                                       </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => navigate(`/admin/simulacro/${simulacro.id}`)}
                                                        className="text-purple-600 hover:text-purple-800 text-sm bg-purple-50 px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        ⚙️ Configurar
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/questions/${simulacro.id}`)}
                                                        className="text-green-600 hover:text-green-800 text-sm bg-green-50 px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        ❓ Preguntas
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteSimulacro(simulacro.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm bg-red-50 px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Barra de progreso */}
                                            <div className="mb-3">
                                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                    <span>Progreso de preguntas</span>
                                                    <span>{Math.round(((simulacro.total_preguntas || 0) / simulacro.numero_preguntas) * 100)}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3">
                                                    <div
                                                        className="bg-medico-blue h-3 rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(((simulacro.total_preguntas || 0) / simulacro.numero_preguntas) * 100, 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Estado del simulacro */}
                                            {simulacro.total_preguntas >= simulacro.numero_preguntas ? (
                                                <div className="flex items-center text-green-600 text-sm bg-green-50 p-2 rounded-lg">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Simulacro completo y listo para estudiantes
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-orange-600 text-sm bg-orange-50 p-2 rounded-lg">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Faltan {simulacro.numero_preguntas - (simulacro.total_preguntas || 0)} preguntas por agregar
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🧪</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay simulacros</h3>
                                <p className="text-gray-500 mb-4">Crea simulacros para evaluar a tus estudiantes</p>
                                <button
                                    onClick={handleCreateSimulacro}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Crear Primer Simulacro
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== MODAL MÓDULO ========== */}
                {showModuleForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {selectedModule ? '✏️ Editar Módulo' : '➕ Nuevo Módulo'}
                                </h3>
                                <button
                                    onClick={() => setShowModuleForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmitModule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título del Módulo *
                                    </label>
                                    <input
                                        type="text"
                                        value={moduleForm.titulo}
                                        onChange={(e) => setModuleForm({ ...moduleForm, titulo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Ej: Módulo 1: Anatomía Básica"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={moduleForm.descripcion}
                                        onChange={(e) => setModuleForm({ ...moduleForm, descripcion: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Descripción del contenido del módulo..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Orden
                                    </label>
                                    <input
                                        type="number"
                                        value={moduleForm.orden}
                                        onChange={(e) => setModuleForm({ ...moduleForm, orden: parseInt(e.target.value) || 1 })}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowModuleForm(false)}
                                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        {formLoading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        <span>{formLoading ? 'Guardando...' : (selectedModule ? 'Actualizar' : 'Crear Módulo')}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========== MODAL CLASE ========== */}
                {showClassForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {selectedClass ? '✏️ Editar Clase' : '➕ Nueva Clase'}
                                </h3>
                                <button
                                    onClick={() => setShowClassForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmitClass} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título de la Clase *
                                    </label>
                                    <input
                                        type="text"
                                        value={classForm.titulo}
                                        onChange={(e) => setClassForm({ ...classForm, titulo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Ej: Introducción a la Anatomía"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={classForm.descripcion}
                                        onChange={(e) => setClassForm({ ...classForm, descripcion: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Descripción del contenido de la clase..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL de YouTube
                                        </label>
                                        <input
                                            type="url"
                                            value={classForm.videoYoutubeUrl}
                                            onChange={(e) => setClassForm({ ...classForm, videoYoutubeUrl: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="https://youtube.com/watch?v=..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duración (minutos)
                                        </label>
                                        <input
                                            type="number"
                                            value={classForm.duracionMinutos}
                                            onChange={(e) => setClassForm({ ...classForm, duracionMinutos: parseInt(e.target.value) || 0 })}
                                            min="0"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="60"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Orden
                                        </label>
                                        <input
                                            type="number"
                                            value={classForm.orden}
                                            onChange={(e) => setClassForm({ ...classForm, orden: parseInt(e.target.value) || 1 })}
                                            min="1"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex items-center pt-6">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={classForm.esGratuita}
                                                onChange={(e) => setClassForm({ ...classForm, esGratuita: e.target.checked })}
                                                className="mr-2 rounded"
                                            />
                                            <span className="text-sm text-gray-700">Clase gratuita</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowClassForm(false)}
                                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        {formLoading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        <span>{formLoading ? 'Guardando...' : (selectedClass ? 'Actualizar' : 'Crear Clase')}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========== MODAL SIMULACRO BÁSICO ========== */}
                {showSimulacroForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    ➕ Nuevo Simulacro
                                </h3>
                                <button
                                    onClick={() => setShowSimulacroForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center text-blue-800">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-sm">
                                       <strong>Creación rápida:</strong> Primero crea el simulacro básico, luego lo configurarás con opciones avanzadas.
                                   </span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitSimulacro} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título del Simulacro *
                                    </label>
                                    <input
                                        type="text"
                                        value={simulacroForm.titulo}
                                        onChange={(e) => setSimulacroForm({ ...simulacroForm, titulo: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Ej: Simulacro de Anatomía Básica"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={simulacroForm.descripcion}
                                        onChange={(e) => setSimulacroForm({ ...simulacroForm, descripcion: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Descripción del simulacro y objetivos..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Número de Preguntas *
                                        </label>
                                        <input
                                            type="number"
                                            value={simulacroForm.numeroPreguntas}
                                            onChange={(e) => setSimulacroForm({ ...simulacroForm, numeroPreguntas: parseInt(e.target.value) || 10 })}
                                            min="1"
                                            max="200"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="10"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Modo Inicial
                                        </label>
                                        <select
                                            value={simulacroForm.modoEvaluacion}
                                            onChange={(e) => setSimulacroForm({ ...simulacroForm, modoEvaluacion: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        >
                                            <option value="practica">📚 Práctica (sin límites)</option>
                                            <option value="realista">📝 Realista (con tiempo)</option>
                                            <option value="examen">🎯 Examen (estricto)</option>
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Podrás configurar opciones avanzadas después de crearlo
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-medium text-yellow-900 mb-2">🚀 Próximos pasos:</h4>
                                    <div className="text-sm text-yellow-800 space-y-1">
                                        <p>1. ✅ Crear simulacro básico</p>
                                        <p>2. ⚙️ Configurar opciones avanzadas</p>
                                        <p>3. ❓ Agregar preguntas</p>
                                        <p>4. 🎯 ¡Listo para estudiantes!</p>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowSimulacroForm(false)}
                                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formLoading}
                                        className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        {formLoading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        <span>{formLoading ? 'Creando...' : 'Crear y Configurar'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default CourseManager