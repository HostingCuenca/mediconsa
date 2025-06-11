// src/services/enrollments.js - Servicio de inscripciones refactorizado para Node.js Backend
import apiService from './api'

class EnrollmentsService {

    // =============================================
    // INSCRIBIRSE A UN CURSO
    // =============================================
    async enrollCourse(cursoId) {
        try {
            const response = await apiService.post('/enrollments', { cursoId })

            return {
                success: true,
                data: response.data || response,
                inscripcion: response.data?.inscripcion || response.inscripcion || null,
                whatsappMessage: response.data?.whatsappMessage || response.whatsappMessage || '',
                message: response.message || 'Inscripción procesada exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // OBTENER MIS INSCRIPCIONES
    // =============================================
    async getMyEnrollments() {
        try {
            const response = await apiService.get('/enrollments/my')

            return {
                success: true,
                data: response.data || response,
                inscripciones: response.data?.inscripciones || response.inscripciones || []
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                inscripciones: []
            }
        }
    }

    // =============================================
    // VERIFICAR ACCESO A CURSO
    // =============================================
    async checkCourseAccess(cursoId) {
        try {
            const response = await apiService.get(`/enrollments/check-access/${cursoId}`)

            return {
                success: true,
                data: response.data || response,
                tieneAcceso: response.data?.tieneAcceso || false,
                esGratuito: response.data?.esGratuito || false,
                estadoPago: response.data?.estadoPago || 'no_inscrito'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                tieneAcceso: false,
                estadoPago: 'error'
            }
        }
    }

    // =============================================
    // OBTENER PAGOS PENDIENTES (ADMIN)
    // =============================================
    async getPendingPayments() {
        try {
            const response = await apiService.get('/enrollments/pending')

            return {
                success: true,
                data: response.data || response,
                pagosPendientes: response.data?.pagosPendientes || response.pagosPendientes || [],
                total: response.data?.total || response.total || 0
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                pagosPendientes: []
            }
        }
    }

    // =============================================
    // APROBAR PAGO (ADMIN)
    // =============================================
    async approvePayment(inscripcionId) {
        try {
            const response = await apiService.patch(`/enrollments/${inscripcionId}/approve`)

            return {
                success: true,
                data: response.data || response,
                inscripcion: response.data?.inscripcion || response.inscripcion || null,
                message: response.message || 'Pago aprobado exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // GENERAR MENSAJE DE WHATSAPP
    // =============================================
    generateWhatsAppMessage(curso, usuario) {
        const mensaje = `Hola, soy ${usuario} y quiero acceso al curso "${curso.titulo}". Precio: $${curso.precio}`
        const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '593985036066'
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(mensaje)}`
    }

    // =============================================
    // HELPER: OBTENER ESTADO DE INSCRIPCIÓN
    // =============================================
    getEnrollmentStatus(estadoPago, esGratuito) {
        if (esGratuito) {
            return {
                status: 'habilitado',
                label: 'Acceso Completo',
                color: 'green',
                canAccess: true
            }
        }

        switch (estadoPago) {
            case 'habilitado':
                return {
                    status: 'habilitado',
                    label: 'Acceso Completo',
                    color: 'green',
                    canAccess: true
                }
            case 'pendiente':
                return {
                    status: 'pendiente',
                    label: 'Pago Pendiente',
                    color: 'yellow',
                    canAccess: false
                }
            case 'no_inscrito':
                return {
                    status: 'no_inscrito',
                    label: 'No Inscrito',
                    color: 'gray',
                    canAccess: false
                }
            default:
                return {
                    status: 'error',
                    label: 'Error',
                    color: 'red',
                    canAccess: false
                }
        }
    }

    // =============================================
    // FUNCIONES LEGACY (para compatibilidad)
    // =============================================
    async inscribirseACurso(cursoId) {
        return await this.enrollCourse(cursoId)
    }

    async obtenerMisInscripciones() {
        return await this.getMyEnrollments()
    }

    async verificarAcceso(cursoId) {
        return await this.checkCourseAccess(cursoId)
    }

    async obtenerPagosPendientes() {
        return await this.getPendingPayments()
    }

    async aprobarPago(inscripcionId) {
        return await this.approvePayment(inscripcionId)
    }
}

export default new EnrollmentsService()