import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import courseManagementService from '../services/courseManagement'

const SimulacroManager = () => {
    const { simulacroId } = useParams()
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [simulacro, setSimulacro] = useState(null)
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario avanzado
    const [simulacroForm, setSimulacroForm] = useState({
        titulo: '',
        descripcion: '',
        modoEstudio: 'estudio',
        tipoTiempo: 'sin_limite',
        tipoNavegacion: 'libre',
        tiempoLimiteMinutos: '',
        tiempoPorPreguntaSegundos: '',
        numeroPreguntas: 10,
        intentosPermitidos: -1,
        randomizarPreguntas: true,
        randomizarOpciones: true,
        mostrarRespuestasDespues: 1,
        configuracionAvanzada: {}
    })

    // Estados para templates y configuraciones
    const [simulacroConfigs, setSimulacroConfigs] = useState(null)
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [showTemplates, setShowTemplates] = useState(false)

    // ========== EFECTOS ==========
    useEffect(() => {
        if (simulacroId) {
            loadSimulacroData()
            loadConfigurations()
        }
    }, [simulacroId])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // Calcular tiempos automáticamente
    useEffect(() => {
        if (simulacroForm.tipoTiempo === 'por_pregunta' && simulacroForm.tiempoPorPreguntaSegundos && simulacroForm.numeroPreguntas) {
            const tiempoTotal = Math.ceil((simulacroForm.tiempoPorPreguntaSegundos * simulacroForm.numeroPreguntas) / 60)
            setSimulacroForm(prev => ({ ...prev, tiempoLimiteMinutos: tiempoTotal }))
        } else if (simulacroForm.tipoTiempo === 'global' && simulacroForm.tiempoLimiteMinutos && simulacroForm.numeroPreguntas) {
            const tiempoPorPregunta = Math.floor((simulacroForm.tiempoLimiteMinutos * 60) / simulacroForm.numeroPreguntas)
            setSimulacroForm(prev => ({ ...prev, tiempoPorPreguntaSegundos: tiempoPorPregunta }))
        }
    }, [simulacroForm.tipoTiempo, simulacroForm.tiempoLimiteMinutos, simulacroForm.tiempoPorPreguntaSegundos, simulacroForm.numeroPreguntas])

    // ========== FUNCIONES DE CARGA ==========
    const loadSimulacroData = async () => {
        try {
            setLoading(true)
            const result = await courseManagementService.getSimulacroWithQuestions(simulacroId)

            if (result.success) {
                const sim = result.data.simulacro
                setSimulacro(sim)
                setCourse({ titulo: sim.curso_titulo })

                // Llenar formulario con datos existentes
                setSimulacroForm({
                    titulo: sim.titulo,
                    descripcion: sim.descripcion || '',
                    modoEstudio: sim.modo_estudio || 'estudio',
                    tipoTiempo: sim.tipo_tiempo || 'sin_limite',
                    tipoNavegacion: sim.tipo_navegacion || 'libre',
                    tiempoLimiteMinutos: sim.tiempo_limite_minutos || '',
                    tiempoPorPreguntaSegundos: sim.tiempo_por_pregunta_segundos || '',
                    numeroPreguntas: sim.numero_preguntas || 10,
                    intentosPermitidos: sim.intentos_permitidos !== undefined ? sim.intentos_permitidos : -1,
                    randomizarPreguntas: sim.randomizar_preguntas !== undefined ? sim.randomizar_preguntas : true,
                    randomizarOpciones: sim.randomizar_opciones !== undefined ? sim.randomizar_opciones : true,
                    mostrarRespuestasDespues: sim.mostrar_respuestas_despues || 1,
                    configuracionAvanzada: sim.configuracion_avanzada || {}
                })
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const loadConfigurations = async () => {
        try {
            const result = await courseManagementService.getSimulacroConfigurations()
            if (result.success) {
                setSimulacroConfigs(result.data)
            }
        } catch (error) {
            console.error('Error cargando configuraciones:', error)
        }
    }

    // ========== GESTIÓN DE TEMPLATES ==========
    const handleApplyTemplate = (templateKey) => {
        if (!simulacroConfigs?.ejemplos) return

        const template = simulacroConfigs.ejemplos[templateKey]
        if (template) {
            setSimulacroForm(prev => ({
                ...prev,
                ...template,
                titulo: prev.titulo,
                descripcion: prev.descripcion
            }))
            setSelectedTemplate(templateKey)
            setShowTemplates(false)
            setSuccess(`Template "${templateKey.replace(/_/g, ' ')}" aplicado`)
        }
    }

    // ========== GUARDAR SIMULACRO ==========
    const handleSubmitSimulacro = async (e) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const result = await courseManagementService.updateSimulacro(simulacroId, simulacroForm)

            if (result.success) {
                await loadSimulacroData()
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
            'examen_real': { name: 'Modo Examen Real', color: 'bg-red-100 text-red-800', icon: '🎯' }
        }
        return modos[modo] || { name: modo, color: 'bg-gray-100 text-gray-800', icon: '📋' }
    }

    const getTiempoLabel = (tipo) => {
        const tipos = {
            'sin_limite': 'Sin límite',
            'global': 'Tiempo global',
            'por_pregunta': 'Por pregunta'
        }
        return tipos[tipo] || tipo
    }

    const getNavegacionLabel = (tipo) => {
        const tipos = {
            'libre': 'Navegación libre',
            'secuencial': 'Navegación secuencial'
        }
        return tipos[tipo] || tipo
    }

    const calculateEstimatedTime = () => {
        if (simulacroForm.tipoTiempo === 'sin_limite') return 'Ilimitado'
        if (simulacroForm.tiempoLimiteMinutos) {
            const horas = Math.floor(simulacroForm.tiempoLimiteMinutos / 60)
            const minutos = simulacroForm.tiempoLimiteMinutos % 60
            if (horas > 0) {
                return `${horas}h ${minutos}min`
            }
            return `${minutos} minutos`
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
                        <p className="mt-4 text-medico-gray">Cargando simulacro...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (!simulacro) {
        return (
            <Layout showSidebar={true}>
                <div className="p-8">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Simulacro no encontrado</h1>
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

    const modeInfo = getModoEstudioLabel(simulacroForm.modoEstudio)

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
                            <h1 className="text-3xl font-bold text-medico-blue">Configuración Avanzada</h1>
                        </div>
                        <h2 className="text-xl text-gray-700 mb-2">{simulacro.titulo}</h2>
                        <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${modeInfo.color}`}>
                                {modeInfo.icon} {modeInfo.name}
                            </span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">{course?.titulo}</span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowTemplates(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Templates</span>
                        </button>
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{showPreview ? 'Ocultar' : 'Preview'}</span>
                        </button>
                        <button
                            onClick={() => navigate(`/admin/questions/${simulacroId}`)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Gestionar Preguntas</span>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ========== FORMULARIO PRINCIPAL ========== */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmitSimulacro} className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3">
                                Configuración del Simulacro
                            </h3>

                            {/* Información básica */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título del Simulacro
                                    </label>
                                    <input
                                        type="text"
                                        value={simulacroForm.titulo}
                                        onChange={(e) => setSimulacroForm(prev => ({ ...prev, titulo: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Preguntas
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={simulacroForm.numeroPreguntas}
                                        onChange={(e) => setSimulacroForm(prev => ({ ...prev, numeroPreguntas: parseInt(e.target.value) || 1 }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    value={simulacroForm.descripcion}
                                    onChange={(e) => setSimulacroForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    placeholder="Descripción opcional del simulacro..."
                                />
                            </div>

                            {/* Configuración de modo */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Modo de Estudio
                                    </label>
                                    <select
                                        value={simulacroForm.modoEstudio}
                                        onChange={(e) => setSimulacroForm(prev => ({ ...prev, modoEstudio: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value="estudio">📚 Modo Estudio</option>
                                        <option value="revision">🔄 Modo Revisión</option>
                                        <option value="evaluacion">📝 Modo Evaluación</option>
                                        <option value="examen_real">🎯 Examen Real</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Tiempo
                                    </label>
                                    <select
                                        value={simulacroForm.tipoTiempo}
                                        onChange={(e) => setSimulacroForm(prev => ({ ...prev, tipoTiempo: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value="sin_limite">⏰ Sin límite</option>
                                        <option value="global">🕐 Tiempo global</option>
                                        <option value="por_pregunta">⏱️ Por pregunta</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Navegación
                                    </label>
                                    <select
                                        value={simulacroForm.tipoNavegacion}
                                        onChange={(e) => setSimulacroForm(prev => ({ ...prev, tipoNavegacion: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value="libre">🔄 Navegación libre</option>
                                        <option value="secuencial">➡️ Navegación secuencial</option>
                                    </select>
                                </div>
                            </div>

                            {/* Configuración de tiempo */}
                            {simulacroForm.tipoTiempo !== 'sin_limite' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(simulacroForm.tipoTiempo === 'global' || simulacroForm.tipoTiempo === 'por_pregunta') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tiempo Límite (minutos)
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={simulacroForm.tiempoLimiteMinutos}
                                                onChange={(e) => setSimulacroForm(prev => ({ ...prev, tiempoLimiteMinutos: parseInt(e.target.value) || '' }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="Ej: 90"
                                                disabled={simulacroForm.tipoTiempo === 'por_pregunta'}
                                            />
                                        </div>
                                    )}

                                    {(simulacroForm.tipoTiempo === 'por_pregunta' || simulacroForm.tipoTiempo === 'global') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tiempo por Pregunta (segundos)
                                            </label>
                                            <input
                                                type="number"
                                                min="10"
                                                value={simulacroForm.tiempoPorPreguntaSegundos}
                                                onChange={(e) => setSimulacroForm(prev => ({ ...prev, tiempoPorPreguntaSegundos: parseInt(e.target.value) || '' }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="Ej: 120"
                                                disabled={simulacroForm.tipoTiempo === 'global'}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Configuración de intentos y comportamiento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Intentos Permitidos
                                    </label>
                                    <select
                                        value={simulacroForm.intentosPermitidos}
                                        onChange={(e) => setSimulacroForm(prev => ({ ...prev, intentosPermitidos: parseInt(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value={-1}>Ilimitados</option>
                                        <option value={1}>1 intento</option>
                                        <option value={2}>2 intentos</option>
                                        <option value={3}>3 intentos</option>
                                        <option value={5}>5 intentos</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mostrar Respuestas
                                    </label>
                                    <select
                                        value={simulacroForm.mostrarRespuestasDespues}
                                        onChange={(e) => setSimulacroForm(prev => ({ ...prev, mostrarRespuestasDespues: parseInt(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value={0}>No mostrar</option>
                                        <option value={1}>Inmediatamente</option>
                                        <option value={2}>Al finalizar</option>
                                    </select>
                                </div>
                            </div>

                            {/* Opciones de randomización */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Opciones Avanzadas</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={simulacroForm.randomizarPreguntas}
                                            onChange={(e) => setSimulacroForm(prev => ({ ...prev, randomizarPreguntas: e.target.checked }))}
                                            className="mr-2 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Randomizar orden de preguntas</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={simulacroForm.randomizarOpciones}
                                            onChange={(e) => setSimulacroForm(prev => ({ ...prev, randomizarOpciones: e.target.checked }))}
                                            className="mr-2 rounded"
                                        />
                                        <span className="text-sm text-gray-700">Randomizar orden de opciones</span>
                                    </label>
                                </div>
                            </div>

                            {/* Botón guardar */}
                            <div className="pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="w-full bg-medico-blue text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                    {formLoading && (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{formLoading ? 'Guardando...' : 'Guardar Configuración'}</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* ========== PANEL LATERAL ========== */}
                    <div className="space-y-6">
                        {/* Preview de configuración */}
                        {showPreview && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Modo:</span>
                                        <span className="font-medium">{getModoEstudioLabel(simulacroForm.modoEstudio).name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tiempo:</span>
                                        <span className="font-medium">{calculateEstimatedTime()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Navegación:</span>
                                        <span className="font-medium">{getNavegacionLabel(simulacroForm.tipoNavegacion)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Preguntas:</span>
                                        <span className="font-medium">{simulacroForm.numeroPreguntas}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Intentos:</span>
                                        <span className="font-medium">
                                            {simulacroForm.intentosPermitidos === -1 ? 'Ilimitados' : simulacroForm.intentosPermitidos}
                            </span>
                                    </div>
                                    {simulacroForm.tiempoPorPreguntaSegundos && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Por pregunta:</span>
                                            <span className="font-medium">{Math.floor(simulacroForm.tiempoPorPreguntaSegundos / 60)}:{String(simulacroForm.tiempoPorPreguntaSegundos % 60).padStart(2, '0')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Estadísticas del simulacro */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Preguntas creadas:</span>
                                    <span className="font-medium text-medico-blue">{simulacro.total_preguntas || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Meta de preguntas:</span>
                                    <span className="font-medium">{simulacro.numero_preguntas}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-medico-blue h-2 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${Math.min(((simulacro.total_preguntas || 0) / simulacro.numero_preguntas) * 100, 100)}%`
                                        }}
                                    ></div>
                                </div>
                                <div className="text-center text-sm text-gray-600">
                                    {Math.round(((simulacro.total_preguntas || 0) / simulacro.numero_preguntas) * 100)}% completado
                                </div>
                            </div>
                        </div>

                        {/* Consejos según el modo */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Consejo</h3>
                            <div className="text-sm text-blue-800">
                                {simulacroForm.modoEstudio === 'estudio' && (
                                    <p>En modo estudio, los estudiantes pueden ver respuestas inmediatamente y repetir sin límites. Ideal para aprendizaje.</p>
                                )}
                                {simulacroForm.modoEstudio === 'revision' && (
                                    <p>En modo revisión, se permite navegación libre y múltiples intentos con retroalimentación completa al final.</p>
                                )}
                                {simulacroForm.modoEstudio === 'evaluacion' && (
                                    <p>En modo evaluación, se limitan los intentos y la retroalimentación para simular condiciones de examen.</p>
                                )}
                                {simulacroForm.modoEstudio === 'examen_real' && (
                                    <p>En modo examen real, se simula exactamente las condiciones de un examen oficial con tiempo estricto y un solo intento.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== MODAL TEMPLATES ========== */}
                {showTemplates && simulacroConfigs?.ejemplos && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Templates Predefinidos</h3>
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(simulacroConfigs.ejemplos).map(([key, template]) => (
                                    <div
                                        key={key}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                            selectedTemplate === key
                                                ? 'border-medico-blue bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() => handleApplyTemplate(key)}
                                    >
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </h4>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <div>Modo: {getModoEstudioLabel(template.modoEstudio).name}</div>
                                            <div>Preguntas: {template.numeroPreguntas}</div>
                                            {template.tiempoLimiteMinutos && (
                                                <div>Tiempo: {template.tiempoLimiteMinutos} min</div>
                                            )}
                                            <div>Intentos: {template.intentosPermitidos === -1 ? 'Ilimitados' : template.intentosPermitidos}</div>
                                        </div>
                                        {selectedTemplate === key && (
                                            <div className="mt-3 flex items-center text-medico-blue text-sm">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Aplicado
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => setShowTemplates(false)}
                                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default SimulacroManager
