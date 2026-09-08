// src/public/ResetPasswordPage.jsx - Establecer nueva contraseña desde el enlace del correo
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import authService from '../services/auth'
import Layout from '../utils/Layout'

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get('token') || ''

    const [checking, setChecking] = useState(true)
    const [tokenValid, setTokenValid] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [done, setDone] = useState(false)

    // Validar el token al cargar la página
    useEffect(() => {
        let cancelled = false

        const validar = async () => {
            if (!token) {
                setError('El enlace no contiene un código de recuperación.')
                setChecking(false)
                return
            }

            const result = await authService.validateResetToken(token)
            if (cancelled) return

            if (result.success) {
                setTokenValid(true)
                setEmail(result.data?.email || '')
            } else {
                setError(result.error || 'El enlace es inválido o ha expirado.')
            }
            setChecking(false)
        }

        validar()
        return () => { cancelled = true }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        setLoading(true)
        try {
            const result = await authService.resetPassword(token, password)

            if (result.success) {
                setDone(true)
                setTimeout(() => navigate('/login', { replace: true }), 3000)
            } else {
                setError(result.error || 'No se pudo restablecer la contraseña')
                // Si el token dejó de ser válido, bloquear el formulario
                if ((result.error || '').toLowerCase().includes('inválido') ||
                    (result.error || '').toLowerCase().includes('expirado')) {
                    setTokenValid(false)
                }
            }
        } catch (err) {
            console.error('Error restableciendo contraseña:', err)
            setError('Error de conexión. Verifica tu internet y que el servidor esté corriendo.')
        } finally {
            setLoading(false)
        }
    }

    const renderContent = () => {
        if (checking) {
            return (
                <div className="text-center py-6">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-medico-blue"></div>
                    <p className="mt-4 text-sm text-medico-gray">Verificando enlace...</p>
                </div>
            )
        }

        if (done) {
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">¡Contraseña actualizada!</h3>
                    <p className="text-sm text-medico-gray">
                        Ya puedes iniciar sesión con tu nueva contraseña. Te redirigiremos en unos segundos.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block bg-medico-blue text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                        Ir a iniciar sesión
                    </Link>
                </div>
            )
        }

        if (!tokenValid) {
            return (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Enlace no válido</h3>
                    <p className="text-sm text-medico-gray">{error}</p>
                    <Link
                        to="/recuperar-contrasena"
                        className="inline-block bg-medico-blue text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                        Solicitar un nuevo enlace
                    </Link>
                </div>
            )
        }

        return (
            <>
                {email && (
                    <p className="mb-4 text-sm text-medico-gray text-center">
                        Nueva contraseña para <strong>{email}</strong>
                    </p>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-medico-gray mb-1">
                            Nueva contraseña *
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError('') }}
                                className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                placeholder="Mínimo 6 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 text-xs text-medico-gray hover:text-medico-blue"
                            >
                                {showPassword ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-medico-gray mb-1">
                            Confirmar contraseña *
                        </label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setError('') }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                            placeholder="Repite la contraseña"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-medico-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Guardando...</span>
                            </div>
                        ) : (
                            'Guardar nueva contraseña'
                        )}
                    </button>
                </form>
            </>
        )
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-medico-blue via-blue-600 to-medico-green flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">

                    {/* Header */}
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                <span className="text-medico-blue font-bold text-lg">M</span>
                            </div>
                            <span className="text-2xl font-bold text-white">Mediconsa</span>
                        </Link>

                        <h2 className="text-3xl font-bold text-white">Restablecer contraseña</h2>
                        <p className="mt-2 text-blue-100">
                            Crea una nueva contraseña para tu cuenta
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {renderContent()}

                        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                            <Link to="/login" className="text-sm text-medico-gray hover:text-medico-blue">
                                ← Volver a iniciar sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ResetPasswordPage
