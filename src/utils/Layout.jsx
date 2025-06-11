// ==========================================
// 1. src/utils/Layout.jsx - REFACTORIZADO
// ==========================================
import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Sidebar from './Sidebar'
import { useAuth } from './AuthContext'

const Layout = ({ children, showSidebar = false }) => {
    const { loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen bg-medico-light flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue"></div>
                    <p className="mt-4 text-medico-gray">Cargando Mediconsa...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-medico-light flex flex-col">
            <Navbar />

            <div className="flex flex-1">
                {showSidebar && (
                    <div className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200">
                        <Sidebar />
                    </div>
                )}

                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    )
}

export default Layout