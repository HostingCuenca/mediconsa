// src/adminpanel/ClasesVirtualesManager.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'
import coursesService from '../services/courses' // Asumiendo que tienes este service

const ClasesVirtualesManager = () => {
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [cursos, setCursos] = useState([])
    const [selectedCurso, setSelectedCurso] = useState(null)
    const [clasesVirtuales, setClasesVirtuales] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingClases, setLoadingClases] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario
    const [claseForm, setClaseForm] = useState({
        titulo: '',
        descripcion: '',
        plataforma: 'meet',
        linkReunion: '',
        fechaProgramada: '',
        duracionMinutos: 60
    })

    // Estados de UI
    const [showForm, setShowForm] = useState(false)
    const [editingClase, setEditingClase] = useState(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

    // ========== EFECTOS ==========
    useEffect(() => {
        loadCursos()
    }, [])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 4000)
            return () => clearTimeout(timer)
        }
    }, [success])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 5000)
            return () => clearTimeout(timer)
        }
    }, [error])

    // ========== FUNCIONES DE CARGA ==========
    const loadCursos = async () => {
        try {
            setLoading(true)
            setError('')

            // Usar el endpoint de cursos que ya tienes
            const result = await coursesService.getAllCourses() // o el método que uses para obtener cursos

            if (result.success) {
                setCursos(result.data.cursos || result.data || [])
            } else {
                setError(result.error || 'Error cargando cursos')
            }
        } catch (error) {
            console.error('Error cargando cursos:', error)
            setError('Error de conexión al cargar los cursos')
        } finally {
            setLoading(false)
        }
    }

    const loadClasesVirtuales = async (cursoId) => {
        try {
            setLoadingClases(true)
            setError('')

            const result = await materialServices.getClasesVirtualesByCourse(cursoId)

            if (result.success) {
                setClasesVirtuales(result.data.clasesVirtuales || [])
            } else {
                setError(result.error || 'Error cargando clases virtuales')
            }
        } catch (error) {
            console.error('Error cargando clases:', error)
            setError('Error de conexión al cargar las clases virtuales')
        } finally {
            setLoadingClases(false)
        }
    }

    const handleSelectCurso = (curso) => {
        setSelectedCurso(curso)
        setClasesVirtuales([])
        loadClasesVirtuales(curso.id)
    }

    const handleBackToCursos = () => {
        setSelectedCurso(null)
        setClasesVirtuales([])
        setShowForm(false)
        resetForm()
    }

    // ========== GESTIÓN DE FORMULARIO ==========
    const handleSubmitClase = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        setError('')

        try {
            const claseData = {
                titulo: claseForm.titulo.trim(),
                descripcion: claseForm.descripcion.trim(),
                cursoId: selectedCurso.id,
                plataforma: claseForm.plataforma,
                linkReunion: claseForm.linkReunion.trim(),
                fechaProgramada: claseForm.fechaProgramada,
                duracionMinutos: parseInt(claseForm.duracionMinutos) || 60
            }

            let result

            if (editingClase) {
                result = await materialServices.updateClaseVirtual(editingClase, claseData)
            } else {
                result = await materialServices.createClaseVirtual(claseData)
            }

            if (result.success) {
                setSuccess(result.message || (editingClase ? 'Clase virtual actualizada exitosamente' : 'Clase virtual creada exitosamente'))
                setShowForm(false)
                resetForm()
                await loadClasesVirtuales(selectedCurso.id)
            } else {
                setError(result.error || 'Error procesando la clase virtual')
            }
        } catch (error) {
            console.error('Error en formulario:', error)
            setError('Error de conexión al procesar la clase virtual')
        } finally {
            setFormLoading(false)
        }
    }

    const handleEditClase = (clase) => {
        setClaseForm({
            titulo: clase.titulo || '',
            descripcion: clase.descripcion || '',
            plataforma: clase.plataforma || 'meet',
            linkReunion: clase.link_reunion || '',
            fechaProgramada: clase.fecha_programada ? new Date(clase.fecha_programada).toISOString().slice(0, 16) : '',
            duracionMinutos: clase.duracion_minutos || 60
        })
        setEditingClase(clase.id)
        setShowForm(true)
    }

    const handleDeleteClase = async (claseId) => {
        try {
            setError('')
            const result = await materialServices.deleteClaseVirtual(claseId)

            if (result.success) {
                setSuccess(result.message || 'Clase virtual eliminada exitosamente')
                setShowDeleteConfirm(null)
                await loadClasesVirtuales(selectedCurso.id)
            } else {
                setError(result.error || 'Error eliminando la clase virtual')
            }
        } catch (error) {
            console.error('Error eliminando clase:', error)
            setError('Error de conexión al eliminar la clase virtual')
        }
    }

    const resetForm = () => {
        setClaseForm({
            titulo: '',
            descripcion: '',
            plataforma: 'meet',
            linkReunion: '',
            fechaProgramada: '',
            duracionMinutos: 60
        })
        setEditingClase(null)
    }

    // ========== UTILIDADES ==========
    const getPlataformaBadge = (plataforma) => {
        const plataformas = {
            'meet': { name: 'Google Meet', color: 'bg-green-100 text-green-800', icon: '🎥' },
            'zoom': { name: 'Zoom', color: 'bg-blue-100 text-blue-800', icon: '📹' },
            'teams': { name: 'Microsoft Teams', color: 'bg-purple-100 text-purple-800', icon: '👥' }
        }
        return plataformas[plataforma] || plataformas['meet']
    }

    const getEstadoBadge = (estado) => {
        const estados = {
            'programada': { name: 'Programada', color: 'bg-blue-100 text-blue-800', icon: '📅' },
            'proximamente': { name: 'Próximamente', color: 'bg-yellow-100 text-yellow-800', icon: '⏰' },
            'finalizada': { name: 'Finalizada', color: 'bg-gray-100 text-gray-800', icon: '✅' }
        }
        return estados[estado] || estados['programada']
    }

    const formatDateTime = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('es-EC', {
                timeZone: 'America/Guayaquil',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            return 'Fecha inválida'
        }
    }

    const getDefaultDateTime = () => {
        const now = new Date()
        now.setHours(now.getHours() + 1)
        return now.toISOString().slice(0, 16)
    }

    const validateForm = () => {
        if (!claseForm.titulo.trim()) {
            setError('El título es requerido')
            return false
        }
        if (!claseForm.linkReunion.trim()) {
            setError('El link de reunión es requerido')
            return false
        }
        if (!claseForm.fechaProgramada) {
            setError('La fecha y hora son requeridas')
            return false
        }

        const fechaClase = new Date(claseForm.fechaProgramada)
        const ahora = new Date()
        if (fechaClase <= ahora) {
            setError('La fecha debe ser futura')
            return false
        }

        return true
    }

    // ========== RENDER ==========
    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando cursos...</p>
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
                            {selectedCurso && (
                                <button
                                    onClick={handleBackToCursos}
                                    className="text-medico-blue hover:text-blue-700 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            )}
                            <h1 className="text-3xl font-bold text-medico-blue flex items-center space-x-2">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Clases Virtuales</span>
                            </h1>
                        </div>

                        {selectedCurso ? (
                            <>
                                <h2 className="text-xl text-gray-700 mb-2">{selectedCurso.titulo}</h2>
                                <div className="text-sm text-gray-600">
                                    {clasesVirtuales.length} clases programadas
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl text-gray-700 mb-2">Gestionar Clases Virtuales</h2>
                                <div className="text-sm text-gray-600">
                                    Selecciona un curso para gestionar sus clases virtuales
                                </div>
                            </>
                        )}
                    </div>

                    {selectedCurso && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Nueva Clase Virtual</span>
                        </button>
                    )}
                </div>

                {/* ========== MENSAJES ========== */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-600">{error}</p>
                            </div>
                            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-600">{success}</p>
                            </div>
                            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* ========== VISTA: SELECCIONAR CURSO ========== */}
                {!selectedCurso && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selecciona un Curso</h3>
                        {cursos.map((curso) => (
                            <div
                                key={curso.id}
                                onClick={() => handleSelectCurso(curso)}
                                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-medico-blue"
                            >
                                <div className="flex items-center space-x-4">
                                    {curso.miniatura_url && (
                                        <img
                                            src={curso.miniatura_url}
                                            alt={curso.titulo}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-lg text-gray-900">{curso.titulo}</h4>
                                        {curso.descripcion && (
                                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">{curso.descripcion}</p>
                                        )}
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                            <span>📚 {curso.total_modulos || 0} módulos</span>
                                            <span>🎓 {curso.total_estudiantes || 0} estudiantes</span>
                                        </div>
                                    </div>
                                    <div className="text-medico-blue">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {cursos.length === 0 && (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos disponibles</h3>
                                <p className="text-gray-500">Primero debes crear cursos para poder gestionar clases virtuales</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== VISTA: CLASES DEL CURSO SELECCIONADO ========== */}
                {selectedCurso && (
                    <>
                        {loadingClases ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medico-blue mx-auto"></div>
                                    <p className="mt-2 text-medico-gray">Cargando clases virtuales...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {clasesVirtuales.map((clase) => {
                                    const plataformaBadge = getPlataformaBadge(clase.plataforma)
                                    const estadoBadge = getEstadoBadge(clase.estado_tiempo)

                                    return (
                                        <div key={clase.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <h3 className="font-semibold text-lg text-gray-900">{clase.titulo}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${plataformaBadge.color}`}>
                                                            {plataformaBadge.icon} {plataformaBadge.name}
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoBadge.color}`}>
                                                            {estadoBadge.icon} {estadoBadge.name}
                                                        </span>
                                                    </div>

                                                    {clase.descripcion && (
                                                        <p className="text-gray-600 mb-4 leading-relaxed">{clase.descripcion}</p>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>{formatDateTime(clase.fecha_programada)}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <span>{clase.duracion_minutos} minutos</span>
                                                        </div>
                                                        {clase.instructor_nombre && (
                                                            <div className="flex items-center space-x-2">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <span>Instructor: {clase.instructor_nombre}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2 ml-6">
                                                    <button
                                                        onClick={() => window.open(clase.link_reunion, '_blank')}
                                                        className="bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        <span>Abrir Reunión</span>
                                                    </button>

                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditClase(clase)}
                                                            className="bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                                            title="Editar clase"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            onClick={() => setShowDeleteConfirm(clase)}
                                                            className="bg-red-50 text-red-700 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                                            title="Eliminar clase"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Empty State para clases */}
                                {clasesVirtuales.length === 0 && (
                                    <div className="text-center py-16">
                                        <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">No hay clases virtuales programadas</h3>
                                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                            Crea la primera clase virtual para <strong>{selectedCurso.titulo}</strong> y conecta con tus estudiantes en tiempo real
                                        </p>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="bg-medico-blue text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Programar Primera Clase Virtual</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ========== MODAL FORMULARIO ========== */}
                {showForm && selectedCurso && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                                        <svg className="w-6 h-6 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>{editingClase ? 'Editar Clase Virtual' : 'Nueva Clase Virtual'}</span>
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowForm(false)
                                            resetForm()
                                        }}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Curso:</strong> {selectedCurso.titulo}
                                    </p>
                                </div>

                                <form onSubmit={(e) => {
                                    e.preventDefault()
                                    if (validateForm()) {
                                        handleSubmitClase(e)
                                    }
                                }} className="space-y-5">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Título de la Clase *
                                        </label>
                                        <input
                                            type="text"
                                            value={claseForm.titulo}
                                            onChange={(e) => setClaseForm(prev => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            required
                                            placeholder="Ej: Clase Virtual: Cardiología Avanzada"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={claseForm.descripcion}
                                            onChange={(e) => setClaseForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            placeholder="Descripción de los temas a tratar en la clase..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Plataforma *
                                            </label>
                                            <select
                                                value={claseForm.plataforma}
                                                onChange={(e) => setClaseForm(prev => ({ ...prev, plataforma: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                                required
                                            >
                                                <option value="meet">🎥 Google Meet</option>
                                                <option value="zoom">📹 Zoom</option>
                                                <option value="teams">👥 Microsoft Teams</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duración (minutos)
                                            </label>
                                            <input
                                                type="number"
                                                min="15"
                                                max="480"
                                                value={claseForm.duracionMinutos}
                                                onChange={(e) => setClaseForm(prev => ({ ...prev, duracionMinutos: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                                placeholder="60"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link de la Reunión *
                                        </label>
                                        <input
                                            type="url"
                                            value={claseForm.linkReunion}
                                            onChange={(e) => setClaseForm(prev => ({ ...prev, linkReunion: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            required
                                            placeholder="https://meet.google.com/xyz-abcd-efgh"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha y Hora Programada *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={claseForm.fechaProgramada || getDefaultDateTime()}
                                            onChange={(e) => setClaseForm(prev => ({ ...prev, fechaProgramada: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            required
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Hora local de Ecuador (GMT-5)
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Consejos importantes</span>
                                        </h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Programa la clase con al menos 30 minutos de anticipación</li>
                                            <li>• Verifica que el link de reunión sea correcto y esté activo</li>
                                            <li>• Los estudiantes podrán ver el link 15 minutos antes del inicio</li>
                                            <li>• Asegúrate de tener una conexión estable a internet</li>
                                        </ul>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false)
                                                resetForm()
                                            }}
                                            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="px-8 py-3 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 font-medium"
                                        >
                                            {formLoading && (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                            <span>
                                               {formLoading
                                                   ? (editingClase ? 'Actualizando...' : 'Creando...')
                                                   : (editingClase ? 'Actualizar Clase' : 'Programar Clase')
                                               }
                                           </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== MODAL CONFIRMACIÓN ELIMINAR ========== */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl w-full max-w-md">
                            <div className="p-6">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                    Eliminar Clase Virtual
                                </h3>

                                <p className="text-gray-600 text-center mb-2">
                                    ¿Estás seguro de que deseas eliminar esta clase virtual?
                                </p>

                                <div className="bg-gray-50 rounded-lg p-3 mb-6">
                                    <p className="font-medium text-gray-900">{showDeleteConfirm.titulo}</p>
                                    <p className="text-sm text-gray-600">
                                        {formatDateTime(showDeleteConfirm.fecha_programada)}
                                    </p>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                                    <p className="text-sm text-red-800">
                                        <strong>⚠️ Advertencia:</strong> Esta acción no se puede deshacer.
                                        Los estudiantes ya no podrán acceder a esta clase virtual.
                                    </p>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowDeleteConfirm(null)}
                                        className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClase(showDeleteConfirm.id)}
                                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                    >
                                        Eliminar
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

export default ClasesVirtualesManager