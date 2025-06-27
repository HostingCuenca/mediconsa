// src/adminpanel/Courses.jsx - REFACTORIZADO Y COMPATIBLE AL 100%
import React, { useState, useEffect } from 'react'
import Layout from '../utils/Layout'
import coursesService from '../services/courses'

const AdminCourses = () => {
    // ========== ESTADOS PRINCIPALES ==========
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Estados para modales/formularios
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario (SOLO campos que existen en el backend)
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        slug: '',
        miniatura_url: '',
        precio: 0,
        descuento: 0,
        tipo_examen: '',
        es_gratuito: false,
        activo: true
    })
    const [formErrors, setFormErrors] = useState({})

    // Estados de filtros y búsqueda
    const [filters, setFilters] = useState({
        search: '',
        tipo: '',
        gratuito: '',
        sortBy: 'fecha_creacion'
    })

    // ========== CONFIGURACIONES ==========
    const tiposExamen = [
        { value: '', label: 'Todos los tipos' },
        { value: 'caces', label: 'CACES' },
        { value: 'senesyct', label: 'SENESYCT' },
        { value: 'medicina_rural', label: 'Medicina Rural' },
        { value: 'enarm', label: 'ENARM' }
    ]

    // ========== EFECTOS ==========
    useEffect(() => {
        loadCourses()
    }, [filters])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadCourses = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await coursesService.getAllCourses(filters)

            if (result.success) {
                setCourses(result.data.cursos || [])
            } else {
                setError(result.error || 'Error cargando cursos')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    // ========== FUNCIONES DEL FORMULARIO ==========
    const resetForm = () => {
        setFormData({
            titulo: '',
            descripcion: '',
            slug: '',
            miniatura_url: '',
            precio: 0,
            descuento: 0,
            tipo_examen: '',
            es_gratuito: false,
            activo: true
        })
        setFormErrors({})
        setSelectedCourse(null)
    }

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Auto-generar slug desde título
        if (name === 'titulo') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/(^-|-$)/g, '')

            setFormData(prev => ({
                ...prev,
                slug
            }))
        }

        // Limpiar errores
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const validateForm = () => {
        const validation = coursesService.validateCourseData(formData)
        setFormErrors(validation.errors)
        return validation.isValid
    }

    // ========== ACCIONES DE CURSO ==========
    const handleCreateCourse = () => {
        resetForm()
        setShowCreateForm(true)
        setShowEditForm(false)
    }

    const handleEditCourse = (course) => {
        setFormData({
            titulo: course.titulo || '',
            descripcion: course.descripcion || '',
            slug: course.slug || '',
            miniatura_url: course.miniatura_url || '',
            precio: parseFloat(course.precio) || 0,
            descuento: parseInt(course.descuento) || 0,
            tipo_examen: course.tipo_examen || '',
            es_gratuito: Boolean(course.es_gratuito),
            activo: Boolean(course.activo)
        })
        setSelectedCourse(course)
        setShowEditForm(true)
        setShowCreateForm(false)
        setFormErrors({})
    }

    const handleViewCourse = (course) => {
        setSelectedCourse(course)
        setShowViewModal(true)
    }

    const handleDeleteCourse = (course) => {
        setSelectedCourse(course)
        setShowDeleteConfirm(true)
    }

    const handleSubmitForm = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setFormLoading(true)

        try {
            // Formatear datos según el backend
            const courseData = coursesService.formatCourseData(formData)

            let result
            if (showEditForm && selectedCourse) {
                result = await coursesService.updateCourse(selectedCourse.id, courseData)
            } else {
                result = await coursesService.createCourse(courseData)
            }

            if (result.success) {
                setShowCreateForm(false)
                setShowEditForm(false)
                resetForm()
                await loadCourses()
                setSuccess(result.message || (showEditForm ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente'))
            } else {
                setError(result.error || 'Error procesando el curso')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión al procesar el curso')
        } finally {
            setFormLoading(false)
        }
    }

    const confirmDeleteCourse = async () => {
        if (!selectedCourse) return

        try {
            setFormLoading(true)
            const result = await coursesService.deleteCourse(selectedCourse.id)

            if (result.success) {
                setShowDeleteConfirm(false)
                setSelectedCourse(null)
                await loadCourses()
                setSuccess(result.message || 'Curso eliminado exitosamente')
            } else {
                setError(result.error || 'Error eliminando el curso')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión al eliminar el curso')
        } finally {
            setFormLoading(false)
        }
    }

    const handleCancelForm = () => {
        setShowCreateForm(false)
        setShowEditForm(false)
        resetForm()
    }

    // ========== FUNCIONES DE NAVEGACIÓN ==========
    const handleManageCourse = (course) => {
        window.location.href = `/admin/curso/${course.id}/gestionar`
    }

    // ========== FUNCIONES DE UTILIDAD ==========
    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price)
    }

    const getStatusColor = (course) => {
        if (!course.activo) return 'bg-gray-100 text-gray-800'
        if (course.es_gratuito) return 'bg-green-100 text-green-800'
        return 'bg-blue-100 text-blue-800'
    }

    const getStatusText = (course) => {
        if (!course.activo) return 'Inactivo'
        if (course.es_gratuito) return 'Gratuito'
        return formatPrice(course.precio)
    }

    // ========== RENDER ==========
    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* ========== HEADER ========== */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue">Gestión de Cursos</h1>
                        <p className="text-medico-gray mt-2">Administra todos los cursos de la plataforma</p>
                    </div>

                    {!showCreateForm && !showEditForm && (
                        <button
                            onClick={handleCreateCourse}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Crear Curso</span>
                        </button>
                    )}
                </div>

                {/* ========== MENSAJES ========== */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-600">{error}</p>
                        </div>
                        <button
                            onClick={() => setError('')}
                            className="mt-2 text-red-700 underline hover:no-underline text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-600">{success}</p>
                        </div>
                    </div>
                )}

                {/* ========== FILTROS ========== */}
                {!showCreateForm && !showEditForm && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                                <input
                                    type="text"
                                    name="search"
                                    value={filters.search}
                                    onChange={handleFilterChange}
                                    placeholder="Título, descripción..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    name="tipo"
                                    value={filters.tipo}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                >
                                    {tiposExamen.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                <select
                                    name="gratuito"
                                    value={filters.gratuito}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                >
                                    <option value="">Todos</option>
                                    <option value="true">Gratuitos</option>
                                    <option value="false">De Pago</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={() => setFilters({
                                        search: '',
                                        tipo: '',
                                        gratuito: '',
                                        sortBy: 'fecha_creacion'
                                    })}
                                    className="w-full px-3 py-2 text-medico-blue border border-medico-blue rounded-lg hover:bg-medico-blue hover:text-white transition-colors"
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== FORMULARIO ========== */}
                {(showCreateForm || showEditForm) && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-medico-blue">
                                {showEditForm ? 'Editar Curso' : 'Crear Nuevo Curso'}
                            </h2>
                            <button
                                onClick={handleCancelForm}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmitForm} className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Título */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Título del Curso *
                                    </label>
                                    <input
                                        type="text"
                                        name="titulo"
                                        value={formData.titulo}
                                        onChange={handleFormChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formErrors.titulo ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Ej: Preparación ENARM 2025"
                                    />
                                    {formErrors.titulo && <p className="mt-1 text-sm text-red-600">{formErrors.titulo}</p>}
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
                                        onChange={handleFormChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formErrors.slug ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="preparacion-enarm-2025"
                                    />
                                    {formErrors.slug && <p className="mt-1 text-sm text-red-600">{formErrors.slug}</p>}
                                </div>

                                {/* Descripción */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descripción *
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleFormChange}
                                        rows={4}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formErrors.descripcion ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Describe qué aprenderán los estudiantes en este curso..."
                                    />
                                    {formErrors.descripcion && <p className="mt-1 text-sm text-red-600">{formErrors.descripcion}</p>}
                                </div>

                                {/* URL de Miniatura */}
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        URL de la Imagen
                                    </label>
                                    <input
                                        type="url"
                                        name="miniatura_url"
                                        value={formData.miniatura_url}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                    {formData.miniatura_url && (
                                        <div className="mt-2">
                                            <img
                                                src={formData.miniatura_url}
                                                alt="Preview"
                                                className="w-32 h-20 object-cover rounded border"
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Tipo de Examen */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Examen
                                    </label>
                                    <select
                                        name="tipo_examen"
                                        value={formData.tipo_examen}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        {tiposExamen.map(tipo => (
                                            <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Precio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio (USD)
                                    </label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleFormChange}
                                        min="0"
                                        step="0.01"
                                        disabled={formData.es_gratuito}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formData.es_gratuito ? 'bg-gray-100' : 'border-gray-300'
                                        } ${formErrors.precio ? 'border-red-300' : ''}`}
                                        placeholder="99.99"
                                    />
                                    {formErrors.precio && <p className="mt-1 text-sm text-red-600">{formErrors.precio}</p>}
                                </div>

                                {/* Descuento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Descuento (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="descuento"
                                        value={formData.descuento}
                                        onChange={handleFormChange}
                                        min="0"
                                        max="100"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Checkboxes */}
                                <div className="lg:col-span-2 space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="es_gratuito"
                                            checked={formData.es_gratuito}
                                            onChange={handleFormChange}
                                            className="mr-2 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Curso Gratuito</span>
                                    </label>

                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            checked={formData.activo}
                                            onChange={handleFormChange}
                                            className="mr-2 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Curso Activo</span>
                                    </label>
                                </div>
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={handleCancelForm}
                                    className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                >
                                    {formLoading && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{formLoading ? 'Procesando...' : (showEditForm ? 'Actualizar Curso' : 'Crear Curso')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ========== LISTA DE CURSOS ========== */}
                {!showCreateForm && !showEditForm && (
                    <>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                                    <p className="mt-4 text-medico-gray">Cargando cursos...</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {courses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {courses.map((course) => (
                                            <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                                {/* Miniatura */}
                                                <div className="h-48 bg-gray-200 relative">
                                                    {course.miniatura_url ? (
                                                        <img
                                                            src={course.miniatura_url}
                                                            alt={course.titulo}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                                            </svg>
                                                        </div>
                                                    )}

                                                    {/* Badge de estado */}
                                                    <div className="absolute top-3 right-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course)}`}>
                                                            {getStatusText(course)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-6">
                                                    <div className="mb-3">
                                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                            {course.titulo}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 line-clamp-3">
                                                            {course.descripcion}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-2 mb-4 text-sm text-gray-500">
                                                        <div className="flex justify-between">
                                                            <span>Instructor:</span>
                                                            <span className="font-medium">{course.instructor_nombre || 'Sin asignar'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Tipo:</span>
                                                            <span className="font-medium">{course.tipo_examen || 'General'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>Inscripciones:</span>
                                                            <span className="font-medium">{course.estudiantes_inscritos || 0}</span>
                                                        </div>
                                                    </div>

                                                    {/* Acciones */}
                                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                                        <button
                                                            onClick={() => handleEditCourse(course)}
                                                            className="bg-medico-blue text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                            <span>Editar</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleManageCourse(course)}
                                                            className="bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <span>Gestionar</span>
                                                        </button>
                                                    </div>

                                                    {/* Acciones secundarias */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => handleViewCourse(course)}
                                                            className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            <span>Ver</span>
                                                        </button>

                                                        <button
                                                            onClick={() => handleDeleteCourse(course)}
                                                            className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                            <span>Eliminar</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                        </svg>
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cursos disponibles</h3>
                                        <p className="text-gray-500 mb-4">
                                            {filters.search || filters.tipo || filters.gratuito
                                                ? 'No se encontraron cursos con los filtros aplicados'
                                                : 'Comienza creando tu primer curso para empezar a enseñar'
                                            }
                                        </p>
                                        <button
                                            onClick={handleCreateCourse}
                                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <span>Crear Primer Curso</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* ========== MODAL DE VISUALIZACIÓN ========== */}
                {showViewModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-medico-blue">Detalles del Curso</h2>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Imagen */}
                                <div>
                                    {selectedCourse.miniatura_url ? (
                                        <img
                                            src={selectedCourse.miniatura_url}
                                            alt={selectedCourse.titulo}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Información */}
                                <div className="md:col-span-2">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{selectedCourse.titulo}</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Slug:</span>
                                            <p className="text-gray-600 font-mono">{selectedCourse.slug}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Precio:</span>
                                            <p className="text-gray-600">
                                                {selectedCourse.es_gratuito ? 'Gratuito' : formatPrice(selectedCourse.precio)}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Tipo:</span>
                                            <p className="text-gray-600">{selectedCourse.tipo_examen || 'General'}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Descuento:</span>
                                            <p className="text-gray-600">{selectedCourse.descuento || 0}%</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Estado:</span>
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCourse)}`}>
                                                {selectedCourse.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Inscripciones:</span>
                                            <p className="text-gray-600">{selectedCourse.estudiantes_inscritos || 0}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="font-medium text-gray-700">Descripción:</span>
                                            <p className="text-gray-600 mt-1">{selectedCourse.descripcion}</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex space-x-3">
                                        <button
                                            onClick={() => {
                                                setShowViewModal(false)
                                                handleEditCourse(selectedCourse)
                                            }}
                                            className="bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Editar Curso
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowViewModal(false)
                                                handleManageCourse(selectedCourse)
                                            }}
                                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Gestionar Contenido
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ========== MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ========== */}
                {showDeleteConfirm && selectedCourse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                                <p className="text-gray-600 mt-2">
                                    ¿Estás seguro de que quieres eliminar el curso "{selectedCourse.titulo}"?
                                    Esta acción desactivará el curso pero conservará todos sus datos.
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setSelectedCourse(null)
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDeleteCourse}
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                                >
                                    {formLoading && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{formLoading ? 'Eliminando...' : 'Eliminar Curso'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default AdminCourses