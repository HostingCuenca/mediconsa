// src/adminpanel/MaterialManager.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'

const MaterialManager = () => {
    const { cursoId } = useParams()
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [curso, setCurso] = useState(null)
    const [materiales, setMateriales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario
    const [materialForm, setMaterialForm] = useState({
        titulo: '',
        descripcion: '',
        archivoUrl: '',
        tipoArchivo: 'pdf',
        precio: 0,
        esGratuito: true,
        tipoMaterial: 'curso',
        categoria: 'medicina',
        stockDisponible: -1,
        visiblePublico: false,
        imagenUrl: ''
    })

    // Estados de UI
    const [showForm, setShowForm] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState(null)
    const [activeTab, setActiveTab] = useState('curso')

    // ========== EFECTOS ==========
    useEffect(() => {
        if (cursoId) {
            loadMaterialData()
        } else {
            loadMarketplaceMaterials()
        }
    }, [cursoId, activeTab])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadMaterialData = async () => {
        try {
            setLoading(true)
            const result = await materialServices.getMaterialesByCourse(cursoId)

            if (result.success) {
                setMateriales(result.data.materiales || [])
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

    const loadMarketplaceMaterials = async () => {
        try {
            setLoading(true)
            const result = await materialServices.getMarketplaceMaterials({
                tipo: activeTab === 'marketplace' ? undefined : activeTab
            })

            if (result.success) {
                setMateriales(result.data.materiales || [])
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
    const handleSubmitMaterial = async (e) => {
        e.preventDefault()
        setFormLoading(true)

        try {
            const materialData = {
                ...materialForm,
                cursoId: cursoId || null,
                precio: parseFloat(materialForm.precio) || 0
            }

            const result = await materialServices.createMaterial(materialData)

            if (result.success) {
                setSuccess(result.message)
                setShowForm(false)
                resetForm()
                if (cursoId) {
                    await loadMaterialData()
                } else {
                    await loadMarketplaceMaterials()
                }
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
        setMaterialForm({
            titulo: '',
            descripcion: '',
            archivoUrl: '',
            tipoArchivo: 'pdf',
            precio: 0,
            esGratuito: true,
            tipoMaterial: cursoId ? 'curso' : 'premium',
            categoria: 'medicina',
            stockDisponible: -1,
            visiblePublico: !cursoId,
            imagenUrl: ''
        })
        setEditingMaterial(null)
    }

    // ========== UTILIDADES ==========
    const getTipoMaterialBadge = (tipo) => {
        const tipos = {
            'curso': { name: 'Material de Curso', color: 'bg-blue-100 text-blue-800', icon: '📚' },
            'libre': { name: 'Descarga Gratuita', color: 'bg-green-100 text-green-800', icon: '🆓' },
            'premium': { name: 'Material Premium', color: 'bg-yellow-100 text-yellow-800', icon: '⭐' }
        }
        return tipos[tipo] || tipos['curso']
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    // ========== RENDER ==========
    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando materiales...</p>
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
                            {cursoId && (
                                <button
                                    onClick={() => navigate(-1)}
                                    className="text-medico-blue hover:text-blue-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                </button>
                            )}
                            <h1 className="text-3xl font-bold text-medico-blue">
                                📚 {cursoId ? 'Materiales del Curso' : 'Gestión de Materiales'}
                            </h1>
                        </div>
                        {curso && (
                            <h2 className="text-xl text-gray-700 mb-2">{curso.titulo}</h2>
                        )}
                        <div className="text-sm text-gray-600">
                            {materiales.length} materiales {cursoId ? 'en este curso' : 'en el marketplace'}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Nuevo Material</span>
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

                {/* ========== TABS (solo para marketplace) ========== */}
                {!cursoId && (
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                        <button
                            onClick={() => setActiveTab('marketplace')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                activeTab === 'marketplace'
                                    ? 'bg-white shadow text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            🏪 Todos
                        </button>
                        <button
                            onClick={() => setActiveTab('premium')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                activeTab === 'premium'
                                    ? 'bg-white shadow text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            ⭐ Premium
                        </button>
                        <button
                            onClick={() => setActiveTab('libre')}
                            className={`px-4 py-2 rounded-md transition-colors ${
                                activeTab === 'libre'
                                    ? 'bg-white shadow text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-gray-800'
                            }`}
                        >
                            🆓 Gratuitos
                        </button>
                    </div>
                )}

                {/* ========== LISTA DE MATERIALES ========== */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materiales.map((material) => {
                        const tipoBadge = getTipoMaterialBadge(material.tipo_material)

                        return (
                            <div key={material.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                {material.imagen_url && (
                                    <div className="h-48 bg-gray-100">
                                        <img
                                            src={material.imagen_url}
                                            alt={material.titulo}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none'
                                            }}
                                        />
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                                            {material.titulo}
                                        </h3>
                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${tipoBadge.color} whitespace-nowrap`}>
                                            {tipoBadge.icon} {tipoBadge.name.split(' ')[0]}
                                        </span>
                                    </div>

                                    {material.descripcion && (
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {material.descripcion}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mb-4 text-sm">
                                        <span className="text-gray-500">
                                            📁 {material.tipo_archivo?.toUpperCase() || 'PDF'}
                                        </span>
                                        <span className="font-semibold text-lg text-medico-blue">
                                            {material.es_gratuito ? 'Gratis' : formatPrice(material.precio)}
                                        </span>
                                    </div>

                                    {material.categoria && (
                                        <div className="mb-4">
                                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                                🏷️ {material.categoria}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => window.open(material.archivo_url, '_blank')}
                                            className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                        >
                                            👁️ Ver
                                        </button>
                                        <button
                                            onClick={() => {
                                                setMaterialForm(material)
                                                setEditingMaterial(material.id)
                                                setShowForm(true)
                                            }}
                                            className="flex-1 bg-gray-50 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
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
                {materiales.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No hay materiales {cursoId ? 'en este curso' : 'disponibles'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Crea el primer material para comenzar
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            ➕ Crear Material
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
                                        {editingMaterial ? 'Editar Material' : 'Nuevo Material'}
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

                                <form onSubmit={handleSubmitMaterial} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Título *
                                            </label>
                                            <input
                                                type="text"
                                                value={materialForm.titulo}
                                                onChange={(e) => setMaterialForm(prev => ({ ...prev, titulo: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                required
                                                placeholder="Ej: Harrison Principios de Medicina Interna"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={materialForm.descripcion}
                                                onChange={(e) => setMaterialForm(prev => ({ ...prev, descripcion: e.target.value }))}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="Descripción detallada del material..."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                URL del Archivo *
                                            </label>
                                            <input
                                                type="url"
                                                value={materialForm.archivoUrl}
                                                onChange={(e) => setMaterialForm(prev => ({ ...prev, archivoUrl: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                required
                                                placeholder="https://drive.google.com/file/d/..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Material
                                            </label>
                                            <select
                                                value={materialForm.tipoMaterial}
                                                onChange={(e) => setMaterialForm(prev => ({ ...prev, tipoMaterial: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                disabled={!!cursoId}
                                            >
                                                <option value="curso">📚 Material de Curso</option>
                                                <option value="libre">🆓 Descarga Gratuita</option>
                                                <option value="premium">⭐ Material Premium</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Archivo
                                            </label>
                                            <select
                                                value={materialForm.tipoArchivo}
                                                onChange={(e) => setMaterialForm(prev => ({ ...prev, tipoArchivo: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            >
                                                <option value="pdf">📄 PDF</option>
                                                <option value="doc">📝 DOC/DOCX</option>
                                                <option value="xls">📊 Excel</option>
                                                <option value="ppt">📽️ PowerPoint</option>
                                                <option value="zip">🗜️ ZIP/RAR</option>
                                                <option value="mp4">🎥 Video</option>
                                                <option value="mp3">🎵 Audio</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio (USD)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={materialForm.precio}
                                                onChange={(e) => setMaterialForm(prev => ({ ...prev, precio: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                disabled={materialForm.esGratuito}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría
                                            </label>
                                            <input
                                                type="text"
                                                value={materialForm.categoria}
                                                onChange={(e) => setMaterialForm(prev => ({ ...prev, categoria: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="medicina, enfermería, odontología..."
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                URL de Imagen (opcional)
                                            </label>
                                            <input
                                                type="url"
                                                value={materialForm.imagenUrl}
                                                onChange={(e) => setMaterialForm(prev => ({ ...prev, imagenUrl: e.target.value }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                            />
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={materialForm.esGratuito}
                                                    onChange={(e) => setMaterialForm(prev => ({
                                                        ...prev,
                                                        esGratuito: e.target.checked,
                                                        precio: e.target.checked ? 0 : prev.precio
                                                    }))}
                                                    className="mr-2 rounded"
                                                />
                                                <span className="text-sm text-gray-700">Material gratuito</span>
                                            </label>

                                            {!cursoId && (
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={materialForm.visiblePublico}
                                                        onChange={(e) => setMaterialForm(prev => ({ ...prev, visiblePublico: e.target.checked }))}
                                                        className="mr-2 rounded"
                                                    />
                                                    <span className="text-sm text-gray-700">Visible en marketplace público</span>
                                                </label>
                                            )}
                                        </div>
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
                                            <span>{formLoading ? 'Guardando...' : (editingMaterial ? 'Actualizar' : 'Crear Material')}</span>
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

export default MaterialManager