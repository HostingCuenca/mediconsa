// src/services/courseManagement.js - Nuevo servicio para gestión de contenido (Admin/Instructor)
import apiService from './api'

class CourseManagementService {

    // =============================================
    // OBTENER CONTENIDO COMPLETO DEL CURSO
    // =============================================
    async getCourseContent(cursoId) {
        try {
            const response = await apiService.get(`/course-management/course/${cursoId}`)

            return {
                success: true,
                data: response.data || response,
                curso: response.data?.curso || response.curso || null,
                modulos: response.data?.modulos || response.modulos || [],
                simulacros: response.data?.simulacros || response.simulacros || []
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                curso: null,
                modulos: [],
                simulacros: []
            }
        }
    }

    // =============================================
    // CREAR MÓDULO
    // =============================================
    async createModule(moduleData) {
        try {
            const response = await apiService.post('/course-management/modules', moduleData)

            return {
                success: true,
                data: response.data || response,
                modulo: response.data?.modulo || response.modulo || null,
                message: response.message || 'Módulo creado exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // CREAR CLASE
    // =============================================
    async createClass(classData) {
        try {
            const response = await apiService.post('/course-management/classes', classData)

            return {
                success: true,
                data: response.data || response,
                clase: response.data?.clase || response.clase || null,
                message: response.message || 'Clase creada exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // CREAR SIMULACRO
    // =============================================
    async createSimulacro(simulacroData) {
        try {
            const response = await apiService.post('/course-management/simulacros', simulacroData)

            return {
                success: true,
                data: response.data || response,
                simulacro: response.data?.simulacro || response.simulacro || null,
                message: response.message || 'Simulacro creado exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // CREAR PREGUNTA CON OPCIONES
    // =============================================
    async createQuestion(questionData) {
        try {
            const response = await apiService.post('/course-management/questions', questionData)

            return {
                success: true,
                data: response.data || response,
                pregunta: response.data?.pregunta || response.pregunta || null,
                opciones: response.data?.opciones || response.opciones || [],
                message: response.message || 'Pregunta creada exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // HELPER: VALIDAR DATOS DE MÓDULO
    // =============================================
    validateModuleData(data) {
        const errors = []

        if (!data.cursoId) errors.push('ID del curso es requerido')
        if (!data.titulo?.trim()) errors.push('Título del módulo es requerido')
        if (data.orden === undefined || data.orden < 0) errors.push('Orden del módulo es requerido')

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    // =============================================
    // HELPER: VALIDAR DATOS DE CLASE
    // =============================================
    validateClassData(data) {
        const errors = []

        if (!data.moduloId) errors.push('ID del módulo es requerido')
        if (!data.titulo?.trim()) errors.push('Título de la clase es requerido')
        if (data.orden === undefined || data.orden < 0) errors.push('Orden de la clase es requerido')

        // Validar URL de YouTube si se proporciona
        if (data.videoYoutubeUrl && !this.isValidYouTubeUrl(data.videoYoutubeUrl)) {
            errors.push('URL de YouTube inválida')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    // =============================================
    // HELPER: VALIDAR DATOS DE SIMULACRO
    // =============================================
    validateSimulacroData(data) {
        const errors = []

        if (!data.cursoId) errors.push('ID del curso es requerido')
        if (!data.titulo?.trim()) errors.push('Título del simulacro es requerido')
        if (!data.modoEvaluacion) errors.push('Modo de evaluación es requerido')
        if (!data.numeroPreguntas || data.numeroPreguntas < 1) errors.push('Número de preguntas debe ser mayor a 0')

        const modosValidos = ['practica', 'realista', 'examen']
        if (data.modoEvaluacion && !modosValidos.includes(data.modoEvaluacion)) {
            errors.push('Modo de evaluación inválido')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    // =============================================
    // HELPER: VALIDAR DATOS DE PREGUNTA
    // =============================================
    validateQuestionData(data) {
        const errors = []

        if (!data.simulacroId) errors.push('ID del simulacro es requerido')
        if (!data.enunciado?.trim()) errors.push('Enunciado de la pregunta es requerido')
        if (!data.tipoPregunta) errors.push('Tipo de pregunta es requerido')
        if (!data.opciones || !Array.isArray(data.opciones)) errors.push('Opciones son requeridas')

        // Validar opciones
        if (data.opciones) {
            if (data.opciones.length < 2) {
                errors.push('Debe haber al menos 2 opciones')
            }

            const opcionesCorrectas = data.opciones.filter(op => op.esCorrecta)
            if (opcionesCorrectas.length === 0) {
                errors.push('Debe haber al menos una respuesta correcta')
            }

            data.opciones.forEach((opcion, index) => {
                if (!opcion.textoOpcion?.trim()) {
                    errors.push(`La opción ${index + 1} no puede estar vacía`)
                }
            })
        }

        const tiposValidos = ['multiple', 'multiple_respuesta', 'completar', 'unir', 'rellenar']
        if (data.tipoPregunta && !tiposValidos.includes(data.tipoPregunta)) {
            errors.push('Tipo de pregunta inválido')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    // =============================================
    // HELPER: VALIDAR URL DE YOUTUBE
    // =============================================
    isValidYouTubeUrl(url) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/
        return youtubeRegex.test(url)
    }

    // =============================================
    // HELPER: EXTRAER ID DE VIDEO DE YOUTUBE
    // =============================================
    extractYouTubeVideoId(url) {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
        return match ? match[1] : null
    }

    // =============================================
    // HELPER: FORMATEAR DATOS PARA BACKEND
    // =============================================
    formatModuleForBackend(data) {
        return {
            cursoId: parseInt(data.cursoId),
            titulo: data.titulo.trim(),
            descripcion: data.descripcion?.trim() || '',
            orden: parseInt(data.orden)
        }
    }

    formatClassForBackend(data) {
        return {
            moduloId: parseInt(data.moduloId),
            titulo: data.titulo.trim(),
            descripcion: data.descripcion?.trim() || '',
            videoYoutubeUrl: data.videoYoutubeUrl?.trim() || null,
            duracionMinutos: data.duracionMinutos ? parseInt(data.duracionMinutos) : null,
            esGratuita: Boolean(data.esGratuita),
            orden: parseInt(data.orden)
        }
    }

    formatSimulacroForBackend(data) {
        return {
            cursoId: parseInt(data.cursoId),
            titulo: data.titulo.trim(),
            descripcion: data.descripcion?.trim() || '',
            modoEvaluacion: data.modoEvaluacion,
            tiempoLimiteMinutos: data.tiempoLimiteMinutos ? parseInt(data.tiempoLimiteMinutos) : null,
            tiempoPorPreguntaSegundos: data.tiempoPorPreguntaSegundos ? parseInt(data.tiempoPorPreguntaSegundos) : null,
            numeroPreguntas: parseInt(data.numeroPreguntas),
            intentosPermitidos: data.intentosPermitidos !== undefined ? parseInt(data.intentosPermitidos) : -1,
            randomizarPreguntas: Boolean(data.randomizarPreguntas),
            randomizarOpciones: Boolean(data.randomizarOpciones),
            mostrarRespuestasDespues: data.mostrarRespuestasDespues !== undefined ? parseInt(data.mostrarRespuestasDespues) : 1
        }
    }

    formatQuestionForBackend(data) {
        return {
            simulacroId: parseInt(data.simulacroId),
            enunciado: data.enunciado.trim(),
            tipoPregunta: data.tipoPregunta,
            explicacion: data.explicacion?.trim() || '',
            imagenUrl: data.imagenUrl?.trim() || null,
            opciones: data.opciones.map(opcion => ({
                textoOpcion: opcion.textoOpcion.trim(),
                esCorrecta: Boolean(opcion.esCorrecta)
            }))
        }
    }
}

export default new CourseManagementService()