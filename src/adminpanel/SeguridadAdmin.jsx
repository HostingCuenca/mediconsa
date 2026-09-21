// src/adminpanel/SeguridadAdmin.jsx - Admin: seguridad de cuentas (cuentas compartidas)
// Quién está en línea y desde dónde, cuentas con riesgo (muchos dispositivos/ciudades/expulsiones),
// detalle por alumno con sesiones, dispositivos e IPs, y acciones: cerrar sesiones, quitar dispositivos, límites por usuario.
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ShieldAlert, Users, Wifi, MonitorSmartphone, MapPin, LogOut, Trash2, ArrowLeft, Search, RefreshCw, Save,
    Monitor, Smartphone, Tablet, AlertTriangle, Activity, Globe
} from 'lucide-react'
import Layout from '../utils/Layout'
import seguridadService from '../services/seguridad'
import { Card, PageHeader, Button, Pill, Loading, EmptyState, Alert, SegmentedControl, Stat } from '../simulador/ui'

const input = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medico-blue focus:border-transparent'
const IconoTipo = ({ tipo, className = 'w-4 h-4' }) => tipo === 'movil' ? <Smartphone className={className} /> : tipo === 'tablet' ? <Tablet className={className} /> : <Monitor className={className} />
const riesgoPill = (r) => r >= 10 ? 'bg-red-100 text-red-700' : r >= 4 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'

const SeguridadAdmin = () => {
    const { id } = useParams()
    return id ? <Detalle id={id} /> : <Tablero />
}

// =============================================
// Tablero: resumen + en línea + cuentas
// =============================================
const Tablero = () => {
    const navigate = useNavigate()
    const [resumen, setResumen] = useState(null)
    const [vista, setVista] = useState('riesgo')
    const [q, setQ] = useState('')
    const [lista, setLista] = useState([])
    const [online, setOnline] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const cargar = async () => {
        setLoading(true)
        const [r, u, o] = await Promise.all([
            seguridadService.resumen(),
            seguridadService.usuarios({ q, solo: vista === 'todos' ? '' : vista === 'online' ? 'online' : vista === 'conSesion' ? 'conSesion' : 'riesgo', orden: vista === 'riesgo' ? 'riesgo' : 'actividad', limit: 200 }),
            vista === 'online' ? seguridadService.online() : Promise.resolve({ success: true, data: { sesiones: [] } })
        ])
        setLoading(false)
        if (!r.success) return setError(r.error)
        setResumen(r.data)
        setLista(u.success ? u.data.usuarios : [])
        setOnline(o.success ? o.data.sesiones : [])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cargar() }, [vista])
    useEffect(() => {
        const t = setInterval(cargar, 60000)
        return () => clearInterval(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vista, q])

    const lim = resumen?.limites

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <PageHeader eyebrow="Administración" title="Seguridad de cuentas"
                            subtitle={lim ? `Límites: ${lim.maxDispositivos} dispositivos y ${lim.maxSesiones} sesiones activas por cuenta; máximo ${lim.maxDispositivosNuevos30d} dispositivos nuevos cada 30 días. ${lim.aplicar ? 'Los límites se están aplicando.' : 'MODO OBSERVACIÓN: se registra todo pero no se expulsa a nadie.'}` : ''}
                            actions={<Button variant="secondary" onClick={cargar}><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar</Button>} />
                {error && <Alert tone="error" className="mb-4">{error}</Alert>}
                {!lim?.aplicar && lim && <Alert tone="warn" className="mb-4">Modo observación activo (LIMITES_SESIONES=observar en el API). Cambia a <code>aplicar</code> para que se expulsen las sesiones sobrantes.</Alert>}

                {resumen && (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                        <Stat label="En línea ahora" value={resumen.online} hint={`actividad < ${resumen.onlineMin} min`} valueClass="text-medico-green" />
                        <Stat label="Sesiones activas" value={resumen.sesionesActivas} hint="tokens vigentes" />
                        <Stat label="Usuarios (24 h)" value={resumen.usuarios24h} hint="iniciaron sesión" />
                        <Stat label="Expulsiones (7 d)" value={resumen.expulsiones7d} hint="sesiones cerradas por límite" valueClass={resumen.expulsiones7d > 0 ? 'text-medico-orange' : 'text-gray-900'} />
                        <Stat label="≥3 dispositivos (30 d)" value={resumen.cuentas3Dispositivos30d} hint="cuentas" valueClass={resumen.cuentas3Dispositivos30d > 0 ? 'text-medico-red' : 'text-gray-900'} />
                        <Stat label="≥2 ciudades (7 d)" value={resumen.cuentas2Ciudades7d} hint="cuentas" valueClass={resumen.cuentas2Ciudades7d > 0 ? 'text-medico-red' : 'text-gray-900'} />
                    </div>
                )}

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                    <SegmentedControl value={vista} onChange={setVista} options={[
                        { value: 'riesgo', label: 'Con riesgo' }, { value: 'online', label: 'En línea' }, { value: 'conSesion', label: 'Con sesión' }, { value: 'todos', label: 'Todos' }
                    ]} />
                    <form onSubmit={e => { e.preventDefault(); cargar() }} className="relative md:w-80">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar por correo o nombre…" className={`${input} pl-9`} />
                    </form>
                </div>

                {vista === 'online' && online.length > 0 && (
                    <Card className="p-5 mb-6">
                        <h2 className="font-sans text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2"><Wifi className="w-5 h-5 text-medico-green" /> Sesiones en línea ({online.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="text-left text-xs uppercase tracking-wide text-medico-gray border-b border-gray-100"><th className="py-2 pr-3">Usuario</th><th className="py-2 pr-3">Dispositivo</th><th className="py-2 pr-3">Lugar / IP</th><th className="py-2 pr-3">Actividad</th><th className="py-2 pr-3">Sesiones</th></tr></thead>
                                <tbody>
                                    {online.map(s => (
                                        <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/seguridad/${s.usuarioId}`)}>
                                            <td className="py-2 pr-3"><span className="block font-medium text-gray-900">{s.nombre}</span><span className="block text-xs text-medico-gray">{s.email}</span></td>
                                            <td className="py-2 pr-3"><span className="inline-flex items-center gap-1.5"><IconoTipo tipo={s.dispositivoTipo} /> {s.dispositivo || '—'}</span></td>
                                            <td className="py-2 pr-3"><span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> {seguridadService.lugar(s)}</span><span className="block text-xs text-medico-gray">{s.ip}</span></td>
                                            <td className="py-2 pr-3 text-medico-gray">{seguridadService.hace(s.ultimaActividad)}</td>
                                            <td className="py-2 pr-3">{s.sesionesUsuario > 1 ? <Pill className="bg-amber-100 text-amber-800">{s.sesionesUsuario} a la vez</Pill> : <span className="text-medico-gray">1</span>}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {loading && lista.length === 0 ? <Loading text="Analizando cuentas…" /> : lista.length === 0 ? (
                    <EmptyState icon={vista === 'riesgo' ? ShieldAlert : Users} title={vista === 'riesgo' ? 'Ninguna cuenta con señales de riesgo' : 'Sin resultados'} description={vista === 'riesgo' ? 'Aparecerán aquí las cuentas con varios dispositivos nuevos, varias ciudades o expulsiones recientes.' : 'Prueba otra búsqueda o vista.'} />
                ) : (
                    <Card className="p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead><tr className="text-left text-xs uppercase tracking-wide text-medico-gray border-b border-gray-100 bg-gray-50/60">
                                    <th className="py-2.5 px-4">Usuario</th><th className="py-2.5 px-3">Riesgo</th><th className="py-2.5 px-3">Dispositivos</th><th className="py-2.5 px-3">Sesiones</th><th className="py-2.5 px-3">IPs / ciudades (7 d)</th><th className="py-2.5 px-3">Expulsiones</th><th className="py-2.5 px-3">Última actividad</th>
                                </tr></thead>
                                <tbody>
                                    {lista.map(u => (
                                        <tr key={u.id} className="border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer" onClick={() => navigate(`/admin/seguridad/${u.id}`)}>
                                            <td className="py-2.5 px-4"><span className="block font-medium text-gray-900 inline-flex items-center gap-2">{u.enLinea && <span className="w-2 h-2 rounded-full bg-medico-green" title="en línea" />}{u.nombre}</span><span className="block text-xs text-medico-gray">{u.email}</span></td>
                                            <td className="py-2.5 px-3"><Pill className={riesgoPill(u.riesgo)}>{u.riesgo}</Pill></td>
                                            <td className="py-2.5 px-3"><span className="font-medium">{u.dispositivosActivos}</span> <span className="text-xs text-medico-gray">activos · {u.dispositivos30d} nuevos/30 d</span></td>
                                            <td className="py-2.5 px-3"><span className="font-medium">{u.sesionesActivas}</span> <span className="text-xs text-medico-gray">activas · {u.logins7d} logins/7 d</span></td>
                                            <td className="py-2.5 px-3"><span className="font-medium">{u.ips7d}</span> <span className="text-xs text-medico-gray">IPs · {u.ciudades7d} ciudades</span>{u.ciudades && <span className="block text-xs text-medico-gray truncate max-w-[220px]">{u.ciudades}</span>}</td>
                                            <td className="py-2.5 px-3">{u.expulsiones7d > 0 ? <span className="text-medico-orange font-medium">{u.expulsiones7d}</span> : <span className="text-medico-gray">0</span>}</td>
                                            <td className="py-2.5 px-3 text-medico-gray">{seguridadService.hace(u.ultimaActividad)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    )
}

// =============================================
// Detalle de un usuario
// =============================================
const Detalle = ({ id }) => {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [error, setError] = useState('')
    const [ok, setOk] = useState('')
    const [ocupado, setOcupado] = useState('')
    const [lim, setLim] = useState({ maxDispositivos: '', maxSesiones: '', notas: '' })

    const cargar = async () => {
        const r = await seguridadService.usuario(id)
        if (!r.success) return setError(r.error)
        setData(r.data)
        setLim({ maxDispositivos: r.data.usuario?.limites?.maxDispositivos || '', maxSesiones: r.data.usuario?.limites?.maxSesiones || '', notas: r.data.usuario?.notas || '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { cargar() }, [id])

    const accion = async (clave, fn, mensaje) => {
        setOcupado(clave); setError(''); setOk('')
        const r = await fn()
        setOcupado('')
        if (!r.success) return setError(r.error)
        setOk(mensaje); cargar()
    }
    const guardarLimites = () => accion('limites', () => seguridadService.limites(id, lim), 'Límites guardados')

    const activas = useMemo(() => (data?.sesiones || []).filter(s => !s.revocadaEn && new Date(s.expiraEn) > new Date()), [data])
    const historial = useMemo(() => (data?.sesiones || []).filter(s => s.revocadaEn || new Date(s.expiraEn) <= new Date()), [data])
    const dispActivos = useMemo(() => (data?.dispositivos || []).filter(d => !d.revocadoEn), [data])
    const dispViejos = useMemo(() => (data?.dispositivos || []).filter(d => d.revocadoEn), [data])

    if (error && !data) return <Layout showSidebar><div className="p-6 md:p-8"><Alert tone="error">{error}</Alert></div></Layout>
    if (!data) return <Layout showSidebar><Loading text="Cargando cuenta…" /></Layout>
    const u = data.usuario
    const g = data.limitesGlobales

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <button onClick={() => navigate('/admin/seguridad')} className="inline-flex items-center gap-1 text-sm text-medico-gray hover:text-medico-blue mb-3"><ArrowLeft className="w-4 h-4" /> Seguridad de cuentas</button>
                <PageHeader eyebrow={u.email} title={u.nombre}
                            subtitle={`${u.enLinea ? 'En línea ahora' : `Última actividad ${seguridadService.hace(u.ultimaActividad)}`} · ${u.dispositivosActivos} dispositivos activos · ${u.sesionesActivas} sesiones activas`}
                            actions={<>
                                <Pill className={riesgoPill(u.riesgo)}><AlertTriangle className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />Riesgo {u.riesgo}</Pill>
                                <Button variant="danger" onClick={() => accion('todas', () => seguridadService.cerrarSesionesUsuario(id), 'Todas las sesiones fueron cerradas')} loading={ocupado === 'todas'}><LogOut className="w-4 h-4" /> Cerrar todas las sesiones</Button>
                            </>} />
                {error && <Alert tone="error" className="mb-4">{error}</Alert>}
                {ok && <Alert tone="ok" className="mb-4">{ok}</Alert>}

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
                    <div className="space-y-6">
                        {/* Sesiones activas */}
                        <Card className="p-5">
                            <h2 className="font-sans text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2"><Activity className="w-5 h-5 text-medico-blue" /> Sesiones activas ({activas.length})</h2>
                            {activas.length === 0 ? <p className="text-sm text-medico-gray">Sin sesiones activas.</p> : (
                                <ul className="space-y-2">
                                    {activas.map(s => (
                                        <li key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
                                            <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.enLinea ? 'bg-emerald-50 text-medico-green' : 'bg-gray-100 text-gray-500'}`}><IconoTipo tipo={s.dispositivo?.tipo} /></span>
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-sm font-medium text-gray-900">{s.dispositivo?.nombre || 'Dispositivo'} <span className="text-xs text-medico-gray font-normal">· {s.proveedor === 'google' ? 'Google' : 'contraseña'}</span></span>
                                                <span className="block text-xs text-medico-gray"><MapPin className="w-3 h-3 inline -mt-0.5" /> {seguridadService.lugar(s)} · {s.ip} · inició {seguridadService.hace(s.creadaEn)} · {s.enLinea ? <span className="text-medico-green font-medium">en línea</span> : `activa ${seguridadService.hace(s.ultimaActividad)}`}</span>
                                            </span>
                                            <button onClick={() => accion(s.id, () => seguridadService.adminCerrarSesion(s.id), 'Sesión cerrada')} disabled={!!ocupado} title="Cerrar sesión" className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><LogOut className="w-4 h-4" /></button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        {/* Dispositivos */}
                        <Card className="p-5">
                            <h2 className="font-sans text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2"><MonitorSmartphone className="w-5 h-5 text-medico-blue" /> Dispositivos ({dispActivos.length} activos · {u.dispositivos30d} nuevos en 30 d)</h2>
                            <ul className="space-y-2">
                                {dispActivos.map(d => (
                                    <li key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
                                        <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0"><IconoTipo tipo={d.tipo} /></span>
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-sm font-medium text-gray-900">{d.nombre} {d.sesionesActivas > 0 && <Pill className="bg-emerald-50 text-medico-green ml-1">{d.sesionesActivas} sesión{d.sesionesActivas > 1 ? 'es' : ''}</Pill>}</span>
                                            <span className="block text-xs text-medico-gray">{seguridadService.lugar(d)} · {d.ip} · registrado {new Date(d.primeraVez).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })} · último uso {seguridadService.hace(d.ultimaVez)}{d.huella ? ` · ${d.huella}` : ''}</span>
                                        </span>
                                        <button onClick={() => accion(d.id, () => seguridadService.adminQuitarDispositivo(d.id), 'Dispositivo quitado')} disabled={!!ocupado} title="Quitar dispositivo" className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                                    </li>
                                ))}
                                {dispActivos.length === 0 && <li className="text-sm text-medico-gray">Sin dispositivos activos.</li>}
                            </ul>
                            {dispViejos.length > 0 && (
                                <details className="mt-3">
                                    <summary className="cursor-pointer text-sm font-semibold text-medico-gray">Anteriores ({dispViejos.length})</summary>
                                    <ul className="mt-2 space-y-1">
                                        {dispViejos.map(d => <li key={d.id} className="text-xs text-medico-gray flex items-center gap-2"><IconoTipo tipo={d.tipo} className="w-3.5 h-3.5" /> {d.nombre} · {seguridadService.lugar(d)} · {d.motivoRevocado || 'revocado'} {seguridadService.hace(d.revocadoEn)}</li>)}
                                    </ul>
                                </details>
                            )}
                        </Card>

                        {/* Historial de sesiones */}
                        {historial.length > 0 && (
                            <Card className="p-5">
                                <h2 className="font-sans text-base font-semibold text-gray-900 mb-3">Historial reciente ({historial.length})</h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="text-left text-xs uppercase tracking-wide text-medico-gray border-b border-gray-100"><th className="py-2 pr-3">Dispositivo</th><th className="py-2 pr-3">Lugar</th><th className="py-2 pr-3">Inicio</th><th className="py-2 pr-3">Cierre</th><th className="py-2 pr-3">Motivo</th></tr></thead>
                                        <tbody>
                                            {historial.map(s => (
                                                <tr key={s.id} className="border-b border-gray-50">
                                                    <td className="py-1.5 pr-3">{s.dispositivo?.nombre || '—'}</td>
                                                    <td className="py-1.5 pr-3 text-medico-gray">{seguridadService.lugar(s)}</td>
                                                    <td className="py-1.5 pr-3 text-medico-gray">{new Date(s.creadaEn).toLocaleString('es-EC', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                                                    <td className="py-1.5 pr-3 text-medico-gray">{s.revocadaEn ? seguridadService.hace(s.revocadaEn) : 'caducó'}</td>
                                                    <td className="py-1.5 pr-3"><Pill className={s.motivo === 'expulsada' || s.motivo === 'dispositivo' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}>{s.motivo || 'expirada'}</Pill></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="space-y-6">
                        {/* IPs */}
                        <Card className="p-5">
                            <h2 className="font-sans text-base font-semibold text-gray-900 mb-3 inline-flex items-center gap-2"><Globe className="w-5 h-5 text-medico-blue" /> Desde dónde se conecta (30 d)</h2>
                            {data.ips.length === 0 ? <p className="text-sm text-medico-gray">Sin registros todavía.</p> : (
                                <ul className="space-y-1.5">
                                    {data.ips.map((x, i) => (
                                        <li key={i} className="flex items-center justify-between gap-2 text-sm">
                                            <span className="min-w-0"><span className="block font-medium text-gray-900 truncate">{[x.ciudad, x.pais].filter(Boolean).join(', ') || 'Desconocido'}</span><span className="block text-xs text-medico-gray">{x.ip}</span></span>
                                            <span className="text-xs text-medico-gray whitespace-nowrap">{x.veces}× · {seguridadService.hace(x.ultima)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        {/* Límites por usuario */}
                        <Card className="p-5">
                            <h2 className="font-sans text-base font-semibold text-gray-900 mb-1">Límites de esta cuenta</h2>
                            <p className="text-xs text-medico-gray mb-3">Vacío = usar el global ({g.maxDispositivos} dispositivos, {g.maxSesiones} sesiones).</p>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <label className="text-xs font-semibold text-gray-700">Dispositivos<input type="number" min={1} max={20} value={lim.maxDispositivos} onChange={e => setLim(l => ({ ...l, maxDispositivos: e.target.value }))} className={`${input} mt-1`} placeholder={String(g.maxDispositivos)} /></label>
                                <label className="text-xs font-semibold text-gray-700">Sesiones<input type="number" min={1} max={20} value={lim.maxSesiones} onChange={e => setLim(l => ({ ...l, maxSesiones: e.target.value }))} className={`${input} mt-1`} placeholder={String(g.maxSesiones)} /></label>
                            </div>
                            <textarea value={lim.notas} onChange={e => setLim(l => ({ ...l, notas: e.target.value }))} rows={3} placeholder="Notas internas (p. ej. 'reportado por compartir', 'familia con un solo PC')" className={`${input} mb-2`} />
                            <Button size="sm" onClick={guardarLimites} loading={ocupado === 'limites'}><Save className="w-4 h-4" /> Guardar</Button>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default SeguridadAdmin
