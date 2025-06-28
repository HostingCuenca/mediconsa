// src/panel/ClasesVirtuales.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import materialServices from '../services/materiales'

const ClasesVirtuales = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    // ========== ESTADOS PRINCIPALES ==========
    const [clasesVirtuales, setClasesVirtuales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filtroEstado, setFiltroEstado] = useState('')

    // ========== EFECTOS ==========
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadMisClasesVirtuales()
    }, [isAuthenticated])

    // ========== FUNCIONES DE CARGA ==========
    const loadMisClasesVirtuales = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await materialServices.getMyClasesVirtuales()

            if (result.success) {
                setClasesVirtuales(result.data.clasesVirtuales || [])
            } else {
                setError(result.error || 'Error cargando clases virtuales')
            }
        } catch (error) {
            console.error('Error cargando clases virtuales:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
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

    const getEstadoBadge = (estadoTiempo, estadoAcceso) => {
        if (estadoAcceso !== 'habilitado') {
            const estados = {
                'no_inscrito': { name: 'No inscrito', color: 'bg-red-100 text-red-800', icon: '❌' },
                'pendiente': { name: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' }
            }
            return estados[estadoAcceso] || estados['no_inscrito']
        }

        const estados = {
            'programada': { name: 'Programada', color: 'bg-blue-100 text-blue-800', icon: '📅' },
            'proximamente': { name: 'Próximamente', color: 'bg-yellow-100 text-yellow-800', icon: '⏰' },
            'finalizada': { name: 'Finalizada', color: 'bg-gray-100 text-gray-800', icon: '✅' }
        }
        return estados[estadoTiempo] || estados['programada']
    }

    const formatDateTime = (dateString) => {
        try {
            return new Date(dateString).toLocaleString('es-EC', {
                timeZone: 'America/Guayaquil',
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            return 'Fecha inválida'
        }
    }

    const getTimeUntilClass = (fechaProgramada) => {
        const now = new Date()
        const classDate = new Date(fechaProgramada)
        const diffMs = classDate - now

        if (diffMs < 0) return null

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

        if (diffHours < 1) {
            return `En ${diffMinutes} minutos`
        } else if (diffHours < 24) {
            return `En ${diffHours} horas`
        } else {
            const diffDays = Math.floor(diffHours / 24)
            return `En ${diffDays} días`
        }
    }

    const handleAccederClase = (clase) => {
        if (clase.puede_acceder) {
            window.open(clase.link_reunion, '_blank')
        }
    }

    const clasesFiltradas = clasesVirtuales.filter(clase => {
        if (!filtroEstado) return true
        if (clase.estado_acceso !== 'habilitado') return filtroEstado === 'sin_acceso'
        return clase.estado_tiempo === filtroEstado
    })

    const getEstadosDisponibles = () => {
        const estados = [...new Set(clasesVirtuales.map(c => {
            if (c.estado_acceso !== 'habilitado') return 'sin_acceso'
            return c.estado_tiempo
        }))]
        return estados.sort()
    }

    const getEstadisticas = () => {
        const habilitadas = clasesVirtuales.filter(c => c.estado_acceso === 'habilitado')
        return {
            total: clasesVirtuales.length,
            disponibles: habilitadas.length,
            proximamente: habilitadas.filter(c => c.estado_tiempo === 'proximamente').length,
            hoy: habilitadas.filter(c => {
                const hoy = new Date().toDateString()
                const fechaClase = new Date(c.fecha_programada).toDateString()
                return hoy === fechaClase
            }).length
        }
    }

    const stats = getEstadisticas()

    // ========== RENDER ==========
    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando clases virtuales...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* ========== HEADER ========== */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-4">
                        <svg className="w-8 h-8 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-medico-blue">Clases Virtuales</h1>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Participa en las clases virtuales de tus cursos y no te pierdas ninguna sesión en vivo
                    </p>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-sm text-gray-600">Clases totales</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.disponibles}</p>
                                    <p className="text-sm text-gray-600">Disponibles</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.proximamente}</p>
                                    <p className="text-sm text-gray-600">Próximamente</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.hoy}</p>
                                    <p className="text-sm text-gray-600">Hoy</p>
                                </div>
                            </div>
                        </div>
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
                    </div>
                )}

                {/* ========== FILTROS ========== */}
                {clasesVirtuales.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <h3 className="text-lg font-medium text-gray-900">
                                Mis Clases Virtuales ({clasesFiltradas.length})
                            </h3>

                            <div className="flex items-center space-x-3">
                                <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
                                <select
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent text-sm"
                                >
                                    <option value="">Todos los estados</option>
                                    <option value="programada">📅 Programadas</option>
                                    <option value="proximamente">⏰ Próximamente</option>
                                    <option value="finalizada">✅ Finalizadas</option>
                                    <option value="sin_acceso">🔒 Sin acceso</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== LISTA DE CLASES VIRTUALES ========== */}
                <div className="space-y-4">
                    {clasesFiltradas.map((clase) => {
                        const plataformaBadge = getPlataformaBadge(clase.plataforma)
                        const estadoBadge = getEstadoBadge(clase.estado_tiempo, clase.estado_acceso)
                        const timeUntil = getTimeUntilClass(clase.fecha_programada)

                        return (
                            <div key={clase.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between">
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

                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Curso: {clase.curso_titulo}
                                            </p>
                                            {clase.descripcion && (
                                                <p className="text-gray-600 text-sm leading-relaxed mb-2">
                                                    {clase.descripcion}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                                            {timeUntil && clase.puede_acceder && (
                                                <div className="flex items-center space-x-2 text-medico-blue font-medium">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{timeUntil}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-6">
                                        {clase.puede_acceder ? (
                                            <div className="text-center">
                                                <button
                                                    onClick={() => handleAccederClase(clase)}
                                                    className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                                                        clase.estado_tiempo === 'proximamente'
                                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                                            : clase.estado_tiempo === 'programada'
                                                                ? 'bg-medico-blue text-white hover:bg-blue-700'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>
                                                        {clase.estado_tiempo === 'proximamente' ? 'Unirse Ahora' :
                                                            clase.estado_tiempo === 'programada' ? 'Ver Enlace' :
                                                                'Clase Finalizada'}
                                                    </span>
                                                </button>
                                                {clase.estado_tiempo === 'programada' && (
                                                    <p className="text-xs text-gray-500 mt-2 max-w-32">
                                                        El enlace estará activo 15 min antes
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center">
                                                <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-lg font-medium mb-2">
                                                    <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Sin acceso
                                                </div>
                                                <p className="text-xs text-gray-500 max-w-32">
                                                    {clase.estado_acceso === 'no_inscrito'
                                                        ? 'Inscríbete al curso'
                                                        : 'Inscripción pendiente'
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* ========== EMPTY STATE ========== */}
                {clasesVirtuales.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes clases virtuales programadas</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Las clases virtuales aparecerán aquí cuando tus instructores programen sesiones en vivo para los cursos.
                        </p>
                        <button
                            onClick={() => navigate('/cursos')}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Explorar Cursos
                        </button>
                    </div>
                )}

                {/* ========== EMPTY STATE FILTRADO ========== */}
                {clasesVirtuales.length > 0 && clasesFiltradas.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases con este estado</h3>
                        <p className="text-gray-500 mb-4">
                            No tienes clases virtuales en el estado seleccionado. Prueba con otro filtro.
                        </p>
                        <button
                            onClick={() => setFiltroEstado('')}
                            className="text-medico-blue hover:text-blue-700 font-medium"
                        >
                            Ver todas las clases
                        </button>
                    </div>
                )}

                {/* ========== CONSEJOS ========== */}
                {clasesVirtuales.length > 0 && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Consejos para las clases virtuales</span>
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Únete a la clase 5-10 minutos antes para verificar tu conexión</li>
                            <li>• Ten un ambiente silencioso y bien iluminado</li>
                            <li>• Mantén tu micrófono silenciado cuando no participes</li>
                            <li>• Si tienes problemas técnicos, contacta al instructor por chat</li>
                            <li>• Las clases próximamente muestran el botón "Unirse Ahora"</li>
                        </ul>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default ClasesVirtuales