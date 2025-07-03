// // import React, { useState, useEffect } from 'react'
// // import { useNavigate } from 'react-router-dom'
// // import Layout from '../utils/Layout'
// // import coursesService from '../services/courses'
// //
// // const CoursesPage = () => {
// //     const navigate = useNavigate()
// //     const [courses, setCourses] = useState([])
// //     const [loading, setLoading] = useState(true)
// //     const [error, setError] = useState('')
// //
// //     const [filters, setFilters] = useState({
// //         search: '',
// //         tipo: '',
// //         gratuito: ''
// //     })
// //
// //     // Cargar cursos reales
// //     useEffect(() => {
// //         loadCourses()
// //     }, [])
// //
// //     const loadCourses = async () => {
// //         try {
// //             setLoading(true)
// //             setError('')
// //
// //             const result = await coursesService.getAllCourses()
// //
// //             if (result.success) {
// //                 setCourses(result.data.cursos || [])
// //             } else {
// //                 setError(result.error || 'Error cargando cursos')
// //             }
// //         } catch (error) {
// //             console.error('Error:', error)
// //             setError('Error de conexión')
// //         } finally {
// //             setLoading(false)
// //         }
// //     }
// //
// //     const cursosFiltrados = courses.filter(curso => {
// //         const matchSearch = curso.titulo.toLowerCase().includes(filters.search.toLowerCase())
// //         const matchTipo = !filters.tipo || curso.tipo_examen === filters.tipo
// //         const matchGratuito = !filters.gratuito || curso.es_gratuito.toString() === filters.gratuito
// //         return matchSearch && matchTipo && matchGratuito
// //     })
// //
// //     const formatPrice = (price) => {
// //         return new Intl.NumberFormat('es-EC', {
// //             style: 'currency',
// //             currency: 'USD'
// //         }).format(price || 0)
// //     }
// //
// //     const handleCourseClick = (courseId) => {
// //         navigate(`/curso/${courseId}`)
// //     }
// //
// //     if (loading) {
// //         return (
// //             <Layout>
// //                 <div className="min-h-screen bg-medico-light flex items-center justify-center">
// //                     <div className="text-center">
// //                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
// //                         <p className="mt-4 text-medico-gray">Cargando cursos...</p>
// //                     </div>
// //                 </div>
// //             </Layout>
// //         )
// //     }
// //
// //     return (
// //         <Layout>
// //             <div className="min-h-screen bg-medico-light py-12">
// //                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //
// //                     {/* Header */}
// //                     <div className="text-center mb-12">
// //                         <h1 className="text-4xl font-bold text-medico-blue mb-4">
// //                             Catálogo de Cursos
// //                         </h1>
// //                         <p className="text-xl text-medico-gray max-w-3xl mx-auto">
// //                             Encuentra el curso perfecto para tu preparación médica
// //                         </p>
// //                         <div className="mt-4 text-sm text-gray-500">
// //                             {courses.length} cursos disponibles
// //                         </div>
// //                     </div>
// //
// //                     {/* Error */}
// //                     {error && (
// //                         <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
// //                             <div className="flex items-center">
// //                                 <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
// //                                 </svg>
// //                                 <p className="text-red-600">{error}</p>
// //                                 <button
// //                                     onClick={loadCourses}
// //                                     className="ml-4 text-red-700 underline"
// //                                 >
// //                                     Reintentar
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     )}
// //
// //                     {/* Filters */}
// //                     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
// //                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //                             <div>
// //                                 <label className="block text-sm font-medium text-medico-gray mb-2">Buscar</label>
// //                                 <input
// //                                     type="text"
// //                                     placeholder="Nombre del curso..."
// //                                     value={filters.search}
// //                                     onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
// //                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
// //                                 />
// //                             </div>
// //
// //                             <div>
// //                                 <label className="block text-sm font-medium text-medico-gray mb-2">Tipo de Examen</label>
// //                                 <select
// //                                     value={filters.tipo}
// //                                     onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
// //                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
// //                                 >
// //                                     <option value="">Todos</option>
// //                                     <option value="caces">CACES</option>
// //                                     <option value="senesyct">SENESYCT</option>
// //                                     <option value="medicina_rural">Medicina Rural</option>
// //                                     <option value="enarm">ENARM</option>
// //                                 </select>
// //                             </div>
// //
// //                             <div>
// //                                 <label className="block text-sm font-medium text-medico-gray mb-2">Precio</label>
// //                                 <select
// //                                     value={filters.gratuito}
// //                                     onChange={(e) => setFilters(prev => ({ ...prev, gratuito: e.target.value }))}
// //                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
// //                                 >
// //                                     <option value="">Todos</option>
// //                                     <option value="true">Gratuitos</option>
// //                                     <option value="false">De Pago</option>
// //                                 </select>
// //                             </div>
// //
// //                             <div className="flex items-end">
// //                                 <button
// //                                     onClick={() => setFilters({ search: '', tipo: '', gratuito: '' })}
// //                                     className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
// //                                 >
// //                                     Limpiar Filtros
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     </div>
// //
// //                     {/* Courses Grid */}
// //                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
// //                         {cursosFiltrados.map((curso) => (
// //                             <div
// //                                 key={curso.id}
// //                                 className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
// //                                 onClick={() => handleCourseClick(curso.id)}
// //                             >
// //                                 <img
// //                                     src={curso.miniatura_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'}
// //                                     alt={curso.titulo}
// //                                     className="w-full h-48 object-cover"
// //                                     onError={(e) => {
// //                                         e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'
// //                                     }}
// //                                 />
// //                                 <div className="p-6">
// //                                     <div className="flex items-start justify-between mb-3">
// //                                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                                             curso.es_gratuito
// //                                                 ? 'bg-green-100 text-green-800'
// //                                                 : 'bg-blue-100 text-blue-800'
// //                                         }`}>
// //                                             {curso.es_gratuito ? 'Gratuito' : formatPrice(curso.precio)}
// //                                         </span>
// //                                         <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 uppercase">
// //                                             {curso.tipo_examen || 'General'}
// //                                         </span>
// //                                     </div>
// //
// //                                     <h3 className="text-lg font-semibold text-gray-900 mb-2">{curso.titulo}</h3>
// //                                     <p className="text-sm text-medico-gray mb-4 line-clamp-2">
// //                                         {curso.descripcion || 'Curso de preparación médica completa'}
// //                                     </p>
// //
// //                                     <div className="flex items-center text-sm text-medico-gray mb-4">
// //                                         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
// //                                         </svg>
// //                                         <span className="mr-4">Instructor</span>
// //
// //                                         <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
// //                                         </svg>
// //                                         <span>{curso.activo ? 'Activo' : 'Inactivo'}</span>
// //                                     </div>
// //
// //                                     <button
// //                                         className="w-full bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
// //                                         onClick={(e) => {
// //                                             e.stopPropagation()
// //                                             handleCourseClick(curso.id)
// //                                         }}
// //                                     >
// //                                         Ver Detalles
// //                                     </button>
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
// //
// //                     {/* Empty State */}
// //                     {cursosFiltrados.length === 0 && !loading && (
// //                         <div className="text-center py-12">
// //                             <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
// //                             </svg>
// //                             <h3 className="text-lg font-medium text-gray-900 mb-2">
// //                                 {courses.length === 0 ? 'No hay cursos disponibles' : 'No se encontraron cursos'}
// //                             </h3>
// //                             <p className="text-medico-gray">
// //                                 {courses.length === 0
// //                                     ? 'Los cursos aparecerán aquí cuando estén disponibles'
// //                                     : 'Intenta con otros filtros de búsqueda'
// //                                 }
// //                             </p>
// //                         </div>
// //                     )}
// //                 </div>
// //             </div>
// //         </Layout>
// //     )
// // }
// //
// // export default CoursesPage
//
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
//     // Función para renderizar estrellas
//     const renderStars = (rating = 5) => {
//         return (
//             <div className="flex items-center justify-center mb-3">
//                 {[...Array(5)].map((_, i) => (
//                     <svg
//                         key={i}
//                         className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
//                         fill="currentColor"
//                         viewBox="0 0 20 20"
//                     >
//                         <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                     </svg>
//                 ))}
//                 <span className="ml-2 text-sm text-gray-600 font-medium">5.0</span>
//             </div>
//         )
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
//                                 className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
//                                 onClick={() => handleCourseClick(curso.id)}
//                             >
//                                 <div className="relative">
//                                     <img
//                                         src={curso.miniatura_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'}
//                                         alt={curso.titulo}
//                                         className="w-full h-48 object-cover"
//                                         onError={(e) => {
//                                             e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400'
//                                         }}
//                                     />
//                                     {/* Badge de tipo de examen */}
//                                     <div className="absolute top-4 left-4">
//                                         <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-gray-800 uppercase shadow-sm">
//                                             {curso.tipo_examen || 'General'}
//                                         </span>
//                                     </div>
//
//                                     {/* Badge de estado */}
//                                     <div className="absolute top-4 right-4">
//                                         <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
//                                             curso.activo
//                                                 ? 'bg-green-500 text-white'
//                                                 : 'bg-gray-500 text-white'
//                                         }`}>
//                                             {curso.activo ? 'Activo' : 'Inactivo'}
//                                         </span>
//                                     </div>
//                                 </div>
//
//                                 <div className="p-6">
//                                     {/* Título */}
//                                     <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 min-h-[3.5rem]">
//                                         {curso.titulo}
//                                     </h3>
//
//                                     {/* Descripción */}
//                                     <p className="text-sm text-medico-gray mb-4 line-clamp-3 min-h-[4rem]">
//                                         {curso.descripcion || 'Curso de preparación médica completa'}
//                                     </p>
//
//                                     {/* Estrellas de valoración */}
//                                     {renderStars()}
//
//                                     {/* Características principales */}
//                                     <div className="space-y-2 mb-6">
//                                         <div className="flex items-center text-sm text-gray-600">
//                                             <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
//                                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                             </svg>
//                                             <span>Simulacros cronometrados</span>
//                                         </div>
//                                         <div className="flex items-center text-sm text-gray-600">
//                                             <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
//                                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                             </svg>
//                                             <span>Clases en vivo + grabaciones 24/7</span>
//                                         </div>
//                                         <div className="flex items-center text-sm text-gray-600">
//                                             <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
//                                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                             </svg>
//                                             <span>Manuales actualizados</span>
//                                         </div>
//                                     </div>
//
//                                     {/* Precio destacado */}
//                                     <div className="border-t border-gray-100 pt-4 mb-4">
//                                         <div className="text-center">
//                                             {curso.es_gratuito ? (
//                                                 <div className="text-2xl font-bold text-green-600">
//                                                     GRATUITO
//                                                 </div>
//                                             ) : (
//                                                 <>
//                                                     <div className="text-3xl font-bold text-medico-blue">
//                                                         {formatPrice(curso.precio)}
//                                                     </div>
//                                                     <div className="text-sm text-gray-500 mt-1">
//                                                         Curso completo - 4 meses
//                                                     </div>
//                                                 </>
//                                             )}
//                                         </div>
//                                     </div>
//
//                                     {/* Botón de acción */}
//                                     <button
//                                         className="w-full bg-gradient-to-r from-medico-blue to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
//                                         onClick={(e) => {
//                                             e.stopPropagation()
//                                             handleCourseClick(curso.id)
//                                         }}
//                                     >
//                                         Ver Detalles del Curso
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
import { Stethoscope, Heart, Smile, Leaf } from 'lucide-react'
import Layout from '../utils/Layout'
import coursesService from '../services/courses'

const scrollToAllCourses = () => {
    const element = document.querySelector('#todos-los-cursos')
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
    }
}

const CoursesPage = () => {
    const navigate = useNavigate()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [filters, setFilters] = useState({
        search: '',
        gratuito: ''
    })

    // Cursos destacados con la información del PDF
    const cursosDestacados = [
        {
            id: 'caces-medicina',
            titulo: 'EHEP CACES MEDICINA',
            descripcion: 'Preparación completa para el Examen de Medicina del CACES. Septiembre 2025 (curso 4 meses).',
            precio: 74.99,
            fecha: 'Septiembre 2025',
            examen: 'Examen CACES MEDICINA 2025',
            caracteristicas: [
                'Más de 3,500 preguntas tipo CACES',
                'Más de 50 simuladores cronometrados y retroalimentados',
                'Clases en vivo todos los días y grabaciones disponibles 24/7',
                'Acceso al último examen Medicina EHEP CACES (mayo 2025)',
                'Manuales clínicos actualizados y guías condensadas',
                'Flashcards inteligentes y presentaciones dinámicas',
                'Seguimiento de metas personalizado con retroalimentación continua'
            ],
            icon: <Stethoscope className="w-16 h-16" />,
            badge: 'MEDICINA',
            color: 'from-blue-500 to-blue-700',
            popular: true
        },
        {
            id: 'caces-enfermeria',
            titulo: 'EHEP CACES ENFERMERÍA',
            descripcion: 'Preparación completa para el Examen de Enfermería del CACES. Septiembre 2025 (curso 4 meses).',
            precio: 74.99,
            fecha: 'Septiembre 2025',
            examen: 'Examen CACES ENFERMERÍA 2025',
            caracteristicas: [
                'Más de 3,500 preguntas tipo CACES',
                'Más de 50 simuladores cronometrados y retroalimentados',
                'Clases en vivo todos los días y grabaciones disponibles 24/7',
                'Acceso al último examen Enfermería EHEP CACES (mayo 2025)',
                'Manuales clínicos actualizados y guías condensadas',
                'Flashcards inteligentes y presentaciones dinámicas',
                'Seguimiento de metas personalizado con retroalimentación continua'
            ],
            icon: <Heart className="w-16 h-16" />,
            badge: 'ENFERMERÍA',
            color: 'from-green-500 to-green-700'
        },
        {
            id: 'caces-odontologia',
            titulo: 'EHEP CACES ODONTOLOGÍA',
            descripcion: 'Preparación completa para el Examen de Odontología del CACES. Septiembre 2025 (curso 4 meses).',
            precio: 74.99,
            fecha: 'Septiembre 2025',
            examen: 'Examen CACES ODONTOLOGÍA 2025',
            caracteristicas: [
                'Más de 3,500 preguntas tipo CACES',
                'Más de 50 simuladores cronometrados y retroalimentados',
                'Clases en vivo todos los días y grabaciones disponibles 24/7',
                'Acceso al último examen Odontología EHEP CACES (mayo 2025)',
                'Manuales clínicos actualizados y guías condensadas',
                'Flashcards inteligentes y presentaciones dinámicas',
                'Seguimiento de metas personalizado con retroalimentación continua'
            ],
            icon: <Smile className="w-16 h-16" />,
            badge: 'ODONTOLOGÍA',
            color: 'from-purple-500 to-purple-700'
        },
        {
            id: 'pre-rural',
            titulo: 'CURSO PRE-RURAL',
            descripcion: 'Preparación completa para el Ingreso al año rural. Septiembre 2025 (curso 3 meses).',
            precio: 22.99,
            fecha: 'Septiembre 2025',
            examen: 'Ingreso MEDICINA RURAL 2025',
            caracteristicas: [
                'Más de 100 documentos clave para la práctica médica',
                'Clases en vivo y grabaciones disponibles 24/7',
                'Asesoría para postulación y elección de plazas',
                'Revisión de documentación oficial para ingreso',
                'Plantillas clínicas y herramientas prácticas de atención',
                'Espacios de resolución de dudas personalizado'
            ],
            icon: <Leaf className="w-16 h-16" />,
            badge: 'PRE-RURAL',
            color: 'from-orange-500 to-orange-700',
            descuento: true
        }
    ]

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
        const matchGratuito = !filters.gratuito || curso.es_gratuito.toString() === filters.gratuito
        return matchSearch && matchGratuito
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

    const handleInteresClick = (curso) => {
        const mensaje = `Hola! Me interesa el ${curso.titulo}. ${curso.descripcion}`
        const whatsappUrl = `https://wa.me/593981833667?text=${encodeURIComponent(mensaje)}`
        window.open(whatsappUrl, '_blank')
    }

    const handleRegistroClick = () => {
        navigate('/registro')
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
            <div className="min-h-screen bg-medico-light">

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-medico-blue via-blue-600 to-blue-800 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h1 className="text-5xl font-bold mb-6">
                            Prepárate para el <span className="text-yellow-300">Éxito</span>
                        </h1>
                        <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90">
                            Cursos especializados para CACES, medicina rural y más.
                            Tu futuro profesional comienza aquí.
                        </p>
                        <div className="flex items-center justify-center space-x-8 text-sm">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>+10,000 estudiantes</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>99% de aprobación</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>Soporte 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cursos Destacados Section */}
                <div className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Cursos <span className="text-medico-blue">Destacados</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Nuestros programas más completos y exitosos para tu preparación profesional
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                            {cursosDestacados.map((curso, index) => (
                                <div
                                    key={curso.id}
                                    className="relative bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    <div className="p-6">
                                        {/* Header con icono y título */}
                                        <div className="flex items-start space-x-4 mb-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${curso.color} text-white flex-shrink-0`}>
                                                {curso.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
                                                        {curso.badge}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {curso.titulo}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    {curso.descripcion}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Estrellas */}
                                        <div className="flex justify-center mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className="w-5 h-5 text-yellow-400"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>

                                        {/* Características en dos columnas */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 mb-6">
                                            {curso.caracteristicas.map((caracteristica, idx) => (
                                                <div key={idx} className="flex items-start text-sm text-gray-700">
                                                    <svg className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="leading-tight">{caracteristica}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Precio */}
                                        <div className="text-center mb-6">
                                            <div className="text-3xl font-bold text-gray-900">
                                                {formatPrice(curso.precio)}
                                            </div>
                                        </div>

                                        {/* CTAs */}
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <button
                                                onClick={() => handleInteresClick(curso)}
                                                className="flex items-center justify-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex-1"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785"/>
                                                </svg>
                                                Me Interesa
                                            </button>
                                            <button
                                                onClick={handleRegistroClick}
                                                className={`bg-gradient-to-r ${curso.color} text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex-1`}
                                            >
                                                Regístrate en nuestra plataforma
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Principal */}
                        <div className="bg-gradient-to-r from-medico-blue to-blue-700 rounded-2xl p-8 text-center text-white">
                            <h3 className="text-2xl font-bold mb-4">
                                ¿No estás seguro cuál curso elegir?
                            </h3>
                            <p className="text-lg mb-6 opacity-90">
                                Habla con nuestros asesores académicos y encuentra el programa perfecto para ti
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <a
                                    href="https://wa.me/593981833667?text=Hola!%20Me%20gustar%C3%ADa%20recibir%20asesor%C3%ADa%20sobre%20sus%20cursos%20disponibles."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white text-medico-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
                                >
                                    Contáctanos
                                </a>
                                <button
                                    onClick={scrollToAllCourses}
                                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-medico-blue transition-colors"
                                >
                                    Ver Todos los Cursos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Cursos Regulares */}
                <div id="todos-los-cursos" className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                        {/* Header */}
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-medico-blue mb-4">
                                Todos los Cursos
                            </h2>
                            <p className="text-lg text-medico-gray max-w-3xl mx-auto">
                                Explora nuestra biblioteca completa de cursos disponibles
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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                        onClick={() => setFilters({ search: '', gratuito: '' })}
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

                {/* Testimonios Section */}
                <div className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Lo que dicen nuestros <span className="text-medico-blue">estudiantes</span>
                            </h2>
                            <p className="text-xl text-gray-600">
                                Resultados reales de estudiantes que lograron sus objetivos
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">
                                    "Gracias al curso de CACES logré aprobar en mi primer intento. Los simulacros fueron clave para mi preparación."
                                </p>
                                <div className="flex items-center justify-center">
                                    <img
                                        src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face"
                                        alt="Maria Rodriguez"
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">María Rodríguez</div>
                                        <div className="text-sm text-gray-600">Médica General</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">
                                    "El curso PRE-RURAL me preparó perfectamente para el año rural. Excelente material y soporte."
                                </p>
                                <div className="flex items-center justify-center">
                                    <img
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face"
                                        alt="Carlos Mendez"
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">Carlos Méndez</div>
                                        <div className="text-sm text-gray-600">Médico Rural</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                                <div className="flex justify-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-6 italic">
                                    "Las clases en vivo y el seguimiento personalizado hicieron la diferencia en mi preparación."
                                </p>
                                <div className="flex items-center justify-center">
                                    <img
                                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face"
                                        alt="Ana Lopez"
                                        className="w-12 h-12 rounded-full mr-4"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">Ana López</div>
                                        <div className="text-sm text-gray-600">Enfermera</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action Final */}
                <div className="bg-gradient-to-br from-medico-blue via-blue-600 to-blue-800 py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                        <h2 className="text-4xl font-bold mb-6">
                            ¿Listo para cambiar tu futuro profesional?
                        </h2>
                        <p className="text-xl mb-8 opacity-90">
                            Únete a miles de profesionales que han logrado sus objetivos con nosotros
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors transform hover:scale-105">
                                ¡Empezar Ahora! 🚀
                            </button>
                            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-medico-blue transition-colors">
                                Hablar con un Asesor
                            </button>
                        </div>
                        <div className="mt-8 text-sm opacity-75">
                            ✅ Sin compromiso • ✅ Asesoría gratuita • ✅ Garantía de satisfacción
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default CoursesPage