// // src/services/userManagement.js - COMPLETO AL 100%
// import apiService from './api'
//
// class UserManagementService {
//
//     // ==================== USUARIOS ====================
//     async getAllUsers(filters = {}) {
//         try {
//             console.log('Obteniendo usuarios con filtros:', filters)
//             const response = await apiService.get('/admin/users', filters)
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         usuarios: response.data.usuarios || [],
//                         total: response.data.total || 0,
//                         pagination: response.data.pagination || {}
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudieron cargar los usuarios' }
//         } catch (error) {
//             console.error('Error obteniendo usuarios:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async getUserById(userId) {
//         try {
//             console.log('Obteniendo usuario por ID:', userId)
//             const response = await apiService.get(`/admin/users/${userId}`)
//
//             if (response.success && response.data) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'Usuario no encontrado' }
//         } catch (error) {
//             console.error('Error obteniendo usuario:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async updateUserRole(userId, newRole) {
//         try {
//             console.log('Actualizando rol de usuario:', userId, newRole)
//             const response = await apiService.patch(`/admin/users/${userId}/role`, {
//                 tipoUsuario: newRole
//             })
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudo actualizar el rol' }
//         } catch (error) {
//             console.error('Error actualizando rol:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async toggleUserStatus(userId, active) {
//         try {
//             console.log('Cambiando estado de usuario:', userId, active)
//             const response = await apiService.patch(`/admin/users/${userId}/status`, {
//                 activo: active
//             })
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudo cambiar el estado' }
//         } catch (error) {
//             console.error('Error cambiando estado:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async deleteUser(userId) {
//         try {
//             console.log('Eliminando usuario:', userId)
//             const response = await apiService.delete(`/admin/users/${userId}`)
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudo eliminar el usuario' }
//         } catch (error) {
//             console.error('Error eliminando usuario:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async createUser(userData) {
//         try {
//             console.log('Creando usuario:', userData)
//             const response = await apiService.post('/admin/users', userData)
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudo crear el usuario' }
//         } catch (error) {
//             console.error('Error creando usuario:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async updateUser(userId, userData) {
//         try {
//             console.log('Actualizando usuario:', userId, userData)
//             const response = await apiService.patch(`/admin/users/${userId}`, userData)
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudo actualizar el usuario' }
//         } catch (error) {
//             console.error('Error actualizando usuario:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== INSCRIPCIONES DE USUARIO ====================
//     async getUserEnrollments(userId) {
//         try {
//             console.log('Obteniendo inscripciones de usuario:', userId)
//             const response = await apiService.get(`/admin/users/${userId}/enrollments`)
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudieron cargar las inscripciones' }
//         } catch (error) {
//             console.error('Error obteniendo inscripciones:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async getUserProgress(userId) {
//         try {
//             console.log('Obteniendo progreso de usuario:', userId)
//             const response = await apiService.get(`/admin/users/${userId}/progress`)
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudo cargar el progreso' }
//         } catch (error) {
//             console.error('Error obteniendo progreso:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async getUserSimulacros(userId) {
//         try {
//             console.log('Obteniendo simulacros de usuario:', userId)
//             const response = await apiService.get(`/admin/users/${userId}/simulacros`)
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudieron cargar los simulacros' }
//         } catch (error) {
//             console.error('Error obteniendo simulacros:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== BÚSQUEDA Y FILTROS ====================
//     async searchUsers(query, filters = {}) {
//         try {
//             console.log('Buscando usuarios:', query, filters)
//             const response = await apiService.get('/admin/users/search', {
//                 q: query,
//                 ...filters
//             })
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'Error en la búsqueda' }
//         } catch (error) {
//             console.error('Error buscando usuarios:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async getUsersByRole(role) {
//         try {
//             console.log('Obteniendo usuarios por rol:', role)
//             const response = await apiService.get(`/admin/users/by-role/${role}`)
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudieron cargar los usuarios' }
//         } catch (error) {
//             console.error('Error obteniendo usuarios por rol:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async getInactiveUsers() {
//         try {
//             console.log('Obteniendo usuarios inactivos')
//             const response = await apiService.get('/admin/users/inactive')
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudieron cargar usuarios inactivos' }
//         } catch (error) {
//             console.error('Error obteniendo usuarios inactivos:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== ESTADÍSTICAS ====================
//     async getUserStats() {
//         try {
//             console.log('Obteniendo estadísticas de usuarios')
//             const response = await apiService.get('/admin/users/stats')
//
//             if (response.success && response.data) {
//                 return {
//                     success: true,
//                     data: {
//                         totalUsuarios: response.data.total_usuarios || 0,
//                         estudiantes: response.data.estudiantes || 0,
//                         instructores: response.data.instructores || 0,
//                         admins: response.data.admins || 0,
//                         activos: response.data.activos || 0,
//                         inactivos: response.data.inactivos || 0,
//                         registrosRecientes: response.data.registros_recientes || []
//                     }
//                 }
//             }
//
//             return { success: false, error: 'No se pudieron cargar las estadísticas' }
//         } catch (error) {
//             console.error('Error obteniendo estadísticas:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== VALIDACIONES ====================
//     validateUserData(userData) {
//         const errors = {}
//
//         if (!userData.email?.trim()) {
//             errors.email = 'El email es requerido'
//         } else if (!this.isValidEmail(userData.email)) {
//             errors.email = 'El email no es válido'
//         }
//
//         if (!userData.nombreCompleto?.trim()) {
//             errors.nombreCompleto = 'El nombre completo es requerido'
//         }
//
//         if (!userData.nombreUsuario?.trim()) {
//             errors.nombreUsuario = 'El nombre de usuario es requerido'
//         } else if (!this.isValidUsername(userData.nombreUsuario)) {
//             errors.nombreUsuario = 'El nombre de usuario solo puede contener letras, números, puntos y guiones'
//         }
//
//         if (userData.password && userData.password.length < 6) {
//             errors.password = 'La contraseña debe tener al menos 6 caracteres'
//         }
//
//         if (!userData.tipoUsuario) {
//             errors.tipoUsuario = 'El tipo de usuario es requerido'
//         } else if (!this.isValidRole(userData.tipoUsuario)) {
//             errors.tipoUsuario = 'Tipo de usuario inválido'
//         }
//
//         return {
//             isValid: Object.keys(errors).length === 0,
//             errors
//         }
//     }
//
//     isValidEmail(email) {
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//         return emailRegex.test(email)
//     }
//
//     isValidUsername(username) {
//         const usernameRegex = /^[a-zA-Z0-9._-]+$/
//         return usernameRegex.test(username)
//     }
//
//     isValidRole(role) {
//         const validRoles = ['admin', 'instructor', 'estudiante']
//         return validRoles.includes(role)
//     }
//
//     // ==================== EXPORTAR/IMPORTAR ====================
//     async exportUsers(format = 'csv', filters = {}) {
//         try {
//             console.log('Exportando usuarios:', format, filters)
//             const response = await apiService.get('/admin/users/export', {
//                 format,
//                 ...filters
//             })
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'Error al exportar usuarios' }
//         } catch (error) {
//             console.error('Error exportando usuarios:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async importUsers(file) {
//         try {
//             console.log('Importando usuarios desde archivo')
//             const formData = new FormData()
//             formData.append('file', file)
//
//             const response = await apiService.post('/admin/users/import', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 }
//             })
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'Error al importar usuarios' }
//         } catch (error) {
//             console.error('Error importando usuarios:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     // ==================== HELPERS ====================
//     getRoleLabel(role) {
//         const labels = {
//             'admin': 'Administrador',
//             'instructor': 'Instructor',
//             'estudiante': 'Estudiante'
//         }
//         return labels[role] || role
//     }
//
//     getRoleColor(role) {
//         const colors = {
//             'admin': 'bg-red-100 text-red-800',
//             'instructor': 'bg-blue-100 text-blue-800',
//             'estudiante': 'bg-green-100 text-green-800'
//         }
//         return colors[role] || 'bg-gray-100 text-gray-800'
//     }
//
//     formatUserForDisplay(user) {
//         return {
//             ...user,
//             nombreCompleto: user.nombre_completo || user.nombreCompleto,
//             nombreUsuario: user.nombre_usuario || user.nombreUsuario,
//             tipoUsuario: user.tipo_usuario || user.tipoUsuario,
//             fechaRegistro: user.fecha_registro || user.fechaRegistro,
//             fechaUltimoAcceso: user.fecha_ultimo_acceso || user.fechaUltimoAcceso,
//             roleLabel: this.getRoleLabel(user.tipo_usuario || user.tipoUsuario),
//             roleColor: this.getRoleColor(user.tipo_usuario || user.tipoUsuario)
//         }
//     }
//
//     // ==================== COMUNICACIÓN ====================
//     async sendNotificationToUser(userId, notification) {
//         try {
//             console.log('Enviando notificación a usuario:', userId, notification)
//             const response = await apiService.post(`/admin/users/${userId}/notify`, notification)
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudo enviar la notificación' }
//         } catch (error) {
//             console.error('Error enviando notificación:', error)
//             return { success: false, error: error.message }
//         }
//     }
//
//     async sendBulkNotification(userIds, notification) {
//         try {
//             console.log('Enviando notificación masiva:', userIds.length, notification)
//             const response = await apiService.post('/admin/users/notify/bulk', {
//                 userIds,
//                 notification
//             })
//
//             if (response.success) {
//                 return { success: true, data: response.data }
//             }
//
//             return { success: false, error: 'No se pudo enviar las notificaciones' }
//         } catch (error) {
//             console.error('Error enviando notificaciones:', error)
//             return { success: false, error: error.message }
//         }
//     }
// }
//
// export default new UserManagementService()


// ============================================
// src/services/userManagement.js - CORREGIDO Y SIMPLIFICADO
// ============================================
import apiService from './api'

class UserManagementService {

    // ==================== USUARIOS BÁSICOS ====================
    async getAllUsers(filters = {}) {
        try {
            console.log('Obteniendo usuarios con filtros:', filters)
            const response = await apiService.get('/users', filters) // CORREGIDO: /admin/users -> /users

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        usuarios: response.data.usuarios || [],
                        pagination: response.data.pagination || {}
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar los usuarios' }
        } catch (error) {
            console.error('Error obteniendo usuarios:', error)
            return { success: false, error: error.message }
        }
    }

    async getUserById(userId) {
        try {
            console.log('Obteniendo usuario por ID:', userId)
            const response = await apiService.get(`/users/${userId}`) // CORREGIDO: /admin/users -> /users

            if (response.success && response.data) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'Usuario no encontrado' }
        } catch (error) {
            console.error('Error obteniendo usuario:', error)
            return { success: false, error: error.message }
        }
    }

    async createUser(userData) {
        try {
            console.log('Creando usuario:', userData)
            const response = await apiService.post('/users', userData) // CORREGIDO: /admin/users -> /users

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo crear el usuario' }
        } catch (error) {
            console.error('Error creando usuario:', error)
            return { success: false, error: error.message }
        }
    }

    async updateUser(userId, userData) {
        try {
            console.log('Actualizando usuario:', userId, userData)
            const response = await apiService.patch(`/users/${userId}`, userData) // CORREGIDO: PUT -> PATCH

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo actualizar el usuario' }
        } catch (error) {
            console.error('Error actualizando usuario:', error)
            return { success: false, error: error.message }
        }
    }

    async updateUserRole(userId, newRole) {
        try {
            console.log('Actualizando rol de usuario:', userId, newRole)
            const response = await apiService.patch(`/users/${userId}/role`, {
                tipoUsuario: newRole
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo actualizar el rol' }
        } catch (error) {
            console.error('Error actualizando rol:', error)
            return { success: false, error: error.message }
        }
    }

    async toggleUserStatus(userId, active) {
        try {
            console.log('Cambiando estado de usuario:', userId, active)
            const response = await apiService.patch(`/users/${userId}/status`, {
                activo: active
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo cambiar el estado' }
        } catch (error) {
            console.error('Error cambiando estado:', error)
            return { success: false, error: error.message }
        }
    }

    async deleteUser(userId) {
        try {
            console.log('Eliminando usuario:', userId)
            const response = await apiService.delete(`/users/${userId}`)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo eliminar el usuario' }
        } catch (error) {
            console.error('Error eliminando usuario:', error)
            return { success: false, error: error.message }
        }
    }

    async resetUserPassword(userId, newPassword) {
        try {
            console.log('Reseteando contraseña de usuario:', userId)
            const response = await apiService.patch(`/users/${userId}/reset-password`, { // CORREGIDO: /password -> /reset-password
                newPassword
            })

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo resetear la contraseña' }
        } catch (error) {
            console.error('Error reseteando contraseña:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== ESTADÍSTICAS ====================
    async getUserStats() {
        try {
            console.log('Obteniendo estadísticas de usuarios')
            const response = await apiService.get('/users/stats')

            if (response.success && response.data) {
                return {
                    success: true,
                    data: {
                        usuarios: response.data.usuarios || {},
                        inscripciones: response.data.inscripciones || {}
                    }
                }
            }

            return { success: false, error: 'No se pudieron cargar las estadísticas' }
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error)
            return { success: false, error: error.message }
        }
    }

    async getUserProgress(userId) {
        try {
            console.log('Obteniendo progreso de usuario:', userId)
            const response = await apiService.get(`/users/${userId}/progress`)

            if (response.success) {
                return { success: true, data: response.data }
            }

            return { success: false, error: 'No se pudo cargar el progreso' }
        } catch (error) {
            console.error('Error obteniendo progreso:', error)
            return { success: false, error: error.message }
        }
    }

    // ==================== VALIDACIONES ====================
    validateUserData(userData) {
        const errors = {}

        if (!userData.email?.trim()) {
            errors.email = 'El email es requerido'
        } else if (!this.isValidEmail(userData.email)) {
            errors.email = 'El email no es válido'
        }

        if (!userData.nombre_completo?.trim()) {
            errors.nombre_completo = 'El nombre completo es requerido'
        }

        if (!userData.nombre_usuario?.trim()) {
            errors.nombre_usuario = 'El nombre de usuario es requerido'
        } else if (!this.isValidUsername(userData.nombre_usuario)) {
            errors.nombre_usuario = 'El nombre de usuario solo puede contener letras, números, puntos y guiones'
        }

        if (userData.password && userData.password.length < 6) {
            errors.password = 'La contraseña debe tener al menos 6 caracteres'
        }

        if (!userData.tipo_usuario) {
            errors.tipo_usuario = 'El tipo de usuario es requerido'
        } else if (!this.isValidRole(userData.tipo_usuario)) {
            errors.tipo_usuario = 'Tipo de usuario inválido'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9._-]+$/
        return usernameRegex.test(username)
    }

    isValidRole(role) {
        const validRoles = ['admin', 'instructor', 'estudiante']
        return validRoles.includes(role)
    }

    // ==================== HELPERS ====================
    getRoleLabel(role) {
        const labels = {
            'admin': 'Administrador',
            'instructor': 'Instructor',
            'estudiante': 'Estudiante'
        }
        return labels[role] || role
    }

    getRoleColor(role) {
        const colors = {
            'admin': 'bg-red-100 text-red-800',
            'instructor': 'bg-blue-100 text-blue-800',
            'estudiante': 'bg-green-100 text-green-800'
        }
        return colors[role] || 'bg-gray-100 text-gray-800'
    }

    formatUserForDisplay(user) {
        return {
            ...user,
            roleLabel: this.getRoleLabel(user.tipo_usuario),
            roleColor: this.getRoleColor(user.tipo_usuario)
        }
    }

    // ==================== MÉTODOS LEGACY SIMPLIFICADOS ====================

    // Usar el filtro general en lugar de endpoints específicos
    async searchUsers(query, filters = {}) {
        return await this.getAllUsers({ search: query, ...filters })
    }

    async getUsersByRole(role) {
        return await this.getAllUsers({ tipo: role })
    }

    async getInactiveUsers() {
        return await this.getAllUsers({ activo: false })
    }

    // ELIMINADOS: métodos que NO existen en el backend
    // - getUserEnrollments (usar getUserById que ya incluye esta info)
    // - getUserSimulacros (implementar solo si es crítico)
    // - exportUsers (implementar solo si es crítico)
    // - importUsers (implementar solo si es crítico)
    // - sendNotificationToUser (implementar solo si es crítico)
    // - sendBulkNotification (implementar solo si es crítico)
}

export default new UserManagementService()