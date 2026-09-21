// src/simulador/SimuladorInicio.jsx - Ruta de aprendizaje (unidades → lecciones) estilo camino
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Lock, Check, Star, Crown, RotateCcw, Sparkles, SlidersHorizontal, BarChart3, History, ChevronDown, ChevronUp, BookOpen, Trophy, Flag } from 'lucide-react'
import Layout from '../utils/Layout'
import simuladorService from '../services/simulador'
import { Card, Button, Pill, Loading, EmptyState, Alert, SegmentedControl, StatsBar, Modal, ProgressBar } from './ui'
import { useCached } from './useCached'

const CARRERA_KEY = 'simulador_carrera'

const SimuladorInicio = () => {
    const navigate = useNavigate()
    const [carrera, setCarrera] = useState(localStorage.getItem(CARRERA_KEY) || '')
    const [error, setError] = useState('')
    const [abiertas, setAbiertas] = useState(null)
    const [leccionSel, setLeccionSel] = useState(null)   // { unidad, leccion }
    const [pruebaSel, setPruebaSel] = useState(null)     // unidad
    const [creando, setCreando] = useState(false)

    // Carreras (cacheadas) → si la guardada no existe, se toma la primera
    const carrerasQ = useCached('carreras', () => simuladorService.getCarreras())
    const carreras = carrerasQ.data?.carreras || []
    useEffect(() => {
        if (carreras.length && !carreras.find(c => c.carrera === carrera)) setCarrera(carreras[0].carrera)
    }, [carreras, carrera])
    useEffect(() => { if (carrera) localStorage.setItem(CARRERA_KEY, carrera) }, [carrera])

    const rutaQ = useCached(carrera ? `ruta:${carrera}` : null, () => simuladorService.getRuta(carrera))
    const ruta = rutaQ.data
    const loading = carrerasQ.loading || (carrera && rutaQ.loading)

    // Abrir por defecto la unidad con la siguiente lección (o la primera)
    useEffect(() => {
        if (!ruta || abiertas) return
        const actual = ruta.siguiente?.unidadId || ruta.unidades[0]?.id
        setAbiertas(actual ? { [actual]: true } : {})
    }, [ruta, abiertas])
    useEffect(() => { setAbiertas(null) }, [carrera])
    useEffect(() => { if (carrerasQ.error || rutaQ.error) setError(carrerasQ.error || rutaQ.error) }, [carrerasQ.error, rutaQ.error])

    const iniciarLeccion = async (leccionId, modo) => {
        setCreando(true)
        const r = await simuladorService.iniciarLeccion(leccionId, modo)
        setCreando(false)
        if (r.success) navigate(`/simulador/sesion/${r.data.sesion.id}`)
        else { setError(r.error); setLeccionSel(null) }
    }

    const iniciarPrueba = async (unidadId) => {
        setCreando(true)
        const r = await simuladorService.iniciarPruebaUnidad(unidadId)
        setCreando(false)
        if (r.success) navigate(`/simulador/sesion/${r.data.sesion.id}`)
        else { setError(r.error); setPruebaSel(null) }
    }

    const sesionRapida = async (origen) => {
        setCreando(true)
        const r = await simuladorService.crearSesion({ carrera, modo: 'practica', origen, numPreguntas: 20 })
        setCreando(false)
        if (r.success) navigate(`/simulador/sesion/${r.data.sesion.id}`)
        else setError(r.error)
    }


    if (loading && !ruta) return <Layout showSidebar><Loading text="Preparando tu ruta…" /></Layout>

    if (!carrerasQ.loading && carreras.length === 0) {
        return (
            <Layout showSidebar>
                <div className="p-6 md:p-8">
                    <EmptyState icon={BookOpen} title="Aún no tienes una ruta de aprendizaje"
                                description="El simulador usa el banco de preguntas de los cursos en los que estás habilitado."
                                action={<Button to="/mis-cursos">Ver mis cursos</Button>} />
                </div>
            </Layout>
        )
    }

    const carreraInfo = carreras.find(c => c.carrera === carrera)
    const errores = carreraInfo?.progreso?.erroresPendientes || 0
    const scrollAUnidad = (id) => document.getElementById(`unidad-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                {/* Cabecera */}
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6">
                    <div>
                        <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-medico-blue mb-1">Simulador interactivo</span>
                        <h1 className="text-3xl text-gray-900 tracking-tight">Tu ruta · {ruta?.carreraLabel || carreraInfo?.label}</h1>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <StatsBar stats={ruta?.stats} />
                        {carreras.length > 1 && (
                            <SegmentedControl value={carrera} onChange={setCarrera} options={carreras.map(c => ({ value: c.carrera, label: c.label }))} />
                        )}
                    </div>
                </div>

                {error && <Alert tone="error" className="mb-6">{error}</Alert>}

                {!ruta ? <Loading /> : (
                    <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr_320px] lg:grid-cols-[1fr_320px] gap-6 items-start">
                        {/* ===== ÍNDICE DE UNIDADES (desktop ancho) ===== */}
                        <nav className="hidden xl:block sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1">
                            <Card className="p-3">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-medico-gray px-2 py-1">Unidades</p>
                                <ul className="space-y-0.5 mt-1">
                                    {ruta.unidades.map((u, i) => {
                                        const esActual = ruta.siguiente?.unidadId === u.id
                                        return (
                                            <li key={u.id}>
                                                <button onClick={() => scrollAUnidad(u.id)} className={`w-full text-left px-2 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-2.5 ${esActual ? 'bg-blue-50' : ''}`}>
                                                    <span className={`w-6 h-6 rounded-lg text-[11px] font-bold flex items-center justify-center flex-shrink-0 ${u.estado === 'dominada' ? 'bg-yellow-300 text-yellow-900' : u.estado === 'completada' ? 'bg-medico-green text-white' : esActual ? 'bg-medico-blue text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                                                    <span className="flex-1 min-w-0">
                                                        <span className="block text-xs font-medium text-gray-800 truncate">{u.titulo}</span>
                                                        <span className="block h-1 bg-gray-100 rounded-full mt-1 overflow-hidden"><span className={`block h-1 rounded-full ${u.estado === 'dominada' ? 'bg-yellow-400' : 'bg-medico-green'}`} style={{ width: `${u.progreso}%` }} /></span>
                                                    </span>
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </Card>
                        </nav>

                        {/* ===== CAMINO ===== */}
                        <div className="space-y-5 min-w-0">
                            {ruta.sesionEnCurso && (
                                <Card tint="bg-blue-50" className="border-blue-100 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-medico-blue text-white flex items-center justify-center flex-shrink-0"><Play className="w-5 h-5" /></div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900">Tienes una sesión sin terminar</p>
                                        <p className="text-sm text-medico-gray">
                                            {ruta.sesionEnCurso.config?.unidadTitulo ? `${ruta.sesionEnCurso.config.unidadTitulo} · ${ruta.sesionEnCurso.config.leccionTitulo || 'Prueba de unidad'}` : simuladorService.ORIGENES[ruta.sesionEnCurso.origen]?.label}
                                            {' · '}{ruta.sesionEnCurso.respondidas}/{ruta.sesionEnCurso.totalPreguntas} respondidas
                                        </p>
                                    </div>
                                    <Button to={`/simulador/sesion/${ruta.sesionEnCurso.id}`}>Continuar</Button>
                                </Card>
                            )}

                            {ruta.unidades.map((u, ui) => {
                                const esActual = ruta.siguiente?.unidadId === u.id
                                const abierta = abiertas?.[u.id] ?? (esActual || u.estado !== 'pendiente')
                                const tono = u.estado === 'dominada' ? 'from-yellow-400 to-amber-500' : u.estado === 'completada' ? 'from-medico-green to-emerald-700' : esActual || u.estado === 'en_curso' ? 'from-medico-blue to-blue-800' : 'from-gray-400 to-gray-500'
                                return (
                                    <Card key={u.id} id={`unidad-${u.id}`} className="overflow-hidden scroll-mt-24">
                                        {/* Cabecera de unidad */}
                                        <div className={`bg-gradient-to-r ${tono} text-white px-5 md:px-6 py-4 flex flex-col md:flex-row md:items-center gap-3`}>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Unidad {ui + 1}{u.estado === 'dominada' && ' · dominada'}{esActual && ' · en curso'}</p>
                                                <h2 className="font-sans text-lg md:text-xl font-semibold leading-snug truncate">{u.titulo}</h2>
                                                <p className="text-xs text-white/80 mt-0.5">{u.nPreguntas} preguntas · {u.completadas}/{u.lecciones.length} lecciones{u.dominadas > 0 && ` · ${u.dominadas} perfectas`}</p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className="hidden md:block w-40">
                                                    <div className="flex justify-between text-[11px] text-white/80 mb-1"><span>Progreso</span><span>{u.progreso}%</span></div>
                                                    <div className="h-2 bg-white/25 rounded-full overflow-hidden"><div className="h-2 bg-white rounded-full" style={{ width: `${u.progreso}%` }} /></div>
                                                </div>
                                                <button onClick={() => setPruebaSel(u)} title="Prueba de unidad: 25 preguntas en modo examen. Si apruebas, dominas la unidad."
                                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${u.pruebaAprobada ? 'bg-white text-amber-700' : 'bg-white/15 hover:bg-white/25 text-white border border-white/30'}`}>
                                                    <Crown className={`w-4 h-4 ${u.pruebaAprobada ? 'fill-current' : ''}`} /> {u.pruebaAprobada ? `${Math.round(u.mejorPrueba)}%` : 'Prueba'}
                                                </button>
                                                <button onClick={() => setAbiertas(a => ({ ...(a || {}), [u.id]: !abierta }))} className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white" title={abierta ? 'Ocultar lecciones' : 'Ver lecciones'}>
                                                    {abierta ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Lecciones en fila (camino horizontal) */}
                                        {abierta && (
                                            <div className="px-5 md:px-6 py-5">
                                                <div className="flex flex-wrap items-start gap-y-6">
                                                    {u.lecciones.map((l, li) => {
                                                        const esSiguiente = ruta.siguiente?.leccionId === l.id
                                                        const conector = li < u.lecciones.length - 1 || true
                                                        const done = ['completada', 'dominada'].includes(l.estado)
                                                        return (
                                                            <div key={l.id} className="flex items-start">
                                                                <div className="relative flex flex-col items-center w-[84px]">
                                                                    <LessonNode leccion={l} activa={esSiguiente} onClick={() => l.estado !== 'bloqueada' && setLeccionSel({ unidad: u, leccion: l })} />
                                                                    <span className={`mt-1.5 text-[11px] ${esSiguiente ? 'font-bold text-medico-blue' : 'text-medico-gray'}`}>{esSiguiente ? 'Empezar aquí' : l.mejorAcierto !== null ? `${Math.round(l.mejorAcierto)}%` : `${l.nPreguntas} preg.`}</span>
                                                                </div>
                                                                {conector && <div className={`w-4 md:w-6 h-1.5 rounded-full mt-[29px] ${done ? 'bg-medico-green' : 'bg-gray-200'}`} />}
                                                            </div>
                                                        )
                                                    })}
                                                    <div className="flex flex-col items-center w-[84px]">
                                                        <button onClick={() => setPruebaSel(u)} className={`w-16 h-16 rounded-full flex items-center justify-center border-4 transition-transform hover:scale-105 ${u.pruebaAprobada ? 'bg-yellow-300 border-yellow-400 text-yellow-900' : 'bg-white border-gray-200 text-gray-400 hover:border-yellow-300 hover:text-yellow-500'}`} title="Prueba de unidad">
                                                            <Trophy className={`w-7 h-7 ${u.pruebaAprobada ? 'fill-current' : ''}`} />
                                                        </button>
                                                        <span className="mt-1.5 text-[11px] text-medico-gray">Prueba</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                )
                            })}
                        </div>

                        {/* ===== COLUMNA DERECHA ===== */}
                        <aside className="space-y-4 lg:sticky lg:top-24">
                            {ruta.siguiente ? (
                                <Card className="p-5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-medico-gray">Siguiente paso</p>
                                    <p className="font-semibold text-gray-900 mt-1">{ruta.siguiente.leccionTitulo}</p>
                                    <p className="text-sm text-medico-gray truncate">{ruta.siguiente.unidadTitulo}</p>
                                    <Button className="w-full mt-4" size="lg" loading={creando} onClick={() => iniciarLeccion(ruta.siguiente.leccionId, 'practica')}>
                                        <Play className="w-5 h-5" /> Continuar ruta
                                    </Button>
                                </Card>
                            ) : (
                                <Card tint="bg-emerald-50" className="p-5 border-emerald-100">
                                    <Trophy className="w-8 h-8 text-medico-green mb-2" />
                                    <p className="font-semibold text-gray-900">¡Completaste toda la ruta!</p>
                                    <p className="text-sm text-medico-gray">Sigue con repasos de errores y sesiones adaptativas.</p>
                                </Card>
                            )}

                            <Card className="p-5">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-medico-gray">Progreso de la ruta</p>
                                    <span className="text-sm font-semibold text-gray-900">{ruta.resumen.progreso}%</span>
                                </div>
                                <ProgressBar value={ruta.resumen.progreso} height="h-2.5" color="bg-medico-green" />
                                <p className="text-xs text-medico-gray mt-2">{ruta.resumen.leccionesCompletadas} de {ruta.resumen.lecciones} lecciones · {ruta.resumen.unidadesDominadas} de {ruta.resumen.unidades} unidades dominadas</p>
                            </Card>

                            <Card className="p-5">
                                <p className="text-xs font-semibold uppercase tracking-wider text-medico-gray mb-3">Practicar</p>
                                <div className="space-y-2">
                                    <QuickAction icon={RotateCcw} tint="bg-red-50 text-medico-red" title="Repasar mis errores" sub={errores > 0 ? `${errores} preguntas falladas` : 'Sin errores pendientes'} disabled={errores === 0 || creando} onClick={() => sesionRapida('errores')} />
                                    <QuickAction icon={Sparkles} tint="bg-blue-50 text-medico-blue" title="Sesión adaptativa" sub="20 preguntas según tus debilidades" disabled={creando} onClick={() => sesionRapida('adaptativo')} />
                                    <QuickAction icon={SlidersHorizontal} tint="bg-gray-100 text-gray-700" title="Sesión personalizada" sub="Área, cantidad, tiempo y modo" onClick={() => navigate(`/simulador/nueva?carrera=${carrera}`)} />
                                </div>
                            </Card>

                            <Card className="p-5">
                                <div className="space-y-2">
                                    <QuickAction icon={BarChart3} tint="bg-emerald-50 text-medico-green" title="Mi progreso y debilidades" sub="Acierto por área, tendencia, cobertura" onClick={() => navigate('/simulador/progreso')} />
                                    <QuickAction icon={History} tint="bg-gray-100 text-gray-700" title="Historial" sub="Todas tus sesiones finalizadas" onClick={() => navigate('/simulador/historial')} />
                                </div>
                            </Card>
                        </aside>
                    </div>
                )}
            </div>

            {/* Modal lección */}
            <Modal open={!!leccionSel} onClose={() => !creando && setLeccionSel(null)}
                   title={leccionSel ? `${leccionSel.leccion.titulo} · ${leccionSel.unidad.titulo}` : ''}
                   footer={leccionSel && <>
                       <Button variant="secondary" onClick={() => iniciarLeccion(leccionSel.leccion.id, 'examen')} loading={creando}>Modo examen</Button>
                       <Button onClick={() => iniciarLeccion(leccionSel.leccion.id, 'practica')} loading={creando}><Play className="w-4 h-4" /> Practicar</Button>
                   </>}>
                {leccionSel && (
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <Pill className="bg-gray-50 text-gray-700 border-gray-100">{leccionSel.leccion.nPreguntas} preguntas</Pill>
                            {leccionSel.leccion.mejorAcierto !== null && <Pill className="bg-blue-50 text-medico-blue border-blue-100">Mejor: {Math.round(leccionSel.leccion.mejorAcierto)}%</Pill>}
                            {leccionSel.leccion.intentos > 0 && <Pill className="bg-gray-50 text-gray-700 border-gray-100">{leccionSel.leccion.intentos} intento{leccionSel.leccion.intentos > 1 ? 's' : ''}</Pill>}
                            {leccionSel.leccion.errores > 0 && <Pill className="bg-red-50 text-medico-red border-red-100">{leccionSel.leccion.errores} por repasar</Pill>}
                        </div>
                        <p>Completa la lección con al menos <strong>{ruta?.resumen.umbral}%</strong> para desbloquear la siguiente. Con 100% la marcas como <strong>perfecta</strong>.</p>
                        <p className="text-medico-gray text-xs">Practicar: ves la respuesta y la explicación en cada pregunta. Modo examen: sin pistas hasta el final.</p>
                    </div>
                )}
            </Modal>

            {/* Modal prueba de unidad */}
            <Modal open={!!pruebaSel} onClose={() => !creando && setPruebaSel(null)} title={pruebaSel ? `Prueba de unidad · ${pruebaSel.titulo}` : ''}
                   footer={pruebaSel && <>
                       <Button variant="secondary" onClick={() => setPruebaSel(null)} disabled={creando}>Ahora no</Button>
                       <Button onClick={() => iniciarPrueba(pruebaSel.id)} loading={creando}><Crown className="w-4 h-4" /> Empezar prueba</Button>
                   </>}>
                {pruebaSel && (
                    <div className="space-y-2">
                        <p><strong>25 preguntas</strong> al azar de la unidad en <strong>modo examen</strong> con <strong>40 minutos</strong>. Sin pistas hasta terminar.</p>
                        <p>Si obtienes <strong>{ruta?.resumen.umbral}% o más</strong>, la unidad queda <strong>dominada</strong> y se desbloquean todas sus lecciones (+100 XP).</p>
                        {pruebaSel.intentosPrueba > 0 && <p className="text-xs text-medico-gray">Intentos previos: {pruebaSel.intentosPrueba} · mejor {Math.round(pruebaSel.mejorPrueba)}%</p>}
                    </div>
                )}
            </Modal>
        </Layout>
    )
}

const LessonNode = ({ leccion, activa, onClick }) => {
    const base = 'w-16 h-16 rounded-full flex items-center justify-center border-4 transition-transform'
    let cls, icon
    switch (leccion.estado) {
        case 'bloqueada':
            cls = `${base} bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed`
            icon = <Lock className="w-5 h-5" />
            break
        case 'dominada':
            cls = `${base} bg-yellow-300 border-yellow-400 text-yellow-900 hover:scale-105`
            icon = <Star className="w-6 h-6 fill-current" />
            break
        case 'completada':
            cls = `${base} bg-medico-green border-emerald-600 text-white hover:scale-105`
            icon = <Check className="w-6 h-6" strokeWidth={3} />
            break
        case 'en_curso':
            cls = `${base} bg-white border-medico-blue text-medico-blue hover:scale-105`
            icon = <Flag className="w-5 h-5" />
            break
        default:
            cls = `${base} ${activa ? 'bg-medico-blue border-blue-900 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-500'} hover:scale-105`
            icon = activa ? <Play className="w-6 h-6 fill-current" /> : <span className="text-base font-bold">{leccion.orden}</span>
    }
    return (
        <button onClick={onClick} disabled={leccion.estado === 'bloqueada'} className={cls}
                title={`${leccion.titulo} · ${leccion.nPreguntas} preguntas${leccion.mejorAcierto !== null ? ` · mejor ${Math.round(leccion.mejorAcierto)}%` : ''}`}>
            {icon}
        </button>
    )
}

const QuickAction = ({ icon: Icon, tint, title, sub, onClick, disabled }) => (
    <button onClick={onClick} disabled={disabled} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${tint}`}><Icon className="w-5 h-5" /></span>
        <span className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-gray-900">{title}</span>
            <span className="block text-xs text-medico-gray truncate">{sub}</span>
        </span>
    </button>
)

export default SimuladorInicio
