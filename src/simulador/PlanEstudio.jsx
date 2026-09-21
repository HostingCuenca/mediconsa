// src/simulador/PlanEstudio.jsx - Mi plan de estudio: metas (examen, ritmo semanal), lista "para hoy",
// objetivos con progreso automático (área, manual, clase, preguntas) y tareas libres.
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    Target, CalendarDays, CheckCircle2, Circle, Trash2, Plus, Sparkles, BookOpen, Video, Dumbbell, Flame, ClipboardList,
    AlertTriangle, RotateCcw, ChevronRight, Pencil, X, Check, Settings2, GraduationCap
} from 'lucide-react'
import Layout from '../utils/Layout'
import simuladorService from '../services/simulador'
import { Card, PageHeader, Button, Pill, ProgressBar, Loading, EmptyState, Alert, SegmentedControl, Ring } from './ui'
import { useCached, invalidarCache } from './useCached'
import { limpiarTitulo } from '../biblioteca/Biblioteca'

const CARRERA_KEY = 'simulador_carrera'
const TIPOS = {
    tarea: { label: 'Tarea', icon: ClipboardList, tint: 'bg-gray-100 text-gray-700' },
    area: { label: 'Dominar área', icon: Dumbbell, tint: 'bg-blue-50 text-medico-blue' },
    material: { label: 'Leer manual', icon: BookOpen, tint: 'bg-amber-50 text-amber-700' },
    clase: { label: 'Ver clase', icon: Video, tint: 'bg-emerald-50 text-medico-green' },
    preguntas: { label: 'Preguntas', icon: Target, tint: 'bg-purple-50 text-purple-700' }
}
const input = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medico-blue focus:border-transparent'
const fmt = (iso, o = { weekday: 'short', day: 'numeric', month: 'short' }) => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('es-EC', o) }

const PlanEstudio = () => {
    const navigate = useNavigate()
    const [carrera, setCarrera] = useState(localStorage.getItem(CARRERA_KEY) || '')
    const carrerasQ = useCached('carreras', () => simuladorService.getCarreras())
    const carreras = useMemo(() => carrerasQ.data?.carreras || [], [carrerasQ.data])
    useEffect(() => { if (carreras.length && !carreras.find(c => c.carrera === carrera)) setCarrera(carreras[0].carrera) }, [carreras, carrera])
    useEffect(() => { if (carrera) localStorage.setItem(CARRERA_KEY, carrera) }, [carrera])

    const q = useCached(carrera ? `plan:${carrera}` : null, () => simuladorService.getPlan(carrera))
    const plan = q.data
    const [error, setError] = useState('')
    const [ok, setOk] = useState('')
    const [metasForm, setMetasForm] = useState(null)
    const [nuevo, setNuevo] = useState(null)   // { tipo, refId, titulo, descripcion, metaValor, fechaLimite }
    const [editando, setEditando] = useState(null)
    const [ocupado, setOcupado] = useState('')
    useEffect(() => { if (ok) { const t = setTimeout(() => setOk(''), 2500); return () => clearTimeout(t) } return undefined }, [ok])

    const recargar = () => { invalidarCache(`plan:${carrera}`); q.refresh() }
    const setObjetivos = (fn) => q.setData(d => d ? { ...d, objetivos: fn(d.objetivos) } : d)

    const guardarMetas = async () => {
        setOcupado('metas')
        const r = await simuladorService.actualizarMetas({ carrera, ...metasForm })
        setOcupado('')
        if (r.success) { setMetasForm(null); setOk('Metas guardadas'); recargar() } else setError(r.error)
    }
    const marcar = async (o, hecho) => {
        setObjetivos(list => list.map(x => x.id === o.id ? { ...x, hecho, progreso: hecho ? 100 : x.progreso } : x))
        const r = await simuladorService.actualizarObjetivo(o.id, { hecho })
        if (!r.success) { setError(r.error); recargar() } else invalidarCache(`plan:${carrera}`)
    }
    const eliminar = async (o) => {
        setObjetivos(list => list.filter(x => x.id !== o.id))
        const r = await simuladorService.eliminarObjetivo(o.id)
        if (!r.success) { setError(r.error); recargar() } else invalidarCache(`plan:${carrera}`)
    }
    const crear = async () => {
        if (!nuevo?.titulo?.trim()) return
        setOcupado('crear')
        const r = await simuladorService.crearObjetivo({ carrera, ...nuevo })
        setOcupado('')
        if (r.success) { setNuevo(null); setOk('Objetivo añadido'); recargar() } else setError(r.error)
    }
    const guardarEdicion = async () => {
        setOcupado('editar')
        const r = await simuladorService.actualizarObjetivo(editando.id, { titulo: editando.titulo, descripcion: editando.descripcion, fechaLimite: editando.fechaLimite || null })
        setOcupado('')
        if (r.success) { setObjetivos(list => list.map(x => x.id === editando.id ? { ...x, ...r.data.objetivo, progreso: x.progreso } : x)); setEditando(null) } else setError(r.error)
    }
    const adoptarSugerencia = async (s) => {
        setOcupado(s.titulo)
        const r = await simuladorService.crearObjetivo({ carrera, tipo: s.tipo, refId: s.refId, titulo: s.titulo, descripcion: s.descripcion, metaValor: s.metaValor, origen: 'sugerido' })
        setOcupado('')
        if (r.success) recargar(); else setError(r.error)
    }
    const generar = async () => {
        setOcupado('generar')
        const r = await simuladorService.generarPlan(carrera)
        setOcupado('')
        if (r.success) { setOk(`${r.data.creados} objetivos añadidos a tu plan`); recargar() } else setError(r.error)
    }
    const entrenarArea = async (areaId) => {
        setOcupado(`area-${areaId}`)
        const r = await simuladorService.entrenarArea(areaId, carrera)
        setOcupado('')
        if (r.success) { invalidarCache(); navigate(`/simulador/sesion/${r.data.sesion.id}`) } else setError(r.error)
    }
    const repasarErrores = async () => {
        setOcupado('errores')
        const r = await simuladorService.crearSesion({ carrera, modo: 'practica', origen: 'errores', numPreguntas: 20 })
        setOcupado('')
        if (r.success) { invalidarCache(); navigate(`/simulador/sesion/${r.data.sesion.id}`) } else setError(r.error)
    }

    if ((carrerasQ.loading || (carrera && q.loading)) && !plan) return <Layout showSidebar><Loading text="Preparando tu plan…" /></Layout>
    if (!carrerasQ.loading && carreras.length === 0) return <Layout showSidebar><div className="p-6 md:p-8"><EmptyState icon={Target} title="Aún no tienes un plan" description="Necesitas estar habilitado en un curso." action={<Button to="/mis-cursos">Ver mis cursos</Button>} /></div></Layout>
    if (!plan) return <Layout showSidebar><Loading /></Layout>

    const pendientes = plan.objetivos.filter(o => !o.hecho)
    const hechos = plan.objetivos.filter(o => o.hecho)
    const ph = plan.paraHoy
    const pctSemanaPreg = Math.min(100, Math.round((100 * plan.semana.preguntas) / Math.max(1, plan.semana.metaPreguntas)))
    const pctSemanaLect = Math.min(100, Math.round((100 * plan.semana.minutosLectura) / Math.max(1, plan.semana.metaMinutos)))

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <PageHeader eyebrow="Entrenador CACES" title="Mi plan de estudio"
                            subtitle="Tus metas, lo que toca hoy y los objetivos que te acercan al examen. El progreso se actualiza solo con lo que haces en la plataforma."
                            actions={<>
                                {carreras.length > 1 && <SegmentedControl value={carrera} onChange={setCarrera} options={carreras.map(c => ({ value: c.carrera, label: c.label }))} />}
                                <Button variant="secondary" onClick={() => setMetasForm({ fechaExamen: plan.metas.fechaExamen || '', preguntasSemana: plan.metas.preguntasSemana, minutosLecturaSemana: plan.metas.minutosLecturaSemana })}><Settings2 className="w-4 h-4" /> Metas</Button>
                            </>} />
                {/* Cursos a los que está atado este plan */}
                {(() => {
                    const cur = carreras.find(c => c.carrera === carrera)
                    const cursos = cur?.cursos || []
                    if (!cursos.length) return null
                    return (
                        <div className="flex flex-wrap items-center gap-2 mb-6 -mt-2">
                            <span className="text-xs font-semibold uppercase tracking-wide text-medico-gray">Plan de</span>
                            {cursos.map(c => (
                                <Link key={c.id} to={`/estudiar/${c.id}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-800 hover:border-medico-blue hover:text-medico-blue transition-colors">
                                    <GraduationCap className="w-3.5 h-3.5 text-medico-blue" />{limpiarTitulo(c.titulo)}
                                </Link>
                            ))}
                        </div>
                    )
                })()}
                {error && <Alert tone="error" className="mb-4"><div className="flex justify-between"><span>{error}</span><button onClick={() => setError('')}><X className="w-4 h-4" /></button></div></Alert>}
                {ok && <Alert tone="ok" className="mb-4">{ok}</Alert>}

                {/* ===== Metas ===== */}
                {metasForm && (
                    <Card className="p-5 mb-6 border-medico-blue/40">
                        <h2 className="font-sans text-base font-semibold text-gray-900 mb-3">Mis metas</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Fecha del examen</label><input type="date" value={metasForm.fechaExamen} onChange={e => setMetasForm(m => ({ ...m, fechaExamen: e.target.value }))} className={input} /></div>
                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Preguntas por semana</label><input type="number" min={10} max={2000} value={metasForm.preguntasSemana} onChange={e => setMetasForm(m => ({ ...m, preguntasSemana: e.target.value }))} className={input} /></div>
                            <div><label className="block text-xs font-semibold text-gray-700 mb-1">Minutos de lectura por semana</label><input type="number" min={0} max={3000} value={metasForm.minutosLecturaSemana} onChange={e => setMetasForm(m => ({ ...m, minutosLecturaSemana: e.target.value }))} className={input} /></div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4"><Button variant="ghost" onClick={() => setMetasForm(null)}>Cancelar</Button><Button onClick={guardarMetas} loading={ocupado === 'metas'}><Check className="w-4 h-4" /> Guardar metas</Button></div>
                    </Card>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card tint="bg-gradient-to-br from-medico-blue to-blue-900" className="border-blue-900 p-5 text-white">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">Examen CACES</p>
                        {plan.examen ? (
                            <>
                                <p className="text-4xl font-semibold mt-1 leading-none">{Math.max(0, plan.examen.dias)}<span className="text-base font-normal text-blue-200"> días</span></p>
                                <p className="text-sm text-blue-100 mt-1 capitalize">{fmt(plan.examen.fecha, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                <p className="text-xs text-blue-200 mt-3">Preparación estimada: <strong className="text-white">{ph.preparacion}%</strong> del mapa de dominio</p>
                            </>
                        ) : <><p className="text-sm text-blue-100 mt-2">Ponle fecha al examen para que el plan cuente los días.</p><button onClick={() => setMetasForm({ fechaExamen: '', preguntasSemana: plan.metas.preguntasSemana, minutosLecturaSemana: plan.metas.minutosLecturaSemana })} className="mt-3 text-sm font-semibold underline">Definir fecha</button></>}
                    </Card>
                    <Card className="p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">Esta semana · preguntas</p>
                        <div className="flex items-center gap-4 mt-2">
                            <Ring value={pctSemanaPreg} size={72} stroke={8} color={pctSemanaPreg >= 100 ? '#059669' : '#1e40af'} />
                            <div><p className="text-2xl font-semibold text-gray-900 leading-none">{plan.semana.preguntas}<span className="text-sm text-medico-gray font-normal"> / {plan.semana.metaPreguntas}</span></p><p className="text-xs text-medico-gray mt-1">{plan.semana.diasActivos} día{plan.semana.diasActivos !== 1 ? 's' : ''} activo{plan.semana.diasActivos !== 1 ? 's' : ''} esta semana</p></div>
                        </div>
                    </Card>
                    <Card className="p-5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">Esta semana · lectura</p>
                        <div className="flex items-center gap-4 mt-2">
                            <Ring value={pctSemanaLect} size={72} stroke={8} color={pctSemanaLect >= 100 ? '#059669' : '#d97706'} />
                            <div><p className="text-2xl font-semibold text-gray-900 leading-none">{plan.semana.minutosLectura}<span className="text-sm text-medico-gray font-normal"> / {plan.semana.metaMinutos} min</span></p><p className="text-xs text-medico-gray mt-1">en la Biblioteca</p></div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-6 items-start">
                    {/* ===== Objetivos ===== */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-sans text-xl font-semibold text-gray-900">Objetivos</h2>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" onClick={generar} loading={ocupado === 'generar'} disabled={!plan.sugerencias.length}><Sparkles className="w-4 h-4" /> Plan sugerido</Button>
                                <Button size="sm" onClick={() => { setEditando(null); setNuevo({ tipo: 'tarea', refId: '', titulo: '', descripcion: '', metaValor: 100, fechaLimite: '' }) }}><Plus className="w-4 h-4" /> Añadir</Button>
                            </div>
                        </div>

                        {nuevo && (
                            <Card className="p-4 mb-4 border-medico-blue/40">
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {Object.entries(TIPOS).map(([k, t]) => (
                                        <button key={k} onClick={() => setNuevo(n => ({ ...n, tipo: k, refId: '', titulo: k === 'preguntas' ? `Responder ${n.metaValor || 100} preguntas` : '' }))} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${nuevo.tipo === k ? 'bg-medico-blue text-white border-medico-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}><t.icon className="w-4 h-4" /> {t.label}</button>
                                    ))}
                                </div>
                                {nuevo.tipo === 'area' && (
                                    <select value={nuevo.refId} onChange={e => { const a = plan.opciones.areas.find(x => String(x.id) === e.target.value); setNuevo(n => ({ ...n, refId: e.target.value, titulo: a ? `Dominar ${a.nombre}` : '' })) }} className={`${input} mb-3`}>
                                        <option value="">Elige la especialidad…</option>
                                        {plan.opciones.areas.map(a => <option key={a.id} value={a.id}>{a.nombre} · {simuladorService.NIVELES[a.nivel]?.label}</option>)}
                                    </select>
                                )}
                                {nuevo.tipo === 'preguntas' && (
                                    <div className="flex items-center gap-2 mb-3 text-sm"><span>Meta:</span><input type="number" min={10} max={5000} value={nuevo.metaValor} onChange={e => setNuevo(n => ({ ...n, metaValor: e.target.value, titulo: `Responder ${e.target.value} preguntas` }))} className={`${input} w-28`} /><span>preguntas desde hoy</span></div>
                                )}
                                {(nuevo.tipo === 'material' || nuevo.tipo === 'clase') && <p className="text-xs text-medico-gray mb-2">Consejo: los objetivos de manuales y clases se añaden mejor desde el <button className="underline" onClick={generar}>plan sugerido</button>, que ya los vincula con tu progreso. Aquí puedes anotarlo como tarea.</p>}
                                <input value={nuevo.titulo} onChange={e => setNuevo(n => ({ ...n, titulo: e.target.value }))} placeholder="¿Qué quieres lograr?" className={`${input} mb-2`} />
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-2">
                                    <input value={nuevo.descripcion} onChange={e => setNuevo(n => ({ ...n, descripcion: e.target.value }))} placeholder="Detalle (opcional)" className={input} />
                                    <input type="date" value={nuevo.fechaLimite} onChange={e => setNuevo(n => ({ ...n, fechaLimite: e.target.value }))} className={input} title="Fecha límite" />
                                </div>
                                <div className="flex justify-end gap-2 mt-3"><Button variant="ghost" size="sm" onClick={() => setNuevo(null)}>Cancelar</Button><Button size="sm" onClick={crear} loading={ocupado === 'crear'} disabled={!nuevo.titulo.trim() || (nuevo.tipo === 'area' && !nuevo.refId)}><Check className="w-4 h-4" /> Añadir objetivo</Button></div>
                            </Card>
                        )}

                        {pendientes.length === 0 && !nuevo && (
                            <Card className="p-8 text-center mb-4">
                                <Target className="w-10 h-10 text-medico-blue mx-auto mb-2" />
                                <p className="font-semibold text-gray-900">Todavía no tienes objetivos</p>
                                <p className="text-sm text-medico-gray mt-1">Adopta las sugerencias de abajo una por una, genera el plan completo o añade el tuyo.</p>
                                {plan.sugerencias.length > 0 && <Button className="mt-4" onClick={generar} loading={ocupado === 'generar'}><Sparkles className="w-4 h-4" /> Generar plan sugerido</Button>}
                            </Card>
                        )}
                        <div className="space-y-3">
                            {pendientes.map(o => <ObjetivoCard key={o.id} o={o} hoy={plan.hoy} editando={editando} setEditando={setEditando} guardarEdicion={guardarEdicion} onMarcar={marcar} onEliminar={eliminar} onEntrenar={entrenarArea} ocupado={ocupado} navigate={navigate} />)}
                        </div>
                        {hechos.length > 0 && (
                            <details className="mt-6">
                                <summary className="cursor-pointer text-sm font-semibold text-medico-gray">Cumplidos ({hechos.length})</summary>
                                <div className="space-y-2 mt-3">{hechos.map(o => <ObjetivoCard key={o.id} o={o} hoy={plan.hoy} onMarcar={marcar} onEliminar={eliminar} navigate={navigate} />)}</div>
                            </details>
                        )}

                        {plan.sugerencias.length > 0 && (
                            <div className={pendientes.length > 0 ? 'mt-8' : 'mt-2'}>
                                <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-medico-gray mb-1">El entrenador te sugiere</h3>
                                <p className="text-xs text-medico-gray mb-3">Según tu mapa de dominio: qué estudiar y qué repasar. Toca una para añadirla como objetivo.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {plan.sugerencias.map((s, i) => {
                                        const T = TIPOS[s.tipo]
                                        return (
                                            <button key={i} onClick={() => adoptarSugerencia(s)} disabled={!!ocupado} className="text-left flex items-start gap-3 p-3 rounded-2xl border border-dashed border-gray-300 hover:border-medico-blue hover:bg-blue-50/40 transition-colors disabled:opacity-50">
                                                <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${T.tint}`}><T.icon className="w-4 h-4" /></span>
                                                <span className="min-w-0"><span className="block text-sm font-medium text-gray-900">{limpiarTitulo(s.titulo)}</span>{s.descripcion && <span className="block text-xs text-medico-gray">{s.descripcion}</span>}</span>
                                                <Plus className="w-4 h-4 text-gray-400 ml-auto flex-shrink-0" />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ===== Para hoy ===== */}
                    <Card className="p-5 xl:sticky xl:top-24">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-sans text-base font-semibold text-gray-900 inline-flex items-center gap-2"><CalendarDays className="w-5 h-5 text-medico-blue" /> Para hoy</h2>
                            <span className="text-xs text-medico-gray capitalize">{fmt(plan.hoy, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                        </div>
                        <ul className="space-y-2">
                            <TareaHoy icon={RotateCcw} tint={ph.repasosVencidos > 0 ? 'bg-orange-50 text-medico-orange' : 'bg-emerald-50 text-medico-green'} titulo={ph.repasosVencidos > 0 ? `${ph.repasosVencidos} repasos vencidos` : 'Sin repasos vencidos'} sub={ph.erroresConcepto > 0 ? `${ph.erroresConcepto} son errores de concepto` : 'La repetición espaciada está al día'} hecho={ph.repasosVencidos === 0}
                                      accion={ph.repasosVencidos > 0 && <Button size="sm" onClick={repasarErrores} loading={ocupado === 'errores'}>Repasar</Button>} />
                            {ph.clasesHoy.map(c => <TareaHoy key={c.id} icon={Video} tint="bg-blue-50 text-medico-blue" titulo={c.titulo} sub={c.modalidad === 'en_vivo' ? 'Clase en vivo hoy' : 'Clase de hoy en tu cronograma'} hecho={c.hecho}
                                                            accion={!c.hecho && c.claseId && <Button size="sm" onClick={() => navigate(`/estudiar/${c.cursoId}?clase=${c.claseId}`)}>Ver</Button>} />)}
                            {ph.clasesAtrasadas.length > 0 && <TareaHoy icon={AlertTriangle} tint="bg-orange-50 text-medico-orange" titulo={`${ph.totalAtrasadas} clase${ph.totalAtrasadas > 1 ? 's' : ''} atrasada${ph.totalAtrasadas > 1 ? 's' : ''}`} sub={ph.clasesAtrasadas[0].titulo}
                                                                         accion={<Button size="sm" variant="secondary" onClick={() => navigate(ph.clasesAtrasadas[0].claseId ? `/estudiar/${ph.clasesAtrasadas[0].cursoId}?clase=${ph.clasesAtrasadas[0].claseId}` : `/cronograma/${ph.clasesAtrasadas[0].cursoId}`)}>Ponerme al día</Button>} />}
                            {ph.lecturasEnCurso.slice(0, 2).map(l => <TareaHoy key={l.materialId} icon={BookOpen} tint="bg-amber-50 text-amber-700" titulo={limpiarTitulo(l.titulo)} sub={`Página ${l.pagina}${l.total ? ` de ${l.total}` : ''} · ${l.porcentaje}%`}
                                                                             accion={<Button size="sm" variant="secondary" onClick={() => navigate(`/biblioteca/leer/${l.materialId}`)}>Seguir</Button>} />)}
                            {ph.tareasHoy.map(t => <TareaHoy key={t.id} icon={ClipboardList} tint="bg-gray-100 text-gray-700" titulo={t.titulo} sub={t.fechaLimite < plan.hoy ? `Vencía el ${fmt(t.fechaLimite)}` : 'Vence hoy'} hecho={t.hecho}
                                                              accion={<button onClick={() => marcar(t, true)} className="text-medico-green hover:bg-emerald-50 p-1.5 rounded-full" title="Marcar hecha"><CheckCircle2 className="w-5 h-5" /></button>} />)}
                            <TareaHoy icon={Flame} tint="bg-blue-50 text-medico-blue" titulo="Sesión de hoy del entrenador" sub="Mantén la racha con tu meta diaria" accion={<Button size="sm" variant="secondary" onClick={() => navigate('/simulador')}>Ir <ChevronRight className="w-4 h-4" /></Button>} />
                        </ul>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}

const TareaHoy = ({ icon: Icon, tint, titulo, sub, hecho, accion }) => (
    <li className={`flex items-center gap-3 p-2.5 rounded-2xl border ${hecho ? 'border-emerald-100 bg-emerald-50/40' : 'border-gray-100'}`}>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${hecho ? 'bg-emerald-50 text-medico-green' : tint}`}>{hecho ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}</span>
        <span className="flex-1 min-w-0"><span className={`block text-sm font-medium truncate ${hecho ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{titulo}</span>{sub && <span className="block text-[11px] text-medico-gray truncate">{sub}</span>}</span>
        {!hecho && accion}
    </li>
)

const ObjetivoCard = ({ o, hoy, editando, setEditando, guardarEdicion, onMarcar, onEliminar, onEntrenar, ocupado, navigate }) => {
    const T = TIPOS[o.tipo] || TIPOS.tarea
    const vencido = !o.hecho && o.fechaLimite && o.fechaLimite < hoy
    const enEdicion = editando?.id === o.id
    return (
        <Card className={`p-4 ${o.hecho ? 'opacity-70' : ''}`}>
            <div className="flex items-start gap-3">
                <button onClick={() => onMarcar(o, !o.hecho)} className={`mt-0.5 flex-shrink-0 ${o.hecho ? 'text-medico-green' : 'text-gray-300 hover:text-medico-blue'}`} title={o.hecho ? 'Desmarcar' : 'Marcar cumplido'}>{o.hecho ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}</button>
                <div className="flex-1 min-w-0">
                    {enEdicion ? (
                        <div className="space-y-2">
                            <input value={editando.titulo} onChange={e => setEditando(x => ({ ...x, titulo: e.target.value }))} className={input} />
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_180px] gap-2"><input value={editando.descripcion || ''} onChange={e => setEditando(x => ({ ...x, descripcion: e.target.value }))} placeholder="Detalle" className={input} /><input type="date" value={editando.fechaLimite || ''} onChange={e => setEditando(x => ({ ...x, fechaLimite: e.target.value }))} className={input} /></div>
                            <div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => setEditando(null)}>Cancelar</Button><Button size="sm" onClick={guardarEdicion} loading={ocupado === 'editar'}>Guardar</Button></div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap items-center gap-2">
                                <Pill className={`${T.tint} border-transparent`}><T.icon className="w-3 h-3" /> {T.label}</Pill>
                                {o.origen === 'sugerido' && <Pill className="bg-blue-50 text-medico-blue border-blue-100"><Sparkles className="w-3 h-3" /> Sugerido</Pill>}
                                {o.fechaLimite && <Pill className={vencido ? 'bg-red-50 text-medico-red border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100'}><CalendarDays className="w-3 h-3" /> {vencido ? 'Venció ' : ''}{fmt(o.fechaLimite)}</Pill>}
                            </div>
                            <p className={`font-medium text-gray-900 mt-1.5 ${o.hecho ? 'line-through text-gray-500' : ''}`}>{limpiarTitulo(o.titulo)}</p>
                            {o.descripcion && <p className="text-sm text-medico-gray mt-0.5">{o.descripcion}</p>}
                            {o.tipo !== 'tarea' && (
                                <div className="flex items-center gap-3 mt-2">
                                    <ProgressBar value={o.progreso} className="flex-1" color={o.progreso >= 100 ? 'bg-medico-green' : 'bg-medico-blue'} />
                                    <span className="text-xs font-semibold text-gray-700 w-10 text-right">{o.progreso}%</span>
                                </div>
                            )}
                            {o.detalle?.nivel && <p className="text-[11px] text-medico-gray mt-1">Nivel: {simuladorService.NIVELES[o.detalle.nivel]?.label}{o.detalle.acierto !== null ? ` · ${o.detalle.acierto}% de acierto reciente` : ''}{o.detalle.vencidas ? ` · ${o.detalle.vencidas} repasos vencidos` : ''}</p>}
                            {o.detalle?.respondidas !== undefined && <p className="text-[11px] text-medico-gray mt-1">{o.detalle.respondidas} de {o.detalle.meta} preguntas desde que lo creaste</p>}
                        </>
                    )}
                </div>
                {!enEdicion && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        {!o.hecho && o.tipo === 'area' && onEntrenar && <Button size="sm" onClick={() => onEntrenar(o.refId)} loading={ocupado === `area-${o.refId}`}><Dumbbell className="w-4 h-4" /> Entrenar</Button>}
                        {!o.hecho && o.tipo === 'material' && <Button size="sm" variant="secondary" onClick={() => navigate(`/biblioteca/leer/${o.refId}`)}><BookOpen className="w-4 h-4" /> Leer</Button>}
                        {setEditando && !o.hecho && <button onClick={() => setEditando({ id: o.id, titulo: o.titulo, descripcion: o.descripcion, fechaLimite: o.fechaLimite })} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500" title="Editar"><Pencil className="w-4 h-4" /></button>}
                        <button onClick={() => onEliminar(o)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-500 hover:text-medico-red" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        </Card>
    )
}

export default PlanEstudio
