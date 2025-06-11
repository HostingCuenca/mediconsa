// src/components/ConnectionTest.jsx - Test de conexión mejorado para debugging
import React, { useState, useEffect } from 'react'
import apiService from '../services/api'
import authService from '../services/auth'

const ConnectionTest = () => {
    const [tests, setTests] = useState({
        backend: { status: 'testing', message: 'Conectando...', data: null },
        auth: { status: 'testing', message: 'Verificando auth...', data: null }
    })

    useEffect(() => {
        runTests()
    }, [])

    const runTests = async () => {
        // Test 1: Conexión al backend
        try {
            const backendResult = await apiService.testConnection()
            setTests(prev => ({
                ...prev,
                backend: {
                    status: backendResult.success ? 'success' : 'error',
                    message: backendResult.message,
                    data: backendResult.serverInfo || backendResult.error
                }
            }))
        } catch (error) {
            setTests(prev => ({
                ...prev,
                backend: {
                    status: 'error',
                    message: 'Error de conexión',
                    data: error.message
                }
            }))
        }

        // Test 2: Auth service
        try {
            const token = authService.getToken()
            const user = authService.getUser()

            let authMessage = 'No hay sesión activa'
            let authData = { token: !!token, user: !!user }

            if (token && user) {
                authMessage = `Sesión activa: ${user.email}`
                authData = { ...authData, userEmail: user.email, userType: user.tipoUsuario }
            }

            setTests(prev => ({
                ...prev,
                auth: {
                    status: token ? 'success' : 'warning',
                    message: authMessage,
                    data: authData
                }
            }))
        } catch (error) {
            setTests(prev => ({
                ...prev,
                auth: {
                    status: 'error',
                    message: 'Error en auth service',
                    data: error.message
                }
            }))
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return '✅'
            case 'warning':
                return '⚠️'
            case 'error':
                return '❌'
            case 'testing':
                return '🔄'
            default:
                return '❓'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return 'text-green-600 bg-green-50 border-green-200'
            case 'warning':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200'
            case 'error':
                return 'text-red-600 bg-red-50 border-red-200'
            case 'testing':
                return 'text-blue-600 bg-blue-50 border-blue-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">🔧 Connection Test</h3>
                <button
                    onClick={runTests}
                    className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                    Actualizar
                </button>
            </div>

            <div className="space-y-3">
                {/* Backend Test */}
                <div className={`p-3 rounded-lg border ${getStatusColor(tests.backend.status)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getStatusIcon(tests.backend.status)}</span>
                        <span className="font-medium">Backend API</span>
                    </div>
                    <p className="text-sm">{tests.backend.message}</p>
                    {tests.backend.data && (
                        <details className="mt-2">
                            <summary className="text-xs cursor-pointer">Ver detalles</summary>
                            <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                                {JSON.stringify(tests.backend.data, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>

                {/* Auth Test */}
                <div className={`p-3 rounded-lg border ${getStatusColor(tests.auth.status)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{getStatusIcon(tests.auth.status)}</span>
                        <span className="font-medium">Auth Service</span>
                    </div>
                    <p className="text-sm">{tests.auth.message}</p>
                    {tests.auth.data && (
                        <details className="mt-2">
                            <summary className="text-xs cursor-pointer">Ver detalles</summary>
                            <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-auto">
                                {JSON.stringify(tests.auth.data, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            </div>

            {/* Environment Info */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                    <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'}</p>
                    <p><strong>Env:</strong> {process.env.NODE_ENV}</p>
                    <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
                </div>
            </div>
        </div>
    )
}

export default ConnectionTest