// src/cronograma/CronogramaWidgets.jsx - Piezas del cronograma que se insertan en Mis cursos, Mi progreso y /cronograma
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, CheckCircle2, Circle, AlertTriangle, Target, ChevronRight, Radio, Video, PlayCircle } from 'lucide-react'
import Layout from '../utils/Layout'
import cronogramasService from '../services/cronogramas'
import { Card, PageHeader, Button, Pill, ProgressBar, Loading, EmptyState, Ring } from '../simulador/ui'
import { useCached } from '../simulador/useCached'
import { limpiarTitulo } from '../biblioteca/Biblioteca'
import { Calendario, ItemFila } from './CronogramaCurso'

export const useMisCronogramas = () => useCached('cronogramas:mis', () => cronogramasService.getMis())

// ---------- Bloque compacto para la tarjeta de curso (Mis cursos) ----------
export const CronogramaCursoCard = ({ cursoId }) => {
    const navigate = useNavigate()
    const q = useMisCronogramas()
    const entrada = q.data?.cronogramas.find(c => c.cronograma.cursoId === cursoId)
    if (!entrada) return null
    const { resumen, cronograma, deHoy, proximos, atrasados } = entrada
    const siguiente = deHoy.find(i => !i.hecho) || proximos.find(i => !i.hecho) || atrasados[0] || null
    return (
        <button onClick={() => navigate(`/cronograma/${cursoId}`)} className="w-full text-left rounded-2xl border border-blue-100 bg-blue-50/60 p-3 mb-4 hover:bg-blue-50 transition-colors">
            <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-medico-blue"><CalendarDays className="w-4 h-4" /> Cronograma</span>
                <span className="text-[11px] text-medico-gray">{resumen.estado === 'por_iniciar' ? `Empieza ${cronogramasService.formatFecha(cronograma.fechaInicio, { day: 'numeric', month: 'short' })}` : resumen.estado === 'finalizado' ? 'Finalizado' : `Semana ${resumen.semanaActual} de ${resumen.semanasTotal}`}</span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs">
                <span className="text-gray-700">Hoy: <strong>{resumen.hoy}</strong> clase{resumen.hoy !== 1 ? 's' : ''}</span>
                {resumen.atrasados > 0 ? <span className="text-medico-orange font-medium inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {resumen.atrasados} atrasada{resumen.atrasados > 1 ? 's' : ''}</span> : <span className="text-medico-green font-medium inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Al día</span>}
                {resumen.diasParaExamen !== null && resumen.diasParaExamen >= 0 && <span className="text-amber-800 inline-flex items-center gap-1"><Target className="w-3 h-3" /> Examen en {resumen.diasParaExamen} d</span>}
            </div>
            {siguiente && (
                <p className="mt-2 text-xs text-gray-800 truncate"><span className="font-semibold text-medico-blue">Siguiente:</span> {siguiente.titulo} <span className="text-medico-gray">· {siguiente.fecha === q.data.hoy ? 'hoy' : cronogramasService.formatFecha(siguiente.fecha, { weekday: 'short', day: 'numeric', month: 'short' })}</span></p>
            )}
            <ProgressBar value={resumen.porcentaje} height="h-1.5" className="mt-2" color="bg-medico-green" />
        </button>
    )
}

// ---------- Sección para Mi progreso ----------
export const CronogramaProgreso = ({ unaColumna = false, extraPorCurso = {}, conTitulo = true } = {}) => {
    const navigate = useNavigate()
    const q = useMisCronogramas()
    if (q.loading && !q.data) return null
    const lista = q.data?.cronogramas || []
    if (lista.length === 0) return null
    return (
        <section>
            {conTitulo && <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi cronograma</h2>}
            <div className={`grid grid-cols-1 ${unaColumna ? '' : 'xl:grid-cols-2'} gap-4`}>
                {lista.map(({ cronograma: c, resumen: r, deHoy, atrasados, proximos }) => (
                    <Card key={c.id} className="p-5">
                        <div className="flex items-start gap-4">
                            <Ring value={r.alDia} size={72} stroke={8} color={r.alDia >= 80 ? '#059669' : r.alDia >= 50 ? '#ea580c' : '#dc2626'} sub="al día" />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{limpiarTitulo(c.cursoTitulo)}</p>
                                <p className="text-xs text-medico-gray">{c.titulo} · {r.estado === 'en_curso' ? `Semana ${r.semanaActual} de ${r.semanasTotal}` : r.estado === 'por_iniciar' ? `Empieza ${cronogramasService.formatFecha(c.fechaInicio, { day: 'numeric', month: 'short' })}` : 'Finalizado'}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <Pill className="bg-gray-50 text-gray-700 border-gray-100">{r.hechos}/{r.total} vistas</Pill>
                                    {r.atrasados > 0 && <Pill className="bg-orange-50 text-medico-orange border-orange-100"><AlertTriangle className="w-3 h-3" /> {r.atrasados} atrasadas</Pill>}
                                    {r.diasParaExamen !== null && r.diasParaExamen >= 0 && <Pill className="bg-amber-50 text-amber-800 border-amber-100"><Target className="w-3 h-3" /> Examen en {r.diasParaExamen} días</Pill>}
                                </div>
                            </div>
                        </div>
                        <ProgressBar value={r.porcentaje} className="mt-4" color="bg-medico-green" />
                        {(() => {
                            const sig = deHoy.find(i => !i.hecho) || proximos.find(i => !i.hecho) || null
                            return sig ? (
                                <div className="mt-4 flex items-center gap-3 rounded-2xl bg-blue-50 border border-blue-100 p-3">
                                    <span className="w-10 h-10 rounded-xl bg-medico-blue text-white flex items-center justify-center flex-shrink-0">{sig.modalidad === 'en_vivo' ? <Radio className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-medico-blue">{sig.fecha === q.data.hoy ? 'Te toca hoy' : 'Siguiente clase'}</p>
                                        <p className="text-sm font-medium text-gray-900 truncate">{sig.titulo}</p>
                                        <p className="text-[11px] text-medico-gray">{sig.fecha === q.data.hoy ? 'Hoy' : cronogramasService.formatFecha(sig.fecha)}{sig.hora ? ` · ${sig.hora.slice(0, 5)}` : ''}{sig.modalidad === 'en_vivo' ? ' · En vivo' : ''}</p>
                                    </div>
                                    {sig.claseId && <Button size="sm" onClick={() => navigate(`/estudiar/${c.cursoId}?clase=${sig.claseId}`)}>Ver clase</Button>}
                                </div>
                            ) : null
                        })()}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-medico-gray mb-1.5">{deHoy.length ? 'Hoy' : 'Próximas'}</p>
                                <ul className="space-y-1.5">
                                    {(deHoy.length ? deHoy : proximos).slice(0, 4).map(i => <MiniItem key={i.id} item={i} cursoId={c.cursoId} navigate={navigate} conFecha={!deHoy.length} />)}
                                    {!deHoy.length && !proximos.length && <li className="text-xs text-medico-gray">Nada programado próximamente.</li>}
                                </ul>
                            </div>
                            <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-medico-orange mb-1.5">Por ponerte al día</p>
                                <ul className="space-y-1.5">
                                    {atrasados.slice(0, 4).map(i => <MiniItem key={i.id} item={i} cursoId={c.cursoId} navigate={navigate} conFecha />)}
                                    {atrasados.length === 0 && <li className="text-xs text-medico-green inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Vas al día con el cronograma</li>}
                                    {atrasados.length > 4 && <li className="text-xs text-medico-gray">y {atrasados.length - 4} más…</li>}
                                </ul>
                            </div>
                        </div>
                        {extraPorCurso[c.cursoId]}
                        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate(`/cronograma/${c.cursoId}`)}>Ver cronograma completo <ChevronRight className="w-4 h-4" /></Button>
                    </Card>
                ))}
            </div>
        </section>
    )
}

const MiniItem = ({ item, cursoId, navigate, conFecha }) => (
    <li className="flex items-center gap-2 text-sm">
        {item.hecho ? <CheckCircle2 className="w-4 h-4 text-medico-green flex-shrink-0" /> : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
        <span className={`flex-1 min-w-0 truncate ${item.hecho ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {conFecha && <span className="text-[11px] text-medico-gray mr-1">{cronogramasService.formatFecha(item.fecha, { day: 'numeric', month: 'short' })}</span>}{item.titulo}
        </span>
        {item.modalidad === 'en_vivo' ? <Radio className="w-3.5 h-3.5 text-medico-red flex-shrink-0" /> : <Video className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
        {item.claseId && !item.hecho && <button onClick={() => navigate(`/estudiar/${cursoId}?clase=${item.claseId}`)} className="text-medico-blue hover:underline text-xs font-medium inline-flex items-center gap-0.5 flex-shrink-0"><PlayCircle className="w-3.5 h-3.5" /> Ver</button>}
    </li>
)

// ---------- Estado del calendario de un curso (items, mes, día seleccionado, marcar) ----------
const useCalendarioCurso = (cursoId) => {
    const q = useCached(cursoId ? `cronograma:${cursoId}` : null, () => cronogramasService.getPorCurso(cursoId))
    const [items, setItems] = useState([])
    const [mes, setMes] = useState(null)
    const [diaSel, setDiaSel] = useState(null)
    const [guardando, setGuardando] = useState(null)
    const data = q.data
    const hoy = data?.hoy || cronogramasService.hoyLocal()
    useEffect(() => { if (data?.items) setItems(data.items) }, [data])
    useEffect(() => {
        if (!data?.cronograma || mes) return
        const c = data.cronograma
        const base = hoy >= (c.fechaInicio || hoy) && hoy <= (c.fechaFin || hoy) ? hoy : (c.fechaInicio || hoy)
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
    return { cron: data?.cronograma || null, items, hoy, mes, setMes, diaSel, setDiaSel, marcar, guardando }
}

// Clases del día seleccionado (se incrusta dentro de la tarjeta del curso)
const DiaSeleccionado = ({ cal, cursoId }) => {
    const navigate = useNavigate()
    if (!cal.cron || !cal.diaSel) return null
    const delDia = cal.items.filter(i => i.fecha === cal.diaSel)
    return (
        <div className="mt-4 rounded-2xl border border-gray-100 p-3">
            <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">{cal.diaSel === cal.hoy ? 'Hoy' : 'Día seleccionado'}</p>
                <span className="text-xs font-medium text-gray-700 capitalize">{cronogramasService.formatFechaLarga(cal.diaSel)}</span>
            </div>
            <div className="space-y-2">
                {delDia.length === 0 && <p className="text-sm text-medico-gray">{cal.diaSel === cal.cron.fechaExamen ? (cal.cron.examenEtiqueta || 'Día del examen') : 'Sin clases programadas este día.'}</p>}
                {delDia.map(i => <ItemFila key={i.id} item={i} hoy={cal.hoy} cursoId={cursoId} onMarcar={cal.marcar} guardando={cal.guardando} navigate={navigate} compacta />)}
            </div>
        </div>
    )
}

// ---------- /cronograma: índice de mis cronogramas ----------
export const CronogramaIndex = () => {
    const q = useMisCronogramas()
    const primerCurso = q.data?.cronogramas[0]?.cronograma.cursoId || null
    const cal = useCalendarioCurso(primerCurso)
    if (q.loading && !q.data) return <Layout showSidebar><Loading text="Cargando cronogramas…" /></Layout>
    const lista = q.data?.cronogramas || []
    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <PageHeader eyebrow="Mi aprendizaje" title="Mi cronograma" subtitle="Tu guía día a día: qué clase ver, cuándo hay sesión en vivo y cuánto falta para el examen." />
                {lista.length === 0 && <EmptyState icon={CalendarDays} title="Aún no tienes cronogramas" description="Cuando tu curso publique su cronograma aparecerá aquí." action={<Button to="/mis-cursos">Ver mis cursos</Button>} />}
                {lista.length > 0 && (
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
                        <div><CronogramaProgreso unaColumna conTitulo={false} extraPorCurso={primerCurso ? { [primerCurso]: <DiaSeleccionado cal={cal} cursoId={primerCurso} /> } : {}} /></div>
                        {cal.cron && (
                            <div className="xl:sticky xl:top-24">
                                <Calendario items={cal.items} hoy={cal.hoy} mes={cal.mes} setMes={cal.setMes} diaSel={cal.diaSel} setDiaSel={cal.setDiaSel} cron={cal.cron} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    )
}
