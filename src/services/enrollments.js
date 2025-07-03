
// src/services/enrollments.js - COMPLETO BASADO EN RUTAS REALES
import apiService from './api'

class EnrollmentsService {

    // =============================================
    // OBTENER MIS INSCRIPCIONES (MyCourses)
    // =============================================
    async getMyEnrollments(filters = {}) {
        try {
            console.log('Obteniendo mis inscripciones:', filters)
            const response = await apiService.get('/enrollments/my', filters)
            console.log('Respuesta mis inscripciones:', response)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        inscripciones: response.data.inscripciones || [],
                        total: response.data.inscripciones?.length || 0
                    }
                }
            }

            return {
                success: false,
                error: 'No se pudieron cargar tus cursos'
            }

        } catch (error) {
            console.error('Error obteniendo inscripciones:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // INSCRIBIRSE A UN CURSO
    // =============================================
    async enrollCourse(cursoId) {
        try {
            console.log('Inscribiéndose al curso:', cursoId)
            const response = await apiService.post('/enrollments', { cursoId })

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Inscripción exitosa',
                    whatsappMessage: response.data?.whatsappMessage
                }
            }

            return {
                success: false,
                error: response.message || 'Error en la inscripción'
            }

        } catch (error) {
            console.error('Error inscribiéndose:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // VERIFICAR ACCESO A CURSO
    // =============================================
    async checkCourseAccess(cursoId) {
        try {
            const response = await apiService.get(`/enrollments/check-access/${cursoId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error verificando acceso'
            }

        } catch (error) {
            console.error('Error verificando acceso:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // OBTENER TODAS LAS INSCRIPCIONES (ADMIN) - NUEVO
    // =============================================
    // async getAllEnrollments(filters = {}) {
    //     try {
    //         console.log('Obteniendo todas las inscripciones (admin):', filters)
    //         const response = await apiService.get('/enrollments/admin/all', filters)
    //         console.log('Respuesta todas las inscripciones:', response)
    //
    //         if (response.success && response.data) {
    //             return {
    //                 success: true,
    //                 data: {
    //                     inscripciones: response.data.inscripciones || [],
    //                     pagination: response.data.pagination || {}
    //                 }
    //             }
    //         }
    //
    //         return {
    //             success: false,
    //             error: 'No se pudieron cargar todas las inscripciones'
    //         }
    //
    //     } catch (error) {
    //         console.error('Error obteniendo todas las inscripciones:', error)
    //         return {
    //             success: false,
    //             error: error.message || 'Error de conexión'
    //         }
    //     }
    // }

    async getAllEnrollments(filters = {}) {
        try {
            console.log('🔄 Iniciando carga de inscripciones con lazy loading:', filters)

            const {
                search = '',
                estado = '',
                curso = '',
                fechaDesde = '',
                fechaHasta = '',
                priority = 'pending', // 'pending', 'recent', 'all'
                limit = 100,
                offset = 0,
                loadAll = false // Si es true, carga todo progresivamente
            } = filters

            // Preparar parámetros para el backend
            const params = {
                search: search.trim(),
                estado: estado.trim(),
                curso: curso.trim(),
                fechaDesde: fechaDesde.trim(),
                fechaHasta: fechaHasta.trim(),
                priority,
                limit: parseInt(limit) || 100,
                offset: parseInt(offset) || 0
            }

            // Limpiar parámetros vacíos
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null || params[key] === undefined) {
                    delete params[key]
                }
            })

            const response = await apiService.get('/enrollments/admin/all', params)
            console.log('📊 Respuesta del servidor:', response)

            if (response.success && response.data) {
                const result = {
                    success: true,
                    data: {
                        inscripciones: response.data.inscripciones || [],
                        statistics: response.data.statistics || {},
                        lazy_loading: response.data.lazy_loading || {},
                        filters_applied: response.data.filters_applied || {},
                        hasMore: response.data.lazy_loading?.next_batch !== null,
                        nextOffset: response.data.lazy_loading?.next_batch?.offset || null,
                        progress: response.data.lazy_loading?.progress || {}
                    }
                }

                // 🚀 CARGA AUTOMÁTICA PROGRESIVA (si loadAll está activo)
                if (loadAll && result.data.hasMore) {
                    console.log('🔄 Activando carga automática progresiva...')

                    // Cargar siguiente batch automáticamente
                    const nextFilters = {
                        ...filters,
                        offset: result.data.nextOffset,
                        loadAll: false // Evitar recursión infinita
                    }

                    // Cargar siguiente batch después de un pequeño delay
                    setTimeout(async () => {
                        try {
                            const nextBatch = await this.getAllEnrollments(nextFilters)
                            if (nextBatch.success) {
                                // Emitir evento para que el frontend maneje la nueva data
                                this.emitProgressiveLoad?.(nextBatch.data)
                            }
                        } catch (error) {
                            console.warn('Error en carga progresiva:', error)
                        }
                    }, 500) // Delay de 500ms entre cargas
                }

                return result
            }

            return {
                success: false,
                error: response.message || 'No se pudieron cargar las inscripciones'
            }

        } catch (error) {
            console.error('❌ Error obteniendo inscripciones:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

// =============================================
// MÉTODO AUXILIAR: CARGAR SIGUIENTE BATCH
// =============================================
    async loadNextBatch(currentState, filters = {}) {
        try {
            console.log('📥 Cargando siguiente batch...', { currentState, filters })

            if (!currentState.hasMore || !currentState.nextOffset) {
                return {
                    success: false,
                    error: 'No hay más datos para cargar'
                }
            }

            const nextFilters = {
                ...filters,
                offset: currentState.nextOffset,
                limit: currentState.lazy_loading?.next_batch?.estimated_size || 100
            }

            const result = await this.getAllEnrollments(nextFilters)

            if (result.success) {
                // Combinar datos existentes con nuevos datos
                return {
                    success: true,
                    data: {
                        ...result.data,
                        inscripciones: [...(currentState.inscripciones || []), ...result.data.inscripciones]
                    }
                }
            }

            return result

        } catch (error) {
            console.error('❌ Error cargando siguiente batch:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    async getEnrollmentStats() {
        try {
            console.log('📊 Obteniendo estadísticas de inscripciones...')

            const response = await apiService.get('/enrollments/admin/stats')

            if (response.success && response.data) {
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
            console.error('❌ Error obteniendo estadísticas:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    async loadAllEnrollmentsProgressive(filters = {}, onProgress = null) {
        try {
            console.log('🚀 Iniciando carga completa progresiva...')

            let allInscripciones = []
            let currentOffset = 0
            let hasMore = true
            let totalLoaded = 0
            let totalRecords = 0

            // Primera carga (prioridad a pendientes)
            const firstBatch = await this.getAllEnrollments({
                ...filters,
                priority: 'pending',
                offset: 0,
                limit: 100
            })

            if (!firstBatch.success) {
                return firstBatch
            }

            allInscripciones = [...firstBatch.data.inscripciones]
            hasMore = firstBatch.data.hasMore
            currentOffset = firstBatch.data.nextOffset || 0
            totalRecords = firstBatch.data.statistics?.total_inscripciones || 0
            totalLoaded = allInscripciones.length

            // Notificar progreso inicial
            onProgress?.({
                loaded: totalLoaded,
                total: totalRecords,
                percentage: totalRecords > 0 ? Math.round((totalLoaded / totalRecords) * 100) : 100,
                inscripciones: allInscripciones,
                statistics: firstBatch.data.statistics
            })

            // Cargar el resto progresivamente
            while (hasMore && currentOffset < totalRecords) {
                console.log(`📥 Cargando batch ${Math.ceil(currentOffset / 100) + 1}...`)

                const nextBatch = await this.getAllEnrollments({
                    ...filters,
                    priority: 'all', // Cambiar a 'all' después del primer batch
                    offset: currentOffset,
                    limit: 100
                })

                if (nextBatch.success && nextBatch.data.inscripciones.length > 0) {
                    allInscripciones = [...allInscripciones, ...nextBatch.data.inscripciones]
                    hasMore = nextBatch.data.hasMore
                    currentOffset = nextBatch.data.nextOffset || (currentOffset + 100)
                    totalLoaded = allInscripciones.length

                    // Notificar progreso
                    onProgress?.({
                        loaded: totalLoaded,
                        total: totalRecords,
                        percentage: totalRecords > 0 ? Math.round((totalLoaded / totalRecords) * 100) : 100,
                        inscripciones: allInscripciones,
                        statistics: nextBatch.data.statistics
                    })

                    // Pequeño delay para no sobrecargar
                    await new Promise(resolve => setTimeout(resolve, 200))
                } else {
                    hasMore = false
                }
            }

            console.log(`✅ Carga completa finalizada: ${totalLoaded} inscripciones`)

            return {
                success: true,
                data: {
                    inscripciones: allInscripciones,
                    statistics: firstBatch.data.statistics,
                    totalLoaded,
                    isComplete: true
                }
            }

        } catch (error) {
            console.error('❌ Error en carga progresiva completa:', error)
            return {
                success: false,
                error: error.message || 'Error en carga progresiva'
            }
        }
    }



    async getPendingPayments(filters = {}) {
        try {
            console.log('Obteniendo pagos pendientes:', filters)
            const response = await apiService.get('/enrollments/pending', filters)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        pagosPendientes: response.data.pagosPendientes || [],
                        total: response.data.total || 0
                    }
                }
            }

            return {
                success: false,
                error: 'No se pudieron cargar los pagos pendientes'
            }

        } catch (error) {
            console.error('Error obteniendo pagos pendientes:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // APROBAR PAGO (ADMIN) - RUTA EXISTENTE
    // =============================================
    async approvePayment(inscripcionId) {
        try {
            console.log('Aprobando pago:', inscripcionId)
            const response = await apiService.patch(`/enrollments/${inscripcionId}/approve`)

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Pago aprobado exitosamente',
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error aprobando el pago'
            }

        } catch (error) {
            console.error('Error aprobando pago:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // FILTROS Y BÚSQUEDAS
    // =============================================
    async getEnrollmentsByStatus(status) {
        return await this.getAllEnrollments({ estado: status })
    }

    async getActiveEnrollments() {
        return await this.getEnrollmentsByStatus('habilitado')
    }

    async getPendingEnrollments() {
        return await this.getEnrollmentsByStatus('pendiente')
    }

    async searchMyEnrollments(searchTerm) {
        return await this.getMyEnrollments({ search: searchTerm })
    }

    async searchAllEnrollments(searchTerm) {
        return await this.getAllEnrollments({ search: searchTerm })
    }

    // =============================================
    // UTILIDADES Y FORMATEO
    // =============================================
    formatEnrollmentData(inscripcion) {
        return {
            id: inscripcion.id,
            cursoId: inscripcion.curso_id,
            usuarioId: inscripcion.usuario_id,
            titulo: inscripcion.curso_titulo || inscripcion.titulo,
            slug: inscripcion.slug,
            miniatura: inscripcion.miniatura_url,
            precio: inscripcion.precio,
            esGratuito: inscripcion.es_gratuito,
            estadoPago: inscripcion.estado_pago,
            fechaInscripcion: inscripcion.fecha_inscripcion,
            fechaHabilitacion: inscripcion.fecha_habilitacion,
            instructorNombre: inscripcion.instructor_nombre,
            totalClases: parseInt(inscripcion.total_clases) || 0,
            clasesCompletadas: parseInt(inscripcion.clases_completadas) || 0,
            porcentajeProgreso: parseFloat(inscripcion.porcentaje_progreso) || 0,
            // Datos del estudiante (para admin)
            nombreCompleto: inscripcion.nombre_completo,
            email: inscripcion.email,
            nombreUsuario: inscripcion.nombre_usuario,
            telefono: inscripcion.telefono,
            aprobadoPorNombre: inscripcion.aprobado_por_nombre
        }
    }

    calculateProgress(completadas, total) {
        if (!total || total === 0) return 0
        return Math.round((completadas / total) * 100)
    }

    getStatusColor(estado) {
        const colors = {
            'habilitado': 'bg-green-100 text-green-800',
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'rechazado': 'bg-red-100 text-red-800'
        }
        return colors[estado] || 'bg-gray-100 text-gray-800'
    }

    getStatusText(estado) {
        const texts = {
            'habilitado': 'Habilitado',
            'pendiente': 'Pendiente',
            'rechazado': 'Rechazado'
        }
        return texts[estado] || 'Desconocido'
    }

    getProgressColor(percentage) {
        if (percentage >= 80) return 'bg-green-500'
        if (percentage >= 50) return 'bg-blue-500'
        if (percentage >= 25) return 'bg-yellow-500'
        return 'bg-gray-300'
    }

    formatDate(dateString) {
        if (!dateString) return 'No disponible'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(amount)
    }

    // =============================================
    // ESTADÍSTICAS Y RESÚMENES
    // =============================================
    calculateEnrollmentStats(inscripciones) {
        const stats = {
            total: inscripciones.length,
            activos: 0,
            pendientes: 0,
            completados: 0,
            enProgreso: 0,
            progresoPromedio: 0
        }

        let sumaProgreso = 0

        inscripciones.forEach(inscripcion => {
            const progreso = parseFloat(inscripcion.porcentaje_progreso) || 0
            sumaProgreso += progreso

            // Contar por estado
            if (inscripcion.estado_pago === 'habilitado') {
                stats.activos++
            } else if (inscripcion.estado_pago === 'pendiente') {
                stats.pendientes++
            }

            // Contar por progreso
            if (progreso >= 100) {
                stats.completados++
            } else if (progreso > 0) {
                stats.enProgreso++
            }
        })

        stats.progresoPromedio = stats.total > 0 ? Math.round(sumaProgreso / stats.total) : 0

        return stats
    }

    // =============================================
    // GENERAR ENLACES ÚTILES
    // =============================================
    generateWhatsAppLink(curso, usuario) {
        const mensaje = `Hola, soy ${usuario} y quiero acceso al curso "${curso.titulo}". Precio: $${curso.precio}`
        return `https://wa.me/+593985036066?text=${encodeURIComponent(mensaje)}`
    }

    generateCourseUrl(slug) {
        return `/curso/${slug}`
    }

    generateProgressUrl(slug) {
        return `/mi-progreso/${slug}`
    }

    // =============================================
    // MÉTODOS LEGACY (Para compatibilidad)
    // =============================================
    async obtenerMisInscripciones(filtros = {}) {
        return await this.getMyEnrollments(filtros)
    }

    async inscribirseACurso(cursoId) {
        return await this.enrollCourse(cursoId)
    }

    async verificarAccesoCurso(cursoId) {
        return await this.checkCourseAccess(cursoId)
    }
}

// ✅ EXPORT DEFAULT CORRECTO
export default new EnrollmentsService()