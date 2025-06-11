// src/adminpanel/modals/CreateCourseModal.jsx
import React, { useState } from 'react'

const CreateCourseModal = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        slug: '',
        precio: 0,
        tipoExamen: '',
        esGratuito: false
    })
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const tiposExamen = [
        { value: 'caces', label: 'CACES' },
        { value: 'senesyct', label: 'SENESYCT' },
        { value: 'medicina_rural', label: 'Medicina Rural' },
        { value: 'enarm', label: 'ENARM' }
    ]

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Auto-generar slug
        if (name === 'titulo') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')

            setFormData(prev => ({
                ...prev,
                slug
            }))
        }

        // Limpiar errores
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.titulo.trim()) {
            newErrors.titulo = 'El título es requerido'
        }

        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción es requerida'
        }

        if (!formData.slug.trim()) {
            newErrors.slug = 'El slug es requerido'
        }

        if (!formData.esGratuito && (!formData.precio || formData.precio <= 0)) {
            newErrors.precio = 'El precio debe ser mayor a 0'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)

        try {
            await onSubmit({
                ...formData,
                precio: formData.esGratuito ? 0 : parseFloat(formData.precio)
            })
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-medico-blue">Crear Nuevo Curso</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Título */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título del Curso *
                        </label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                errors.titulo ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Ej: Preparación ENARM 2025"
                        />
                        {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción *
                        </label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            rows={4}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                errors.descripcion ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Describe qué aprenderán los estudiantes..."
                        />
                        {errors.descripcion && <p className="mt-1 text-sm text-red-600">{errors.descripcion}</p>}
                    </div>

                    {/* Slug */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slug (URL amigable) *
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                errors.slug ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="preparacion-enarm-2025"
                        />
                        {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                    </div>

                    {/* Tipo de Examen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Examen
                        </label>
                        <select
                            name="tipoExamen"
                            value={formData.tipoExamen}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                        >
                            <option value="">Seleccionar tipo...</option>
                            {tiposExamen.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Precio y Gratuito */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="esGratuito"
                                    checked={formData.esGratuito}
                                    onChange={handleChange}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Curso Gratuito</span>
                            </label>
                        </div>

                        {!formData.esGratuito && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio (USD) *
                                </label>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                        errors.precio ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="99.99"
                                />
                                {errors.precio && <p className="mt-1 text-sm text-red-600">{errors.precio}</p>}
                            </div>
                        )}
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creando...' : 'Crear Curso'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateCourseModal