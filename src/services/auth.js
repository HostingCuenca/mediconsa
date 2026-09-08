// src/services/auth.js - Servicio de autenticación CORREGIDO
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'

class AuthService {
    constructor() {
        this.tokenKey = 'mediconsa_token'
        this.userKey = 'mediconsa_user'
    }

    // =============================================
    // HELPER: HEADERS CON AUTENTICACIÓN
    // =============================================
    getAuthHeaders() {
        const token = this.getToken()
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    }

    // =============================================
    // HELPER: NORMALIZAR USUARIO (CORREGIDO)
    // =============================================
    normalizeUser(user) {
        if (!user) return null

        // console.log('Normalizando usuario:', user) // Debug

        // El backend ya devuelve en camelCase, solo asegurar que existe
        return {
            id: user.id,
            email: user.email,
            nombreCompleto: user.nombreCompleto || user.nombre_completo,
            nombreUsuario: user.nombreUsuario || user.nombre_usuario,
            tipoUsuario: user.tipoUsuario || user.tipo_usuario,
            telefono: user.telefono || '',
            avatarUrl: user.avatarUrl || user.avatar_url || null,
            activo: user.activo !== undefined ? user.activo : true,
            fechaRegistro: user.fechaRegistro || user.fecha_registro,
            // Verificación de correo: si el backend no envía el campo, se asume verificado (usuarios antiguos)
            emailVerificado: user.emailVerificado !== undefined
                ? user.emailVerificado
                : (user.email_verificado !== undefined ? user.email_verificado : true),
            proveedorAuth: user.proveedorAuth || user.proveedor_auth || 'local',
            googleVinculado: user.googleVinculado !== undefined
                ? !!user.googleVinculado
                : !!(user.google_vinculado || user.google_id)
        }
    }

    // =============================================
    // REGISTRO
    // =============================================
    async register(userData) {
        try {
            // console.log('Enviando datos de registro:', userData)

            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            })

            const data = await response.json()
            // console.log('Respuesta del backend (registro):', data)

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Error en el registro'
                }
            }

            if (data.success && data.data) {
                const normalizedUser = this.normalizeUser(data.data.user)

                // Si el backend exige verificar el correo, no hay token todavía (no se inicia sesión)
                if (data.data.token) {
                    this.setAuthData(data.data.token, normalizedUser)
                }

                return {
                    success: true,
                    message: data.message,
                    data: {
                        user: normalizedUser,
                        token: data.data.token || null,
                        requiresEmailVerification: !!data.data.requiresEmailVerification,
                        verificationSent: data.data.verificationSent !== false
                    }
                }
            }

            return {
                success: false,
                error: 'Respuesta inesperada del servidor'
            }

        } catch (error) {
            console.error('Error en registro:', error)
            return {
                success: false,
                error: 'Error de conexión. Verifica tu internet.'
            }
        }
    }

    // =============================================
    // LOGIN (CORREGIDO)
    // =============================================
    async login(email, password) {
        try {
            // console.log('Enviando login:', email)

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()
            // console.log('Respuesta del backend (login):', data)

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Credenciales inválidas',
                    code: data.code || null   // p.ej. EMAIL_NOT_VERIFIED
                }
            }

            if (data.success && data.data) {
                const normalizedUser = this.normalizeUser(data.data.user)
                // console.log('Usuario normalizado (login):', normalizedUser)

                this.setAuthData(data.data.token, normalizedUser)

                return {
                    success: true,
                    data: {
                        user: normalizedUser,
                        token: data.data.token
                    }
                }
            }

            return {
                success: false,
                error: 'Respuesta inesperada del servidor'
            }

        } catch (error) {
            console.error('Error en login:', error)
            return {
                success: false,
                error: 'Error de conexión. Verifica tu internet.'
            }
        }
    }

    // =============================================
    // LOGIN / REGISTRO CON GOOGLE
    // credential = ID token que entrega el botón de Google
    // =============================================
    async loginWithGoogle(credential) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential })
            })

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'No se pudo iniciar sesión con Google'
                }
            }

            if (data.success && data.data?.token) {
                const normalizedUser = this.normalizeUser(data.data.user)
                this.setAuthData(data.data.token, normalizedUser)

                return {
                    success: true,
                    message: data.message,
                    data: {
                        user: normalizedUser,
                        token: data.data.token,
                        isNewUser: !!data.data.isNewUser
                    }
                }
            }

            return { success: false, error: 'Respuesta inesperada del servidor' }

        } catch (error) {
            console.error('Error en login con Google:', error)
            return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
    }

    // =============================================
    // VINCULAR / DESVINCULAR GOOGLE (requiere sesión)
    // =============================================
    async linkGoogle(credential) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google/link`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ credential })
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || 'No se pudo vincular la cuenta de Google' }
            }

            if (data.data?.user) {
                this.setUserData(this.normalizeUser(data.data.user))
            }

            return { success: true, message: data.message, data: data.data }

        } catch (error) {
            console.error('Error vinculando Google:', error)
            return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
    }

    async unlinkGoogle() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/google/link`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || 'No se pudo desvincular la cuenta de Google' }
            }

            if (data.data?.user) {
                this.setUserData(this.normalizeUser(data.data.user))
            }

            return { success: true, message: data.message }

        } catch (error) {
            console.error('Error desvinculando Google:', error)
            return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
    }

    // =============================================
    // VERIFICACIÓN DE CORREO
    // =============================================
    async verifyEmail(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || 'El enlace es inválido o ha expirado' }
            }

            // Si hay sesión activa, reflejar la verificación en el usuario guardado
            const storedUser = this.getUser()
            if (storedUser) {
                this.setUserData({ ...storedUser, emailVerificado: true })
            }

            return {
                success: true,
                alreadyVerified: !!data.alreadyVerified,
                message: data.message || 'Correo confirmado'
            }

        } catch (error) {
            console.error('Error verificando correo:', error)
            return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
    }

    async resendVerification(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (!response.ok) {
                return { success: false, error: data.message || 'No se pudo reenviar el correo' }
            }

            return {
                success: true,
                alreadyVerified: !!data.alreadyVerified,
                message: data.message || 'Correo reenviado'
            }

        } catch (error) {
            console.error('Error reenviando verificación:', error)
            return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
    }

    // =============================================
    // LOGOUT
    // =============================================
    logout() {
        console.log('Cerrando sesión y limpiando localStorage')
        localStorage.removeItem(this.tokenKey)
        localStorage.removeItem(this.userKey)

        // Opcional: Notificar al backend (si implementas blacklist de tokens)
        // this.notifyLogout()

        window.location.href = '/login'
    }

    // =============================================
    // OBTENER PERFIL (CORREGIDO)
    // =============================================
    async getProfile() {
        try {
            // console.log('Obteniendo perfil del backend...')

            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            })

            const data = await response.json()
            // console.log('Respuesta perfil backend:', data)

            if (!response.ok) {
                // Si es error de autenticación, hacer logout
                if (response.status === 401 || response.status === 403) {
                    // console.log('Token inválido, haciendo logout')
                    this.logout()
                }

                return {
                    success: false,
                    error: data.message || 'Error obteniendo perfil'
                }
            }

            if (data.success && data.data) {
                const normalizedUser = this.normalizeUser(data.data.user)
                // console.log('Usuario normalizado (perfil):', normalizedUser)

                this.setUserData(normalizedUser)

                return {
                    success: true,
                    data: {
                        user: normalizedUser
                    }
                }
            }

            return {
                success: false,
                error: 'Respuesta inesperada del servidor'
            }

        } catch (error) {
            console.error('Error obteniendo perfil:', error)
            return {
                success: false,
                error: 'Error de conexión'
            }
        }
    }

    // =============================================
    // VERIFICAR TOKEN (usando getProfile)
    // =============================================
    async verifyToken() {
        const token = this.getToken()
        if (!token) {
            return { success: false, error: 'No token found' }
        }

        // Usar getProfile para verificar token
        const result = await this.getProfile()

        if (!result.success) {
            this.logout()
        }

        return result
    }

    // =============================================
    // GESTIÓN DE DATOS LOCALES
    // =============================================
    setAuthData(token, user) {
        // console.log('Guardando en localStorage:', { token: !!token, user })
        localStorage.setItem(this.tokenKey, token)
        localStorage.setItem(this.userKey, JSON.stringify(user))
    }

    setUserData(user) {
        // console.log('Actualizando usuario en localStorage:', user)
        localStorage.setItem(this.userKey, JSON.stringify(user))
    }

    getToken() {
        return localStorage.getItem(this.tokenKey)
    }

    getUser() {
        try {
            const userData = localStorage.getItem(this.userKey)
            const parsed = userData ? JSON.parse(userData) : null
            // console.log('Usuario recuperado de localStorage:', parsed)
            return parsed
        } catch (error) {
            console.error('Error parsing user data:', error)
            return null
        }
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

    isEstudiante() {
        const user = this.getUser()
        return user?.tipoUsuario === 'estudiante'
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

    // =============================================
    // HELPERS PARA AUTHCONTEXT
    // =============================================
    async obtenerSesion() {
        const token = this.getToken()
        const user = this.getUser()

        if (!token || !user) {
            return { success: false, session: null }
        }

        return {
            success: true,
            session: {
                user: user,
                access_token: token
            }
        }
    }


    // src/services/auth.js - AGREGAR estas funciones:

    async updateProfile(profileData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(profileData)
            })

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Error actualizando perfil'
                }
            }

            if (data.success && data.data) {
                const normalizedUser = this.normalizeUser(data.data.user)
                this.setUserData(normalizedUser)

                return {
                    success: true,
                    data: { user: normalizedUser }
                }
            }

            return { success: false, error: 'Respuesta inesperada' }

        } catch (error) {
            console.error('Error actualizando perfil:', error)
            return { success: false, error: 'Error de conexión' }
        }
    }

    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ currentPassword, newPassword })
            })

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Error cambiando contraseña'
                }
            }

            return {
                success: true,
                message: data.message || 'Contraseña cambiada exitosamente'
            }

        } catch (error) {
            console.error('Error cambiando contraseña:', error)
            return { success: false, error: 'Error de conexión' }
        }
    }

    // =============================================
    // RECUPERACIÓN DE CONTRASEÑA (sin sesión)
    // =============================================
    async forgotPassword(email) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'No se pudo procesar la solicitud'
                }
            }

            return {
                success: true,
                message: data.message || 'Si el correo está registrado, recibirás un enlace en unos minutos.'
            }

        } catch (error) {
            console.error('Error solicitando recuperación:', error)
            return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
    }

    async validateResetToken(token) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password/${encodeURIComponent(token)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'El enlace es inválido o ha expirado'
                }
            }

            return { success: true, data: data.data }

        } catch (error) {
            console.error('Error validando enlace:', error)
            return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword })
            })

            const data = await response.json()

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'No se pudo restablecer la contraseña'
                }
            }

            return {
                success: true,
                message: data.message || 'Contraseña restablecida exitosamente'
            }

        } catch (error) {
            console.error('Error restableciendo contraseña:', error)
            return { success: false, error: 'Error de conexión. Verifica tu internet.' }
        }
    }

    async obtenerPerfil(userId) {
        const result = await this.getProfile()

        if (result.success) {
            return {
                success: true,
                perfil: result.data.user
            }
        }

        return result
    }

    onAuthStateChange(callback) {
        // Simular el listener de Supabase
        // En este caso, manejamos cambios manualmente
        return {
            data: {
                subscription: {
                    unsubscribe: () => {
                        // No-op para compatibilidad
                    }
                }
            }
        }
    }
}

const authService = new AuthService()
export default authService

// Exports para compatibilidad
export const {
    obtenerSesion,
    obtenerPerfil,
    onAuthStateChange
} = new AuthService()