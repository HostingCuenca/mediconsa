import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'

const MaterialesPublic = () => {
    const navigate = useNavigate()
    const [materiales, setMateriales] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cart, setCart] = useState([])
    const [showInfo, setShowInfo] = useState(false)

    const [filters, setFilters] = useState({
        search: '',
        categoria: '',
        tipo: 'premium',
        precio: ''
    })

    const CART_STORAGE_KEY = 'mediconsa_cart'

    // ============= FUNCIONES DEL CARRITO =============
    const loadCartFromStorage = () => {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY)
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart)
                return Array.isArray(parsedCart) ? parsedCart : []
            }
        } catch (error) {
            console.error('Error parseando carrito desde localStorage:', error)
            localStorage.removeItem(CART_STORAGE_KEY)
        }
        return []
    }

    const saveCartToStorage = (cartItems) => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
            // Disparar evento personalizado para notificar cambios
            window.dispatchEvent(new Event('cartUpdated'))
        } catch (error) {
            console.error('Error guardando carrito en localStorage:', error)
        }
    }

    // Cargar carrito al inicializar (SOLO UNA VEZ)
    useEffect(() => {
        const initialCart = loadCartFromStorage()
        setCart(initialCart)
    }, []) // Sin dependencias para evitar recargas

    // Escuchar cambios del carrito desde otros componentes
    useEffect(() => {
        const handleCartUpdate = () => {
            const updatedCart = loadCartFromStorage()
            setCart(updatedCart)
        }

        window.addEventListener('cartUpdated', handleCartUpdate)
        window.addEventListener('storage', handleCartUpdate)

        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate)
            window.removeEventListener('storage', handleCartUpdate)
        }
    }, [])

    // Guardar carrito cuando cambie (IMPORTANTE: solo guardar, no recargar)
    useEffect(() => {
        // Solo guardar si hay cambios reales
        const currentCart = loadCartFromStorage()
        if (JSON.stringify(currentCart) !== JSON.stringify(cart)) {
            saveCartToStorage(cart)
        }
    }, [cart])

    useEffect(() => {
        loadMateriales()
    }, [])

    const loadMateriales = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await materialServices.getMarketplaceMaterials({
                limit: 100,
                tipo: 'premium'
            })

            if (result.success) {
                const materialesPublicos = (result.data.materiales || []).filter(
                    material => material.visible_publico && material.tipo_material === 'premium'
                )
                setMateriales(materialesPublicos)
            } else {
                setError(result.error || 'Error cargando materiales')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const filteredMateriales = materiales.filter(material => {
        const matchSearch = material.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
            material.descripcion?.toLowerCase().includes(filters.search.toLowerCase())
        const matchCategoria = !filters.categoria || material.categoria === filters.categoria
        const matchPrecio = !filters.precio ||
            (filters.precio === 'gratis' && (material.es_gratuito || material.precio === 0)) ||
            (filters.precio === 'pago' && !material.es_gratuito && material.precio > 0)

        return matchSearch && matchCategoria && matchPrecio
    })

    const addToCart = (material) => {
        const newCart = [...cart]
        const existingItemIndex = newCart.findIndex(item => item.id === material.id)

        if (existingItemIndex >= 0) {
            // Si ya existe, incrementar cantidad
            newCart[existingItemIndex] = {
                ...newCart[existingItemIndex],
                cantidad: newCart[existingItemIndex].cantidad + 1
            }
        } else {
            // Si no existe, agregar nuevo item
            newCart.push({
                id: material.id,
                titulo: material.titulo,
                descripcion: material.descripcion,
                precio: material.precio,
                categoria: material.categoria,
                imagen_url: material.imagen_url,
                tipo_material: material.tipo_material,
                cantidad: 1
            })
        }

        setCart(newCart)
    }

    const removeFromCart = (materialId) => {
        const newCart = cart.filter(item => item.id !== materialId)
        setCart(newCart)
    }

    const updateQuantity = (materialId, cantidad) => {
        if (cantidad <= 0) {
            removeFromCart(materialId)
        } else {
            const newCart = cart.map(item =>
                item.id === materialId
                    ? { ...item, cantidad }
                    : item
            )
            setCart(newCart)
        }
    }

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0)
    }

    const getCartCount = () => {
        return cart.reduce((total, item) => total + item.cantidad, 0)
    }

    const isInCart = (materialId) => {
        return cart.some(item => item.id === materialId)
    }

    const getItemQuantity = (materialId) => {
        const item = cart.find(item => item.id === materialId)
        return item ? item.cantidad : 0
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    const getCategorias = () => {
        const categoriasUnicas = [...new Set(materiales
            .map(m => m.categoria)
            .filter(Boolean)
        )]
        return categoriasUnicas.sort()
    }

    // Estadísticas para mostrar
    const getEstadisticas = () => {
        return {
            total: materiales.length,
            categorias: getCategorias().length,
            promedioPrecio: materiales.length > 0
                ? materiales.reduce((sum, m) => sum + (m.precio || 0), 0) / materiales.length
                : 0,
            gratuitos: materiales.filter(m => m.es_gratuito || m.precio === 0).length
        }
    }

    const stats = getEstadisticas()

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-medico-light flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando materiales...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-medico-light">

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-medico-blue via-blue-700 to-blue-900 text-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h1 className="text-5xl font-bold mb-6">
                                Materiales Premium
                                <span className="block text-blue-200 text-3xl font-normal mt-2">
                                    Educación Médica de Calidad
                                </span>
                            </h1>
                            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
                                Accede a nuestra colección exclusiva de materiales médicos premium.
                                Contenido actualizado, verificado por profesionales y diseñado para tu éxito académico.
                            </p>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-3xl font-bold">{stats.total}</div>
                                    <div className="text-blue-200 text-sm">Materiales</div>
                                </div>
                                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-3xl font-bold">{stats.categorias}</div>
                                    <div className="text-blue-200 text-sm">Categorías</div>
                                </div>
                                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-3xl font-bold">{formatPrice(stats.promedioPrecio)}</div>
                                    <div className="text-blue-200 text-sm">Precio Promedio</div>
                                </div>
                                <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
                                    <div className="text-3xl font-bold">{getCartCount()}</div>
                                    <div className="text-blue-200 text-sm">En tu Carrito</div>
                                </div>
                            </div>

                            {/* Botón de información */}
                            <div className="mt-8">
                                <button
                                    onClick={() => setShowInfo(!showInfo)}
                                    className="bg-white text-medico-blue px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium flex items-center space-x-2 mx-auto"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>¿Cómo funciona?</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Información expandible */}
                {showInfo && (
                    <div className="bg-blue-50 border-b border-blue-200 py-8">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-medico-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">1. Explora</h3>
                                    <p className="text-sm text-gray-600">
                                        Navega por nuestra colección de materiales premium organizados por categorías
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-medico-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">2. Agrega al Carrito</h3>
                                    <p className="text-sm text-gray-600">
                                        Selecciona los materiales que necesitas y agrégalos a tu carrito de compras
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">3. Contacta por WhatsApp</h3>
                                    <p className="text-sm text-gray-600">
                                        Completa tu información y te contactaremos para coordinar la entrega
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contenido principal */}
                <div className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Indicador del carrito */}
                        {cart.length > 0 && (
                            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
                                        </svg>
                                        <span className="text-green-800">
                                            <strong>{getCartCount()} materiales</strong> en tu carrito
                                        </span>
                                        <span className="text-green-600">
                                            Total: <strong>{formatPrice(getCartTotal())}</strong>
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => navigate('/carrito')}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Ver Carrito
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-red-600">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Filtros mejorados */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Filtrar Materiales</h2>
                                <span className="text-sm text-gray-500">
                                    {filteredMateriales.length} de {materiales.length} materiales
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        Buscar
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Buscar materiales..."
                                        value={filters.search}
                                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Categoría
                                    </label>
                                    <select
                                        value={filters.categoria}
                                        onChange={(e) => setFilters(prev => ({ ...prev, categoria: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value="">Todas las categorías</option>
                                        {getCategorias().map(categoria => (
                                            <option key={categoria} value={categoria}>{categoria}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                        Precio
                                    </label>
                                    <select
                                        value={filters.precio}
                                        onChange={(e) => setFilters(prev => ({ ...prev, precio: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        <option value="">Todos los precios</option>
                                        <option value="pago">De pago</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <button
                                        onClick={() => setFilters({ search: '', categoria: '', tipo: 'premium', precio: '' })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Limpiar</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Carrito flotante */}
                        {cart.length > 0 && (
                            <div className="fixed bottom-6 right-6 z-50">
                                <button
                                    onClick={() => navigate('/carrito')}
                                    className="bg-medico-blue text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105"
                                >
                                    <div className="relative">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
                                        </svg>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                            {getCartCount()}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        )}

                        {/* Grid de materiales */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredMateriales.map((material) => (
                                <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                    {/* Imagen */}
                                    {material.imagen_url && (
                                        <div className="h-48 bg-gray-100 relative overflow-hidden">
                                            <img
                                                src={material.imagen_url}
                                                alt={material.titulo}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                }}
                                            />
                                            {/* Overlay con precio */}
                                            <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-1">
                                                <span className="text-lg font-bold text-medico-blue">
                                                    {formatPrice(material.precio)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span>Premium</span>
                                            </span>
                                            {isInCart(material.id) && (
                                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    En carrito
                                                </span>
                                            )}
                                        </div>

                                        {/* Título */}
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{material.titulo}</h3>

                                        {/* Descripción */}
                                        {material.descripcion && (
                                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                                {material.descripcion}
                                            </p>
                                        )}

                                        {/* Info adicional */}
                                        <div className="space-y-2 mb-4">
                                            {material.categoria && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                    </svg>
                                                    <span>{material.categoria}</span>
                                                </div>
                                            )}

                                            {material.stock_disponible !== -1 && (
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                    </svg>
                                                    <span>{material.stock_disponible} disponibles</span>
                                                </div>
                                            )}

                                            {/* Fecha de actualización simulada */}
                                            <div className="flex items-center text-sm text-gray-500">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>Actualizado recientemente</span>
                                            </div>
                                        </div>

                                        {/* Botones */}
                                        <div className="space-y-3">
                                            {isInCart(material.id) ? (
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => updateQuantity(material.id, getItemQuantity(material.id) - 1)}
                                                        className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                        </svg>
                                                    </button>
                                                    <div className="flex-1 text-center">
                                                       <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                                           {getItemQuantity(material.id)} en carrito
                                                       </span>
                                                    </div>
                                                    <button
                                                        onClick={() => updateQuantity(material.id, getItemQuantity(material.id) + 1)}
                                                        className="w-10 h-10 bg-medico-blue text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => addToCart(material)}
                                                    className="w-full bg-medico-blue text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
                                                    </svg>
                                                    <span>Agregar al Carrito</span>
                                                </button>
                                            )}

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => window.open(material.archivo_url, '_blank')}
                                                    className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>Vista Previa</span>
                                                </button>
                                                <button
                                                    className="bg-blue-50 text-medico-blue py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>Detalles</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {filteredMateriales.length === 0 && !loading && (
                            <div className="text-center py-16">
                                <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                    {materiales.length === 0 ? 'No hay materiales disponibles' : 'No se encontraron materiales'}
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    {materiales.length === 0
                                        ? 'Los materiales premium aparecerán aquí cuando estén disponibles. Mantente al tanto de nuestras actualizaciones.'
                                        : 'Intenta ajustar tus filtros de búsqueda para encontrar materiales que coincidan con tus criterios.'
                                    }
                                </p>
                                {materiales.length === 0 ? (
                                    <button
                                        onClick={() => navigate('/cursos')}
                                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Ver Cursos Disponibles
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setFilters({ search: '', categoria: '', tipo: 'premium', precio: '' })}
                                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Limpiar Filtros
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Sección de beneficios */}
                        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    ¿Por qué elegir nuestros materiales premium?
                                </h2>
                                <p className="text-gray-600 max-w-2xl mx-auto">
                                    Nuestros materiales están diseñados por profesionales médicos para garantizar
                                    la mejor calidad educativa y preparación profesional.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-medico-blue text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contenido Verificado</h3>
                                    <p className="text-gray-600 text-sm">
                                        Todos nuestros materiales son revisados y validados por profesionales médicos certificados
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Siempre Actualizado</h3>
                                    <p className="text-gray-600 text-sm">
                                        Mantenemos nuestro contenido actualizado con las últimas investigaciones y protocolos médicos
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Soporte Continuo</h3>
                                    <p className="text-gray-600 text-sm">
                                        Ofrecemos soporte y asistencia para maximizar tu experiencia de aprendizaje
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonios */}
                        <div className="mt-16">
                            <div className="text-center mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    Lo que dicen nuestros estudiantes
                                </h2>
                                <p className="text-gray-600">
                                    Testimonios reales de estudiantes que han utilizado nuestros materiales
                                </p>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center space-x-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 italic">
                                        "Los materiales de Mediconsa me ayudaron enormemente en mi preparación.
                                        El contenido es muy completo y actualizado."
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-medico-blue text-white rounded-full flex items-center justify-center">
                                            <span className="text-sm font-semibold">AM</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Ana María</p>
                                            <p className="text-sm text-gray-500">Estudiante de Medicina</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center space-x-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 italic">
                                        "Excelente calidad de materiales. La organización por categorías
                                        hace muy fácil encontrar lo que necesito."
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center">
                                            <span className="text-sm font-semibold">CR</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Carlos Rodríguez</p>
                                            <p className="text-sm text-gray-500">Residente</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center space-x-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 italic">
                                        "La atención al cliente es excelente. Resuelven todas mis dudas
                                        rápidamente por WhatsApp."
                                    </p>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                                            <span className="text-sm font-semibold">LG</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Laura González</p>
                                            <p className="text-sm text-gray-500">Enfermería</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        {cart.length === 0 && (
                            <div className="mt-16 bg-medico-blue rounded-2xl p-8 text-center text-white">
                                <h2 className="text-2xl font-bold mb-4">
                                    ¿Listo para comenzar tu aprendizaje?
                                </h2>
                                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                    Explora nuestros materiales premium y comienza a construir tu futuro profesional
                                    con contenido de la más alta calidad.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button className="bg-white text-medico-blue px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium">
                                        Ver Todos los Materiales
                                    </button>
                                    <button
                                        onClick={() => navigate('/cursos')}
                                        className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-medico-blue transition-colors font-medium"
                                    >
                                        Explorar Cursos
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default MaterialesPublic