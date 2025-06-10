// src/utils/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { obtenerSesion, obtenerPerfil, onAuthStateChange } from '../services/auth'

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
                const { success, session } = await obtenerSesion()

                if (success && session?.user) {
                    setUser(session.user)
                    await cargarPerfil(session.user.id)
                }
            } catch (error) {
                console.error('Error cargando sesión:', error)
            } finally {
                setLoading(false)
            }
        }

        cargarSesionInicial()
    }, [])

    // =============================================
    // LISTENER DE CAMBIOS DE AUTH
    // =============================================
    useEffect(() => {
        const { data: listener } = onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event, session?.user?.email)

            if (session?.user) {
                setUser(session.user)
                await cargarPerfil(session.user.id)
            } else {
                setUser(null)
                setPerfil(null)
            }

            setLoading(false)
        })

        return () => {
            listener?.subscription?.unsubscribe()
        }
    }, [])

    // =============================================
    // CARGAR PERFIL DE USUARIO
    // =============================================
    const cargarPerfil = async (userId) => {
        try {
            const { success, perfil } = await obtenerPerfil(userId)
            if (success) {
                setPerfil(perfil)
            }
        } catch (error) {
            console.error('Error cargando perfil:', error)
        }
    }

    // =============================================
    // FUNCIONES HELPER
    // =============================================
    const isAuthenticated = !!user
    const isAdmin = perfil?.tipo_usuario === 'admin'
    const isInstructor = perfil?.tipo_usuario === 'instructor'
    const isEstudiante = perfil?.tipo_usuario === 'estudiante'

    const value = {
        user,
        perfil,
        loading,
        isAuthenticated,
        isAdmin,
        isInstructor,
        isEstudiante,
        cargarPerfil
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}