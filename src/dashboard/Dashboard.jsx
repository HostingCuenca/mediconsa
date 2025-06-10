// src/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../services/supabase'

const Dashboard = () => {
    const { perfil } = useAuth()
    const [stats, setStats] = useState({
        cursosInscritos: 0,
        cursosCompletados: 0,
        simulacrosRealizados: 0,
        progresoPromedio: 0
    })
    const [cursosRecientes, setCursosRecientes] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        cargarDashboard()
    }, [])

    const cargarDashboard = async () => {
        try {
            // Cargar estadísticas básicas del estudiante
            const { data: inscripciones } = await supabase
                .from('inscripciones')
                .select(`
          *,
          cursos (
            id,
            titulo,
            miniatura_url
          )
        `)
                .eq('usuario_id', perfil?.id)
                .eq('estado_pago', 'habilitado')

            const { data: intentos } = await supabase
                .from('intentos_simulacro')
                .select('*')
                .eq('usuario_id', perfil?.id)

            setStats({
                cursosInscritos: inscripciones?.length || 0,
                cursosCompletados: 0, // Calcular después
                simulacrosRealizados: intentos?.length || 0,
                progresoPromedio: 75 // Calcular después
            })

            setCursosRecientes(inscripciones?.slice(0, 3) || [])
        } catch (error) {
            console.error('Error cargando dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Layout isPlatform={true} showSidebar={true}>
                <div className="p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-24 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout isPlatform={true} showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">
                        ¡Bienvenido, {perfil?.nombre_completo}!
                    </h1>
                    <p className="text-medico-gray mt-2">
                        Aquí tienes un resumen de tu progreso en Mediconsa
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Cursos Inscritos</p>
                                <p className="text-2xl font-bold text-medico-blue">{stats.cursosInscritos}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Completados</p>
                                <p className="text-2xl font-bold text-medico-green">{stats.cursosCompletados}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Simulacros</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.simulacrosRealizados}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Progreso</p>
                                <p className="text-2xl font-bold text-yellow-600">{stats.progresoPromedio}%</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cursos Recientes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-medico-blue mb-4">Mis Cursos Recientes</h3>
                        {cursosRecientes.length > 0 ? (
                            <div className="space-y-4">
                                {cursosRecientes.map((inscripcion) => (
                                    <div key={inscripcion.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-medico-light transition-colors">
                                        <img
                                            src={inscripcion.cursos?.miniatura_url || 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=60&h=60&fit=crop'}
                                            alt={inscripcion.cursos?.titulo}
                                            className="w-12 h-12 rounded-lg object-cover"
                                        />
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{inscripcion.cursos?.titulo}</h4>
                                            <p className="text-sm text-medico-gray">Inscrito el {new Date(inscripcion.fecha_inscripcion).toLocaleDateString()}</p>
                                        </div>
                                        <button className="text-medico-blue hover:text-blue-700 text-sm font-medium">
                                            Continuar
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                                <p className="text-medico-gray">No tienes cursos inscritos aún</p>
                                <button className="mt-4 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Explorar Cursos
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-medico-blue mb-4">Acciones Rápidas</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-medico-light transition-colors text-left">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Explorar Cursos</p>
                                    <p className="text-sm text-medico-gray">Encuentra nuevos cursos</p>
                                </div>
                            </button>

                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-medico-light transition-colors text-left">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Hacer Simulacro</p>
                                    <p className="text-sm text-medico-gray">Practica con exámenes</p>
                                </div>
                            </button>

                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-medico-light transition-colors text-left">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-medico-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Mi Perfil</p>
                                    <p className="text-sm text-medico-gray">Actualizar información</p>
                                </div>
                            </button>

                            <a
                                href="https://wa.me/59398503606?text=Hola, necesito ayuda con mi cuenta de Mediconsa"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-medico-light transition-colors text-left"
                            >
                                <div className="w-10 h-10 bg-medico-green rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">Soporte WhatsApp</p>
                                    <p className="text-sm text-medico-gray">Obtén ayuda inmediata</p>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Dashboard