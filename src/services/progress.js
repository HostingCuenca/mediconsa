// src/services/progress.js - Servicio de progreso refactorizado para Node.js Backend
import apiService from './api'

class ProgressService {

    // =============================================
    // ACTUALIZAR PROGRESO DE CLASE
    // =============================================
    async updateClassProgress(claseId, porcentajeVisto, completada = false) {
        try {
            const response = await apiService.patch(`/progress/class/${claseId}`, {
                porcentajeVisto,
                completada
            })

            return {
                success: true,
                data: response.data || response,
                progreso: response.data?.progreso || response.progreso || null,
                message: response.message || 'Progreso actualizado'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // OBTENER PROGRESO POR CURSO
    // =============================================
    async getCourseProgress(cursoId) {
        try {
            const response = await apiService.get(`/progress/course/${cursoId}`)

            return {
                success: true,
                data: response.data || response,
                curso: response.data?.curso || response.curso || null,
                resumen: response.data?.resumen || response.resumen || {},
                modulos: response.data?.modulos || response.modulos || []
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                curso: null,
                resumen: {},
                modulos: []
            }
        }
    }

    // =============================================
    // OBTENER PROGRESO GENERAL DEL USUARIO
    // =============================================
    async getMyOverallProgress() {
        try {
            const response = await apiService.get('/progress/my-overall')

            return {
                success: true,
                data: response.data || response,
                estadisticas: response.data?.estadisticas || response.estadisticas || {},
                cursos: response.data?.cursos || response.cursos || []
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                estadisticas: {},
                cursos: []
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
    getNextClass(modulos) {
        for (const modulo of modulos) {
            if (modulo.clases) {
                for (const clase of modulo.clases) {
                    if (!clase.completada && clase.puede_acceder) {
                        return {
                            modulo: modulo.titulo,
                            clase: clase.titulo,
                            claseId: clase.id,
                            moduloId: modulo.id
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
            color: 'gray'
        }

        const porcentaje = resumen.porcentaje_progreso || 0

        if (porcentaje >= 90) {
            stats.nivel = 'Experto'
            stats.mensaje = '¡Casi terminado!'
            stats.color = 'green'
        } else if (porcentaje >= 70) {
            stats.nivel = 'Avanzado'
            stats.mensaje = 'Excelente progreso'
            stats.color = 'blue'
        } else if (porcentaje >= 40) {
            stats.nivel = 'Intermedio'
            stats.mensaje = 'Buen avance'
            stats.color = 'yellow'
        } else if (porcentaje >= 10) {
            stats.nivel = 'Iniciando'
            stats.mensaje = 'Primer paso dado'
            stats.color = 'orange'
        }

        return stats
    }

    // =============================================
    // HELPER: VALIDAR ACCESO A CLASE
    // =============================================
    canAccessClass(clase, inscripcion) {
        // Clase gratuita = acceso libre
        if (clase.es_gratuita) return true

        // Curso gratuito = acceso libre
        if (inscripcion?.es_gratuito) return true

        // Curso pago con inscripción habilitada
        return inscripcion?.estado_pago === 'habilitado'
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