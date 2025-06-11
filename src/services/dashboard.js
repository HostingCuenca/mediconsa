// src/services/dashboard.js - Servicio de dashboard
import apiService from './api'

class DashboardService {
    // =============================================
    // DASHBOARD ESTUDIANTE
    // =============================================
    async getStudentDashboard() {
        try {
            return await apiService.get('/dashboard/student')
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // DASHBOARD ADMIN
    // =============================================
    async getAdminDashboard() {
        try {
            return await apiService.get('/dashboard/admin')
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

export default new DashboardService()