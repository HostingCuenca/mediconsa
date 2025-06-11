// src/services/courses.js - Servicio de cursos
import apiService from './api'

class CoursesService {
    // =============================================
    // OBTENER CURSOS
    // =============================================
    async getCourses(filters = {}) {
        try {
            const params = new URLSearchParams()

            Object.keys(filters).forEach(key => {
                if (filters[key] !== undefined && filters[key] !== '') {
                    params.append(key, filters[key])
                }
            })

            const queryString = params.toString()
            const endpoint = queryString ? `/courses?${queryString}` : '/courses'

            return await apiService.get(endpoint, false)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // OBTENER CURSO POR ID
    // =============================================
    async getCourseById(courseId) {
        try {
            return await apiService.get(`/courses/${courseId}`, false)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // CREAR CURSO (Admin/Instructor)
    // =============================================
    async createCourse(courseData) {
        try {
            return await apiService.post('/courses', courseData)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // GESTIÓN DE CONTENIDO (Admin/Instructor)
    // =============================================
    async createModule(moduleData) {
        try {
            return await apiService.post('/course-management/modules', moduleData)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async createClass(classData) {
        try {
            return await apiService.post('/course-management/classes', classData)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async createSimulacro(simulacroData) {
        try {
            return await apiService.post('/course-management/simulacros', simulacroData)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async createQuestion(questionData) {
        try {
            return await apiService.post('/course-management/questions', questionData)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async getCourseContent(courseId) {
        try {
            return await apiService.get(`/course-management/course/${courseId}`)
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

export default new CoursesService()