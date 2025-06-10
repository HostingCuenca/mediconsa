// src/admin/AdminUsers.jsx - GESTIÓN COMPLETA DE USUARIOS
import React, { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { supabase } from '../services/supabase'

const AdminUsers = () => {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [userToDelete, setUserToDelete] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterRole, setFilterRole] = useState('')

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre_completo: '',
        nombre_usuario: '',
        tipo_usuario: 'estudiante',
        activo: true
    })

    const roles = [
        { value: 'estudiante', label: 'Estudiante', color: 'bg-blue-100 text-blue-800' },
        { value: 'instructor', label: 'Instructor', color: 'bg-purple-100 text-purple-800' },
        { value: 'admin', label: 'Administrador', color: 'bg-red-100 text-red-800' }
    ]

    useEffect(() => {
        cargarUsuarios()
    }, [])

    // src/admin/AdminUsers.jsx - Solo cambiar la función cargarUsuarios (línea ~35):

    const cargarUsuarios = async () => {
        try {
            // Consulta simplificada sin joins complejos
            const { data: usuarios, error: usuariosError } = await supabase
                .from('perfiles_usuario')
                .select('*')
                .order('fecha_registro', { ascending: false })

            if (usuariosError) throw usuariosError

            // Obtener inscripciones por separado
            const { data: inscripciones, error: inscripcionesError } = await supabase
                .from('inscripciones')
                .select(`
        usuario_id,
        estado_pago,
        cursos(titulo)
      `)

            if (inscripcionesError) throw inscripcionesError

            // Combinar datos manualmente
            const usuariosConInscripciones = usuarios.map(usuario => ({
                ...usuario,
                inscripciones: inscripciones?.filter(i => i.usuario_id === usuario.id) || []
            }))

            setUsuarios(usuariosConInscripciones)
        } catch (error) {
            console.error('Error cargando usuarios:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Auto-generar nombre_usuario desde email
        if (name === 'email') {
            const username = value.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '')
            setFormData(prev => ({ ...prev, nombre_usuario: username }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingUser) {
                // Actualizar usuario existente
                const { error } = await supabase
                    .from('perfiles_usuario')
                    .update({
                        nombre_completo: formData.nombre_completo,
                        nombre_usuario: formData.nombre_usuario,
                        tipo_usuario: formData.tipo_usuario,
                        activo: formData.activo
                    })
                    .eq('id', editingUser.id)

                if (error) throw error
            } else {
                // Crear nuevo usuario
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: formData.email,
                    password: formData.password,
                    email_confirm: true
                })

                if (authError) throw authError

                // Crear perfil
                const { error: perfilError } = await supabase
                    .from('perfiles_usuario')
                    .insert({
                        id: authData.user.id,
                        nombre_completo: formData.nombre_completo,
                        nombre_usuario: formData.nombre_usuario,
                        tipo_usuario: formData.tipo_usuario,
                        activo: formData.activo
                    })

                if (perfilError) throw perfilError
            }

            setShowModal(false)
            setEditingUser(null)
            resetForm()
            cargarUsuarios()
        } catch (error) {
            console.error('Error guardando usuario:', error)
            alert('Error al guardar usuario: ' + error.message)
        }
    }

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            nombre_completo: '',
            nombre_usuario: '',
            tipo_usuario: 'estudiante',
            activo: true
        })
    }

    const handleEdit = (usuario) => {
        setEditingUser(usuario)
        setFormData({
            email: '', // No editable
            password: '', // No editable
            nombre_completo: usuario.nombre_completo,
            nombre_usuario: usuario.nombre_usuario,
            tipo_usuario: usuario.tipo_usuario,
            activo: usuario.activo
        })
        setShowModal(true)
    }

    const handleToggleActive = async (usuario) => {
        try {
            const { error } = await supabase
                .from('perfiles_usuario')
                .update({ activo: !usuario.activo })
                .eq('id', usuario.id)

            if (error) throw error
            cargarUsuarios()
        } catch (error) {
            console.error('Error actualizando estado:', error)
        }
    }

    const handleChangeRole = async (usuario, newRole) => {
        try {
            const { error } = await supabase
                .from('perfiles_usuario')
                .update({ tipo_usuario: newRole })
                .eq('id', usuario.id)

            if (error) throw error
            cargarUsuarios()
        } catch (error) {
            console.error('Error cambiando rol:', error)
        }
    }

    const handleDelete = (usuario) => {
        setUserToDelete(usuario)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!userToDelete) return

        try {
            // Eliminar perfil (auth.users se elimina automáticamente)
            const { error } = await supabase
                .from('perfiles_usuario')
                .delete()
                .eq('id', userToDelete.id)

            if (error) throw error

            // Eliminar de auth
            const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.id)
            if (authError) console.warn('Error eliminando auth user:', authError)

            cargarUsuarios()
            setShowDeleteModal(false)
            setUserToDelete(null)
        } catch (error) {
            console.error('Error eliminando usuario:', error)
            alert('Error al eliminar usuario')
        }
    }

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(usuario => {
        const matchesSearch = usuario.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            usuario.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = !filterRole || usuario.tipo_usuario === filterRole
        return matchesSearch && matchesRole
    })

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
                        <h1 className="text-3xl font-bold text-medico-blue">Gestión de Usuarios</h1>
                        <p className="text-medico-gray mt-2">Administra usuarios, roles y permisos</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingUser(null)
                            resetForm()
                            setShowModal(true)
                        }}
                        className="bg-medico-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Nuevo Usuario</span>
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Total Usuarios</p>
                                <p className="text-2xl font-bold text-medico-blue">{usuarios.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-medico-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Estudiantes</p>
                                <p className="text-2xl font-bold text-medico-green">
                                    {usuarios.filter(u => u.tipo_usuario === 'estudiante').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Instructores</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {usuarios.filter(u => u.tipo_usuario === 'instructor').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.586-3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-medico-gray">Admins</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {usuarios.filter(u => u.tipo_usuario === 'admin').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-medico-gray mb-2">
                                Buscar usuario
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                placeholder="Nombre o usuario..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-medico-gray mb-2">
                                Filtrar por rol
                            </label>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos los roles</option>
                                {roles.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setFilterRole('')
                                }}
                                className="px-4 py-2 text-medico-gray hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-medico-blue">
                            Lista de Usuarios ({usuariosFiltrados.length})
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-medico-light">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Usuario
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Rol
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Cursos
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Registro
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-medico-gray uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {usuariosFiltrados.map((usuario) => (
                                <tr key={usuario.id} className="hover:bg-medico-light transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-medico-blue rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {usuario.nombre_completo?.charAt(0) || 'U'}
                          </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{usuario.nombre_completo}</div>
                                                <div className="text-sm text-medico-gray">@{usuario.nombre_usuario}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={usuario.tipo_usuario}
                                            onChange={(e) => handleChangeRole(usuario, e.target.value)}
                                            className="text-xs px-2.5 py-1 rounded-full border-0 focus:ring-2 focus:ring-medico-blue"
                                            style={{
                                                backgroundColor: roles.find(r => r.value === usuario.tipo_usuario)?.color.split(' ')[0].replace('bg-', ''),
                                                color: roles.find(r => r.value === usuario.tipo_usuario)?.color.split(' ')[1].replace('text-', '')
                                            }}
                                        >
                                            {roles.map(role => (
                                                <option key={role.value} value={role.value}>{role.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {usuario.inscripciones?.length || 0} inscripciones
                                        </div>
                                        <div className="text-xs text-medico-gray">
                                            {usuario.inscripciones?.filter(i => i.estado_pago === 'habilitado').length || 0} activos
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.activo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-medico-gray">
                                        {new Date(usuario.fecha_registro).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => handleEdit(usuario)}
                                                className="text-medico-blue hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                                title="Editar"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>

                                            <button
                                                onClick={() => handleToggleActive(usuario)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    usuario.activo
                                                        ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                                        : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                                }`}
                                                title={usuario.activo ? 'Desactivar' : 'Activar'}
                                            >
                                                {usuario.activo ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDelete(usuario)}
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

                    {usuariosFiltrados.length === 0 && (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                            <p className="text-medico-gray text-lg">No se encontraron usuarios</p>
                        </div>
                    )}
                </div>

                {/* Modal para Crear/Editar Usuario */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-medico-blue">
                                    {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {!editingUser && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-medico-gray mb-2">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="usuario@ejemplo.com"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-medico-gray mb-2">
                                                Contraseña *
                                            </label>
                                            <input
                                                type="password"
                                                name="password"
                                                required
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                                placeholder="Mínimo 6 caracteres"
                                                minLength={6}
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre_completo"
                                        required
                                        value={formData.nombre_completo}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="Dr. Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Nombre de Usuario *
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre_usuario"
                                        required
                                        value={formData.nombre_usuario}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                        placeholder="juan.perez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Tipo de Usuario
                                    </label>
                                    <select
                                        name="tipo_usuario"
                                        value={formData.tipo_usuario}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                                    >
                                        {roles.map(role => (
                                            <option key={role.value} value={role.value}>{role.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            checked={formData.activo}
                                            onChange={handleInputChange}
                                            className="rounded border-gray-300 text-medico-blue focus:ring-medico-blue"
                                        />
                                        <span className="ml-2 text-sm text-medico-gray">Usuario activo</span>
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false)
                                            setEditingUser(null)
                                        }}
                                        className="px-4 py-2 text-medico-gray hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-medico-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {editingUser ? 'Actualizar' : 'Crear'} Usuario
                                    </button>
                                </div>
                            </form>
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
                                        <h3 className="text-lg font-semibold text-gray-900">Eliminar Usuario</h3>
                                        <p className="text-sm text-medico-gray">Esta acción no se puede deshacer</p>
                                    </div>
                                </div>

                                <p className="text-medico-gray mb-6">
                                    ¿Estás seguro de que quieres eliminar al usuario <strong>"{userToDelete?.nombre_completo}"</strong>?
                                    Se eliminarán todos sus datos, inscripciones y progreso.
                                </p>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false)
                                            setUserToDelete(null)
                                        }}
                                        className="px-4 py-2 text-medico-gray hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Eliminar Usuario
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

export default AdminUsers