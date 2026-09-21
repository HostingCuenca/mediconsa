// utils/dispositivo.js — identidad del dispositivo (navegador) para el control de cuentas compartidas.
// Un UUID persistente en localStorage + datos básicos del navegador. Va en cada request como X-Device-Id / X-Device-Info.
const KEY = 'mediconsa_dispositivo'

const generarId = () => {
    try { if (window.crypto?.randomUUID) return window.crypto.randomUUID() } catch { /* noop */ }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
}

let idMemoria = null
export const getDispositivoId = () => {
    if (idMemoria) return idMemoria
    try {
        let id = localStorage.getItem(KEY)
        if (!id || !/^[A-Za-z0-9_-]{8,80}$/.test(id)) { id = generarId(); localStorage.setItem(KEY, id) }
        idMemoria = id
    } catch { idMemoria = idMemoria || generarId() }
    return idMemoria
}

// Huella del EQUIPO (no del navegador): plataforma, pantalla, núcleos, memoria, GPU, zona horaria.
// Chrome, Firefox y Edge en la misma computadora dan la misma huella → el servidor los agrupa como un solo dispositivo.
const huellaHardware = () => {
    const partes = [
        navigator.platform || navigator.userAgentData?.platform || '',
        `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.devicePixelRatio || 1}`,
        navigator.hardwareConcurrency || 0,
        navigator.deviceMemory || 0,
        Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    ]
    try {
        const c = document.createElement('canvas')
        const gl = c.getContext('webgl') || c.getContext('experimental-webgl')
        const dbg = gl && gl.getExtension('WEBGL_debug_renderer_info')
        if (gl && dbg) partes.push(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
    } catch { /* sin WebGL */ }
    // hash corto (djb2) para no mandar texto largo en cada request
    let h = 5381
    const str = partes.join('|')
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0
    return 'hw' + (h >>> 0).toString(36)
}

let infoMemoria = null
export const getDispositivoInfo = () => {
    if (infoMemoria) return infoMemoria
    try {
        infoMemoria = JSON.stringify({
            platform: navigator.platform || navigator.userAgentData?.platform || '',
            screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
            lang: navigator.language || '',
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
            hw: huellaHardware()
        })
    } catch { infoMemoria = '{}' }
    return infoMemoria
}

export const headersDispositivo = () => ({ 'X-Device-Id': getDispositivoId(), 'X-Device-Info': getDispositivoInfo() })

// Mensajes para el usuario cuando el servidor cierra su sesión
export const MOTIVOS_SESION = {
    SESION_EXPULSADA: 'Tu cuenta se abrió en otro dispositivo y esta sesión se cerró. Recuerda que tu cuenta es personal: solo puede usarla una persona.',
    DISPOSITIVO_REEMPLAZADO: 'Tu cuenta se abrió en un dispositivo nuevo y este quedó fuera. Si eres tú, vuelve a iniciar sesión.',
    SESION_REVOCADA: 'Tu sesión fue cerrada. Inicia sesión de nuevo.',
    SESION_EXPIRADA: 'Tu sesión caducó. Inicia sesión de nuevo.',
    LIMITE_DISPOSITIVOS: 'Esta cuenta ya registró demasiados dispositivos nuevos este mes.'
}
