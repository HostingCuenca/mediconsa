// EtiquetasPicker — selector de etiquetas del banco de preguntas agrupadas (Institución, Año, Tipo de examen…).
// Chips por grupo; el admin puede crear una etiqueta nueva al vuelo ("+ nueva…"). Devuelve ids seleccionados.
import React, { useState } from 'react'
import { Plus, X, Check } from 'lucide-react'
import simuladorService from '../services/simulador'

const EtiquetasPicker = ({ grupos = [], value = [], onChange, onGrupoActualizado, compact = false, permitirCrear = true }) => {
    const [nuevo, setNuevo] = useState(null)   // { grupoId, nombre }
    const [ocupado, setOcupado] = useState(false)
    const sel = new Set((value || []).map(Number))

    const toggle = (id) => {
        const s = new Set(sel)
        if (s.has(id)) s.delete(id); else s.add(id)
        onChange([...s])
    }
    const crear = async () => {
        if (!nuevo?.nombre?.trim()) return
        setOcupado(true)
        const r = await simuladorService.crearEtiqueta({ grupoId: nuevo.grupoId, nombre: nuevo.nombre.trim() })
        setOcupado(false)
        if (r.success) {
            onGrupoActualizado?.(nuevo.grupoId, r.data.etiqueta)
            onChange([...sel, r.data.etiqueta.id])
            setNuevo(null)
        }
    }

    if (!grupos.length) return <p className="text-xs text-medico-gray">No hay grupos de etiquetas. Créalos en Simulador interactivo → Etiquetas.</p>
    return (
        <div className={compact ? 'space-y-1.5' : 'space-y-2.5'}>
            {grupos.map(g => (
                <div key={g.id} className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wide w-24 flex-shrink-0" style={{ color: g.color }}>{g.nombre}</span>
                    {g.etiquetas.map(e => {
                        const on = sel.has(e.id)
                        return (
                            <button key={e.id} type="button" onClick={() => toggle(e.id)}
                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition-colors ${on ? 'text-white border-transparent' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}
                                    style={on ? { background: g.color } : undefined}>
                                {on && <Check className="w-3 h-3" />}{e.nombre}
                            </button>
                        )
                    })}
                    {permitirCrear && (nuevo?.grupoId === g.id ? (
                        <span className="inline-flex items-center gap-1">
                            <input autoFocus value={nuevo.nombre} onChange={e => setNuevo(n => ({ ...n, nombre: e.target.value }))}
                                   onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); crear() } if (e.key === 'Escape') setNuevo(null) }}
                                   placeholder={`Nueva en ${g.nombre}…`} className="w-40 rounded-full border border-gray-300 px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-medico-blue" />
                            <button type="button" onClick={crear} disabled={ocupado} className="p-1 rounded-full bg-medico-blue text-white disabled:opacity-50"><Check className="w-3 h-3" /></button>
                            <button type="button" onClick={() => setNuevo(null)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100"><X className="w-3 h-3" /></button>
                        </span>
                    ) : (
                        <button type="button" onClick={() => setNuevo({ grupoId: g.id, nombre: '' })} className="inline-flex items-center gap-0.5 px-2 py-1 rounded-full text-xs text-medico-gray hover:text-medico-blue hover:bg-blue-50"><Plus className="w-3 h-3" /> nueva</button>
                    ))}
                </div>
            ))}
        </div>
    )
}

export default EtiquetasPicker
