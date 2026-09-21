// src/simulador/SimuladorHistorial.jsx - Historial de sesiones finalizadas
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, History } from 'lucide-react'
import Layout from '../utils/Layout'
import simuladorService from '../services/simulador'
import { Card, PageHeader, Button, Pill, Loading, EmptyState, SegmentedControl } from './ui'

const SimuladorHistorial = () => {
    const navigate = useNavigate()
    const [carrera, setCarrera] = useState(localStorage.getItem('simulador_carrera') || '')
    const [carreras, setCarreras] = useState([])
    const [sesiones, setSesiones] = useState([])
    const [pag, setPag] = useState({ page: 1, totalPages: 1, total: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        simuladorService.getCarreras().then(r => { if (r.success) setCarreras(r.data.carreras) })
    }, [])

    const cargar = async (page = 1) => {
        setLoading(true)
        const r = await simuladorService.getHistorial({ carrera: carrera || undefined, page, limit: 15 })
        if (r.success) { setSesiones(r.data.sesiones); setPag(r.data.paginacion) }
        setLoading(false)
    }
    useEffect(() => { cargar(1) }, [carrera]) // eslint-disable-line react-hooks/exhaustive-deps

    const colorPuntaje = p => p >= 80 ? 'text-medico-green' : p >= 60 ? 'text-medico-orange' : 'text-medico-red'

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <Button variant="ghost" size="sm" to="/simulador" className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4" /> Volver</Button>
                <PageHeader
                    eyebrow="Simulador interactivo"
                    title="Historial de sesiones"
                    subtitle={`${pag.total} sesiones finalizadas`}
                    actions={<SegmentedControl value={carrera} onChange={setCarrera} options={[{ value: '', label: 'Todas' }, ...carreras.map(c => ({ value: c.carrera, label: c.label }))]} />}
                />
                {loading ? <Loading /> : sesiones.length === 0 ? (
                    <EmptyState icon={History} title="Aún no has finalizado sesiones" description="Cuando termines una, aparecerá aquí con su puntaje y revisión." action={<Button to="/simulador/nueva">Empezar una sesión</Button>} />
                ) : (
                    <>
                        <Card className="divide-y divide-gray-100">
                            {sesiones.map(s => (
                                <button key={s.id} onClick={() => navigate(`/simulador/resultado/${s.id}`)}
                                        className="w-full text-left p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors first:rounded-t-3xl last:rounded-b-3xl">
                                    <div className={`text-2xl font-semibold w-20 ${colorPuntaje(s.puntaje)}`}>{Math.round(s.puntaje)}%</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{simuladorService.ORIGENES[s.origen]?.label} · {s.carreraLabel}</p>
                                        <p className="text-xs text-medico-gray">{simuladorService.formatFecha(s.finalizadaEn)} · {s.correctas}/{s.totalPreguntas} correctas · {simuladorService.formatSeg(s.tiempoEmpleadoSeg)}</p>
                                    </div>
                                    <Pill className={s.modo === 'practica' ? 'bg-emerald-50 text-medico-green border-emerald-100' : 'bg-orange-50 text-medico-orange border-orange-100'}>{simuladorService.MODOS[s.modo]?.label}</Pill>
                                    <ChevronRight className="w-5 h-5 text-gray-300" />
                                </button>
                            ))}
                        </Card>
                        {pag.totalPages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <Button variant="secondary" size="sm" disabled={pag.page <= 1} onClick={() => cargar(pag.page - 1)}>Anterior</Button>
                                <span className="px-3 py-2 text-sm text-medico-gray">Página {pag.page} de {pag.totalPages}</span>
                                <Button variant="secondary" size="sm" disabled={pag.page >= pag.totalPages} onClick={() => cargar(pag.page + 1)}>Siguiente</Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    )
}

export default SimuladorHistorial
