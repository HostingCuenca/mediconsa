// src/components/ConnectionTest.jsx - Componente para probar conexión
import React, { useState } from 'react'
import connectionTester from '../services/connectionTester'

const ConnectionTest = () => {
    const [testing, setTesting] = useState(false)
    const [results, setResults] = useState(null)

    const runTest = async () => {
        setTesting(true)
        setResults(null)

        try {
            const testResults = await connectionTester.runFullTest()
            setResults(testResults)
        } catch (error) {
            setResults({
                overall: false,
                error: error.message
            })
        } finally {
            setTesting(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                🔧 Test de Conexión Backend
            </h2>

            <button
                onClick={runTest}
                disabled={testing}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {testing ? 'Probando conexión...' : 'Probar Conexión'}
            </button>

            {results && (
                <div className="mt-6 space-y-4">
                    <div className={`p-4 rounded-lg ${
                        results.overall
                            ? 'bg-green-100 border border-green-300'
                            : 'bg-red-100 border border-red-300'
                    }`}>
                        <h3 className="font-bold mb-2">
                            {results.overall ? '✅ Conexión Exitosa' : '❌ Error de Conexión'}
                        </h3>

                        <div className="space-y-2 text-sm">
                            <div>
                                <strong>API:</strong> {results.api ? '✅ Conectada' : '❌ Error'}
                            </div>
                            <div>
                                <strong>Auth:</strong> {results.auth ? '✅ Funcionando' : '❌ Error'}
                            </div>
                            <div>
                                <strong>Timestamp:</strong> {results.timestamp}
                            </div>
                        </div>
                    </div>

                    {!results.overall && (
                        <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <h4 className="font-bold mb-2">💡 Recomendaciones:</h4>
                            <ul className="text-sm space-y-1">
                                <li>• Verificar que el backend esté corriendo en http://localhost:5000</li>
                                <li>• Revisar credenciales de prueba en la base de datos</li>
                                <li>• Comprobar configuración de CORS</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default ConnectionTest