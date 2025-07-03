// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Layout from '../utils/Layout'
// import coursesService from '../services/courses'
//
// const CoursesPage = () => {
//     const navigate = useNavigate()
//     const [courses, setCourses] = useState([])
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//
//     const [filters, setFilters] = useState({
//         search: '',
//         tipo: '',
//         gratuito: ''
//     })
//
//     // Cargar cursos reales
//     useEffect(() => {
//         loadCourses()
//     }, [])
//
//     const loadCourses = async () => {
//         try {
//             setLoading(true)
//             setError('')
//
//             const result = await coursesService.getAllCourses()
//
//             if (result.success) {
//                 setCourses(result.data.cursos || [])
//             } else {
//                 setError(result.error || 'Error cargando cursos')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error de conexión')
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     const cursosFiltrados = courses.filter(curso => {
//         const matchSearch = curso.titulo.toLowerCase().includes(filters.search.toLowerCase())
//         const matchTipo = !filters.tipo || curso.tipo_examen === filters.tipo
//         const matchGratuito = !filters.gratuito || curso.es_gratuito.toString() === filters.gratuito
//         return matchSearch && matchTipo && matchGratuito
//     })
//
//     const formatPrice = (price) => {
//         return new Intl.NumberFormat('es-EC', {
//             style: 'currency',
//             currency: 'USD'
//         }).format(price || 0)
//     }
//
//     const handleCourseClick = (courseId) => {
//         navigate(`/curso/${courseId}`)
//     }
//
//     if (loading) {
//         return (
//             <Layout>
//                 <div className="min-h-screen bg-medico-light flex items-center justify-center">
//                     <div className="text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
//                         <p className="mt-4 text-medico-gray">Cargando cursos...</p>
//                     </div>
//                 </div>
//             </Layout>
//         )
//     }
//
//     return (
//         <Layout>
//             <div className="min-h-screen bg-medico-light py-12">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//
//                     {/* Header */}
//                     <div className="text-center mb-12">
//                         <h1 className="text-4xl font-bold text-medico-blue mb-4">
//                             Catálogo de Cursos
//                         </h1>
//                         <p className="text-xl text-medico-gray max-w-3xl mx-auto">
//                             Encuentra el curso perfecto para tu preparación médica
//                         </p>
//                         <div className="mt-4 text-sm text-gray-500">
//                             {courses.length} cursos disponibles
//                         </div>
//                     </div>
//
//                     {/* Error */}
//                     {error && (
//                         <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
//                             <div className="flex items-center">
//                                 <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                 </svg>
//                                 <p className="text-red-600">{error}</p>
//                                 <button
//                                     onClick={loadCourses}
//                                     className="ml-4 text-red-700 underline"
//                                 >
//                                     Reintentar
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//
//                     {/* Filters */}
//                     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-medico-gray mb-2">Buscar</label>
//                                 <input
//                                     type="text"
//                                     placeholder="Nombre del curso..."
//                                     value={filters.search}
//                                     onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                 />
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-medico-gray mb-2">Tipo de Examen</label>
//                                 <select
//                                     value={filters.tipo}
//                                     onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                 >
//                                     <option value="">Todos</option>
//                                     <option value="caces">CACES</option>
//                                     <option value="senesyct">SENESYCT</option>
//                                     <option value="medicina_rural">Medicina Rural</option>
//                                     <option value="enarm">ENARM</option>
//                                 </select>
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-medico-gray mb-2">Precio</label>
//                                 <select
//                                     value={filters.gratuito}
//                                     onChange={(e) => setFilters(prev => ({ ...prev, gratuito: e.target.value }))}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                 >
//                                     <option value="">Todos</option>
//                                     <option value="true">Gratuitos</option>
//                                     <option value="false">De Pago</option>
//                                 </select>
//                             </div>
//
//                             <div className="flex items-end">
//                                 <button
//                                     onClick={() => setFilters({ search: '', tipo: '', gratuito: '' })}
//                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Limpiar Filtros
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Courses Grid */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                         {cursosFiltrados.map((curso) => (
//                             <div
//                                 key={curso.id}
//                                 className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
//                                 onClick={() => handleCourseClick(curso.id)}
//                             >
//                                 <img
//                                     src={curso.miniatura_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'}
//                                     alt={curso.titulo}
//                                     className="w-full h-48 object-cover"
//                                     onError={(e) => {
//                                         e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'
//                                     }}
//                                 />
//                                 <div className="p-6">
//                                     <div className="flex items-start justify-between mb-3">
//                                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                                             curso.es_gratuito
//                                                 ? 'bg-green-100 text-green-800'
//                                                 : 'bg-blue-100 text-blue-800'
//                                         }`}>
//                                             {curso.es_gratuito ? 'Gratuito' : formatPrice(curso.precio)}
//                                         </span>
//                                         <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
//                                             {curso.tipo_examen || 'General'}
//                                         </span>
//                                     </div>
//
//                                     <h3 className="text-lg font-semibold text-gray-900 mb-2">{curso.titulo}</h3>
//                                     <p className="text-sm text-medico-gray mb-4 line-clamp-2">
//                                         {curso.descripcion || 'Curso de preparación médica completa'}
//                                     </p>
//
//                                     <div className="flex items-center text-sm text-medico-gray mb-4">
//                                         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                         </svg>
//                                         <span className="mr-4">Instructor</span>
//
//                                         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                                         </svg>
//                                         <span>{curso.activo ? 'Activo' : 'Inactivo'}</span>
//                                     </div>
//
//                                     <button
//                                         className="w-full bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                                         onClick={(e) => {
//                                             e.stopPropagation()
//                                             handleCourseClick(curso.id)
//                                         }}
//                                     >
//                                         Ver Detalles
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//
//                     {/* Empty State */}
//                     {cursosFiltrados.length === 0 && !loading && (
//                         <div className="text-center py-12">
//                             <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                             </svg>
//                             <h3 className="text-lg font-medium text-gray-900 mb-2">
//                                 {courses.length === 0 ? 'No hay cursos disponibles' : 'No se encontraron cursos'}
//                             </h3>
//                             <p className="text-medico-gray">
//                                 {courses.length === 0
//                                     ? 'Los cursos aparecerán aquí cuando estén disponibles'
//                                     : 'Intenta con otros filtros de búsqueda'
//                                 }
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </Layout>
//     )
// }
//
// export default CoursesPage

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

    // Función para renderizar estrellas
    const renderStars = (rating = 5) => {
        return (
            <div className="flex items-center justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
                <span className="ml-2 text-sm text-gray-600 font-medium">5.0</span>
            </div>
        )
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
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                onClick={() => handleCourseClick(curso.id)}
                            >
                                <div className="relative">
                                    <img
                                        src={curso.miniatura_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'}
                                        alt={curso.titulo}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'
                                        }}
                                    />
                                    {/* Badge de tipo de examen */}
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-800 uppercase shadow-sm">
                                            {curso.tipo_examen || 'General'}
                                        </span>
                                    </div>

                                    {/* Badge de estado */}
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                            curso.activo
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-500 text-white'
                                        }`}>
                                            {curso.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {/* Título */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
                                        {curso.titulo}
                                    </h3>

                                    {/* Descripción */}
                                    <p className="text-sm text-medico-gray mb-4 line-clamp-3 min-h-[4rem]">
                                        {curso.descripcion || 'Curso de preparación médica completa'}
                                    </p>

                                    {/* Estrellas de valoración */}
                                    {renderStars()}

                                    {/* Características principales */}
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Simulacros cronometrados</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Clases en vivo + grabaciones 24/7</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            <span>Manuales actualizados</span>
                                        </div>
                                    </div>

                                    {/* Precio destacado */}
                                    <div className="border-t border-gray-100 pt-4 mb-4">
                                        <div className="text-center">
                                            {curso.es_gratuito ? (
                                                <div className="text-2xl font-bold text-green-600">
                                                    GRATUITO
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-3xl font-bold text-medico-blue">
                                                        {formatPrice(curso.precio)}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        Curso completo - 4 meses
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botón de acción */}
                                    <button
                                        className="w-full bg-gradient-to-r from-medico-blue to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleCourseClick(curso.id)
                                        }}
                                    >
                                        Ver Detalles del Curso
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