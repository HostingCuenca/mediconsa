
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Stethoscope, Syringe, Pill, Leaf, Star, ArrowRight, ChevronLeft, ChevronRight, ClipboardCheck, TrendingUp, MessageCircle } from 'lucide-react'
import Layout from '../utils/Layout'
import herodoctorsImg from './herodoctors.png'

// ─── Typewriter ───────────────────────────────────────────────────────────────
const TYPEWRITER_WORDS = ['Medicina', 'Enfermería', 'Odontología']

const TypewriterEffect = () => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [currentText, setCurrentText] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        const currentWord = TYPEWRITER_WORDS[currentWordIndex]
        const timeout = setTimeout(() => {
            if (isPaused) { setIsPaused(false); setIsDeleting(true); return }
            if (isDeleting) {
                setCurrentText(currentWord.substring(0, currentText.length - 1))
                if (currentText === '') {
                    setIsDeleting(false)
                    setCurrentWordIndex(i => (i + 1) % TYPEWRITER_WORDS.length)
                }
            } else {
                setCurrentText(currentWord.substring(0, currentText.length + 1))
                if (currentText === currentWord) setIsPaused(true)
            }
        }, isPaused ? 2000 : isDeleting ? 100 : 150)
        return () => clearTimeout(timeout)
    }, [currentText, isDeleting, isPaused, currentWordIndex])

    return (
        <span className="text-blue-600">
            {currentText}<span className="animate-pulse">|</span>
        </span>
    )
}

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}
const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
}

// ─── Testimonials data ────────────────────────────────────────────────────────
const TESTIMONIALS = [
    { initial: 'A', color: 'bg-blue-600',   border: 'border-blue-100',   from: 'from-blue-50',   name: 'Dra. Ana M.',        uni: 'UCE · Medicina',          text: 'Al principio tenía dudas 😅 pero decidí confiar en Mediconsa y fue la mejor decisión! 🙌 Los simulacros son súper similares al examen real. Dr. Santiago siempre responde súper rápido por WhatsApp 💪', result: '✅ Aprobó: 92/100 — EHEP CACES 2024',           resultColor: 'text-blue-600'   },
    { initial: 'M', color: 'bg-green-600',  border: 'border-green-100',  from: 'from-green-50',  name: 'Lic. María José S.', uni: 'PUCE · Enfermería',        text: 'GRACIAS MEDICONSA! 🥺❤️ Era mi segunda vez intentando y tenía miedo de fallar otra vez... Pero con ustedes lo logré!! 🎉 Mis papás están súper orgullosos 😭💕 100% recomendado chicos!',           result: '🎯 Aprobó al segundo intento — EHEP CACES 2024', resultColor: 'text-green-600'  },
    { initial: 'C', color: 'bg-yellow-500', border: 'border-yellow-100', from: 'from-yellow-50', name: 'Dr. Carlos R.',       uni: 'UTE · Odontología',       text: 'Probé con otras plataformas y perdí tiempo y dinero 🥲 Hasta que llegué a Mediconsa! La diferencia es ABISMAL 🔥 El contenido está súper actualizado y no reciclan preguntas viejas 👍',            result: '📈 De 68 a 94 puntos con Mediconsa',             resultColor: 'text-yellow-600' },
    { initial: 'L', color: 'bg-purple-600', border: 'border-purple-100', from: 'from-purple-50', name: 'Dr. Luis F.',         uni: 'UEES · Medicina',         text: 'No les voy a mentir, estaba súper estresado 😰 después de reprobar la primera vez... Pero Mediconsa me dio toda la confianza que necesitaba! 💪✨ Ahora ya estoy en la rural! Gracias totales! 🙏', result: '🏥 Ya está en Año Rural — Promoción 2024',          resultColor: 'text-purple-600' },
    { initial: 'S', color: 'bg-indigo-600', border: 'border-indigo-100', from: 'from-indigo-50', name: 'Lic. Sofia V.',       uni: 'U. Guayaquil · Enfermería', text: 'Mi prima me recomendó Mediconsa y qué razón tenía! 😍 Todo súper organizado, nada de perder tiempo buscando info por todos lados 📚 Ya le dije a mis compañeras de la uni que se inscriban! 👭💯', result: '🌟 Recomendó a 8 compañeras más',                    resultColor: 'text-indigo-600' },
    { initial: 'R', color: 'bg-red-600',    border: 'border-red-100',    from: 'from-red-50',    name: 'Dr. Roberto M.',     uni: 'UDLA · Medicina',         text: 'Chicos, si están dudando, NO DUDEN MÁS! 🚀 Mediconsa es inversión, no gasto! 💰✅ Me siento súper preparado para lo que viene. El Dr. Santiago es una máquina! 🤓 ¡A brillar en la rural! ⭐',    result: '🎖️ Mejor puntuado — EHEP CACES 2024',            resultColor: 'text-red-600'    },
]

// ─── TestimonialCarousel ───────────────────────────────────────────────────────
const TestimonialCarousel = () => {
    const PER_PAGE = 3
    const pages = Math.ceil(TESTIMONIALS.length / PER_PAGE)
    const [page, setPage] = useState(0)
    const [dir, setDir] = useState(1)

    useEffect(() => {
        const t = setInterval(() => {
            setDir(1)
            setPage(p => (p + 1) % pages)
        }, 6000)
        return () => clearInterval(t)
    }, [pages])

    const go = (newPage) => {
        setDir(newPage > page ? 1 : -1)
        setPage(newPage)
    }

    const variants = {
        enter:  d => ({ x: d > 0 ? '60%' : '-60%', opacity: 0 }),
        center: { x: 0, opacity: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
        exit:   d => ({ x: d > 0 ? '-40%' : '40%', opacity: 0, transition: { duration: 0.3 } }),
    }

    const visible = TESTIMONIALS.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE)

    return (
        <div className="relative px-8">
            <div className="overflow-hidden">
                <AnimatePresence custom={dir} mode="wait">
                    <motion.div
                        key={page}
                        custom={dir}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {visible.map((t, i) => (
                            <div key={i} className={`bg-gradient-to-br ${t.from} to-white rounded-xl p-6 shadow-lg border ${t.border} flex flex-col`}>
                                <div className="flex items-center mb-4">
                                    <div className={`w-11 h-11 ${t.color} rounded-full flex items-center justify-center text-white font-bold text-base mr-3 shrink-0`}>{t.initial}</div>
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-gray-900 text-sm leading-tight">{t.name}</h4>
                                        <p className="text-xs text-gray-500">{t.uni}</p>
                                    </div>
                                    <div className="ml-auto text-yellow-400 text-xs shrink-0">{"★".repeat(5)}</div>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed flex-1">"{t.text}"</p>
                                <div className={`text-xs font-semibold mt-4 ${t.resultColor}`}>{t.result}</div>
                            </div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Prev */}
            <button
                onClick={() => go((page - 1 + pages) % pages)}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Next */}
            <button
                onClick={() => go((page + 1) % pages)}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors"
            >
                <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pages }).map((_, i) => (
                    <button
                        key={i}
                        onClick={() => go(i)}
                        className={`rounded-full transition-all duration-300 ${i === page ? 'w-7 h-2.5 bg-blue-600' : 'w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400'}`}
                    />
                ))}
            </div>
        </div>
    )
}

// ─── LandingPage ──────────────────────────────────────────────────────────────
const LandingPage = () => {
    return (
        <Layout>

            {/* ── HERO ──────────────────────────────────────────────────────── */}
            <section className="relative bg-white overflow-hidden">

                {/* Ambient blobs */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] opacity-60 -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-50 rounded-full blur-[80px] opacity-50 translate-x-1/4 -translate-y-1/4 pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-14 lg:pt-16 pb-10 md:pb-14">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-end">

                        {/* ── Columna izquierda: texto ── */}
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="visible"
                        >
                            {/* Badge */}
                            <motion.div variants={fadeUp} className="mb-5">
                                <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold">
                                    🏥 Sistema de Entrenamiento de Alto Rendimiento
                                </span>
                            </motion.div>

                            {/* Heading */}
                            <motion.h1 variants={fadeUp} className="font-bold tracking-tight mb-4">
                                <span className="block text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-1">
                                    Domina tu examen del
                                </span>
                                <span className="block text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-1">
                                    CACES de
                                </span>
                                <span className="block text-4xl md:text-5xl lg:text-6xl min-h-[1.2em]">
                                    <TypewriterEffect />
                                </span>
                                <span className="block text-2xl md:text-3xl lg:text-4xl text-gray-400 font-medium mt-1">
                                    con Mediconsa
                                </span>
                            </motion.h1>

                            {/* Descripción */}
                            <motion.p variants={fadeUp} className="text-gray-500 text-sm md:text-base leading-relaxed mb-7 max-w-lg">
                                Plataforma moderna con simulacros oficiales, contenido actualizado y entrenamiento
                                personalizado que garantiza resultados reales. Diseñado para que apruebes el EHEP
                                y accedas con seguridad al Año Rural.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8">
                                <Link
                                    to="/registro"
                                    className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    Comenzar Gratis
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    to="/cursos"
                                    className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-semibold px-7 py-3.5 rounded-xl text-sm hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                                >
                                    Ver Cursos
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>

                            {/* Stats */}
                            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
                                <div>
                                    <div className="text-xl md:text-2xl font-bold text-blue-600">1000+</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Estudiantes</div>
                                </div>
                                <div>
                                    <div className="text-xl md:text-2xl font-bold text-blue-600">99%</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Aprobación</div>
                                </div>
                                <div>
                                    <div className="text-xl md:text-2xl font-bold text-blue-600">4.9 ★</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Valoración</div>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* ── Columna derecha: imagen (desktop) ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="relative self-stretch hidden lg:block"
                        >
                            <img
                                src={herodoctorsImg}
                                alt="Médicos Mediconsa"
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: '-20%',
                                    height: '90%',
                                    maxHeight: '100%',
                                    width: 'auto',
                                    maxWidth: '900px',
                                    zIndex: 0,
                                }}
                            />
                            {/* Gradiente blanco bottom */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: '-30%',
                                width: '900px',
                                height: '80px',
                                background: 'linear-gradient(to top, rgba(255,255,255,1) 0%, transparent 100%)',
                                zIndex: 1,
                                pointerEvents: 'none',
                            }} />
                            {/* Floating card — rating */}
                            <motion.div
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.0, duration: 0.5 }}
                                className="absolute left-4 top-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 z-10"
                            >
                                <div className="flex gap-0.5 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <div className="font-bold text-gray-900 text-xs">5 Star Rating</div>
                                <div className="text-xs text-gray-400">99% Satisfacción</div>
                            </motion.div>

                            {/* Floating card — Dr. Santiago */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1, duration: 0.5 }}
                                className="absolute right-4 bottom-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 z-10"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                                        SL
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-xs leading-tight">Dr. Santiago López</div>
                                        <div className="text-xs text-gray-400">Experto Médico</div>
                                    </div>
                                    <a
                                        href="https://wa.me/593981833667?text=Hola, quiero información sobre los cursos de Mediconsa"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors"
                                    >
                                        Consultar
                                    </a>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Imagen móvil (solo visible en < lg) */}
                        <motion.img
                            src={herodoctorsImg}
                            alt="Médicos Mediconsa"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                            className="block lg:hidden w-full h-auto"
                        />

                    </div>
                </div>
            </section>

            {/* ── TIPOS DE EXAMEN (original) ────────────────────────────────── */}
            <section className="py-20 bg-blue-50">
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
                        <Link to="/login" className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Stethoscope className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-2">EHEP CACES MEDICINA</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Preparación completa para el Examen de Medicina del CACES. Mayo 2026 (curso 4 meses).
                            </p>
                            <div className="text-blue-600 text-sm font-semibold">+3,500 preguntas</div>
                        </Link>

                        <Link to="/login" className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                            <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Syringe className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-2">EHEP CACES ENFERMERÍA</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Preparación completa para el Examen de Enfermería del CACES. Mayo 2026 (curso 4 meses).
                            </p>
                            <div className="text-green-600 text-sm font-semibold">+3,000 preguntas</div>
                        </Link>

                        <Link to="/login" className="group bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                            <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Pill className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-2">EHEP CACES ODONTOLOGÍA</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Preparación completa para el Examen de Odontología del CACES. Mayo 2026 (curso 4 meses).
                            </p>
                            <div className="text-yellow-600 text-sm font-semibold">+3,000 preguntas</div>
                        </Link>

                        <Link to="/login" className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer">
                            <div className="w-16 h-16 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Leaf className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-heading text-blue-600 mb-2">CURSO PRE-RURAL</h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Preparación completa para el Ingreso al año rural. Mayo 2026 (curso 2 meses).
                            </p>
                            <div className="text-purple-600 text-sm font-semibold">+100 documentos</div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── DR. SANTIAGO (original) ───────────────────────────────────── */}
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
                                    <img src="https://www.iberonex.com/wp-content/uploads/2023/09/universidad-san-franfisco-de-quito.png" alt="Universidad San Francisco de Quito" className="h-20 md:h-28 object-contain group-hover:scale-110 transition-all duration-300" />
                                    <span className="text-sm text-gray-600 mt-3 text-center font-medium">Universidad San Francisco de Quito</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Logo_UAM.jpg/330px-Logo_UAM.jpg" alt="Universidad Autónoma de Madrid" className="h-20 md:h-28 object-contain group-hover:scale-110 transition-all duration-300" />
                                    <span className="text-sm text-gray-600 mt-3 text-center font-medium">Universidad Autónoma de Madrid</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <img src="https://images.credly.com/images/5371ddc2-611e-4071-8480-8d8e2b2e3cdb/large_blob.png" alt="Universidad Internacional del Ecuador" className="h-20 md:h-28 object-contain group-hover:scale-110 transition-all duration-300" />
                                    <span className="text-sm text-gray-600 mt-3 text-center font-medium">Universidad Internacional del Ecuador</span>
                                </div>
                                <div className="flex flex-col items-center group">
                                    <img src="https://utpl.edu.ec/recursos/img/utpl2.png" alt="Universidad Técnica Particular de Loja" className="h-20 md:h-28 object-contain group-hover:scale-110 transition-all duration-300" />
                                    <span className="text-sm text-gray-600 mt-3 text-center font-medium">Universidad Técnica Particular de Loja</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CARACTERÍSTICAS ───────────────────────────────────────────── */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <span className="inline-block bg-blue-50 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full border border-blue-100 mb-4">
                            ¿Por qué Mediconsa?
                        </span>
                        <h2 className="text-3xl md:text-4xl font-heading text-gray-900 mb-4">
                            Todo lo que necesitas para <span className="text-blue-600">aprobar</span>
                        </h2>
                        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                            Metodología probada, tecnología moderna y soporte personalizado diseñados para garantizar tu éxito.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Card 1 */}
                        <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <ClipboardCheck className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Simulacros Reales</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Exámenes que replican exactamente el formato, tiempo y dificultad de las evaluaciones oficiales del CACES.
                            </p>
                            <div className="mt-5 text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full">
                                +9,500 preguntas
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <TrendingUp className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Progreso Detallado</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Analítica avanzada por áreas y temas para identificar fortalezas y cerrar brechas en tiempo real.
                            </p>
                            <div className="mt-5 text-xs font-semibold text-green-600 bg-green-50 inline-block px-3 py-1 rounded-full">
                                Reportes personalizados
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <MessageCircle className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Soporte 24/7</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Asistencia personalizada vía WhatsApp con resolución de dudas directamente por el Dr. Santiago López.
                            </p>
                            <div className="mt-5 text-xs font-semibold text-yellow-600 bg-yellow-50 inline-block px-3 py-1 rounded-full">
                                Respuesta inmediata
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIOS (original) ────────────────────────────────────── */}
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

                    <TestimonialCarousel />

                    {/* Estadísticas */}
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
                                <div className="text-3xl md:text-4xl font-bold text-yellow-300">500+ 🩺</div>
                                <div className="text-sm text-blue-100">Profesionales Preparados</div>
                            </div>
                            <div>
                                <div className="text-3xl md:text-4xl font-bold text-yellow-300">94 📈</div>
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

                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-full font-bold shadow-lg">
                            <span className="text-2xl mr-3">🏆</span>
                            Únete a la Plataforma #1 de Preparación para el examen CACES en Ecuador
                            <span className="text-2xl ml-3">🇪🇨</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA FINAL (original) ──────────────────────────────────────── */}
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
                            href="https://wa.me/593981833667?text=Hola, quiero información sobre los cursos de Mediconsa"
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
