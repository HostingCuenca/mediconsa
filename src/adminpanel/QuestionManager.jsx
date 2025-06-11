// src/adminpanel/QuestionManager.jsx - GESTIÓN COMPLETA DE PREGUNTAS
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import courseManagementService from '../services/courseManagement'

const QuestionManager = () => {
    const { simulacroId } = useParams()
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [simulacro, setSimulacro] = useState(null)
    const [questions, setQuestions] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Estados de modales
    const [showQuestionForm, setShowQuestionForm] = useState(false)
    const [showBulkImport, setShowBulkImport] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [selectedQuestion, setSelectedQuestion] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario de pregunta
    const [questionForm, setQuestionForm] = useState({
        enunciado: '',
        tipoPregunta: 'multiple',
        explicacion: '',
        imagenUrl: '',
        opciones: [
            { textoOpcion: '', esCorrecta: false },
            { textoOpcion: '', esCorrecta: false },
            { textoOpcion: '', esCorrecta: false },
            { textoOpcion: '', esCorrecta: false }
        ]
    })

    // Estados para importación masiva
    const [bulkQuestions, setBulkQuestions] = useState('')
    const [importFormat, setImportFormat] = useState('json') // json, text

    const tiposPreguntas = [
        { value: 'multiple', label: 'Opción Múltiple (Una respuesta)' },
        { value: 'multiple_respuesta', label: 'Múltiple Respuesta (Varias respuestas)' },
        { value: 'completar', label: 'Completar texto' },
        { value: 'unir', label: 'Unir conceptos' },
        { value: 'rellenar', label: 'Rellenar espacios' }
    ]

    // ========== EFECTOS ==========
    useEffect(() => {
        if (simulacroId) {
            loadSimulacroData()
        }
    }, [simulacroId])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadSimulacroData = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await courseManagementService.getSimulacroWithQuestions(simulacroId)

            if (result.success) {
                setSimulacro(result.data.simulacro)
                setQuestions(result.data.preguntas || [])
            } else {
                setError(result.error || 'Error cargando el simulacro')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // ========== GESTIÓN DE PREGUNTAS ==========
    const handleCreateQuestion = () => {
        setSelectedQuestion(null)
        setQuestionForm({
            enunciado: '',
            tipoPregunta: 'multiple',
            explicacion: '',
            imagenUrl: '',
            opciones: [
                { textoOpcion: '', esCorrecta: false },
                { textoOpcion: '', esCorrecta: false },
                { textoOpcion: '', esCorrecta: false },
                { textoOpcion: '', esCorrecta: false }
            ]
        })
        setShowQuestionForm(true)
    }

    const handleEditQuestion = (question) => {
        setSelectedQuestion(question)
        setQuestionForm({
            enunciado: question.enunciado,
            tipoPregunta: question.tipo_pregunta,
            explicacion: question.explicacion || '',
            imagenUrl: question.imagen_url || '',
            opciones: question.opciones || [
                { textoOpcion: '', esCorrecta: false },
                { textoOpcion: '', esCorrecta: false },
                { textoOpcion: '', esCorrecta: false },
                { textoOpcion: '', esCorrecta: false }
            ]
        })
        setShowQuestionForm(true)
    }

    const handleSubmitQuestion = async (e) => {
        e.preventDefault()

        // Validar que hay al menos una respuesta correcta
        const hasCorrectAnswer = questionForm.opciones.some(op => op.esCorrecta)
        if (!hasCorrectAnswer) {
            setError('Debe marcar al menos una respuesta como correcta')
            return
        }

        // Validar que todas las opciones tienen texto
        const emptyOptions = questionForm.opciones.filter(op => !op.textoOpcion.trim())
        if (emptyOptions.length > 0) {
            setError('Todas las opciones deben tener texto')
            return
        }

        setFormLoading(true)

        try {
            const questionData = {
                ...questionForm,
                simulacroId: simulacroId
            }

            let result
            if (selectedQuestion) {
                result = await courseManagementService.updateQuestion(selectedQuestion.id, questionData)
            } else {
                result = await courseManagementService.createQuestion(questionData)
            }

            if (result.success) {
                setShowQuestionForm(false)
                setSelectedQuestion(null)
                await loadSimulacroData()
                setSuccess(result.message || (selectedQuestion ? 'Pregunta actualizada' : 'Pregunta creada'))
            } else {
                setError(result.error || 'Error procesando pregunta')
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    const handleDeleteQuestion = async (questionId) => {
        if (!window.confirm('¿Estás seguro de eliminar esta pregunta?')) return

        try {
            setFormLoading(true)
            const result = await courseManagementService.deleteQuestion(questionId)

            if (result.success) {
                await loadSimulacroData()
                setSuccess(result.message || 'Pregunta eliminada')
            } else {
                setError(result.error || 'Error eliminando pregunta')
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    // ========== IMPORTACIÓN MASIVA ==========
    const handleBulkImport = async () => {
        if (!bulkQuestions.trim()) {
            setError('Ingrese las preguntas para importar')
            return
        }

        try {
            setFormLoading(true)
            let questionsToImport = []

            if (importFormat === 'json') {
                try {
                    questionsToImport = JSON.parse(bulkQuestions)
                } catch (e) {
                    setError('JSON inválido. Verifique el formato.')
                    return
                }
            } else {
                // Formato texto simple
                questionsToImport = parseTextQuestions(bulkQuestions)
            }

            if (!Array.isArray(questionsToImport) || questionsToImport.length === 0) {
                setError('No se encontraron preguntas válidas para importar')
                return
            }

            const result = await courseManagementService.createMultipleQuestions(simulacroId, questionsToImport)

            if (result.success) {
                setShowBulkImport(false)
                setBulkQuestions('')
                await loadSimulacroData()
                setSuccess(`${questionsToImport.length} preguntas importadas exitosamente`)
            } else {
                setError(result.error || 'Error importando preguntas')
            }
        } catch (error) {
            setError('Error procesando importación')
        } finally {
            setFormLoading(false)
        }
    }

    const parseTextQuestions = (text) => {
        const lines = text.split('\n').filter(line => line.trim())
        const questions = []
        let currentQuestion = null

        lines.forEach(line => {
            const trimmed = line.trim()

            if (trimmed.startsWith('P:') || trimmed.startsWith('PREGUNTA:')) {
                if (currentQuestion) {
                    questions.push(currentQuestion)
                }
                currentQuestion = {
                    enunciado: trimmed.replace(/^(P:|PREGUNTA:)\s*/, ''),
                    tipoPregunta: 'multiple',
                    explicacion: '',
                    imagenUrl: '',
                    opciones: []
                }
            } else if (trimmed.startsWith('A)') || trimmed.startsWith('B)') || trimmed.startsWith('C)') || trimmed.startsWith('D)')) {
                const isCorrect = trimmed.includes('*') || trimmed.includes('✓')
                const optionText = trimmed.replace(/^[A-D]\)\s*/, '').replace(/[\*✓]/g, '').trim()

                if (currentQuestion) {
                    currentQuestion.opciones.push({
                        textoOpcion: optionText,
                        esCorrecta: isCorrect
                    })
                }
            } else if (trimmed.startsWith('EXPLICACIÓN:') || trimmed.startsWith('EXP:')) {
                if (currentQuestion) {
                    currentQuestion.explicacion = trimmed.replace(/^(EXPLICACIÓN:|EXP:)\s*/, '')
                }
            }
        })

        if (currentQuestion) {
            questions.push(currentQuestion)
        }

        return questions
    }

    // ========== FUNCIONES DE UTILIDAD ==========
    const handleFormChange = (field, value) => {
        setQuestionForm(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleOptionChange = (index, field, value) => {
        setQuestionForm(prev => ({
            ...prev,
            opciones: prev.opciones.map((option, i) =>
                i === index ? { ...option, [field]: value } : option
            )
        }))
    }

    const addOption = () => {
        setQuestionForm(prev => ({
            ...prev,
            opciones: [...prev.opciones, { textoOpcion: '', esCorrecta: false }]
        }))
    }

    const removeOption = (index) => {
        if (questionForm.opciones.length <= 2) {
            setError('Debe tener al menos 2 opciones')
            return
        }
        setQuestionForm(prev => ({
            ...prev,
            opciones: prev.opciones.filter((_, i) => i !== index)
        }))
    }

    const getQuestionStats = () => {
        const total = questions.length
        const byType = questions.reduce((acc, q) => {
            acc[q.tipo_pregunta] = (acc[q.tipo_pregunta] || 0) + 1
            return acc
        }, {})

        return { total, byType }
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

    const stats = getQuestionStats()

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
                            <h1 className="text-3xl font-bold text-medico-blue">Gestionar Preguntas</h1>
                        </div>
                        <h2 className="text-xl text-gray-700 mb-2">{simulacro.titulo}</h2>
                        {simulacro.descripcion && (
                            <p className="text-medico-gray">{simulacro.descripcion}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Modo: <span className="capitalize font-medium">{simulacro.modo_evaluacion}</span></span>
                            <span>•</span>
                            <span>Meta: {simulacro.numero_preguntas} preguntas</span>
                            <span>•</span>
                            <span>Creadas: {stats.total}</span>
                            <span>•</span>
                            <span className={stats.total >= simulacro.numero_preguntas ? 'text-green-600 font-medium' : 'text-orange-600'}>
                                {stats.total >= simulacro.numero_preguntas ? 'Completo' : `Faltan ${simulacro.numero_preguntas - stats.total}`}
                            </span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowBulkImport(true)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            <span>Importar</span>
                        </button>
                        <button
                            onClick={handleCreateQuestion}
                            className="bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Nueva Pregunta</span>
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

                {/* ========== ESTADÍSTICAS ========== */}
                {stats.total > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Preguntas</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-medico-blue">{stats.total}</div>
                                <div className="text-sm text-gray-500">Total</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.byType.multiple || 0}</div>
                                <div className="text-sm text-gray-500">Múltiple</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.byType.multiple_respuesta || 0}</div>
                                <div className="text-sm text-gray-500">Multi-Respuesta</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {(stats.byType.completar || 0) + (stats.byType.unir || 0) + (stats.byType.rellenar || 0)}
                                </div>
                                <div className="text-sm text-gray-500">Otras</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== LISTA DE PREGUNTAS ========== */}
                {questions.length > 0 ? (
                    <div className="space-y-4">
                        {questions.map((question, index) => (
                            <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="bg-medico-blue text-white px-2 py-1 rounded text-sm font-medium">
                                                #{index + 1}
                                            </span>
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm capitalize">
                                                {question.tipo_pregunta.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {question.enunciado}
                                        </h3>
                                        {question.explicacion && (
                                            <p className="text-gray-600 text-sm mb-3">
                                                <strong>Explicación:</strong> {question.explicacion}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEditQuestion(question)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuestion(question.id)}
                                            className="text-red-600 hover:text-red-800 text-sm"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>

                                {/* Opciones */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {question.opciones?.map((option, optionIndex) => (
                                        <div
                                            key={option.id}
                                            className={`p-3 rounded-lg border-2 ${
                                                option.es_correcta
                                                    ? 'border-green-200 bg-green-50 text-green-800'
                                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium">
                                                    {String.fromCharCode(65 + optionIndex)})
                                                </span>
                                                <span className="flex-1">{option.texto_opcion}</span>
                                                {option.es_correcta && (
                                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay preguntas</h3>
                        <p className="text-gray-500 mb-4">Comienza creando preguntas para este simulacro</p>
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={handleCreateQuestion}
                                className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Crear Primera Pregunta
                            </button>
                            <button
                                onClick={() => setShowBulkImport(true)}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Importar Preguntas
                            </button>
                        </div>
                    </div>
                )}

                {/* ========== MODAL PREGUNTA ========== */}
                {showQuestionForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {selectedQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
                                </h3>
                                <button
                                    onClick={() => setShowQuestionForm(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmitQuestion} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Enunciado de la Pregunta *
                                    </label>
                                    <textarea
                                        value={questionForm.enunciado}
                                        onChange={(e) => handleFormChange('enunciado', e.target.value)}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Escribe aquí la pregunta..."
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tipo de Pregunta
                                        </label>
                                        <select
                                            value={questionForm.tipoPregunta}
                                            onChange={(e) => handleFormChange('tipoPregunta', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        >
                                            {tiposPreguntas.map(tipo => (
                                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            URL de Imagen (opcional)
                                        </label>
                                        <input
                                            type="url"
                                            value={questionForm.imagenUrl}
                                            onChange={(e) => handleFormChange('imagenUrl', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Explicación (opcional)
                                    </label>
                                    <textarea
                                        value={questionForm.explicacion}
                                        onChange={(e) => handleFormChange('explicacion', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Explicación de por qué esta es la respuesta correcta..."
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Opciones de Respuesta *
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addOption}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                        >
                                            + Agregar Opción
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {questionForm.opciones.map((option, index) => (
                                            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                                                <span className="font-medium text-gray-600 min-w-[20px]">
                                                    {String.fromCharCode(65 + index)})
                                                </span>
                                                <input
                                                    type="text"
                                                    value={option.textoOpcion}
                                                    onChange={(e) => handleOptionChange(index, 'textoOpcion', e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                                                    required
                                                />
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={option.esCorrecta}
                                                        onChange={(e) => handleOptionChange(index, 'esCorrecta', e.target.checked)}
                                                        className="mr-1 rounded"
                                                    />
                                                    <span className="text-sm text-gray-600">Correcta</span>
                                                </label>
                                                {questionForm.opciones.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(index)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowQuestionForm(false)}
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
                                        <span>{formLoading ? 'Guardando...' : (selectedQuestion ? 'Actualizar' : 'Crear Pregunta')}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ========== MODAL IMPORTACIÓN MASIVA ========== */}
                {showBulkImport && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">Importar Preguntas Masivamente</h3>
                                <button
                                    onClick={() => setShowBulkImport(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Formato de Importación
                                    </label>
                                    <div className="flex space-x-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="text"
                                                checked={importFormat === 'text'}
                                                onChange={(e) => setImportFormat(e.target.value)}
                                                className="mr-2"
                                            />
                                            <span>Texto Simple</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                value="json"
                                                checked={importFormat === 'json'}
                                                onChange={(e) => setImportFormat(e.target.value)}
                                                className="mr-2"
                                            />
                                            <span>JSON</span>
                                        </label>
                                    </div>
                                </div>

                                {importFormat === 'text' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-900 mb-2">Formato de Texto Simple:</h4>
                                        <div className="text-sm text-blue-800 space-y-1">
                                            <p>• Usa "P:" o "PREGUNTA:" para el enunciado</p>
                                            <p>• Usa "A)", "B)", "C)", "D)" para las opciones</p>
                                            <p>• Marca la respuesta correcta con "*" o "✓"</p>
                                            <p>• Usa "EXPLICACIÓN:" o "EXP:" para la explicación (opcional)</p>
                                        </div>
                                        <div className="mt-3 bg-white border border-blue-200 rounded p-3 text-xs font-mono">
                                            <div>P: ¿Cuál es la capital de Francia?</div>
                                            <div>A) Londres</div>
                                            <div>B) París *</div>
                                            <div>C) Madrid</div>
                                            <div>D) Roma</div>
                                            <div>EXPLICACIÓN: París es la capital de Francia.</div>
                                        </div>
                                    </div>
                                )}

                                {importFormat === 'json' && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h4 className="font-medium text-green-900 mb-2">Formato JSON:</h4>
                                        <div className="bg-white border border-green-200 rounded p-3 text-xs font-mono overflow-x-auto">
                                            {`[
  {
    "enunciado": "¿Cuál es la capital de Francia?",
    "tipoPregunta": "multiple",
    "explicacion": "París es la capital de Francia",
    "imagenUrl": "",
    "opciones": [
      {"textoOpcion": "Londres", "esCorrecta": false},
      {"textoOpcion": "París", "esCorrecta": true},
      {"textoOpcion": "Madrid", "esCorrecta": false},
      {"textoOpcion": "Roma", "esCorrecta": false}
    ]
  }
]`}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contenido para Importar
                                    </label>
                                    <textarea
                                        value={bulkQuestions}
                                        onChange={(e) => setBulkQuestions(e.target.value)}
                                        rows={12}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent font-mono text-sm"
                                        placeholder={importFormat === 'json'
                                            ? 'Pega aquí el JSON con las preguntas...'
                                            : 'Pega aquí las preguntas en formato texto...'
                                        }
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowBulkImport(false)}
                                        className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleBulkImport}
                                        disabled={formLoading || !bulkQuestions.trim()}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
                                    >
                                        {formLoading && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        <span>{formLoading ? 'Importando...' : 'Importar Preguntas'}</span>
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

export default QuestionManager