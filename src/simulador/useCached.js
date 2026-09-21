// src/simulador/useCached.js - "stale-while-revalidate" para las páginas del simulador.
// Devuelve al instante lo último visto (sessionStorage) y refresca en segundo plano,
// así el cambio de pestaña no muestra un loader cada vez.
import { useCallback, useEffect, useRef, useState } from 'react'

const PREFIX = 'sim_cache:'
const TTL_MS = 10 * 60 * 1000

const leer = (key) => {
    try {
        const raw = sessionStorage.getItem(PREFIX + key)
        if (!raw) return null
        const { t, v } = JSON.parse(raw)
        if (Date.now() - t > TTL_MS) return null
        return v
    } catch { return null }
}

const guardar = (key, v) => {
    try { sessionStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v })) } catch { /* sin espacio o modo privado */ }
}

// Modifica en sitio lo cacheado (p. ej. el progreso de un material) sin obligar a recargar la página que lo muestra
export const actualizarCache = (key, updater) => {
    const actual = leer(key)
    if (!actual) return
    try { guardar(key, updater(actual)) } catch { /* noop */ }
}

// Marca como "vieja" la caché (no la borra): la página siguiente la muestra al instante y la refresca en
// segundo plano, en vez de quedarse en un spinner esperando al servidor.
export const invalidarCache = (prefijo = '') => {
    try {
        Object.keys(sessionStorage).filter(k => k.startsWith(PREFIX + prefijo)).forEach(k => {
            const { v } = JSON.parse(sessionStorage.getItem(k))
            sessionStorage.setItem(k, JSON.stringify({ t: Date.now() - TTL_MS + 60 * 1000, v, vieja: true }))
        })
    } catch { /* noop */ }
}

/**
 * useCached('ruta:medicina', () => simuladorService.getRuta('medicina'), [carrera])
 * → { data, loading (solo sin caché), refreshing, error, refresh }
 * fetcher debe devolver { success, data, error } (formato de simuladorService).
 */
export const useCached = (key, fetcher, deps = []) => {
    const [data, setData] = useState(() => (key ? leer(key) : null))
    const [loading, setLoading] = useState(!data)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState('')
    const fetcherRef = useRef(fetcher)
    fetcherRef.current = fetcher

    const refresh = useCallback(async () => {
        if (!key) return
        const cached = leer(key)
        if (cached) { setData(cached); setLoading(false); setRefreshing(true) }
        else { setData(null); setLoading(true) }
        const r = await fetcherRef.current()
        if (r?.success) { setData(r.data); guardar(key, r.data); setError('') }
        else setError(r?.error || 'Error cargando datos')
        setLoading(false)
        setRefreshing(false)
    }, [key])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { refresh() }, [key, ...deps])

    return { data, loading, refreshing, error, refresh, setData }
}
