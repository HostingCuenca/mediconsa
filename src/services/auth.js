// src/services/auth.js
import { supabase } from './supabase'

// =============================================
// REGISTRO DE USUARIO SIN VERIFICACIÓN EMAIL
// =============================================
export const registrarUsuario = async (email, password, nombreCompleto, nombreUsuario) => {
    try {
        // 1. Registrar en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: undefined, // Sin redirect
                data: {
                    nombre_completo: nombreCompleto,
                    nombre_usuario: nombreUsuario
                }
            }
        })

        if (authError) throw authError

        // 2. Crear perfil inmediatamente (sin esperar confirmación)
        const { error: perfilError } = await supabase
            .from('perfiles_usuario')
            .insert({
                id: authData.user.id,
                nombre_completo: nombreCompleto,
                nombre_usuario: nombreUsuario,
                tipo_usuario: 'estudiante'
            })

        if (perfilError) throw perfilError

        return { success: true, user: authData.user }
    } catch (error) {
        console.error('Error registro:', error)
        return { success: false, error: error.message }
    }
}

// =============================================
// LOGIN DE USUARIO
// =============================================
export const loginUsuario = async (email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) throw error

        return { success: true, user: data.user }
    } catch (error) {
        console.error('Error login:', error)
        return { success: false, error: error.message }
    }
}

// =============================================
// LOGOUT
// =============================================
export const logoutUsuario = async () => {
    try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('Error logout:', error)
        return { success: false, error: error.message }
    }
}

// =============================================
// OBTENER PERFIL COMPLETO
// =============================================
export const obtenerPerfil = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('perfiles_usuario')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error
        return { success: true, perfil: data }
    } catch (error) {
        console.error('Error obtener perfil:', error)
        return { success: false, error: error.message }
    }
}

// =============================================
// VERIFICAR SESIÓN ACTUAL
// =============================================
export const obtenerSesion = async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        return { success: true, session }
    } catch (error) {
        console.error('Error obtener sesión:', error)
        return { success: false, error: error.message }
    }
}

// =============================================
// LISTENER DE CAMBIOS DE AUTH
// =============================================
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange(callback)
}

// =============================================
// CREAR USUARIOS DE PRUEBA (SOLO DESARROLLO)
// =============================================
export const crearUsuariosPrueba = async () => {
    if (process.env.NODE_ENV !== 'development') return

    try {
        // Admin
        const adminResult = await registrarUsuario(
            'admin@mediconsa.com',
            'admin123med',
            'Administrador Mediconsa',
            'admin.mediconsa'
        )

        if (adminResult.success) {
            // Actualizar a admin
            await supabase
                .from('perfiles_usuario')
                .update({ tipo_usuario: 'admin' })
                .eq('id', adminResult.user.id)
        }

        // Estudiante
        await registrarUsuario(
            'estudiante@mediconsa.com',
            'estudiante123',
            'Estudiante Prueba',
            'estudiante.prueba'
        )

        console.log('✅ Usuarios de prueba creados')
    } catch (error) {
        console.error('Error creando usuarios de prueba:', error)
    }
}