import React from 'react'
import { Shield, FileText, Phone, Mail, ExternalLink, Clock, Users, Book, AlertTriangle, CheckCircle, Lock, Eye } from 'lucide-react'
import Layout from '../utils/Layout'

const LegalPages = () => {
    const SectionTitle = ({ children, icon: Icon }) => (
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-heading text-blue-600">{children}</h2>
        </div>
    )

    const InfoCard = ({ title, children, bgColor = "bg-blue-50", borderColor = "border-blue-200" }) => (
        <div className={`${bgColor} ${borderColor} border rounded-xl p-6 mb-6 hover:shadow-lg transition-all duration-300`}>
            <h3 className="text-xl font-heading text-blue-600 mb-4">{title}</h3>
            <div className="text-gray-700 space-y-3">{children}</div>
        </div>
    )

    const ContactItem = ({ icon: Icon, title, content, link }) => (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="font-heading text-blue-600 mb-1">{title}</h3>
                    {link ? (
                        <a href={link} className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                            {content}
                        </a>
                    ) : (
                        <p className="text-gray-700">{content}</p>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-green-600 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-heading text-white mb-6">
                        Políticas y Contacto
                    </h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                        Información transparente sobre el uso de la plataforma Mediconsa y nuestras políticas de privacidad.
                    </p>
                </div>
            </section>

            {/* Política de Privacidad */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionTitle icon={Shield}>Política de Privacidad</SectionTitle>

                    <div className="mb-8">
                        <p className="text-gray-600 text-lg leading-relaxed">
                            En <strong>Mediconsa</strong> respetamos tu privacidad y protegemos tu información personal.
                            Esta política describe cómo manejamos tus datos en nuestra plataforma educativa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <InfoCard title="Información que Recopilamos" bgColor="bg-blue-50" borderColor="border-blue-200">
                            <p>• <strong>Datos de registro:</strong> Información básica para crear tu cuenta de estudiante.</p>
                            <p>• <strong>Actividad de estudio:</strong> Tu progreso y desempeño en los cursos y simulacros.</p>
                            <p>• <strong>Comunicaciones:</strong> Mensajes enviados a través de WhatsApp y email.</p>
                        </InfoCard>

                        <InfoCard title="Cómo Usamos tu Información" bgColor="bg-green-50" borderColor="border-green-200">
                            <p>• <strong>Acceso educativo:</strong> Proporcionar contenido de preparación personalizado.</p>
                            <p>• <strong>Seguimiento académico:</strong> Monitorear tu progreso y ofrecer apoyo.</p>
                            <p>• <strong>Comunicación:</strong> Enviar actualizaciones importantes y responder consultas.</p>
                        </InfoCard>

                        <InfoCard title="Protección de Datos" bgColor="bg-purple-50" borderColor="border-purple-200">
                            <p>• <strong>No compartimos</strong> tu información personal con terceros.</p>
                            <p>• <strong>Seguridad:</strong> Implementamos medidas técnicas para proteger tus datos.</p>
                            <p>• <strong>Confidencialidad:</strong> Solo nuestro equipo autorizado accede a tu información.</p>
                        </InfoCard>

                        <InfoCard title="Tus Derechos" bgColor="bg-yellow-50" borderColor="border-yellow-200">
                            <p>• <strong>Acceso:</strong> Puedes solicitar información sobre tus datos almacenados.</p>
                            <p>• <strong>Corrección:</strong> Solicitar actualización de información incorrecta.</p>
                            <p>• <strong>Contacto:</strong> Escríbenos por WhatsApp para ejercer estos derechos.</p>
                        </InfoCard>
                    </div>

                    <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                        <h4 className="font-heading text-blue-600 mb-3 flex items-center">
                            <Eye className="w-5 h-5 mr-2" />
                            Cookies y Tecnología
                        </h4>
                        <p className="text-gray-700">
                            Utilizamos cookies básicas para el funcionamiento de la plataforma y Google Analytics
                            para entender cómo mejorar la experiencia educativa. Puedes desactivar las cookies
                            no esenciales en tu navegador.
                        </p>
                    </div>
                </div>
            </section>

            {/* Términos y Condiciones */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionTitle icon={FileText}>Términos y Condiciones</SectionTitle>

                    <div className="mb-8">
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Al usar <strong>Mediconsa</strong>, aceptas estos términos de uso de nuestra plataforma educativa.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <InfoCard title="Uso de la Plataforma" bgColor="bg-blue-50" borderColor="border-blue-200">
                            <p>• <strong>Propósito educativo:</strong> Mediconsa es una plataforma de preparación académica.</p>
                            <p>• <strong>Acceso personal:</strong> Tu cuenta es individual y no debe compartirse.</p>
                            <p>• <strong>Contenido actualizado:</strong> Nos esforzamos por mantener material relevante y actual.</p>
                        </InfoCard>

                        <InfoCard title="Responsabilidades del Usuario" bgColor="bg-green-50" borderColor="border-green-200">
                            <p>• <strong>Información veraz:</strong> Proporcionar datos correctos al registrarte.</p>
                            <p>• <strong>Uso apropiado:</strong> No compartir credenciales ni contenido sin autorización.</p>
                            <p>• <strong>Respeto:</strong> Mantener comunicación profesional con nuestro equipo.</p>
                        </InfoCard>

                        <InfoCard title="Acceso y Pagos" bgColor="bg-yellow-50" borderColor="border-yellow-200">
                            <p>• <strong>Verificación de pago:</strong> El acceso se activa tras confirmar el pago externamente.</p>
                            <p>• <strong>Duración:</strong> Cada curso tiene un período específico de acceso.</p>
                            <p>• <strong>Soporte:</strong> Contacta por WhatsApp para consultas sobre acceso o pagos.</p>
                        </InfoCard>

                        <InfoCard title="Propiedad Intelectual" bgColor="bg-purple-50" borderColor="border-purple-200">
                            <p>• <strong>Contenido protegido:</strong> Todo el material educativo es propiedad de Mediconsa.</p>
                            <p>• <strong>Uso personal:</strong> El contenido es exclusivamente para tu preparación académica.</p>
                            <p>• <strong>Prohibiciones:</strong> No está permitido copiar, distribuir o comercializar el material.</p>
                        </InfoCard>
                    </div>

                    <div className="mt-8 bg-blue-100 rounded-lg p-6">
                        <h4 className="font-heading text-blue-800 mb-3">📚 Sobre Nuestro Servicio</h4>
                        <p className="text-blue-700">
                            Mediconsa es una plataforma educativa diseñada para apoyar tu preparación académica.
                            Nuestro compromiso es proporcionarte las mejores herramientas de estudio y acompañamiento
                            personalizado para tu éxito profesional.
                        </p>
                    </div>

                    <div className="mt-6 bg-gray-100 rounded-lg p-6">
                        <p className="text-sm text-gray-600 text-center">
                            <strong>Última actualización:</strong> Julio 2025 •
                            <strong> Ley aplicable:</strong> República del Ecuador
                        </p>
                    </div>
                </div>
            </section>

            {/* Contacto */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <SectionTitle icon={Phone}>Contacto</SectionTitle>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <ContactItem
                            icon={Phone}
                            title="WhatsApp"
                            content="+593 98 183 3667"
                            link="https://wa.me/593981833667?text=Hola, necesito información sobre Mediconsa"
                        />
                        <ContactItem
                            icon={Mail}
                            title="Email"
                            content="info@mediconsa.ec"
                            link="mailto:info@mediconsa.ec"
                        />
                        <ContactItem
                            icon={Users}
                            title="Dirección Académica"
                            content="Dr. Santiago López A."
                        />
                        <ContactItem
                            icon={Clock}
                            title="Horario de Atención"
                            content="Lunes a Viernes: 8:00 AM - 8:00 PM"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <InfoCard title="📱 Canales de Comunicación" bgColor="bg-blue-50" borderColor="border-blue-200">
                            <p><strong>WhatsApp:</strong> +593 98 183 3667 (Canal principal - Respuesta rápida)</p>
                            <p><strong>Email:</strong> info@mediconsa.ec (Consultas formales y documentación)</p>
                            <p><strong>Horario:</strong> Lunes a Viernes de 8:00 AM a 8:00 PM</p>
                        </InfoCard>

                        <InfoCard title="⏰ Tiempos de Respuesta" bgColor="bg-green-50" borderColor="border-green-200">
                            <p><strong>WhatsApp:</strong> Inmediato - 2 horas (horario laboral)</p>
                            <p><strong>Email:</strong> 24 - 48 horas</p>
                            <p><strong>Consultas académicas:</strong> Mismo día</p>
                            <p><strong>Activación de acceso:</strong> 2 - 6 horas tras verificar pago</p>
                        </InfoCard>
                    </div>

                    <div className="mt-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl p-8 text-white text-center">
                        <h3 className="text-2xl font-heading mb-4">🚀 ¿Tienes dudas o necesitas información?</h3>
                        <p className="mb-6 text-blue-100 text-lg">
                            Estamos aquí para ayudarte en tu proceso de preparación académica
                        </p>
<a
                        href="https://wa.me/593981833667?text=Hola, tengo una consulta sobre Mediconsa"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
                        >
                        <Phone className="w-5 h-5 mr-2" />
                        Contactar por WhatsApp
                    </a>
                </div>
            </div>
        </section>

    {/* Soporte Tecnológico */}
    <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-100 rounded-lg p-6">
                <h4 className="font-heading text-gray-800 mb-3 text-center">💻 Soporte Tecnológico</h4>
                <p className="text-sm text-gray-600 text-center mb-3">
                    Plataforma desarrollada y mantenida por <strong>Torisoftt</strong> - Especialistas en desarrollo
                    de software y soluciones web innovadoras.
                </p>
                <p className="text-xs text-gray-500 text-center">
                    <strong>Soporte técnico:</strong> <a href="https://torisoftt.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">torisoftt.com</a> •
                    <strong> Actualizado:</strong> Julio 2025
                </p>
            </div>
        </div>
    </section>
</Layout>
)
}

export default LegalPages