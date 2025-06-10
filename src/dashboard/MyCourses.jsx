// src/dashboard/MyCourses.jsx
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'

const MyCourses = () => {
    const { perfil } = useAuth()
    const [cursos, setCursos] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('todos') // todos, activos, completados

    useEffect(() => {
        cargarMisCursos()
    }, [perfil])

    const cargarMisCursos = async () => {
        if (!perfil?.id) return

        try {
            const { data, error } = await supabase
                .from('inscripciones')
                .select(`
          *,
          cursos(
            id,
            titulo,
            descripcion,
            miniatura_url,
            precio,
            descuento,
            tipo_examen,
            slug,
            modulos(
              id,
              titulo,
              orden,
              clases(
                id,
                titulo,
                duracion_minutos
              )
            )
          )
        `)
                .eq('usuario_id', perfil.id)
                .order('fecha_inscripcion', { ascending: false })

            if (error) throw error

            // Calcular progreso para cada curso
            const cursosConProgreso = await Promise.all(
                (data || []).map(async (inscripcion) => {
                    const totalClases = inscripcion.cursos?.modulos?.reduce(
                        (acc, modulo) => acc + (modulo.clases?.length || 0), 0
                    ) || 0

                    if (totalClases === 0) {
                        return { ...inscripcion, progreso: 0, clasesCompletadas: 0, totalClases: 0 }
                    }

                    // Obtener progreso de clases
                    const { data: progreso } = await supabase
                        .from('progreso_clases')
                        .select('clase_id, completada')
                        .eq('usuario_id', perfil.id)
                        .in('clase_id',
                            inscripcion.cursos.modulos.flatMap(m => m.clases?.map(c => c.id) || [])
                        )

                    const clasesCompletadas = progreso?.filter(p => p.completada).length || 0
                    const porcentajeProgreso = Math.round((clasesCompletadas / totalClases) * 100)

                    return {
                        ...inscripcion,
                        progreso: porcentajeProgreso,
                        clasesCompletadas,
                        totalClases
                    }
                })
            )

            setCursos(cursosConProgreso)
        } catch (error) {
            console.error('Error cargando mis cursos:', error)
        } finally {
            setLoading(false)
        }
    }

    const cursosFiltrados = cursos.filter(inscripcion => {
        if (filter === 'activos') return inscripcion.estado_pago === 'habilitado' && inscripcion.progreso < 100
        if (filter === 'completados') return inscripcion.progreso === 100
        return true
    })

    const getTipoExamenLabel = (tipo) => {
        const tipos = {
            'medico_general': 'Medicina General',
            'medico_rural': 'Medicina Rural',
            'caces': 'CACES',
            'senesyct': 'SENESYCT'
        }
        return tipos[tipo] || 'Sin categoría'
    }

    const getEstadoColor = (estado) => {
        const colores = {
            'pendiente': 'bg-yellow-100 text-yellow-800',
            'pagado': 'bg-blue-100 text-blue-800',
            'habilitado': 'bg-green-100 text-green-800'
        }
        return colores[estado] || 'bg-gray-100 text-gray-800'
    }

    const getEstadoLabel = (estado) => {
        const labels = {
            'pendiente': 'Pago Pendiente',
            'pagado': 'Pagado',
            'habilitado': 'Activo'
        }
        return labels[estado] || estado
    }

    if (loading) {
        return (
            <Layout isPlatform={true} showSidebar={true}>
                <div className="p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1,2,3].map(i => (
                                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout isPlatform={true} showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue">Mis Cursos</h1>
                        <p className="text-medico-gray mt-2">Gestiona tu aprendizaje y progreso</p>
                    </div>

                    <Link
                        to="/cursos"
                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Explorar Cursos</span>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Total Cursos</p>
                                <p className="text-2xl font-bold text-medico-blue">{cursos.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Activos</p>
                                <p className="text-2xl font-bold text-medico-green">
                                    {cursos.filter(c => c.estado_pago === 'habilitado').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Completados</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {cursos.filter(c => c.progreso === 100).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Progreso Promedio</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {cursos.length > 0 ? Math.round(cursos.reduce((acc, c) => acc + c.progreso, 0) / cursos.length) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setFilter('todos')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'todos'
                                    ? 'bg-medico-blue text-white'
                                    : 'text-medico-gray hover:bg-medico-light'
                            }`}
                        >
                            Todos ({cursos.length})
                        </button>
                        <button
                            onClick={() => setFilter('activos')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'activos'
                                    ? 'bg-medico-green text-white'
                                    : 'text-medico-gray hover:bg-medico-light'
                            }`}
                        >
                            En Progreso ({cursos.filter(c => c.estado_pago === 'habilitado' && c.progreso < 100).length})
                        </button>
                        <button
                            onClick={() => setFilter('completados')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filter === 'completados'
                                    ? 'bg-purple-600 text-white'
                                    : 'text-medico-gray hover:bg-medico-light'
                            }`}
                        >
                            Completados ({cursos.filter(c => c.progreso === 100).length})
                        </button>
                    </div>
                </div>

                {/* Courses Grid */}
                {cursosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-medico-gray text-lg mb-4">
                            {filter === 'todos' ? 'No tienes cursos inscritos aún' : `No tienes cursos ${filter}`}
                        </p>
                        <Link
                            to="/cursos"
                            className="bg-medico-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Explorar Cursos
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cursosFiltrados.map((inscripcion) => (
                            <div key={inscripcion.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="relative">
                                    <img
                                        src={inscripcion.cursos?.miniatura_url || 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=400&h=250&fit=crop'}
                                        alt={inscripcion.cursos?.titulo}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(inscripcion.estado_pago)}`}>
                      {getEstadoLabel(inscripcion.estado_pago)}
                    </span>
                                    </div>
                                    <div className="absolute top-4 right-4">
                    <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                      {getTipoExamenLabel(inscripcion.cursos?.tipo_examen)}
                    </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {inscripcion.cursos?.titulo}
                                    </h3>
                                    <p className="text-sm text-medico-gray mb-4 line-clamp-2">
                                        {inscripcion.cursos?.descripcion || 'Sin descripción disponible'}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-medium text-medico-gray">Progreso</span>
                                            <span className="text-sm font-medium text-medico-blue">{inscripcion.progreso}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-medico-blue h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${inscripcion.progreso}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-medico-gray">
                        {inscripcion.clasesCompletadas} de {inscripcion.totalClases} clases
                      </span>
                                            <span className="text-xs text-medico-gray">
                        Inscrito: {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}
                      </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex space-x-3">
                                        {inscripcion.estado_pago === 'habilitado' ? (
                                            <Link
                                                to={`/curso/${inscripcion.cursos?.slug}`}
                                                className="flex-1 bg-medico-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                                            >
                                                {inscripcion.progreso === 0 ? 'Comenzar' : 'Continuar'}
                                            </Link>
                                        ) : (
                                            <a
                                            href={`https://wa.me/59398503606?text=Hola, quiero activar mi acceso al curso "${inscripcion.cursos?.titulo}". Mi usuario es ${perfil?.nombre_usuario}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 bg-medico-green text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-center text-sm font-medium"
                                            >
                                            Activar Acceso
                                            </a>
                                            )}

                                        <Link
                                            to={`/curso/${inscripcion.cursos?.slug}`}
                                            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            title="Ver detalles"
                                        >
                                            <svg className="w-4 h-4 text-medico-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default MyCourses