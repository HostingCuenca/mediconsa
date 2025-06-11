// src/services/enrollments.js - COMPLETO AL 100%
import apiService from './api'

class EnrollmentsService {

    // ==================== INSCRIPCIONES ====================
    async enrollToCourse(cursoId) {
        try {
            console.log('Inscribiendo a curso:', cursoId)
            const response = await apiService.post('/enrollments', { cursoId })

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        inscripcion: response.data.inscripcion,
                        whatsappMessage: response.data.whatsappMessage,
                        message: response.message
                    }
                }
            }

            return { success: false, error: 'No se pudo procesar la inscripción' }
        } catch (error) {
            console.error('Error en inscripción:', error)
            return { success: false, error: error.message }
        }
    }

    async getMyEnrollments() {
        try {
            console.log('Obteniendo mis inscripciones')
            const response = await apiService.get('/enrollments/my')

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        inscripciones: response.data.inscripciones || []
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar las inscripciones' }
        } catch (error) {
            console.error('Error obteniendo inscripciones:', error)
            return { success: false, error: error.message }
        }
    }

    async checkCourseAccess(cursoId) {
        try {
            console.log('Verificando acceso a curso:', cursoId)
            const response = await apiService.get(`/enrollments/check-access/${cursoId}`)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        tieneAcceso: response.data.tieneAcceso,
                        esGratuito: response.data.esGratuito,
                        estadoPago: response.data.estadoPago,
                        fechaHabilitacion: response.data.fechaHabilitacion,
                        inscripcion: response.data.inscripcion
                    }
                }
            }

            return { success: false, error: 'No se pudo verificar el acceso' }
        } catch (error) {
            console.error('Error verificando acceso:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== GESTIÓN DE PAGOS (ADMIN) ====================
    async getPendingPayments(filters = {}) {
        try {
            console.log('Obteniendo pagos pendientes:', filters)
            const response = await apiService.get('/enrollments/pending', filters)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        pagosPendientes: response.data.pagosPendientes || [],
                        total: response.data.total || 0,
                        pagination: response.data.pagination || {}
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar los pagos pendientes' }
        } catch (error) {
            console.error('Error obteniendo pagos pendientes:', error)
            return { success: false, error: error.message }
        }
    }

    async approvePayment(inscripcionId, approvalData = {}) {
        try {
            console.log('Aprobando pago:', inscripcionId, approvalData)
            const response = await apiService.patch(`/enrollments/${inscripcionId}/approve`, approvalData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                }
            }

            return { success: false, error: 'No se pudo aprobar el pago' }
        } catch (error) {
            console.error('Error aprobando pago:', error)
            return { success: false, error: error.message }
        }
    }

    async rejectPayment(inscripcionId, rejectionData) {
        try {
            console.log('Rechazando pago:', inscripcionId, rejectionData)
            const response = await apiService.patch(`/enrollments/${inscripcionId}/reject`, rejectionData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message
                }
            }

            return { success: false, error: 'No se pudo rechazar el pago' }
        } catch (error) {
            console.error('Error rechazando pago:', error)
            return { success: false, error: error.message }
        }
    }

    async getAllEnrollments(filters = {}) {
        try {
            console.log('Obteniendo todas las inscripciones:', filters)
            const response = await apiService.get('/admin/enrollments', filters)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        inscripciones: response.data.inscripciones || [],
                        total: response.data.total || 0,
                        pagination: response.data.pagination || {},
                        estadisticas: response.data.estadisticas || {}
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar las inscripciones' }
        } catch (error) {
            console.error('Error obteniendo inscripciones:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== MÉTODOS DE PAGO ====================
    async addPaymentProof(inscripcionId, paymentData) {
        try {
            console.log('Agregando comprobante de pago:', inscripcionId)
            const formData = new FormData()

            if (paymentData.comprobante) {
                formData.append('comprobante', paymentData.comprobante)
            }

            formData.append('metodoPago', paymentData.metodoPago || '')
            formData.append('numeroTransaccion', paymentData.numeroTransaccion || '')
            formData.append('fechaPago', paymentData.fechaPago || '')
            formData.append('monto', paymentData.monto || '')
            formData.append('notas', paymentData.notas || '')

            const response = await apiService.post(`/enrollments/${inscripcionId}/payment-proof`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo subir el comprobante' }
        } catch (error) {
            console.error('Error subiendo comprobante:', error)
            return { success: false, error: error.message }
        }
    }

    async getPaymentMethods() {
        try {
            console.log('Obteniendo métodos de pago')
            const response = await apiService.get('/enrollments/payment-methods')

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudieron cargar los métodos de pago' }
        } catch (error) {
            console.error('Error obteniendo métodos de pago:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== COMUNICACIÓN WHATSAPP ====================
    async generateWhatsAppMessage(inscripcionId) {
        try {
            console.log('Generando mensaje de WhatsApp:', inscripcionId)
            const response = await apiService.get(`/enrollments/${inscripcionId}/whatsapp-message`)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo generar el mensaje' }
        } catch (error) {
            console.error('Error generando mensaje WhatsApp:', error)
            return { success: false, error: error.message }
        }
    }

    async sendWhatsAppNotification(inscripcionId, messageType) {
        try {
            console.log('Enviando notificación WhatsApp:', inscripcionId, messageType)
            const response = await apiService.post(`/enrollments/${inscripcionId}/send-whatsapp`, {
                messageType
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo enviar la notificación' }
        } catch (error) {
            console.error('Error enviando WhatsApp:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== ESTADÍSTICAS ====================
    async getEnrollmentStats(filters = {}) {
        try {
            console.log('Obteniendo estadísticas de inscripciones:', filters)
            const response = await apiService.get('/admin/enrollments/stats', filters)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        totalInscripciones: response.data.total_inscripciones || 0,
                        inscripcionesPendientes: response.data.inscripciones_pendientes || 0,
                        inscripcionesAprobadas: response.data.inscripciones_aprobadas || 0,
                        inscripcionesRechazadas: response.data.inscripciones_rechazadas || 0,
                        ingresosTotales: response.data.ingresos_totales || 0,
                        ingresosEsteMes: response.data.ingresos_este_mes || 0,
                        cursosPopulares: response.data.cursos_populares || [],
                        tendenciaInscripciones: response.data.tendencia_inscripciones || []
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar las estadísticas' }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== DESCUENTOS Y PROMOCIONES ====================
    async applyDiscount(inscripcionId, discountCode) {
        try {
            console.log('Aplicando descuento:', inscripcionId, discountCode)
            const response = await apiService.post(`/enrollments/${inscripcionId}/apply-discount`, {
                codigo: discountCode
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'Código de descuento inválido' }
        } catch (error) {
            console.error('Error aplicando descuento:', error)
            return { success: false, error: error.message }
        }
    }

    async validateDiscountCode(code, cursoId) {
        try {
            console.log('Validando código de descuento:', code, cursoId)
            const response = await apiService.post('/enrollments/validate-discount', {
                codigo: code,
                cursoId
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'Código inválido' }
        } catch (error) {
            console.error('Error validando descuento:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== CERTIFICADOS ====================
    async generateCertificate(inscripcionId) {
        try {
            console.log('Generando certificado:', inscripcionId)
            const response = await apiService.post(`/enrollments/${inscripcionId}/generate-certificate`)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo generar el certificado' }
        } catch (error) {
            console.error('Error generando certificado:', error)
            return { success: false, error: error.message }
        }
    }

    async getUserCertificates(userId) {
        try {
            console.log('Obteniendo certificados de usuario:', userId)
            const response = await apiService.get(`/enrollments/certificates/${userId}`)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudieron cargar los certificados' }
        } catch (error) {
            console.error('Error obteniendo certificados:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== HELPERS ====================
    getStatusLabel(status) {
        const labels = {
            'pendiente': 'Pendiente',
            'habilitado': 'Aprobado',
            'rechazado': 'Rechazado',
            'expirado': 'Expirado',
            'cancelado': 'Cancelado'
        }
        return labels[status] || status
    }

    getStatusColor(status) {
        const colors = {
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'habilitado': 'bg-green-100 text-green-800',
            'rechazado': 'bg-red-100 text-red-800',
            'expirado': 'bg-gray-100 text-gray-800',
            'cancelado': 'bg-gray-100 text-gray-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }

    formatEnrollmentForDisplay(enrollment) {
        return {
            ...enrollment,
            statusLabel: this.getStatusLabel(enrollment.estado || enrollment.estadoPago),
            statusColor: this.getStatusColor(enrollment.estado || enrollment.estadoPago),
            fechaInscripcion: enrollment.fecha_inscripcion || enrollment.fechaInscripcion,
            fechaHabilitacion: enrollment.fecha_habilitacion || enrollment.fechaHabilitacion,
            curso: {
                ...enrollment.curso,
                titulo: enrollment.curso?.titulo,
                precio: enrollment.curso?.precio,
                esGratuito: enrollment.curso?.es_gratuito || enrollment.curso?.esGratuito
            },
            usuario: {
                ...enrollment.usuario,
                nombreCompleto: enrollment.usuario?.nombre_completo || enrollment.usuario?.nombreCompleto,
                email: enrollment.usuario?.email
            }
        }
    }

    generateWhatsAppURL(phoneNumber, message) {
        const encodedMessage = encodeURIComponent(message)
        return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    calculateDaysFromEnrollment(enrollmentDate) {
        const now = new Date()
        const enrollment = new Date(enrollmentDate)
        const diffTime = Math.abs(now - enrollment)
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }
}

export default new EnrollmentsService()