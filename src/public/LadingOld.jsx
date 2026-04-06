
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Stethoscope, Syringe, Pill, Leaf, Users, Award, Star, ChevronDown, Heart, Activity, Brain } from 'lucide-react'
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

// Componente para íconos flotantes decorativos
const FloatingIcon = ({ Icon, className, delay = 0 }) => (
    <div
        className={`absolute opacity-20 text-white animate-pulse ${className}`}
        style={{ animationDelay: `${delay}s`, animationDuration: '3s' }}
    >
        <Icon className="w-8 h-8 md:w-12 md:h-12" />
    </div>
);

const LandingPage = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-700 via-blue-900 to-slate-900 min-h-screen flex items-center overflow-hidden">
                {/* Background decorativo con formas geométricas */}
                <div className="absolute inset-0">
                    {/* Gradiente principal */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-800/95 to-slate-900"></div>

                    {/* Círculos decorativos difuminados */}
                    <div className="absolute top-20 left-10 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-3xl"></div>

                    {/* Patrón de grid sutil */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                </div>

                {/* Íconos flotantes decorativos */}
                <FloatingIcon Icon={Stethoscope} className="top-[15%] left-[8%]" delay={0} />
                <FloatingIcon Icon={Heart} className="top-[25%] right-[12%]" delay={0.5} />
                <FloatingIcon Icon={Activity} className="bottom-[30%] left-[5%]" delay={1} />
                <FloatingIcon Icon={Brain} className="bottom-[20%] right-[8%]" delay={1.5} />
                <FloatingIcon Icon={Syringe} className="top-[60%] left-[15%]" delay={2} />
                <FloatingIcon Icon={Pill} className="top-[40%] right-[5%]" delay={2.5} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                        {/* Content */}
                        <div className="text-white order-2 lg:order-1">
                            {/* Badge superior */}
                            <div className="mb-6 inline-block">
                                <span className="inline-flex items-center gap-2 bg-black/30 text-yellow-300 px-6 py-3 rounded-full text-lg font-medium backdrop-blur-sm border border-yellow-300/30">
                                    🏥 Sistema de Entrenamiento de Alto Rendimiento
                                </span>
                            </div>

                            {/* Título principal */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading leading-tight mb-6">
                                Domina tu examen del
                                <span className="block text-yellow-300 text-4xl md:text-5xl lg:text-6xl">CACES de</span>
                                <span className="block text-yellow-300 text-4xl md:text-5xl lg:text-6xl"><TypewriterEffect /></span>
                                <span className="block text-white">con Mediconsa</span>
                            </h1>

                            {/* Descripción */}
                            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                Plataforma moderna con simulacros oficiales, contenido actualizado y entrenamiento
                                personalizado que garantiza resultados reales. Diseñado para que apruebes el EHEP
                                y accedas con seguridad al Año Rural.
                            </p>

                            {/* CTAs mejorados */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    to="/registro"
                                    className="group relative bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-300 text-center transform hover:scale-[1.02] hover:-translate-y-0.5 overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        Comenzar Gratis
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </Link>
                                <Link
                                    to="/cursos"
                                    className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 text-center backdrop-blur-sm"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Ver Cursos
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </Link>
                            </div>

                            {/* Stats con íconos */}
                            <div className="grid grid-cols-3 gap-4 md:gap-6 pt-8 border-t border-white/10">
                                <div className="text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <Users className="w-5 h-5 text-yellow-400" />
                                        <span className="text-2xl md:text-3xl font-bold text-white">500+</span>
                                    </div>
                                    <div className="text-sm text-blue-200/70">Estudiantes</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <Award className="w-5 h-5 text-yellow-400" />
                                        <span className="text-2xl md:text-3xl font-bold text-white">99%</span>
                                    </div>
                                    <div className="text-sm text-blue-200/70">Aprobación</div>
                                </div>
                                <div className="text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-2xl md:text-3xl font-bold text-white">4.9</span>
                                    </div>
                                    <div className="text-sm text-blue-200/70">Valoración</div>
                                </div>
                            </div>
                        </div>

                        {/* Hero Visual - Diseño moderno */}
                        <div className="relative order-1 lg:order-2">
                            {/* Contenedor principal con efecto glassmorphism */}
                            <div className="relative">
                                {/* Glow detrás de la imagen */}
                                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 via-blue-500/20 to-cyan-400/20 rounded-3xl blur-2xl"></div>

                                {/* Card principal */}
                                <div className="relative bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10 shadow-2xl">
                                    <img
                                        src="https://i.ibb.co/bgc2q1Lv/8df9677f-f7e5-4afb-ad8c-6ba998a5661b.png"
                                        alt="Estudiantes de medicina preparándose para CACES"
                                        className="rounded-xl w-full h-auto shadow-xl"
                                    />

                                    {/* Badge flotante */}
                                    <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4">
                                        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-2 md:px-5 md:py-2.5 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-yellow-400/30">
                                            ¡Empieza el 2026!
                                        </div>
                                    </div>
                                </div>

                                {/* Elementos decorativos alrededor */}
                                <div className="absolute -top-8 -left-8 w-16 h-16 border-2 border-yellow-400/30 rounded-full"></div>
                                <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-yellow-400/10 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center text-white/50 animate-bounce">
                        <span className="text-xs mb-2">Explorar</span>
                        <ChevronDown className="w-5 h-5" />
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
                                Preparación completa para el Examen de Medicina del CACES. Septiembre 2026 (curso 4 meses).
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
                                Preparación completa para el Examen de Enfermería del CACES. Septiembre 2026 (curso 4 meses).
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

            {/* Testimonios */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-heading text-blue-600 mb-4">
                            Los Mejores del País Confían en Nosotros
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Líderes en preparación médica con resultados comprobados. Conoce las experiencias de quienes ya aprobaron con Mediconsa.
                        </p>
                        <div className="mt-4 flex justify-center">
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-full font-bold text-sm">
                                🏆 #1 en Preparación para el examen CACES
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* Testimonio 1 - Mensaje de confianza */}
                        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    A
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Dra. Ana M.</h4>
                                    <p className="text-sm text-gray-600">UCE - Medicina General</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex text-yellow-400">
                                        {"★".repeat(5)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                "Al principio tenía dudas 😅 pero decidí confiar en Mediconsa y fue la mejor decisión! 🙌 Los simulacros son súper similares al examen real. Dr. Santiago siempre responde súper rápido por WhatsApp 💪"
                            </p>
                            <div className="text-sm text-blue-600 font-semibold">
                                ✅ Aprobó: 92/100 - EHEP CACES 2024
                            </div>
                        </div>

                        {/* Testimonio 2 - Agradecimiento */}
                        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    M
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Lic. María José S.</h4>
                                    <p className="text-sm text-gray-600">PUCE - Enfermería</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex text-yellow-400">
                                        {"★".repeat(5)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                "GRACIAS MEDICONSA! 🥺❤️ Era mi segunda vez intentando y tenía miedo de fallar otra vez... Pero con ustedes lo logré!! 🎉 Mis papás están súper orgullosos 😭💕 100% recomendado chicos!"
                            </p>
                            <div className="text-sm text-green-600 font-semibold">
                                🎯 Aprobó al segundo intento - EHEP CACES 2024
                            </div>
                        </div>

                        {/* Testimonio 3 - Comparación con competencia */}
                        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl p-6 shadow-lg border border-yellow-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    C
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Dr. Carlos R.</h4>
                                    <p className="text-sm text-gray-600">UTE - Odontología</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex text-yellow-400">
                                        {"★".repeat(5)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                "Probé con otras plataformas y perdí tiempo y dinero 🥲 Hasta que llegué Mediconsa! La diferencia es ABISMAL 🔥 El contenido está súper actualizado y no es como otros que solo reciclan preguntas viejas 👍"
                            </p>
                            <div className="text-sm text-yellow-600 font-semibold">
                                📈 De 68 a 94 puntos con Mediconsa
                            </div>
                        </div>

                        {/* Testimonio 4 - Proceso emocional */}
                        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    L
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Dr. Luis F.</h4>
                                    <p className="text-sm text-gray-600">UEES - Medicina</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex text-yellow-400">
                                        {"★".repeat(5)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                "No les voy a mentir, estaba súper estresado 😰 después de reprobar la primera vez... Pero Mediconsa me dio toda la confianza que necesitaba! 💪✨ Ahora ya estoy en la rural! Gracias totales! 🙏"
                            </p>
                            <div className="text-sm text-purple-600 font-semibold">
                                🏥 Ya está en Año Rural - Promoción 2024
                            </div>
                        </div>

                        {/* Testimonio 5 - Recomendación familiar */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-6 shadow-lg border border-indigo-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    S
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Lic. Sofia V.</h4>
                                    <p className="text-sm text-gray-600">U de Guayaquil - Enfermería</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex text-yellow-400">
                                        {"★".repeat(5)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                "Mi prima me recomendó Mediconsa y qué razón tenía! 😍 Todo súper organizado, nada de perder tiempo buscando info por todos lados 📚 Ya le dije a mis compañeras de la uni que se inscriban también! 👭💯"
                            </p>
                            <div className="text-sm text-indigo-600 font-semibold">
                                🌟 Recomendó a 8 compañeras más
                            </div>
                        </div>

                        {/* Testimonio 6 - Mensaje motivacional */}
                        <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                                    R
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">Dr. Roberto M.</h4>
                                    <p className="text-sm text-gray-600">UDLA - Medicina</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="flex text-yellow-400">
                                        {"★".repeat(5)}
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-4">
                                "Chicos, si están dudando, NO DUDEN MÁS! 🚀 Mediconsa es inversión, no gasto! 💰✅ Me siento súper preparado para lo que viene. El Dr. Santiago es una máquina! 🤓 Ahora a brillar en la rural! ⭐"
                            </p>
                            <div className="text-sm text-red-600 font-semibold">
                                🎖️ Mejor puntuado - EHEP CACES 2024
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas destacadas */}
                    <div className="mt-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl md:text-3xl font-heading mb-2">Resultados que Nos Respaldan 📊</h3>
                            <p className="text-blue-100">La preparación médica, odontológica y de enfermería para el CACES más efectiva del país 🇪🇨</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-yellow-300">99% ✅</div>
                                <div className="text-sm text-blue-100">Tasa de Aprobación</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-yellow-300">500+ 👩‍⚕️</div>
                                <div className="text-sm text-blue-100">Médicos Preparados</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-yellow-300">95.2 📈</div>
                                <div className="text-sm text-blue-100">Puntuación Promedio</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-yellow-300">4.9⭐</div>
                                <div className="text-sm text-blue-100">Valoración Estudiantes</div>
                            </div>
                        </div>
                    </div>

                    {/* Mensaje especial */}
                    <div className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-6 rounded-lg">
                        <div className="flex items-center">
                            <div className="text-2xl mr-3">💬</div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Mensaje del Dr. Santiago López</h4>
                                <p className="text-gray-700 italic">
                                    "Cada testimonio representa horas de dedicación y noches de estudio compartidas.
                                    Me llena de orgullo ver cómo nuestros estudiantes no solo aprueban, sino que se convierten
                                    en los mejores profesionales del país. ¡Sigamos construyendo el futuro de la juventud ecuatoriana juntos! 🩺❤️"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Badge final más realista */}
                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-full font-bold shadow-lg">
                            <span className="text-2xl mr-3">🏆</span>
                            Únete a la Plataforma #1 de Preparación para el examen CACES en Ecuador
                            <span className="text-2xl ml-3">🇪🇨</span>
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
                            href="https://wa.me/593985036066?text=Hola, quiero información sobre los cursos de Mediconsa"
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