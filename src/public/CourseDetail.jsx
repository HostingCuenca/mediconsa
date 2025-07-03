// import React, { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import Layout from '../utils/Layout'
// import { useAuth } from '../utils/AuthContext'
// import coursesService from '../services/courses'
//
// const CourseDetail = () => {
//     const { id } = useParams()
//     const navigate = useNavigate()
//     const { isAuthenticated } = useAuth()
//     const [activeTab, setActiveTab] = useState('contenido')
//     const [curso, setCurso] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//
//     useEffect(() => {
//         loadCourseDetail()
//     }, [id])
//
//     const loadCourseDetail = async () => {
//         try {
//             setLoading(true)
//             setError('')
//
//             // Asumo que existe getCourseById en el servicio
//             const result = await coursesService.getCourseById(id)
//
//             if (result.success) {
//                 setCurso(result.data.curso)
//             } else {
//                 setError(result.error || 'Curso no encontrado')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error cargando el curso')
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     const handleInscripcion = () => {
//         if (!isAuthenticated) {
//             alert('Debes iniciar sesión para inscribirte')
//             return
//         }
//         alert('Funcionalidad de inscripción en desarrollo')
//     }
//
//     const formatPrice = (price) => {
//         return new Intl.NumberFormat('es-EC', {
//             style: 'currency',
//             currency: 'USD'
//         }).format(price || 0)
//     }
//
//     if (loading) {
//         return (
//             <Layout>
//                 <div className="min-h-screen bg-medico-light flex items-center justify-center">
//                     <div className="text-center">
//                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
//                         <p className="mt-4 text-medico-gray">Cargando curso...</p>
//                     </div>
//                 </div>
//             </Layout>
//         )
//     }
//
//     if (error || !curso) {
//         return (
//             <Layout>
//                 <div className="min-h-screen bg-medico-light flex items-center justify-center">
//                     <div className="text-center">
//                         <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <h3 className="text-lg font-medium text-gray-900 mb-2">Curso no encontrado</h3>
//                         <p className="text-medico-gray mb-4">{error}</p>
//                         <button
//                             onClick={() => navigate('/courses')}
//                             className="bg-medico-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                             Ver Todos los Cursos
//                         </button>
//                     </div>
//                 </div>
//             </Layout>
//         )
//     }
//
//     return (
//         <Layout>
//             <div className="min-h-screen bg-medico-light">
//                 {/* Hero Section */}
//                 <div className="bg-white border-b border-gray-200">
//                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                             <div className="lg:col-span-2">
//                                 <div className="flex items-center space-x-4 mb-4">
//                                     <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 uppercase">
//                                         {curso.tipo_examen || 'General'}
//                                     </span>
//                                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//                                         curso.es_gratuito
//                                             ? 'bg-green-100 text-green-800'
//                                             : 'bg-yellow-100 text-yellow-800'
//                                     }`}>
//                                         {curso.es_gratuito ? 'Gratuito' : formatPrice(curso.precio)}
//                                     </span>
//                                     {!curso.activo && (
//                                         <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
//                                             Inactivo
//                                         </span>
//                                     )}
//                                 </div>
//
//                                 <h1 className="text-3xl font-bold text-medico-blue mb-4">{curso.titulo}</h1>
//                                 <p className="text-lg text-medico-gray mb-6">
//                                     {curso.descripcion || 'Curso de preparación médica completa con contenido actualizado.'}
//                                 </p>
//
//                                 <div className="flex items-center space-x-6 text-sm text-medico-gray">
//                                     <div className="flex items-center">
//                                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                         </svg>
//                                         <span>Instructor Especializado</span>
//                                     </div>
//
//                                     <div className="flex items-center">
//                                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
//                                         </svg>
//                                         <span>Para acceder, registrate en nuestra plataforma</span>
//                                     </div>
//
//                                     <div className="flex items-center">
//                                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                         </svg>
//                                         <span>Certificado incluido</span>
//                                     </div>
//                                 </div>
//                             </div>
//
//                             <div className="lg:col-span-1">
//                                 <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
//                                     <img
//                                         src={curso.miniatura_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800'}
//                                         alt={curso.titulo}
//                                         className="w-full h-48 object-cover rounded-lg mb-6"
//                                         onError={(e) => {
//                                             e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800'
//                                         }}
//                                     />
//
//                                     <div className="text-center mb-6">
//                                         <div className="text-3xl font-bold text-medico-blue mb-2">
//                                             {curso.es_gratuito ? 'Gratuito' : formatPrice(curso.precio)}
//                                         </div>
//                                         <p className="text-sm text-medico-gray">Acceso completo</p>
//                                     </div>
//
//                                     <button
//                                         onClick={handleInscripcion}
//                                         disabled={!curso.activo}
//                                         className={`w-full px-6 py-3 rounded-lg font-semibold mb-4 transition-colors ${
//                                             curso.activo
//                                                 ? 'bg-medico-blue text-white hover:bg-blue-700'
//                                                 : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                         }`}
//                                     >
//                                         {!curso.activo
//                                             ? 'Curso No Disponible'
//                                             : isAuthenticated
//                                                 ? 'Inscribirse Ahora'
//                                                 : 'Inicia Sesión para Inscribirte'
//                                         }
//                                     </button>
//
//                                     <div className="text-center">
//                                         <p className="text-xs text-medico-gray">
//                                             ✓ Acceso inmediato • ✓ Curso especializado • ✓ Soporte 24/7
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* Content Tabs */}
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                     <div className="lg:grid lg:grid-cols-3 lg:gap-8">
//                         <div className="lg:col-span-2">
//                             {/* Tab Navigation */}
//                             <div className="border-b border-gray-200 mb-8">
//                                 <nav className="-mb-px flex space-x-8">
//                                     {[
//                                         { id: 'contenido', label: 'Contenido del Curso' },
//                                         { id: 'instructor', label: 'Instructor' },
//                                         { id: 'info', label: 'Información' }
//                                     ].map((tab) => (
//                                         <button
//                                             key={tab.id}
//                                             onClick={() => setActiveTab(tab.id)}
//                                             className={`py-2 px-1 border-b-2 font-medium text-sm ${
//                                                 activeTab === tab.id
//                                                     ? 'border-medico-blue text-medico-blue'
//                                                     : 'border-transparent text-medico-gray hover:text-medico-blue hover:border-gray-300'
//                                             }`}
//                                         >
//                                             {tab.label}
//                                         </button>
//                                     ))}
//                                 </nav>
//                             </div>
//
//                             {/* Tab Content */}
//                             {activeTab === 'contenido' && (
//                                 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//                                     <h3 className="text-lg font-semibold text-medico-blue mb-4">
//                                         Contenido del Curso
//                                     </h3>
//                                     <div className="space-y-4">
//                                         <div className="text-medico-gray">
//                                             <p className="mb-4">Este curso incluye:</p>
//                                             <ul className="space-y-2">
//                                                 <li className="flex items-center">
//                                                     <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                                     </svg>
//                                                     Material de estudio actualizado
//                                                 </li>
//                                                 <li className="flex items-center">
//                                                     <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                                     </svg>
//                                                     Simulacros de práctica
//                                                 </li>
//                                                 <li className="flex items-center">
//                                                     <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                                     </svg>
//                                                     Materiales descargables
//                                                 </li>
//                                                 <li className="flex items-center">
//                                                     <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                                                     </svg>
//                                                     Soporte del instructor
//                                                 </li>
//                                             </ul>
//                                         </div>
//
//                                         <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//                                             <p className="text-sm text-blue-800">
//                                                 💡 <strong>Nota:</strong> El contenido detallado estará disponible después de la inscripción.
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//
//                             {activeTab === 'instructor' && (
//                                 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//                                     <div className="flex items-center space-x-4 mb-4">
//                                         <div className="w-16 h-16 bg-medico-blue rounded-full flex items-center justify-center">
//                                             <span className="text-white text-lg font-bold">IN</span>
//                                         </div>
//                                         <div>
//                                             <h3 className="text-lg font-semibold text-gray-900">Instructor Especializado</h3>
//                                             <p className="text-medico-gray">Médico Especialista en Educación</p>
//                                         </div>
//                                     </div>
//                                     <p className="text-medico-gray">
//                                         Profesional médico con amplia experiencia en preparación para exámenes médicos.
//                                         Especializado en metodologías de enseñanza efectivas y actualización constante
//                                         de contenidos según las últimas tendencias en evaluación médica.
//                                     </p>
//                                 </div>
//                             )}
//
//                             {activeTab === 'info' && (
//                                 <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
//                                     <h3 className="text-lg font-semibold text-medico-blue mb-4">
//                                         Información del Curso
//                                     </h3>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <div>
//                                             <h4 className="font-medium text-gray-900 mb-2">Detalles</h4>
//                                             <ul className="space-y-2 text-sm text-medico-gray">
//                                                 <li><strong>ID:</strong> {curso.id}</li>
//                                                 <li><strong>Tipo:</strong> {curso.tipo_examen || 'General'}</li>
//                                                 <li><strong>Estado:</strong> {curso.activo ? 'Activo' : 'Inactivo'}</li>
//                                                 <li><strong>Creado:</strong> {new Date(curso.fecha_creacion).toLocaleDateString('es-EC')}</li>
//                                             </ul>
//                                         </div>
//                                         <div>
//                                             <h4 className="font-medium text-gray-900 mb-2">Características</h4>
//                                             <ul className="space-y-2 text-sm text-medico-gray">
//                                                 <li>✓ Accede a nuestra plataforma</li>
//                                                 <li>✓ Certificado de finalización</li>
//                                                 <li>✓ Soporte del instructor</li>
//                                                 <li>✓ Actualizaciones incluidas</li>
//                                             </ul>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </Layout>
//     )
// }
//
// export default CourseDetail

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import coursesService from '../services/courses'

const CourseDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated } = useAuth()
    const [activeTab, setActiveTab] = useState('contenido')
    const [curso, setCurso] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        loadCourseDetail()
    }, [id])

    const loadCourseDetail = async () => {
        try {
            setLoading(true)
            setError('')

            // Asumo que existe getCourseById en el servicio
            const result = await coursesService.getCourseById(id)

            if (result.success) {
                setCurso(result.data.curso)
            } else {
                setError(result.error || 'Curso no encontrado')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error cargando el curso')
        } finally {
            setLoading(false)
        }
    }

    const handleInscripcion = () => {
        if (!isAuthenticated) {
            setShowModal(true)
            return
        }
        alert('Funcionalidad de inscripción en desarrollo')
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    const handleWhatsApp = () => {
        const message = `Hola, estoy interesado en el curso "${curso.titulo}". ¿Podrían darme más información?`
        const whatsappUrl = `https://wa.me/593981833667?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
        setShowModal(false)
    }

    const handleRegister = () => {
        navigate('/registro')
        setShowModal(false)
    }

    const handleLogin = () => {
        navigate('/login')
        setShowModal(false)
    }

    const closeModal = () => {
        setShowModal(false)
    }

    // Modal Component
    const InscriptionModal = () => {
        if (!showModal) return null

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full mx-auto shadow-2xl transform">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-medico-blue to-blue-700 text-white p-6 rounded-t-2xl relative">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold">¡Inscríbete al Curso!</h3>
                            <p className="text-blue-100 text-sm mt-2">
                                Para acceder a este curso necesitas una cuenta
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                {curso?.titulo}
                            </h4>
                            <div className="text-2xl font-bold text-medico-blue">
                                {curso?.es_gratuito ? 'GRATUITO' : formatPrice(curso?.precio)}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* Registrarse */}
                            <button
                                onClick={handleRegister}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Crear Cuenta Nueva
                            </button>

                            {/* Iniciar Sesión */}
                            <button
                                onClick={handleLogin}
                                className="w-full bg-medico-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Ya Tengo Cuenta
                            </button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-gray-500">o</span>
                                </div>
                            </div>

                            {/* WhatsApp */}
                            <button
                                onClick={handleWhatsApp}
                                className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-500 hover:to-green-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                                </svg>
                                Escríbenos por WhatsApp
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                Al continuar, aceptas nuestros términos y condiciones
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-medico-light flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando curso...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    if (error || !curso) {
        return (
            <Layout>
                <div className="min-h-screen bg-medico-light flex items-center justify-center">
                    <div className="text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Curso no encontrado</h3>
                        <p className="text-medico-gray mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="bg-medico-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Ver Todos los Cursos
                        </button>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-medico-light">
                {/* Hero Section */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="flex items-center space-x-4 mb-4">
                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 uppercase">
                                        {curso.tipo_examen || 'General'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        curso.es_gratuito
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {curso.es_gratuito ? 'Gratuito' : formatPrice(curso.precio)}
                                    </span>
                                    {!curso.activo && (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                            Inactivo
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-bold text-medico-blue mb-4">{curso.titulo}</h1>
                                <p className="text-lg text-medico-gray mb-6">
                                    {curso.descripcion || 'Curso de preparación médica completa con contenido actualizado.'}
                                </p>

                                <div className="flex items-center space-x-6 text-sm text-medico-gray">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Instructor Especializado</span>
                                    </div>

                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2z" />
                                        </svg>
                                        <span>Para acceder, registrate en nuestra plataforma</span>
                                    </div>

                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Soporte especializado 24/7</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
                                    <img
                                        src={curso.miniatura_url || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800'}
                                        alt={curso.titulo}
                                        className="w-full h-48 object-cover rounded-lg mb-6"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800'
                                        }}
                                    />

                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-bold text-medico-blue mb-2">
                                            {curso.es_gratuito ? 'Gratuito' : formatPrice(curso.precio)}
                                        </div>
                                        <p className="text-sm text-medico-gray">Acceso completo</p>
                                    </div>

                                    <button
                                        onClick={handleInscripcion}
                                        disabled={!curso.activo}
                                        className={`w-full px-6 py-3 rounded-lg font-semibold mb-4 transition-colors ${
                                            curso.activo
                                                ? 'bg-medico-blue text-white hover:bg-blue-700'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {!curso.activo
                                            ? 'Curso No Disponible'
                                            : isAuthenticated
                                                ? 'Inscribirse Ahora'
                                                : 'Inscribirse al Curso'
                                        }
                                    </button>

                                    <div className="text-center">
                                        <p className="text-xs text-medico-gray">
                                            ✓ Acceso inmediato • ✓ Curso especializado • ✓ Soporte 24/7
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                        <div className="lg:col-span-2">
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200 mb-8">
                                <nav className="-mb-px flex space-x-8">
                                    {[
                                        { id: 'contenido', label: 'Contenido del Curso' },
                                        { id: 'instructor', label: 'Instructor' },
                                        { id: 'info', label: 'Información' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === tab.id
                                                    ? 'border-medico-blue text-medico-blue'
                                                    : 'border-transparent text-medico-gray hover:text-medico-blue hover:border-gray-300'
                                            }`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'contenido' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-medico-blue mb-4">
                                        Contenido del Curso
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="text-medico-gray">
                                            <p className="mb-4">Este curso incluye:</p>
                                            <ul className="space-y-2">
                                                <li className="flex items-center">
                                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Material de estudio actualizado
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Simulacros de práctica
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Materiales descargables
                                                </li>
                                                <li className="flex items-center">
                                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Soporte del instructor
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                💡 <strong>Nota:</strong> El contenido detallado estará disponible después de la inscripción.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'instructor' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-16 h-16 bg-medico-blue rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg font-bold">IN</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Instructor Especializado</h3>
                                            <p className="text-medico-gray">Médico Especialista en Educación</p>
                                        </div>
                                    </div>
                                    <p className="text-medico-gray">
                                        Profesional médico con amplia experiencia en preparación para exámenes médicos.
                                        Especializado en metodologías de enseñanza efectivas y actualización constante
                                        de contenidos según las últimas tendencias en evaluación médica.
                                    </p>
                                </div>
                            )}

                            {activeTab === 'info' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-medico-blue mb-4">
                                        Información del Curso
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Detalles</h4>
                                            <ul className="space-y-2 text-sm text-medico-gray">
                                                <li><strong>ID:</strong> {curso.id}</li>
                                                <li><strong>Tipo:</strong> {curso.tipo_examen || 'General'}</li>
                                                <li><strong>Estado:</strong> {curso.activo ? 'Activo' : 'Inactivo'}</li>
                                                <li><strong>Creado:</strong> {new Date(curso.fecha_creacion).toLocaleDateString('es-EC')}</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Características</h4>
                                            <ul className="space-y-2 text-sm text-medico-gray">
                                                <li>✓ Accede a nuestra plataforma</li>
                                                <li>✓ Soporte del instructor</li>
                                                <li>✓ Actualizaciones incluidas</li>
                                                <li>✓ Contenido especializado</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal */}
                <InscriptionModal />
            </div>
        </Layout>
    )
}

export default CourseDetail