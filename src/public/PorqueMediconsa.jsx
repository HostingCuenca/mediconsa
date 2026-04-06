import React from 'react'
import { CheckCircle, Star, Award, Users, BookOpen, Clock, Target, TrendingUp, Shield, Zap } from 'lucide-react'
import Layout from '../utils/Layout'

const PorQueMediconsa = () => {
    const reasons = [
        {
            icon: Award,
            title: "Mejor Puntuación Nacional EHEP-CACES 2024",
            description: "Nuestro fundador, Dr. Santiago López, obtuvo la mejor puntuación nacional en el examen EHEP-CACES 2024, demostrando la efectividad de nuestra metodología.",
            stats: "Puntuación récord nacional"
        },
        {
            icon: Users,
            title: "99% de Tasa de Aprobación",
            description: "Más del 99% de nuestros estudiantes aprueban el examen EHEP-CACES en su primer intento, la tasa más alta del país.",
            stats: "500+ estudiantes aprobados"
        },
        {
            icon: BookOpen,
            title: "Contenido Actualizado 2026",
            description: "Material de estudio completamente actualizado con las últimas normativas y cambios en el examen EHEP-CACES para el período 2025.",
            stats: "+10,000 preguntas actualizadas"
        },
        {
            icon: Target,
            title: "Simulacros Idénticos al Examen Real",
            description: "Nuestros simulacros replican exactamente el formato, tiempo y dificultad del examen oficial EHEP-CACES, preparándote para el éxito.",
            stats: "Formato 100% oficial"
        },
        {
            icon: Clock,
            title: "Soporte 24/7 por WhatsApp",
            description: "Atención personalizada vía WhatsApp las 24 horas, los 7 días de la semana. Resolvemos tus dudas académicas en tiempo real.",
            stats: "Respuesta en menos de 2 horas"
        },
        {
            icon: TrendingUp,
            title: "Metodología Científicamente Comprobada",
            description: "Sistema de entrenamiento basado en repetición espaciada y análisis de debilidades, metodología avalada por estudios neuroeducativos.",
            stats: "Retención 300% mayor"
        }
    ]

    const specializations = [
        {
            title: "EHEP CACES Medicina",
            description: "Preparación especializada para médicos generales que buscan aprobar el examen de habilitación profesional",
            features: ["3,500+ preguntas específicas", "Casos clínicos reales", "Simulacros cronometrados", "Análisis de errores"],
            color: "blue"
        },
        {
            title: "EHEP CACES Enfermería",
            description: "Curso diseñado específicamente para profesionales de enfermería con contenido actualizado",
            features: ["3,000+ preguntas de enfermería", "Protocolos actualizados", "Casos de urgencias", "Farmacología específica"],
            color: "green"
        },
        {
            title: "EHEP CACES Odontología",
            description: "Preparación integral para odontólogos con enfoque en procedimientos y diagnósticos actuales",
            features: ["3,000+ preguntas odontológicas", "Casos radiográficos", "Protocolos de bioseguridad", "Materiales dentales"],
            color: "yellow"
        }
    ]

    const testimonialStats = [
        { number: "99%", label: "Tasa de Aprobación", subtext: "La más alta del país" },
        { number: "500+", label: "Médicos Preparados", subtext: "En todo Ecuador" },
        { number: "95.2", label: "Puntuación Promedio", subtext: "Sobre 100 puntos" },
        { number: "4.9⭐", label: "Valoración", subtext: "De nuestros estudiantes" },
        { number: "2024", label: "Mejor Puntuación", subtext: "Nacional EHEP-CACES" },
        { number: "10,000+", label: "Preguntas", subtext: "Actualizadas para 2025" }
    ]

    return (
        <Layout>
            {/* Hero Section - SEO Optimized */}
            <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-heading text-white mb-6">
                            ¿Por Qué Mediconsa es la <span className="text-yellow-300">Mejor Opción</span> para tu EHEP-CACES?
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 leading-relaxed">
                            Descubre por qué somos la <strong>plataforma #1 en Ecuador</strong> para la preparación del
                            examen EHEP-CACES en Medicina, Enfermería y Odontología con resultados comprobados.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            <div className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold">
                                🏆 Mejor Puntuación Nacional 2024
                            </div>
                            <div className="bg-white/20 text-white px-6 py-3 rounded-full font-bold backdrop-blur-sm">
                                ✅ 99% Tasa de Aprobación
                            </div>
                            <div className="bg-white/20 text-white px-6 py-3 rounded-full font-bold backdrop-blur-sm">
                                👨‍⚕️ 500+ Médicos Aprobados
                            </div>
                        </div>
                        <a
                        href="/registro"
                        className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 inline-block"
                        >
                        Comenzar mi Preparación Ahora
                    </a>
                </div>
            </div>
        </section>

    {/* Razones Principales - SEO Keywords */}
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading text-blue-600 mb-6">
                    6 Razones Comprobadas por las que Mediconsa es tu Mejor Inversión
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    No es casualidad que tengamos la <strong>tasa de aprobación más alta de Ecuador</strong>.
                    Estos son los factores que nos convierten en líderes indiscutibles.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {reasons.map((reason, index) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                            <reason.icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-heading text-blue-600 mb-4">{reason.title}</h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">{reason.description}</p>
                        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm font-semibold">
                            📊 {reason.stats}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>

    {/* Especialidades por Carrera */}
    <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading text-blue-600 mb-6">
                    Preparación Especializada por Carrera Profesional
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Cada profesión tiene sus particularidades. Por eso desarrollamos contenido específico
                    para <strong>Medicina, Enfermería y Odontología</strong> con las últimas actualizaciones 2025.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {specializations.map((spec, index) => (
                    <div key={index} className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-t-4 ${
                        spec.color === 'blue' ? 'border-blue-500' :
                            spec.color === 'green' ? 'border-green-500' : 'border-yellow-500'
                    }`}>
                        <div className="p-8">
                            <h3 className="text-2xl font-heading text-blue-600 mb-4">{spec.title}</h3>
                            <p className="text-gray-700 mb-6 leading-relaxed">{spec.description}</p>
                            <ul className="space-y-3">
                                {spec.features.map((feature, i) => (
                                    <li key={i} className="flex items-center">
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className={`px-8 py-4 ${
                            spec.color === 'blue' ? 'bg-blue-50' :
                                spec.color === 'green' ? 'bg-green-50' : 'bg-yellow-50'
                        }`}>
                            <a
                            href="/registro"
                            className={`block text-center font-semibold py-3 px-6 rounded-lg transition-colors ${
                            spec.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                spec.color === 'green' ? 'bg-green-600 hover:bg-green-700 text-white' :
                                    'bg-yellow-500 hover:bg-yellow-600 text-black'
                        }`}
                            >
                            Empezar Preparación
                        </a>
                    </div>
                    </div>
                    ))}
            </div>
        </div>
    </section>

    {/* Estadísticas Impresionantes */}
    <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading text-white mb-6">
                    Resultados que Hablan por Sí Solos
                </h2>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                    Nuestros números no mienten. Estos son los resultados reales que nos posicionan
                    como la <strong>mejor opción para tu preparación EHEP-CACES</strong>.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
                {testimonialStats.map((stat, index) => (
                    <div key={index} className="text-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 hover:bg-white/30 transition-all duration-300">
                            <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">
                                {stat.number}
                            </div>
                            <div className="text-white font-semibold mb-1">
                                {stat.label}
                            </div>
                            <div className="text-blue-100 text-sm">
                                {stat.subtext}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>

    {/* Metodología Única */}
    <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-heading text-blue-600 mb-6">
                        Metodología Científica de Entrenamiento Cerebral
                    </h2>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                        No usamos métodos tradicionales de memorización. Aplicamos <strong>neuroeducación avanzada</strong>
                        y técnicas de <strong>repetición espaciada</strong> que garantizan la retención a largo plazo.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Target className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Análisis de Debilidades</h3>
                                <p className="text-gray-600">Identificamos automáticamente tus áreas débiles y enfocamos el entrenamiento donde más lo necesitas.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Repetición Espaciada</h3>
                                <p className="text-gray-600">Sistema que presenta las preguntas en intervalos científicamente calculados para maximizar la retención.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Progreso Inteligente</h3>
                                <p className="text-gray-600">Algoritmo que adapta la dificultad según tu avance, manteniendo el desafío óptimo para el aprendizaje.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 border border-blue-200">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-2xl font-heading text-blue-600 mb-4">
                                Retención 300% Mayor
                            </h3>
                            <p className="text-gray-700 mb-6">
                                Estudios demuestran que nuestra metodología aumenta la retención de conocimiento
                                en un 300% comparado con métodos tradicionales.
                            </p>
                            <div className="bg-white rounded-lg p-4 shadow-md">
                                <div className="text-sm text-gray-600 mb-2">Efectividad comprobada:</div>
                                <div className="text-3xl font-bold text-green-600">99% aprobación</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Comparación con Competencia */}
    <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-heading text-blue-600 mb-6">
                    ¿Por Qué Elegir Mediconsa Sobre la Competencia?
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Comparación objetiva con otras plataformas de preparación EHEP-CACES en Ecuador.
                    Los hechos hablan por sí solos.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gradient-to-r from-blue-600 to-green-600">
                        <tr>
                            <th className="px-6 py-4 text-left text-white font-semibold">Características</th>
                            <th className="px-6 py-4 text-center text-white font-semibold">Mediconsa</th>
                            <th className="px-6 py-4 text-center text-gray-200 font-semibold">Otras Plataformas</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">Tasa de Aprobación</td>
                            <td className="px-6 py-4 text-center">
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">99%</span>
                            </td>
                            <td className="px-6 py-4 text-center text-gray-600">60-75%</td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">Fundador con Mejor Puntuación Nacional</td>
                            <td className="px-6 py-4 text-center">
                                <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-red-500">✗</span>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">Contenido Actualizado 2025</td>
                            <td className="px-6 py-4 text-center">
                                <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-orange-500">Parcial</span>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">Soporte 24/7 WhatsApp</td>
                            <td className="px-6 py-4 text-center">
                                <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-red-500">✗</span>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">Metodología Científica</td>
                            <td className="px-6 py-4 text-center">
                                <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-red-500">✗</span>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">Simulacros Idénticos al Examen</td>
                            <td className="px-6 py-4 text-center">
                                <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="text-orange-500">Aproximados</span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    {/* CTA Final Optimizado para Conversión */}
    <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h2 className="text-3xl md:text-4xl font-heading text-white mb-6">
                    🎯 ¿Estás Listo para Garantizar tu Aprobación?
                </h2>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    No dejes tu futuro profesional al azar. Únete a los <strong>500+ médicos</strong> que ya
                    confiaron en Mediconsa y aprobaron con la <strong>metodología #1 de Ecuador</strong>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-300">✅ 99%</div>
                        <div className="text-white text-sm">Aprobación Garantizada</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-300">🏆 #1</div>
                        <div className="text-white text-sm">Mejor Puntuación Nacional</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-yellow-300">📱 24/7</div>
                        <div className="text-white text-sm">Soporte WhatsApp</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                    href="/registro"
                    className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                    >
                    Comenzar mi Preparación EHEP-CACES
                </a>
<a
                href="https://wa.me/593985036066?text=Hola, quiero información sobre por qué Mediconsa es la mejor opción para mi EHEP-CACES"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                Hablar con un Especialista
            </a>
        </div>

        <p className="text-blue-100 text-sm mt-6">
            💡 <strong>Garantía:</strong> Si no mejoras tu puntuación en 30 días, te devolvemos tu dinero.
        </p>
    </div>
</div>
</section>
</Layout>
)
}

export default PorQueMediconsa