// src/services/courseManagement.js
import apiService from './api'

class CourseManagementService {

    // ==================== CURSOS ====================
    async createCourse(courseData) {
        try {
            // console.log('Creando curso:', courseData)
            const response = await apiService.post('/courses', courseData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Curso creado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando curso'
            }
        } catch (error) {
            console.error('Error creando curso:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async updateCourse(cursoId, courseData) {
        try {
            console.log('Actualizando curso:', cursoId, courseData)
            const response = await apiService.put(`/courses/${cursoId}`, courseData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Curso actualizado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error actualizando curso'
            }
        } catch (error) {
            console.error('Error actualizando curso:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async deleteCourse(cursoId) {
        try {
            console.log('Eliminando curso:', cursoId)
            const response = await apiService.delete(`/courses/${cursoId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Curso eliminado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error eliminando curso'
            }
        } catch (error) {
            console.error('Error eliminando curso:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async getCourseForEditing(cursoId) {
        try {
            console.log('Obteniendo curso para edición:', cursoId)
            const response = await apiService.get(`/course-management/course/${cursoId}`)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        curso: response.data.curso,
                        modulos: response.data.modulos || [],
                        simulacros: response.data.simulacros || [],
                        estadisticas: response.data.estadisticas || {},
                        tipos_pregunta_disponibles: response.data.tipos_pregunta_disponibles || {}
                    }
                }
            }

            return { success: false, error: response.message || 'No se pudo cargar el curso' }
        } catch (error) {
            console.error('Error obteniendo curso:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async getCourseStats(cursoId) {
        try {
            console.log('Obteniendo estadísticas del curso:', cursoId)
            const response = await apiService.get(`/course-management/course/${cursoId}/stats`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo estadísticas'
            }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== MÓDULOS ====================
    async createModule(moduleData) {
        try {
            console.log('Creando módulo:', moduleData)
            const response = await apiService.post('/course-management/modules', moduleData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Módulo creado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando módulo'
            }
        } catch (error) {
            console.error('Error creando módulo:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async updateModule(moduloId, moduleData) {
        try {
            console.log('Actualizando módulo:', moduloId, moduleData)
            const response = await apiService.patch(`/course-management/modules/${moduloId}`, moduleData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Módulo actualizado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error actualizando módulo'
            }
        } catch (error) {
            console.error('Error actualizando módulo:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async deleteModule(moduloId) {
        try {
            console.log('Eliminando módulo:', moduloId)
            const response = await apiService.delete(`/course-management/modules/${moduloId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Módulo eliminado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error eliminando módulo'
            }
        } catch (error) {
            console.error('Error eliminando módulo:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async reorderModules(cursoId, moduleOrders) {
        try {
            console.log('Reordenando módulos:', cursoId, moduleOrders)
            const response = await apiService.patch(`/course-management/modules/reorder`, {
                cursoId,
                moduleOrders
            })

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Módulos reordenados exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error reordenando módulos'
            }
        } catch (error) {
            console.error('Error reordenando módulos:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== CLASES ====================
    async createClass(classData) {
        try {
            console.log('Creando clase:', classData)
            const response = await apiService.post('/course-management/classes', classData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Clase creada exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando clase'
            }
        } catch (error) {
            console.error('Error creando clase:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async updateClass(claseId, classData) {
        try {
            console.log('Actualizando clase:', claseId, classData)
            const response = await apiService.patch(`/course-management/classes/${claseId}`, classData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Clase actualizada exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error actualizando clase'
            }
        } catch (error) {
            console.error('Error actualizando clase:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async deleteClass(claseId) {
        try {
            console.log('Eliminando clase:', claseId)
            const response = await apiService.delete(`/course-management/classes/${claseId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Clase eliminada exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error eliminando clase'
            }
        } catch (error) {
            console.error('Error eliminando clase:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async reorderClasses(moduloId, classOrders) {
        try {
            console.log('Reordenando clases:', moduloId, classOrders)
            const response = await apiService.patch(`/course-management/classes/reorder`, {
                moduloId,
                classOrders
            })

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Clases reordenadas exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error reordenando clases'
            }
        } catch (error) {
            console.error('Error reordenando clases:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== SIMULACROS AVANZADOS ====================

    // 🆕 NUEVO: Obtener configuraciones disponibles
    async getSimulacroConfigurations() {
        try {
            console.log('Obteniendo configuraciones de simulacro disponibles')
            const response = await apiService.get('/course-management/simulacro-configurations')

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo configuraciones'
            }
        } catch (error) {
            console.error('Error obteniendo configuraciones:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // 🆕 MEJORADO: Crear simulacro con configuraciones avanzadas
    async createSimulacro(simulacroData) {
        try {
            console.log('Creando simulacro avanzado:', simulacroData)

            // Validar datos antes de enviar
            const validation = this.validateSimulacroData(simulacroData)
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Datos inválidos: ${validation.errors.join(', ')}`
                }
            }

            const response = await apiService.post('/course-management/simulacros', simulacroData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Simulacro creado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando simulacro'
            }
        } catch (error) {
            console.error('Error creando simulacro:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // 🆕 MEJORADO: Actualizar simulacro con configuraciones avanzadas
    async updateSimulacro(simulacroId, simulacroData) {
        try {
            console.log('Actualizando simulacro avanzado:', simulacroId, simulacroData)
            const response = await apiService.patch(`/course-management/simulacros/${simulacroId}`, simulacroData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Simulacro actualizado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error actualizando simulacro'
            }
        } catch (error) {
            console.error('Error actualizando simulacro:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async deleteSimulacro(simulacroId) {
        try {
            console.log('Eliminando simulacro:', simulacroId)
            const response = await apiService.delete(`/course-management/simulacros/${simulacroId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Simulacro eliminado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error eliminando simulacro'
            }
        } catch (error) {
            console.error('Error eliminando simulacro:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async getSimulacroWithQuestions(simulacroId) {
        try {
            console.log('Obteniendo simulacro con preguntas:', simulacroId)
            const response = await apiService.get(`/course-management/simulacros/${simulacroId}/questions`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo simulacro'
            }
        } catch (error) {
            console.error('Error obteniendo simulacro:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== PREGUNTAS ====================

    // 🆕 NUEVO: Obtener tipos de pregunta disponibles
    async getQuestionTypes() {
        try {
            console.log('Obteniendo tipos de pregunta disponibles')
            const response = await apiService.get('/course-management/question-types')

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo tipos de pregunta'
            }
        } catch (error) {
            console.error('Error obteniendo tipos de pregunta:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async createQuestion(questionData) {
        try {
            console.log('Creando pregunta:', questionData)

            // Validar datos antes de enviar
            const validation = this.validateQuestionData(questionData)
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Datos inválidos: ${validation.errors.join(', ')}`
                }
            }

            const response = await apiService.post('/course-management/questions', questionData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Pregunta creada exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando pregunta'
            }
        } catch (error) {
            console.error('Error creando pregunta:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async updateQuestion(preguntaId, questionData) {
        try {
            console.log('Actualizando pregunta:', preguntaId, questionData)
            const response = await apiService.patch(`/course-management/questions/${preguntaId}`, questionData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Pregunta actualizada exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error actualizando pregunta'
            }
        } catch (error) {
            console.error('Error actualizando pregunta:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async deleteQuestion(preguntaId) {
        try {
            console.log('Eliminando pregunta:', preguntaId)
            const response = await apiService.delete(`/course-management/questions/${preguntaId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Pregunta eliminada exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error eliminando pregunta'
            }
        } catch (error) {
            console.error('Error eliminando pregunta:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    async createMultipleQuestions(simulacroId, questions) {
        try {
            console.log('Creando múltiples preguntas:', simulacroId, questions.length)

            // Validar todas las preguntas antes de enviar
            const errors = []
            questions.forEach((question, index) => {
                const validation = this.validateQuestionData(question)
                if (!validation.isValid) {
                    errors.push(`Pregunta ${index + 1}: ${validation.errors.join(', ')}`)
                }
            })

            if (errors.length > 0) {
                return {
                    success: false,
                    error: `Errores en preguntas: ${errors.join('; ')}`
                }
            }

            const response = await apiService.post('/course-management/questions/bulk', {
                simulacroId,
                questions
            })

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || `${questions.length} preguntas creadas exitosamente`
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando preguntas múltiples'
            }
        } catch (error) {
            console.error('Error creando preguntas múltiples:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== UTILIDADES ====================
    async validateYouTubeUrl(url) {
        try {
            const response = await apiService.post('/course-management/validate-youtube', { url })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: response.message || 'URL de YouTube inválida' }
        } catch (error) {
            return { success: false, error: 'URL de YouTube inválida' }
        }
    }

    async duplicateCourse(cursoId, newTitle) {
        try {
            console.log('Duplicando curso:', cursoId, newTitle)
            const response = await apiService.post(`/course-management/duplicate/${cursoId}`, {
                titulo: newTitle
            })

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Curso duplicado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error duplicando curso'
            }
        } catch (error) {
            console.error('Error duplicando curso:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== GESTIÓN DE MINIATURAS ====================
    async uploadThumbnail(file, courseId = null) {
        try {
            console.log('Subiendo miniatura:', file.name)

            // Por ahora simulamos el upload - en producción usar un servicio real
            const tempUrl = URL.createObjectURL(file)

            return {
                success: true,
                data: {
                    url: tempUrl,
                    filename: file.name
                },
                message: 'Miniatura subida exitosamente (simulado)'
            }
        } catch (error) {
            console.error('Error subiendo miniatura:', error)
            return { success: false, error: 'Error subiendo archivo' }
        }
    }

    async deleteThumbnail(thumbnailUrl) {
        try {
            console.log('Eliminando miniatura:', thumbnailUrl)

            // Simulado por ahora
            return {
                success: true,
                message: 'Miniatura eliminada exitosamente (simulado)'
            }
        } catch (error) {
            console.error('Error eliminando miniatura:', error)
            return { success: false, error: 'Error eliminando miniatura' }
        }
    }

    // ==================== VALIDACIONES AVANZADAS ====================
    validateCourseData(courseData) {
        const errors = {}

        if (!courseData.titulo?.trim()) {
            errors.titulo = 'El título es requerido'
        }

        if (!courseData.descripcion?.trim()) {
            errors.descripcion = 'La descripción es requerida'
        }

        if (!courseData.slug?.trim()) {
            errors.slug = 'El slug es requerido'
        }

        if (!courseData.es_gratuito && (!courseData.precio || courseData.precio <= 0)) {
            errors.precio = 'El precio debe ser mayor a 0 para cursos pagos'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: Object.values(errors)
        }
    }

    validateModuleData(moduleData) {
        const errors = {}

        if (!moduleData.titulo?.trim()) {
            errors.titulo = 'El título del módulo es requerido'
        }

        if (!moduleData.cursoId) {
            errors.cursoId = 'El ID del curso es requerido'
        }

        if (moduleData.orden === undefined || moduleData.orden < 1) {
            errors.orden = 'El orden debe ser mayor a 0'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: Object.values(errors)
        }
    }

    validateClassData(classData) {
        const errors = {}

        if (!classData.titulo?.trim()) {
            errors.titulo = 'El título de la clase es requerido'
        }

        if (!classData.moduloId) {
            errors.moduloId = 'El ID del módulo es requerido'
        }

        if (classData.orden === undefined || classData.orden < 1) {
            errors.orden = 'El orden debe ser mayor a 0'
        }

        if (classData.videoYoutubeUrl && !this.isValidYouTubeUrl(classData.videoYoutubeUrl)) {
            errors.videoYoutubeUrl = 'La URL de YouTube no es válida'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: Object.values(errors)
        }
    }

    // 🆕 NUEVO: Validación avanzada de simulacros
    validateSimulacroData(simulacroData) {
        const errors = {}

        if (!simulacroData.titulo?.trim()) {
            errors.titulo = 'El título es requerido'
        }

        if (!simulacroData.cursoId) {
            errors.cursoId = 'El ID del curso es requerido'
        }

        if (!simulacroData.numeroPreguntas || simulacroData.numeroPreguntas < 1) {
            errors.numeroPreguntas = 'Debe tener al menos 1 pregunta'
        }

        // Validar modos
        const modosValidos = ['estudio', 'revision', 'evaluacion', 'examen_real']
        if (simulacroData.modoEstudio && !modosValidos.includes(simulacroData.modoEstudio)) {
            errors.modoEstudio = `Modo inválido. Opciones: ${modosValidos.join(', ')}`
        }

        // Validar tipos de tiempo
        const tiempoValidos = ['sin_limite', 'global', 'por_pregunta']
        if (simulacroData.tipoTiempo && !tiempoValidos.includes(simulacroData.tipoTiempo)) {
            errors.tipoTiempo = `Tipo de tiempo inválido. Opciones: ${tiempoValidos.join(', ')}`
        }

        // Validar navegación
        const navegacionValida = ['libre', 'secuencial']
        if (simulacroData.tipoNavegacion && !navegacionValida.includes(simulacroData.tipoNavegacion)) {
            errors.tipoNavegacion = `Tipo de navegación inválido. Opciones: ${navegacionValida.join(', ')}`
        }

        // Validar coherencia de tiempos
        if (simulacroData.tipoTiempo === 'por_pregunta' && !simulacroData.tiempoPorPreguntaSegundos) {
            errors.tiempoPorPregunta = 'Tiempo por pregunta es requerido'
        }

        if (simulacroData.tipoTiempo === 'global' && !simulacroData.tiempoLimiteMinutos) {
            errors.tiempoLimite = 'Tiempo límite es requerido'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: Object.values(errors)
        }
    }

    validateQuestionData(questionData) {
        const errors = {}

        if (!questionData.enunciado?.trim()) {
            errors.enunciado = 'El enunciado es requerido'
        }

        if (!questionData.simulacroId) {
            errors.simulacroId = 'El ID del simulacro es requerido'
        }

        if (!questionData.tipoPregunta) {
            errors.tipoPregunta = 'El tipo de pregunta es requerido'
        }

        // Validar opciones según tipo
        const tiposConOpciones = ['multiple', 'true_false', 'multiple_respuesta', 'short_answer', 'fill_blanks', 'matching', 'ordering', 'numerical']
        if (tiposConOpciones.includes(questionData.tipoPregunta)) {
            if (!questionData.opciones || questionData.opciones.length < 1) {
                errors.opciones = 'Debe tener al menos una opción'
            } else {
                // Validar que hay respuestas correctas
                const correctAnswers = questionData.opciones.filter(op => op.esCorrecta)
                if (correctAnswers.length === 0 && questionData.tipoPregunta !== 'essay') {
                    errors.respuestasCorrectas = 'Debe tener al menos una respuesta correcta'
                }

                // Validar opciones específicas por tipo
                if (questionData.tipoPregunta === 'true_false' && questionData.opciones.length !== 2) {
                    errors.opcionesTrueFalse = 'Verdadero/Falso debe tener exactamente 2 opciones'
                }

                if (questionData.tipoPregunta === 'multiple' && correctAnswers.length !== 1) {
                    errors.opcionesMultiple = 'Opción múltiple debe tener exactamente una respuesta correcta'
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors: Object.values(errors)
        }
    }

    // ==================== HELPERS AVANZADOS ====================
    isValidYouTubeUrl(url) {
        if (!url) return true // URL es opcional

        const patterns = [
            /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
            /^https?:\/\/(www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
            /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
        ]

        return patterns.some(pattern => pattern.test(url))
    }

    extractYouTubeId(url) {
        if (!url) return null

        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
        ]

        for (const pattern of patterns) {
            const match = url.match(pattern)
            if (match) return match[1]
        }

        return null
    }

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    // 🆕 NUEVO: Calcular tiempo automáticamente
    calculateSimulacroTiming(data) {
        const { tipoTiempo, tiempoLimiteMinutos, tiempoPorPreguntaSegundos, numeroPreguntas } = data

        if (tipoTiempo === 'por_pregunta' && tiempoPorPreguntaSegundos && numeroPreguntas) {
            return {
                tiempoLimiteMinutos: Math.ceil((tiempoPorPreguntaSegundos * numeroPreguntas) / 60),
                tiempoPorPreguntaSegundos
            }
        }

        if (tipoTiempo === 'global' && tiempoLimiteMinutos && numeroPreguntas) {
            return {
                tiempoLimiteMinutos,
                tiempoPorPreguntaSegundos: Math.floor((tiempoLimiteMinutos * 60) / numeroPreguntas)
            }
        }

        return data
    }

    // 🆕 NUEVO: Generar configuración por defecto según modo
    generateDefaultConfig(modoEstudio) {
        const configs = {
            'estudio': {
                tipoTiempo: 'sin_limite',
                tipoNavegacion: 'libre',
                intentosPermitidos: -1,
                mostrarRespuestasDespues: 1,
                randomizarPreguntas: false,
                randomizarOpciones: false
            },
            'revision': {
                tipoTiempo: 'global',
                tipoNavegacion: 'libre',
                intentosPermitidos: 3,
                mostrarRespuestasDespues: 1,
                randomizarPreguntas: true,
                randomizarOpciones: true
            },
            'evaluacion': {
                tipoTiempo: 'global',
                tipoNavegacion: 'libre',
                intentosPermitidos: 2,
                mostrarRespuestasDespues: 0,
                randomizarPreguntas: true,
                randomizarOpciones: true
            },
            'examen_real': {
                tipoTiempo: 'global',
                tipoNavegacion: 'libre',
                intentosPermitidos: 1,
                mostrarRespuestasDespues: 0,
                randomizarPreguntas: true,
                randomizarOpciones: true
            }
        }

        return configs[modoEstudio] || configs['estudio']
    }

    // ==================== FORMATEO DE DATOS AVANZADO ====================
    formatCourseData(formData) {
        return {
            titulo: formData.titulo?.trim(),
            descripcion: formData.descripcion?.trim(),
            slug: formData.slug?.trim(),
            miniatura_url: formData.miniatura_url || formData.miniaturaUrl,
            precio: formData.es_gratuito ? 0 : parseFloat(formData.precio) || 0,
            descuento: parseInt(formData.descuento) || 0,
            tipo_examen: formData.tipo_examen || formData.tipoExamen,
            es_gratuito: Boolean(formData.es_gratuito || formData.esGratuito),
            activo: formData.activo !== undefined ? Boolean(formData.activo) : true
        }
    }

    formatModuleData(formData) {
        return {
            cursoId: formData.cursoId,
            titulo: formData.titulo?.trim(),
            descripcion: formData.descripcion?.trim(),
            orden: parseInt(formData.orden) || 1
        }
    }

    formatClassData(formData) {
        return {
            moduloId: formData.moduloId,
            titulo: formData.titulo?.trim(),
            descripcion: formData.descripcion?.trim(),
            videoYoutubeUrl: formData.videoYoutubeUrl?.trim(),
            duracionMinutos: parseInt(formData.duracionMinutos) || 0,
            esGratuita: Boolean(formData.esGratuita),
            orden: parseInt(formData.orden) || 1
        }
    }

    // 🆕 NUEVO: Formateo de simulacros avanzado
    formatSimulacroData(formData) {
        const baseData = {
            cursoId: formData.cursoId,
            titulo: formData.titulo?.trim(),
            descripcion: formData.descripcion?.trim(),
            numeroPreguntas: parseInt(formData.numeroPreguntas) || 10,

            // Campos nuevos
            modoEstudio: formData.modoEstudio || 'estudio',
            tipoTiempo: formData.tipoTiempo || 'sin_limite',
            tipoNavegacion: formData.tipoNavegacion || 'libre',

            // Campos de tiempo
            tiempoLimiteMinutos: formData.tiempoLimiteMinutos ? parseInt(formData.tiempoLimiteMinutos) : null,
            tiempoPorPreguntaSegundos: formData.tiempoPorPreguntaSegundos ? parseInt(formData.tiempoPorPreguntaSegundos) : null,

            // Configuraciones
            intentosPermitidos: formData.intentosPermitidos !== undefined ? parseInt(formData.intentosPermitidos) : -1,
            mostrarRespuestasDespues: formData.mostrarRespuestasDespues !== undefined ? parseInt(formData.mostrarRespuestasDespues) : 1,
            randomizarPreguntas: formData.randomizarPreguntas !== undefined ? Boolean(formData.randomizarPreguntas) : true,
            randomizarOpciones: formData.randomizarOpciones !== undefined ? Boolean(formData.randomizarOpciones) : true,

            // Configuración avanzada
            configuracionAvanzada: formData.configuracionAvanzada || {}
        }

        // Aplicar configuración por defecto si no se especifica
        if (!formData.tipoTiempo || !formData.tipoNavegacion) {
            const defaultConfig = this.generateDefaultConfig(baseData.modoEstudio)
            return { ...defaultConfig, ...baseData }
        }

        // Calcular tiempos automáticamente
        return this.calculateSimulacroTiming(baseData)
    }

    formatQuestionData(formData) {
        return {
            simulacroId: formData.simulacroId,
            enunciado: formData.enunciado?.trim(),
            tipoPregunta: formData.tipoPregunta || 'multiple',
            explicacion: formData.explicacion?.trim(),
            imagenUrl: formData.imagenUrl?.trim(),
            opciones: formData.opciones || []
        }
    }

    // ==================== TEMPLATES PREDEFINIDOS ====================

    // 🆕 NUEVO: Templates de simulacros comunes
    getSimulacroTemplates() {
        return {
            medicina_eunacom: {
                nombre: 'EUNACOM (Medicina Chile)',
                descripcion: 'Simulacro estilo EUNACOM oficial',
                config: {
                    modoEstudio: 'examen_real',
                    tipoTiempo: 'global',
                    tipoNavegacion: 'libre',
                    tiempoLimiteMinutos: 180,
                    numeroPreguntas: 120,
                    intentosPermitidos: 1,
                    randomizarPreguntas: true,
                    randomizarOpciones: true
                }
            },
            derecho_grado: {
                nombre: 'Examen de Grado (Derecho)',
                descripcion: 'Simulacro estilo examen de grado',
                config: {
                    modoEstudio: 'examen_real',
                    tipoTiempo: 'global',
                    tipoNavegacion: 'secuencial',
                    tiempoLimiteMinutos: 240,
                    numeroPreguntas: 100,
                    intentosPermitidos: 1
                }
            },
            practica_basica: {
                nombre: 'Práctica Básica',
                descripcion: 'Para aprender sin presión',
                config: {
                    modoEstudio: 'estudio',
                    tipoTiempo: 'sin_limite',
                    tipoNavegacion: 'libre',
                    intentosPermitidos: -1,
                    mostrarRespuestasDespues: 1
                }
            },
            evaluacion_intermedia: {
                nombre: 'Evaluación Intermedia',
                descripcion: 'Para autoevaluarse',
                config: {
                    modoEstudio: 'revision',
                    tipoTiempo: 'global',
                    tipoNavegacion: 'libre',
                    tiempoLimiteMinutos: 45,
                    numeroPreguntas: 30,
                    intentosPermitidos: 3
                }
            },
            tiempo_por_pregunta: {
                nombre: 'Cronómetro por Pregunta',
                descripcion: 'Tiempo fijo por pregunta',
                config: {
                    modoEstudio: 'evaluacion',
                    tipoTiempo: 'por_pregunta',
                    tipoNavegacion: 'secuencial',
                    tiempoPorPreguntaSegundos: 120, // 2 minutos
                    numeroPreguntas: 25,
                    intentosPermitidos: 2
                }
            }
        }
    }

    // 🆕 NUEVO: Aplicar template predefinido
    applySimulacroTemplate(templateName, customData = {}) {
        const templates = this.getSimulacroTemplates()
        const template = templates[templateName]

        if (!template) {
            throw new Error(`Template ${templateName} no encontrado`)
        }

        return {
            titulo: customData.titulo || template.nombre,
            descripcion: customData.descripcion || template.descripcion,
            ...template.config,
            ...customData // Sobrescribir con datos personalizados
        }
    }

    // ==================== UTILIDADES DE ANÁLISIS ====================

    // 🆕 NUEVO: Analizar compatibilidad de pregunta con simulacro
    analyzeQuestionCompatibility(simulacroConfig, questionType) {
        const compatibility = {
            compatible: true,
            warnings: [],
            recommendations: []
        }

        // Análisis según modo de estudio
        if (simulacroConfig.modoEstudio === 'examen_real') {
            if (questionType === 'essay') {
                compatibility.warnings.push('Las preguntas de ensayo no se evalúan automáticamente en modo examen real')
                compatibility.recommendations.push('Considere usar preguntas de opción múltiple para evaluación automática')
            }
        }

        // Análisis según tipo de tiempo
        if (simulacroConfig.tipoTiempo === 'por_pregunta') {
            if (['essay', 'fill_blanks'].includes(questionType)) {
                compatibility.warnings.push('Este tipo de pregunta puede requerir más tiempo que otras')
                compatibility.recommendations.push('Considere aumentar el tiempo por pregunta para este tipo')
            }
        }

        // Análisis según navegación
        if (simulacroConfig.tipoNavegacion === 'secuencial') {
            compatibility.recommendations.push('En navegación secuencial, asegúrese de ordenar las preguntas por dificultad')
        }

        return compatibility
    }

    // 🆕 NUEVO: Calcular estadísticas de simulacro
    calculateSimulacroStats(simulacroData) {
        const stats = {
            tiempoTotal: 0,
            tiempoPorPregunta: 0,
            dificultadEstimada: 'Media',
            recomendaciones: []
        }

        // Cálculo de tiempo
        if (simulacroData.tiempoLimiteMinutos && simulacroData.numeroPreguntas) {
            stats.tiempoTotal = simulacroData.tiempoLimiteMinutos
            stats.tiempoPorPregunta = Math.round((simulacroData.tiempoLimiteMinutos * 60) / simulacroData.numeroPreguntas)
        }

        // Análisis de dificultad
        if (simulacroData.modoEstudio === 'examen_real' && simulacroData.intentosPermitidos === 1) {
            stats.dificultadEstimada = 'Alta'
        } else if (simulacroData.modoEstudio === 'estudio' && simulacroData.intentosPermitidos === -1) {
            stats.dificultadEstimada = 'Baja'
        }

        // Recomendaciones
        if (stats.tiempoPorPregunta < 60) {
            stats.recomendaciones.push('Tiempo muy ajustado por pregunta, considere aumentar el tiempo total')
        }

        if (simulacroData.numeroPreguntas > 100 && simulacroData.tiempoLimiteMinutos < 120) {
            stats.recomendaciones.push('Para simulacros largos, considere al menos 2 horas de tiempo')
        }

        return stats
    }
}

const courseManagementService = new CourseManagementService()
export default courseManagementService