// src/simulador/SimuladorProgreso.jsx - Panel de progreso y debilidades del Simulador Interactivo
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Sparkles, RotateCcw, Target, History, ChevronRight, Flame, BookOpen, AlertCircle } from 'lucide-react'
import Layout from '../utils/Layout'
import simuladorService from '../services/simulador'
import { Card, PageHeader, Button, Pill, Stat, ProgressBar, Loading, EmptyState, Alert, SegmentedControl, Ring, StatsBar } from './ui'
import { useCached } from './useCached'

const CARRERA_KEY = 'simulador_carrera'

const SimuladorProgreso = () => {
    const navigate = useNavigate()
    const [carrera, setCarrera] = useState(localStorage.getItem(CARRERA_KEY) || '')
    const [error, setError] = useState('')
    const [creando, setCreando] = useState('')

    const carrerasQ = useCached('carreras', () => simuladorService.getCarreras())
    const carreras = carrerasQ.data?.carreras || []
    useEffect(() => {
        if (carreras.length && !carreras.find(c => c.carrera === carrera)) setCarrera(carreras[0].carrera)
    }, [carreras, carrera])
    useEffect(() => { if (carrera) localStorage.setItem(CARRERA_KEY, carrera) }, [carrera])

    const progresoQ = useCached(carrera ? `progreso:${carrera}` : null, () => simuladorService.getProgreso(carrera))
    const progreso = progresoQ.data
    const loading = carrerasQ.loading || (carrera && progresoQ.loading)
    useEffect(() => { if (carrerasQ.error || progresoQ.error) setError(carrerasQ.error || progresoQ.error) }, [carrerasQ.error, progresoQ.error])

    const iniciarRapido = async (accion, clave) => {
        setCreando(clave)
        const r = await simuladorService.crearSesion({
            carrera,
            modo: accion.modo || 'practica',
            origen: accion.origen,
            areaIds: accion.areaIds,
            numPreguntas: accion.numPreguntas || 20
        })
        setCreando('')
        if (r.success) navigate(`/simulador/sesion/${r.data.sesion.id}`)
        else setError(r.error)
    }

    if (loading && !progreso) return <Layout showSidebar><Loading text="Calculando tu progreso…" /></Layout>

    if (!carrerasQ.loading && carreras.length === 0) {
        return (
            <Layout showSidebar>
                <div className="p-6 md:p-8">
                    <PageHeader eyebrow="Simulador interactivo" title="Aún no tienes preguntas disponibles" />
                    <EmptyState
                        icon={BookOpen}
                        title="Inscríbete en un curso para empezar"
                        description="El simulador usa el banco de preguntas de los cursos en los que estás habilitado."
                        action={<Button to="/mis-cursos">Ver mis cursos</Button>}
                    />
                </div>
            </Layout>
        )
    }

    const p = progreso
    const r = p?.resumen
    const enCurso = p?.sesionEnCurso
    const carreraInfo = carreras.find(c => c.carrera === carrera)

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <PageHeader
                    eyebrow="Simulador interactivo"
                    title={`Tu progreso en ${p?.carreraLabel || ''}`}
                    subtitle="Practica con el banco completo de preguntas, detecta tus áreas débiles y repásalas hasta dominarlas."
                    actions={
                        <>
                            <StatsBar stats={p?.stats} />
                            {carreras.length > 1 && (
                                <SegmentedControl
                                    value={carrera}
                                    onChange={setCarrera}
                                    options={carreras.map(c => ({ value: c.carrera, label: c.label }))}
                                />
                            )}
                            <Button variant="secondary" to="/simulador" size="md">Mi ruta</Button>
                            <Button to={`/simulador/nueva?carrera=${carrera}`} size="md">
                                <Play className="w-4 h-4" /> Nueva sesión
                            </Button>
                        </>
                    }
                />

                {error && <Alert tone="error" className="mb-6">{error}</Alert>}

                {/* Sesión en curso */}
                {enCurso && (
                    <Card tint="bg-blue-50" className="p-5 md:p-6 mb-6 border-blue-100 flex flex-col md:flex-row md:items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-medico-blue text-white flex items-center justify-center flex-shrink-0">
                            <Play className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">Tienes una sesión en curso</p>
                            <p className="text-sm text-medico-gray">
                                {simuladorService.MODOS[enCurso.modo]?.label} · {simuladorService.ORIGENES[enCurso.origen]?.label} · {enCurso.respondidas}/{enCurso.totalPreguntas} respondidas
                                {enCurso.segundosRestantes !== null && ` · ${simuladorService.formatSeg(enCurso.segundosRestantes)} restantes`}
                            </p>
                        </div>
                        <Button to={`/simulador/sesion/${enCurso.id}`}>Continuar <ChevronRight className="w-4 h-4" /></Button>
                    </Card>
                )}

                {!p ? <Loading /> : (
                    <>
                        {/* Resumen */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                            <Card className="p-6 flex items-center gap-6 lg:col-span-1">
                                <Ring value={r.acierto ?? 0} label={r.acierto === null ? '—' : `${Math.round(r.acierto)}%`} sub="acierto" color="#059669" size={112} />
                                <div className="flex-1">
                                    <p className="text-xs font-medium text-medico-gray uppercase tracking-wider">Nivel general</p>
                                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                                        {r.acierto === null ? 'Sin datos' : r.acierto >= 80 ? 'Fuerte' : r.acierto >= 60 ? 'En progreso' : 'Necesita refuerzo'}
                                    </p>
                                    <p className="text-sm text-medico-gray mt-1">{r.correctas} correctas de {r.respuestas} respuestas</p>
                                </div>
                            </Card>
                            <Card className="p-6 lg:col-span-2">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-medium text-medico-gray uppercase tracking-wider">Cobertura del banco</p>
                                    <span className="text-sm font-semibold text-gray-900">{r.vistas} / {r.totalPreguntas} preguntas</span>
                                </div>
                                <ProgressBar value={r.cobertura} height="h-3" />
                                <div className="grid grid-cols-3 gap-4 mt-5">
                                    <div>
                                        <p className="text-2xl font-semibold text-medico-green">{r.dominadas}</p>
                                        <p className="text-xs text-medico-gray">dominadas (2+ aciertos seguidos)</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-medico-red">{r.erroresPendientes}</p>
                                        <p className="text-xs text-medico-gray">errores por repasar</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-semibold text-gray-900">{r.noVistas}</p>
                                        <p className="text-xs text-medico-gray">aún no vistas</p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <Stat label="Sesiones" value={r.sesiones} hint={r.promedioSesiones !== null ? `promedio ${r.promedioSesiones}%` : 'aún ninguna'} />
                            <Stat label="Mejor puntaje" value={r.mejorPuntaje !== null ? `${r.mejorPuntaje}%` : '—'} valueClass="text-medico-blue" />
                            <Stat label="Tiempo de estudio" value={`${r.tiempoTotalMin} min`} hint="en sesiones finalizadas" />
                            <Stat label="Días activos" value={r.diasActivos30} hint="últimos 30 días" tint={r.diasActivos30 > 0 ? 'bg-emerald-50' : 'bg-white'} />
                        </div>

                        {/* Recomendaciones / accesos rápidos */}
                        <section className="mb-8">
                            <h2 className="font-sans text-lg font-semibold text-gray-900 mb-3">Qué hacer ahora</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {p.recomendaciones.map((rec, i) => {
                                    const Icon = rec.tipo === 'errores' ? RotateCcw : rec.tipo === 'area_debil' ? Target : Sparkles
                                    const tint = rec.tipo === 'errores' ? 'bg-red-50' : rec.tipo === 'area_debil' ? 'bg-orange-50' : 'bg-blue-50'
                                    return (
                                        <Card key={i} tint={tint} className="p-5 flex flex-col">
                                            <Icon className="w-6 h-6 text-gray-800 mb-3" />
                                            <p className="font-semibold text-gray-900">{rec.titulo}</p>
                                            <p className="text-sm text-gray-600 mt-1 flex-1">{rec.descripcion}</p>
                                            <Button size="sm" className="mt-4 self-start" loading={creando === `rec${i}`} onClick={() => iniciarRapido(rec.accion, `rec${i}`)}>
                                                Empezar <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </Card>
                                    )
                                })}
                                {p.recomendaciones.length === 0 && (
                                    <Card tint="bg-blue-50" className="p-5 md:col-span-3 flex items-center gap-4">
                                        <Sparkles className="w-6 h-6 text-medico-blue" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">Empieza con una sesión adaptativa</p>
                                            <p className="text-sm text-gray-600">20 preguntas que se ajustan a lo que aún no has visto.</p>
                                        </div>
                                        <Button size="sm" loading={creando === 'adapt'} onClick={() => iniciarRapido({ origen: 'adaptativo', modo: 'practica' }, 'adapt')}>Empezar</Button>
                                    </Card>
                                )}
                            </div>
                        </section>

                        {/* Áreas */}
                        <section className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="font-sans text-lg font-semibold text-gray-900">Áreas</h2>
                                <span className="text-xs text-medico-gray">Toca un área para practicarla</span>
                            </div>
                            <Card className="divide-y divide-gray-100">
                                {p.areas.map(a => {
                                    const est = simuladorService.ESTADOS_AREA[a.estado]
                                    return (
                                        <button
                                            key={a.id}
                                            onClick={() => iniciarRapido({ origen: 'area', modo: 'practica', areaIds: [a.id] }, `area${a.id}`)}
                                            className="w-full text-left p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-gray-50 transition-colors first:rounded-t-3xl last:rounded-b-3xl"
                                        >
                                            <div className="md:w-56">
                                                <p className="font-semibold text-gray-900">{a.nombre}</p>
                                                <p className="text-xs text-medico-gray">{a.totalPreguntas} preguntas · {a.vistas} vistas</p>
                                            </div>
                                            <div className="flex-1 flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-xs text-medico-gray mb-1">
                                                        <span>Acierto</span><span>{a.acierto === null ? '—' : `${a.acierto}%`}</span>
                                                    </div>
                                                    <ProgressBar value={a.acierto ?? 0} color={a.estado === 'debil' ? 'bg-medico-red' : a.estado === 'medio' ? 'bg-medico-orange' : 'bg-medico-green'} />
                                                </div>
                                                <div className="w-28 hidden md:block">
                                                    <div className="flex justify-between text-xs text-medico-gray mb-1"><span>Cobertura</span><span>{a.cobertura}%</span></div>
                                                    <ProgressBar value={a.cobertura} color="bg-medico-blue" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {a.erroresPendientes > 0 && <Pill className="bg-red-50 text-medico-red border-red-100"><AlertCircle className="w-3 h-3" /> {a.erroresPendientes} errores</Pill>}
                                                <Pill className={est.cls}>{est.label}</Pill>
                                                {creando === `area${a.id}` ? <span className="text-xs text-medico-gray">Creando…</span> : <ChevronRight className="w-5 h-5 text-gray-300" />}
                                            </div>
                                        </button>
                                    )
                                })}
                            </Card>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            {/* Tendencia */}
                            <Card className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="font-sans text-lg font-semibold text-gray-900">Tendencia</h2>
                                    <Button variant="ghost" size="sm" to="/simulador/historial"><History className="w-4 h-4" /> Historial</Button>
                                </div>
                                {p.tendencia.length === 0 ? (
                                    <p className="text-sm text-medico-gray">Tus últimas sesiones aparecerán aquí.</p>
                                ) : (
                                    <div className="flex items-end gap-2 h-36">
                                        {p.tendencia.map(t => (
                                            <button key={t.sesionId} onClick={() => navigate(`/simulador/resultado/${t.sesionId}`)}
                                                    className="flex-1 flex flex-col items-center justify-end h-full group" title={`${t.puntaje}% · ${t.totalPreguntas} preguntas · ${simuladorService.formatFecha(t.fecha)}`}>
                                                <span className="text-[10px] text-medico-gray opacity-0 group-hover:opacity-100 mb-1">{Math.round(t.puntaje)}%</span>
                                                <div className={`w-full rounded-t-lg transition-all ${t.puntaje >= 70 ? 'bg-medico-green' : t.puntaje >= 50 ? 'bg-medico-orange' : 'bg-medico-red'} group-hover:opacity-80`}
                                                     style={{ height: `${Math.max(6, t.puntaje)}%` }} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between text-[11px] text-medico-gray mt-2"><span>Más antigua</span><span>Más reciente</span></div>
                            </Card>

                            {/* Temas por origen */}
                            <Card className="p-6">
                                <h2 className="font-sans text-lg font-semibold text-gray-900 mb-1">Dónde fallas más</h2>
                                <p className="text-xs text-medico-gray mb-4">Acierto por simulacro de origen (de menor a mayor)</p>
                                {p.porTemaOrigen.length === 0 ? (
                                    <p className="text-sm text-medico-gray">Responde algunas preguntas para ver este análisis.</p>
                                ) : (
                                    <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
                                        {p.porTemaOrigen.slice(0, 12).map((t, i) => (
                                            <li key={i}>
                                                <div className="flex justify-between text-sm gap-3">
                                                    <span className="text-gray-800 truncate" title={t.fuente}>{t.fuente}</span>
                                                    <span className={`font-semibold flex-shrink-0 ${t.acierto < 60 ? 'text-medico-red' : t.acierto < 80 ? 'text-medico-orange' : 'text-medico-green'}`}>{t.acierto}%</span>
                                                </div>
                                                <ProgressBar value={t.acierto} className="mt-1" height="h-1.5" color={t.acierto < 60 ? 'bg-medico-red' : t.acierto < 80 ? 'bg-medico-orange' : 'bg-medico-green'} />
                                                <p className="text-[11px] text-medico-gray mt-0.5">{t.vistas}/{t.totalPreguntas} vistas · {t.erroresPendientes} errores</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card>
                        </div>

                        {/* Actividad */}
                        <Card className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Flame className="w-5 h-5 text-medico-orange" />
                                <h2 className="font-sans text-lg font-semibold text-gray-900">Actividad · últimos 30 días</h2>
                            </div>
                            <Actividad dias={p.actividad30dias} />
                            <p className="text-xs text-medico-gray mt-3">
                                Banco disponible: {carreraInfo?.cursos.map(c => c.titulo).join(' · ')}
                            </p>
                        </Card>
                    </>
                )}
            </div>
        </Layout>
    )
}

const Actividad = ({ dias }) => {
    const mapa = new Map(dias.map(d => [new Date(d.dia).toISOString().slice(0, 10), d.respuestas]))
    const hoy = new Date()
    const celdas = []
    for (let i = 29; i >= 0; i--) {
        const d = new Date(hoy); d.setDate(hoy.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        const n = mapa.get(key) || 0
        celdas.push({ key, n, label: d.toLocaleDateString('es-EC', { day: 'numeric', month: 'short' }) })
    }
    const nivel = n => n === 0 ? 'bg-gray-100' : n < 10 ? 'bg-blue-200' : n < 30 ? 'bg-blue-400' : 'bg-medico-blue'
    return (
        <div className="flex gap-1.5 flex-wrap">
            {celdas.map(c => <div key={c.key} title={`${c.label}: ${c.n} respuestas`} className={`w-5 h-5 rounded-md ${nivel(c.n)}`} />)}
        </div>
    )
}

export default SimuladorProgreso
