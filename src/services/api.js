// src/services/api.js - Servicio base para comunicación con Node.js Backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL
        this.timeout = API_TIMEOUT
    }

    // =============================================
    // HELPER: OBTENER HEADERS
    // =============================================
    getHeaders(requireAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        }

        if (requireAuth) {
            const token = localStorage.getItem('mediconsa_token')
            if (token) {
                headers.Authorization = `Bearer ${token}`
            }
        }

        return headers
    }

    // =============================================
    // HELPER: MANEJAR RESPUESTA
    // =============================================
    async handleResponse(response) {
        // Log para desarrollo
        if (process.env.REACT_APP_SHOW_API_LOGS === 'true') {
            // console.log(`API ${response.status}:`, response.url)
        }

        const data = await response.json()

        if (!response.ok) {
            // Manejar errores específicos
            if (response.status === 401) {
                // Token inválido o expirado
                localStorage.removeItem('mediconsa_token')
                localStorage.removeItem('mediconsa_user')

                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'
                }
            }

            throw new Error(data.message || `HTTP ${response.status}`)
        }

        return data
    }

    // =============================================
    // HELPER: CREAR REQUEST CON TIMEOUT
    // =============================================
    async createRequest(url, options = {}) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.timeout)

        try {
            const response = await fetch(`${this.baseURL}${url}`, {
                ...options,
                signal: controller.signal
            })

            clearTimeout(timeoutId)
            return await this.handleResponse(response)
        } catch (error) {
            clearTimeout(timeoutId)

            if (error.name === 'AbortError') {
                throw new Error('Tiempo de espera agotado. Verifica tu conexión.')
            }

            throw error
        }
    }

    // =============================================
    // MÉTODOS HTTP
    // =============================================
    async get(endpoint, requireAuth = true) {
        return await this.createRequest(endpoint, {
            method: 'GET',
            headers: this.getHeaders(requireAuth)
        })
    }

    async post(endpoint, data = {}, requireAuth = true) {
        return await this.createRequest(endpoint, {
            method: 'POST',
            headers: this.getHeaders(requireAuth),
            body: JSON.stringify(data)
        })
    }

    async patch(endpoint, data = {}, requireAuth = true) {
        return await this.createRequest(endpoint, {
            method: 'PATCH',
            headers: this.getHeaders(requireAuth),
            body: JSON.stringify(data)
        })
    }

    async put(endpoint, data = {}, requireAuth = true) {
        return await this.createRequest(endpoint, {
            method: 'PUT',
            headers: this.getHeaders(requireAuth),
            body: JSON.stringify(data)
        })
    }

    async delete(endpoint, requireAuth = true) {
        return await this.createRequest(endpoint, {
            method: 'DELETE',
            headers: this.getHeaders(requireAuth)
        })
    }

    // =============================================
    // HELPER: CONSTRUIR QUERY STRING
    // =============================================
    buildQueryString(params) {
        const searchParams = new URLSearchParams()

        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                searchParams.append(key, params[key])
            }
        })

        const queryString = searchParams.toString()
        return queryString ? `?${queryString}` : ''
    }

    // =============================================
    // HELPER: TEST DE CONEXIÓN
    // =============================================
    async testConnection() {
        try {
            const response = await fetch(this.baseURL.replace('/med-api', ''), {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            })

            const data = await response.json()

            return {
                success: true,
                message: 'Conexión exitosa',
                serverInfo: data
            }
        } catch (error) {
            return {
                success: false,
                message: 'Error de conexión con el servidor',
                error: error.message
            }
        }
    }
}

export default new ApiService()