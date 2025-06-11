// src/services/userManagement.js - NUEVO SERVICIO
import apiService from './api'

class UserManagementService {

    async getAllUsers(filters = {}) {
        try {
            const queryString = apiService.buildQueryString(filters)
            const response = await apiService.get(`/user-management${queryString}`)

            return {
                success: true,
                data: response.data || response,
                usuarios: response.data?.usuarios || response.usuarios || [],
                pagination: response.data?.pagination || response.pagination || {}
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                usuarios: [],
                pagination: {}
            }
        }
    }

    async changeUserRole(userId, tipoUsuario) {
        try {
            const response = await apiService.patch(`/user-management/${userId}/role`, {
                tipoUsuario
            })

            return {
                success: true,
                data: response.data || response,
                usuario: response.data?.usuario || response.usuario || null,
                message: response.message || 'Rol actualizado exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    async toggleUserStatus(userId) {
        try {
            const response = await apiService.patch(`/user-management/${userId}/toggle`)

            return {
                success: true,
                data: response.data || response,
                usuario: response.data?.usuario || response.usuario || null,
                message: response.message || 'Estado actualizado exitosamente'
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    async getUserStats() {
        try {
            const response = await apiService.get('/user-management/stats')

            return {
                success: true,
                data: response.data || response,
                estadisticas: response.data?.estadisticas || response.estadisticas || {}
            }
        } catch (error) {
            return {
                success: false,
                error: error.message,
                estadisticas: {}
            }
        }
    }
}

export default new UserManagementService()