// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../utils/AuthContext'
import { supabase } from '../services/supabase'

const AdminDashboard = () => {
    const { perfil } = useAuth()
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        usuariosActivos: 0,
        totalCursos: 0,
        cursosActivos: 0,
        pagosPendientes: 0,
        inscripcionesHoy: 0,
        ingresosMes: 0,
        simulacrosRealizados: 0
    })
    const [usuariosRecientes, setUsuariosRecientes] = useState([])
    const [actividadReciente, setActividadReciente] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        cargarDashboardAdmin()
    }, [])

    const cargarDashboardAdmin = async () => {
        try {
            // Estadísticas principales
            const [
                { count: totalUsuarios },
                { count: totalCursos },
                { count: cursosActivos },
                { count: pagosPendientes },
                { data: inscripcionesHoy },
                { data: usuariosRecientes },
                { count: simulacrosRealizados }
            ] = await Promise.all([
                supabase.from('perfiles_usuario').select('*', { count: 'exact', head: true }),
                supabase.from('cursos').select('*', { count: 'exact', head: true }),
                supabase.from('cursos').select('*', { count: 'exact', head: true }).eq('activo', true),
                supabase.from('inscripciones').select('*', { count: 'exact', head: true }).eq('estado_pago', 'pendiente'),
                supabase.from('inscripciones').select('*').gte('fecha_inscripcion', new Date().toISOString().split('T')[0]),
                supabase.from('perfiles_usuario').select(`
          id, nombre_completo, nombre_usuario, tipo_usuario, fecha_registro
        `).order('fecha_registro', { ascending: false }).limit(5),
                supabase.from('intentos_simulacro').select('*', { count: 'exact', head: true })
            ])

            // Usuarios activos (con inscripciones)
            const { count: usuariosActivos } = await supabase
                .from('inscripciones')
                .select('usuario_id', { count: 'exact', head: true })

            setStats({
                totalUsuarios: totalUsuarios || 0,
                usuariosActivos: usuariosActivos || 0,
                totalCursos: totalCursos || 0,
                cursosActivos: cursosActivos || 0,
                pagosPendientes: pagosPendientes || 0,
                inscripcionesHoy: inscripcionesHoy?.length || 0,
                ingresosMes: 2850, // Calcular después desde inscripciones
                simulacrosRealizados: simulacrosRealizados || 0
            })

            setUsuariosRecientes(usuariosRecientes || [])

            // Actividad reciente
            const actividadData = [
                { tipo: 'Nuevo usuario', descripcion: 'Se registró un nuevo estudiante', tiempo: '5 min', icono: 'user' },
                { tipo: 'Pago pendiente', descripción: 'Solicitud de acceso a curso CACES', tiempo: '15 min', icono: 'payment' },
                { tipo: 'Curso creado', descripción: 'Nuevo curso de Medicina Rural', tiempo: '1 hora', icono: 'course' },
                { tipo: 'Simulacro completado', descripción: '25 estudiantes realizaron simulacro', tiempo: '2 horas', icono: 'quiz' }
            ]
            setActividadReciente(actividadData)

        } catch (error) {
            console.error('Error cargando dashboard admin:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Layout isPlatform={true} showSidebar={true}>
                <div className="p-8">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-64 bg-gray-200 rounded"></div>
                            <div className="h-64 bg-gray-200 rounded"></div>
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
                        Panel de Administración
                    </h1>
                    <p className="text-medico-gray mt-2">
                        Bienvenido {perfil?.nombre_completo}, aquí está el resumen de Mediconsa
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

                    {/* Total Usuarios */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-medico-gray">Total Usuarios</p>
                                <p className="text-3xl font-bold text-medico-blue">{stats.totalUsuarios}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    <span className="font-medium">{stats.usuariosActivos}</span> activos
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Total Cursos */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-medico-gray">Total Cursos</p>
                                <p className="text-3xl font-bold text-medico-green">{stats.totalCursos}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    <span className="font-medium">{stats.cursosActivos}</span> activos
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Pagos Pendientes */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-medico-gray">Pagos Pendientes</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pagosPendientes}</p>
                                <p className="text-xs text-medico-gray mt-1">
                                    Requieren aprobación
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Simulacros */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-medico-gray">Simulacros</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.simulacrosRealizados}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    +{stats.inscripcionesHoy} hoy
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Usuarios Recientes */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-medico-blue">Usuarios Recientes</h3>
                            <button className="text-medico-blue hover:text-blue-700 text-sm font-medium">
                                Ver todos
                            </button>
                        </div>

                        <div className="space-y-4">
                            {usuariosRecientes.map((usuario) => (
                                <div key={usuario.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-medico-light transition-colors">
                                    <div className="w-10 h-10 bg-medico-blue rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {usuario.nombre_completo?.charAt(0) || 'U'}
                    </span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{usuario.nombre_completo}</h4>
                                        <p className="text-sm text-medico-gray">
                                            @{usuario.nombre_usuario} • {usuario.tipo_usuario}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-medico-gray">
                                            {new Date(usuario.fecha_registro).toLocaleDateString()}
                                        </p>
                                        <span className={`inline-block w-2 h-2 rounded-full ${
                                            usuario.tipo_usuario === 'admin' ? 'bg-red-500' :
                                                usuario.tipo_usuario === 'instructor' ? 'bg-yellow-500' : 'bg-green-500'
                                        }`}></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actividad Reciente */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-medico-blue">Actividad Reciente</h3>
                            <button className="text-medico-blue hover:text-blue-700 text-sm font-medium">
                                Ver todas
                            </button>
                        </div>

                        <div className="space-y-4">
                            {actividadReciente.map((actividad, index) => (
                                <div key={index} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-medico-light transition-colors">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                        actividad.icono === 'user' ? 'bg-blue-100' :
                                            actividad.icono === 'payment' ? 'bg-yellow-100' :
                                                actividad.icono === 'course' ? 'bg-green-100' : 'bg-purple-100'
                                    }`}>
                                        {actividad.icono === 'user' && (
                                            <svg className="w-5 h-5 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        )}
                                        {actividad.icono === 'payment' && (
                                            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                            </svg>
                                        )}
                                        {actividad.icono === 'course' && (
                                            <svg className="w-5 h-5 text-medico-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        )}
                                        {actividad.icono === 'quiz' && (
                                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{actividad.tipo}</h4>
                                        <p className="text-sm text-medico-gray">{actividad.descripcion}</p>
                                    </div>
                                    <div className="text-xs text-medico-gray">
                                        {actividad.tiempo}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-medico-blue mb-6">Acciones Rápidas</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="flex flex-col items-center p-4 rounded-lg hover:bg-medico-light transition-colors group">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-medico-blue group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <span className="mt-2 text-sm font-medium text-gray-900">Crear Curso</span>
                        </button>

                        <button className="flex flex-col items-center p-4 rounded-lg hover:bg-medico-light transition-colors group">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-medico-green group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="mt-2 text-sm font-medium text-gray-900">Nuevo Usuario</span>
                        </button>

                        <button className="flex flex-col items-center p-4 rounded-lg hover:bg-medico-light transition-colors group">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <span className="mt-2 text-sm font-medium text-gray-900">Aprobar Pagos</span>
                        </button>

                        <button className="flex flex-col items-center p-4 rounded-lg hover:bg-medico-light transition-colors group">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                            <span className="mt-2 text-sm font-medium text-gray-900">Simulacros</span>
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AdminDashboard