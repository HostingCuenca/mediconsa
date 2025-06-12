// // // src/services/enrollments.js - COMPLETO AL 100%
// // import apiService from './api'
// //
// // class EnrollmentsService {
// //
// //     // ==================== INSCRIPCIONES ====================
// //     async enrollToCourse(cursoId) {
// //         try {
// //             console.log('Inscribiendo a curso:', cursoId)
// //             const response = await apiService.post('/enrollments', { cursoId })
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         inscripcion: response.data.inscripcion,
// //                         whatsappMessage: response.data.whatsappMessage,
// //                         message: response.message
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudo procesar la inscripción' }
// //         } catch (error) {
// //             console.error('Error en inscripción:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async getMyEnrollments() {
// //         try {
// //             console.log('Obteniendo mis inscripciones')
// //             const response = await apiService.get('/enrollments/my')
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         inscripciones: response.data.inscripciones || []
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar las inscripciones' }
// //         } catch (error) {
// //             console.error('Error obteniendo inscripciones:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async checkCourseAccess(cursoId) {
// //         try {
// //             console.log('Verificando acceso a curso:', cursoId)
// //             const response = await apiService.get(`/enrollments/check-access/${cursoId}`)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         tieneAcceso: response.data.tieneAcceso,
// //                         esGratuito: response.data.esGratuito,
// //                         estadoPago: response.data.estadoPago,
// //                         fechaHabilitacion: response.data.fechaHabilitacion,
// //                         inscripcion: response.data.inscripcion
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudo verificar el acceso' }
// //         } catch (error) {
// //             console.error('Error verificando acceso:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== GESTIÓN DE PAGOS (ADMIN) ====================
// //     async getPendingPayments(filters = {}) {
// //         try {
// //             console.log('Obteniendo pagos pendientes:', filters)
// //             const response = await apiService.get('/enrollments/pending', filters)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         pagosPendientes: response.data.pagosPendientes || [],
// //                         total: response.data.total || 0,
// //                         pagination: response.data.pagination || {}
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar los pagos pendientes' }
// //         } catch (error) {
// //             console.error('Error obteniendo pagos pendientes:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async approvePayment(inscripcionId, approvalData = {}) {
// //         try {
// //             console.log('Aprobando pago:', inscripcionId, approvalData)
// //             const response = await apiService.patch(`/enrollments/${inscripcionId}/approve`, approvalData)
// //
// //             if (response.success) {
// //                 return {
// //                     success: true,
// //                     data: response.data,
// //                     message: response.message
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudo aprobar el pago' }
// //         } catch (error) {
// //             console.error('Error aprobando pago:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async rejectPayment(inscripcionId, rejectionData) {
// //         try {
// //             console.log('Rechazando pago:', inscripcionId, rejectionData)
// //             const response = await apiService.patch(`/enrollments/${inscripcionId}/reject`, rejectionData)
// //
// //             if (response.success) {
// //                 return {
// //                     success: true,
// //                     data: response.data,
// //                     message: response.message
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudo rechazar el pago' }
// //         } catch (error) {
// //             console.error('Error rechazando pago:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async getAllEnrollments(filters = {}) {
// //         try {
// //             console.log('Obteniendo todas las inscripciones:', filters)
// //             const response = await apiService.get('/admin/enrollments', filters)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         inscripciones: response.data.inscripciones || [],
// //                         total: response.data.total || 0,
// //                         pagination: response.data.pagination || {},
// //                         estadisticas: response.data.estadisticas || {}
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar las inscripciones' }
// //         } catch (error) {
// //             console.error('Error obteniendo inscripciones:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== MÉTODOS DE PAGO ====================
// //     async addPaymentProof(inscripcionId, paymentData) {
// //         try {
// //             console.log('Agregando comprobante de pago:', inscripcionId)
// //             const formData = new FormData()
// //
// //             if (paymentData.comprobante) {
// //                 formData.append('comprobante', paymentData.comprobante)
// //             }
// //
// //             formData.append('metodoPago', paymentData.metodoPago || '')
// //             formData.append('numeroTransaccion', paymentData.numeroTransaccion || '')
// //             formData.append('fechaPago', paymentData.fechaPago || '')
// //             formData.append('monto', paymentData.monto || '')
// //             formData.append('notas', paymentData.notas || '')
// //
// //             const response = await apiService.post(`/enrollments/${inscripcionId}/payment-proof`, formData, {
// //                 headers: {
// //                     'Content-Type': 'multipart/form-data'
// //                 }
// //             })
// //
// //             if (response.success) {
// //                 return { success: true, data: response.data }
// //             }
// //
// //             return { success: false, error: 'No se pudo subir el comprobante' }
// //         } catch (error) {
// //             console.error('Error subiendo comprobante:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async getPaymentMethods() {
// //         try {
// //             console.log('Obteniendo métodos de pago')
// //             const response = await apiService.get('/enrollments/payment-methods')
// //
// //             if (response.success) {
// //                 return { success: true, data: response.data }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar los métodos de pago' }
// //         } catch (error) {
// //             console.error('Error obteniendo métodos de pago:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== COMUNICACIÓN WHATSAPP ====================
// //     async generateWhatsAppMessage(inscripcionId) {
// //         try {
// //             console.log('Generando mensaje de WhatsApp:', inscripcionId)
// //             const response = await apiService.get(`/enrollments/${inscripcionId}/whatsapp-message`)
// //
// //             if (response.success) {
// //                 return { success: true, data: response.data }
// //             }
// //
// //             return { success: false, error: 'No se pudo generar el mensaje' }
// //         } catch (error) {
// //             console.error('Error generando mensaje WhatsApp:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async sendWhatsAppNotification(inscripcionId, messageType) {
// //         try {
// //             console.log('Enviando notificación WhatsApp:', inscripcionId, messageType)
// //             const response = await apiService.post(`/enrollments/${inscripcionId}/send-whatsapp`, {
// //                 messageType
// //             })
// //
// //             if (response.success) {
// //                 return { success: true, data: response.data }
// //             }
// //
// //             return { success: false, error: 'No se pudo enviar la notificación' }
// //         } catch (error) {
// //             console.error('Error enviando WhatsApp:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== ESTADÍSTICAS ====================
// //     async getEnrollmentStats(filters = {}) {
// //         try {
// //             console.log('Obteniendo estadísticas de inscripciones:', filters)
// //             const response = await apiService.get('/admin/enrollments/stats', filters)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         totalInscripciones: response.data.total_inscripciones || 0,
// //                         inscripcionesPendientes: response.data.inscripciones_pendientes || 0,
// //                         inscripcionesAprobadas: response.data.inscripciones_aprobadas || 0,
// //                         inscripcionesRechazadas: response.data.inscripciones_rechazadas || 0,
// //                         ingresosTotales: response.data.ingresos_totales || 0,
// //                         ingresosEsteMes: response.data.ingresos_este_mes || 0,
// //                         cursosPopulares: response.data.cursos_populares || [],
// //                         tendenciaInscripciones: response.data.tendencia_inscripciones || []
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar las estadísticas' }
// //         } catch (error) {
// //             console.error('Error obteniendo estadísticas:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== DESCUENTOS Y PROMOCIONES ====================
// //     async applyDiscount(inscripcionId, discountCode) {
// //         try {
// //             console.log('Aplicando descuento:', inscripcionId, discountCode)
// //             const response = await apiService.post(`/enrollments/${inscripcionId}/apply-discount`, {
// //                 codigo: discountCode
// //             })
// //
// //             if (response.success) {
// //                 return { success: true, data: response.data }
// //             }
// //
// //             return { success: false, error: 'Código de descuento inválido' }
// //         } catch (error) {
// //             console.error('Error aplicando descuento:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async validateDiscountCode(code, cursoId) {
// //         try {
// //             console.log('Validando código de descuento:', code, cursoId)
// //             const response = await apiService.post('/enrollments/validate-discount', {
// //                 codigo: code,
// //                 cursoId
// //             })
// //
// //             if (response.success) {
// //                 return { success: true, data: response.data }
// //             }
// //
// //             return { success: false, error: 'Código inválido' }
// //         } catch (error) {
// //             console.error('Error validando descuento:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== CERTIFICADOS ====================
// //     async generateCertificate(inscripcionId) {
// //         try {
// //             console.log('Generando certificado:', inscripcionId)
// //             const response = await apiService.post(`/enrollments/${inscripcionId}/generate-certificate`)
// //
// //             if (response.success) {
// //                 return { success: true, data: response.data }
// //             }
// //
// //             return { success: false, error: 'No se pudo generar el certificado' }
// //         } catch (error) {
// //             console.error('Error generando certificado:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async getUserCertificates(userId) {
// //         try {
// //             console.log('Obteniendo certificados de usuario:', userId)
// //             const response = await apiService.get(`/enrollments/certificates/${userId}`)
// //
// //             if (response.success) {
// //                 return { success: true, data: response.data }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar los certificados' }
// //         } catch (error) {
// //             console.error('Error obteniendo certificados:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== HELPERS ====================
// //     getStatusLabel(status) {
// //         const labels = {
// //             'pendiente': 'Pendiente',
// //             'habilitado': 'Aprobado',
// //             'rechazado': 'Rechazado',
// //             'expirado': 'Expirado',
// //             'cancelado': 'Cancelado'
// //         }
// //         return labels[status] || status
// //     }
// //
// //     getStatusColor(status) {
// //         const colors = {
// //             'pendiente': 'bg-yellow-100 text-yellow-800',
// //             'habilitado': 'bg-green-100 text-green-800',
// //             'rechazado': 'bg-red-100 text-red-800',
// //             'expirado': 'bg-gray-100 text-gray-800',
// //             'cancelado': 'bg-gray-100 text-gray-800'
// //         }
// //         return colors[status] || 'bg-gray-100 text-gray-800'
// //     }
// //
// //     formatEnrollmentForDisplay(enrollment) {
// //         return {
// //             ...enrollment,
// //             statusLabel: this.getStatusLabel(enrollment.estado || enrollment.estadoPago),
// //             statusColor: this.getStatusColor(enrollment.estado || enrollment.estadoPago),
// //             fechaInscripcion: enrollment.fecha_inscripcion || enrollment.fechaInscripcion,
// //             fechaHabilitacion: enrollment.fecha_habilitacion || enrollment.fechaHabilitacion,
// //             curso: {
// //                 ...enrollment.curso,
// //                 titulo: enrollment.curso?.titulo,
// //                 precio: enrollment.curso?.precio,
// //                 esGratuito: enrollment.curso?.es_gratuito || enrollment.curso?.esGratuito
// //             },
// //             usuario: {
// //                 ...enrollment.usuario,
// //                 nombreCompleto: enrollment.usuario?.nombre_completo || enrollment.usuario?.nombreCompleto,
// //                 email: enrollment.usuario?.email
// //             }
// //         }
// //     }
// //
// //     generateWhatsAppURL(phoneNumber, message) {
// //         const encodedMessage = encodeURIComponent(message)
// //         return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
// //     }
// //
// //     formatCurrency(amount) {
// //         return new Intl.NumberFormat('es-EC', {
// //             style: 'currency',
// //             currency: 'USD'
// //         }).format(amount)
// //     }
// //
// //     calculateDaysFromEnrollment(enrollmentDate) {
// //         const now = new Date()
// //         const enrollment = new Date(enrollmentDate)
// //         const diffTime = Math.abs(now - enrollment)
// //         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
// //         return diffDays
// //     }
// // }
// //
// // export default new EnrollmentsService()
//
//
// import apiService from './api'
//
// class EnrollmentsService {
//
//     // ==================== INSCRIPCIONES BÁSICAS ====================
//     async enrollToCourse(cursoId) {
//         try {
//             console.log('Inscribiendo a curso:', cursoId)
//             const response = await apiService.post('/enrollments', { cursoId })
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         inscripcion: response.data.inscripcion,
//                         whatsappMessage: response.data.whatsappMessage,
//                         message: response.message
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudo procesar la inscripción' }
//         } catch (error) {
//             console.error('Error en inscripción:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async getMyEnrollments() {
//         try {
//             console.log('Obteniendo mis inscripciones')
//             const response = await apiService.get('/enrollments/my')
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         inscripciones: response.data.inscripciones || []
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudieron cargar las inscripciones' }
//         } catch (error) {
//             console.error('Error obteniendo inscripciones:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async checkCourseAccess(cursoId) {
//         try {
//             console.log('Verificando acceso a curso:', cursoId)
//             const response = await apiService.get(`/enrollments/check-access/${cursoId}`)
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         tieneAcceso: response.data.tieneAcceso,
//                         esGratuito: response.data.esGratuito,
//                         estadoPago: response.data.estadoPago,
//                         fechaHabilitacion: response.data.fechaHabilitacion
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudo verificar el acceso' }
//         } catch (error) {
//             console.error('Error verificando acceso:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== GESTIÓN DE PAGOS (ADMIN) ====================
//     async getPendingPayments() {
//         try {
//             console.log('Obteniendo pagos pendientes')
//             const response = await apiService.get('/enrollments/pending')
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         pagosPendientes: response.data.pagosPendientes || [],
//                         total: response.data.total || 0
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudieron cargar los pagos pendientes' }
//         } catch (error) {
//             console.error('Error obteniendo pagos pendientes:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async approvePayment(inscripcionId, approvalData = {}) {
//         try {
//             console.log('Aprobando pago:', inscripcionId, approvalData)
//             const response = await apiService.patch(`/enrollments/${inscripcionId}/approve`, approvalData)
//
//             if (response.success) {
//                 return {
//                     success: true,
//                     data: response.data,
//                     message: response.message
//                 }
//             }
//
//             return { success: false, error: 'No se pudo aprobar el pago' }
//         } catch (error) {
//             console.error('Error aprobando pago:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== HELPERS ====================
//     getStatusLabel(status) {
//         const labels = {
//             'pendiente': 'Pendiente',
//             'habilitado': 'Aprobado',
//             'rechazado': 'Rechazado',
//             'expirado': 'Expirado',
//             'cancelado': 'Cancelado'
//         }
//         return labels[status] || status
//     }
//
//     getStatusColor(status) {
//         const colors = {
//             'pendiente': 'bg-yellow-100 text-yellow-800',
//             'habilitado': 'bg-green-100 text-green-800',
//             'rechazado': 'bg-red-100 text-red-800',
//             'expirado': 'bg-gray-100 text-gray-800',
//             'cancelado': 'bg-gray-100 text-gray-800'
//         }
//         return colors[status] || 'bg-gray-100 text-gray-800'
//     }
//
//     formatEnrollmentForDisplay(enrollment) {
//         return {
//             ...enrollment,
//             statusLabel: this.getStatusLabel(enrollment.estado_pago),
//             statusColor: this.getStatusColor(enrollment.estado_pago),
//             curso: {
//                 ...enrollment.curso,
//                 titulo: enrollment.curso?.titulo,
//                 precio: enrollment.curso?.precio,
//                 es_gratuito: enrollment.curso?.es_gratuito
//             },
//             usuario: {
//                 ...enrollment.usuario,
//                 nombre_completo: enrollment.usuario?.nombre_completo,
//                 email: enrollment.usuario?.email
//             }
//         }
//     }
//
//     generateWhatsAppURL(phoneNumber, message) {
//         const encodedMessage = encodeURIComponent(message)
//         return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
//     }
//
//     formatCurrency(amount) {
//         return new Intl.NumberFormat('es-EC', {
//             style: 'currency',
//             currency: 'USD'
//         }).format(amount)
//     }
//
//     calculateDaysFromEnrollment(enrollmentDate) {
//         const now = new Date()
//         const enrollment = new Date(enrollmentDate)
//         const diffTime = Math.abs(now - enrollment)
//         const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
//         return diffDays
//     }
//
//     // ELIMINADOS: métodos que NO existen en el backend
//     // - getAllEnrollments (no necesario para MVP)
//     // - getEnrollmentStats (no necesario para MVP)
//     // - rejectPayment (implementar solo si es crítico)
//     // - addPaymentProof (implementar solo si es crítico)
//     // - getPaymentMethods (implementar solo si es crítico)
//     // - generateWhatsAppMessage (el backend ya incluye esto en enrollToCourse)
//     // - sendWhatsAppNotification (implementar solo si es crítico)
//     // - applyDiscount (implementar solo si es crítico)
//     // - validateDiscountCode (implementar solo si es crítico)
//     // - generateCertificate (implementar solo si es crítico)
//     // - getUserCertificates (implementar solo si es crítico)
// }
//
// export default new EnrollmentsService()


// src/services/enrollments.js - Servicio para MyCourses
import apiService from './api'

class EnrollmentsService {

    // =============================================
    // OBTENER MIS INSCRIPCIONES (MyCourses)
    // =============================================
    async getMyEnrollments(filters = {}) {
        try {
            console.log('Obteniendo mis inscripciones:', filters)
            const response = await apiService.get('/enrollments/my', filters)
            console.log('Respuesta mis inscripciones:', response)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        inscripciones: response.data.inscripciones || [],
                        total: response.data.inscripciones?.length || 0
                    }
                }
            }

            return {
                success: false,
                error: 'No se pudieron cargar tus cursos'
            }

        } catch (error) {
            console.error('Error obteniendo inscripciones:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // INSCRIBIRSE A UN CURSO
    // =============================================
    async enrollCourse(cursoId) {
        try {
            console.log('Inscribiéndose al curso:', cursoId)
            const response = await apiService.post('/enrollments', { cursoId })

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Inscripción exitosa',
                    whatsappMessage: response.data?.whatsappMessage
                }
            }

            return {
                success: false,
                error: response.message || 'Error en la inscripción'
            }

        } catch (error) {
            console.error('Error inscribiéndose:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // VERIFICAR ACCESO A CURSO
    // =============================================
    async checkCourseAccess(cursoId) {
        try {
            const response = await apiService.get(`/enrollments/check-access/${cursoId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error verificando acceso'
            }

        } catch (error) {
            console.error('Error verificando acceso:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // FILTROS Y BÚSQUEDAS
    // =============================================
    async getEnrollmentsByStatus(status) {
        return await this.getMyEnrollments({ estado_pago: status })
    }

    async getActiveEnrollments() {
        return await this.getEnrollmentsByStatus('habilitado')
    }

    async getPendingEnrollments() {
        return await this.getEnrollmentsByStatus('pendiente')
    }

    async searchMyEnrollments(searchTerm) {
        return await this.getMyEnrollments({ search: searchTerm })
    }

    // =============================================
    // UTILIDADES Y FORMATEO
    // =============================================
    formatEnrollmentData(inscripcion) {
        return {
            id: inscripcion.id,
            cursoId: inscripcion.curso_id,
            titulo: inscripcion.titulo,
            slug: inscripcion.slug,
            miniatura: inscripcion.miniatura_url,
            precio: inscripcion.precio,
            esGratuito: inscripcion.es_gratuito,
            estadoPago: inscripcion.estado_pago,
            fechaInscripcion: inscripcion.fecha_inscripcion,
            fechaHabilitacion: inscripcion.fecha_habilitacion,
            instructorNombre: inscripcion.instructor_nombre,
            totalClases: parseInt(inscripcion.total_clases) || 0,
            clasesCompletadas: parseInt(inscripcion.clases_completadas) || 0,
            porcentajeProgreso: parseFloat(inscripcion.porcentaje_progreso) || 0
        }
    }

    calculateProgress(completadas, total) {
        if (!total || total === 0) return 0
        return Math.round((completadas / total) * 100)
    }

    getStatusColor(estado) {
        const colors = {
            'habilitado': 'bg-green-100 text-green-800',
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'rechazado': 'bg-red-100 text-red-800'
        }
        return colors[estado] || 'bg-gray-100 text-gray-800'
    }

    getStatusText(estado) {
        const texts = {
            'habilitado': 'Activo',
            'pendiente': 'Pago Pendiente',
            'rechazado': 'Rechazado'
        }
        return texts[estado] || 'Desconocido'
    }

    getProgressColor(percentage) {
        if (percentage >= 80) return 'bg-green-500'
        if (percentage >= 50) return 'bg-blue-500'
        if (percentage >= 25) return 'bg-yellow-500'
        return 'bg-gray-300'
    }

    formatDate(dateString) {
        if (!dateString) return 'No disponible'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    // =============================================
    // ESTADÍSTICAS Y RESÚMENES
    // =============================================
    calculateEnrollmentStats(inscripciones) {
        const stats = {
            total: inscripciones.length,
            activos: 0,
            pendientes: 0,
            completados: 0,
            enProgreso: 0,
            progresoPromedio: 0
        }

        let sumaProgreso = 0

        inscripciones.forEach(inscripcion => {
            const progreso = parseFloat(inscripcion.porcentaje_progreso) || 0
            sumaProgreso += progreso

            // Contar por estado
            if (inscripcion.estado_pago === 'habilitado') {
                stats.activos++
            } else if (inscripcion.estado_pago === 'pendiente') {
                stats.pendientes++
            }

            // Contar por progreso
            if (progreso >= 100) {
                stats.completados++
            } else if (progreso > 0) {
                stats.enProgreso++
            }
        })

        stats.progresoPromedio = stats.total > 0 ? Math.round(sumaProgreso / stats.total) : 0

        return stats
    }

    // =============================================
    // GENERAR ENLACES ÚTILES
    // =============================================
    generateWhatsAppLink(curso, usuario) {
        const mensaje = `Hola, soy ${usuario} y quiero acceso al curso "${curso.titulo}". Precio: $${curso.precio}`
        return `https://wa.me/+593985036066?text=${encodeURIComponent(mensaje)}`
    }

    generateCourseUrl(slug) {
        return `/curso/${slug}`
    }

    generateProgressUrl(slug) {
        return `/mi-progreso/${slug}`
    }

    // =============================================
    // MÉTODOS LEGACY (Para compatibilidad)
    // =============================================
    async obtenerMisInscripciones(filtros = {}) {
        return await this.getMyEnrollments(filtros)
    }

    async inscribirseACurso(cursoId) {
        return await this.enrollCourse(cursoId)
    }

    async verificarAccesoCurso(cursoId) {
        return await this.checkCourseAccess(cursoId)
    }
}

// ✅ EXPORT DEFAULT CORRECTO
export default new EnrollmentsService()