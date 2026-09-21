// MisDispositivos — sección del perfil: sesiones activas y dispositivos de la cuenta (control de cuentas compartidas).
// El alumno ve dónde está abierta su cuenta, desde qué ciudad, y puede cerrar sesiones o quitar dispositivos.
import React, { useEffect, useState } from 'react'
import { Monitor, Smartphone, Tablet, MapPin, LogOut, Trash2, ShieldCheck, RefreshCw } from 'lucide-react'
import seguridadService from '../services/seguridad'
import authService from '../services/auth'

const IconoTipo = ({ tipo, className = 'w-5 h-5' }) => tipo === 'movil' ? <Smartphone className={className} /> : tipo === 'tablet' ? <Tablet className={className} /> : <Monitor className={className} />

const MisDispositivos = () => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [ocupado, setOcupado] = useState('')
    const [msg, setMsg] = useState('')

    const cargar = async () => {
        setLoading(true)
        const r = await seguridadService.misSesiones()
        setLoading(false)
        if (r.success) setData(r.data)
        else setMsg(r.error)
    }
    useEffect(() => { cargar() }, [])

    const cerrar = async (s) => {
        setOcupado(s.id)
        const r = await seguridadService.cerrarSesion(s.id)
        setOcupado('')
        if (!r.success) return setMsg(r.error)
        if (s.actual) { authService.logout(); return }
        cargar()
    }
    const quitar = async (d) => {
        setOcupado(d.id)
        const r = await seguridadService.quitarDispositivo(d.id)
        setOcupado('')
        if (!r.success) return setMsg(r.error)
        // Si era el dispositivo actual, la sesión actual también cayó
        const actual = data?.sesiones.find(s => s.actual)
        if (actual?.dispositivo?.id === d.id) { authService.logout(); return }
        cargar()
    }

    const lim = data?.limites || { maxDispositivos: 2, maxSesiones: 2 }

    return (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-5">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-medico-blue flex items-center justify-center flex-shrink-0"><ShieldCheck className="w-5 h-5" /></div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Mis dispositivos y sesiones</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Tu cuenta es <strong>personal</strong>: está pensada para que la use una sola persona, desde su computadora y su celular.
                            {lim.aplicar === false
                                ? <> {lim.desde ? `A partir del ${new Date(lim.desde + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })}` : 'Próximamente'}, las sesiones de más se cerrarán solas.</>
                                : <> Si se abre en otro sitio, la sesión más antigua se cierra sola.</>}
                            {' '}Si ves algo que no reconoces, ciérralo y cambia tu contraseña.
                        </p>
                    </div>
                </div>
                <button onClick={cargar} className="inline-flex items-center gap-1.5 text-sm text-medico-gray hover:text-medico-blue self-start"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar</button>
            </div>

            {msg && <p className="text-sm text-red-600 mb-3">{msg}</p>}
            {data && (data.sesiones.length > lim.maxSesiones || data.dispositivos.length > lim.maxDispositivos) && (
                <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
                    Tu cuenta está abierta en varios sitios a la vez. Cierra las sesiones que no uses para que no se cierren solas{lim.aplicar === false && lim.desde ? ` a partir del ${new Date(lim.desde + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'long' })}` : ''}.
                </div>
            )}

            {loading && !data ? (
                <p className="text-sm text-medico-gray">Cargando…</p>
            ) : data && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-medico-gray mb-2">Sesiones activas</h3>
                        <ul className="space-y-2">
                            {data.sesiones.map(s => (
                                <li key={s.id} className={`flex items-center gap-3 p-3 rounded-xl border ${s.actual ? 'border-medico-blue/40 bg-blue-50/40' : 'border-gray-200'}`}>
                                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.enLinea ? 'bg-emerald-50 text-medico-green' : 'bg-gray-100 text-gray-500'}`}><IconoTipo tipo={s.dispositivo?.tipo} /></span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-medium text-gray-900 truncate">{s.dispositivo?.nombre || 'Dispositivo'}{s.actual && <span className="ml-2 text-[11px] font-semibold text-medico-blue">ESTE DISPOSITIVO</span>}</span>
                                        <span className="block text-xs text-medico-gray truncate"><MapPin className="w-3 h-3 inline -mt-0.5" /> {seguridadService.lugar(s)} · {s.enLinea ? <span className="text-medico-green font-medium">en línea</span> : `activa ${seguridadService.hace(s.ultimaActividad)}`}</span>
                                    </span>
                                    <button onClick={() => cerrar(s)} disabled={ocupado === s.id} title={s.actual ? 'Cerrar mi sesión' : 'Cerrar esta sesión'} className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><LogOut className="w-4 h-4" /></button>
                                </li>
                            ))}
                            {data.sesiones.length === 0 && <li className="text-sm text-medico-gray">Sin sesiones activas.</li>}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-medico-gray mb-2">Dispositivos</h3>
                        <ul className="space-y-2">
                            {data.dispositivos.map(d => (
                                <li key={d.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200">
                                    <span className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0"><IconoTipo tipo={d.tipo} /></span>
                                    <span className="flex-1 min-w-0">
                                        <span className="block text-sm font-medium text-gray-900 truncate">{d.nombre}</span>
                                        <span className="block text-xs text-medico-gray truncate">{seguridadService.lugar(d)} · último uso {seguridadService.hace(d.ultimaVez)} · desde {new Date(d.primeraVez).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}</span>
                                    </span>
                                    <button onClick={() => quitar(d)} disabled={ocupado === d.id} title="Quitar dispositivo (cierra sus sesiones)" className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="w-4 h-4" /></button>
                                </li>
                            ))}
                            {data.dispositivos.length === 0 && <li className="text-sm text-medico-gray">Sin dispositivos registrados.</li>}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MisDispositivos
