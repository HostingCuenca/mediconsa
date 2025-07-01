// src/utils/AuthContext.jsx - Con debug adicional para encontrar el problema
import React, { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/auth'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [perfil, setPerfil] = useState(null)
    const [loading, setLoading] = useState(true)

    // =============================================
    // CARGAR SESIÓN INICIAL
    // =============================================
    useEffect(() => {
        const cargarSesionInicial = async () => {
            try {
                // Verificar si hay token en localStorage
                const token = authService.getToken()
                const storedUser = authService.getUser()

                // console.log('🔍 Sesión inicial:', { hasToken: !!token, storedUser })

                if (token && storedUser) {
                    // console.log('Token encontrado, verificando con backend...')

                    // Verificar token con el backend
                    const { success, data } = await authService.getProfile()

                    if (success && data?.user) {
                        // console.log('✅ Usuario autenticado desde backend:', data.user)
                        setUser({ id: data.user.id, email: data.user.email })
                        setPerfil(data.user)
                    } else {
                        // console.log('❌ Token inválido, limpiando sesión')
                        authService.logout()
                    }
                } else {
                    // console.log('ℹ️ No hay sesión previa')
                }
            } catch (error) {
                // console.error('💥 Error cargando sesión:', error)
                authService.logout()
            } finally {
                setLoading(false)
            }
        }

        cargarSesionInicial()
    }, [])

    // =============================================
    // FUNCIÓN MANUAL DE ACTUALIZACIÓN AUTH
    // =============================================
    const updateAuthState = async () => {
        try {
            const token = authService.getToken()
            const storedUser = authService.getUser()

            // console.log('🔄 Actualizando auth state:', { hasToken: !!token, storedUser })

            if (token && storedUser) {
                setUser({ id: storedUser.id, email: storedUser.email })
                setPerfil(storedUser)
                // console.log('✅ Auth state actualizado:', storedUser.email)
                // console.log('🎯 Perfil completo:', storedUser)
            } else {
                setUser(null)
                setPerfil(null)
                // console.log('🧹 Auth state limpiado')
            }
        } catch (error) {
            // console.error('💥 Error actualizando auth state:', error)
            setUser(null)
            setPerfil(null)
        }
    }

    // =============================================
    // LISTENER PARA CAMBIOS DE LOGIN/LOGOUT
    // =============================================
    useEffect(() => {
        // Escuchar cambios en localStorage (para logout desde otra pestaña)
        const handleStorageChange = (e) => {
            if (e.key === 'mediconsa_token' || e.key === 'mediconsa_user') {
                // console.log('📢 Cambio detectado en localStorage')
                updateAuthState()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    // =============================================
    // CARGAR PERFIL (Compatible con código existente)
    // =============================================
    const cargarPerfil = async (userId) => {
        try {
            const { success, data } = await authService.getProfile()
            if (success && data?.user) {
                setPerfil(data.user)
                // console.log('🎯 Perfil cargado:', data.user)
                return { success: true, perfil: data.user }
            }
            return { success: false }
        } catch (error) {
            // console.error('💥 Error cargando perfil:', error)
            return { success: false }
        }
    }

    // =============================================
    // FUNCIONES HELPER CON DEBUG
    // =============================================
    const isAuthenticated = !!user && !!authService.getToken()
    const isAdmin = perfil?.tipoUsuario === 'admin'
    const isInstructor = perfil?.tipoUsuario === 'instructor'
    const isEstudiante = perfil?.tipoUsuario === 'estudiante'

    // Debug de estados
    console.log('🏷️ Estados Auth:', {
        isAuthenticated,
        isAdmin,
        isInstructor,
        isEstudiante,
        userEmail: user?.email,
        perfilTipo: perfil?.tipoUsuario
    })

    // =============================================
    // FUNCIONES DE AUTH ACTIONS
    // =============================================
    const login = async (email, password) => {
        // console.log('🚀 Intentando login:', email)
        const result = await authService.login(email, password)
        // console.log('📦 Resultado completo login:', result)

        if (result.success) {
            // console.log('✅ Login exitoso, actualizando estado')
            // console.log('👤 Usuario recibido:', result.data?.user)
            await updateAuthState()
        }
        return result
    }

    const register = async (userData) => {
        // console.log('🚀 Intentando registro:', userData.email)
        const result = await authService.register(userData)
        // console.log('📦 Resultado completo registro:', result)

        if (result.success) {
            // console.log('✅ Registro exitoso, actualizando estado')
            // console.log('👤 Usuario recibido:', result.data?.user)
            await updateAuthState()
        }
        return result
    }

    const logout = () => {
        // console.log('🚪 Cerrando sesión')
        authService.logout()
        setUser(null)
        setPerfil(null)
    }

    const value = {
        // Estados
        user,
        perfil,
        loading,

        // Flags
        isAuthenticated,
        isAdmin,
        isInstructor,
        isEstudiante,

        // Funciones
        cargarPerfil,
        updateAuthState,
        login,
        register,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

// =============================================
// EXPORTS PARA COMPATIBILIDAD CON CÓDIGO EXISTENTE
// =============================================
export const obtenerSesion = () => authService.obtenerSesion()
export const obtenerPerfil = (userId) => authService.obtenerPerfil(userId)
export const onAuthStateChange = (callback) => authService.onAuthStateChange(callback)