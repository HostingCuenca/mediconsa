// src/services/api.js - Servicio base para comunicación con Node.js Backend
import { headersDispositivo } from '../utils/dispositivo'
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 20000

// =============================================
// CACHÉ DE LECTURAS (stale-while-revalidate)
// Los GET del panel se sirven al instante desde sessionStorage (por usuario) y se
// revalidan en segundo plano; así al cambiar de página no hay spinner ni "micro recargas".
// Cualquier escritura (POST/PUT/PATCH/DELETE), el login y el logout vacían la caché.
// =============================================
const CACHE_PREFIX = 'api_cache:'
const CACHE_TTL_MS = 5 * 60 * 1000          // más viejo que esto no se sirve desde caché
const CACHE_MAX_BYTES = 400 * 1024          // respuestas más grandes no se cachean
// Simulador y Biblioteca ya tienen su propio SWR (useCached); auth, carrito y sesiones deben ir siempre al servidor
const NO_CACHE = [/^\/auth\//, /^\/simulador\//, /^\/seguridad/, /^\/biblioteca/, /^\/ficha/, /^\/health/, /\/docs/, /\/cart/, /\/sesiones\//, /\/en-curso/, /\/archivo$/, /\/questions(\?|$)/]
const memCache = new Map()

const usuarioActualId = () => {
    try { return JSON.parse(localStorage.getItem('mediconsa_user') || 'null')?.id || 'anon' } catch { return 'anon' }
}
const claveCache = (endpoint) => `${CACHE_PREFIX}${usuarioActualId()}|${endpoint}`

const leerCache = (endpoint) => {
    const k = claveCache(endpoint)
    const m = memCache.get(k)
    if (m && Date.now() - m.t < CACHE_TTL_MS) return m.v
    try {
        const raw = sessionStorage.getItem(k)
        if (!raw) return null
        const { t, v } = JSON.parse(raw)
        if (Date.now() - t > CACHE_TTL_MS) { sessionStorage.removeItem(k); return null }
        memCache.set(k, { t, v })
        return v
    } catch { return null }
}

const guardarCache = (endpoint, v) => {
    const k = claveCache(endpoint)
    const entrada = { t: Date.now(), v }
    memCache.set(k, entrada)
    try {
        const raw = JSON.stringify(entrada)
        if (raw.length <= CACHE_MAX_BYTES) sessionStorage.setItem(k, raw)
    } catch { limpiarCacheApi() }
}

export const limpiarCacheApi = () => {
    memCache.clear()
    // También la caché SWR del simulador/biblioteca (sim_cache:), para que otra cuenta en la misma pestaña no vea datos ajenos
    try { Object.keys(sessionStorage).filter(k => k.startsWith(CACHE_PREFIX) || k.startsWith('sim_cache:')).forEach(k => sessionStorage.removeItem(k)) } catch { /* noop */ }
}

const esCacheable = (endpoint) => !NO_CACHE.some(re => re.test(endpoint))

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
            'Content-Type': 'application/json',
            ...headersDispositivo()
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

        // Un 502/504 del proxy o un 413 no traen JSON: no romper con "Unexpected token <"
        let data = {}
        try { data = await response.json() } catch { data = { success: false, message: `Error ${response.status}` } }

        if (!response.ok) {
            // Manejar errores específicos
            if (response.status === 401) {
                // Token inválido, sesión expulsada (otro dispositivo), revocada o caducada
                localStorage.removeItem('mediconsa_token')
                localStorage.removeItem('mediconsa_user')
                limpiarCacheApi()

                if (window.location.pathname !== '/login') {
                    const motivo = data.code && data.code !== 'TOKEN_INVALIDO' ? `?motivo=${encodeURIComponent(data.code)}` : ''
                    window.location.href = '/login' + motivo
                }
            }

            throw new Error(data.message || `HTTP ${response.status}`)
        }

        return data
    }

    // =============================================
    // HELPER: CREAR REQUEST CON TIMEOUT
    // =============================================
    async createRequest(url, options = {}, timeoutMs = this.timeout) {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

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
    // get(endpoint, requireAuth, { fresh: true }) salta la caché y espera al servidor
    async get(endpoint, requireAuth = true, { fresh = false } = {}) {
        const opciones = { method: 'GET', headers: this.getHeaders(requireAuth) }
        if (fresh || !requireAuth || !esCacheable(endpoint)) {
            return await this.createRequest(endpoint, opciones)
        }
        const enCache = leerCache(endpoint)
        if (enCache) {
            // Servir al instante y revalidar en segundo plano para la próxima visita
            this.createRequest(endpoint, opciones).then(d => guardarCache(endpoint, d)).catch(() => {})
            return enCache
        }
        const data = await this.createRequest(endpoint, opciones)
        guardarCache(endpoint, data)
        return data
    }

    // Toda escritura invalida las lecturas cacheadas
    async escribir(endpoint, options, timeoutMs) {
        try {
            return await this.createRequest(endpoint, options, timeoutMs)
        } finally {
            limpiarCacheApi()
        }
    }

    async post(endpoint, data = {}, requireAuth = true, { timeout } = {}) {
        return await this.escribir(endpoint, {
            method: 'POST',
            headers: this.getHeaders(requireAuth),
            body: JSON.stringify(data)
        }, timeout)
    }

    async patch(endpoint, data = {}, requireAuth = true) {
        return await this.escribir(endpoint, {
            method: 'PATCH',
            headers: this.getHeaders(requireAuth),
            body: JSON.stringify(data)
        })
    }

    async put(endpoint, data = {}, requireAuth = true) {
        return await this.escribir(endpoint, {
            method: 'PUT',
            headers: this.getHeaders(requireAuth),
            body: JSON.stringify(data)
        })
    }

    async delete(endpoint, data = null, requireAuth = true) {
        const options = {
            method: 'DELETE',
            headers: this.getHeaders(requireAuth)
        }

        // Si se proporciona data, agregarlo al body
        if (data !== null && data !== undefined) {
            options.body = JSON.stringify(data)
        }

        return await this.escribir(endpoint, options)
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

const apiService = new ApiService()
export default apiService