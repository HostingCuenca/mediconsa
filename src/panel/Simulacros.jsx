// src/panel/Simulacros.jsx — Simulacros del alumno (legacy): disponibles por curso y mis intentos.
// Carga todo en paralelo (antes iba curso por curso y la pestaña "Mis intentos" mostraba 0 hasta abrirla),
// cada intento abre su resultado, y las tarjetas están pensadas para celular.
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ClipboardList, Clock, Trophy, RotateCcw, Play, ChevronRight, BookOpen, ListChecks, Lock, ArrowRight, Target } from 'lucide-react'
import Layout from '../utils/Layout'
import { PageHeader, SegmentedControl, EmptyState, Loading, Pill } from '../simulador/ui'
import { useAuth } from '../utils/AuthContext'
import simulacrosService from '../services/simulacros'
import enrollmentsService from '../services/enrollments'
import { limpiarTitulo } from '../biblioteca/Biblioteca'

const MODOS = {
    estudio: { label: 'Estudio', cls: 'bg-emerald-100 text-emerald-800' }, practica: { label: 'Práctica', cls: 'bg-emerald-100 text-emerald-800' },
    revision: { label: 'Revisión', cls: 'bg-blue-100 text-blue-800' }, realista: { label: 'Realista', cls: 'bg-amber-100 text-amber-800' },
    evaluacion: { label: 'Evaluación', cls: 'bg-amber-100 text-amber-800' }, examen_real: { label: 'Examen oficial', cls: 'bg-red-100 text-red-800' }, examen: { label: 'Examen oficial', cls: 'bg-red-100 text-red-800' }
}
const TIPOS = { examen: 'Examen real', especialidad: 'Por especialidad', general: 'General', demo: 'Demo' }
const DIF_CLS = { Baja: 'bg-emerald-50 text-emerald-700', Media: 'bg-amber-50 text-amber-700', 'Media-alta': 'bg-orange-50 text-orange-700', Alta: 'bg-red-50 text-red-700' }
const colorPuntaje = (p) => p >= 80 ? 'text-medico-green' : p >= 70 ? 'text-medico-blue' : p >= 60 ? 'text-medico-orange' : 'text-medico-red'
const fecha = (d) => new Date(d).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' })

const Simulacros = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [simulacros, setSimulacros] = useState([])
    const [intentos, setIntentos] = useState([])
    const [tab, setTab] = useState('disponibles')
    const [curso, setCurso] = useState('todos')
    const [filtro, setFiltro] = useState({ anio: '', dificultad: '', tipo: '' })
    const [errores, setErrores] = useState(null)   // { total, simulacros, porCurso }

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return }
        let vivo = true
        ;(async () => {
            try {
                const [ins, att, err] = await Promise.all([enrollmentsService.getMyEnrollments(), simulacrosService.getMyAttempts(), simulacrosService.getMisErrores()])
                if (err.success) setErrores(err.data)
                const cursos = (ins.success ? ins.data.inscripciones || [] : []).filter(c => c.estado_pago === 'habilitado' || c.es_gratuito)
                const porCurso = await Promise.all(cursos.map(c => simulacrosService.getSimulacrosByCourse(c.curso_id).then(r => r.success ? r.data.simulacros.map(s => ({
                    ...s, curso_id: c.curso_id, curso_titulo: c.titulo, intentos_realizados: s.mis_intentos || 0,
                    modo: simulacrosService.getModoUnificado(s), tiempo: simulacrosService.formatTiempoSimulacro(s),
                    meta: simulacrosService.extraerMeta(s.titulo)
                })) : [])))
                if (!vivo) return
                setSimulacros(porCurso.flat())
                setIntentos(att.success ? att.data.intentos || [] : [])
            } catch (e) { console.error('simulacros:', e) }
            finally { if (vivo) setLoading(false) }
        })()
        return () => { vivo = false }
    }, [isAuthenticated, navigate])

    const cursos = useMemo(() => [...new Map(simulacros.map(s => [s.curso_id, s.curso_titulo])).entries()], [simulacros])
    const opciones = useMemo(() => ({
        anio: [...new Set(simulacros.map(s => s.meta.anio).filter(Boolean))].sort().reverse(),
        dificultad: ['Baja', 'Media', 'Media-alta', 'Alta'].filter(d => simulacros.some(s => s.meta.dificultad === d)),
        tipo: Object.keys(TIPOS).filter(t => simulacros.some(s => s.meta.tipo === t))
    }), [simulacros])
    const hayFiltros = opciones.anio.length > 0 || opciones.dificultad.length > 0 || opciones.tipo.length > 1
    const lista = simulacros.filter(s => (curso === 'todos' || s.curso_id === curso)
        && (!filtro.anio || s.meta.anio === filtro.anio)
        && (!filtro.dificultad || s.meta.dificultad === filtro.dificultad)
        && (!filtro.tipo || s.meta.tipo === filtro.tipo))
    const Chip = ({ activo, onClick, children }) => (
        <button onClick={onClick} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${activo ? 'bg-medico-blue text-white border-medico-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>{children}</button>
    )
    const puedeIniciar = (s) => s.intentos_permitidos === -1 || !s.intentos_permitidos || (s.intentos_realizados || 0) < s.intentos_permitidos

    if (loading) return <Layout showSidebar><Loading text="Cargando simulacros…" /></Layout>

    return (
        <Layout showSidebar>
            <div className="p-4 sm:p-6 md:p-8">
                <PageHeader eyebrow="Mi aprendizaje" title="Simulacros" subtitle={`${simulacros.length} disponibles · ${intentos.length} intentos realizados`}
                            actions={<SegmentedControl value={tab} onChange={setTab} options={[{ value: 'disponibles', label: `Disponibles (${simulacros.length})` }, { value: 'intentos', label: `Mis intentos (${intentos.length})` }]} />} />

                {/* Repaso de errores: las preguntas que fallaste en tus simulacros, hasta que las aciertes */}
                {errores && (
                    <div className={`rounded-2xl border p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4 ${errores.total > 0 ? 'bg-gradient-to-r from-medico-blue to-blue-900 text-white border-transparent' : 'bg-white border-gray-100'}`}>
                        <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${errores.total > 0 ? 'bg-white/15' : 'bg-emerald-50 text-medico-green'}`}><Target className="w-6 h-6" /></span>
                        <div className="flex-1 min-w-0">
                            <p className={`font-semibold ${errores.total > 0 ? '' : 'text-gray-900'}`}>{errores.total > 0 ? `Repasar mis errores · ${errores.total} pregunta${errores.total === 1 ? '' : 's'} pendiente${errores.total === 1 ? '' : 's'}` : 'Sin errores pendientes'}</p>
                            <p className={`text-sm ${errores.total > 0 ? 'text-blue-100' : 'text-medico-gray'}`}>
                                {errores.total > 0
                                    ? `Las preguntas que fallaste en ${errores.simulacros} simulacro${errores.simulacros === 1 ? '' : 's'}, como examen real: sin pistas, con explicación al final. Al acertarlas salen de la lista.`
                                    : 'Cuando falles preguntas en un simulacro, aquí podrás repasarlas hasta acertarlas.'}
                            </p>
                        </div>
                        {errores.total > 0 && (
                            <div className="flex gap-2">
                                <button onClick={() => navigate('/simulacro/errores/realizar')} className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-medico-blue text-sm font-semibold hover:bg-blue-50"><Play className="w-4 h-4" /> Repasar {Math.min(50, errores.total)}</button>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'disponibles' && (
                    <>
                        {cursos.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                                <button onClick={() => setCurso('todos')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${curso === 'todos' ? 'bg-medico-blue text-white border-medico-blue' : 'bg-white text-gray-700 border-gray-200'}`}>Todos</button>
                                {cursos.map(([id, t]) => <button key={id} onClick={() => setCurso(id)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${curso === id ? 'bg-medico-blue text-white border-medico-blue' : 'bg-white text-gray-700 border-gray-200'}`}>{limpiarTitulo(t)}</button>)}
                            </div>
                        )}
                        {/* Móvil: desplegables compactos en una fila; escritorio: chips */}
                        {hayFiltros && (
                            <div className="sm:hidden grid grid-cols-3 gap-2 mb-4">
                                {opciones.tipo.length > 1 && (
                                    <label className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-medico-gray mb-1">Tipo</span>
                                        <select value={filtro.tipo} onChange={e => setFiltro(f => ({ ...f, tipo: e.target.value }))} className={`w-full rounded-xl border px-2 py-2 text-xs bg-white ${filtro.tipo ? 'border-medico-blue text-medico-blue font-medium' : 'border-gray-200 text-gray-700'}`}>
                                            <option value="">Todos</option>{opciones.tipo.map(t => <option key={t} value={t}>{TIPOS[t]}</option>)}
                                        </select></label>
                                )}
                                {opciones.anio.length > 0 && (
                                    <label className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-medico-gray mb-1">Año</span>
                                        <select value={filtro.anio} onChange={e => setFiltro(f => ({ ...f, anio: e.target.value }))} className={`w-full rounded-xl border px-2 py-2 text-xs bg-white ${filtro.anio ? 'border-medico-blue text-medico-blue font-medium' : 'border-gray-200 text-gray-700'}`}>
                                            <option value="">Todos</option>{opciones.anio.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select></label>
                                )}
                                {opciones.dificultad.length > 0 && (
                                    <label className="min-w-0"><span className="block text-[10px] font-semibold uppercase tracking-wide text-medico-gray mb-1">Dificultad</span>
                                        <select value={filtro.dificultad} onChange={e => setFiltro(f => ({ ...f, dificultad: e.target.value }))} className={`w-full rounded-xl border px-2 py-2 text-xs bg-white ${filtro.dificultad ? 'border-medico-blue text-medico-blue font-medium' : 'border-gray-200 text-gray-700'}`}>
                                            <option value="">Todas</option>{opciones.dificultad.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select></label>
                                )}
                                {(filtro.anio || filtro.dificultad || filtro.tipo) && <p className="col-span-3 text-xs text-medico-gray">{lista.length} de {simulacros.length} simulacros · <button className="text-medico-blue hover:underline" onClick={() => setFiltro({ anio: '', dificultad: '', tipo: '' })}>quitar filtros</button></p>}
                            </div>
                        )}
                        {hayFiltros && (
                            <div className="hidden sm:flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 bg-white rounded-2xl border border-gray-100 px-4 py-3">
                                {opciones.tipo.length > 1 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-medico-gray mr-1">Tipo</span>
                                        <Chip activo={!filtro.tipo} onClick={() => setFiltro(f => ({ ...f, tipo: '' }))}>Todos</Chip>
                                        {opciones.tipo.map(t => <Chip key={t} activo={filtro.tipo === t} onClick={() => setFiltro(f => ({ ...f, tipo: f.tipo === t ? '' : t }))}>{TIPOS[t]}</Chip>)}
                                    </div>
                                )}
                                {opciones.anio.length > 0 && (
                                    <div className="flex items-center gap-1.5 sm:border-l sm:border-gray-100 sm:pl-6">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-medico-gray mr-1">Año</span>
                                        <Chip activo={!filtro.anio} onClick={() => setFiltro(f => ({ ...f, anio: '' }))}>Todos</Chip>
                                        {opciones.anio.map(a => <Chip key={a} activo={filtro.anio === a} onClick={() => setFiltro(f => ({ ...f, anio: f.anio === a ? '' : a }))}>{a}</Chip>)}
                                    </div>
                                )}
                                {opciones.dificultad.length > 0 && (
                                    <div className="flex items-center gap-1.5 sm:border-l sm:border-gray-100 sm:pl-6">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide text-medico-gray mr-1">Dificultad</span>
                                        <Chip activo={!filtro.dificultad} onClick={() => setFiltro(f => ({ ...f, dificultad: '' }))}>Todas</Chip>
                                        {opciones.dificultad.map(d => <Chip key={d} activo={filtro.dificultad === d} onClick={() => setFiltro(f => ({ ...f, dificultad: f.dificultad === d ? '' : d }))}>{d}</Chip>)}
                                    </div>
                                )}
                                {(filtro.anio || filtro.dificultad || filtro.tipo) && <p className="text-xs text-medico-gray ml-auto">{lista.length} de {simulacros.length} · <button className="text-medico-blue hover:underline" onClick={() => setFiltro({ anio: '', dificultad: '', tipo: '' })}>quitar filtros</button></p>}
                            </div>
                        )}
                        {lista.length === 0 ? (
                            <EmptyState icon={ClipboardList} title={simulacros.length ? 'Ningún simulacro coincide con los filtros' : 'No hay simulacros disponibles'} description="Inscríbete en un curso para acceder a sus simulacros." action={<Link to="/mis-cursos" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-medico-blue text-white text-sm font-medium"><BookOpen className="w-4 h-4" /> Ver mis cursos</Link>} />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {lista.map(s => {
                                    const m = MODOS[s.modo] || { label: s.modo, cls: 'bg-gray-100 text-gray-700' }
                                    const ok = puedeIniciar(s)
                                    return (
                                        <div key={s.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex flex-col">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-semibold text-gray-900 leading-snug">{limpiarTitulo(s.titulo)}</h3>
                                                    {cursos.length > 1 && <p className="text-xs text-medico-gray mt-0.5 truncate">{limpiarTitulo(s.curso_titulo)}</p>}
                                                </div>
                                                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium ${m.cls}`}>{m.label}</span>
                                            </div>
                                            {(s.meta.convocatoria || s.meta.anio || s.meta.dificultad || s.meta.tipo === 'examen') && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {s.meta.tipo === 'examen' && <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">Examen real</span>}
                                                    {(s.meta.convocatoria || s.meta.anio) && <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-700">{s.meta.convocatoria || s.meta.anio}</span>}
                                                    {s.meta.dificultad && <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${DIF_CLS[s.meta.dificultad] || 'bg-gray-100 text-gray-700'}`}>Dificultad {s.meta.dificultad.toLowerCase()}</span>}
                                                </div>
                                            )}
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-xs text-medico-gray">
                                                <span className="inline-flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> {s.numero_preguntas} preguntas</span>
                                                <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.tiempo}</span>
                                                {s.tipo_navegacion === 'secuencial' && <span className="inline-flex items-center gap-1"><ArrowRight className="w-3.5 h-3.5" /> secuencial</span>}
                                            </div>
                                            <div className="flex items-center justify-between mt-3 text-sm">
                                                <span className="text-medico-gray">Intentos: <span className="font-medium text-gray-900">{s.intentos_realizados || 0}</span>{s.intentos_permitidos > 0 && `/${s.intentos_permitidos}`}</span>
                                                {s.mejor_puntaje !== null && s.mejor_puntaje !== undefined && <span className={`inline-flex items-center gap-1 font-semibold ${colorPuntaje(s.mejor_puntaje)}`}><Trophy className="w-4 h-4" /> {s.mejor_puntaje}%</span>}
                                            </div>
                                            <div className="mt-4">
                                                {ok ? (
                                                    <button onClick={() => navigate(`/simulacro/${s.id}/realizar`)} className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-medico-blue text-white text-sm font-medium hover:bg-blue-800">
                                                        {s.intentos_realizados > 0 ? <><RotateCcw className="w-4 h-4" /> Repetir</> : <><Play className="w-4 h-4" /> Iniciar</>}
                                                    </button>
                                                ) : (
                                                    <div className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-gray-100 text-gray-500 text-sm font-medium"><Lock className="w-4 h-4" /> Sin intentos disponibles</div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {tab === 'intentos' && (
                    intentos.length === 0 ? (
                        <EmptyState icon={Trophy} title="Todavía no has hecho simulacros" description="Cuando completes uno, aquí verás tu puntaje y podrás revisar cada pregunta." action={<button onClick={() => setTab('disponibles')} className="px-5 py-2.5 rounded-full bg-medico-blue text-white text-sm font-medium">Ver simulacros</button>} />
                    ) : (
                        <ul className="space-y-2">
                            {intentos.map(i => {
                                const m = MODOS[i.modo_evaluacion] || { label: i.modo_evaluacion, cls: 'bg-gray-100 text-gray-700' }
                                const p = Math.round(parseFloat(i.puntaje) || 0)
                                return (
                                    <li key={i.id}>
                                        <Link to={`/simulacros/resultado?intento=${i.id}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 hover:border-medico-blue transition-colors">
                                            <span className={`flex-shrink-0 w-14 text-center text-xl font-bold tabular-nums ${colorPuntaje(p)}`}>{p}%</span>
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-sm font-semibold text-gray-900 truncate">{limpiarTitulo(i.simulacro_titulo)}</span>
                                                <span className="block text-xs text-medico-gray truncate">{fecha(i.fecha_intento)} · {i.respuestas_correctas}/{i.total_preguntas} correctas · {i.tiempo_empleado_minutos} min</span>
                                                <span className="mt-1 inline-block"><Pill className={m.cls}>{m.label}</Pill></span>
                                            </span>
                                            <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    )
                )}
            </div>
        </Layout>
    )
}

export default Simulacros
