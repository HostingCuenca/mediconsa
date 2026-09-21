// src/biblioteca/Biblioteca.jsx - Biblioteca: manuales y materiales para leer dentro de la plataforma
import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BookOpen, Search, Clock, CheckCircle2, BookMarked, ChevronRight, FileText } from 'lucide-react'
import Layout from '../utils/Layout'
import logoBlanco from '../assets/logoblanco-recortado.png'
import bibliotecaService from '../services/biblioteca'
import { Card, PageHeader, Button, Pill, ProgressBar, Loading, EmptyState, Alert, SegmentedControl } from '../simulador/ui'
import { useCached } from '../simulador/useCached'

const Biblioteca = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const cursoFiltro = searchParams.get('curso')
    const [busqueda, setBusqueda] = useState('')
    const [filtro, setFiltro] = useState('todos')   // todos | en_curso | sin_leer | completados
    const q = useCached('biblioteca', () => bibliotecaService.listar())
    const data = q.data

    const grupos = useMemo(() => {
        if (!data) return []
        const term = busqueda.trim().toLowerCase()
        return data.grupos
            .filter(g => !cursoFiltro || g.id === cursoFiltro)
            .map(g => ({
                ...g,
                materiales: g.materiales.filter(m => {
                    if (term && !`${m.titulo} ${m.descripcion || ''} ${m.categoria || ''}`.toLowerCase().includes(term)) return false
                    if (filtro === 'en_curso') return m.lectura && !m.lectura.completado
                    if (filtro === 'sin_leer') return !m.lectura
                    if (filtro === 'completados') return !!m.lectura?.completado
                    return true
                })
            }))
            .filter(g => g.materiales.length > 0)
    }, [data, busqueda, filtro, cursoFiltro])
    const grupoFiltrado = cursoFiltro ? data?.grupos.find(g => g.id === cursoFiltro) : null

    if (q.loading && !data) return <Layout showSidebar><Loading text="Abriendo tu biblioteca…" /></Layout>

    return (
        <Layout showSidebar>
            <div className="p-6 md:p-8">
                <PageHeader
                    eyebrow="Mi aprendizaje"
                    title="Biblioteca"
                    subtitle="Tus manuales y materiales, para leer aquí mismo. Guardamos la página donde te quedaste."
                    actions={data && (
                        <div className="flex flex-wrap gap-2">
                            <Pill className="bg-white text-gray-700 border-gray-200"><FileText className="w-3.5 h-3.5" /> {data.resumen.total} materiales</Pill>
                            <Pill className="bg-emerald-50 text-medico-green border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> {data.resumen.completados} leídos</Pill>
                            <Pill className="bg-blue-50 text-medico-blue border-blue-100"><Clock className="w-3.5 h-3.5" /> {bibliotecaService.formatMin(data.resumen.minutosLectura * 60)} de lectura</Pill>
                        </div>
                    )}
                />

                {q.error && <Alert tone="error" className="mb-6">{q.error}</Alert>}

                {data && data.resumen.total === 0 && (
                    <EmptyState icon={BookOpen} title="Aún no tienes materiales"
                                description="Los manuales y guías de tus cursos aparecerán aquí cuando tu inscripción esté habilitada."
                                action={<Button to="/mis-cursos">Ver mis cursos</Button>} />
                )}

                {data && data.resumen.total > 0 && (
                    <>
                        {/* Seguir leyendo */}
                        {data.enCurso.length > 0 && filtro === 'todos' && !busqueda && !cursoFiltro && (
                            <section className="mb-8">
                                <h2 className="font-sans text-sm font-semibold uppercase tracking-wider text-medico-gray mb-3">Seguir leyendo</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                    {data.enCurso.map(m => (
                                        <Card key={m.id} as="button" onClick={() => navigate(`/biblioteca/leer/${m.id}`)} className="p-5 text-left hover:-translate-y-0.5 transition-transform">
                                            <div className="flex items-start gap-3">
                                                <span className="w-10 h-10 rounded-xl bg-blue-50 text-medico-blue flex items-center justify-center flex-shrink-0"><BookMarked className="w-5 h-5" /></span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900 leading-snug line-clamp-2">{limpiarTitulo(m.titulo)}</p>
                                                    <p className="text-xs text-medico-gray mt-1">Página {m.lectura.ultimaPagina}{m.lectura.totalPaginas ? ` de ${m.lectura.totalPaginas}` : ''}</p>
                                                </div>
                                            </div>
                                            <ProgressBar value={m.lectura.porcentaje} className="mt-4" />
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Filtros */}
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                            <div className="relative flex-1 max-w-md">
                                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar manual, guía, tema…"
                                       className="w-full pl-11 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-medico-blue focus:border-transparent" />
                            </div>
                            {cursoFiltro && (
                                <button onClick={() => setSearchParams({})} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-50 text-medico-blue text-sm font-medium border border-blue-100 hover:bg-blue-100" title="Quitar filtro">
                                    {grupoFiltrado ? limpiarTitulo(grupoFiltrado.titulo) : 'Curso'} <span className="text-xs">✕</span>
                                </button>
                            )}
                            <SegmentedControl value={filtro} onChange={setFiltro} options={[
                                { value: 'todos', label: 'Todos' },
                                { value: 'en_curso', label: 'En curso' },
                                { value: 'sin_leer', label: 'Sin leer' },
                                { value: 'completados', label: 'Leídos' }
                            ]} />
                        </div>

                        {grupos.length === 0 && <EmptyState icon={Search} title="Nada por aquí" description="Prueba con otra búsqueda u otro filtro." />}

                        {grupos.map(g => (
                            <section key={g.id} className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="font-sans text-lg font-semibold text-gray-900">{limpiarTitulo(g.titulo)}</h2>
                                    <span className="text-xs text-medico-gray">{g.materiales.length} material{g.materiales.length !== 1 ? 'es' : ''}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {g.materiales.map(m => <MaterialCard key={m.id} m={m} onOpen={() => navigate(`/biblioteca/leer/${m.id}`)} />)}
                                </div>
                            </section>
                        ))}
                    </>
                )}
            </div>
        </Layout>
    )
}

// Quita emojis y espacios repetidos de títulos escritos a mano ("MANUAL DE PEDIATRÍA 👦🏻")
export const limpiarTitulo = (t) => (t || '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()

// Portada: imagen del material o, si no tiene (o falla), placeholder con el logo y el nombre
const Portada = ({ m }) => {
    const [fallo, setFallo] = useState(false)
    if (m.imagenUrl && !fallo) {
        // Imagen completa (sin recorte) sobre un fondo hecho con la misma imagen desenfocada
        return (
            <div className="h-44 relative overflow-hidden bg-gray-200 p-3 flex items-center justify-center">
                <img src={m.imagenUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover scale-125 blur-lg saturate-150" />
                <div className="absolute inset-0 bg-black/5" />
                <img src={m.imagenUrl} alt="" className="relative max-w-full max-h-full w-auto h-auto rounded-xl shadow-md" onError={() => setFallo(true)} />
            </div>
        )
    }
    return (
        <div className="h-44 bg-gradient-to-br from-medico-blue to-blue-900 relative overflow-hidden flex flex-col p-4">
            <BookOpen className="absolute -right-4 -bottom-4 w-28 h-28 text-white/10" />
            <img src={logoBlanco} alt="Mediconsa" className="h-5 w-auto object-contain self-start" />
            <div className="relative flex-1 flex items-center justify-center px-2">
                <p className="font-sans text-white font-semibold leading-snug line-clamp-3 text-center text-[15px]">{limpiarTitulo(m.titulo)}</p>
            </div>
        </div>
    )
}

const MaterialCard = ({ m, onOpen }) => {
    const l = m.lectura
    const esPdf = m.tipoArchivo === 'pdf'
    return (
        <Card className="overflow-hidden flex flex-col">
            <Portada m={m} />
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap gap-2 mb-2">
                    {m.categoria && <Pill className="bg-gray-50 text-gray-700 border-gray-100">{m.categoria}</Pill>}
                    <Pill className="bg-gray-50 text-gray-500 border-gray-100 uppercase">{m.tipoArchivo || 'archivo'}</Pill>
                    {l?.completado && <Pill className="bg-emerald-50 text-medico-green border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Leído</Pill>}
                </div>
                <h3 className="font-sans font-semibold text-gray-900 leading-snug line-clamp-2">{limpiarTitulo(m.titulo)}</h3>
                {m.descripcion && <p className="text-sm text-medico-gray mt-1.5 line-clamp-2">{m.descripcion}</p>}
                <div className="mt-auto pt-4">
                    {l ? (
                        <>
                            <div className="flex justify-between text-xs text-medico-gray mb-1">
                                <span>Página {l.ultimaPagina}{l.totalPaginas ? ` de ${l.totalPaginas}` : ''}</span>
                                <span>{l.porcentaje}%</span>
                            </div>
                            <ProgressBar value={l.porcentaje} color={l.completado ? 'bg-medico-green' : 'bg-medico-blue'} className="mb-3" />
                        </>
                    ) : <p className="text-xs text-medico-gray mb-3">Aún no lo has abierto</p>}
                    <Button onClick={onOpen} size="sm" className="w-full" disabled={!esPdf} variant={l && !l.completado ? 'primary' : 'secondary'}>
                        {esPdf ? (l ? (l.completado ? 'Volver a leer' : 'Continuar leyendo') : 'Leer') : 'Formato no soportado aún'} <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default Biblioteca
