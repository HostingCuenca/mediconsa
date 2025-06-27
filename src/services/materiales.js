// src/services/materialServices.js
import apiService from './api'

class MaterialServices {

    // ==================== MATERIALES ====================

    // Marketplace público (sin auth)
    async getMarketplaceMaterials(filters = {}) {
        try {
            const { categoria, tipo, page = 1, limit = 12, search } = filters
            console.log('Obteniendo marketplace de materiales:', filters)

            const params = new URLSearchParams()
            if (categoria) params.append('categoria', categoria)
            if (tipo) params.append('tipo', tipo)
            if (search) params.append('search', search)
            params.append('page', page)
            params.append('limit', limit)

            const response = await apiService.get(`/materiales/marketplace?${params.toString()}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo marketplace'
            }
        } catch (error) {
            console.error('Error obteniendo marketplace:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Detalle de material (público)
    async getMaterialDetail(materialId) {
        try {
            console.log('Obteniendo detalle de material:', materialId)
            const response = await apiService.get(`/materiales/${materialId}/detail`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Material no encontrado'
            }
        } catch (error) {
            console.error('Error obteniendo detalle material:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Materiales por curso (requiere auth)
    async getMaterialesByCourse(cursoId) {
        try {
            console.log('Obteniendo materiales del curso:', cursoId)
            const response = await apiService.get(`/materiales/course/${cursoId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo materiales del curso'
            }
        } catch (error) {
            console.error('Error obteniendo materiales del curso:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Mis materiales (requiere auth)
    async getMyMaterials() {
        try {
            console.log('Obteniendo mis materiales')
            const response = await apiService.get('/materiales/my-materials')

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo mis materiales'
            }
        } catch (error) {
            console.error('Error obteniendo mis materiales:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Crear material (admin/instructor)
    async createMaterial(materialData) {
        try {
            console.log('Creando material:', materialData)

            // Validar datos requeridos
            const validation = this.validateMaterialData(materialData)
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Datos inválidos: ${validation.errors.join(', ')}`
                }
            }

            const response = await apiService.post('/materiales/create', materialData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Material creado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando material'
            }
        } catch (error) {
            console.error('Error creando material:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== CARRITO SIMBÓLICO ====================

    // Agregar al carrito
    async addToCart(materialId, cantidad = 1, sessionId) {
        try {
            console.log('Agregando al carrito:', { materialId, cantidad, sessionId })

            const cartData = { materialId, cantidad }
            if (sessionId) cartData.sessionId = sessionId

            const response = await apiService.post('/materiales/cart/add', cartData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Material agregado al carrito'
                }
            }

            return {
                success: false,
                error: response.message || 'Error agregando al carrito'
            }
        } catch (error) {
            console.error('Error agregando al carrito:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Ver carrito
    async getCart(sessionId) {
        try {
            console.log('Obteniendo carrito:', { sessionId })

            const params = sessionId ? `?sessionId=${sessionId}` : ''
            const response = await apiService.get(`/materiales/cart${params}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo carrito'
            }
        } catch (error) {
            console.error('Error obteniendo carrito:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Remover del carrito
    async removeFromCart(itemId) {
        try {
            console.log('Removiendo del carrito:', itemId)
            const response = await apiService.delete(`/materiales/cart/${itemId}`)

            if (response.success) {
                return {
                    success: true,
                    message: response.message || 'Item removido del carrito'
                }
            }

            return {
                success: false,
                error: response.message || 'Error removiendo del carrito'
            }
        } catch (error) {
            console.error('Error removiendo del carrito:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Limpiar carrito
    async clearCart(sessionId) {
        try {
            console.log('Limpiando carrito:', { sessionId })

            const params = sessionId ? `?sessionId=${sessionId}` : ''
            const response = await apiService.delete(`/materiales/cart${params}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Carrito limpiado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error limpiando carrito'
            }
        } catch (error) {
            console.error('Error limpiando carrito:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Generar link de WhatsApp
    async generateWhatsAppLink(materiales, datosUsuario) {
        try {
            console.log('Generando link de WhatsApp:', { materiales, datosUsuario })

            // Validar datos del usuario
            const validation = this.validateUserData(datosUsuario)
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Datos inválidos: ${validation.errors.join(', ')}`
                }
            }

            const response = await apiService.post('/materiales/cart/whatsapp', {
                materiales,
                datosUsuario
            })

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: 'Link de WhatsApp generado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error generando link de WhatsApp'
            }
        } catch (error) {
            console.error('Error generando link de WhatsApp:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== CLASES VIRTUALES ====================

    // Clases virtuales por curso
    async getClasesVirtualesByCourse(cursoId) {
        try {
            console.log('Obteniendo clases virtuales del curso:', cursoId)
            const response = await apiService.get(`/clases-virtuales/course/${cursoId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo clases virtuales'
            }
        } catch (error) {
            console.error('Error obteniendo clases virtuales:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Mis clases virtuales
    async getMyClasesVirtuales() {
        try {
            console.log('Obteniendo mis clases virtuales')
            const response = await apiService.get('/clases-virtuales/my-classes')

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo mis clases virtuales'
            }
        } catch (error) {
            console.error('Error obteniendo mis clases virtuales:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Detalle de clase virtual
    async getClaseVirtualDetail(claseId) {
        try {
            console.log('Obteniendo detalle de clase virtual:', claseId)
            const response = await apiService.get(`/clases-virtuales/${claseId}/detail`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Clase virtual no encontrada'
            }
        } catch (error) {
            console.error('Error obteniendo detalle de clase virtual:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Crear clase virtual
    async createClaseVirtual(claseData) {
        try {
            console.log('Creando clase virtual:', claseData)

            // Validar datos de clase virtual
            const validation = this.validateClaseVirtualData(claseData)
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Datos inválidos: ${validation.errors.join(', ')}`
                }
            }

            const response = await apiService.post('/clases-virtuales/create', claseData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Clase virtual creada exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando clase virtual'
            }
        } catch (error) {
            console.error('Error creando clase virtual:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== CANALES DE COMUNICACIÓN ====================

    // Canales por curso
    async getCanalesByCourse(cursoId) {
        try {
            console.log('Obteniendo canales del curso:', cursoId)
            const response = await apiService.get(`/canales/course/${cursoId}`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo canales'
            }
        } catch (error) {
            console.error('Error obteniendo canales:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Mis canales
    async getMyCanales() {
        try {
            console.log('Obteniendo mis canales')
            const response = await apiService.get('/canales/my-channels')

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Error obteniendo mis canales'
            }
        } catch (error) {
            console.error('Error obteniendo mis canales:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Detalle de canal
    async getCanalDetail(canalId) {
        try {
            console.log('Obteniendo detalle de canal:', canalId)
            const response = await apiService.get(`/canales/${canalId}/detail`)

            if (response.success) {
                return {
                    success: true,
                    data: response.data
                }
            }

            return {
                success: false,
                error: response.message || 'Canal no encontrado'
            }
        } catch (error) {
            console.error('Error obteniendo detalle de canal:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // Crear canal
    async createCanal(canalData) {
        try {
            console.log('Creando canal:', canalData)

            // Validar datos de canal
            const validation = this.validateCanalData(canalData)
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Datos inválidos: ${validation.errors.join(', ')}`
                }
            }

            const response = await apiService.post('/canales/create', canalData)

            if (response.success) {
                return {
                    success: true,
                    data: response.data,
                    message: response.message || 'Canal creado exitosamente'
                }
            }

            return {
                success: false,
                error: response.message || 'Error creando canal'
            }
        } catch (error) {
            console.error('Error creando canal:', error)
            return { success: false, error: error.message || 'Error de conexión' }
        }
    }

    // ==================== VALIDACIONES ====================

    validateMaterialData(materialData) {
        const errors = []
        const { titulo, archivoUrl, tipoMaterial, precio } = materialData

        if (!titulo?.trim()) {
            errors.push('El título es requerido')
        }

        if (!archivoUrl?.trim()) {
            errors.push('La URL del archivo es requerida')
        }

        if (tipoMaterial && !['curso', 'libre', 'premium'].includes(tipoMaterial)) {
            errors.push('Tipo de material inválido')
        }

        if (precio !== undefined && (isNaN(precio) || precio < 0)) {
            errors.push('El precio debe ser un número válido mayor o igual a 0')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    validateUserData(userData) {
        const errors = []
        const { nombre, email } = userData

        if (!nombre?.trim()) {
            errors.push('El nombre es requerido')
        }

        if (!email?.trim()) {
            errors.push('El email es requerido')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('El email no tiene un formato válido')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    validateClaseVirtualData(claseData) {
        const errors = []
        const { titulo, cursoId, plataforma, linkReunion, fechaProgramada } = claseData

        if (!titulo?.trim()) {
            errors.push('El título es requerido')
        }

        if (!cursoId?.trim()) {
            errors.push('El curso es requerido')
        }

        if (!plataforma?.trim()) {
            errors.push('La plataforma es requerida')
        }

        if (!linkReunion?.trim()) {
            errors.push('El link de reunión es requerido')
        }

        if (!fechaProgramada) {
            errors.push('La fecha programada es requerida')
        } else {
            const fecha = new Date(fechaProgramada)
            if (fecha < new Date()) {
                errors.push('La fecha programada debe ser futura')
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    validateCanalData(canalData) {
        const errors = []
        const { nombre, cursoId, tipoCanal, linkAcceso } = canalData

        if (!nombre?.trim()) {
            errors.push('El nombre del canal es requerido')
        }

        if (!cursoId?.trim()) {
            errors.push('El curso es requerido')
        }

        if (!tipoCanal?.trim()) {
            errors.push('El tipo de canal es requerido')
        } else if (!['whatsapp', 'telegram', 'discord', 'slack'].includes(tipoCanal)) {
            errors.push('Tipo de canal inválido')
        }

        if (!linkAcceso?.trim()) {
            errors.push('El link de acceso es requerido')
        }

        return {
            isValid: errors.length === 0,
            errors
        }
    }

    // ==================== UTILIDADES ====================

    // Generar sessionId único para carrito
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    }

    // Formatear precio
    formatPrice(price) {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    // Formatear fecha
    formatDate(date) {
        return new Date(date).toLocaleString('es-EC', {
            timeZone: 'America/Guayaquil',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }
}

// Exportar instancia única
const materialServices = new MaterialServices()
export default materialServices

// También exportar la clase para casos específicos
export { MaterialServices }