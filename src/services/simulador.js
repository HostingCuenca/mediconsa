// src/services/simulador.js - Simulador Interactivo (banco + sesiones + progreso)
import apiService from './api'

const qs = (params = {}) => {
    const s = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') s.append(k, v)
    })
    const str = s.toString()
    return str ? `?${str}` : ''
}

// Envuelve la llamada para devolver siempre { success, data | error }
const call = async (fn) => {
    try {
        const response = await fn()
        if (response?.success) return { success: true, data: response.data, message: response.message }
        return { success: false, error: response?.message || 'Error inesperado' }
    } catch (error) {
        return { success: false, error: error.message || 'Error de conexión' }
    }
}

const simuladorService = {
    // ---------- estudiante ----------
    getCarreras: () => call(() => apiService.get('/simulador/carreras')),
    getAreas: (carrera) => call(() => apiService.get(`/simulador/areas${qs({ carrera })}`)),
    getProgreso: (carrera) => call(() => apiService.get(`/simulador/progreso${qs({ carrera })}`)),
    getSimulacrosOrigen: (carrera) => call(() => apiService.get(`/simulador/simulacros-origen${qs({ carrera })}`)),
    getHistorial: (params) => call(() => apiService.get(`/simulador/historial${qs(params)}`)),

    crearSesion: (payload) => call(() => apiService.post('/simulador/sesiones', payload)),
    getSesionEnCurso: () => call(() => apiService.get('/simulador/sesiones/en-curso')),
    getSesion: (id) => call(() => apiService.get(`/simulador/sesiones/${id}`)),
    responder: (id, payload) => call(() => apiService.post(`/simulador/sesiones/${id}/respuestas`, payload)),
    marcar: (id, preguntaId, marcada) => call(() => apiService.post(`/simulador/sesiones/${id}/marcar`, { preguntaId, marcada })),
    finalizar: (id) => call(() => apiService.post(`/simulador/sesiones/${id}/finalizar`)),
    abandonar: (id) => call(() => apiService.post(`/simulador/sesiones/${id}/abandonar`)),

    // ---------- ruta de aprendizaje ----------
    getRuta: (carrera) => call(() => apiService.get(`/simulador/ruta${qs({ carrera })}`)),
    getStats: () => call(() => apiService.get('/simulador/stats')),
    iniciarLeccion: (leccionId, modo = 'practica') => call(() => apiService.post(`/simulador/ruta/lecciones/${leccionId}/iniciar`, { modo })),
    iniciarPruebaUnidad: (unidadId) => call(() => apiService.post(`/simulador/ruta/unidades/${unidadId}/prueba`)),

    // ---------- entrenador ----------
    getMapa: (carrera, etiquetaIds = []) => call(() => apiService.get(`/simulador/entrenador/mapa${qs({ carrera, etiquetas: etiquetaIds.length ? etiquetaIds.join(',') : undefined })}`)),
    getAreaDetalle: (areaId, carrera) => call(() => apiService.get(`/simulador/entrenador/areas/${areaId}${qs({ carrera })}`)),
    iniciarHoy: (carrera, meta, extra = {}) => call(() => apiService.post('/simulador/entrenador/hoy', { carrera, meta, ...extra })),
    iniciarExamenReal: (carrera, extra = {}) => call(() => apiService.post('/simulador/entrenador/examen-real', { carrera, ...extra })),
    saltar: (id, payload) => call(() => apiService.post(`/simulador/sesiones/${id}/saltar`, payload)),
    iniciarDiagnostico: (carrera) => call(() => apiService.post('/simulador/entrenador/diagnostico', { carrera })),
    entrenarArea: (areaId, carrera, extra = {}) => call(() => apiService.post(`/simulador/entrenador/areas/${areaId}/entrenar`, { carrera, numPreguntas: 15, ...extra })),
    actualizarMeta: (meta) => call(() => apiService.patch('/simulador/entrenador/meta', { meta })),
    adminAreaRecursos: (areaId) => call(() => apiService.get(`/simulador/admin/areas/${areaId}/recursos`)),
    adminGuardarRecurso: (areaId, payload) => call(() => apiService.post(`/simulador/admin/areas/${areaId}/recursos`, payload)),

    // ---------- plan de estudio ----------
    getPlan: (carrera) => call(() => apiService.get(`/simulador/entrenador/plan${qs({ carrera })}`)),
    actualizarMetas: (payload) => call(() => apiService.patch('/simulador/entrenador/plan/metas', payload)),
    crearObjetivo: (payload) => call(() => apiService.post('/simulador/entrenador/plan/objetivos', payload)),
    generarPlan: (carrera) => call(() => apiService.post('/simulador/entrenador/plan/generar', { carrera })),
    actualizarObjetivo: (id, payload) => call(() => apiService.patch(`/simulador/entrenador/plan/objetivos/${id}`, payload)),
    eliminarObjetivo: (id) => call(() => apiService.delete(`/simulador/entrenador/plan/objetivos/${id}`)),

    // ---------- admin ----------
    adminResumen: () => call(() => apiService.get('/simulador/admin/resumen')),
    adminPreguntas: (params) => call(() => apiService.get(`/simulador/admin/preguntas${qs(params)}`)),
    adminActualizarPregunta: (id, payload) => call(() => apiService.patch(`/simulador/admin/preguntas/${id}`, payload)),
    adminReasignarArea: (preguntaIds, areaId) => call(() => apiService.post('/simulador/admin/preguntas/reasignar-area', { preguntaIds, areaId })),
    adminAreas: () => call(() => apiService.get('/simulador/admin/areas')),
    adminCrearArea: (payload) => call(() => apiService.post('/simulador/admin/areas', payload)),
    adminActualizarArea: (id, payload) => call(() => apiService.patch(`/simulador/admin/areas/${id}`, payload)),
    adminProgresoEstudiante: (usuarioId, carrera) => call(() => apiService.get(`/simulador/admin/estudiantes/${usuarioId}/progreso${qs({ carrera })}`)),

    // ---------- etiquetas (banco de preguntas) ----------
    etiquetas: (todas = false) => call(() => apiService.get(`/simulador/etiquetas${todas ? '?todas=1' : ''}`)),
    crearGrupoEtiquetas: (payload) => call(() => apiService.post('/simulador/admin/etiquetas/grupos', payload)),
    actualizarGrupoEtiquetas: (id, payload) => call(() => apiService.patch(`/simulador/admin/etiquetas/grupos/${id}`, payload)),
    eliminarGrupoEtiquetas: (id) => call(() => apiService.delete(`/simulador/admin/etiquetas/grupos/${id}`)),
    crearEtiqueta: (payload) => call(() => apiService.post('/simulador/admin/etiquetas', payload)),
    actualizarEtiqueta: (id, payload) => call(() => apiService.patch(`/simulador/admin/etiquetas/${id}`, payload)),
    eliminarEtiqueta: (id) => call(() => apiService.delete(`/simulador/admin/etiquetas/${id}`)),
    etiquetarPreguntas: (preguntaIds, agregar = [], quitar = []) => call(() => apiService.post('/simulador/admin/preguntas/etiquetar', { preguntaIds, agregar, quitar })),
    bancoDeSimulacro: (simulacroId) => call(() => apiService.get(`/simulador/admin/simulacros/${simulacroId}/banco`)),
    sincronizarSimulacro: (simulacroId) => call(() => apiService.post(`/simulador/admin/simulacros/${simulacroId}/sincronizar`, {})),
    sincronizarBanco: () => call(() => apiService.post('/simulador/admin/banco/sincronizar', {})),
    simulacrosConEtiquetas: () => call(() => apiService.get('/simulador/admin/simulacros/etiquetas')),
    etiquetasDeSimulacro: (simulacroId, etiquetaIds) => call(() => apiService.put(`/simulador/admin/simulacros/${simulacroId}/etiquetas`, { etiquetaIds })),

    // ---------- helpers de presentación ----------
    ORIGENES: {
        adaptativo: { label: 'Adaptativo', desc: 'Prioriza lo que no has visto y tus áreas débiles' },
        errores: { label: 'Mis errores', desc: 'Vuelve a responder solo lo que fallaste' },
        area: { label: 'Por área', desc: 'Elige una o varias áreas para reforzar' },
        aleatorio: { label: 'Aleatorio', desc: 'Preguntas al azar de todo el banco' },
        simulacro: { label: 'Simulacro completo', desc: 'Replica un simulacro del curso tal cual' },
        leccion: { label: 'Lección', desc: 'Lección de tu ruta de aprendizaje' },
        prueba_unidad: { label: 'Prueba de unidad', desc: 'Examen corto para dominar la unidad' },
        hoy: { label: 'Sesión de hoy', desc: 'Repasos vencidos + tu área foco, elegidos por el entrenador' },
        diagnostico: { label: 'Diagnóstico', desc: 'Examen corto que cubre todas las especialidades' },
        entrenar_area: { label: 'Entrenamiento de área', desc: 'Práctica concentrada en una especialidad' },
        examen_real: { label: 'Examen completo', desc: 'Simulación con la estructura y el tiempo del CACES' }
    },
    NIVELES: {
        sin_explorar: { label: 'Sin explorar', cls: 'bg-gray-100 text-gray-600 border-gray-200', bar: 'bg-gray-300', hex: '#d1d5db' },
        debil: { label: 'Débil', cls: 'bg-red-50 text-medico-red border-red-100', bar: 'bg-medico-red', hex: '#dc2626' },
        progreso: { label: 'En progreso', cls: 'bg-orange-50 text-medico-orange border-orange-100', bar: 'bg-medico-orange', hex: '#ea580c' },
        dominada: { label: 'Dominada', cls: 'bg-emerald-50 text-medico-green border-emerald-100', bar: 'bg-medico-green', hex: '#059669' }
    },
    CONFIANZAS: {
        seguro: { label: 'Lo sé', desc: 'Respuesta segura' },
        dudo: { label: 'Tengo dudas', desc: 'Entre dos opciones' },
        adivino: { label: 'No lo sé', desc: 'Es una corazonada' }
    },
    RETOS: {
        libre: { label: 'Sin límite de tiempo' },
        tiempo_total: { label: 'Tiempo total' },
        contrarreloj: { label: 'Contrarreloj' },
        muerte_subita: { label: 'Muerte súbita' },
        examen_real: { label: 'Examen CACES completo' }
    },
    MODOS: {
        practica: { label: 'Práctica', desc: 'Ves la respuesta y la explicación al instante' },
        examen: { label: 'Examen', desc: 'Sin pistas hasta finalizar. Puedes cambiar respuestas' }
    },
    ESTADOS_AREA: {
        debil: { label: 'Débil', cls: 'bg-red-50 text-medico-red border-red-100' },
        medio: { label: 'En progreso', cls: 'bg-orange-50 text-medico-orange border-orange-100' },
        fuerte: { label: 'Dominada', cls: 'bg-emerald-50 text-medico-green border-emerald-100' },
        sin_datos: { label: 'Sin datos', cls: 'bg-gray-50 text-gray-500 border-gray-100' }
    },
    formatSeg(seg) {
        if (seg === null || seg === undefined) return '—'
        const m = Math.floor(seg / 60)
        const s = seg % 60
        if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}min`
        return `${m}:${String(s).padStart(2, '0')}`
    },
    formatFecha(iso) {
        if (!iso) return ''
        return new Date(iso).toLocaleString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    }
}

export default simuladorService
