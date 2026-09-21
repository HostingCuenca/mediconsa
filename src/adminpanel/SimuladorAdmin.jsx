// src/adminpanel/SimuladorAdmin.jsx - Banco de preguntas y áreas del Simulador Interactivo
import React, { useEffect, useState, useCallback } from 'react'
import { Search, Plus, Save, Tag, Database, Layers, Users, Pencil, X, Tags, RefreshCw, Trash2, Eye, EyeOff } from 'lucide-react'
import Layout from '../utils/Layout'
import simuladorService from '../services/simulador'
import { Card, PageHeader, Button, Pill, Stat, Loading, Alert, SegmentedControl, Modal } from '../simulador/ui'
import EtiquetasPicker from '../components/EtiquetasPicker'

const CARRERAS = [
    { value: 'medicina', label: 'Medicina' },
    { value: 'odontologia', label: 'Odontología' },
    { value: 'enfermeria', label: 'Enfermería' }
]

const SimuladorAdmin = () => {
    const [resumen, setResumen] = useState(null)
    const [areas, setAreas] = useState([])
    const [carrera, setCarrera] = useState('medicina')
    const [filtros, setFiltros] = useState({ q: '', areaId: '', sinArea: false, etiquetas: [] })
    const [grupos, setGrupos] = useState([])          // grupos de etiquetas (con todas, para el admin)
    const [vista, setVista] = useState('banco')       // banco | etiquetas
    const [etiquetasSel, setEtiquetasSel] = useState([])   // etiquetado masivo
    const [sincronizando, setSincronizando] = useState(false)
    const [preguntas, setPreguntas] = useState([])
    const [pag, setPag] = useState({ page: 1, totalPages: 1, total: 0 })
    const [loading, setLoading] = useState(true)
    const [cargandoLista, setCargandoLista] = useState(false)
    const [msg, setMsg] = useState(null)
    const [seleccion, setSeleccion] = useState([])
    const [areaDestino, setAreaDestino] = useState('')
    const [nuevaArea, setNuevaArea] = useState('')
    const [editando, setEditando] = useState(null)

    const notificar = (tone, text) => { setMsg({ tone, text }); setTimeout(() => setMsg(null), 4000) }

    const cargarBase = useCallback(async () => {
        const [r, a, e] = await Promise.all([simuladorService.adminResumen(), simuladorService.adminAreas(), simuladorService.etiquetas(true)])
        if (r.success) setResumen(r.data)
        if (a.success) setAreas(a.data.areas)
        if (e.success) setGrupos(e.data.grupos)
        setLoading(false)
    }, [])
    const recargarEtiquetas = async () => { const e = await simuladorService.etiquetas(true); if (e.success) setGrupos(e.data.grupos) }
    const onGrupoActualizado = (grupoId, etiqueta) => setGrupos(gs => gs.map(g => g.id === grupoId ? { ...g, etiquetas: [...g.etiquetas, { ...etiqueta, preguntas: 0 }] } : g))

    const cargarPreguntas = useCallback(async (page = 1) => {
        setCargandoLista(true)
        const r = await simuladorService.adminPreguntas({
            carrera, page, limit: 20, q: filtros.q || undefined,
            areaId: filtros.areaId || undefined, sinArea: filtros.sinArea ? 1 : undefined,
            etiquetas: filtros.etiquetas.length ? filtros.etiquetas.join(',') : undefined
        })
        if (r.success) { setPreguntas(r.data.preguntas); setPag(r.data.paginacion); setSeleccion([]) }
        else notificar('error', r.error)
        setCargandoLista(false)
    }, [carrera, filtros])

    useEffect(() => { cargarBase() }, [cargarBase])
    useEffect(() => { cargarPreguntas(1) }, [carrera, filtros.areaId, filtros.sinArea, filtros.etiquetas]) // eslint-disable-line react-hooks/exhaustive-deps

    const areasCarrera = areas.filter(a => a.carrera === carrera)

    const crearArea = async () => {
        if (!nuevaArea.trim()) return
        const r = await simuladorService.adminCrearArea({ carrera, nombre: nuevaArea.trim(), orden: areasCarrera.length })
        if (r.success) { setNuevaArea(''); notificar('ok', `Área "${r.data.area.nombre}" creada`); cargarBase() }
        else notificar('error', r.error)
    }

    const toggleActivaArea = async (a) => {
        const r = await simuladorService.adminActualizarArea(a.id, { activa: !a.activa })
        if (r.success) cargarBase(); else notificar('error', r.error)
    }

    const reasignar = async () => {
        if (!areaDestino || seleccion.length === 0) return
        const r = await simuladorService.adminReasignarArea(seleccion, parseInt(areaDestino))
        if (r.success) { notificar('ok', `${r.data.actualizadas} preguntas movidas`); cargarPreguntas(pag.page); cargarBase() }
        else notificar('error', r.error)
    }

    const etiquetarSeleccion = async (quitar = false) => {
        if (!etiquetasSel.length || !seleccion.length) return
        const r = await simuladorService.etiquetarPreguntas(seleccion, quitar ? [] : etiquetasSel, quitar ? etiquetasSel : [])
        if (r.success) { notificar('ok', quitar ? `${r.data.quitadas} etiquetas quitadas` : `${r.data.agregadas} etiquetas añadidas`); setEtiquetasSel([]); cargarPreguntas(pag.page); recargarEtiquetas() }
        else notificar('error', r.error)
    }
    const sincronizarBanco = async () => {
        setSincronizando(true)
        const r = await simuladorService.sincronizarBanco()
        setSincronizando(false)
        if (r.success) { notificar('ok', r.data.pendientes ? `Sincronizadas ${r.data.pendientes} preguntas nuevas` : 'El banco ya estaba al día'); cargarBase(); cargarPreguntas(1) }
        else notificar('error', r.error)
    }

    const toggleSel = id => setSeleccion(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    const toggleTodas = () => setSeleccion(seleccion.length === preguntas.length ? [] : preguntas.map(p => p.id))

    const guardarEdicion = async () => {
        const e = editando
        const r = await simuladorService.adminActualizarPregunta(e.id, {
            areaId: e.area_id ? parseInt(e.area_id) : null,
            tema: e.tema || null,
            dificultad: e.dificultad ? parseInt(e.dificultad) : null,
            activa: e.activa,
            enunciado: e.enunciado,
            explicacion: e.explicacion,
            opciones: e.opciones.map(o => ({ id: o.id, texto: o.texto, esCorrecta: o.es_correcta }))
        })
        if (!r.success) return notificar('error', r.error)
        // Etiquetas: aplicar diferencia (añadir / quitar)
        const antes = (e.etiquetas || []).map(x => x.id), despues = e.etiquetaIds || []
        const agregar = despues.filter(x => !antes.includes(x)), quitar = antes.filter(x => !despues.includes(x))
        if (agregar.length || quitar.length) await simuladorService.etiquetarPreguntas([e.id], agregar, quitar)
        setEditando(null); notificar('ok', 'Pregunta actualizada'); cargarPreguntas(pag.page); if (agregar.length || quitar.length) recargarEtiquetas()
    }

    if (loading) return <Layout showSidebar><Loading /></Layout>

    const banco = resumen?.banco || []
    const totalBanco = banco.reduce((s, b) => s + parseInt(b.preguntas), 0)

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <PageHeader
                    eyebrow="Administración"
                    title="Simulador Interactivo"
                    subtitle="Banco de preguntas, áreas de conocimiento y uso del módulo."
                    actions={<>
                        <SegmentedControl value={vista} onChange={setVista} options={[{ value: 'banco', label: 'Banco' }, { value: 'etiquetas', label: 'Etiquetas' }]} />
                        {vista === 'banco' && <SegmentedControl value={carrera} onChange={c => { setCarrera(c); setFiltros(f => ({ ...f, areaId: '' })) }} options={CARRERAS} />}
                        <Button variant="secondary" onClick={sincronizarBanco} loading={sincronizando} title="Trae al banco las preguntas legacy que aún no estén"><RefreshCw className="w-4 h-4" /> Sincronizar</Button>
                    </>}
                />
                {msg && <Alert tone={msg.tone} className="mb-6">{msg.text}</Alert>}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Stat label="Preguntas en el banco" value={totalBanco} hint={banco.map(b => `${b.carrera.slice(0, 3)}: ${b.preguntas}`).join(' · ')} />
                    <Stat label="Sesiones" value={resumen?.uso?.sesiones || 0} hint={`${resumen?.uso?.finalizadas || 0} finalizadas`} />
                    <Stat label="Estudiantes activos" value={resumen?.uso?.usuarios || 0} />
                    <Stat label="Promedio" value={resumen?.uso?.promedio ? `${resumen.uso.promedio}%` : '—'} valueClass="text-medico-blue" />
                </div>

                {vista === 'etiquetas' && <GestionEtiquetas grupos={grupos} recargar={recargarEtiquetas} notificar={notificar} />}

                {vista === 'banco' && <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                    {/* Áreas */}
                    <Card className="p-5 self-start">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="w-5 h-5 text-medico-blue" />
                            <h2 className="font-sans font-semibold text-gray-900">Áreas · {CARRERAS.find(c => c.value === carrera)?.label}</h2>
                        </div>
                        <ul className="space-y-2 mb-4">
                            {areasCarrera.map(a => (
                                <li key={a.id} className={`flex items-center justify-between gap-2 p-3 rounded-xl border ${a.activa ? 'border-gray-100 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'}`}>
                                    <button className="text-left flex-1" onClick={() => setFiltros(f => ({ ...f, areaId: String(a.id), sinArea: false }))}>
                                        <p className="text-sm font-medium text-gray-900">{a.nombre}</p>
                                        <p className="text-xs text-medico-gray">{a.preguntas} preguntas</p>
                                    </button>
                                    <button onClick={() => toggleActivaArea(a)} className="text-xs text-medico-gray hover:text-gray-900">{a.activa ? 'Desactivar' : 'Activar'}</button>
                                </li>
                            ))}
                        </ul>
                        <div className="flex gap-2">
                            <input value={nuevaArea} onChange={e => setNuevaArea(e.target.value)} onKeyDown={e => e.key === 'Enter' && crearArea()} placeholder="Nueva área (ej. Cardiología)"
                                   className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-medico-blue focus:border-transparent" />
                            <Button size="sm" onClick={crearArea}><Plus className="w-4 h-4" /></Button>
                        </div>
                        <p className="text-[11px] text-medico-gray mt-3">Marca "Sin área" en los filtros para ver las preguntas nuevas que aún caen en "General" y asignarles especialidad.</p>
                    </Card>

                    {/* Preguntas */}
                    <div>
                        <Card className="p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input value={filtros.q} onChange={e => setFiltros(f => ({ ...f, q: e.target.value }))} onKeyDown={e => e.key === 'Enter' && cargarPreguntas(1)}
                                       placeholder="Buscar en enunciado o explicación… (Enter)"
                                       className="w-full rounded-full border border-gray-200 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-medico-blue focus:border-transparent" />
                            </div>
                            <select value={filtros.areaId} onChange={e => setFiltros(f => ({ ...f, areaId: e.target.value }))} className="rounded-full border border-gray-200 px-3 py-2 text-sm">
                                <option value="">Todas las áreas</option>
                                {areasCarrera.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                            </select>
                            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={filtros.sinArea} onChange={e => setFiltros(f => ({ ...f, sinArea: e.target.checked }))} className="accent-blue-800" /> Sin área</label>
                        </Card>
                        {grupos.some(g => g.etiquetas.length) && (
                            <Card className="p-4 mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-medico-gray inline-flex items-center gap-1"><Tags className="w-3.5 h-3.5" /> Filtrar por etiquetas {filtros.etiquetas.length > 0 && <span className="text-medico-blue">· {filtros.etiquetas.length} activas (debe tener todas)</span>}</p>
                                    {filtros.etiquetas.length > 0 && <button className="text-xs text-medico-gray hover:text-medico-blue" onClick={() => setFiltros(f => ({ ...f, etiquetas: [] }))}>Limpiar</button>}
                                </div>
                                <EtiquetasPicker grupos={grupos.filter(g => g.activo).map(g => ({ ...g, etiquetas: g.etiquetas.filter(e => e.activa && e.preguntas > 0) })).filter(g => g.etiquetas.length)} value={filtros.etiquetas} onChange={ids => setFiltros(f => ({ ...f, etiquetas: ids }))} compact permitirCrear={false} />
                            </Card>
                        )}

                        {seleccion.length > 0 && (
                            <Card tint="bg-blue-50" className="p-3 mb-4 flex flex-wrap items-center gap-3 border-blue-100">
                                <Tag className="w-4 h-4 text-medico-blue" />
                                <span className="text-sm font-medium text-gray-900">{seleccion.length} seleccionadas</span>
                                <select value={areaDestino} onChange={e => setAreaDestino(e.target.value)} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm">
                                    <option value="">Mover a área…</option>
                                    {areasCarrera.filter(a => a.activa).map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
                                <Button size="sm" onClick={reasignar} disabled={!areaDestino}>Aplicar</Button>
                                <button className="text-xs text-medico-gray ml-auto" onClick={() => setSeleccion([])}>Limpiar</button>
                                <div className="basis-full border-t border-blue-100 pt-3 mt-1">
                                    <p className="text-xs font-semibold text-gray-700 mb-2 inline-flex items-center gap-1"><Tags className="w-3.5 h-3.5" /> Etiquetar las seleccionadas</p>
                                    <EtiquetasPicker grupos={grupos.filter(g => g.activo).map(g => ({ ...g, etiquetas: g.etiquetas.filter(e => e.activa) }))} value={etiquetasSel} onChange={setEtiquetasSel} onGrupoActualizado={onGrupoActualizado} compact />
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" onClick={() => etiquetarSeleccion(false)} disabled={!etiquetasSel.length}><Plus className="w-4 h-4" /> Añadir</Button>
                                        <Button size="sm" variant="secondary" onClick={() => etiquetarSeleccion(true)} disabled={!etiquetasSel.length}><X className="w-4 h-4" /> Quitar</Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        <Card className="overflow-hidden">
                            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between text-xs text-medico-gray">
                                <label className="flex items-center gap-2"><input type="checkbox" checked={preguntas.length > 0 && seleccion.length === preguntas.length} onChange={toggleTodas} className="accent-blue-800" /> {pag.total} preguntas</label>
                                <span>Página {pag.page} de {pag.totalPages}</span>
                            </div>
                            {cargandoLista ? <Loading /> : (
                                <ul className="divide-y divide-gray-100">
                                    {preguntas.map(p => (
                                        <li key={p.id} className="p-5 flex gap-4 hover:bg-gray-50">
                                            <input type="checkbox" checked={seleccion.includes(p.id)} onChange={() => toggleSel(p.id)} className="mt-1 accent-blue-800" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900 line-clamp-2">{p.enunciado}</p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Pill className="bg-blue-50 text-medico-blue border-blue-100">{p.area_nombre || 'Sin área'}</Pill>
                                                    {p.tema && <Pill className="bg-gray-50 text-gray-700 border-gray-100">{p.tema}</Pill>}
                                                    {p.dificultad && <Pill className="bg-orange-50 text-medico-orange border-orange-100">Dif. {p.dificultad}</Pill>}
                                                    {!p.activa && <Pill className="bg-red-50 text-medico-red border-red-100">Inactiva</Pill>}
                                                    {p.acierto_pct !== null && <Pill className="bg-gray-50 text-gray-600 border-gray-100"><Users className="w-3 h-3" /> {p.veces_respondida} · {p.acierto_pct}% acierto</Pill>}
                                                    {(p.etiquetas || []).map(e => <span key={e.id} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] text-white" style={{ background: e.color }} title={`${e.grupo}${e.origen === 'auto' ? ' · asignada automáticamente' : ''}`}>{e.nombre}</span>)}
                                                </div>
                                                <p className="text-[11px] text-medico-gray mt-1 truncate">Origen: {(p.fuentes || []).join(' · ')}</p>
                                            </div>
                                            <button onClick={() => setEditando({ ...p, area_id: p.area_id || '', tema: p.tema || '', dificultad: p.dificultad || '', etiquetaIds: (p.etiquetas || []).map(e => e.id) })} className="self-start p-2 rounded-full hover:bg-gray-100 text-gray-500" title="Editar">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                                <Button variant="secondary" size="sm" disabled={pag.page <= 1} onClick={() => cargarPreguntas(pag.page - 1)}>Anterior</Button>
                                <Button variant="secondary" size="sm" disabled={pag.page >= pag.totalPages} onClick={() => cargarPreguntas(pag.page + 1)}>Siguiente</Button>
                            </div>
                        </Card>
                    </div>
                </div>}
            </div>

            {/* Editor */}
            <Modal open={!!editando} title="Editar pregunta" onClose={() => setEditando(null)}
                   footer={editando && <>
                       <Button variant="secondary" onClick={() => setEditando(null)}><X className="w-4 h-4" /> Cancelar</Button>
                       <Button onClick={guardarEdicion}><Save className="w-4 h-4" /> Guardar</Button>
                   </>}>
                {editando && (
                    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                        <div className="grid grid-cols-3 gap-3">
                            <label className="text-xs text-medico-gray">Área
                                <select value={editando.area_id} onChange={e => setEditando({ ...editando, area_id: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm">
                                    <option value="">Sin área</option>
                                    {areasCarrera.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                                </select>
                            </label>
                            <label className="text-xs text-medico-gray">Tema
                                <input value={editando.tema} onChange={e => setEditando({ ...editando, tema: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm" />
                            </label>
                            <label className="text-xs text-medico-gray">Dificultad
                                <select value={editando.dificultad} onChange={e => setEditando({ ...editando, dificultad: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-2 py-2 text-sm">
                                    <option value="">—</option><option value="1">1 · Fácil</option><option value="2">2 · Media</option><option value="3">3 · Difícil</option>
                                </select>
                            </label>
                        </div>
                        <label className="block text-xs text-medico-gray">Enunciado
                            <textarea rows={4} value={editando.enunciado} onChange={e => setEditando({ ...editando, enunciado: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        </label>
                        <div className="space-y-2">
                            <p className="text-xs text-medico-gray">Opciones (marca la correcta)</p>
                            {editando.opciones.map((o, i) => (
                                <div key={o.id} className="flex items-center gap-2">
                                    <input type="radio" name="correcta" checked={o.es_correcta} onChange={() => setEditando({ ...editando, opciones: editando.opciones.map((x, j) => ({ ...x, es_correcta: j === i })) })} className="accent-blue-800" />
                                    <input value={o.texto} onChange={e => setEditando({ ...editando, opciones: editando.opciones.map((x, j) => j === i ? { ...x, texto: e.target.value } : x) })} className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                                </div>
                            ))}
                        </div>
                        <label className="block text-xs text-medico-gray">Explicación
                            <textarea rows={5} value={editando.explicacion || ''} onChange={e => setEditando({ ...editando, explicacion: e.target.value })} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                        </label>
                        <div>
                            <p className="text-xs text-medico-gray mb-1">Etiquetas</p>
                            <EtiquetasPicker grupos={grupos.filter(g => g.activo).map(g => ({ ...g, etiquetas: g.etiquetas.filter(e => e.activa) }))} value={editando.etiquetaIds || []} onChange={ids => setEditando({ ...editando, etiquetaIds: ids })} onGrupoActualizado={onGrupoActualizado} compact />
                        </div>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editando.activa} onChange={e => setEditando({ ...editando, activa: e.target.checked })} className="accent-blue-800" /> Activa (visible para estudiantes)</label>
                        <p className="text-[11px] text-medico-gray flex items-center gap-1"><Database className="w-3 h-3" /> Editar opciones conserva sus identificadores: el historial de los alumnos no se pierde.</p>
                    </div>
                )}
            </Modal>
        </Layout>
    )
}

// =============================================
// Gestión de etiquetas: grupos (Institución, Año…) y sus valores. El admin crea lo que necesite.
// =============================================
const GestionEtiquetas = ({ grupos, recargar, notificar }) => {
    const [nuevoGrupo, setNuevoGrupo] = useState('')
    const [nueva, setNueva] = useState({})     // { [grupoId]: texto }
    const [editando, setEditando] = useState(null)   // { id, nombre }
    const input = 'rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-medico-blue focus:border-transparent'

    const crearGrupo = async () => {
        if (!nuevoGrupo.trim()) return
        const r = await simuladorService.crearGrupoEtiquetas({ nombre: nuevoGrupo.trim() })
        if (r.success) { setNuevoGrupo(''); recargar() } else notificar('error', r.error)
    }
    const crearEtiqueta = async (g) => {
        const nombre = (nueva[g.id] || '').trim()
        if (!nombre) return
        const r = await simuladorService.crearEtiqueta({ grupoId: g.id, nombre })
        if (r.success) { setNueva(n => ({ ...n, [g.id]: '' })); recargar(); if (r.data.yaExistia) notificar('info', 'Esa etiqueta ya existía') } else notificar('error', r.error)
    }
    const guardarNombre = async () => {
        if (!editando?.nombre?.trim()) return
        const r = await simuladorService.actualizarEtiqueta(editando.id, { nombre: editando.nombre.trim() })
        if (r.success) { setEditando(null); recargar() } else notificar('error', r.error)
    }
    const toggleEtiqueta = async (e) => { const r = await simuladorService.actualizarEtiqueta(e.id, { activa: !e.activa }); if (r.success) recargar(); else notificar('error', r.error) }
    const eliminarEtiqueta = async (e) => {
        if (!window.confirm(`¿Eliminar la etiqueta "${e.nombre}"? Se quitará de ${e.preguntas} pregunta(s).`)) return
        const r = await simuladorService.eliminarEtiqueta(e.id); if (r.success) recargar(); else notificar('error', r.error)
    }
    const toggleVisible = async (g) => { const r = await simuladorService.actualizarGrupoEtiquetas(g.id, { visibleAlumno: !g.visible_alumno }); if (r.success) recargar(); else notificar('error', r.error) }
    const eliminarGrupo = async (g) => {
        const n = g.etiquetas.reduce((a, e) => a + e.preguntas, 0)
        if (!window.confirm(`¿Eliminar el grupo "${g.nombre}" con sus ${g.etiquetas.length} etiquetas (${n} asignaciones)?`)) return
        const r = await simuladorService.eliminarGrupoEtiquetas(g.id); if (r.success) recargar(); else notificar('error', r.error)
    }

    return (
        <div className="space-y-4">
            <Card className="p-5">
                <p className="text-sm text-gray-700 mb-3">Las etiquetas son filtros libres para las preguntas: institución, año, convocatoria, examen concreto… Una pregunta puede tener varias o ninguna. Los grupos marcados como <strong>visibles</strong> aparecen al alumno como filtro al iniciar una sesión.</p>
                <div className="flex gap-2 max-w-md">
                    <input value={nuevoGrupo} onChange={e => setNuevoGrupo(e.target.value)} onKeyDown={e => e.key === 'Enter' && crearGrupo()} placeholder="Nuevo grupo (ej. Docente, Bloque, Universidad)" className={`flex-1 ${input}`} />
                    <Button size="sm" onClick={crearGrupo}><Plus className="w-4 h-4" /> Grupo</Button>
                </div>
            </Card>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {grupos.map(g => (
                    <Card key={g.id} className={`p-5 ${g.activo ? '' : 'opacity-60'}`}>
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <h3 className="font-semibold text-gray-900 inline-flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: g.color }} /> {g.nombre} <span className="text-xs text-medico-gray font-normal">· {g.etiquetas.length}</span></h3>
                            <div className="flex items-center gap-1">
                                <button onClick={() => toggleVisible(g)} title={g.visible_alumno ? 'Visible para el alumno (clic para ocultar)' : 'Oculto al alumno (clic para mostrar)'} className={`p-1.5 rounded-lg ${g.visible_alumno ? 'text-medico-green hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}>{g.visible_alumno ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}</button>
                                <button onClick={() => eliminarGrupo(g)} title="Eliminar grupo" className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <ul className="space-y-1 mb-3">
                            {g.etiquetas.map(e => (
                                <li key={e.id} className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-gray-50 ${e.activa ? '' : 'opacity-50'}`}>
                                    {editando?.id === e.id ? (
                                        <>
                                            <input autoFocus value={editando.nombre} onChange={ev => setEditando({ ...editando, nombre: ev.target.value })} onKeyDown={ev => { if (ev.key === 'Enter') guardarNombre(); if (ev.key === 'Escape') setEditando(null) }} className={`flex-1 ${input} py-1`} />
                                            <button onClick={guardarNombre} className="p-1 rounded-lg text-medico-blue hover:bg-blue-50"><Save className="w-4 h-4" /></button>
                                            <button onClick={() => setEditando(null)} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"><X className="w-4 h-4" /></button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-gray-900">{e.nombre}</span>
                                            <span className="text-xs text-medico-gray tabular-nums">{e.preguntas} preg.</span>
                                            <button onClick={() => setEditando({ id: e.id, nombre: e.nombre })} className="p-1 rounded-lg text-gray-400 hover:text-medico-blue hover:bg-blue-50" title="Renombrar"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => toggleEtiqueta(e)} className="text-[11px] text-medico-gray hover:text-gray-900">{e.activa ? 'Desactivar' : 'Activar'}</button>
                                            <button onClick={() => eliminarEtiqueta(e)} className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </>
                                    )}
                                </li>
                            ))}
                            {g.etiquetas.length === 0 && <li className="text-xs text-medico-gray px-2">Sin etiquetas todavía.</li>}
                        </ul>
                        <div className="flex gap-2">
                            <input value={nueva[g.id] || ''} onChange={e => setNueva(n => ({ ...n, [g.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && crearEtiqueta(g)} placeholder={`Nueva etiqueta en ${g.nombre}…`} className={`flex-1 ${input}`} />
                            <Button size="sm" onClick={() => crearEtiqueta(g)}><Plus className="w-4 h-4" /></Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default SimuladorAdmin
