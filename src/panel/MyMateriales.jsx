import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'

const MyMateriales = () => {
    const navigate = useNavigate()

    // ========== ESTADOS ==========
    const [activeTab, setActiveTab] = useState('mis-materiales')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Estados para Mis MyMateriales
    const [misMateriales, setMisMateriales] = useState([])
    const [estadisticasMias, setEstadisticasMias] = useState({})

    // Estados para Marketplace
    const [materialesPublicos, setMaterialesPublicos] = useState([])
    const [categorias, setCategorias] = useState([])
    const [pagination, setPagination] = useState({})

    // Estados de filtros para marketplace
    const [filters, setFilters] = useState({
        search: '',
        categoria: '',
        tipo: '',
        page: 1
    })

    // ========== EFECTOS ==========
    useEffect(() => {
        loadInitialData()
    }, [])

    useEffect(() => {
        if (activeTab === 'marketplace') {
            loadMarketplaceMaterials()
        }
    }, [activeTab, filters])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadInitialData = async () => {
        try {
            setLoading(true)
            setError('')

            // Cargar mis materiales siempre (tab por defecto)
            await loadMisMateriales()

        } catch (error) {
            console.error('Error cargando datos iniciales:', error)
            setError('Error cargando materiales')
        } finally {
            setLoading(false)
        }
    }

    const loadMisMateriales = async () => {
        try {
            const result = await materialServices.getMyMaterials()

            if (result.success) {
                setMisMateriales(result.data.materiales || [])
                setEstadisticasMias(result.data.estadisticas || {})
            } else {
                setError(result.error || 'Error cargando mis materiales')
            }
        } catch (error) {
            console.error('Error cargando mis materiales:', error)
            setError('Error de conexión')
        }
    }

    const loadMarketplaceMaterials = async () => {
        try {
            const result = await materialServices.getMarketplaceMaterials({
                ...filters,
                limit: 12
            })

            if (result.success) {
                setMaterialesPublicos(result.data.materiales || [])
                setCategorias(result.data.categorias_disponibles || [])
                setPagination(result.data.pagination || {})
            } else {
                setError(result.error || 'Error cargando marketplace')
            }
        } catch (error) {
            console.error('Error cargando marketplace:', error)
            setError('Error de conexión')
        }
    }

    // ========== FUNCIONES DE FILTROS ==========
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset page when filtering
        }))
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            categoria: '',
            tipo: '',
            page: 1
        })
    }

    const handlePageChange = (newPage) => {
        setFilters(prev => ({
            ...prev,
            page: newPage
        }))
    }

    // ========== FUNCIONES DE ACCIONES ==========
    const handleViewMaterial = (material) => {
        if (material.archivo_url) {
            window.open(material.archivo_url, '_blank')
        } else {
            setError('URL del archivo no disponible')
        }
    }

    const handleDownloadMaterial = (material) => {
        if (material.puede_descargar || material.tipo_material === 'libre') {
            window.open(material.archivo_url, '_blank')
            setSuccess(`Descargando: ${material.titulo}`)
        } else {
            setError('Material no disponible para descarga directa')
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setSuccess('¡Enlace copiado al portapapeles!')
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea')
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setSuccess('¡Enlace copiado al portapapeles!')
        })
    }

    // ========== UTILIDADES ==========
    const getTipoMaterialBadge = (tipo) => {
        const tipos = {
            'curso': { name: 'Curso', color: 'bg-blue-100 text-blue-800', icon: '📚' },
            'libre': { name: 'Gratuito', color: 'bg-green-100 text-green-800', icon: '🆓' },
            'premium': { name: 'Premium', color: 'bg-yellow-100 text-yellow-800', icon: '⭐' }
        }
        return tipos[tipo] || { name: tipo, color: 'bg-gray-100 text-gray-800', icon: '📄' }
    }

    const getTipoArchivoBadge = (tipoArchivo) => {
        const tipos = {
            'pdf': { icon: '📄', color: 'text-red-600' },
            'doc': { icon: '📝', color: 'text-blue-600' },
            'docx': { icon: '📝', color: 'text-blue-600' },
            'xls': { icon: '📊', color: 'text-green-600' },
            'xlsx': { icon: '📊', color: 'text-green-600' },
            'ppt': { icon: '📽️', color: 'text-orange-600' },
            'pptx': { icon: '📽️', color: 'text-orange-600' },
            'zip': { icon: '🗜️', color: 'text-purple-600' },
            'mp4': { icon: '🎥', color: 'text-red-600' },
            'mp3': { icon: '🎵', color: 'text-pink-600' }
        }
        return tipos[tipoArchivo?.toLowerCase()] || { icon: '📎', color: 'text-gray-600' }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    // ========== RENDER MATERIALES ==========
    const renderMaterialCard = (material, source = 'curso') => {
        const tipoBadge = getTipoMaterialBadge(material.tipo_material)
        const archivoBadge = getTipoArchivoBadge(material.tipo_archivo)

        return (
            <div key={material.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Imagen */}
                {material.imagen_url && (
                    <div className="h-48 bg-gray-100 relative overflow-hidden">
                        <img
                            src={material.imagen_url}
                            alt={material.titulo}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.style.display = 'none'
                            }}
                        />
                        {source === 'marketplace' && (
                            <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-1">
                                <span className="text-lg font-bold text-medico-blue">
                                    {material.es_gratuito ? 'Gratis' : formatPrice(material.precio)}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoBadge.color}`}>
                            {tipoBadge.icon} {tipoBadge.name}
                        </span>
                        <div className="flex items-center space-x-1">
                            <span className={`text-lg ${archivoBadge.color}`}>
                                {archivoBadge.icon}
                            </span>
                            <span className="text-xs text-gray-500 uppercase">
                                {material.tipo_archivo}
                            </span>
                        </div>
                    </div>

                    {/* Título */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {material.titulo}
                    </h3>

                    {/* Curso */}
                    <p className="text-sm text-medico-blue mb-3 font-medium">
                        📚 {material.curso_titulo}
                    </p>

                    {/* Descripción */}
                    {material.descripcion && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {material.descripcion}
                        </p>
                    )}

                    {/* Info adicional */}
                    <div className="space-y-2 mb-4">
                        {source === 'marketplace' && material.precio > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Precio:</span>
                                <span className="font-semibold text-medico-blue">
                                    {formatPrice(material.precio)}
                                </span>
                            </div>
                        )}

                        {material.categoria && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Categoría:</span>
                                <span className="text-gray-800">🏷️ {material.categoria}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Publicado:</span>
                            <span className="text-gray-800">{formatDate(material.fecha_creacion)}</span>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleViewMaterial(material)}
                                className="bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center justify-center space-x-1"
                            >
                                <span>👁️</span>
                                <span>Ver</span>
                            </button>
                            {(material.puede_descargar || material.tipo_material === 'libre') ? (
                                <button
                                    onClick={() => handleDownloadMaterial(material)}
                                    className="bg-green-100 text-green-700 py-2 px-3 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                >
                                    <span>⬇️</span>
                                    <span>Descargar</span>
                                </button>
                            ) : (
                                <button
                                    className="bg-yellow-100 text-yellow-700 py-2 px-3 rounded-lg cursor-not-allowed text-sm flex items-center justify-center space-x-1"
                                    disabled
                                >
                                    <span>🔒</span>
                                    <span>Premium</span>
                                </button>
                            )}
                        </div>

                        <button
                            onClick={() => copyToClipboard(material.archivo_url)}
                            className="w-full bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center space-x-1"
                        >
                            <span>📋</span>
                            <span>Copiar Enlace</span>
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // ========== RENDER PRINCIPAL ==========
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue mb-2">📚 Mis Materiales</h1>
                    <p className="text-medico-gray">Accede a todos tus materiales de cursos y explora contenido adicional</p>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-600">{error}</p>
                            </div>
                            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-600">{success}</p>
                            </div>
                            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-6">
                    <button
                        onClick={() => setActiveTab('mis-materiales')}
                        className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                            activeTab === 'mis-materiales'
                                ? 'bg-white shadow text-medico-blue font-medium'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span>Mis Materiales ({misMateriales.length})</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('marketplace')}
                        className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                            activeTab === 'marketplace'
                                ? 'bg-white shadow text-medico-blue font-medium'
                                : 'text-gray-600 hover:text-gray-800'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Marketplace ({materialesPublicos.length})</span>
                    </button>
                </div>

                {/* Contenido de Tabs */}
                {activeTab === 'mis-materiales' && (
                    <div>
                        {/* Estadísticas */}
                        {estadisticasMias.total > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="text-2xl font-bold text-medico-blue">{estadisticasMias.total}</div>
                                    <div className="text-gray-600 text-sm">Total Materiales</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="text-2xl font-bold text-green-600">{estadisticasMias.accesibles}</div>
                                    <div className="text-gray-600 text-sm">Accesibles</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="text-2xl font-bold text-purple-600">{Object.keys(estadisticasMias.por_curso || {}).length}</div>
                                    <div className="text-gray-600 text-sm">Cursos</div>
                                </div>
                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {Math.round((estadisticasMias.accesibles / estadisticasMias.total) * 100) || 0}%
                                    </div>
                                    <div className="text-gray-600 text-sm">Disponibilidad</div>
                                </div>
                            </div>
                        )}

                        {/* Lista de mis materiales */}
                        {misMateriales.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {misMateriales.map((material) => renderMaterialCard(material, 'curso'))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <div className="text-6xl mb-4">📚</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No tienes materiales disponibles
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Los materiales aparecerán aquí cuando te inscribas en cursos que incluyan contenido adicional.
                                </p>
                                <button
                                    onClick={() => navigate('/panel/cursos')}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Explorar Cursos
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'marketplace' && (
                    <div>
                        {/* Filtros del marketplace */}
                        <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                                    <input
                                        type="text"
                                        placeholder="Buscar materiales..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                    <select
                                        value={filters.categoria}
                                        onChange={(e) => handleFilterChange('categoria', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categorias.map(cat => (
                                            <option key={cat.categoria} value={cat.categoria}>
                                                {cat.categoria} ({cat.cantidad})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={filters.tipo}
                                        onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value="">Todos los tipos</option>
                                        <option value="libre">🆓 Gratuitos</option>
                                        <option value="premium">⭐ Premium</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={resetFilters}
                                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Limpiar Filtros
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Lista del marketplace */}
                        {materialesPublicos.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                                    {materialesPublicos.map((material) => renderMaterialCard(material, 'marketplace'))}
                                </div>

                                {/* Paginación */}
                                {pagination.total_pages > 1 && (
                                    <div className="flex justify-center items-center space-x-2">
                                        <button
                                            onClick={() => handlePageChange(filters.page - 1)}
                                            disabled={!pagination.has_prev}
                                            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Anterior
                                        </button>

                                        <span className="px-4 py-2 text-sm text-gray-600">
                                            Página {pagination.page} de {pagination.total_pages}
                                        </span>

                                        <button
                                            onClick={() => handlePageChange(filters.page + 1)}
                                            disabled={!pagination.has_next}
                                            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No se encontraron materiales
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Intenta ajustar tus filtros de búsqueda para encontrar contenido relevante.
                                </p>
                                <button
                                    onClick={resetFilters}
                                    className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default MyMateriales