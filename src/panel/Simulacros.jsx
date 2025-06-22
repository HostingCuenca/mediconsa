
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import simulacrosService from '../services/simulacros'
import enrollmentsService from '../services/enrollments'

const Simulacros = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [loading, setLoading] = useState(true)
    const [availableSimulacros, setAvailableSimulacros] = useState([])
    const [myAttempts, setMyAttempts] = useState([])
    const [activeTab, setActiveTab] = useState('available')

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadData()
    }, [isAuthenticated])

    const loadData = async () => {
        try {
            setLoading(true)

            // Cargar cursos inscritos
            const enrollmentsResult = await enrollmentsService.getMyEnrollments()

            if (enrollmentsResult.success) {
                const cursos = enrollmentsResult.data.inscripciones || []
                const allSimulacros = []

                // Cargar simulacros de cada curso
                for (const curso of cursos) {
                    if (curso.estado_pago === 'habilitado' || curso.es_gratuito) {
                        const result = await simulacrosService.getSimulacrosByCourse(curso.curso_id)
                        if (result.success) {
                            const simulacrosConCurso = result.data.simulacros.map(s => ({
                                ...s,
                                curso_titulo: curso.titulo,
                                intentos_realizados: s.mis_intentos || 0,
                                mejor_puntaje: s.mejor_puntaje,
                                // 🆕 COMPATIBILIDAD: Modo unificado
                                modo_display: simulacrosService.getModoUnificado(s),
                                modo_color: simulacrosService.getModoEvaluacionColor(simulacrosService.getModoUnificado(s)),
                                tiempo_display: simulacrosService.formatTiempoSimulacro(s)
                            }))
                            allSimulacros.push(...simulacrosConCurso)
                        }
                    }
                }

                setAvailableSimulacros(allSimulacros)
            }

            // Cargar intentos
            if (activeTab === 'attempts') {
                const attemptsResult = await simulacrosService.getMyAttempts()
                if (attemptsResult.success) {
                    setMyAttempts(attemptsResult.data.intentos || [])
                }
            }

        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartSimulacro = (simulacro) => {
        navigate(`/simulacro/${simulacro.id}/realizar`)
    }

    const canRetake = (simulacro) => {
        if (simulacro.intentos_permitidos === -1) return true
        return (simulacro.intentos_realizados || 0) < simulacro.intentos_permitidos
    }

    // 🆕 NUEVA FUNCIÓN: Obtener icono según modo
    const getModoIcon = (modo) => {
        const iconos = {
            'estudio': '📚',
            'revision': '🔄',
            'evaluacion': '📝',
            'examen_real': '🎯',
            'practica': '📚',
            'realista': '📝',
            'examen': '🎯'
        }
        return iconos[modo] || '📋'
    }

    // 🆕 NUEVA FUNCIÓN: Obtener información de navegación
    const getNavegacionInfo = (simulacro) => {
        if (simulacro.tipo_navegacion === 'secuencial') {
            return {
                texto: 'Secuencial',
                color: 'bg-orange-100 text-orange-700',
                icono: '➡️'
            }
        }
        return {
            texto: 'Libre',
            color: 'bg-blue-100 text-blue-700',
            icono: '🔄'
        }
    }

    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando simulacros...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">🧪 Simulacros</h1>
                    <div className="text-sm text-gray-500">
                        {availableSimulacros.length} simulacros disponibles
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            activeTab === 'available'
                                ? 'bg-white shadow text-blue-600 font-medium'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        📋 Disponibles ({availableSimulacros.length})
                    </button>
                    <button
                        onClick={() => {setActiveTab('attempts'); loadData()}}
                        className={`px-4 py-2 rounded-md transition-colors ${
                            activeTab === 'attempts'
                                ? 'bg-white shadow text-blue-600 font-medium'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        📊 Mis Intentos ({myAttempts.length})
                    </button>
                </div>

                {/* Simulacros Disponibles */}
                {activeTab === 'available' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableSimulacros.map((simulacro) => {
                            const navegacionInfo = getNavegacionInfo(simulacro)

                            return (
                                <div key={simulacro.id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-lg mb-2 text-gray-900">{simulacro.titulo}</h3>
                                        <p className="text-blue-600 text-sm font-medium">{simulacro.curso_titulo}</p>

                                        {/* Tags de configuración */}
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${simulacro.modo_color}`}>
                                                {getModoIcon(simulacro.modo_display)} {simulacrosService.getModoEvaluacionLabel(simulacro.modo_display)}
                                            </span>

                                            {/* Mostrar navegación solo si es secuencial */}
                                            {simulacro.tipo_navegacion === 'secuencial' && (
                                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${navegacionInfo.color}`}>
                                                    {navegacionInfo.icono} {navegacionInfo.texto}
                                                </span>
                                            )}

                                            {/* Mostrar tipo de tiempo si no es sin límite */}
                                            {simulacro.tipo_tiempo && simulacro.tipo_tiempo !== 'sin_limite' && (
                                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    ⏱️ {simulacrosService.getTipoTiempoLabel(simulacro.tipo_tiempo)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="font-semibold text-gray-900">{simulacro.numero_preguntas}</div>
                                            <div className="text-gray-600">Preguntas</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                                            <div className="font-semibold text-gray-900">
                                                {simulacro.tiempo_display}
                                            </div>
                                            <div className="text-gray-600">Tiempo</div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm mb-4">
                                        <span className="text-gray-600">
                                            Intentos: <span className="font-medium">{simulacro.intentos_realizados || 0}</span>
                                            {simulacro.intentos_permitidos > 0 && (
                                                <span className="text-gray-500">/{simulacro.intentos_permitidos}</span>
                                            )}
                                        </span>
                                        {simulacro.mejor_puntaje && (
                                            <span className="font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                                            🏆 {simulacro.mejor_puntaje}%
                                           </span>
                                        )}
                                    </div>

                                    {canRetake(simulacro) ? (
                                        <button
                                            onClick={() => handleStartSimulacro(simulacro)}
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            {simulacro.intentos_realizados > 0 ? '🔄 Repetir Simulacro' : '🚀 Iniciar Simulacro'}
                                        </button>
                                    ) : (
                                        <div className="w-full bg-gray-100 text-gray-500 py-3 rounded-lg text-center font-medium">
                                            ❌ Sin intentos disponibles
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Mis Intentos */}
                {activeTab === 'attempts' && (
                    <div className="space-y-4">
                        {myAttempts.map((intento) => {
                            const gradeColor = simulacrosService.getGradeColor(intento.puntaje)
                            const gradeLabel = simulacrosService.getGradeLabel(intento.puntaje)

                            return (
                                <div key={intento.id} className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-lg text-gray-900">{intento.simulacro_titulo}</h3>
                                            <p className="text-blue-600 text-sm font-medium">{intento.curso_titulo}</p>
                                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                                <span>📅 {simulacrosService.formatDate(intento.fecha_intento)}</span>
                                                <span>⏱️ {simulacrosService.formatTime(intento.tiempo_empleado_minutos)}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${simulacrosService.getModoEvaluacionColor(intento.modo_evaluacion)}`}>
                                                   {getModoIcon(intento.modo_evaluacion)} {simulacrosService.getModoEvaluacionLabel(intento.modo_evaluacion)}
                                               </span>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className={`text-3xl font-bold mb-1 ${gradeColor.split(' ')[0]}`}>
                                                {intento.puntaje}%
                                            </div>
                                            <div className={`text-xs font-medium px-2 py-1 rounded-full ${gradeColor}`}>
                                                {gradeLabel}
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2">
                                                {intento.respuestas_correctas}/{intento.total_preguntas} correctas
                                            </div>
                                        </div>
                                    </div>

                                    {/* Barra de progreso visual */}
                                    <div className="mt-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-300 ${
                                                    intento.puntaje >= 80 ? 'bg-green-500' :
                                                        intento.puntaje >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                }`}
                                                style={{ width: `${Math.min(intento.puntaje, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Empty states */}
                {activeTab === 'available' && availableSimulacros.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🧪</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay simulacros disponibles</h3>
                        <p className="text-gray-500 mb-6">Inscríbete en cursos para acceder a sus simulacros</p>
                        <button
                            onClick={() => navigate('/mis-cursos')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            📚 Ver Mis Cursos
                        </button>
                    </div>
                )}

                {activeTab === 'attempts' && myAttempts.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No has realizado simulacros aún</h3>
                        <p className="text-gray-500 mb-6">Completa algunos simulacros para ver tus resultados aquí</p>
                        <button
                            onClick={() => setActiveTab('available')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            🚀 Ver Simulacros Disponibles
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Simulacros