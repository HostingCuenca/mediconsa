
import React from 'react'
import { Link } from 'react-router-dom'
import logoBlanco from '../assets/logoblancotexto.PNG'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

                {/* ── Columnas principales ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                    {/* Logo & descripción */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="inline-block mb-5">
                            <img
                                src={logoBlanco}
                                alt="Logo Mediconsa"
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6">
                            La plataforma <span className="text-white font-medium">#1 en Ecuador</span> en preparación
                            para el EHEP CACES. Medicina, Enfermería y Odontología.
                        </p>

                        {/* WhatsApp */}
                        <div className="flex flex-col gap-3">
                            <a
                                href="https://wa.me/593981833667?text=Hola, necesito información sobre los cursos de Mediconsa"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                                +593 98 183 3667
                            </a>
                            <a
                                href="https://wa.me/593985036066?text=Hola, necesito información sobre los cursos de Mediconsa"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
                            >
                                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                                +593 98 503 6066 <span className="text-gray-600">(Secundario)</span>
                            </a>
                        </div>
                    </div>

                    {/* Cursos */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">Cursos</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    EHEP CACES Medicina
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    EHEP CACES Enfermería
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    EHEP CACES Odontología
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Curso Pre-Rural
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Soporte & Redes */}
                    <div>
                        <h3 className="text-white font-semibold mb-5 text-xs uppercase tracking-widest">Soporte</h3>
                        <ul className="space-y-3 mb-7">
                            <li>
                                <Link to="/politica-de-privacidad" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Política de Privacidad
                                </Link>
                            </li>
                            <li>
                                <Link to="/sobre-nosotros" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Sobre Nosotros
                                </Link>
                            </li>
                            <li>
                                <span className="text-gray-500 text-sm">Lun – Vie: 8:00 AM – 6:00 PM</span>
                            </li>
                            <li>
                                <span className="text-gray-500 text-sm">Sáb: 9:00 AM – 2:00 PM</span>
                            </li>
                        </ul>

                        {/* Redes sociales */}
                        <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-widest">Síguenos</h3>
                        <div className="flex gap-2">
                            <a
                                href="https://www.instagram.com/mediconsa"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Instagram"
                                className="w-9 h-9 bg-gray-800 hover:bg-gradient-to-br hover:from-pink-500 hover:to-purple-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                                </svg>
                            </a>
                            <a
                                href="https://www.facebook.com/MedicinaconSanty"
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Facebook"
                                className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Barra inferior ── */}
                <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} Mediconsa. Todos los derechos reservados.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Desarrollado por{' '}
                        <a
                            href="https://torisoftt.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                        >
                            Torisoftt
                        </a>
                        {' · '}
                        <a
                            href="https://wa.me/593981833667?text=Hola, vi su trabajo en Mediconsa y me interesa sus servicios de desarrollo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300 font-medium transition-colors"
                        >
                            +593 98 183 3667
                        </a>
                    </p>
                </div>

            </div>
        </footer>
    )
}

export default Footer
