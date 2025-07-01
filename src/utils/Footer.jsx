// src/components/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
// Importa tu logo
import logoBlanco from '../assets/logoblancotexto.PNG'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Logo y descripción */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-medico-blue rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">M</span>
                            </div>
                            <span className="text-xl font-bold text-medico-blue">Mediconsa</span>
                            <span className="text-xs bg-medico-green text-white px-2 py-1 rounded-full">2025</span>
                        </div>
                        <p className="text-medico-gray text-sm max-w-md">
                            La plataforma #1 en el país en preparación para el Examen de Habilitación para el
                            Ejercicio Profesional (EHEP) del CACES. Dirigida para profesionales de Medicina,
                            Enfermería y Odontología.
                        </p>

                        {/* WhatsApp Contact */}
                        <div className="mt-4">
                            <a
                                href="https://wa.me/593981833667?text=Hola, necesito información sobre los cursos de Mediconsa"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-medico-green hover:text-green-700 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                </svg>
                                <span className="text-sm font-medium">+593 98 183 3667</span>
                            </a>
                            <div className="mt-2">
                                <a
                                    href="https://wa.me/593985036066?text=Hola, necesito información sobre los cursos de Mediconsa"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center space-x-2 text-medico-gray hover:text-medico-blue text-sm transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                                    </svg>
                                    <span>+593 98 503 6066 (Secundario)</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Enlaces rápidos */}
                    <div>
                        <h3 className="text-medico-blue font-semibold mb-4">Enlaces Rápidos</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/login" className="text-medico-gray hover:text-medico-blue text-sm transition-colors">
                                    EHEP CACES Medicina
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-medico-gray hover:text-medico-blue text-sm transition-colors">
                                    EHEP CACES Enfermería
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-medico-gray hover:text-medico-blue text-sm transition-colors">
                                    EHEP CACES Odontología
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="text-medico-gray hover:text-medico-blue text-sm transition-colors">
                                    Curso Pre-Rural
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Soporte */}
                    <div>
                        <h3 className="text-medico-blue font-semibold mb-4">Soporte</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="mailto:soporte@mediconsa.com" className="text-medico-gray hover:text-medico-blue text-sm transition-colors">
                                    soporte@mediconsa.com
                                </a>
                            </li>
                            <li>
                                <span className="text-medico-gray text-sm">
                                    Lun - Vie: 8:00 AM - 6:00 PM
                                </span>
                            </li>
                            <li>
                                <span className="text-medico-gray text-sm">
                                    Sáb: 9:00 AM - 2:00 PM
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright y créditos */}
                <div className="border-t border-gray-200 pt-6 mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                        <p className="text-medico-gray text-sm">
                            © {currentYear} Mediconsa. Todos los derechos reservados.
                        </p>
                        <p className="text-medico-gray text-sm">
                            Desarrollado por{' '}
                            <a
                                href="https://torisoftt.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-medico-blue hover:text-blue-700 font-medium transition-colors"
                            >
                                Torisoftt
                            </a>
                            {' '} |{' '}
                            <a
                                href="https://wa.me/593981833667?text=Hola, vi su trabajo en Mediconsa y me interesa sus servicios de desarrollo"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-medico-green hover:text-green-700 font-medium transition-colors"
                            >
                                +593 98 183 3667
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer