// // src/services/dashboard.js - Servicio de dashboard refactorizado para Node.js Backend
// import apiService from './api'
//
// class DashboardService {
//
//     // =============================================
//     // DASHBOARD ESTUDIANTE
//     // =============================================
//     async getStudentDashboard() {
//         try {
//             const response = await apiService.get('/dashboard/student')
//
//             return {
//                 success: true,
//                 data: response.data || response,
//                 estadisticas: response.data?.estadisticas || response.estadisticas || {},
//                 cursosRecientes: response.data?.cursosRecientes || response.cursosRecientes || [],
//                 actividadReciente: response.data?.actividadReciente || response.actividadReciente || []
//             }
//         } catch (error) {
//             return {
//                 success: false,
//                 error: error.message,
//                 estadisticas: {},
//                 cursosRecientes: [],
//                 actividadReciente: []
//             }
//         }
//     }
//
//     // =============================================
//     // DASHBOARD ADMIN
//     // =============================================
//     async getAdminDashboard() {
//         try {
//             const response = await apiService.get('/dashboard/admin')
//
//             return {
//                 success: true,
//                 data: response.data || response,
//                 estadisticas: response.data?.estadisticas || response.estadisticas || {},
//                 usuariosRecientes: response.data?.usuariosRecientes || response.usuariosRecientes || [],
//                 pagosPendientes: response.data?.pagosPendientes || response.pagosPendientes || []
//             }
//         } catch (error) {
//             return {
//                 success: false,
//                 error: error.message,
//                 estadisticas: {},
//                 usuariosRecientes: [],
//                 pagosPendientes: []
//             }
//         }
//     }
//
//     // =============================================
//     // FORMATEAR ESTADÍSTICAS ESTUDIANTE
//     // =============================================
//     formatStudentStats(estadisticas) {
//         return {
//             cursosInscritos: estadisticas.cursos_inscritos || 0,
//             clasesCompletadas: estadisticas.clases_completadas || 0,
//             simulacrosRealizados: estadisticas.simulacros_realizados || 0,
//             progresoPromedio: Math.round(estadisticas.promedio_simulacros || 0)
//         }
//     }
//
//     // =============================================
//     // FORMATEAR ESTADÍSTICAS ADMIN
//     // =============================================
//     formatAdminStats(estadisticas) {
//         return {
//             totalUsuarios: estadisticas.total_usuarios || 0,
//             totalEstudiantes: estadisticas.total_estudiantes || 0,
//             totalCursos: estadisticas.total_cursos || 0,
//             pagosPendientes: estadisticas.pagos_pendientes || 0,
//             inscripcionesActivas: estadisticas.inscripciones_activas || 0
//         }
//     }
//
//     // =============================================
//     // FORMATEAR ACTIVIDAD RECIENTE
//     // =============================================
//     formatRecentActivity(actividad) {
//         return actividad.map(item => ({
//             tipo: item.tipo,
//             titulo: item.titulo,
//             cursoTitulo: item.curso_titulo,
//             fecha: new Date(item.fecha),
//             fechaFormateada: this.formatDate(item.fecha),
//             icono: this.getActivityIcon(item.tipo)
//         }))
//     }
//
//     // =============================================
//     // HELPER: OBTENER ICONO DE ACTIVIDAD
//     // =============================================
//     getActivityIcon(tipo) {
//         const iconos = {
//             'clase': '📚',
//             'simulacro': '🧪',
//             'curso': '🎓',
//             'inscripcion': '✅'
//         }
//         return iconos[tipo] || '📋'
//     }
//
//     // =============================================
//     // HELPER: FORMATEAR FECHA
//     // =============================================
//     formatDate(fecha) {
//         const date = new Date(fecha)
//         const ahora = new Date()
//         const diferencia = ahora - date
//
//         const minutos = Math.floor(diferencia / (1000 * 60))
//         const horas = Math.floor(diferencia / (1000 * 60 * 60))
//         const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
//
//         if (minutos < 1) return 'Hace un momento'
//         if (minutos < 60) return `Hace ${minutos} minutos`
//         if (horas < 24) return `Hace ${horas} horas`
//         if (dias < 7) return `Hace ${dias} días`
//
//         return date.toLocaleDateString('es-ES', {
//             day: 'numeric',
//             month: 'short',
//             year: 'numeric'
//         })
//     }
//
//     // =============================================
//     // HELPER: OBTENER SALUDO PERSONALIZADO
//     // =============================================
//     getPersonalizedGreeting(nombreCompleto) {
//         const hora = new Date().getHours()
//         let saludo = 'Hola'
//
//         if (hora >= 5 && hora < 12) {
//             saludo = 'Buenos días'
//         } else if (hora >= 12 && hora < 18) {
//             saludo = 'Buenas tardes'
//         } else {
//             saludo = 'Buenas noches'
//         }
//
//         const nombre = nombreCompleto ? nombreCompleto.split(' ')[0] : 'estudiante'
//         return `${saludo}, ${nombre}!`
//     }
//
//     // =============================================
//     // HELPER: GENERAR MENSAJE MOTIVACIONAL
//     // =============================================
//     getMotivationalMessage(progreso) {
//         const porcentaje = progreso.progresoPromedio || 0
//
//         if (porcentaje >= 90) {
//             return '🎉 ¡Excelente trabajo! Estás dominando el material.'
//         } else if (porcentaje >= 70) {
//             return '💪 ¡Muy bien! Mantén ese ritmo constante.'
//         } else if (porcentaje >= 50) {
//             return '📈 Buen avance. ¡Sigue practicando!'
//         } else if (porcentaje > 0) {
//             return '🌱 Primer paso dado. ¡Cada día cuenta!'
//         } else {
//             return '🚀 ¡Es hora de comenzar tu preparación!'
//         }
//     }
//
//     // =============================================
//     // FUNCIONES LEGACY (para compatibilidad)
//     // =============================================
//     async obtenerDashboardEstudiante() {
//         return await this.getStudentDashboard()
//     }
//
//     async obtenerDashboardAdmin() {
//         return await this.getAdminDashboard()
//     }
// }
//
// export default new DashboardService


// src/services/dashboard.js - CORREGIDO COMPLETAMENTE
import apiService from './api'

class DashboardService {

    // =============================================
    // DASHBOARD ADMIN - CORREGIDO
    // =============================================
    async getAdminDashboard() {
        try {
            console.log('Llamando a dashboard admin...')
            const response = await apiService.get('/dashboard/admin')
            console.log('Respuesta dashboard admin:', response)

            if (response.success && response.data) {
                // Normalizar datos del backend
                const normalizedData = {
                    estadisticas: {
                        totalUsuarios: parseInt(response.data.estadisticas.total_usuarios) || 0,
                        totalEstudiantes: parseInt(response.data.estadisticas.total_estudiantes) || 0,
                        totalCursos: parseInt(response.data.estadisticas.total_cursos) || 0,
                        pagosPendientes: parseInt(response.data.estadisticas.pagos_pendientes) || 0,
                        inscripcionesActivas: parseInt(response.data.estadisticas.inscripciones_activas) || 0
                    },
                    usuariosRecientes: response.data.usuariosRecientes.map(user => ({
                        id: user.id,
                        email: user.email,
                        nombreCompleto: user.nombre_completo,
                        tipoUsuario: user.tipo_usuario,
                        fechaRegistro: user.fecha_registro
                    })),
                    pagosPendientes: response.data.pagosPendientes || []
                }

                return {
                    success: true,
                    data: normalizedData
                }
            }

            return {
                success: false,
                error: 'Respuesta inválida del servidor'
            }

        } catch (error) {
            console.error('Error en getAdminDashboard:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión con el servidor'
            }
        }
    }

    // =============================================
    // DASHBOARD ESTUDIANTE - CORREGIDO
    // =============================================
    // async getStudentDashboard() {
    //     try {
    //         console.log('Llamando a dashboard estudiante...')
    //         const response = await apiService.get('/dashboard/student')
    //         console.log('Respuesta dashboard estudiante:', response)
    //
    //         if (response.success && response.data) {
    //             const normalizedData = {
    //                 estadisticas: {
    //                     cursosInscritos: parseInt(response.data.estadisticas.cursos_inscritos) || 0,
    //                     clasesCompletadas: parseInt(response.data.estadisticas.clases_completadas) || 0,
    //                     simulacrosRealizados: parseInt(response.data.estadisticas.simulacros_realizados) || 0,
    //                     progresoPromedio: Math.round(response.data.estadisticas.promedio_simulacros || 0)
    //                 },
    //                 cursosRecientes: response.data.cursosRecientes || [],
    //                 actividadReciente: response.data.actividadReciente || []
    //             }
    //
    //             return {
    //                 success: true,
    //                 data: normalizedData
    //             }
    //         }
    //
    //         return {
    //             success: false,
    //             error: 'Respuesta inválida del servidor'
    //         }
    //
    //     } catch (error) {
    //         console.error('Error en getStudentDashboard:', error)
    //         return {
    //             success: false,
    //             error: error.message || 'Error de conexión con el servidor'
    //         }
    //     }
    // }

    async getStudentDashboard() {
        try {
            const response = await apiService.get('/dashboard')

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error cargando dashboard'
            }
        } catch (error) {
            console.error('Error dashboard:', error)
            return {
                success: false,
                error: error.message || 'Error de conexión'
            }
        }
    }

    // =============================================
    // HELPER: FORMATEAR FECHA
    // =============================================
    formatDate(fecha) {
        const date = new Date(fecha)
        const ahora = new Date()
        const diferencia = ahora - date

        const minutos = Math.floor(diferencia / (1000 * 60))
        const horas = Math.floor(diferencia / (1000 * 60 * 60))
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

        if (minutos < 1) return 'Hace un momento'
        if (minutos < 60) return `Hace ${minutos} minutos`
        if (horas < 24) return `Hace ${horas} horas`
        if (dias < 7) return `Hace ${dias} días`

        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    // =============================================
    // HELPER: SALUDO PERSONALIZADO
    // =============================================
    getPersonalizedGreeting(nombreCompleto) {
        const hora = new Date().getHours()
        let saludo = 'Hola'

        if (hora >= 5 && hora < 12) {
            saludo = 'Buenos días'
        } else if (hora >= 12 && hora < 18) {
            saludo = 'Buenas tardes'
        } else {
            saludo = 'Buenas noches'
        }

        const nombre = nombreCompleto ? nombreCompleto.split(' ')[0] : 'usuario'
        return `${saludo}, ${nombre}!`
    }

    // =============================================
    // HELPER: MENSAJE MOTIVACIONAL
    // =============================================
    getMotivationalMessage(progreso) {
        const porcentaje = progreso.progresoPromedio || 0

        if (porcentaje >= 90) {
            return '🎉 ¡Excelente trabajo! Estás dominando el material.'
        } else if (porcentaje >= 70) {
            return '💪 ¡Muy bien! Mantén ese ritmo constante.'
        } else if (porcentaje >= 50) {
            return '📈 Buen avance. ¡Sigue practicando!'
        } else if (porcentaje > 0) {
            return '🌱 Primer paso dado. ¡Cada día cuenta!'
        } else {
            return '🚀 ¡Es hora de comenzar tu preparación!'
        }
    }

    // =============================================
    // MÉTODOS LEGACY (compatibilidad)
    // =============================================
    async obtenerDashboardEstudiante() {
        return await this.getStudentDashboard()
    }

    async obtenerDashboardAdmin() {
        return await this.getAdminDashboard()
    }
}

const dashboardService = new DashboardService()
export default dashboardService