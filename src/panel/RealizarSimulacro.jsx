// src/panel/RealizarSimulacro.jsx - PÁGINA HIJA CONCISA
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import simulacrosService from '../services/simulacros'

const RealizarSimulacro = () => {
    const { simulacroId } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const timerRef = useRef(null)

    const [loading, setLoading] = useState(true)
    const [simulacro, setSimulacro] = useState(null)
    const [preguntas, setPreguntas] = useState([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [respuestas, setRespuestas] = useState({})
    const [tiempoRestante, setTiempoRestante] = useState(null)
    const [tiempoInicio] = useState(Date.now())
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadSimulacro()
    }, [isAuthenticated, simulacroId])

    useEffect(() => {
        if (simulacro?.tiempo_limite_minutos) {
            setTiempoRestante(simulacro.tiempo_limite_minutos * 60)
            startTimer()
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [simulacro])

    const loadSimulacro = async () => {
        try {
            const result = await simulacrosService.getSimulacroQuestions(simulacroId)
            if (result.success) {
                setSimulacro(result.data.simulacro)
                setPreguntas(result.data.preguntas)
            } else {
                alert('Error cargando simulacro')
                navigate('/simulacros')
            }
        } catch (error) {
            console.error('Error:', error)
            navigate('/simulacros')
        } finally {
            setLoading(false)
        }
    }

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTiempoRestante(prev => {
                if (prev <= 1) {
                    handleSubmit(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleAnswerSelect = (preguntaId, opcionId) => {
        setRespuestas(prev => ({
            ...prev,
            [preguntaId]: opcionId
        }))
    }

    const handleSubmit = async (tiempoAgotado = false) => {
        if (submitting) return

        try {
            setSubmitting(true)
            if (timerRef.current) clearInterval(timerRef.current)

            const tiempoEmpleado = Math.ceil((Date.now() - tiempoInicio) / (1000 * 60))
            const respuestasArray = preguntas.map(p => ({
                preguntaId: p.id,
                opcionSeleccionadaId: respuestas[p.id] || null
            })).filter(r => r.opcionSeleccionadaId)

            const result = await simulacrosService.submitSimulacro(simulacroId, {
                respuestas: respuestasArray,
                tiempoEmpleadoMinutos: tiempoEmpleado
            })

            if (result.success) {
                navigate('/simulacros', {
                    state: {
                        completed: true,
                        result: result.data,
                        message: tiempoAgotado ? 'Tiempo agotado' : 'Simulacro completado'
                    }
                })
            } else {
                alert('Error enviando simulacro')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error de conexión')
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const getAnsweredCount = () => Object.keys(respuestas).length

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!simulacro || preguntas.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="mb-4">Simulacro no disponible</p>
                    <button
                        onClick={() => navigate('/simulacros')}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Volver
                    </button>
                </div>
            </div>
        )
    }

    const currentPregunta = preguntas[currentQuestion]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 sticky top-0">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-lg font-semibold">{simulacro.titulo}</h1>
                    <div className="flex items-center space-x-4">
                        {tiempoRestante !== null && (
                            <div className={`px-3 py-1 rounded font-mono ${
                                tiempoRestante < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {formatTime(tiempoRestante)}
                            </div>
                        )}
                        <span className="text-sm text-gray-600">
                            {getAnsweredCount()}/{preguntas.length}
                        </span>
                        <button
                            onClick={() => navigate('/simulacros')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Navegación */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow sticky top-24">
                            <h3 className="font-medium mb-4">Preguntas</h3>
                            <div className="grid grid-cols-5 gap-2 mb-4">
                                {preguntas.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`w-8 h-8 rounded text-sm ${
                                            respuestas[preguntas[index].id]
                                                ? 'bg-green-500 text-white'
                                                : index === currentQuestion
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => handleSubmit()}
                                disabled={submitting || getAnsweredCount() === 0}
                                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                {submitting ? 'Enviando...' : 'Finalizar'}
                            </button>
                        </div>
                    </div>

                    {/* Pregunta */}
                    <div className="lg:col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="mb-6">
                                <h2 className="text-lg font-medium mb-4">
                                    Pregunta {currentQuestion + 1} de {preguntas.length}
                                </h2>
                                <p className="text-gray-900 mb-6">{currentPregunta.enunciado}</p>
                            </div>

                            {/* Opciones */}
                            <div className="space-y-3 mb-6">
                                {currentPregunta.opciones.map((opcion, index) => (
                                    <label
                                        key={opcion.id}
                                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer ${
                                            respuestas[currentPregunta.id] === opcion.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`pregunta-${currentPregunta.id}`}
                                            checked={respuestas[currentPregunta.id] === opcion.id}
                                            onChange={() => handleAnswerSelect(currentPregunta.id, opcion.id)}
                                            className="mt-1 mr-3"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 mr-2">
                                                {String.fromCharCode(65 + index)}.
                                            </span>
                                            {opcion.texto_opcion}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {/* Navegación */}
                            <div className="flex justify-between">
                                <button
                                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                    disabled={currentQuestion === 0}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                >
                                    ← Anterior
                                </button>
                                <span className="px-4 py-2 text-gray-500">
                                    {currentQuestion + 1} / {preguntas.length}
                                </span>
                                <button
                                    onClick={() => setCurrentQuestion(Math.min(preguntas.length - 1, currentQuestion + 1))}
                                    disabled={currentQuestion === preguntas.length - 1}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RealizarSimulacro