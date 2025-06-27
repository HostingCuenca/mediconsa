
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
    const [questionTypes, setQuestionTypes] = useState({})
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
    const [importFormat, setImportFormat] = useState('json')
    const [activeTab, setActiveTab] = useState('individual')

    // ========== EFECTOS ==========
    useEffect(() => {
        if (simulacroId) {
            loadSimulacroData()
            loadQuestionTypes()
        }
    }, [simulacroId])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // Actualizar opciones cuando cambia el tipo de pregunta
    useEffect(() => {
        updateOptionsForQuestionType(questionForm.tipoPregunta)
    }, [questionForm.tipoPregunta])

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

    const loadQuestionTypes = async () => {
        try {
            const result = await courseManagementService.getQuestionTypes()
            if (result.success) {
                setQuestionTypes(result.data.tipos || {})
            }
        } catch (error) {
            console.error('Error cargando tipos de pregunta:', error)
        }
    }

    // ========== GESTIÓN DE TIPOS DE PREGUNTA ==========
    const updateOptionsForQuestionType = (tipo) => {
        const typeConfig = questionTypes[tipo]
        if (!typeConfig) return

        setQuestionForm(prev => {
            let newOptions = [...prev.opciones]

            // Configuraciones especiales por tipo
            switch (tipo) {
                case 'true_false':
                    newOptions = [
                        { textoOpcion: 'Verdadero', esCorrecta: false },
                        { textoOpcion: 'Falso', esCorrecta: false }
                    ]
                    break
                case 'multiple':
                    if (newOptions.length < 4) {
                        while (newOptions.length < 4) {
                            newOptions.push({ textoOpcion: '', esCorrecta: false })
                        }
                    }
                    break
                case 'short_answer':
                case 'numerical':
                    newOptions = [
                        { textoOpcion: '', esCorrecta: true }
                    ]
                    break
                case 'essay':
                    newOptions = []
                    break
                default:
                    if (newOptions.length < 2) {
                        while (newOptions.length < 2) {
                            newOptions.push({ textoOpcion: '', esCorrecta: false })
                        }
                    }
            }

            return { ...prev, opciones: newOptions }
        })
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
            opciones: question.opciones && question.opciones.length > 0
                ? question.opciones
                : [
                    { textoOpcion: '', esCorrecta: false },
                    { textoOpcion: '', esCorrecta: false },
                    { textoOpcion: '', esCorrecta: false },
                    { textoOpcion: '', esCorrecta: false }
                ]
        })
        setShowQuestionForm(true)
    }

    const validateQuestion = () => {
        const { enunciado, tipoPregunta, opciones } = questionForm
        const typeConfig = questionTypes[tipoPregunta]

        if (!enunciado.trim()) {
            return 'El enunciado es requerido'
        }

        if (!typeConfig) {
            return 'Tipo de pregunta inválido'
        }

        // Validaciones específicas por tipo
        if (typeConfig.requiresOptions && opciones.length === 0) {
            return `El tipo ${typeConfig.name} requiere opciones`
        }

        if (typeConfig.requiresOptions && typeConfig.evaluation !== 'manual') {
            const correctAnswers = opciones.filter(op => op.esCorrecta)

            if (typeConfig.maxCorrectAnswers === 1 && correctAnswers.length !== 1) {
                return `El tipo ${typeConfig.name} debe tener exactamente una respuesta correcta`
            }

            if (correctAnswers.length === 0) {
                return 'Debe marcar al menos una respuesta como correcta'
            }
        }

        // Validar opciones vacías
        const emptyOptions = opciones.filter(op => op.textoOpcion && !op.textoOpcion.trim())
        if (emptyOptions.length > 0) {
            return 'Las opciones no pueden estar vacías'
        }

        return null
    }

    const handleSubmitQuestion = async (e) => {
        e.preventDefault()

        const validationError = validateQuestion()
        if (validationError) {
            setError(validationError)
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
            } else if (trimmed.match(/^[A-D]\)/)) {
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
            } else if (trimmed.startsWith('TIPO:')) {
                if (currentQuestion) {
                    const tipo = trimmed.replace(/^TIPO:\s*/, '').toLowerCase()
                    currentQuestion.tipoPregunta = tipo
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
        const typeConfig = questionTypes[questionForm.tipoPregunta]
        const minOptions = typeConfig?.fixedOptions ? typeConfig.fixedOptions.length : 2

        if (questionForm.opciones.length <= minOptions) {
            setError(`Debe tener al menos ${minOptions} opciones`)
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
            const typeConfig = questionTypes[q.tipo_pregunta]
            const category = typeConfig?.category || 'otros'
            acc[category] = (acc[category] || 0) + 1
            return acc
        }, {})

        return { total, byType }
    }

    const getTypeIcon = (tipo) => {
        const icons = {
            'multiple': '📝',
            'true_false': '✅',
            'multiple_respuesta': '☑️',
            'short_answer': '💬',
            'essay': '📄',
            'fill_blanks': '📝',
            'numerical': '🔢',
            'matching': '🔗',
            'ordering': '📊'
        }
        return icons[tipo] || '❓'
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
                            <span>Modo: <span className="capitalize font-medium">{simulacro.modo_estudio || simulacro.modo_evaluacion}</span></span>
                            <span>•</span>
                            <span>Meta: {simulacro.numero_preguntas} preguntas</span>
                            <span>•</span>
                            <span>Creadas: {stats.total}</span>
                            <span>•</span>
                            <span className={stats.total >= simulacro.numero_preguntas ? 'text-green-600 font-medium' : 'text-orange-600'}>
                                {stats.total >= simulacro.numero_preguntas ? 'Completo ✓' : `Faltan ${simulacro.numero_preguntas - stats.total}`}
                            </span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate(`/admin/simulacro/${simulacroId}`)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>Configurar</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('bulk')}
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

                {/* ========== TABS ========== */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'individual', name: 'Preguntas', icon: '📝' },
                            { id: 'bulk', name: 'Importación Masiva', icon: '📚' },
                            { id: 'stats', name: 'Estadísticas', icon: '📊' }
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
                {activeTab === 'individual' && (
                    <div>
                        {/* Estadísticas rápidas */}
                        {stats.total > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Preguntas</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-medico-blue">{stats.total}</div>
                                        <div className="text-sm text-gray-500">Total</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{stats.byType.basicos || 0}</div>
                                        <div className="text-sm text-gray-500">Básicas</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{stats.byType.texto || 0}</div>
                                        <div className="text-sm text-gray-500">Texto</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">{(stats.byType.numericos || 0) + (stats.byType.interactivos || 0)}</div>
                                        <div className="text-sm text-gray-500">Avanzadas</div>
                                    </div>
                                </div>

                                {/* Barra de progreso */}
                                <div className="mt-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Progreso del simulacro</span>
                                        <span>{Math.round((stats.total / simulacro.numero_preguntas) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className="bg-medico-blue h-3 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min((stats.total / simulacro.numero_preguntas) * 100, 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Lista de preguntas */}
                        {questions.length > 0 ? (
                            <div className="space-y-4">
                                {questions.map((question, index) => {
                                    const typeConfig = questionTypes[question.tipo_pregunta] || { name: question.tipo_pregunta, category: 'otros' }
                                    return (
                                        <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                       <span className="bg-medico-blue text-white px-2 py-1 rounded text-sm font-medium">
                                                           #{index + 1}
                                                       </span>
                                                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                                                            typeConfig.category === 'basicos' ? 'bg-green-100 text-green-800' :
                                                                typeConfig.category === 'texto' ? 'bg-blue-100 text-blue-800' :
                                                                    typeConfig.category === 'numericos' ? 'bg-purple-100 text-purple-800' :
                                                                        typeConfig.category === 'interactivos' ? 'bg-orange-100 text-orange-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                           {getTypeIcon(question.tipo_pregunta)} {typeConfig.name}
                                                       </span>
                                                        {question.imagen_url && (
                                                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                                                               🖼️ Con imagen
                                                           </span>
                                                        )}
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
                                                        className="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        ✏️ Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteQuestion(question.id)}
                                                        className="text-red-600 hover:text-red-800 text-sm bg-red-50 px-3 py-1 rounded-md transition-colors"
                                                    >
                                                        🗑️ Eliminar
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Opciones */}
                                            {question.opciones && question.opciones.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {question.opciones.map((option, optionIndex) => (
                                                        <div
                                                            key={option.id}
                                                            className={`p-3 rounded-lg border-2 transition-all ${
                                                                option.es_correcta
                                                                    ? 'border-green-200 bg-green-50 text-green-800'
                                                                    : 'border-gray-200 bg-gray-50 text-gray-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                               <span className="font-medium text-xs bg-white px-2 py-1 rounded">
                                                                   {String.fromCharCode(65 + optionIndex)}
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
                                            )}

                                            {/* Info adicional para tipos especiales */}
                                            {question.tipo_pregunta === 'essay' && (
                                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <div className="flex items-center text-yellow-800">
                                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm">Esta pregunta requiere evaluación manual</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🤔</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay preguntas creadas</h3>
                                <p className="text-gray-500 mb-6">Comienza creando preguntas para este simulacro</p>
                                <div className="flex justify-center space-x-3">
                                    <button
                                        onClick={handleCreateQuestion}
                                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        📝 Crear Primera Pregunta
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('bulk')}
                                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        📚 Importar Preguntas
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'bulk' && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Importación Masiva de Preguntas</h3>

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
                                        <span>📝 Texto Simple</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            value="json"
                                            checked={importFormat === 'json'}
                                            onChange={(e) => setImportFormat(e.target.value)}
                                            className="mr-2"
                                        />
                                        <span>🔧 JSON</span>
                                    </label>
                                </div>
                            </div>

                            {importFormat === 'text' && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-3">📋 Formato de Texto Simple:</h4>
                                    <div className="text-sm text-blue-800 space-y-2">
                                        <p>• <code className="bg-blue-100 px-1 rounded">P:</code> o <code className="bg-blue-100 px-1 rounded">PREGUNTA:</code> para el enunciado</p>
                                        <p>• <code className="bg-blue-100 px-1 rounded">A)</code>, <code className="bg-blue-100 px-1 rounded">B)</code>, <code className="bg-blue-100 px-1 rounded">C)</code>, <code className="bg-blue-100 px-1 rounded">D)</code> para las opciones</p>
                                        <p>• <code className="bg-blue-100 px-1 rounded">*</code> o <code className="bg-blue-100 px-1 rounded">✓</code> para marcar la respuesta correcta</p>
                                        <p>• <code className="bg-blue-100 px-1 rounded">TIPO:</code> para especificar el tipo de pregunta (opcional, por defecto: multiple)</p>
                                        <p>• <code className="bg-blue-100 px-1 rounded">EXPLICACIÓN:</code> o <code className="bg-blue-100 px-1 rounded">EXP:</code> para la explicación (opcional)</p>
                                    </div>
                                    <div className="mt-4 bg-white border border-blue-200 rounded p-3">
                                        <div className="text-xs font-mono space-y-1">
                                            <div className="text-green-600">P: ¿Cuál es la capital de Francia?</div>
                                            <div>A) Londres</div>
                                            <div className="text-green-600">B) París *</div>
                                            <div>C) Madrid</div>
                                            <div>D) Roma</div>
                                            <div className="text-blue-600">EXPLICACIÓN: París es la capital de Francia desde 1792.</div>
                                            <div className="border-t border-gray-200 pt-2 mt-2"></div>
                                            <div className="text-green-600">P: La fotosíntesis produce oxígeno</div>
                                            <div className="text-purple-600">TIPO: true_false</div>
                                            <div className="text-green-600">A) Verdadero *</div>
                                            <div>B) Falso</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {importFormat === 'json' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-medium text-green-900 mb-3">🔧 Formato JSON:</h4>
                                    <div className="bg-white border border-green-200 rounded p-3 text-xs font-mono overflow-x-auto">
                                       <pre>{`[
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
 },
 {
   "enunciado": "El agua hierve a 100°C",
   "tipoPregunta": "true_false",
   "opciones": [
     {"textoOpcion": "Verdadero", "esCorrecta": true},
     {"textoOpcion": "Falso", "esCorrecta": false}
   ]
 }
]`}</pre>
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
                                    rows={15}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent font-mono text-sm"
                                    placeholder={importFormat === 'json'
                                        ? 'Pega aquí el JSON con las preguntas...'
                                        : 'Pega aquí las preguntas en formato texto...'
                                    }
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBulkQuestions('')
                                        setActiveTab('individual')
                                    }}
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
                                    <span>{formLoading ? 'Importando...' : '📚 Importar Preguntas'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'stats' && (
                    <div className="space-y-6">
                        {/* Estadísticas por tipo */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Tipos</h3>
                            {Object.keys(questionTypes).length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(questionTypes).map(([key, type]) => {
                                        const count = questions.filter(q => q.tipo_pregunta === key).length
                                        const percentage = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0

                                        return (
                                            <div key={key} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                   <span className="font-medium text-gray-900">
                                                       {getTypeIcon(key)} {type.name}
                                                   </span>
                                                    <span className="text-lg font-bold text-medico-blue">{count}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                                    <div
                                                        className="bg-medico-blue h-2 rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-600">{percentage}% del total</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    Cargando tipos de pregunta...
                                </div>
                            )}
                        </div>

                        {/* Estadísticas generales */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Generales</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-medico-blue mb-2">{stats.total}</div>
                                    <div className="text-gray-600">Total de Preguntas</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">{simulacro.numero_preguntas}</div>
                                    <div className="text-gray-600">Meta de Preguntas</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">
                                        {Math.round((stats.total / simulacro.numero_preguntas) * 100)}%
                                    </div>
                                    <div className="text-gray-600">Completado</div>
                                </div>
                            </div>
                        </div>

                        {/* Consejos */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Consejos para Preguntas</h3>
                            <div className="space-y-2 text-sm text-yellow-800">
                                <p>• <strong>Variedad:</strong> Usa diferentes tipos de preguntas para mantener el interés</p>
                                <p>• <strong>Dificultad:</strong> Mezcla preguntas fáciles, medias y difíciles</p>
                                <p>• <strong>Explicaciones:</strong> Siempre incluye explicaciones para ayudar al aprendizaje</p>
                                <p>• <strong>Calidad:</strong> Revisa la redacción y evita ambigüedades</p>
                                <p>• <strong>Imágenes:</strong> Usa imágenes cuando sea necesario para clarificar</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== MODAL PREGUNTA ========== */}
                {showQuestionForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {selectedQuestion ? '✏️ Editar Pregunta' : '➕ Nueva Pregunta'}
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
                                            Tipo de Pregunta *
                                        </label>
                                        <select
                                            value={questionForm.tipoPregunta}
                                            onChange={(e) => handleFormChange('tipoPregunta', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        >
                                            {Object.entries(questionTypes).map(([key, type]) => (
                                                <option key={key} value={key}>
                                                    {getTypeIcon(key)} {type.name} {type.category && `(${type.category})`}
                                                </option>
                                            ))}
                                        </select>
                                        {questionTypes[questionForm.tipoPregunta] && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                {questionTypes[questionForm.tipoPregunta].description}
                                            </p>
                                        )}
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

                                {/* Opciones según el tipo */}
                                {questionTypes[questionForm.tipoPregunta]?.requiresOptions && (
                                    <div>
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Opciones de Respuesta *
                                            </label>
                                            {!questionTypes[questionForm.tipoPregunta]?.fixedOptions && questionForm.tipoPregunta !== 'essay' && (
                                                <button
                                                    type="button"
                                                    onClick={addOption}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                                                >
                                                    + Agregar Opción
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            {questionForm.opciones.map((option, index) => (
                                                <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                                                   <span className="font-medium text-gray-600 min-w-[30px]">
                                                       {questionForm.tipoPregunta === 'true_false'
                                                           ? (index === 0 ? '✅' : '❌')
                                                           : String.fromCharCode(65 + index) + ')'
                                                       }
                                                   </span>
                                                    <input
                                                        type="text"
                                                        value={option.textoOpcion}
                                                        onChange={(e) => handleOptionChange(index, 'textoOpcion', e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                        placeholder={
                                                            questionForm.tipoPregunta === 'true_false'
                                                                ? (index === 0 ? 'Verdadero' : 'Falso')
                                                                : questionForm.tipoPregunta === 'numerical'
                                                                    ? ('Respuesta numérica correcta'):


                                                                    questionForm.tipoPregunta === 'short_answer'
                                                                        ? 'Respuesta aceptada'
                                                                        : `Opción ${String.fromCharCode(65 + index)}`
                                                        }
                                                        required
                                                        disabled={questionTypes[questionForm.tipoPregunta]?.fixedOptions &&
                                                            questionTypes[questionForm.tipoPregunta].fixedOptions[index]}
                                                    />
                                                    <label className="flex items-center">
                                                        <input
                                                            type={questionTypes[questionForm.tipoPregunta]?.maxCorrectAnswers === 1 ? "radio" : "checkbox"}
                                                            name={questionTypes[questionForm.tipoPregunta]?.maxCorrectAnswers === 1 ? "correcta" : undefined}
                                                            checked={option.esCorrecta}
                                                            onChange={(e) => {
                                                                if (questionTypes[questionForm.tipoPregunta]?.maxCorrectAnswers === 1) {
                                                                    // Radio: solo una respuesta correcta
                                                                    setQuestionForm(prev => ({
                                                                        ...prev,
                                                                        opciones: prev.opciones.map((op, i) => ({
                                                                            ...op,
                                                                            esCorrecta: i === index
                                                                        }))
                                                                    }))
                                                                } else {
                                                                    // Checkbox: múltiples respuestas
                                                                    handleOptionChange(index, 'esCorrecta', e.target.checked)
                                                                }
                                                            }}
                                                            className="mr-1 rounded"
                                                        />
                                                        <span className="text-sm text-gray-600">Correcta</span>
                                                    </label>
                                                    {!questionTypes[questionForm.tipoPregunta]?.fixedOptions &&
                                                        questionForm.opciones.length > 2 &&
                                                        questionForm.tipoPregunta !== 'short_answer' &&
                                                        questionForm.tipoPregunta !== 'numerical' && (
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
                                )}

                                {/* Info especial para tipos específicos */}
                                {questionForm.tipoPregunta === 'essay' && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center text-yellow-800">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm">
                                               <strong>Pregunta tipo ensayo:</strong> Requiere evaluación manual por el instructor.
                                           </span>
                                        </div>
                                    </div>
                                )}

                                {questionForm.tipoPregunta === 'numerical' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-center text-blue-800">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm">
                                               <strong>Pregunta numérica:</strong> Se evaluará con tolerancia del 1%. Ingrese solo el número correcto.
                                           </span>
                                        </div>
                                    </div>
                                )}

                                {questionForm.tipoPregunta === 'matching' && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="flex items-center text-purple-800">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm">
                                               <strong>Pregunta de emparejamiento:</strong> Funcionalidad en desarrollo. Use formato: "Concepto|Definición".
                                           </span>
                                        </div>
                                    </div>
                                )}

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
                                        <span>{formLoading ? 'Guardando...' : (selectedQuestion ? 'Actualizar Pregunta' : 'Crear Pregunta')}</span>
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

export default QuestionManager