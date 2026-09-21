// src/public/ForgotPasswordPage.jsx - Solicitar enlace de recuperación de contraseña
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import authService from '../services/auth'
import Layout from '../utils/Layout'

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sent, setSent] = useState(false)
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email.trim())) {
            setError('Ingresa un correo electrónico válido')
            return
        }

        setLoading(true)
        try {
            const result = await authService.forgotPassword(email.trim())

            if (result.success) {
                setSent(true)
                setMessage(result.message)
            } else {
                setError(result.error || 'No se pudo procesar la solicitud')
            }
        } catch (err) {
            console.error('Error en recuperación:', err)
            setError('Error de conexión. Verifica tu internet y que el servidor esté corriendo.')
        } finally {
            setLoading(false)
        }
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

                        <h2 className="text-3xl font-bold text-white">¿Olvidaste tu contraseña?</h2>
                        <p className="mt-2 text-blue-100">
                            Ingresa tu correo y te enviaremos un enlace para crear una nueva
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">
                        {sent ? (
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900">Revisa tu correo</h3>
                                <p className="text-sm text-medico-gray">{message}</p>
                                <p className="text-xs text-medico-gray">
                                    Enviado a <strong>{email}</strong>. Si no lo ves, revisa la carpeta de spam o correo no deseado.
                                    El enlace vence en 60 minutos.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => { setSent(false); setMessage('') }}
                                    className="text-sm text-medico-blue hover:text-blue-700 font-medium"
                                >
                                    Usar otro correo
                                </button>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-medico-gray mb-1">
                                            Correo electrónico *
                                        </label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            autoComplete="email"
                                            value={email}
                                            onChange={(e) => { setEmail(e.target.value); setError('') }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            placeholder="doctor@ejemplo.com"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-medico-blue text-white py-3 px-4 rounded-full font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Enviando...</span>
                                            </div>
                                        ) : (
                                            'Enviar enlace de recuperación'
                                        )}
                                    </button>
                                </form>
                            </>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-sm text-medico-gray">
                                ¿Recordaste tu contraseña?{' '}
                                <Link to="/login" className="text-medico-blue hover:text-blue-700 font-medium">
                                    Inicia sesión
                                </Link>
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link to="/" className="text-sm text-medico-gray hover:text-medico-blue">
                                    ← Volver al inicio
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default ForgotPasswordPage
