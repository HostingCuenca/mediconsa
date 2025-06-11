// src/services/progress.js - Servicio de progreso
import apiService from './api'

class ProgressService {
    // =============================================
    // ACTUALIZAR PROGRESO DE CLASE
    // =============================================
    async updateClassProgress(claseId, porcentajeVisto, completada = false) {
        try {
            return await apiService.patch(`/progress/class/${claseId}`, {
                porcentajeVisto,
                completada
            })
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // OBTENER PROGRESO DE CURSO
    // =============================================
    async getCourseProgress(cursoId) {
        try {
            return await apiService.get(`/progress/course/${cursoId}`)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // OBTENER PROGRESO GENERAL
    // =============================================
    async getMyOverallProgress() {
        try {
            return await apiService.get('/progress/my-overall')
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

export default new ProgressService()