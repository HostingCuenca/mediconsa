// src/adminpanel/CanalesManager.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'

const CanalesManager = () => {
    const { cursoId } = useParams()
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [curso, setCurso] = useState(null)
    const [canales, setCanales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario
    const [canalForm, setCanalForm] = useState({
        nombre: '',
        descripcion: '',
        tipoCanal: 'whatsapp',
        linkAcceso: ''
    })

    // Estados de UI
    const [showForm, setShowForm] = useState(false)
    const [editingCanal, setEditingCanal] = useState(null)

    // ========== EFECTOS ==========
    useEffect(() => {
        if (cursoId) {
            loadCanalesData()
        }
    }, [cursoId])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadCanalesData = async () => {
        try {
            setLoading(true)
            const result = await materialServices.getCanalesByCourse(cursoId)

            if (result.success) {
                setCanales(result.data.canales || [])
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
    const handleSubmitCanal = async (e) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const canalData = {
                ...canalForm,
                cursoId
            }

            const result = await materialServices.createCanal(canalData)

            if (result.success) {
                setSuccess(result.message)
                setShowForm(false)
                resetForm()
                await loadCanalesData()
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
        setCanalForm({
            nombre: '',
            descripcion: '',
            tipoCanal: 'whatsapp',
            linkAcceso: ''
        })
        setEditingCanal(null)
    }

    // ========== UTILIDADES ==========
    const getTipoCanalBadge = (tipo) => {
        const tipos = {
            'whatsapp': { name: 'WhatsApp', color: 'bg-green-100 text-green-800', icon: '📱' },
            'telegram': { name: 'Telegram', color: 'bg-blue-100 text-blue-800', icon: '✈️' },
            'discord': { name: 'Discord', color: 'bg-purple-100 text-purple-800', icon: '🎮' },
            'slack': { name: 'Slack', color: 'bg-pink-100 text-pink-800', icon: '💬' }
        }
        return tipos[tipo] || tipos['whatsapp']
    }

    const generateWhatsAppLink = (numero) => {
        const cleanNumber = numero.replace(/\D/g, '')
        if (cleanNumber.startsWith('0')) {
            return `https://wa.me/593${cleanNumber.substring(1)}`
        }
        return `https://wa.me/593${cleanNumber}`
    }

    const handleTipoChange = (tipo) => {
        setCanalForm(prev => ({
            ...prev,
            tipoCanal: tipo,
            linkAcceso: tipo === 'whatsapp' ? '' : prev.linkAcceso
        }))
    }

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
                            <h1 className="text-3xl font-bold text-medico-blue">💬 Canales de Comunicación</h1>
                        </div>
                        {curso && (
                            <h2 className="text-xl text-gray-700 mb-2">{curso.titulo}</h2>
                        )}
                        <div className="text-sm text-gray-600">
                            {canales.length} canales configurados
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nuevo Canal</span>
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

{/* ========== LISTA DE CANALES ========== */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {canales.map((canal) => {
        const tipoBadge = getTipoCanalBadge(canal.tipo_canal)

        return (
            <div key={canal.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-lg text-gray-900">{canal.nombre}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoBadge.color}`}>
                                       {tipoBadge.icon} {tipoBadge.name}
                                   </span>
                </div>

                {canal.descripcion && (
                    <p className="text-gray-600 text-sm mb-4">{canal.descripcion}</p>
                )}

                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Link de acceso:</p>
                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 break-all">
                        {canal.link_acceso}
                    </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                    Creado: {new Date(canal.fecha_creacion).toLocaleDateString('es-EC')}
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={() => window.open(canal.link_acceso, '_blank')}
                        className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                    >
                        🔗 Abrir
                    </button>
                    <button
                        onClick={() => {
                            setCanalForm({
                                nombre: canal.nombre,
                                descripcion: canal.descripcion || '',
                                tipoCanal: canal.tipo_canal,
                                linkAcceso: canal.link_acceso
                            })
                            setEditingCanal(canal.id)
                            setShowForm(true)
                        }}
                        className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                        ✏️ Editar
                    </button>
                </div>
            </div>
        )
    })}
</div>

{/* ========== EMPTY STATE ========== */}
{canales.length === 0 && (
    <div className="text-center py-12">
        <div className="text-6xl mb-4">💬</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay canales configurados</h3>
        <p className="text-gray-500 mb-6">Crea el primer canal de comunicación para este curso</p>
        <button
            onClick={() => setShowForm(true)}
            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
            ➕ Crear Canal
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
                        {editingCanal ? 'Editar Canal' : 'Nuevo Canal de Comunicación'}
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

                <form onSubmit={handleSubmitCanal} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Canal *
                        </label>
                        <input
                            type="text"
                            value={canalForm.nombre}
                            onChange={(e) => setCanalForm(prev => ({ ...prev, nombre: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            required
                            placeholder="Ej: Grupo Medicina Interna"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            value={canalForm.descripcion}
                            onChange={(e) => setCanalForm(prev => ({ ...prev, descripcion: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            placeholder="Propósito y reglas del canal..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Canal *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { value: 'whatsapp', name: 'WhatsApp', icon: '📱', color: 'border-green-300 bg-green-50' },
                                { value: 'telegram', name: 'Telegram', icon: '✈️', color: 'border-blue-300 bg-blue-50' },
                                { value: 'discord', name: 'Discord', icon: '🎮', color: 'border-purple-300 bg-purple-50' },
                                { value: 'slack', name: 'Slack', icon: '💬', color: 'border-pink-300 bg-pink-50' }
                            ].map((tipo) => (
                                <label
                                    key={tipo.value}
                                    className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                        canalForm.tipoCanal === tipo.value
                                            ? `${tipo.color} border-opacity-100`
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="tipoCanal"
                                        value={tipo.value}
                                        checked={canalForm.tipoCanal === tipo.value}
                                        onChange={(e) => handleTipoChange(e.target.value)}
                                        className="sr-only"
                                    />
                                    <span className="text-2xl mb-1">{tipo.icon}</span>
                                    <span className="text-xs font-medium">{tipo.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Campo especial para WhatsApp */}
                    {canalForm.tipoCanal === 'whatsapp' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-medium text-green-900 mb-3">📱 Configuración WhatsApp</h4>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-green-800 mb-1">
                                        Número de WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        value={canalForm.numeroWhatsApp || ''}
                                        onChange={(e) => {
                                            const numero = e.target.value
                                            setCanalForm(prev => ({
                                                ...prev,
                                                numeroWhatsApp: numero,
                                                linkAcceso: numero ? generateWhatsAppLink(numero) : ''
                                            }))
                                        }}
                                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="0978698025"
                                    />
                                    <p className="text-xs text-green-600 mt-1">
                                        Ingresa el número sin códigos de país (se añadirá +593 automáticamente)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-green-800 mb-1">
                                        Mensaje personalizado (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={canalForm.mensajeWhatsApp || ''}
                                        onChange={(e) => {
                                            const mensaje = e.target.value
                                            setCanalForm(prev => ({
                                                ...prev,
                                                mensajeWhatsApp: mensaje,
                                                linkAcceso: prev.numeroWhatsApp ?
                                                    `${generateWhatsAppLink(prev.numeroWhatsApp)}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`
                                                    : ''
                                            }))
                                        }}
                                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="Hola, me interesa unirme al grupo de..."
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Campo para otros tipos */}
                    {canalForm.tipoCanal !== 'whatsapp' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Link de Acceso *
                            </label>
                            <input
                                type="url"
                                value={canalForm.linkAcceso}
                                onChange={(e) => setCanalForm(prev => ({ ...prev, linkAcceso: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                required
                                placeholder={
                                    canalForm.tipoCanal === 'telegram' ? 'https://t.me/+abc123...' :
                                        canalForm.tipoCanal === 'discord' ? 'https://discord.gg/abc123' :
                                            'https://slack.com/workspace/...'
                                }
                            />
                        </div>
                    )}

                    {/* Preview del link */}
                    {canalForm.linkAcceso && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <p className="text-xs text-gray-600 mb-1">Vista previa del link:</p>
                            <p className="text-sm text-gray-800 break-all">{canalForm.linkAcceso}</p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Recomendaciones</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>WhatsApp:</strong> Ideal para comunicación directa y soporte</li>
                            <li>• <strong>Telegram:</strong> Perfecto para anuncios y materiales adicionales</li>
                            <li>• <strong>Discord:</strong> Excelente para comunidades estudiantiles</li>
                            <li>• <strong>Slack:</strong> Profesional para cursos empresariales</li>
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
                            disabled={formLoading || !canalForm.linkAcceso}
                            className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                        >
                            {formLoading && (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            )}
                            <span>{formLoading ? 'Guardando...' : (editingCanal ? 'Actualizar' : 'Crear Canal')}</span>
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

export default CanalesManager