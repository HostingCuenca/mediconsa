// src/adminpanel/FichaEstudiante.jsx - Admin: ficha del estudiante
// Todo lo que el alumno ha hecho: cursos y avance, actividad día a día, simulacros (con detalle de cada intento),
// entrenador (sesiones y mapa de dominio), clases, biblioteca, plan y accesos. Sirve para ver de un vistazo
// si un alumno realmente estudió.
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft, CalendarDays, Clock, Flame, BookOpen, ClipboardList, Dumbbell, Video, ShieldAlert, MapPin, Monitor, Smartphone, Tablet,
    CheckCircle2, XCircle, ChevronRight, Activity, GraduationCap, Target, RefreshCw
} from 'lucide-react'
import Layout from '../utils/Layout'
import apiService from '../services/api'
import simuladorService from '../services/simulador'
import seguridadService from '../services/seguridad'
import { Card, PageHeader, Button, Pill, Loading, Alert, SegmentedControl, ProgressBar, Modal, EmptyState } from '../simulador/ui'
import { limpiarTitulo } from '../biblioteca/Biblioteca'

const fecha = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => (d ? new Date(d).toLocaleDateString('es-EC', opts) : '—')
const fechaHora = (d) => (d ? new Date(d).toLocaleString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—')
const colorPuntaje = (p) => (p === null || p === undefined ? 'bg-gray-100 text-gray-600' : p >= 80 ? 'bg-emerald-100 text-emerald-800' : p >= 70 ? 'bg-blue-100 text-blue-800' : p >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700')
const IconoTipo = ({ tipo, className = 'w-4 h-4' }) => tipo === 'movil' ? <Smartphone className={className} /> : tipo === 'tablet' ? <Tablet className={className} /> : <Monitor className={className} />
const ESTADO_PAGO = { habilitado: 'bg-emerald-100 text-emerald-800', pendiente: 'bg-amber-100 text-amber-800', rechazado: 'bg-red-100 text-red-700', pagado: 'bg-emerald-100 text-emerald-800' }

const FichaEstudiante = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(true)
    const [tab, setTab] = useState('simulacros')
    const [intento, setIntento] = useState(null)

    const cargar = async () => {
        setLoading(true)
        try {
            const r = await apiService.get(`/ficha/${id}`)
            if (r.success) setData(r.data); else setError(r.message || 'Error')
        } catch (e) { setError(e.message) }
        setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cargar() }, [id])

    if (loading && !data) return <Layout showSidebar><Loading text="Reuniendo la actividad del alumno…" /></Layout>
    if (error && !data) return <Layout showSidebar><div className="p-6 md:p-8"><Alert tone="error">{error}</Alert></div></Layout>
    const { usuario: u, resumen: r, cursos, actividad, simulacros, entrenador, biblioteca, ultimasClases, accesos, plan } = data

    const nuncaEstudio = r.diasActivosTotal === 0 || (r.clasesCompletadas === 0 && r.intentos === 0 && r.preguntasEntrenador === 0 && r.materialesLeidos === 0)

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-medico-gray hover:text-medico-blue mb-3"><ArrowLeft className="w-4 h-4" /> Volver</button>
                <PageHeader eyebrow={`${u.email}${u.telefono ? ` · ${u.telefono}` : ''} · registro ${fecha(u.registro)}`} title={u.nombre}
                            subtitle={r.enLinea ? 'En línea ahora' : `Última actividad: ${r.ultimaActividad ? `${seguridadService.hace(r.ultimaActividad)} (${fechaHora(r.ultimaActividad)})` : 'nunca'}${r.ciudades ? ` · ${r.ciudades}` : ''}`}
                            actions={<>
                                {!u.activo && <Pill className="bg-red-100 text-red-700">Cuenta desactivada</Pill>}
                                <Button variant="secondary" onClick={cargar}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></Button>
                                <Button variant="secondary" to={`/admin/seguridad/${u.id}`}><ShieldAlert className="w-4 h-4" /> Seguridad</Button>
                            </>} />

                {nuncaEstudio && (
                    <Alert tone="warn" className="mb-6"><strong>Sin actividad de estudio registrada.</strong> Este alumno no ha completado clases, ni simulacros, ni preguntas del entrenador, ni lecturas.</Alert>
                )}

                {/* ===== Resumen ===== */}
                <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
                    <Resumen icon={CalendarDays} label="Días activos" value={r.diasActivosTotal} hint={`${r.diasActivos30} en 30 d · ${r.diasActivos90} en 90 d`} />
                    <Resumen icon={Clock} label="Horas de estudio" value={r.horasEstudio} hint="simulacros + entrenador + lectura" />
                    <Resumen icon={Video} label="Clases completadas" value={r.clasesCompletadas} hint={cursos.length ? `de ${cursos.reduce((a, c) => a + c.totalClases, 0)}` : ''} />
                    <Resumen icon={ClipboardList} label="Simulacros" value={r.intentos} hint="intentos" />
                    <Resumen icon={Dumbbell} label="Entrenador" value={r.preguntasEntrenador} hint={`${r.sesionesEntrenador} sesiones`} />
                    <Resumen icon={BookOpen} label="Manuales" value={r.materialesLeidos} hint={`${r.minutosLectura} min de lectura`} />
                    <Resumen icon={Flame} label="Racha" value={r.racha} hint={`mejor ${r.mejorRacha} · ${r.xp} XP`} tint={r.racha > 0 ? 'text-medico-orange' : ''} />
                    <Resumen icon={Target} label="Plan de estudio" value={`${plan.hechos}/${plan.total}`} hint="objetivos cumplidos" />
                </div>

                {/* ===== Actividad ===== */}
                <Card className="p-5 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-sans text-base font-semibold text-gray-900 inline-flex items-center gap-2"><Activity className="w-5 h-5 text-medico-blue" /> Actividad · últimos 6 meses</h2>
                        <span className="text-xs text-medico-gray">{r.primeraActividad ? `Primera actividad registrada: ${fecha(r.primeraActividad)}` : 'Sin actividad'}</span>
                    </div>
                    <Heatmap dias={actividad} />
                </Card>

                {/* ===== Cursos ===== */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
                    {cursos.length === 0 && <Card className="p-6"><EmptyState icon={GraduationCap} title="Sin inscripciones" description="Este usuario no se ha inscrito en ningún curso." /></Card>}
                    {cursos.map(c => {
                        const pct = c.totalClases ? Math.round((100 * c.clasesCompletadas) / c.totalClases) : 0
                        return (
                            <Card key={c.inscripcionId} className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{limpiarTitulo(c.titulo)}</h3>
                                        <p className="text-xs text-medico-gray mt-0.5">
                                            Inscrito {fecha(c.fechaInscripcion)}{c.fechaHabilitacion ? ` · habilitado ${fecha(c.fechaHabilitacion)}` : ''}
                                            {c.primeraClase ? ` · primera clase ${fecha(c.primeraClase)}` : ' · nunca abrió una clase'}
                                        </p>
                                    </div>
                                    <div className="flex gap-1.5 flex-shrink-0">
                                        <Pill className={ESTADO_PAGO[c.estadoPago] || 'bg-gray-100 text-gray-600'}>{c.estadoPago}</Pill>
                                        {c.estadoPago === 'habilitado' && c.accesoActivo === false && <Pill className="bg-gray-200 text-gray-700">acceso cerrado</Pill>}
                                        {c.esGratuito && <Pill className="bg-blue-50 text-blue-700">gratuito</Pill>}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-1"><span className="text-medico-gray">Clases completadas</span><span className="font-semibold text-gray-900">{c.clasesCompletadas}/{c.totalClases} · {pct}%</span></div>
                                <ProgressBar value={pct} color={pct >= 70 ? 'bg-medico-green' : pct >= 30 ? 'bg-medico-blue' : 'bg-medico-orange'} className="mb-3" />
                                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                    <Mini label="Simulacros" value={c.intentos} sub={c.promedio !== null ? `prom. ${c.promedio}%` : '—'} />
                                    <Mini label="Última clase" value={c.ultimaClase ? seguridadService.hace(c.ultimaClase) : '—'} sub={c.clasesVistas ? `${c.clasesVistas} vistas` : ''} />
                                    {c.cronograma ? <Mini label="Cronograma" value={`${c.cronograma.hechosATiempo}/${c.cronograma.vencidos}`} sub={c.cronograma.atrasados > 0 ? `${c.cronograma.atrasados} atrasadas` : 'al día'} tint={c.cronograma.atrasados > 5 ? 'text-medico-red' : ''} /> : <Mini label="Cronograma" value="—" sub="sin cronograma" />}
                                </div>
                                {c.modulos.length > 0 && (
                                    <details>
                                        <summary className="cursor-pointer text-xs font-semibold text-medico-gray">Por módulo ({c.modulos.length})</summary>
                                        <ul className="mt-2 space-y-1">
                                            {c.modulos.map(m => (
                                                <li key={m.id} className="flex items-center gap-2 text-xs">
                                                    <span className="flex-1 truncate text-gray-700">{limpiarTitulo(m.titulo)}</span>
                                                    <span className="w-24"><ProgressBar value={m.total ? (100 * m.completadas) / m.total : 0} height="h-1.5" color={m.completadas === m.total && m.total > 0 ? 'bg-medico-green' : 'bg-medico-blue'} /></span>
                                                    <span className="w-12 text-right text-medico-gray tabular-nums">{m.completadas}/{m.total}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </details>
                                )}
                            </Card>
                        )
                    })}
                </div>

                {/* ===== Detalle por pestañas ===== */}
                <SegmentedControl value={tab} onChange={setTab} className="mb-4" options={[
                    { value: 'simulacros', label: `Simulacros (${r.intentos})` }, { value: 'entrenador', label: `Entrenador (${entrenador.sesiones.length})` },
                    { value: 'clases', label: 'Clases' }, { value: 'biblioteca', label: `Biblioteca (${biblioteca.length})` }, { value: 'accesos', label: `Accesos (${accesos.length})` }
                ]} />

                {tab === 'simulacros' && (
                    simulacros.length === 0 ? <Card className="p-6"><EmptyState icon={ClipboardList} title="Sin simulacros" description="No ha realizado ningún simulacro." /></Card> : (
                        <Card className="p-0 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="text-left text-xs uppercase tracking-wide text-medico-gray border-b border-gray-100 bg-gray-50/60"><th className="py-2.5 px-4">Fecha</th><th className="py-2.5 px-3">Simulacro</th><th className="py-2.5 px-3">Puntaje</th><th className="py-2.5 px-3">Correctas</th><th className="py-2.5 px-3">Tiempo</th><th className="py-2.5 px-3"></th></tr></thead>
                                    <tbody>
                                        {simulacros.map(s => (
                                            <tr key={s.id} className="border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer" onClick={() => setIntento(s)}>
                                                <td className="py-2 px-4 text-medico-gray whitespace-nowrap">{fechaHora(s.fecha)}</td>
                                                <td className="py-2 px-3"><span className="block font-medium text-gray-900">{limpiarTitulo(s.titulo)}</span><span className="block text-xs text-medico-gray">{limpiarTitulo(s.curso || '')}{s.modo ? ` · ${s.modo}` : ''}</span></td>
                                                <td className="py-2 px-3"><Pill className={colorPuntaje(s.puntaje)}>{s.puntaje !== null ? `${s.puntaje}%` : '—'}</Pill></td>
                                                <td className="py-2 px-3 tabular-nums">{s.correctas}/{s.total}</td>
                                                <td className="py-2 px-3 text-medico-gray">{s.minutos ? `${s.minutos} min` : '—'}</td>
                                                <td className="py-2 px-3 text-medico-blue"><ChevronRight className="w-4 h-4" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {r.intentos > simulacros.length && <p className="text-xs text-medico-gray px-4 py-2">Mostrando los últimos {simulacros.length} de {r.intentos}.</p>}
                        </Card>
                    )
                )}

                {tab === 'entrenador' && (
                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-4 items-start">
                        {entrenador.sesiones.length === 0 ? <Card className="p-6"><EmptyState icon={Dumbbell} title="Sin sesiones del entrenador" description="No ha usado el simulador interactivo." /></Card> : (
                            <Card className="p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="text-left text-xs uppercase tracking-wide text-medico-gray border-b border-gray-100 bg-gray-50/60"><th className="py-2.5 px-4">Fecha</th><th className="py-2.5 px-3">Sesión</th><th className="py-2.5 px-3">Resultado</th><th className="py-2.5 px-3">Preguntas</th><th className="py-2.5 px-3">Tiempo</th></tr></thead>
                                        <tbody>
                                            {entrenador.sesiones.map(s => (
                                                <tr key={s.id} className="border-b border-gray-50">
                                                    <td className="py-2 px-4 text-medico-gray whitespace-nowrap">{fechaHora(s.iniciadaEn)}</td>
                                                    <td className="py-2 px-3"><span className="block font-medium text-gray-900">{simuladorService.ORIGENES[s.origen]?.label || s.origen}{s.areaNombre ? ` · ${s.areaNombre}` : ''}</span><span className="block text-xs text-medico-gray">{({ medicina: 'Medicina', odontologia: 'Odontología', enfermeria: 'Enfermería' })[s.carrera] || s.carrera} · {simuladorService.MODOS[s.modo]?.label || s.modo}{s.reto && s.reto !== 'libre' ? ` · ${simuladorService.RETOS[s.reto]?.label || s.reto}` : ''}</span></td>
                                                    <td className="py-2 px-3">{s.estado === 'finalizada' ? <Pill className={colorPuntaje(s.puntaje)}>{s.puntaje !== null ? `${s.puntaje}%` : '—'}</Pill> : <Pill className="bg-gray-100 text-gray-600">{s.estado}</Pill>}</td>
                                                    <td className="py-2 px-3 tabular-nums">{s.correctas}/{s.respondidas} <span className="text-medico-gray">de {s.total}</span></td>
                                                    <td className="py-2 px-3 text-medico-gray">{s.segundos ? `${Math.round(s.segundos / 60)} min` : '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                        <div className="space-y-4">
                            {Object.entries(entrenador.mapas).map(([carrera, m]) => (
                                <Card key={carrera} className="p-5">
                                    <h3 className="font-semibold text-gray-900 mb-1">Mapa de dominio · {m.label}</h3>
                                    <p className="text-xs text-medico-gray mb-3">Preparación estimada {m.resumen?.preparacion ?? 0}% · {m.resumen?.dominadas ?? 0} dominadas · {m.resumen?.debiles ?? 0} débiles · {m.resumen?.sinExplorar ?? 0} sin explorar</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {m.areas.map(a => {
                                            const nv = simuladorService.NIVELES[a.nivel] || {}
                                            return <span key={a.id} title={`${a.nombre}: ${a.acierto !== null ? `${a.acierto}% acierto` : 'sin datos'} · ${a.vistas}/${a.total} preguntas`} className={`text-[11px] px-2 py-1 rounded-full ${nv.cls || 'bg-gray-100 text-gray-600'} border`}>{a.nombre}{a.acierto !== null ? ` ${a.acierto}%` : ''}</span>
                                        })}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {tab === 'clases' && (
                    ultimasClases.length === 0 ? <Card className="p-6"><EmptyState icon={Video} title="Sin clases vistas" description="Nunca ha abierto una clase." /></Card> : (
                        <Card className="p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Últimas clases vistas</h3>
                            <ul className="space-y-2">
                                {ultimasClases.map(c => (
                                    <li key={c.id} className="flex items-center gap-3 text-sm">
                                        {c.completada ? <CheckCircle2 className="w-4 h-4 text-medico-green flex-shrink-0" /> : <XCircle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                                        <span className="flex-1 min-w-0"><span className="block font-medium text-gray-900 truncate">{limpiarTitulo(c.titulo)}</span><span className="block text-xs text-medico-gray truncate">{limpiarTitulo(c.modulo)} · {limpiarTitulo(c.curso)}</span></span>
                                        <span className="w-24"><ProgressBar value={c.pct} height="h-1.5" color={c.completada ? 'bg-medico-green' : 'bg-medico-blue'} /></span>
                                        <span className="w-10 text-right text-xs text-medico-gray tabular-nums">{c.pct}%</span>
                                        <span className="w-24 text-right text-xs text-medico-gray whitespace-nowrap">{seguridadService.hace(c.fecha)}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )
                )}

                {tab === 'biblioteca' && (
                    biblioteca.length === 0 ? <Card className="p-6"><EmptyState icon={BookOpen} title="Sin lecturas" description="No ha abierto ningún manual en la Biblioteca." /></Card> : (
                        <Card className="p-0 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead><tr className="text-left text-xs uppercase tracking-wide text-medico-gray border-b border-gray-100 bg-gray-50/60"><th className="py-2.5 px-4">Material</th><th className="py-2.5 px-3">Avance</th><th className="py-2.5 px-3">Lectura</th><th className="py-2.5 px-3">Notas</th><th className="py-2.5 px-3">Última vez</th></tr></thead>
                                <tbody>
                                    {biblioteca.map(b => (
                                        <tr key={b.materialId} className="border-b border-gray-50">
                                            <td className="py-2 px-4"><span className="block font-medium text-gray-900">{limpiarTitulo(b.titulo)}</span><span className="block text-xs text-medico-gray">{limpiarTitulo(b.curso || '')}</span></td>
                                            <td className="py-2 px-3"><div className="flex items-center gap-2"><span className="w-20"><ProgressBar value={b.porcentaje} height="h-1.5" color={b.completado ? 'bg-medico-green' : 'bg-medico-blue'} /></span><span className="text-xs text-medico-gray tabular-nums">pág. {b.paginaMaxima}/{b.totalPaginas || '?'}</span></div></td>
                                            <td className="py-2 px-3 text-medico-gray">{b.minutos} min · {b.aperturas} aperturas</td>
                                            <td className="py-2 px-3 text-medico-gray">{b.notas}</td>
                                            <td className="py-2 px-3 text-medico-gray whitespace-nowrap">{seguridadService.hace(b.ultimaVez)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )
                )}

                {tab === 'accesos' && (
                    accesos.length === 0 ? <Card className="p-6"><EmptyState icon={Monitor} title="Sin accesos registrados" description="El registro de sesiones empezó con el control de cuentas; los accesos anteriores no están." /></Card> : (
                        <Card className="p-0 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead><tr className="text-left text-xs uppercase tracking-wide text-medico-gray border-b border-gray-100 bg-gray-50/60"><th className="py-2.5 px-4">Inicio</th><th className="py-2.5 px-3">Dispositivo</th><th className="py-2.5 px-3">Lugar / IP</th><th className="py-2.5 px-3">Última actividad</th><th className="py-2.5 px-3">Estado</th></tr></thead>
                                <tbody>
                                    {accesos.map(s => (
                                        <tr key={s.id} className="border-b border-gray-50">
                                            <td className="py-2 px-4 text-medico-gray whitespace-nowrap">{fechaHora(s.creadaEn)}</td>
                                            <td className="py-2 px-3"><span className="inline-flex items-center gap-1.5"><IconoTipo tipo={s.dispositivoTipo} /> {s.dispositivo || '—'}</span> <span className="text-xs text-medico-gray">· {s.proveedor === 'google' ? 'Google' : 'contraseña'}</span></td>
                                            <td className="py-2 px-3"><span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {seguridadService.lugar(s)}</span><span className="block text-xs text-medico-gray">{s.ip}</span></td>
                                            <td className="py-2 px-3 text-medico-gray">{seguridadService.hace(s.ultimaActividad)}</td>
                                            <td className="py-2 px-3">{s.revocadaEn ? <Pill className="bg-gray-100 text-gray-600">{s.motivo || 'cerrada'}</Pill> : <Pill className="bg-emerald-100 text-emerald-800">activa</Pill>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    )
                )}

                <IntentoModal usuarioId={u.id} intento={intento} onClose={() => setIntento(null)} />
            </div>
        </Layout>
    )
}

const Resumen = ({ icon: Icon, label, value, hint, tint = '' }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5">
        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-medico-gray mb-1"><Icon className="w-3.5 h-3.5" /> {label}</div>
        <div className={`text-2xl font-bold tabular-nums ${tint || 'text-gray-900'}`}>{value}</div>
        {hint && <div className="text-[11px] text-medico-gray truncate">{hint}</div>}
    </div>
)
const Mini = ({ label, value, sub, tint = '' }) => (
    <div className="rounded-xl bg-gray-50 p-2">
        <div className="text-[10px] uppercase tracking-wide text-medico-gray">{label}</div>
        <div className={`text-sm font-semibold tabular-nums ${tint || 'text-gray-900'}`}>{value}</div>
        {sub && <div className="text-[11px] text-medico-gray">{sub}</div>}
    </div>
)

// Calendario de actividad estilo GitHub: 26 semanas × 7 días
const Heatmap = ({ dias }) => {
    const mapa = useMemo(() => new Map(dias.map(d => [String(d.fecha).slice(0, 10), d])), [dias])
    const semanas = useMemo(() => {
        const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
        const fin = new Date(hoy); fin.setDate(fin.getDate() + (6 - fin.getDay()))   // hasta el sábado de esta semana
        const inicio = new Date(fin); inicio.setDate(inicio.getDate() - 26 * 7 + 1)
        const out = []
        for (let w = 0; w < 26; w++) {
            const col = []
            for (let d = 0; d < 7; d++) {
                const dt = new Date(inicio); dt.setDate(inicio.getDate() + w * 7 + d)
                const key = dt.toISOString().slice(0, 10)
                col.push({ key, dt, futuro: dt > hoy, dato: mapa.get(key) })
            }
            out.push(col)
        }
        return out
    }, [mapa])
    const max = Math.max(1, ...dias.map(d => d.total))
    const nivel = (t) => (!t ? 'bg-gray-100' : t >= max * 0.66 ? 'bg-blue-800' : t >= max * 0.33 ? 'bg-blue-500' : 'bg-blue-200')
    const desc = (c) => c.dato ? `${fecha(c.dt)}: ${Object.entries(c.dato.detalle || {}).map(([k, v]) => `${v} ${k}`).join(', ')}` : fecha(c.dt)
    const meses = semanas.map((col, i) => (i === 0 || col[0].dt.getDate() <= 7 ? col[0].dt.toLocaleDateString('es-EC', { month: 'short' }) : ''))
    return (
        <div className="overflow-x-auto">
            <div className="inline-flex flex-col gap-1 min-w-max">
                <div className="flex gap-[3px] text-[10px] text-medico-gray h-3">{meses.map((m, i) => <span key={i} className="w-3 capitalize">{m}</span>)}</div>
                <div className="flex gap-[3px]">
                    {semanas.map((col, i) => (
                        <div key={i} className="flex flex-col gap-[3px]">
                            {col.map(c => <span key={c.key} title={desc(c)} className={`w-3 h-3 rounded-[3px] ${c.futuro ? 'bg-transparent' : nivel(c.dato?.total)}`} />)}
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-medico-gray mt-1">Menos <span className="w-3 h-3 rounded-[3px] bg-gray-100" /><span className="w-3 h-3 rounded-[3px] bg-blue-200" /><span className="w-3 h-3 rounded-[3px] bg-blue-500" /><span className="w-3 h-3 rounded-[3px] bg-blue-800" /> Más · clases, simulacros, preguntas, lecturas y accesos por día</div>
            </div>
        </div>
    )
}

// Detalle de un intento de simulacro (legacy): pregunta por pregunta y acierto por área
const IntentoModal = ({ usuarioId, intento, onClose }) => {
    const [d, setD] = useState(null)
    const [loading, setLoading] = useState(false)
    const [filtro, setFiltro] = useState('todas')
    useEffect(() => {
        if (!intento) { setD(null); return }
        let vivo = true
        setLoading(true)
        apiService.get(`/ficha/${usuarioId}/simulacros/${intento.id}`).then(r => { if (vivo) { setD(r.success ? r.data : null); setLoading(false) } }).catch(() => { if (vivo) setLoading(false) })
        return () => { vivo = false }
    }, [intento, usuarioId])
    if (!intento) return null
    const lista = (d?.respuestas || []).filter(x => filtro === 'todas' || (filtro === 'falladas' ? !x.esCorrecta : x.esCorrecta))
    return (
        <Modal wide open={!!intento} onClose={onClose} title={`${limpiarTitulo(intento.titulo)} · ${fechaHora(intento.fecha)}`}>
            {loading || !d ? <Loading text="Cargando intento…" /> : (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <Pill className={colorPuntaje(d.intento.puntaje)}>Puntaje {d.intento.puntaje}%</Pill>
                        <span className="text-sm text-medico-gray">{d.intento.correctas}/{d.intento.total} correctas · {d.intento.minutos} min</span>
                        <SegmentedControl className="ml-auto" value={filtro} onChange={setFiltro} options={[{ value: 'todas', label: 'Todas' }, { value: 'falladas', label: `Falladas (${d.respuestas.filter(x => !x.esCorrecta).length})` }, { value: 'correctas', label: 'Correctas' }]} />
                    </div>
                    {d.porArea.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {d.porArea.map(a => { const p = Math.round((100 * a.correctas) / a.total); return <span key={a.area} className={`text-[11px] px-2 py-1 rounded-full ${colorPuntaje(p)}`}>{a.area}: {a.correctas}/{a.total}</span> })}
                        </div>
                    )}
                    <ol className="space-y-3">
                        {lista.map((x, i) => (
                            <li key={x.id} className={`rounded-2xl border p-3 ${x.esCorrecta ? 'border-emerald-100 bg-emerald-50/30' : 'border-red-100 bg-red-50/30'}`}>
                                <div className="flex items-start gap-2">
                                    {x.esCorrecta ? <CheckCircle2 className="w-4 h-4 text-medico-green mt-0.5 flex-shrink-0" /> : <XCircle className="w-4 h-4 text-medico-red mt-0.5 flex-shrink-0" />}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-900">{x.enunciado}</p>
                                        {x.area && <span className="text-[11px] text-medico-gray">{x.area}</span>}
                                        <ul className="mt-2 space-y-1">
                                            {x.opciones.map(o => (
                                                <li key={o.id} className={`text-xs px-2 py-1 rounded-lg ${o.esCorrecta ? 'bg-emerald-100 text-emerald-900' : o.elegida ? 'bg-red-100 text-red-900' : 'text-gray-600'}`}>
                                                    {o.elegida ? '➜ ' : ''}{o.texto}{o.esCorrecta ? ' ✓' : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {lista.length === 0 && <li className="text-sm text-medico-gray">Sin preguntas en este filtro.</li>}
                    </ol>
                </div>
            )}
        </Modal>
    )
}

export default FichaEstudiante
