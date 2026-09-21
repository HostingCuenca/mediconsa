// utils/NavMovil.jsx — navegación para celular (solo < lg):
//  - BottomNav: barra fija inferior con las 4 secciones principales + "Menú".
//  - MobileDrawer: panel lateral con el menú completo (reutiliza Sidebar) y datos del usuario.
// Muchos alumnos estudian solo desde el teléfono: el sidebar de escritorio no existe ahí y el menú
// del navbar solo tenía Perfil/Salir, así que no había forma de llegar a cursos, simulacros, etc.
import React, { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, BookOpen, Zap, ClipboardList, Menu, X, LayoutDashboard, Users, ShieldAlert, LogOut, User } from 'lucide-react'
import { useAuth } from './AuthContext'
import Sidebar from './Sidebar'

const TABS_ESTUDIANTE = [
    { to: '/dashboard', label: 'Inicio', icon: Home, exact: true },
    { to: '/mis-cursos', label: 'Cursos', icon: BookOpen, extra: ['/estudiar', '/cronograma'] },
    { to: '/simulador', label: 'Entrenar', icon: Zap },
    { to: '/simulacros', label: 'Simulacros', icon: ClipboardList, extra: ['/simulacro'] }
]
const TABS_ADMIN = [
    { to: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true },
    { to: '/admin/cursos', label: 'Cursos', icon: BookOpen, extra: ['/admin/simulacro', '/admin/questions', '/admin/curso'] },
    { to: '/admin/usuarios', label: 'Usuarios', icon: Users, extra: ['/admin/usuario'] },
    { to: '/admin/seguridad', label: 'Seguridad', icon: ShieldAlert }
]
const TABS_INSTRUCTOR = [
    { to: '/admin/cursos', label: 'Cursos', icon: BookOpen, extra: ['/admin/simulacro', '/admin/questions'] },
    { to: '/admin/simulacros', label: 'Simulacros', icon: ClipboardList },
    { to: '/admin/materiales', label: 'Materiales', icon: LayoutDashboard },
    { to: '/perfil', label: 'Perfil', icon: User }
]

const activo = (item, pathname) => {
    if (item.exact) return pathname === item.to
    const rutas = [item.to, ...(item.extra || [])]
    return rutas.some(r => pathname === r || pathname.startsWith(r + '/'))
}

export const BottomNav = ({ onMenu, menuAbierto }) => {
    const { isAdmin, isInstructor } = useAuth()
    const location = useLocation()
    const tabs = isAdmin ? TABS_ADMIN : isInstructor ? TABS_INSTRUCTOR : TABS_ESTUDIANTE
    // Con el drawer abierto ningún tab se marca activo: el foco está en "Menú"
    return (
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_16px_rgba(15,23,42,0.06)]"
             style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} aria-label="Navegación principal">
            <ul className="grid grid-cols-5">
                {tabs.map(t => {
                    const Icon = t.icon
                    const on = !menuAbierto && activo(t, location.pathname)
                    return (
                        <li key={t.to}>
                            <Link to={t.to} className={`flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-medium transition-colors ${on ? 'text-medico-blue' : 'text-gray-500 hover:text-gray-800'}`}>
                                <span className={`flex items-center justify-center w-10 h-6 rounded-full transition-colors ${on ? 'bg-blue-50' : ''}`}><Icon className="w-5 h-5" strokeWidth={on ? 2.4 : 2} /></span>
                                {t.label}
                            </Link>
                        </li>
                    )
                })}
                <li>
                    <button type="button" onClick={onMenu} className={`w-full flex flex-col items-center justify-center gap-0.5 h-14 text-[11px] font-medium transition-colors ${menuAbierto ? 'text-medico-blue' : 'text-gray-500 hover:text-gray-800'}`} aria-expanded={menuAbierto}>
                        <span className={`flex items-center justify-center w-10 h-6 rounded-full ${menuAbierto ? 'bg-blue-50' : ''}`}>{menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</span>
                        Menú
                    </button>
                </li>
            </ul>
        </nav>
    )
}

export const MobileDrawer = ({ open, onClose }) => {
    const { user, perfil, logout } = useAuth()
    const location = useLocation()
    const datos = perfil || user || {}
    const nombre = datos.nombreCompleto || datos.nombre_completo || datos.email || ''
    const iniciales = nombre.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || 'M'

    // Cerrar al navegar y bloquear el scroll del fondo mientras está abierto
    useEffect(() => { onClose?.() }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const esc = (e) => { if (e.key === 'Escape') onClose?.() }
        window.addEventListener('keydown', esc)
        return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc) }
    }, [open, onClose])

    return (
        <div className={`lg:hidden fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
            <div className={`absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
            <aside className={`absolute inset-y-0 left-0 w-[82vw] max-w-xs bg-white shadow-2xl flex flex-col transition-transform duration-250 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
                   style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} role="dialog" aria-label="Menú">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-medico-blue text-white flex items-center justify-center font-semibold">{iniciales}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{nombre}</p>
                        <Link to="/perfil" className="text-xs text-medico-blue">Ver mi perfil</Link>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100" aria-label="Cerrar menú"><X className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <Sidebar collapsed={false} mostrarToggle={false} />
                </div>
                <button type="button" onClick={logout} className="flex items-center gap-2.5 px-5 py-3 text-sm font-medium text-red-600 border-t border-gray-100 hover:bg-red-50">
                    <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
            </aside>
        </div>
    )
}
