// src/simulador/SimuladorResultado.jsx - Resultado y revisión de una sesión finalizada
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Trophy, RotateCcw, ArrowLeft, CheckCircle2, XCircle, MinusCircle, Flag, Lightbulb, Clock, Play, AlertTriangle, Target, Dumbbell, Medal, Star, Crown, PartyPopper, Flame } from 'lucide-react'
import Layout from '../utils/Layout'
import simuladorService from '../services/simulador'
import { Card, PageHeader, Button, Pill, Stat, ProgressBar, Loading, Alert, SegmentedControl, Ring } from './ui'
import PlanHint from './PlanHint'

const LETRAS = ['A', 'B', 'C', 'D', 'E', 'F']

const SimuladorResultado = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const location = useLocation()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filtro, setFiltro] = useState('todas')
    const [creando, setCreando] = useState(false)

    useEffect(() => {
        (async () => {
            const r = await simuladorService.getSesion(id)
            if (!r.success) { setError(r.error); setLoading(false); return }
            if (r.data.sesion.estado === 'en_curso') { navigate(`/simulador/sesion/${id}`, { replace: true }); return }
            setData(r.data)
            setLoading(false)
        })()
    }, [id, navigate])

    const entrenarArea = async (areaId) => {
        setCreando(true)
        const r = await simuladorService.entrenarArea(areaId, data.sesion.carrera)
        setCreando(false)
        if (r.success) navigate(`/simulador/sesion/${r.data.sesion.id}`)
        else setError(r.error)
    }

    const repasarErrores = async () => {
        setCreando(true)
        const r = await simuladorService.crearSesion({ carrera: data.sesion.carrera, modo: 'practica', origen: 'errores', numPreguntas: 50 })
        setCreando(false)
        if (r.success) navigate(`/simulador/sesion/${r.data.sesion.id}`)
        else setError(r.error)
    }

    if (loading) return <Layout showSidebar><Loading text="Calculando resultados…" /></Layout>
    if (!data) return <Layout showSidebar><div className="p-10"><Alert tone="error">{error || 'Sesión no encontrada'}</Alert></div></Layout>

    const { sesion, resultado, preguntas } = data
    const recien = location.state?.recien
    const puntaje = resultado.puntaje ?? 0
    const color = puntaje >= 80 ? '#059669' : puntaje >= 60 ? '#ea580c' : '#dc2626'
    const nivel = puntaje >= 90 ? 'Excelente' : puntaje >= 80 ? 'Muy bien' : puntaje >= 70 ? 'Aprobado' : puntaje >= 60 ? 'Casi' : 'A reforzar'

    const lista = preguntas.filter(p => {
        if (filtro === 'falladas') return p.opcionSeleccionadaId && !p.esCorrecta
        if (filtro === 'sin') return !p.opcionSeleccionadaId
        if (filtro === 'marcadas') return p.marcada
        return true
    })

    const cfg = sesion.config || {}
    const ruta = resultado.ruta
    const xp = resultado.xp
    const stats = resultado.stats?.despues
    const esRuta = sesion.origen === 'leccion' || sesion.origen === 'prueba_unidad'
    const titulo = cfg.leccionTitulo ? `${cfg.leccionTitulo} · ${cfg.unidadTitulo}` : cfg.unidadTitulo ? `Prueba · ${cfg.unidadTitulo}` : `${simuladorService.ORIGENES[sesion.origen]?.label} · ${sesion.carreraLabel}`
    const esEntrenador = ['hoy', 'diagnostico', 'entrenar_area', 'examen_real'].includes(sesion.origen)
    const conceptos = preguntas.filter(p => p.opcionSeleccionadaId && !p.esCorrecta && p.confianza === 'seguro').length
    const adivinadas = preguntas.filter(p => p.esCorrecta && p.confianza === 'adivino').length
    const logroEntrenador = sesion.origen === 'diagnostico'
        ? { t: 'Diagnóstico listo', d: 'Ya pinté tu mapa de dominio con estos resultados. Ve al mapa y empieza por las áreas en rojo.', tint: 'bg-amber-400', ic: Target }
        : sesion.origen === 'hoy'
            ? (puntaje >= 70 ? { t: 'Sesión del día completada', d: 'Buen trabajo. Los repasos de hoy ya están reprogramados según lo que respondiste.', tint: 'bg-medico-green', ic: CheckCircle2 }
                : { t: 'Sesión del día completada', d: 'Lo que fallaste volverá mañana. Revisa abajo las clases y manuales de las áreas donde perdiste puntos.', tint: 'bg-medico-blue', ic: Dumbbell })
            : sesion.origen === 'entrenar_area'
                ? (puntaje >= 80 ? { t: `${cfg.areaNombre}: gran avance`, d: 'Sigue así y esta área pasará a dominada en los próximos repasos.', tint: 'bg-medico-green', ic: Medal }
                    : { t: `${cfg.areaNombre}: sigue entrenando`, d: 'Ve a la clase del área, léete el manual y vuelve a entrenarla mañana.', tint: 'bg-medico-orange', ic: Target })
                : null
    const logro = esEntrenador ? logroEntrenador : ruta?.tipo === 'leccion'
        ? (ruta.estadoLeccion === 'dominada' ? { t: '¡Lección perfecta!', d: 'Dominaste esta lección. Siguiente desbloqueada.', tint: 'bg-yellow-300', ic: Star }
            : ruta.aprobado ? { t: '¡Lección completada!', d: `Superaste el ${ruta.umbral}%. Siguiente lección desbloqueada.`, tint: 'bg-medico-green', ic: CheckCircle2 }
                : { t: 'Sigue practicando', d: `Necesitas ${ruta.umbral}% para completarla. Repásala cuando quieras.`, tint: 'bg-medico-orange', ic: Dumbbell })
        : ruta?.tipo === 'prueba_unidad'
            ? (ruta.aprobado ? { t: '¡Unidad dominada!', d: 'Aprobaste la prueba: todas sus lecciones quedan desbloqueadas.', tint: 'bg-yellow-300', ic: Crown }
                : { t: 'Todavía no', d: `Necesitas ${ruta.umbral}% para dominar la unidad. Practica sus lecciones y vuelve a intentarlo.`, tint: 'bg-medico-orange', ic: Target })
            : null

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <Button variant="ghost" size="sm" to="/simulador" className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4" /> Volver al entrenador</Button>
                <PageHeader
                    eyebrow={recien ? 'Sesión completada' : 'Resultado'}
                    title={titulo}
                    subtitle={`${simuladorService.MODOS[sesion.modo]?.label} · ${simuladorService.formatFecha(sesion.finalizadaEn)}`}
                    actions={<>
                        {resultado.falladas.length > 0 && (
                            <Button variant="secondary" onClick={repasarErrores} loading={creando}><RotateCcw className="w-4 h-4" /> Repasar mis errores</Button>
                        )}
                        <Button to="/simulador"><Play className="w-4 h-4" /> {esRuta ? 'Continuar ruta' : 'Ver mi mapa de dominio'}</Button>
                    </>}
                />
                {error && <Alert tone="error" className="mb-6">{error}</Alert>}

                {/* Logro + XP (solo si la sesión ya generó XP) */}
                {xp && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                        {logro && (
                            <Card className="p-6 flex items-center gap-5 lg:col-span-1">
                                <div className={`w-16 h-16 rounded-2xl ${logro.tint} flex items-center justify-center text-white flex-shrink-0`}>{React.createElement(logro.ic, { className: 'w-8 h-8' })}</div>
                                <div>
                                    <p className="text-xl font-semibold text-gray-900">{logro.t}</p>
                                    <p className="text-sm text-medico-gray mt-1">{logro.d}</p>
                                    {ruta?.unidadCompleta && <p className="text-xs font-semibold text-medico-green mt-2 inline-flex items-center gap-1"><PartyPopper className="w-3.5 h-3.5" /> Completaste todas las lecciones de la unidad</p>}
                                </div>
                            </Card>
                        )}
                        <Card tint="bg-blue-50" className={`p-6 border-blue-100 ${logro ? '' : 'lg:col-span-2'}`}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-medico-blue">XP ganado</p>
                            <p className="text-4xl font-semibold text-gray-900 mt-1">+{xp.total} <span className="text-lg text-medico-gray font-normal">XP</span></p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <Pill className="bg-white text-gray-700 border-blue-100">{resultado.correctas} correctas · +{xp.porCorrectas}</Pill>
                                {xp.porIntentos > 0 && <Pill className="bg-white text-gray-700 border-blue-100">Intentos · +{xp.porIntentos}</Pill>}
                                {xp.bonus.map((b, i) => <Pill key={i} className="bg-yellow-50 text-yellow-800 border-yellow-200">{b.motivo} · +{b.xp}</Pill>)}
                            </div>
                        </Card>
                        {stats && (
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-medico-gray">Nivel {stats.nivel}</p>
                                        <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.xp} XP</p>
                                    </div>
                                    <div className={`text-right ${stats.rachaDias > 0 ? 'text-medico-orange' : 'text-gray-400'}`}>
                                        <Flame className="w-8 h-8 ml-auto" />
                                        <p className="text-sm font-semibold">{stats.rachaDias} {stats.rachaDias === 1 ? 'día' : 'días'}</p>
                                    </div>
                                </div>
                                <ProgressBar className="mt-4" value={((stats.xp - stats.xpNivelActual) / Math.max(1, stats.xpSiguienteNivel - stats.xpNivelActual)) * 100} />
                                <p className="text-xs text-medico-gray mt-1">{stats.xpSiguienteNivel - stats.xp} XP para el nivel {stats.nivel + 1}</p>
                            </Card>
                        )}
                    </div>
                )}

                {/* Cabecera de puntaje */}
                <Card className="p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center gap-8">
                    <Ring value={puntaje} size={150} stroke={14} color={color} label={`${Math.round(puntaje)}%`} sub={nivel} />
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-5 h-5" style={{ color }} />
                            <p className="text-2xl font-semibold text-gray-900">{nivel}</p>
                            <Pill className={resultado.aprobado ? 'bg-emerald-50 text-medico-green border-emerald-100' : 'bg-red-50 text-medico-red border-red-100'}>
                                {resultado.aprobado ? 'Aprobado (≥70%)' : 'No aprobado (<70%)'}
                            </Pill>
                        </div>
                        <p className="text-medico-gray text-sm mb-4">{resultado.correctas} correctas de {resultado.totalPreguntas} preguntas</p>
                        {(conceptos > 0 || adivinadas > 0) && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {conceptos > 0 && <Pill className="bg-red-50 text-medico-red border-red-100"><AlertTriangle className="w-3.5 h-3.5" /> {conceptos} error{conceptos > 1 ? 'es' : ''} de concepto (respuestas que dabas por seguras)</Pill>}
                                {adivinadas > 0 && <Pill className="bg-orange-50 text-medico-orange border-orange-100">{adivinadas} acertada{adivinadas > 1 ? 's' : ''} sin saberlo</Pill>}
                            </div>
                        )}
                        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                            <div className="bg-medico-green" style={{ width: `${(resultado.correctas / resultado.totalPreguntas) * 100}%` }} />
                            <div className="bg-medico-red" style={{ width: `${(resultado.incorrectas / resultado.totalPreguntas) * 100}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1.5 text-medico-green"><CheckCircle2 className="w-4 h-4" /> {resultado.correctas} correctas</span>
                            <span className="flex items-center gap-1.5 text-medico-red"><XCircle className="w-4 h-4" /> {resultado.incorrectas} incorrectas</span>
                            <span className="flex items-center gap-1.5 text-gray-500"><MinusCircle className="w-4 h-4" /> {resultado.sinResponder} sin responder</span>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Stat label="Tiempo total" value={simuladorService.formatSeg(resultado.tiempoEmpleadoSeg)} />
                    <Stat label="Por pregunta" value={resultado.tiempoPromedioPreguntaSeg ? `${resultado.tiempoPromedioPreguntaSeg} s` : '—'} hint="promedio" />
                    <Stat label="Marcadas" value={resultado.marcadas.length} />
                    <Stat label="Preguntas" value={resultado.totalPreguntas} />
                </div>

                {/* Por área */}
                {resultado.porArea.length > 0 && (
                    <Card className="p-6 mb-8">
                        <h2 className="font-sans text-lg font-semibold text-gray-900 mb-4">Desempeño por área</h2>
                        <div className="space-y-4">
                            {resultado.porArea.map(a => {
                                const est = simuladorService.ESTADOS_AREA[a.estado]
                                return (
                                    <div key={a.areaId || 'na'}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-900">{a.areaNombre}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-medico-gray">{a.correctas}/{a.total}</span>
                                                <Pill className={est.cls}>{a.acierto}%</Pill>
                                                {a.areaId && a.acierto < 80 && (
                                                    <>
                                                        <button onClick={() => entrenarArea(a.areaId)} disabled={!!creando} className="text-xs font-semibold text-medico-blue hover:underline disabled:opacity-50">Entrenar</button>
                                                        <PlanHint compact carrera={sesion.carrera} tipo="area" refId={a.areaId} nombre={a.areaNombre} enPlan={a.enPlan}
                                                                  contexto={`Sacaste ${a.acierto}% en ${a.areaNombre} el ${new Date().toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}. Repasa la clase y el manual antes de volver a entrenarla.`} />
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ProgressBar value={a.acierto} color={a.estado === 'debil' ? 'bg-medico-red' : a.estado === 'medio' ? 'bg-medico-orange' : 'bg-medico-green'} />
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                )}

                {/* Revisión */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <h2 className="font-sans text-lg font-semibold text-gray-900">Revisión pregunta por pregunta</h2>
                    <SegmentedControl value={filtro} onChange={setFiltro} options={[
                        { value: 'todas', label: `Todas (${preguntas.length})` },
                        { value: 'falladas', label: `Falladas (${resultado.falladas.length})` },
                        { value: 'sin', label: `Sin responder (${resultado.sinResponder})` },
                        { value: 'marcadas', label: `Marcadas (${resultado.marcadas.length})` }
                    ]} />
                </div>
                <div className="space-y-4">
                    {lista.length === 0 && <Card className="p-8 text-center text-medico-gray text-sm">Nada que mostrar con este filtro.</Card>}
                    {lista.map(p => {
                        const estado = !p.opcionSeleccionadaId ? 'sin' : p.esCorrecta ? 'ok' : 'mal'
                        return (
                            <Card key={p.preguntaId} className="p-5 md:p-6">
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center text-sm font-semibold">{p.orden}</span>
                                        <div className="text-xs text-medico-gray">
                                            {p.areaNombre}{p.tema ? ` · ${p.tema}` : ''}
                                            {p.tiempoSeg ? <span className="ml-2 inline-flex items-center gap-1"><Clock className="w-3 h-3" />{p.tiempoSeg}s</span> : null}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {p.marcada && <Pill className="bg-orange-50 text-medico-orange border-orange-100"><Flag className="w-3 h-3 fill-current" /> Marcada</Pill>}
                                        {estado === 'ok' && <Pill className="bg-emerald-50 text-medico-green border-emerald-100">Correcta</Pill>}
                                        {estado === 'mal' && <Pill className="bg-red-50 text-medico-red border-red-100">Incorrecta</Pill>}
                                        {estado === 'sin' && <Pill className="bg-gray-50 text-gray-500 border-gray-100">Sin responder</Pill>}
                                        {p.confianza && <Pill className={p.confianza === 'seguro' && estado === 'mal' ? 'bg-red-50 text-medico-red border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100'}>{simuladorService.CONFIANZAS[p.confianza]?.label}{p.confianza === 'seguro' && estado === 'mal' ? ' · error de concepto' : ''}</Pill>}
                                    </div>
                                </div>
                                <p className="text-gray-900 leading-relaxed whitespace-pre-line">{p.enunciado}</p>
                                {p.imagenUrl && <img src={p.imagenUrl} alt="" className="mt-3 max-h-72 rounded-xl border border-gray-100" onError={e => { e.target.style.display = 'none' }} />}
                                <div className="mt-4 space-y-2">
                                    {p.opciones.map((o, i) => {
                                        const sel = p.opcionSeleccionadaId === o.id
                                        const cls = o.es_correcta ? 'bg-emerald-50 border-emerald-200' : sel ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'
                                        return (
                                            <div key={o.id} className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${cls}`}>
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${o.es_correcta ? 'bg-medico-green text-white' : sel ? 'bg-medico-red text-white' : 'bg-gray-100 text-gray-600'}`}>{LETRAS[i]}</span>
                                                <span className="flex-1 text-gray-900">{o.texto}</span>
                                                {o.es_correcta && <span className="text-xs text-medico-green font-medium">Correcta</span>}
                                                {sel && !o.es_correcta && <span className="text-xs text-medico-red font-medium">Tu respuesta</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                                {p.explicacion && (
                                    <div className="mt-4 flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
                                        <Lightbulb className="w-5 h-5 text-medico-blue flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{p.explicacion}</p>
                                    </div>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </div>
        </Layout>
    )
}

export default SimuladorResultado
