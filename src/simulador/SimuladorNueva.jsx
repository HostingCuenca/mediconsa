// src/simulador/SimuladorNueva.jsx - Configurar y lanzar una sesión
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sparkles, RotateCcw, Target, Shuffle, FileText, Check, Play, ArrowLeft, Clock, Eye, EyeOff } from 'lucide-react'
import Layout from '../utils/Layout'
import simuladorService from '../services/simulador'
import { Card, PageHeader, Button, Loading, Alert, SegmentedControl, Pill } from './ui'

const ICONOS = { adaptativo: Sparkles, errores: RotateCcw, area: Target, aleatorio: Shuffle, simulacro: FileText }
const TAMANOS = [10, 20, 30, 50, 100]

const SimuladorNueva = () => {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const [carreras, setCarreras] = useState([])
    const [carrera, setCarrera] = useState(params.get('carrera') || localStorage.getItem('simulador_carrera') || '')
    const [areas, setAreas] = useState([])
    const [simulacros, setSimulacros] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [creando, setCreando] = useState(false)

    const [origen, setOrigen] = useState(params.get('origen') || 'adaptativo')
    const [modo, setModo] = useState('practica')
    const [numPreguntas, setNumPreguntas] = useState(20)
    const [areaIds, setAreaIds] = useState([])
    const [simulacroId, setSimulacroId] = useState('')
    const [conTiempo, setConTiempo] = useState(false)
    const [tiempoMin, setTiempoMin] = useState(30)
    const [soloNoVistas, setSoloNoVistas] = useState(false)

    useEffect(() => {
        (async () => {
            const r = await simuladorService.getCarreras()
            if (r.success) {
                setCarreras(r.data.carreras)
                if (!r.data.carreras.find(c => c.carrera === carrera) && r.data.carreras[0]) setCarrera(r.data.carreras[0].carrera)
            } else setError(r.error)
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (!carrera) return
        setLoading(true)
        Promise.all([simuladorService.getAreas(carrera), simuladorService.getSimulacrosOrigen(carrera)]).then(([a, s]) => {
            if (a.success) setAreas(a.data.areas)
            if (s.success) setSimulacros(s.data.simulacros)
            setLoading(false)
        })
    }, [carrera])

    // Al elegir simulacro, el tamaño se ajusta a sus preguntas
    useEffect(() => {
        if (origen === 'simulacro' && simulacroId) {
            const s = simulacros.find(x => x.simulacroId === simulacroId)
            if (s) setNumPreguntas(Math.min(100, s.preguntas))
        }
    }, [origen, simulacroId, simulacros])

    const toggleArea = (id) => setAreaIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

    const carreraInfo = carreras.find(c => c.carrera === carrera)
    const erroresPendientes = carreraInfo?.progreso?.erroresPendientes || 0
    const puedeCrear = origen !== 'area' || areaIds.length > 0
    const puedeCrearSim = origen !== 'simulacro' || !!simulacroId

    const crear = async () => {
        setCreando(true)
        setError('')
        const r = await simuladorService.crearSesion({
            carrera, modo, origen, numPreguntas,
            areaIds: origen === 'area' ? areaIds : undefined,
            simulacroId: origen === 'simulacro' ? simulacroId : undefined,
            tiempoLimiteMin: conTiempo ? tiempoMin : undefined,
            soloNoVistas
        })
        setCreando(false)
        if (r.success) navigate(`/simulador/sesion/${r.data.sesion.id}`)
        else setError(r.error)
    }

    const tiempoSugerido = Math.ceil(numPreguntas * 1.6)

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <Button variant="ghost" size="sm" to="/simulador" className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4" /> Volver</Button>
                <PageHeader
                    eyebrow="Nueva sesión"
                    title="¿Cómo quieres practicar hoy?"
                    actions={carreras.length > 1 && (
                        <SegmentedControl value={carrera} onChange={setCarrera} options={carreras.map(c => ({ value: c.carrera, label: c.label }))} />
                    )}
                />

                {error && <Alert tone="error" className="mb-6">{error}</Alert>}
                {loading ? <Loading /> : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Origen */}
                            <section>
                                <h2 className="font-sans text-base font-semibold text-gray-900 mb-3">1. Qué preguntas</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(simuladorService.ORIGENES).map(([key, o]) => {
                                        const Icon = ICONOS[key]
                                        const activo = origen === key
                                        const deshabilitado = key === 'errores' && erroresPendientes === 0
                                        return (
                                            <button key={key} type="button" disabled={deshabilitado} onClick={() => setOrigen(key)}
                                                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                                                        activo ? 'border-medico-blue bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'
                                                    } disabled:opacity-40 disabled:cursor-not-allowed`}>
                                                <div className="flex items-center justify-between">
                                                    <Icon className={`w-5 h-5 ${activo ? 'text-medico-blue' : 'text-gray-500'}`} />
                                                    {activo && <Check className="w-4 h-4 text-medico-blue" />}
                                                </div>
                                                <p className="font-semibold text-gray-900 mt-2">{o.label}{key === 'errores' && erroresPendientes > 0 && <span className="ml-2 text-xs text-medico-red">{erroresPendientes}</span>}</p>
                                                <p className="text-xs text-medico-gray mt-0.5">{o.desc}</p>
                                            </button>
                                        )
                                    })}
                                </div>

                                {origen === 'area' && (
                                    <Card className="mt-4 p-4">
                                        <p className="text-sm font-medium text-gray-900 mb-3">Elige las áreas</p>
                                        <div className="flex flex-wrap gap-2">
                                            {areas.map(a => {
                                                const sel = areaIds.includes(a.id)
                                                return (
                                                    <button key={a.id} type="button" onClick={() => toggleArea(a.id)}
                                                            className={`px-4 py-2 rounded-full text-sm border transition-all ${sel ? 'bg-medico-blue text-white border-medico-blue' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
                                                        {a.nombre} <span className={`text-xs ${sel ? 'text-blue-100' : 'text-medico-gray'}`}>· {a.totalPreguntas}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </Card>
                                )}

                                {origen === 'simulacro' && (
                                    <Card className="mt-4 p-4">
                                        <p className="text-sm font-medium text-gray-900 mb-3">Elige el simulacro</p>
                                        <select value={simulacroId} onChange={e => setSimulacroId(e.target.value)}
                                                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-medico-blue focus:border-transparent">
                                            <option value="">Seleccionar…</option>
                                            {simulacros.map(s => <option key={s.simulacroId} value={s.simulacroId}>{s.titulo} ({s.preguntas} preguntas{s.vistas ? `, ${s.vistas} vistas` : ''})</option>)}
                                        </select>
                                    </Card>
                                )}
                            </section>

                            {/* Modo */}
                            <section>
                                <h2 className="font-sans text-base font-semibold text-gray-900 mb-3">2. Cómo</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(simuladorService.MODOS).map(([key, m]) => {
                                        const activo = modo === key
                                        const Icon = key === 'practica' ? Eye : EyeOff
                                        return (
                                            <button key={key} type="button" onClick={() => setModo(key)}
                                                    className={`text-left p-4 rounded-2xl border-2 transition-all ${activo ? 'border-medico-blue bg-blue-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                                                <div className="flex items-center justify-between">
                                                    <Icon className={`w-5 h-5 ${activo ? 'text-medico-blue' : 'text-gray-500'}`} />
                                                    {activo && <Check className="w-4 h-4 text-medico-blue" />}
                                                </div>
                                                <p className="font-semibold text-gray-900 mt-2">{m.label}</p>
                                                <p className="text-xs text-medico-gray mt-0.5">{m.desc}</p>
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>

                            {/* Tamaño y tiempo */}
                            <section>
                                <h2 className="font-sans text-base font-semibold text-gray-900 mb-3">3. Cuánto</h2>
                                <Card className="p-5 space-y-5">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-sm font-medium text-gray-900">Número de preguntas</p>
                                            <span className="text-2xl font-semibold text-medico-blue">{numPreguntas}</span>
                                        </div>
                                        <input type="range" min="5" max="100" step="5" value={numPreguntas} disabled={origen === 'simulacro'}
                                               onChange={e => setNumPreguntas(parseInt(e.target.value))} className="w-full accent-blue-800" />
                                        <div className="flex gap-2 mt-2">
                                            {TAMANOS.map(n => (
                                                <button key={n} type="button" disabled={origen === 'simulacro'} onClick={() => setNumPreguntas(n)}
                                                        className={`px-3 py-1 rounded-full text-xs border ${numPreguntas === n ? 'bg-medico-blue text-white border-medico-blue' : 'border-gray-200 text-gray-600 hover:border-gray-300'} disabled:opacity-40`}>{n}</button>
                                            ))}
                                        </div>
                                    </div>

                                    <label className="flex items-center justify-between cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-5 h-5 text-gray-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Límite de tiempo</p>
                                                <p className="text-xs text-medico-gray">Sugerido: {tiempoSugerido} min (≈96 s por pregunta, como el examen)</p>
                                            </div>
                                        </div>
                                        <input type="checkbox" checked={conTiempo} onChange={e => { setConTiempo(e.target.checked); if (e.target.checked) setTiempoMin(tiempoSugerido) }} className="w-5 h-5 accent-blue-800" />
                                    </label>
                                    {conTiempo && (
                                        <div className="flex items-center gap-3 pl-8">
                                            <input type="number" min="1" max="300" value={tiempoMin} onChange={e => setTiempoMin(parseInt(e.target.value) || 1)}
                                                   className="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-medico-blue focus:border-transparent" />
                                            <span className="text-sm text-medico-gray">minutos</span>
                                        </div>
                                    )}

                                    {origen !== 'errores' && (
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">Solo preguntas que no he visto</p>
                                                <p className="text-xs text-medico-gray">Útil para cubrir todo el banco antes del examen</p>
                                            </div>
                                            <input type="checkbox" checked={soloNoVistas} onChange={e => setSoloNoVistas(e.target.checked)} className="w-5 h-5 accent-blue-800" />
                                        </label>
                                    )}
                                </Card>
                            </section>
                        </div>

                        {/* Resumen */}
                        <div>
                            <Card className="p-6 sticky top-24">
                                <h3 className="font-sans text-base font-semibold text-gray-900 mb-4">Resumen</h3>
                                <dl className="space-y-3 text-sm">
                                    <div className="flex justify-between"><dt className="text-medico-gray">Carrera</dt><dd className="font-medium">{carreraInfo?.label}</dd></div>
                                    <div className="flex justify-between"><dt className="text-medico-gray">Preguntas</dt><dd className="font-medium">{simuladorService.ORIGENES[origen].label}</dd></div>
                                    {origen === 'area' && <div className="flex justify-between"><dt className="text-medico-gray">Áreas</dt><dd className="font-medium">{areaIds.length || '—'}</dd></div>}
                                    <div className="flex justify-between"><dt className="text-medico-gray">Modo</dt><dd className="font-medium">{simuladorService.MODOS[modo].label}</dd></div>
                                    <div className="flex justify-between"><dt className="text-medico-gray">Cantidad</dt><dd className="font-medium">{numPreguntas}</dd></div>
                                    <div className="flex justify-between"><dt className="text-medico-gray">Tiempo</dt><dd className="font-medium">{conTiempo ? `${tiempoMin} min` : 'Libre'}</dd></div>
                                </dl>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {modo === 'practica' && <Pill className="bg-emerald-50 text-medico-green border-emerald-100">Feedback inmediato</Pill>}
                                    {modo === 'examen' && <Pill className="bg-orange-50 text-medico-orange border-orange-100">Resultados al final</Pill>}
                                    {soloNoVistas && <Pill className="bg-blue-50 text-medico-blue border-blue-100">Solo nuevas</Pill>}
                                </div>
                                <Button className="w-full mt-6" size="lg" loading={creando} disabled={!puedeCrear || !puedeCrearSim} onClick={crear}>
                                    <Play className="w-5 h-5" /> Comenzar
                                </Button>
                                <p className="text-[11px] text-medico-gray mt-3 text-center">Tu avance se guarda automáticamente en cada respuesta.</p>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default SimuladorNueva
