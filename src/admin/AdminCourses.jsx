// src/admin/AdminCourses.jsx - COMPLETO CON MÓDULOS Y LECCIONES
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../services/supabase'

const AdminCourses = () => {
    const [cursos, setCursos] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showModulesModal, setShowModulesModal] = useState(false)
    const [editingCourse, setEditingCourse] = useState(null)
    const [courseToDelete, setCourseToDelete] = useState(null)
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [modules, setModules] = useState([])
    const [classes, setClasses] = useState([])

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

    const [moduleForm, setModuleForm] = useState({
        titulo: '',
        descripcion: '',
        orden: 1
    })

    const [classForm, setClassForm] = useState({
        titulo: '',
        descripcion: '',
        video_youtube_url: '',
        duracion_minutos: 0,
        es_gratuita: false,
        orden: 1,
        modulo_id: ''
    })

    const tiposExamen = [
        { value: 'medico_general', label: 'Medicina General' },
        { value: 'medico_rural', label: 'Medicina Rural' },
        { value: 'caces', label: 'CACES' },
        { value: 'senesyct', label: 'SENESYCT' }
    ]

    useEffect(() => {
        cargarCursos()
    }, [])

    const cargarCursos = async () => {
        try {
            const { data, error } = await supabase
                .from('cursos')
                .select(`
          *,
          modulos(
            id,
            titulo,
            orden,
            clases(
              id,
              titulo,
              duracion_minutos,
              es_gratuita
            )
          )
        `)
                .order('fecha_creacion', { ascending: false })

            if (error) throw error
            setCursos(data || [])
        } catch (error) {
            console.error('Error cargando cursos:', error)
        } finally {
            setLoading(false)
        }
    }

    const cargarModulosYClases = async (courseId) => {
        try {
            // Cargar módulos
            const { data: modulesData, error: modulesError } = await supabase
                .from('modulos')
                .select('*')
                .eq('curso_id', courseId)
                .order('orden')

            if (modulesError) throw modulesError
            setModules(modulesData || [])

            // Cargar clases
            const { data: classesData, error: classesError } = await supabase
                .from('clases')
                .select(`
          *,
          modulos(titulo)
        `)
                .in('modulo_id', modulesData?.map(m => m.id) || [])
                .order('orden')

            if (classesError) throw classesError
            setClasses(classesData || [])
        } catch (error) {
            console.error('Error cargando módulos y clases:', error)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        if (name === 'titulo') {
            const slug = value
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            setFormData(prev => ({ ...prev, slug }))
        }
    }

    const handleModuleChange = (e) => {
        const { name, value } = e.target
        setModuleForm(prev => ({ ...prev, [name]: value }))
    }

    const handleClassChange = (e) => {
        const { name, value, type, checked } = e.target
        setClassForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const cursoData = {
                ...formData,
                precio: parseFloat(formData.precio) || 0,
                descuento: parseInt(formData.descuento) || 0,
                instructor_id: null
            }

            if (editingCourse) {
                const { error } = await supabase
                    .from('cursos')
                    .update(cursoData)
                    .eq('id', editingCourse.id)

                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('cursos')
                    .insert([cursoData])

                if (error) throw error
            }

            setShowModal(false)
            setEditingCourse(null)
            resetForm()
            cargarCursos()
        } catch (error) {
            console.error('Error guardando curso:', error)
            alert('Error al guardar el curso: ' + error.message)
        }
    }

    const handleModuleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { error } = await supabase
                .from('modulos')
                .insert([{
                    ...moduleForm,
                    curso_id: selectedCourse.id,
                    orden: parseInt(moduleForm.orden)
                }])

            if (error) throw error

            setModuleForm({ titulo: '', descripcion: '', orden: modules.length + 1 })
            cargarModulosYClases(selectedCourse.id)
        } catch (error) {
            console.error('Error creando módulo:', error)
            alert('Error al crear módulo: ' + error.message)
        }
    }

    const handleClassSubmit = async (e) => {
        e.preventDefault()
        try {
            const { error } = await supabase
                .from('clases')
                .insert([{
                    ...classForm,
                    duracion_minutos: parseInt(classForm.duracion_minutos),
                    orden: parseInt(classForm.orden)
                }])

            if (error) throw error

            setClassForm({
                titulo: '',
                descripcion: '',
                video_youtube_url: '',
                duracion_minutos: 0,
                es_gratuita: false,
                orden: classes.length + 1,
                modulo_id: ''
            })
            cargarModulosYClases(selectedCourse.id)
        } catch (error) {
            console.error('Error creando clase:', error)
            alert('Error al crear clase: ' + error.message)
        }
    }

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
    }

    const handleEdit = (curso) => {
        setEditingCourse(curso)
        setFormData({
            titulo: curso.titulo,
            descripcion: curso.descripcion || '',
            slug: curso.slug,
            miniatura_url: curso.miniatura_url || '',
            precio: curso.precio,
            descuento: curso.descuento,
            tipo_examen: curso.tipo_examen || '',
            es_gratuito: curso.es_gratuito,
            activo: curso.activo
        })
        setShowModal(true)
    }

    const handleManageContent = (curso) => {
        setSelectedCourse(curso)
        setShowModulesModal(true)
        cargarModulosYClases(curso.id)
    }

    const handleToggleActive = async (curso) => {
        try {
            const { error } = await supabase
                .from('cursos')
                .update({ activo: !curso.activo })
                .eq('id', curso.id)

            if (error) throw error
            cargarCursos()
        } catch (error) {
            console.error('Error actualizando estado:', error)
        }
    }

    const handleDelete = (curso) => {
        setCourseToDelete(curso)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!courseToDelete) return

        try {
            const { error } = await supabase
                .from('cursos')
                .delete()
                .eq('id', courseToDelete.id)

            if (error) throw error
            cargarCursos()
            setShowDeleteModal(false)
            setCourseToDelete(null)
        } catch (error) {
            console.error('Error eliminando curso:', error)
            alert('Error al eliminar el curso')
        }
    }

    const deleteModule = async (moduleId) => {
        try {
            const { error } = await supabase
                .from('modulos')
                .delete()
                .eq('id', moduleId)

            if (error) throw error
            cargarModulosYClases(selectedCourse.id)
        } catch (error) {
            console.error('Error eliminando módulo:', error)
        }
    }

    const deleteClass = async (classId) => {
        try {
            const { error } = await supabase
                .from('clases')
                .delete()
                .eq('id', classId)

            if (error) throw error
            cargarModulosYClases(selectedCourse.id)
        } catch (error) {
            console.error('Error eliminando clase:', error)
        }
    }

    if (loading) {
        return (
            <Layout isPlatform={true} showSidebar={true}>
                <div className="p-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout isPlatform={true} showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue">Gestión de Cursos</h1>
                        <p className="text-medico-gray mt-2">Administra cursos, módulos y lecciones</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingCourse(null)
                            resetForm()
                            setShowModal(true)
                        }}
                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Nuevo Curso</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Total Cursos</p>
                                <p className="text-2xl font-bold text-medico-blue">{cursos.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Total Módulos</p>
                                <p className="text-2xl font-bold text-medico-green">
                                    {cursos.reduce((acc, c) => acc + (c.modulos?.length || 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Total Clases</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {cursos.reduce((acc, c) => acc + c.modulos?.reduce((mAcc, m) => mAcc + (m.clases?.length || 0), 0), 0)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Ingresos Est.</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    ${cursos.reduce((acc, c) => acc + c.precio, 0).toFixed(0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Courses Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-medico-blue">Lista de Cursos</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-medico-light">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Curso
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Contenido
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Precio
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {cursos.map((curso) => (
                                <tr key={curso.id} className="hover:bg-medico-light transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <img
                                                src={curso.miniatura_url || 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=60&h=60&fit=crop'}
                                                alt={curso.titulo}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{curso.titulo}</div>
                                                <div className="text-sm text-medico-gray">
                                                    {tiposExamen.find(t => t.value === curso.tipo_examen)?.label || 'Sin categoría'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            <div>{curso.modulos?.length || 0} módulos</div>
                                            <div className="text-medico-gray">
                                                {curso.modulos?.reduce((acc, m) => acc + (m.clases?.length || 0), 0) || 0} clases
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {curso.es_gratuito ? (
                                            <span className="text-medico-green font-semibold">Gratuito</span>
                                        ) : (
                                            <div>
                                                <span className="text-lg font-semibold text-gray-900">${curso.precio}</span>
                                                {curso.descuento > 0 && (
                                                    <span className="ml-2 text-sm text-red-600">-{curso.descuento}%</span>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          curso.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {curso.activo ? 'Activo' : 'Inactivo'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleManageContent(curso)}
                                                className="text-purple-600 hover:text-purple-700 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                                                title="Gestionar Contenido"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handleEdit(curso)}
                                                className="text-medico-blue hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                title="Editar"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handleToggleActive(curso)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    curso.activo
                                                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                }`}
                                                title={curso.activo ? 'Desactivar' : 'Activar'}
                                            >
                                                {curso.activo ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(curso)}
                                                className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                                title="Eliminar"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {cursos.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-medico-gray text-lg">No hay cursos creados aún</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="mt-4 bg-medico-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Crear primer curso
                            </button>
                        </div>
                    )}
                </div>

                {/* Modal para Crear/Editar Curso */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-medico-blue">
                                    {editingCourse ? 'Editar Curso' : 'Nuevo Curso'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-medico-gray mb-2">
                                            Título del Curso *
                                        </label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            required
                                            value={formData.titulo}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="Ej: Preparación CACES 2025"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-medico-gray mb-2">
                                            Slug URL *
                                        </label>
                                        <input
                                            type="text"
                                            name="slug"
                                            required
                                            value={formData.slug}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="preparacion-caces-2025"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-medico-gray mb-2">
                                            Tipo de Examen
                                        </label>
                                        <select
                                            name="tipo_examen"
                                            value={formData.tipo_examen}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        >
                                            <option value="">Seleccionar tipo</option>
                                            {tiposExamen.map(tipo => (
                                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-medico-gray mb-2">
                                            Descripción
                                        </label>
                                        <textarea
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="Descripción del curso..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-medico-gray mb-2">
                                            URL Miniatura
                                        </label>
                                        <input
                                            type="url"
                                            name="miniatura_url"
                                            value={formData.miniatura_url}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="https://ejemplo.com/imagen.jpg"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-medico-gray mb-2">
                                            Precio ($)
                                        </label>
                                        <input
                                            type="number"
                                            name="precio"
                                            step="0.01"
                                            min="0"
                                            value={formData.precio}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-medico-gray mb-2">
                                            Descuento (%)
                                        </label>
                                        <input
                                            type="number"
                                            name="descuento"
                                            min="0"
                                            max="100"
                                            value={formData.descuento}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="es_gratuito"
                                                    checked={formData.es_gratuito}
                                                    onChange={handleInputChange}
                                                    className="rounded border-gray-300 text-medico-blue focus:ring-medico-blue"
                                                />
                                                <span className="ml-2 text-sm text-medico-gray">Curso gratuito</span>
                                            </label>

                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="activo"
                                                    checked={formData.activo}
                                                    onChange={handleInputChange}
                                                    className="rounded border-gray-300 text-medico-blue focus:ring-medico-blue"
                                                />
                                                <span className="ml-2 text-sm text-medico-gray">Activo</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false)
                                            setEditingCourse(null)
                                        }}
                                        className="px-6 py-2 text-medico-gray hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {editingCourse ? 'Actualizar' : 'Crear'} Curso
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal para Gestionar Módulos y Clases */}
                {showModulesModal && selectedCourse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-medico-blue">
                                            Gestionar Contenido: {selectedCourse.titulo}
                                        </h3>
                                        <p className="text-sm text-medico-gray">Módulos y clases del curso</p>
                                    </div>
                                    <button
                                        onClick={() => setShowModulesModal(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                    {/* Crear Módulo */}
                                    <div className="bg-medico-light rounded-lg p-6">
                                        <h4 className="text-lg font-semibold text-medico-blue mb-4">Crear Módulo</h4>
                                        <form onSubmit={handleModuleSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-medico-gray mb-2">
                                                    Título del Módulo *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="titulo"
                                                    required
                                                    value={moduleForm.titulo}
                                                    onChange={handleModuleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    placeholder="Ej: Introducción a la medicina"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-medico-gray mb-2">
                                                    Descripción
                                                </label>
                                                <textarea
                                                    name="descripcion"
                                                    value={moduleForm.descripcion}
                                                    onChange={handleModuleChange}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    placeholder="Descripción del módulo..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-medico-gray mb-2">
                                                    Orden
                                                </label>
                                                <input
                                                    type="number"
                                                    name="orden"
                                                    min="1"
                                                    value={moduleForm.orden}
                                                    onChange={handleModuleChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full bg-medico-blue text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Crear Módulo
                                            </button>
                                        </form>
                                    </div>

                                    {/* Crear Clase */}
                                    <div className="bg-green-50 rounded-lg p-6">
                                        <h4 className="text-lg font-semibold text-medico-green mb-4">Crear Clase</h4>
                                        <form onSubmit={handleClassSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-medico-gray mb-2">
                                                    Módulo *
                                                </label>
                                                <select
                                                    name="modulo_id"
                                                    required
                                                    value={classForm.modulo_id}
                                                    onChange={handleClassChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                >
                                                    <option value="">Seleccionar módulo</option>
                                                    {modules.map(modulo => (
                                                        <option key={modulo.id} value={modulo.id}>
                                                            {modulo.orden}. {modulo.titulo}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-medico-gray mb-2">
                                                    Título de la Clase *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="titulo"
                                                    required
                                                    value={classForm.titulo}
                                                    onChange={handleClassChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    placeholder="Ej: Anatomía básica"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-medico-gray mb-2">
                                                    URL Video YouTube *
                                                </label>
                                                <input
                                                    type="url"
                                                    name="video_youtube_url"
                                                    required
                                                    value={classForm.video_youtube_url}
                                                    onChange={handleClassChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    placeholder="https://youtube.com/watch?v=..."
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                                        Duración (min)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="duracion_minutos"
                                                        min="0"
                                                        value={classForm.duracion_minutos}
                                                        onChange={handleClassChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                                        Orden
                                                    </label>
                                                    <input
                                                        type="number"
                                                        name="orden"
                                                        min="1"
                                                        value={classForm.orden}
                                                        onChange={handleClassChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="es_gratuita"
                                                        checked={classForm.es_gratuita}
                                                        onChange={handleClassChange}
                                                        className="rounded border-gray-300 text-medico-green focus:ring-medico-green"
                                                    />
                                                    <span className="ml-2 text-sm text-medico-gray">Clase gratuita (preview)</span>
                                                </label>
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full bg-medico-green text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                                                disabled={modules.length === 0}
                                            >
                                                {modules.length === 0 ? 'Crear módulos primero' : 'Crear Clase'}
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Lista de Módulos y Clases */}
                                <div className="mt-8">
                                    <h4 className="text-lg font-semibold text-medico-blue mb-4">Contenido del Curso</h4>

                                    {modules.length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                                            <p className="text-medico-gray">No hay módulos creados aún. Crea el primer módulo para comenzar.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {modules.map((modulo) => (
                                                <div key={modulo.id} className="bg-white border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h5 className="font-semibold text-gray-900">
                                                                {modulo.orden}. {modulo.titulo}
                                                            </h5>
                                                            {modulo.descripcion && (
                                                                <p className="text-sm text-medico-gray mt-1">{modulo.descripcion}</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => deleteModule(modulo.id)}
                                                            className="text-red-600 hover:text-red-700 p-1"
                                                            title="Eliminar módulo"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Clases del módulo */}
                                                    <div className="ml-6 space-y-2">
                                                        {classes
                                                            .filter(clase => clase.modulo_id === modulo.id)
                                                            .map((clase) => (
                                                                <div key={clase.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center space-x-3">
                                   <span className="text-sm font-medium text-medico-blue">
                                     {clase.orden}.
                                   </span>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-900">{clase.titulo}</p>
                                                                            <div className="flex items-center space-x-4 text-xs text-medico-gray">
                                                                                <span>{clase.duracion_minutos} min</span>
                                                                                {clase.es_gratuita && (
                                                                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                           Gratuita
                                         </span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                    <a
                                                                        href={clase.video_youtube_url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-red-600 hover:text-red-700 p-1"
                                                                        title="Ver en YouTube"
                                                                        >
                                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                                                        </svg>
                                                                    </a>
                                                                    <button
                                                                        onClick={() => deleteClass(clase.id)}
                                                                        className="text-red-600 hover:text-red-700 p-1"
                                                                        title="Eliminar clase"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        )}
                                </div>
                            </div>
                        </div>
                    </div>
                    )}

                {/* Modal de Confirmación de Eliminación */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Eliminar Curso</h3>
                                        <p className="text-sm text-medico-gray">Esta acción no se puede deshacer</p>
                                    </div>
                                </div>

                                <p className="text-medico-gray mb-6">
                                    ¿Estás seguro de que quieres eliminar el curso <strong>"{courseToDelete?.titulo}"</strong>?
                                    Todos los módulos, clases y datos relacionados se perderán permanentemente.
                                </p>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false)
                                            setCourseToDelete(null)
                                        }}
                                        className="px-4 py-2 text-medico-gray hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Eliminar Curso
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default AdminCourses