// src/adminpanel/ClasesVirtualesManager.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'

const ClasesVirtualesManager = () => {
    const { cursoId } = useParams()
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [curso, setCurso] = useState(null)
    const [clasesVirtuales, setClasesVirtuales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario
    const [claseForm, setClaseForm] = useState({
        titulo: '',
        descripcion: '',
        plataforma: 'meet',
        linkReunion: '',
        fechaProgramada: '',
        duracionMinutos: 60
    })

    // Estados de UI
    const [showForm, setShowForm] = useState(false)
    const [editingClase, setEditingClase] = useState(null)

    // ========== EFECTOS ==========
    useEffect(() => {
        if (cursoId) {
            loadClasesData()
        }
    }, [cursoId])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadClasesData = async () => {
        try {
            setLoading(true)
            const result = await materialServices.getClasesVirtualesByCourse(cursoId)

            if (result.success) {
                setClasesVirtuales(result.data.clasesVirtuales || [])
                setCurso(result.data.curso)
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // ========== GESTIÓN DE FORMULARIO ==========
    const handleSubmitClase = async (e) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const claseData = {
                ...claseForm,
                cursoId,
                duracionMinutos: parseInt(claseForm.duracionMinutos) || 60
            }

            const result = await materialServices.createClaseVirtual(claseData)

            if (result.success) {
                setSuccess(result.message)
                setShowForm(false)
                resetForm()
                await loadClasesData()
            } else {
                setError(result.error)
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    const resetForm = () => {
        setClaseForm({
            titulo: '',
            descripcion: '',
            plataforma: 'meet',
            linkReunion: '',
            fechaProgramada: '',
            duracionMinutos: 60
        })
        setEditingClase(null)
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

    const getEstadoBadge = (estado) => {
        const estados = {
            'programada': { name: 'Programada', color: 'bg-blue-100 text-blue-800', icon: '📅' },
            'proximamente': { name: 'Próximamente', color: 'bg-yellow-100 text-yellow-800', icon: '⏰' },
            'finalizada': { name: 'Finalizada', color: 'bg-gray-100 text-gray-800', icon: '✅' }
        }
        return estados[estado] || estados['programada']
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

    const getDefaultDateTime = () => {
        const now = new Date()
        now.setHours(now.getHours() + 1)
        return now.toISOString().slice(0, 16)
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
                        <div className="flex items-center space-x-4 mb-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="text-medico-blue hover:text-blue-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                            <h1 className="text-3xl font-bold text-medico-blue">🎥 Clases Virtuales</h1>
                        </div>
                        {curso && (
                            <h2 className="text-xl text-gray-700 mb-2">{curso.titulo}</h2>
                        )}
                        <div className="text-sm text-gray-600">
                            {clasesVirtuales.length} clases programadas
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nueva Clase Virtual</span>
                    </button>
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

                {/* ========== LISTA DE CLASES ========== */}
                <div className="space-y-4">
                    {clasesVirtuales.map((clase) => {
                        const plataformaBadge = getPlataformaBadge(clase.plataforma)
                        const estadoBadge = getEstadoBadge(clase.estado_tiempo)

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
                                            🔗 Abrir Reunión
                                        </button>
                                        <button
                                            onClick={() => {
                                                setClaseForm({
                                                    titulo: clase.titulo,
                                                    descripcion: clase.descripcion || '',
                                                    plataforma: clase.plataforma,
                                                    linkReunion: clase.link_reunion,
                                                    fechaProgramada: new Date(clase.fecha_programada).toISOString().slice(0, 16),
                                                    duracionMinutos: clase.duracion_minutos
                                                })
                                                setEditingClase(clase.id)
                                                setShowForm(true)
                                            }}
                                            className="bg-gray-50 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                                        >
                                            ✏️ Editar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* ========== EMPTY STATE ========== */}
                {clasesVirtuales.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎥</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clases virtuales programadas</h3>
                        <p className="text-gray-500 mb-6">Crea la primera clase virtual para este curso</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            ➕ Programar Clase Virtual
                        </button>
                    </div>
                )}

                {/* ========== MODAL FORMULARIO ========== */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-2xl max-h-90vh overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-semibold text-gray-900">
                                        {editingClase ? 'Editar Clase Virtual' : 'Nueva Clase Virtual'}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowForm(false)
                                            resetForm()
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitClase} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Título de la Clase *
                                        </label>
                                        <input
                                            type="text"
                                            value={claseForm.titulo}
                                            onChange={(e) => setClaseForm(prev => ({ ...prev, titulo: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            required
                                            placeholder="Ej: Clase Virtual: Cardiología Avanzada"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción
                                        </label>
                                        <textarea
                                            value={claseForm.descripcion}
                                            onChange={(e) => setClaseForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="Descripción de los temas a tratar en la clase..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Plataforma *
                                            </label>
                                            <select
                                                value={claseForm.plataforma}
                                                onChange={(e) => setClaseForm(prev => ({ ...prev, plataforma: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                required
                                            >
                                                <option value="meet">🎥 Google Meet</option>
                                                <option value="zoom">📹 Zoom</option>
                                                <option value="teams">👥 Microsoft Teams</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Duración (minutos)
                                            </label>
                                            <input
                                                type="number"
                                                min="15"
                                                max="480"
                                                value={claseForm.duracionMinutos}
                                                onChange={(e) => setClaseForm(prev => ({ ...prev, duracionMinutos: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="60"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Link de la Reunión *
                                        </label>
                                        <input
                                            type="url"
                                            value={claseForm.linkReunion}
                                            onChange={(e) => setClaseForm(prev => ({ ...prev, linkReunion: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            required
                                            placeholder="https://meet.google.com/xyz-abcd-efgh"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Fecha y Hora Programada *
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={claseForm.fechaProgramada || getDefaultDateTime()}
                                            onChange={(e) => setClaseForm(prev => ({ ...prev, fechaProgramada: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            required
                                            min={new Date().toISOString().slice(0, 16)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Hora local de Ecuador (GMT-5)
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h4 className="font-medium text-blue-900 mb-2">💡 Consejos</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Programa la clase con al menos 30 minutos de anticipación</li>
                                            <li>• Verifica que el link de reunión sea correcto y esté activo</li>
                                            <li>• Los estudiantes podrán ver el link 15 minutos antes del inicio</li>
                                        </ul>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowForm(false)
                                                resetForm()
                                            }}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={formLoading}
                                            className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                                        >
                                            {formLoading && (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            )}
                                            <span>{formLoading ? 'Guardando...' : (editingClase ? 'Actualizar' : 'Programar Clase')}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default ClasesVirtualesManager