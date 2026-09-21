// src/panel/ResultadoSimulacro.jsx — Resultado de un simulacro (legacy).
// Funciona de dos formas: recién enviado (datos en location.state) o abriendo un intento anterior
// (?intento=ID → GET /simulacros/attempts/:id). Antes solo servía recién enviado y al refrescar se perdía.
import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Trophy, CheckCircle2, XCircle, Clock, RotateCcw, ArrowLeft, Lightbulb, AlertTriangle, ListChecks, Zap, Loader2 } from 'lucide-react'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import simulacrosService from '../services/simulacros'
import { limpiarTitulo } from '../biblioteca/Biblioteca'

const calif = (p) => p >= 90 ? { label: 'Excelente', cls: 'bg-emerald-100 text-emerald-800', hex: '#059669' }
    : p >= 80 ? { label: 'Muy bien', cls: 'bg-blue-100 text-blue-800', hex: '#1e40af' }
        : p >= 70 ? { label: 'Aprobado', cls: 'bg-blue-50 text-blue-700', hex: '#2563eb' }
            : p >= 60 ? { label: 'Casi', cls: 'bg-amber-100 text-amber-800', hex: '#ea580c' }
                : { label: 'A reforzar', cls: 'bg-red-100 text-red-700', hex: '#dc2626' }
const MODOS = { estudio: 'Modo estudio', practica: 'Modo práctica', revision: 'Modo revisión', evaluacion: 'Modo evaluación', examen_real: 'Examen oficial', realista: 'Modo realista', examen: 'Examen oficial' }

const ResultadoSimulacro = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const { isAuthenticated } = useAuth()
    const intentoId = params.get('intento')
    const st = location.state || {}

    const [cargando, setCargando] = useState(!!intentoId && !st.resultado)
    const [remoto, setRemoto] = useState(null)
    const [error, setError] = useState('')
    const [filtro, setFiltro] = useState('todas')

    useEffect(() => { if (!isAuthenticated) navigate('/login') }, [isAuthenticated, navigate])
    useEffect(() => {
        if (!intentoId || st.resultado) return
        let vivo = true
        setCargando(true)
        simulacrosService.getAttemptDetail(intentoId).then(r => {
            if (!vivo) return
            if (r.success) setRemoto(r.data); else setError(r.error || 'No se pudo cargar el intento')
            setCargando(false)
        })
        return () => { vivo = false }
    }, [intentoId, st.resultado])

    // Normaliza ambas fuentes a una sola forma
    const datos = useMemo(() => {
        if (st.resultado && st.simulacro) {
            const r = st.resultado
            return {
                titulo: st.simulacro.titulo, modo: st.simulacro.modo_estudio || st.simulacro.modo_evaluacion || 'practica', simulacroId: st.simulacro.id,
                puntaje: r.puntaje, correctas: r.respuestasCorrectas, total: r.totalPreguntas, minutos: r.tiempoEmpleado, fecha: new Date(),
                detalle: (r.detalle || []).map(d => ({ id: d.preguntaId, enunciado: d.enunciado, esCorrecta: d.esCorrecta, elegida: d.respuestaSeleccionada, correcta: d.respuestaCorrecta, explicacion: d.explicacion, feedback: d.feedback })),
                resumen: r.resumen, mensaje: st.message, auto: st.isAutoSubmit
            }
        }
        if (remoto?.intento) {
            const i = remoto.intento
            return {
                titulo: i.simulacro_titulo, modo: i.modo_estudio || i.modo_evaluacion || 'practica', simulacroId: i.simulacro_id,
                puntaje: parseFloat(i.puntaje), correctas: i.respuestas_correctas, total: i.total_preguntas, minutos: i.tiempo_empleado_minutos, fecha: i.fecha_intento,
                detalle: (remoto.respuestas || []).map(d => ({ id: d.id, enunciado: d.enunciado, esCorrecta: d.es_correcta, elegida: d.respuesta_seleccionada || d.respuesta_texto, correcta: d.respuesta_correcta, explicacion: d.explicacion })),
                resumen: remoto.respuestas ? null : 'El detalle de respuestas no está disponible para este simulacro.', recomendaciones: remoto.recomendaciones
            }
        }
        return null
    }, [st.resultado, st.simulacro, st.message, st.isAutoSubmit, remoto])

    if (cargando) return <Layout showSidebar><div className="p-10 flex flex-col items-center text-medico-gray"><Loader2 className="w-8 h-8 animate-spin text-medico-blue" /><p className="mt-3 text-sm">Cargando resultado…</p></div></Layout>
    if (!datos) return (
        <Layout showSidebar>
            <div className="p-6 md:p-8 flex flex-col items-center text-center">
                <AlertTriangle className="w-10 h-10 text-medico-orange" />
                <h2 className="mt-3 text-lg font-semibold text-gray-900">Resultado no encontrado</h2>
                <p className="mt-1 text-sm text-medico-gray max-w-sm">{error || 'No se pudieron cargar los resultados del simulacro.'}</p>
                <Link to="/simulacros" className="mt-5 px-5 py-2.5 rounded-full bg-medico-blue text-white text-sm font-medium">Volver a simulacros</Link>
            </div>
        </Layout>
    )

    const c = calif(datos.puntaje)
    const aprobado = datos.puntaje >= 70
    const incorrectas = Math.max(0, datos.total - datos.correctas)
    const lista = datos.detalle.filter(d => filtro === 'todas' || (filtro === 'falladas' ? !d.esCorrecta : d.esCorrecta))
    const titulo = limpiarTitulo(datos.titulo)

    return (
        <Layout showSidebar>
            <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">
                <Link to="/simulacros" className="inline-flex items-center gap-1 text-sm text-medico-gray hover:text-medico-blue mb-3"><ArrowLeft className="w-4 h-4" /> Simulacros</Link>

                {datos.mensaje && datos.auto && (
                    <div className="mb-4 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3 text-sm text-amber-900 flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5 flex-shrink-0" /> {datos.mensaje}</div>
                )}

                {/* ===== Resumen ===== */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-8 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="relative w-28 h-28 mx-auto sm:mx-0 flex-shrink-0">
                            <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                                <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                                <circle cx="50" cy="50" r="42" stroke={c.hex} strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={`${(2 * Math.PI * 42 * Math.min(100, datos.puntaje)) / 100} ${2 * Math.PI * 42}`} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold text-gray-900 tabular-nums">{Math.round(datos.puntaje)}%</span></div>
                        </div>
                        <div className="flex-1 text-center sm:text-left min-w-0">
                            <p className="text-xs uppercase tracking-wide text-medico-gray">{MODOS[datos.modo] || datos.modo} · {new Date(datos.fecha).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug mt-1">{titulo}</h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.cls}`}>{c.label}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${aprobado ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{aprobado ? 'Aprobado' : 'No aprobado'} (≥70%)</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6">
                        <div className="rounded-2xl bg-emerald-50 p-3 text-center"><CheckCircle2 className="w-5 h-5 text-medico-green mx-auto" /><p className="text-lg font-bold text-gray-900 mt-1 tabular-nums">{datos.correctas}</p><p className="text-[11px] text-medico-gray">correctas</p></div>
                        <div className="rounded-2xl bg-red-50 p-3 text-center"><XCircle className="w-5 h-5 text-medico-red mx-auto" /><p className="text-lg font-bold text-gray-900 mt-1 tabular-nums">{incorrectas}</p><p className="text-[11px] text-medico-gray">incorrectas</p></div>
                        <div className="rounded-2xl bg-gray-50 p-3 text-center"><Clock className="w-5 h-5 text-gray-500 mx-auto" /><p className="text-lg font-bold text-gray-900 mt-1 tabular-nums">{datos.minutos} min</p><p className="text-[11px] text-medico-gray">de {datos.total} preguntas</p></div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-6">
                        {(() => { const repaso = datos.simulacroId === 'errores' || /^Repaso de mis errores/i.test(datos.titulo || ''); const to = repaso ? '/simulacro/errores/realizar' : datos.simulacroId ? `/simulacro/${datos.simulacroId}/realizar` : null; return to && <Link to={to} className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-medico-blue text-white text-sm font-medium"><RotateCcw className="w-4 h-4" /> {repaso ? 'Seguir repasando mis errores' : 'Repetir simulacro'}</Link> })()}
                        <Link to="/simulador" className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-700"><Zap className="w-4 h-4 text-medico-blue" /> Entrenar mis áreas débiles</Link>
                    </div>
                </div>

                {/* ===== Detalle ===== */}
                {datos.detalle.length > 0 ? (
                    <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <h2 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2"><ListChecks className="w-5 h-5 text-medico-blue" /> Revisión pregunta por pregunta</h2>
                            <div className="inline-flex gap-1 bg-gray-100 rounded-full p-1 self-start">
                                {[['todas', `Todas (${datos.detalle.length})`], ['falladas', `Falladas (${datos.detalle.filter(d => !d.esCorrecta).length})`], ['correctas', 'Correctas']].map(([v, l]) => (
                                    <button key={v} onClick={() => setFiltro(v)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filtro === v ? 'bg-white shadow text-medico-blue' : 'text-gray-600'}`}>{l}</button>
                                ))}
                            </div>
                        </div>
                        <ol className="space-y-3">
                            {lista.map((d, i) => (
                                <li key={d.id || i} className={`bg-white rounded-2xl border p-4 ${d.esCorrecta ? 'border-emerald-100' : 'border-red-100'}`}>
                                    <div className="flex items-start gap-3">
                                        <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${d.esCorrecta ? 'bg-emerald-100 text-medico-green' : 'bg-red-100 text-medico-red'}`}>{d.esCorrecta ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}</span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm text-gray-900 leading-relaxed">{d.enunciado}</p>
                                            <div className="mt-2 space-y-1 text-sm">
                                                <p className={d.esCorrecta ? 'text-emerald-800' : 'text-red-800'}><span className="text-xs uppercase tracking-wide text-medico-gray mr-1">Tu respuesta:</span> {d.elegida || <em className="text-medico-gray">sin responder</em>}</p>
                                                {!d.esCorrecta && d.correcta && <p className="text-emerald-800"><span className="text-xs uppercase tracking-wide text-medico-gray mr-1">Correcta:</span> {d.correcta}</p>}
                                            </div>
                                            {d.explicacion && (
                                                <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2.5 text-sm text-blue-900 flex items-start gap-2"><Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0 text-medico-blue" /><span className="whitespace-pre-line">{d.explicacion}</span></div>
                                            )}
                                            {d.feedback && !d.explicacion && <p className="mt-2 text-xs text-medico-gray">{d.feedback}</p>}
                                        </div>
                                    </div>
                                </li>
                            ))}
                            {lista.length === 0 && <li className="text-sm text-medico-gray">Sin preguntas en este filtro.</li>}
                        </ol>
                    </>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-sm text-medico-gray flex items-start gap-2"><Trophy className="w-5 h-5 text-medico-blue flex-shrink-0" /> {datos.resumen || 'Este simulacro no muestra el detalle de respuestas. Revisa tus áreas débiles en el entrenador.'}</div>
                )}
            </div>
        </Layout>
    )
}

export default ResultadoSimulacro
