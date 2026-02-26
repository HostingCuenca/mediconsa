// src/services/connectionTester.js - Verificador de conexión
import apiService from './api'
import authService from './auth'

class ConnectionTester {
    constructor() {
        this.results = {
            api: null,
            auth: null,
            authenticated: null
        }
    }

    // =============================================
    // TEST BÁSICO DE API
    // =============================================
    async testApiConnection() {
        console.log('🔍 Probando conexión básica...')

        try {
            const result = await apiService.testConnection()

            this.results.api = result

            if (result.success) {
                console.log('✅ API conectada:', result.data.message)
                return true
            } else {
                console.log('❌ API no responde:', result.error)
                return false
            }
        } catch (error) {
            console.log('❌ Error de conexión:', error.message)
            this.results.api = { success: false, error: error.message }
            return false
        }
    }

    // =============================================
    // TEST DE AUTENTICACIÓN
    // =============================================
    async testAuthentication() {
        console.log('🔍 Probando autenticación...')

        try {
            // Probar login con credenciales de prueba
            const loginResult = await authService.login('admin@med.com', 'admin123')

            this.results.auth = loginResult

            if (loginResult.success) {
                console.log('✅ Login exitoso:', loginResult.data.user.email)

                // Probar obtener perfil
                const profileResult = await authService.getProfile()

                if (profileResult.success) {
                    console.log('✅ Perfil obtenido:', profileResult.data.user.nombreCompleto)
                    this.results.authenticated = profileResult
                    return true
                } else {
                    console.log('❌ Error obteniendo perfil:', profileResult.error)
                    return false
                }
            } else {
                console.log('❌ Error en login:', loginResult.error)
                return false
            }
        } catch (error) {
            console.log('❌ Error de autenticación:', error.message)
            this.results.auth = { success: false, error: error.message }
            return false
        }
    }

    // =============================================
    // TEST COMPLETO
    // =============================================
    async runFullTest() {
        console.log('🚀 Iniciando test completo de conexión...')

        const results = {
            timestamp: new Date().toISOString(),
            api: false,
            auth: false,
            overall: false
        }

        // Test 1: Conexión básica
        results.api = await this.testApiConnection()

        if (!results.api) {
            console.log('❌ Test fallido: No se puede conectar a la API')
            return results
        }

        // Test 2: Autenticación
        results.auth = await this.testAuthentication()

        if (!results.auth) {
            console.log('❌ Test fallido: Problemas de autenticación')
            return results
        }

        results.overall = true
        console.log('🎉 ¡Todos los tests pasaron! Backend conectado correctamente')

        return results
    }

    // =============================================
    // GENERAR REPORTE
    // =============================================
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            status: this.results.api?.success && this.results.auth?.success ? 'CONECTADO' : 'ERROR',
            details: this.results,
            recommendations: this.getRecommendations()
        }
    }

    getRecommendations() {
        const recommendations = []

        if (!this.results.api?.success) {
            recommendations.push('Verificar que el backend esté corriendo en http://localhost:5000')
            recommendations.push('Revisar configuración de CORS en el servidor')
        }

        if (!this.results.auth?.success) {
            recommendations.push('Verificar credenciales de prueba en la base de datos')
            recommendations.push('Revisar configuración de JWT_SECRET')
        }

        return recommendations
    }
}

const connectionTester = new ConnectionTester()
export default connectionTester