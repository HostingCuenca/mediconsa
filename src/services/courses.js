// src/services/courses.js - Servicio de cursos refactorizado para Node.js Backend
import apiService from './api'

class CoursesService {

    // =============================================
    // OBTENER TODOS LOS CURSOS (PÚBLICO)
    // =============================================
    async getCourses(filters = {}) {
        try {
            const queryString = apiService.buildQueryString(filters)
            const response = await apiService.get(`/courses${queryString}`, false)

            return {
                success: true,
                data: response.data || response,
                cursos: response.data?.cursos || response.cursos || [],
                total: response.data?.total || response.total || 0
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                cursos: []
            }
        }
    }

    // =============================================
    // OBTENER CURSO POR ID (PÚBLICO)
    // =============================================
    async getCourseById(courseId) {
        try {
            const response = await apiService.get(`/courses/${courseId}`, false)

            return {
                success: true,
                data: response.data || response,
                curso: response.data?.curso || response.curso || null
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                curso: null
            }
        }
    }

    // =============================================
    // CREAR CURSO (ADMIN/INSTRUCTOR)
    // =============================================
    async createCourse(courseData) {
        try {
            const response = await apiService.post('/courses', courseData)

            return {
                success: true,
                data: response.data || response,
                curso: response.data?.curso || response.curso || null,
                message: response.message || 'Curso creado exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // BUSCAR CURSOS (con filtros avanzados)
    // =============================================
    async searchCourses({ search, tipo, gratuito, page = 1, limit = 12 }) {
        const filters = {}

        if (search) filters.search = search
        if (tipo) filters.tipo = tipo
        if (gratuito !== undefined) filters.gratuito = gratuito
        if (page) filters.page = page
        if (limit) filters.limit = limit

        return await this.getCourses(filters)
    }

    // =============================================
    // OBTENER CURSOS POR TIPO DE EXAMEN
    // =============================================
    async getCoursesByExamType(examType) {
        return await this.getCourses({ tipo: examType })
    }

    // =============================================
    // OBTENER CURSOS GRATUITOS
    // =============================================
    async getFreeCourses() {
        return await this.getCourses({ gratuito: true })
    }

    // =============================================
    // OBTENER CURSOS DE PAGO
    // =============================================
    async getPaidCourses() {
        return await this.getCourses({ gratuito: false })
    }

    // =============================================
    // FUNCIONES LEGACY (para compatibilidad)
    // =============================================
    async obtenerCursos(filtros = {}) {
        return await this.getCourses(filtros)
    }

    async obtenerCursoPorId(id) {
        return await this.getCourseById(id)
    }

    async crearCurso(datos) {
        return await this.createCourse(datos)
    }

    async buscarCursos(termino) {
        return await this.searchCourses({ search: termino })
    }
}

export default new CoursesService()