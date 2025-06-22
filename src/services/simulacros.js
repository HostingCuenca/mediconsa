// // // src/services/simulacros.js - ALINEADO CON BACKEND
// // import apiService from './api'
// //
// // class SimulacrosService {
// //
// //     // ==================== SIMULACROS POR CURSO ====================
// //     async getSimulacrosByCourse(cursoId) {
// //         try {
// //             console.log('Obteniendo simulacros por curso:', cursoId)
// //             const response = await apiService.get(`/simulacros/course/${cursoId}`)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         simulacros: response.data.simulacros || [],
// //                         curso: response.data.curso || {},
// //                         estadisticas: response.data.estadisticas || {}
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar los simulacros' }
// //         } catch (error) {
// //             console.error('Error obteniendo simulacros:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async getSimulacroQuestions(simulacroId) {
// //         try {
// //             console.log('Obteniendo preguntas del simulacro:', simulacroId)
// //             const response = await apiService.get(`/simulacros/${simulacroId}/questions`)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         simulacro: response.data.simulacro,
// //                         preguntas: response.data.preguntas || [],
// //                         configuracion: response.data.configuracion || {}
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar las preguntas' }
// //         } catch (error) {
// //             console.error('Error obteniendo preguntas:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== ENVÍO DE RESPUESTAS ====================
// //     async submitSimulacro(simulacroId, submissionData) {
// //         try {
// //             console.log('Enviando respuestas del simulacro:', simulacroId)
// //             const response = await apiService.post(`/simulacros/${simulacroId}/submit`, {
// //                 respuestas: submissionData.respuestas,
// //                 tiempoEmpleadoMinutos: submissionData.tiempoEmpleadoMinutos
// //             })
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         intentoId: response.data.intentoId,
// //                         puntaje: response.data.puntaje,
// //                         respuestasCorrectas: response.data.respuestasCorrectas,
// //                         totalPreguntas: response.data.totalPreguntas,
// //                         tiempoEmpleado: response.data.tiempoEmpleado,
// //                         modoEvaluacion: response.data.modoEvaluacion,
// //                         detalle: response.data.detalle || [],
// //                         resumen: response.data.resumen || '',
// //                         estadisticas: response.data.estadisticas || {}
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudo procesar el simulacro' }
// //         } catch (error) {
// //             console.error('Error enviando simulacro:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== INTENTOS DEL USUARIO ====================
// //     async getMyAttempts(filters = {}) {
// //         try {
// //             console.log('Obteniendo mis intentos:', filters)
// //
// //             // ✅ CORREGIDO: Usar query parameters correctamente
// //             const params = new URLSearchParams()
// //             if (filters.simulacroId) params.append('simulacroId', filters.simulacroId)
// //             if (filters.cursoId) params.append('cursoId', filters.cursoId)
// //             if (filters.page) params.append('page', filters.page)
// //             if (filters.limit) params.append('limit', filters.limit)
// //
// //             const queryString = params.toString()
// //             const url = `/simulacros/my-attempts${queryString ? `?${queryString}` : ''}`
// //
// //             const response = await apiService.get(url)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         intentos: response.data.intentos || [],
// //                         estadisticas: response.data.estadisticas || {},
// //                         pagination: response.data.pagination || {}
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar los intentos' }
// //         } catch (error) {
// //             console.error('Error obteniendo intentos:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     async getAttemptDetail(intentoId) {
// //         try {
// //             console.log('Obteniendo detalle del intento:', intentoId)
// //             const response = await apiService.get(`/simulacros/attempt/${intentoId}`)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         intento: response.data.intento,
// //                         respuestas: response.data.respuestas || [],
// //                         analisis: response.data.analisis || {},
// //                         recomendaciones: response.data.recomendaciones || []
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudo cargar el detalle del intento' }
// //         } catch (error) {
// //             console.error('Error obteniendo detalle:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== ADMINISTRACIÓN DE SIMULACROS ====================
// //     // Nota: Estos métodos pueden no estar implementados en el backend actual
// //     async getAllSimulacros(filters = {}) {
// //         try {
// //             console.log('Obteniendo todos los simulacros:', filters)
// //             const response = await apiService.get('/admin/simulacros', filters)
// //
// //             if (response.success && response.data) {
// //                 return {
// //                     success: true,
// //                     data: {
// //                         simulacros: response.data.simulacros || [],
// //                         total: response.data.total || 0,
// //                         estadisticas: response.data.estadisticas || {},
// //                         pagination: response.data.pagination || {}
// //                     }
// //                 }
// //             }
// //
// //             return { success: false, error: 'No se pudieron cargar los simulacros' }
// //         } catch (error) {
// //             console.error('Error obteniendo simulacros admin:', error)
// //             return { success: false, error: error.message }
// //         }
// //     }
// //
// //     // ==================== HELPERS ALINEADOS CON BACKEND ====================
// //     getModoEvaluacionLabel(modo) {
// //         const labels = {
// //             'practica': 'Práctica',
// //             'realista': 'Realista',
// //             'examen': 'Examen'
// //         }
// //         return labels[modo] || modo
// //     }
// //
// //     getModoEvaluacionColor(modo) {
// //         const colors = {
// //             'practica': 'bg-blue-100 text-blue-800',
// //             'realista': 'bg-yellow-100 text-yellow-800',
// //             'examen': 'bg-red-100 text-red-800'
// //         }
// //         return colors[modo] || 'bg-gray-100 text-gray-800'
// //     }
// //
// //     getTipoPreguntaLabel(tipo) {
// //         const labels = {
// //             'multiple': 'Opción Múltiple',
// //             'multiple_respuesta': 'Múltiple Respuesta',
// //             'completar': 'Completar',
// //             'unir': 'Unir Conceptos',
// //             'rellenar': 'Rellenar Espacios'
// //         }
// //         return labels[tipo] || tipo
// //     }
// //
// //     calculateGrade(correctAnswers, totalQuestions) {
// //         if (totalQuestions === 0) return 0
// //         return Math.round((correctAnswers / totalQuestions) * 100)
// //     }
// //
// //     getGradeColor(grade) {
// //         if (grade >= 80) return 'text-green-600 bg-green-50'
// //         if (grade >= 60) return 'text-yellow-600 bg-yellow-50'
// //         return 'text-red-600 bg-red-50'
// //     }
// //
// //     getGradeLabel(grade) {
// //         if (grade >= 90) return 'Excelente'
// //         if (grade >= 80) return 'Muy Bueno'
// //         if (grade >= 70) return 'Bueno'
// //         if (grade >= 60) return 'Regular'
// //         return 'Necesita Mejorar'
// //     }
// //
// //     formatTime(minutes) {
// //         if (!minutes || minutes === 0) return '0m'
// //
// //         const hours = Math.floor(minutes / 60)
// //         const mins = minutes % 60
// //
// //         if (hours > 0) {
// //             return `${hours}h ${mins}m`
// //         }
// //         return `${mins}m`
// //     }
// //
// //     formatTimeSeconds(seconds) {
// //         if (!seconds || seconds === 0) return '0:00'
// //
// //         const minutes = Math.floor(seconds / 60)
// //         const secs = seconds % 60
// //
// //         if (minutes > 0) {
// //             return `${minutes}:${secs.toString().padStart(2, '0')}`
// //         }
// //         return `0:${secs.toString().padStart(2, '0')}`
// //     }
// //
// //     // ==================== VALIDACIÓN ESPECÍFICA PARA BACKEND ====================
// //     async validateSimulacroConfig(config) {
// //         const errors = {}
// //
// //         if (!config.titulo?.trim()) {
// //             errors.titulo = 'El título es requerido'
// //         }
// //
// //         if (!config.cursoId) {
// //             errors.cursoId = 'El curso es requerido'
// //         }
// //
// //         if (!config.modo_evaluacion) {
// //             errors.modo_evaluacion = 'El modo de evaluación es requerido'
// //         } else if (!['practica', 'realista', 'examen'].includes(config.modo_evaluacion)) {
// //             errors.modo_evaluacion = 'Modo de evaluación inválido'
// //         }
// //
// //         if (!config.numero_preguntas || config.numero_preguntas < 1) {
// //             errors.numero_preguntas = 'Debe tener al menos 1 pregunta'
// //         }
// //
// //         if (config.tiempo_limite_minutos && config.tiempo_limite_minutos < 1) {
// //             errors.tiempo_limite_minutos = 'El tiempo límite debe ser mayor a 0'
// //         }
// //
// //         if (config.intentos_permitidos && config.intentos_permitidos < -1) {
// //             errors.intentos_permitidos = 'Los intentos permitidos deben ser -1 (ilimitados) o mayor a 0'
// //         }
// //
// //         return {
// //             isValid: Object.keys(errors).length === 0,
// //             errors
// //         }
// //     }
// //
// //     async validateQuestionData(questionData) {
// //         const errors = {}
// //
// //         if (!questionData.enunciado?.trim()) {
// //             errors.enunciado = 'El enunciado es requerido'
// //         }
// //
// //         if (!questionData.simulacro_id) {
// //             errors.simulacro_id = 'El simulacro es requerido'
// //         }
// //
// //         if (!questionData.tipo_pregunta) {
// //             errors.tipo_pregunta = 'El tipo de pregunta es requerido'
// //         }
// //
// //         if (!questionData.opciones || questionData.opciones.length < 2) {
// //             errors.opciones = 'Debe tener al menos 2 opciones'
// //         }
// //
// //         const correctAnswers = questionData.opciones?.filter(op => op.es_correcta) || []
// //         if (correctAnswers.length === 0) {
// //             errors.respuesta_correcta = 'Debe tener al menos una respuesta correcta'
// //         }
// //
// //         return {
// //             isValid: Object.keys(errors).length === 0,
// //             errors
// //         }
// //     }
// //
// //     // ==================== FUNCIONES DE UTILIDAD ====================
// //     shuffleArray(array) {
// //         const shuffled = [...array]
// //         for (let i = shuffled.length - 1; i > 0; i--) {
// //             const j = Math.floor(Math.random() * (i + 1));
// //             [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
// //         }
// //         return shuffled
// //     }
// //
// //     generateQuestionId() {
// //         return 'q_' + Math.random().toString(36).substr(2, 9)
// //     }
// //
// //     // ==================== FUNCIONES DE ANÁLISIS ====================
// //     analyzeAttemptResults(intento) {
// //         const puntaje = intento.puntaje || 0
// //         const comentarios = []
// //         const recomendaciones = []
// //
// //         if (puntaje >= 90) {
// //             comentarios.push('¡Excelente desempeño! Dominas muy bien el tema.')
// //         } else if (puntaje >= 80) {
// //             comentarios.push('Muy buen trabajo. Solo algunos detalles por mejorar.')
// //         } else if (puntaje >= 70) {
// //             comentarios.push('Buen resultado. Con un poco más de estudio puedes mejorar.')
// //             recomendaciones.push('Repasa los temas donde tuviste errores')
// //         } else if (puntaje >= 60) {
// //             comentarios.push('Resultado regular. Necesitas estudiar más algunos temas.')
// //             recomendaciones.push('Dedica más tiempo al estudio de los conceptos básicos')
// //             recomendaciones.push('Practica más simulacros')
// //         } else {
// //             comentarios.push('Necesitas mejorar significativamente. Te recomendamos repasar todo el material.')
// //             recomendaciones.push('Revisa todo el material del curso')
// //             recomendaciones.push('Considera solicitar ayuda adicional')
// //             recomendaciones.push('Practica regularmente con simulacros')
// //         }
// //
// //         return {
// //             comentario: comentarios.join(' '),
// //             recomendaciones,
// //             nivel: this.getGradeLabel(puntaje)
// //         }
// //     }
// //
// //     // ==================== FUNCIONES DE FORMATEO ====================
// //     formatAttemptForDisplay(intento) {
// //         return {
// //             ...intento,
// //             puntaje_formateado: `${intento.puntaje}%`,
// //             fecha_formateada: this.formatDate(intento.fecha_intento),
// //             tiempo_formateado: this.formatTime(intento.tiempo_empleado_minutos),
// //             estado_color: this.getGradeColor(intento.puntaje),
// //             estado_label: this.getGradeLabel(intento.puntaje)
// //         }
// //     }
// //
// //     formatDate(dateString) {
// //         if (!dateString) return 'No disponible'
// //         return new Date(dateString).toLocaleString('es-ES', {
// //             year: 'numeric',
// //             month: 'short',
// //             day: 'numeric',
// //             hour: '2-digit',
// //             minute: '2-digit'
// //         })
// //     }
// //
// //     // ==================== FUNCIONES DE EXPORTACIÓN ====================
// //     async exportSimulacroTemplate() {
// //         return {
// //             success: true,
// //             data: {
// //                 template: {
// //                     titulo: '',
// //                     descripcion: '',
// //                     modo_evaluacion: 'practica',
// //                     numero_preguntas: 10,
// //                     tiempo_limite_minutos: 60,
// //                     tiempo_por_pregunta_segundos: null,
// //                     intentos_permitidos: -1,
// //                     randomizar_preguntas: true,
// //                     randomizar_opciones: true,
// //                     mostrar_respuestas_despues: 1,
// //                     preguntas: [
// //                         {
// //                             enunciado: '',
// //                             tipo_pregunta: 'multiple',
// //                             explicacion: '',
// //                             imagen_url: '',
// //                             opciones: [
// //                                 { texto_opcion: '', es_correcta: false, orden: 1 },
// //                                 { texto_opcion: '', es_correcta: true, orden: 2 },
// //                                 { texto_opcion: '', es_correcta: false, orden: 3 },
// //                                 { texto_opcion: '', es_correcta: false, orden: 4 }
// //                             ]
// //                         }
// //                     ]
// //                 }
// //             }
// //         }
// //     }
// //
// //     // ==================== CONSTANTES Y CONFIGURACIÓN ====================
// //     get MODOS_EVALUACION() {
// //         return {
// //             PRACTICA: 'practica',
// //             REALISTA: 'realista',
// //             EXAMEN: 'examen'
// //         }
// //     }
// //
// //     get TIPOS_PREGUNTA() {
// //         return {
// //             MULTIPLE: 'multiple',
// //             MULTIPLE_RESPUESTA: 'multiple_respuesta',
// //             COMPLETAR: 'completar',
// //             UNIR: 'unir',
// //             RELLENAR: 'rellenar'
// //         }
// //     }
// //
// //     get ESTADOS_INTENTO() {
// //         return {
// //             INICIADO: 'iniciado',
// //             EN_PROGRESO: 'en_progreso',
// //             COMPLETADO: 'completado',
// //             ABANDONADO: 'abandonado'
// //         }
// //     }
// // }
// //
// // export default new SimulacrosService()
//
// // src/services/simulacros.js - ACTUALIZADO CON COMPATIBILIDAD
// import apiService from './api'
//
// class SimulacrosService {
//
//     // ==================== SIMULACROS POR CURSO ====================
//     async getSimulacrosByCourse(cursoId) {
//         try {
//             console.log('Obteniendo simulacros por curso:', cursoId)
//             const response = await apiService.get(`/simulacros/course/${cursoId}`)
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         simulacros: response.data.simulacros || [],
//                         curso: response.data.curso || {},
//                         estadisticas: response.data.estadisticas || {}
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudieron cargar los simulacros' }
//         } catch (error) {
//             console.error('Error obteniendo simulacros:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async getSimulacroQuestions(simulacroId) {
//         try {
//             console.log('Obteniendo preguntas del simulacro:', simulacroId)
//             const response = await apiService.get(`/simulacros/${simulacroId}/questions`)
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         simulacro: response.data.simulacro,
//                         preguntas: response.data.preguntas || [],
//                         configuracion: response.data.configuracion || {}
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudieron cargar las preguntas' }
//         } catch (error) {
//             console.error('Error obteniendo preguntas:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== ENVÍO DE RESPUESTAS ====================
//     async submitSimulacro(simulacroId, submissionData) {
//         try {
//             console.log('Enviando respuestas del simulacro:', simulacroId)
//             const response = await apiService.post(`/simulacros/${simulacroId}/submit`, {
//                 respuestas: submissionData.respuestas,
//                 tiempoEmpleadoMinutos: submissionData.tiempoEmpleadoMinutos
//             })
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         intentoId: response.data.intentoId,
//                         puntaje: response.data.puntaje,
//                         respuestasCorrectas: response.data.respuestasCorrectas,
//                         totalPreguntas: response.data.totalPreguntas,
//                         tiempoEmpleado: response.data.tiempoEmpleado,
//                         modoEvaluacion: response.data.modoEvaluacion,
//                         modoEstudio: response.data.modoEstudio, // 🆕 NUEVO
//                         detalle: response.data.detalle || [],
//                         resumen: response.data.resumen || '',
//                         estadisticas: response.data.estadisticas || {}
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudo procesar el simulacro' }
//         } catch (error) {
//             console.error('Error enviando simulacro:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== INTENTOS DEL USUARIO ====================
//     async getMyAttempts(filters = {}) {
//         try {
//             console.log('Obteniendo mis intentos:', filters)
//
//             const params = new URLSearchParams()
//             if (filters.simulacroId) params.append('simulacroId', filters.simulacroId)
//             if (filters.cursoId) params.append('cursoId', filters.cursoId)
//             if (filters.page) params.append('page', filters.page)
//             if (filters.limit) params.append('limit', filters.limit)
//
//             const queryString = params.toString()
//             const url = `/simulacros/my-attempts${queryString ? `?${queryString}` : ''}`
//
//             const response = await apiService.get(url)
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         intentos: response.data.intentos || [],
//                         estadisticas: response.data.estadisticas || {},
//                         pagination: response.data.pagination || {}
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudieron cargar los intentos' }
//         } catch (error) {
//             console.error('Error obteniendo intentos:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async getAttemptDetail(intentoId) {
//         try {
//             console.log('Obteniendo detalle del intento:', intentoId)
//             const response = await apiService.get(`/simulacros/attempt/${intentoId}`)
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         intento: response.data.intento,
//                         respuestas: response.data.respuestas || [],
//                         analisis: response.data.analisis || {},
//                         recomendaciones: response.data.recomendaciones || []
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudo cargar el detalle del intento' }
//         } catch (error) {
//             console.error('Error obteniendo detalle:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== HELPERS CON COMPATIBILIDAD ====================
//     getModoEvaluacionLabel(modo) {
//         const labels = {
//             // Modos antiguos
//             'practica': 'Práctica',
//             'realista': 'Realista',
//             'examen': 'Examen',
//             // 🆕 Modos nuevos
//             'estudio': 'Estudio',
//             'revision': 'Revisión',
//             'evaluacion': 'Evaluación',
//             'examen_real': 'Examen Real'
//         }
//         return labels[modo] || modo
//     }
//
//     getModoEvaluacionColor(modo) {
//         const colors = {
//             // Modos antiguos
//             'practica': 'bg-blue-100 text-blue-800',
//             'realista': 'bg-yellow-100 text-yellow-800',
//             'examen': 'bg-red-100 text-red-800',
//             // 🆕 Modos nuevos
//             'estudio': 'bg-green-100 text-green-800',
//             'revision': 'bg-blue-100 text-blue-800',
//             'evaluacion': 'bg-yellow-100 text-yellow-800',
//             'examen_real': 'bg-red-100 text-red-800'
//         }
//         return colors[modo] || 'bg-gray-100 text-gray-800'
//     }
//
//     // 🆕 NUEVAS FUNCIONES PARA CAMPOS AVANZADOS
//     getTipoTiempoLabel(tipo) {
//         const labels = {
//             'sin_limite': 'Sin límite',
//             'global': 'Tiempo global',
//             'por_pregunta': 'Por pregunta'
//         }
//         return labels[tipo] || tipo
//     }
//
//     getTipoNavegacionLabel(tipo) {
//         const labels = {
//             'libre': 'Navegación libre',
//             'secuencial': 'Navegación secuencial'
//         }
//         return labels[tipo] || tipo
//     }
//
//     // 🆕 COMPATIBILIDAD: Obtener modo unificado
//     getModoUnificado(simulacro) {
//         // Priorizar modo_estudio si existe, sino usar modo_evaluacion
//         return simulacro.modo_estudio || simulacro.modo_evaluacion || 'estudio'
//     }
//
//     // 🆕 COMPATIBILIDAD: Formatear tiempo según tipo
//     formatTiempoSimulacro(simulacro) {
//         if (simulacro.tipo_tiempo === 'sin_limite') return 'Sin límite'
//         if (simulacro.tipo_tiempo === 'por_pregunta' && simulacro.tiempo_por_pregunta_segundos) {
//             return `${simulacro.tiempo_por_pregunta_segundos}s por pregunta`
//         }
//         if (simulacro.tiempo_limite_minutos) {
//             return this.formatTime(simulacro.tiempo_limite_minutos)
//         }
//         return 'No definido'
//     }
//
//     getTipoPreguntaLabel(tipo) {
//         const labels = {
//             // Tipos básicos
//             'multiple': 'Opción Múltiple',
//             'true_false': 'Verdadero/Falso',
//             'multiple_respuesta': 'Múltiple Respuesta',
//             // Tipos de texto
//             'short_answer': 'Respuesta Corta',
//             'essay': 'Ensayo',
//             'fill_blanks': 'Completar Espacios',
//             // Tipos numéricos
//             'numerical': 'Numérica',
//             // Tipos interactivos
//             'matching': 'Emparejamiento',
//             'ordering': 'Ordenamiento',
//             // Tipos antiguos (compatibilidad)
//             'completar': 'Completar',
//             'unir': 'Unir Conceptos',
//             'rellenar': 'Rellenar Espacios'
//         }
//         return labels[tipo] || tipo
//     }
//
//     calculateGrade(correctAnswers, totalQuestions) {
//         if (totalQuestions === 0) return 0
//         return Math.round((correctAnswers / totalQuestions) * 100)
//     }
//
//     getGradeColor(grade) {
//         if (grade >= 80) return 'text-green-600 bg-green-50'
//         if (grade >= 60) return 'text-yellow-600 bg-yellow-50'
//         return 'text-red-600 bg-red-50'
//     }
//
//     getGradeLabel(grade) {
//         if (grade >= 90) return 'Excelente'
//         if (grade >= 80) return 'Muy Bueno'
//         if (grade >= 70) return 'Bueno'
//         if (grade >= 60) return 'Regular'
//         return 'Necesita Mejorar'
//     }
//
//     formatTime(minutes) {
//         if (!minutes || minutes === 0) return '0m'
//
//         const hours = Math.floor(minutes / 60)
//         const mins = minutes % 60
//
//         if (hours > 0) {
//             return `${hours}h ${mins}m`
//         }
//         return `${mins}m`
//     }
//
//     formatTimeSeconds(seconds) {
//         if (!seconds || seconds === 0) return '0:00'
//
//         const minutes = Math.floor(seconds / 60)
//         const secs = seconds % 60
//
//         if (minutes > 0) {
//             return `${minutes}:${secs.toString().padStart(2, '0')}`
//         }
//         return `0:${secs.toString().padStart(2, '0')}`
//     }
//
//     // ==================== VALIDACIÓN ESPECÍFICA PARA BACKEND ====================
//     async validateSimulacroConfig(config) {
//         const errors = {}
//
//         if (!config.titulo?.trim()) {
//             errors.titulo = 'El título es requerido'
//         }
//
//         if (!config.cursoId) {
//             errors.cursoId = 'El curso es requerido'
//         }
//
//         // Validar modo (nuevo o antiguo)
//         const modoValido = config.modo_estudio || config.modo_evaluacion
//         if (!modoValido) {
//             errors.modo = 'El modo es requerido'
//         }
//
//         if (!config.numero_preguntas || config.numero_preguntas < 1) {
//             errors.numero_preguntas = 'Debe tener al menos 1 pregunta'
//         }
//
//         if (config.tiempo_limite_minutos && config.tiempo_limite_minutos < 1) {
//             errors.tiempo_limite_minutos = 'El tiempo límite debe ser mayor a 0'
//         }
//
//         if (config.intentos_permitidos && config.intentos_permitidos < -1) {
//             errors.intentos_permitidos = 'Los intentos permitidos deben ser -1 (ilimitados) o mayor a 0'
//         }
//
//         return {
//             isValid: Object.keys(errors).length === 0,
//             errors
//         }
//     }
//
//     async validateQuestionData(questionData) {
//         const errors = {}
//
//         if (!questionData.enunciado?.trim()) {
//             errors.enunciado = 'El enunciado es requerido'
//         }
//
//         if (!questionData.simulacro_id) {
//             errors.simulacro_id = 'El simulacro es requerido'
//         }
//
//         if (!questionData.tipo_pregunta) {
//             errors.tipo_pregunta = 'El tipo de pregunta es requerido'
//         }
//
//         if (!questionData.opciones || questionData.opciones.length < 2) {
//             errors.opciones = 'Debe tener al menos 2 opciones'
//         }
//
//         const correctAnswers = questionData.opciones?.filter(op => op.es_correcta) || []
//         if (correctAnswers.length === 0) {
//             errors.respuesta_correcta = 'Debe tener al menos una respuesta correcta'
//         }
//
//         return {
//             isValid: Object.keys(errors).length === 0,
//             errors
//         }
//     }
//
//     // ==================== FUNCIONES DE UTILIDAD ====================
//     shuffleArray(array) {
//         const shuffled = [...array]
//         for (let i = shuffled.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
//         }
//         return shuffled
//     }
//
//     generateQuestionId() {
//         return 'q_' + Math.random().toString(36).substr(2, 9)
//     }
//
//     // ==================== FUNCIONES DE ANÁLISIS ====================
//     analyzeAttemptResults(intento) {
//         const puntaje = intento.puntaje || 0
//         const comentarios = []
//         const recomendaciones = []
//
//         if (puntaje >= 90) {
//             comentarios.push('¡Excelente desempeño! Dominas muy bien el tema.')
//         } else if (puntaje >= 80) {
//             comentarios.push('Muy buen trabajo. Solo algunos detalles por mejorar.')
//         } else if (puntaje >= 70) {
//             comentarios.push('Buen resultado. Con un poco más de estudio puedes mejorar.')
//             recomendaciones.push('Repasa los temas donde tuviste errores')
//         } else if (puntaje >= 60) {
//             comentarios.push('Resultado regular. Necesitas estudiar más algunos temas.')
//             recomendaciones.push('Dedica más tiempo al estudio de los conceptos básicos')
//             recomendaciones.push('Practica más simulacros')
//         } else {
//             comentarios.push('Necesitas mejorar significativamente. Te recomendamos repasar todo el material.')
//             recomendaciones.push('Revisa todo el material del curso')
//             recomendaciones.push('Considera solicitar ayuda adicional')
//             recomendaciones.push('Practica regularmente con simulacros')
//         }
//
//         return {
//             comentario: comentarios.join(' '),
//             recomendaciones,
//             nivel: this.getGradeLabel(puntaje)
//         }
//     }
//
//     // ==================== FUNCIONES DE FORMATEO ====================
//     formatAttemptForDisplay(intento) {
//         return {
//             ...intento,
//             puntaje_formateado: `${intento.puntaje}%`,
//             fecha_formateada: this.formatDate(intento.fecha_intento),
//             tiempo_formateado: this.formatTime(intento.tiempo_empleado_minutos),
//             estado_color: this.getGradeColor(intento.puntaje),
//             estado_label: this.getGradeLabel(intento.puntaje)
//         }
//     }
//
//     formatDate(dateString) {
//         if (!dateString) return 'No disponible'
//         return new Date(dateString).toLocaleString('es-ES', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         })
//     }
//
//     // ==================== CONSTANTES CON COMPATIBILIDAD ====================
//     get MODOS_EVALUACION() {
//         return {
//             // Antiguos
//             PRACTICA: 'practica',
//             REALISTA: 'realista',
//             EXAMEN: 'examen',
//             // 🆕 Nuevos
//             ESTUDIO: 'estudio',
//             REVISION: 'revision',
//             EVALUACION: 'evaluacion',
//             EXAMEN_REAL: 'examen_real'
//         }
//     }
//
//     get TIPOS_PREGUNTA() {
//         return {
//             // Básicos
//             MULTIPLE: 'multiple',
//             TRUE_FALSE: 'true_false',
//             MULTIPLE_RESPUESTA: 'multiple_respuesta',
//             // Texto
//             SHORT_ANSWER: 'short_answer',
//             ESSAY: 'essay',
//             FILL_BLANKS: 'fill_blanks',
//             // Numéricos
//             NUMERICAL: 'numerical',
//             // Interactivos
//             MATCHING: 'matching',
//             ORDERING: 'ordering',
//             // Antiguos (compatibilidad)
//             COMPLETAR: 'completar',
//             UNIR: 'unir',
//             RELLENAR: 'rellenar'
//         }
//     }
//
//     get TIPOS_TIEMPO() {
//         return {
//             SIN_LIMITE: 'sin_limite',
//             GLOBAL: 'global',
//             POR_PREGUNTA: 'por_pregunta'
//         }
//     }
//
//     get TIPOS_NAVEGACION() {
//         return {
//             LIBRE: 'libre',
//             SECUENCIAL: 'secuencial'
//         }
//     }
// }
//
// export default new SimulacrosService()

// src/services/simulacros.js - REFACTORIZADO PARA BACKEND NUEVO
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
                        // 🆕 CAMPOS NUEVOS DEL BACKEND REFACTORIZADO
                        modoEvaluacion: response.data.modoEvaluacion,
                        modoEstudio: response.data.modoEstudio,
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

    // ==================== COMPATIBILIDAD Y MAPEO ====================

    // 🆕 FUNCIÓN PRINCIPAL: Obtener modo unificado del simulacro
    getModoUnificado(simulacro) {
        // Priorizar modo_estudio (nuevo) sobre modo_evaluacion (antiguo)
        return simulacro.modo_estudio || this.mapModoEvaluacionToEstudio(simulacro.modo_evaluacion) || 'estudio'
    }

    // 🆕 MAPEO: Modo evaluación → Modo estudio
    mapModoEvaluacionToEstudio(modoEvaluacion) {
        const mapeo = {
            'practica': 'estudio',
            'realista': 'revision',
            'examen': 'examen_real'
        }
        return mapeo[modoEvaluacion] || 'estudio'
    }

    // 🆕 MAPEO: Modo estudio → Modo evaluación (para compatibilidad)
    mapModoEstudioToEvaluacion(modoEstudio) {
        const mapeo = {
            'estudio': 'practica',
            'revision': 'realista',
            'evaluacion': 'realista',
            'examen_real': 'examen'
        }
        return mapeo[modoEstudio] || 'practica'
    }

    // 🆕 MAPEO: Tipo pregunta backend → frontend
    mapTipoPreguntaFromBackend(tipoPregunta) {
        const mapeo = {
            // Backend → Frontend
            'multiple_choice': 'multiple_choice',
            'true_false': 'true_false',
            'text_free': 'text_free',
            'matching': 'matching',
            'ordering': 'ordering',
            'fill_blank': 'fill_blank',
            // Compatibilidad con tipos antiguos
            'multiple': 'multiple_choice',
            'completar': 'fill_blank',
            'unir': 'matching',
            'rellenar': 'fill_blank'
        }
        return mapeo[tipoPregunta] || tipoPregunta
    }

    // ==================== LABELS Y DISPLAY ====================

    getModoEvaluacionLabel(modo) {
        const labels = {
            // 🆕 Modos nuevos (prioridad)
            'estudio': 'Modo Estudio',
            'revision': 'Modo Revisión',
            'evaluacion': 'Modo Evaluación',
            'examen_real': 'Examen Oficial',
            // Modos antiguos (compatibilidad)
            'practica': 'Modo Práctica',
            'realista': 'Modo Realista',
            'examen': 'Modo Examen'
        }
        return labels[modo] || modo
    }

    getModoEvaluacionColor(modo) {
        const colors = {
            // 🆕 Modos nuevos con colores profesionales
            'estudio': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'revision': 'bg-blue-100 text-blue-800 border-blue-200',
            'evaluacion': 'bg-amber-100 text-amber-800 border-amber-200',
            'examen_real': 'bg-red-100 text-red-800 border-red-200',
            // Modos antiguos (compatibilidad)
            'practica': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'realista': 'bg-amber-100 text-amber-800 border-amber-200',
            'examen': 'bg-red-100 text-red-800 border-red-200'
        }
        return colors[modo] || 'bg-gray-100 text-gray-800 border-gray-200'
    }

    // 🆕 NUEVAS FUNCIONES PARA CAMPOS AVANZADOS
    getTipoTiempoLabel(tipo) {
        const labels = {
            'sin_limite': 'Sin límite de tiempo',
            'global': 'Tiempo límite global',
            'por_pregunta': 'Tiempo por pregunta'
        }
        return labels[tipo] || tipo
    }

    getTipoNavegacionLabel(tipo) {
        const labels = {
            'libre': 'Navegación libre',
            'secuencial': 'Navegación secuencial'
        }
        return labels[tipo] || tipo
    }

    getTipoPreguntaLabel(tipo) {
        const labels = {
            // 🆕 Tipos nuevos del backend
            'multiple_choice': 'Selección Múltiple',
            'true_false': 'Verdadero/Falso',
            'text_free': 'Respuesta Libre',
            'matching': 'Emparejamiento',
            'ordering': 'Ordenamiento',
            'fill_blank': 'Completar Espacios',
            // Tipos antiguos (compatibilidad)
            'multiple': 'Selección Múltiple',
            'short_answer': 'Respuesta Corta',
            'essay': 'Ensayo',
            'numerical': 'Respuesta Numérica',
            'completar': 'Completar',
            'unir': 'Unir Conceptos'
        }
        return labels[tipo] || tipo
    }

    // 🆕 FORMATO DE TIEMPO MEJORADO
    formatTiempoSimulacro(simulacro) {
        // Usar campos nuevos del backend
        if (simulacro.tipo_tiempo === 'sin_limite') return 'Sin límite'

        if (simulacro.tipo_tiempo === 'por_pregunta' && simulacro.tiempo_por_pregunta_segundos) {
            const minutos = Math.floor(simulacro.tiempo_por_pregunta_segundos / 60)
            const segundos = simulacro.tiempo_por_pregunta_segundos % 60
            if (minutos > 0) {
                return `${minutos}:${segundos.toString().padStart(2, '0')} por pregunta`
            }
            return `${simulacro.tiempo_por_pregunta_segundos}s por pregunta`
        }

        if (simulacro.tiempo_limite_minutos) {
            return this.formatTime(simulacro.tiempo_limite_minutos)
        }

        return 'Tiempo no definido'
    }

    // ==================== VALIDACIONES SEGÚN TIPO DE EVALUACIÓN ====================

    // 🆕 VALIDACIÓN: ¿Puede navegar hacia atrás?
    canNavigateBack(simulacro, currentQuestion) {
        const modo = this.getModoUnificado(simulacro)

        // En examen real, navegación solo secuencial
        if (modo === 'examen_real') return false

        // En evaluación, según configuración
        if (modo === 'evaluacion' && simulacro.tipo_navegacion === 'secuencial') return false

        // En otros modos, usar configuración de navegación
        return simulacro.tipo_navegacion !== 'secuencial'
    }

    // 🆕 VALIDACIÓN: ¿Puede navegar hacia adelante?
    canNavigateForward(simulacro, currentQuestion, respuestas, preguntas) {
        const currentPregunta = preguntas[currentQuestion]
        const hasAnswer = respuestas[currentPregunta?.id]

        // Si navegación es libre, siempre puede avanzar
        if (simulacro.tipo_navegacion === 'libre') return true

        // En navegación secuencial, debe tener respuesta
        if (simulacro.tipo_navegacion === 'secuencial') {
            return hasAnswer || false
        }

        return true
    }

    // 🆕 VALIDACIÓN: ¿Debe mostrar confirmación al finalizar?
    shouldShowFinishConfirmation(simulacro, respuestas, preguntas) {
        const modo = this.getModoUnificado(simulacro)
        const respuestasCount = Object.keys(respuestas).length
        const preguntasCount = preguntas.length

        const config = {
            shouldShow: false,
            level: 'normal', // 'normal', 'warning', 'critical'
            title: '',
            message: '',
            confirmText: 'Finalizar'
        }

        // Examen real: confirmación crítica
        if (modo === 'examen_real') {
            config.shouldShow = true
            config.level = 'critical'
            config.title = '🚨 FINALIZAR EXAMEN OFICIAL'
            config.message = `Esta acción es DEFINITIVA e IRREVERSIBLE.\n\nResumen:\n• Preguntas respondidas: ${respuestasCount}/${preguntasCount}\n• Modo: Examen Oficial\n• No podrás repetir este examen`
            config.confirmText = 'FINALIZAR EXAMEN'
        }
        // Evaluación: confirmación seria
        else if (modo === 'evaluacion') {
            config.shouldShow = true
            config.level = 'warning'
            config.title = '⚠️ Finalizar Evaluación'
            config.message = `Una vez enviado no podrás modificar tus respuestas.\n\nResumen:\n• Preguntas respondidas: ${respuestasCount}/${preguntasCount}\n• Modo: Evaluación Formal`
            config.confirmText = 'Finalizar Evaluación'
        }
        // Estudio/Revisión: confirmación suave (solo si hay preguntas sin responder)
        else if (respuestasCount < preguntasCount) {
            config.shouldShow = true
            config.level = 'normal'
            config.title = '📝 Finalizar Simulacro'
            config.message = `Tienes ${preguntasCount - respuestasCount} preguntas sin responder.\n\n¿Deseas finalizar de todas formas?`
            config.confirmText = 'Sí, Finalizar'
        }

        return config
    }

    // ==================== HELPERS DE CALIFICACIÓN ====================

    calculateGrade(correctAnswers, totalQuestions) {
        if (totalQuestions === 0) return 0
        return Math.round((correctAnswers / totalQuestions) * 100)
    }

    getGradeColor(grade) {
        if (grade >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
        if (grade >= 75) return 'text-blue-600 bg-blue-50 border-blue-200'
        if (grade >= 65) return 'text-amber-600 bg-amber-50 border-amber-200'
        return 'text-red-600 bg-red-50 border-red-200'
    }

    getGradeLabel(grade) {
        if (grade >= 90) return 'Excelente'
        if (grade >= 80) return 'Muy Bueno'
        if (grade >= 70) return 'Bueno'
        if (grade >= 60) return 'Regular'
        return 'Necesita Mejorar'
    }

    // ==================== HELPERS DE FORMATO ====================

    formatTime(minutes) {
        if (!minutes || minutes === 0) return '0 min'

        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60

        if (hours > 0) {
            return `${hours}h ${mins}min`
        }
        return `${mins} min`
    }

    formatTimeSeconds(seconds) {
        if (!seconds || seconds === 0) return '0:00'

        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60

        return `${minutes}:${secs.toString().padStart(2, '0')}`
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

    // ==================== CONSTANTES ACTUALIZADAS ====================

    get MODOS_EVALUACION() {
        return {
            // 🆕 Nuevos (prioridad)
            ESTUDIO: 'estudio',
            REVISION: 'revision',
            EVALUACION: 'evaluacion',
            EXAMEN_REAL: 'examen_real',
            // Antiguos (compatibilidad)
            PRACTICA: 'practica',
            REALISTA: 'realista',
            EXAMEN: 'examen'
        }
    }

    get TIPOS_PREGUNTA() {
        return {
            // 🆕 Nuevos del backend
            MULTIPLE_CHOICE: 'multiple_choice',
            TRUE_FALSE: 'true_false',
            TEXT_FREE: 'text_free',
            MATCHING: 'matching',
            ORDERING: 'ordering',
            FILL_BLANK: 'fill_blank',
            // Antiguos (compatibilidad)
            MULTIPLE: 'multiple',
            SHORT_ANSWER: 'short_answer',
            ESSAY: 'essay',
            NUMERICAL: 'numerical'
        }
    }

    get TIPOS_TIEMPO() {
        return {
            SIN_LIMITE: 'sin_limite',
            GLOBAL: 'global',
            POR_PREGUNTA: 'por_pregunta'
        }
    }

    get TIPOS_NAVEGACION() {
        return {
            LIBRE: 'libre',
            SECUENCIAL: 'secuencial'
        }
    }

    // ==================== ANÁLISIS Y ESTADÍSTICAS ====================

    analyzeAttemptResults(intento) {
        const puntaje = intento.puntaje || 0
        const modo = intento.modo_estudio || intento.modo_evaluacion || 'estudio'

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
            comentarios.push('Necesitas mejorar significativamente.')
            recomendaciones.push('Revisa todo el material del curso')
            recomendaciones.push('Considera solicitar ayuda adicional')
            if (modo === 'estudio') {
                recomendaciones.push('Practica más en modo estudio antes de hacer evaluaciones')
            }
        }

        return {
            comentario: comentarios.join(' '),
            recomendaciones,
            nivel: this.getGradeLabel(puntaje)
        }
    }

    // 🆕 UTILIDADES PARA FRONTEND
    generateQuestionId() {
        return 'q_' + Math.random().toString(36).substr(2, 9)
    }

    shuffleArray(array) {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        return shuffled
    }
}

export default new SimulacrosService()