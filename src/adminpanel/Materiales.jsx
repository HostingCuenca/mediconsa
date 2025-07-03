import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import materialServices from '../services/materiales'
import coursesService from '../services/courses'

import DeleteMaterialAdmin from '../components/DeleteMaterialAdmin'

const Materiales = () => {
    const navigate = useNavigate()

    // ========== ESTADOS ==========
    const [materiales, setMateriales] = useState([])
    const [cursos, setCursos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Estados de modales
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingMaterial, setEditingMaterial] = useState(null)
    const [saving, setSaving] = useState(false)

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [materialToDelete, setMaterialToDelete] = useState(null)

    // ========== NUEVOS ESTADOS PARA UPLOAD ==========
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploading, setUploading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [createdMaterialUrl, setCreatedMaterialUrl] = useState('')
    const [showLinkModal, setShowLinkModal] = useState(false)

    // Formularios
    const [createForm, setCreateForm] = useState({
        titulo: '',
        descripcion: '',
        archivoUrl: '',
        tipoArchivo: 'pdf',
        precio: 0,
        categoria: '',
        stockDisponible: -1,
        visiblePublico: false,
        esGratuito: false,
        tipoMaterial: 'libre',
        imagenUrl: '',
        cursoId: ''
    })

    const [editForm, setEditForm] = useState({})

    // Filtros
    const [filters, setFilters] = useState({
        search: '',
        curso: '',
        tipo: '',
        categoria: '',
        precio: ''
    })

    // ========== EFECTOS ==========
    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // ========== FUNCIONES DE CARGA ==========
    const loadData = async () => {
        try {
            setLoading(true)
            setError('')

            const [cursosResult, marketplaceResult] = await Promise.all([
                coursesService.getAllCourses(),
                materialServices.getMarketplaceMaterials({ limit: 100 })
            ])

            if (cursosResult.success) {
                const cursosData = cursosResult.data.cursos || []
                setCursos(cursosData)

                const materialesCurso = []
                for (const curso of cursosData) {
                    try {
                        const materialesResult = await materialServices.getMaterialesByCourse(curso.id)
                        if (materialesResult.success && materialesResult.data.materiales) {
                            materialesResult.data.materiales.forEach(material => {
                                materialesCurso.push({
                                    ...material,
                                    curso_titulo: curso.titulo,
                                    curso_id: curso.id
                                })
                            })
                        }
                    } catch (courseError) {
                        console.warn(`Error cargando materiales del curso ${curso.titulo}:`, courseError)
                    }
                }

                const materialesMarketplace = marketplaceResult.success ?
                    (marketplaceResult.data.materiales || []).map(material => ({
                        ...material,
                        curso_titulo: material.curso_titulo || 'Marketplace',
                        curso_id: material.curso_id || null
                    })) : []

                const todosLosMateriales = [...materialesCurso]
                materialesMarketplace.forEach(materialMarket => {
                    const existe = todosLosMateriales.find(m => m.id === materialMarket.id)
                    if (!existe) {
                        todosLosMateriales.push(materialMarket)
                    }
                })

                setMateriales(todosLosMateriales)
            } else {
                setError(cursosResult.error || 'Error cargando datos')
            }

        } catch (error) {
            console.error('Error cargando datos:', error)
            setError('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    // ========== FUNCIONES DE UPLOAD ==========
    const uploadFileToService = async (file) => {
        const formData = new FormData()
        formData.append('document', file)

        try {
            setUploading(true)
            setUploadProgress(0)

            // Simular progreso mientras se sube
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + Math.random() * 15
                })
            }, 200)

            const response = await fetch('https://crm.softlatam.com/mediconsa/index.php', {
                method: 'POST',
                body: formData
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            const result = await response.json()

            if (result.success) {
                return {
                    success: true,
                    url: result.document.url,
                    filename: result.document.filename,
                    originalName: result.document.original_name,
                    size: result.document.size_formatted,
                    mimeType: result.document.mime_type
                }
            } else {
                throw new Error(result.error || 'Error al subir archivo')
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        } finally {
            setUploading(false)
            setTimeout(() => setUploadProgress(0), 1000)
        }
    }

    const handleFileSelect = (file) => {
        // Validar archivo
        const maxSize = 10 * 1024 * 1024 // 10MB
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain',
            'application/zip',
            'application/x-rar-compressed',
            'video/mp4',
            'audio/mpeg',
            'image/jpeg',
            'image/png',
            'image/gif'
        ]

        if (file.size > maxSize) {
            setError('El archivo es muy grande. Máximo 10MB.')
            return
        }

        if (!allowedTypes.includes(file.type)) {
            setError('Tipo de archivo no permitido.')
            return
        }

        setSelectedFile(file)
        setError('')

        // Auto-detectar tipo de archivo
        const extension = file.name.split('.').pop().toLowerCase()
        const tipoMap = {
            'pdf': 'pdf',
            'doc': 'doc',
            'docx': 'doc',
            'xls': 'xls',
            'xlsx': 'xls',
            'ppt': 'ppt',
            'pptx': 'ppt',
            'zip': 'zip',
            'rar': 'zip',
            'mp4': 'mp4',
            'mp3': 'mp3',
            'txt': 'pdf'
        }

        if (tipoMap[extension]) {
            setCreateForm(prev => ({
                ...prev,
                tipoArchivo: tipoMap[extension],
                titulo: prev.titulo || file.name.split('.')[0]
            }))
        }
    }

    // Drag and Drop handlers
    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }

    // ========== FUNCIONES DEL MODAL DE CREAR ==========
    const openCreateModal = () => {
        setCreateForm({
            titulo: '',
            descripcion: '',
            archivoUrl: '',
            tipoArchivo: 'pdf',
            precio: 0,
            categoria: '',
            stockDisponible: -1,
            visiblePublico: false,
            esGratuito: false,
            tipoMaterial: 'libre',
            imagenUrl: '',
            cursoId: ''
        })
        setSelectedFile(null)
        setShowCreateModal(true)
    }

    const closeCreateModal = () => {
        setShowCreateModal(false)
        setCreateForm({})
        setSelectedFile(null)
        setUploadProgress(0)
        setUploading(false)
        setSaving(false)
    }

    const handleCreateFormChange = (e) => {
        const { name, value, type, checked } = e.target
        setCreateForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSaveCreate = async () => {
        try {
            setSaving(true)
            setError('')

            // Validaciones
            if (!createForm.titulo.trim()) {
                setError('El título es requerido')
                return
            }

            if (!selectedFile) {
                setError('Debes seleccionar un archivo')
                return
            }

            if (createForm.precio < 0) {
                setError('El precio no puede ser negativo')
                return
            }

            // Subir archivo primero
            const uploadResult = await uploadFileToService(selectedFile)

            if (!uploadResult.success) {
                setError(uploadResult.error)
                return
            }

            // Preparar datos del material
            const materialData = {
                titulo: createForm.titulo.trim(),
                descripcion: createForm.descripcion.trim(),
                archivoUrl: uploadResult.url,
                tipoArchivo: createForm.tipoArchivo,
                precio: parseFloat(createForm.precio) || 0,
                categoria: createForm.categoria.trim() || null,
                stockDisponible: parseInt(createForm.stockDisponible) || -1,
                visiblePublico: createForm.visiblePublico,
                esGratuito: createForm.esGratuito,
                tipoMaterial: createForm.tipoMaterial,
                imagenUrl: createForm.imagenUrl.trim() || null,
                cursoId: createForm.cursoId || null
            }

            const result = await materialServices.createMaterial(materialData)

            if (result.success) {
                setSuccess(result.message || 'Material creado exitosamente')
                setCreatedMaterialUrl(uploadResult.url)
                closeCreateModal()
                setShowLinkModal(true) // Mostrar modal con link
                loadData() // Recargar la lista
            } else {
                setError(result.error || 'Error creando material')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    // ========== FUNCIONES DEL MODAL DE EDITAR ==========
    const openEditModal = (material) => {
        setEditingMaterial(material)
        setEditForm({
            titulo: material.titulo || '',
            descripcion: material.descripcion || '',
            precio: material.precio || 0,
            categoria: material.categoria || '',
            stockDisponible: material.stock_disponible || -1,
            visiblePublico: material.visible_publico || false,
            esGratuito: material.es_gratuito || false,
            tipoMaterial: material.tipo_material || 'curso',
            imagenUrl: material.imagen_url || ''
        })
        setShowEditModal(true)
    }

    const closeEditModal = () => {
        setShowEditModal(false)
        setEditingMaterial(null)
        setEditForm({})
        setSaving(false)
    }

    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target
        setEditForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSaveEdit = async () => {
        try {
            setSaving(true)
            setError('')

            const updateData = {
                titulo: editForm.titulo.trim(),
                descripcion: editForm.descripcion.trim(),
                precio: parseFloat(editForm.precio) || 0,
                categoria: editForm.categoria.trim() || null,
                stockDisponible: parseInt(editForm.stockDisponible) || -1,
                visiblePublico: editForm.visiblePublico,
                esGratuito: editForm.esGratuito,
                tipoMaterial: editForm.tipoMaterial,
                imagenUrl: editForm.imagenUrl.trim() || null
            }

            if (!updateData.titulo) {
                setError('El título es requerido')
                return
            }

            if (updateData.precio < 0) {
                setError('El precio no puede ser negativo')
                return
            }

            const result = await materialServices.updateMaterial(editingMaterial.id, updateData)

            if (result.success) {
                setSuccess(result.message || 'Material actualizado exitosamente')

                // Actualizar el material en la lista local
                setMateriales(prev => prev.map(material =>
                    material.id === editingMaterial.id
                        ? { ...material, ...result.data.material }
                        : material
                ))

                closeEditModal()
            } else {
                setError(result.error || 'Error actualizando material')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error de conexión')
        } finally {
            setSaving(false)
        }
    }

    // ========== FUNCIONES DE FILTRADO ==========
    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const getFilteredMateriales = () => {
        let filtered = [...materiales]

        if (filters.search) {
            const searchLower = filters.search.toLowerCase()
            filtered = filtered.filter(material =>
                material.titulo.toLowerCase().includes(searchLower) ||
                material.curso_titulo?.toLowerCase().includes(searchLower) ||
                material.descripcion?.toLowerCase().includes(searchLower) ||
                material.categoria?.toLowerCase().includes(searchLower)
            )
        }

        if (filters.curso) {
            if (filters.curso === 'marketplace') {
                filtered = filtered.filter(material => !material.curso_id)
            } else {
                filtered = filtered.filter(material => material.curso_id === filters.curso)
            }
        }

        if (filters.tipo) {
            filtered = filtered.filter(material => material.tipo_material === filters.tipo)
        }

        if (filters.categoria) {
            filtered = filtered.filter(material =>
                material.categoria?.toLowerCase() === filters.categoria.toLowerCase()
            )
        }

        if (filters.precio) {
            if (filters.precio === 'gratis') {
                filtered = filtered.filter(material => material.es_gratuito || material.precio === 0)
            } else if (filters.precio === 'pago') {
                filtered = filtered.filter(material => !material.es_gratuito && material.precio > 0)
            }
        }

        return filtered.sort((a, b) => {
            const dateA = new Date(a.fecha_creacion || 0)
            const dateB = new Date(b.fecha_creacion || 0)
            return dateB - dateA
        })
    }

    const resetFilters = () => {
        setFilters({
            search: '',
            curso: '',
            tipo: '',
            categoria: '',
            precio: ''
        })
    }

    // ========== OTRAS ACCIONES ==========
    // const handleDeleteMaterial = async (materialId, titulo) => {
    //     alert(`La función de eliminar "${titulo}" estará disponible próximamente`)
    // }


    const handleDeleteMaterial = (material) => {
        setMaterialToDelete(material)
        setShowDeleteModal(true)
    }

// ========== CAMBIO 4: FUNCIONES DE CALLBACK ==========
// Agregar estas 2 funciones nuevas:
    const handleDeleteSuccess = (message) => {
        setSuccess(message)
        setMateriales(prev => prev.filter(material => material.id !== materialToDelete.id))
    }

    const handleDeleteError = (errorMessage) => {
        setError(errorMessage)
    }



    const handleViewMaterial = (material) => {
        if (material.archivo_url) {
            window.open(material.archivo_url, '_blank')
        } else {
            setError('No hay URL de archivo disponible')
        }
    }

    const handleGoToCourse = (material) => {
        if (material.curso_id) {
            navigate(`/admin/curso/${material.curso_id}/gestionar`)
        } else {
            setError('Material no asociado a un curso específico')
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setSuccess('¡Enlace copiado al portapapeles!')
        }).catch(() => {
            // Fallback para navegadores que no soportan clipboard API
            const textArea = document.createElement('textarea')
            textArea.value = text
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setSuccess('¡Enlace copiado al portapapeles!')
        })
    }

    // ========== UTILIDADES ==========
    const getTipoMaterialBadge = (tipo) => {
        const tipos = {
            'curso': { name: 'Curso', color: 'bg-blue-100 text-blue-800', icon: '📚' },
            'libre': { name: 'Gratuito', color: 'bg-green-100 text-green-800', icon: '🆓' },
            'premium': { name: 'Premium', color: 'bg-yellow-100 text-yellow-800', icon: '⭐' }
        }
        return tipos[tipo] || { name: tipo, color: 'bg-gray-100 text-gray-800', icon: '📄' }
    }

    const getTipoArchivoBadge = (tipoArchivo) => {
        const tipos = {
            'pdf': { icon: '📄', color: 'text-red-600' },
            'doc': { icon: '📝', color: 'text-blue-600' },
            'docx': { icon: '📝', color: 'text-blue-600' },
            'xls': { icon: '📊', color: 'text-green-600' },
            'xlsx': { icon: '📊', color: 'text-green-600' },
            'ppt': { icon: '📽️', color: 'text-orange-600' },
            'pptx': { icon: '📽️', color: 'text-orange-600' },
            'zip': { icon: '🗜️', color: 'text-purple-600' },
            'rar': { icon: '🗜️', color: 'text-purple-600' },
            'mp4': { icon: '🎥', color: 'text-red-600' },
            'mp3': { icon: '🎵', color: 'text-pink-600' }
        }
        return tipos[tipoArchivo?.toLowerCase()] || { icon: '📎', color: 'text-gray-600' }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-EC', {
            style: 'currency',
            currency: 'USD'
        }).format(price || 0)
    }

    const getCategorias = () => {
        const categoriasUnicas = [...new Set(materiales
            .map(m => m.categoria)
            .filter(Boolean)
        )]
        return categoriasUnicas.sort()
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // ========== RENDER ==========
    if (loading) {
        return (
            <Layout showSidebar={true}>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                        <p className="mt-4 text-medico-gray">Cargando materiales...</p>
                    </div>
                </div>
            </Layout>
        )
    }

    const filteredMateriales = getFilteredMateriales()

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue mb-2">Gestión de Materiales</h1>
                        <p className="text-medico-gray">Administra todos los materiales de la plataforma</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{materiales.length} materiales totales</span>
                            <span>•</span>
                            <span>{filteredMateriales.length} mostrados</span>
                            <span>•</span>
                            <span>{cursos.length} cursos</span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={openCreateModal}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Nuevo Material</span>
                        </button>
                        <button
                            onClick={loadData}
                            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Actualizar</span>
                        </button>
                    </div>
                </div>

                {/* Mensajes */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-red-600">{error}</p>
                            </div>
                            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-600">{success}</p>
                            </div>
                            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                placeholder="Buscar materiales..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
                            <select
                                name="curso"
                                value={filters.curso}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos los cursos</option>
                                {cursos.map(curso => (
                                    <option key={curso.id} value={curso.id}>{curso.titulo}</option>
                                ))}
                                <option value="marketplace">Marketplace</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                name="tipo"
                                value={filters.tipo}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="curso">📚 Material de Curso</option>
                                <option value="libre">🆓 Descarga Gratuita</option>
                                <option value="premium">⭐ Material Premium</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                name="categoria"
                                value={filters.categoria}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todas</option>
                                {getCategorias().map(categoria => (
                                    <option key={categoria} value={categoria}>{categoria}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                            <select
                                name="precio"
                                value={filters.precio}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                <option value="gratis">💚 Gratuitos</option>
                                <option value="pago">💰 De pago</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={resetFilters}
                                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </div>




                {/* Lista de materiales */}
                {filteredMateriales.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMateriales.map((material) => {
                            const tipoBadge = getTipoMaterialBadge(material.tipo_material)
                            const archivoBadge = getTipoArchivoBadge(material.tipo_archivo)

                            return (
                                <div key={material.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    {/* Imagen si existe */}
                                    {material.imagen_url && (
                                        <div className="h-48 bg-gray-100">
                                            <img
                                                src={material.imagen_url}
                                                alt={material.titulo}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none'
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="p-6">
                                        {/* Header de la tarjeta */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center space-x-2">
                                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${tipoBadge.color}`}>
                                                   {tipoBadge.icon} {tipoBadge.name}
                                               </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                               <span className={`text-lg ${archivoBadge.color}`}>
                                                   {archivoBadge.icon}
                                               </span>
                                                <span className="text-xs text-gray-500 uppercase">
                                                   {material.tipo_archivo}
                                               </span>
                                            </div>
                                        </div>

                                        {/* Título */}
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                            {material.titulo}
                                        </h3>

                                        {/* Curso */}
                                        <p className="text-sm text-medico-blue mb-3 font-medium">
                                            📚 {material.curso_titulo}
                                        </p>

                                        {/* Descripción */}
                                        {material.descripcion && (
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                {material.descripcion}
                                            </p>
                                        )}

                                        {/* Información del material */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Precio:</span>
                                                <span className="font-semibold text-medico-blue">
                                                   {material.es_gratuito || material.precio === 0 ? 'Gratis' : formatPrice(material.precio)}
                                               </span>
                                            </div>

                                            {material.categoria && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Categoría:</span>
                                                    <span className="text-gray-800">
                                                       🏷️ {material.categoria}
                                                   </span>
                                                </div>
                                            )}

                                            {material.stock_disponible !== undefined && material.stock_disponible !== -1 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Stock:</span>
                                                    <span className={`font-medium ${material.stock_disponible > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                       {material.stock_disponible > 0 ? `${material.stock_disponible} disponibles` : 'Agotado'}
                                                   </span>
                                                </div>
                                            )}

                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Creado:</span>
                                                <span className="text-gray-800">
                                                   {formatDate(material.fecha_creacion)}
                                               </span>
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="grid grid-cols-3 gap-2 mb-3">
                                            <button
                                                onClick={() => handleViewMaterial(material)}
                                                className="bg-blue-100 text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                            >
                                                <span>👁️</span>
                                                <span>Ver</span>
                                            </button>
                                            <button
                                                onClick={() => openEditModal(material)}
                                                className="bg-purple-100 text-purple-700 py-2 px-3 rounded-lg hover:bg-purple-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                            >
                                                <span>✏️</span>
                                                <span>Editar</span>
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(material.archivo_url)}
                                                className="bg-green-100 text-green-700 py-2 px-3 rounded-lg hover:bg-green-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                                title="Copiar enlace"
                                            >
                                                <span>📋</span>
                                                <span>Copiar</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleGoToCourse(material)}
                                                className="bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                            >
                                                <span>📚</span>
                                                <span>Ir al curso</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMaterial(material)}
                                                className="bg-red-100 text-red-700 py-2 px-3 rounded-lg hover:bg-red-200 transition-colors text-sm flex items-center justify-center space-x-1"
                                            >
                                                <span>🗑️</span>
                                                <span>Eliminar</span>
                                            </button>
                                        </div>

                                        {/* Estado de visibilidad */}
                                        {material.visible_publico && (
                                            <div className="mt-3 text-center">
                                               <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                                   🌐 Visible en marketplace público
                                               </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {materiales.length === 0 ? 'No hay materiales' : 'No se encontraron materiales'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {materiales.length === 0
                                ? 'Crea tu primer material haciendo clic en "Nuevo Material"'
                                : 'Intenta cambiar los filtros de búsqueda'
                            }
                        </p>
                        {materiales.length === 0 ? (
                            <button
                                onClick={openCreateModal}
                                className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                ➕ Crear Primer Material
                            </button>
                        ) : (
                            <button
                                onClick={resetFilters}
                                className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        )}
                    </div>
                )}

                {/* MODAL DE CREAR MATERIAL */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        ➕ Crear Nuevo Material
                                    </h2>
                                    <button
                                        onClick={closeCreateModal}
                                        className="text-gray-400 hover:text-gray-600"
                                        disabled={saving || uploading}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* ========== UPLOAD DE ARCHIVO ========== */}
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                        <div
                                            className={`transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : ''}`}
                                            onDragEnter={handleDrag}
                                            onDragLeave={handleDrag}
                                            onDragOver={handleDrag}
                                            onDrop={handleDrop}
                                        >
                                            {!selectedFile ? (
                                                <div>
                                                    <div className="text-4xl mb-4">📁</div>
                                                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                                                        Arrastra tu archivo aquí o haz clic para seleccionar
                                                    </h4>
                                                    <p className="text-gray-500 mb-4">
                                                        PDF, DOC, XLS, PPT, ZIP, MP4, MP3 (máx. 10MB)
                                                    </p>
                                                    <input
                                                        type="file"
                                                        onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                                                        className="hidden"
                                                        id="file-upload"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.mp4,.mp3,.txt,.jpg,.png,.gif"
                                                    />
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="bg-medico-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 cursor-pointer inline-block"
                                                    >
                                                        📤 Seleccionar Archivo
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                    <div className="flex items-center justify-center space-x-3">
                                                        <div className="text-2xl">📄</div>
                                                        <div className="text-left">
                                                            <p className="font-medium text-green-800">{selectedFile.name}</p>
                                                            <p className="text-sm text-green-600">{formatFileSize(selectedFile.size)}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setSelectedFile(null)}
                                                            className="text-red-500 hover:text-red-700"
                                                            disabled={uploading}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Barra de progreso durante upload */}
                                                    {uploading && (
                                                        <div className="mt-4">
                                                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                                                <span>Subiendo archivo...</span>
                                                                <span>{Math.round(uploadProgress)}%</span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${uploadProgress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* ========== CAMPOS DEL FORMULARIO ========== */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Título */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Título *
                                            </label>
                                            <input
                                                type="text"
                                                name="titulo"
                                                value={createForm.titulo}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="Título del material"
                                                disabled={saving || uploading}
                                            />
                                        </div>

                                        {/* Descripción */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Descripción
                                            </label>
                                            <textarea
                                                name="descripcion"
                                                value={createForm.descripcion}
                                                onChange={handleCreateFormChange}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="Descripción del material"
                                                disabled={saving || uploading}
                                            />
                                        </div>

                                        {/* Tipo de Archivo */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Archivo
                                            </label>
                                            <select
                                                name="tipoArchivo"
                                                value={createForm.tipoArchivo}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                disabled={saving || uploading}
                                            >
                                                <option value="pdf">📄 PDF</option>
                                                <option value="doc">📝 DOC/DOCX</option>
                                                <option value="xls">📊 Excel</option>
                                                <option value="ppt">📽️ PowerPoint</option>
                                                <option value="zip">🗜️ ZIP/RAR</option>
                                                <option value="mp4">🎥 Video</option>
                                                <option value="mp3">🎵 Audio</option>
                                            </select>
                                        </div>

                                        {/* Tipo de Material */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipo de Material
                                            </label>
                                            <select
                                                name="tipoMaterial"
                                                value={createForm.tipoMaterial}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                disabled={saving || uploading}
                                            >
                                                <option value="libre">🆓 Descarga Gratuita</option>
                                                <option value="premium">⭐ Material Premium</option>
                                                <option value="curso">📚 Material de Curso</option>
                                            </select>
                                        </div>

                                        {/* Curso (solo si es tipo curso) */}
                                        {createForm.tipoMaterial === 'curso' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Curso
                                                </label>
                                                <select
                                                    name="cursoId"
                                                    value={createForm.cursoId}
                                                    onChange={handleCreateFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    disabled={saving || uploading}
                                                >
                                                    <option value="">Seleccionar curso</option>
                                                    {cursos.map(curso => (
                                                        <option key={curso.id} value={curso.id}>{curso.titulo}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {/* Categoría */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Categoría
                                            </label>
                                            <input
                                                type="text"
                                                name="categoria"
                                                value={createForm.categoria}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="ej: medicina, enfermería"
                                                disabled={saving || uploading}
                                            />
                                        </div>

                                        {/* Precio */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Precio (USD)
                                            </label>
                                            <input
                                                type="number"
                                                name="precio"
                                                value={createForm.precio}
                                                onChange={handleCreateFormChange}
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                disabled={saving || uploading || createForm.esGratuito}
                                            />
                                        </div>

                                        {/* Stock */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stock Disponible
                                            </label>
                                            <input
                                                type="number"
                                                name="stockDisponible"
                                                value={createForm.stockDisponible}
                                                onChange={handleCreateFormChange}
                                                min="-1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="-1 = Ilimitado"
                                                disabled={saving || uploading}
                                            />
                                        </div>

                                        {/* URL de Imagen */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                URL de Imagen (Opcional)
                                            </label>
                                            <input
                                                type="url"
                                                name="imagenUrl"
                                                value={createForm.imagenUrl}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="https://ejemplo.com/imagen.jpg"
                                                disabled={saving || uploading}
                                            />
                                        </div>

                                        {/* Checkboxes */}
                                        <div className="md:col-span-2 space-y-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="esGratuito"
                                                    checked={createForm.esGratuito}
                                                    onChange={handleCreateFormChange}
                                                    className="rounded border-gray-300 text-medico-blue focus:ring-medico-blue"
                                                    disabled={saving || uploading}
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    💚 Es gratuito
                                                </label>
                                            </div>

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="visiblePublico"
                                                    checked={createForm.visiblePublico}
                                                    onChange={handleCreateFormChange}
                                                    className="rounded border-gray-300 text-medico-blue focus:ring-medico-blue"
                                                    disabled={saving || uploading}
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    🌐 Visible en marketplace público
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vista previa */}
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">📋 Vista previa:</h4>
                                        <div className="text-sm space-y-1">
                                            <p><strong>Título:</strong> {createForm.titulo || 'Sin título'}</p>
                                            <p><strong>Archivo:</strong> {selectedFile ? selectedFile.name : 'No seleccionado'}</p>
                                            <p><strong>Tipo:</strong> {getTipoMaterialBadge(createForm.tipoMaterial).name}</p>
                                            <p><strong>Precio:</strong> {createForm.esGratuito ? 'Gratuito' : formatPrice(createForm.precio)}</p>
                                            {createForm.categoria && <p><strong>Categoría:</strong> {createForm.categoria}</p>}
                                            <p><strong>Stock:</strong> {createForm.stockDisponible === -1 ? 'Ilimitado' : createForm.stockDisponible}</p>
                                            <p><strong>Marketplace:</strong> {createForm.visiblePublico ? 'Sí' : 'No'}</p>
                                        </div>
                                    </div>

                                    {/* Botones */}
                                    <div className="flex justify-end space-x-3 pt-6 border-t">
                                        <button
                                            onClick={closeCreateModal}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            disabled={saving || uploading}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSaveCreate}
                                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                                            disabled={saving || uploading || !createForm.titulo.trim() || !selectedFile}
                                        >
                                            {(saving || uploading) ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>
                                                       {uploading ? 'Subiendo archivo...' : 'Creando material...'}
                                                   </span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>➕</span>
                                                    <span>Crear Material</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL DE EDITAR MATERIAL */}
                {showEditModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        ✏️ Editar Material
                                    </h2>
                                    <button
                                        onClick={closeEditModal}
                                        className="text-gray-400 hover:text-gray-600"
                                        disabled={saving}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {editingMaterial && (
                                    <div className="space-y-4">
                                        {/* Info del material */}
                                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">
                                                    {getTipoArchivoBadge(editingMaterial.tipo_archivo).icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{editingMaterial.titulo}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        ID: {editingMaterial.id} • Curso: {editingMaterial.curso_titulo}
                                                    </p>
                                                    <p className="text-xs text-blue-600 truncate">
                                                        📎 {editingMaterial.archivo_url}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Título */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Título *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="titulo"
                                                    value={editForm.titulo}
                                                    onChange={handleEditFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    disabled={saving}
                                                />
                                            </div>

                                            {/* Descripción */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Descripción
                                                </label>
                                                <textarea
                                                    name="descripcion"
                                                    value={editForm.descripcion}
                                                    onChange={handleEditFormChange}
                                                    rows={3}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    disabled={saving}
                                                />
                                            </div>



                                            {/* Tipo de Material */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tipo de Material
                                                </label>
                                                <select
                                                    name="tipoMaterial"
                                                    value={editForm.tipoMaterial}
                                                    onChange={handleEditFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    disabled={saving}
                                                >
                                                    <option value="curso">📚 Material de Curso</option>
                                                    <option value="libre">🆓 Descarga Gratuita</option>
                                                    <option value="premium">⭐ Material Premium</option>
                                                </select>
                                            </div>

                                            {/* Categoría */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Categoría
                                                </label>
                                                <input
                                                    type="text"
                                                    name="categoria"
                                                    value={editForm.categoria}
                                                    onChange={handleEditFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    disabled={saving}
                                                />
                                            </div>

                                            {/* Precio */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Precio (USD)
                                                </label>
                                                <input
                                                    type="number"
                                                    name="precio"
                                                    value={editForm.precio}
                                                    onChange={handleEditFormChange}
                                                    step="0.01"
                                                    min="0"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    disabled={saving || editForm.esGratuito}
                                                />
                                            </div>

                                            {/* Stock */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Stock Disponible
                                                </label>
                                                <input
                                                    type="number"
                                                    name="stockDisponible"
                                                    value={editForm.stockDisponible}
                                                    onChange={handleEditFormChange}
                                                    min="-1"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    disabled={saving}
                                                />
                                            </div>

                                            {/* URL de Imagen */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    URL de Imagen
                                                </label>
                                                <input
                                                    type="url"
                                                    name="imagenUrl"
                                                    value={editForm.imagenUrl}
                                                    onChange={handleEditFormChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                    disabled={saving}
                                                />
                                            </div>

                                            {/* Checkboxes */}
                                            <div className="md:col-span-2 space-y-3">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="esGratuito"
                                                        checked={editForm.esGratuito}
                                                        onChange={handleEditFormChange}
                                                        className="rounded border-gray-300 text-medico-blue focus:ring-medico-blue"
                                                        disabled={saving}
                                                    />
                                                    <label className="ml-2 text-sm text-gray-700">
                                                        💚 Es gratuito
                                                    </label>
                                                </div>

                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="visiblePublico"
                                                        checked={editForm.visiblePublico}
                                                        onChange={handleEditFormChange}
                                                        className="rounded border-gray-300 text-medico-blue focus:ring-medico-blue"
                                                        disabled={saving}
                                                    />
                                                    <label className="ml-2 text-sm text-gray-700">
                                                        🌐 Visible en marketplace público
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vista previa */}
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-blue-900 mb-2">📋 Vista previa:</h4>
                                            <div className="text-sm space-y-1">
                                                <p><strong>Título:</strong> {editForm.titulo || 'Sin título'}</p>
                                                <p><strong>Tipo:</strong> {getTipoMaterialBadge(editForm.tipoMaterial).name}</p>
                                                <p><strong>Precio:</strong> {editForm.esGratuito ? 'Gratuito' : formatPrice(editForm.precio)}</p>
                                                {editForm.categoria && <p><strong>Categoría:</strong> {editForm.categoria}</p>}
                                                <p><strong>Stock:</strong> {editForm.stockDisponible === -1 ? 'Ilimitado' : editForm.stockDisponible}</p>
                                                <p><strong>Marketplace:</strong> {editForm.visiblePublico ? 'Sí' : 'No'}</p>
                                            </div>
                                        </div>

                                        {/* Botones */}
                                        <div className="flex justify-end space-x-3 pt-6 border-t">
                                            <button
                                                onClick={closeEditModal}
                                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                disabled={saving}
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={handleSaveEdit}
                                                className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                                disabled={saving || !editForm.titulo.trim()}
                                            >
                                                {saving ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                        <span>Guardando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>💾</span>
                                                        <span>Guardar Cambios</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de eliminación */}
                <DeleteMaterialAdmin
                    material={materialToDelete}
                    isOpen={showDeleteModal}
                    onClose={() => setShowDeleteModal(false)}
                    onSuccess={handleDeleteSuccess}
                    onError={handleDeleteError}
                />

                {/* ========== MODAL ENLACE CREADO ========== */}
                {showLinkModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg w-full max-w-lg">
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-4">🎉</div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        ¡Material creado exitosamente!
                                    </h3>
                                    <p className="text-gray-600">
                                        Tu archivo ha sido subido y el material está disponible
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enlace del archivo:
                                    </label>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={createdMaterialUrl}
                                            readOnly
                                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(createdMaterialUrl)}
                                            className="bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span>Copiar</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => window.open(createdMaterialUrl, '_blank')}
                                        className="flex-1 bg-green-50 text-green-700 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors font-medium"
                                    >
                                        👁️ Ver Archivo
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowLinkModal(false)
                                            setCreatedMaterialUrl('')
                                        }}
                                        className="flex-1 bg-medico-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                    >
                                        ✅ Entendido
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

export default Materiales