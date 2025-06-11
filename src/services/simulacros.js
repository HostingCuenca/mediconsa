// src/services/simulacros.js - Servicio de simulacros refactorizado para Node.js Backend
import apiService from './api'

class SimulacrosService {

    // =============================================
    // OBTENER SIMULACROS POR CURSO
    // =============================================
    async getSimulacrosByCourse(cursoId) {
        try {
            const response = await apiService.get(`/simulacros/course/${cursoId}`)

            return {
                success: true,
                data: response.data || response,
                simulacros: response.data?.simulacros || response.simulacros || [],
                curso: response.data?.curso || response.curso || null
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                simulacros: []
            }
        }
    }

    // =============================================
    // OBTENER PREGUNTAS DEL SIMULACRO
    // =============================================
    async getSimulacroQuestions(simulacroId) {
        try {
            const response = await apiService.get(`/simulacros/${simulacroId}/questions`)

            return {
                success: true,
                data: response.data || response,
                simulacro: response.data?.simulacro || response.simulacro || null,
                preguntas: response.data?.preguntas || response.preguntas || [],
                configuracion: response.data?.configuracion || response.configuracion || {}
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                simulacro: null,
                preguntas: []
            }
        }
    }

    // =============================================
    // ENVIAR RESPUESTAS DEL SIMULACRO
    // =============================================
    async submitSimulacro(simulacroId, respuestas, tiempoEmpleadoMinutos = null) {
        try {
            const response = await apiService.post(`/simulacros/${simulacroId}/submit`, {
                respuestas,
                tiempoEmpleadoMinutos
            })

            return {
                success: true,
                data: response.data || response,
                intentoId: response.data?.intentoId || response.intentoId,
                puntaje: response.data?.puntaje || response.puntaje || 0,
                respuestasCorrectas: response.data?.respuestasCorrectas || response.respuestasCorrectas || 0,
                totalPreguntas: response.data?.totalPreguntas || response.totalPreguntas || 0,
                modoEvaluacion: response.data?.modoEvaluacion || response.modoEvaluacion,
                detalle: response.data?.detalle || response.detalle || null,
                message: response.message || 'Simulacro completado exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // OBTENER MIS INTENTOS
    // =============================================
    async getMyAttempts(filters = {}) {
        try {
            const queryString = apiService.buildQueryString(filters)
            const response = await apiService.get(`/simulacros/my-attempts${queryString}`)

            return {
                success: true,
                data: response.data || response,
                intentos: response.data?.intentos || response.intentos || []
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                intentos: []
            }
        }
    }

    // =============================================
    // OBTENER DETALLE DE INTENTO
    // =============================================
    async getAttemptDetail(intentoId) {
        try {
            const response = await apiService.get(`/simulacros/attempt/${intentoId}`)

            return {
                success: true,
                data: response.data || response,
                intento: response.data?.intento || response.intento || null,
                detalle: response.data?.detalle || response.detalle || null,
                mensaje: response.data?.mensaje || response.mensaje || null
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                intento: null
            }
        }
    }

    // =============================================
    // HELPER: CALCULAR ESTADÍSTICAS DE INTENTO
    // =============================================
    calculateAttemptStats(intento) {
        if (!intento) return null

        const porcentaje = intento.puntaje || 0
        const correctas = intento.respuestas_correctas || 0
        const total = intento.total_preguntas || 0

        let estado = 'reprobado'
        let color = 'red'

        if (porcentaje >= 80) {
            estado = 'excelente'
            color = 'green'
        } else if (porcentaje >= 70) {
            estado = 'bueno'
            color = 'blue'
        } else if (porcentaje >= 60) {
            estado = 'regular'
            color = 'yellow'
        }

        return {
            porcentaje: Math.round(porcentaje),
            correctas,
            total,
            incorrectas: total - correctas,
            estado,
            color,
            tiempoEmpleado: intento.tiempo_empleado_minutos || 0
        }
    }

    // =============================================
    // HELPER: FORMATEAR TIEMPO
    // =============================================
    formatTime(minutos) {
        if (!minutos) return '0 min'

        const horas = Math.floor(minutos / 60)
        const mins = minutos % 60

        if (horas > 0) {
            return `${horas}h ${mins}m`
        }

        return `${mins} min`
    }

    // =============================================
    // HELPER: OBTENER ETIQUETA DE MODO
    // =============================================
    getModeLabel(modoEvaluacion) {
        const modos = {
            'practica': {
                label: 'Práctica',
                description: 'Con retroalimentación inmediata',
                color: 'blue'
            },
            'realista': {
                label: 'Realista',
                description: 'Solo muestra puntaje final',
                color: 'yellow'
            },
            'examen': {
                label: 'Examen',
                description: 'Sin retroalimentación',
                color: 'red'
            }
        }

        return modos[modoEvaluacion] || {
            label: 'Desconocido',
            description: '',
            color: 'gray'
        }
    }

    // =============================================
    // FUNCIONES LEGACY (para compatibilidad)
    // =============================================
    async obtenerSimulacrosPorCurso(cursoId) {
        return await this.getSimulacrosByCourse(cursoId)
    }

    async obtenerPreguntasSimulacro(simulacroId) {
        return await this.getSimulacroQuestions(simulacroId)
    }

    async enviarRespuestas(simulacroId, respuestas, tiempo) {
        return await this.submitSimulacro(simulacroId, respuestas, tiempo)
    }

    async obtenerMisIntentos(filtros = {}) {
        return await this.getMyAttempts(filtros)
    }

    async obtenerDetalleIntento(intentoId) {
        return await this.getAttemptDetail(intentoId)
    }
}

export default new SimulacrosService()