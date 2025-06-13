// src/services/simulacros.js - ALINEADO CON BACKEND
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
                tiempoEmpleadoMinutos: submissionData.tiempoEmpleadoMinutos
            })

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        intentoId: response.data.intentoId,
                        puntaje: response.data.puntaje,
                        respuestasCorrectas: response.data.respuestasCorrectas,
                        totalPreguntas: response.data.totalPreguntas,
                        tiempoEmpleado: response.data.tiempoEmpleado,
                        modoEvaluacion: response.data.modoEvaluacion,
                        detalle: response.data.detalle || [],
                        resumen: response.data.resumen || '',
                        estadisticas: response.data.estadisticas || {}
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

            // ✅ CORREGIDO: Usar query parameters correctamente
            const params = new URLSearchParams()
            if (filters.simulacroId) params.append('simulacroId', filters.simulacroId)
            if (filters.cursoId) params.append('cursoId', filters.cursoId)
            if (filters.page) params.append('page', filters.page)
            if (filters.limit) params.append('limit', filters.limit)

            const queryString = params.toString()
            const url = `/simulacros/my-attempts${queryString ? `?${queryString}` : ''}`

            const response = await apiService.get(url)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        intentos: response.data.intentos || [],
                        estadisticas: response.data.estadisticas || {},
                        pagination: response.data.pagination || {}
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
    // Nota: Estos métodos pueden no estar implementados en el backend actual
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

    // ==================== HELPERS ALINEADOS CON BACKEND ====================
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
        if (grade >= 80) return 'text-green-600 bg-green-50'
        if (grade >= 60) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    getGradeLabel(grade) {
        if (grade >= 90) return 'Excelente'
        if (grade >= 80) return 'Muy Bueno'
        if (grade >= 70) return 'Bueno'
        if (grade >= 60) return 'Regular'
        return 'Necesita Mejorar'
    }

    formatTime(minutes) {
        if (!minutes || minutes === 0) return '0m'

        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60

        if (hours > 0) {
            return `${hours}h ${mins}m`
        }
        return `${mins}m`
    }

    formatTimeSeconds(seconds) {
        if (!seconds || seconds === 0) return '0:00'

        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60

        if (minutes > 0) {
            return `${minutes}:${secs.toString().padStart(2, '0')}`
        }
        return `0:${secs.toString().padStart(2, '0')}`
    }

    // ==================== VALIDACIÓN ESPECÍFICA PARA BACKEND ====================
    async validateSimulacroConfig(config) {
        const errors = {}

        if (!config.titulo?.trim()) {
            errors.titulo = 'El título es requerido'
        }

        if (!config.cursoId) {
            errors.cursoId = 'El curso es requerido'
        }

        if (!config.modo_evaluacion) {
            errors.modo_evaluacion = 'El modo de evaluación es requerido'
        } else if (!['practica', 'realista', 'examen'].includes(config.modo_evaluacion)) {
            errors.modo_evaluacion = 'Modo de evaluación inválido'
        }

        if (!config.numero_preguntas || config.numero_preguntas < 1) {
            errors.numero_preguntas = 'Debe tener al menos 1 pregunta'
        }

        if (config.tiempo_limite_minutos && config.tiempo_limite_minutos < 1) {
            errors.tiempo_limite_minutos = 'El tiempo límite debe ser mayor a 0'
        }

        if (config.intentos_permitidos && config.intentos_permitidos < -1) {
            errors.intentos_permitidos = 'Los intentos permitidos deben ser -1 (ilimitados) o mayor a 0'
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

        if (!questionData.simulacro_id) {
            errors.simulacro_id = 'El simulacro es requerido'
        }

        if (!questionData.tipo_pregunta) {
            errors.tipo_pregunta = 'El tipo de pregunta es requerido'
        }

        if (!questionData.opciones || questionData.opciones.length < 2) {
            errors.opciones = 'Debe tener al menos 2 opciones'
        }

        const correctAnswers = questionData.opciones?.filter(op => op.es_correcta) || []
        if (correctAnswers.length === 0) {
            errors.respuesta_correcta = 'Debe tener al menos una respuesta correcta'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    // ==================== FUNCIONES DE UTILIDAD ====================
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

    // ==================== FUNCIONES DE ANÁLISIS ====================
    analyzeAttemptResults(intento) {
        const puntaje = intento.puntaje || 0
        const comentarios = []
        const recomendaciones = []

        if (puntaje >= 90) {
            comentarios.push('¡Excelente desempeño! Dominas muy bien el tema.')
        } else if (puntaje >= 80) {
            comentarios.push('Muy buen trabajo. Solo algunos detalles por mejorar.')
        } else if (puntaje >= 70) {
            comentarios.push('Buen resultado. Con un poco más de estudio puedes mejorar.')
            recomendaciones.push('Repasa los temas donde tuviste errores')
        } else if (puntaje >= 60) {
            comentarios.push('Resultado regular. Necesitas estudiar más algunos temas.')
            recomendaciones.push('Dedica más tiempo al estudio de los conceptos básicos')
            recomendaciones.push('Practica más simulacros')
        } else {
            comentarios.push('Necesitas mejorar significativamente. Te recomendamos repasar todo el material.')
            recomendaciones.push('Revisa todo el material del curso')
            recomendaciones.push('Considera solicitar ayuda adicional')
            recomendaciones.push('Practica regularmente con simulacros')
        }

        return {
            comentario: comentarios.join(' '),
            recomendaciones,
            nivel: this.getGradeLabel(puntaje)
        }
    }

    // ==================== FUNCIONES DE FORMATEO ====================
    formatAttemptForDisplay(intento) {
        return {
            ...intento,
            puntaje_formateado: `${intento.puntaje}%`,
            fecha_formateada: this.formatDate(intento.fecha_intento),
            tiempo_formateado: this.formatTime(intento.tiempo_empleado_minutos),
            estado_color: this.getGradeColor(intento.puntaje),
            estado_label: this.getGradeLabel(intento.puntaje)
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'No disponible'
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // ==================== FUNCIONES DE EXPORTACIÓN ====================
    async exportSimulacroTemplate() {
        return {
            success: true,
            data: {
                template: {
                    titulo: '',
                    descripcion: '',
                    modo_evaluacion: 'practica',
                    numero_preguntas: 10,
                    tiempo_limite_minutos: 60,
                    tiempo_por_pregunta_segundos: null,
                    intentos_permitidos: -1,
                    randomizar_preguntas: true,
                    randomizar_opciones: true,
                    mostrar_respuestas_despues: 1,
                    preguntas: [
                        {
                            enunciado: '',
                            tipo_pregunta: 'multiple',
                            explicacion: '',
                            imagen_url: '',
                            opciones: [
                                { texto_opcion: '', es_correcta: false, orden: 1 },
                                { texto_opcion: '', es_correcta: true, orden: 2 },
                                { texto_opcion: '', es_correcta: false, orden: 3 },
                                { texto_opcion: '', es_correcta: false, orden: 4 }
                            ]
                        }
                    ]
                }
            }
        }
    }

    // ==================== CONSTANTES Y CONFIGURACIÓN ====================
    get MODOS_EVALUACION() {
        return {
            PRACTICA: 'practica',
            REALISTA: 'realista',
            EXAMEN: 'examen'
        }
    }

    get TIPOS_PREGUNTA() {
        return {
            MULTIPLE: 'multiple',
            MULTIPLE_RESPUESTA: 'multiple_respuesta',
            COMPLETAR: 'completar',
            UNIR: 'unir',
            RELLENAR: 'rellenar'
        }
    }

    get ESTADOS_INTENTO() {
        return {
            INICIADO: 'iniciado',
            EN_PROGRESO: 'en_progreso',
            COMPLETADO: 'completado',
            ABANDONADO: 'abandonado'
        }
    }
}

export default new SimulacrosService()