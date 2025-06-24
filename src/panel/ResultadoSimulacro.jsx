// src/panel/ResultadoSimulacro.jsx - PÁGINA DE RESULTADOS
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'

const ResultadoSimulacro = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [showDetails, setShowDetails] = useState(false)

    // Obtener datos del estado de navegación
    const { resultado, simulacro, message, isAutoSubmit } = location.state || {}

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        // Si no hay datos, redirigir a simulacros
        if (!resultado || !simulacro) {
            navigate('/simulacros')
            return
        }

        // Auto-mostrar detalles si es modo estudio/práctica
        if (resultado.detalle && resultado.detalle.length > 0) {
            setShowDetails(true)
        }
    }, [isAuthenticated, resultado, simulacro, navigate])

    if (!resultado || !simulacro) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Resultado no encontrado</h2>
                        <p className="text-gray-600 mb-6">No se pudieron cargar los resultados del simulacro.</p>
                        <button
                            onClick={() => navigate('/simulacros')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Volver a Simulacros
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    // ==================== UTILIDADES ====================

    const getCalificacionInfo = (puntaje) => {
        if (puntaje >= 90) return {
            label: 'Excelente',
            color: 'text-green-800',
            bgColor: 'bg-green-100',
            borderColor: 'border-green-200',
            emoji: '🏆'
        }
        if (puntaje >= 80) return {
            label: 'Muy Bueno',
            color: 'text-blue-800',
            bgColor: 'bg-blue-100',
            borderColor: 'border-blue-200',
            emoji: '🥈'
        }
        if (puntaje >= 70) return {
            label: 'Bueno',
            color: 'text-yellow-800',
            bgColor: 'bg-yellow-100',
            borderColor: 'border-yellow-200',
            emoji: '🥉'
        }
        if (puntaje >= 60) return {
            label: 'Regular',
            color: 'text-orange-800',
            bgColor: 'bg-orange-100',
            borderColor: 'border-orange-200',
            emoji: '📈'
        }
        return {
            label: 'Necesita Mejorar',
            color: 'text-red-800',
            bgColor: 'bg-red-100',
            borderColor: 'border-red-200',
            emoji: '📚'
        }
    }

    const getModoInfo = () => {
        const modo = simulacro.modo_estudio || simulacro.modo_evaluacion || 'practica'

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

    const formatTiempo = (minutos) => {
        if (minutos < 60) return `${minutos} min`
        const horas = Math.floor(minutos / 60)
        const mins = minutos % 60
        return `${horas}h ${mins}min`
    }

    const getTipoPreguntaInfo = (tipo) => {
        const tipos = {
            'multiple': { nombre: 'Opción Múltiple', icono: '📝' },
            'true_false': { nombre: 'Verdadero/Falso', icono: '✓✗' },
            'multiple_respuesta': { nombre: 'Respuesta Múltiple', icono: '☑️' },
            'short_answer': { nombre: 'Respuesta Corta', icono: '✏️' },
            'numerical': { nombre: 'Numérica', icono: '🔢' },
            'essay': { nombre: 'Ensayo', icono: '📄' },
            'fill_blanks': { nombre: 'Completar Espacios', icono: '📝' },
            'matching': { nombre: 'Emparejamiento', icono: '🔗' },
            'ordering': { nombre: 'Ordenamiento', icono: '📊' }
        }
        return tipos[tipo] || { nombre: tipo, icono: '❓' }
    }

    // ==================== DATOS CALCULADOS ====================

    const calificacionInfo = getCalificacionInfo(resultado.puntaje)
    const modoInfo = getModoInfo()
    const porcentajeAprobacion = resultado.puntaje >= 70
    const tieneDetalle = resultado.detalle && resultado.detalle.length > 0

    return (
        <Layout showSidebar={true}>
            <div className="p-6 max-w-6xl mx-auto">

                {/* Header con mensaje de estado */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg border ${
                        isAutoSubmit
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-green-50 border-green-200'
                    }`}>
                        <div className="flex items-center">
                            <span className={`mr-3 text-lg ${isAutoSubmit ? 'text-orange-600' : 'text-green-600'}`}>
                                {isAutoSubmit ? '⏰' : '✅'}
                            </span>
                            <span className={`font-medium ${isAutoSubmit ? 'text-orange-800' : 'text-green-800'}`}>
                                {message}
                            </span>
                        </div>
                    </div>
                )}

                {/* Encabezado Principal */}
                <div className="bg-white rounded-lg shadow-md border p-6 mb-6">
                    <div className="text-center">
                        <div className="text-6xl mb-4">{calificacionInfo.emoji}</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{simulacro.titulo}</h1>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${modoInfo.color} mb-4`}>
                            {modoInfo.label}
                        </span>

                        {/* Puntaje Principal */}
                        <div className={`inline-block px-6 py-3 rounded-lg border-2 ${calificacionInfo.bgColor} ${calificacionInfo.borderColor} mb-4`}>
                            <div className="text-4xl font-bold mb-1" style={{ color: calificacionInfo.color.replace('text-', '') }}>
                                {resultado.puntaje}%
                            </div>
                            <div className={`text-sm font-medium ${calificacionInfo.color}`}>
                                {calificacionInfo.label}
                            </div>
                        </div>

                        {/* Estado de Aprobación */}
                        <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                            porcentajeAprobacion
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                            {porcentajeAprobacion ? '✅ APROBADO' : '❌ REPROBADO'}
                        </div>
                    </div>
                </div>

                {/* Estadísticas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                        <div className="text-2xl font-bold text-blue-600">{resultado.respuestasCorrectas}</div>
                        <div className="text-sm text-gray-600">Respuestas Correctas</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                        <div className="text-2xl font-bold text-gray-900">{resultado.totalPreguntas}</div>
                        <div className="text-sm text-gray-600">Total Preguntas</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                        <div className="text-2xl font-bold text-purple-600">{formatTiempo(resultado.tiempoEmpleado)}</div>
                        <div className="text-sm text-gray-600">Tiempo Empleado</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {Math.round((resultado.respuestasCorrectas / resultado.totalPreguntas) * 100)}%
                        </div>
                        <div className="text-sm text-gray-600">Precisión</div>
                    </div>
                </div>

                {/* Barra de Progreso Visual */}
                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Análisis de Respuestas</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Respuestas Correctas</span>
                            <span className="font-medium text-green-600">{resultado.respuestasCorrectas} de {resultado.totalPreguntas}</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-4">
                            <div className="relative">
                                <div
                                    className="bg-green-500 h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${(resultado.respuestasCorrectas / resultado.totalPreguntas) * 100}%` }}
                                ></div>
                                <div
                                    className="absolute top-0 bg-red-500 h-4 rounded-r-full"
                                    style={{
                                        left: `${(resultado.respuestasCorrectas / resultado.totalPreguntas) * 100}%`,
                                        width: `${((resultado.totalPreguntas - resultado.respuestasCorrectas) / resultado.totalPreguntas) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-gray-500">
                            <span>✅ Correctas: {resultado.respuestasCorrectas}</span>
                            <span>❌ Incorrectas: {resultado.totalPreguntas - resultado.respuestasCorrectas}</span>
                        </div>
                    </div>
                </div>

                {/* Resumen (para modos que no muestran detalle) */}
                {resultado.resumen && !tieneDetalle && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div className="flex items-center">
                            <span className="text-blue-600 mr-3 text-xl">📋</span>
                            <div>
                                <h3 className="font-medium text-blue-900">Resumen del Intento</h3>
                                <p className="text-blue-800 mt-1">{resultado.resumen}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detalle de Respuestas (solo si está disponible) */}
                {tieneDetalle && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">📝 Detalle de Respuestas</h3>
                                <button
                                    onClick={() => setShowDetails(!showDetails)}
                                    className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <span className="mr-2">{showDetails ? '👁️' : '👁️‍🗨️'}</span>
                                    {showDetails ? 'Ocultar Detalle' : 'Ver Detalle'}
                                </button>
                            </div>
                        </div>

                        {showDetails && (
                            <div className="p-6">
                                <div className="space-y-6">
                                    {resultado.detalle.map((respuesta, index) => {
                                        const tipoInfo = getTipoPreguntaInfo(respuesta.tipoPregunta)

                                        return (
                                            <div
                                                key={respuesta.preguntaId}
                                                className={`p-4 rounded-lg border-2 ${
                                                    respuesta.esCorrecta
                                                        ? 'border-green-200 bg-green-50'
                                                        : 'border-red-200 bg-red-50'
                                                }`}
                                            >
                                                {/* Header de la pregunta */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center space-x-3">
                                                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                                            respuesta.esCorrecta ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                                        }`}>
                                                            {index + 1}
                                                        </span>
                                                        <div>
                                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                {tipoInfo.icono} {tipoInfo.nombre}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center text-sm font-medium ${
                                                        respuesta.esCorrecta ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        {respuesta.esCorrecta ? '✅ Correcta' : '❌ Incorrecta'}
                                                        <span className="ml-2 text-xs bg-white px-2 py-1 rounded border">
                                                            {respuesta.puntajePregunta || 0} pts
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Enunciado */}
                                                <div className="mb-3">
                                                    <p className="text-gray-900 font-medium">{respuesta.enunciado}</p>
                                                </div>

                                                {/* Respuestas */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                    {respuesta.respuestaSeleccionada && (
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700 mb-1">Tu respuesta:</div>
                                                            <div className={`p-2 rounded border ${
                                                                respuesta.esCorrecta ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'
                                                            }`}>
                                                                <span className="text-sm text-gray-900">{respuesta.respuestaSeleccionada}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {respuesta.respuestaCorrecta && respuesta.respuestaCorrecta !== respuesta.respuestaSeleccionada && (
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-700 mb-1">Respuesta correcta:</div>
                                                            <div className="p-2 rounded border bg-green-100 border-green-300">
                                                                <span className="text-sm text-gray-900">{respuesta.respuestaCorrecta}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Explicación */}
                                                {respuesta.explicacion && (
                                                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                        <div className="flex items-start">
                                                            <span className="text-blue-600 mr-2 mt-0.5">💡</span>
                                                            <div>
                                                                <div className="text-sm font-medium text-blue-900 mb-1">Explicación:</div>
                                                                <div className="text-sm text-blue-800">{respuesta.explicacion}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Feedback del sistema */}
                                                {respuesta.feedback && respuesta.feedback !== 'Respuesta correcta' && respuesta.feedback !== 'Respuesta incorrecta' && (
                                                    <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
                                                        <div className="text-xs text-gray-600">
                                                            <span className="font-medium">Feedback:</span> {respuesta.feedback}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Recomendaciones */}
                {resultado.puntaje < 70 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start">
                            <span className="text-yellow-600 mr-3 text-xl">💡</span>
                            <div>
                                <h3 className="font-medium text-yellow-900 mb-2">Recomendaciones para Mejorar</h3>
                                <ul className="text-yellow-800 text-sm space-y-1">
                                    <li>• Revisa los temas donde tuviste más errores</li>
                                    <li>• Practica más simulacros del mismo tipo</li>
                                    <li>• Consulta el material de estudio del curso</li>
                                    <li>• Considera solicitar ayuda al instructor</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/simulacros')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        🔙 Volver a Simulacros
                    </button>

                    {simulacro.intentos_permitidos === -1 || (simulacro.intentos_permitidos > 1) && (
                        <button
                            onClick={() => navigate(`/simulacro/${simulacro.id}/realizar`)}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            🔄 Repetir Simulacro
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/mis-cursos')}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        📚 Ver Mis Cursos
                    </button>
                </div>
            </div>
        </Layout>
    )
}

export default ResultadoSimulacro