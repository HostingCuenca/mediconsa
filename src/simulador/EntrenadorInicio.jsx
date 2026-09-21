// src/simulador/EntrenadorInicio.jsx - Entrenador CACES: mapa de dominio por especialidad,
// sesión de hoy (repasos + área foco), diagnóstico inicial y refuerzo con clases/manuales del curso.
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Play, Sparkles, Flame, Target, Stethoscope, RotateCcw, SlidersHorizontal, History, BarChart3, X, Video, BookOpen,
    AlertTriangle, CheckCircle2, Clock, ChevronRight, Dumbbell, Lock, Award, Settings2, Filter
} from 'lucide-react'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import simuladorService from '../services/simulador'
import { Card, Button, Pill, Loading, EmptyState, Alert, SegmentedControl, StatsBar, Ring, ProgressBar } from './ui'
import { useCached, invalidarCache } from './useCached'
import { limpiarTitulo } from '../biblioteca/Biblioteca'
import ConfiguradorSesion from './ConfiguradorSesion'

const CARRERA_KEY = 'simulador_carrera'
const NIVELES = simuladorService.NIVELES

const EntrenadorInicio = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [carrera, setCarrera] = useState(localStorage.getItem(CARRERA_KEY) || '')
    const [error, setError] = useState('')
    const [creando, setCreando] = useState('')       // 'hoy' | 'diagnostico' | 'errores' | 'area'
    const [areaSel, setAreaSel] = useState(null)      // id del área abierta en el panel
    const [configurador, setConfigurador] = useState(null)   // { contexto: 'hoy'|'area'|'libre'|'examen_real', areaId?, areaNombre? }

    const carrerasQ = useCached('carreras', () => simuladorService.getCarreras())
    const carreras = useMemo(() => carrerasQ.data?.carreras || [], [carrerasQ.data])
    useEffect(() => {
        if (carreras.length && !carreras.find(c => c.carrera === carrera)) setCarrera(carreras[0].carrera)
    }, [carreras, carrera])
    useEffect(() => { if (carrera) localStorage.setItem(CARRERA_KEY, carrera) }, [carrera])

    // Enfoque: filtrar TODO el entrenador (mapa, sesión de hoy, áreas, examen) por una etiqueta, p. ej. "Año 2025".
    // Se recuerda por carrera. [] = todo el banco.
    const ENFOQUE_KEY = `entrenador_enfoque:${carrera}`
    const [enfoque, setEnfoque] = useState(() => { try { return JSON.parse(localStorage.getItem(`entrenador_enfoque:${localStorage.getItem(CARRERA_KEY) || ''}`) || '[]') } catch { return [] } })
    useEffect(() => { try { setEnfoque(JSON.parse(localStorage.getItem(ENFOQUE_KEY) || '[]')) } catch { setEnfoque([]) } }, [ENFOQUE_KEY])
    const cambiarEnfoque = (ids) => { setEnfoque(ids); try { localStorage.setItem(ENFOQUE_KEY, JSON.stringify(ids)) } catch { /* noop */ } }
    const etiquetasQ = useCached('etiquetas-alumno', () => simuladorService.etiquetas())
    const gruposEnfoque = useMemo(() => (etiquetasQ.data?.grupos || []).filter(g => ['anio', 'convocatoria', 'tipo-examen'].includes(g.slug) && g.etiquetas.length), [etiquetasQ.data])
    const claveEnfoque = enfoque.length ? `:${enfoque.join('-')}` : ''

    const mapaQ = useCached(carrera ? `mapa:${carrera}${claveEnfoque}` : null, () => simuladorService.getMapa(carrera, enfoque))
    const mapa = mapaQ.data
    useEffect(() => { if (carrerasQ.error || mapaQ.error) setError(carrerasQ.error || mapaQ.error) }, [carrerasQ.error, mapaQ.error])

    const irASesion = (r, tipo) => {
        setCreando('')
        if (r.success) { invalidarCache(); navigate(`/simulador/sesion/${r.data.sesion.id}`) }
        else setError(r.error)
    }
    const empezarHoy = async () => { setCreando('hoy'); irASesion(await simuladorService.iniciarHoy(carrera, mapa?.hoy?.meta, { etiquetaIds: enfoque })) }
    const empezarDiagnostico = async () => { setCreando('diagnostico'); irASesion(await simuladorService.iniciarDiagnostico(carrera)) }
    const repasarErrores = async () => { setCreando('errores'); irASesion(await simuladorService.crearSesion({ carrera, modo: 'practica', origen: 'errores', numPreguntas: 20, etiquetaIds: enfoque })) }
    // Todas las sesiones pasan por el configurador ("¿Cómo quieres entrenar?")
    const abrirConfigurador = (contexto) => setConfigurador(contexto)
    // Etiquetas visibles al alumno (institución, año…) para la sesión libre (además del enfoque global)
    const etiquetasAlumno = etiquetasQ.data?.grupos || []

    const confirmarConfig = async (cfg) => {
        const c = configurador
        setCreando(c.contexto)
        // Etiquetas: las del enfoque global + las que el alumno marque en el configurador de la sesión libre
        const etiquetaIds = [...new Set([...enfoque, ...(cfg.etiquetaIds || [])])]
        const extra = { modo: cfg.modo, numPreguntas: cfg.numPreguntas, tiempoLimiteMin: cfg.tiempoLimiteMin, tiempoPorPreguntaSeg: cfg.tiempoPorPreguntaSeg, muerteSubita: cfg.muerteSubita, dificultad: cfg.dificultad, soloNoVistas: cfg.soloNoVistas, mostrarEstadisticas: cfg.mostrarEstadisticas, etiquetaIds }
        let r
        if (cfg.reto === 'examen_real') r = await simuladorService.iniciarExamenReal(carrera, { numPreguntas: 100, etiquetaIds: enfoque })
        else if (c.contexto === 'area') r = await simuladorService.entrenarArea(c.areaId, carrera, extra)
        else if (c.contexto === 'hoy') r = await simuladorService.iniciarHoy(carrera, mapa?.hoy?.meta, extra)
        else r = await simuladorService.crearSesion({ carrera, origen: cfg.soloNoVistas ? 'aleatorio' : 'adaptativo', ...extra })
        setConfigurador(null)
        irASesion(r)
    }
    const cambiarMeta = async (meta) => {
        const r = await simuladorService.actualizarMeta(meta)
        if (r.success) mapaQ.setData(d => ({ ...d, hoy: { ...d.hoy, meta, cumplida: d.hoy.respondidas >= meta } }))
    }

    if ((carrerasQ.loading || (carrera && mapaQ.loading)) && !mapa) return <Layout showSidebar><Loading text="Preparando tu entrenador…" /></Layout>

    if (!carrerasQ.loading && carreras.length === 0) {
        return (
            <Layout showSidebar>
                <div className="p-6 md:p-8">
                    <EmptyState icon={Stethoscope} title="Aún no tienes un entrenador activo"
                                description="El Entrenador CACES usa el banco de preguntas de los cursos en los que estás habilitado."
                                action={<Button to="/mis-cursos">Ver mis cursos</Button>} />
                </div>
            </Layout>
        )
    }

    const nombre = (user?.nombre_completo || user?.nombre_usuario || '').split(' ')[0]
    const hoy = mapa?.hoy
    const resumen = mapa?.resumen
    const areaAbierta = mapa?.areas.find(a => a.id === areaSel)

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                {/* ===== Cabecera ===== */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
                    <div>
                        <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-medico-blue mb-1">Entrenador CACES</span>
                        <h1 className="text-3xl text-gray-900 tracking-tight">{nombre ? `Hola, ${nombre}. ` : ''}Tu mapa de dominio · {mapa?.carreraLabel}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <StatsBar stats={mapa?.stats} />
                        {carreras.length > 1 && <SegmentedControl value={carrera} onChange={setCarrera} options={carreras.map(c => ({ value: c.carrera, label: c.label }))} />}
                    </div>
                </div>

                {error && <Alert tone="error" className="mb-6">{error}</Alert>}

                {/* Enfoque: filtra todo el entrenador por año / convocatoria / tipo de examen */}
                {gruposEnfoque.length > 0 && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-medico-gray inline-flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Enfoque</span>
                        <button onClick={() => cambiarEnfoque([])} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${enfoque.length === 0 ? 'bg-medico-blue text-white border-medico-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>Todo el banco</button>
                        {gruposEnfoque.map(g => g.etiquetas.map(e => {
                            const on = enfoque.includes(e.id)
                            return (
                                <button key={e.id} onClick={() => cambiarEnfoque(on ? enfoque.filter(x => x !== e.id) : [...enfoque.filter(x => !g.etiquetas.some(y => y.id === x)), e.id])}
                                        title={`${g.nombre}: ${e.nombre}`}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${on ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                                        style={on ? { background: g.color } : undefined}>{e.nombre}</button>
                            )
                        }))}
                        {enfoque.length > 0 && mapa && <span className="text-xs text-medico-gray">{mapa.resumen?.totalPreguntas} preguntas con este enfoque</span>}
                    </div>
                )}

                {mapa && (
                    <>
                        {mapa.sesionEnCurso && (
                            <Card tint="bg-blue-50" className="border-blue-100 p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-11 h-11 rounded-2xl bg-medico-blue text-white flex items-center justify-center flex-shrink-0"><Play className="w-5 h-5" /></div>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">Tienes una sesión sin terminar</p>
                                    <p className="text-sm text-medico-gray">{mapa.sesionEnCurso.config?.titulo || simuladorService.ORIGENES[mapa.sesionEnCurso.origen]?.label} · {mapa.sesionEnCurso.respondidas}/{mapa.sesionEnCurso.totalPreguntas} respondidas</p>
                                </div>
                                <Button to={`/simulador/sesion/${mapa.sesionEnCurso.id}`}>Continuar</Button>
                            </Card>
                        )}

                        {/* ===== Hoy · Preparación · Diagnóstico/acciones ===== */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
                            {/* Sesión de hoy */}
                            <Card tint="bg-gradient-to-br from-medico-blue to-blue-900" className="border-blue-900 p-6 text-white lg:col-span-1 flex flex-col">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">Tu sesión de hoy</p>
                                        <p className="font-sans text-xl font-semibold mt-1">{hoy.cumplida ? '¡Meta cumplida! ¿Un poco más?' : `${hoy.respondidas} de ${hoy.meta} preguntas`}</p>
                                    </div>
                                    <Ring value={Math.min(100, (100 * hoy.respondidas) / hoy.meta)} size={72} stroke={8} color="#ffffff" label={<span className="text-white text-base">{Math.min(100, Math.round((100 * hoy.respondidas) / hoy.meta))}%</span>} />
                                </div>
                                <p className="text-sm text-blue-100 mt-3 leading-relaxed">
                                    {resumen.vencidas > 0 ? <>Tienes <strong className="text-white">{resumen.vencidas} repasos vencidos</strong>. </> : null}
                                    {mapa.foco ? <>Hoy te propongo trabajar <strong className="text-white">{mapa.foco.nombre}</strong>{mapa.foco.nivel === 'sin_explorar' ? ' (aún sin explorar)' : mapa.foco.acierto !== null ? ` (${mapa.foco.acierto}% de acierto)` : ''}.</> : 'Sigue repasando para mantener lo que ya dominas.'}
                                </p>
                                <div className="mt-auto pt-5 space-y-3">
                                    <div className="flex gap-2">
                                        <Button size="lg" className="flex-1 !bg-white !text-medico-blue hover:!bg-blue-50 focus:!ring-white" loading={creando === 'hoy'} onClick={empezarHoy}>
                                            <Sparkles className="w-5 h-5" /> {hoy.cumplida ? 'Sesión extra' : 'Empezar sesión de hoy'}
                                        </Button>
                                        <button onClick={() => abrirConfigurador({ contexto: 'hoy' })} className="px-3 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25" title="Elegir modo y tiempo para la sesión de hoy"><Settings2 className="w-5 h-5" /></button>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-blue-100">
                                        <span className="inline-flex items-center gap-1"><Flame className={`w-4 h-4 ${mapa.stats.rachaDias > 0 ? 'text-orange-300 fill-current' : ''}`} /> {mapa.stats.rachaDias} {mapa.stats.rachaDias === 1 ? 'día' : 'días'} de racha</span>
                                        <span className="inline-flex items-center gap-1">Meta diaria:
                                            {hoy.metas.map(m => (
                                                <button key={m} onClick={() => cambiarMeta(m)} className={`px-1.5 py-0.5 rounded-md ${hoy.meta === m ? 'bg-white text-medico-blue font-semibold' : 'hover:bg-white/15'}`}>{m}</button>
                                            ))}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Preparación */}
                            <Card className="p-6 flex flex-col">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">Preparación estimada</p>
                                <div className="flex items-center gap-5 mt-3">
                                    <Ring value={resumen.preparacion} size={96} stroke={10} color={resumen.preparacion >= 70 ? '#059669' : resumen.preparacion >= 40 ? '#ea580c' : '#dc2626'} sub="dominio" />
                                    <ul className="text-sm space-y-1.5 flex-1">
                                        <li className="flex justify-between"><span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-medico-green" /> Dominadas</span><strong>{resumen.dominadas}</strong></li>
                                        <li className="flex justify-between"><span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-medico-orange" /> En progreso</span><strong>{resumen.areas - resumen.dominadas - resumen.debiles - resumen.sinExplorar}</strong></li>
                                        <li className="flex justify-between"><span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-medico-red" /> Débiles</span><strong>{resumen.debiles}</strong></li>
                                        <li className="flex justify-between"><span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Sin explorar</span><strong>{resumen.sinExplorar}</strong></li>
                                    </ul>
                                </div>
                                <div className="mt-auto pt-4 flex flex-wrap gap-2">
                                    <Pill className={resumen.vencidas > 0 ? 'bg-orange-50 text-medico-orange border-orange-100' : 'bg-gray-50 text-gray-600 border-gray-100'}><Clock className="w-3.5 h-3.5" /> {resumen.vencidas} repasos vencidos</Pill>
                                    <Pill className={resumen.erroresConcepto > 0 ? 'bg-red-50 text-medico-red border-red-100' : 'bg-gray-50 text-gray-600 border-gray-100'}><AlertTriangle className="w-3.5 h-3.5" /> {resumen.erroresConcepto} errores de concepto</Pill>
                                    <Pill className="bg-gray-50 text-gray-600 border-gray-100">{resumen.vistas} de {resumen.totalPreguntas} preguntas vistas</Pill>
                                </div>
                            </Card>

                            {/* Diagnóstico o acciones */}
                            {!mapa.diagnostico ? (
                                <Card tint="bg-amber-50" className="border-amber-100 p-6 flex flex-col">
                                    <div className="flex items-center gap-3">
                                        <span className="w-11 h-11 rounded-2xl bg-amber-400 text-white flex items-center justify-center flex-shrink-0"><Target className="w-5 h-5" /></span>
                                        <div>
                                            <p className="font-semibold text-gray-900">Empieza con un diagnóstico</p>
                                            <p className="text-xs text-medico-gray">40 preguntas de todas las especialidades, modo examen (~60 min)</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 mt-3 leading-relaxed">Con él pinto tu mapa desde el primer día y sé exactamente qué áreas reforzar contigo.</p>
                                    <Button variant="secondary" className="mt-auto w-full" loading={creando === 'diagnostico'} onClick={empezarDiagnostico}><Target className="w-4 h-4" /> Hacer el diagnóstico</Button>
                                </Card>
                            ) : (
                                <Card className="p-5 flex flex-col">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-medico-gray">Practicar</p>
                                        <Pill className="bg-gray-50 text-gray-600 border-gray-100"><Target className="w-3 h-3" /> Diagnóstico {Math.round(mapa.diagnostico.puntaje)}%</Pill>
                                    </div>
                                    <div className="space-y-1">
                                        <QuickAction icon={RotateCcw} tint="bg-red-50 text-medico-red" title="Repasar mis errores" sub={resumen.erroresConcepto > 0 ? `${resumen.erroresConcepto} errores de concepto pendientes` : 'Lo que fallaste, de nuevo'} disabled={!!creando} loading={creando === 'errores'} onClick={repasarErrores} />
                                        <QuickAction icon={SlidersHorizontal} tint="bg-gray-100 text-gray-700" title="Sesión a mi medida" sub="Práctica, examen, contrarreloj o muerte súbita" onClick={() => abrirConfigurador({ contexto: 'libre' })} />
                                        <QuickAction icon={Award} tint="bg-amber-50 text-amber-700" title="Examen CACES completo" sub="100 preguntas · todas las especialidades · 96 s/preg" disabled={!!creando} loading={creando === 'examen_real'} onClick={() => abrirConfigurador({ contexto: 'examen_real' })} />
                                        <QuickAction icon={Target} tint="bg-purple-50 text-purple-700" title="Mi plan de estudio" sub="Objetivos, metas semanales y lo que toca hoy" onClick={() => navigate('/simulador/plan')} />
                                        <QuickAction icon={BarChart3} tint="bg-emerald-50 text-medico-green" title="Mi progreso" sub="Tendencia, cobertura y ritmo" onClick={() => navigate('/simulador/progreso')} />
                                        <QuickAction icon={History} tint="bg-blue-50 text-medico-blue" title="Historial" sub="Todas tus sesiones" onClick={() => navigate('/simulador/historial')} />
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* ===== Mapa de dominio ===== */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
                            <div>
                                <h2 className="font-sans text-xl font-semibold text-gray-900">Mapa de dominio</h2>
                                <p className="text-sm text-medico-gray">Toca una especialidad para ver tu nivel, entrenarla y encontrar las clases y manuales que la refuerzan.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(NIVELES).map(([k, n]) => <Pill key={k} className={n.cls}><span className={`w-2 h-2 rounded-full ${n.bar}`} /> {n.label}</Pill>)}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                            {mapa.areas.map(a => <AreaTile key={a.id} area={a} activa={areaSel === a.id} foco={mapa.foco?.id === a.id} onClick={() => setAreaSel(a.id)} />)}
                        </div>
                    </>
                )}
            </div>

            {areaAbierta && (
                <AreaPanel area={areaAbierta} carrera={carrera} onClose={() => setAreaSel(null)} onEntrenar={() => abrirConfigurador({ contexto: 'area', areaId: areaAbierta.id, areaNombre: areaAbierta.nombre })} creando={creando === 'area'} />
            )}
            <ConfiguradorSesion
                open={!!configurador}
                titulo={configurador?.contexto === 'area' ? `Entrenar ${configurador.areaNombre}` : configurador?.contexto === 'hoy' ? 'Tu sesión de hoy' : configurador?.contexto === 'examen_real' ? 'Examen CACES completo' : '¿Cómo quieres entrenar?'}
                subtitulo={configurador?.contexto === 'hoy' ? 'El entrenador elige las preguntas (repasos vencidos + área foco); tú eliges cómo responderlas.' : configurador?.contexto === 'area' ? 'Preguntas de esta especialidad: primero las vencidas y falladas, luego nuevas.' : undefined}
                inicial={configurador?.contexto === 'examen_real' ? { reto: 'examen_real' } : configurador?.contexto === 'area' ? { numPreguntas: 15 } : {}}
                permitir={configurador?.contexto === 'hoy' ? ['practica', 'examen', 'contrarreloj'] : configurador?.contexto === 'area' ? ['practica', 'examen', 'contrarreloj', 'muerte_subita'] : undefined}
                creando={!!creando}
                etiquetas={!configurador?.contexto ? etiquetasAlumno : []}
                onClose={() => setConfigurador(null)}
                onConfirmar={confirmarConfig}
            />
        </Layout>
    )
}

// ---------- Tarjeta de especialidad ----------
const AreaTile = ({ area, activa, foco, onClick }) => {
    const n = NIVELES[area.nivel]
    return (
        <button onClick={onClick} className={`text-left rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${activa ? 'ring-2 ring-medico-blue border-medico-blue' : 'border-gray-100'}`}>
            <div className={`h-1.5 rounded-full ${n.bar} mb-3`} style={{ width: `${Math.max(12, area.puntuacion)}%` }} />
            <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-gray-900 leading-snug text-sm line-clamp-2 min-h-[2.5rem]">{area.nombre}</p>
                {foco && <span title="Área foco de hoy"><Sparkles className="w-4 h-4 text-medico-blue flex-shrink-0" /></span>}
            </div>
            <div className="mt-2 flex items-end justify-between">
                <span className="text-2xl font-semibold text-gray-900 leading-none">{area.acierto !== null && area.nivel !== 'sin_explorar' ? `${Math.round(area.acierto)}%` : '—'}</span>
                <Pill className={n.cls}>{n.label}</Pill>
            </div>
            <p className="text-[11px] text-medico-gray mt-2">{area.dominadas} dominadas · {area.vistas}/{area.total} vistas</p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-medico-gray">
                {area.vencidas > 0 && <span className="inline-flex items-center gap-0.5 text-medico-orange font-medium"><Clock className="w-3 h-3" /> {area.vencidas}</span>}
                {area.erroresConcepto > 0 && <span className="inline-flex items-center gap-0.5 text-medico-red font-medium"><AlertTriangle className="w-3 h-3" /> {area.erroresConcepto}</span>}
                <span className="ml-auto inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-0.5"><Video className="w-3 h-3" /> {area.recursos.clases}</span>
                    <span className="inline-flex items-center gap-0.5"><BookOpen className="w-3 h-3" /> {area.recursos.materiales}</span>
                </span>
            </div>
        </button>
    )
}

// ---------- Panel lateral de especialidad ----------
const AreaPanel = ({ area, carrera, onClose, onEntrenar, creando }) => {
    const navigate = useNavigate()
    const [detalle, setDetalle] = useState(null)
    const [cargando, setCargando] = useState(true)
    const n = NIVELES[area.nivel]

    useEffect(() => {
        let vivo = true
        setCargando(true); setDetalle(null)
        simuladorService.getAreaDetalle(area.id, carrera).then(r => { if (vivo) { setDetalle(r.success ? r.data : null); setCargando(false) } })
        return () => { vivo = false }
    }, [area.id, carrera])

    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', onKey)
        // Bloquear el scroll del fondo mientras el panel está abierto (en móvil se colaba y el panel no llegaba al final)
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
    }, [onClose])

    const consejo = area.nivel === 'sin_explorar' ? 'Todavía no te conozco en esta especialidad. Entrénala para pintar tu mapa.'
        : area.nivel === 'debil' ? 'Aquí pierdes puntos. Ve primero a la clase, lee el manual y luego entrena: verás el cambio en pocos días.'
        : area.nivel === 'progreso' ? 'Vas bien. Repasa lo vencido y cierra los errores de concepto para dominarla.'
        : 'Dominada. Mantenla con los repasos que te programo; no hace falta más.'

    return (
        // Móvil: hoja inferior (92 % de la pantalla visible, con scroll propio); escritorio: panel lateral a toda altura
        <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end" onClick={onClose}>
            <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-[2px]" />
            <aside className="relative w-full sm:max-w-md max-h-[92dvh] sm:max-h-none sm:h-[100dvh] bg-white shadow-2xl overflow-y-auto overscroll-contain rounded-t-3xl sm:rounded-none"
                   style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} onClick={e => e.stopPropagation()}>
                <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mt-2" />
                <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-5 py-4 flex items-start gap-3 z-10">
                    <div className="flex-1 min-w-0">
                        <Pill className={n.cls}>{n.label}</Pill>
                        <h3 className="font-sans text-xl font-semibold text-gray-900 mt-1.5 leading-snug">{area.nombre}</h3>
                        <p className="text-xs text-medico-gray">{area.total} preguntas en el banco</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" title="Cerrar (Esc)"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-5 space-y-6">
                    <div className="flex items-center gap-5">
                        <Ring value={area.nivel === 'sin_explorar' ? 0 : area.acierto || 0} size={88} stroke={9} color={n.hex} label={area.nivel === 'sin_explorar' ? '—' : `${Math.round(area.acierto)}%`} sub="acierto reciente" />
                        <div className="grid grid-cols-3 gap-2 flex-1 text-center">
                            <div className="rounded-xl bg-emerald-50 p-2"><p className="text-lg font-semibold text-medico-green leading-none">{area.dominadas}</p><p className="text-[10px] text-medico-gray mt-1">dominadas</p></div>
                            <div className="rounded-xl bg-orange-50 p-2"><p className="text-lg font-semibold text-medico-orange leading-none">{area.aprendiendo}</p><p className="text-[10px] text-medico-gray mt-1">en aprendizaje</p></div>
                            <div className="rounded-xl bg-gray-50 p-2"><p className="text-lg font-semibold text-gray-700 leading-none">{area.nuevas}</p><p className="text-[10px] text-medico-gray mt-1">nuevas</p></div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed rounded-2xl bg-gray-50 p-3">{consejo}</p>
                    <div className="flex flex-wrap gap-2">
                        {area.vencidas > 0 && <Pill className="bg-orange-50 text-medico-orange border-orange-100"><Clock className="w-3.5 h-3.5" /> {area.vencidas} repasos vencidos</Pill>}
                        {area.erroresConcepto > 0 && <Pill className="bg-red-50 text-medico-red border-red-100"><AlertTriangle className="w-3.5 h-3.5" /> {area.erroresConcepto} errores de concepto</Pill>}
                        {area.nivel === 'dominada' && <Pill className="bg-emerald-50 text-medico-green border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> Mantén con repasos</Pill>}
                    </div>
                    <Button size="lg" className="w-full" onClick={onEntrenar} loading={creando}><Dumbbell className="w-5 h-5" /> Entrenar esta área · 15 preguntas</Button>

                    {/* Refuerzo */}
                    <section>
                        <h4 className="font-sans text-sm font-semibold text-gray-900 mb-2">Refuerza con tu curso</h4>
                        {cargando && <Loading text="Buscando clases y manuales…" />}
                        {!cargando && detalle && detalle.recursos.clases.length === 0 && detalle.recursos.materiales.length === 0 && (
                            <p className="text-sm text-medico-gray rounded-2xl border border-dashed border-gray-200 p-4 text-center">Tu curso aún no tiene una clase dedicada a esta especialidad. Entrena con las preguntas y sus explicaciones.</p>
                        )}
                        {!cargando && detalle && (
                            <div className="space-y-2">
                                {detalle.recursos.clases.map(c => (
                                    <button key={c.id} onClick={() => navigate(c.url)} className="w-full text-left flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.completada ? 'bg-emerald-50 text-medico-green' : 'bg-blue-50 text-medico-blue'}`}>{c.completada ? <CheckCircle2 className="w-4 h-4" /> : <Video className="w-4 h-4" />}</span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-medium text-gray-900 truncate">{limpiarTitulo(c.titulo)}</span>
                                            <span className="block text-[11px] text-medico-gray truncate">{limpiarTitulo(c.modulo)}</span>
                                            {c.porcentajeVisto > 0 && !c.completada && <ProgressBar value={c.porcentajeVisto} height="h-1" className="mt-1.5 w-24" />}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </button>
                                ))}
                                {detalle.recursos.materiales.map(m => (
                                    <button key={m.id} onClick={() => navigate(m.url)} className="w-full text-left flex items-center gap-3 p-3 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/40 transition-colors">
                                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${m.lectura?.completado ? 'bg-emerald-50 text-medico-green' : 'bg-amber-50 text-amber-700'}`}>{m.lectura?.completado ? <CheckCircle2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}</span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-medium text-gray-900 truncate">{limpiarTitulo(m.titulo)}</span>
                                            <span className="block text-[11px] text-medico-gray">{m.lectura ? `Página ${m.lectura.ultimaPagina}${m.lectura.totalPaginas ? ` de ${m.lectura.totalPaginas}` : ''} · ${m.lectura.porcentaje}%` : 'Leer en la Biblioteca'}</span>
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Por repasar */}
                    {!cargando && detalle && detalle.porRepasar.length > 0 && (
                        <section>
                            <h4 className="font-sans text-sm font-semibold text-gray-900 mb-2">Lo que más te cuesta</h4>
                            <ul className="space-y-2">
                                {detalle.porRepasar.map(p => (
                                    <li key={p.preguntaId} className="rounded-2xl border border-gray-100 p-3">
                                        <p className="text-sm text-gray-800 leading-snug line-clamp-2">{p.enunciado}</p>
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {p.erroresConcepto > 0 && <Pill className="bg-red-50 text-medico-red border-red-100"><AlertTriangle className="w-3 h-3" /> Error de concepto ×{p.erroresConcepto}</Pill>}
                                            {p.lapsos > 0 && <Pill className="bg-gray-50 text-gray-600 border-gray-100">Fallada {p.lapsos} {p.lapsos === 1 ? 'vez' : 'veces'}</Pill>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {!cargando && detalle && detalle.historial.length > 0 && (
                        <section>
                            <h4 className="font-sans text-sm font-semibold text-gray-900 mb-2">Últimas sesiones con esta área</h4>
                            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
                                {detalle.historial.map(h => (
                                    <li key={h.sesionId} className="flex items-center justify-between px-3 py-2 text-sm">
                                        <span className="text-gray-700">{simuladorService.ORIGENES[h.origen]?.label || h.origen} · <span className="text-medico-gray text-xs">{simuladorService.formatFecha(h.fecha)}</span></span>
                                        <span className={`font-semibold ${h.correctas / h.n >= 0.7 ? 'text-medico-green' : 'text-medico-red'}`}>{h.correctas}/{h.n}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </aside>
        </div>
    )
}

const QuickAction = ({ icon: Icon, tint, title, sub, onClick, disabled, loading }) => (
    <button onClick={onClick} disabled={disabled} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}>{loading ? <Lock className="w-5 h-5 animate-pulse" /> : <Icon className="w-5 h-5" />}</span>
        <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-gray-900">{title}</span>
            <span className="block text-xs text-medico-gray truncate">{sub}</span>
        </span>
    </button>
)

export default EntrenadorInicio
