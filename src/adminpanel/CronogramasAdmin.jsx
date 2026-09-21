// src/adminpanel/CronogramasAdmin.jsx - Admin: lista de cronogramas y editor (cabecera, items, importar, vincular, desplazar, duplicar)
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, Plus, ArrowLeft, Trash2, Pencil, Link2, Upload, MoveRight, Copy, Eye, EyeOff, Save, X, Check, Video, Radio } from 'lucide-react'
import Layout from '../utils/Layout'
import cronogramasService from '../services/cronogramas'
import courseService from '../services/courses'
import { Card, PageHeader, Button, Pill, Loading, EmptyState, Alert, Modal } from '../simulador/ui'
import { limpiarTitulo } from '../biblioteca/Biblioteca'

const input = 'w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-medico-blue focus:border-transparent'
const label = 'block text-xs font-semibold text-gray-700 mb-1'

const CronogramasAdmin = () => {
    const { id } = useParams()
    return id ? <Editor id={id} /> : <Lista />
}

// =============================================
// Lista + crear
// =============================================
const Lista = () => {
    const navigate = useNavigate()
    const [lista, setLista] = useState(null)
    const [cursos, setCursos] = useState([])
    const [nuevo, setNuevo] = useState({ cursoId: '', titulo: '', cohorte: '', fechaInicio: '', fechaExamen: '' })
    const [creando, setCreando] = useState(false)
    const [error, setError] = useState('')

    const cargar = async () => {
        const [r, c] = await Promise.all([cronogramasService.adminListar(), courseService.getAllCourses()])
        if (r.success) setLista(r.data.cronogramas); else setError(r.error)
        if (c.success) setCursos(c.data.cursos)
    }
    useEffect(() => { cargar() }, [])

    const crear = async (e) => {
        e.preventDefault()
        if (!nuevo.cursoId || !nuevo.titulo.trim()) return
        setCreando(true)
        const r = await cronogramasService.adminCrear({ ...nuevo, publicado: false })
        setCreando(false)
        if (r.success) navigate(`/admin/cronogramas/${r.data.cronograma.id}`)
        else setError(r.error)
    }

    if (!lista) return <Layout showSidebar><Loading text="Cargando cronogramas…" /></Layout>
    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <PageHeader eyebrow="Contenido" title="Cronogramas" subtitle="Guía día a día de cada curso: qué clase ver cada día, sesiones en vivo y fecha del examen. Los alumnos la ven en Mis cursos y Mi progreso." />
                {error && <Alert tone="error" className="mb-6">{error}</Alert>}

                <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
                    <Card className="overflow-hidden">
                        {lista.length === 0 ? <div className="p-6"><EmptyState icon={CalendarDays} title="Aún no hay cronogramas" description="Crea el primero con el formulario de la derecha." /></div> : (
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-medico-gray">
                                    <tr><th className="text-left px-4 py-3">Cronograma</th><th className="text-left px-4 py-3">Curso</th><th className="text-left px-4 py-3">Fechas</th><th className="text-left px-4 py-3">Items</th><th className="px-4 py-3">Estado</th><th /></tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {lista.map(c => (
                                        <tr key={c.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/admin/cronogramas/${c.id}`)}>
                                            <td className="px-4 py-3"><p className="font-medium text-gray-900">{c.titulo}</p>{c.cohorte && <p className="text-xs text-medico-gray">{c.cohorte}</p>}</td>
                                            <td className="px-4 py-3 text-gray-700">{limpiarTitulo(c.cursoTitulo)}</td>
                                            <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{cronogramasService.formatFecha(c.fechaInicio, { day: 'numeric', month: 'short' })} → {cronogramasService.formatFecha(c.fechaFin, { day: 'numeric', month: 'short', year: '2-digit' })}{c.fechaExamen && <span className="block text-xs text-amber-700">Examen {cronogramasService.formatFecha(c.fechaExamen, { day: 'numeric', month: 'short' })}</span>}</td>
                                            <td className="px-4 py-3 text-gray-700">{c.totalItems}</td>
                                            <td className="px-4 py-3 text-center">{c.publicado ? <Pill className="bg-emerald-50 text-medico-green border-emerald-100">Publicado</Pill> : <Pill className="bg-gray-50 text-gray-600 border-gray-100">Borrador</Pill>}</td>
                                            <td className="px-4 py-3 text-right"><Pencil className="w-4 h-4 text-gray-400 inline" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </Card>

                    <Card className="p-5">
                        <h2 className="font-sans text-lg font-semibold text-gray-900 mb-3">Nuevo cronograma</h2>
                        <form onSubmit={crear} className="space-y-3">
                            <div><label className={label}>Curso</label>
                                <select value={nuevo.cursoId} onChange={e => setNuevo(n => ({ ...n, cursoId: e.target.value }))} className={input} required>
                                    <option value="">Elige un curso…</option>
                                    {cursos.map(c => <option key={c.id} value={c.id}>{limpiarTitulo(c.titulo)}</option>)}
                                </select></div>
                            <div><label className={label}>Título</label><input value={nuevo.titulo} onChange={e => setNuevo(n => ({ ...n, titulo: e.target.value }))} className={input} placeholder="EHEP CACES Octubre 2026 · Medicina" required /></div>
                            <div><label className={label}>Cohorte (opcional)</label><input value={nuevo.cohorte} onChange={e => setNuevo(n => ({ ...n, cohorte: e.target.value }))} className={input} placeholder="EHEP CACES OCTUBRE 2026" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={label}>Inicio</label><input type="date" value={nuevo.fechaInicio} onChange={e => setNuevo(n => ({ ...n, fechaInicio: e.target.value }))} className={input} /></div>
                                <div><label className={label}>Examen</label><input type="date" value={nuevo.fechaExamen} onChange={e => setNuevo(n => ({ ...n, fechaExamen: e.target.value }))} className={input} /></div>
                            </div>
                            <Button type="submit" className="w-full" loading={creando}><Plus className="w-4 h-4" /> Crear y editar</Button>
                            <p className="text-xs text-medico-gray">Se crea como borrador. Luego importas las clases (pegando el cronograma) o las añades una a una, y lo publicas.</p>
                        </form>
                    </Card>
                </div>
            </div>
        </Layout>
    )
}

// =============================================
// Editor
// =============================================
const ITEM_VACIO = { fecha: '', bloque: '', seccion: '', titulo: '', tipo: 'clase', modalidad: 'asincronica', hora: '', link: '', claseId: '' }

const Editor = ({ id }) => {
    const navigate = useNavigate()
    const [data, setData] = useState(null)
    const [cab, setCab] = useState(null)
    const [items, setItems] = useState([])
    const [error, setError] = useState('')
    const [ok, setOk] = useState('')
    const [guardando, setGuardando] = useState(false)
    const [editando, setEditando] = useState(null)      // item en edición (objeto)
    const [nuevoItem, setNuevoItem] = useState(null)    // objeto o null
    const [modal, setModal] = useState(null)            // 'importar' | 'desplazar' | 'duplicar' | 'eliminar'
    const [texto, setTexto] = useState('')
    const [reemplazar, setReemplazar] = useState(false)
    const [dias, setDias] = useState('')
    const [dup, setDup] = useState({ cursoId: '', fechaInicio: '', titulo: '' })
    const [cursos, setCursos] = useState([])

    const cargar = async () => {
        const r = await cronogramasService.adminObtener(id)
        if (!r.success) { setError(r.error); return }
        setData(r.data); setItems(r.data.items)
        const c = r.data.cronograma
        setCab({ titulo: c.titulo, cohorte: c.cohorte || '', descripcion: c.descripcion || '', fechaInicio: c.fechaInicio || '', fechaFin: c.fechaFin || '', fechaExamen: c.fechaExamen || '', examenEtiqueta: c.examenEtiqueta || '', publicado: c.publicado })
    }
    useEffect(() => { cargar() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { if (ok) { const t = setTimeout(() => setOk(''), 3000); return () => clearTimeout(t) } return undefined }, [ok])

    const bloques = useMemo(() => [...new Set(items.map(i => i.bloque).filter(Boolean))], [items])
    const secciones = useMemo(() => [...new Set(items.map(i => i.seccion).filter(Boolean))], [items])
    const porFecha = useMemo(() => {
        const m = new Map()
        items.forEach(i => { if (!m.has(i.fecha)) m.set(i.fecha, []); m.get(i.fecha).push(i) })
        return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    }, [items])

    const guardarCab = async () => {
        setGuardando(true)
        const r = await cronogramasService.adminActualizar(id, cab)
        setGuardando(false)
        if (r.success) { setOk('Cabecera guardada'); setData(d => ({ ...d, cronograma: r.data.cronograma })) } else setError(r.error)
    }
    const togglePublicado = async () => {
        const r = await cronogramasService.adminActualizar(id, { publicado: !cab.publicado })
        if (r.success) { setCab(c => ({ ...c, publicado: r.data.cronograma.publicado })); setOk(r.data.cronograma.publicado ? 'Publicado: ya lo ven los alumnos' : 'Despublicado') }
    }
    const guardarItem = async (it) => {
        setGuardando(true)
        const payload = { ...it, claseId: it.claseId || null, hora: it.hora || null, link: it.link || null, modalidad: it.modalidad || null }
        const r = it.id ? await cronogramasService.adminActualizarItem(it.id, payload) : await cronogramasService.adminCrearItem(id, payload)
        setGuardando(false)
        if (!r.success) { setError(r.error); return }
        setItems(prev => it.id ? prev.map(x => x.id === it.id ? r.data.item : x) : [...prev, r.data.item])
        setEditando(null); setNuevoItem(null); setOk(it.id ? 'Clase actualizada' : 'Clase añadida')
    }
    const eliminarItem = async (it) => {
        const r = await cronogramasService.adminEliminarItem(it.id)
        if (r.success) setItems(prev => prev.filter(x => x.id !== it.id))
    }
    const autoVincular = async () => {
        setGuardando(true)
        const r = await cronogramasService.adminAutoVincular(id, { soloSinVinculo: true })
        setGuardando(false)
        if (r.success) { setOk(`${r.data.vinculados} clases vinculadas automáticamente`); cargar() } else setError(r.error)
    }
    const importar = async () => {
        setGuardando(true)
        const r = await cronogramasService.adminImportar(id, { texto, reemplazar })
        setGuardando(false)
        if (r.success) { setOk(`${r.data.importados} clases importadas · ${r.data.vinculados} vinculadas${r.data.errores.length ? ` · ${r.data.errores.length} líneas con error` : ''}`); if (r.data.errores.length) setError(r.data.errores.join('\n')); setModal(null); setTexto(''); cargar() } else setError(r.error)
    }
    const desplazar = async () => {
        const n = parseInt(dias)
        if (!n) return
        setGuardando(true)
        const r = await cronogramasService.adminDesplazar(id, n)
        setGuardando(false)
        if (r.success) { setOk(`Fechas desplazadas ${n > 0 ? '+' : ''}${n} días`); setModal(null); setDias(''); cargar() } else setError(r.error)
    }
    const duplicar = async () => {
        if (!dup.cursoId) return
        setGuardando(true)
        const r = await cronogramasService.adminDuplicar(id, dup)
        setGuardando(false)
        if (r.success) navigate(`/admin/cronogramas/${r.data.cronograma.id}`); else setError(r.error)
    }
    const eliminar = async () => {
        const r = await cronogramasService.adminEliminar(id)
        if (r.success) navigate('/admin/cronogramas')
    }
    const abrirDuplicar = async () => { setModal('duplicar'); if (!cursos.length) { const c = await courseService.getAllCourses(); if (c.success) setCursos(c.data.cursos) } }

    if (!data || !cab) return <Layout showSidebar>{error ? <div className="p-8"><Alert tone="error">{error}</Alert></div> : <Loading text="Cargando cronograma…" />}</Layout>
    const c = data.cronograma
    const sinVinculo = items.filter(i => ['clase', 'repaso'].includes(i.tipo) && !i.claseId).length

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <Button variant="ghost" size="sm" to="/admin/cronogramas" className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4" /> Cronogramas</Button>
                <PageHeader eyebrow={limpiarTitulo(c.cursoTitulo)} title={c.titulo}
                            subtitle={`${items.length} clases · ${sinVinculo} sin clase vinculada · ${data.hoy ? `hoy ${cronogramasService.formatFecha(data.hoy, { day: 'numeric', month: 'short' })}` : ''}`}
                            actions={<>
                                <Button variant={cab.publicado ? 'secondary' : 'success'} onClick={togglePublicado}>{cab.publicado ? <><EyeOff className="w-4 h-4" /> Despublicar</> : <><Eye className="w-4 h-4" /> Publicar</>}</Button>
                                <Button variant="secondary" onClick={() => navigate(`/cronograma/${c.cursoId}`)}><Eye className="w-4 h-4" /> Ver como alumno</Button>
                            </>} />
                {error && <Alert tone="error" className="mb-4 whitespace-pre-line"><div className="flex justify-between gap-3"><span>{error}</span><button onClick={() => setError('')}><X className="w-4 h-4" /></button></div></Alert>}
                {ok && <Alert tone="ok" className="mb-4">{ok}</Alert>}

                <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6 items-start">
                    {/* Cabecera y herramientas */}
                    <div className="space-y-4 xl:sticky xl:top-24">
                        <Card className="p-5 space-y-3">
                            <h2 className="font-sans text-base font-semibold text-gray-900">Datos del cronograma</h2>
                            <div><label className={label}>Título</label><input value={cab.titulo} onChange={e => setCab(x => ({ ...x, titulo: e.target.value }))} className={input} /></div>
                            <div><label className={label}>Cohorte</label><input value={cab.cohorte} onChange={e => setCab(x => ({ ...x, cohorte: e.target.value }))} className={input} /></div>
                            <div><label className={label}>Descripción</label><textarea rows={2} value={cab.descripcion} onChange={e => setCab(x => ({ ...x, descripcion: e.target.value }))} className={input} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className={label}>Inicio</label><input type="date" value={cab.fechaInicio} onChange={e => setCab(x => ({ ...x, fechaInicio: e.target.value }))} className={input} /></div>
                                <div><label className={label}>Fin</label><input type="date" value={cab.fechaFin} onChange={e => setCab(x => ({ ...x, fechaFin: e.target.value }))} className={input} /></div>
                            </div>
                            <div><label className={label}>Fecha del examen</label><input type="date" value={cab.fechaExamen} onChange={e => setCab(x => ({ ...x, fechaExamen: e.target.value }))} className={input} /></div>
                            <div><label className={label}>Etiqueta del examen</label><input value={cab.examenEtiqueta} onChange={e => setCab(x => ({ ...x, examenEtiqueta: e.target.value }))} className={input} placeholder="Examen EHEP CACES · 30/31 de mayo" /></div>
                            <Button className="w-full" onClick={guardarCab} loading={guardando}><Save className="w-4 h-4" /> Guardar</Button>
                        </Card>
                        <Card className="p-5 space-y-2">
                            <h2 className="font-sans text-base font-semibold text-gray-900 mb-1">Herramientas</h2>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => setModal('importar')}><Upload className="w-4 h-4" /> Importar clases (pegar texto)</Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={autoVincular} loading={guardando}><Link2 className="w-4 h-4" /> Vincular clases grabadas ({sinVinculo} pendientes)</Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={() => setModal('desplazar')}><MoveRight className="w-4 h-4" /> Desplazar todas las fechas</Button>
                            <Button variant="secondary" className="w-full justify-start" onClick={abrirDuplicar}><Copy className="w-4 h-4" /> Duplicar a otro curso / cohorte</Button>
                            <Button variant="danger" className="w-full justify-start" onClick={() => setModal('eliminar')}><Trash2 className="w-4 h-4" /> Eliminar cronograma</Button>
                        </Card>
                    </div>

                    {/* Items */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-sans text-lg font-semibold text-gray-900">Clases por día</h2>
                            <Button size="sm" onClick={() => { setEditando(null); setNuevoItem({ ...ITEM_VACIO, fecha: data.hoy || '' }) }}><Plus className="w-4 h-4" /> Añadir clase</Button>
                        </div>
                        {nuevoItem && <ItemForm item={nuevoItem} clases={data.clasesCurso} bloques={bloques} secciones={secciones} onChange={setNuevoItem} onSave={() => guardarItem(nuevoItem)} onCancel={() => setNuevoItem(null)} guardando={guardando} />}
                        {items.length === 0 && !nuevoItem && <EmptyState icon={CalendarDays} title="Sin clases todavía" description="Importa el cronograma pegando el texto o añade las clases una a una." action={<Button onClick={() => setModal('importar')}><Upload className="w-4 h-4" /> Importar</Button>} />}
                        <div className="space-y-3">
                            {porFecha.map(([fecha, lista]) => (
                                <Card key={fecha} className="p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${fecha === data.hoy ? 'bg-medico-blue text-white' : fecha < data.hoy ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-medico-blue'}`}>{cronogramasService.formatFecha(fecha, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        <span className="text-xs text-medico-gray">{lista[0].bloque}{lista[0].seccion ? ` · ${lista[0].seccion}` : ''}</span>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {lista.map(it => editando?.id === it.id
                                            ? <ItemForm key={it.id} item={editando} clases={data.clasesCurso} bloques={bloques} secciones={secciones} onChange={setEditando} onSave={() => guardarItem(editando)} onCancel={() => setEditando(null)} guardando={guardando} />
                                            : (
                                                <div key={it.id} className="flex items-center gap-3 py-2">
                                                    {it.modalidad === 'en_vivo' ? <Radio className="w-4 h-4 text-medico-red flex-shrink-0" /> : <Video className="w-4 h-4 text-medico-blue flex-shrink-0" />}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-900">{it.titulo}</p>
                                                        <p className="text-[11px] text-medico-gray truncate">{it.tipo !== 'clase' && <span className="uppercase font-semibold mr-1">{it.tipo}</span>}{it.claseId ? <span className="text-medico-green">↳ {limpiarTitulo(it.claseTitulo)}</span> : <span className="text-medico-orange">Sin clase vinculada</span>}{it.hora ? ` · ${it.hora.slice(0, 5)}` : ''}</p>
                                                    </div>
                                                    <button onClick={() => { setNuevoItem(null); setEditando({ ...it, claseId: it.claseId || '', hora: it.hora || '', link: it.link || '', bloque: it.bloque || '', seccion: it.seccion || '', modalidad: it.modalidad || '' }) }} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500" title="Editar"><Pencil className="w-4 h-4" /></button>
                                                    <button onClick={() => eliminarItem(it)} className="p-1.5 rounded-full hover:bg-red-50 text-gray-500 hover:text-medico-red" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            ))}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modales */}
            <Modal open={modal === 'importar'} title="Importar clases" onClose={() => setModal(null)}
                   footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={importar} loading={guardando} disabled={!texto.trim()}><Upload className="w-4 h-4" /> Importar</Button></>}>
                <p className="mb-2">Una línea por clase, columnas separadas por <code>|</code>:</p>
                <pre className="text-xs bg-gray-50 rounded-xl p-3 mb-3 overflow-x-auto">{`fecha | bloque | sección | título | modalidad
01/04/2026 | 1. Cirugía | Cirugía general | Heridas quirúrgicas, ASA y quemaduras | asincronica
02/04/2026 | | | Refuerzo oftalmología | en vivo`}</pre>
                <p className="text-xs text-medico-gray mb-2">Bloque y sección vacíos heredan los de la línea anterior. Los títulos que empiezan por "Repaso" se marcan como repaso. Al terminar se vinculan las clases grabadas por título.</p>
                <textarea value={texto} onChange={e => setTexto(e.target.value)} rows={10} className={input} placeholder="Pega aquí el cronograma…" />
                <label className="flex items-center gap-2 mt-3 text-sm"><input type="checkbox" checked={reemplazar} onChange={e => setReemplazar(e.target.checked)} /> Reemplazar las clases actuales</label>
            </Modal>
            <Modal open={modal === 'desplazar'} title="Desplazar fechas" onClose={() => setModal(null)}
                   footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={desplazar} loading={guardando} disabled={!parseInt(dias)}>Desplazar</Button></>}>
                <p className="mb-3">Mueve todas las clases, el inicio, el fin y el examen la misma cantidad de días (negativo para adelantar).</p>
                <input type="number" value={dias} onChange={e => setDias(e.target.value)} className={input} placeholder="Ej. 7 (una semana después) o -3" />
            </Modal>
            <Modal open={modal === 'duplicar'} title="Duplicar cronograma" onClose={() => setModal(null)}
                   footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button onClick={duplicar} loading={guardando} disabled={!dup.cursoId}><Copy className="w-4 h-4" /> Duplicar</Button></>}>
                <p className="mb-3">Crea una copia (como borrador) en otro curso o cohorte. Si indicas una fecha de inicio, todas las fechas se desplazan; las clases grabadas se vinculan de nuevo por título.</p>
                <div className="space-y-3">
                    <div><label className={label}>Curso destino</label><select value={dup.cursoId} onChange={e => setDup(d => ({ ...d, cursoId: e.target.value }))} className={input}><option value="">Elige…</option>{cursos.map(x => <option key={x.id} value={x.id}>{limpiarTitulo(x.titulo)}</option>)}</select></div>
                    <div><label className={label}>Nueva fecha de inicio (opcional)</label><input type="date" value={dup.fechaInicio} onChange={e => setDup(d => ({ ...d, fechaInicio: e.target.value }))} className={input} /></div>
                    <div><label className={label}>Título (opcional)</label><input value={dup.titulo} onChange={e => setDup(d => ({ ...d, titulo: e.target.value }))} className={input} placeholder={`${c.titulo} (copia)`} /></div>
                </div>
            </Modal>
            <Modal open={modal === 'eliminar'} title="Eliminar cronograma" onClose={() => setModal(null)}
                   footer={<><Button variant="secondary" onClick={() => setModal(null)}>Cancelar</Button><Button variant="danger" onClick={eliminar}><Trash2 className="w-4 h-4" /> Sí, eliminar</Button></>}>
                <p>El cronograma dejará de verse para los alumnos. Sus clases y marcas se conservan por si quieres recuperarlo desde la base de datos.</p>
            </Modal>
        </Layout>
    )
}

const ItemForm = ({ item, clases, bloques, secciones, onChange, onSave, onCancel, guardando }) => {
    const set = (k, v) => onChange({ ...item, [k]: v })
    return (
        <div className="rounded-2xl border-2 border-medico-blue/40 bg-blue-50/30 p-4 my-2 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div><label className={label}>Fecha</label><input type="date" value={item.fecha} onChange={e => set('fecha', e.target.value)} className={input} required /></div>
                <div><label className={label}>Tipo</label><select value={item.tipo} onChange={e => set('tipo', e.target.value)} className={input}>{Object.entries(cronogramasService.TIPOS).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}</select></div>
                <div><label className={label}>Modalidad</label><select value={item.modalidad} onChange={e => set('modalidad', e.target.value)} className={input}><option value="">—</option><option value="asincronica">Asincrónica</option><option value="en_vivo">En vivo</option></select></div>
                <div><label className={label}>Hora (opcional)</label><input type="time" value={item.hora} onChange={e => set('hora', e.target.value)} className={input} /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={label}>Bloque</label><input list="cron-bloques" value={item.bloque} onChange={e => set('bloque', e.target.value)} className={input} placeholder="2. Medicina Interna" /><datalist id="cron-bloques">{bloques.map(b => <option key={b} value={b} />)}</datalist></div>
                <div><label className={label}>Sección</label><input list="cron-secciones" value={item.seccion} onChange={e => set('seccion', e.target.value)} className={input} placeholder="CARDIOLOGÍA" /><datalist id="cron-secciones">{secciones.map(s => <option key={s} value={s} />)}</datalist></div>
            </div>
            <div><label className={label}>Título</label><input value={item.titulo} onChange={e => set('titulo', e.target.value)} className={input} placeholder="SCA, VALVULOPATÍAS E INSUFICIENCIA CARDÍACA" required /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className={label}>Clase grabada vinculada</label>
                    <select value={item.claseId} onChange={e => set('claseId', e.target.value)} className={input}>
                        <option value="">— Sin vincular —</option>
                        {clases.map(cl => <option key={cl.id} value={cl.id}>{limpiarTitulo(cl.modulo)} › {limpiarTitulo(cl.titulo)}</option>)}
                    </select></div>
                <div><label className={label}>Enlace de la sesión en vivo (opcional)</label><input value={item.link} onChange={e => set('link', e.target.value)} className={input} placeholder="https://zoom.us/…" /></div>
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4" /> Cancelar</Button>
                <Button size="sm" onClick={onSave} loading={guardando} disabled={!item.fecha || !item.titulo.trim()}><Check className="w-4 h-4" /> Guardar</Button>
            </div>
        </div>
    )
}

export default CronogramasAdmin
