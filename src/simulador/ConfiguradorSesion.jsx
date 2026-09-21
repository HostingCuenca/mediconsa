// src/simulador/ConfiguradorSesion.jsx - Paso previo a toda sesión: "¿Cómo quieres entrenar?"
// Devuelve la configuración elegida (modo, tiempo, reto, cantidad, dificultad, filtros) al que lo abre.
import React, { useEffect, useMemo, useState } from 'react'
import { X, GraduationCap, ClipboardCheck, Timer, Skull, Award, Clock, Infinity as InfinityIcon, Gauge, Sparkles, EyeOff, Info, Tags } from 'lucide-react'
import { Button, Pill } from './ui'

export const RETOS = {
    practica: { label: 'Práctica guiada', icon: GraduationCap, color: 'text-medico-blue bg-blue-50 border-blue-200', desc: 'Respuesta y explicación al instante. Para aprender.', modo: 'practica' },
    examen: { label: 'Examen', icon: ClipboardCheck, color: 'text-gray-800 bg-gray-50 border-gray-300', desc: 'Sin pistas hasta el final; puedes cambiar respuestas. Para medirte.', modo: 'examen' },
    contrarreloj: { label: 'Contrarreloj', icon: Timer, color: 'text-medico-orange bg-orange-50 border-orange-200', desc: 'Tiempo por pregunta; si se acaba, pasa sola. Para ganar velocidad.', modo: 'practica' },
    muerte_subita: { label: 'Muerte súbita', icon: Skull, color: 'text-medico-red bg-red-50 border-red-200', desc: 'Sigues hasta el primer fallo. XP por cada acierto seguido.', modo: 'practica' },
    examen_real: { label: 'Examen CACES completo', icon: Award, color: 'text-amber-800 bg-amber-50 border-amber-200', desc: 'Todas las especialidades en su proporción, 100 preguntas, 96 s por pregunta.', modo: 'examen' }
}
const CANTIDADES = [10, 15, 20, 30, 50]
const TIEMPOS_PREGUNTA = [{ v: 96, l: 'Ritmo CACES · 96 s' }, { v: 60, l: 'Rápido · 60 s' }, { v: 45, l: 'Sprint · 45 s' }]
const DIFICULTADES = [{ v: 'mixta', l: 'Mixta' }, { v: 'facil', l: 'Fácil' }, { v: 'media', l: 'Media' }, { v: 'dificil', l: 'Difícil' }]
const PREF_KEY = 'simulador_config_prefs'

const leerPrefs = () => { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {} } catch { return {} } }

/**
 * <ConfiguradorSesion open titulo subtitulo inicial={{reto, numPreguntas}} permitir={['practica','examen',...]}
 *                     onClose onConfirmar(config) />
 * config: { reto, modo, numPreguntas, tiempo: 'libre'|'total'|'pregunta', tiempoLimiteMin, tiempoPorPreguntaSeg,
 *           muerteSubita, dificultad, soloNoVistas, mostrarEstadisticas }
 */
// etiquetas: grupos visibles al alumno (institución, año…) para filtrar el banco; solo se muestran si hay alguna
const ConfiguradorSesion = ({ open, titulo = '¿Cómo quieres entrenar?', subtitulo, inicial = {}, permitir, onClose, onConfirmar, creando = false, etiquetas = [] }) => {
    const prefs = useMemo(leerPrefs, [])
    const [reto, setReto] = useState(inicial.reto || prefs.reto || 'practica')
    const [num, setNum] = useState(inicial.numPreguntas || prefs.numPreguntas || 20)
    const [tiempo, setTiempo] = useState(prefs.tiempo || 'libre')          // libre | total | pregunta
    const [minutos, setMinutos] = useState(prefs.minutos || 30)
    const [segPregunta, setSegPregunta] = useState(prefs.segPregunta || 96)
    const [dificultad, setDificultad] = useState(prefs.dificultad || 'mixta')
    const [soloNoVistas, setSoloNoVistas] = useState(!!prefs.soloNoVistas)
    const [mostrarEstadisticas, setMostrarEstadisticas] = useState(prefs.mostrarEstadisticas !== false)
    const [etiquetaIds, setEtiquetaIds] = useState([])
    const toggleEtiqueta = (id) => setEtiquetaIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id])

    useEffect(() => { if (open && inicial.reto) setReto(inicial.reto) }, [open, inicial.reto])
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        if (open) window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null
    const retos = Object.entries(RETOS).filter(([k]) => !permitir || permitir.includes(k))
    const r = RETOS[reto]
    const esContrarreloj = reto === 'contrarreloj'
    const esMuerte = reto === 'muerte_subita'
    const esReal = reto === 'examen_real'
    const tiempoEfectivo = esContrarreloj ? 'pregunta' : esReal ? 'total' : tiempo
    const minutosEstimados = esReal ? Math.round((100 * 96) / 60) : tiempoEfectivo === 'total' ? minutos : tiempoEfectivo === 'pregunta' ? Math.round((num * segPregunta) / 60) : Math.round((num * 75) / 60)

    const confirmar = () => {
        const config = {
            reto, modo: r.modo,
            numPreguntas: esReal ? 100 : num,
            tiempo: tiempoEfectivo,
            tiempoLimiteMin: tiempoEfectivo === 'total' && !esReal ? minutos : null,
            tiempoPorPreguntaSeg: tiempoEfectivo === 'pregunta' ? segPregunta : null,
            muerteSubita: esMuerte,
            dificultad, soloNoVistas, mostrarEstadisticas,
            etiquetaIds: esReal ? [] : etiquetaIds
        }
        try { localStorage.setItem(PREF_KEY, JSON.stringify({ reto, numPreguntas: num, tiempo, minutos, segPregunta, dificultad, soloNoVistas, mostrarEstadisticas })) } catch { /* noop */ }
        onConfirmar(config)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-900/40 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
            <div className="bg-white w-full sm:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="sticky top-0 bg-white/95 backdrop-blur px-6 pt-6 pb-3 flex items-start gap-3 border-b border-gray-100 z-10">
                    <div className="flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-blue">Entrenador CACES</p>
                        <h3 className="font-sans text-xl font-semibold text-gray-900">{titulo}</h3>
                        {subtitulo && <p className="text-sm text-medico-gray mt-0.5">{subtitulo}</p>}
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" title="Cerrar (Esc)"><X className="w-5 h-5" /></button>
                </div>

                <div className="px-6 py-5 space-y-6">
                    {/* Reto / modo */}
                    <section>
                        <p className="text-xs font-semibold text-gray-700 mb-2">Modo</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {retos.map(([k, x]) => {
                                const Icon = x.icon
                                const activo = reto === k
                                return (
                                    <button key={k} onClick={() => setReto(k)} className={`text-left flex items-start gap-3 p-3 rounded-2xl border-2 transition-all ${activo ? `${x.color} ring-2 ring-offset-1 ring-current` : 'border-gray-100 bg-white hover:border-gray-300'}`}>
                                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${activo ? 'bg-white/70' : 'bg-gray-100 text-gray-600'}`}><Icon className="w-5 h-5" /></span>
                                        <span className="min-w-0">
                                            <span className={`block text-sm font-semibold ${activo ? '' : 'text-gray-900'}`}>{x.label}</span>
                                            <span className={`block text-xs mt-0.5 ${activo ? 'opacity-80' : 'text-medico-gray'}`}>{x.desc}</span>
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    {/* Tiempo */}
                    {!esReal && (
                        <section>
                            <p className="text-xs font-semibold text-gray-700 mb-2">Tiempo</p>
                            <div className="flex flex-wrap gap-2">
                                <Opcion activa={tiempoEfectivo === 'libre'} disabled={esContrarreloj} onClick={() => setTiempo('libre')}><InfinityIcon className="w-4 h-4" /> Sin límite</Opcion>
                                <Opcion activa={tiempoEfectivo === 'total'} disabled={esContrarreloj} onClick={() => setTiempo('total')}><Clock className="w-4 h-4" /> Tiempo total</Opcion>
                                <Opcion activa={tiempoEfectivo === 'pregunta'} onClick={() => setTiempo('pregunta')}><Gauge className="w-4 h-4" /> Por pregunta</Opcion>
                            </div>
                            {tiempoEfectivo === 'total' && (
                                <div className="mt-3 flex items-center gap-3">
                                    <input type="range" min={5} max={180} step={5} value={minutos} onChange={e => setMinutos(parseInt(e.target.value))} className="flex-1 accent-medico-blue" />
                                    <span className="text-sm font-semibold text-gray-900 w-20 text-right">{minutos} min</span>
                                </div>
                            )}
                            {tiempoEfectivo === 'pregunta' && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {TIEMPOS_PREGUNTA.map(t => <Opcion key={t.v} activa={segPregunta === t.v} onClick={() => setSegPregunta(t.v)}>{t.l}</Opcion>)}
                                    <span className="inline-flex items-center gap-1 text-xs text-medico-gray"><Info className="w-3.5 h-3.5" /> El CACES da 96 s por pregunta</span>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Cantidad y dificultad */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">{esMuerte ? 'Máximo de preguntas' : 'Cantidad'}</p>
                            <div className="flex flex-wrap gap-2">
                                {esReal ? <Pill className="bg-amber-50 text-amber-800 border-amber-100">100 preguntas · distribución por especialidades</Pill>
                                    : CANTIDADES.map(n => <Opcion key={n} activa={num === n} onClick={() => setNum(n)}>{n}</Opcion>)}
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-700 mb-2">Dificultad</p>
                            <div className="flex flex-wrap gap-2">
                                {esReal ? <Pill className="bg-amber-50 text-amber-800 border-amber-100">Mixta, como el examen</Pill>
                                    : DIFICULTADES.map(d => <Opcion key={d.v} activa={dificultad === d.v} onClick={() => setDificultad(d.v)}>{d.l}</Opcion>)}
                            </div>
                        </div>
                    </section>

                    {/* Filtros por etiqueta (institución, año, tipo de examen…) */}
                    {!esReal && etiquetas.length > 0 && (
                        <section>
                            <p className="text-xs font-semibold uppercase tracking-wide text-medico-gray mb-2 inline-flex items-center gap-1"><Tags className="w-3.5 h-3.5" /> Solo preguntas de… <span className="normal-case font-normal">(opcional; si eliges varias, deben cumplir todas)</span></p>
                            <div className="space-y-2">
                                {etiquetas.map(g => (
                                    <div key={g.id} className="flex flex-wrap items-center gap-1.5">
                                        <span className="text-[11px] font-semibold w-24 flex-shrink-0" style={{ color: g.color }}>{g.nombre}</span>
                                        {g.etiquetas.map(e => <Opcion key={e.id} activa={etiquetaIds.includes(e.id)} onClick={() => toggleEtiqueta(e.id)}>{e.nombre}</Opcion>)}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Extras */}
                    {!esReal && (
                        <section className="flex flex-wrap gap-4">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={soloNoVistas} onChange={e => setSoloNoVistas(e.target.checked)} className="accent-medico-blue" /> <Sparkles className="w-4 h-4 text-medico-blue" /> Solo preguntas que no he visto</label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer"><input type="checkbox" checked={!mostrarEstadisticas} onChange={e => setMostrarEstadisticas(!e.target.checked)} className="accent-medico-blue" /> <EyeOff className="w-4 h-4 text-gray-500" /> Modo limpio (sin % de otros alumnos)</label>
                        </section>
                    )}
                </div>

                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <p className="text-sm text-medico-gray flex-1">
                        <strong className="text-gray-900">{r.label}</strong> · {esReal ? 100 : esMuerte ? `hasta ${num}` : num} preguntas · {tiempoEfectivo === 'libre' ? 'sin límite' : tiempoEfectivo === 'pregunta' ? `${segPregunta} s por pregunta` : `${esReal ? minutosEstimados : minutos} min`} · ≈ {minutosEstimados} min
                    </p>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button size="lg" onClick={confirmar} loading={creando}><r.icon className="w-5 h-5" /> Empezar</Button>
                </div>
            </div>
        </div>
    )
}

const Opcion = ({ activa, disabled, onClick, children }) => (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${activa ? 'bg-medico-blue text-white border-medico-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>{children}</button>
)

export default ConfiguradorSesion
