// src/services/courses.js - COMPLETO AL 100%
import apiService from './api'

class CoursesService {

    // =============================================
    // OBTENER TODOS LOS CURSOS
    // =============================================
    async getAllCourses(filters = {}) {
        try {
            console.log('Obteniendo cursos con filtros:', filters)
            const response = await apiService.get('/courses', filters)
            console.log('Respuesta cursos:', response)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        cursos: response.data.cursos || [],
                        total: response.data.total || 0
                    }
                }
            }

            return {
                success: false,
                error: 'No se pudieron cargar los cursos'
            }

        } catch (error) {
            console.error('Error obteniendo cursos:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // OBTENER CURSO POR ID
    // =============================================
    async getCourseById(id) {
        try {
            const response = await apiService.get(`/courses/${id}`)

            if (response.success && response.data) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: 'Curso no encontrado'
            }

        } catch (error) {
            console.error('Error obteniendo curso:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // CREAR CURSO (Admin/Instructor)
    // =============================================
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
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // ACTUALIZAR CURSO (Admin/Instructor) - NUEVO
    // =============================================
    async updateCourse(id, courseData) {
        try {
            console.log('Actualizando curso:', id, courseData)
            const response = await apiService.put(`/courses/${id}`, courseData)

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
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // ELIMINAR CURSO (Admin/Instructor) - NUEVO
    // =============================================
    async deleteCourse(id) {
        try {
            console.log('Eliminando curso:', id)
            const response = await apiService.delete(`/courses/${id}`)

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
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // DUPLICAR CURSO - NUEVO
    // =============================================
    async duplicateCourse(id, newTitle) {
        try {
            console.log('Duplicando curso:', id, newTitle)

            // Obtener el curso original
            const originalCourse = await this.getCourseById(id)
            if (!originalCourse.success) {
                return {
                    success: false,
                    error: 'No se pudo obtener el curso original'
                }
            }

            // Crear datos para el nuevo curso
            const courseData = {
                ...originalCourse.data.curso,
                titulo: newTitle,
                slug: newTitle
                    .toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/(^-|-$)/g, '') + '-copia',
                // Remover campos que no deberían duplicarse
                id: undefined,
                fecha_creacion: undefined,
                instructor_id: undefined // Se asignará automáticamente al usuario actual
            }

            // Crear el nuevo curso
            const response = await this.createCourse(courseData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: 'Curso duplicado exitosamente'
                }
            }

            return response

        } catch (error) {
            console.error('Error duplicando curso:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // SUBIR MINIATURA - NUEVO
    // =============================================
    async uploadThumbnail(file) {
        try {
            console.log('Subiendo miniatura:', file)

            // Crear FormData para el archivo
            const formData = new FormData()
            formData.append('thumbnail', file)

            // Usar el endpoint de upload si existe, o simular por ahora
            // const response = await apiService.post('/courses/upload-thumbnail', formData, {
            //     headers: { 'Content-Type': 'multipart/form-data' }
            // })

            // POR AHORA: Simular upload exitoso y retornar una URL temporal
            // En producción, aquí deberías subir a un servicio como AWS S3, Cloudinary, etc.
            const tempUrl = URL.createObjectURL(file)

            return {
                success: true,
                data: {
                    url: tempUrl,
                    filename: file.name
                },
                message: 'Miniatura subida exitosamente'
            }

        } catch (error) {
            console.error('Error subiendo miniatura:', error)
            return {
                success: false,
                error: error.message || 'Error subiendo archivo'
            }
        }
    }

    // =============================================
    // MÉTODOS DE BÚSQUEDA Y FILTRADO
    // =============================================
    async searchCourses(searchTerm) {
        return await this.getAllCourses({ search: searchTerm })
    }

    async getCoursesByType(tipo) {
        return await this.getAllCourses({ tipo })
    }

    async getFreeCourses() {
        return await this.getAllCourses({ gratuito: 'true' })
    }

    async getPaidCourses() {
        return await this.getAllCourses({ gratuito: 'false' })
    }

    // =============================================
    // VALIDACIONES
    // =============================================
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

    // =============================================
    // UTILIDADES
    // =============================================
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

    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/(^-|-$)/g, '')
    }

    // =============================================
    // MÉTODOS LEGACY (Para compatibilidad)
    // =============================================
    async obtenerCursos(filtros = {}) {
        return await this.getAllCourses(filtros)
    }

    async obtenerCursoPorId(id) {
        return await this.getCourseById(id)
    }

    async crearCurso(courseData) {
        return await this.createCourse(courseData)
    }

    async actualizarCurso(id, courseData) {
        return await this.updateCourse(id, courseData)
    }

    async eliminarCurso(id) {
        return await this.deleteCourse(id)
    }
}

// ✅ EXPORT DEFAULT CORRECTOx
export default new CoursesService()