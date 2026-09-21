// src/panel/RealizarSimulacro.jsx — Realizar un simulacro (legacy), pensado para celular primero.
// Misma lógica de modos, tiempos, navegación y envío que antes; cambia la interfaz:
//  - cabecera compacta con tiempo y progreso; pregunta a pantalla completa; barra inferior fija con
//    Anterior / Siguiente / Finalizar; el mapa de preguntas es una hoja desplegable en móvil y una
//    columna fija en escritorio. Sin emojis ni alert().
//  - Corregido: al agotarse el tiempo, el envío automático usaba un cierre viejo del estado y mandaba
//    las respuestas vacías; ahora los temporizadores leen siempre el estado actual (refs).
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    ChevronLeft, ChevronRight, X, Clock, Timer, CheckCircle2, AlertTriangle, ListChecks, Send, Flag, Info, ShieldAlert, ArrowRight, Loader2
} from 'lucide-react'
import { useAuth } from '../utils/AuthContext'
import simulacrosService from '../services/simulacros'
import QuestionRenderer from './QuestionRenderer'
import { limpiarTitulo } from '../biblioteca/Biblioteca'
import logoBlanco from '../assets/logoblanco-recortado.png'
import { Card, Button } from '../simulador/ui'
import '../simulador/entrenador.css'

// Mismo lenguaje visual que el entrenador (SimuladorSesion): cabecera azul con logo y chips, tarjeta, pie fijo
const chip = 'inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/12 border border-white/20 text-white whitespace-nowrap'

const MODOS = {
    estudio: { label: 'Modo estudio', cls: 'bg-emerald-100 text-emerald-800' },
    practica: { label: 'Modo práctica', cls: 'bg-emerald-100 text-emerald-800' },
    revision: { label: 'Modo revisión', cls: 'bg-blue-100 text-blue-800' },
    realista: { label: 'Modo realista', cls: 'bg-amber-100 text-amber-800' },
    evaluacion: { label: 'Modo evaluación', cls: 'bg-amber-100 text-amber-800' },
    examen_real: { label: 'Examen oficial', cls: 'bg-red-100 text-red-800' },
    examen: { label: 'Examen oficial', cls: 'bg-red-100 text-red-800' }
}
const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

const RealizarSimulacro = () => {
    const { simulacroId } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()

    const [loading, setLoading] = useState(true)
    const [simulacro, setSimulacro] = useState(null)
    const [preguntas, setPreguntas] = useState([])
    const [idx, setIdx] = useState(0)
    const [respuestas, setRespuestas] = useState({})
    const [tiempoRestante, setTiempoRestante] = useState(null)
    const [tiempoPregunta, setTiempoPregunta] = useState(null)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState('')
    const [confirmar, setConfirmar] = useState(null)      // { title, message, critical }
    const [bienvenida, setBienvenida] = useState(true)
    const [mapa, setMapa] = useState(false)                // hoja "mapa de preguntas" en móvil
    const inicio = useRef(Date.now())
    const timers = useRef({ global: null, pregunta: null })
    // Estado "vivo" para los temporizadores (evita cierres viejos)
    const live = useRef({ respuestas: {}, idx: 0, preguntas: [], simulacro: null, enviando: false })
    live.current.respuestas = respuestas; live.current.idx = idx; live.current.preguntas = preguntas; live.current.simulacro = simulacro; live.current.enviando = enviando

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return }
        let vivo = true
        ;(async () => {
            try {
                const r = await simulacrosService.getSimulacroQuestions(simulacroId)
                if (!vivo) return
                if (r.success) { setSimulacro(r.data.simulacro); setPreguntas(r.data.preguntas || []) }
                else setError(r.error || 'No se pudo cargar el simulacro')
            } catch (e) { if (vivo) setError('Error de conexión') }
            finally { if (vivo) setLoading(false) }
        })()
        return () => { vivo = false }
    }, [isAuthenticated, simulacroId, navigate])

    const modo = simulacro?.modo_estudio || simulacro?.modo_evaluacion || 'practica'
    const esExamen = modo === 'examen_real' || modo === 'examen'
    const secuencial = simulacro?.tipo_navegacion === 'secuencial'
    const modoInfo = MODOS[modo] || { label: modo, cls: 'bg-gray-100 text-gray-700' }

    // ---------- respuestas ----------
    const respondida = useCallback((pregunta, rs = respuestas) => {
        const r = rs[pregunta?.id]
        if (!r || !pregunta) return false
        switch (pregunta.tipo_pregunta) {
            case 'multiple': case 'true_false': return !!r.opcionSeleccionadaId
            case 'multiple_respuesta': return (r.opcionesSeleccionadas || []).length > 0
            case 'short_answer': case 'numerical': case 'essay': return !!r.respuestaTexto?.trim()
            case 'fill_blanks': case 'matching': case 'ordering': return !!r.respuestaCompleja && Object.keys(r.respuestaCompleja).length > 0
            default: return false
        }
    }, [respuestas])
    const respondidas = useMemo(() => preguntas.filter(p => respondida(p)).length, [preguntas, respondida])
    const pct = preguntas.length ? Math.round((100 * respondidas) / preguntas.length) : 0

    const formatear = (rs, pregs) => pregs.map(p => {
        const r = rs[p.id]
        if (!r) return null
        switch (p.tipo_pregunta) {
            case 'multiple': case 'true_false': return { preguntaId: p.id, opcionSeleccionadaId: r.opcionSeleccionadaId, respuestaTexto: null, respuestaCompleja: null }
            case 'multiple_respuesta': return { preguntaId: p.id, opcionSeleccionadaId: null, respuestaTexto: null, respuestaCompleja: { tipo: 'multiple_respuesta', opcionesSeleccionadas: r.opcionesSeleccionadas || [] } }
            case 'short_answer': case 'numerical': case 'essay': return { preguntaId: p.id, opcionSeleccionadaId: null, respuestaTexto: r.respuestaTexto, respuestaCompleja: null }
            case 'fill_blanks': case 'matching': case 'ordering': return { preguntaId: p.id, opcionSeleccionadaId: null, respuestaTexto: null, respuestaCompleja: r.respuestaCompleja }
            default: return { preguntaId: p.id, opcionSeleccionadaId: r.opcionSeleccionadaId || null, respuestaTexto: r.respuestaTexto || null, respuestaCompleja: r.respuestaCompleja || null }
        }
    }).filter(Boolean)

    // ---------- envío ----------
    const limpiarTimers = () => { clearInterval(timers.current.global); clearInterval(timers.current.pregunta); timers.current = { global: null, pregunta: null } }
    const enviar = useCallback(async (auto = false, motivo = '') => {
        if (live.current.enviando) return
        setEnviando(true); live.current.enviando = true; setError('')
        limpiarTimers()
        const minutos = Math.max(1, Math.ceil((Date.now() - inicio.current) / 60000))
        try {
            const r = await simulacrosService.submitSimulacro(simulacroId, { respuestas: formatear(live.current.respuestas, live.current.preguntas), tiempoEmpleadoMinutos: minutos }, { timeout: 300000 })
            if (r.success) {
                navigate('/simulacros/resultado', { state: { completed: true, resultado: r.data, simulacro: live.current.simulacro, message: auto ? motivo : 'Simulacro completado', isAutoSubmit: auto } })
            } else {
                setError(r.error || r.message || 'No se pudo enviar el simulacro')
                setEnviando(false); live.current.enviando = false
            }
        } catch (e) {
            setError(e.name === 'AbortError' || /timeout/i.test(e.message || '') ? 'El envío tardó demasiado. Puede haberse guardado: revisa "Mis intentos" antes de repetirlo.' : (e.message || 'Error de conexión. Intenta de nuevo.'))
            setEnviando(false); live.current.enviando = false
        } finally { setConfirmar(null) }
    }, [simulacroId, navigate])

    // ---------- temporizadores (leen live.current, no el estado del render) ----------
    useEffect(() => {
        if (!simulacro || bienvenida) return
        limpiarTimers()
        if (simulacro.tipo_tiempo === 'global' && simulacro.tiempo_limite_minutos) {
            setTiempoRestante(simulacro.tiempo_limite_minutos * 60)
            timers.current.global = setInterval(() => {
                setTiempoRestante(prev => {
                    if (prev === null) return prev
                    if (prev <= 1) { clearInterval(timers.current.global); setTimeout(() => enviar(true, 'Tiempo agotado: el simulacro se envió automáticamente.'), 0); return 0 }
                    return prev - 1
                })
            }, 1000)
        }
        if (simulacro.tipo_tiempo === 'por_pregunta' && simulacro.tiempo_por_pregunta_segundos) {
            setTiempoPregunta(simulacro.tiempo_por_pregunta_segundos)
            timers.current.pregunta = setInterval(() => {
                setTiempoPregunta(prev => {
                    if (prev === null) return prev
                    if (prev <= 1) {
                        const { idx: i, preguntas: ps, simulacro: s } = live.current
                        const m = s?.modo_estudio || s?.modo_evaluacion
                        if (m === 'examen_real' || m === 'examen') {
                            if (i < ps.length - 1) setIdx(i + 1)
                            else { clearInterval(timers.current.pregunta); setTimeout(() => enviar(true, 'Tiempo por pregunta agotado: el examen se envió automáticamente.'), 0) }
                        }
                        return s?.tiempo_por_pregunta_segundos || 0
                    }
                    return prev - 1
                })
            }, 1000)
        }
        return limpiarTimers
    }, [simulacro, bienvenida, enviar])

    const resetTiempoPregunta = () => { if (simulacro?.tipo_tiempo === 'por_pregunta') setTiempoPregunta(simulacro.tiempo_por_pregunta_segundos) }
    const responder = (preguntaId, r) => { setRespuestas(prev => ({ ...prev, [preguntaId]: r })); resetTiempoPregunta() }

    // ---------- navegación ----------
    const actual = preguntas[idx]
    const puedeAtras = !secuencial && idx > 0
    const puedeAdelante = idx < preguntas.length - 1 && (!secuencial || respondida(actual))
    const ir = (i) => { if (i < 0 || i >= preguntas.length) return; if (secuencial && i > idx) return; setIdx(i); resetTiempoPregunta(); setMapa(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    const siguiente = () => { if (puedeAdelante) { setIdx(idx + 1); resetTiempoPregunta(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }
    const anterior = () => { if (puedeAtras) { setIdx(idx - 1); resetTiempoPregunta(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }

    const finalizar = () => {
        const faltan = preguntas.length - respondidas
        if (faltan > 0) {
            setConfirmar({
                title: esExamen ? 'Examen incompleto' : 'Finalizar simulacro',
                message: `Tienes ${faltan} pregunta${faltan > 1 ? 's' : ''} sin responder.${esExamen ? ' Este es un examen oficial: las preguntas sin responder se calificarán como incorrectas.' : ''} ¿Quieres finalizar de todas formas?`,
                critical: esExamen
            })
        } else if (esExamen) {
            setConfirmar({ title: 'Enviar examen', message: 'Una vez enviado no podrás hacer cambios. ¿Enviar ahora?', critical: true })
        } else enviar(false)
    }

    const tiempoLabel = simulacro?.tipo_tiempo === 'sin_limite' ? 'Sin límite'
        : simulacro?.tipo_tiempo === 'por_pregunta' && simulacro?.tiempo_por_pregunta_segundos ? `${simulacro.tiempo_por_pregunta_segundos} s por pregunta`
            : simulacro?.tiempo_limite_minutos ? (simulacro.tiempo_limite_minutos >= 60 ? `${Math.floor(simulacro.tiempo_limite_minutos / 60)} h ${simulacro.tiempo_limite_minutos % 60} min` : `${simulacro.tiempo_limite_minutos} min`) : 'Sin límite'

    // ---------- renders ----------
    if (loading) return <Pantalla><Loader2 className="w-8 h-8 animate-spin text-medico-blue" /><p className="mt-3 text-sm text-medico-gray">Cargando simulacro…</p></Pantalla>
    if (!simulacro || preguntas.length === 0) return (
        <Pantalla>
            <AlertTriangle className="w-10 h-10 text-medico-orange" />
            <h2 className="mt-3 text-lg font-semibold text-gray-900">Simulacro no disponible</h2>
            <p className="mt-1 text-sm text-medico-gray max-w-sm">{error || 'Este simulacro no tiene preguntas configuradas o no tienes acceso.'}</p>
            <button onClick={() => navigate('/simulacros')} className="mt-5 px-5 py-2.5 rounded-full bg-medico-blue text-white text-sm font-medium">Volver a simulacros</button>
        </Pantalla>
    )

    const titulo = limpiarTitulo(simulacro.titulo)
    const Mapa = () => (
        <>
            <div className="flex flex-wrap gap-2">
                {preguntas.map((p, i) => {
                    const ok = respondida(p), cur = i === idx, puede = !secuencial || i <= idx
                    return (
                        <button key={p.id} onClick={() => puede && ir(i)} disabled={!puede}
                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-colors ${cur ? 'ring-2 ring-offset-2 ring-medico-blue' : ''} ${ok ? 'bg-medico-blue text-white' : puede ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}>{i + 1}</button>
                    )
                })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-medico-gray">
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-medico-blue" /> Respondida</span>
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200" /> Pendiente</span>
                <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-medico-blue" /> Actual</span>
            </div>
        </>
    )

    return (
        <div className="min-h-screen bg-medico-light flex flex-col">
            {/* ===== Cabecera de marca (igual que el entrenador) ===== */}
            <header className="sticky top-0 z-30 bg-gradient-to-r from-medico-blue via-blue-800 to-blue-900 text-white shadow-md" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
                <div className="max-w-[1480px] mx-auto px-3 sm:px-4 md:px-8 h-14 sm:h-16 flex items-center gap-2 sm:gap-3 md:gap-4">
                    <img src={logoBlanco} alt="Mediconsa" className="h-5 sm:h-8 w-auto flex-shrink-0" />
                    <div className="hidden sm:block w-px h-8 bg-white/20" />
                    <div className="flex-1 min-w-[4.5rem]">
                        <p className="text-xs sm:text-sm font-semibold truncate leading-tight">{titulo}</p>
                        <p className="hidden sm:block text-[11px] text-blue-100/90 truncate">{modoInfo.label}{secuencial ? ' · secuencial' : ''} · {respondidas}/{preguntas.length} respondidas</p>
                    </div>
                    {tiempoPregunta !== null && (
                        <span className={`${chip} font-mono ${tiempoPregunta <= 10 ? '!bg-red-500/50 !border-red-300/60 ent-latido' : '!bg-orange-400/30 !border-orange-300/40'}`} title="Tiempo para esta pregunta"><Timer className="w-4 h-4" /> {tiempoPregunta}s</span>
                    )}
                    {tiempoRestante !== null && (
                        <span className={`${chip} font-mono ${tiempoRestante < 300 ? '!bg-red-500/40 !border-red-300/50' : ''}`} title="Tiempo restante"><Clock className="w-4 h-4" /> {fmt(tiempoRestante)}</span>
                    )}
                    <button onClick={() => setMapa(m => !m)} className={`${chip} hover:bg-white/20`} title="Ver todas las preguntas"><ListChecks className="w-4 h-4" /> {idx + 1}/{preguntas.length}</button>
                    <button onClick={() => setConfirmar({ title: 'Salir del simulacro', message: 'Perderás las respuestas de este intento. ¿Salir de todos modos?', salir: true })} className="p-1.5 sm:p-2 -mr-1 sm:-mr-2 rounded-full hover:bg-white/15 text-white/80" title="Salir del simulacro" aria-label="Salir"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                </div>
                <div className="h-1.5 bg-white/15"><div className={`h-1.5 bg-gradient-to-r from-emerald-300 to-emerald-400 transition-all duration-700 ${pct >= 100 ? 'ent-brillo' : ''}`} style={{ width: `${pct}%` }} /></div>
                {mapa && (
                    <div className="bg-white text-gray-900 border-b border-gray-100 max-h-[55vh] overflow-y-auto">
                        <div className="max-w-[1480px] mx-auto px-3 sm:px-4 md:px-8 py-4">
                            <div className="flex items-center justify-between mb-3"><p className="text-sm font-semibold text-gray-900">Mapa de preguntas · {respondidas}/{preguntas.length}</p><span className="text-xs text-medico-gray">{pct}%</span></div>
                            <Mapa />
                            <div className="flex justify-end mt-3">
                                <Button size="sm" variant={respondidas === preguntas.length ? 'success' : 'secondary'} onClick={() => { setMapa(false); finalizar() }} disabled={enviando || respondidas === 0}>{respondidas === preguntas.length ? 'Finalizar simulacro' : `Finalizar (${preguntas.length - respondidas} sin responder)`}</Button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* ===== Contenido ===== */}
            <main className="flex-1 max-w-[1480px] w-full mx-auto px-3 sm:px-4 md:px-8 py-4 md:py-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))]">
                {error && (
                    <div className="mb-4 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-800 flex items-start gap-2"><AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span className="flex-1">{error}</span><button onClick={() => setError('')} className="p-1"><X className="w-4 h-4" /></button></div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
                    <Card key={actual.id} className="p-4 sm:p-5 md:p-7 ent-entrada min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-medico-gray"><span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-medico-blue font-semibold text-xs mr-2">{idx + 1}</span>de {preguntas.length}</p>
                            {respondida(actual) ? <span className="inline-flex items-center gap-1 text-xs text-medico-green font-medium"><CheckCircle2 className="w-4 h-4" /> Respondida</span> : <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${modoInfo.cls}`}>{modoInfo.label}</span>}
                        </div>
                        {tiempoPregunta !== null && simulacro.tiempo_por_pregunta_segundos && (
                            <div className="mb-4 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-1.5 rounded-full transition-all duration-1000 ease-linear ${tiempoPregunta <= 10 ? 'bg-medico-red' : 'bg-medico-orange'}`} style={{ width: `${(100 * tiempoPregunta) / simulacro.tiempo_por_pregunta_segundos}%` }} /></div>
                        )}
                        <div>
                            <QuestionRenderer pregunta={actual} respuestaActual={respuestas[actual.id]} onRespuestaChange={(r) => responder(actual.id, r)} modoSimulacro={modo} mostrarExplicacion={false} />
                        </div>
                        {(secuencial && !respondida(actual)) || esExamen || simulacro.tipo_tiempo === 'por_pregunta' ? (
                            <div className="mt-5 space-y-2">
                                {secuencial && !respondida(actual) && <Aviso tone="warn" icon={ArrowRight}>Navegación secuencial: responde esta pregunta para pasar a la siguiente.</Aviso>}
                                {esExamen && <Aviso tone="error" icon={ShieldAlert}>Examen oficial: las respuestas son definitivas una vez enviadas.</Aviso>}
                                {simulacro.tipo_tiempo === 'por_pregunta' && <Aviso tone="info" icon={Timer}>Tienes {simulacro.tiempo_por_pregunta_segundos} segundos por pregunta.</Aviso>}
                            </div>
                        ) : null}
                    </Card>

                    {/* Panel lateral (escritorio): progreso y mapa */}
                    <aside className="hidden lg:block sticky top-24">
                        <Card className="overflow-hidden">
                            <div className="px-5 py-4 bg-gray-50 flex items-center gap-3">
                                <span className="w-11 h-11 rounded-2xl bg-medico-blue text-white flex items-center justify-center flex-shrink-0"><ListChecks className="w-6 h-6" /></span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">Tu simulacro</p>
                                    <p className="font-sans text-lg font-semibold leading-tight text-gray-900">{respondidas === preguntas.length ? 'Todo respondido' : `${preguntas.length - respondidas} por responder`}</p>
                                </div>
                                <div className="text-right"><p className="text-[11px] text-medico-gray">Avance</p><p className="text-sm font-semibold text-gray-900 tabular-nums">{pct}%</p></div>
                            </div>
                            <div className="p-5 max-h-[calc(100vh-20rem)] overflow-y-auto">
                                <Button className="mb-4 w-full" variant={respondidas === preguntas.length ? 'success' : 'primary'} onClick={finalizar} loading={enviando} disabled={respondidas === 0}>
                                    <Send className="w-4 h-4" /> {respondidas === preguntas.length ? 'Finalizar simulacro' : `Finalizar (${preguntas.length - respondidas} sin responder)`}
                                </Button>
                                <Mapa />
                            </div>
                        </Card>
                    </aside>
                </div>
            </main>

            {/* ===== Pie fijo: navegación ===== */}
            <footer className={`fixed bottom-0 inset-x-0 z-30 border-t-2 transition-colors duration-500 ${respondida(actual) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
                <div className="max-w-[1480px] mx-auto px-3 sm:px-4 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-4" style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}>
                    <Button variant="ghost" onClick={anterior} disabled={!puedeAtras}><ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Anterior</span></Button>
                    <p className="text-xs text-medico-gray hidden sm:block">{respondida(actual) ? 'Guardada · puedes cambiarla hasta finalizar' : secuencial ? 'Responde para continuar' : 'Elige una opción'}</p>
                    {idx === preguntas.length - 1 || (respondidas > 0 && respondidas === preguntas.length)
                        ? <Button size="lg" variant={respondidas === preguntas.length ? 'success' : 'primary'} onClick={finalizar} loading={enviando} disabled={respondidas === 0} className="flex-1 sm:flex-none sm:min-w-[200px]"><Send className="w-5 h-5" /> Finalizar</Button>
                        : <Button size="lg" onClick={siguiente} disabled={!puedeAdelante} className="flex-1 sm:flex-none sm:min-w-[200px]">Siguiente <ChevronRight className="w-5 h-5" /></Button>}
                </div>
            </footer>

            {/* ===== Bienvenida ===== */}
            {bienvenida && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
                        <div className="text-center mb-5">
                            <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 ${esExamen ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-medico-blue'}`}>{esExamen ? <Flag className="w-7 h-7" /> : <ListChecks className="w-7 h-7" />}</span>
                            <h2 className="text-lg font-semibold text-gray-900 leading-snug">{titulo}</h2>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${modoInfo.cls}`}>{modoInfo.label}</span>
                        </div>
                        <dl className="grid grid-cols-3 gap-2 text-center mb-5">
                            <div className="rounded-xl bg-gray-50 p-3"><dt className="text-[11px] text-medico-gray">Preguntas</dt><dd className="text-base font-semibold text-gray-900">{preguntas.length}</dd></div>
                            <div className="rounded-xl bg-gray-50 p-3"><dt className="text-[11px] text-medico-gray">Tiempo</dt><dd className="text-sm font-semibold text-gray-900 leading-tight">{tiempoLabel}</dd></div>
                            <div className="rounded-xl bg-gray-50 p-3"><dt className="text-[11px] text-medico-gray">Navegación</dt><dd className="text-sm font-semibold text-gray-900">{secuencial ? 'Secuencial' : 'Libre'}</dd></div>
                        </dl>
                        {esExamen && <Aviso tone="error" icon={ShieldAlert} className="mb-3"><strong>Examen oficial.</strong> No se puede pausar ni repetir; las respuestas son definitivas. Asegúrate de tener buena conexión.</Aviso>}
                        {secuencial && <Aviso tone="warn" icon={ArrowRight} className="mb-3">Debes responder cada pregunta antes de pasar a la siguiente y no podrás volver atrás.</Aviso>}
                        {simulacro.intentos_permitidos > 0 && <p className="text-xs text-medico-gray text-center mb-4">Intentos permitidos: {simulacro.intentos_permitidos}</p>}
                        <div className="flex gap-3">
                            <button onClick={() => navigate('/simulacros')} className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-700">Cancelar</button>
                            <button onClick={() => { inicio.current = Date.now(); setBienvenida(false) }} className={`flex-1 py-3 rounded-full text-sm font-semibold text-white ${esExamen ? 'bg-red-600' : 'bg-medico-blue'}`}>{esExamen ? 'Iniciar examen' : 'Comenzar'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== Confirmación ===== */}
            {confirmar && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/50 p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
                        <div className="flex items-start gap-3 mb-4">
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${confirmar.critical ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}><AlertTriangle className="w-5 h-5" /></span>
                            <div><h2 className="text-base font-semibold text-gray-900">{confirmar.title}</h2><p className="text-sm text-gray-700 mt-1">{confirmar.message}</p></div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmar(null)} className="flex-1 py-3 rounded-full border border-gray-200 text-sm font-medium text-gray-700">Seguir respondiendo</button>
                            {confirmar.salir
                                ? <button onClick={() => navigate('/simulacros')} className="flex-1 py-3 rounded-full text-sm font-semibold text-white bg-red-600">Salir</button>
                                : <button onClick={() => enviar(false)} disabled={enviando} className={`flex-1 py-3 rounded-full text-sm font-semibold text-white disabled:opacity-50 ${confirmar.critical ? 'bg-red-600' : 'bg-medico-blue'}`}>{enviando ? 'Enviando…' : 'Enviar'}</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const Pantalla = ({ children }) => <div className="min-h-screen bg-medico-light flex flex-col items-center justify-center text-center p-6">{children}</div>
const Aviso = ({ tone = 'info', icon: Icon = Info, children, className = '' }) => {
    const t = { info: 'bg-blue-50 text-blue-900', warn: 'bg-amber-50 text-amber-900', error: 'bg-red-50 text-red-900' }[tone]
    return <div className={`rounded-xl px-3 py-2.5 text-sm flex items-start gap-2 ${t} ${className}`}><Icon className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{children}</span></div>
}

export default RealizarSimulacro
