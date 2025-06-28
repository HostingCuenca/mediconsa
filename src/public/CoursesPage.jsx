import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import coursesService from '../services/courses'

const CoursesPage = () => {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [filters, setFilters] = useState({
        search: '',
        tipo: '',
        gratuito: ''
    })

    // Cargar cursos reales
    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await coursesService.getAllCourses()

            if (result.success) {
                setCourses(result.data.cursos || [])
            } else {
                setError(result.error || 'Error cargando cursos')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const cursosFiltrados = courses.filter(curso => {
        const matchSearch = curso.titulo.toLowerCase().includes(filters.search.toLowerCase())
        const matchTipo = !filters.tipo || curso.tipo_examen === filters.tipo
        const matchGratuito = !filters.gratuito || curso.es_gratuito.toString() === filters.gratuito
        return matchSearch && matchTipo && matchGratuito
    })

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    const handleCourseClick = (courseId) => {
        navigate(`/curso/${courseId}`)
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-medico-light flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando cursos...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-medico-light py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-medico-blue mb-4">
                            Catálogo de Cursos
                        </h1>
                        <p className="text-xl text-medico-gray max-w-3xl mx-auto">
                            Encuentra el curso perfecto para tu preparación médica
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                            {courses.length} cursos disponibles
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={loadCourses}
                                    className="ml-4 text-red-700 underline"
                                >
                                    Reintentar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-medico-gray mb-2">Buscar</label>
                                <input
                                    type="text"
                                    placeholder="Nombre del curso..."
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-medico-gray mb-2">Tipo de Examen</label>
                                <select
                                    value={filters.tipo}
                                    onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="caces">CACES</option>
                                    <option value="senesyct">SENESYCT</option>
                                    <option value="medicina_rural">Medicina Rural</option>
                                    <option value="enarm">ENARM</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-medico-gray mb-2">Precio</label>
                                <select
                                    value={filters.gratuito}
                                    onChange={(e) => setFilters(prev => ({ ...prev, gratuito: e.target.value }))}
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

                    {/* Courses Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cursosFiltrados.map((curso) => (
                            <div
                                key={curso.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleCourseClick(curso.id)}
                            >
                                <img
                                    src={curso.miniatura_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'}
                                    alt={curso.titulo}
                                    className="w-full h-48 object-cover"
                                    onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'
                                    }}
                                />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            curso.es_gratuito
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {curso.es_gratuito ? 'Gratuito' : formatPrice(curso.precio)}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                                            {curso.tipo_examen || 'General'}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{curso.titulo}</h3>
                                    <p className="text-sm text-medico-gray mb-4 line-clamp-2">
                                        {curso.descripcion || 'Curso de preparación médica completa'}
                                    </p>

                                    <div className="flex items-center text-sm text-medico-gray mb-4">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="mr-4">Instructor</span>

                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <span>{curso.activo ? 'Activo' : 'Inactivo'}</span>
                                    </div>

                                    <button
                                        className="w-full bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleCourseClick(curso.id)
                                        }}
                                    >
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {cursosFiltrados.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {courses.length === 0 ? 'No hay cursos disponibles' : 'No se encontraron cursos'}
                            </h3>
                            <p className="text-medico-gray">
                                {courses.length === 0
                                    ? 'Los cursos aparecerán aquí cuando estén disponibles'
                                    : 'Intenta con otros filtros de búsqueda'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default CoursesPage