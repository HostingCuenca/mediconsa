// src/services/cronogramas.js - Cronogramas de curso (guía día a día)
import apiService from './api'

const call = async (fn) => {
    try {
        const r = await fn()
        return r?.success ? { success: true, data: r.data } : { success: false, error: r?.message || 'Error inesperado' }
    } catch (e) {
        return { success: false, error: e.message || 'Error de conexión' }
    }
}

// /cronogramas/mis se pide desde varias tarjetas a la vez: se comparte la misma promesa en vuelo
let misEnVuelo = null
let misExpira = 0

const cronogramasService = {
    // alumno
    getMis: () => {
        if (misEnVuelo && Date.now() < misExpira) return misEnVuelo
        misExpira = Date.now() + 30000
        misEnVuelo = call(() => apiService.get('/cronogramas/mis')).finally(() => setTimeout(() => { misEnVuelo = null }, 30000))
        return misEnVuelo
    },
    invalidarMis: () => { misEnVuelo = null },
    getPorCurso: (cursoId) => call(() => apiService.get(`/cronogramas/curso/${cursoId}`)),
    marcarItem: (itemId, hecho) => call(() => apiService.post(`/cronogramas/items/${itemId}/marcar`, { hecho })),

    // admin
    adminListar: () => call(() => apiService.get('/cronogramas/admin')),
    adminObtener: (id) => call(() => apiService.get(`/cronogramas/admin/${id}`)),
    adminCrear: (payload) => call(() => apiService.post('/cronogramas/admin', payload)),
    adminActualizar: (id, payload) => call(() => apiService.patch(`/cronogramas/admin/${id}`, payload)),
    adminEliminar: (id) => call(() => apiService.delete(`/cronogramas/admin/${id}`)),
    adminCrearItem: (id, payload) => call(() => apiService.post(`/cronogramas/admin/${id}/items`, payload)),
    adminActualizarItem: (itemId, payload) => call(() => apiService.patch(`/cronogramas/admin/items/${itemId}`, payload)),
    adminEliminarItem: (itemId) => call(() => apiService.delete(`/cronogramas/admin/items/${itemId}`)),
    adminAutoVincular: (id, payload = {}) => call(() => apiService.post(`/cronogramas/admin/${id}/auto-vincular`, payload)),
    adminDesplazar: (id, dias) => call(() => apiService.post(`/cronogramas/admin/${id}/desplazar`, { dias })),
    adminImportar: (id, payload) => call(() => apiService.post(`/cronogramas/admin/${id}/importar`, payload)),
    adminDuplicar: (id, payload) => call(() => apiService.post(`/cronogramas/admin/${id}/duplicar`, payload)),

    // presentación
    MODALIDADES: {
        asincronica: { label: 'Asincrónica', cls: 'bg-blue-50 text-medico-blue border-blue-100', punto: 'bg-medico-blue' },
        en_vivo: { label: 'En vivo', cls: 'bg-red-50 text-medico-red border-red-100', punto: 'bg-medico-red' }
    },
    TIPOS: {
        clase: { label: 'Clase' }, repaso: { label: 'Repaso' }, evaluacion: { label: 'Evaluación' }, evento: { label: 'Evento' }, descanso: { label: 'Descanso' }
    },
    hoyLocal: () => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    // 'AAAA-MM-DD' → Date local (sin desfase de zona horaria)
    aDate: (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) },
    formatFecha: (iso, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => iso ? cronogramasService.aDate(iso).toLocaleDateString('es-EC', opts) : '',
    formatFechaLarga: (iso) => cronogramasService.formatFecha(iso, { weekday: 'long', day: 'numeric', month: 'long' }),
    sumarDias: (iso, n) => { const d = cronogramasService.aDate(iso); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` },
    diasEntre: (a, b) => Math.round((cronogramasService.aDate(b) - cronogramasService.aDate(a)) / 86400000)
}

export default cronogramasService
