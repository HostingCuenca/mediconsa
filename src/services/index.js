// src/services/index.js - Exportaciones centralizadas
export { default as apiService } from './api'
export { default as authService } from './auth'
export { default as coursesService } from './courses'
export { default as enrollmentsService } from './enrollments'
export { default as simulacrosService } from './simulacros'
export { default as progressService } from './progress'
export { default as dashboardService } from './dashboard'

// Funciones legacy para compatibilidad
export const registrarUsuario = (email, password, nombreCompleto, nombreUsuario) => {
    return authService.register({ email, password, nombreCompleto, nombreUsuario })
}

export const loginUsuario = (email, password) => {
    return authService.login(email, password)
}

export const logoutUsuario = () => {
    return authService.logout()
}