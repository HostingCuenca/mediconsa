// // // // src/panel/RealizarSimulacro.jsx - PÁGINA HIJA CONCISA
// // // import React, { useState, useEffect, useRef } from 'react'
// // // import { useParams, useNavigate } from 'react-router-dom'
// // // import { useAuth } from '../utils/AuthContext'
// // // import simulacrosService from '../services/simulacros'
// // //
// // // const RealizarSimulacro = () => {
// // //     const { simulacroId } = useParams()
// // //     const navigate = useNavigate()
// // //     const { isAuthenticated } = useAuth()
// // //     const timerRef = useRef(null)
// // //
// // //     const [loading, setLoading] = useState(true)
// // //     const [simulacro, setSimulacro] = useState(null)
// // //     const [preguntas, setPreguntas] = useState([])
// // //     const [currentQuestion, setCurrentQuestion] = useState(0)
// // //     const [respuestas, setRespuestas] = useState({})
// // //     const [tiempoRestante, setTiempoRestante] = useState(null)
// // //     const [tiempoInicio] = useState(Date.now())
// // //     const [submitting, setSubmitting] = useState(false)
// // //
// // //     useEffect(() => {
// // //         if (!isAuthenticated) {
// // //             navigate('/login')
// // //             return
// // //         }
// // //         loadSimulacro()
// // //     }, [isAuthenticated, simulacroId])
// // //
// // //     useEffect(() => {
// // //         if (simulacro?.tiempo_limite_minutos) {
// // //             setTiempoRestante(simulacro.tiempo_limite_minutos * 60)
// // //             startTimer()
// // //         }
// // //         return () => {
// // //             if (timerRef.current) clearInterval(timerRef.current)
// // //         }
// // //     }, [simulacro])
// // //
// // //     const loadSimulacro = async () => {
// // //         try {
// // //             const result = await simulacrosService.getSimulacroQuestions(simulacroId)
// // //             if (result.success) {
// // //                 setSimulacro(result.data.simulacro)
// // //                 setPreguntas(result.data.preguntas)
// // //             } else {
// // //                 alert('Error cargando simulacro')
// // //                 navigate('/simulacros')
// // //             }
// // //         } catch (error) {
// // //             console.error('Error:', error)
// // //             navigate('/simulacros')
// // //         } finally {
// // //             setLoading(false)
// // //         }
// // //     }
// // //
// // //     const startTimer = () => {
// // //         timerRef.current = setInterval(() => {
// // //             setTiempoRestante(prev => {
// // //                 if (prev <= 1) {
// // //                     handleSubmit(true)
// // //                     return 0
// // //                 }
// // //                 return prev - 1
// // //             })
// // //         }, 1000)
// // //     }
// // //
// // //     const handleAnswerSelect = (preguntaId, opcionId) => {
// // //         setRespuestas(prev => ({
// // //             ...prev,
// // //             [preguntaId]: opcionId
// // //         }))
// // //     }
// // //
// // //     const handleSubmit = async (tiempoAgotado = false) => {
// // //         if (submitting) return
// // //
// // //         try {
// // //             setSubmitting(true)
// // //             if (timerRef.current) clearInterval(timerRef.current)
// // //
// // //             const tiempoEmpleado = Math.ceil((Date.now() - tiempoInicio) / (1000 * 60))
// // //             const respuestasArray = preguntas.map(p => ({
// // //                 preguntaId: p.id,
// // //                 opcionSeleccionadaId: respuestas[p.id] || null
// // //             })).filter(r => r.opcionSeleccionadaId)
// // //
// // //             const result = await simulacrosService.submitSimulacro(simulacroId, {
// // //                 respuestas: respuestasArray,
// // //                 tiempoEmpleadoMinutos: tiempoEmpleado
// // //             })
// // //
// // //             if (result.success) {
// // //                 navigate('/simulacros', {
// // //                     state: {
// // //                         completed: true,
// // //                         result: result.data,
// // //                         message: tiempoAgotado ? 'Tiempo agotado' : 'Simulacro completado'
// // //                     }
// // //                 })
// // //             } else {
// // //                 alert('Error enviando simulacro')
// // //             }
// // //         } catch (error) {
// // //             console.error('Error:', error)
// // //             alert('Error de conexión')
// // //         } finally {
// // //             setSubmitting(false)
// // //         }
// // //     }
// // //
// // //     const formatTime = (seconds) => {
// // //         const mins = Math.floor(seconds / 60)
// // //         const secs = seconds % 60
// // //         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
// // //     }
// // //
// // //     const getAnsweredCount = () => Object.keys(respuestas).length
// // //
// // //     if (loading) {
// // //         return (
// // //             <div className="min-h-screen flex items-center justify-center">
// // //                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
// // //             </div>
// // //         )
// // //     }
// // //
// // //     if (!simulacro || preguntas.length === 0) {
// // //         return (
// // //             <div className="min-h-screen flex items-center justify-center">
// // //                 <div className="text-center">
// // //                     <p className="mb-4">Simulacro no disponible</p>
// // //                     <button
// // //                         onClick={() => navigate('/simulacros')}
// // //                         className="bg-blue-600 text-white px-4 py-2 rounded"
// // //                     >
// // //                         Volver
// // //                     </button>
// // //                 </div>
// // //             </div>
// // //         )
// // //     }
// // //
// // //     const currentPregunta = preguntas[currentQuestion]
// // //
// // //     return (
// // //         <div className="min-h-screen bg-gray-50">
// // //             {/* Header */}
// // //             <div className="bg-white shadow-sm p-4 sticky top-0">
// // //                 <div className="max-w-6xl mx-auto flex justify-between items-center">
// // //                     <h1 className="text-lg font-semibold">{simulacro.titulo}</h1>
// // //                     <div className="flex items-center space-x-4">
// // //                         {tiempoRestante !== null && (
// // //                             <div className={`px-3 py-1 rounded font-mono ${
// // //                                 tiempoRestante < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
// // //                             }`}>
// // //                                 {formatTime(tiempoRestante)}
// // //                             </div>
// // //                         )}
// // //                         <span className="text-sm text-gray-600">
// // //                             {getAnsweredCount()}/{preguntas.length}
// // //                         </span>
// // //                         <button
// // //                             onClick={() => navigate('/simulacros')}
// // //                             className="text-gray-500 hover:text-gray-700"
// // //                         >
// // //                             ✕
// // //                         </button>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //
// // //             <div className="max-w-6xl mx-auto p-6">
// // //                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
// // //                     {/* Navegación */}
// // //                     <div className="lg:col-span-1">
// // //                         <div className="bg-white p-4 rounded-lg shadow sticky top-24">
// // //                             <h3 className="font-medium mb-4">Preguntas</h3>
// // //                             <div className="grid grid-cols-5 gap-2 mb-4">
// // //                                 {preguntas.map((_, index) => (
// // //                                     <button
// // //                                         key={index}
// // //                                         onClick={() => setCurrentQuestion(index)}
// // //                                         className={`w-8 h-8 rounded text-sm ${
// // //                                             respuestas[preguntas[index].id]
// // //                                                 ? 'bg-green-500 text-white'
// // //                                                 : index === currentQuestion
// // //                                                     ? 'bg-blue-500 text-white'
// // //                                                     : 'bg-gray-200'
// // //                                         }`}
// // //                                     >
// // //                                         {index + 1}
// // //                                     </button>
// // //                                 ))}
// // //                             </div>
// // //                             <button
// // //                                 onClick={() => handleSubmit()}
// // //                                 disabled={submitting || getAnsweredCount() === 0}
// // //                                 className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
// // //                             >
// // //                                 {submitting ? 'Enviando...' : 'Finalizar'}
// // //                             </button>
// // //                         </div>
// // //                     </div>
// // //
// // //                     {/* Pregunta */}
// // //                     <div className="lg:col-span-3">
// // //                         <div className="bg-white p-6 rounded-lg shadow">
// // //                             <div className="mb-6">
// // //                                 <h2 className="text-lg font-medium mb-4">
// // //                                     Pregunta {currentQuestion + 1} de {preguntas.length}
// // //                                 </h2>
// // //                                 <p className="text-gray-900 mb-6">{currentPregunta.enunciado}</p>
// // //                             </div>
// // //
// // //                             {/* Opciones */}
// // //                             <div className="space-y-3 mb-6">
// // //                                 {currentPregunta.opciones.map((opcion, index) => (
// // //                                     <label
// // //                                         key={opcion.id}
// // //                                         className={`flex items-start p-4 border-2 rounded-lg cursor-pointer ${
// // //                                             respuestas[currentPregunta.id] === opcion.id
// // //                                                 ? 'border-blue-500 bg-blue-50'
// // //                                                 : 'border-gray-200 hover:border-gray-300'
// // //                                         }`}
// // //                                     >
// // //                                         <input
// // //                                             type="radio"
// // //                                             name={`pregunta-${currentPregunta.id}`}
// // //                                             checked={respuestas[currentPregunta.id] === opcion.id}
// // //                                             onChange={() => handleAnswerSelect(currentPregunta.id, opcion.id)}
// // //                                             className="mt-1 mr-3"
// // //                                         />
// // //                                         <div>
// // //                                             <span className="text-sm font-medium text-gray-500 mr-2">
// // //                                                 {String.fromCharCode(65 + index)}.
// // //                                             </span>
// // //                                             {opcion.texto_opcion}
// // //                                         </div>
// // //                                     </label>
// // //                                 ))}
// // //                             </div>
// // //
// // //                             {/* Navegación */}
// // //                             <div className="flex justify-between">
// // //                                 <button
// // //                                     onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
// // //                                     disabled={currentQuestion === 0}
// // //                                     className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
// // //                                 >
// // //                                     ← Anterior
// // //                                 </button>
// // //                                 <span className="px-4 py-2 text-gray-500">
// // //                                     {currentQuestion + 1} / {preguntas.length}
// // //                                 </span>
// // //                                 <button
// // //                                     onClick={() => setCurrentQuestion(Math.min(preguntas.length - 1, currentQuestion + 1))}
// // //                                     disabled={currentQuestion === preguntas.length - 1}
// // //                                     className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
// // //                                 >
// // //                                     Siguiente →
// // //                                 </button>
// // //                             </div>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     )
// // // }
// // //
// // // export default RealizarSimulacro
// //
// //
// // // src/panel/RealizarSimulacro.jsx - ACTUALIZADO CON COMPATIBILIDAD
// // import React, { useState, useEffect, useRef } from 'react'
// // import { useParams, useNavigate } from 'react-router-dom'
// // import { useAuth } from '../utils/AuthContext'
// // import simulacrosService from '../services/simulacros'
// //
// // const RealizarSimulacro = () => {
// //     const { simulacroId } = useParams()
// //     const navigate = useNavigate()
// //     const { isAuthenticated } = useAuth()
// //     const timerRef = useRef(null)
// //
// //     const [loading, setLoading] = useState(true)
// //     const [simulacro, setSimulacro] = useState(null)
// //     const [preguntas, setPreguntas] = useState([])
// //     const [currentQuestion, setCurrentQuestion] = useState(0)
// //     const [respuestas, setRespuestas] = useState({})
// //     const [tiempoRestante, setTiempoRestante] = useState(null)
// //     const [tiempoInicio] = useState(Date.now())
// //     const [submitting, setSubmitting] = useState(false)
// //
// //     useEffect(() => {
// //         if (!isAuthenticated) {
// //             navigate('/login')
// //             return
// //         }
// //         loadSimulacro()
// //     }, [isAuthenticated, simulacroId])
// //
// //     useEffect(() => {
// //         if (simulacro?.tiempo_limite_minutos) {
// //             setTiempoRestante(simulacro.tiempo_limite_minutos * 60)
// //             startTimer()
// //         }
// //         return () => {
// //             if (timerRef.current) clearInterval(timerRef.current)
// //         }
// //     }, [simulacro])
// //
// //     const loadSimulacro = async () => {
// //         try {
// //             const result = await simulacrosService.getSimulacroQuestions(simulacroId)
// //             if (result.success) {
// //                 setSimulacro(result.data.simulacro)
// //                 setPreguntas(result.data.preguntas)
// //             } else {
// //                 alert('Error cargando simulacro: ' + result.error)
// //                 navigate('/simulacros')
// //             }
// //         } catch (error) {
// //             console.error('Error:', error)
// //             navigate('/simulacros')
// //         } finally {
// //             setLoading(false)
// //         }
// //     }
// //
// //     const startTimer = () => {
// //         timerRef.current = setInterval(() => {
// //             setTiempoRestante(prev => {
// //                 if (prev <= 1) {
// //                     handleSubmit(true)
// //                     return 0
// //                 }
// //                 return prev - 1
// //             })
// //         }, 1000)
// //     }
// //
// //     const handleAnswerSelect = (preguntaId, opcionId, respuestaTexto = null) => {
// //         setRespuestas(prev => ({
// //             ...prev,
// //             [preguntaId]: {
// //                 opcionSeleccionadaId: opcionId,
// //                 respuestaTexto: respuestaTexto
// //             }
// //         }))
// //     }
// //
// //     const handleSubmit = async (tiempoAgotado = false) => {
// //         if (submitting) return
// //
// //         try {
// //             setSubmitting(true)
// //             if (timerRef.current) clearInterval(timerRef.current)
// //
// //             const tiempoEmpleado = Math.ceil((Date.now() - tiempoInicio) / (1000 * 60))
// //
// //             // 🆕 ACTUALIZADO: Formato de respuestas compatible con backend
// //             const respuestasArray = preguntas.map(p => {
// //                 const respuesta = respuestas[p.id]
// //                 return {
// //                     preguntaId: p.id,
// //                     opcionSeleccionadaId: respuesta?.opcionSeleccionadaId || null,
// //                     respuestaTexto: respuesta?.respuestaTexto || null
// //                 }
// //             }).filter(r => r.opcionSeleccionadaId || r.respuestaTexto)
// //
// //             const result = await simulacrosService.submitSimulacro(simulacroId, {
// //                 respuestas: respuestasArray,
// //                 tiempoEmpleadoMinutos: tiempoEmpleado
// //             })
// //
// //             if (result.success) {
// //                 navigate('/simulacros', {
// //                     state: {
// //                         completed: true,
// //                         result: result.data,
// //                         message: tiempoAgotado ? '⏰ Tiempo agotado' : '✅ Simulacro completado'
// //                     }
// //                 })
// //             } else {
// //                 alert('Error enviando simulacro: ' + result.error)
// //             }
// //         } catch (error) {
// //             console.error('Error:', error)
// //             alert('Error de conexión')
// //         } finally {
// //             setSubmitting(false)
// //         }
// //     }
// //
// //     const formatTime = (seconds) => {
// //         const mins = Math.floor(seconds / 60)
// //         const secs = seconds % 60
// //         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
// //     }
// //
// //     const getAnsweredCount = () => Object.keys(respuestas).length
// //
// //     // 🆕 NUEVA FUNCIÓN: Verificar si puede navegar según tipo
// //     const canNavigateBack = () => {
// //         return simulacro?.tipo_navegacion !== 'secuencial'
// //     }
// //
// //     const canNavigateForward = () => {
// //         if (simulacro?.tipo_navegacion === 'secuencial') {
// //             // En modo secuencial, solo puede avanzar si respondió la pregunta actual
// //             const currentPregunta = preguntas[currentQuestion]
// //             return currentPregunta && respuestas[currentPregunta.id]
// //         }
// //         return true
// //     }
// //
// //     // 🆕 NUEVA FUNCIÓN: Obtener información del modo
// //     const getModoInfo = () => {
// //         const modo = simulacrosService.getModoUnificado(simulacro)
// //         const modoLabel = simulacrosService.getModoEvaluacionLabel(modo)
// //         const modoColor = simulacrosService.getModoEvaluacionColor(modo)
// //
// //         return { modo, modoLabel, modoColor }
// //     }
// //
// //     // 🆕 NUEVA FUNCIÓN: Renderizar pregunta según tipo
// //     const renderPreguntaSegunTipo = (pregunta) => {
// //         const tipo = pregunta.tipo_pregunta
// //
// //         // Para la mayoría de tipos, usar el renderizado estándar de opciones
// //         if (['multiple', 'true_false', 'multiple_respuesta'].includes(tipo)) {
// //             return renderOpcionesEstandar(pregunta)
// //         }
// //
// //         // Para tipos de texto
// //         if (['short_answer', 'essay'].includes(tipo)) {
// //             return renderRespuestaTexto(pregunta)
// //         }
// //
// //         // Para tipos numéricos
// //         if (tipo === 'numerical') {
// //             return renderRespuestaNumerica(pregunta)
// //         }
// //
// //         // Por defecto, usar opciones estándar
// //         return renderOpcionesEstandar(pregunta)
// //     }
// //
// //     const renderOpcionesEstandar = (pregunta) => (
// //         <div className="space-y-3">
// //             {pregunta.opciones.map((opcion, index) => (
// //                 <label
// //                     key={opcion.id}
// //                     className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
// //                         respuestas[pregunta.id]?.opcionSeleccionadaId === opcion.id
// //                             ? 'border-blue-500 bg-blue-50'
// //                             : 'border-gray-200 hover:border-gray-300'
// //                     }`}
// //                 >
// //                     <input
// //                         type="radio"
// //                         name={`pregunta-${pregunta.id}`}
// //                         checked={respuestas[pregunta.id]?.opcionSeleccionadaId === opcion.id}
// //                         onChange={() => handleAnswerSelect(pregunta.id, opcion.id)}
// //                         className="mt-1 mr-3"
// //                     />
// //                     <div>
// //                         <span className="text-sm font-medium text-gray-500 mr-2">
// //                             {String.fromCharCode(65 + index)}.
// //                         </span>
// //                         {opcion.texto_opcion}
// //                     </div>
// //                 </label>
// //             ))}
// //         </div>
// //     )
// //
// //     const renderRespuestaTexto = (pregunta) => (
// //         <div className="space-y-3">
// //             <textarea
// //                 value={respuestas[pregunta.id]?.respuestaTexto || ''}
// //                 onChange={(e) => handleAnswerSelect(pregunta.id, null, e.target.value)}
// //                 rows={pregunta.tipo_pregunta === 'essay' ? 8 : 3}
// //                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 placeholder={
// //                     pregunta.tipo_pregunta === 'essay'
// //                         ? 'Escribe tu respuesta detallada aquí...'
// //                         : 'Escribe tu respuesta aquí...'
// //                 }
// //             />
// //             <div className="text-sm text-gray-500">
// //                 {pregunta.tipo_pregunta === 'essay' ?
// //                     'Desarrolla tu respuesta de manera completa.' :
// //                     'Respuesta corta esperada.'
// //                 }
// //             </div>
// //         </div>
// //     )
// //
// //     const renderRespuestaNumerica = (pregunta) => (
// //         <div className="space-y-3">
// //             <input
// //                 type="number"
// //                 value={respuestas[pregunta.id]?.respuestaTexto || ''}
// //                 onChange={(e) => handleAnswerSelect(pregunta.id, null, e.target.value)}
// //                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 placeholder="Ingresa tu respuesta numérica"
// //             />
// //             <div className="text-sm text-gray-500">
// //                 Ingresa solo el número como respuesta.
// //             </div>
// //         </div>
// //     )
// //
// //     if (loading) {
// //         return (
// //             <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //                 <div className="text-center">
// //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
// //                     <p className="mt-4 text-gray-600">Cargando simulacro...</p>
// //                 </div>
// //             </div>
// //         )
// //     }
// //
// //     if (!simulacro || preguntas.length === 0) {
// //         return (
// //             <div className="min-h-screen flex items-center justify-center bg-gray-50">
// //                 <div className="text-center bg-white p-8 rounded-lg shadow-md">
// //                     <div className="text-6xl mb-4">⚠️</div>
// //                     <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulacro no disponible</h2>
// //                     <p className="text-gray-600 mb-6">Este simulacro no tiene preguntas configuradas o no está disponible.</p>
// //                     <button
// //                         onClick={() => navigate('/simulacros')}
// //                         className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
// //                     >
// //                         🔙 Volver a Simulacros
// //                     </button>
// //                 </div>
// //             </div>
// //         )
// //     }
// //
// //     const currentPregunta = preguntas[currentQuestion]
// //     const modoInfo = getModoInfo()
// //
// //     return (
// //         <div className="min-h-screen bg-gray-50">
// //             {/* Header */}
// //             <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
// //                 <div className="max-w-6xl mx-auto flex justify-between items-center">
// //                     <div className="flex items-center space-x-4">
// //                         <h1 className="text-lg font-semibold text-gray-900">{simulacro.titulo}</h1>
// //                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${modoInfo.modoColor}`}>
// //                             {modoInfo.modoLabel}
// //                         </span>
// //                         {simulacro.tipo_navegacion === 'secuencial' && (
// //                             <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
// //                                 ➡️ Secuencial
// //                             </span>
// //                         )}
// //                     </div>
// //                     <div className="flex items-center space-x-4">
// //                         {tiempoRestante !== null && (
// //                             <div className={`px-3 py-1 rounded font-mono text-sm ${
// //                                 tiempoRestante < 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
// //                             }`}>
// //                                 ⏰ {formatTime(tiempoRestante)}
// //                             </div>
// //                         )}
// //                         <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
// //                             📝 {getAnsweredCount()}/{preguntas.length}
// //                         </span>
// //                         <button
// //                             onClick={() => navigate('/simulacros')}
// //                             className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded"
// //                             title="Salir del simulacro"
// //                         >
// //                             ✕
// //                         </button>
// //                     </div>
// //                 </div>
// //             </div>
// //
// //             <div className="max-w-6xl mx-auto p-6">
// //                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
// //                     {/* Panel de Navegación */}
// //                     <div className="lg:col-span-1">
// //                         <div className="bg-white p-4 rounded-lg shadow sticky top-24">
// //                             <h3 className="font-medium mb-4 text-gray-900">📋 Preguntas</h3>
// //                             <div className="grid grid-cols-5 gap-2 mb-4">
// //                                 {preguntas.map((_, index) => {
// //                                     const isAnswered = respuestas[preguntas[index].id]
// //                                     const isCurrent = index === currentQuestion
// //
// //                                     return (
// //                                         <button
// //                                             key={index}
// //                                             onClick={() => canNavigateBack() || index >= currentQuestion ? setCurrentQuestion(index) : null}
// //                                             disabled={!canNavigateBack() && index < currentQuestion}
// //                                             className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
// //                                                 isAnswered
// //                                                     ? 'bg-green-500 text-white'
// //                                                     : isCurrent
// //                                                         ? 'bg-blue-500 text-white'
// //                                                         : (!canNavigateBack() && index < currentQuestion)
// //                                                             ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
// //                                                             : 'bg-gray-200 hover:bg-gray-300'
// //                                             }`}
// //                                             title={
// //                                                 isAnswered ? 'Pregunta respondida' :
// //                                                     isCurrent ? 'Pregunta actual' :
// //                                                         (!canNavigateBack() && index < currentQuestion) ? 'No se puede volver atrás' :
// //                                                             'Pregunta sin responder'
// //                                             }
// //                                         >
// //                                             {index + 1}
// //                                         </button>
// //                                     )
// //                                 })}
// //                             </div>
// //
// //                             {/* Información del progreso */}
// //                             <div className="text-sm text-gray-600 mb-4">
// //                                 <div className="flex justify-between mb-1">
// //                                     <span>Progreso:</span>
// //                                     <span>{Math.round((getAnsweredCount() / preguntas.length) * 100)}%</span>
// //                                 </div>
// //                                 <div className="w-full bg-gray-200 rounded-full h-2">
// //                                     <div
// //                                         className="bg-blue-500 h-2 rounded-full transition-all duration-300"
// //                                         style={{ width: `${(getAnsweredCount() / preguntas.length) * 100}%` }}
// //                                     ></div>
// //                                 </div>
// //                             </div>
// //
// //                             <button
// //                                 onClick={() => handleSubmit()}
// //                                 disabled={submitting || getAnsweredCount() === 0}
// //                                 className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
// //                             >
// //                                 {submitting ? '📤 Enviando...' : '✅ Finalizar Simulacro'}
// //                             </button>
// //
// //                             {getAnsweredCount() < preguntas.length && (
// //                                 <p className="text-xs text-gray-500 mt-2 text-center">
// //                                     {preguntas.length - getAnsweredCount()} preguntas sin responder
// //                                 </p>
// //                             )}
// //                         </div>
// //                     </div>
// //
// //                     {/* Pregunta Actual */}
// //                     <div className="lg:col-span-3">
// //                         <div className="bg-white p-6 rounded-lg shadow">
// //                             <div className="mb-6">
// //                                 <div className="flex items-center justify-between mb-4">
// //                                     <h2 className="text-lg font-medium text-gray-900">
// //                                         Pregunta {currentQuestion + 1} de {preguntas.length}
// //                                     </h2>
// //                                     <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
// //                                         {simulacrosService.getTipoPreguntaLabel(currentPregunta.tipo_pregunta)}
// //                                     </span>
// //                                 </div>
// //
// //                                 <div className="prose max-w-none">
// //                                     <p className="text-gray-900 text-base leading-relaxed">{currentPregunta.enunciado}</p>
// //                                 </div>
// //
// //                                 {/* Imagen si está presente */}
// //                                 {currentPregunta.imagen_url && (
// //                                     <div className="mt-4">
// //                                         <img
// //                                             src={currentPregunta.imagen_url}
// //                                             alt="Imagen de la pregunta"
// //                                             className="max-w-full h-auto rounded-lg border"
// //                                         />
// //                                     </div>
// //                                 )}
// //                             </div>
// //
// //                             {/* Opciones según tipo de pregunta */}
// //                             <div className="mb-6">
// //                                 {renderPreguntaSegunTipo(currentPregunta)}
// //                             </div>
// //
// //                             {/* Navegación entre preguntas */}
// //                             <div className="flex justify-between items-center pt-6 border-t border-gray-200">
// //                                 <button
// //                                     onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
// //                                     disabled={currentQuestion === 0 || !canNavigateBack()}
// //                                     className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //                                 >
// //                                     <span className="mr-2">←</span>
// //                                     Anterior
// //                                 </button>
// //
// //                                 <span className="px-4 py-2 text-gray-500 bg-gray-50 rounded">
// //                                     {currentQuestion + 1} / {preguntas.length}
// //                                 </span>
// //
// //                                 <button
// //                                     onClick={() => setCurrentQuestion(Math.min(preguntas.length - 1, currentQuestion + 1))}
// //                                     disabled={currentQuestion === preguntas.length - 1 || !canNavigateForward()}
// //                                     className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
// //                                 >
// //                                     Siguiente
// //                                     <span className="ml-2">→</span>
// //                                 </button>
// //                             </div>
// //
// //                             {/* Mensaje para navegación secuencial */}
// //                             {simulacro.tipo_navegacion === 'secuencial' && !respuestas[currentPregunta.id] && (
// //                                 <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
// //                                     <p className="text-sm text-orange-800">
// //                                         ⚠️ <strong>Navegación secuencial:</strong> Debes responder esta pregunta antes de continuar.
// //                                     </p>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     )
// // }
// //
// // export default RealizarSimulacro
//
// // src/panel/RealizarSimulacro.jsx - REFACTORIZADO 100% COMPATIBLE
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
//     const timerPerQuestionRef = useRef(null)
//
//     // Estados principales
//     const [loading, setLoading] = useState(true)
//     const [simulacro, setSimulacro] = useState(null)
//     const [preguntas, setPreguntas] = useState([])
//     const [currentQuestion, setCurrentQuestion] = useState(0)
//     const [respuestas, setRespuestas] = useState({})
//
//     // Estados de tiempo
//     const [tiempoRestante, setTiempoRestante] = useState(null)
//     const [tiempoPorPregunta, setTiempoPorPregunta] = useState(null)
//     const [tiempoInicio] = useState(Date.now())
//
//     // Estados de confirmación y UI
//     const [submitting, setSubmitting] = useState(false)
//     const [showConfirmModal, setShowConfirmModal] = useState(false)
//     const [confirmConfig, setConfirmConfig] = useState(null)
//     const [showWelcomeModal, setShowWelcomeModal] = useState(true)
//
//     // Estados para tipos de pregunta complejos
//     const [matchingResponses, setMatchingResponses] = useState({})
//     const [orderingItems, setOrderingItems] = useState({})
//     const [fillBlankResponses, setFillBlankResponses] = useState({})
//
//     // ==================== EFECTOS PRINCIPALES ====================
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
//         if (simulacro && !showWelcomeModal) {
//             initializeTimers()
//         }
//         return () => {
//             clearAllTimers()
//         }
//     }, [simulacro, showWelcomeModal])
//
//     // ==================== CARGA DE DATOS ====================
//
//     const loadSimulacro = async () => {
//         try {
//             const result = await simulacrosService.getSimulacroQuestions(simulacroId)
//             if (result.success) {
//                 setSimulacro(result.data.simulacro)
//                 setPreguntas(result.data.preguntas)
//             } else {
//                 alert('Error cargando simulacro: ' + result.error)
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
//     // ==================== MANEJO DE TIMERS ====================
//
//     const initializeTimers = () => {
//         clearAllTimers()
//
//         // Timer global
//         if (simulacro?.tipo_tiempo === 'global' && simulacro?.tiempo_limite_minutos) {
//             setTiempoRestante(simulacro.tiempo_limite_minutos * 60)
//             startGlobalTimer()
//         }
//
//         // Timer por pregunta
//         if (simulacro?.tipo_tiempo === 'por_pregunta' && simulacro?.tiempo_por_pregunta_segundos) {
//             setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
//             startQuestionTimer()
//         }
//     }
//
//     const startGlobalTimer = () => {
//         timerRef.current = setInterval(() => {
//             setTiempoRestante(prev => {
//                 if (prev <= 1) {
//                     handleAutoSubmit('Tiempo agotado')
//                     return 0
//                 }
//                 return prev - 1
//             })
//         }, 1000)
//     }
//
//     const startQuestionTimer = () => {
//         timerPerQuestionRef.current = setInterval(() => {
//             setTiempoPorPregunta(prev => {
//                 if (prev <= 1) {
//                     handleAutoAdvance()
//                     return simulacro.tiempo_por_pregunta_segundos
//                 }
//                 return prev - 1
//             })
//         }, 1000)
//     }
//
//     const clearAllTimers = () => {
//         if (timerRef.current) clearInterval(timerRef.current)
//         if (timerPerQuestionRef.current) clearInterval(timerPerQuestionRef.current)
//     }
//
//     const handleAutoAdvance = () => {
//         const modo = simulacrosService.getModoUnificado(simulacro)
//
//         // En examen real, auto-avanzar sin respuesta
//         if (modo === 'examen_real') {
//             if (currentQuestion < preguntas.length - 1) {
//                 setCurrentQuestion(prev => prev + 1)
//                 setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
//             } else {
//                 handleAutoSubmit('Tiempo por pregunta agotado')
//             }
//         }
//     }
//
//     const handleAutoSubmit = (reason) => {
//         handleSubmit(true, reason)
//     }
//
//     // ==================== MANEJO DE RESPUESTAS ====================
//
//     const handleAnswerSelect = (preguntaId, opcionId = null, respuestaTexto = null, respuestaCompleja = null) => {
//         setRespuestas(prev => ({
//             ...prev,
//             [preguntaId]: {
//                 opcionSeleccionadaId: opcionId,
//                 respuestaTexto: respuestaTexto,
//                 respuestaCompleja: respuestaCompleja,
//                 timestamp: Date.now()
//             }
//         }))
//
//         // En timer por pregunta, resetear timer al responder
//         if (simulacro?.tipo_tiempo === 'por_pregunta') {
//             setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
//         }
//     }
//
//     // ==================== NAVEGACIÓN ====================
//
//     const canNavigateBack = () => {
//         return simulacrosService.canNavigateBack(simulacro, currentQuestion)
//     }
//
//     const canNavigateForward = () => {
//         return simulacrosService.canNavigateForward(simulacro, currentQuestion, respuestas, preguntas)
//     }
//
//     const handlePrevious = () => {
//         if (canNavigateBack() && currentQuestion > 0) {
//             setCurrentQuestion(prev => prev - 1)
//             if (simulacro?.tipo_tiempo === 'por_pregunta') {
//                 setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
//             }
//         }
//     }
//
//     const handleNext = () => {
//         if (canNavigateForward() && currentQuestion < preguntas.length - 1) {
//             setCurrentQuestion(prev => prev + 1)
//             if (simulacro?.tipo_tiempo === 'por_pregunta') {
//                 setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
//             }
//         }
//     }
//
//     const handleQuestionJump = (questionIndex) => {
//         const canJump = simulacro?.tipo_navegacion === 'libre' ||
//             (simulacro?.tipo_navegacion === 'secuencial' && questionIndex >= currentQuestion)
//
//         if (canJump) {
//             setCurrentQuestion(questionIndex)
//             if (simulacro?.tipo_tiempo === 'por_pregunta') {
//                 setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
//             }
//         }
//     }
//
//     // ==================== FINALIZACIÓN ====================
//
//     const handleFinishAttempt = () => {
//         const confirmationConfig = simulacrosService.shouldShowFinishConfirmation(
//             simulacro, respuestas, preguntas
//         )
//
//         if (confirmationConfig.shouldShow) {
//             setConfirmConfig(confirmationConfig)
//             setShowConfirmModal(true)
//         } else {
//             handleSubmit(false)
//         }
//     }
//
//     const handleSubmit = async (isAutoSubmit = false, reason = '') => {
//         if (submitting) return
//
//         try {
//             setSubmitting(true)
//             clearAllTimers()
//
//             const tiempoEmpleado = Math.ceil((Date.now() - tiempoInicio) / (1000 * 60))
//
//             // 🆕 FORMATO COMPATIBLE CON BACKEND REFACTORIZADO
//             const respuestasArray = preguntas.map(p => {
//                 const respuesta = respuestas[p.id]
//                 if (!respuesta) return null
//
//                 return {
//                     preguntaId: p.id,
//                     opcionSeleccionadaId: respuesta.opcionSeleccionadaId || null,
//                     respuestaTexto: respuesta.respuestaTexto || null,
//                     // Para tipos complejos (matching, ordering)
//                     respuestaCompleja: respuesta.respuestaCompleja || null
//                 }
//             }).filter(r => r !== null)
//
//             const result = await simulacrosService.submitSimulacro(simulacroId, {
//                 respuestas: respuestasArray,
//                 tiempoEmpleadoMinutos: tiempoEmpleado
//             })
//
//             if (result.success) {
//                 const mensaje = isAutoSubmit ? `⏰ ${reason}` : '✅ Simulacro completado'
//                 navigate('/simulacros', {
//                     state: {
//                         completed: true,
//                         result: result.data,
//                         message: mensaje
//                     }
//                 })
//             } else {
//                 alert('Error enviando simulacro: ' + result.error)
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             alert('Error de conexión')
//         } finally {
//             setSubmitting(false)
//             setShowConfirmModal(false)
//         }
//     }
//
//     // ==================== RENDERIZADO DE PREGUNTAS POR TIPO ====================
//
//     const renderPreguntaSegunTipo = (pregunta) => {
//         const tipo = simulacrosService.mapTipoPreguntaFromBackend(pregunta.tipo_pregunta)
//
//         switch (tipo) {
//             case 'multiple_choice':
//             case 'true_false':
//                 return renderMultipleChoice(pregunta)
//
//             case 'text_free':
//                 return renderTextFree(pregunta)
//
//             case 'matching':
//                 return renderMatching(pregunta)
//
//             case 'ordering':
//                 return renderOrdering(pregunta)
//
//             case 'fill_blank':
//                 return renderFillBlank(pregunta)
//
//             default:
//                 return renderMultipleChoice(pregunta) // Fallback
//         }
//     }
//
//     const renderMultipleChoice = (pregunta) => (
//         <div className="space-y-3">
//             {pregunta.opciones?.map((opcion, index) => (
//                 <label
//                     key={opcion.id}
//                     className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
//                         respuestas[pregunta.id]?.opcionSeleccionadaId === opcion.id
//                             ? 'border-blue-500 bg-blue-50 shadow-sm'
//                             : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
//                     }`}
//                 >
//                     <input
//                         type="radio"
//                         name={`pregunta-${pregunta.id}`}
//                         checked={respuestas[pregunta.id]?.opcionSeleccionadaId === opcion.id}
//                         onChange={() => handleAnswerSelect(pregunta.id, opcion.id)}
//                         className="mt-1 mr-3 text-blue-600"
//                     />
//                     <div className="flex-1">
//                         <span className="text-sm font-medium text-gray-500 mr-3">
//                             {String.fromCharCode(65 + index)}.
//                         </span>
//                         <span className="text-gray-900">{opcion.texto_opcion}</span>
//                     </div>
//                 </label>
//             ))}
//         </div>
//     )
//
//     const renderTextFree = (pregunta) => (
//         <div className="space-y-3">
//             <textarea
//                 value={respuestas[pregunta.id]?.respuestaTexto || ''}
//                 onChange={(e) => handleAnswerSelect(pregunta.id, null, e.target.value)}
//                 rows={6}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
//                 placeholder="Escribe tu respuesta aquí..."
//             />
//             <div className="flex justify-between text-sm text-gray-500">
//                 <span>Respuesta de texto libre</span>
//                 <span>{respuestas[pregunta.id]?.respuestaTexto?.length || 0} caracteres</span>
//             </div>
//         </div>
//     )
//
//     const renderMatching = (pregunta) => {
//         const conceptos = pregunta.opciones?.filter(op => op.texto_opcion.includes('CONCEPTO:')) || []
//         const definiciones = pregunta.opciones?.filter(op => op.texto_opcion.includes('DEFINICION:')) || []
//
//         const respuestaActual = respuestas[pregunta.id]?.respuestaCompleja || {}
//
//         const handleMatchingSelect = (conceptoId, definicionId) => {
//             const nuevaRespuesta = { ...respuestaActual }
//             nuevaRespuesta[conceptoId] = definicionId
//             handleAnswerSelect(pregunta.id, null, null, nuevaRespuesta)
//         }
//
//         return (
//             <div className="space-y-4">
//                 <div className="text-sm text-gray-600 mb-4">
//                     <span className="font-medium">Instrucciones:</span> Relaciona cada concepto con su definición correspondiente.
//                 </div>
//
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {/* Conceptos */}
//                     <div>
//                         <h4 className="font-medium text-gray-900 mb-3">Conceptos</h4>
//                         <div className="space-y-2">
//                             {conceptos.map((concepto) => (
//                                 <div key={concepto.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                                     <div className="font-medium text-blue-900">
//                                         {concepto.texto_opcion.replace('CONCEPTO:', '').trim()}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//
//                     {/* Definiciones */}
//                     <div>
//                         <h4 className="font-medium text-gray-900 mb-3">Definiciones</h4>
//                         <div className="space-y-2">
//                             {definiciones.map((definicion) => (
//                                 <label
//                                     key={definicion.id}
//                                     className={`block p-3 border-2 rounded-lg cursor-pointer transition-colors ${
//                                         Object.values(respuestaActual).includes(definicion.id)
//                                             ? 'border-green-500 bg-green-50'
//                                             : 'border-gray-200 hover:border-gray-300'
//                                     }`}
//                                 >
//                                     <div className="text-gray-900">
//                                         {definicion.texto_opcion.replace('DEFINICION:', '').trim()}
//                                     </div>
//                                     <select
//                                         onChange={(e) => handleMatchingSelect(e.target.value, definicion.id)}
//                                         className="mt-2 w-full text-sm border-gray-300 rounded"
//                                         value={Object.keys(respuestaActual).find(k => respuestaActual[k] === definicion.id) || ''}
//                                     >
//                                         <option value="">Seleccionar concepto...</option>
//                                         {conceptos.map(concepto => (
//                                             <option key={concepto.id} value={concepto.id}>
//                                                 {concepto.texto_opcion.replace('CONCEPTO:', '').trim()}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </label>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         )
//     }
//
//     const renderOrdering = (pregunta) => {
//         // Obtener items del estado o inicializar
//         const currentItems = orderingItems[pregunta.id] ||
//             pregunta.opciones?.map(op => ({
//                 id: op.id,
//                 texto: op.texto_opcion,
//                 orden: op.orden
//             })).sort(() => Math.random() - 0.5) || []
//
//         // Inicializar si no existe
//         if (!orderingItems[pregunta.id] && pregunta.opciones) {
//             const items = pregunta.opciones.map(op => ({
//                 id: op.id,
//                 texto: op.texto_opcion,
//                 orden: op.orden
//             })).sort(() => Math.random() - 0.5)
//
//             setOrderingItems(prev => ({
//                 ...prev,
//                 [pregunta.id]: items
//             }))
//         }
//
//         const handleOrderChange = (fromIndex, toIndex) => {
//             const newItems = [...currentItems]
//             const [removed] = newItems.splice(fromIndex, 1)
//             newItems.splice(toIndex, 0, removed)
//
//             // Actualizar estado
//             setOrderingItems(prev => ({
//                 ...prev,
//                 [pregunta.id]: newItems
//             }))
//
//             // Guardar orden como respuesta compleja
//             const orden = newItems.map((item, index) => ({
//                 id: item.id,
//                 posicion: index + 1
//             }))
//             handleAnswerSelect(pregunta.id, null, null, orden)
//         }
//
//         return (
//             <div className="space-y-4">
//                 <div className="text-sm text-gray-600 mb-4">
//                     <span className="font-medium">Instrucciones:</span> Ordena los elementos usando los botones de subir/bajar.
//                 </div>
//
//                 <div className="space-y-2">
//                     {currentItems.map((item, index) => (
//                         <div
//                             key={item.id}
//                             className="flex items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300"
//                         >
//                             <div className="flex flex-col mr-3">
//                                 <button
//                                     onClick={() => index > 0 && handleOrderChange(index, index - 1)}
//                                     disabled={index === 0}
//                                     className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
//                                 >
//                                     ↑
//                                 </button>
//                                 <button
//                                     onClick={() => index < currentItems.length - 1 && handleOrderChange(index, index + 1)}
//                                     disabled={index === currentItems.length - 1}
//                                     className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 mt-1"
//                                 >
//                                     ↓
//                                 </button>
//                             </div>
//
//                             <div className="flex-1">
//                                 <span className="font-medium text-blue-600 mr-2">{index + 1}.</span>
//                                 <span className="text-gray-900">{item.texto}</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         )
//     }
//
//     const renderFillBlank = (pregunta) => {
//         const currentEspacios = fillBlankResponses[pregunta.id] || {}
//
//         const texto = pregunta.enunciado
//         const partes = texto.split(/(_____)/g)
//
//         const handleBlankChange = (index, value) => {
//             const nuevosEspacios = { ...currentEspacios }
//             nuevosEspacios[index] = value
//
//             // Actualizar estado
//             setFillBlankResponses(prev => ({
//                 ...prev,
//                 [pregunta.id]: nuevosEspacios
//             }))
//
//             handleAnswerSelect(pregunta.id, null, null, nuevosEspacios)
//         }
//
//         return (
//             <div className="space-y-4">
//                 <div className="text-sm text-gray-600 mb-4">
//                     <span className="font-medium">Instrucciones:</span> Completa los espacios en blanco.
//                 </div>
//
//                 <div className="text-lg leading-relaxed">
//                     {partes.map((parte, index) => (
//                         parte === '_____' ? (
//                             <input
//                                 key={index}
//                                 type="text"
//                                 value={currentEspacios[index] || ''}
//                                 onChange={(e) => handleBlankChange(index, e.target.value)}
//                                 className="inline-block mx-1 px-2 py-1 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 bg-transparent min-w-[100px]"
//                                 placeholder="..."
//                             />
//                         ) : (
//                             <span key={index}>{parte}</span>
//                         )
//                     ))}
//                 </div>
//             </div>
//         )
//     }
//
//     // ==================== UTILIDADES ====================
//
//     const formatTime = (seconds) => {
//         const mins = Math.floor(seconds / 60)
//         const secs = seconds % 60
//         return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
//     }
//
//     const getAnsweredCount = () => Object.keys(respuestas).length
//
//     const getModoInfo = () => {
//         const modo = simulacrosService.getModoUnificado(simulacro)
//         return {
//             modo,
//             label: simulacrosService.getModoEvaluacionLabel(modo),
//             color: simulacrosService.getModoEvaluacionColor(modo)
//         }
//     }
//
//     const getProgressPercentage = () => {
//         return Math.round((getAnsweredCount() / preguntas.length) * 100)
//     }
//
//     // ==================== MODALES ====================
//
//     const WelcomeModal = () => {
//         const modoInfo = getModoInfo()
//         const isExamenReal = modoInfo.modo === 'examen_real'
//
//         return (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//                     <div className="text-center mb-6">
//                         <div className="text-4xl mb-3">
//                             {isExamenReal ? '🎯' : '📚'}
//                         </div>
//                         <h2 className="text-xl font-semibold text-gray-900 mb-2">
//                             {simulacro?.titulo}
//                         </h2>
//                         <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${modoInfo.color}`}>
//                             {modoInfo.label}
//                         </span>
//                     </div>
//
//                     <div className="space-y-3 mb-6 text-sm">
//                         <div className="flex justify-between">
//                             <span className="text-gray-600">Preguntas:</span>
//                             <span className="font-medium">{preguntas.length}</span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span className="text-gray-600">Tiempo:</span>
//                             <span className="font-medium">
//                                 {simulacrosService.formatTiempoSimulacro(simulacro)}
//                             </span>
//                         </div>
//                         <div className="flex justify-between">
//                             <span className="text-gray-600">Navegación:</span>
//                             <span className="font-medium">
//                                 {simulacrosService.getTipoNavegacionLabel(simulacro?.tipo_navegacion)}
//                             </span>
//                         </div>
//                         {simulacro?.intentos_permitidos > 0 && (
//                             <div className="flex justify-between">
//                                 <span className="text-gray-600">Intentos permitidos:</span>
//                                 <span className="font-medium">{simulacro.intentos_permitidos}</span>
//                             </div>
//                         )}
//                     </div>
//
//                     {isExamenReal && (
//                         <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
//                             <div className="flex items-start">
//                                 <span className="text-red-500 mr-2">⚠️</span>
//                                 <div className="text-sm text-red-800">
//                                     <div className="font-medium mb-1">EXAMEN OFICIAL</div>
//                                     <div>Esta evaluación es definitiva. Una vez iniciada no podrás pausarla ni repetirla.</div>
//                                 </div>
//                             </div>
//                         </div>
//                     )}
//
//                     <div className="flex space-x-3">
//                         <button
//                             onClick={() => navigate('/simulacros')}
//                             className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                         >
//                             Cancelar
//                         </button>
//                         <button
//                             onClick={() => setShowWelcomeModal(false)}
//                             className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
//                                 isExamenReal
//                                     ? 'bg-red-600 hover:bg-red-700'
//                                     : 'bg-blue-600 hover:bg-blue-700'
//                             }`}
//                         >
//                             {isExamenReal ? 'Iniciar Examen' : 'Comenzar'}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         )
//     }
//
//     const ConfirmModal = () => (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//                 <div className="text-center mb-6">
//                     <div className="text-4xl mb-3">
//                         {confirmConfig?.level === 'critical' ? '🚨' : '⚠️'}
//                     </div>
//                     <h2 className="text-lg font-semibold text-gray-900 mb-2">
//                         {confirmConfig?.title}
//                     </h2>
//                 </div>
//
//                 <div className="text-sm text-gray-700 mb-6 whitespace-pre-line">
//                     {confirmConfig?.message}
//                 </div>
//
//                 <div className="flex space-x-3">
//                     <button
//                         onClick={() => setShowConfirmModal(false)}
//                         className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                     >
//                         Continuar Simulacro
//                     </button>
//                     <button
//                         onClick={() => handleSubmit(false)}
//                         className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
//                             confirmConfig?.level === 'critical'
//                                 ? 'bg-red-600 hover:bg-red-700'
//                                 : 'bg-blue-600 hover:bg-blue-700'
//                         }`}
//                     >
//                         {confirmConfig?.confirmText}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     )
//
//     // ==================== RENDERS CONDICIONALES ====================
//
//     if (loading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Cargando simulacro...</p>
//                 </div>
//             </div>
//         )
//     }
//
//     if (!simulacro || preguntas.length === 0) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center bg-white p-8 rounded-lg shadow-md">
//                     <div className="text-6xl mb-4">⚠️</div>
//                     <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulacro no disponible</h2>
//                     <p className="text-gray-600 mb-6">Este simulacro no tiene preguntas configuradas.</p>
//                     <button
//                         onClick={() => navigate('/simulacros')}
//                         className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                         🔙 Volver a Simulacros
//                     </button>
//                 </div>
//             </div>
//         )
//     }
//
//     const currentPregunta = preguntas[currentQuestion]
//     const modoInfo = getModoInfo()
//
//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* Modales */}
//             {showWelcomeModal && <WelcomeModal />}
//             {showConfirmModal && <ConfirmModal />}
//
//             {/* Header Profesional */}
//             <div className="bg-white shadow-sm border-b sticky top-0 z-10">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex justify-between items-center h-16">
//                         <div className="flex items-center space-x-4">
//                             <h1 className="text-lg font-semibold text-gray-900">{simulacro.titulo}</h1>
//                             <span className={`px-3 py-1 rounded-full text-xs font-medium border ${modoInfo.color}`}>
//                                 {modoInfo.label}
//                             </span>
//                             {simulacro.tipo_navegacion === 'secuencial' && (
//                                 <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
//                                     ➡️ Secuencial
//                                 </span>
//                             )}
//                         </div>
//
//                         <div className="flex items-center space-x-4">
//                             {/* Timer Global */}
//                             {tiempoRestante !== null && (
//                                 <div className={`px-3 py-1 rounded-lg font-mono text-sm border ${
//                                     tiempoRestante < 300
//                                         ? 'bg-red-50 text-red-800 border-red-200'
//                                         : 'bg-blue-50 text-blue-800 border-blue-200'
//                                 }`}>
//                                     ⏰ {formatTime(tiempoRestante)}
//                                 </div>
//                             )}
//
//                             {/* Timer Por Pregunta */}
//                             {tiempoPorPregunta !== null && (
//                                 <div className={`px-3 py-1 rounded-lg font-mono text-sm border ${
//                                     tiempoPorPregunta < 10
//                                         ? 'bg-red-50 text-red-800 border-red-200'
//                                         : 'bg-green-50 text-green-800 border-green-200'
//                                 }`}>
//                                     ⏱️ {formatTime(tiempoPorPregunta)}
//                                 </div>
//                             )}
//
//                             {/* Progreso */}
//                             <div className="flex items-center space-x-2">
//                                 <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded border">
//                                     📝 {getAnsweredCount()}/{preguntas.length}
//                                 </span>
//                                 <div className="w-20 bg-gray-200 rounded-full h-2">
//                                     <div
//                                         className="bg-blue-500 h-2 rounded-full transition-all duration-300"
//                                         style={{ width: `${getProgressPercentage()}%` }}
//                                     ></div>
//                                 </div>
//                             </div>
//
//                             {/* Botón Salir */}
//                             <button
//                                 onClick={() => navigate('/simulacros')}
//                                 className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                                 title="Salir del simulacro"
//                             >
//                                 ✕
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//                 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//                     {/* Panel de Navegación */}
//                     <div className="lg:col-span-1">
//                         <div className="bg-white rounded-lg shadow-sm border sticky top-24">
//                             <div className="p-4 border-b border-gray-200">
//                                 <h3 className="font-medium text-gray-900">📋 Navegación</h3>
//                             </div>
//
//                             <div className="p-4">
//                                 {/* Grid de preguntas */}
//                                 <div className="grid grid-cols-5 gap-2 mb-4">
//                                     {preguntas.map((_, index) => {
//                                         const isAnswered = respuestas[preguntas[index].id]
//                                         const isCurrent = index === currentQuestion
//                                         const canClick = simulacro?.tipo_navegacion === 'libre' ||
//                                             (simulacro?.tipo_navegacion === 'secuencial' && index <= currentQuestion)
//
//                                         return (
//                                             <button
//                                                 key={index}
//                                                 onClick={() => canClick && handleQuestionJump(index)}
//                                                 disabled={!canClick}
//                                                 className={`w-8 h-8 rounded text-xs font-medium transition-all duration-200 ${
//                                                     isAnswered
//                                                         ? 'bg-green-500 text-white shadow-sm'
//                                                         : isCurrent
//                                                             ? 'bg-blue-500 text-white shadow-sm'
//                                                             : canClick
//                                                                 ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
//                                                                 : 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                                 }`}
//                                                 title={
//                                                     isAnswered ? 'Pregunta respondida' :
//                                                         isCurrent ? 'Pregunta actual' :
//                                                             !canClick ? 'No disponible aún' :
//                                                                 'Pregunta sin responder'
//                                                 }
//                                             >
//                                                 {index + 1}
//                                             </button>
//                                         )
//                                     })}
//                                 </div>
//
//                                 {/* Información del progreso */}
//                                 <div className="space-y-3 mb-4">
//                                     <div className="flex justify-between items-center text-sm">
//                                         <span className="text-gray-600">Progreso:</span>
//                                         <span className="font-medium text-gray-900">{getProgressPercentage()}%</span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-2">
//                                         <div
//                                             className="bg-blue-500 h-2 rounded-full transition-all duration-300"
//                                             style={{ width: `${getProgressPercentage()}%` }}
//                                         ></div>
//                                     </div>
//
//                                     <div className="text-xs text-gray-500 space-y-1">
//                                         <div>✅ Respondidas: {getAnsweredCount()}</div>
//                                         <div>⏳ Pendientes: {preguntas.length - getAnsweredCount()}</div>
//                                     </div>
//                                 </div>
//
//                                 {/* Botón Finalizar */}
//                                 <button
//                                     onClick={handleFinishAttempt}
//                                     disabled={submitting || getAnsweredCount() === 0}
//                                     className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
//                                         getAnsweredCount() === preguntas.length
//                                             ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
//                                             : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
//                                     } disabled:opacity-50 disabled:cursor-not-allowed`}
//                                 >
//                                     {submitting
//                                         ? '📤 Enviando...'
//                                         : getAnsweredCount() === preguntas.length
//                                             ? '✅ Finalizar Simulacro'
//                                             : '📋 Finalizar Parcial'
//                                     }
//                                 </button>
//
//                                 {getAnsweredCount() < preguntas.length && (
//                                     <p className="text-xs text-gray-500 mt-2 text-center">
//                                         {preguntas.length - getAnsweredCount()} preguntas sin responder
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Pregunta Actual */}
//                     <div className="lg:col-span-3">
//                         <div className="bg-white rounded-lg shadow-sm border">
//                             <div className="p-6 border-b border-gray-200">
//                                 <div className="flex items-center justify-between mb-4">
//                                     <h2 className="text-lg font-medium text-gray-900">
//                                         Pregunta {currentQuestion + 1} de {preguntas.length}
//                                     </h2>
//                                     <div className="flex items-center space-x-2">
//                                         <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded border">
//                                             {simulacrosService.getTipoPreguntaLabel(currentPregunta.tipo_pregunta)}
//                                         </span>
//                                         {respuestas[currentPregunta.id] && (
//                                             <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded border border-green-200">
//                                                 ✓ Respondida
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>
//
//                                 <div className="prose max-w-none">
//                                     <div className="text-gray-900 text-base leading-relaxed">
//                                         {currentPregunta.enunciado}
//                                     </div>
//                                 </div>
//
//                                 {/* Imagen si está presente */}
//                                 {currentPregunta.imagen_url && (
//                                     <div className="mt-4">
//                                         <img
//                                             src={currentPregunta.imagen_url}
//                                             alt="Imagen de la pregunta"
//                                             className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
//                                         />
//                                     </div>
//                                 )}
//                             </div>
//
//                             {/* Contenido de la pregunta */}
//                             <div className="p-6">
//                                 {renderPreguntaSegunTipo(currentPregunta)}
//                             </div>
//
//                             {/* Navegación entre preguntas */}
//                             <div className="p-6 border-t border-gray-200">
//                                 <div className="flex justify-between items-center">
//                                     <button
//                                         onClick={handlePrevious}
//                                         disabled={currentQuestion === 0 || !canNavigateBack()}
//                                         className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                     >
//                                         <span className="mr-2">←</span>
//                                         Anterior
//                                     </button>
//
//                                     <div className="flex items-center space-x-2">
//                                         <span className="px-3 py-1 text-gray-500 bg-gray-50 rounded border text-sm">
//                                             {currentQuestion + 1} / {preguntas.length}
//                                         </span>
//                                         {tiempoPorPregunta !== null && (
//                                             <span className={`px-2 py-1 text-xs rounded border font-mono ${
//                                                 tiempoPorPregunta < 10
//                                                     ? 'bg-red-50 text-red-700 border-red-200'
//                                                     : 'bg-green-50 text-green-700 border-green-200'
//                                             }`}>
//                                                 {formatTime(tiempoPorPregunta)}
//                                             </span>
//                                         )}
//                                     </div>
//
//                                     <button
//                                         onClick={handleNext}
//                                         disabled={currentQuestion === preguntas.length - 1 || !canNavigateForward()}
//                                         className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                                     >
//                                         Siguiente
//                                         <span className="ml-2">→</span>
//                                     </button>
//                                 </div>
//
//                                 {/* Mensajes informativos */}
//                                 {simulacro.tipo_navegacion === 'secuencial' && !respuestas[currentPregunta.id] && (
//                                     <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
//                                         <div className="flex items-start">
//                                             <span className="text-orange-500 mr-2">⚠️</span>
//                                             <div className="text-sm text-orange-800">
//                                                 <span className="font-medium">Navegación secuencial:</span> Debes responder esta pregunta antes de continuar.
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//
//                                 {modoInfo.modo === 'examen_real' && (
//                                     <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                                         <div className="flex items-start">
//                                             <span className="text-red-500 mr-2">🚨</span>
//                                             <div className="text-sm text-red-800">
//                                                 <span className="font-medium">Examen oficial:</span> Las respuestas son definitivas. No podrás modificarlas una vez enviadas.
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
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
// src/panel/RealizarSimulacro.jsx - REFACTORIZADO CON QUESTIONRENDERER
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import simulacrosService from '../services/simulacros'
import QuestionRenderer from './QuestionRenderer'

const RealizarSimulacro = () => {
    const { simulacroId } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const timerRef = useRef(null)
    const timerPerQuestionRef = useRef(null)

    // Estados principales
    const [loading, setLoading] = useState(true)
    const [simulacro, setSimulacro] = useState(null)
    const [preguntas, setPreguntas] = useState([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [respuestas, setRespuestas] = useState({})

    // Estados de tiempo
    const [tiempoRestante, setTiempoRestante] = useState(null)
    const [tiempoPorPregunta, setTiempoPorPregunta] = useState(null)
    const [tiempoInicio] = useState(Date.now())

    // Estados de confirmación y UI
    const [submitting, setSubmitting] = useState(false)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [confirmConfig, setConfirmConfig] = useState(null)
    const [showWelcomeModal, setShowWelcomeModal] = useState(true)

    // ==================== EFECTOS PRINCIPALES ====================

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadSimulacro()
    }, [isAuthenticated, simulacroId])

    useEffect(() => {
        if (simulacro && !showWelcomeModal) {
            initializeTimers()
        }
        return () => {
            clearAllTimers()
        }
    }, [simulacro, showWelcomeModal])

    // ==================== CARGA DE DATOS ====================

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

    // ==================== MANEJO DE TIMERS ====================

    const initializeTimers = () => {
        clearAllTimers()

        // Timer global
        if (simulacro?.tipo_tiempo === 'global' && simulacro?.tiempo_limite_minutos) {
            setTiempoRestante(simulacro.tiempo_limite_minutos * 60)
            startGlobalTimer()
        }

        // Timer por pregunta
        if (simulacro?.tipo_tiempo === 'por_pregunta' && simulacro?.tiempo_por_pregunta_segundos) {
            setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
            startQuestionTimer()
        }
    }

    const startGlobalTimer = () => {
        timerRef.current = setInterval(() => {
            setTiempoRestante(prev => {
                if (prev <= 1) {
                    handleAutoSubmit('Tiempo global agotado')
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const startQuestionTimer = () => {
        timerPerQuestionRef.current = setInterval(() => {
            setTiempoPorPregunta(prev => {
                if (prev <= 1) {
                    handleAutoAdvance()
                    return simulacro.tiempo_por_pregunta_segundos
                }
                return prev - 1
            })
        }, 1000)
    }

    const clearAllTimers = () => {
        if (timerRef.current) clearInterval(timerRef.current)
        if (timerPerQuestionRef.current) clearInterval(timerPerQuestionRef.current)
    }

    const handleAutoAdvance = () => {
        const modoActual = getModoUnificado()

        // En examen real, auto-avanzar sin respuesta
        if (modoActual === 'examen_real' || modoActual === 'examen') {
            if (currentQuestion < preguntas.length - 1) {
                setCurrentQuestion(prev => prev + 1)
                setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
            } else {
                handleAutoSubmit('Tiempo por pregunta agotado')
            }
        }
    }

    const handleAutoSubmit = (reason) => {
        handleSubmit(true, reason)
    }

    // ==================== MANEJO DE RESPUESTAS ====================

    const handleAnswerChange = (preguntaId, respuesta) => {
        setRespuestas(prev => ({
            ...prev,
            [preguntaId]: respuesta
        }))

        // En timer por pregunta, resetear timer al responder
        if (simulacro?.tipo_tiempo === 'por_pregunta') {
            setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
        }
    }

    // ==================== NAVEGACIÓN ====================

    const canNavigateBack = () => {
        // Navegación libre siempre permite retroceder
        if (simulacro?.tipo_navegacion === 'libre') return true

        // Navegación secuencial no permite retroceder
        if (simulacro?.tipo_navegacion === 'secuencial') return false

        // Default: permitir retroceder
        return true
    }

    const canNavigateForward = () => {
        // Navegación libre siempre permite avanzar
        if (simulacro?.tipo_navegacion === 'libre') return true

        // Navegación secuencial requiere respuesta para avanzar
        if (simulacro?.tipo_navegacion === 'secuencial') {
            return isQuestionAnswered(preguntas[currentQuestion]?.id)
        }

        // Default: permitir avanzar
        return true
    }

    const handlePrevious = () => {
        if (canNavigateBack() && currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1)
            if (simulacro?.tipo_tiempo === 'por_pregunta') {
                setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
            }
        }
    }

    const handleNext = () => {
        if (canNavigateForward() && currentQuestion < preguntas.length - 1) {
            setCurrentQuestion(prev => prev + 1)
            if (simulacro?.tipo_tiempo === 'por_pregunta') {
                setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
            }
        }
    }

    const handleQuestionJump = (questionIndex) => {
        const canJump = simulacro?.tipo_navegacion === 'libre' ||
            (simulacro?.tipo_navegacion === 'secuencial' && questionIndex <= currentQuestion)

        if (canJump) {
            setCurrentQuestion(questionIndex)
            if (simulacro?.tipo_tiempo === 'por_pregunta') {
                setTiempoPorPregunta(simulacro.tiempo_por_pregunta_segundos)
            }
        }
    }

    // ==================== VALIDACIONES ====================

    const isQuestionAnswered = (preguntaId) => {
        const respuesta = respuestas[preguntaId]
        if (!respuesta) return false

        const pregunta = preguntas.find(p => p.id === preguntaId)
        if (!pregunta) return false

        switch (pregunta.tipo_pregunta) {
            case 'multiple':
            case 'true_false':
                return !!respuesta.opcionSeleccionadaId

            case 'multiple_respuesta':
                return respuesta.opcionesSeleccionadas && respuesta.opcionesSeleccionadas.length > 0

            case 'short_answer':
            case 'numerical':
            case 'essay':
                return !!respuesta.respuestaTexto && respuesta.respuestaTexto.trim().length > 0

            case 'fill_blanks':
            case 'matching':
            case 'ordering':
                return !!respuesta.respuestaCompleja && Object.keys(respuesta.respuestaCompleja).length > 0

            default:
                return false
        }
    }

    const getAnsweredCount = () => {
        return preguntas.filter(pregunta => isQuestionAnswered(pregunta.id)).length
    }

    const getProgressPercentage = () => {
        return Math.round((getAnsweredCount() / preguntas.length) * 100)
    }

    // ==================== FINALIZACIÓN ====================

    const handleFinishAttempt = () => {
        const respuestasIncompletas = preguntas.length - getAnsweredCount()
        const modoActual = getModoUnificado()

        let shouldShowConfirmation = false
        let confirmationConfig = {
            title: 'Finalizar Simulacro',
            message: '',
            level: 'normal',
            confirmText: 'Enviar Simulacro'
        }

        if (respuestasIncompletas > 0) {
            shouldShowConfirmation = true
            confirmationConfig.message = `Tienes ${respuestasIncompletas} pregunta(s) sin responder.\n\n¿Estás seguro de que deseas finalizar el simulacro?`

            if (modoActual === 'examen_real' || modoActual === 'examen') {
                confirmationConfig.level = 'critical'
                confirmationConfig.title = 'ATENCIÓN: Examen Incompleto'
                confirmationConfig.message += '\n\n⚠️ Este es un examen oficial. Las preguntas sin responder se calificarán como incorrectas.'
            }
        } else if (modoActual === 'examen_real' || modoActual === 'examen') {
            shouldShowConfirmation = true
            confirmationConfig.level = 'critical'
            confirmationConfig.title = 'Finalizar Examen'
            confirmationConfig.message = '¿Estás seguro de que deseas enviar tu examen?\n\nUna vez enviado no podrás realizar cambios.'
        }

        if (shouldShowConfirmation) {
            setConfirmConfig(confirmationConfig)
            setShowConfirmModal(true)
        } else {
            handleSubmit(false)
        }
    }

    const formatRespuestasForSubmit = () => {
        return preguntas.map(pregunta => {
            const respuesta = respuestas[pregunta.id]
            if (!respuesta) return null

            switch (pregunta.tipo_pregunta) {
                case 'multiple':
                case 'true_false':
                    return {
                        preguntaId: pregunta.id,
                        opcionSeleccionadaId: respuesta.opcionSeleccionadaId,
                        respuestaTexto: null,
                        respuestaCompleja: null
                    }

                case 'multiple_respuesta':
                    return {
                        preguntaId: pregunta.id,
                        opcionSeleccionadaId: null,
                        respuestaTexto: null,
                        respuestaCompleja: {
                            tipo: 'multiple_respuesta',
                            opcionesSeleccionadas: respuesta.opcionesSeleccionadas || []
                        }
                    }

                case 'short_answer':
                case 'numerical':
                case 'essay':
                    return {
                        preguntaId: pregunta.id,
                        opcionSeleccionadaId: null,
                        respuestaTexto: respuesta.respuestaTexto,
                        respuestaCompleja: null
                    }

                case 'fill_blanks':
                case 'matching':
                case 'ordering':
                    return {
                        preguntaId: pregunta.id,
                        opcionSeleccionadaId: null,
                        respuestaTexto: null,
                        respuestaCompleja: respuesta.respuestaCompleja
                    }

                default:
                    return {
                        preguntaId: pregunta.id,
                        opcionSeleccionadaId: respuesta.opcionSeleccionadaId || null,
                        respuestaTexto: respuesta.respuestaTexto || null,
                        respuestaCompleja: respuesta.respuestaCompleja || null
                    }
            }
        }).filter(r => r !== null)
    }

    const handleSubmit = async (isAutoSubmit = false, reason = '') => {
        if (submitting) return

        try {
            setSubmitting(true)
            clearAllTimers()

            const tiempoEmpleado = Math.ceil((Date.now() - tiempoInicio) / (1000 * 60))
            const respuestasFormateadas = formatRespuestasForSubmit()

            const result = await simulacrosService.submitSimulacro(simulacroId, {
                respuestas: respuestasFormateadas,
                tiempoEmpleadoMinutos: tiempoEmpleado
            })

            if (result.success) {
                const mensaje = isAutoSubmit ? `⏰ ${reason}` : '✅ Simulacro completado exitosamente'

                // Navegar a resultados con los datos del resultado
                navigate('/simulacros/resultado', {
                    state: {
                        completed: true,
                        resultado: result.data,
                        simulacro: simulacro,
                        message: mensaje,
                        isAutoSubmit
                    }
                })
            } else {
                alert('Error enviando simulacro: ' + result.error)
                setSubmitting(false)
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error de conexión. Por favor, intenta nuevamente.')
            setSubmitting(false)
        } finally {
            setShowConfirmModal(false)
        }
    }

    // ==================== UTILIDADES ====================

    const getModoUnificado = () => {
        // Priorizar modo_estudio sobre modo_evaluacion
        return simulacro?.modo_estudio || simulacro?.modo_evaluacion || 'practica'
    }

    const getModoInfo = () => {
        const modo = getModoUnificado()

        const modoLabels = {
            'estudio': 'Modo Estudio',
            'practica': 'Modo Práctica',
            'revision': 'Modo Revisión',
            'evaluacion': 'Modo Evaluación',
            'examen_real': 'Examen Real',
            'realista': 'Modo Realista',
            'examen': 'Modo Examen'
        }

        const modoColors = {
            'estudio': 'bg-blue-100 text-blue-700 border-blue-200',
            'practica': 'bg-green-100 text-green-700 border-green-200',
            'revision': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'evaluacion': 'bg-purple-100 text-purple-700 border-purple-200',
            'examen_real': 'bg-red-100 text-red-700 border-red-200',
            'realista': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'examen': 'bg-red-100 text-red-700 border-red-200'
        }

        return {
            modo,
            label: modoLabels[modo] || 'Modo Desconocido',
            color: modoColors[modo] || 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const formatTiempoSimulacro = () => {
        if (simulacro?.tipo_tiempo === 'sin_limite') return 'Sin límite'
        if (simulacro?.tipo_tiempo === 'por_pregunta' && simulacro?.tiempo_por_pregunta_segundos) {
            return `${simulacro.tiempo_por_pregunta_segundos}s por pregunta`
        }
        if (simulacro?.tiempo_limite_minutos) {
            const horas = Math.floor(simulacro.tiempo_limite_minutos / 60)
            const minutos = simulacro.tiempo_limite_minutos % 60
            if (horas > 0) {
                return `${horas}h ${minutos}min`
            }
            return `${minutos} min`
        }
        return 'No definido'
    }

    const getTipoNavegacionLabel = () => {
        const tipos = {
            'libre': 'Navegación libre',
            'secuencial': 'Navegación secuencial'
        }
        return tipos[simulacro?.tipo_navegacion] || 'Libre'
    }

    // ==================== MODALES ====================

    const WelcomeModal = () => {
        const modoInfo = getModoInfo()
        const isExamenReal = modoInfo.modo === 'examen_real' || modoInfo.modo === 'examen'

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="text-center mb-6">
                        <div className="text-4xl mb-3">
                            {isExamenReal ? '🎯' : '📚'}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {simulacro?.titulo}
                        </h2>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${modoInfo.color}`}>
                            {modoInfo.label}
                        </span>
                    </div>

                    <div className="space-y-3 mb-6 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Preguntas:</span>
                            <span className="font-medium">{preguntas.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tiempo:</span>
                            <span className="font-medium">{formatTiempoSimulacro()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Navegación:</span>
                            <span className="font-medium">{getTipoNavegacionLabel()}</span>
                        </div>
                        {simulacro?.intentos_permitidos > 0 && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Intentos permitidos:</span>
                                <span className="font-medium">{simulacro.intentos_permitidos}</span>
                            </div>
                        )}
                    </div>

                    {isExamenReal && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <span className="text-red-500 mr-3 text-xl">⚠️</span>
                                <div className="text-sm text-red-800">
                                    <div className="font-bold mb-2">EXAMEN OFICIAL</div>
                                    <ul className="space-y-1 text-xs">
                                        <li>• Esta evaluación es definitiva y no se puede repetir</li>
                                        <li>• Una vez iniciada no podrás pausarla</li>
                                        <li>• Las respuestas son definitivas</li>
                                        <li>• Asegúrate de tener buena conexión a internet</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {simulacro?.tipo_navegacion === 'secuencial' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start">
                                <span className="text-orange-500 mr-3">➡️</span>
                                <div className="text-sm text-orange-800">
                                    <div className="font-medium mb-1">Navegación Secuencial</div>
                                    <div className="text-xs">Debes responder cada pregunta antes de continuar a la siguiente.</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate('/simulacros')}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={() => setShowWelcomeModal(false)}
                            className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                                isExamenReal
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                        >
                            {isExamenReal ? 'Iniciar Examen' : 'Comenzar Simulacro'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const ConfirmModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <div className="text-4xl mb-3">
                        {confirmConfig?.level === 'critical' ? '🚨' : '⚠️'}
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                        {confirmConfig?.title}
                    </h2>
                </div>

                <div className="text-sm text-gray-700 mb-6 whitespace-pre-line">
                    {confirmConfig?.message}
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Continuar Simulacro
                    </button>
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting}
                        className={`flex-1 px-4 py-3 text-white rounded-lg font-medium transition-colors ${
                            confirmConfig?.level === 'critical'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-blue-600 hover:bg-blue-700'
                        } disabled:opacity-50`}
                    >
                        {submitting ? '⏳ Enviando...' : confirmConfig?.confirmText}
                    </button>
                </div>
            </div>
        </div>
    )

    // ==================== RENDERS CONDICIONALES ====================

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
                <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Simulacro no disponible</h2>
                    <p className="text-gray-600 mb-6">Este simulacro no tiene preguntas configuradas o no tienes acceso.</p>
                    <button
                        onClick={() => navigate('/simulacros')}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
            {/* Modales */}
            {showWelcomeModal && <WelcomeModal />}
            {showConfirmModal && <ConfirmModal />}

            {/* Header Sticky */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-lg font-semibold text-gray-900 truncate">
                                {simulacro.titulo}
                            </h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${modoInfo.color}`}>
                                {modoInfo.label}
                            </span>
                            {simulacro.tipo_navegacion === 'secuencial' && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                                    ➡️ Secuencial
                                </span>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            {/* Timer Global */}
                            {tiempoRestante !== null && (
                                <div className={`px-3 py-1 rounded-lg font-mono text-sm border ${
                                    tiempoRestante < 300
                                        ? 'bg-red-50 text-red-800 border-red-200'
                                        : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}>
                                    ⏰ {formatTime(tiempoRestante)}
                                </div>
                            )}

                            {/* Timer Por Pregunta */}
                            {tiempoPorPregunta !== null && (
                                <div className={`px-3 py-1 rounded-lg font-mono text-sm border ${
                                    tiempoPorPregunta < 10
                                        ? 'bg-red-50 text-red-800 border-red-200'
                                        : 'bg-green-50 text-green-800 border-green-200'
                                }`}>
                                    ⏱️ {formatTime(tiempoPorPregunta)}
                                </div>
                            )}

                            {/* Progreso */}
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded border">
                                    📝 {getAnsweredCount()}/{preguntas.length}
                                </span>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getProgressPercentage()}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Botón Salir */}
                            <button
                                onClick={() => navigate('/simulacros')}
                                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Salir del simulacro"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Panel de Navegación */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border sticky top-24">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="font-medium text-gray-900">📋 Navegación</h3>
                            </div>

                            <div className="p-4">
                                {/* Grid de preguntas */}
                                <div className="grid grid-cols-5 gap-2 mb-4">
                                    {preguntas.map((_, index) => {
                                        const isAnswered = isQuestionAnswered(preguntas[index].id)
                                        const isCurrent = index === currentQuestion
                                        const canClick = simulacro?.tipo_navegacion === 'libre' ||
                                            (simulacro?.tipo_navegacion === 'secuencial' && index <= currentQuestion)

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => canClick && handleQuestionJump(index)}
                                                disabled={!canClick}
                                                className={`w-8 h-8 rounded text-xs font-medium transition-all duration-200 ${
                                                    isAnswered
                                                        ? 'bg-green-500 text-white shadow-sm'
                                                        : isCurrent
                                                            ? 'bg-blue-500 text-white shadow-sm'
                                                            : canClick
                                                                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                title={
                                                    isAnswered ? 'Pregunta respondida' :
                                                        isCurrent ? 'Pregunta actual' :
                                                            !canClick ? 'No disponible aún' :
                                                                'Pregunta sin responder'
                                                }
                                            >
                                                {index + 1}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Información del progreso */}
                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Progreso:</span>
                                        <span className="font-medium text-gray-900">{getProgressPercentage()}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${getProgressPercentage()}%` }}
                                        ></div>
                                    </div>

                                    <div className="text-xs text-gray-500 space-y-1">
                                        <div>✅ Respondidas: {getAnsweredCount()}</div>
                                        <div>⏳ Pendientes: {preguntas.length - getAnsweredCount()}</div>
                                    </div>
                                </div>

                                {/* Botón Finalizar */}
                                <button
                                    onClick={handleFinishAttempt}
                                    disabled={submitting || getAnsweredCount() === 0}
                                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                                        getAnsweredCount() === preguntas.length
                                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                                            : getAnsweredCount() > 0
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    } disabled:opacity-50`}
                                >
                                    {submitting
                                        ? '📤 Enviando...'
                                        : getAnsweredCount() === preguntas.length
                                            ? '✅ Finalizar Simulacro'
                                            : getAnsweredCount() > 0
                                                ? '📋 Finalizar Parcial'
                                                : '🚫 Sin Respuestas'
                                    }
                                </button>

                                {getAnsweredCount() < preguntas.length && getAnsweredCount() > 0 && (
                                    <p className="text-xs text-gray-500 mt-2 text-center">
                                        {preguntas.length - getAnsweredCount()} preguntas sin responder
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pregunta Actual */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Pregunta {currentQuestion + 1} de {preguntas.length}
                                    </h2>
                                    <div className="flex items-center space-x-2">
                                        {respuestas[currentPregunta.id] && (
                                            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded border border-green-200">
                                                ✓ Respondida
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Componente QuestionRenderer */}
                            <div className="p-6">
                                <QuestionRenderer
                                    pregunta={currentPregunta}
                                    respuestaActual={respuestas[currentPregunta.id]}
                                    onRespuestaChange={(respuesta) => handleAnswerChange(currentPregunta.id, respuesta)}
                                    modoSimulacro={getModoUnificado()}
                                    mostrarExplicacion={false} // Solo mostrar en resultados
                                />
                            </div>

                            {/* Navegación entre preguntas */}
                            <div className="p-6 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={currentQuestion === 0 || !canNavigateBack()}
                                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <span className="mr-2">←</span>
                                        Anterior
                                    </button>

                                    <div className="flex items-center space-x-2">
                                        <span className="px-3 py-1 text-gray-500 bg-gray-50 rounded border text-sm">
                                            {currentQuestion + 1} / {preguntas.length}
                                        </span>
                                        {tiempoPorPregunta !== null && (
                                            <span className={`px-2 py-1 text-xs rounded border font-mono ${
                                                tiempoPorPregunta < 10
                                                    ? 'bg-red-50 text-red-700 border-red-200'
                                                    : 'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                                {formatTime(tiempoPorPregunta)}
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={currentQuestion === preguntas.length - 1 || !canNavigateForward()}
                                        className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Siguiente
                                        <span className="ml-2">→</span>
                                    </button>
                                </div>

                                {/* Mensajes informativos */}
                                {simulacro.tipo_navegacion === 'secuencial' && !isQuestionAnswered(currentPregunta.id) && (
                                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                        <div className="flex items-start">
                                            <span className="text-orange-500 mr-2">⚠️</span>
                                            <div className="text-sm text-orange-800">
                                                <span className="font-medium">Navegación secuencial:</span> Debes responder esta pregunta antes de continuar.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(modoInfo.modo === 'examen_real' || modoInfo.modo === 'examen') && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <div className="flex items-start">
                                            <span className="text-red-500 mr-2">🚨</span>
                                            <div className="text-sm text-red-800">
                                                <span className="font-medium">Examen oficial:</span> Las respuestas son definitivas. Una vez enviadas no podrás modificarlas.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {simulacro.tipo_tiempo === 'por_pregunta' && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex items-start">
                                            <span className="text-blue-500 mr-2">⏱️</span>
                                            <div className="text-sm text-blue-800">
                                                <span className="font-medium">Tiempo por pregunta:</span> Tienes {simulacro.tiempo_por_pregunta_segundos} segundos para responder cada pregunta.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RealizarSimulacro