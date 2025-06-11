// src/services/api.js - Configuración base de la API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/med-api'

class ApiService {
    constructor() {
        this.baseURL = API_BASE_URL
    }

    // Obtener headers con token
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json',
        }

        if (includeAuth) {
            const token = localStorage.getItem('mediconsa_token')
            if (token) {
                headers.Authorization = `Bearer ${token}`
            }
        }

        return headers
    }

    // Manejo de respuestas
    async handleResponse(response) {
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición')
        }

        return data
    }

    // GET request
    async get(endpoint, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'GET',
                headers: this.getHeaders(includeAuth),
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error(`API GET Error (${endpoint}):`, error)
            throw error
        }
    }

    // POST request
    async post(endpoint, data = {}, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(includeAuth),
                body: JSON.stringify(data),
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error(`API POST Error (${endpoint}):`, error)
            throw error
        }
    }

    // PATCH request
    async patch(endpoint, data = {}, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PATCH',
                headers: this.getHeaders(includeAuth),
                body: JSON.stringify(data),
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error(`API PATCH Error (${endpoint}):`, error)
            throw error
        }
    }

    // DELETE request
    async delete(endpoint, includeAuth = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(includeAuth),
            })

            return await this.handleResponse(response)
        } catch (error) {
            console.error(`API DELETE Error (${endpoint}):`, error)
            throw error
        }
    }

    // Test de conectividad
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL.replace('/med-api', '')}/`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()
            return { success: response.ok, data, status: response.status }
        } catch (error) {
            return { success: false, error: error.message, status: 0 }
        }
    }
}

export default new ApiService()