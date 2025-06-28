// src/pages/LandingPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import Layout from '../utils/Layout'

const LandingPage = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-medico-blue via-blue-600 to-medico-green min-h-screen flex items-center">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=800')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-medico-blue/90 via-blue-600/90 to-medico-green/90"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Content */}
                        <div className="text-white">
                            <div className="mb-6">
                <span className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                  🏥 Preparación Médica Especializada
                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                                Domina tu
                                <span className="block text-yellow-300">Examen Médico</span>
                                con Mediconsa
                            </h1>

                            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                La plataforma líder en preparación para CACES, SENESYCT, Medicina Rural y especialización médica.
                                Simulacros reales, contenido actualizado y soporte personalizado.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    to="/registro"
                                    className="bg-yellow-400 text-medico-blue px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 text-center transform hover:scale-105"
                                >
                                    Comenzar Gratis
                                </Link>
                                <Link
                                    to="/cursos"
                                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-medico-blue transition-all duration-300 text-center"
                                >
                                    Ver Cursos
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-300">500+</div>
                                    <div className="text-sm text-blue-100">Estudiantes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-300">95%</div>
                                    <div className="text-sm text-blue-100">Aprobación</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-300">4.9★</div>
                                    <div className="text-sm text-blue-100">Valoración</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <img
                                    src="https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=600&h=400&fit=crop"
                                    alt="Estudiante de medicina preparándose"
                                    className="rounded-xl w-full h-auto shadow-2xl"
                                />
                                <div className="absolute -top-4 -right-4 bg-yellow-400 text-medico-blue px-4 py-2 rounded-lg font-bold shadow-lg">
                                    ¡Nuevo 2025!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tipos de Examen */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-medico-blue mb-4">
                            Preparación Especializada para Cada Examen
                        </h2>
                       {/* <h2 className="text-3xl md:text-4xl font-bold text-medico-blue mb-4">*/}
                        {/*User (Usuario):*/}
                        {/*neondb_owner*/}

                        {/*Password (Contraseña):*/}
                        {/*npg_y40likMaKVQW*/}
                        {/*</h2>*/}
                        <p className="text-xl text-medico-gray max-w-3xl mx-auto">
                            Contenido actualizado y simulacros diseñados específicamente para cada tipo de evaluación médica en Ecuador.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                        {/* CACES */}
                        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-medico-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-medico-blue mb-2">CACES</h3>
                            <p className="text-medico-gray text-sm mb-4">
                                Preparación completa para el Consejo de Aseguramiento de la Calidad de la Educación Superior.
                            </p>
                            <div className="text-medico-green text-sm font-semibold">1,200+ preguntas</div>
                        </div>

                        {/* SENESYCT */}
                        <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-medico-green rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-medico-blue mb-2">SENESYCT</h3>
                            <p className="text-medico-gray text-sm mb-4">
                                Exámenes para becas y estudios de posgrado en el exterior.
                            </p>
                            <div className="text-medico-green text-sm font-semibold">800+ preguntas</div>
                        </div>

                        {/* Medicina Rural */}
                        <div className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-medico-blue mb-2">Medicina Rural</h3>
                            <p className="text-medico-gray text-sm mb-4">
                                Preparación específica para el año rural obligatorio.
                            </p>
                            <div className="text-medico-green text-sm font-semibold">600+ preguntas</div>
                        </div>

                        {/* Medicina General */}
                        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-medico-blue mb-2">Medicina General</h3>
                            <p className="text-medico-gray text-sm mb-4">
                                Fundamentos médicos y preparación integral.
                            </p>
                            <div className="text-medico-green text-sm font-semibold">1,000+ preguntas</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Características */}
            <section className="py-20 bg-medico-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-medico-blue mb-4">
                            ¿Por qué elegir Mediconsa?
                        </h2>
                        <p className="text-xl text-medico-gray max-w-3xl mx-auto">
                            Metodología probada, tecnología moderna y soporte personalizado para tu éxito.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-medico-blue rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-medico-blue mb-4">Simulacros Reales</h3>
                            <p className="text-medico-gray">
                                Exámenes que replican exactamente el formato y dificultad de las evaluaciones oficiales.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-medico-green rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-medico-blue mb-4">Progreso Detallado</h3>
                            <p className="text-medico-gray">
                                Analítica avanzada para identificar fortalezas y áreas de mejora en tiempo real.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-medico-blue mb-4">Soporte 24/7</h3>
                            <p className="text-medico-gray">
                                Asistencia personalizada vía WhatsApp y resolución de dudas por expertos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-gradient-to-r from-medico-blue to-medico-green">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        ¿Listo para aprobar tu examen médico?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Únete a cientos de médicos que ya confiaron en Mediconsa para su preparación.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/registro"
                            className="bg-yellow-400 text-medico-blue px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                        >
                            Empezar mi Preparación
                        </Link>
                        <a
                            href="https://wa.me/59398503606?text=Hola, quiero información sobre los cursos de Mediconsa"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-medico-blue transition-all duration-300"
                        >
                            Contactar por WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </Layout>
    )
}

export default LandingPage