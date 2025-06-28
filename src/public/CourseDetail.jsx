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
            alert('Debes iniciar sesión para inscribirte')
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
                                        <span>Acceso de por vida</span>
                                    </div>

                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Certificado incluido</span>
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
                                        <p className="text-sm text-medico-gray">Acceso completo de por vida</p>
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
                                                : 'Inicia Sesión para Inscribirte'
                                        }
                                    </button>

                                    <div className="text-center">
                                        <p className="text-xs text-medico-gray">
                                            ✓ Acceso inmediato • ✓ Certificado • ✓ Soporte 24/7
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
                                                <li>✓ Acceso de por vida</li>
                                                <li>✓ Certificado de finalización</li>
                                                <li>✓ Soporte del instructor</li>
                                                <li>✓ Actualizaciones incluidas</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default CourseDetail