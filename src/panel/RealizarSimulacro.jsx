// // src/panel/RealizarSimulacro.jsx - PÁGINA HIJA CONCISA
// import React, { useState, useEffect, useRef } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { useAuth } from '../utils/AuthContext'
// import simulacrosService from '../services/simulacros'
//
// const RealizarSimulacro = () => {
//     const { simulacroId } = useParams()
//     const navigate = useNavigate()
//     const { isAuthenticated } = useAuth()
//     const timerRef = useRef(null)
//
//     const [loading, setLoading] = useState(true)
//     const [simulacro, setSimulacro] = useState(null)
//     const [preguntas, setPreguntas] = useState([])
//     const [currentQuestion, setCurrentQuestion] = useState(0)
//     const [respuestas, setRespuestas] = useState({})
//     const [tiempoRestante, setTiempoRestante] = useState(null)
//     const [tiempoInicio] = useState(Date.now())
//     const [submitting, setSubmitting] = useState(false)
//
//     useEffect(() => {
//         if (!isAuthenticated) {
//             navigate('/login')
//             return
//         }
//         loadSimulacro()
//     }, [isAuthenticated, simulacroId])
//
//     useEffect(() => {
//         if (simulacro?.tiempo_limite_minutos) {
//             setTiempoRestante(simulacro.tiempo_limite_minutos * 60)
//             startTimer()
//         }
//         return () => {
//             if (timerRef.current) clearInterval(timerRef.current)
//         }
//     }, [simulacro])
//
//     const loadSimulacro = async () => {
//         try {
//             const result = await simulacrosService.getSimulacroQuestions(simulacroId)
//             if (result.success) {
//                 setSimulacro(result.data.simulacro)
//                 setPreguntas(result.data.preguntas)
//             } else {
//                 alert('Error cargando simulacro')
//                 navigate('/simulacros')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             navigate('/simulacros')
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     const startTimer = () => {
//         timerRef.current = setInterval(() => {
//             setTiempoRestante(prev => {
//                 if (prev <= 1) {
//                     handleSubmit(true)
//                     return 0
//                 }
//                 return prev - 1
//             })
//         }, 1000)
//     }
//
//     const handleAnswerSelect = (preguntaId, opcionId) => {
//         setRespuestas(prev => ({
//             ...prev,
//             [preguntaId]: opcionId
//         }))
//     }
//
//     const handleSubmit = async (tiempoAgotado = false) => {
//         if (submitting) return
//
//         try {
//             setSubmitting(true)
//             if (timerRef.current) clearInterval(timerRef.current)
//
//             const tiempoEmpleado = Math.ceil((Date.now() - tiempoInicio) / (1000 * 60))
//             const respuestasArray = preguntas.map(p => ({
//                 preguntaId: p.id,
//                 opcionSeleccionadaId: respuestas[p.id] || null
//             })).filter(r => r.opcionSeleccionadaId)
//
//             const result = await simulacrosService.submitSimulacro(simulacroId, {
//                 respuestas: respuestasArray,
//                 tiempoEmpleadoMinutos: tiempoEmpleado
//             })
//
//             if (result.success) {
//                 navigate('/simulacros', {
//                     state: {
//                         completed: true,
//                         result: result.data,
//                         message: tiempoAgotado ? 'Tiempo agotado' : 'Simulacro completado'
//                     }
//                 })
//             } else {
//                 alert('Error enviando simulacro')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             alert('Error de conexión')
//         } finally {
//             setSubmitting(false)
//         }
//     }
//
//     const formatTime = (seconds) => {
//         const mins = Math.floor(seconds / 60)
//         const secs = seconds % 60
//         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
//     }
//
//     const getAnsweredCount = () => Object.keys(respuestas).length
//
//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//         )
//     }
//
//     if (!simulacro || preguntas.length === 0) {
//         return (
//             <div className="min-h-screen flex items-center justify-center">
//                 <div className="text-center">
//                     <p className="mb-4">Simulacro no disponible</p>
//                     <button
//                         onClick={() => navigate('/simulacros')}
//                         className="bg-blue-600 text-white px-4 py-2 rounded"
//                     >
//                         Volver
//                     </button>
//                 </div>
//             </div>
//         )
//     }
//
//     const currentPregunta = preguntas[currentQuestion]
//
//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Header */}
//             <div className="bg-white shadow-sm p-4 sticky top-0">
//                 <div className="max-w-6xl mx-auto flex justify-between items-center">
//                     <h1 className="text-lg font-semibold">{simulacro.titulo}</h1>
//                     <div className="flex items-center space-x-4">
//                         {tiempoRestante !== null && (
//                             <div className={`px-3 py-1 rounded font-mono ${
//                                 tiempoRestante < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
//                             }`}>
//                                 {formatTime(tiempoRestante)}
//                             </div>
//                         )}
//                         <span className="text-sm text-gray-600">
//                             {getAnsweredCount()}/{preguntas.length}
//                         </span>
//                         <button
//                             onClick={() => navigate('/simulacros')}
//                             className="text-gray-500 hover:text-gray-700"
//                         >
//                             ✕
//                         </button>
//                     </div>
//                 </div>
//             </div>
//
//             <div className="max-w-6xl mx-auto p-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//                     {/* Navegación */}
//                     <div className="lg:col-span-1">
//                         <div className="bg-white p-4 rounded-lg shadow sticky top-24">
//                             <h3 className="font-medium mb-4">Preguntas</h3>
//                             <div className="grid grid-cols-5 gap-2 mb-4">
//                                 {preguntas.map((_, index) => (
//                                     <button
//                                         key={index}
//                                         onClick={() => setCurrentQuestion(index)}
//                                         className={`w-8 h-8 rounded text-sm ${
//                                             respuestas[preguntas[index].id]
//                                                 ? 'bg-green-500 text-white'
//                                                 : index === currentQuestion
//                                                     ? 'bg-blue-500 text-white'
//                                                     : 'bg-gray-200'
//                                         }`}
//                                     >
//                                         {index + 1}
//                                     </button>
//                                 ))}
//                             </div>
//                             <button
//                                 onClick={() => handleSubmit()}
//                                 disabled={submitting || getAnsweredCount() === 0}
//                                 className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
//                             >
//                                 {submitting ? 'Enviando...' : 'Finalizar'}
//                             </button>
//                         </div>
//                     </div>
//
//                     {/* Pregunta */}
//                     <div className="lg:col-span-3">
//                         <div className="bg-white p-6 rounded-lg shadow">
//                             <div className="mb-6">
//                                 <h2 className="text-lg font-medium mb-4">
//                                     Pregunta {currentQuestion + 1} de {preguntas.length}
//                                 </h2>
//                                 <p className="text-gray-900 mb-6">{currentPregunta.enunciado}</p>
//                             </div>
//
//                             {/* Opciones */}
//                             <div className="space-y-3 mb-6">
//                                 {currentPregunta.opciones.map((opcion, index) => (
//                                     <label
//                                         key={opcion.id}
//                                         className={`flex items-start p-4 border-2 rounded-lg cursor-pointer ${
//                                             respuestas[currentPregunta.id] === opcion.id
//                                                 ? 'border-blue-500 bg-blue-50'
//                                                 : 'border-gray-200 hover:border-gray-300'
//                                         }`}
//                                     >
//                                         <input
//                                             type="radio"
//                                             name={`pregunta-${currentPregunta.id}`}
//                                             checked={respuestas[currentPregunta.id] === opcion.id}
//                                             onChange={() => handleAnswerSelect(currentPregunta.id, opcion.id)}
//                                             className="mt-1 mr-3"
//                                         />
//                                         <div>
//                                             <span className="text-sm font-medium text-gray-500 mr-2">
//                                                 {String.fromCharCode(65 + index)}.
//                                             </span>
//                                             {opcion.texto_opcion}
//                                         </div>
//                                     </label>
//                                 ))}
//                             </div>
//
//                             {/* Navegación */}
//                             <div className="flex justify-between">
//                                 <button
//                                     onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
//                                     disabled={currentQuestion === 0}
//                                     className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
//                                 >
//                                     ← Anterior
//                                 </button>
//                                 <span className="px-4 py-2 text-gray-500">
//                                     {currentQuestion + 1} / {preguntas.length}
//                                 </span>
//                                 <button
//                                     onClick={() => setCurrentQuestion(Math.min(preguntas.length - 1, currentQuestion + 1))}
//                                     disabled={currentQuestion === preguntas.length - 1}
//                                     className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
//                                 >
//                                     Siguiente →
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }
//
// export default RealizarSimulacro


// src/panel/RealizarSimulacro.jsx - ACTUALIZADO CON COMPATIBILIDAD
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
                alert('Error cargando simulacro: ' + result.error)
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

    const handleAnswerSelect = (preguntaId, opcionId, respuestaTexto = null) => {
        setRespuestas(prev => ({
            ...prev,
            [preguntaId]: {
                opcionSeleccionadaId: opcionId,
                respuestaTexto: respuestaTexto
            }
        }))
    }

    const handleSubmit = async (tiempoAgotado = false) => {
        if (submitting) return

        try {
            setSubmitting(true)
            if (timerRef.current) clearInterval(timerRef.current)

            const tiempoEmpleado = Math.ceil((Date.now() - tiempoInicio) / (1000 * 60))

            // 🆕 ACTUALIZADO: Formato de respuestas compatible con backend
            const respuestasArray = preguntas.map(p => {
                const respuesta = respuestas[p.id]
                return {
                    preguntaId: p.id,
                    opcionSeleccionadaId: respuesta?.opcionSeleccionadaId || null,
                    respuestaTexto: respuesta?.respuestaTexto || null
                }
            }).filter(r => r.opcionSeleccionadaId || r.respuestaTexto)

            const result = await simulacrosService.submitSimulacro(simulacroId, {
                respuestas: respuestasArray,
                tiempoEmpleadoMinutos: tiempoEmpleado
            })

            if (result.success) {
                navigate('/simulacros', {
                    state: {
                        completed: true,
                        result: result.data,
                        message: tiempoAgotado ? '⏰ Tiempo agotado' : '✅ Simulacro completado'
                    }
                })
            } else {
                alert('Error enviando simulacro: ' + result.error)
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

    // 🆕 NUEVA FUNCIÓN: Verificar si puede navegar según tipo
    const canNavigateBack = () => {
        return simulacro?.tipo_navegacion !== 'secuencial'
    }

    const canNavigateForward = () => {
        if (simulacro?.tipo_navegacion === 'secuencial') {
            // En modo secuencial, solo puede avanzar si respondió la pregunta actual
            const currentPregunta = preguntas[currentQuestion]
            return currentPregunta && respuestas[currentPregunta.id]
        }
        return true
    }

    // 🆕 NUEVA FUNCIÓN: Obtener información del modo
    const getModoInfo = () => {
        const modo = simulacrosService.getModoUnificado(simulacro)
        const modoLabel = simulacrosService.getModoEvaluacionLabel(modo)
        const modoColor = simulacrosService.getModoEvaluacionColor(modo)

        return { modo, modoLabel, modoColor }
    }

    // 🆕 NUEVA FUNCIÓN: Renderizar pregunta según tipo
    const renderPreguntaSegunTipo = (pregunta) => {
        const tipo = pregunta.tipo_pregunta

        // Para la mayoría de tipos, usar el renderizado estándar de opciones
        if (['multiple', 'true_false', 'multiple_respuesta'].includes(tipo)) {
            return renderOpcionesEstandar(pregunta)
        }

        // Para tipos de texto
        if (['short_answer', 'essay'].includes(tipo)) {
            return renderRespuestaTexto(pregunta)
        }

        // Para tipos numéricos
        if (tipo === 'numerical') {
            return renderRespuestaNumerica(pregunta)
        }

        // Por defecto, usar opciones estándar
        return renderOpcionesEstandar(pregunta)
    }

    const renderOpcionesEstandar = (pregunta) => (
        <div className="space-y-3">
            {pregunta.opciones.map((opcion, index) => (
                <label
                    key={opcion.id}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        respuestas[pregunta.id]?.opcionSeleccionadaId === opcion.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                    <input
                        type="radio"
                        name={`pregunta-${pregunta.id}`}
                        checked={respuestas[pregunta.id]?.opcionSeleccionadaId === opcion.id}
                        onChange={() => handleAnswerSelect(pregunta.id, opcion.id)}
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
    )

    const renderRespuestaTexto = (pregunta) => (
        <div className="space-y-3">
            <textarea
                value={respuestas[pregunta.id]?.respuestaTexto || ''}
                onChange={(e) => handleAnswerSelect(pregunta.id, null, e.target.value)}
                rows={pregunta.tipo_pregunta === 'essay' ? 8 : 3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                    pregunta.tipo_pregunta === 'essay'
                        ? 'Escribe tu respuesta detallada aquí...'
                        : 'Escribe tu respuesta aquí...'
                }
            />
            <div className="text-sm text-gray-500">
                {pregunta.tipo_pregunta === 'essay' ?
                    'Desarrolla tu respuesta de manera completa.' :
                    'Respuesta corta esperada.'
                }
            </div>
        </div>
    )

    const renderRespuestaNumerica = (pregunta) => (
        <div className="space-y-3">
            <input
                type="number"
                value={respuestas[pregunta.id]?.respuestaTexto || ''}
                onChange={(e) => handleAnswerSelect(pregunta.id, null, e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa tu respuesta numérica"
            />
            <div className="text-sm text-gray-500">
                Ingresa solo el número como respuesta.
            </div>
        </div>
    )

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando simulacro...</p>
                </div>
            </div>
        )
    }

    if (!simulacro || preguntas.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulacro no disponible</h2>
                    <p className="text-gray-600 mb-6">Este simulacro no tiene preguntas configuradas o no está disponible.</p>
                    <button
                        onClick={() => navigate('/simulacros')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        🔙 Volver a Simulacros
                    </button>
                </div>
            </div>
        )
    }

    const currentPregunta = preguntas[currentQuestion]
    const modoInfo = getModoInfo()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-lg font-semibold text-gray-900">{simulacro.titulo}</h1>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${modoInfo.modoColor}`}>
                            {modoInfo.modoLabel}
                        </span>
                        {simulacro.tipo_navegacion === 'secuencial' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                ➡️ Secuencial
                            </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-4">
                        {tiempoRestante !== null && (
                            <div className={`px-3 py-1 rounded font-mono text-sm ${
                                tiempoRestante < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                ⏰ {formatTime(tiempoRestante)}
                            </div>
                        )}
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            📝 {getAnsweredCount()}/{preguntas.length}
                        </span>
                        <button
                            onClick={() => navigate('/simulacros')}
                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded"
                            title="Salir del simulacro"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Panel de Navegación */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow sticky top-24">
                            <h3 className="font-medium mb-4 text-gray-900">📋 Preguntas</h3>
                            <div className="grid grid-cols-5 gap-2 mb-4">
                                {preguntas.map((_, index) => {
                                    const isAnswered = respuestas[preguntas[index].id]
                                    const isCurrent = index === currentQuestion

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => canNavigateBack() || index >= currentQuestion ? setCurrentQuestion(index) : null}
                                            disabled={!canNavigateBack() && index < currentQuestion}
                                            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                                                isAnswered
                                                    ? 'bg-green-500 text-white'
                                                    : isCurrent
                                                        ? 'bg-blue-500 text-white'
                                                        : (!canNavigateBack() && index < currentQuestion)
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gray-200 hover:bg-gray-300'
                                            }`}
                                            title={
                                                isAnswered ? 'Pregunta respondida' :
                                                    isCurrent ? 'Pregunta actual' :
                                                        (!canNavigateBack() && index < currentQuestion) ? 'No se puede volver atrás' :
                                                            'Pregunta sin responder'
                                            }
                                        >
                                            {index + 1}
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Información del progreso */}
                            <div className="text-sm text-gray-600 mb-4">
                                <div className="flex justify-between mb-1">
                                    <span>Progreso:</span>
                                    <span>{Math.round((getAnsweredCount() / preguntas.length) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${(getAnsweredCount() / preguntas.length) * 100}%` }}
                                    ></div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleSubmit()}
                                disabled={submitting || getAnsweredCount() === 0}
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {submitting ? '📤 Enviando...' : '✅ Finalizar Simulacro'}
                            </button>

                            {getAnsweredCount() < preguntas.length && (
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    {preguntas.length - getAnsweredCount()} preguntas sin responder
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Pregunta Actual */}
                    <div className="lg:col-span-3">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Pregunta {currentQuestion + 1} de {preguntas.length}
                                    </h2>
                                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {simulacrosService.getTipoPreguntaLabel(currentPregunta.tipo_pregunta)}
                                    </span>
                                </div>

                                <div className="prose max-w-none">
                                    <p className="text-gray-900 text-base leading-relaxed">{currentPregunta.enunciado}</p>
                                </div>

                                {/* Imagen si está presente */}
                                {currentPregunta.imagen_url && (
                                    <div className="mt-4">
                                        <img
                                            src={currentPregunta.imagen_url}
                                            alt="Imagen de la pregunta"
                                            className="max-w-full h-auto rounded-lg border"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Opciones según tipo de pregunta */}
                            <div className="mb-6">
                                {renderPreguntaSegunTipo(currentPregunta)}
                            </div>

                            {/* Navegación entre preguntas */}
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                    disabled={currentQuestion === 0 || !canNavigateBack()}
                                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <span className="mr-2">←</span>
                                    Anterior
                                </button>

                                <span className="px-4 py-2 text-gray-500 bg-gray-50 rounded">
                                    {currentQuestion + 1} / {preguntas.length}
                                </span>

                                <button
                                    onClick={() => setCurrentQuestion(Math.min(preguntas.length - 1, currentQuestion + 1))}
                                    disabled={currentQuestion === preguntas.length - 1 || !canNavigateForward()}
                                    className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Siguiente
                                    <span className="ml-2">→</span>
                                </button>
                            </div>

                            {/* Mensaje para navegación secuencial */}
                            {simulacro.tipo_navegacion === 'secuencial' && !respuestas[currentPregunta.id] && (
                                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                    <p className="text-sm text-orange-800">
                                        ⚠️ <strong>Navegación secuencial:</strong> Debes responder esta pregunta antes de continuar.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RealizarSimulacro