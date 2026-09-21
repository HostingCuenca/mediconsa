import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
    LayoutDashboard, BookOpen, BarChart3, ClipboardList, Zap, MessageCircle, Video, FolderDown, User,
    Users, CreditCard, Wrench, PanelLeftClose, PanelLeftOpen, LifeBuoy, ExternalLink, Library, CalendarDays, Target, ShieldAlert
} from 'lucide-react'
import { useAuth } from './AuthContext'

// Menús por rol. `nuevo` muestra la etiqueta NUEVO.
const MENU_ESTUDIANTE = [
    { titulo: 'Mi aprendizaje', items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/mis-cursos', label: 'Mis cursos', icon: BookOpen },
        { to: '/cronograma', label: 'Mi cronograma', icon: CalendarDays, nuevo: true },
        { to: '/simulador', label: 'Simulador interactivo', icon: Zap, nuevo: true },
        { to: '/simulador/plan', label: 'Mi plan de estudio', icon: Target, nuevo: true },
        { to: '/biblioteca', label: 'Biblioteca', icon: Library, nuevo: true },
        { to: '/mi-progreso', label: 'Mi progreso', icon: BarChart3 },
        { to: '/simulacros', label: 'Simulacros', icon: ClipboardList },
        { to: '/clases-virtuales', label: 'Clases virtuales', icon: Video },
        { to: '/canales', label: 'Canales', icon: MessageCircle },
        { to: '/mis-materiales', label: 'Materiales', icon: FolderDown },
        { to: '/perfil', label: 'Mi perfil', icon: User }
    ] }
]

const MENU_ADMIN = [
    { titulo: 'Panel de control', items: [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }
    ] },
    { titulo: 'Contenido', items: [
        { to: '/admin/cursos', label: 'Cursos', icon: BookOpen },
        { to: '/admin/cronogramas', label: 'Cronogramas', icon: CalendarDays, nuevo: true },
        { to: '/admin/simulacros', label: 'Simulacros', icon: ClipboardList },
        { to: '/admin/simulador', label: 'Simulador interactivo', icon: Zap, nuevo: true },
        { to: '/admin/materiales', label: 'Materiales', icon: FolderDown }
    ] },
    { titulo: 'Comunicación', items: [
        { to: '/admin/clases-virtuales', label: 'Clases virtuales', icon: Video },
        { to: '/admin/canales', label: 'Canales', icon: MessageCircle }
    ] },
    { titulo: 'Administración', items: [
        { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
        { to: '/admin/seguridad', label: 'Seguridad de cuentas', icon: ShieldAlert, nuevo: true },
        { to: '/admin/pagos', label: 'Pagos', icon: CreditCard },
        { to: '/admin/mantenimiento', label: 'Mantenimiento', icon: Wrench }
    ] }
]

const MENU_INSTRUCTOR = [
    { titulo: 'Panel instructor', items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
        { to: '/admin/cursos', label: 'Mis cursos', icon: BookOpen },
        { to: '/admin/simulacros', label: 'Simulacros', icon: ClipboardList },
        { to: '/admin/materiales', label: 'Materiales', icon: FolderDown },
        { to: '/admin/clases-virtuales', label: 'Clases virtuales', icon: Video },
        { to: '/admin/canales', label: 'Canales', icon: MessageCircle }
    ] }
]

const Sidebar = ({ collapsed = false, onToggle, mostrarToggle = true }) => {
    const location = useLocation()
    const { isAdmin, isInstructor } = useAuth()

    const menu = isAdmin ? MENU_ADMIN : isInstructor ? MENU_INSTRUCTOR : MENU_ESTUDIANTE

    // Activo = el ítem cuya ruta coincide de forma más específica (así /simulador/plan no ilumina también /simulador)
    const coincide = (item) => item.exact ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(item.to + '/')
    const masEspecifico = menu.flatMap(sec => sec.items).filter(coincide).sort((x, y) => y.to.length - x.to.length)[0]
    const isActive = (item) => masEspecifico?.to === item.to

    return (
        <div className="h-full flex flex-col">
            {/* Toggle */}
            {mostrarToggle && <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-end'} px-2 pt-2`}>
                <button
                    type="button"
                    onClick={onToggle}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                    aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                >
                    {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
            </div>}

            {/* Navegación */}
            <nav className={`flex-1 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'} pb-3 space-y-4`}>
                {menu.map(seccion => (
                    <div key={seccion.titulo}>
                        {!collapsed && (
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.14em] px-2 mb-1.5">{seccion.titulo}</p>
                        )}
                        {collapsed && <div className="border-t border-gray-100 my-2" />}
                        <ul className="space-y-0.5">
                            {seccion.items.map(item => {
                                const Icon = item.icon
                                const activo = isActive(item)
                                return (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            title={collapsed ? item.label : undefined}
                                            className={`group flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                                                collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2'
                                            } ${activo ? 'bg-medico-blue text-white' : 'text-gray-700 hover:bg-blue-50 hover:text-medico-blue'}`}
                                        >
                                            <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={activo ? 2.25 : 2} />
                                            {!collapsed && <span className="flex-1 leading-tight">{item.label}</span>}
                                            {!collapsed && item.nuevo && (
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${activo ? 'bg-white/20 text-white' : 'bg-medico-green/10 text-medico-green'}`}>NUEVO</span>
                                            )}
                                            {collapsed && item.nuevo && !activo && <span className="absolute ml-6 -mt-4 w-1.5 h-1.5 rounded-full bg-medico-green" />}
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Pie */}
            <div className={`border-t border-gray-100 ${collapsed ? 'p-2' : 'p-3'} space-y-2`}>

                {/* Soporte WhatsApp */}
                <a
                    href="https://wa.me/593985036066"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={collapsed ? 'Soporte · ¿Necesitas ayuda?' : undefined}
                    className={`flex items-center gap-2.5 rounded-lg text-green-600 hover:text-green-700 hover:bg-green-50 transition-colors ${
                        collapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2'
                    }`}
                >
                    <LifeBuoy className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
                    {!collapsed && (
                        <div className="flex-1 leading-tight">
                            <span className="block text-[13px] font-medium">Soporte</span>
                            <span className="block text-[11px] text-green-500">¿Necesitas ayuda?</span>
                        </div>
                    )}
                </a>

                {/* Branding Torisoftt */}
                {collapsed ? (
                    <a
                        href="https://torisoftt.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Plataforma desarrollada por Torisoftt"
                        className="flex items-center justify-center py-2 text-gray-400 hover:text-gray-600"
                    >
                        <img src="/torisoftt.png" alt="Torisoftt" className="h-5 w-auto" style={{ filter: 'brightness(0)', opacity: 0.6 }} />
                    </a>
                ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-2.5 flex flex-col gap-2">
                        <p className="text-[10px] text-gray-400 tracking-wide">Plataforma desarrollada por</p>
                        <div className="flex items-center gap-2">
                            <img src="/torisoftt.png" alt="Torisoftt" className="h-5 w-auto" style={{ filter: 'brightness(0)' }} />
                            <span className="text-[13px] font-semibold text-gray-700">Torisoftt</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href="https://wa.me/593984264910"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                Contáctanos <ExternalLink className="w-3 h-3" />
                            </a>
                            <span className="text-gray-300 text-[11px]">·</span>
                            <a
                                href="https://torisoftt.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-gray-500 hover:text-gray-800 transition-colors"
                            >
                                torisoftt.com
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Sidebar
