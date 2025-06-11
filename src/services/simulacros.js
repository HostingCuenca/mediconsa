// src/services/simulacros.js - Servicio de simulacros
import apiService from './api'

class SimulacrosService {
    // =============================================
    // OBTENER SIMULACROS POR CURSO
    // =============================================
    async getSimulacrosByCourse(cursoId) {
        try {
            return await apiService.get(`/simulacros/course/${cursoId}`)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // OBTENER PREGUNTAS DEL SIMULACRO
    // =============================================
    async getSimulacroQuestions(simulacroId) {
        try {
            return await apiService.get(`/simulacros/${simulacroId}/questions`)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // ENVIAR RESPUESTAS
    // =============================================
    async submitSimulacro(simulacroId, respuestas, tiempoEmpleadoMinutos) {
        try {
            return await apiService.post(`/simulacros/${simulacroId}/submit`, {
                respuestas,
                tiempoEmpleadoMinutos
            })
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // MIS INTENTOS
    // =============================================
    async getMyAttempts(filters = {}) {
        try {
            const params = new URLSearchParams()

            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== '') {
                    params.append(key, filters[key])
                }
            })

            const queryString = params.toString()
            const endpoint = queryString ? `/simulacros/my-attempts?${queryString}` : '/simulacros/my-attempts'

            return await apiService.get(endpoint)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // DETALLE DE INTENTO
    // =============================================
    async getAttemptDetail(intentoId) {
        try {
            return await apiService.get(`/simulacros/attempt/${intentoId}`)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

export default new SimulacrosService()