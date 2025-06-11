// src/admin/AdminCourses.jsx - Gestión completa de cursos
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import coursesService from '../services/courses'

const AdminCourses = () => {
    const [cursos, setCursos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        search: '',
        tipo: '',
        gratuito: ''
    })

    useEffect(() => {
        cargarCursos()
    }, [filters])

    const cargarCursos = async () => {
        try {
            setLoading(true)
            const response = await coursesService.getCourses(filters)

            if (response.success) {
                setCursos(response.cursos)
            } else {
                setError(response.error || 'Error cargando cursos')
            }
        } catch (error) {
            setError('Error de conexión')
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue">Gestión de Cursos</h1>
                        <p className="text-medico-gray mt-2">Administra todos los cursos de la plataforma</p>
                    </div>
                    <Link
                        to="/admin/curso/crear"
                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Nuevo Curso</span>
                    </Link>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-medico-gray mb-2">Buscar</label>
                            <input
                                type="text"
                                placeholder="Título del curso..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-medico-gray mb-2">Tipo de Examen</label>
                            <select
                                value={filters.tipo}
                                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                <option value="caces">CACES</option>
                                <option value="senesyct">SENESYCT</option>
                                <option value="medicina_rural">Medicina Rural</option>
                                <option value="medicina_general">Medicina General</option>
                                <option value="enarm">ENARM</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-medico-gray mb-2">Precio</label>
                            <select
                                value={filters.gratuito}
                                onChange={(e) => handleFilterChange('gratuito', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                <option value="true">Gratuitos</option>
                                <option value="false">De Pago</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ search: '', tipo: '', gratuito: '' })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={cargarCursos}
                            className="mt-2 text-red-700 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Courses Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cursos.map((curso) => (
                            <div key={curso.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{curso.titulo}</h3>
                                        <p className="text-sm text-medico-gray mb-3 line-clamp-2">{curso.descripcion}</p>

                                        <div className="flex items-center space-x-4 mb-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                curso.es_gratuito
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {curso.es_gratuito ? 'Gratuito' : `${curso.precio}`}
                                            </span>

                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                                                {curso.tipo_examen || 'General'}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-sm text-medico-gray mb-4">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                            </svg>
                                            <span>{curso.estudiantes_inscritos || 0} estudiantes</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col space-y-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            curso.activo
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {curso.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Link
                                        to={`/admin/curso/${curso.id}/editar`}
                                        className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                                    >
                                        Editar
                                    </Link>

                                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>

                                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && cursos.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos</h3>
                        <p className="text-medico-gray mb-6">Crea tu primer curso para comenzar</p>
                        <Link
                            to="/admin/curso/crear"
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Crear Primer Curso</span>
                        </Link>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default AdminCourses