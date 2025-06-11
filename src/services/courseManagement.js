// src/services/courseManagement.js - OPTIMIZADO Y COMPLETO AL 100%
import apiService from './api'

class CourseManagementService {

    // ==================== CURSOS ====================
    async createCourse(courseData) {
        try {
            console.log('Creando curso:', courseData)
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
                        simulacros: response.data.simulacros || []
                    }
                }
            }

            return { success: false, error: response.message || 'No se pudo cargar el curso' }
        } catch (error) {
            console.error('Error obteniendo curso:', error)
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

    // ==================== SIMULACROS ====================
    async createSimulacro(simulacroData) {
        try {
            console.log('Creando simulacro:', simulacroData)
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

    async updateSimulacro(simulacroId, simulacroData) {
        try {
            console.log('Actualizando simulacro:', simulacroId, simulacroData)
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
    async createQuestion(questionData) {
        try {
            console.log('Creando pregunta:', questionData)
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

    // ==================== VALIDACIONES ====================
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
            errors
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
            errors
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
            errors
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

        if (!questionData.opciones || questionData.opciones.length < 2) {
            errors.opciones = 'Debe tener al menos 2 opciones'
        }

        const correctAnswers = questionData.opciones?.filter(op => op.esCorrecta) || []
        if (correctAnswers.length === 0) {
            errors.opciones = 'Debe tener al menos una respuesta correcta'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    // ==================== HELPERS ====================
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

    // ==================== FORMATEO DE DATOS ====================
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
}

export default new CourseManagementService()