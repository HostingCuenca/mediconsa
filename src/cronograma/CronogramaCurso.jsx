// src/cronograma/CronogramaCurso.jsx - Cronograma del curso para el alumno: qué clase ver cada día.
// "Siguiente clase" destacada, lista por bloque/sección y calendario siempre visible con el día seleccionado.
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, CalendarDays, List, CheckCircle2, Circle, PlayCircle, Video, Radio, ChevronLeft, ChevronRight, Target,
    AlertTriangle, Flag, Clock, MapPin, ExternalLink
} from 'lucide-react'
import Layout from '../utils/Layout'
import cronogramasService from '../services/cronogramas'
import { Card, PageHeader, Button, Pill, Ring, ProgressBar, Loading, EmptyState, Alert } from '../simulador/ui'
import { useCached } from '../simulador/useCached'
import { limpiarTitulo } from '../biblioteca/Biblioteca'

const MODS = cronogramasService.MODALIDADES
const DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const CronogramaCurso = () => {
    const { cursoId } = useParams()
    const navigate = useNavigate()
    const q = useCached(`cronograma:${cursoId}`, () => cronogramasService.getPorCurso(cursoId))
    const [items, setItems] = useState([])
    const [mes, setMes] = useState(null)       // 'AAAA-MM'
    const [diaSel, setDiaSel] = useState(null)
    const [guardando, setGuardando] = useState(null)

    const data = q.data
    const hoy = data?.hoy || cronogramasService.hoyLocal()
    useEffect(() => { if (data?.items) setItems(data.items) }, [data])
    useEffect(() => {
        if (!data?.cronograma || mes) return
        const base = hoy >= (data.cronograma.fechaInicio || hoy) && hoy <= (data.cronograma.fechaFin || hoy) ? hoy : (data.cronograma.fechaInicio || hoy)
        setMes(base.slice(0, 7)); setDiaSel(hoy)
    }, [data, hoy, mes])

    const marcar = async (item, hecho) => {
        setGuardando(item.id)
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, hecho } : i))
        const r = await cronogramasService.marcarItem(item.id, hecho)
        setGuardando(null)
        if (!r.success) setItems(prev => prev.map(i => i.id === item.id ? { ...i, hecho: !hecho } : i))
        cronogramasService.invalidarMis()
    }

    // Resumen recalculado con el estado local
    const resumen = useMemo(() => {
        if (!data?.cronograma) return null
        const prog = items.filter(i => ['clase', 'repaso', 'evaluacion'].includes(i.tipo))
        const hastaHoy = prog.filter(i => i.fecha <= hoy)
        const atras = hastaHoy.filter(i => !i.hecho)
        return {
            ...data.resumen,
            hechos: prog.filter(i => i.hecho).length, total: prog.length,
            porcentaje: prog.length ? Math.round((100 * prog.filter(i => i.hecho).length) / prog.length) : 0,
            atrasados: atras.length, alDia: hastaHoy.length ? Math.round((100 * (hastaHoy.length - atras.length)) / hastaHoy.length) : 100
        }
    }, [items, data, hoy])

    const atrasados = items.filter(i => i.fecha < hoy && !i.hecho && ['clase', 'repaso', 'evaluacion'].includes(i.tipo))

    if (q.loading && !data) return <Layout showSidebar><Loading text="Cargando tu cronograma…" /></Layout>
    if (!data?.cronograma) {
        return (
            <Layout showSidebar>
                <div className="p-6 md:p-8">
                    <Button variant="ghost" size="sm" to="/mis-cursos" className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4" /> Mis cursos</Button>
                    <EmptyState icon={CalendarDays} title="Este curso aún no tiene cronograma" description={q.error || 'Cuando el equipo lo publique, aquí verás qué clase ver cada día.'} action={<Button to="/mis-cursos">Volver a mis cursos</Button>} />
                </div>
            </Layout>
        )
    }

    const cron = data.cronograma
    const irAHoy = () => setTimeout(() => document.getElementById(`dia-${hoy}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    const irAItem = (it) => { setDiaSel(it.fecha); setTimeout(() => document.getElementById(`item-${it.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50) }

    // Siguiente clase: la primera pendiente de hoy; si no, la primera de los próximos días; si no, la última atrasada
    const pendientes = items.filter(i => !i.hecho && ['clase', 'repaso', 'evaluacion'].includes(i.tipo))
    const siguiente = pendientes.find(i => i.fecha === hoy) || pendientes.find(i => i.fecha > hoy) || null
    const siguienteEnVivo = items.find(i => i.modalidad === 'en_vivo' && i.fecha >= hoy && !i.hecho)
    const relativo = (f) => {
        const d = cronogramasService.diasEntre(hoy, f)
        return d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : d === -1 ? 'Ayer' : d > 1 && d < 7 ? cronogramasService.formatFecha(f, { weekday: 'long' }) : cronogramasService.formatFecha(f, { weekday: 'short', day: 'numeric', month: 'short' })
    }

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <Button variant="ghost" size="sm" to="/mis-cursos" className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4" /> Mis cursos</Button>
                <PageHeader
                    eyebrow="Cronograma del curso"
                    title={cron.titulo}
                    subtitle={`${limpiarTitulo(cron.cursoTitulo)}${cron.cohorte ? ` · ${cron.cohorte}` : ''} · ${cronogramasService.formatFecha(cron.fechaInicio, { day: 'numeric', month: 'short' })} → ${cronogramasService.formatFecha(cron.fechaFin, { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    actions={resumen.estado === 'en_curso' && <Button variant="secondary" onClick={irAHoy}><MapPin className="w-4 h-4" /> Ir a hoy</Button>}
                />

                {/* ===== Siguiente clase · ritmo · examen ===== */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card tint="bg-gradient-to-br from-medico-blue to-blue-900" className="border-blue-900 p-5 text-white flex flex-col">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">{siguiente && siguiente.fecha === hoy ? 'Te toca hoy' : 'Siguiente clase'}</p>
                        {siguiente ? (
                            <>
                                <p className="font-sans text-lg font-semibold leading-snug mt-1">{siguiente.titulo}</p>
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-blue-100">
                                    <span className="inline-flex items-center gap-1 font-semibold text-white"><CalendarDays className="w-3.5 h-3.5" /> {relativo(siguiente.fecha)}{siguiente.hora ? ` · ${siguiente.hora.slice(0, 5)}` : ''}</span>
                                    {siguiente.modalidad === 'en_vivo' ? <span className="inline-flex items-center gap-1 text-red-200"><Radio className="w-3.5 h-3.5" /> En vivo</span> : <span className="inline-flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Grabada</span>}
                                    {siguiente.seccion && <span>· {siguiente.seccion}</span>}
                                </div>
                                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                                    {siguiente.claseId
                                        ? <Button className="!bg-white !text-medico-blue hover:!bg-blue-50 focus:!ring-white" onClick={() => navigate(`/estudiar/${cursoId}?clase=${siguiente.claseId}`)}><PlayCircle className="w-4 h-4" /> Ver la clase</Button>
                                        : siguiente.link
                                            ? <Button className="!bg-white !text-medico-blue hover:!bg-blue-50 focus:!ring-white" href={siguiente.link} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /> Unirse</Button>
                                            : null}
                                    <button onClick={() => irAItem(siguiente)} className="px-4 py-2 rounded-full text-sm font-medium bg-white/15 hover:bg-white/25 border border-white/25">Ver en el cronograma</button>
                                </div>
                                {siguienteEnVivo && siguienteEnVivo.id !== siguiente.id && <p className="text-[11px] text-blue-200 mt-3 inline-flex items-center gap-1"><Radio className="w-3 h-3 text-red-300" /> Próxima en vivo: {relativo(siguienteEnVivo.fecha)} · {siguienteEnVivo.titulo.slice(0, 40)}</p>}
                            </>
                        ) : resumen.estado === 'por_iniciar' ? (
                            <p className="mt-2 text-sm text-blue-100">Empieza el <strong className="text-white">{cronogramasService.formatFechaLarga(cron.fechaInicio)}</strong> (en {cronogramasService.diasEntre(hoy, cron.fechaInicio)} días).</p>
                        ) : (
                            <p className="mt-2 text-sm text-blue-100">No tienes clases pendientes. {resumen.estado === 'finalizado' ? 'Cronograma finalizado.' : '¡Vas al día!'}</p>
                        )}
                        <p className="mt-3 text-[11px] text-blue-200">Semana {resumen.semanaActual} de {resumen.semanasTotal} · {resumen.hoy} clase{resumen.hoy !== 1 ? 's' : ''} programada{resumen.hoy !== 1 ? 's' : ''} hoy</p>
                    </Card>

                    <Card className="p-5 flex items-center gap-5">
                        <Ring value={resumen.alDia} size={88} stroke={9} color={resumen.alDia >= 80 ? '#059669' : resumen.alDia >= 50 ? '#ea580c' : '#dc2626'} sub="al día" />
                        <div className="flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">Tu ritmo</p>
                            <p className="text-sm text-gray-800 mt-1">{resumen.hechos} de {resumen.total} clases vistas ({resumen.porcentaje}%)</p>
                            <ProgressBar value={resumen.porcentaje} className="mt-2" color="bg-medico-green" />
                            {resumen.atrasados > 0
                                ? <button onClick={() => atrasados[0] && irAItem(atrasados[0])} className="text-xs text-medico-orange font-medium mt-2 inline-flex items-center gap-1 hover:underline"><AlertTriangle className="w-3.5 h-3.5" /> {resumen.atrasados} clase{resumen.atrasados > 1 ? 's' : ''} atrasada{resumen.atrasados > 1 ? 's' : ''} · ponerme al día</button>
                                : <p className="text-xs text-medico-green font-medium mt-2 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Vas al día</p>}
                        </div>
                    </Card>

                    <Card className="p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">Examen</p>
                        {cron.fechaExamen ? (
                            <>
                                <p className="text-4xl font-semibold text-gray-900 mt-1 leading-none">{resumen.diasParaExamen >= 0 ? resumen.diasParaExamen : 0}<span className="text-base text-medico-gray font-normal"> días</span></p>
                                <p className="text-sm text-gray-700 mt-1">{cron.examenEtiqueta || `Examen · ${cronogramasService.formatFechaLarga(cron.fechaExamen)}`}</p>
                                <Pill className="mt-3 bg-amber-50 text-amber-800 border-amber-100"><Target className="w-3.5 h-3.5" /> {cronogramasService.formatFecha(cron.fechaExamen, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Pill>
                            </>
                        ) : <p className="text-sm text-medico-gray mt-2">Fecha por confirmar</p>}
                    </Card>
                </div>

                {/* ===== Calendario (siempre visible) + lista ===== */}
                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
                    <div className="xl:order-1 order-2">
                        {atrasados.length > 0 && (
                            <Alert tone="warn" className="mb-4">
                                <span className="font-semibold">Ponte al día:</span> tienes {atrasados.length} clase{atrasados.length > 1 ? 's' : ''} programada{atrasados.length > 1 ? 's' : ''} antes de hoy sin ver.
                            </Alert>
                        )}
                        <VistaLista items={items} hoy={hoy} cursoId={cursoId} onMarcar={marcar} guardando={guardando} navigate={navigate} />
                    </div>
                    <div className="xl:order-2 order-1 xl:sticky xl:top-24 space-y-4">
                        <Calendario items={items} hoy={hoy} mes={mes} setMes={setMes} diaSel={diaSel} setDiaSel={setDiaSel} cron={cron} />
                        <Card className="p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">{diaSel === hoy ? 'Hoy' : 'Día seleccionado'}</p>
                            <h3 className="font-sans text-base font-semibold text-gray-900 capitalize">{diaSel ? cronogramasService.formatFechaLarga(diaSel) : '—'}</h3>
                            <div className="mt-3 space-y-2">
                                {(items.filter(i => i.fecha === diaSel)).length === 0 && <p className="text-sm text-medico-gray">{diaSel === cron.fechaExamen ? (cron.examenEtiqueta || 'Día del examen') : 'Sin clases programadas.'}</p>}
                                {items.filter(i => i.fecha === diaSel).map(i => <ItemFila key={i.id} item={i} hoy={hoy} cursoId={cursoId} onMarcar={marcar} guardando={guardando} navigate={navigate} compacta />)}
                            </div>
                            {diaSel && items.some(i => i.fecha === diaSel) && <button onClick={() => document.getElementById(`dia-${diaSel}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="mt-3 text-xs font-medium text-medico-blue hover:underline">Ver este día en la lista</button>}
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

// ---------- fila de item ----------
export const ItemFila = ({ item, hoy, cursoId, onMarcar, guardando, navigate, compacta = false }) => {
    const m = item.modalidad ? MODS[item.modalidad] : null
    const atrasada = item.fecha < hoy && !item.hecho && ['clase', 'repaso', 'evaluacion'].includes(item.tipo)
    const esHoy = item.fecha === hoy
    const marcable = ['clase', 'repaso', 'evaluacion'].includes(item.tipo)
    return (
        <div id={`item-${item.id}`} className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors ${item.hecho ? 'bg-emerald-50/60 border-emerald-100' : atrasada ? 'bg-orange-50/60 border-orange-100' : esHoy ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-gray-100'}`}>
            {marcable ? (
                <button onClick={() => onMarcar(item, !item.hecho)} disabled={guardando === item.id || (!!item.claseId && item.hecho)} title={item.claseId && item.hecho ? 'Completada desde la clase' : item.hecho ? 'Desmarcar' : 'Marcar como vista'}
                        className={`mt-0.5 flex-shrink-0 ${item.hecho ? 'text-medico-green' : 'text-gray-300 hover:text-medico-blue'}`}>
                    {item.hecho ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </button>
            ) : <Flag className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />}
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium leading-snug ${item.hecho ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{item.titulo}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {!compacta && item.seccion && <span className="text-[11px] text-medico-gray">{item.seccion}</span>}
                    {m && <Pill className={m.cls}>{item.modalidad === 'en_vivo' ? <Radio className="w-3 h-3" /> : <Video className="w-3 h-3" />} {m.label}</Pill>}
                    {item.hora && <Pill className="bg-gray-50 text-gray-600 border-gray-100"><Clock className="w-3 h-3" /> {item.hora.slice(0, 5)}</Pill>}
                    {atrasada && <Pill className="bg-orange-50 text-medico-orange border-orange-100">Atrasada</Pill>}
                    {item.tipo !== 'clase' && <Pill className="bg-gray-50 text-gray-600 border-gray-100">{cronogramasService.TIPOS[item.tipo]?.label}</Pill>}
                </div>
            </div>
            {item.claseId ? (
                <Button size="sm" variant={item.hecho ? 'secondary' : 'primary'} onClick={() => navigate(`/estudiar/${cursoId}?clase=${item.claseId}`)} className="flex-shrink-0">
                    <PlayCircle className="w-4 h-4" /> {item.hecho ? 'Repetir' : item.porcentajeVisto > 0 ? `Seguir ${item.porcentajeVisto}%` : 'Ver clase'}
                </Button>
            ) : item.link ? (
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-medico-blue hover:underline flex-shrink-0"><ExternalLink className="w-4 h-4" /> Unirse</a>
            ) : null}
        </div>
    )
}

// ---------- vista lista (bloque → sección → día) ----------
const VistaLista = ({ items, hoy, cursoId, onMarcar, guardando, navigate }) => {
    const bloques = useMemo(() => {
        const out = []
        items.forEach(i => {
            let b = out.find(x => x.nombre === (i.bloque || 'Sin bloque'))
            if (!b) { b = { nombre: i.bloque || 'Sin bloque', secciones: [] }; out.push(b) }
            let s = b.secciones.find(x => x.nombre === (i.seccion || ''))
            if (!s) { s = { nombre: i.seccion || '', dias: [] }; b.secciones.push(s) }
            let d = s.dias.find(x => x.fecha === i.fecha)
            if (!d) { d = { fecha: i.fecha, items: [] }; s.dias.push(d) }
            d.items.push(i)
        })
        return out
    }, [items])

    if (items.length === 0) return <EmptyState icon={List} title="Sin clases programadas" />
    return (
        <div className="space-y-8">
            {bloques.map(b => {
                const todos = b.secciones.flatMap(s => s.dias.flatMap(d => d.items))
                const hechos = todos.filter(i => i.hecho).length
                return (
                    <section key={b.nombre}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-sans text-lg font-semibold text-gray-900">{b.nombre}</h2>
                            <span className="text-xs text-medico-gray">{hechos}/{todos.length} · {cronogramasService.formatFecha(todos[0].fecha, { day: 'numeric', month: 'short' })} → {cronogramasService.formatFecha(todos[todos.length - 1].fecha, { day: 'numeric', month: 'short' })}</span>
                        </div>
                        <ProgressBar value={todos.length ? (100 * hechos) / todos.length : 0} height="h-1.5" color="bg-medico-green" className="mb-4" />
                        <div className="space-y-5">
                            {b.secciones.map(s => (
                                <Card key={s.nombre || 'x'} className="p-4 md:p-5">
                                    {s.nombre && <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-blue mb-3">{s.nombre}</h3>}
                                    <div className="space-y-4">
                                        {s.dias.map(d => (
                                            <div key={d.fecha} id={`dia-${d.fecha}`} className="grid grid-cols-[76px_1fr] md:grid-cols-[96px_1fr] gap-3">
                                                <div className={`text-center rounded-2xl py-2 self-start ${d.fecha === hoy ? 'bg-medico-blue text-white' : d.fecha < hoy ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-medico-blue'}`}>
                                                    <p className="text-[10px] uppercase tracking-wider">{cronogramasService.formatFecha(d.fecha, { weekday: 'short' })}</p>
                                                    <p className="text-xl font-semibold leading-none">{cronogramasService.aDate(d.fecha).getDate()}</p>
                                                    <p className="text-[10px] uppercase">{cronogramasService.formatFecha(d.fecha, { month: 'short' })}</p>
                                                    {d.fecha === hoy && <p className="text-[10px] font-semibold mt-0.5">HOY</p>}
                                                </div>
                                                <div className="space-y-2 min-w-0">
                                                    {d.items.map(i => <ItemFila key={i.id} item={i} hoy={hoy} cursoId={cursoId} onMarcar={onMarcar} guardando={guardando} navigate={navigate} compacta />)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>
                )
            })}
        </div>
    )
}

// ---------- calendario compacto (siempre visible) ----------
export const Calendario = ({ items, hoy, mes, setMes, diaSel, setDiaSel, cron }) => {
    const porDia = useMemo(() => { const m = {}; items.forEach(i => { (m[i.fecha] = m[i.fecha] || []).push(i) }); return m }, [items])
    if (!mes) return null
    const [y, mo] = mes.split('-').map(Number)
    const primero = new Date(y, mo - 1, 1)
    const offset = (primero.getDay() + 6) % 7
    const diasMes = new Date(y, mo, 0).getDate()
    const celdas = []
    for (let i = 0; i < offset; i++) celdas.push(null)
    for (let d = 1; d <= diasMes; d++) celdas.push(`${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    const cambiarMes = (n) => { const d = new Date(y, mo - 1 + n, 1); setMes(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`) }
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
                <button onClick={() => cambiarMes(-1)} className="p-1.5 rounded-full hover:bg-gray-100"><ChevronLeft className="w-4 h-4" /></button>
                <h3 className="font-sans text-sm font-semibold text-gray-900 capitalize">{primero.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => cambiarMes(1)} className="p-1.5 rounded-full hover:bg-gray-100"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-medico-gray mb-1">{DIAS.map(d => <div key={d}>{d}</div>)}</div>
            <div className="grid grid-cols-7 gap-1">
                {celdas.map((f, i) => {
                    if (!f) return <div key={`v${i}`} />
                    const lista = porDia[f] || []
                    const esHoy = f === hoy
                    const esExamen = f === cron.fechaExamen
                    const hechos = lista.filter(x => x.hecho).length
                    const atras = f < hoy && lista.some(x => !x.hecho && ['clase', 'repaso', 'evaluacion'].includes(x.tipo))
                    const completo = lista.length > 0 && hechos === lista.length
                    let fondo = 'bg-white hover:bg-gray-50'
                    if (esExamen) fondo = 'bg-amber-100 text-amber-900 font-semibold'
                    else if (completo) fondo = 'bg-emerald-50 text-medico-green'
                    else if (atras) fondo = 'bg-orange-50 text-medico-orange'
                    else if (lista.length) fondo = 'bg-blue-50 text-medico-blue'
                    else fondo = 'text-gray-400'
                    return (
                        <button key={f} onClick={() => setDiaSel(f)} title={lista.length ? `${lista.length} clase${lista.length > 1 ? 's' : ''}` : ''}
                                className={`relative aspect-square rounded-lg text-xs flex flex-col items-center justify-center transition-colors ${fondo} ${diaSel === f ? 'ring-2 ring-medico-blue' : ''} ${esHoy ? 'font-bold underline underline-offset-2' : ''}`}>
                            {cronogramasService.aDate(f).getDate()}
                            {lista.length > 0 && !esExamen && (
                                <span className="flex gap-0.5 mt-0.5">
                                    {lista.slice(0, 3).map(x => <span key={x.id} className={`w-1 h-1 rounded-full ${x.hecho ? 'bg-medico-green' : x.modalidad === 'en_vivo' ? 'bg-medico-red' : 'bg-medico-blue'}`} />)}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[10px] text-medico-gray">
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-medico-blue" /> Grabada</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-medico-red" /> En vivo</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-medico-green" /> Vista</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded bg-orange-100 border border-orange-200" /> Atrasada</span>
                <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-200" /> Examen</span>
            </div>
        </Card>
    )
}

export default CronogramaCurso
