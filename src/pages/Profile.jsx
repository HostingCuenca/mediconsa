// src/dashboard/Profile.jsx - Perfil del usuario
import React, { useState } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../utils/AuthContext'

const Profile = () => {
    const { perfil } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        nombreCompleto: perfil?.nombreCompleto || '',
        nombreUsuario: perfil?.nombreUsuario || '',
        email: perfil?.email || '',
        telefono: '',
        especialidad: '',
        universidad: '',
        biografia: ''
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSave = () => {
        // Aquí iría la lógica para guardar
        alert('Funcionalidad de actualización en desarrollo')
        setIsEditing(false)
    }

    return (
        <Layout showSidebar={true}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-medico-blue">Mi Perfil</h1>
                    <p className="text-medico-gray mt-2">Gestiona tu información personal</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                            <div className="w-24 h-24 bg-medico-blue rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-2xl font-bold">
                                    {perfil?.nombreCompleto?.charAt(0) || 'U'}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {perfil?.nombreCompleto || 'Usuario'}
                            </h3>
                            <p className="text-medico-gray mb-2">@{perfil?.nombreUsuario}</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                perfil?.tipoUsuario === 'admin' ? 'bg-red-100 text-red-800' :
                                    perfil?.tipoUsuario === 'instructor' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                            }`}>
                                {perfil?.tipoUsuario}
                            </span>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="text-sm text-medico-gray">
                                    <p><strong>Miembro desde:</strong></p>
                                    <p>{new Date(perfil?.fechaRegistro || Date.now()).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="w-full mt-6 bg-medico-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
                            </button>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h3 className="text-lg font-semibold text-medico-blue mb-6">Información Personal</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        name="nombreCompleto"
                                        value={formData.nombreCompleto}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Nombre de Usuario
                                    </label>
                                    <input
                                        type="text"
                                        name="nombreUsuario"
                                        value={formData.nombreUsuario}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Número de teléfono"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Especialidad
                                    </label>
                                    <input
                                        type="text"
                                        name="especialidad"
                                        value={formData.especialidad}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Tu especialidad médica"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Universidad
                                    </label>
                                    <input
                                        type="text"
                                        name="universidad"
                                        value={formData.universidad}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Universidad de origen"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-medico-gray mb-2">
                                        Biografía
                                    </label>
                                    <textarea
                                        name="biografia"
                                        value={formData.biografia}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        rows={4}
                                        placeholder="Cuéntanos un poco sobre ti..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex space-x-4 mt-6">
                                    <button
                                        onClick={handleSave}
                                        className="bg-medico-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Guardar Cambios
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default Profile