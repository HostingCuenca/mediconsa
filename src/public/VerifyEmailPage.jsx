// src/public/VerifyEmailPage.jsx - Confirmar correo desde el enlace del email
import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import authService from '../services/auth'
import { useAuth } from '../utils/AuthContext'
import Layout from '../utils/Layout'

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') || ''
    const { isAuthenticated, markEmailVerified } = useAuth()

    const [status, setStatus] = useState('checking') // checking | ok | error
    const [message, setMessage] = useState('')
    const [resendEmail, setResendEmail] = useState('')
    const [resendLoading, setResendLoading] = useState(false)
    const [resendMessage, setResendMessage] = useState('')

    useEffect(() => {
        let cancelled = false

        const verificar = async () => {
            if (!token) {
                setStatus('error')
                setMessage('El enlace no contiene un código de verificación.')
                return
            }

            const result = await authService.verifyEmail(token)
            if (cancelled) return

            if (result.success) {
                setStatus('ok')
                setMessage(result.message)
                markEmailVerified()
            } else {
                setStatus('error')
                setMessage(result.error || 'El enlace es inválido o ha expirado.')
            }
        }

        verificar()
        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])

    const handleResend = async (e) => {
        e.preventDefault()
        setResendMessage('')
        setResendLoading(true)
        try {
            const result = await authService.resendVerification(resendEmail.trim())
            setResendMessage(result.success ? result.message : (result.error || 'No se pudo reenviar'))
        } finally {
            setResendLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-medico-blue via-blue-600 to-medico-green flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">

                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                <span className="text-medico-blue font-bold text-lg">M</span>
                            </div>
                            <span className="text-2xl font-bold text-white">Mediconsa</span>
                        </Link>
                        <h2 className="text-3xl font-bold text-white">Verificación de correo</h2>
                    </div>

                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {status === 'checking' && (
                            <div className="text-center py-6">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-medico-blue"></div>
                                <p className="mt-4 text-sm text-medico-gray">Confirmando tu correo...</p>
                            </div>
                        )}

                        {status === 'ok' && (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">¡Correo confirmado!</h3>
                                <p className="text-sm text-medico-gray">{message}</p>
                                <Link
                                    to={isAuthenticated ? '/dashboard' : '/login'}
                                    className="inline-block bg-medico-blue text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                                >
                                    {isAuthenticated ? 'Ir a mi panel' : 'Iniciar sesión'}
                                </Link>
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="space-y-6">
                                <div className="text-center space-y-3">
                                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Enlace no válido</h3>
                                    <p className="text-sm text-medico-gray">{message}</p>
                                </div>

                                <form onSubmit={handleResend} className="space-y-3 border-t border-gray-200 pt-6">
                                    <p className="text-sm text-medico-gray text-center">
                                        ¿Necesitas un nuevo enlace? Ingresa tu correo:
                                    </p>
                                    <input
                                        type="email"
                                        required
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                        placeholder="doctor@ejemplo.com"
                                    />
                                    <button
                                        type="submit"
                                        disabled={resendLoading}
                                        className="w-full bg-medico-blue text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {resendLoading ? 'Enviando...' : 'Reenviar correo de verificación'}
                                    </button>
                                    {resendMessage && (
                                        <p className="text-sm text-center text-medico-gray">{resendMessage}</p>
                                    )}
                                </form>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                            <Link to="/" className="text-sm text-medico-gray hover:text-medico-blue">
                                ← Volver al inicio
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default VerifyEmailPage
