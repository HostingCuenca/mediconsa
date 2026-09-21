// src/services/biblioteca.js - Biblioteca: lectura de materiales dentro de la plataforma
import apiService from './api'
import { headersDispositivo } from '../utils/dispositivo'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'

const wrap = async (fn) => {
    try {
        const r = await fn()
        return r.success ? { success: true, data: r.data } : { success: false, error: r.message || 'Error inesperado' }
    } catch (e) {
        return { success: false, error: e.message || 'Error de conexión' }
    }
}

const bibliotecaService = {
    listar: () => wrap(() => apiService.get('/biblioteca')),
    detalle: (id) => wrap(() => apiService.get(`/biblioteca/${id}`)),
    progreso: (id, body) => wrap(() => apiService.post(`/biblioteca/${id}/progreso`, body)),

    // Notas por página
    notas: (id) => wrap(() => apiService.get(`/biblioteca/${id}/notas`)),
    crearNota: (id, body) => wrap(() => apiService.post(`/biblioteca/${id}/notas`, body)),
    actualizarNota: (notaId, body) => wrap(() => apiService.patch(`/biblioteca/notas/${notaId}`, body)),
    eliminarNota: (notaId) => wrap(() => apiService.delete(`/biblioteca/notas/${notaId}`)),

    // Descarga el archivo como ArrayBuffer a través del API (con token). El navegador nunca ve la URL de origen.
    async archivo(id, onProgress) {
        const token = localStorage.getItem('mediconsa_token')
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 120000)
        try {
            const res = await fetch(`${API_BASE_URL}/biblioteca/${id}/archivo`, {
                headers: { Authorization: `Bearer ${token}`, ...headersDispositivo() },
                signal: controller.signal
            })
            if (!res.ok) {
                let msg = `HTTP ${res.status}`
                try { msg = (await res.json()).message || msg } catch (_) { /* respuesta no JSON */ }
                return { success: false, error: msg, status: res.status }
            }
            const total = parseInt(res.headers.get('Content-Length') || '0', 10)
            if (!res.body || !onProgress) {
                return { success: true, data: await res.arrayBuffer() }
            }
            const reader = res.body.getReader()
            const chunks = []
            let recibido = 0
            for (;;) {
                const { done, value } = await reader.read()
                if (done) break
                chunks.push(value)
                recibido += value.length
                onProgress(total ? Math.round((100 * recibido) / total) : null, recibido)
            }
            const buf = new Uint8Array(recibido)
            let offset = 0
            chunks.forEach(c => { buf.set(c, offset); offset += c.length })
            return { success: true, data: buf.buffer }
        } catch (e) {
            return { success: false, error: e.name === 'AbortError' ? 'Tiempo de espera agotado al cargar el archivo' : (e.message || 'Error de conexión') }
        } finally {
            clearTimeout(timeoutId)
        }
    },

    formatMin: (seg) => {
        const m = Math.round((seg || 0) / 60)
        if (m < 60) return `${m} min`
        return `${Math.floor(m / 60)} h ${m % 60} min`
    }
}

export default bibliotecaService