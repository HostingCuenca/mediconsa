// src/panel/Profile.jsx - PÁGINA DE PERFIL COMPLETA Y CORREGIDA
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import authService from '../services/auth'

const Profile = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user, perfil, updateAuthState } = useAuth()

    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')

    // Estados para información personal
    const [profileData, setProfileData] = useState({
        nombreCompleto: '',
        nombreUsuario: '',
        telefono: '',
        email: ''
    })

    // Estados para cambio de contraseña
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        loadProfileData()
    }, [isAuthenticated, user, perfil])

    // const loadProfileData = () => {
    //     const userData = perfil || user
    //     if (userData) {
    //         setProfileData({
    //             nombreCompleto: userData.nombreCompleto || userData.nombre_completo || '',
    //             nombreUsuario: userData.nombreUsuario || userData.nombre_usuario || '',
    //             telefono: userData.telefono || '',
    //             email: userData.email || ''
    //         })
    //     }
    // }

    const loadProfileData = () => {
        const userData = perfil || user

        // 🔍 DEBUG - Agregar estos logs temporales
        // console.log('🔍 userData completo:', userData)
        // console.log('🔍 telefono específico:', userData?.telefono)
        // console.log('🔍 tipo telefono:', typeof userData?.telefono)

        if (userData) {
            setProfileData({
                nombreCompleto: userData.nombreCompleto || userData.nombre_completo || '',
                nombreUsuario: userData.nombreUsuario || userData.nombre_usuario || '',
                telefono: userData.telefono || '',
                email: userData.email || ''
            })

            // 🔍 DEBUG - Ver qué se guardó
            // console.log('🔍 profileData después:', {
            //     telefono: userData.telefono || ''
            // }
            // )
        }
    }

    const showMessage = (text, type = 'success') => {
        setMessage(text)
        setMessageType(type)
        setTimeout(() => {
            setMessage('')
            setMessageType('')
        }, 5000)
    }

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validaciones
            if (!profileData.nombreCompleto.trim()) {
                showMessage('El nombre completo es requerido', 'error')
                return
            }

            if (!profileData.nombreUsuario.trim()) {
                showMessage('El nombre de usuario es requerido', 'error')
                return
            }

            if (profileData.nombreUsuario.length < 3) {
                showMessage('El nombre de usuario debe tener al menos 3 caracteres', 'error')
                return
            }

            console.log('Enviando actualización de perfil...')
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    nombreCompleto: profileData.nombreCompleto,
                    nombreUsuario: profileData.nombreUsuario,
                    telefono: profileData.telefono
                })
            })

            console.log('Response status:', response.status)
            const data = await response.json()
            console.log('Response data:', data)

            if (data.success) {
                showMessage('Perfil actualizado exitosamente', 'success')
                // Actualizar el contexto de autenticación
                await updateAuthState()
            } else {
                showMessage(data.message || 'Error actualizando perfil', 'error')
            }
        } catch (error) {
            console.error('Error actualizando perfil:', error)
            showMessage('Error de conexión. Verifica que el servidor esté funcionando.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Validaciones
            if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
                showMessage('Todos los campos de contraseña son requeridos', 'error')
                return
            }

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                showMessage('Las contraseñas no coinciden', 'error')
                return
            }

            if (passwordData.newPassword.length < 6) {
                showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error')
                return
            }

            console.log('Enviando cambio de contraseña...')
            const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            })

            console.log('Password change response status:', response.status)
            const data = await response.json()
            console.log('Password change response data:', data)

            if (data.success) {
                showMessage('Contraseña cambiada exitosamente', 'success')
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            } else {
                showMessage(data.message || 'Error cambiando contraseña', 'error')
            }
        } catch (error) {
            console.error('Error cambiando contraseña:', error)
            showMessage('Error de conexión. Verifica que el servidor esté funcionando.', 'error')
        } finally {
            setLoading(false)
        }
    }

    const getUserInitials = () => {
        const userData = perfil || user
        if (userData?.nombreCompleto || userData?.nombre_completo) {
            const name = userData.nombreCompleto || userData.nombre_completo
            return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
        }
        return userData?.email?.charAt(0).toUpperCase() || 'U'
    }

    const getUserDisplayName = () => {
        const userData = perfil || user
        return userData?.nombreCompleto || userData?.nombre_completo || userData?.email || 'Usuario'
    }

    const getRoleLabel = () => {
        const userData = perfil || user
        const role = userData?.tipoUsuario || userData?.tipo_usuario || 'estudiante'
        const roleLabels = {
            'admin': 'Administrador',
            'instructor': 'Instructor',
            'estudiante': 'Estudiante'
        }
        return roleLabels[role] || 'Usuario'
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No disponible'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-medico-blue to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                           <span className="text-white text-xl font-bold">
                               {getUserInitials()}
                           </span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                            <p className="text-gray-600">Gestiona tu información personal y configuraciones</p>
                        </div>
                    </div>

                    {/* User Info Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-medico-blue to-blue-700 rounded-full flex items-center justify-center">
                                   <span className="text-white font-semibold">
                                       {getUserInitials()}
                                   </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{getUserDisplayName()}</h3>
                                    <p className="text-sm text-gray-600">{profileData.email}</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                       {getRoleLabel()}
                                   </span>
                                </div>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                                <p>Miembro desde</p>
                                <p className="font-medium">{formatDate(perfil?.fechaRegistro || perfil?.fecha_registro)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje de estado */}
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg border ${
                            messageType === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {messageType === 'success' ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                                {message}
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Información Personal */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>

                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre Completo *
                                </label>
                                <input
                                    type="text"
                                    value={profileData.nombreCompleto}
                                    onChange={(e) => setProfileData({...profileData, nombreCompleto: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    placeholder="Tu nombre completo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de Usuario *
                                </label>
                                <input
                                    type="text"
                                    value={profileData.nombreUsuario}
                                    onChange={(e) => setProfileData({...profileData, nombreUsuario: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    placeholder="Tu nombre de usuario"
                                    minLength={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    disabled
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="mt-1 text-sm text-gray-500">El email no se puede cambiar</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={profileData.telefono}
                                    onChange={(e) => setProfileData({...profileData, telefono: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    placeholder="Tu número de teléfono"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-medico-blue text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Cambiar Contraseña */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Cambiar Contraseña</h2>

                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contraseña Actual *
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    placeholder="Tu contraseña actual"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nueva Contraseña *
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    placeholder="Tu nueva contraseña"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Confirmar Nueva Contraseña *
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    placeholder="Confirma tu nueva contraseña"
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h4 className="text-sm font-medium text-blue-800">Consejos de seguridad:</h4>
                                        <ul className="mt-2 text-sm text-blue-700 space-y-1">
                                            <li>• Al menos 6 caracteres</li>
                                            <li>• Combina letras y números</li>
                                            <li>• Evita información personal</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-medico-blue text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Cambiando...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Cambiar Contraseña
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="mt-8 bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Cuenta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div>
                            <dt className="font-medium text-gray-500">Estado de la cuenta</dt>
                            <dd className="mt-1">
                               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                   Activa
                               </span>
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Tipo de usuario</dt>
                            <dd className="mt-1 text-gray-900">{getRoleLabel()}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-gray-500">Fecha de registro</dt>
                            <dd className="mt-1 text-gray-900">{formatDate(perfil?.fechaRegistro || perfil?.fecha_registro)}</dd>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Profile