// src/pages/CoursesPage.jsx - Catálogo público de cursos
import React, { useState } from 'react'
import Layout from '../utils/Layout'

const CoursesPage = () => {
    const [filters, setFilters] = useState({
        search: '',
        tipo: '',
        gratuito: ''
    })

    // Mock data para probar
    const cursosMock = [
        {
            id: 1,
            titulo: "Preparación CACES 2025",
            descripcion: "Curso completo para el Consejo de Aseguramiento de la Calidad de la Educación Superior",
            precio: 149.99,
            es_gratuito: false,
            tipo_examen: "caces",
            estudiantes_inscritos: 45,
            instructor_nombre: "Dr. Juan Pérez",
            miniatura_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400"
        },
        {
            id: 2,
            titulo: "SENESYCT - Becas Internacionales",
            descripcion: "Preparación completa para exámenes de becas SENESYCT",
            precio: 0,
            es_gratuito: true,
            tipo_examen: "senesyct",
            estudiantes_inscritos: 123,
            instructor_nombre: "Dra. María González",
            miniatura_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
        },
        {
            id: 3,
            titulo: "Medicina Rural - Año de Servicio",
            descripcion: "Todo lo que necesitas para tu año rural médico",
            precio: 89.99,
            es_gratuito: false,
            tipo_examen: "medicina_rural",
            estudiantes_inscritos: 67,
            instructor_nombre: "Dr. Carlos Mendoza",
            miniatura_url: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=400"
        }
    ]

    const cursosFiltrados = cursosMock.filter(curso => {
        const matchSearch = curso.titulo.toLowerCase().includes(filters.search.toLowerCase())
        const matchTipo = !filters.tipo || curso.tipo_examen === filters.tipo
        const matchGratuito = !filters.gratuito || curso.es_gratuito.toString() === filters.gratuito
        return matchSearch && matchTipo && matchGratuito
    })

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
                    </div>

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
                            <div key={curso.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <img
                                    src={curso.miniatura_url}
                                    alt={curso.titulo}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            curso.es_gratuito
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}>
                                            {curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`}
                                        </span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
                                            {curso.tipo_examen}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{curso.titulo}</h3>
                                    <p className="text-sm text-medico-gray mb-4 line-clamp-2">{curso.descripcion}</p>

                                    <div className="flex items-center text-sm text-medico-gray mb-4">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="mr-4">{curso.instructor_nombre}</span>

                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <span>{curso.estudiantes_inscritos} estudiantes</span>
                                    </div>

                                    <button className="w-full bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                        Ver Detalles
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {cursosFiltrados.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron cursos</h3>
                            <p className="text-medico-gray">Intenta con otros filtros de búsqueda</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default CoursesPage