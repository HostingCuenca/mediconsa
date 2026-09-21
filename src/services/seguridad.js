// src/services/seguridad.js — sesiones y dispositivos (alumno) + panel admin de seguridad de cuentas
import apiService from './api'

const call = async (fn) => {
    try {
        const r = await fn()
        return r?.success ? { success: true, data: r.data } : { success: false, error: r?.message || 'Error' }
    } catch (e) {
        return { success: false, error: e.message || 'Error de conexión' }
    }
}

const seguridadService = {
    // ---- alumno ----
    misSesiones: () => call(() => apiService.get('/auth/sesiones')),
    cerrarSesion: (id) => call(() => apiService.delete(`/auth/sesiones/${id}`)),
    quitarDispositivo: (id) => call(() => apiService.delete(`/auth/dispositivos/${id}`)),

    // ---- admin ----
    resumen: () => call(() => apiService.get('/seguridad/resumen')),
    online: () => call(() => apiService.get('/seguridad/online')),
    usuarios: (params = {}) => {
        const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')).toString()
        return call(() => apiService.get(`/seguridad/usuarios${q ? `?${q}` : ''}`))
    },
    usuario: (id) => call(() => apiService.get(`/seguridad/usuarios/${id}`)),
    cerrarSesionesUsuario: (id) => call(() => apiService.post(`/seguridad/usuarios/${id}/cerrar-sesiones`, {})),
    adminCerrarSesion: (id) => call(() => apiService.delete(`/seguridad/sesiones/${id}`)),
    adminQuitarDispositivo: (id) => call(() => apiService.delete(`/seguridad/dispositivos/${id}`)),
    limites: (id, payload) => call(() => apiService.put(`/seguridad/usuarios/${id}/limites`, payload)),

    // ---- helpers de presentación ----
    hace: (fecha) => {
        if (!fecha) return '—'
        const ms = Date.now() - new Date(fecha).getTime()
        const m = Math.round(ms / 60000)
        if (m < 1) return 'ahora'
        if (m < 60) return `hace ${m} min`
        const h = Math.round(m / 60)
        if (h < 24) return `hace ${h} h`
        const d = Math.round(h / 24)
        if (d < 30) return `hace ${d} d`
        return new Date(fecha).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })
    },
    lugar: (x) => [x?.ciudad, x?.pais].filter(Boolean).join(', ') || (x?.ip ? x.ip : 'Ubicación desconocida')
}

export default seguridadService
