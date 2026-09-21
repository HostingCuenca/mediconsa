// src/simulador/SimuladorSesion.jsx - Realizar una sesión del Entrenador (práctica o examen)
// Práctica: elegir → confianza (Seguro / Dudo / Adivino) → feedback en el panel lateral (explicación, error
//           frecuente, próximo repaso, refuerzo con clases y manuales) → Continuar
// Examen:   elegir guarda al instante, sin pistas; confianza opcional; se puede cambiar hasta finalizar.
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    X, Clock, CheckCircle2, XCircle, Lightbulb, Flag, ChevronLeft, ChevronRight, Grid3x3, Zap, Flame, AlertTriangle, Users,
    Video, BookOpen, CalendarClock, Gauge, ExternalLink, Stethoscope, Sparkles, Target, Timer, Skull, ChevronDown
} from 'lucide-react'
import logoBlanco from '../assets/logoblanco-recortado.png'
import { useAuth } from '../utils/AuthContext'
import simuladorService from '../services/simulador'
import { Button, Loading, Alert, Modal, Pill, Card } from './ui'
import { invalidarCache } from './useCached'
import { limpiarTitulo } from '../biblioteca/Biblioteca'
import PlanHint from './PlanHint'
import './entrenador.css'

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']
const RITMO_CACES_SEG = 96
const XP_CORRECTA = 10
const XP_INTENTO = 2
const HITOS_RACHA = [3, 5, 10, 15, 20]
const CONFIANZAS = simuladorService.CONFIANZAS
const ESTILO_CONF = {
    seguro: 'border-medico-green text-medico-green hover:bg-emerald-50 focus:ring-medico-green',
    dudo: 'border-medico-orange text-medico-orange hover:bg-orange-50 focus:ring-medico-orange',
    adivino: 'border-gray-400 text-gray-600 hover:bg-gray-50 focus:ring-gray-400'
}
const COLORES_CONFETI = ['#1e40af', '#059669', '#f59e0b', '#ec4899', '#0ea5e9', '#ef4444']

const SimuladorSesion = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [sesion, setSesion] = useState(null)
    const [preguntas, setPreguntas] = useState([])
    const [idx, setIdx] = useState(0)
    const [seleccion, setSeleccion] = useState(null)   // opción elegida aún no comprobada (práctica)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [enviando, setEnviando] = useState(false)
    const [restante, setRestante] = useState(null)
    const [transcurrido, setTranscurrido] = useState(0)
    const [modal, setModal] = useState(null)             // 'finalizar' | 'salir'
    const [drawer, setDrawer] = useState(false)
    const panelRef = useRef(null)
    const [panelMas, setPanelMas] = useState(false)   // hay contenido oculto abajo en el panel (mostrar pista "ver más")
    const medirPanel = useCallback(() => {
        const el = panelRef.current
        if (!el) return setPanelMas(false)
        setPanelMas(el.scrollHeight - el.clientHeight - el.scrollTop > 24)
    }, [])
    const [finalizando, setFinalizando] = useState(false)
    const [racha, setRacha] = useState(0)                // aciertos seguidos en esta sesión
    const [stats, setStats] = useState(null)
    const [feedback, setFeedback] = useState({})         // preguntaId → datos extra de la respuesta (práctica)
    const [xpSesion, setXpSesion] = useState(0)
    const [flotante, setFlotante] = useState(null)       // { texto, id }
    const [celebracion, setCelebracion] = useState(null) // { racha, id }
    const [restantePregunta, setRestantePregunta] = useState(null)  // contrarreloj: segundos que quedan en la pregunta actual
    const [muerteTerminada, setMuerteTerminada] = useState(false)   // muerte súbita: ya hubo un fallo
    const saltandoRef = useRef(false)

    const inicioPregunta = useRef(Date.now())
    const timerRef = useRef(null)
    const finalizandoRef = useRef(false)

    useEffect(() => {
        (async () => {
            const r = await simuladorService.getSesion(id)
            if (!r.success) { setError(r.error); setLoading(false); return }
            if (r.data.sesion.estado !== 'en_curso') { navigate(`/simulador/resultado/${id}`, { replace: true }); return }
            setSesion(r.data.sesion)
            setPreguntas(r.data.preguntas.map(q => ({ ...q, tiempoAgotado: !!q.datos?.tiempoAgotado })))
            const pendiente = r.data.preguntas.findIndex(p => !p.opcionSeleccionadaId)
            setIdx(pendiente >= 0 ? pendiente : 0)
            setRestante(r.data.sesion.segundosRestantes)
            setTranscurrido(Math.max(0, Math.floor((Date.now() - new Date(r.data.sesion.iniciadaEn).getTime()) / 1000)))
            setLoading(false)
        })()
        simuladorService.getStats().then(r => r.success && setStats(r.data.stats))
    }, [id, navigate])

    const finalizar = useCallback(async () => {
        if (finalizandoRef.current) return
        finalizandoRef.current = true
        setFinalizando(true)
        const r = await simuladorService.finalizar(id)
        if (r.success) { invalidarCache(); navigate(`/simulador/resultado/${id}`, { replace: true, state: { recien: true } }) }
        else { finalizandoRef.current = false; setFinalizando(false); setError(r.error); setModal(null) }
    }, [id, navigate])

    // Reloj: cuenta atrás si hay límite; siempre cuenta el tiempo transcurrido
    useEffect(() => {
        if (loading) return undefined
        timerRef.current = setInterval(() => {
            setTranscurrido(t => t + 1)
            setRestante(prev => {
                if (prev === null) return prev
                if (prev <= 1) { clearInterval(timerRef.current); finalizar(); return 0 }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [loading, finalizar])

    useEffect(() => { inicioPregunta.current = Date.now(); setSeleccion(null) }, [idx])

    const p = preguntas[idx]
    const esPractica = sesion?.modo === 'practica'
    const respondida = !!p?.opcionSeleccionadaId
    const cfg = sesion?.config || {}
    const tPreg = cfg.tiempoPorPreguntaSeg || null
    const esMuerte = !!cfg.muerteSubita
    const mostrarStats = cfg.mostrarEstadisticas !== false
    const agotada = !!p?.tiempoAgotado
    const revelada = esPractica && (respondida || agotada)
    const respondidas = preguntas.filter(q => q.opcionSeleccionadaId || q.tiempoAgotado).length
    const correctasSesion = preguntas.filter(q => q.esCorrecta).length
    const pendientes = preguntas.length - respondidas
    const esUltima = idx === preguntas.length - 1
    const fb = p ? feedback[p.preguntaId] : null
    // Medir el panel del entrenador cuando cambia su contenido (tras la animación de entrada) y al redimensionar
    useEffect(() => {
        const t = setTimeout(medirPanel, 400)
        window.addEventListener('resize', medirPanel)
        return () => { clearTimeout(t); window.removeEventListener('resize', medirPanel) }
    }, [medirPanel, revelada, idx, fb])

    // Contrarreloj: cada pregunta nueva arranca su cuenta atrás; al llegar a 0 se salta
    useEffect(() => {
        if (!tPreg || !p) { setRestantePregunta(null); return }
        if (p.opcionSeleccionadaId || p.tiempoAgotado) { setRestantePregunta(null); return }
        setRestantePregunta(tPreg)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, tPreg, p?.preguntaId, p?.opcionSeleccionadaId, p?.tiempoAgotado])

    useEffect(() => {
        if (restantePregunta === null) return undefined
        if (restantePregunta <= 0) { saltarPorTiempo(); return undefined }
        const t = setTimeout(() => setRestantePregunta(r => (r === null ? null : r - 1)), 1000)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restantePregunta])


    const ritmo = useMemo(() => {
        const t = preguntas.filter(q => q.tiempoSeg).map(q => q.tiempoSeg)
        return t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : null
    }, [preguntas])

    // ---------- tiempo por pregunta agotado ----------
    const saltarPorTiempo = async () => {
        if (!p || saltandoRef.current || p.opcionSeleccionadaId || p.tiempoAgotado) return
        saltandoRef.current = true
        setRestantePregunta(null)
        const tiempoSeg = Math.round((Date.now() - inicioPregunta.current) / 1000)
        const r = await simuladorService.saltar(id, { preguntaId: p.preguntaId, tiempoSeg })
        saltandoRef.current = false
        if (!r.success) { setError(r.error); return }
        setPreguntas(prev => prev.map((q, i) => {
            if (i !== idx) return q
            const upd = { ...q, tiempoAgotado: true, tiempoSeg }
            if (esPractica) { upd.esCorrecta = false; upd.explicacion = r.data.explicacion; upd.opciones = q.opciones.map(o => ({ ...o, es_correcta: o.id === r.data.opcionCorrectaId })) }
            return upd
        }))
        if (esPractica) {
            setFeedback(f => ({ ...f, [p.preguntaId]: { ...r.data, tiempoAgotado: true } }))
            setRacha(0)
            if (esMuerte) setMuerteTerminada(true)
        } else if (idx < preguntas.length - 1) {
            setTimeout(() => ir(idx + 1), 400)
        }
    }

    // ---------- enviar respuesta ----------
    // Vuelve a cargar la sesión desde el servidor y sigue desde donde va (respuestas y explicaciones ya reveladas)
    const resincronizar = async () => {
        const r = await simuladorService.getSesion(id)
        if (!r.success) { setError(r.error); return }
        if (r.data.sesion.estado !== 'en_curso') { navigate(`/simulador/resultado/${id}`, { replace: true }); return }
        setSesion(r.data.sesion)
        setPreguntas(r.data.preguntas.map(q => ({ ...q, tiempoAgotado: !!q.datos?.tiempoAgotado })))
        setSeleccion(null); setError('')
    }

    const enviar = async (opcionId, confianza = null) => {
        if (!p || enviando) return
        setEnviando(true)
        setRestantePregunta(null)
        const tiempoSeg = Math.round((Date.now() - inicioPregunta.current) / 1000)
        // Examen: se marca al instante (optimista) y se revierte si el servidor no lo acepta
        const previa = p.opcionSeleccionadaId
        if (!esPractica) setPreguntas(prev => prev.map((q, i) => i === idx ? { ...q, opcionSeleccionadaId: opcionId, confianza } : q))
        const r = await simuladorService.responder(id, { preguntaId: p.preguntaId, opcionId, tiempoSeg, confianza })
        setEnviando(false)
        if (!r.success) {
            if (!esPractica) setPreguntas(prev => prev.map((q, i) => i === idx ? { ...q, opcionSeleccionadaId: previa } : q))
            if (r.error?.includes('Tiempo agotado. Finaliza')) { finalizar(); return }
            // Ya respondida en el servidor (otra pestaña/dispositivo o doble envío): traer el estado real en vez de bloquear
            if (r.error?.includes('ya fue respondida')) { await resincronizar(); return }
            setError(r.error); return
        }
        setError('')
        setPreguntas(prev => prev.map((q, i) => {
            if (i !== idx) return q
            const upd = { ...q, opcionSeleccionadaId: opcionId, tiempoSeg, confianza }
            if (esPractica) {
                upd.esCorrecta = r.data.esCorrecta
                upd.explicacion = r.data.explicacion
                upd.opciones = q.opciones.map(o => ({ ...o, es_correcta: o.id === r.data.opcionCorrectaId }))
            }
            return upd
        }))
        if (esPractica) {
            setFeedback(f => ({ ...f, [p.preguntaId]: r.data }))
            const xp = r.data.esCorrecta ? XP_CORRECTA : XP_INTENTO
            setXpSesion(x => x + xp)
            setFlotante({ texto: `+${xp} XP`, ok: r.data.esCorrecta, id: Date.now() })
            setRacha(s => {
                const nueva = r.data.esCorrecta ? s + 1 : 0
                if (HITOS_RACHA.includes(nueva)) setCelebracion({ racha: nueva, id: Date.now() })
                return nueva
            })
            if (esMuerte && !r.data.esCorrecta) setMuerteTerminada(true)
        }
        setSesion(prev => ({ ...prev, respondidas: r.data.respondidas, correctas: r.data.correctas ?? prev.correctas }))
    }

    useEffect(() => { if (!flotante) return undefined; const t = setTimeout(() => setFlotante(null), 1400); return () => clearTimeout(t) }, [flotante])
    useEffect(() => { if (!celebracion) return undefined; const t = setTimeout(() => setCelebracion(null), 2200); return () => clearTimeout(t) }, [celebracion])

    const elegir = (opcionId) => {
        if (revelada || enviando || agotada) return
        if (esPractica) setSeleccion(opcionId)
        else enviar(opcionId, p.confianza || null)
    }
    const comprobar = (confianza) => { if (seleccion) enviar(seleccion, confianza) }
    const confianzaExamen = (c) => { if (respondida) enviar(p.opcionSeleccionadaId, c) }

    const continuar = () => {
        if (muerteTerminada) { finalizar(); return }
        if (esUltima) {
            if (pendientes === 0) finalizar()
            else setModal('finalizar')
        } else ir(idx + 1)
    }

    const ir = useCallback((n) => {
        if (n < 0 || n >= preguntas.length) return
        setIdx(n); setDrawer(false)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [preguntas.length])

    const toggleMarcar = async () => {
        const nuevo = !p.marcada
        setPreguntas(prev => prev.map((q, i) => i === idx ? { ...q, marcada: nuevo } : q))
        await simuladorService.marcar(id, p.preguntaId, nuevo)
    }

    // ---------- teclado ----------
    useEffect(() => {
        const onKey = (e) => {
            if (modal || loading || !p) return
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
            const k = e.key.toLowerCase()
            if (/^[1-6]$/.test(e.key)) { const o = p.opciones[parseInt(e.key) - 1]; if (o) elegir(o.id) }
            else if (esPractica && !revelada && seleccion && (k === 's' || k === 'd' || k === 'a' || e.key === 'Enter')) comprobar(k === 's' ? 'seguro' : k === 'a' ? 'adivino' : 'dudo')
            else if (e.key === 'Enter') continuar()
            else if (e.key === 'ArrowRight' && (!esPractica || revelada)) ir(idx + 1)
            else if (e.key === 'ArrowLeft') ir(idx - 1)
            else if (k === 'm') toggleMarcar()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [idx, preguntas, modal, loading, enviando, seleccion])

    const salir = async (abandonar) => {
        if (abandonar) await simuladorService.abandonar(id)
        invalidarCache()
        navigate('/simulador')
    }

    if (loading) return <div className="min-h-screen bg-medico-light"><Loading text="Preparando tu sesión…" /></div>
    if (!sesion || !p) return (
        <div className="min-h-screen bg-medico-light flex items-center justify-center p-6">
            <Card className="p-8 text-center max-w-md">
                <p className="text-gray-900 font-semibold">No se pudo cargar la sesión</p>
                <p className="text-sm text-medico-gray mt-2">{error}</p>
                <Button className="mt-6" to="/simulador">Volver al entrenador</Button>
            </Card>
        </div>
    )

    // cfg ya está definido arriba (config de la sesión)
    const titulo = cfg.titulo || (cfg.leccionTitulo ? `${cfg.leccionTitulo} · ${cfg.unidadTitulo}` : cfg.unidadTitulo ? `Prueba · ${cfg.unidadTitulo}` : simuladorService.ORIGENES[sesion.origen]?.label)
    const nombre = (user?.nombre_completo || user?.nombre_usuario || '').split(' ')[0]
    const progreso = (respondidas / preguntas.length) * 100
    const tiempoCritico = restante !== null && restante < 120
    const ritmoTono = ritmo === null ? 'text-white/70' : ritmo <= RITMO_CACES_SEG ? 'text-emerald-200' : ritmo <= RITMO_CACES_SEG * 1.3 ? 'text-amber-200' : 'text-red-200'
    const opcionCorrecta = revelada ? p.opciones.find(o => o.es_correcta) : null
    const textoDistractor = fb?.distractor ? p.opciones.find(o => o.id === fb.distractor.opcionId)?.texto : null

    const chip = 'inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/12 border border-white/20 text-white whitespace-nowrap'

    return (
        <div className="min-h-screen bg-medico-light flex flex-col">
            {/* ===== Cabecera de marca ===== */}
            <header className="sticky top-0 z-30 bg-gradient-to-r from-medico-blue via-blue-800 to-blue-900 text-white shadow-md">
                <div className="max-w-[1480px] mx-auto px-3 sm:px-4 md:px-8 h-14 sm:h-16 flex items-center gap-2 sm:gap-3 md:gap-4">
                    <img src={logoBlanco} alt="Mediconsa" className="h-5 sm:h-8 w-auto flex-shrink-0" />
                    <div className="hidden sm:block w-px h-8 bg-white/20" />
                    <div className="flex-1 min-w-[4.5rem]">
                        <p className="text-xs sm:text-sm font-semibold truncate leading-tight">{titulo}</p>
                        <p className="hidden sm:block text-[11px] text-blue-100/90 truncate">{sesion.carreraLabel}{nombre ? ` · ${nombre}` : ''} · {simuladorService.MODOS[sesion.modo]?.label}{cfg.reto && cfg.reto !== 'libre' ? ` · ${simuladorService.RETOS[cfg.reto]?.label || ''}` : ''}{cfg.dificultad && cfg.dificultad !== 'mixta' ? ` · ${cfg.dificultad}` : ''}</p>
                    </div>
                    {stats && (
                        <span className={`hidden lg:inline-flex ${chip} ${stats.rachaDias > 0 ? '!bg-orange-400/25 !border-orange-300/40' : ''}`} title="Días seguidos entrenando"><Flame className={`w-4 h-4 ${stats.rachaDias > 0 ? 'text-orange-300 fill-current' : ''}`} /> {stats.rachaDias}</span>
                    )}
                    {esPractica && racha >= 2 && (
                        <span key={racha} className={`hidden sm:inline-flex ${chip} ent-pop`}><Zap className="w-4 h-4 fill-current text-yellow-300" /> {racha} seguidas</span>
                    )}
                    <span className={`hidden md:inline-flex ${chip} ${ritmoTono}`} title={`Tu ritmo medio por pregunta. El CACES da ${RITMO_CACES_SEG} s por pregunta`}>
                        <Gauge className="w-4 h-4" /> {ritmo === null ? '—' : `${ritmo} s/preg`}
                    </span>
                    {restantePregunta !== null && (
                        <span className={`${chip} font-mono ${restantePregunta <= 10 ? '!bg-red-500/50 !border-red-300/60 ent-latido' : '!bg-orange-400/30 !border-orange-300/40'}`} title="Tiempo para esta pregunta">
                            <Timer className="w-4 h-4" /> {restantePregunta}s
                        </span>
                    )}
                    <span className={`${chip} font-mono ${tiempoCritico ? '!bg-red-500/40 !border-red-300/50' : ''}`} title={restante !== null ? 'Tiempo restante' : 'Tiempo de entrenamiento'}>
                        <Clock className="w-4 h-4" /> {simuladorService.formatSeg(restante !== null ? restante : transcurrido)}
                    </span>
                    <button onClick={() => setDrawer(d => !d)} className={`${chip} hover:bg-white/20`} title="Ver todas las preguntas">
                        <Grid3x3 className="w-4 h-4" /> {idx + 1}/{preguntas.length}
                    </button>
                    <button onClick={() => setModal('salir')} className="p-1.5 sm:p-2 -mr-1 sm:-mr-2 rounded-full hover:bg-white/15 text-white/80" title="Salir de la sesión"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                </div>
                <div className="h-1.5 bg-white/15">
                    <div className={`h-1.5 bg-gradient-to-r from-emerald-300 to-emerald-400 transition-all duration-700 ${progreso >= 100 ? 'ent-brillo' : ''}`} style={{ width: `${progreso}%` }} />
                </div>
                {drawer && (
                    <div className="bg-white text-gray-900 border-b border-gray-100 max-h-[55vh] overflow-y-auto">
                        <div className="max-w-[1480px] mx-auto px-4 md:px-8 pb-4 flex flex-wrap gap-2 pt-4">
                            {preguntas.map((q, i) => {
                                let cls = 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                if (q.opcionSeleccionadaId) cls = esPractica ? (q.esCorrecta ? 'bg-medico-green text-white' : 'bg-medico-red text-white') : 'bg-medico-blue text-white'
                                return (
                                    <button key={q.preguntaId} onClick={() => ir(i)} className={`relative w-10 h-10 rounded-xl text-sm font-semibold ${cls} ${i === idx ? 'ring-2 ring-offset-2 ring-medico-blue' : ''}`}>
                                        {i + 1}
                                        {q.marcada && <Flag className="absolute -top-1 -right-1 w-3.5 h-3.5 text-medico-orange fill-current" />}
                                    </button>
                                )
                            })}
                            <Button size="sm" variant={pendientes === 0 ? 'success' : 'secondary'} className="ml-auto" onClick={() => setModal('finalizar')}>Finalizar sesión</Button>
                        </div>
                    </div>
                )}
            </header>

            {/* ===== Cuerpo: pregunta | panel del entrenador ===== */}
            <main className="flex-1 px-3 sm:px-4 md:px-8 py-4 md:py-8 pb-36">
                <div className="max-w-[1480px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_440px] gap-6 items-start">
                    {/* ---- Pregunta ---- */}
                    <div key={p.preguntaId} className="ent-entrada min-w-0">
                        {error && <Alert tone="error" className="mb-4">{error}</Alert>}
                        <Card className="p-4 sm:p-5 md:p-7">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-sm text-medico-gray">
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-medico-blue font-semibold text-xs mr-2">{idx + 1}</span>
                                    de {preguntas.length}{p.areaNombre ? <> · <span className="font-medium text-gray-700">{p.areaNombre}</span></> : null}
                                </p>
                                <button onClick={toggleMarcar} className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${p.marcada ? 'bg-orange-50 text-medico-orange border-orange-200' : 'bg-white text-medico-gray border-gray-200 hover:border-gray-300'}`} title="Marcar para revisar (M)">
                                    <Flag className={`w-3.5 h-3.5 ${p.marcada ? 'fill-current' : ''}`} /> {p.marcada ? 'Marcada' : 'Marcar'}
                                </button>
                            </div>
                            {tPreg && (
                                <div className="mb-4 h-1.5 bg-gray-100 rounded-full overflow-hidden" title="Tiempo de esta pregunta">
                                    <div className={`h-1.5 rounded-full transition-all duration-1000 ease-linear ${restantePregunta !== null && restantePregunta <= 10 ? 'bg-medico-red' : 'bg-medico-orange'}`} style={{ width: `${restantePregunta !== null ? (100 * restantePregunta) / tPreg : 0}%` }} />
                                </div>
                            )}
                            {agotada && !esPractica && <p className="mb-3 text-xs font-semibold text-medico-red inline-flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Se agotó el tiempo de esta pregunta: cuenta como no respondida</p>}
                            <h2 className="font-sans text-[15px] sm:text-base md:text-[21px] font-medium md:font-semibold text-gray-900 leading-relaxed whitespace-pre-line">{p.enunciado}</h2>
                            {p.imagenUrl && <img src={p.imagenUrl} alt="" className="mt-5 max-h-96 rounded-2xl border border-gray-100 mx-auto" onError={e => { e.target.style.display = 'none' }} />}

                            <div className="mt-4 md:mt-6 space-y-2.5 md:space-y-3">
                                {p.opciones.map((o, i) => {
                                    const elegida = esPractica ? (revelada ? p.opcionSeleccionadaId === o.id : seleccion === o.id) : p.opcionSeleccionadaId === o.id
                                    let cls = 'border-gray-200 bg-white hover:border-blue-300'
                                    let badge = 'bg-gray-100 text-gray-600'
                                    let anim = `ent-entrada ent-retraso-${Math.min(4, i + 1)}`
                                    if (revelada) {
                                        if (o.es_correcta) { cls = 'border-medico-green bg-emerald-50'; badge = 'bg-medico-green text-white'; anim = 'ent-pulso-ok' }
                                        else if (elegida) { cls = 'border-medico-red bg-red-50'; badge = 'bg-medico-red text-white'; anim = 'ent-sacudida' }
                                        else cls = 'border-gray-100 bg-white opacity-50'
                                    } else if (elegida) { cls = 'border-medico-blue bg-blue-50 ring-2 ring-medico-blue/30'; badge = 'bg-medico-blue text-white' }
                                    const esDistractor = revelada && fb?.distractor?.opcionId === o.id
                                    return (
                                        <button key={o.id} type="button" disabled={enviando || revelada || agotada} onClick={() => elegir(o.id)}
                                                className={`ent-opcion w-full text-left flex items-start gap-3 md:gap-4 p-3 sm:p-4 md:p-5 rounded-2xl border-2 disabled:cursor-default ${cls} ${anim}`}>
                                            <span className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm font-bold flex-shrink-0 transition-colors ${badge}`}>{LETRAS[i]}</span>
                                            <span className="flex-1 text-gray-900 text-[15px] sm:text-base md:text-lg leading-snug md:leading-normal pt-0.5">
                                                {o.texto}
                                                {esDistractor && mostrarStats && <span className="block text-xs font-medium text-medico-orange mt-1"><Users className="w-3.5 h-3.5 inline -mt-0.5" /> La elige el {Math.round(fb.distractor.pct)}% de los alumnos</span>}
                                            </span>
                                            {revelada && o.es_correcta && <CheckCircle2 className="w-6 h-6 text-medico-green flex-shrink-0 mt-1 ent-pop" />}
                                            {revelada && elegida && !o.es_correcta && <XCircle className="w-6 h-6 text-medico-red flex-shrink-0 mt-1 ent-pop" />}
                                        </button>
                                    )
                                })}
                            </div>

                            {!esPractica && respondida && (
                                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-medico-gray ent-entrada">
                                    <span>¿Qué tan segura es tu respuesta?</span>
                                    {Object.entries(CONFIANZAS).map(([k, c]) => (
                                        <button key={k} onClick={() => confianzaExamen(k)} disabled={enviando}
                                                className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${p.confianza === k ? 'bg-medico-blue text-white border-medico-blue' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{c.label}</button>
                                    ))}
                                </div>
                            )}
                        </Card>
                        <p className="mt-3 text-xs text-medico-gray hidden md:block">Atajos: 1-4 elegir · {esPractica ? 'S lo sé · D tengo dudas · A no lo sé · Enter continuar' : 'Enter siguiente'} · M marcar</p>
                    </div>

                    {/* ---- Panel del entrenador ---- */}
                    <aside className="lg:sticky lg:top-24 min-w-0">
                        <Card className="overflow-hidden relative">
                            {celebracion && <Confeti key={celebracion.id} />}
                            {/* Cabecera del panel */}
                            <div className={`px-5 py-4 flex items-center gap-3 transition-colors duration-500 ${revelada ? (p.esCorrecta ? 'bg-emerald-50' : 'bg-red-50') : 'bg-gray-50'}`}>
                                <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-white ${revelada ? (p.esCorrecta ? 'bg-medico-green' : 'bg-medico-red') : 'bg-medico-blue'} ${revelada ? 'ent-latido' : ''}`}>
                                    {revelada ? (p.esCorrecta ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />) : <Stethoscope className="w-6 h-6" />}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">Tu entrenador</p>
                                    <p key={`${p.preguntaId}-${revelada}`} className={`font-sans text-base md:text-lg font-semibold leading-tight ent-entrada ${revelada ? (p.esCorrecta ? 'text-medico-green' : 'text-medico-red') : 'text-gray-900'}`}>
                                        {revelada ? (p.esCorrecta ? (fb?.confianza === 'adivino' ? 'Correcto… sin saberlo' : racha >= 3 ? `¡Correcto! ${racha} seguidas` : '¡Correcto!') : (fb?.tiempoAgotado ? 'Se acabó el tiempo' : muerteTerminada ? `Fin de la racha: ${preguntas.filter(q => q.esCorrecta).length} seguidas` : fb?.errorConcepto ? 'Incorrecto, y lo dabas por seguro' : 'Incorrecto'))
                                            : esPractica ? (seleccion ? '¿Qué tan segura es tu respuesta?' : 'Lee con calma y elige') : (respondida ? 'Guardada. ¿Siguiente?' : 'Modo examen: sin pistas')}
                                    </p>
                                </div>
                                <div className="relative text-right">
                                    <p className="text-[11px] text-medico-gray">Sesión</p>
                                    <p className="text-sm font-semibold text-gray-900 tabular-nums">{esPractica ? `${correctasSesion}/${respondidas}` : `${respondidas}/${preguntas.length}`}{esPractica && <span className="text-medico-gray font-normal"> · {xpSesion} XP</span>}</p>
                                    {flotante && <span key={flotante.id} className={`absolute right-0 -top-2 text-sm font-bold ent-flotar ${flotante.ok ? 'text-medico-green' : 'text-medico-orange'}`}>{flotante.texto}</span>}
                                </div>
                            </div>

                            <div ref={panelRef} onScroll={medirPanel} className="p-5 lg:max-h-[calc(100vh-18.5rem)] overflow-y-auto overscroll-contain">
                                {/* Antes de responder */}
                                {!revelada && (
                                    <div key={`pre-${p.preguntaId}-${!!seleccion}`} className="ent-entrada space-y-4">
                                        {esPractica ? (
                                            <>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {seleccion
                                                        ? 'Antes de comprobar, dime qué tan segura es tu respuesta. Si aciertas sin saberlo no lo doy por sabido; si fallas dándolo por seguro, lo marco como error de concepto y lo repasamos pronto.'
                                                        : 'Piensa la respuesta antes de mirar las opciones: es la forma más rápida de fijar el concepto. Luego elige y comprueba.'}
                                                </p>
                                                {seleccion && (
                                                    <div className="hidden lg:grid grid-cols-3 gap-2">
                                                        {Object.entries(CONFIANZAS).map(([k, c], i) => (
                                                            <button key={k} onClick={() => comprobar(k)} disabled={enviando}
                                                                    className={`ent-pop ent-retraso-${i + 1} px-3 py-3 rounded-2xl border-2 bg-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${ESTILO_CONF[k]}`}>
                                                                <span className="block">{c.label}</span>
                                                                <span className="block text-[11px] font-normal opacity-80">{c.desc}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-700 leading-relaxed">{respondida ? 'Tu respuesta quedó guardada; puedes cambiarla hasta finalizar. Verás las explicaciones al terminar.' : 'Responde como en el examen: sin pistas ni explicaciones hasta el final. Cuida el ritmo.'}</p>
                                        )}
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <Dato label="Ritmo" valor={ritmo === null ? '—' : `${ritmo} s`} tono={ritmo === null ? '' : ritmo <= RITMO_CACES_SEG ? 'text-medico-green' : 'text-medico-orange'} sub={`meta ${RITMO_CACES_SEG} s`} />
                                            <Dato label="Racha" valor={racha} tono={racha >= 3 ? 'text-medico-blue' : ''} sub="seguidas" />
                                            <Dato label="Restan" valor={pendientes} sub="preguntas" />
                                        </div>
                                        {cfg.areaFocoNombre && <p className="text-xs text-medico-gray flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Área foco de hoy: <strong className="text-gray-700">{cfg.areaFocoNombre}</strong></p>}
                                        {esMuerte && <p className="text-xs text-medico-gray flex items-center gap-1.5"><Skull className="w-3.5 h-3.5" /> Muerte súbita: la sesión termina con el primer fallo.</p>}
                                        {tPreg && <p className="text-xs text-medico-gray flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" /> Contrarreloj: {tPreg} s por pregunta; si se acaba, cuenta como fallo y pasa sola.</p>}
                                    </div>
                                )}

                                {/* Después de responder (práctica) */}
                                {revelada && (
                                    <div key={`post-${p.preguntaId}`} className="ent-entrada-lateral space-y-4">
                                        <div className="flex flex-wrap gap-2">
                                            {fb?.tiempoAgotado && <Pill className="bg-red-50 text-medico-red border-red-100"><Timer className="w-3.5 h-3.5" /> Sin responder por tiempo</Pill>}
                                            {muerteTerminada && <Pill className="bg-gray-900 text-white border-gray-900"><Skull className="w-3.5 h-3.5" /> Muerte súbita: termina aquí</Pill>}
                                            {fb?.errorConcepto && <Pill className="bg-red-50 text-medico-red border-red-100"><AlertTriangle className="w-3.5 h-3.5" /> Error de concepto: lo dabas por seguro</Pill>}
                                            {p.esCorrecta && fb?.confianza === 'adivino' && <Pill className="bg-orange-50 text-medico-orange border-orange-100">No cuenta como sabida</Pill>}
                                            {fb?.proximaRevisionDias != null && <Pill className="bg-blue-50 text-medico-blue border-blue-100"><CalendarClock className="w-3.5 h-3.5" /> Repaso en {fb.proximaRevisionDias} {fb.proximaRevisionDias === 1 ? 'día' : 'días'}</Pill>}
                                            {mostrarStats && fb?.aciertoGlobal != null && <Pill className="bg-gray-50 text-gray-700 border-gray-100"><Users className="w-3.5 h-3.5" /> La acierta el {Math.round(fb.aciertoGlobal)}%</Pill>}
                                        </div>
                                        {!p.esCorrecta && opcionCorrecta && (
                                            <p className="text-sm text-gray-800 rounded-2xl bg-emerald-50 border border-emerald-100 p-3"><span className="font-semibold text-medico-green">Respuesta correcta:</span> {opcionCorrecta.texto}</p>
                                        )}
                                        {mostrarStats && fb?.distractor?.esLaElegida && textoDistractor && (
                                            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-3 text-sm text-gray-800">
                                                <p className="font-semibold text-medico-orange flex items-center gap-1.5"><Users className="w-4 h-4" /> Error frecuente</p>
                                                <p className="mt-1">Caíste en la misma trampa que el {Math.round(fb.distractor.pct)}% de los alumnos. Fíjate en la explicación por qué se confunde con la correcta.</p>
                                            </div>
                                        )}
                                        {p.explicacion && (
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 inline-flex items-center gap-1.5 mb-2"><Lightbulb className="w-4 h-4 text-medico-blue" /> Explicación</p>
                                                <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-line">{p.explicacion}</p>
                                            </div>
                                        )}
                                        {fb?.refuerzo && (fb.refuerzo.clases.length > 0 || fb.refuerzo.materiales.length > 0) && (
                                            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3">
                                                <p className="text-sm font-semibold text-medico-blue mb-2 flex items-center gap-1.5"><Sparkles className="w-4 h-4" /> Refuerza este tema con tu curso</p>
                                                <div className="space-y-2">
                                                    {fb.refuerzo.clases.map(c => (
                                                        <div key={c.id} className="flex items-center gap-2 p-2 pl-2.5 rounded-xl bg-white border border-blue-100 hover:border-medico-blue transition-colors">
                                                            <span className="w-9 h-9 rounded-lg bg-blue-100 text-medico-blue flex items-center justify-center flex-shrink-0"><Video className="w-4 h-4" /></span>
                                                            <span className="flex-1 min-w-0"><span className="block text-sm font-medium text-gray-900 truncate">{limpiarTitulo(c.titulo)}</span><span className="block text-[11px] text-medico-gray truncate">{limpiarTitulo(c.modulo)}{c.completada ? ' · vista' : ''}</span></span>
                                                            <a href={c.url} target="_blank" rel="noopener noreferrer" title="Ver la clase" className="inline-flex items-center gap-1 text-xs font-semibold text-medico-blue hover:underline px-1.5 py-1">Ver <ExternalLink className="w-3.5 h-3.5" /></a>
                                                            <PlanHint compact carrera={sesion.carrera} tipo="clase" refId={c.id} nombre={limpiarTitulo(c.titulo)} enPlan={c.enPlan} />
                                                        </div>
                                                    ))}
                                                    {fb.refuerzo.materiales.map(m => (
                                                        <div key={m.id} className="flex items-center gap-2 p-2 pl-2.5 rounded-xl bg-white border border-blue-100 hover:border-medico-blue transition-colors">
                                                            <span className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0"><BookOpen className="w-4 h-4" /></span>
                                                            <span className="flex-1 min-w-0"><span className="block text-sm font-medium text-gray-900 truncate">{limpiarTitulo(m.titulo)}</span><span className="block text-[11px] text-medico-gray">Leer en la Biblioteca</span></span>
                                                            <a href={m.url} target="_blank" rel="noopener noreferrer" title="Leer ahora" className="inline-flex items-center gap-1 text-xs font-semibold text-medico-blue hover:underline px-1.5 py-1">Ver <ExternalLink className="w-3.5 h-3.5" /></a>
                                                            <PlanHint compact carrera={sesion.carrera} tipo="material" refId={m.id} nombre={limpiarTitulo(m.titulo)} enPlan={m.enPlan} />
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Hint: dejarlo para después en el plan de estudio, o "repasar más" si ya está */}
                                                {fb.refuerzo.areaId && fb.refuerzo.areaNombre && (
                                                    <PlanHint className="mt-2" carrera={sesion.carrera} tipo="area" refId={fb.refuerzo.areaId} nombre={fb.refuerzo.areaNombre} enPlan={fb.refuerzo.enPlan}
                                                              contexto={`Fallaste preguntas de ${fb.refuerzo.areaNombre} en una sesión. Mira la clase, lee el manual y vuelve a entrenar el área.`} />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {panelMas && (
                                <button type="button" onClick={() => panelRef.current?.scrollBy({ top: 240, behavior: 'smooth' })}
                                        className="hidden lg:flex absolute bottom-0 inset-x-0 h-14 items-end justify-center pb-2 bg-gradient-to-t from-white via-white/90 to-transparent text-xs font-semibold text-medico-blue">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-blue-100 shadow-sm ent-latido">Ver más <ChevronDown className="w-3.5 h-3.5" /></span>
                                </button>
                            )}
                        </Card>
                    </aside>
                </div>
            </main>

            {/* ===== Pie fijo: acción ===== */}
            <footer className={`fixed bottom-0 inset-x-0 z-30 border-t-2 transition-colors duration-500 ${revelada ? (p.esCorrecta ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200') : 'bg-white border-gray-200'}`}>
                <div className="max-w-[1480px] mx-auto px-3 sm:px-4 md:px-8 py-2.5 sm:py-3.5" style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}>
                    {revelada ? (
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <Button variant="ghost" onClick={() => ir(idx - 1)} disabled={idx === 0}><ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Anterior</span></Button>
                            <Button size="lg" variant={p.esCorrecta ? 'success' : 'primary'} onClick={continuar} loading={finalizando} className="flex-1 sm:flex-none sm:min-w-[200px] ent-pop">
                                {esUltima || muerteTerminada ? 'Ver resultado' : 'Continuar'} <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    ) : esPractica ? (
                        <div className="flex items-center justify-between gap-2 sm:gap-3">
                            <Button variant="ghost" onClick={() => ir(idx - 1)} disabled={idx === 0} className="hidden sm:inline-flex"><ChevronLeft className="w-5 h-5" /> Anterior</Button>
                            <p className="text-sm text-gray-700 hidden sm:block lg:hidden">{seleccion ? 'Indica tu confianza para comprobar' : 'Elige una opción'}</p>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full sm:w-auto sm:min-w-[330px] lg:hidden">
                                {Object.entries(CONFIANZAS).map(([k, c]) => (
                                    <button key={k} onClick={() => comprobar(k)} disabled={!seleccion || enviando}
                                            className={`px-2 sm:px-3 py-2.5 rounded-full border-2 bg-white text-[13px] sm:text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${ESTILO_CONF[k]}`} title={c.desc}>{c.label}</button>
                                ))}
                            </div>
                            <p className="hidden lg:block text-sm text-medico-gray">{seleccion ? 'Indica en el panel de la derecha qué tan segura es tu respuesta →' : ''}</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <Button variant="ghost" onClick={() => ir(idx - 1)} disabled={idx === 0}><ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Anterior</span></Button>
                            <p className="text-xs text-medico-gray hidden sm:block">{respondida ? 'Guardada · puedes cambiarla hasta finalizar' : 'Elige una opción'}</p>
                            {esUltima
                                ? <Button size="lg" variant={pendientes === 0 ? 'success' : 'primary'} onClick={() => pendientes === 0 ? finalizar() : setModal('finalizar')} loading={finalizando}>Finalizar</Button>
                                : <Button size="lg" onClick={() => ir(idx + 1)}>Siguiente <ChevronRight className="w-5 h-5" /></Button>}
                        </div>
                    )}
                </div>
            </footer>

            {/* ===== Modales ===== */}
            <Modal open={modal === 'finalizar'} title="Finalizar sesión" onClose={() => !finalizando && setModal(null)}
                   footer={<>
                       <Button variant="secondary" onClick={() => setModal(null)} disabled={finalizando}>Seguir respondiendo</Button>
                       <Button variant={pendientes > 0 ? 'primary' : 'success'} onClick={finalizar} loading={finalizando}>Sí, finalizar</Button>
                   </>}>
                {pendientes > 0
                    ? <p>Tienes <strong>{pendientes} pregunta{pendientes > 1 ? 's' : ''} sin responder</strong>; contarán como incorrectas. ¿Finalizar de todas formas?</p>
                    : <p>Respondiste todas las preguntas. ¿Ver tu resultado?</p>}
            </Modal>
            <Modal open={modal === 'salir'} title="Salir de la sesión" onClose={() => setModal(null)}
                   footer={<>
                       <Button variant="danger" onClick={() => salir(true)}>Abandonar</Button>
                       <Button onClick={() => salir(false)}>Guardar y salir</Button>
                   </>}>
                <p>Tu avance ya está guardado. Puedes <strong>continuar después</strong> desde el entrenador, o abandonar esta sesión (no contará en tu historial).</p>
                {restante !== null && <p className="mt-2 text-xs text-medico-gray">El tiempo límite sigue corriendo aunque salgas.</p>}
            </Modal>
        </div>
    )
}

const Dato = ({ label, valor, sub, tono = '' }) => (
    <div className="rounded-2xl bg-gray-50 p-2.5">
        <p className={`text-lg font-semibold leading-none tabular-nums ${tono || 'text-gray-900'}`}>{valor}</p>
        <p className="text-[10px] text-medico-gray mt-1">{label}{sub ? ` · ${sub}` : ''}</p>
    </div>
)

// Lluvia de confeti breve (CSS puro) al alcanzar un hito de racha
const Confeti = () => {
    const piezas = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
        left: `${(i * 37) % 100}%`, color: COLORES_CONFETI[i % COLORES_CONFETI.length],
        dx: `${((i % 5) - 2) * 26}px`, delay: `${(i % 7) * 0.06}s`, w: 6 + (i % 3) * 2
    })), [])
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
            {piezas.map((c, i) => (
                <span key={i} className="ent-confeti" style={{ left: c.left, background: c.color, '--dx': c.dx, animationDelay: c.delay, width: c.w, height: c.w * 1.6 }} />
            ))}
        </div>
    )
}

export default SimuladorSesion
