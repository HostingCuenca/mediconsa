// src/services/index.js - ESTANDARIZADO
import apiService from './api'
import authService from './auth'
import dashboardService from './dashboard'
import coursesService from './courses'
import courseManagementService from './courseManagement'
import enrollmentsService from './enrollments'
import progressService from './progress'
import simulacrosService from './simulacros'
import userManagementService from './userManagement'
import reportsService from './reports'

export {
    apiService,
    authService,
    dashboardService,
    coursesService,
    courseManagementService,
    enrollmentsService,
    progressService,
    simulacrosService,
    userManagementService,
    reportsService
}

// También exports default para compatibilidad
export default {
    api: apiService,
    auth: authService,
    dashboard: dashboardService,
    courses: coursesService,
    courseManagement: courseManagementService,
    enrollments: enrollmentsService,
    progress: progressService,
    simulacros: simulacrosService,
    userManagement: userManagementService,
    reports: reportsService
}