// src/dashboard/MyProgress.jsx - Progreso detallado del estudiante
import React, { useState } from 'react'
import Layout from '../components/Layout'

const MyProgress = () => {
    const [selectedCourse, setSelectedCourse] = useState('1')

    // Mock data
    const cursosProgreso = [
        {
            id: '1',
            titulo: "Preparación CACES 2025",
            porcentaje_progreso: 75,
            total_clases: 20,
            clases_completadas: 15,
            tiempo_total_minutos: 1200,
            tiempo_visto_minutos: 900,
            ultimo_acceso: "2025-01-15",
            modulos: [
                {
                    id: 1,
                    titulo: "Fundamentos Médicos",
                    porcentaje: 100,
                    clases: [
                        { id: 1, titulo: "Anatomía Básica", completada: true, porcentaje_visto: 100 },
                        { id: 2, titulo: "Fisiología", completada: true, porcentaje_visto: 100 },
                        { id: 3, titulo: "Patología", completada: true, porcentaje_visto: 100 }
                    ]
                },
                {
                    id: 2,
                    titulo: "Casos Clínicos",
                    porcentaje: 50,
                    clases: [
                        { id: 4, titulo: "Caso 1: Fiebre", completada: true, porcentaje_visto: 100 },
                        { id: 5, titulo: "Caso 2: Dolor", completada: false, porcentaje_visto: 0 }
                    ]
                }
            ]
        },
        {
            id: '2',
            titulo: "SENESYCT - Becas",
            porcentaje_progreso: 30,
            total_clases: 15,
            clases_completadas: 5,
            tiempo_total_minutos: 900,
            tiempo_visto_minutos: 270,
            ultimo_acceso: "2025-01-12",
            modulos: [
                {
                    id: 3,
                    titulo: "Inglés Técnico",
                    porcentaje: 60,
                    clases: [
                        { id: 6, titulo: "Vocabulario Médico", completada: true, porcentaje_visto: 100 },
                        { id: 7, titulo: "Reading Comprehension", completada: false, porcentaje_visto: 20 }
                    ]
                }
            ]
        }
    ]

    const cursoActual = cursosProgreso.find(c => c.id === selectedCourse)

    const formatearTiempo = (minutos) => {
        const horas = Math.floor(minutos / 60)
        const mins = minutos % 60
        return `${horas}h ${mins}m`
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Mi Progreso</h1>
                    <p className="text-medico-gray mt-2">Seguimiento detallado de tu aprendizaje</p>
                </div>

                {/* Course Selector */}
                <div className="mb-8">
                    <label className="block text-sm font-medium text-medico-gray mb-2">
                        Seleccionar Curso
                    </label>
                    <select
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                    >
                        {cursosProgreso.map((curso) => (
                            <option key={curso.id} value={curso.id}>
                                {curso.titulo}
                            </option>
                        ))}
                    </select>
                </div>

                {cursoActual && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-medico-gray">Progreso Total</p>
                                        <p className="text-2xl font-bold text-blue-600">{cursoActual.porcentaje_progreso}%</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-medico-gray">Clases Completadas</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {cursoActual.clases_completadas}/{cursoActual.total_clases}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-medico-gray">Tiempo Visto</p>
                                        <p className="text-2xl font-bold text-purple-600">
                                            {formatearTiempo(cursoActual.tiempo_visto_minutos)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-medico-gray">Último Acceso</p>
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {new Date(cursoActual.ultimo_acceso).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
                            <h3 className="text-lg font-semibold text-medico-blue mb-4">Progreso General</h3>
                            <div className="mb-2">
                                <div className="flex justify-between text-sm text-medico-gray mb-1">
                                    <span>{cursoActual.titulo}</span>
                                    <span>{cursoActual.porcentaje_progreso}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-medico-blue to-medico-green h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${cursoActual.porcentaje_progreso}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div className="flex justify-between text-xs text-medico-gray">
                                <span>{cursoActual.clases_completadas} clases completadas</span>
                                <span>{formatearTiempo(cursoActual.tiempo_visto_minutos)} de contenido visto</span>
                            </div>
                        </div>

                        {/* Modules Progress */}
                        <div className="space-y-6">
                            {cursoActual.modulos.map((modulo) => (
                                <div key={modulo.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-medico-blue">{modulo.titulo}</h3>
                                        <span className="text-sm font-medium text-medico-gray">{modulo.porcentaje}% completado</span>
                                    </div>

                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                                        <div
                                            className="bg-medico-blue h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${modulo.porcentaje}%` }}
                                        ></div>
                                    </div>

                                    <div className="space-y-3">
                                        {modulo.clases.map((clase) => (
                                            <div key={clase.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                        clase.completada
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                        {clase.completada ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m2-10.293A9.985 9.985 0 0119 8v2m0 6V8a9.985 9.985 0 00-1.415-1.415M15 9.808v.001M9 9.808v.001M12 5.318v.001M6.243 9.757a5.978 5.978 0 011.414-1.414M18.243 9.757a5.978 5.978 0 00-1.414-1.414" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span className={`${clase.completada ? 'text-gray-900' : 'text-medico-gray'}`}>
                                                        {clase.titulo}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-medico-gray">{clase.porcentaje_visto}%</span>
                                                    <div className="w-16 bg-gray-200 rounded-full h-1">
                                                        <div
                                                            className="bg-medico-blue h-1 rounded-full"
                                                            style={{ width: `${clase.porcentaje_visto}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </Layout>
    )
}

export default MyProgress