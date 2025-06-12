// src/components/ClassList.jsx - SIDEBAR DE CLASES COMO COURSERA
import React, { useState } from 'react'
import progressService from '../services/progress'

const ClassList = ({
                       modulos,
                       currentClaseId,
                       onClassSelect,
                       courseData,
                       onProgressUpdate
                   }) => {
    const [expandedModules, setExpandedModules] = useState({})

    // Expandir automáticamente el módulo que contiene la clase actual
    React.useEffect(() => {
        if (currentClaseId && modulos) {
            const moduleWithCurrentClass = modulos.find(modulo =>
                modulo.clases?.some(clase => clase.id === currentClaseId)
            )

            if (moduleWithCurrentClass) {
                setExpandedModules(prev => ({
                    ...prev,
                    [moduleWithCurrentClass.modulo_id]: true
                }))
            }
        }
    }, [currentClaseId, modulos])

    const toggleModule = (moduloId) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduloId]: !prev[moduloId]
        }))
    }

    const handleClassClick = async (clase) => {
        if (!clase.puede_acceder) {
            return
        }

        if (onClassSelect) {
            onClassSelect(clase)
        }
    }

    const markClassAsCompleted = async (claseId, event) => {
        event.stopPropagation()

        try {
            const result = await progressService.markClassAsCompleted(claseId)

            if (result.success && onProgressUpdate) {
                onProgressUpdate(claseId, 100, true)
            }
        } catch (error) {
            console.error('Error marcando clase como completada:', error)
        }
    }

    const getClassIcon = (clase) => {
        if (clase.completada) {
            return (
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }

        if (clase.porcentaje_visto > 0) {
            return (
                <div className="relative w-5 h-5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth={2} />
                    </svg>
                    <div
                        className="absolute inset-0 rounded-full border-2 border-blue-600"
                        style={{
                            background: `conic-gradient(#2563eb ${clase.porcentaje_visto * 3.6}deg, transparent 0deg)`
                        }}
                    ></div>
                </div>
            )
        }

        if (clase.video_youtube_url) {
            return (
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        }

        return (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        )
    }

    const getClassStatusColor = (clase) => {
        if (clase.id === currentClaseId) {
            return 'bg-medico-blue text-white'
        }

        if (!clase.puede_acceder) {
            return 'bg-gray-50 text-gray-400 cursor-not-allowed'
        }

        if (clase.completada) {
            return 'bg-green-50 text-green-800 hover:bg-green-100'
        }

        if (clase.porcentaje_visto > 0) {
            return 'bg-blue-50 text-blue-800 hover:bg-blue-100'
        }

        return 'bg-white text-gray-800 hover:bg-gray-50'
    }

    const formatDuration = (minutes) => {
        if (!minutes) return ''
        if (minutes < 60) return `${minutes}min`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}min`
    }

    const calculateModuleProgress = (modulo) => {
        if (!modulo.clases || modulo.clases.length === 0) {
            return { porcentaje: 0, completadas: 0, total: 0 }
        }

        const total = modulo.clases.length
        const completadas = modulo.clases.filter(clase => clase.completada).length
        const porcentaje = Math.round((completadas / total) * 100)

        return { porcentaje, completadas, total }
    }

    if (!modulos || modulos.length === 0) {
        return (
            <div className="p-6 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin contenido</h3>
                <p className="text-gray-600">Este curso aún no tiene módulos o clases</p>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto bg-white border-r border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Contenido del curso</h2>
                {courseData && (
                    <p className="text-sm text-gray-600 mt-1">{courseData.titulo}</p>
                )}
            </div>

            {/* Lista de módulos */}
            <div className="space-y-1">
                {modulos.map((modulo, moduloIndex) => {
                    const moduleProgress = calculateModuleProgress(modulo)
                    const isExpanded = expandedModules[modulo.modulo_id]

                    return (
                        <div key={modulo.modulo_id} className="border-b border-gray-100 last:border-b-0">
                            {/* Header del módulo */}
                            <button
                                onClick={() => toggleModule(modulo.modulo_id)}
                                className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-medico-blue text-white rounded text-sm font-medium flex items-center justify-center">
                                                {moduloIndex + 1}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-medium text-gray-900 truncate">
                                                    {modulo.modulo_titulo}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {moduleProgress.completadas} de {moduleProgress.total} clases
                                                </p>
                                            </div>
                                        </div>

                                        {/* Barra de progreso del módulo */}
                                        <div className="mt-2 flex items-center space-x-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-medico-blue h-1.5 rounded-full transition-all duration-300"
                                                    style={{ width: `${moduleProgress.porcentaje}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-gray-500 min-w-0">
                                                {moduleProgress.porcentaje}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-shrink-0 ml-2">
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                                isExpanded ? 'transform rotate-180' : ''
                                            }`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            {/* Lista de clases del módulo */}
                            {isExpanded && modulo.clases && (
                                <div className="bg-gray-25">
                                    {modulo.clases.map((clase, claseIndex) => (
                                        <div
                                            key={clase.id}
                                            className={`relative border-l-4 transition-all duration-200 ${
                                                clase.id === currentClaseId
                                                    ? 'border-medico-blue bg-blue-50'
                                                    : 'border-transparent'
                                            }`}
                                        >
                                            <button
                                                onClick={() => handleClassClick(clase)}
                                                disabled={!clase.puede_acceder}
                                                className={`w-full p-3 pl-6 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-medico-blue focus:ring-inset ${
                                                    getClassStatusColor(clase)
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    {/* Icono de estado */}
                                                    <div className="flex-shrink-0">
                                                        {getClassIcon(clase)}
                                                    </div>

                                                    {/* Información de la clase */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between">
                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="text-sm font-medium truncate">
                                                                    {claseIndex + 1}. {clase.titulo}
                                                                </h4>

                                                                <div className="flex items-center space-x-2 mt-1">
                                                                    {clase.duracion_minutos && (
                                                                        <span className="text-xs text-gray-500">
                                                                            {formatDuration(clase.duracion_minutos)}
                                                                        </span>
                                                                    )}

                                                                    {clase.es_gratuita && (
                                                                        <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                                                            Gratis
                                                                        </span>
                                                                    )}

                                                                    {!clase.puede_acceder && (
                                                                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex items-center">
                                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                            </svg>
                                                                            Bloqueado
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Botón de marcar como completada */}
                                                            {clase.puede_acceder && !clase.completada && clase.porcentaje_visto > 50 && (
                                                                <button
                                                                    onClick={(e) => markClassAsCompleted(clase.id, e)}
                                                                    className="ml-2 p-1 text-gray-400 hover:text-green-600 transition-colors"
                                                                    title="Marcar como completada"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Progreso de la clase */}
                                                        {clase.porcentaje_visto > 0 && clase.porcentaje_visto < 100 && (
                                                            <div className="mt-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="flex-1 bg-gray-200 rounded-full h-1">
                                                                        <div
                                                                            className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                                                            style={{ width: `${clase.porcentaje_visto}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500 min-w-0">
                                                                        {clase.porcentaje_visto}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Footer con resumen */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                    <div className="flex justify-between items-center">
                        <span>Progreso total:</span>
                        <span className="font-medium">
                            {modulos.reduce((acc, modulo) => {
                                const progress = calculateModuleProgress(modulo)
                                return acc + progress.completadas
                            }, 0)} de {modulos.reduce((acc, modulo) => acc + (modulo.clases?.length || 0), 0)} clases
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ClassList