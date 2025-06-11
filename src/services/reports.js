// src/services/reports.js - NUEVO SERVICIO
import apiService from './api'

class ReportsService {

    async getGeneralReport() {
        try {
            const response = await apiService.get('/reports/general')

            return {
                success: true,
                data: response.data || response
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: {}
            }
        }
    }

    async getPopularCourses() {
        try {
            const response = await apiService.get('/reports/popular-courses')

            return {
                success: true,
                data: response.data || response,
                cursosPopulares: response.data?.cursosPopulares || response.cursosPopulares || []
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                cursosPopulares: []
            }
        }
    }
}

export default new ReportsService()