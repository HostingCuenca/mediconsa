// src/services/simulacrosAdmin.js - Servicio para mantenimiento de simulacros
import apiService from './api'

class SimulacrosAdminService {

    /**
     * ========== MANTENIMIENTO DE INTENTOS ==========
     * Endpoints para purificación de base de datos
     * NO incluye creación/edición de simulacros (eso está en otro servicio)
     */

    /**
     * Obtener intentos de simulacros con filtros
     * NOTA: Por motivos de optimización, solo se obtienen los últimos 100 intentos
     * @param {Object} filters - Filtros opcionales
     * @param {string} filters.cursoId - ID del curso para filtrar
     * @param {string} filters.simulacroId - ID del simulacro para filtrar
     * @param {number} filters.limit - Límite de resultados (máximo 100)
     * @param {number} filters.offset - Offset para paginación
     * @returns {Promise<Object>} Lista de intentos con estadísticas
     */
    async getIntentos(filters = {}) {
        try {
            console.log('📊 Obteniendo intentos de simulacros:', filters)

            const params = new URLSearchParams()
            if (filters.cursoId) params.append('cursoId', filters.cursoId)
            if (filters.simulacroId) params.append('simulacroId', filters.simulacroId)
            if (filters.limit) params.append('limit', filters.limit)
            if (filters.offset) params.append('offset', filters.offset)

            const queryString = params.toString()
            const url = `/simulacros/admin/intentos${queryString ? `?${queryString}` : ''}`

            const response = await apiService.get(url)

            if (response.success && response.data) {
                console.log('✅ Intentos obtenidos:', response.data.intentos?.length || 0)
                return {
                    success: true,
                    data: {
                        intentos: response.data.intentos || [],
                        estadisticas: response.data.estadisticas || {},
                        total: response.data.total || 0
                    }
                }
            }

            return {
                success: false,
                error: response.error || 'Error obteniendo intentos'
            }
        } catch (error) {
            console.error('❌ Error obteniendo intentos:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    /**
     * Obtener estadísticas de intentos por curso
     * @param {string} cursoId - ID del curso (requerido)
     * @returns {Promise<Object>} Estadísticas completas de intentos
     */
    async getStats(cursoId) {
        try {
            if (!cursoId) {
                return {
                    success: false,
                    error: 'Se requiere un ID de curso para obtener estadísticas'
                }
            }

            console.log('📊 Obteniendo estadísticas del curso:', cursoId)

            const url = `/simulacros/admin/intentos/stats/${cursoId}`

            const response = await apiService.get(url)

            if (response.success && response.data) {
                console.log('✅ Estadísticas obtenidas:', response.data)
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.error || 'Error obteniendo estadísticas'
            }
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    /**
     * Eliminar intentos de simulacros (purificación)
     * IMPORTANTE: Solo elimina intentos y respuestas_usuario
     * NO elimina simulacros, preguntas ni opciones
     * @param {Array<string>} intentoIds - Array de IDs de intentos a eliminar
     * @returns {Promise<Object>} Resultado de la eliminación
     */
    async eliminarIntentos(intentoIds) {
        try {
            console.log('🗑️ Eliminando intentos:', intentoIds.length)

            if (!intentoIds || intentoIds.length === 0) {
                return {
                    success: false,
                    error: 'No se proporcionaron IDs de intentos'
                }
            }

            const response = await apiService.delete('/simulacros/admin/intentos', {
                intentoIds
            })

            if (response.success) {
                console.log('✅ Intentos eliminados:', response.data)
                return {
                    success: true,
                    data: {
                        intentos_eliminados: response.data.intentos_eliminados || 0,
                        respuestas_eliminadas: response.data.respuestas_eliminadas || 0,
                        mensaje: response.data.mensaje || 'Intentos eliminados correctamente'
                    }
                }
            }

            return {
                success: false,
                error: response.error || 'Error eliminando intentos'
            }
        } catch (error) {
            console.error('❌ Error eliminando intentos:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    /**
     * ========== HELPERS Y UTILIDADES ==========
     */

    /**
     * Agrupar intentos por curso
     * @param {Array} intentos - Lista de intentos
     * @returns {Object} Intentos agrupados por curso
     */
    agruparPorCurso(intentos) {
        const grupos = {}

        intentos.forEach(intento => {
            const cursoId = intento.curso?.id
            if (!cursoId) return

            if (!grupos[cursoId]) {
                grupos[cursoId] = {
                    curso: intento.curso,
                    intentos: [],
                    totalIntentos: 0,
                    totalRespuestas: 0
                }
            }

            grupos[cursoId].intentos.push(intento)
            grupos[cursoId].totalIntentos++
            grupos[cursoId].totalRespuestas += intento.almacenamiento?.respuestas_guardadas || 0
        })

        return grupos
    }

    /**
     * Agrupar intentos por simulacro
     * @param {Array} intentos - Lista de intentos
     * @returns {Object} Intentos agrupados por simulacro
     */
    agruparPorSimulacro(intentos) {
        const grupos = {}

        intentos.forEach(intento => {
            const simulacroId = intento.simulacro?.id
            if (!simulacroId) return

            if (!grupos[simulacroId]) {
                grupos[simulacroId] = {
                    simulacro: intento.simulacro,
                    curso: intento.curso,
                    intentos: [],
                    totalIntentos: 0,
                    totalRespuestas: 0
                }
            }

            grupos[simulacroId].intentos.push(intento)
            grupos[simulacroId].totalIntentos++
            grupos[simulacroId].totalRespuestas += intento.almacenamiento?.respuestas_guardadas || 0
        })

        return grupos
    }

    /**
     * Calcular estadísticas de almacenamiento
     * @param {Array} intentos - Lista de intentos
     * @returns {Object} Estadísticas calculadas
     */
    calcularEstadisticas(intentos) {
        const totalIntentos = intentos.length
        const totalRespuestas = intentos.reduce((sum, intento) => {
            return sum + (intento.almacenamiento?.respuestas_guardadas || 0)
        }, 0)

        // Estimación: cada respuesta ocupa ~200 bytes en promedio
        const bytesEstimados = totalRespuestas * 200
        const mbEstimados = (bytesEstimados / (1024 * 1024)).toFixed(2)

        return {
            totalIntentos,
            totalRespuestas,
            espacioEstimadoMB: parseFloat(mbEstimados),
            espacioEstimadoGB: (parseFloat(mbEstimados) / 1024).toFixed(3)
        }
    }

    /**
     * Formatear fecha
     * @param {string} dateString - Fecha en formato ISO
     * @returns {string} Fecha formateada
     */
    formatearFecha(dateString) {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    /**
     * Formatear tamaño de archivo
     * @param {number} bytes - Tamaño en bytes
     * @returns {string} Tamaño formateado
     */
    formatearTamano(bytes) {
        if (!bytes || bytes === 0) return '0 B'

        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(1024))

        return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
    }
}

export default new SimulacrosAdminService()
