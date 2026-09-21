import React, { useState } from 'react'
import { Eye, Pencil, UserX, UserCheck, KeyRound, MoreVertical } from 'lucide-react'
import userManagementService from '../services/userManagement'

const UsersTable = ({
                        users,
                        pagination,
                        loading,
                        onPageChange,
                        onUserEdit,
                        onUserView,
                        onUserDelete,
                        onUserToggleStatus,
                        onUserChangeRole,
                        onUserPasswordReset,
                        onUserViewProgress
                    }) => {
    const [formLoading, setFormLoading] = useState(false)

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

    const handleToggleStatus = async (user) => {
        setFormLoading(true)
        await onUserToggleStatus(user)
        setFormLoading(false)
    }

    const handleChangeRole = async (user, newRole) => {
        setFormLoading(true)
        await onUserChangeRole(user, newRole)
        setFormLoading(false)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medico-blue mx-auto"></div>
                    <p className="mt-4 text-medico-gray">Cargando usuarios...</p>
                </div>
            </div>
        )
    }

    if (!users || users.length === 0) {
        return (
            <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios disponibles</h3>
                <p className="text-gray-500">No se encontraron usuarios con los filtros aplicados</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Inscripciones
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Último Acceso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10">
                                        {user.avatar_url ? (
                                            <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-medico-blue flex items-center justify-center">
                                                   <span className="text-white font-medium text-sm">
                                                       {user.nombre_completo?.charAt(0)?.toUpperCase() || 'U'}
                                                   </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user.nombre_completo}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {user.email}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            @{user.nombre_usuario}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${userManagementService.getRoleColor(user.tipo_usuario)}`}>
                                       {userManagementService.getRoleLabel(user.tipo_usuario)}
                                   </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                   <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUserStatusColor(user)}`}>
                                       {getUserStatusText(user)}
                                   </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="space-y-1">
                                    <div>Total: {user.total_inscripciones || 0}</div>
                                    <div className="text-xs text-green-600">
                                        Activas: {user.inscripciones_activas || 0}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.ultima_conexion)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => onUserView(user)}
                                        className="text-medico-blue hover:text-blue-700"
                                        title="Ver detalles"
                                    >
                                        <Eye className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => onUserEdit(user)}
                                        className="text-blue-600 hover:text-blue-800"
                                        title="Editar usuario"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>

                                    <button
                                        onClick={() => handleToggleStatus(user)}
                                        disabled={formLoading}
                                        className={`${user.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} disabled:opacity-50`}
                                        title={user.activo ? 'Desactivar usuario' : 'Activar usuario'}
                                    >
                                        {user.activo ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={() => onUserPasswordReset(user)}
                                        className="text-purple-600 hover:text-purple-800"
                                        title="Resetear contraseña"
                                    >
                                        <KeyRound className="w-5 h-5" />
                                    </button>

                                    <div className="relative group">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>

                                        <div className="hidden group-hover:block absolute right-0 top-6 bg-white rounded-2xl shadow-sm border border-gray-100 py-2 w-48 z-10">
                                            <button
                                                onClick={() => onUserViewProgress(user)}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Ver Progreso
                                            </button>

                                            <div className="border-t border-gray-100 my-1"></div>

                                            <div className="px-4 py-2">
                                                <div className="text-xs font-medium text-gray-500 mb-1">Cambiar Rol:</div>
                                                <div className="space-y-1">
                                                    {['estudiante', 'instructor', 'admin'].map(role => (
                                                        role !== user.tipo_usuario && (
                                                            <button
                                                                key={role}
                                                                onClick={() => handleChangeRole(user, role)}
                                                                disabled={formLoading}
                                                                className="block text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                                            >
                                                                → {userManagementService.getRoleLabel(role)}
                                                            </button>
                                                        )
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-100 my-1"></div>

                                            {user.tipo_usuario !== 'admin' && (
                                                <button
                                                    onClick={() => onUserDelete(user)}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    Eliminar Usuario
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
                <div className="bg-white px-6 py-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        {/* Versión móvil */}
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={pagination.page <= 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="relative inline-flex items-center px-4 py-2 text-sm text-gray-700">
                               Página {pagination.page} de {pagination.totalPages}
                           </span>
                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Siguiente
                            </button>
                        </div>

                        {/* Versión escritorio */}
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                                    <span className="font-medium">
                                       {Math.min(pagination.page * pagination.limit, pagination.total)}
                                   </span>{' '}
                                    de <span className="font-medium">{pagination.total}</span> resultados
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {/* Botón anterior */}
                                    <button
                                        onClick={() => onPageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>

                                    {/* Páginas numeradas */}
                                    {(() => {
                                        const buttons = [];
                                        const currentPage = pagination.page;
                                        const totalPages = pagination.totalPages;

                                        let startPage = Math.max(1, currentPage - 2);
                                        let endPage = Math.min(totalPages, currentPage + 2);

                                        if (endPage - startPage < 4 && totalPages > 5) {
                                            if (startPage === 1) {
                                                endPage = Math.min(totalPages, startPage + 4);
                                            } else if (endPage === totalPages) {
                                                startPage = Math.max(1, endPage - 4);
                                            }
                                        }

                                        // Página 1 si no está en el rango
                                        if (startPage > 1) {
                                            buttons.push(
                                                <button
                                                    key="page-1"
                                                    onClick={() => onPageChange(1)}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    1
                                                </button>
                                            );

                                            if (startPage > 2) {
                                                buttons.push(
                                                    <span key="ellipsis-start" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                       ...
                                                   </span>
                                                );
                                            }
                                        }

                                        // Páginas del rango principal
                                        for (let i = startPage; i <= endPage; i++) {
                                            buttons.push(
                                                <button
                                                    key={`page-${i}`}
                                                    onClick={() => onPageChange(i)}
                                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                        i === currentPage
                                                            ? 'z-10 bg-medico-blue border-medico-blue text-white'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {i}
                                                </button>
                                            );
                                        }

                                        // Última página si no está en el rango
                                        if (endPage < totalPages) {
                                            if (endPage < totalPages - 1) {
                                                buttons.push(
                                                    <span key="ellipsis-end" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                                       ...
                                                   </span>
                                                );
                                            }

                                            buttons.push(
                                                <button
                                                    key={`page-${totalPages}`}
                                                    onClick={() => onPageChange(totalPages)}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    {totalPages}
                                                </button>
                                            );
                                        }

                                        return buttons;
                                    })()}

                                    {/* Botón siguiente */}
                                    <button
                                        onClick={() => onPageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersTable