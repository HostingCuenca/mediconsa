// AvisoSesionBanner — se muestra una sola vez tras iniciar sesión cuando el login cerró otra sesión
// o reemplazó un dispositivo (límites de cuenta compartida). El texto lo guarda authService.guardarAvisoSesion.
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { MonitorSmartphone, X } from 'lucide-react'

const KEY = 'mediconsa_aviso_sesion'

const AvisoSesionBanner = () => {
    const [texto, setTexto] = useState(() => { try { return sessionStorage.getItem(KEY) || '' } catch { return '' } })
    if (!texto) return null
    const cerrar = () => { try { sessionStorage.removeItem(KEY) } catch { /* noop */ } setTexto('') }
    return (
        <div className="bg-amber-50 border-b border-amber-200">
            <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-start gap-3 text-sm text-amber-900">
                <MonitorSmartphone className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="flex-1 min-w-0">
                    {texto} Si no fuiste tú, <Link to="/perfil" onClick={cerrar} className="font-semibold underline">revisa tus dispositivos y cambia tu contraseña</Link>.
                </p>
                <button onClick={cerrar} className="p-1 rounded-lg hover:bg-amber-100 text-amber-700" aria-label="Cerrar aviso"><X className="w-4 h-4" /></button>
            </div>
        </div>
    )
}

export default AvisoSesionBanner
