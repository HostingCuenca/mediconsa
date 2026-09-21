// ==========================================
// 1. src/utils/Layout.jsx - REFACTORIZADO
// ==========================================
import React, { useState } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import Sidebar from './Sidebar'
import EmailVerificationBanner from '../components/EmailVerificationBanner'
import AvisoSesionBanner from '../components/AvisoSesionBanner'
import { BottomNav, MobileDrawer } from './NavMovil'
import { useAuth } from './AuthContext'

const SIDEBAR_KEY = 'mediconsa_sidebar_collapsed'

// navMovil: barra inferior + menú lateral en celular (solo en el panel). Ponlo en false en páginas a pantalla completa.
const Layout = ({ children, showSidebar = false, navMovil = true }) => {
    const { loading } = useAuth()
    const [drawer, setDrawer] = useState(false)
    const [collapsed, setCollapsed] = useState(() => {
        try { return localStorage.getItem(SIDEBAR_KEY) === '1' } catch { return false }
    })
    const toggleSidebar = () => {
        setCollapsed(c => {
            try { localStorage.setItem(SIDEBAR_KEY, c ? '0' : '1') } catch { /* noop */ }
            return !c
        })
    }

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
            <Navbar onMenu={showSidebar && navMovil ? () => setDrawer(d => !d) : undefined} />
            <EmailVerificationBanner />
            <AvisoSesionBanner />

            <div className="flex flex-1 relative">
                {showSidebar && (
                    <aside className={`hidden lg:block flex-shrink-0 transition-[width] duration-200 ${collapsed ? 'w-14' : 'w-60'}`}>
                        <div className="sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto bg-white border-r border-gray-200">
                            <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
                        </div>
                    </aside>
                )}

                <main className={`flex-1 overflow-x-hidden ${showSidebar && navMovil ? 'pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0' : ''}`}>
                    {children}
                </main>
            </div>

            {showSidebar && navMovil && (
                <>
                    <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
                    <BottomNav onMenu={() => setDrawer(d => !d)} menuAbierto={drawer} />
                </>
            )}

            {/* El panel (con sidebar) no lleva footer; solo las páginas públicas */}
            {!showSidebar && <Footer />}
        </div>
    )
}

export default Layout