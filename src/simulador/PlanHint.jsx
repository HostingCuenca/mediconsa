// PlanHint — "Añadir al plan de estudio para repasar" / "Ya está en tu plan · repasar más".
// Se usa en el refuerzo de la sesión (al fallar) y en el desempeño por área del resultado.
// Crea un objetivo pendiente (área / clase / material) en el plan; si ya existe, el API devuelve el existente.
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkPlus, BookmarkCheck, ChevronRight, Loader2 } from 'lucide-react'
import simuladorService from '../services/simulador'
import { invalidarCache } from './useCached'

const enDias = (n) => {
    const d = new Date(); d.setDate(d.getDate() + n)
    return d.toISOString().slice(0, 10)
}

// Payload de objetivo según lo que se está reforzando
export const objetivoDeRefuerzo = ({ carrera, tipo, refId, nombre, contexto }) => {
    if (tipo === 'area') return { carrera, tipo, refId, titulo: `Dominar ${nombre}`, descripcion: contexto || 'Fallaste preguntas de esta área. Repasa la clase y el manual antes de volver a entrenarla.', fechaLimite: enDias(7), origen: 'sugerido' }
    if (tipo === 'clase') return { carrera, tipo, refId, titulo: `Ver la clase: ${nombre}`, descripcion: contexto || 'Clase de refuerzo del área donde fallaste.', fechaLimite: enDias(7), origen: 'sugerido' }
    return { carrera, tipo, refId, titulo: `Leer ${nombre}`, descripcion: contexto || 'Manual de refuerzo del área donde fallaste.', fechaLimite: enDias(14), origen: 'sugerido' }
}

/**
 * props: carrera, tipo ('area'|'clase'|'material'), refId, nombre, contexto?, enPlan (id del objetivo o null),
 *        onCambio?(id), compact (solo icono, para filas de recursos)
 */
export default function PlanHint({ carrera, tipo, refId, nombre, contexto, enPlan = null, onCambio, compact = false, className = '' }) {
    const [id, setId] = useState(enPlan)
    const [ocupado, setOcupado] = useState(false)
    const [error, setError] = useState(false)
    useEffect(() => { setId(enPlan) }, [enPlan, refId])

    const agregar = async (e) => {
        e?.preventDefault?.(); e?.stopPropagation?.()
        if (ocupado || id) return
        setOcupado(true); setError(false)
        const r = await simuladorService.crearObjetivo(objetivoDeRefuerzo({ carrera, tipo, refId, nombre, contexto }))
        setOcupado(false)
        if (r.success) {
            setId(r.data.objetivo.id)
            invalidarCache(`plan:${carrera}`)
            onCambio?.(r.data.objetivo.id)
        } else setError(true)
    }

    if (compact) {
        return id ? (
            <Link to="/simulador/plan" onClick={e => e.stopPropagation()} title="Ya está en tu plan de estudio · repasar más"
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-medico-green hover:bg-emerald-100 flex-shrink-0 ${className}`}>
                <BookmarkCheck className="w-4 h-4" />
            </Link>
        ) : (
            <button type="button" onClick={agregar} disabled={ocupado} title="Añadir al plan de estudio para repasar"
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-medico-blue flex-shrink-0 disabled:opacity-50 ${error ? 'text-medico-red' : ''} ${className}`}>
                {ocupado ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
            </button>
        )
    }

    return id ? (
        <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 ${className}`}>
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-800"><BookmarkCheck className="w-4 h-4 text-medico-green" /> Ya está en tu plan de estudio</span>
            <Link to="/simulador/plan" className="inline-flex items-center gap-0.5 text-sm font-semibold text-medico-green hover:underline">Repasar más <ChevronRight className="w-4 h-4" /></Link>
        </div>
    ) : (
        <button type="button" onClick={agregar} disabled={ocupado}
                className={`w-full flex items-center justify-between gap-2 rounded-xl bg-white border border-dashed border-blue-200 hover:border-medico-blue hover:bg-blue-50/60 px-3 py-2 text-left transition-colors disabled:opacity-60 ${className}`}>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-medico-blue">
                {ocupado ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookmarkPlus className="w-4 h-4" />}
                Añadir al plan de estudio para repasar
            </span>
            <span className="text-[11px] text-medico-gray">{error ? 'No se pudo guardar' : 'después, con calma'}</span>
        </button>
    )
}
