// src/pages/NotFound.jsx - Página 404
import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const NotFound = () => {
    return (
        <Layout>
            <div className="min-h-screen bg-medico-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full text-center">
                    <div className="mb-8">
                        <div className="text-6xl font-bold text-medico-blue mb-4">404</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Página no encontrada</h1>
                        <p className="text-medico-gray">
                            Lo sentimos, la página que buscas no existe o ha sido movida.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link
                            to="/"
                            className="block w-full bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Volver al Inicio
                        </Link>

                        <Link
                            to="/cursos"
                            className="block w-full border border-medico-blue text-medico-blue px-6 py-3 rounded-lg hover:bg-medico-light transition-colors"
                        >
                            Ver Cursos
                        </Link>
                    </div>

                    <div className="mt-8">
                        <svg className="w-32 h-32 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default NotFound