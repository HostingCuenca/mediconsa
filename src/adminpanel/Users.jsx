// // src/adminpanel/Users.jsx - ADMINISTRACIÓN COMPLETA DE USUARIOS
// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'
// import Layout from '../utils/Layout'
// import userManagementService from '../services/userManagement'
//
// const AdminUsers = () => {
//     const navigate = useNavigate()
//
//     // ========== ESTADOS PRINCIPALES ==========
//     const [users, setUsers] = useState([])
//     const [userStats, setUserStats] = useState({})
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState('')
//     const [success, setSuccess] = useState('')
//
//     // Estados para modales/formularios
//     const [showCreateForm, setShowCreateForm] = useState(false)
//     const [showEditForm, setShowEditForm] = useState(false)
//     const [showViewModal, setShowViewModal] = useState(false)
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
//     const [showPasswordReset, setShowPasswordReset] = useState(false)
//     const [selectedUser, setSelectedUser] = useState(null)
//     const [formLoading, setFormLoading] = useState(false)
//
//     // Estados del formulario
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//         nombre_completo: '',
//         nombre_usuario: '',
//         telefono: '',
//         tipo_usuario: 'estudiante',
//         activo: true
//     })
//     const [formErrors, setFormErrors] = useState({})
//     const [newPassword, setNewPassword] = useState('')
//
//     // Estados de filtros y búsqueda
//     const [filters, setFilters] = useState({
//         search: '',
//         tipo: '',
//         activo: '',
//         page: 1,
//         limit: 20
//     })
//     const [pagination, setPagination] = useState({})
//
//     // ========== CONFIGURACIONES ==========
//     const tiposUsuario = [
//         { value: '', label: 'Todos los tipos' },
//         { value: 'estudiante', label: 'Estudiantes' },
//         { value: 'instructor', label: 'Instructores' },
//         { value: 'admin', label: 'Administradores' }
//     ]
//
//     const estadosUsuario = [
//         { value: '', label: 'Todos los estados' },
//         { value: 'true', label: 'Activos' },
//         { value: 'false', label: 'Inactivos' }
//     ]
//
//     // ========== EFECTOS ==========
//     useEffect(() => {
//         loadUsers()
//         loadUserStats()
//     }, [filters])
//
//     useEffect(() => {
//         if (success) {
//             const timer = setTimeout(() => setSuccess(''), 3000)
//             return () => clearTimeout(timer)
//         }
//     }, [success])
//
//     // ========== FUNCIONES DE CARGA ==========
//     const loadUsers = async () => {
//         try {
//             setLoading(true)
//             setError('')
//
//             const result = await userManagementService.getAllUsers(filters)
//
//             if (result.success) {
//                 setUsers(result.data.usuarios || [])
//                 setPagination(result.data.pagination || {})
//             } else {
//                 setError(result.error || 'Error cargando usuarios')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error de conexión')
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     const loadUserStats = async () => {
//         try {
//             const result = await userManagementService.getUserStats()
//             if (result.success) {
//                 setUserStats(result.data)
//             }
//         } catch (error) {
//             console.error('Error cargando estadísticas:', error)
//         }
//     }
//
//     // ========== FUNCIONES DEL FORMULARIO ==========
//     const resetForm = () => {
//         setFormData({
//             email: '',
//             password: '',
//             nombre_completo: '',
//             nombre_usuario: '',
//             telefono: '',
//             tipo_usuario: 'estudiante',
//             activo: true
//         })
//         setFormErrors({})
//         setSelectedUser(null)
//         setNewPassword('')
//     }
//
//     const handleFormChange = (e) => {
//         const { name, value, type, checked } = e.target
//
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }))
//
//         // Auto-generar nombre de usuario desde email
//         if (name === 'email' && !showEditForm) {
//             const username = value.split('@')[0]
//                 .toLowerCase()
//                 .replace(/[^a-z0-9]/g, '')
//
//             setFormData(prev => ({
//                 ...prev,
//                 nombre_usuario: username
//             }))
//         }
//
//         // Limpiar errores
//         if (formErrors[name]) {
//             setFormErrors(prev => ({
//                 ...prev,
//                 [name]: null
//             }))
//         }
//     }
//
//     const handleFilterChange = (e) => {
//         const { name, value } = e.target
//         setFilters(prev => ({
//             ...prev,
//             [name]: value,
//             page: 1 // Reset página al cambiar filtros
//         }))
//     }
//
//     const validateForm = () => {
//         const validation = userManagementService.validateUserData(formData)
//         setFormErrors(validation.errors)
//         return validation.isValid
//     }
//
//     // ========== ACCIONES DE USUARIO ==========
//     const handleCreateUser = () => {
//         resetForm()
//         setShowCreateForm(true)
//         setShowEditForm(false)
//     }
//
//     const handleEditUser = (user) => {
//         setFormData({
//             email: user.email || '',
//             password: '', // No mostrar password existente
//             nombre_completo: user.nombre_completo || '',
//             nombre_usuario: user.nombre_usuario || '',
//             telefono: user.telefono || '',
//             tipo_usuario: user.tipo_usuario || 'estudiante',
//             activo: Boolean(user.activo)
//         })
//         setSelectedUser(user)
//         setShowEditForm(true)
//         setShowCreateForm(false)
//         setFormErrors({})
//     }
//
//     const handleViewUser = async (user) => {
//         try {
//             setFormLoading(true)
//             const result = await userManagementService.getUserById(user.id)
//
//             if (result.success) {
//                 setSelectedUser(result.data.usuario)
//                 setShowViewModal(true)
//             } else {
//                 setError('Error cargando detalles del usuario')
//             }
//         } catch (error) {
//             setError('Error de conexión')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//
//     const handleDeleteUser = (user) => {
//         setSelectedUser(user)
//         setShowDeleteConfirm(true)
//     }
//
//     const handlePasswordReset = (user) => {
//         setSelectedUser(user)
//         setNewPassword('')
//         setShowPasswordReset(true)
//     }
//
//     const handleToggleStatus = async (user) => {
//         try {
//             setFormLoading(true)
//             const result = await userManagementService.toggleUserStatus(user.id, !user.activo)
//
//             if (result.success) {
//                 await loadUsers()
//                 setSuccess(`Usuario ${result.data.usuario.activo ? 'activado' : 'desactivado'} exitosamente`)
//             } else {
//                 setError(result.error || 'Error cambiando estado')
//             }
//         } catch (error) {
//             setError('Error de conexión')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//
//     const handleChangeRole = async (user, newRole) => {
//         if (user.tipo_usuario === newRole) return
//
//         try {
//             setFormLoading(true)
//             const result = await userManagementService.updateUserRole(user.id, newRole)
//
//             if (result.success) {
//                 await loadUsers()
//                 setSuccess(`Rol actualizado a ${userManagementService.getRoleLabel(newRole)}`)
//             } else {
//                 setError(result.error || 'Error cambiando rol')
//             }
//         } catch (error) {
//             setError('Error de conexión')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//
//     const handleSubmitForm = async (e) => {
//         e.preventDefault()
//
//         if (!validateForm()) return
//
//         setFormLoading(true)
//
//         try {
//             let result
//             if (showEditForm && selectedUser) {
//                 // Para edición, no enviar password si está vacío
//                 const updateData = { ...formData }
//                 if (!updateData.password) {
//                     delete updateData.password
//                 }
//                 result = await userManagementService.updateUser(selectedUser.id, updateData)
//             } else {
//                 result = await userManagementService.createUser(formData)
//             }
//
//             if (result.success) {
//                 setShowCreateForm(false)
//                 setShowEditForm(false)
//                 resetForm()
//                 await loadUsers()
//                 await loadUserStats()
//                 setSuccess(result.message || (showEditForm ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente'))
//             } else {
//                 setError(result.error || 'Error procesando el usuario')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error de conexión al procesar el usuario')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//
//     const confirmDeleteUser = async () => {
//         if (!selectedUser) return
//
//         try {
//             setFormLoading(true)
//             const result = await userManagementService.deleteUser(selectedUser.id)
//
//             if (result.success) {
//                 setShowDeleteConfirm(false)
//                 setSelectedUser(null)
//                 await loadUsers()
//                 await loadUserStats()
//                 setSuccess(result.message || 'Usuario eliminado exitosamente')
//             } else {
//                 setError(result.error || 'Error eliminando el usuario')
//             }
//         } catch (error) {
//             console.error('Error:', error)
//             setError('Error de conexión al eliminar el usuario')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//
//     const confirmPasswordReset = async () => {
//         if (!selectedUser || !newPassword || newPassword.length < 6) {
//             setError('La nueva contraseña debe tener al menos 6 caracteres')
//             return
//         }
//
//         try {
//             setFormLoading(true)
//             const result = await userManagementService.resetUserPassword(selectedUser.id, newPassword)
//
//             if (result.success) {
//                 setShowPasswordReset(false)
//                 setSelectedUser(null)
//                 setNewPassword('')
//                 setSuccess(`Contraseña reseteada para ${result.data.usuario.nombre_completo}`)
//             } else {
//                 setError(result.error || 'Error reseteando contraseña')
//             }
//         } catch (error) {
//             setError('Error de conexión')
//         } finally {
//             setFormLoading(false)
//         }
//     }
//
//     const handleCancelForm = () => {
//         setShowCreateForm(false)
//         setShowEditForm(false)
//         resetForm()
//     }
//
//     // ========== FUNCIONES DE NAVEGACIÓN ==========
//     const handleViewProgress = (user) => {
//         navigate(`/admin/usuario/${user.id}/progreso`)
//     }
//
//     // ========== FUNCIONES DE PAGINACIÓN ==========
//     const handlePageChange = (newPage) => {
//         setFilters(prev => ({
//             ...prev,
//             page: newPage
//         }))
//     }
//
//     // ========== FUNCIONES DE UTILIDAD ==========
//     const formatDate = (dateString) => {
//         if (!dateString) return 'Nunca'
//         return new Date(dateString).toLocaleDateString('es-ES', {
//             year: 'numeric',
//             month: 'short',
//             day: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         })
//     }
//
//     const getUserStatusColor = (user) => {
//         if (!user.activo) return 'bg-red-100 text-red-800'
//         return 'bg-green-100 text-green-800'
//     }
//
//     const getUserStatusText = (user) => {
//         return user.activo ? 'Activo' : 'Inactivo'
//     }
//
//     // ========== RENDER ==========
//     return (
//         <Layout showSidebar={true}>
//             <div className="p-8">
//                 {/* ========== HEADER ========== */}
//                 <div className="flex justify-between items-center mb-8">
//                     <div>
//                         <h1 className="text-3xl font-bold text-medico-blue">Gestión de Usuarios</h1>
//                         <p className="text-medico-gray mt-2">Administra todos los usuarios de la plataforma</p>
//                     </div>
//
//                     {!showCreateForm && !showEditForm && (
//                         <button
//                             onClick={handleCreateUser}
//                             className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
//                         >
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                             </svg>
//                             <span>Crear Usuario</span>
//                         </button>
//                     )}
//                 </div>
//
//                 {/* ========== MENSAJES ========== */}
//                 {error && (
//                     <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
//                         <div className="flex items-center">
//                             <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <p className="text-red-600">{error}</p>
//                         </div>
//                         <button
//                             onClick={() => setError('')}
//                             className="mt-2 text-red-700 underline hover:no-underline text-sm"
//                         >
//                             Cerrar
//                         </button>
//                     </div>
//                 )}
//
//                 {success && (
//                     <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
//                         <div className="flex items-center">
//                             <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <p className="text-green-600">{success}</p>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* ========== ESTADÍSTICAS ========== */}
//                 {!showCreateForm && !showEditForm && userStats.usuarios && (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900">Total Usuarios</h3>
//                                     <p className="text-3xl font-bold text-medico-blue">{userStats.usuarios.total_usuarios || 0}</p>
//                                 </div>
//                                 <div className="bg-medico-blue bg-opacity-10 rounded-full p-3">
//                                     <svg className="w-8 h-8 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900">Estudiantes</h3>
//                                     <p className="text-3xl font-bold text-green-600">{userStats.usuarios.estudiantes || 0}</p>
//                                 </div>
//                                 <div className="bg-green-100 rounded-full p-3">
//                                     <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900">Instructores</h3>
//                                     <p className="text-3xl font-bold text-blue-600">{userStats.usuarios.instructores || 0}</p>
//                                 </div>
//                                 <div className="bg-blue-100 rounded-full p-3">
//                                     <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <h3 className="text-lg font-semibold text-gray-900">Activos</h3>
//                                     <p className="text-3xl font-bold text-purple-600">{userStats.usuarios.activos || 0}</p>
//                                 </div>
//                                 <div className="bg-purple-100 rounded-full p-3">
//                                     <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* ========== FILTROS ========== */}
//                 {!showCreateForm && !showEditForm && (
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//                         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
//                                 <input
//                                     type="text"
//                                     name="search"
//                                     value={filters.search}
//                                     onChange={handleFilterChange}
//                                     placeholder="Nombre, email, usuario..."
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                 />
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
//                                 <select
//                                     name="tipo"
//                                     value={filters.tipo}
//                                     onChange={handleFilterChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                 >
//                                     {tiposUsuario.map(tipo => (
//                                         <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
//                                     ))}
//                                 </select>
//                             </div>
//
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
//                                 <select
//                                     name="activo"
//                                     value={filters.activo}
//                                     onChange={handleFilterChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                 >
//                                     {estadosUsuario.map(estado => (
//                                         <option key={estado.value} value={estado.value}>{estado.label}</option>
//                                     ))}
//                                 </select>
//                             </div>
//
//                             <div className="flex items-end">
//                                 <button
//                                     onClick={() => setFilters({
//                                         search: '',
//                                         tipo: '',
//                                         activo: '',
//                                         page: 1,
//                                         limit: 20
//                                     })}
//                                     className="w-full px-3 py-2 text-medico-blue border border-medico-blue rounded-lg hover:bg-medico-blue hover:text-white transition-colors"
//                                 >
//                                     Limpiar Filtros
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* ========== FORMULARIO ========== */}
//                 {(showCreateForm || showEditForm) && (
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-xl font-bold text-medico-blue">
//                                 {showEditForm ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
//                             </h2>
//                             <button
//                                 onClick={handleCancelForm}
//                                 className="text-gray-400 hover:text-gray-600"
//                             >
//                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                 </svg>
//                             </button>
//                         </div>
//
//                         <form onSubmit={handleSubmitForm} className="space-y-6">
//                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                 {/* Email */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Email *
//                                     </label>
//                                     <input
//                                         type="email"
//                                         name="email"
//                                         value={formData.email}
//                                         onChange={handleFormChange}
//                                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
//                                             formErrors.email ? 'border-red-300' : 'border-gray-300'
//                                         }`}
//                                         placeholder="usuario@ejemplo.com"
//                                     />
//                                     {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
//                                 </div>
//
//                                 {/* Nombre Usuario */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Nombre de Usuario *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="nombre_usuario"
//                                         value={formData.nombre_usuario}
//                                         onChange={handleFormChange}
//                                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
//                                             formErrors.nombre_usuario ? 'border-red-300' : 'border-gray-300'
//                                         }`}
//                                         placeholder="nombre_usuario"
//                                     />
//                                     {formErrors.nombre_usuario && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_usuario}</p>}
//                                 </div>
//
//                                 {/* Nombre Completo */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Nombre Completo *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="nombre_completo"
//                                         value={formData.nombre_completo}
//                                         onChange={handleFormChange}
//                                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
//                                             formErrors.nombre_completo ? 'border-red-300' : 'border-gray-300'
//                                         }`}
//                                         placeholder="Juan Pérez"
//                                     />
//                                     {formErrors.nombre_completo && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_completo}</p>}
//                                 </div>
//
//                                 {/* Teléfono */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Teléfono
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         name="telefono"
//                                         value={formData.telefono}
//                                         onChange={handleFormChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                         placeholder="+593 99 123 4567"
//                                     />
//                                 </div>
//
//                                 {/* Contraseña */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         {showEditForm ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
//                                     </label>
//                                     <input
//                                         type="password"
//                                         name="password"
//                                         value={formData.password}
//                                         onChange={handleFormChange}
//                                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
//                                             formErrors.password ? 'border-red-300' : 'border-gray-300'
//                                         }`}
//                                         placeholder={showEditForm ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
//                                     />
//                                     {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
//                                 </div>
//
//                                 {/* Tipo Usuario */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Tipo de Usuario *
//                                     </label>
//                                     <select
//                                         name="tipo_usuario"
//                                         value={formData.tipo_usuario}
//                                         onChange={handleFormChange}
//                                         className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
//                                             formErrors.tipo_usuario ? 'border-red-300' : 'border-gray-300'
//                                         }`}
//                                     >
//                                         <option value="estudiante">Estudiante</option>
//                                         <option value="instructor">Instructor</option>
//                                         <option value="admin">Administrador</option>
//                                     </select>
//                                     {formErrors.tipo_usuario && <p className="mt-1 text-sm text-red-600">{formErrors.tipo_usuario}</p>}
//                                 </div>
//
//                                 {/* Estado Activo */}
//                                 <div className="lg:col-span-2">
//                                     <label className="flex items-center">
//                                         <input
//                                             type="checkbox"
//                                             name="activo"
//                                             checked={formData.activo}
//                                             onChange={handleFormChange}
//                                             className="mr-2 rounded"
//                                         />
//                                         <span className="text-sm font-medium text-gray-700">Usuario Activo</span>
//                                     </label>
//                                 </div>
//                             </div>
//
//                             {/* Botones */}
//                             <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
//                                 <button
//                                     type="button"
//                                     onClick={handleCancelForm}
//                                     className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancelar
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     disabled={formLoading}
//                                     className="px-6 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//                                 >
//                                     {formLoading && (
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     )}
//                                     <span>{formLoading ? 'Procesando...' : (showEditForm ? 'Actualizar Usuario' : 'Crear Usuario')}</span>
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 )}
//
//                 {/* ========== LISTA DE USUARIOS ========== */}
//                 {!showCreateForm && !showEditForm && (
//                     <>
//                         {loading ? (
//                             <div className="flex items-center justify-center py-12">
//                                 <div className="text-center">
//                                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
//                                     <p className="mt-4 text-medico-gray">Cargando usuarios...</p>
//                                 </div>
//                             </div>
//                         ) : (
//                             <>
//                                 {users.length > 0 ? (
//                                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                                         {/* Tabla de usuarios */}
//                                         <div className="overflow-x-auto">
//                                             <table className="min-w-full divide-y divide-gray-200">
//                                                 <thead className="bg-gray-50">
//                                                 <tr>
//                                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Usuario
//                                                     </th>
//                                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Tipo
//                                                     </th>
//                                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Estado
//                                                     </th>
//                                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Inscripciones
//                                                     </th>
//                                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Último Acceso
//                                                     </th>
//                                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                                         Acciones
//                                                     </th>
//                                                 </tr>
//                                                 </thead>
//                                                 <tbody className="bg-white divide-y divide-gray-200">
//                                                 {users.map((user) => (
//                                                     <tr key={user.id} className="hover:bg-gray-50">
//                                                         <td className="px-6 py-4 whitespace-nowrap">
//                                                             <div className="flex items-center">
//                                                                 <div className="flex-shrink-0 h-10 w-10">
//                                                                     {user.avatar_url ? (
//                                                                         <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
//                                                                     ) : (
//                                                                         <div className="h-10 w-10 rounded-full bg-medico-blue flex items-center justify-center">
//                                                                                <span className="text-white font-medium text-sm">
//                                                                                    {user.nombre_completo?.charAt(0)?.toUpperCase() || 'U'}
//                                                                                </span>
//                                                                         </div>
//                                                                     )}
//                                                                 </div>
//                                                                 <div className="ml-4">
//                                                                     <div className="text-sm font-medium text-gray-900">
//                                                                         {user.nombre_completo}
//                                                                     </div>
//                                                                     <div className="text-sm text-gray-500">
//                                                                         {user.email}
//                                                                     </div>
//                                                                     <div className="text-xs text-gray-400">
//                                                                         @{user.nombre_usuario}
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap">
//                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getRoleColor(user.tipo_usuario)}`}>
//                                                                    {userManagementService.getRoleLabel(user.tipo_usuario)}
//                                                                </span>
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap">
//                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(user)}`}>
//                                                                    {getUserStatusText(user)}
//                                                                </span>
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                                                             <div className="space-y-1">
//                                                                 <div>Total: {user.total_inscripciones || 0}</div>
//                                                                 <div className="text-xs text-green-600">
//                                                                     Activas: {user.inscripciones_activas || 0}
//                                                                 </div>
//                                                             </div>
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                             {formatDate(user.ultima_conexion)}
//                                                         </td>
//                                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                                                             <div className="flex items-center space-x-2">
//                                                                 {/* Ver detalles */}
//                                                                 <button
//                                                                     onClick={() => handleViewUser(user)}
//                                                                     className="text-medico-blue hover:text-blue-700"
//                                                                     title="Ver detalles"
//                                                                 >
//                                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                                                                     </svg>
//                                                                 </button>
//
//                                                                 {/* Editar */}
//                                                                 <button
//                                                                     onClick={() => handleEditUser(user)}
//                                                                     className="text-blue-600 hover:text-blue-800"
//                                                                     title="Editar usuario"
//                                                                 >
//                                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                                                                     </svg>
//                                                                 </button>
//
//                                                                 {/* Cambiar estado */}
//                                                                 <button
//                                                                     onClick={() => handleToggleStatus(user)}
//                                                                     className={user.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
//                                                                     title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
//                                                                 >
//                                                                     {user.activo ? (
//                                                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
//                                                                         </svg>
//                                                                     ) : (
//                                                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                                                         </svg>
//                                                                     )}
//                                                                 </button>
//
//                                                                 {/* Resetear contraseña */}
//                                                                 <button
//                                                                     onClick={() => handlePasswordReset(user)}
//                                                                     className="text-purple-600 hover:text-purple-800"
//                                                                     title="Resetear contraseña"
//                                                                 >
//                                                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
//                                                                     </svg>
//                                                                 </button>
//
//                                                                 {/* Dropdown para más acciones */}
//                                                                 <div className="relative group">
//                                                                     <button className="text-gray-400 hover:text-gray-600">
//                                                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
//                                                                         </svg>
//                                                                     </button>
//
//                                                                     <div className="hidden group-hover:block absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-10">
//                                                                         <button
//                                                                             onClick={() => handleViewProgress(user)}
//                                                                             className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
//                                                                         >
//                                                                             Ver Progreso
//                                                                         </button>
//
//                                                                         <div className="border-t border-gray-100 my-1"></div>
//
//                                                                         {/* Cambiar rol */}
//                                                                         <div className="px-4 py-2">
//                                                                             <div className="text-xs font-medium text-gray-500 mb-1">Cambiar Rol:</div>
//                                                                             <div className="space-y-1">
//                                                                                 {['estudiante', 'instructor', 'admin'].map(role => (
//                                                                                     role !== user.tipo_usuario && (
//                                                                                         <button
//                                                                                             key={role}
//                                                                                             onClick={() => handleChangeRole(user, role)}
//                                                                                             className="block text-xs text-blue-600 hover:text-blue-800"
//                                                                                         >
//                                                                                             → {userManagementService.getRoleLabel(role)}
//                                                                                         </button>
//                                                                                     )
//                                                                                 ))}
//                                                                             </div>
//                                                                         </div>
//
//                                                                         <div className="border-t border-gray-100 my-1"></div>
//
//                                                                         {user.tipo_usuario !== 'admin' && (
//                                                                             <button
//                                                                                 onClick={() => handleDeleteUser(user)}
//                                                                                 className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                                                                             >
//                                                                                 Eliminar Usuario
//                                                                             </button>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//
//                                         {/* Paginación */}
//                                         {pagination.totalPages > 1 && (
//                                             <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
//                                                 <div className="flex-1 flex justify-between sm:hidden">
//                                                     <button
//                                                         onClick={() => handlePageChange(pagination.page - 1)}
//                                                         disabled={pagination.page <= 1}
//                                                         className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                                                     >
//                                                         Anterior
//                                                     </button>
//                                                     <button
//                                                         onClick={() => handlePageChange(pagination.page + 1)}
//                                                         disabled={pagination.page >= pagination.totalPages}
//                                                         className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
//                                                     >
//                                                         Siguiente
//                                                     </button>
//                                                 </div>
//                                                 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
//                                                     <div>
//                                                         <p className="text-sm text-gray-700">
//                                                             Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
//                                                             <span className="font-medium">
//                                                                {Math.min(pagination.page * pagination.limit, pagination.total)}
//                                                            </span>{' '}
//                                                             de <span className="font-medium">{pagination.total}</span> resultados
//                                                         </p>
//                                                     </div>
//                                                     <div>
//                                                         <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
//                                                             <button
//                                                                 onClick={() => handlePageChange(pagination.page - 1)}
//                                                                 disabled={pagination.page <= 1}
//                                                                 className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                                                             >
//                                                                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                                                                 </svg>
//                                                             </button>
//
//                                                             {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
//                                                                 let pageNum = pagination.page - 2 + i
//                                                                 if (pageNum < 1) pageNum = i + 1
//                                                                 if (pageNum > pagination.totalPages) return null
//
//                                                                 return (
//                                                                     <button
//                                                                         key={pageNum}
//                                                                         onClick={() => handlePageChange(pageNum)}
//                                                                         className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
//                                                                             pageNum === pagination.page
//                                                                                 ? 'z-10 bg-medico-blue border-medico-blue text-white'
//                                                                                 : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
//                                                                         }`}
//                                                                     >
//                                                                         {pageNum}
//                                                                     </button>
//                                                                 )
//                                                             })}
//
//                                                             <button
//                                                                 onClick={() => handlePageChange(pagination.page + 1)}
//                                                                 disabled={pagination.page >= pagination.totalPages}
//                                                                 className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
//                                                             >
//                                                                 <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                                                                 </svg>
//                                                             </button>
//                                                         </nav>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 ) : (
//                                     <div className="text-center py-12">
//                                         <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
//                                         </svg>
//                                         <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios disponibles</h3>
//                                         <p className="text-gray-500 mb-4">
//                                             {filters.search || filters.tipo || filters.activo
//                                                 ? 'No se encontraron usuarios con los filtros aplicados'
//                                                 : 'Comienza creando el primer usuario de la plataforma'
//                                             }
//                                         </p>
//                                         <button
//                                             onClick={handleCreateUser}
//                                             className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
//                                         >
//                                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                                             </svg>
//                                             <span>Crear Primer Usuario</span>
//                                         </button>
//                                     </div>
//                                 )}
//                             </>
//                         )}
//                     </>
//                 )}
//
//                 {/* ========== MODAL DE VISUALIZACIÓN ========== */}
//                 {showViewModal && selectedUser && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-90vh overflow-y-auto">
//                             <div className="flex justify-between items-center mb-6">
//                                 <h2 className="text-2xl font-bold text-medico-blue">Detalles del Usuario</h2>
//                                 <button
//                                     onClick={() => setShowViewModal(false)}
//                                     className="text-gray-400 hover:text-gray-600"
//                                 >
//                                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                     </svg>
//                                 </button>
//                             </div>
//
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                                 {/* Información básica */}
//                                 <div className="md:col-span-2">
//                                     <div className="flex items-center mb-6">
//                                         {selectedUser.avatar_url ? (
//                                             <img className="h-20 w-20 rounded-full" src={selectedUser.avatar_url} alt="" />
//                                         ) : (
//                                             <div className="h-20 w-20 rounded-full bg-medico-blue flex items-center justify-center">
//                                                <span className="text-white font-bold text-2xl">
//                                                    {selectedUser.nombre_completo?.charAt(0)?.toUpperCase() || 'U'}
//                                                </span>
//                                             </div>
//                                         )}
//                                         <div className="ml-6">
//                                             <h3 className="text-xl font-semibold text-gray-900">{selectedUser.nombre_completo}</h3>
//                                             <p className="text-gray-600">@{selectedUser.nombre_usuario}</p>
//                                             <div className="flex items-center space-x-3 mt-2">
//                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getRoleColor(selectedUser.tipo_usuario)}`}>
//                                                    {userManagementService.getRoleLabel(selectedUser.tipo_usuario)}
//                                                </span>
//                                                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(selectedUser)}`}>
//                                                    {getUserStatusText(selectedUser)}
//                                                </span>
//                                             </div>
//                                         </div>
//                                     </div>
//
//                                     <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
//                                         <div>
//                                             <span className="font-medium text-gray-700">Email:</span>
//                                             <p className="text-gray-600">{selectedUser.email}</p>
//                                         </div>
//                                         <div>
//                                             <span className="font-medium text-gray-700">Teléfono:</span>
//                                             <p className="text-gray-600">{selectedUser.telefono || 'No registrado'}</p>
//                                         </div>
//                                         <div>
//                                             <span className="font-medium text-gray-700">Fecha de registro:</span>
//                                             <p className="text-gray-600">{formatDate(selectedUser.fecha_registro)}</p>
//                                         </div>
//                                         <div>
//                                             <span className="font-medium text-gray-700">Último acceso:</span>
//                                             <p className="text-gray-600">{formatDate(selectedUser.ultima_conexion)}</p>
//                                         </div>
//                                     </div>
//
//                                     {/* Inscripciones del usuario */}
//                                     {selectedUser.inscripciones && selectedUser.inscripciones.length > 0 && (
//                                         <div>
//                                             <h4 className="text-lg font-semibold text-gray-900 mb-4">Inscripciones</h4>
//                                             <div className="space-y-3">
//                                                 {selectedUser.inscripciones.map((inscripcion) => (
//                                                     <div key={inscripcion.id} className="border border-gray-200 rounded-lg p-4">
//                                                         <div className="flex justify-between items-start">
//                                                             <div>
//                                                                 <h5 className="font-medium text-gray-900">{inscripcion.titulo}</h5>
//                                                                 <p className="text-sm text-gray-600">
//                                                                     Inscrito: {formatDate(inscripcion.fecha_inscripcion)}
//                                                                 </p>
//                                                                 {inscripcion.instructor_nombre && (
//                                                                     <p className="text-sm text-gray-500">
//                                                                         Instructor: {inscripcion.instructor_nombre}
//                                                                     </p>
//                                                                 )}
//                                                             </div>
//                                                             <div className="text-right">
//                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                                                                    inscripcion.estado_pago === 'habilitado' ? 'bg-green-100 text-green-800' :
//                                                                        inscripcion.estado_pago === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
//                                                                            'bg-red-100 text-red-800'
//                                                                }`}>
//                                                                    {inscripcion.estado_pago === 'habilitado' ? 'Activa' :
//                                                                        inscripcion.estado_pago === 'pendiente' ? 'Pendiente' : 'Inactiva'}
//                                                                </span>
//                                                                 <p className="text-sm text-gray-600 mt-1">
//                                                                     {inscripcion.es_gratuito ? 'Gratuito' : `$${inscripcion.precio}`}
//                                                                 </p>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 ))}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//
//                                 {/* Estadísticas */}
//                                 <div>
//                                     <h4 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h4>
//                                     <div className="space-y-4">
//                                         <div className="bg-gray-50 rounded-lg p-4">
//                                             <div className="text-center">
//                                                 <div className="text-2xl font-bold text-medico-blue">
//                                                     {selectedUser.total_inscripciones || 0}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">Total Inscripciones</div>
//                                             </div>
//                                         </div>
//
//                                         <div className="bg-gray-50 rounded-lg p-4">
//                                             <div className="text-center">
//                                                 <div className="text-2xl font-bold text-green-600">
//                                                     {selectedUser.inscripciones_activas || 0}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">Inscripciones Activas</div>
//                                             </div>
//                                         </div>
//
//                                         <div className="bg-gray-50 rounded-lg p-4">
//                                             <div className="text-center">
//                                                 <div className="text-2xl font-bold text-purple-600">
//                                                     {selectedUser.clases_completadas || 0}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">Clases Completadas</div>
//                                             </div>
//                                         </div>
//
//                                         <div className="bg-gray-50 rounded-lg p-4">
//                                             <div className="text-center">
//                                                 <div className="text-2xl font-bold text-orange-600">
//                                                     {selectedUser.simulacros_realizados || 0}
//                                                 </div>
//                                                 <div className="text-sm text-gray-500">Simulacros Realizados</div>
//                                             </div>
//                                         </div>
//
//                                         {selectedUser.promedio_simulacros && selectedUser.promedio_simulacros > 0 && (
//                                             <div className="bg-gray-50 rounded-lg p-4">
//                                                 <div className="text-center">
//                                                     <div className="text-2xl font-bold text-blue-600">
//                                                         {Math.round(selectedUser.promedio_simulacros)}%
//                                                     </div>
//                                                     <div className="text-sm text-gray-500">Promedio Simulacros</div>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//
//                                     <div className="mt-6 space-y-3">
//                                         <button
//                                             onClick={() => {
//                                                 setShowViewModal(false)
//                                                 handleEditUser(selectedUser)
//                                             }}
//                                             className="w-full bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                                         >
//                                             Editar Usuario
//                                         </button>
//                                         <button
//                                             onClick={() => handleViewProgress(selectedUser)}
//                                             className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//                                         >
//                                             Ver Progreso Detallado
//                                         </button>
//                                         <button
//                                             onClick={() => {
//                                                 setShowViewModal(false)
//                                                 handlePasswordReset(selectedUser)
//                                             }}
//                                             className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
//                                         >
//                                             Resetear Contraseña
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* ========== MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ========== */}
//                 {showDeleteConfirm && selectedUser && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//                             <div className="mb-4">
//                                 <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
//                                 <p className="text-gray-600 mt-2">
//                                     ¿Estás seguro de que quieres eliminar al usuario <strong>"{selectedUser.nombre_completo}"</strong>?
//                                     Esta acción desactivará la cuenta pero conservará todos sus datos.
//                                 </p>
//                                 {selectedUser.total_inscripciones > 0 && (
//                                     <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                                         <p className="text-sm text-yellow-800">
//                                             <strong>Atención:</strong> Este usuario tiene {selectedUser.total_inscripciones} inscripción(es).
//                                             Al eliminarlo se desactivará pero mantendrá su historial académico.
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//
//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     onClick={() => {
//                                         setShowDeleteConfirm(false)
//                                         setSelectedUser(null)
//                                     }}
//                                     className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancelar
//                                 </button>
//                                 <button
//                                     onClick={confirmDeleteUser}
//                                     disabled={formLoading}
//                                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
//                                 >
//                                     {formLoading && (
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     )}
//                                     <span>{formLoading ? 'Eliminando...' : 'Eliminar Usuario'}</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* ========== MODAL DE RESET DE CONTRASEÑA ========== */}
//                 {showPasswordReset && selectedUser && (
//                     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                         <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
//                             <div className="mb-4">
//                                 <h3 className="text-lg font-semibold text-gray-900">Resetear Contraseña</h3>
//                                 <p className="text-gray-600 mt-2">
//                                     Establece una nueva contraseña para <strong>{selectedUser.nombre_completo}</strong>
//                                 </p>
//                             </div>
//
//                             <div className="mb-6">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Nueva Contraseña *
//                                 </label>
//                                 <input
//                                     type="password"
//                                     value={newPassword}
//                                     onChange={(e) => setNewPassword(e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
//                                     placeholder="Mínimo 6 caracteres"
//                                     minLength={6}
//                                 />
//                                 <p className="text-xs text-gray-500 mt-1">
//                                     La nueva contraseña será enviada al usuario por email
//                                 </p>
//                             </div>
//
//                             <div className="flex justify-end space-x-3">
//                                 <button
//                                     onClick={() => {
//                                         setShowPasswordReset(false)
//                                         setSelectedUser(null)
//                                         setNewPassword('')
//                                     }}
//                                     className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancelar
//                                 </button>
//                                 <button
//                                     onClick={confirmPasswordReset}
//                                     disabled={formLoading || !newPassword || newPassword.length < 6}
//                                     className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
//                                 >
//                                     {formLoading && (
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                     )}
//                                     <span>{formLoading ? 'Reseteando...' : 'Resetear Contraseña'}</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </Layout>
//     )
// }
//
// export default AdminUsers

// src/adminpanel/Users.jsx - CÓDIGO COMPLETO AL 100%
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../utils/Layout'
import UsersTable from '../components/UsersTable'
import userManagementService from '../services/userManagement'

const AdminUsers = () => {
    const navigate = useNavigate()

    // Estados principales
    const [allUsers, setAllUsers] = useState([]) // TODOS los usuarios
    const [filteredUsers, setFilteredUsers] = useState([]) // Usuarios filtrados
    const [currentPage, setCurrentPage] = useState(1)
    const [usersPerPage] = useState(20)
    const [userStats, setUserStats] = useState({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Estados para modales/formularios
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [showEditForm, setShowEditForm] = useState(false)
    const [showViewModal, setShowViewModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showPasswordReset, setShowPasswordReset] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)
    const [formLoading, setFormLoading] = useState(false)

    // Estados del formulario
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre_completo: '',
        nombre_usuario: '',
        telefono: '',
        tipo_usuario: 'estudiante',
        activo: true
    })
    const [formErrors, setFormErrors] = useState({})
    const [newPassword, setNewPassword] = useState('')

    // Estados de filtros (sin paginación)
    const [filters, setFilters] = useState({
        search: '',
        tipo: '',
        activo: ''
    })

    // Configuraciones
    const tiposUsuario = [
        { value: '', label: 'Todos los tipos' },
        { value: 'estudiante', label: 'Estudiantes' },
        { value: 'instructor', label: 'Instructores' },
        { value: 'admin', label: 'Administradores' }
    ]

    const estadosUsuario = [
        { value: '', label: 'Todos los estados' },
        { value: 'true', label: 'Activos' },
        { value: 'false', label: 'Inactivos' }
    ]

    // Calcular paginación en el cliente
    const indexOfLastUser = currentPage * usersPerPage
    const indexOfFirstUser = indexOfLastUser - usersPerPage
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

    const pagination = {
        page: currentPage,
        totalPages: totalPages,
        total: filteredUsers.length,
        limit: usersPerPage
    }

    // Cargar usuarios una sola vez
    const loadUsers = async () => {
        try {
            setLoading(true)
            setError('')

            const result = await userManagementService.getAllUsers()

            if (result.success) {
                setAllUsers(result.data.usuarios || [])
                setFilteredUsers(result.data.usuarios || [])
            } else {
                setError(result.error || 'Error cargando usuarios')
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const loadUserStats = async () => {
        try {
            const result = await userManagementService.getUserStats()
            if (result.success) {
                setUserStats(result.data)
            }
        } catch (error) {
            // Silent fail
        }
    }

    // Filtrar usuarios en el cliente
    useEffect(() => {
        let filtered = [...allUsers]

        // Filtro por búsqueda
        if (filters.search) {
            const searchLower = filters.search.toLowerCase().trim()
            filtered = filtered.filter(user =>
                user.nombre_completo?.toLowerCase().includes(searchLower) ||
                user.email?.toLowerCase().includes(searchLower) ||
                user.nombre_usuario?.toLowerCase().includes(searchLower)
            )
        }

        // Filtro por tipo
        if (filters.tipo) {
            filtered = filtered.filter(user => user.tipo_usuario === filters.tipo)
        }

        // Filtro por estado
        if (filters.activo !== '') {
            const isActive = filters.activo === 'true'
            filtered = filtered.filter(user => user.activo === isActive)
        }

        setFilteredUsers(filtered)
        setCurrentPage(1) // Reset a página 1 cuando cambien filtros
    }, [allUsers, filters])

    // Efectos
    useEffect(() => {
        loadUsers()
        loadUserStats()
    }, [])

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 3000)
            return () => clearTimeout(timer)
        }
    }, [success])

    // Handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            tipo: '',
            activo: ''
        })
    }

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            nombre_completo: '',
            nombre_usuario: '',
            telefono: '',
            tipo_usuario: 'estudiante',
            activo: true
        })
        setFormErrors({})
        setSelectedUser(null)
        setNewPassword('')
    }

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        if (name === 'email' && !showEditForm) {
            const username = value.split('@')[0]
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')

            setFormData(prev => ({
                ...prev,
                nombre_usuario: username
            }))
        }

        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    const validateForm = () => {
        const validation = userManagementService.validateUserData(formData)
        setFormErrors(validation.errors)
        return validation.isValid
    }

    const handleCreateUser = () => {
        resetForm()
        setShowCreateForm(true)
        setShowEditForm(false)
    }

    const handleUserEdit = (user) => {
        setFormData({
            email: user.email || '',
            password: '',
            nombre_completo: user.nombre_completo || '',
            nombre_usuario: user.nombre_usuario || '',
            telefono: user.telefono || '',
            tipo_usuario: user.tipo_usuario || 'estudiante',
            activo: Boolean(user.activo)
        })
        setSelectedUser(user)
        setShowEditForm(true)
        setShowCreateForm(false)
        setFormErrors({})
    }

    const handleUserView = async (user) => {
        try {
            setFormLoading(true)
            const result = await userManagementService.getUserById(user.id)

            if (result.success) {
                setSelectedUser(result.data.usuario)
                setShowViewModal(true)
            } else {
                setError('Error cargando detalles del usuario')
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    const handleUserDelete = (user) => {
        setSelectedUser(user)
        setShowDeleteConfirm(true)
    }

    const handleUserPasswordReset = (user) => {
        setSelectedUser(user)
        setNewPassword('')
        setShowPasswordReset(true)
    }

    const handleUserToggleStatus = async (user) => {
        try {
            const result = await userManagementService.toggleUserStatus(user.id, !user.activo)

            if (result.success) {
                // Actualizar el usuario en la lista local
                setAllUsers(prev => prev.map(u =>
                    u.id === user.id
                        ? { ...u, activo: !u.activo }
                        : u
                ))
                setSuccess(`Usuario ${!user.activo ? 'activado' : 'desactivado'} exitosamente`)
            } else {
                setError(result.error || 'Error cambiando estado')
            }
        } catch (error) {
            setError('Error de conexión')
        }
    }

    const handleUserChangeRole = async (user, newRole) => {
        if (user.tipo_usuario === newRole) return

        try {
            const result = await userManagementService.updateUserRole(user.id, newRole)

            if (result.success) {
                // Actualizar el usuario en la lista local
                setAllUsers(prev => prev.map(u =>
                    u.id === user.id
                        ? { ...u, tipo_usuario: newRole }
                        : u
                ))
                setSuccess(`Rol actualizado a ${userManagementService.getRoleLabel(newRole)}`)
            } else {
                setError(result.error || 'Error cambiando rol')
            }
        } catch (error) {
            setError('Error de conexión')
        }
    }

    const handleUserViewProgress = (user) => {
        navigate(`/admin/usuario/${user.id}/progreso`)
    }

    const handleSubmitForm = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setFormLoading(true)

        try {
            let result
            if (showEditForm && selectedUser) {
                const updateData = { ...formData }
                if (!updateData.password) {
                    delete updateData.password
                }
                result = await userManagementService.updateUser(selectedUser.id, updateData)
            } else {
                result = await userManagementService.createUser(formData)
            }

            if (result.success) {
                setShowCreateForm(false)
                setShowEditForm(false)
                resetForm()

                // Recargar usuarios después de crear/editar
                await loadUsers()
                await loadUserStats()

                setSuccess(result.message || (showEditForm ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente'))
            } else {
                setError(result.error || 'Error procesando el usuario')
            }
        } catch (error) {
            setError('Error de conexión al procesar el usuario')
        } finally {
            setFormLoading(false)
        }
    }

    const confirmDeleteUser = async () => {
        if (!selectedUser) return

        try {
            setFormLoading(true)
            const result = await userManagementService.deleteUser(selectedUser.id)

            if (result.success) {
                setShowDeleteConfirm(false)
                setSelectedUser(null)

                // Remover usuario de la lista local
                setAllUsers(prev => prev.filter(u => u.id !== selectedUser.id))
                await loadUserStats()

                setSuccess(result.message || 'Usuario eliminado exitosamente')
            } else {
                setError(result.error || 'Error eliminando el usuario')
            }
        } catch (error) {
            setError('Error de conexión al eliminar el usuario')
        } finally {
            setFormLoading(false)
        }
    }

    const confirmPasswordReset = async () => {
        if (!selectedUser || !newPassword || newPassword.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres')
            return
        }

        try {
            setFormLoading(true)
            const result = await userManagementService.resetUserPassword(selectedUser.id, newPassword)

            if (result.success) {
                setShowPasswordReset(false)
                setSelectedUser(null)
                setNewPassword('')
                setSuccess(`Contraseña reseteada para ${result.data.usuario.nombre_completo}`)
            } else {
                setError(result.error || 'Error reseteando contraseña')
            }
        } catch (error) {
            setError('Error de conexión')
        } finally {
            setFormLoading(false)
        }
    }

    const handleCancelForm = () => {
        setShowCreateForm(false)
        setShowEditForm(false)
        resetForm()
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Nunca'
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getUserStatusColor = (user) => {
        if (!user.activo) return 'bg-red-100 text-red-800'
        return 'bg-green-100 text-green-800'
    }

    const getUserStatusText = (user) => {
        return user.activo ? 'Activo' : 'Inactivo'
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-medico-blue">Gestión de Usuarios</h1>
                        <p className="text-medico-gray mt-2">
                            Administra todos los usuarios de la plataforma
                            {filteredUsers.length !== allUsers.length && (
                                <span className="text-medico-blue font-medium">
                                   ({filteredUsers.length} de {allUsers.length} usuarios)
                               </span>
                            )}
                        </p>
                    </div>

                    {!showCreateForm && !showEditForm && (
                        <button
                            onClick={handleCreateUser}
                            className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Crear Usuario</span>
                        </button>
                    )}
                </div>

                {/* Mensajes */}
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

                {/* Estadísticas */}
                {!showCreateForm && !showEditForm && userStats.usuarios && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Total Usuarios</h3>
                                    <p className="text-3xl font-bold text-medico-blue">{allUsers.length}</p>
                                </div>
                                <div className="bg-medico-blue bg-opacity-10 rounded-full p-3">
                                    <svg className="w-8 h-8 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Estudiantes</h3>
                                    <p className="text-3xl font-bold text-green-600">
                                        {allUsers.filter(u => u.tipo_usuario === 'estudiante').length}
                                    </p>
                                </div>
                                <div className="bg-green-100 rounded-full p-3">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Instructores</h3>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {allUsers.filter(u => u.tipo_usuario === 'instructor').length}
                                    </p>
                                </div>
                                <div className="bg-blue-100 rounded-full p-3">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Activos</h3>
                                    <p className="text-3xl font-bold text-purple-600">
                                        {allUsers.filter(u => u.activo).length}
                                    </p>
                                </div>
                                <div className="bg-purple-100 rounded-full p-3">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtros */}
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
                                    placeholder="Nombre, email, usuario..."
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
                                    {tiposUsuario.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                <select
                                    name="activo"
                                    value={filters.activo}
                                    onChange={handleFilterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                >
                                    {estadosUsuario.map(estado => (
                                        <option key={estado.value} value={estado.value}>{estado.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    className="w-full px-3 py-2 text-medico-blue border border-medico-blue rounded-lg hover:bg-medico-blue hover:text-white transition-colors"
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Formulario de crear/editar */}
                {(showCreateForm || showEditForm) && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-medico-blue">
                                {showEditForm ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleFormChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formErrors.email ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="usuario@ejemplo.com"
                                    />
                                    {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de Usuario *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre_usuario"
                                        value={formData.nombre_usuario}
                                        onChange={handleFormChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formErrors.nombre_usuario ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="nombre_usuario"
                                    />
                                    {formErrors.nombre_usuario && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_usuario}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre_completo"
                                        value={formData.nombre_completo}
                                        onChange={handleFormChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formErrors.nombre_completo ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Juan Pérez"
                                    />
                                    {formErrors.nombre_completo && <p className="mt-1 text-sm text-red-600">{formErrors.nombre_completo}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="+593 99 123 4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {showEditForm ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleFormChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formErrors.password ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder={showEditForm ? 'Dejar vacío para mantener actual' : 'Mínimo 6 caracteres'}
                                    />
                                    {formErrors.password && <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Usuario *
                                    </label>
                                    <select
                                        name="tipo_usuario"
                                        value={formData.tipo_usuario}
                                        onChange={handleFormChange}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent ${
                                            formErrors.tipo_usuario ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    >
                                        <option value="estudiante">Estudiante</option>
                                        <option value="instructor">Instructor</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                    {formErrors.tipo_usuario && <p className="mt-1 text-sm text-red-600">{formErrors.tipo_usuario}</p>}
                                </div>

                                <div className="lg:col-span-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            checked={formData.activo}
                                            onChange={handleFormChange}
                                            className="mr-2 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Usuario Activo</span>
                                    </label>
                                </div>
                            </div>

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
                                    <span>{formLoading ? 'Procesando...' : (showEditForm ? 'Actualizar Usuario' : 'Crear Usuario')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabla de usuarios */}
                {!showCreateForm && !showEditForm && (
                    <UsersTable
                        users={currentUsers}
                        pagination={pagination}
                        loading={loading}
                        onPageChange={handlePageChange}
                        onUserEdit={handleUserEdit}
                        onUserView={handleUserView}
                        onUserDelete={handleUserDelete}
                        onUserToggleStatus={handleUserToggleStatus}
                        onUserChangeRole={handleUserChangeRole}
                        onUserPasswordReset={handleUserPasswordReset}
                        onUserViewProgress={handleUserViewProgress}
                    />
                )}

                {/* Modal de visualización */}
                {showViewModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-90vh overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-medico-blue">Detalles del Usuario</h2>
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
                                <div className="md:col-span-2">
                                    <div className="flex items-center mb-6">
                                        {selectedUser.avatar_url ? (
                                            <img className="h-20 w-20 rounded-full" src={selectedUser.avatar_url} alt="" />
                                        ) : (
                                            <div className="h-20 w-20 rounded-full bg-medico-blue flex items-center justify-center">
                                              <span className="text-white font-bold text-2xl">
                                                  {selectedUser.nombre_completo?.charAt(0)?.toUpperCase() || 'U'}
                                              </span>
                                            </div>
                                        )}
                                        <div className="ml-6">
                                            <h3 className="text-xl font-semibold text-gray-900">{selectedUser.nombre_completo}</h3>
                                            <p className="text-gray-600">@{selectedUser.nombre_usuario}</p>
                                            <div className="flex items-center space-x-3 mt-2">
                                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getRoleColor(selectedUser.tipo_usuario)}`}>
                                                  {userManagementService.getRoleLabel(selectedUser.tipo_usuario)}
                                              </span>
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(selectedUser)}`}>
                                                  {getUserStatusText(selectedUser)}
                                              </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Email:</span>
                                            <p className="text-gray-600">{selectedUser.email}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Teléfono:</span>
                                            <p className="text-gray-600">{selectedUser.telefono || 'No registrado'}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Fecha de registro:</span>
                                            <p className="text-gray-600">{formatDate(selectedUser.fecha_registro)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Último acceso:</span>
                                            <p className="text-gray-600">{formatDate(selectedUser.ultima_conexion)}</p>
                                        </div>
                                    </div>

                                    {selectedUser.inscripciones && selectedUser.inscripciones.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Inscripciones</h4>
                                            <div className="space-y-3">
                                                {selectedUser.inscripciones.map((inscripcion) => (
                                                    <div key={inscripcion.id} className="border border-gray-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-medium text-gray-900">{inscripcion.titulo}</h5>
                                                                <p className="text-sm text-gray-600">
                                                                    Inscrito: {formatDate(inscripcion.fecha_inscripcion)}
                                                                </p>
                                                                {inscripcion.instructor_nombre && (
                                                                    <p className="text-sm text-gray-500">
                                                                        Instructor: {inscripcion.instructor_nombre}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                  inscripcion.estado_pago === 'habilitado' ? 'bg-green-100 text-green-800' :
                                                                      inscripcion.estado_pago === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                                          'bg-red-100 text-red-800'
                                                              }`}>
                                                                  {inscripcion.estado_pago === 'habilitado' ? 'Activa' :
                                                                      inscripcion.estado_pago === 'pendiente' ? 'Pendiente' : 'Inactiva'}
                                                              </span>
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {inscripcion.es_gratuito ? 'Gratuito' : `$${inscripcion.precio}`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h4>
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-medico-blue">
                                                    {selectedUser.total_inscripciones || 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Total Inscripciones</div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {selectedUser.inscripciones_activas || 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Inscripciones Activas</div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">
                                                    {selectedUser.clases_completadas || 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Clases Completadas</div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-orange-600">
                                                    {selectedUser.simulacros_realizados || 0}
                                                </div>
                                                <div className="text-sm text-gray-500">Simulacros Realizados</div>
                                            </div>
                                        </div>

                                        {selectedUser.promedio_simulacros && selectedUser.promedio_simulacros > 0 && (
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {Math.round(selectedUser.promedio_simulacros)}%
                                                    </div>
                                                    <div className="text-sm text-gray-500">Promedio Simulacros</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 space-y-3">
                                        <button
                                            onClick={() => {
                                                setShowViewModal(false)
                                                handleUserEdit(selectedUser)
                                            }}
                                            className="w-full bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Editar Usuario
                                        </button>
                                        <button
                                            onClick={() => handleUserViewProgress(selectedUser)}
                                            className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Ver Progreso Detallado
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowViewModal(false)
                                                handleUserPasswordReset(selectedUser)
                                            }}
                                            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Resetear Contraseña
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de confirmación de eliminación */}
                {showDeleteConfirm && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                                <p className="text-gray-600 mt-2">
                                    ¿Estás seguro de que quieres eliminar al usuario <strong>"{selectedUser.nombre_completo}"</strong>?
                                    Esta acción desactivará la cuenta pero conservará todos sus datos.
                                </p>
                                {selectedUser.total_inscripciones > 0 && (
                                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Atención:</strong> Este usuario tiene {selectedUser.total_inscripciones} inscripción(es).
                                            Al eliminarlo se desactivará pero mantendrá su historial académico.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false)
                                        setSelectedUser(null)
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDeleteUser}
                                    disabled={formLoading}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                                >
                                    {formLoading && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{formLoading ? 'Eliminando...' : 'Eliminar Usuario'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de reset de contraseña */}
                {showPasswordReset && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Resetear Contraseña</h3>
                                <p className="text-gray-600 mt-2">
                                    Establece una nueva contraseña para <strong>{selectedUser.nombre_completo}</strong>
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nueva Contraseña *
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    La nueva contraseña será enviada al usuario por email
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setShowPasswordReset(false)
                                        setSelectedUser(null)
                                        setNewPassword('')
                                    }}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmPasswordReset}
                                    disabled={formLoading || !newPassword || newPassword.length < 6}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                                >
                                    {formLoading && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    <span>{formLoading ? 'Reseteando...' : 'Resetear Contraseña'}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default AdminUsers