// src/services/simulacros.js - COMPLETO AL 100%
import apiService from './api'

class SimulacrosService {

    // ==================== SIMULACROS POR CURSO ====================
    async getSimulacrosByCourse(cursoId) {
        try {
            console.log('Obteniendo simulacros por curso:', cursoId)
            const response = await apiService.get(`/simulacros/course/${cursoId}`)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        simulacros: response.data.simulacros || [],
                        curso: response.data.curso || {},
                        estadisticas: response.data.estadisticas || {}
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar los simulacros' }
        } catch (error) {
            console.error('Error obteniendo simulacros:', error)
            return { success: false, error: error.message }
        }
    }

    async getSimulacroQuestions(simulacroId) {
        try {
            console.log('Obteniendo preguntas del simulacro:', simulacroId)
            const response = await apiService.get(`/simulacros/${simulacroId}/questions`)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        simulacro: response.data.simulacro,
                        preguntas: response.data.preguntas || [],
                        configuracion: response.data.configuracion || {}
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar las preguntas' }
        } catch (error) {
            console.error('Error obteniendo preguntas:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== ENVÍO DE RESPUESTAS ====================
    async submitSimulacro(simulacroId, submissionData) {
        try {
            console.log('Enviando respuestas del simulacro:', simulacroId)
            const response = await apiService.post(`/simulacros/${simulacroId}/submit`, {
                respuestas: submissionData.respuestas,
                tiempoEmpleadoMinutos: submissionData.tiempoEmpleadoMinutos,
                configuracion: submissionData.configuracion
            })

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        intentoId: response.data.intentoId,
                        puntaje: response.data.puntaje,
                        respuestasCorrectas: response.data.respuestasCorrectas,
                        totalPreguntas: response.data.totalPreguntas,
                        modoEvaluacion: response.data.modoEvaluacion,
                        detalle: response.data.detalle || [],
                        estadisticas: response.data.estadisticas || {},
                        recomendaciones: response.data.recomendaciones || []
                    }
                }
            }

            return { success: false, error: 'No se pudo procesar el simulacro' }
        } catch (error) {
            console.error('Error enviando simulacro:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== INTENTOS DEL USUARIO ====================
    async getMyAttempts(filters = {}) {
        try {
            console.log('Obteniendo mis intentos:', filters)
            const response = await apiService.get('/simulacros/my-attempts', filters)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        intentos: response.data.intentos || [],
                        estadisticas: response.data.estadisticas || {},
                        progreso: response.data.progreso || {}
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar los intentos' }
        } catch (error) {
            console.error('Error obteniendo intentos:', error)
            return { success: false, error: error.message }
        }
    }

    async getAttemptDetail(intentoId) {
        try {
            console.log('Obteniendo detalle del intento:', intentoId)
            const response = await apiService.get(`/simulacros/attempt/${intentoId}`)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        intento: response.data.intento,
                        respuestas: response.data.respuestas || [],
                        analisis: response.data.analisis || {},
                        recomendaciones: response.data.recomendaciones || []
                    }
                }
            }

            return { success: false, error: 'No se pudo cargar el detalle del intento' }
        } catch (error) {
            console.error('Error obteniendo detalle:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== ADMINISTRACIÓN DE SIMULACROS ====================
    async getAllSimulacros(filters = {}) {
        try {
            console.log('Obteniendo todos los simulacros:', filters)
            const response = await apiService.get('/admin/simulacros', filters)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        simulacros: response.data.simulacros || [],
                        total: response.data.total || 0,
                        estadisticas: response.data.estadisticas || {},
                        pagination: response.data.pagination || {}
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar los simulacros' }
        } catch (error) {
            console.error('Error obteniendo simulacros admin:', error)
            return { success: false, error: error.message }
        }
    }

    async createSimulacro(simulacroData) {
        try {
            console.log('Creando simulacro:', simulacroData)
            const response = await apiService.post('/course-management/simulacros', simulacroData)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo crear el simulacro' }
        } catch (error) {
            console.error('Error creando simulacro:', error)
            return { success: false, error: error.message }
        }
    }

    async updateSimulacro(simulacroId, simulacroData) {
        try {
            console.log('Actualizando simulacro:', simulacroId, simulacroData)
            const response = await apiService.patch(`/course-management/simulacros/${simulacroId}`, simulacroData)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo actualizar el simulacro' }
        } catch (error) {
            console.error('Error actualizando simulacro:', error)
            return { success: false, error: error.message }
        }
    }

    async deleteSimulacro(simulacroId) {
        try {
            console.log('Eliminando simulacro:', simulacroId)
            const response = await apiService.delete(`/course-management/simulacros/${simulacroId}`)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo eliminar el simulacro' }
        } catch (error) {
            console.error('Error eliminando simulacro:', error)
            return { success: false, error: error.message }
        }
    }

    async duplicateSimulacro(simulacroId, newTitle) {
        try {
            console.log('Duplicando simulacro:', simulacroId, newTitle)
            const response = await apiService.post(`/course-management/simulacros/${simulacroId}/duplicate`, {
                titulo: newTitle
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo duplicar el simulacro' }
        } catch (error) {
            console.error('Error duplicando simulacro:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== GESTIÓN DE PREGUNTAS ====================
    async createQuestion(questionData) {
        try {
            console.log('Creando pregunta:', questionData)
            const response = await apiService.post('/course-management/questions', questionData)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo crear la pregunta' }
        } catch (error) {
            console.error('Error creando pregunta:', error)
            return { success: false, error: error.message }
        }
    }

    async updateQuestion(preguntaId, questionData) {
        try {
            console.log('Actualizando pregunta:', preguntaId, questionData)
            const response = await apiService.patch(`/course-management/questions/${preguntaId}`, questionData)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo actualizar la pregunta' }
        } catch (error) {
            console.error('Error actualizando pregunta:', error)
            return { success: false, error: error.message }
        }
    }

    async deleteQuestion(preguntaId) {
        try {
            console.log('Eliminando pregunta:', preguntaId)
            const response = await apiService.delete(`/course-management/questions/${preguntaId}`)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo eliminar la pregunta' }
        } catch (error) {
            console.error('Error eliminando pregunta:', error)
            return { success: false, error: error.message }
        }
    }

    async importQuestions(simulacroId, questions) {
        try {
            console.log('Importando preguntas:', simulacroId, questions.length)
            const response = await apiService.post('/course-management/questions/bulk', {
                simulacroId,
                questions
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudieron importar las preguntas' }
        } catch (error) {
            console.error('Error importando preguntas:', error)
            return { success: false, error: error.message }
        }
    }

    async exportQuestions(simulacroId, format = 'json') {
        try {
            console.log('Exportando preguntas:', simulacroId, format)
            const response = await apiService.get(`/course-management/simulacros/${simulacroId}/export`, {
                format
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudieron exportar las preguntas' }
        } catch (error) {
            console.error('Error exportando preguntas:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== ESTADÍSTICAS Y ANÁLISIS ====================
    async getSimulacroStats(simulacroId) {
        try {
            console.log('Obteniendo estadísticas del simulacro:', simulacroId)
            const response = await apiService.get(`/admin/simulacros/${simulacroId}/stats`)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        intentosTotales: response.data.intentos_totales || 0,
                        promedioGeneral: response.data.promedio_general || 0,
                        mejorPuntaje: response.data.mejor_puntaje || 0,
                        peorPuntaje: response.data.peor_puntaje || 0,
                        tiempoPromedio: response.data.tiempo_promedio || 0,
                        preguntasDificiles: response.data.preguntas_dificiles || [],
                        distribucionPuntajes: response.data.distribucion_puntajes || [],
                        tendencias: response.data.tendencias || []
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar las estadísticas' }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error)
            return { success: false, error: error.message }
        }
    }

    async getUserSimulacroStats(userId, simulacroId) {
        try {
            console.log('Obteniendo estadísticas de usuario:', userId, simulacroId)
            const response = await apiService.get(`/admin/simulacros/${simulacroId}/user/${userId}/stats`)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudieron cargar las estadísticas' }
        } catch (error) {
            console.error('Error obteniendo estadísticas de usuario:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== CONFIGURACIÓN Y VALIDACIÓN ====================
    async validateSimulacroConfig(config) {
        const errors = {}

        if (!config.titulo?.trim()) {
            errors.titulo = 'El título es requerido'
        }

        if (!config.cursoId) {
            errors.cursoId = 'El curso es requerido'
        }

        if (!config.modoEvaluacion) {
            errors.modoEvaluacion = 'El modo de evaluación es requerido'
        } else if (!['practica', 'realista', 'examen'].includes(config.modoEvaluacion)) {
            errors.modoEvaluacion = 'Modo de evaluación inválido'
        }

        if (!config.numeroPreguntas || config.numeroPreguntas < 1) {
            errors.numeroPreguntas = 'Debe tener al menos 1 pregunta'
        }

        if (config.tiempoLimiteMinutos && config.tiempoLimiteMinutos < 1) {
            errors.tiempoLimiteMinutos = 'El tiempo límite debe ser mayor a 0'
        }

        if (config.intentosPermitidos && config.intentosPermitidos < -1) {
            errors.intentosPermitidos = 'Los intentos permitidos deben ser -1 (ilimitados) o mayor a 0'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    async validateQuestionData(questionData) {
        const errors = {}

        if (!questionData.enunciado?.trim()) {
            errors.enunciado = 'El enunciado es requerido'
        }

        if (!questionData.simulacroId) {
            errors.simulacroId = 'El simulacro es requerido'
        }

        if (!questionData.tipoPregunta) {
            errors.tipoPregunta = 'El tipo de pregunta es requerido'
        }

        if (!questionData.opciones || questionData.opciones.length < 2) {
            errors.opciones = 'Debe tener al menos 2 opciones'
        }

        const correctAnswers = questionData.opciones?.filter(op => op.esCorrecta) || []
        if (correctAnswers.length === 0) {
            errors.respuestaCorrecta = 'Debe tener al menos una respuesta correcta'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    // ==================== HELPERS ====================
    getModoEvaluacionLabel(modo) {
        const labels = {
            'practica': 'Práctica',
            'realista': 'Realista',
            'examen': 'Examen'
        }
        return labels[modo] || modo
    }

    getModoEvaluacionColor(modo) {
        const colors = {
            'practica': 'bg-blue-100 text-blue-800',
            'realista': 'bg-yellow-100 text-yellow-800',
            'examen': 'bg-red-100 text-red-800'
        }
        return colors[modo] || 'bg-gray-100 text-gray-800'
    }

    getTipoPreguntaLabel(tipo) {
        const labels = {
            'multiple': 'Opción Múltiple',
            'multiple_respuesta': 'Múltiple Respuesta',
            'completar': 'Completar',
            'unir': 'Unir Conceptos',
            'rellenar': 'Rellenar Espacios'
        }
        return labels[tipo] || tipo
    }

    calculateGrade(correctAnswers, totalQuestions) {
        if (totalQuestions === 0) return 0
        return Math.round((correctAnswers / totalQuestions) * 100)
    }

    getGradeColor(grade) {
        if (grade >= 80) return 'text-green-600'
        if (grade >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    getGradeLabel(grade) {
        if (grade >= 90) return 'Excelente'
        if (grade >= 80) return 'Muy Bueno'
        if (grade >= 70) return 'Bueno'
        if (grade >= 60) return 'Regular'
        return 'Necesita Mejorar'
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60

        if (hours > 0) {
            return `${hours}h ${mins}m`
        }
        return `${mins}m`
    }

    formatTimeSeconds(seconds) {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60

        if (minutes > 0) {
            return `${minutes}:${secs.toString().padStart(2, '0')}`
        }
        return `0:${secs.toString().padStart(2, '0')}`
    }

    shuffleArray(array) {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }

    generateQuestionId() {
        return 'q_' + Math.random().toString(36).substr(2, 9)
    }

    // ==================== EXPORTAR/IMPORTAR ====================
    async exportSimulacroTemplate() {
        return {
            success: true,
            data: {
                template: {
                    titulo: '',
                    descripcion: '',
                    modoEvaluacion: 'practica',
                    numeroPreguntas: 10,
                    tiempoLimiteMinutos: 60,
                    intentosPermitidos: -1,
                    randomizarPreguntas: true,
                    randomizarOpciones: true,
                    mostrarRespuestasDespues: 1,
                    preguntas: [
                        {
                            enunciado: '',
                            tipoPregunta: 'multiple',
                            explicacion: '',
                            imagenUrl: '',
                            opciones: [
                                { textoOpcion: '', esCorrecta: false },
                                { textoOpcion: '', esCorrecta: true },
                                { textoOpcion: '', esCorrecta: false },
                                { textoOpcion: '', esCorrecta: false }
                            ]
                        }
                    ]
                }
            }
        }
    }

    parseImportedQuestions(data) {
        try {
            const questions = []

            if (Array.isArray(data)) {
                data.forEach((item, index) => {
                    const question = this.validateImportedQuestion(item, index)
                    if (question) questions.push(question)
                })
            }

            return {
                success: true,
                data: { questions, total: questions.length }
            }
        } catch (error) {
            return {
                success: false,
                error: 'Error procesando el archivo: ' + error.message
            }
        }
    }

    validateImportedQuestion(item, index) {
        const errors = []

        if (!item.enunciado?.trim()) {
            errors.push(`Pregunta ${index + 1}: Enunciado requerido`)
        }

        if (!item.opciones || !Array.isArray(item.opciones) || item.opciones.length < 2) {
            errors.push(`Pregunta ${index + 1}: Debe tener al menos 2 opciones`)
        }

        const correctAnswers = item.opciones?.filter(op => op.esCorrecta) || []
        if (correctAnswers.length === 0) {
            errors.push(`Pregunta ${index + 1}: Debe tener al menos una respuesta correcta`)
        }

        if (errors.length > 0) {
            console.warn('Errores en importación:', errors)
            return null
        }

        return {
            enunciado: item.enunciado.trim(),
            tipoPregunta: item.tipoPregunta || 'multiple',
            explicacion: item.explicacion || '',
            imagenUrl: item.imagenUrl || '',
            opciones: item.opciones.map(op => ({
                textoOpcion: op.textoOpcion?.trim() || '',
                esCorrecta: Boolean(op.esCorrecta)
            }))
        }
    }
}

export default new SimulacrosService()