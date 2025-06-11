// src/admin/AdminReports.jsx - Reportes administrativos
import React, { useState } from 'react'
import Layout from '../components/Layout'

const AdminReports = () => {
    const [selectedReport, setSelectedReport] = useState('general')

    // Mock data
    const reportesGenerales = {
        usuarios: {
            total: 245,
            activos: 198,
            nuevos_mes: 34,
            estudiantes: 210,
            instructores: 15,
            admins: 3
        },
        cursos: {
            total: 12,
            activos: 10,
            gratuitos: 4,
            precio_promedio: 159.99
        },
        inscripciones: {
            total: 567,
            habilitadas: 432,
            pendientes: 23,
            ingresos_totales: 45670.50
        },
        simulacros: {
            total_simulacros: 48,
            total_intentos: 2341,
            puntaje_promedio: 76.8
        }
    }

    const cursosPopulares = [
        { titulo: "Preparación CACES 2025", inscripciones: 125, puntaje_promedio: 78.5 },
        { titulo: "SENESYCT Becas", inscripciones: 89, puntaje_promedio: 82.1 },
        { titulo: "Medicina Rural", inscripciones: 76, puntaje_promedio: 74.3 },
        { titulo: "ENARM México", inscripciones: 54, puntaje_promedio: 71.2 }
    ]

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Reportes y Estadísticas</h1>
                    <p className="text-medico-gray mt-2">Análisis detallado de la plataforma</p>
                </div>

                {/* Report Selector */}
                <div className="mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            {[
                                { id: 'general', label: 'Reporte General' },
                                { id: 'usuarios', label: 'Análisis de Usuarios' },
                                { id: 'cursos', label: 'Rendimiento de Cursos' },
                                { id: 'ingresos', label: 'Reporte de Ingresos' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedReport(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                        selectedReport === tab.id
                                            ? 'border-medico-blue text-medico-blue'
                                            : 'border-transparent text-medico-gray hover:text-medico-blue hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* General Report */}
                {selectedReport === 'general' && (
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-medico-gray">Total Usuarios</p>
                                        <p className="text-2xl font-bold text-blue-600">{reportesGenerales.usuarios.total}</p>
                                        <p className="text-xs text-medico-gray">+{reportesGenerales.usuarios.nuevos_mes} este mes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-medico-gray">Total Cursos</p>
                                        <p className="text-2xl font-bold text-green-600">{reportesGenerales.cursos.total}</p>
                                        <p className="text-xs text-medico-gray">{reportesGenerales.cursos.activos} activos</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-medico-gray">Inscripciones</p>
                                        <p className="text-2xl font-bold text-purple-600">{reportesGenerales.inscripciones.habilitadas}</p>
                                        <p className="text-xs text-medico-gray">{reportesGenerales.inscripciones.pendientes} pendientes</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-medico-gray">Ingresos Totales</p>
                                        <p className="text-2xl font-bold text-yellow-600">${reportesGenerales.inscripciones.ingresos_totales.toFixed(2)}</p>
                                        <p className="text-xs text-medico-gray">Todos los tiempos</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Popular Courses */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-medico-blue mb-6">Cursos Más Populares</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                    <tr className="text-left text-sm text-medico-gray">
                                        <th className="pb-4">Curso</th>
                                        <th className="pb-4">Inscripciones</th>
                                        <th className="pb-4">Puntaje Promedio</th>
                                        <th className="pb-4">Rendimiento</th>
                                    </tr>
                                    </thead>
                                    <tbody className="space-y-2">
                                    {cursosPopulares.map((curso, index) => (
                                        <tr key={index} className="border-t border-gray-100">
                                            <td className="py-4 font-medium text-gray-900">{curso.titulo}</td>
                                            <td className="py-4 text-medico-gray">{curso.inscripciones}</td>
                                            <td className="py-4 text-medico-gray">{curso.puntaje_promedio}%</td>
                                            <td className="py-4">
                                                <div className="flex items-center">
                                                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                                                        <div
                                                            className="bg-medico-blue h-2 rounded-full"
                                                            style={{ width: `${(curso.puntaje_promedio / 100) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm text-medico-gray">{curso.puntaje_promedio}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other Reports - Placeholders */}
                {selectedReport !== 'general' && (
                    <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-200 text-center">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Reporte en Desarrollo</h3>
                        <p className="text-medico-gray">Este reporte estará disponible próximamente</p>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default AdminReports