// src/panel/MyProgress.jsx — Mi progreso: una sola vista con todo lo que el alumno avanza en la plataforma.
// Cursos (clases), cronograma, entrenador (mapa de dominio, racha), plan de estudio, lecturas y simulacros.
// Layout en dos columnas para que no queden huecos: izquierda cronograma + cursos; derecha entrenador, para hoy,
// lecturas y últimos simulacros.
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    BookOpen, CheckCircle2, ClipboardList, Flame, Zap, Target, Dumbbell, ChevronRight, RotateCcw, CalendarClock, Video, Trophy, Sparkles, Play
} from 'lucide-react'
import Layout from '../utils/Layout'
import { PageHeader, Card, Pill, ProgressBar, Ring, Loading } from '../simulador/ui'
import { useAuth } from '../utils/AuthContext'
import progressService from '../services/progress'
import simuladorService from '../services/simulador'
import simulacrosService from '../services/simulacros'
import bibliotecaService from '../services/biblioteca'
import { useCached } from '../simulador/useCached'
import { CronogramaProgreso } from '../cronograma/CronogramaWidgets'
import { limpiarTitulo } from '../biblioteca/Biblioteca'

const colorPuntaje = (p) => p >= 80 ? 'text-medico-green' : p >= 70 ? 'text-medico-blue' : p >= 60 ? 'text-medico-orange' : 'text-medico-red'
const hace = (d) => {
    if (!d) return ''
    const dias = Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
    return dias <= 0 ? 'hoy' : dias === 1 ? 'ayer' : `hace ${dias} d`
}

const MyProgress = () => {
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [loading, setLoading] = useState(true)
    const [estadisticas, setEstadisticas] = useState({})
    const [cursos, setCursos] = useState([])
    const [intentos, setIntentos] = useState([])

    // Entrenador y plan: cacheados como en el resto del simulador (sin micro recargas)
    const carrerasQ = useCached('carreras', () => simuladorService.getCarreras())
    const carrera = carrerasQ.data?.carreras?.[0]?.carrera || null
    const mapaQ = useCached(carrera ? `mapa:${carrera}` : null, () => simuladorService.getMapa(carrera))
    const planQ = useCached(carrera ? `plan:${carrera}` : null, () => simuladorService.getPlan(carrera))
    const bibliotecaQ = useCached('biblioteca', () => bibliotecaService.listar())
    const mapa = mapaQ.data
    const plan = planQ.data

    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return }
        let vivo = true
        ;(async () => {
            const [r, a] = await Promise.all([progressService.getMyOverallProgress(), simulacrosService.getMyAttempts()])
            if (!vivo) return
            if (r.success) { setEstadisticas(r.data.estadisticas || {}); setCursos(r.data.cursos || []) }
            if (a.success) setIntentos((a.data.intentos || []).slice(0, 5))
            setLoading(false)
        })()
        return () => { vivo = false }
    }, [isAuthenticated, navigate])

    const lecturas = useMemo(() => {
        const mats = (bibliotecaQ.data?.grupos || []).flatMap(g => g.materiales || [])
        return mats.filter(m => m.lectura && !m.lectura.completado).sort((a, b) => new Date(b.lectura.ultimaVez) - new Date(a.lectura.ultimaVez)).slice(0, 3)
    }, [bibliotecaQ.data])
    const debiles = useMemo(() => (mapa?.areas || []).filter(a => a.nivel === 'debil').sort((a, b) => (a.acierto ?? 0) - (b.acierto ?? 0)).slice(0, 3), [mapa])
    const sinExplorar = mapa?.resumen?.sinExplorar || 0
    const totalClases = cursos.reduce((s, c) => s + (parseInt(c.total_clases) || 0), 0)
    const ph = plan?.paraHoy

    if (loading) return <Layout showSidebar><Loading text="Cargando tu progreso…" /></Layout>

    return (
        <Layout showSidebar>
            <div className="p-4 sm:p-6 md:p-8">
                <PageHeader eyebrow="Mi aprendizaje" title="Mi progreso" subtitle="Todo lo que avanzas en la plataforma, en un solo lugar." />

                {/* ===== Indicadores ===== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <Indicador icon={Video} tint="bg-blue-50 text-medico-blue" valor={estadisticas.total_clases_completadas || 0} label="Clases completadas" sub={totalClases ? `de ${totalClases}` : ''} />
                    <Indicador icon={ClipboardList} tint="bg-purple-50 text-purple-700" valor={estadisticas.simulacros_realizados || 0} label="Simulacros" sub={estadisticas.promedio_simulacros ? `promedio ${Math.round(estadisticas.promedio_simulacros)}%` : 'sin intentos aún'} />
                    <Indicador icon={Zap} tint="bg-emerald-50 text-medico-green" valor={mapa?.resumen?.vistas ?? 0} label="Preguntas entrenadas" sub={mapa?.resumen ? `${mapa.resumen.dominadas} áreas dominadas` : 'entrenador'} />
                    <Indicador icon={Flame} tint="bg-orange-50 text-medico-orange" valor={mapa?.stats?.rachaDias ?? 0} label="Días de racha" sub={mapa?.stats ? `mejor ${mapa.stats.mejorRacha} · ${mapa.stats.xp} XP` : ''} />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start">
                    {/* ===== Columna principal ===== */}
                    <div className="space-y-6 min-w-0">
                        <CronogramaProgreso unaColumna />

                        {/* Progreso por curso */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Progreso por curso</h2>
                            {cursos.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="font-semibold text-gray-900">No tienes cursos en progreso</p>
                                    <p className="text-sm text-medico-gray mt-1 mb-4">Inscríbete a un curso para comenzar tu aprendizaje.</p>
                                    <Link to="/cursos" className="inline-flex px-5 py-2.5 rounded-full bg-medico-blue text-white text-sm font-medium">Explorar cursos</Link>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {cursos.map(c => {
                                        const pct = Math.round(c.porcentaje_progreso || 0)
                                        const stats = progressService.getProgressStats({ porcentaje_progreso: pct })
                                        return (
                                            <Card key={c.curso_id} className="p-4 sm:p-5">
                                                <div className="flex items-center gap-4">
                                                    {c.miniatura_url && <img src={c.miniatura_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0 hidden sm:block" />}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-semibold text-gray-900 truncate">{limpiarTitulo(c.titulo)}</h3>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-medico-gray">
                                                            <Pill className={`${stats.bgColor} ${stats.textColor}`}>{stats.nivel}</Pill>
                                                            <span>{c.clases_completadas}/{c.total_clases} clases</span>
                                                            {c.ultima_actividad && <span>Última vez {hace(c.ultima_actividad)}</span>}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <ProgressBar value={pct} className="flex-1" color={pct >= 70 ? 'bg-medico-green' : pct >= 30 ? 'bg-medico-blue' : 'bg-medico-orange'} />
                                                            <span className="text-sm font-semibold text-gray-900 tabular-nums w-10 text-right">{pct}%</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                                                        <Link to={`/biblioteca?curso=${c.curso_id}`} className="hidden sm:inline-flex items-center gap-1 px-3 py-2 rounded-full border border-gray-200 text-xs font-medium text-gray-700 hover:border-medico-blue"><BookOpen className="w-3.5 h-3.5" /> Manuales</Link>
                                                        <button onClick={() => navigate(`/estudiar/${c.curso_id}`)} className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-medico-blue text-white text-xs font-medium"><Play className="w-3.5 h-3.5" /> Continuar</button>
                                                    </div>
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Últimos simulacros */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Últimos simulacros</h2>
                                <Link to="/simulacros" className="text-sm text-medico-blue hover:underline inline-flex items-center gap-1">Ver todos <ChevronRight className="w-4 h-4" /></Link>
                            </div>
                            {intentos.length === 0 ? (
                                <Card className="p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                                    <ClipboardList className="w-8 h-8 text-gray-300 flex-shrink-0" />
                                    <div className="flex-1"><p className="font-medium text-gray-900">Aún no has hecho simulacros</p><p className="text-sm text-medico-gray">Mide tu nivel con un simulacro completo de tu curso.</p></div>
                                    <Link to="/simulacros" className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-medico-blue text-white text-sm font-medium">Ir a simulacros</Link>
                                </Card>
                            ) : (
                                <Card className="divide-y divide-gray-100 p-0 overflow-hidden">
                                    {intentos.map(i => {
                                        const p = Math.round(parseFloat(i.puntaje) || 0)
                                        return (
                                            <Link key={i.id} to={`/simulacros/resultado?intento=${i.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                                                <span className={`w-12 text-center text-lg font-bold tabular-nums ${colorPuntaje(p)}`}>{p}%</span>
                                                <span className="flex-1 min-w-0"><span className="block text-sm font-medium text-gray-900 truncate">{limpiarTitulo(i.simulacro_titulo)}</span><span className="block text-xs text-medico-gray">{new Date(i.fecha_intento).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} · {i.respuestas_correctas}/{i.total_preguntas} correctas</span></span>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </Link>
                                        )
                                    })}
                                </Card>
                            )}
                        </section>
                    </div>

                    {/* ===== Columna lateral ===== */}
                    <div className="space-y-6">
                        {/* Entrenador */}
                        <Card className="p-5">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2"><Zap className="w-5 h-5 text-medico-blue" /> Entrenador CACES</h2>
                                {mapa && <Link to="/simulador" className="text-xs text-medico-blue hover:underline">Ver mapa</Link>}
                            </div>
                            {!carrera ? (
                                <p className="text-sm text-medico-gray">Cuando estés inscrito en un curso, aquí verás tu mapa de dominio por especialidad.</p>
                            ) : !mapa ? <Loading text="Cargando…" /> : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <Ring value={mapa.resumen?.preparacion || 0} size={84} stroke={9} color="#1e40af" label={`${Math.round(mapa.resumen?.preparacion || 0)}%`} sub="preparación" />
                                        <div className="flex-1 grid grid-cols-3 gap-1.5 text-center">
                                            <Mini n={mapa.resumen?.dominadas || 0} l="dominadas" c="text-medico-green" />
                                            <Mini n={mapa.resumen?.debiles || 0} l="débiles" c="text-medico-red" />
                                            <Mini n={sinExplorar} l="sin explorar" c="text-gray-500" />
                                        </div>
                                    </div>
                                    {debiles.length > 0 ? (
                                        <div className="mt-4">
                                            <p className="text-[11px] font-semibold uppercase tracking-wide text-medico-gray mb-2">Donde más fallas</p>
                                            <ul className="space-y-1.5">
                                                {debiles.map(a => (
                                                    <li key={a.id} className="flex items-center gap-2 text-sm">
                                                        <span className="flex-1 truncate text-gray-900">{a.nombre}</span>
                                                        <span className="text-xs font-semibold text-medico-red tabular-nums">{Math.round(a.acierto ?? 0)}%</span>
                                                        <Link to="/simulador" className="inline-flex items-center gap-1 text-xs font-medium text-medico-blue hover:underline"><Dumbbell className="w-3.5 h-3.5" /> Entrenar</Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-sm text-medico-gray">{mapa.diagnostico ? 'Sin áreas débiles por ahora. Sigue con tus repasos.' : 'Haz el diagnóstico para descubrir tus áreas débiles.'}</p>
                                    )}
                                    <Link to="/simulador" className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-medico-blue text-white text-sm font-medium"><Sparkles className="w-4 h-4" /> {mapa.hoy?.cumplida ? 'Sesión extra' : 'Mi sesión de hoy'}</Link>
                                </>
                            )}
                        </Card>

                        {/* Para hoy (plan) */}
                        {ph && (
                            <Card className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2"><Target className="w-5 h-5 text-medico-blue" /> Para hoy</h2>
                                    <Link to="/simulador/plan" className="text-xs text-medico-blue hover:underline">Mi plan</Link>
                                </div>
                                <ul className="space-y-2 text-sm">
                                    <Tarea icon={RotateCcw} ok={ph.repasosVencidos === 0} texto={ph.repasosVencidos > 0 ? `${ph.repasosVencidos} repasos vencidos` : 'Repasos al día'} to="/simulador" />
                                    <Tarea icon={CalendarClock} ok={(ph.clasesAtrasadas || 0) === 0} texto={ph.clasesAtrasadas > 0 ? `${ph.clasesAtrasadas} clases atrasadas del cronograma` : 'Cronograma al día'} to="/cronograma" />
                                    <Tarea icon={CheckCircle2} ok={(plan.objetivos || []).filter(o => !o.hecho).length === 0} texto={(() => { const n = (plan.objetivos || []).filter(o => !o.hecho).length; return n === 1 ? "1 objetivo pendiente" : `${n} objetivos pendientes` })()} to="/simulador/plan" />
                                </ul>
                            </Card>
                        )}

                        {/* Lecturas en curso */}
                        {lecturas.length > 0 && (
                            <Card className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-base font-semibold text-gray-900 inline-flex items-center gap-2"><BookOpen className="w-5 h-5 text-amber-600" /> Sigue leyendo</h2>
                                    <Link to="/biblioteca" className="text-xs text-medico-blue hover:underline">Biblioteca</Link>
                                </div>
                                <ul className="space-y-2">
                                    {lecturas.map(m => (
                                        <li key={m.id}>
                                            <Link to={`/biblioteca/leer/${m.id}`} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-gray-50">
                                                <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0"><BookOpen className="w-4 h-4" /></span>
                                                <span className="flex-1 min-w-0"><span className="block text-sm font-medium text-gray-900 truncate">{limpiarTitulo(m.titulo)}</span><span className="block text-xs text-medico-gray">Página {m.lectura.ultimaPagina}{m.lectura.totalPaginas ? ` de ${m.lectura.totalPaginas}` : ''} · {m.lectura.porcentaje}%</span></span>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        )}

                        {/* Logro */}
                        {mapa?.stats && (
                            <Card className="p-5 bg-gradient-to-br from-medico-blue to-blue-900 text-white">
                                <div className="flex items-center gap-3">
                                    <span className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center"><Trophy className="w-6 h-6" /></span>
                                    <div className="flex-1">
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-blue-100">Nivel {mapa.stats.nivel}</p>
                                        <p className="font-semibold">{mapa.stats.xp} XP · {mapa.stats.xpSiguienteNivel - mapa.stats.xp} para el siguiente</p>
                                    </div>
                                </div>
                                <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-emerald-300" style={{ width: `${Math.min(100, Math.round((100 * (mapa.stats.xp - mapa.stats.xpNivelActual)) / Math.max(1, mapa.stats.xpSiguienteNivel - mapa.stats.xpNivelActual)))}%` }} /></div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}

const Indicador = ({ icon: Icon, tint, valor, label, sub }) => (
    <Card className="p-4 flex items-center gap-3">
        <span className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${tint}`}><Icon className="w-5 h-5" /></span>
        <div className="min-w-0">
            <p className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{valor}</p>
            <p className="text-xs text-gray-700 mt-1">{label}</p>
            {sub && <p className="text-[11px] text-medico-gray truncate">{sub}</p>}
        </div>
    </Card>
)
const Mini = ({ n, l, c }) => <div className="rounded-xl bg-gray-50 p-2"><p className={`text-lg font-semibold leading-none ${c}`}>{n}</p><p className="text-[10px] text-medico-gray mt-1">{l}</p></div>
const Tarea = ({ icon: Icon, ok, texto, to }) => (
    <li>
        <Link to={to} className="flex items-center gap-2 p-2 -mx-2 rounded-xl hover:bg-gray-50">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${ok ? 'bg-emerald-50 text-medico-green' : 'bg-orange-50 text-medico-orange'}`}><Icon className="w-3.5 h-3.5" /></span>
            <span className={`flex-1 ${ok ? 'text-medico-gray' : 'text-gray-900 font-medium'}`}>{texto}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
        </Link>
    </li>
)

export default MyProgress
