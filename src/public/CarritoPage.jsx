import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'

const CarritoPage = () => {
    const navigate = useNavigate()
    const [cart, setCart] = useState([])
    const [showContactModal, setShowContactModal] = useState(false)
    const [customerData, setCustomerData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: ''
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

    // Cargar carrito al inicializar
    useEffect(() => {
        const initialCart = loadCartFromStorage()
        setCart(initialCart)
    }, [])

    // Escuchar eventos de actualización del carrito
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
            saveCartToStorage(newCart)
        }
    }

    const removeFromCart = (materialId) => {
        const newCart = cart.filter(item => item.id !== materialId)
        setCart(newCart)
        saveCartToStorage(newCart)
    }

    const clearCart = () => {
        setCart([])
        localStorage.removeItem(CART_STORAGE_KEY)
        window.dispatchEvent(new Event('cartUpdated'))
    }

    const getTotal = () => {
        return cart.reduce((total, item) => total + (item.precio * item.cantidad), 0)
    }

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.cantidad, 0)
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    const generateWhatsAppMessage = () => {
        const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '593985036066'
        const messagePrefix = process.env.REACT_APP_WHATSAPP_MESSAGE_PREFIX || 'Hola, soy un estudiante de Mediconsa'

        let message = `${messagePrefix}\n\n`
        message += `*DATOS DEL CLIENTE:*\n`
        message += `👤 Nombre: ${customerData.nombre}\n`
        message += `📧 Email: ${customerData.email}\n`
        if (customerData.telefono) message += `📞 Teléfono: ${customerData.telefono}\n`

        message += `\n*MATERIALES SOLICITADOS:*\n`

        cart.forEach((item, index) => {
            const subtotal = item.precio * item.cantidad
            message += `${index + 1}. ${item.titulo}\n`
            message += `   💰 ${formatPrice(item.precio)} x ${item.cantidad} = ${formatPrice(subtotal)}\n`
            if (item.categoria) message += `   🏷️ Categoría: ${item.categoria}\n`
            message += `\n`
        })

        message += `*RESUMEN:*\n`
        message += `📦 Total de items: ${getTotalItems()}\n`
        message += `💵 Total a pagar: ${formatPrice(getTotal())}\n\n`

        if (customerData.mensaje.trim()) {
            message += `*Mensaje adicional:*\n${customerData.mensaje}\n\n`
        }

        message += `Espero su respuesta para coordinar la entrega. ¡Gracias! 🙏`

        const encodedMessage = encodeURIComponent(message)
        return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    }

    const handleWhatsAppContact = () => {
        if (!customerData.nombre.trim() || !customerData.email.trim()) {
            alert('Por favor completa al menos tu nombre y email')
            return
        }

        if (cart.length === 0) {
            alert('Tu carrito está vacío')
            return
        }

        const whatsappUrl = generateWhatsAppMessage()
        window.open(whatsappUrl, '_blank')
        setShowContactModal(false)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setCustomerData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <Layout>
            <div className="min-h-screen bg-medico-light py-12">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-medico-blue mb-4 flex items-center justify-center space-x-3">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
                            </svg>
                            <span>Mi Carrito de Compras</span>
                        </h1>
                        <p className="text-medico-gray">
                            Revisa tus materiales y procede al contacto por WhatsApp
                        </p>
                    </div>

                    {cart.length === 0 ? (
                        /* Carrito vacío */
                        <div className="text-center py-12">
                            <svg className="w-24 h-24 mx-auto text-gray-400 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
                            <p className="text-gray-500 mb-6">
                                Explora nuestros materiales premium y agrega algunos al carrito
                            </p>
                            <button
                                onClick={() => navigate('/materiales')}
                                className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Ver Materiales
                            </button>
                        </div>
                    ) : (
                        /* Carrito con items */
                        <div className="space-y-8">

                            {/* Sección del Carrito */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Items en tu carrito ({getTotalItems()})
                                    </h2>
                                    <button
                                        onClick={clearCart}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Limpiar carrito</span>
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                            {/* Imagen */}
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                {item.imagen_url ? (
                                                    <img
                                                        src={item.imagen_url}
                                                        alt={item.titulo}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 truncate">{item.titulo}</h3>
                                                {item.categoria && (
                                                    <p className="text-sm text-gray-600 flex items-center mt-1">
                                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                        {item.categoria}
                                                    </p>
                                                )}
                                                <p className="text-sm text-medico-blue font-medium mt-1">
                                                    {formatPrice(item.precio)} c/u
                                                </p>
                                            </div>

                                            {/* Cantidad */}
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                                                    className="w-8 h-8 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                                    </svg>
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.cantidad}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                                                    className="w-8 h-8 bg-medico-blue text-white rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="text-right min-w-0">
                                                <p className="font-semibold text-gray-900">
                                                    {formatPrice(item.precio * item.cantidad)}
                                                </p>
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-red-600 hover:text-red-700 text-sm flex items-center space-x-1 mt-1"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    <span>Eliminar</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Resumen del carrito */}
                                <div className="border-t pt-6 mt-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Items ({getTotalItems()}):</span>
                                                <span>{formatPrice(getTotal())}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Envío:</span>
                                                <span className="text-green-600">A coordinar</span>
                                            </div>
                                            <div className="border-t pt-2">
                                                <div className="flex justify-between font-semibold text-lg">
                                                    <span>Total:</span>
                                                    <span className="text-medico-blue">{formatPrice(getTotal())}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón para abrir modal de contacto */}
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowContactModal(true)}
                                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 text-lg font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                        </svg>
                                        <span>Contactar por WhatsApp</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal de Contacto por WhatsApp */}
                {showContactModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            {/* Header del Modal */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                    <span>Contacto por WhatsApp</span>
                                </h3>
                                <button
                                    onClick={() => setShowContactModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Contenido del Modal */}
                            <div className="p-6">
                                <p className="text-sm text-gray-600 mb-6">
                                    Completa tus datos y te contactaremos por WhatsApp para coordinar la entrega de tus materiales.
                                </p>

                                {/* Formulario */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nombre completo *
                                        </label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={customerData.nombre}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="Tu nombre completo"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={customerData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="tu@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Teléfono (opcional)
                                        </label>
                                        <input
                                            type="tel"
                                            name="telefono"
                                            value={customerData.telefono}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="0999999999"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mensaje adicional (opcional)
                                        </label>
                                        <textarea
                                            name="mensaje"
                                            value={customerData.mensaje}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="Algún comentario adicional..."
                                        />
                                    </div>
                                </div>

                                {/* Resumen del pedido */}
                                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Resumen del pedido:</h4>
                                    <div className="space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Items ({getTotalItems()}):</span>
                                            <span>{formatPrice(getTotal())}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Envío:</span>
                                            <span className="text-green-600">A coordinar</span>
                                        </div>
                                        <div className="border-t pt-2 mt-2">
                                            <div className="flex justify-between font-semibold">
                                                <span>Total:</span>
                                                <span className="text-medico-blue">{formatPrice(getTotal())}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones del Modal */}
                                <div className="flex space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowContactModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleWhatsAppContact}
                                        disabled={!customerData.nombre.trim() || !customerData.email.trim()}
                                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                        </svg>
                                        <span>Contactar</span>
                                    </button>
                                </div>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    Al contactar aceptas nuestros términos de servicio
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default CarritoPage