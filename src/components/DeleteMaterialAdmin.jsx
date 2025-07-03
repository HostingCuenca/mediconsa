// src/components/DeleteMaterialAdmin.jsx
import React, { useState } from 'react'
import materialServices from '../services/materiales'

const DeleteMaterialAdmin = ({
                                 material,
                                 isOpen,
                                 onClose,
                                 onSuccess,
                                 onError
                             }) => {
    const [deleting, setDeleting] = useState(false)

    // Función principal de eliminación
    const handleDelete = async () => {
        if (!material) return

        try {
            setDeleting(true)

            // Enviar array con un solo ID al método masivo
            const result = await materialServices.deleteMaterials([material.id])

            if (result.success) {
                onSuccess(`Material "${material.titulo}" eliminado exitosamente`)
                onClose()
            } else {
                onError(result.error || 'Error eliminando material')
            }
        } catch (error) {
            console.error('Error:', error)
            onError('Error de conexión')
        } finally {
            setDeleting(false)
        }
    }

    const handleClose = () => {
        if (!deleting) {
            onClose()
        }
    }

    // Función para obtener badge del tipo de material
    const getTipoMaterialBadge = (tipo) => {
        const tipos = {
            'curso': { name: 'Material de Curso', icon: '📚' },
            'libre': { name: 'Descarga Gratuita', icon: '🆓' },
            'premium': { name: 'Material Premium', icon: '⭐' }
        }
        return tipos[tipo] || { name: tipo, icon: '📄' }
    }

    // Función para obtener badge del tipo de archivo
    const getTipoArchivoBadge = (tipoArchivo) => {
        const tipos = {
            'pdf': '📄',
            'doc': '📝', 'docx': '📝',
            'xls': '📊', 'xlsx': '📊',
            'ppt': '📽️', 'pptx': '📽️',
            'zip': '🗜️', 'rar': '🗜️',
            'mp4': '🎥',
            'mp3': '🎵'
        }
        return tipos[tipoArchivo?.toLowerCase()] || '📎'
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    if (!isOpen || !material) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 text-xl">🗑️</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Eliminar Material
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Acción irreversible
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={deleting}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Alerta de advertencia */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <span className="text-red-600 text-2xl flex-shrink-0">⚠️</span>
                            <div>
                                <p className="text-red-800 font-semibold mb-1">
                                    Esta acción no se puede deshacer
                                </p>
                                <p className="text-red-700 text-sm">
                                    El material será eliminado permanentemente del sistema y ya no estará disponible para los usuarios.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Información del material */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3">Material a eliminar:</h4>

                        <div className="space-y-3">
                            {/* Título y tipo */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900 mb-1">
                                        {material.titulo}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            {getTipoMaterialBadge(material.tipo_material).icon} {getTipoMaterialBadge(material.tipo_material).name}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-2xl ml-3">
                                    {getTipoArchivoBadge(material.tipo_archivo)}
                                </div>
                            </div>

                            {/* Información adicional */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Curso:</span>
                                    <p className="text-gray-900 font-medium">{material.curso_titulo}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Precio:</span>
                                    <p className="text-gray-900 font-medium">
                                        {material.es_gratuito || material.precio === 0 ? 'Gratuito' : formatPrice(material.precio)}
                                    </p>
                                </div>
                            </div>

                            {/* ID del material */}
                            <div>
                                <span className="text-gray-600 text-xs">ID:</span>
                                <p className="text-gray-800 text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                    {material.id}
                                </p>
                            </div>

                            {/* URL del archivo si existe */}
                            {material.archivo_url && (
                                <div>
                                    <span className="text-gray-600 text-xs">Archivo:</span>
                                    <p className="text-gray-800 text-xs bg-gray-100 px-2 py-1 rounded truncate">
                                        {material.archivo_url}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            disabled={deleting}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                            disabled={deleting}
                        >
                            {deleting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Eliminando...</span>
                                </>
                            ) : (
                                <>
                                    <span>🗑️</span>
                                    <span>Eliminar Material</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Información adicional */}
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500">
                            💡 Tip: Asegúrate de que este material ya no sea necesario antes de eliminarlo
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteMaterialAdmin