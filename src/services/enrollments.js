// src/services/enrollments.js - Servicio de inscripciones
import apiService from './api'

class EnrollmentsService {
    // =============================================
    // INSCRIBIRSE A CURSO
    // =============================================
    async enrollInCourse(cursoId) {
        try {
            return await apiService.post('/enrollments', { cursoId })
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // MIS INSCRIPCIONES
    // =============================================
    async getMyEnrollments() {
        try {
            return await apiService.get('/enrollments/my')
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // VERIFICAR ACCESO A CURSO
    // =============================================
    async checkCourseAccess(cursoId) {
        try {
            return await apiService.get(`/enrollments/check-access/${cursoId}`)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // ADMIN: PAGOS PENDIENTES
    // =============================================
    async getPendingPayments() {
        try {
            return await apiService.get('/enrollments/pending')
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // ADMIN: APROBAR PAGO
    // =============================================
    async approvePayment(inscripcionId) {
        try {
            return await apiService.patch(`/enrollments/${inscripcionId}/approve`)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

export default new EnrollmentsService()