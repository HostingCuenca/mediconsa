// src/admin/AdminPayments.jsx - Gestión de pagos pendientes
import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import enrollmentsService from '../services/enrollments'

const AdminPayments = () => {
    const [pagosPendientes, setPagosPendientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [procesando, setProcesando] = useState({})

    useEffect(() => {
        cargarPagosPendientes()
    }, [])

    const cargarPagosPendientes = async () => {
        try {
            setLoading(true)
            const response = await enrollmentsService.getPendingPayments()

            if (response.success) {
                setPagosPendientes(response.pagosPendientes)
            } else {
                setError(response.error || 'Error cargando pagos pendientes')
            }
        } catch (error) {
            setError('Error de conexión')
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const aprobarPago = async (inscripcionId) => {
        try {
            setProcesando(prev => ({ ...prev, [inscripcionId]: true }))

            const response = await enrollmentsService.approvePayment(inscripcionId)

            if (response.success) {
                // Remover de la lista de pendientes
                setPagosPendientes(prev => prev.filter(pago => pago.id !== inscripcionId))

                // Mostrar mensaje de éxito
                alert(response.message || 'Pago aprobado exitosamente')
            } else {
                alert(response.error || 'Error aprobando pago')
            }
        } catch (error) {
            alert('Error de conexión')
            console.error('Error:', error)
        } finally {
            setProcesando(prev => ({ ...prev, [inscripcionId]: false }))
        }
    }

    const generarMensajeWhatsApp = (pago) => {
        const mensaje = `Hola ${pago.nombre_completo}, tu pago para el curso "${pago.curso_titulo}" ha sido aprobado. Ya tienes acceso completo. ¡Éxitos en tu preparación! 🎓`
        const numero = process.env.REACT_APP_WHATSAPP_NUMBER || '593985036066'
        return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
    }

    const diasPendiente = (fechaInscripcion) => {
        const fecha = new Date(fechaInscripcion)
        const ahora = new Date()
        const diferencia = Math.floor((ahora - fecha) / (1000 * 60 * 60 * 24))
        return diferencia
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Pagos Pendientes</h1>
                    <p className="text-medico-gray mt-2">
                        Gestiona y aprueba los pagos de inscripciones pendientes
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Total Pendientes</p>
                                <p className="text-2xl font-bold text-yellow-600">{pagosPendientes.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Valor Total</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ${pagosPendientes.reduce((sum, pago) => sum + (pago.precio || 0), 0).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Más Antiguos</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {Math.max(...pagosPendientes.map(p => diasPendiente(p.fecha_inscripcion)), 0)} días
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={cargarPagosPendientes}
                            className="mt-2 text-red-700 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Payments List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8">
                            <div className="animate-pulse space-y-4">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                        <div className="h-10 bg-gray-200 rounded w-24"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {pagosPendientes.map((pago) => (
                                <div key={pago.id} className="p-6 hover:bg-medico-light transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-medico-blue rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-semibold">
                                                    {pago.nombre_completo?.charAt(0) || 'U'}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {pago.nombre_completo}
                                                </h3>
                                                <p className="text-sm text-medico-gray mb-1">
                                                    {pago.email} • @{pago.nombre_usuario}
                                                </p>
                                                <p className="text-sm font-medium text-medico-blue">
                                                    {pago.curso_titulo}
                                                </p>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <span className="text-lg font-bold text-medico-green">
                                                        ${pago.precio}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        diasPendiente(pago.fecha_inscripcion) > 7
                                                            ? 'bg-red-100 text-red-800'
                                                            : diasPendiente(pago.fecha_inscripcion) > 3
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {diasPendiente(pago.fecha_inscripcion)} días pendiente
                                                    </span>
                                                    <span className="text-xs text-medico-gray">
                                                        Inscrito: {new Date(pago.fecha_inscripcion).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            {/* WhatsApp Button */}
                                            <a
                                                href={generarMensajeWhatsApp(pago)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 border border-medico-green text-medico-green rounded-lg hover:bg-green-50 transition-colors flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                                </svg>
                                                <span className="hidden sm:inline">Notificar</span>
                                            </a>

                                            {/* Approve Button */}
                                            <button
                                                onClick={() => aprobarPago(pago.id)}
                                                disabled={procesando[pago.id]}
                                                className="bg-medico-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                            >
                                                {procesando[pago.id] ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        <span>Procesando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>Aprobar</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {!loading && pagosPendientes.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">¡Todo al día!</h3>
                        <p className="text-medico-gray">No hay pagos pendientes por aprobar</p>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Instrucciones</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Notificar:</strong> Envía un mensaje de WhatsApp confirmando el pago</li>
                        <li>• <strong>Aprobar:</strong> Habilita el acceso inmediato al curso</li>
                        <li>• <strong>Días pendientes:</strong> Tiempo desde la inscripción</li>
                        <li>• Los pagos antiguos aparecen en rojo para mayor atención</li>
                    </ul>
                </div>
            </div>
        </Layout>
    )
}

export default AdminPayments