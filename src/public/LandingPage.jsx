// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Stethoscope, Syringe, Pill, Leaf } from 'lucide-react'
import Layout from '../utils/Layout'

// Componente para el efecto de máquina de escribir
const TypewriterEffect = () => {
    const words = ['Medicina', 'Enfermería', 'Odontología'];
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const currentWord = words[currentWordIndex];

        const timeout = setTimeout(() => {
            if (isPaused) {
                setIsPaused(false);
                setIsDeleting(true);
                return;
            }

            if (isDeleting) {
                setCurrentText(currentWord.substring(0, currentText.length - 1));

                if (currentText === '') {
                    setIsDeleting(false);
                    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
                }
            } else {
                setCurrentText(currentWord.substring(0, currentText.length + 1));

                if (currentText === currentWord) {
                    setIsPaused(true);
                }
            }
        }, isPaused ? 2000 : isDeleting ? 100 : 150);

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, isPaused, currentWordIndex, words]);

    return (
        <span className="text-yellow-300">
            {currentText}
            <span className="animate-pulse">|</span>
        </span>
    );
};

const LandingPage = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-800 to-gray-900 min-h-screen flex items-center">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&h=800')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-800/90 to-gray-900/90"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                        {/* Content */}
                        <div className="text-white">
                            <div className="mb-6">
                                <span className="inline-block bg-black/30 text-yellow-300 px-6 py-3 rounded-full text-lg font-medium backdrop-blur-sm border border-yellow-300/30">
                                    🏥 Sistema de Entrenamiento de Alto Rendimiento
                                </span>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-heading leading-tight mb-6">
                                Domina tu examen del
                                <span className="block text-yellow-300 text-4xl md:text-6xl">CACES de</span>
                                <span className="block text-yellow-300 text-4xl md:text-6xl"><TypewriterEffect /></span>
                                <span className="block text-white">con Mediconsa</span>
                            </h1>

                            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                Plataforma moderna con simulacros oficiales, contenido actualizado y entrenamiento
                                personalizado que garantiza resultados reales. Diseñado para que apruebes el EHEP
                                y accedas con seguridad al Año Rural.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    to="/registro"
                                    className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 text-center transform hover:scale-105"
                                >
                                    Comenzar Gratis
                                </Link>
                                <Link
                                    to="/cursos"
                                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 text-center"
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
                                    <div className="text-2xl font-bold text-yellow-300">99%</div>
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
                                    src="https://i.ibb.co/bgc2q1Lv/8df9677f-f7e5-4afb-ad8c-6ba998a5661b.png"
                                    alt="Estudiantes de medicina preparándose para CACES"
                                    className="rounded-xl w-full h-auto shadow-2xl"
                                />
                                <div className="absolute -top-4 -right-4 bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold shadow-lg">
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
                        <h2 className="text-3xl md:text-4xl font-heading text-blue-600 mb-4">
                            Preparación Especializada para Cada Examen
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Contenido actualizado y simulacros diseñados específicamente para cada tipo de evaluación médica en Ecuador.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                        {/* EHEP CACES MEDICINA */}
                        <Link
                            to="/login"
                            className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Stethoscope className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-2">EHEP CACES MEDICINA</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Preparación completa para el Examen de Medicina del CACES. Septiembre 2025 (curso 4 meses).
                            </p>
                            <div className="text-blue-600 text-sm font-semibold">+3,500 preguntas</div>
                        </Link>

                        {/* EHEP CACES ENFERMERÍA */}
                        <Link
                            to="/login"
                            className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Syringe className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-2">EHEP CACES ENFERMERÍA</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Preparación completa para el Examen de Enfermería del CACES. Septiembre 2025 (curso 4 meses).
                            </p>
                            <div className="text-green-600 text-sm font-semibold">+3,000 preguntas</div>
                        </Link>

                        {/* EHEP CACES ODONTOLOGÍA */}
                        <Link
                            to="/login"
                            className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Pill className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-2">EHEP CACES ODONTOLOGÍA</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Preparación completa para el Examen de Odontología del CACES. Septiembre 2025 (curso 4 meses).
                            </p>
                            <div className="text-yellow-600 text-sm font-semibold">+3,000 preguntas</div>
                        </Link>

                        {/* CURSO PRE-RURAL */}
                        <Link
                            to="/login"
                            className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                        >
                            <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Leaf className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-2">CURSO PRE-RURAL</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Preparación completa para el Ingreso al año rural. Septiembre 2025 (curso 2 meses).
                            </p>
                            <div className="text-purple-600 text-sm font-semibold">+100 documentos</div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Sección Biográfica */}
            <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-heading text-blue-600 mb-4">
                            Preparación junto al
                        </h2>
                        <h3 className="text-2xl md:text-3xl font-heading text-gray-800 mb-8">
                            Dr. Santiago López A.
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Foto del Doctor */}
                        <div className="text-center lg:text-left">
                            <div className="relative inline-block">
                                <img
                                    src="/DR SANTIAGO LOPEZ.JPG"
                                    alt="Dr. Santiago López A."
                                    className="w-96 h-96 md:w-[450px] md:h-[450px] object-cover rounded-2xl shadow-2xl mx-auto"
                                />
                                <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg">
                                    <span className="text-base font-bold">Mejor puntuación</span>
                                    <span className="block text-sm">EHEP-CACES 2024</span>
                                </div>
                            </div>
                        </div>

                        {/* Información biográfica */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100">
                                <h4 className="text-xl font-heading text-blue-600 mb-4">Formación Académica</h4>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Médico formado en la <strong>Universidad San Francisco de Quito (Ecuador)</strong> y en la
                                    <strong> Universidad Autónoma de Madrid (España)</strong>.
                                </p>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    Maestrante en <strong>Gerencia Hospitalaria</strong> por la Universidad Internacional del Ecuador (UIDE)
                                    y estudiante de <strong>Derecho</strong> en la Universidad Técnica Particular de Loja (UTPL).
                                </p>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-100">
                                <h4 className="text-xl font-heading text-blue-600 mb-4">Logros Destacados</h4>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <p className="text-gray-700">
                                        <strong>Mejor puntuación nacional</strong> en el examen EHEP-CACES 2024
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <p className="text-gray-700">
                                        <strong>CEO y fundador de Mediconsa</strong>, plataforma de educación médica y consultoría en salud
                                    </p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                                <h4 className="text-xl font-heading text-blue-600 mb-4">Filosofía</h4>
                                <p className="text-gray-700 leading-relaxed italic">
                                    "Comprometido con la excelencia académica, el liderazgo en salud y la integración del
                                    conocimiento médico y jurídico para transformar realidades."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logos de Universidades */}
                    <div className="mt-16 text-center">
                        <h4 className="text-lg font-heading text-gray-600 mb-8">Instituciones de Formación</h4>
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-16">
                                <div className="flex flex-col items-center group">
                                    <img
                                        src="https://www.iberonex.com/wp-content/uploads/2023/09/universidad-san-franfisco-de-quito.png"
                                        alt="Universidad San Francisco de Quito"
                                        className="h-20 md:h-28 object-contain group-hover:scale-110 transition-all duration-300"
                                    />
                                    <span className="text-sm text-gray-600 mt-3 text-center font-medium">Universidad San Francisco de Quito</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Logo_UAM.jpg/330px-Logo_UAM.jpg"
                                        alt="Universidad Autónoma de Madrid"
                                        className="h-20 md:h-28 object-contain group-hover:scale-110 transition-all duration-300"
                                    />
                                    <span className="text-sm text-gray-600 mt-3 text-center font-medium">Universidad Autónoma de Madrid</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <img
                                        src="https://images.credly.com/images/5371ddc2-611e-4071-8480-8d8e2b2e3cdb/large_blob.png"
                                        alt="Universidad Internacional del Ecuador"
                                        className="h-20 md:h-28 object-contain group-hover:scale-110 transition-all duration-300"
                                    />
                                    <span className="text-sm text-gray-600 mt-3 text-center font-medium">Universidad Internacional del Ecuador</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <img
                                        src="https://utpl.edu.ec/recursos/img/utpl2.png"
                                        alt="Universidad Técnica Particular de Loja"
                                        className="h-20 md:h-28 object-contain group-hover:scale-110 transition-all duration-300"
                                    />
                                    <span className="text-sm text-gray-600 mt-3 text-center font-medium">Universidad Técnica Particular de Loja</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Características */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-heading text-blue-600 mb-4">
                            ¿Por qué elegir Mediconsa?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Metodología probada, tecnología moderna y soporte personalizado para tu éxito.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-4">Simulacros Reales</h3>
                            <p className="text-gray-600">
                                Exámenes que replican exactamente el formato y dificultad de las evaluaciones oficiales.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-4">Progreso Detallado</h3>
                            <p className="text-gray-600">
                                Analítica avanzada para identificar fortalezas y áreas de mejora en tiempo real.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-4">Soporte 24/7</h3>
                            <p className="text-gray-600">
                                Asistencia personalizada vía WhatsApp y resolución de dudas por expertos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-heading text-white mb-6">
                        ¿Listo para aprobar tu examen médico?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Únete a cientos de médicos que ya confiaron en Mediconsa para su preparación.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/registro"
                            className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                        >
                            Empezar mi Preparación
                        </Link>
                        <a
                            href="https://wa.me/59398503606?text=Hola, quiero información sobre los cursos de Mediconsa"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
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