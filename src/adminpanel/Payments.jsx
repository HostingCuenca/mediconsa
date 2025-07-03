// // src/adminpanel/Payments.jsx - GESTIÓN COMPLETA DE INSCRIPCIONES
// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Layout from '../utils/Layout'
// import enrollmentsService from '../services/enrollments'
//
// const AdminPayments = () => {
//     const navigate = useNavigate()
//
//     // ========== ESTADOS PRINCIPALES ==========
//     const [payments, setPayments] = useState([])
//     const [paymentStats, setPaymentStats] = useState({})
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//     const [success, setSuccess] = useState('')
//
//     // Estados para modales/formularios
//     const [showViewModal, setShowViewModal] = useState(false)
//     const [showApproveConfirm, setShowApproveConfirm] = useState(false)
//     const [showRejectConfirm, setShowRejectConfirm] = useState(false)
//     const [selectedPayment, setSelectedPayment] = useState(null)
//     const [formLoading, setFormLoading] = useState(false)
//     const [rejectReason, setRejectReason] = useState('')
//
//     // Estados de filtros y búsqueda
//     const [filters, setFilters] = useState({
//         search: '',
//         estado: '',
//         curso: '',
//         page: 1,
//         limit: 20
//     })
//     const [pagination, setPagination] = useState({})
//
//     // ========== CONFIGURACIONES ACTUALIZADAS ==========
//     const estadosPago = [
//         { value: '', label: 'Todas las inscripciones' },
//         { value: 'pendiente', label: 'Pendientes' },
//         { value: 'habilitado', label: 'Habilitadas' },
//         { value: 'rechazado', label: 'Rechazadas' }
//     ]
//
//     // ========== EFECTOS ==========
//     useEffect(() => {
//         loadPayments()
//     }, [filters])
//
//     useEffect(() => {
//         if (success) {
//             const timer = setTimeout(() => setSuccess(''), 3000)
//             return () => clearTimeout(timer)
//         }
//     }, [success])
//
//     // ========== FUNCIONES DE CARGA ACTUALIZADAS ==========
//     const loadPayments = async () => {
//         try {
//             setLoading(true)
//             setError('')
//
//             // ✅ CAMBIO PRINCIPAL: Usar getAllEnrollments
//             const result = await enrollmentsService.getAllEnrollments(filters)
//
//             if (result.success) {
//                 setPayments(result.data.inscripciones || [])
//                 setPagination(result.data.pagination || {})
//
//                 // Calcular estadísticas locales
//                 calculateLocalStats(result.data.inscripciones || [])
//             } else {
//                 setError(result.error || 'Error cargando inscripciones')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error de conexión')
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     // ========== NUEVA FUNCIÓN: CALCULAR ESTADÍSTICAS ==========
//     const calculateLocalStats = (inscripciones) => {
//         const stats = {
//             total: inscripciones.length,
//             pendientes: 0,
//             habilitadas: 0,
//             rechazadas: 0,
//             gratuitas: 0,
//             pagadas: 0,
//             ingresosTotales: 0,
//             ingresosPendientes: 0
//         }
//
//         inscripciones.forEach(inscripcion => {
//             // Contar por estado
//             if (inscripcion.estado_pago === 'pendiente') stats.pendientes++
//             if (inscripcion.estado_pago === 'habilitado') stats.habilitadas++
//             if (inscripcion.estado_pago === 'rechazado') stats.rechazadas++
//
//             // Contar por tipo
//             if (inscripcion.es_gratuito) {
//                 stats.gratuitas++
//             } else {
//                 stats.pagadas++
//
//                 // Calcular ingresos
//                 const precio = parseFloat(inscripcion.precio) || 0
//                 if (inscripcion.estado_pago === 'habilitado') {
//                     stats.ingresosTotales += precio
//                 } else if (inscripcion.estado_pago === 'pendiente') {
//                     stats.ingresosPendientes += precio
//                 }
//             }
//         })
//
//         setPaymentStats(stats)
//     }
//
//     // ========== FUNCIONES DE FILTROS ==========
//     const handleFilterChange = (e) => {
//         const { name, value } = e.target
//         setFilters(prev => ({
//             ...prev,
//             [name]: value,
//             page: 1 // Reset página al cambiar filtros
//         }))
//     }
//
//     const clearFilters = () => {
//         setFilters({
//             search: '',
//             estado: '',
//             curso: '',
//             page: 1,
//             limit: 20
//         })
//     }
//
//     // ========== ACCIONES DE PAGO ==========
//     const handleViewPayment = (payment) => {
//         setSelectedPayment(payment)
//         setShowViewModal(true)
//     }
//
//     const handleApprovePayment = (payment) => {
//         setSelectedPayment(payment)
//         setShowApproveConfirm(true)
//     }
//
//     const handleRejectPayment = (payment) => {
//         setSelectedPayment(payment)
//         setRejectReason('')
//         setShowRejectConfirm(true)
//     }
//
//     const confirmApprovePayment = async () => {
//         if (!selectedPayment) return
//
//         try {
//             setFormLoading(true)
//             const result = await enrollmentsService.approvePayment(selectedPayment.id)
//
//             if (result.success) {
//                 setShowApproveConfirm(false)
//                 setSelectedPayment(null)
//                 await loadPayments()
//                 setSuccess(result.message || 'Pago aprobado exitosamente')
//             } else {
//                 setError(result.error || 'Error aprobando el pago')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error de conexión al aprobar el pago')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//
//     const confirmRejectPayment = async () => {
//         if (!selectedPayment || !rejectReason.trim()) {
//             setError('Debe proporcionar un motivo de rechazo')
//             return
//         }
//
//         try {
//             setFormLoading(true)
//             // Nota: Este método necesitaría implementarse en el servicio
//             // const result = await enrollmentsService.rejectPayment?.(selectedPayment.id, {
//             //     motivo: rejectReason
//             // }) || { success: false, error: 'Método no implementado' }
//
//             const result = { success: false, error: 'Función de rechazo no implementada aún' }
//
//             if (result.success) {
//                 setShowRejectConfirm(false)
//                 setSelectedPayment(null)
//                 setRejectReason('')
//                 await loadPayments()
//                 setSuccess(result.message || 'Pago rechazado exitosamente')
//             } else {
//                 setError(result.error || 'Error rechazando el pago')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error de conexión al rechazar el pago')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//
//     // ========== FUNCIONES DE PAGINACIÓN ==========
//     const handlePageChange = (newPage) => {
//         setFilters(prev => ({
//             ...prev,
//             page: newPage
//         }))
//     }
//
//     // ========== FUNCIONES DE UTILIDAD ==========
//     const formatDate = (dateString) => {
//         if (!dateString) return 'No registrado'
//         return new Date(dateString).toLocaleDateString('es-ES', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         })
//     }
//
//     const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('es-EC', {
//             style: 'currency',
//             currency: 'USD'
//         }).format(amount)
//     }
//
//     const getStatusColor = (status) => {
//         const colors = {
//             'pendiente': 'bg-yellow-100 text-yellow-800',
//             'habilitado': 'bg-green-100 text-green-800',
//             'rechazado': 'bg-red-100 text-red-800'
//         }
//         return colors[status] || 'bg-gray-100 text-gray-800'
//     }
//
//     const getStatusText = (status) => {
//         const labels = {
//             'pendiente': 'Pendiente',
//             'habilitado': 'Habilitado',
//             'rechazado': 'Rechazado'
//         }
//         return labels[status] || status
//     }
//
//     const generateWhatsAppURL = (phoneNumber, message) => {
//         const encodedMessage = encodeURIComponent(message)
//         return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
//     }
//
//     // ========== RENDER ==========
//     return (
//         <Layout showSidebar={true}>
//             <div className="p-8">
//                 {/* ========== HEADER ACTUALIZADO ========== */}
//                 <div className="flex justify-between items-center mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold text-medico-blue">Gestión de Inscripciones</h1>
//                         <p className="text-medico-gray mt-2">Administra todas las inscripciones de la plataforma</p>
//                     </div>
//                 </div>
//
//                 {/* ========== MENSAJES ========== */}
//                 {error && (
//                     <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
//                         <div className="flex items-center">
//                             <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <p className="text-red-600">{error}</p>
//                         </div>
//                         <button
//                             onClick={() => setError('')}
//                             className="mt-2 text-red-700 underline hover:no-underline text-sm"
//                         >
//                             Cerrar
//                         </button>
//                     </div>
//                 )}
//
//                 {success && (
//                     <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
//                         <div className="flex items-center">
//                             <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <p className="text-green-600">{success}</p>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* ========== ESTADÍSTICAS ACTUALIZADAS ========== */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-900">Total Inscripciones</h3>
//                                 <p className="text-3xl font-bold text-medico-blue">{paymentStats.total || 0}</p>
//                             </div>
//                             <div className="bg-medico-blue bg-opacity-10 rounded-full p-3">
//                                 <svg className="w-8 h-8 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-900">Pendientes</h3>
//                                 <p className="text-3xl font-bold text-yellow-600">{paymentStats.pendientes || 0}</p>
//                             </div>
//                             <div className="bg-yellow-100 rounded-full p-3">
//                                 <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-900">Habilitadas</h3>
//                                 <p className="text-3xl font-bold text-green-600">{paymentStats.habilitadas || 0}</p>
//                             </div>
//                             <div className="bg-green-100 rounded-full p-3">
//                                 <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-gray-900">Ingresos Totales</h3>
//                                 <p className="text-3xl font-bold text-purple-600">{formatCurrency(paymentStats.ingresosTotales || 0)}</p>
//                             </div>
//                             <div className="bg-purple-100 rounded-full p-3">
//                                 <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//                                 </svg>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* ========== FILTROS ========== */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
//                             <input
//                                 type="text"
//                                 name="search"
//                                 value={filters.search}
//                                 onChange={handleFilterChange}
//                                 placeholder="Usuario, email, curso..."
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                             />
//                         </div>
//
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
//                             <select
//                                 name="estado"
//                                 value={filters.estado}
//                                 onChange={handleFilterChange}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                             >
//                                 {estadosPago.map(estado => (
//                                     <option key={estado.value} value={estado.value}>{estado.label}</option>
//                                 ))}
//                             </select>
//                         </div>
//
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
//                             <input
//                                 type="text"
//                                 name="curso"
//                                 value={filters.curso}
//                                 onChange={handleFilterChange}
//                                 placeholder="Nombre del curso..."
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                             />
//                         </div>
//
//                         <div className="flex items-end">
//                             <button
//                                 onClick={clearFilters}
//                                 className="w-full px-3 py-2 text-medico-blue border border-medico-blue rounded-lg hover:bg-medico-blue hover:text-white transition-colors"
//                             >
//                                 Limpiar Filtros
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* ========== LISTA DE INSCRIPCIONES ========== */}
//                 {loading ? (
//                     <div className="flex items-center justify-center py-12">
//                         <div className="text-center">
//                             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
//                             <p className="mt-4 text-medico-gray">Cargando inscripciones...</p>
//                         </div>
//                     </div>
//                 ) : (
//                     <>
//                         {payments.length > 0 ? (
//                             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                                 {/* Tabla de inscripciones */}
//                                 <div className="overflow-x-auto">
//                                     <table className="min-w-full divide-y divide-gray-200">
//                                         <thead className="bg-gray-50">
//                                         <tr>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                 Estudiante
//                                             </th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                 Curso
//                                             </th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                 Precio
//                                             </th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                 Fecha Inscripción
//                                             </th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                 Estado
//                                             </th>
//                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                 Acciones
//                                             </th>
//                                         </tr>
//                                         </thead>
//                                         <tbody className="bg-white divide-y divide-gray-200">
//                                         {payments.map((payment) => (
//                                             <tr key={payment.id} className="hover:bg-gray-50">
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="flex items-center">
//                                                         <div className="flex-shrink-0 h-10 w-10">
//                                                             <div className="h-10 w-10 rounded-full bg-medico-blue flex items-center justify-center">
//                                                                     <span className="text-white font-medium text-sm">
//                                                                         {payment.nombre_completo?.charAt(0)?.toUpperCase() || 'U'}
//                                                                     </span>
//                                                             </div>
//                                                         </div>
//                                                         <div className="ml-4">
//                                                             <div className="text-sm font-medium text-gray-900">
//                                                                 {payment.nombre_completo}
//                                                             </div>
//                                                             <div className="text-sm text-gray-500">
//                                                                 {payment.email}
//                                                             </div>
//                                                             <div className="text-xs text-gray-400">
//                                                                 @{payment.nombre_usuario}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="text-sm font-medium text-gray-900">{payment.curso_titulo}</div>
//                                                     <div className="text-sm text-gray-500 flex items-center gap-2">
//                                                         <span>ID: {payment.id}</span>
//                                                         {payment.es_gratuito && (
//                                                             <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
//                                                                 Gratuito
//                                                             </span>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                     <div className="text-sm font-bold text-medico-blue">
//                                                         {payment.es_gratuito ? 'Gratuito' : formatCurrency(payment.precio)}
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                     {formatDate(payment.fecha_inscripcion)}
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.estado_pago || 'pendiente')}`}>
//                                                             {getStatusText(payment.estado_pago || 'pendiente')}
//                                                         </span>
//                                                 </td>
//                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                     <div className="flex items-center space-x-2">
//                                                         {/* Ver detalles */}
//                                                         <button
//                                                             onClick={() => handleViewPayment(payment)}
//                                                             className="text-medico-blue hover:text-blue-700"
//                                                             title="Ver detalles"
//                                                         >
//                                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                                                             </svg>
//                                                         </button>
//
//                                                         {/* Aprobar pago - Solo si está pendiente */}
//                                                         {payment.estado_pago === 'pendiente' && (
//                                                             <button
//                                                                 onClick={() => handleApprovePayment(payment)}
//                                                                 className="text-green-600 hover:text-green-800"
//                                                                 title="Aprobar pago"
//                                                             >
//                                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                                 </svg>
//                                                             </button>
//                                                         )}
//
//                                                         {/* Rechazar pago - Solo si está pendiente */}
//                                                         {payment.estado_pago === 'pendiente' && (
//                                                             <button
//                                                                 onClick={() => handleRejectPayment(payment)}
//                                                                 className="text-red-600 hover:text-red-800"
//                                                                 title="Rechazar pago"
//                                                             >
//                                                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                                                 </svg>
//                                                             </button>
//                                                         )}
//
//                                                         {/* WhatsApp */}
//                                                         <a
//                                                             href={generateWhatsAppURL('593981833667', `Hola ${payment.nombre_completo}, te contacto sobre tu inscripción al curso "${payment.curso_titulo}".`)}
//                                                             target="_blank"
//                                                             rel="noopener noreferrer"
//                                                             className="text-green-600 hover:text-green-800"
//                                                             title="Contactar por WhatsApp"
//                                                         >
//                                                             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                                                                 <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
//                                                             </svg>
//                                                         </a>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                         </tbody>
//                                     </table>
//                                 </div>
//
//                                 {/* Paginación */}
//                                 {pagination.totalPages > 1 && (
//                                     <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
//                                         <div className="flex-1 flex justify-between sm:hidden">
//                                             <button
//                                                 onClick={() => handlePageChange(pagination.page - 1)}
//                                                 disabled={pagination.page <= 1}
//                                                 className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                                             >
//                                                 Anterior
//                                             </button>
//                                             <button
//                                                 onClick={() => handlePageChange(pagination.page + 1)}
//                                                 disabled={pagination.page >= pagination.totalPages}
//                                                 className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                                             >
//                                                 Siguiente
//                                             </button>
//                                         </div>
//                                         <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                                             <div>
//                                                 <p className="text-sm text-gray-700">
//                                                     Mostrando{' '}
//                                                     <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span>
//                                                     {' '}a{' '}
//                                                     <span className="font-medium">
//                                                         {Math.min(pagination.page * pagination.limit, pagination.total)}
//                                                     </span>
//                                                     {' '}de{' '}
//                                                     <span className="font-medium">{pagination.total}</span>
//                                                     {' '}resultados
//                                                 </p>
//                                             </div>
//                                             <div>
//                                                 <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
//                                                     <button
//                                                         onClick={() => handlePageChange(pagination.page - 1)}
//                                                         disabled={pagination.page <= 1}
//                                                         className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                                                     >
//                                                         <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
//                                                             <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                                                         </svg>
//                                                     </button>
//
//                                                     {/* Páginas */}
//                                                     {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
//                                                         const pageNum = i + 1
//                                                         return (
//                                                             <button
//                                                                 key={pageNum}
//                                                                 onClick={() => handlePageChange(pageNum)}
//                                                                 className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
//                                                                     pageNum === pagination.page
//                                                                         ? 'z-10 bg-medico-blue border-medico-blue text-white'
//                                                                         : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
//                                                                 }`}
//                                                             >
//                                                                 {pageNum}
//                                                             </button>
//                                                         )
//                                                     })}
//
//                                                     <button
//                                                         onClick={() => handlePageChange(pagination.page + 1)}
//                                                         disabled={pagination.page >= pagination.totalPages}
//                                                         className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                                                     >
//                                                         <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
//                                                             <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                                                         </svg>
//                                                     </button>
//                                                 </nav>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         ) : (
//                             <div className="text-center py-12">
//                                 <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                                 </svg>
//                                 <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inscripciones disponibles</h3>
//                                 <p className="text-gray-500 mb-4">
//                                     {filters.search || filters.estado || filters.curso
//                                         ? 'No se encontraron inscripciones con los filtros aplicados'
//                                         : 'No hay inscripciones registradas en el sistema'
//                                     }
//                                 </p>
//                                 <button
//                                     onClick={clearFilters}
//                                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-medico-blue bg-medico-blue bg-opacity-10 hover:bg-opacity-20"
//                                 >
//                                     Limpiar filtros
//                                 </button>
//                             </div>
//                         )}
//                     </>
//                 )}
//
//                 {/* ========== MODAL DE VISUALIZACIÓN ========== */}
//                 {showViewModal && selectedPayment && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-90vh overflow-y-auto">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-2xl font-bold text-medico-blue">Detalles de la Inscripción</h2>
//                                 <button
//                                     onClick={() => setShowViewModal(false)}
//                                     className="text-gray-400 hover:text-gray-600"
//                                 >
//                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 </button>
//                             </div>
//
//                             <div className="space-y-6">
//                                 {/* Información del estudiante */}
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Estudiante</h3>
//                                     <div className="bg-gray-50 rounded-lg p-4">
//                                         <div className="grid grid-cols-2 gap-4 text-sm">
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Nombre:</span>
//                                                 <p className="text-gray-600">{selectedPayment.nombre_completo}</p>
//                                             </div>
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Email:</span>
//                                                 <p className="text-gray-600">{selectedPayment.email}</p>
//                                             </div>
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Usuario:</span>
//                                                 <p className="text-gray-600">@{selectedPayment.nombre_usuario}</p>
//                                             </div>
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Teléfono:</span>
//                                                 <p className="text-gray-600">{selectedPayment.telefono || 'No registrado'}</p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 {/* Información del curso */}
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Curso</h3>
//                                     <div className="bg-gray-50 rounded-lg p-4">
//                                         <div className="grid grid-cols-2 gap-4 text-sm">
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Curso:</span>
//                                                 <p className="text-gray-600">{selectedPayment.curso_titulo}</p>
//                                             </div>
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Tipo:</span>
//                                                 <div className="flex items-center gap-2">
//                                                     <span className="text-gray-600">
//                                                         {selectedPayment.es_gratuito ? 'Gratuito' : formatCurrency(selectedPayment.precio)}
//                                                     </span>
//                                                     {selectedPayment.es_gratuito && (
//                                                         <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
//                                                             Gratuito
//                                                         </span>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Fecha Inscripción:</span>
//                                                 <p className="text-gray-600">{formatDate(selectedPayment.fecha_inscripcion)}</p>
//                                             </div>
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Estado:</span>
//                                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.estado_pago)}`}>
//                                                     {getStatusText(selectedPayment.estado_pago)}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 {/* Información adicional */}
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Adicional</h3>
//                                     <div className="bg-gray-50 rounded-lg p-4">
//                                         <div className="grid grid-cols-2 gap-4 text-sm">
//                                             <div>
//                                                 <span className="font-medium text-gray-700">ID Inscripción:</span>
//                                                 <p className="text-gray-600 font-mono">{selectedPayment.id}</p>
//                                             </div>
//                                             <div>
//                                                 <span className="font-medium text-gray-700">Fecha Habilitación:</span>
//                                                 <p className="text-gray-600">{formatDate(selectedPayment.fecha_habilitacion)}</p>
//                                             </div>
//                                             {selectedPayment.aprobado_por_nombre && (
//                                                 <div className="col-span-2">
//                                                     <span className="font-medium text-gray-700">Aprobado por:</span>
//                                                     <p className="text-gray-600">{selectedPayment.aprobado_por_nombre}</p>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 {/* Mensaje de WhatsApp sugerido */}
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900 mb-3">Mensaje WhatsApp Sugerido</h3>
//                                     <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                                         <p className="text-sm text-green-800">
//                                             {selectedPayment.es_gratuito
//                                                 ? `Hola ${selectedPayment.nombre_completo}, confirmamos tu inscripción al curso gratuito "${selectedPayment.curso_titulo}". Ya tienes acceso completo al contenido.`
//                                                 : `Hola ${selectedPayment.nombre_completo}, te contacto sobre tu inscripción al curso "${selectedPayment.curso_titulo}". El monto a pagar es de ${formatCurrency(selectedPayment.precio)}. ¿Podrías enviarme el comprobante de pago?`
//                                             }
//                                         </p>
//                                         <div className="mt-3">
//                                             <a
//                                                 href={generateWhatsAppURL('593981833667',
//                                                     selectedPayment.es_gratuito
//                                                         ? `Hola ${selectedPayment.nombre_completo}, confirmamos tu inscripción al curso gratuito "${selectedPayment.curso_titulo}". Ya tienes acceso completo al contenido.`
//                                                         : `Hola ${selectedPayment.nombre_completo}, te contacto sobre tu inscripción al curso "${selectedPayment.curso_titulo}". El monto a pagar es de ${formatCurrency(selectedPayment.precio)}. ¿Podrías enviarme el comprobante de pago?`
//                                                 )}
//                                                 target="_blank"
//                                                 rel="noopener noreferrer"
//                                                 className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//                                             >
//                                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                                                     <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
//                                                 </svg>
//                                                 <span>Abrir WhatsApp</span>
//                                             </a>
//                                         </div>
//                                     </div>
//                                 </div>
//
//                                 {/* Acciones */}
//                                 {selectedPayment.estado_pago === 'pendiente' && (
//                                     <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
//                                         <button
//                                             onClick={() => {
//                                                 setShowViewModal(false)
//                                                 handleRejectPayment(selectedPayment)
//                                             }}
//                                             className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                                         >
//                                             Rechazar Pago
//                                         </button>
//                                         <button
//                                             onClick={() => {
//                                                 setShowViewModal(false)
//                                                 handleApprovePayment(selectedPayment)
//                                             }}
//                                             className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                                         >
//                                             Aprobar Pago
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* ========== MODAL DE CONFIRMACIÓN DE APROBACIÓN ========== */}
//                 {showApproveConfirm && selectedPayment && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//                             <div className="mb-4">
//                                 <h3 className="text-lg font-semibold text-gray-900">Confirmar Aprobación</h3>
//                                 <p className="text-gray-600 mt-2">
//                                     ¿Estás seguro de que quieres aprobar el pago de <strong>"{selectedPayment.nombre_completo}"</strong>
//                                     para el curso <strong>"{selectedPayment.curso_titulo}"</strong>?
//                                 </p>
//                                 <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//                                     <p className="text-sm text-green-800">
//                                         <strong>Monto:</strong> {selectedPayment.es_gratuito ? 'Gratuito' : formatCurrency(selectedPayment.precio)}
//                                     </p>
//                                     <p className="text-sm text-green-800">
//                                         El estudiante tendrá acceso inmediato al curso tras la aprobación.
//                                     </p>
//                                 </div>
//                             </div>
//
//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     onClick={() => {
//                                         setShowApproveConfirm(false)
//                                         setSelectedPayment(null)
//                                     }}
//                                     className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancelar
//                                 </button>
//                                 <button
//                                     onClick={confirmApprovePayment}
//                                     disabled={formLoading}
//                                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
//                                 >
//                                     {formLoading && (
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     )}
//                                     <span>{formLoading ? 'Aprobando...' : 'Aprobar Pago'}</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* ========== MODAL DE CONFIRMACIÓN DE RECHAZO ========== */}
//                 {showRejectConfirm && selectedPayment && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//                             <div className="mb-4">
//                                 <h3 className="text-lg font-semibold text-gray-900">Confirmar Rechazo</h3>
//                                 <p className="text-gray-600 mt-2">
//                                     ¿Estás seguro de que quieres rechazar el pago de <strong>"{selectedPayment.nombre_completo}"</strong>?
//                                 </p>
//                             </div>
//
//                             <div className="mb-6">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Motivo del Rechazo *
//                                 </label>
//                                 <textarea
//                                     value={rejectReason}
//                                     onChange={(e) => setRejectReason(e.target.value)}
//                                     rows={3}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                     placeholder="Explica por qué se rechaza el pago..."
//                                 />
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     Este motivo será comunicado al estudiante
//                                 </p>
//                             </div>
//
//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     onClick={() => {
//                                         setShowRejectConfirm(false)
//                                         setSelectedPayment(null)
//                                         setRejectReason('')
//                                     }}
//                                     className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancelar
//                                 </button>
//                                 <button
//                                     onClick={confirmRejectPayment}
//                                     disabled={formLoading || !rejectReason.trim()}
//                                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
//                                 >
//                                     {formLoading && (
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     )}
//                                     <span>{formLoading ? 'Rechazando...' : 'Rechazar Pago'}</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </Layout>
//     )
// }
//
// export default AdminPayments


// src/adminpanel/Payments.jsx - GESTIÓN COMPLETA DE INSCRIPCIONES
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import enrollmentsService from '../services/enrollments'

const AdminPayments = () => {
    const navigate = useNavigate()

    // ========== ESTADOS PRINCIPALES ==========
    const [allPayments, setAllPayments] = useState([]) // TODOS los datos del backend (CARGA UNA SOLA VEZ)
    const [filteredPayments, setFilteredPayments] = useState([]) // Datos filtrados en frontend
    const [paymentStats, setPaymentStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [dataLoaded, setDataLoaded] = useState(false) // Control para evitar recargas

    // Estados para modales/formularios
    const [showViewModal, setShowViewModal] = useState(false)
    const [showApproveConfirm, setShowApproveConfirm] = useState(false)
    const [showRejectConfirm, setShowRejectConfirm] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState(null)
    const [formLoading, setFormLoading] = useState(false)
    const [rejectReason, setRejectReason] = useState('')

    // Estados de filtros - SOLO FRONTEND
    const [filters, setFilters] = useState({
        search: '',
        estado: '',
        curso: '',
        fecha_desde: '',
        fecha_hasta: ''
    })

    // Estado de paginación - SOLO FRONTEND
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 20,
        totalItems: 0,
        totalPages: 0
    })

    // ========== CONFIGURACIONES ==========
    const estadosPago = [
        { value: '', label: 'Todas las inscripciones' },
        { value: 'pendiente', label: 'Pendientes' },
        { value: 'habilitado', label: 'Habilitadas' },
        { value: 'rechazado', label: 'Rechazadas' }
    ]

    // ========== EFECTOS ==========
    // 🚨 SOLO CARGAR DATOS UNA VEZ AL MONTAR EL COMPONENTE
    useEffect(() => {
        if (!dataLoaded) {
            loadAllPayments()
        }
    }, [dataLoaded])

    // 🔄 APLICAR FILTROS CUANDO CAMBIEN (SIN LLAMADA AL BACKEND)
    useEffect(() => {
        if (dataLoaded && allPayments.length > 0) {
            applyFilters()
        }
    }, [filters, allPayments, dataLoaded])

    // ⏰ AUTO-CERRAR MENSAJES DE ÉXITO
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIÓN: CARGAR TODOS LOS DATOS (UNA SOLA VEZ) ==========
    const loadAllPayments = async () => {
        try {
            setLoading(true)
            setError('')

            // 🎯 OBTENER TODOS LOS DATOS SIN FILTROS
            const result = await enrollmentsService.getAllEnrollments({})

            if (result.success) {
                const allInscripciones = result.data.inscripciones || []
                setAllPayments(allInscripciones)
                setDataLoaded(true) // 🔒 Marcar como cargado para evitar futuras cargas

                console.log(`✅ Datos cargados: ${allInscripciones.length} inscripciones`)

                // Usar estadísticas globales del backend
                if (result.data.statistics) {
                    console.log('📊 Usando estadísticas del backend')
                } else {
                    console.log('📊 Calculando estadísticas locales')
                }
            } else {
                setError(result.error || 'Error cargando inscripciones')
            }
        } catch (error) {
            console.error('❌ Error cargando datos:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // ========== FUNCIÓN: APLICAR FILTROS (100% FRONTEND) ==========
    const applyFilters = () => {
        console.log('🔍 Aplicando filtros en frontend:', filters)

        let filtered = [...allPayments]

        // Filtro de búsqueda (nombre, email, usuario, curso)
        if (filters.search.trim()) {
            const searchTerm = filters.search.toLowerCase().trim()
            filtered = filtered.filter(payment =>
                payment.nombre_completo?.toLowerCase().includes(searchTerm) ||
                payment.email?.toLowerCase().includes(searchTerm) ||
                payment.nombre_usuario?.toLowerCase().includes(searchTerm) ||
                payment.curso_titulo?.toLowerCase().includes(searchTerm)
            )
        }

        // Filtro de estado
        if (filters.estado) {
            filtered = filtered.filter(payment => payment.estado_pago === filters.estado)
        }

        // Filtro de curso
        if (filters.curso.trim()) {
            const cursoTerm = filters.curso.toLowerCase().trim()
            filtered = filtered.filter(payment =>
                payment.curso_titulo?.toLowerCase().includes(cursoTerm)
            )
        }

        // Filtro de fecha desde
        if (filters.fecha_desde) {
            const fechaDesde = new Date(filters.fecha_desde)
            filtered = filtered.filter(payment => {
                const fechaInscripcion = new Date(payment.fecha_inscripcion)
                return fechaInscripcion >= fechaDesde
            })
        }

        // Filtro de fecha hasta
        if (filters.fecha_hasta) {
            const fechaHasta = new Date(filters.fecha_hasta)
            fechaHasta.setHours(23, 59, 59, 999) // Incluir todo el día
            filtered = filtered.filter(payment => {
                const fechaInscripcion = new Date(payment.fecha_inscripcion)
                return fechaInscripcion <= fechaHasta
            })
        }

        console.log(`📋 Resultados filtrados: ${filtered.length}/${allPayments.length}`)

        setFilteredPayments(filtered)

        // Calcular paginación
        const totalItems = filtered.length
        const totalPages = Math.ceil(totalItems / pagination.itemsPerPage)

        setPagination(prev => ({
            ...prev,
            totalItems,
            totalPages,
            currentPage: 1 // Reset a página 1 cuando cambian filtros
        }))

        // Recalcular estadísticas con datos filtrados
        calculateStats(filtered)
    }

    // ========== FUNCIÓN: CALCULAR ESTADÍSTICAS ==========
    const calculateStats = (inscripciones) => {
        const stats = {
            total: inscripciones.length,
            pendientes: 0,
            habilitadas: 0,
            rechazadas: 0,
            gratuitas: 0,
            pagadas: 0,
            ingresosTotales: 0,
            ingresosPendientes: 0
        }

        inscripciones.forEach(inscripcion => {
            // Contar por estado
            if (inscripcion.estado_pago === 'pendiente') stats.pendientes++
            if (inscripcion.estado_pago === 'habilitado') stats.habilitadas++
            if (inscripcion.estado_pago === 'rechazado') stats.rechazadas++

            // Contar por tipo
            if (inscripcion.es_gratuito) {
                stats.gratuitas++
            } else {
                stats.pagadas++

                // Calcular ingresos
                const precio = parseFloat(inscripcion.precio) || 0
                if (inscripcion.estado_pago === 'habilitado') {
                    stats.ingresosTotales += precio
                } else if (inscripcion.estado_pago === 'pendiente') {
                    stats.ingresosPendientes += precio
                }
            }
        })

        setPaymentStats(stats)
    }

    // ========== FUNCIÓN: DATOS PAGINADOS ==========
    const getCurrentPageData = () => {
        const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
        const endIndex = startIndex + pagination.itemsPerPage
        return filteredPayments.slice(startIndex, endIndex)
    }

    // ========== FUNCIONES DE FILTROS (SIN LLAMADAS AL BACKEND) ==========
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        console.log(`🔧 Cambiando filtro ${name}:`, value)

        setFilters(prev => ({
            ...prev,
            [name]: value
        }))
        // ⚡ Los filtros se aplican automáticamente por useEffect
    }

    const clearFilters = () => {
        console.log('🧹 Limpiando filtros')
        setFilters({
            search: '',
            estado: '',
            curso: '',
            fecha_desde: '',
            fecha_hasta: ''
        })
        // ⚡ Los filtros se aplican automáticamente por useEffect
    }

    // ========== FUNCIÓN: CAMBIO DE PÁGINA ==========
    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            currentPage: newPage
        }))
    }

    // ========== FUNCIÓN: REFRESCAR DATOS (SOLO CUANDO SEA NECESARIO) ==========
    const refreshData = async () => {
        console.log('🔄 Refrescando datos...')
        setDataLoaded(false) // Esto triggereará una nueva carga
    }

    // ========== ACCIONES DE PAGO ==========
    const handleViewPayment = (payment) => {
        setSelectedPayment(payment)
        setShowViewModal(true)
    }

    const handleApprovePayment = (payment) => {
        setSelectedPayment(payment)
        setShowApproveConfirm(true)
    }

    const handleRejectPayment = (payment) => {
        setSelectedPayment(payment)
        setRejectReason('')
        setShowRejectConfirm(true)
    }

    const confirmApprovePayment = async () => {
        if (!selectedPayment) return

        try {
            setFormLoading(true)
            const result = await enrollmentsService.approvePayment(selectedPayment.id)

            if (result.success) {
                setShowApproveConfirm(false)
                setSelectedPayment(null)

                // 🔄 SOLO AHORA refrescar datos porque cambió algo en el backend
                await refreshData()
                setSuccess(result.message || 'Pago aprobado exitosamente')
            } else {
                setError(result.error || 'Error aprobando el pago')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión al aprobar el pago')
        } finally {
            setFormLoading(false)
        }
    }

    const confirmRejectPayment = async () => {
        if (!selectedPayment || !rejectReason.trim()) {
            setError('Debe proporcionar un motivo de rechazo')
            return
        }

        try {
            setFormLoading(true)
            // Nota: Este método necesitaría implementarse en el servicio
            const result = { success: false, error: 'Función de rechazo no implementada aún' }

            if (result.success) {
                setShowRejectConfirm(false)
                setSelectedPayment(null)
                setRejectReason('')

                // 🔄 SOLO AHORA refrescar datos porque cambió algo en el backend
                await refreshData()
                setSuccess(result.message || 'Pago rechazado exitosamente')
            } else {
                setError(result.error || 'Error rechazando el pago')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión al rechazar el pago')
        } finally {
            setFormLoading(false)
        }
    }

    // ========== FUNCIONES DE UTILIDAD ==========
    const formatDate = (dateString) => {
        if (!dateString) return 'No registrado'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    const getStatusColor = (status) => {
        const colors = {
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'habilitado': 'bg-green-100 text-green-800',
            'rechazado': 'bg-red-100 text-red-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    const getStatusText = (status) => {
        const labels = {
            'pendiente': 'Pendiente',
            'habilitado': 'Habilitado',
            'rechazado': 'Rechazado'
        }
        return labels[status] || status
    }

    const generateWhatsAppURL = (phoneNumber, message) => {
        const encodedMessage = encodeURIComponent(message)
        return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    }

    // Obtener datos de la página actual
    const currentPagePayments = getCurrentPageData()

    // ========== RENDER ==========
    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* ========== HEADER ========== */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue">Gestión de Inscripciones</h1>
                        <p className="text-medico-gray mt-2">
                            Administra todas las inscripciones de la plataforma
                            {dataLoaded && (
                                <span className="ml-2 text-sm text-green-600">
                                    • {allPayments.length} registros cargados
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={refreshData}
                            disabled={loading}
                            className="inline-flex items-center px-4 py-2 border border-medico-blue text-medico-blue rounded-lg hover:bg-medico-blue hover:text-white transition-colors disabled:opacity-50"
                        >
                            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {loading ? 'Actualizando...' : 'Actualizar datos'}
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
                        <button
                            onClick={() => setError('')}
                            className="mt-2 text-red-700 underline hover:no-underline text-sm"
                        >
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Total Inscripciones</h3>
                                <p className="text-3xl font-bold text-medico-blue">{paymentStats.total || 0}</p>
                                {filteredPayments.length !== allPayments.length && (
                                    <p className="text-xs text-gray-500">de {allPayments.length} total</p>
                                )}
                            </div>
                            <div className="bg-medico-blue bg-opacity-10 rounded-full p-3">
                                <svg className="w-8 h-8 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Pendientes</h3>
                                <p className="text-3xl font-bold text-yellow-600">{paymentStats.pendientes || 0}</p>
                            </div>
                            <div className="bg-yellow-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Habilitadas</h3>
                                <p className="text-3xl font-bold text-green-600">{paymentStats.habilitadas || 0}</p>
                            </div>
                            <div className="bg-green-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Ingresos Totales</h3>
                                <p className="text-3xl font-bold text-purple-600">{formatCurrency(paymentStats.ingresosTotales || 0)}</p>
                            </div>
                            <div className="bg-purple-100 rounded-full p-3">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== FILTROS ========== */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                        <div className="text-sm text-gray-500">
                            ⚡ Filtrado instantáneo en frontend
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Usuario, email, curso..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                            <select
                                name="estado"
                                value={filters.estado}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                {estadosPago.map(estado => (
                                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                            <input
                                type="text"
                                name="curso"
                                value={filters.curso}
                                onChange={handleFilterChange}
                                placeholder="Nombre del curso..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                            <input
                                type="date"
                                name="fecha_desde"
                                value={filters.fecha_desde}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                            <input
                                type="date"
                                name="fecha_hasta"
                                value={filters.fecha_hasta}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full px-3 py-2 text-medico-blue border border-medico-blue rounded-lg hover:bg-medico-blue hover:text-white transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* ========== LISTA DE INSCRIPCIONES ========== */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                            <p className="mt-4 text-medico-gray">Cargando inscripciones...</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {currentPagePayments.length > 0 ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                {/* Tabla de inscripciones */}
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estudiante
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Curso
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Precio
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Fecha Inscripción
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Estado
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Acciones
                                            </th>
                                        </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                        {currentPagePayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <div className="h-10 w-10 rounded-full bg-medico-blue flex items-center justify-center">
                                                                <span className="text-white font-medium text-sm">
                                                                    {payment.nombre_completo?.charAt(0)?.toUpperCase() || 'U'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {payment.nombre_completo}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {payment.email}
                                                            </div>
                                                            <div className="text-xs text-gray-400">
                                                                @{payment.nombre_usuario}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{payment.curso_titulo}</div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-2">
                                                        <span>ID: {payment.id}</span>
                                                        {payment.es_gratuito && (
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                               Gratuito
                                                           </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-medico-blue">
                                                        {payment.es_gratuito ? 'Gratuito' : formatCurrency(payment.precio)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(payment.fecha_inscripcion)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.estado_pago || 'pendiente')}`}>
                                                       {getStatusText(payment.estado_pago || 'pendiente')}
                                                   </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    <div className="flex items-center space-x-2">
                                                        {/* Ver detalles */}
                                                        <button
                                                            onClick={() => handleViewPayment(payment)}
                                                            className="text-medico-blue hover:text-blue-700"
                                                            title="Ver detalles"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>

                                                        {/* Aprobar pago - Solo si está pendiente */}
                                                        {payment.estado_pago === 'pendiente' && (
                                                            <button
                                                                onClick={() => handleApprovePayment(payment)}
                                                                className="text-green-600 hover:text-green-800"
                                                                title="Aprobar pago"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {/* Rechazar pago - Solo si está pendiente */}
                                                        {payment.estado_pago === 'pendiente' && (
                                                            <button
                                                                onClick={() => handleRejectPayment(payment)}
                                                                className="text-red-600 hover:text-red-800"
                                                                title="Rechazar pago"
                                                            >
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        )}

                                                        {/* WhatsApp */}
<a
                                                        href={generateWhatsAppURL('593981833667', `Hola ${payment.nombre_completo}, te contacto sobre tu inscripción al curso "${payment.curso_titulo}".`)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Contactar por WhatsApp"
                                                        >
                                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                                        </svg>
                                                    </a>
                                                </div>
                                            </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ========== PAGINACIÓN TRADICIONAL ========== */}
                                {pagination.totalPages > 1 && (
                                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                    <div className="flex-1 flex justify-between sm:hidden">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage <= 1}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Anterior
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage >= pagination.totalPages}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-sm text-gray-700">
                                                Mostrando{' '}
                                                <span className="font-medium">{((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}</span>
                                                {' '}a{' '}
                                                <span className="font-medium">
                                                       {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                                                   </span>
                                                {' '}de{' '}
                                                <span className="font-medium">{pagination.totalItems}</span>
                                                {' '}resultados
                                            </p>
                                        </div>
                                        <div>
                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                                <button
                                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                                    disabled={pagination.currentPage <= 1}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>

                                                {/* Páginas */}
                                                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                                    let pageNum;
                                                    if (pagination.totalPages <= 5) {
                                                        pageNum = i + 1;
                                                    } else {
                                                        if (pagination.currentPage <= 3) {
                                                            pageNum = i + 1;
                                                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                                            pageNum = pagination.totalPages - 4 + i;
                                                        } else {
                                                            pageNum = pagination.currentPage - 2 + i;
                                                        }
                                                    }

                                                    return (
                                                        <button
                                                            key={pageNum}
                                                            onClick={() => handlePageChange(pageNum)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                                pageNum === pagination.currentPage
                                                                    ? 'z-10 bg-medico-blue border-medico-blue text-white'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {pageNum}
                                                        </button>
                                                    )
                                                })}

                                                <button
                                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                                    disabled={pagination.currentPage >= pagination.totalPages}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                                >
                                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </nav>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay inscripciones disponibles</h3>
                                <p className="text-gray-500 mb-4">
                                    {filters.search || filters.estado || filters.curso || filters.fecha_desde || filters.fecha_hasta
                                        ? 'No se encontraron inscripciones con los filtros aplicados'
                                        : 'No hay inscripciones registradas en el sistema'
                                    }
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-medico-blue bg-medico-blue bg-opacity-10 hover:bg-opacity-20"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        )}
                    </>
                    )}

                {/* ========== MODAL DE VISUALIZACIÓN ========== */}
                {showViewModal && selectedPayment && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-medico-blue">Detalles de la Inscripción</h2>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Información del estudiante */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Estudiante</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Nombre:</span>
                                                <p className="text-gray-600">{selectedPayment.nombre_completo}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Email:</span>
                                                <p className="text-gray-600">{selectedPayment.email}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Usuario:</span>
                                                <p className="text-gray-600">@{selectedPayment.nombre_usuario}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Teléfono:</span>
                                                <p className="text-gray-600">{selectedPayment.telefono || 'No registrado'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información del curso */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Curso</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Curso:</span>
                                                <p className="text-gray-600">{selectedPayment.curso_titulo}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Tipo:</span>
                                                <div className="flex items-center gap-2">
                                                   <span className="text-gray-600">
                                                       {selectedPayment.es_gratuito ? 'Gratuito' : formatCurrency(selectedPayment.precio)}
                                                   </span>
                                                    {selectedPayment.es_gratuito && (
                                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                           Gratuito
                                                       </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Fecha Inscripción:</span>
                                                <p className="text-gray-600">{formatDate(selectedPayment.fecha_inscripcion)}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Estado:</span>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPayment.estado_pago)}`}>
                                                   {getStatusText(selectedPayment.estado_pago)}
                                               </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Adicional</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">ID Inscripción:</span>
                                                <p className="text-gray-600 font-mono">{selectedPayment.id}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Fecha Habilitación:</span>
                                                <p className="text-gray-600">{formatDate(selectedPayment.fecha_habilitacion)}</p>
                                            </div>
                                            {selectedPayment.aprobado_por_nombre && (
                                                <div className="col-span-2">
                                                    <span className="font-medium text-gray-700">Aprobado por:</span>
                                                    <p className="text-gray-600">{selectedPayment.aprobado_por_nombre}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Mensaje de WhatsApp sugerido */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Mensaje WhatsApp Sugerido</h3>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <p className="text-sm text-green-800">
                                            {selectedPayment.es_gratuito
                                                ? `Hola ${selectedPayment.nombre_completo}, confirmamos tu inscripción al curso gratuito "${selectedPayment.curso_titulo}". Ya tienes acceso completo al contenido.`
                                                : `Hola ${selectedPayment.nombre_completo}, te contacto sobre tu inscripción al curso "${selectedPayment.curso_titulo}". El monto a pagar es de ${formatCurrency(selectedPayment.precio)}. ¿Podrías enviarme el comprobante de pago?`
                                            }
                                        </p>
                                        <div className="mt-3">
<a
                                            href={generateWhatsAppURL('593981833667',
                                            selectedPayment.es_gratuito
                                                ? `Hola ${selectedPayment.nombre_completo}, confirmamos tu inscripción al curso gratuito "${selectedPayment.curso_titulo}". Ya tienes acceso completo al contenido.`
                                                : `Hola ${selectedPayment.nombre_completo}, te contacto sobre tu inscripción al curso "${selectedPayment.curso_titulo}". El monto a pagar es de ${formatCurrency(selectedPayment.precio)}. ¿Podrías enviarme el comprobante de pago?`
                                        )}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                                            </svg>
                                            <span>Abrir WhatsApp</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Acciones */}
                            {selectedPayment.estado_pago === 'pendiente' && (
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false)
                                            handleRejectPayment(selectedPayment)
                                        }}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Rechazar Pago
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowViewModal(false)
                                            handleApprovePayment(selectedPayment)
                                        }}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Aprobar Pago
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                    )}

{/* ========== MODAL DE CONFIRMACIÓN DE APROBACIÓN ========== */}
{showApproveConfirm && selectedPayment && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Aprobación</h3>
                <p className="text-gray-600 mt-2">
                    ¿Estás seguro de que quieres aprobar el pago de <strong>"{selectedPayment.nombre_completo}"</strong>
                    para el curso <strong>"{selectedPayment.curso_titulo}"</strong>?
                </p>
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                        <strong>Monto:</strong> {selectedPayment.es_gratuito ? 'Gratuito' : formatCurrency(selectedPayment.precio)}
                    </p>
                    <p className="text-sm text-green-800">
                        El estudiante tendrá acceso inmediato al curso tras la aprobación.
                    </p>
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => {
                        setShowApproveConfirm(false)
                        setSelectedPayment(null)
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={confirmApprovePayment}
                    disabled={formLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                    {formLoading && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>{formLoading ? 'Aprobando...' : 'Aprobar Pago'}</span>
                </button>
            </div>
        </div>
    </div>
)}

{/* ========== MODAL DE CONFIRMACIÓN DE RECHAZO ========== */}
{showRejectConfirm && selectedPayment && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Rechazo</h3>
                <p className="text-gray-600 mt-2">
                    ¿Estás seguro de que quieres rechazar el pago de <strong>"{selectedPayment.nombre_completo}"</strong>?
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo del Rechazo *
                </label>
                <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                    placeholder="Explica por qué se rechaza el pago..."
                />
                <p className="text-xs text-gray-500 mt-1">
                    Este motivo será comunicado al estudiante
                </p>
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    onClick={() => {
                        setShowRejectConfirm(false)
                        setSelectedPayment(null)
                        setRejectReason('')
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={confirmRejectPayment}
                    disabled={formLoading || !rejectReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                    {formLoading && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>{formLoading ? 'Rechazando...' : 'Rechazar Pago'}</span>
                </button>
            </div>
        </div>
    </div>
)}
</div>
</Layout>
)
}

export default AdminPayments