// src/services/auth.js - Servicio de autenticación
import apiService from './api'

class AuthService {
    constructor() {
        this.tokenKey = 'mediconsa_token'
        this.userKey = 'mediconsa_user'
    }

    // =============================================
    // REGISTRO
    // =============================================
    async register(userData) {
        try {
            const response = await apiService.post('/auth/register', userData, false)

            if (response.success && response.data.token) {
                this.setAuthData(response.data.token, response.data.user)
            }

            return response
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // LOGIN
    // =============================================
    async login(email, password) {
        try {
            const response = await apiService.post('/auth/login', { email, password }, false)

            if (response.success && response.data.token) {
                this.setAuthData(response.data.token, response.data.user)
            }

            return response
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // LOGOUT
    // =============================================
    logout() {
        localStorage.removeItem(this.tokenKey)
        localStorage.removeItem(this.userKey)
        window.location.href = '/login'
    }

    // =============================================
    // OBTENER PERFIL
    // =============================================
    async getProfile() {
        try {
            const response = await apiService.get('/auth/profile')

            if (response.success) {
                this.setUserData(response.data.user)
            }

            return response
        } catch (error) {
            // Si el token es inválido, hacer logout
            if (error.message.includes('inválido') || error.message.includes('expirado')) {
                this.logout()
            }

            return {
                success: false,
                error: error.message
            }
        }
    }

    // =============================================
    // VERIFICAR TOKEN
    // =============================================
    async verifyToken() {
        const token = this.getToken()
        if (!token) return { success: false, error: 'No token found' }

        try {
            const response = await apiService.get('/auth/verify')
            return response
        } catch (error) {
            this.logout()
            return { success: false, error: error.message }
        }
    }

    // =============================================
    // GESTIÓN DE DATOS LOCALES
    // =============================================
    setAuthData(token, user) {
        localStorage.setItem(this.tokenKey, token)
        localStorage.setItem(this.userKey, JSON.stringify(user))
    }

    setUserData(user) {
        localStorage.setItem(this.userKey, JSON.stringify(user))
    }

    getToken() {
        return localStorage.getItem(this.tokenKey)
    }

    getUser() {
        const userData = localStorage.getItem(this.userKey)
        return userData ? JSON.parse(userData) : null
    }

    isAuthenticated() {
        return !!this.getToken()
    }

    isAdmin() {
        const user = this.getUser()
        return user?.tipoUsuario === 'admin'
    }

    isInstructor() {
        const user = this.getUser()
        return user?.tipoUsuario === 'instructor'
    }

    // =============================================
    // FUNCIONES LEGACY (para compatibilidad)
    // =============================================
    async registrarUsuario(email, password, nombreCompleto, nombreUsuario) {
        return await this.register({ email, password, nombreCompleto, nombreUsuario })
    }

    async loginUsuario(email, password) {
        return await this.login(email, password)
    }

    async logoutUsuario() {
        this.logout()
        return { success: true }
    }
}

export default new AuthService()