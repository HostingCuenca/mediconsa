// src/dashboard/MyCourses.jsx - Mis cursos del estudiante
import React, { useState } from 'react'
import Layout from '../components/Layout'

const MyCourses = () => {
    const [activeTab, setActiveTab] = useState('todos')

    // Mock data
    const inscripciones = [
        {
            id: 1,
            curso: {
                id: 1,
                titulo: "Preparación CACES 2025",
                miniatura_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400"
            },
            estado_pago: "habilitado",
            fecha_inscripcion: "2025-01-10",
            porcentaje_progreso: 75,
            total_clases: 20,
            clases_completadas: 15
        },
        {
            id: 2,
            curso: {
                id: 2,
                titulo: "SENESYCT - Becas Internacionales",
                miniatura_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400"
            },
            estado_pago: "habilitado",
            fecha_inscripcion: "2025-01-05",
            porcentaje_progreso: 30,
            total_clases: 15,
            clases_completadas: 5
        },
        {
            id: 3,
            curso: {
                id: 3,
                titulo: "Medicina Rural Premium",
                miniatura_url: "https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=400"
            },
            estado_pago: "pendiente",
            fecha_inscripcion: "2025-01-15",
            porcentaje_progreso: 0,
            total_clases: 25,
            clases_completadas: 0
        }
    ]

    const cursosFiltrados = inscripciones.filter(inscripcion => {
        if (activeTab === 'todos') return true
        if (activeTab === 'activos') return inscripcion.estado_pago === 'habilitado'
        if (activeTab === 'pendientes') return inscripcion.estado_pago === 'pendiente'
        if (activeTab === 'completados') return inscripcion.porcentaje_progreso >= 100
        return true
    })

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Mis Cursos</h1>
                    <p className="text-medico-gray mt-2">Gestiona tu progreso de aprendizaje</p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'todos', label: 'Todos', count: inscripciones.length },
                            { id: 'activos', label: 'Activos', count: inscripciones.filter(i => i.estado_pago === 'habilitado').length },
                            { id: 'pendientes', label: 'Pendientes', count: inscripciones.filter(i => i.estado_pago === 'pendiente').length },
                            { id: 'completados', label: 'Completados', count: inscripciones.filter(i => i.porcentaje_progreso >= 100).length }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-medico-blue text-medico-blue'
                                        : 'border-transparent text-medico-gray hover:text-medico-blue hover:border-gray-300'
                                } flex items-center space-x-2`}
                            >
                                <span>{tab.label}</span>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                                   {tab.count}
                               </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cursosFiltrados.map((inscripcion) => (
                        <div key={inscripcion.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                            <img
                                src={inscripcion.curso.miniatura_url}
                                alt={inscripcion.curso.titulo}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-3">
                                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                       inscripcion.estado_pago === 'habilitado'
                                           ? 'bg-green-100 text-green-800'
                                           : 'bg-yellow-100 text-yellow-800'
                                   }`}>
                                       {inscripcion.estado_pago === 'habilitado' ? 'Activo' : 'Pendiente'}
                                   </span>
                                    <span className="text-xs text-medico-gray">
                                       {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}
                                   </span>
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{inscripcion.curso.titulo}</h3>

                                {/* Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-medico-gray mb-1">
                                        <span>Progreso</span>
                                        <span>{inscripcion.porcentaje_progreso}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-medico-blue h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${inscripcion.porcentaje_progreso}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-medico-gray mt-1">
                                        <span>{inscripcion.clases_completadas} de {inscripcion.total_clases} clases</span>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            inscripcion.estado_pago === 'habilitado'
                                                ? 'bg-medico-blue text-white hover:bg-blue-700'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        }`}
                                        disabled={inscripcion.estado_pago !== 'habilitado'}
                                    >
                                        {inscripcion.estado_pago === 'habilitado' ? 'Continuar' : 'Pago Pendiente'}
                                    </button>

                                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {cursosFiltrados.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos en esta categoría</h3>
                        <p className="text-medico-gray mb-6">Explora nuestro catálogo para encontrar cursos que te interesen</p>
                        <a
                            href="/cursos"
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                        >
                            <span>Explorar Cursos</span>
                        </a>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default MyCourses