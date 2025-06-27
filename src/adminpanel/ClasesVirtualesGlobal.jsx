// src/adminpanel/ClasesVirtualesGlobal.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'
import courseManagementService from '../services/courseManagement'

const ClasesVirtualesGlobal = () => {
    const navigate = useNavigate()

    // ========== ESTADOS ==========
    const [loading, setLoading] = useState(true)
    const [clasesVirtuales, setClasesVirtuales] = useState([])
    const [cursos, setCursos] = useState([])
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [filtros, setFiltros] = useState({
        curso: '',
        estado: '',
        plataforma: '',
        fechaDesde: '',
        fechaHasta: ''
    })

    // ========== EFECTOS ==========
    useEffect(() => {
        loadAllData()
    }, [])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadAllData = async () => {
        try {
            setLoading(true)

            // Cargar cursos primero
            const cursosResult = await courseManagementService.getCourses()
            if (cursosResult.success) {
                setCursos(cursosResult.data.cursos || [])

                // Cargar clases virtuales de todos los cursos
                const todasLasClases = []
                for (const curso of cursosResult.data.cursos || []) {
                    try {
                        const clasesResult = await materialServices.getClasesVirtualesByCourse(curso.id)
                        if (clasesResult.success) {
                            const clasesConCurso = clasesResult.data.clasesVirtuales.map(clase => ({
                                ...clase,
                                curso_titulo: curso.titulo,
                                curso_id: curso.id
                            }))
                            todasLasClases.push(...clasesConCurso)
                        }
                    } catch (error) {
                        console.error(`Error cargando clases del curso ${curso.titulo}:`, error)
                    }
                }

                setClasesVirtuales(todasLasClases)
            } else {
                setError('Error cargando cursos')
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // ========== FILTROS ==========
    const clasesFiltradas = clasesVirtuales.filter(clase => {
        const cumpleCurso = !filtros.curso || clase.curso_id === filtros.curso
        const cumpleEstado = !filtros.estado || clase.estado_tiempo === filtros.estado
        const cumplePlataforma = !filtros.plataforma || clase.plataforma === filtros.plataforma

        let cumpleFecha = true
        if (filtros.fechaDesde || filtros.fechaHasta) {
            const fechaClase = new Date(clase.fecha_programada)
            if (filtros.fechaDesde) {
                cumpleFecha = cumpleFecha && fechaClase >= new Date(filtros.fechaDesde)
            }
            if (filtros.fechaHasta) {
                cumpleFecha = cumpleFecha && fechaClase <= new Date(filtros.fechaHasta)
            }
        }

        return cumpleCurso && cumpleEstado && cumplePlataforma && cumpleFecha
    })

    // ========== UTILIDADES ==========
    const getEstadoBadge = (estado) => {
        const estados = {
            'programada': { name: 'Programada', color: 'bg-blue-100 text-blue-800', icon: '📅' },
            'proximamente': { name: 'Próximamente', color: 'bg-yellow-100 text-yellow-800', icon: '⏰' },
            'finalizada': { name: 'Finalizada', color: 'bg-gray-100 text-gray-800', icon: '✅' }
        }
        return estados[estado] || estados['programada']
    }

    const getPlataformaBadge = (plataforma) => {
        const plataformas = {
            'meet': { name: 'Google Meet', color: 'bg-green-100 text-green-800', icon: '🎥' },
            'zoom': { name: 'Zoom', color: 'bg-blue-100 text-blue-800', icon: '📹' },
            'teams': { name: 'Microsoft Teams', color: 'bg-purple-100 text-purple-800', icon: '👥' }
        }
        return plataformas[plataforma] || plataformas['meet']
    }

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('es-EC', {
            timeZone: 'America/Guayaquil',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // ========== ESTADÍSTICAS ==========
    const estadisticas = {
        total: clasesFiltradas.length,
        programadas: clasesFiltradas.filter(c => c.estado_tiempo === 'programada').length,
        proximamente: clasesFiltradas.filter(c => c.estado_tiempo === 'proximamente').length,
        finalizadas: clasesFiltradas.filter(c => c.estado_tiempo === 'finalizada').length,
        hoy: clasesFiltradas.filter(c => {
            const hoy = new Date().toDateString()
            const fechaClase = new Date(c.fecha_programada).toDateString()
            return hoy === fechaClase
        }).length
    }

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
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue">🎥 Todas las Clases Virtuales</h1>
                        <p className="text-gray-600 mt-2">Gestión global de clases virtuales de todos los cursos</p>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => loadAllData()}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Actualizar</span>
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-medico-blue">{estadisticas.total}</div>
                        <div className="text-sm text-gray-600">Total Clases</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-blue-600">{estadisticas.programadas}</div>
                        <div className="text-sm text-gray-600">Programadas</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-yellow-600">{estadisticas.proximamente}</div>
                        <div className="text-sm text-gray-600">Próximamente</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-green-600">{estadisticas.hoy}</div>
                        <div className="text-sm text-gray-600">Hoy</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="text-2xl font-bold text-gray-600">{estadisticas.finalizadas}</div>
                        <div className="text-sm text-gray-600">Finalizadas</div>
                    </div>
                </div>

                {/* ========== FILTROS ========== */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Filtros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                            <select
                                value={filtros.curso}
                                onChange={(e) => setFiltros(prev => ({ ...prev, curso: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos los cursos</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>{curso.titulo}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                value={filtros.estado}
                                onChange={(e) => setFiltros(prev => ({ ...prev, estado: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                <option value="programada">Programadas</option>
                                <option value="proximamente">Próximamente</option>
                                <option value="finalizada">Finalizadas</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
                            <select
                                value={filtros.plataforma}
                                onChange={(e) => setFiltros(prev => ({ ...prev, plataforma: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todas</option>
                                <option value="meet">Google Meet</option>
                                <option value="zoom">Zoom</option>
                                <option value="teams">Microsoft Teams</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                            <input
                                type="date"
                                value={filtros.fechaDesde}
                                onChange={(e) => setFiltros(prev => ({ ...prev, fechaDesde: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                            <input
                                type="date"
                                value={filtros.fechaHasta}
                                onChange={(e) => setFiltros(prev => ({ ...prev, fechaHasta: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-600">
                            Mostrando {clasesFiltradas.length} de {clasesVirtuales.length} clases
                        </p>
                        <button
                            onClick={() => setFiltros({ curso: '', estado: '', plataforma: '', fechaDesde: '', fechaHasta: '' })}
                            className="text-sm text-medico-blue hover:text-blue-700"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                {/* ========== LISTA DE CLASES ========== */}
                <div className="space-y-4">
                    {clasesFiltradas.map((clase) => {
                        const estadoBadge = getEstadoBadge(clase.estado_tiempo)
                        const plataformaBadge = getPlataformaBadge(clase.plataforma)

                        return (
                            <div key={clase.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">{clase.titulo}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${plataformaBadge.color}`}>
                                                {plataformaBadge.icon} {plataformaBadge.name}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge.color}`}>
                                                {estadoBadge.icon} {estadoBadge.name}
                                            </span>
                                        </div>

                                        <p className="text-blue-600 text-sm font-medium mb-2">📚 {clase.curso_titulo}</p>

                                        {clase.descripcion && (
                                            <p className="text-gray-600 mb-3">{clase.descripcion}</p>
                                        )}

                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{formatDateTime(clase.fecha_programada)}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{clase.duracion_minutos} minutos</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 ml-4">
                                        <button
                                            onClick={() => window.open(clase.link_reunion, '_blank')}
                                            className="bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                        >
                                            🔗 Reunión
                                        </button>
                                        <button
                                            onClick={() => navigate(`/admin/clases-virtuales/${clase.curso_id}`)}
                                            className="bg-blue-50 text-blue-700 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            ⚙️ Gestionar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* ========== EMPTY STATE ========== */}
                {clasesFiltradas.length === 0 && clasesVirtuales.length > 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases que coincidan con los filtros</h3>
                        <p className="text-gray-500 mb-6">Intenta ajustar los criterios de búsqueda</p>
                        <button
                            onClick={() => setFiltros({ curso: '', estado: '', plataforma: '', fechaDesde: '', fechaHasta: '' })}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            🔄 Limpiar Filtros
                        </button>
                    </div>
                )}

                {clasesFiltradas.length === 0 && clasesVirtuales.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎥</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases virtuales programadas</h3>
                        <p className="text-gray-500 mb-6">Las clases aparecerán aquí cuando se programen en los cursos</p>
                        <button
                            onClick={() => navigate('/admin/cursos')}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            📚 Gestionar Cursos
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default ClasesVirtualesGlobal