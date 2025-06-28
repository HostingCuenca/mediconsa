// src/adminpanel/CanalesManager.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'
import coursesService from '../services/courses'

const CanalesManager = () => {
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [cursos, setCursos] = useState([])
    const [selectedCurso, setSelectedCurso] = useState(null)
    const [canales, setCanales] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadingCanales, setLoadingCanales] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario
    const [canalForm, setCanalForm] = useState({
        nombre: '',
        descripcion: '',
        tipoCanal: 'whatsapp',
        linkAcceso: ''
    })

    // Estados de UI
    const [showForm, setShowForm] = useState(false)
    const [editingCanal, setEditingCanal] = useState(null)

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

            const result = await coursesService.getAllCourses()

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

    const loadCanales = async (cursoId) => {
        try {
            setLoadingCanales(true)
            setError('')

            const result = await materialServices.getCanalesByCourse(cursoId)

            if (result.success) {
                setCanales(result.data.canales || [])
            } else {
                setError(result.error || 'Error cargando canales')
            }
        } catch (error) {
            console.error('Error cargando canales:', error)
            setError('Error de conexión al cargar los canales')
        } finally {
            setLoadingCanales(false)
        }
    }

    const handleSelectCurso = (curso) => {
        setSelectedCurso(curso)
        setCanales([])
        loadCanales(curso.id)
    }

    const handleBackToCursos = () => {
        setSelectedCurso(null)
        setCanales([])
        setShowForm(false)
        resetForm()
    }

    // ========== GESTIÓN DE FORMULARIO ==========
    const handleSubmitCanal = async (e) => {
        e.preventDefault()
        setFormLoading(true)
        setError('')

        try {
            const canalData = {
                nombre: canalForm.nombre.trim(),
                descripcion: canalForm.descripcion.trim(),
                cursoId: selectedCurso.id,
                tipoCanal: canalForm.tipoCanal,
                linkAcceso: canalForm.linkAcceso.trim()
            }

            let result

            if (editingCanal) {
                result = await materialServices.updateCanal(editingCanal, canalData)
            } else {
                result = await materialServices.createCanal(canalData)
            }

            if (result.success) {
                setSuccess(result.message || (editingCanal ? 'Canal actualizado exitosamente' : 'Canal creado exitosamente'))
                setShowForm(false)
                resetForm()
                await loadCanales(selectedCurso.id)
            } else {
                setError(result.error || 'Error procesando el canal')
            }
        } catch (error) {
            console.error('Error en formulario:', error)
            setError('Error de conexión al procesar el canal')
        } finally {
            setFormLoading(false)
        }
    }

    const handleEditCanal = (canal) => {
        setCanalForm({
            nombre: canal.nombre || '',
            descripcion: canal.descripcion || '',
            tipoCanal: canal.tipo_canal || 'whatsapp',
            linkAcceso: canal.link_acceso || ''
        })
        setEditingCanal(canal.id)
        setShowForm(true)
    }

    const resetForm = () => {
        setCanalForm({
            nombre: '',
            descripcion: '',
            tipoCanal: 'whatsapp',
            linkAcceso: ''
        })
        setEditingCanal(null)
    }

    // ========== UTILIDADES ==========
    const getTipoDisplay = (tipoCanal) => {
        const tipos = {
            'whatsapp': { name: 'WhatsApp', color: 'bg-green-100 text-green-800', icon: '📱' },
            'telegram': { name: 'Telegram', color: 'bg-blue-100 text-blue-800', icon: '✈️' },
            'discord': { name: 'Discord', color: 'bg-purple-100 text-purple-800', icon: '🎮' },
            'slack': { name: 'Slack', color: 'bg-yellow-100 text-yellow-800', icon: '💬' }
        }
        return tipos[tipoCanal] || tipos['whatsapp']
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

    const validateForm = () => {
        if (!canalForm.nombre.trim()) {
            setError('El nombre del canal es requerido')
            return false
        }
        if (!canalForm.linkAcceso.trim()) {
            setError('El link de acceso es requerido')
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                                </svg>
                                <span>Canales de Comunicación</span>
                            </h1>
                        </div>

                        {selectedCurso ? (
                            <>
                                <h2 className="text-xl text-gray-700 mb-2">{selectedCurso.titulo}</h2>
                                <div className="text-sm text-gray-600">
                                    {canales.length} canal{canales.length !== 1 ? 'es' : ''} configurado{canales.length !== 1 ? 's' : ''}
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl text-gray-700 mb-2">Gestionar Canales de Comunicación</h2>
                                <div className="text-sm text-gray-600">
                                    Selecciona un curso para gestionar su canal de comunicación
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
                            <span>{canales.length > 0 ? 'Actualizar Canal' : 'Crear Canal'}</span>
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
                                <p className="text-gray-500">Primero debes crear cursos para poder gestionar canales de comunicación</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== VISTA: CANALES DEL CURSO SELECCIONADO ========== */}
                {selectedCurso && (
                    <>
                        {loadingCanales ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medico-blue mx-auto"></div>
                                    <p className="mt-2 text-medico-gray">Cargando canales...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {canales.map((canal) => {
                                    const tipoDisplay = getTipoDisplay(canal.tipo_canal)

                                    return (
                                        <div key={canal.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-3">
                                                        <h3 className="font-semibold text-lg text-gray-900">{canal.nombre}</h3>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tipoDisplay.color}`}>
                                                            {tipoDisplay.icon} {tipoDisplay.name}
                                                        </span>
                                                    </div>

                                                    {canal.descripcion && (
                                                        <p className="text-gray-600 mb-4 leading-relaxed">{canal.descripcion}</p>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-2">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>Creado: {formatDateTime(canal.fecha_creacion)}</span>
                                                        </div>
                                                        {canal.creado_por_nombre && (
                                                            <div className="flex items-center space-x-2">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                <span>Por: {canal.creado_por_nombre}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col space-y-2 ml-6">
                                                    <button
                                                        onClick={() => window.open(canal.link_acceso, '_blank')}
                                                        className="bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                        </svg>
                                                        <span>Acceder</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleEditCanal(canal)}
                                                        className="bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span>Editar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}

                                {/* Empty State para canales */}
                                {canales.length === 0 && (
                                    <div className="text-center py-16">
                                        <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                                        </svg>
                                        <h3 className="text-xl font-medium text-gray-900 mb-2">No hay canal configurado</h3>
                                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                            Crea el canal de comunicación para <strong>{selectedCurso.titulo}</strong> y mantén contacto directo con tus estudiantes
                                        </p>
                                        <button
                                            onClick={() => setShowForm(true)}
                                            className="bg-medico-blue text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span>Crear Canal</span>
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
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                                        </svg>
                                        <span>{editingCanal ? 'Actualizar Canal' : 'Crear Canal'}</span>
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
                                        handleSubmitCanal(e)
                                    }
                                }} className="space-y-5">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nombre del Canal *
                                        </label>
                                        <input
                                            type="text"
                                            value={canalForm.nombre}
                                            onChange={(e) => setCanalForm(prev => ({ ...prev, nombre: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            required
                                            placeholder="Ej: Grupo Medicina 2025"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={canalForm.descripcion}
                                            onChange={(e) => setCanalForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            placeholder="Descripción del propósito del canal..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tipo de Canal *
                                        </label>
                                        <select
                                            value={canalForm.tipoCanal}
                                            onChange={(e) => setCanalForm(prev => ({ ...prev, tipoCanal: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            required
                                        >
                                            <option value="whatsapp">📱 WhatsApp</option>
                                            <option value="telegram">✈️ Telegram</option>
                                            <option value="discord">🎮 Discord</option>
                                            <option value="slack">💬 Slack</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Link de Acceso *
                                        </label>
                                        <input
                                            type="url"
                                            value={canalForm.linkAcceso}
                                            onChange={(e) => setCanalForm(prev => ({ ...prev, linkAcceso: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            required
                                            placeholder="https://chat.whatsapp.com/... o https://t.me/..."
                                        />
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-900 mb-2 flex items-center space-x-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Consejos importantes</span>
                                        </h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Asegúrate de que el link de acceso sea público o funcione para invitados</li>
                                            <li>• Verifica que el enlace esté activo antes de guardarlo</li>
                                            <li>• Solo habrá 1 canal por curso, actualízalo si cambia el grupo</li>
                                            <li>• Los estudiantes accederán directamente desde la plataforma</li>
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
                                                   ? (editingCanal ? 'Actualizando...' : 'Creando...')
                                                   : (editingCanal ? 'Actualizar Canal' : 'Crear Canal')
                                               }
                                           </span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default CanalesManager