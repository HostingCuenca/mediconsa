// src/admin/AdminUsers.jsx - Gestión completa de usuarios
import React, { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import apiService from '../services/api'

const AdminUsers = () => {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [filters, setFilters] = useState({
        search: '',
        tipo: '',
        page: 1,
        limit: 20
    })
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 1
    })

    useEffect(() => {
        cargarUsuarios()
    }, [filters])

    const cargarUsuarios = async () => {
        try {
            setLoading(true)
            const queryString = apiService.buildQueryString(filters)
            const response = await apiService.get(`/user-management${queryString}`)

            if (response.success) {
                setUsuarios(response.data.usuarios)
                setPagination(response.data.pagination)
            } else {
                setError(response.error || 'Error cargando usuarios')
            }
        } catch (error) {
            setError('Error de conexión. Verifica que el backend esté corriendo.')
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset page when filtering
        }))
    }

    const cambiarRol = async (userId, nuevoRol) => {
        try {
            const response = await apiService.patch(`/user-management/${userId}/role`, {
                tipoUsuario: nuevoRol
            })

            if (response.success) {
                // Actualizar el usuario en la lista
                setUsuarios(prev => prev.map(user =>
                    user.id === userId
                        ? { ...user, tipo_usuario: nuevoRol }
                        : user
                ))
            } else {
                alert(response.error || 'Error cambiando rol')
            }
        } catch (error) {
            alert('Error de conexión')
            console.error('Error:', error)
        }
    }

    const toggleEstadoUsuario = async (userId) => {
        try {
            const response = await apiService.patch(`/user-management/${userId}/toggle`)

            if (response.success) {
                // Actualizar el usuario en la lista
                setUsuarios(prev => prev.map(user =>
                    user.id === userId
                        ? { ...user, activo: !user.activo }
                        : user
                ))
            } else {
                alert(response.error || 'Error cambiando estado')
            }
        } catch (error) {
            alert('Error de conexión')
            console.error('Error:', error)
        }
    }

    const changePage = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }))
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Gestión de Usuarios</h1>
                    <p className="text-medico-gray mt-2">Administra usuarios, roles y permisos</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-medico-gray mb-2">Buscar Usuario</label>
                            <input
                                type="text"
                                placeholder="Nombre, email o usuario..."
                                value={filters.search}
                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-medico-gray mb-2">Tipo de Usuario</label>
                            <select
                                value={filters.tipo}
                                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent"
                            >
                                <option value="">Todos</option>
                                <option value="estudiante">Estudiantes</option>
                                <option value="instructor">Instructores</option>
                                <option value="admin">Administradores</option>
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ search: '', tipo: '', page: 1, limit: 20 })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={cargarUsuarios}
                            className="mt-2 text-red-700 underline hover:no-underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {loading ? (
                        <div className="p-8">
                            <div className="animate-pulse space-y-4">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                                        </div>
                                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
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
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                        Inscripciones
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                        Registro
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-medico-gray uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-medico-light">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-medico-blue rounded-full flex items-center justify-center">
                                                        <span className="text-white text-sm font-semibold">
                                                            {usuario.nombre_completo?.charAt(0) || 'U'}
                                                        </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {usuario.nombre_completo}
                                                    </div>
                                                    <div className="text-sm text-medico-gray">
                                                        {usuario.email}
                                                    </div>
                                                    <div className="text-xs text-medico-gray">
                                                        @{usuario.nombre_usuario}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={usuario.tipo_usuario}
                                                onChange={(e) => cambiarRol(usuario.id, e.target.value)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${
                                                    usuario.tipo_usuario === 'admin' ? 'bg-red-100 text-red-800' :
                                                        usuario.tipo_usuario === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'
                                                }`}
                                            >
                                                <option value="estudiante">Estudiante</option>
                                                <option value="instructor">Instructor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => toggleEstadoUsuario(usuario.id)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    usuario.activo
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                } transition-colors`}
                                            >
                                                {usuario.activo ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medico-gray">
                                            {usuario.total_inscripciones || 0} cursos
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medico-gray">
                                            {new Date(usuario.fecha_registro).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button className="text-medico-blue hover:text-blue-700">
                                                    Ver
                                                </button>
                                                <button className="text-red-600 hover:text-red-700">
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-medico-gray">
                            Mostrando {usuarios.length} de {pagination.total} usuarios
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => changePage(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>

                            <span className="px-4 py-2 text-sm text-medico-gray">
                                Página {pagination.currentPage} de {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => changePage(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && usuarios.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
                        <p className="text-medico-gray">No se encontraron usuarios con los filtros aplicados</p>
                    </div>
                )}
            </div>
        </Layout>
    )
}

export default AdminUsers