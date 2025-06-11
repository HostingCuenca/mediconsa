// src/dashboard/Simulacros.jsx - Simulacros del estudiante
import React, { useState } from 'react'
import Layout from '../components/Layout'

const Simulacros = () => {
    const [selectedCourse, setSelectedCourse] = useState('1')

    // Mock data
    const simulacrosPorCurso = {
        '1': [
            {
                id: 1,
                titulo: "Simulacro CACES - Modo Práctica",
                descripcion: "Simulacro con retroalimentación inmediata",
                modo_evaluacion: "practica",
                numero_preguntas: 20,
                tiempo_limite_minutos: 60,
                intentos_permitidos: -1,
                mis_intentos: 3,
                mejor_puntaje: 85,
                total_preguntas_disponibles: 20
            },
            {
                id: 2,
                titulo: "Examen Final CACES",
                descripcion: "Simulacro tipo examen oficial",
                modo_evaluacion: "examen",
                numero_preguntas: 50,
                tiempo_limite_minutos: 120,
                intentos_permitidos: 3,
                mis_intentos: 1,
                mejor_puntaje: 78,
                total_preguntas_disponibles: 50
            }
        ],
        '2': [
            {
                id: 3,
                titulo: "Test SENESYCT Inglés",
                descripcion: "Evaluación de comprensión lectora",
                modo_evaluacion: "realista",
                numero_preguntas: 30,
                tiempo_limite_minutos: 45,
                intentos_permitidos: 5,
                mis_intentos: 0,
                mejor_puntaje: null,
                total_preguntas_disponibles: 30
            }
        ]
    }

    const cursos = [
        { id: '1', titulo: 'Preparación CACES 2025' },
        { id: '2', titulo: 'SENESYCT - Becas Internacionales' }
    ]

    const simulacros = simulacrosPorCurso[selectedCourse] || []

    const getModeColor = (modo) => {
        switch (modo) {
            case 'practica':
                return 'bg-blue-100 text-blue-800'
            case 'realista':
                return 'bg-yellow-100 text-yellow-800'
            case 'examen':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getModeLabel = (modo) => {
        switch (modo) {
            case 'practica':
                return 'Práctica'
            case 'realista':
                return 'Realista'
            case 'examen':
                return 'Examen'
            default:
                return 'Desconocido'
        }
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Simulacros</h1>
                    <p className="text-medico-gray mt-2">Practica con exámenes reales</p>
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
                        {cursos.map((curso) => (
                            <option key={curso.id} value={curso.id}>
                                {curso.titulo}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Simulacros Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {simulacros.map((simulacro) => (
                        <div key={simulacro.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(simulacro.modo_evaluacion)}`}>
                                    {getModeLabel(simulacro.modo_evaluacion)}
                                </span>
                                <div className="text-right">
                                    {simulacro.mejor_puntaje && (
                                        <div className="text-lg font-bold text-medico-green">
                                            {simulacro.mejor_puntaje}%
                                        </div>
                                    )}
                                    <div className="text-xs text-medico-gray">
                                        {simulacro.mis_intentos > 0 ? `${simulacro.mis_intentos} intentos` : 'Sin intentos'}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{simulacro.titulo}</h3>
                            <p className="text-sm text-medico-gray mb-4">{simulacro.descripcion}</p>

                            <div className="space-y-2 text-sm text-medico-gray mb-6">
                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{simulacro.numero_preguntas} preguntas</span>
                                </div>

                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{simulacro.tiempo_limite_minutos} minutos</span>
                                </div>

                                <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>
                                        {simulacro.intentos_permitidos === -1
                                            ? 'Intentos ilimitados'
                                            : `${simulacro.intentos_permitidos - simulacro.mis_intentos} intentos restantes`
                                        }
                                    </span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button className="flex-1 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                    Comenzar
                                </button>

                                {simulacro.mis_intentos > 0 && (
                                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                        Ver Historial
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {simulacros.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay simulacros disponibles</h3>
                        <p className="text-medico-gray">Este curso no tiene simulacros configurados aún</p>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default Simulacros