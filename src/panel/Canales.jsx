// src/panel/Canales.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import materialServices from '../services/materiales'

const Canales = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    // ========== ESTADOS PRINCIPALES ==========
    const [canales, setCanales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filtroTipo, setFiltroTipo] = useState('')

    // ========== EFECTOS ==========
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadMisCanales()
    }, [isAuthenticated])

    // ========== FUNCIONES DE CARGA ==========
    const loadMisCanales = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await materialServices.getMyCanales()

            if (result.success) {
                setCanales(result.data.canales || [])
            } else {
                setError(result.error || 'Error cargando canales')
            }
        } catch (error) {
            console.error('Error cargando canales:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // ========== UTILIDADES ==========
    const getTipoDisplay = (tipoCanal) => {
        const tipos = {
            'whatsapp': { name: 'WhatsApp', color: 'bg-green-100 text-green-800', icon: '📱' },
            'telegram': { name: 'Telegram', color: 'bg-blue-100 text-blue-800', icon: '✈️' },
            'discord': { name: 'Discord', color: 'bg-purple-100 text-purple-800', icon: '🎮' },
            'slack': { name: 'Slack', color: 'bg-yellow-100 text-yellow-800', icon: '💬' }
        }
        return tipos[tipoCanal] || { name: tipoCanal, icon: '📢', color: 'bg-gray-100 text-gray-800' }
    }

    const getEstadoBadge = (estadoAcceso) => {
        const estados = {
            'habilitado': { name: 'Disponible', color: 'bg-green-100 text-green-800', icon: '✅' },
            'no_inscrito': { name: 'No inscrito', color: 'bg-red-100 text-red-800', icon: '❌' },
            'pendiente': { name: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' }
        }
        return estados[estadoAcceso] || estados['no_inscrito']
    }

    const handleAccederCanal = (canal) => {
        if (canal.puede_acceder) {
            window.open(canal.link_acceso, '_blank')
        }
    }

    const canalesFiltrados = canales.filter(canal => {
        if (!filtroTipo) return true
        return canal.tipo_canal === filtroTipo
    })

    const getTiposDisponibles = () => {
        const tipos = [...new Set(canales.map(c => c.tipo_canal))]
        return tipos.sort()
    }

    const getEstadisticas = () => {
        return {
            total: canales.length,
            disponibles: canales.filter(c => c.puede_acceder).length,
            porTipo: canales.reduce((acc, canal) => {
                acc[canal.tipo_canal] = (acc[canal.tipo_canal] || 0) + 1
                return acc
            }, {})
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
                        <p className="mt-4 text-medico-gray">Cargando canales...</p>
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
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-medico-blue">Canales de Comunicación</h1>
                    </div>
                    <p className="text-gray-600 mb-4">
                        Accede a los canales de comunicación de tus cursos y mantente conectado con instructores y compañeros
                    </p>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                    <p className="text-sm text-gray-600">Canales totales</p>
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
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-900">{Object.keys(stats.porTipo).length}</p>
                                    <p className="text-sm text-gray-600">Tipos diferentes</p>
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
                {canales.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                            <h3 className="text-lg font-medium text-gray-900">
                                Mis Canales ({canalesFiltrados.length})
                            </h3>

                            <div className="flex items-center space-x-3">
                                <label className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
                                <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent text-sm"
                                >
                                    <option value="">Todos los tipos</option>
                                    {getTiposDisponibles().map(tipo => {
                                        const display = getTipoDisplay(tipo)
                                        return (
                                            <option key={tipo} value={tipo}>
                                                {display.name}
                                            </option>
                                        )
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== LISTA DE CANALES ========== */}
                <div className="space-y-4">
                    {canalesFiltrados.map((canal) => {
                        const tipoDisplay = getTipoDisplay(canal.tipo_canal)
                        const estadoBadge = getEstadoBadge(canal.estado_acceso)

                        return (
                            <div key={canal.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <h3 className="font-semibold text-lg text-gray-900">{canal.nombre}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${tipoDisplay.color}`}>
                                                {tipoDisplay.icon} {tipoDisplay.name}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${estadoBadge.color}`}>
                                                {estadoBadge.icon} {estadoBadge.name}
                                            </span>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-700 mb-1">
                                                Curso: {canal.curso_titulo}
                                            </p>
                                            {canal.descripcion && (
                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                    {canal.descripcion}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                            {canal.creado_por_nombre && (
                                                <div className="flex items-center space-x-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    <span>Creado por: {canal.creado_por_nombre}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-6">
                                        {canal.puede_acceder ? (
                                            <button
                                                onClick={() => handleAccederCanal(canal)}
                                                className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                <span>Acceder</span>
                                            </button>
                                        ) : (
                                            <div className="text-center">
                                                <div className="bg-gray-100 text-gray-500 px-6 py-3 rounded-lg font-medium mb-2">
                                                    <svg className="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                    Sin acceso
                                                </div>
                                                <p className="text-xs text-gray-500 max-w-32">
                                                    {canal.estado_acceso === 'no_inscrito'
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
                {canales.length === 0 && !loading && (
                    <div className="text-center py-16">
                        <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                        </svg>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes canales disponibles</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            Los canales de comunicación aparecerán aquí cuando te inscribas a cursos que tengan canales configurados.
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
                {canales.length > 0 && canalesFiltrados.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay canales de este tipo</h3>
                        <p className="text-gray-500 mb-4">
                            No tienes canales del tipo seleccionado. Prueba con otro filtro.
                        </p>
                        <button
                            onClick={() => setFiltroTipo('')}
                            className="text-medico-blue hover:text-blue-700 font-medium"
                        >
                            Ver todos los canales
                        </button>
                    </div>
                )}

                {/* ========== CONSEJOS ========== */}
                {canales.length > 0 && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Consejos para usar los canales</span>
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Mantén un comportamiento respetuoso en todos los canales</li>
                            <li>• Usa los canales para preguntas relacionadas con el curso</li>
                            <li>• Si no puedes acceder a un canal, verifica tu inscripción al curso</li>
                            <li>• Los instructores suelen compartir material adicional por estos canales</li>
                        </ul>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Canales