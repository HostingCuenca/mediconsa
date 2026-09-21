// src/simulador/ui.jsx - Piezas visuales compartidas del Simulador Interactivo
// Colores: paleta actual (medico-blue #1e40af, medico-green, medico-gray, medico-light).
// Estructura: lienzo gris suave, tarjetas blancas 24px con sombra difusa, botones pill.
import React from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Flame, Zap } from 'lucide-react'

// Contenedor de página del panel: ancho completo como el resto del panel
export const Page = ({ children, className = '' }) => (
    <div className={`p-6 md:p-8 ${className}`}>{children}</div>
)

export const SHADOW = 'shadow-[0_2px_48px_rgba(205,208,223,0.4)]'

export const Card = ({ children, className = '', tint = '', as: Tag = 'div', ...rest }) => (
    <Tag className={`rounded-3xl border border-gray-100 ${tint || 'bg-white'} ${SHADOW} ${className}`} {...rest}>
        {children}
    </Tag>
)

export const PageHeader = ({ eyebrow, title, subtitle, actions }) => (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
            {eyebrow && (
                <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-medico-blue mb-2">
                    {eyebrow}
                </span>
            )}
            <h1 className="text-3xl md:text-4xl text-gray-900 tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-medico-gray max-w-2xl">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
)

const btnBase = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medico-blue'
const btnSizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-sm', lg: 'px-8 py-4 text-base' }
const btnVariants = {
    primary: 'bg-medico-blue text-white hover:bg-blue-800 shadow-sm',
    secondary: 'bg-white text-gray-800 border border-gray-300 hover:border-gray-400 hover:bg-gray-50',
    ghost: 'text-medico-gray hover:text-gray-900 hover:bg-gray-100',
    success: 'bg-medico-green text-white hover:bg-emerald-700 shadow-sm',
    danger: 'bg-white text-medico-red border border-red-200 hover:bg-red-50'
}

export const Button = ({ children, variant = 'primary', size = 'md', to, href, className = '', loading = false, ...rest }) => {
    const cls = `${btnBase} ${btnSizes[size]} ${btnVariants[variant]} ${className}`
    if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>
    if (href) return <a href={href} className={cls} {...rest}>{children}</a>
    return (
        <button className={cls} {...rest} disabled={loading || rest.disabled}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    )
}

export const Pill = ({ children, className = '' }) => (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${className}`}>
        {children}
    </span>
)

export const Stat = ({ label, value, hint, tint = 'bg-white', valueClass = 'text-gray-900' }) => (
    <Card tint={tint} className="p-5">
        <p className="text-xs font-medium text-medico-gray uppercase tracking-wider">{label}</p>
        <p className={`mt-2 text-3xl font-semibold tracking-tight ${valueClass}`}>{value}</p>
        {hint && <p className="mt-1 text-xs text-medico-gray">{hint}</p>}
    </Card>
)

export const ProgressBar = ({ value = 0, color = 'bg-medico-blue', className = '', height = 'h-2' }) => (
    <div className={`w-full bg-gray-100 rounded-full ${height} overflow-hidden ${className}`}>
        <div className={`${height} rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
)

export const Loading = ({ text = 'Cargando…' }) => (
    <div className="flex items-center justify-center py-24">
        <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-medico-blue" />
            <p className="mt-4 text-medico-gray text-sm">{text}</p>
        </div>
    </div>
)

export const EmptyState = ({ icon: Icon, title, description, action }) => (
    <Card className="p-12 text-center">
        {Icon && (
            <div className="mx-auto w-14 h-14 rounded-2xl bg-blue-50 text-medico-blue flex items-center justify-center mb-4">
                <Icon className="w-7 h-7" />
            </div>
        )}
        <h3 className="font-sans text-lg font-semibold text-gray-900">{title}</h3>
        {description && <p className="mt-2 text-medico-gray max-w-md mx-auto">{description}</p>}
        {action && <div className="mt-6">{action}</div>}
    </Card>
)

export const Alert = ({ children, tone = 'info', className = '' }) => {
    const tones = {
        info: 'bg-blue-50 border-blue-100 text-blue-900',
        warn: 'bg-orange-50 border-orange-100 text-orange-900',
        error: 'bg-red-50 border-red-100 text-red-900',
        ok: 'bg-emerald-50 border-emerald-100 text-emerald-900'
    }
    return <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone]} ${className}`}>{children}</div>
}

export const Modal = ({ open, title, children, footer, onClose, wide = false }) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className={`bg-white rounded-3xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[92vh] overflow-y-auto p-6 md:p-8 shadow-2xl`} onClick={e => e.stopPropagation()}>
                {title && <h3 className="font-sans text-xl font-semibold text-gray-900 mb-3">{title}</h3>}
                <div className="text-sm text-gray-700">{children}</div>
                {footer && <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">{footer}</div>}
            </div>
        </div>
    )
}

// Selector tipo "pestañas pill" (carreras, filtros)
export const SegmentedControl = ({ options, value, onChange, className = '' }) => (
    <div className={`inline-flex flex-wrap gap-1 bg-gray-100 rounded-full p-1 ${className}`}>
        {options.map(o => (
            <button
                key={o.value}
                type="button"
                onClick={() => onChange(o.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    value === o.value ? 'bg-white text-medico-blue shadow-sm' : 'text-medico-gray hover:text-gray-900'
                }`}
            >
                {o.label}
            </button>
        ))}
    </div>
)

// Barra de XP / nivel / racha (cabecera del simulador)
export const StatsBar = ({ stats, extra }) => {
    if (!stats) return null
    const rango = stats.xpSiguienteNivel - stats.xpNivelActual
    const avance = rango > 0 ? Math.round(((stats.xp - stats.xpNivelActual) / rango) * 100) : 100
    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${stats.rachaDias > 0 ? 'bg-orange-50 border-orange-100 text-medico-orange' : 'bg-white border-gray-200 text-gray-400'}`} title="Días seguidos practicando">
                <Flame className={`w-5 h-5 ${stats.rachaDias > 0 ? 'fill-current' : ''}`} />
                <span className="font-semibold">{stats.rachaDias}</span>
                <span className="text-xs hidden sm:inline">{stats.rachaDias === 1 ? 'día' : 'días'} de racha</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-gray-200" title={`${stats.xp} XP · siguiente nivel a ${stats.xpSiguienteNivel} XP`}>
                <Zap className="w-5 h-5 text-medico-blue fill-current" />
                <div className="leading-tight">
                    <div className="text-sm font-semibold text-gray-900">Nivel {stats.nivel} <span className="text-medico-gray font-normal">· {stats.xp} XP</span></div>
                    <div className="w-28 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden"><div className="h-1.5 bg-medico-blue rounded-full" style={{ width: `${avance}%` }} /></div>
                </div>
            </div>
            {extra}
        </div>
    )
}

// Anillo de porcentaje (SVG)
export const Ring = ({ value = 0, size = 96, stroke = 10, color = '#1e40af', label, sub }) => {
    const r = (size - stroke) / 2
    const c = 2 * Math.PI * r
    const pct = Math.min(100, Math.max(0, value || 0))
    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
                <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
                        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100} strokeLinecap="round"
                        className="transition-all duration-700" />
            </svg>
            <div className="absolute text-center">
                <div className="text-xl font-semibold text-gray-900 leading-none">{label ?? `${Math.round(pct)}%`}</div>
                {sub && <div className="text-[10px] text-medico-gray mt-1">{sub}</div>}
            </div>
        </div>
    )
}
