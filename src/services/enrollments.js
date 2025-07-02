
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
    async getAllEnrollments(filters = {}) {
        try {
            console.log('Obteniendo todas las inscripciones (admin):', filters)
            const response = await apiService.get('/enrollments/admin/all', filters)
            console.log('Respuesta todas las inscripciones:', response)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        inscripciones: response.data.inscripciones || [],
                        pagination: response.data.pagination || {}
                    }
                }
            }

            return {
                success: false,
                error: 'No se pudieron cargar todas las inscripciones'
            }

        } catch (error) {
            console.error('Error obteniendo todas las inscripciones:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // OBTENER PAGOS PENDIENTES (ADMIN)
    // =============================================
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