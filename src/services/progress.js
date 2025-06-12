// src/services/progress.js - CORREGIDO COMPLETAMENTE
import apiService from './api'

class ProgressService {

    // =============================================
    // ACTUALIZAR PROGRESO DE CLASE
    // =============================================
    async updateClassProgress(claseId, porcentajeVisto, completada = false) {
        try {
            console.log('Actualizando progreso:', { claseId, porcentajeVisto, completada })
            const response = await apiService.patch(`/progress/class/${claseId}`, {
                porcentajeVisto,
                completada
            })

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    progreso: response.data?.progreso,
                    message: response.message || 'Progreso actualizado'
                }
            }

            return {
                success: false,
                error: response.message || 'Error actualizando progreso'
            }
        } catch (error) {
            console.error('Error actualizando progreso:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // OBTENER PROGRESO POR CURSO
    // =============================================
    async getCourseProgress(cursoId) {
        try {
            console.log('Obteniendo progreso del curso:', cursoId)
            const response = await apiService.get(`/progress/course/${cursoId}`)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    curso: response.data.curso,
                    resumen: response.data.resumen,
                    modulos: response.data.modulos
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo progreso del curso'
            }
        } catch (error) {
            console.error('Error obteniendo progreso:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // OBTENER PROGRESO GENERAL DEL USUARIO
    // =============================================
    async getMyOverallProgress() {
        try {
            const response = await apiService.get('/progress/my-overall')

            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data,
                    estadisticas: response.data.estadisticas,
                    cursos: response.data.cursos
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo progreso general'
            }
        } catch (error) {
            console.error('Error obteniendo progreso general:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // MARCAR CLASE COMO COMPLETADA
    // =============================================
    async markClassAsCompleted(claseId) {
        return await this.updateClassProgress(claseId, 100, true)
    }

    // =============================================
    // MARCAR CLASE COMO VISTA PARCIALMENTE
    // =============================================
    async markClassAsPartiallyViewed(claseId, porcentaje) {
        const completada = porcentaje >= 95
        return await this.updateClassProgress(claseId, porcentaje, completada)
    }

    // =============================================
    // TRACKING DE VIDEO (Para YouTube)
    // =============================================
    async trackVideoProgress(claseId, currentTime, duration) {
        if (!duration || duration === 0) return

        const porcentaje = Math.min(Math.round((currentTime / duration) * 100), 100)

        // Solo actualizar si hay un cambio significativo (cada 5%)
        if (porcentaje > 0 && porcentaje % 5 === 0) {
            return await this.updateClassProgress(claseId, porcentaje)
        }
    }

    // =============================================
    // HELPER: CALCULAR PROGRESO DE MÓDULO
    // =============================================
    calculateModuleProgress(modulo) {
        if (!modulo.clases || modulo.clases.length === 0) {
            return { porcentaje: 0, completadas: 0, total: 0 }
        }

        const total = modulo.clases.length
        const completadas = modulo.clases.filter(clase => clase.completada).length
        const porcentaje = Math.round((completadas / total) * 100)

        return { porcentaje, completadas, total }
    }

    // =============================================
    // HELPER: CALCULAR PROGRESO TOTAL DEL CURSO
    // =============================================
    calculateCourseProgress(modulos) {
        if (!modulos || modulos.length === 0) {
            return { porcentaje: 0, completadas: 0, total: 0 }
        }

        let totalClases = 0
        let clasesCompletadas = 0

        modulos.forEach(modulo => {
            if (modulo.clases) {
                totalClases += modulo.clases.length
                clasesCompletadas += modulo.clases.filter(clase => clase.completada).length
            }
        })

        const porcentaje = totalClases > 0 ? Math.round((clasesCompletadas / totalClases) * 100) : 0

        return { porcentaje, completadas: clasesCompletadas, total: totalClases }
    }

    // =============================================
    // HELPER: OBTENER SIGUIENTE CLASE
    // =============================================
    getNextClass(modulos, currentClaseId = null) {
        let foundCurrent = !currentClaseId // Si no hay clase actual, empezar desde el principio

        for (const modulo of modulos) {
            if (modulo.clases) {
                for (const clase of modulo.clases) {
                    // Si encontramos la clase actual, marcar para buscar la siguiente
                    if (clase.id === currentClaseId) {
                        foundCurrent = true
                        continue
                    }

                    // Si ya pasamos la clase actual, buscar la siguiente disponible
                    if (foundCurrent && clase.puede_acceder && !clase.completada) {
                        return {
                            modulo: modulo.modulo_titulo,
                            clase: clase.titulo,
                            claseId: clase.id,
                            moduloId: modulo.modulo_id
                        }
                    }

                    // Si no hay clase actual, buscar la primera disponible
                    if (!currentClaseId && clase.puede_acceder) {
                        return {
                            modulo: modulo.modulo_titulo,
                            clase: clase.titulo,
                            claseId: clase.id,
                            moduloId: modulo.modulo_id
                        }
                    }
                }
            }
        }
        return null
    }

    // =============================================
    // HELPER: OBTENER CLASE ANTERIOR
    // =============================================
    getPreviousClass(modulos, currentClaseId) {
        let previousClass = null

        for (const modulo of modulos) {
            if (modulo.clases) {
                for (const clase of modulo.clases) {
                    if (clase.id === currentClaseId) {
                        return previousClass
                    }

                    if (clase.puede_acceder) {
                        previousClass = {
                            modulo: modulo.modulo_titulo,
                            clase: clase.titulo,
                            claseId: clase.id,
                            moduloId: modulo.modulo_id
                        }
                    }
                }
            }
        }
        return null
    }

    // =============================================
    // HELPER: OBTENER ESTADÍSTICAS DE PROGRESO
    // =============================================
    getProgressStats(resumen) {
        const stats = {
            nivel: 'Principiante',
            mensaje: 'Recién comenzando',
            color: 'gray',
            bgColor: 'bg-gray-100',
            textColor: 'text-gray-800'
        }

        const porcentaje = resumen.porcentaje_progreso || 0

        if (porcentaje >= 90) {
            stats.nivel = 'Experto'
            stats.mensaje = '¡Casi terminado!'
            stats.color = 'green'
            stats.bgColor = 'bg-green-100'
            stats.textColor = 'text-green-800'
        } else if (porcentaje >= 70) {
            stats.nivel = 'Avanzado'
            stats.mensaje = 'Excelente progreso'
            stats.color = 'blue'
            stats.bgColor = 'bg-blue-100'
            stats.textColor = 'text-blue-800'
        } else if (porcentaje >= 40) {
            stats.nivel = 'Intermedio'
            stats.mensaje = 'Buen avance'
            stats.color = 'yellow'
            stats.bgColor = 'bg-yellow-100'
            stats.textColor = 'text-yellow-800'
        } else if (porcentaje >= 10) {
            stats.nivel = 'Iniciando'
            stats.mensaje = 'Primer paso dado'
            stats.color = 'orange'
            stats.bgColor = 'bg-orange-100'
            stats.textColor = 'text-orange-800'
        }

        return stats
    }

    // =============================================
    // HELPER: VALIDAR ACCESO A CLASE
    // =============================================
    canAccessClass(clase, cursoData) {
        // Clase gratuita = acceso libre
        if (clase.es_gratuita) return true

        // Curso gratuito = acceso libre
        if (cursoData?.es_gratuito) return true

        // Curso pago con inscripción habilitada
        return cursoData?.estado_pago === 'habilitado'
    }

    // =============================================
    // HELPER: FORMATEAR DURACIÓN
    // =============================================
    formatDuration(minutos) {
        if (!minutos) return 'No disponible'

        if (minutos < 60) {
            return `${minutos} min`
        }

        const horas = Math.floor(minutos / 60)
        const mins = minutos % 60
        return `${horas}h ${mins}min`
    }

    // =============================================
    // HELPER: EXTRAER ID DE VIDEO DE YOUTUBE
    // =============================================
    extractYouTubeVideoId(url) {
        if (!url) return null

        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)

        return (match && match[2].length === 11) ? match[2] : null
    }

    // =============================================
    // FUNCIONES LEGACY (para compatibilidad)
    // =============================================
    async actualizarProgresoClase(claseId, porcentaje, completada) {
        return await this.updateClassProgress(claseId, porcentaje, completada)
    }

    async obtenerProgresoCurso(cursoId) {
        return await this.getCourseProgress(cursoId)
    }

    async obtenerProgresoGeneral() {
        return await this.getMyOverallProgress()
    }

    async marcarClaseCompletada(claseId) {
        return await this.markClassAsCompleted(claseId)
    }
}

export default new ProgressService()