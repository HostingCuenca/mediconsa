// src/pages/CourseDetail.jsx - Detalle del curso con inscripción
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../utils/AuthContext'

const CourseDetail = () => {
    const { id } = useParams()
    const { isAuthenticated } = useAuth()
    const [activeTab, setActiveTab] = useState('contenido')

    // Mock data
    const curso = {
        id: parseInt(id),
        titulo: "Preparación CACES 2025",
        descripcion: "Curso completo para el Consejo de Aseguramiento de la Calidad de la Educación Superior. Incluye todo el material actualizado, simulacros reales y soporte personalizado.",
        precio: 149.99,
        es_gratuito: false,
        tipo_examen: "caces",
        estudiantes_inscritos: 45,
        instructor_nombre: "Dr. Juan Pérez",
        miniatura_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800",
        modulos: [
            {
                id: 1,
                titulo: "Fundamentos Médicos",
                orden: 1,
                clases: [
                    { id: 1, titulo: "Anatomía Básica", duracion_minutos: 45, es_gratuita: true },
                    { id: 2, titulo: "Fisiología Humana", duracion_minutos: 60, es_gratuita: false },
                    { id: 3, titulo: "Patología General", duracion_minutos: 55, es_gratuita: false }
                ]
            },
            {
                id: 2,
                titulo: "Casos Clínicos",
                orden: 2,
                clases: [
                    { id: 4, titulo: "Caso 1: Paciente con Fiebre", duracion_minutos: 30, es_gratuita: false },
                    { id: 5, titulo: "Caso 2: Dolor Abdominal", duracion_minutos: 35, es_gratuita: false }
                ]
            }
        ]
    }

    const handleInscripcion = () => {
        if (!isAuthenticated) {
            alert('Debes iniciar sesión para inscribirte')
            return
        }
        alert('Funcionalidad de inscripción en desarrollo')
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
                                        {curso.tipo_examen}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                        curso.es_gratuito
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`}
                                    </span>
                                </div>

                                <h1 className="text-3xl font-bold text-medico-blue mb-4">{curso.titulo}</h1>
                                <p className="text-lg text-medico-gray mb-6">{curso.descripcion}</p>

                                <div className="flex items-center space-x-6 text-sm text-medico-gray">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>{curso.instructor_nombre}</span>
                                    </div>

                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                        <span>{curso.estudiantes_inscritos} estudiantes</span>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-6">
                                    <img
                                        src={curso.miniatura_url}
                                        alt={curso.titulo}
                                        className="w-full h-48 object-cover rounded-lg mb-6"
                                    />

                                    <div className="text-center mb-6">
                                        <div className="text-3xl font-bold text-medico-blue mb-2">
                                            {curso.es_gratuito ? 'Gratuito' : `$${curso.precio}`}
                                        </div>
                                        <p className="text-sm text-medico-gray">Acceso completo de por vida</p>
                                    </div>

                                    <button
                                        onClick={handleInscripcion}
                                        className="w-full bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-4"
                                    >
                                        {isAuthenticated ? 'Inscribirse Ahora' : 'Inicia Sesión para Inscribirte'}
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
                                        { id: 'reviews', label: 'Reseñas' }
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
                                <div className="space-y-6">
                                    {curso.modulos.map((modulo) => (
                                        <div key={modulo.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                            <h3 className="text-lg font-semibold text-medico-blue mb-4">
                                                Módulo {modulo.orden}: {modulo.titulo}
                                            </h3>
                                            <div className="space-y-3">
                                                {modulo.clases.map((clase) => (
                                                    <div key={clase.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                        <div className="flex items-center space-x-3">
                                                            <svg className="w-5 h-5 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10.293A9.985 9.985 0 0119 8v2m0 6V8a9.985 9.985 0 00-1.415-1.415M15 9.808v.001M9 9.808v.001M12 5.318v.001M6.243 9.757a5.978 5.978 0 011.414-1.414M18.243 9.757a5.978 5.978 0 00-1.414-1.414" />
                                                            </svg>
                                                            <span className="text-gray-900">{clase.titulo}</span>
                                                            {clase.es_gratuita && (
                                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                                    Gratis
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-medico-gray">
                                                            {clase.duracion_minutos} min
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'instructor' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-16 h-16 bg-medico-blue rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg font-bold">JP</span>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{curso.instructor_nombre}</h3>
                                            <p className="text-medico-gray">Médico Especialista</p>
                                        </div>
                                    </div>
                                    <p className="text-medico-gray">
                                        Médico con más de 10 años de experiencia en preparación para exámenes médicos.
                                        Ha ayudado a cientos de estudiantes a aprobar sus evaluaciones.
                                    </p>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <p className="text-center text-medico-gray py-8">
                                        Las reseñas estarán disponibles próximamente
                                    </p>
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