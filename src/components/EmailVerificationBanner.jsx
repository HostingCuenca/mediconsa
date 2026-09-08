// src/components/EmailVerificationBanner.jsx - Aviso para usuarios con correo sin confirmar
import React, { useState } from 'react'
import { useAuth } from '../utils/AuthContext'
import authService from '../services/auth'

const EmailVerificationBanner = () => {
    const { isAuthenticated, perfil } = useAuth()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [dismissed, setDismissed] = useState(false)

    if (!isAuthenticated || !perfil || perfil.emailVerificado !== false || dismissed) {
        return null
    }

    const handleResend = async () => {
        setLoading(true)
        setMessage('')
        try {
            const result = await authService.resendVerification(perfil.email)
            setMessage(result.success ? result.message : (result.error || 'No se pudo reenviar el correo'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-start sm:items-center space-x-2 text-sm text-yellow-800">
                    <svg className="w-5 h-5 flex-shrink-0 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>
                        Confirma tu correo <strong>{perfil.email}</strong> para asegurar tu cuenta.
                        {message && <span className="block sm:inline sm:ml-2 text-yellow-700">{message}</span>}
                    </span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={loading}
                        className="font-medium text-medico-blue hover:text-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Reenviar correo'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="text-yellow-700 hover:text-yellow-900"
                        title="Ocultar"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    )
}

export default EmailVerificationBanner
