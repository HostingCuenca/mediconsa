@ -1,631 +0,0 @@
// src/admin/AdminApiDocs.jsx - Documentación completa e interactiva de la API
import React, { useState } from 'react'
import Layout from '../components/Layout'

const AdminApiDocs = () => {
    const [expandedSection, setExpandedSection] = useState('auth')
    const [testingEndpoint, setTestingEndpoint] = useState('')

    // Base URL de la API
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'

    const endpoints = {
        auth: {
            title: '🔐 Autenticación',
            description: 'Gestión de usuarios, login y perfiles',
            color: 'blue',
            endpoints: [
                {
                    method: 'POST',
                    path: '/auth/register',
                    description: 'Registro de nuevos usuarios',
                    auth: false,
                    body: {
                        email: 'string (requerido)',
                        password: 'string (mín 6 chars)',
                        nombreCompleto: 'string (requerido)',
                        nombreUsuario: 'string (requerido, sin espacios)'
                    },
                    response: {
                        success: true,
                        message: 'Usuario creado exitosamente',
                        data: {
                            user: 'Objeto usuario normalizado',
                            token: 'JWT token válido por 7 días'
                        }
                    }
                },
                {
                    method: 'POST',
                    path: '/auth/login',
                    description: 'Inicio de sesión',
                    auth: false,
                    body: {
                        email: 'string (requerido)',
                        password: 'string (requerido)'
                    },
                    response: {
                        success: true,
                        message: 'Login exitoso',
                        data: {
                            user: 'Objeto usuario con campos normalizados',
                            token: 'JWT token'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/auth/profile',
                    description: 'Obtener perfil del usuario autenticado',
                    auth: true,
                    response: {
                        success: true,
                        data: {
                            user: 'Perfil completo del usuario'
                        }
                    }
                }
            ]
        },
        courses: {
            title: '📚 Cursos (Público)',
            description: 'Endpoints públicos para consultar cursos',
            color: 'green',
            endpoints: [
                {
                    method: 'GET',
                    path: '/courses',
                    description: 'Lista todos los cursos con filtros opcionales',
                    auth: false,
                    queryParams: {
                        tipo: 'caces|senesyct|medicina_rural|enarm (opcional)',
                        gratuito: 'true|false (opcional)',
                        search: 'string para buscar en título/descripción'
                    },
                    response: {
                        success: true,
                        data: {
                            cursos: 'Array de cursos con instructor',
                            total: 'Número total de resultados'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/courses/:id',
                    description: 'Detalle completo de un curso específico',
                    auth: false,
                    response: {
                        success: true,
                        data: {
                            curso: 'Curso con módulos, clases y metadatos'
                        }
                    }
                },
                {
                    method: 'POST',
                    path: '/courses',
                    description: 'Crear nuevo curso (solo admin/instructor)',
                    auth: true,
                    roles: ['admin', 'instructor'],
                    body: {
                        titulo: 'string (requerido)',
                        descripcion: 'string (requerido)',
                        slug: 'string único (requerido)',
                        precio: 'number (default: 0)',
                        tipoExamen: 'string (opcional)',
                        esGratuito: 'boolean (default: false)'
                    }
                }
            ]
        },
        courseManagement: {
            title: '⚙️ Gestión de Contenido',
            description: 'CRUD completo para admins e instructores',
            color: 'purple',
            endpoints: [
                {
                    method: 'GET',
                    path: '/course-management/course/:cursoId',
                    description: 'Contenido completo del curso para edición',
                    auth: true,
                    roles: ['admin', 'instructor'],
                    response: {
                        success: true,
                        data: {
                            curso: 'Información del curso',
                            modulos: 'Array de módulos con clases',
                            simulacros: 'Array de simulacros'
                        }
                    }
                },
                {
                    method: 'POST',
                    path: '/course-management/modules',
                    description: 'Crear módulo en un curso',
                    auth: true,
                    roles: ['admin', 'instructor'],
                    body: {
                        cursoId: 'number (requerido)',
                        titulo: 'string (requerido)',
                        descripcion: 'string (opcional)',
                        orden: 'number (requerido)'
                    }
                },
                {
                    method: 'POST',
                    path: '/course-management/classes',
                    description: 'Crear clase en un módulo',
                    auth: true,
                    roles: ['admin', 'instructor'],
                    body: {
                        moduloId: 'number (requerido)',
                        titulo: 'string (requerido)',
                        descripcion: 'string (opcional)',
                        videoYoutubeUrl: 'string URL de YouTube (opcional)',
                        duracionMinutos: 'number (opcional)',
                        esGratuita: 'boolean (default: false)',
                        orden: 'number (requerido)'
                    }
                },
                {
                    method: 'POST',
                    path: '/course-management/simulacros',
                    description: 'Crear simulacro en un curso',
                    auth: true,
                    roles: ['admin', 'instructor'],
                    body: {
                        cursoId: 'number (requerido)',
                        titulo: 'string (requerido)',
                        descripcion: 'string (opcional)',
                        modoEvaluacion: 'practica|realista|examen (requerido)',
                        tiempoLimiteMinutos: 'number (opcional)',
                        tiempoPorPreguntaSegundos: 'number (opcional)',
                        numeroPreguntas: 'number (requerido)',
                        intentosPermitidos: 'number (-1 para ilimitados)',
                        randomizarPreguntas: 'boolean (default: true)',
                        randomizarOpciones: 'boolean (default: true)',
                        mostrarRespuestasDespues: 'number (0|1|2)'
                    }
                },
                {
                    method: 'POST',
                    path: '/course-management/questions',
                    description: 'Crear pregunta con opciones para simulacro',
                    auth: true,
                    roles: ['admin', 'instructor'],
                    body: {
                        simulacroId: 'number (requerido)',
                        enunciado: 'string (requerido)',
                        tipoPregunta: 'multiple|multiple_respuesta|completar|unir|rellenar',
                        explicacion: 'string (opcional)',
                        imagenUrl: 'string URL (opcional)',
                        opciones: [
                            {
                                textoOpcion: 'string (requerido)',
                                esCorrecta: 'boolean (al menos una debe ser true)'
                            }
                        ]
                    }
                }
            ]
        },
        enrollments: {
            title: '📝 Inscripciones y Pagos',
            description: 'Sistema de inscripciones con aprobación manual',
            color: 'yellow',
            endpoints: [
                {
                    method: 'POST',
                    path: '/enrollments',
                    description: 'Inscribirse a un curso',
                    auth: true,
                    body: {
                        cursoId: 'number (requerido)'
                    },
                    response: {
                        success: true,
                        message: 'Mensaje personalizado según tipo de curso',
                        data: {
                            inscripcion: 'Objeto inscripción',
                            whatsappMessage: 'Mensaje pre-formateado para WhatsApp'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/enrollments/my',
                    description: 'Mis inscripciones con progreso',
                    auth: true,
                    response: {
                        success: true,
                        data: {
                            inscripciones: 'Array con cursos, progreso y metadatos'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/enrollments/check-access/:cursoId',
                    description: 'Verificar acceso a un curso específico',
                    auth: true,
                    response: {
                        success: true,
                        data: {
                            tieneAcceso: 'boolean',
                            esGratuito: 'boolean',
                            estadoPago: 'pendiente|habilitado|no_inscrito',
                            fechaHabilitacion: 'date (si aplica)'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/enrollments/pending',
                    description: 'Pagos pendientes de aprobación (solo admin)',
                    auth: true,
                    roles: ['admin'],
                    response: {
                        success: true,
                        data: {
                            pagosPendientes: 'Array de inscripciones pendientes',
                            total: 'Número total'
                        }
                    }
                },
                {
                    method: 'PATCH',
                    path: '/enrollments/:inscripcionId/approve',
                    description: 'Aprobar pago manualmente (solo admin)',
                    auth: true,
                    roles: ['admin'],
                    response: {
                        success: true,
                        message: 'Confirmación de aprobación',
                        data: {
                            inscripcion: 'Inscripción actualizada'
                        }
                    }
                }
            ]
        },
        simulacros: {
            title: '🧪 Simulacros y Exámenes',
            description: 'Sistema completo de evaluaciones',
            color: 'red',
            endpoints: [
                {
                    method: 'GET',
                    path: '/simulacros/course/:cursoId',
                    description: 'Simulacros disponibles por curso',
                    auth: true,
                    response: {
                        success: true,
                        data: {
                            simulacros: 'Array con metadatos y estadísticas',
                            curso: 'Información del curso'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/simulacros/:simulacroId/questions',
                    description: 'Obtener preguntas del simulacro (inicia sesión)',
                    auth: true,
                    response: {
                        success: true,
                        data: {
                            simulacro: 'Config del simulacro',
                            preguntas: 'Array de preguntas randomizadas',
                            configuracion: 'Límites y reglas'
                        }
                    }
                },
                {
                    method: 'POST',
                    path: '/simulacros/:simulacroId/submit',
                    description: 'Enviar respuestas y obtener calificación',
                    auth: true,
                    body: {
                        respuestas: [
                            {
                                preguntaId: 'number',
                                opcionSeleccionadaId: 'number'
                            }
                        ],
                        tiempoEmpleadoMinutos: 'number (opcional)'
                    },
                    response: {
                        success: true,
                        data: {
                            intentoId: 'ID del intento',
                            puntaje: 'Porcentaje (0-100)',
                            respuestasCorrectas: 'number',
                            totalPreguntas: 'number',
                            modoEvaluacion: 'Modo del simulacro',
                            detalle: 'Array detallado (solo modo práctica)'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/simulacros/my-attempts',
                    description: 'Mis intentos de simulacros',
                    auth: true,
                    queryParams: {
                        simulacroId: 'number (opcional)',
                        cursoId: 'number (opcional)'
                    }
                },
                {
                    method: 'GET',
                    path: '/simulacros/attempt/:intentoId',
                    description: 'Detalle de un intento específico',
                    auth: true
                }
            ]
        },
        progress: {
            title: '📊 Progreso Académico',
            description: 'Tracking detallado del aprendizaje',
            color: 'indigo',
            endpoints: [
                {
                    method: 'PATCH',
                    path: '/progress/class/:claseId',
                    description: 'Actualizar progreso de una clase',
                    auth: true,
                    body: {
                        porcentajeVisto: 'number (0-100, requerido)',
                        completada: 'boolean (opcional, auto si >= 95%)'
                    },
                    response: {
                        success: true,
                        message: 'Progreso actualizado',
                        data: {
                            progreso: 'Objeto progreso actualizado'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/progress/course/:cursoId',
                    description: 'Progreso completo por curso',
                    auth: true,
                    response: {
                        success: true,
                        data: {
                            curso: 'Info del curso y acceso',
                            resumen: 'Estadísticas generales',
                            modulos: 'Array detallado con progreso por clase'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/progress/my-overall',
                    description: 'Progreso general del usuario',
                    auth: true,
                    response: {
                        success: true,
                        data: {
                            estadisticas: 'Resumen global',
                            cursos: 'Array de cursos con progreso'
                        }
                    }
                }
            ]
        },
        dashboard: {
            title: '📈 Dashboards',
            description: 'Estadísticas y métricas por rol',
            color: 'pink',
            endpoints: [
                {
                    method: 'GET',
                    path: '/dashboard/student',
                    description: 'Dashboard para estudiantes',
                    auth: true,
                    response: {
                        success: true,
                        data: {
                            estadisticas: 'Métricas del estudiante',
                            cursosRecientes: 'Últimos cursos accedidos',
                            actividadReciente: 'Historial de actividad'
                        }
                    }
                },
                {
                    method: 'GET',
                    path: '/dashboard/admin',
                    description: 'Dashboard administrativo',
                    auth: true,
                    roles: ['admin'],
                    response: {
                        success: true,
                        data: {
                            estadisticas: 'Métricas de la plataforma',
                            usuariosRecientes: 'Nuevos registros',
                            pagosPendientes: 'Inscripciones por aprobar'
                        }
                    }
                }
            ]
        }
    }

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? '' : section)
    }

    const getColorClasses = (color) => {
        const colors = {
            blue: 'border-blue-200 bg-blue-50 text-blue-900',
            green: 'border-green-200 bg-green-50 text-green-900',
            purple: 'border-purple-200 bg-purple-50 text-purple-900',
            yellow: 'border-yellow-200 bg-yellow-50 text-yellow-900',
            red: 'border-red-200 bg-red-50 text-red-900',
            indigo: 'border-indigo-200 bg-indigo-50 text-indigo-900',
            pink: 'border-pink-200 bg-pink-50 text-pink-900'
        }
        return colors[color] || colors.blue
    }

    const getMethodColor = (method) => {
        const colors = {
            GET: 'bg-green-100 text-green-800',
            POST: 'bg-blue-100 text-blue-800',
            PATCH: 'bg-yellow-100 text-yellow-800',
            PUT: 'bg-orange-100 text-orange-800',
            DELETE: 'bg-red-100 text-red-800'
        }
        return colors[method] || colors.GET
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Documentación de la API</h1>
                    <p className="text-medico-gray mt-2">
                        Referencia completa de todos los endpoints del backend Mediconsa
                    </p>
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">{API_BASE}</code>
                        </p>
                        <p className="text-sm text-blue-800 mt-2">
                            <strong>Autenticación:</strong> Header <code>Authorization: Bearer &lt;token&gt;</code>
                        </p>
                    </div>
                </div>

                {/* API Sections */}
                <div className="space-y-6">
                    {Object.entries(endpoints).map(([key, section]) => (
                        <div key={key} className={`border rounded-lg ${getColorClasses(section.color)}`}>
                            <button
                                onClick={() => toggleSection(key)}
                                className="w-full p-6 text-left flex items-center justify-between hover:bg-opacity-75 transition-colors"
                            >
                                <div>
                                    <h2 className="text-xl font-bold">{section.title}</h2>
                                    <p className="text-sm opacity-75 mt-1">{section.description}</p>
                                </div>
                                <svg
                                    className={`w-6 h-6 transition-transform ${expandedSection === key ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {expandedSection === key && (
                                <div className="px-6 pb-6">
                                    <div className="space-y-4">
                                        {section.endpoints.map((endpoint, index) => (
                                            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center space-x-3 mb-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                                                        {endpoint.method}
                                                    </span>
                                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{API_BASE}{endpoint.path}</code>
                                                    {endpoint.auth && (
                                                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                                            🔒 Auth Required
                                                        </span>
                                                    )}
                                                    {endpoint.roles && (
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                            👑 {endpoint.roles.join(', ')}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-gray-700 mb-4">{endpoint.description}</p>

                                                {endpoint.queryParams && (
                                                    <div className="mb-4">
                                                        <h4 className="font-semibold text-gray-900 mb-2">Query Parameters:</h4>
                                                        <div className="bg-gray-50 p-3 rounded text-sm">
                                                            <pre>{JSON.stringify(endpoint.queryParams, null, 2)}</pre>
                                                        </div>
                                                    </div>
                                                )}

                                                {endpoint.body && (
                                                    <div className="mb-4">
                                                        <h4 className="font-semibold text-gray-900 mb-2">Request Body:</h4>
                                                        <div className="bg-gray-50 p-3 rounded text-sm">
                                                            <pre>{JSON.stringify(endpoint.body, null, 2)}</pre>
                                                        </div>
                                                    </div>
                                                )}

                                                {endpoint.response && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Response Example:</h4>
                                                        <div className="bg-gray-50 p-3 rounded text-sm">
                                                            <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Additional Info */}
                <div className="mt-8 space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🔧 Información Técnica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <h4 className="font-semibold">Formato de Respuesta:</h4>
                                <ul className="mt-2 space-y-1 text-gray-600">
                                    <li>• Todas las respuestas son JSON</li>
                                    <li>• Campo <code>success: boolean</code> siempre presente</li>
                                    <li>• Campo <code>message: string</code> en casos relevantes</li>
                                    <li>• Campo <code>data: object</code> con el contenido</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold">Códigos de Estado:</h4>
                                <ul className="mt-2 space-y-1 text-gray-600">
                                    <li>• <code>200</code> - Éxito</li>
                                    <li>• <code>201</code> - Creado</li>
                                    <li>• <code>400</code> - Error de validación</li>
                                    <li>• <code>401</code> - No autenticado</li>
                                    <li>• <code>403</code> - Sin permisos</li>
                                    <li>• <code>404</code> - No encontrado</li>
                                    <li>• <code>500</code> - Error del servidor</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-yellow-900 mb-4">⚠️ Notas Importantes</h3>
                        <ul className="space-y-2 text-sm text-yellow-800">
                            <li>• Los tokens JWT expiran en 7 días</li>
                            <li>• Los campos de usuario se normalizan de snake_case a camelCase</li>
                            <li>• Los simulacros en modo "examen" no muestran respuestas</li>
                            <li>• Las inscripciones gratuitas se aprueban automáticamente</li>
                            <li>• Solo admins pueden aprobar pagos y gestionar usuarios</li>
                            <li>• El progreso se calcula automáticamente al 95% de visualización</li>
                        </ul>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AdminApiDocs