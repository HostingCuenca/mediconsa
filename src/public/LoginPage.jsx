// // src/pages/LoginPage1.jsx - Ajustado para Node.js Backend
// import React, { useState, useEffect } from 'react'
// import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { useAuth } from '../utils/AuthContext'
// import Layout from '../utils/Layout'
//
// const LoginPage = ({ mode = 'login' }) => {
//     const [isLogin, setIsLogin] = useState(mode === 'login')
//     const [loading, setLoading] = useState(false)
//     const [error, setError] = useState('')
//     const [success, setSuccess] = useState('')
//
//     const { isAuthenticated, login, register } = useAuth()
//     const navigate = useNavigate()
//     const location = useLocation()
//
//     // Form data
//     const [formData, setFormData] = useState({
//         email: '',
//         password: '',
//         confirmPassword: '',
//         nombreCompleto: '',
//         nombreUsuario: ''
//     })
//
//     // Redirigir si ya está autenticado
//     useEffect(() => {
//         if (isAuthenticated) {
//             const from = location.state?.from?.pathname || '/dashboard'
//             console.log('Usuario ya autenticado, redirigiendo a:', from)
//             navigate(from, { replace: true })
//         }
//     }, [isAuthenticated, navigate, location])
//
//     // Cambiar entre login y registro
//     useEffect(() => {
//         setIsLogin(mode === 'login')
//         setError('')
//         setSuccess('')
//     }, [mode])
//
//     const handleInputChange = (e) => {
//         const { name, value } = e.target
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }))
//         setError('')
//     }
//
//     const validateForm = () => {
//         if (!formData.email || !formData.password) {
//             setError('Email y contraseña son requeridos')
//             return false
//         }
//
//         if (!isLogin) {
//             if (!formData.nombreCompleto || !formData.nombreUsuario) {
//                 setError('Todos los campos son requeridos')
//                 return false
//             }
//
//             if (formData.password !== formData.confirmPassword) {
//                 setError('Las contraseñas no coinciden')
//                 return false
//             }
//
//             if (formData.password.length < 6) {
//                 setError('La contraseña debe tener al menos 6 caracteres')
//                 return false
//             }
//
//             // Validar formato de email
//             const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
//             if (!emailRegex.test(formData.email)) {
//                 setError('Formato de email inválido')
//                 return false
//             }
//
//             // Validar nombre de usuario (sin espacios, solo letras, números, puntos, guiones)
//             const usernameRegex = /^[a-zA-Z0-9._-]+$/
//             if (!usernameRegex.test(formData.nombreUsuario)) {
//                 setError('El nombre de usuario solo puede contener letras, números, puntos, guiones')
//                 return false
//             }
//         }
//
//         return true
//     }
//
//     const handleSubmit = async (e) => {
//         e.preventDefault()
//
//         if (!validateForm()) return
//
//         setLoading(true)
//         setError('')
//         setSuccess('')
//
//         try {
//             let result
//
//             if (isLogin) {
//                 // Login usando AuthContext
//                 console.log('Iniciando login...')
//                 result = await login(formData.email, formData.password)
//             } else {
//                 // Registro usando AuthContext
//                 console.log('Iniciando registro...')
//                 result = await register({
//                     email: formData.email,
//                     password: formData.password,
//                     nombreCompleto: formData.nombreCompleto,
//                     nombreUsuario: formData.nombreUsuario
//                 })
//             }
//
//             console.log('Resultado:', result)
//
//             if (result.success) {
//                 const successMessage = isLogin ? '¡Bienvenido de vuelta!' : '¡Cuenta creada exitosamente!'
//                 setSuccess(successMessage)
//
//                 // La redirección se maneja automáticamente en useEffect cuando cambie isAuthenticated
//                 setTimeout(() => {
//                     const from = location.state?.from?.pathname || '/dashboard'
//                     navigate(from, { replace: true })
//                 }, 1000)
//             } else {
//                 setError(result.error || `Error al ${isLogin ? 'iniciar sesión' : 'crear cuenta'}`)
//             }
//         } catch (error) {
//             console.error('Error en autenticación:', error)
//             setError('Error de conexión. Verifica tu internet y que el servidor esté corriendo.')
//         } finally {
//             setLoading(false)
//         }
//     }
//
//     return (
//         <Layout>
//             <div className="min-h-screen bg-gradient-to-br from-medico-blue via-blue-600 to-medico-green flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//                 <div className="max-w-md w-full space-y-8">
//
//                     {/* Header */}
//                     <div className="text-center">
//                         <Link to="/" className="inline-flex items-center space-x-2 mb-6">
//                             <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
//                                 <span className="text-medico-blue font-bold text-lg">M</span>
//                             </div>
//                             <span className="text-2xl font-bold text-white">Mediconsa</span>
//                         </Link>
//
//                         <h2 className="text-3xl font-bold text-white">
//                             {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
//                         </h2>
//                         <p className="mt-2 text-blue-100">
//                             {isLogin
//                                 ? 'Accede a tu plataforma de preparación médica'
//                                 : 'Únete a la comunidad médica de Mediconsa'
//                             }
//                         </p>
//                     </div>
//
//                     {/* Form */}
//                     <div className="bg-white rounded-2xl shadow-2xl p-8">
//
//                         {/* Toggle Login/Register */}
//                         <div className="flex bg-medico-light rounded-lg p-1 mb-6">
//                             <button
//                                 type="button"
//                                 onClick={() => setIsLogin(true)}
//                                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
//                                     isLogin
//                                         ? 'bg-medico-blue text-white shadow-sm'
//                                         : 'text-medico-gray hover:text-medico-blue'
//                                 }`}
//                             >
//                                 Iniciar Sesión
//                             </button>
//                             <button
//                                 type="button"
//                                 onClick={() => setIsLogin(false)}
//                                 className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
//                                     !isLogin
//                                         ? 'bg-medico-blue text-white shadow-sm'
//                                         : 'text-medico-gray hover:text-medico-blue'
//                                 }`}
//                             >
//                                 Registrarse
//                             </button>
//                         </div>
//
//                         {/* Messages */}
//                         {error && (
//                             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//                                 <p className="text-red-600 text-sm">{error}</p>
//                             </div>
//                         )}
//
//                         {success && (
//                             <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
//                                 <p className="text-green-600 text-sm">{success}</p>
//                             </div>
//                         )}
//
//                         <form onSubmit={handleSubmit} className="space-y-4">
//
//                             {/* Campos de registro */}
//                             {!isLogin && (
//                                 <>
//                                     <div>
//                                         <label htmlFor="nombreCompleto" className="block text-sm font-medium text-medico-gray mb-1">
//                                             Nombre Completo *
//                                         </label>
//                                         <input
//                                             id="nombreCompleto"
//                                             name="nombreCompleto"
//                                             type="text"
//                                             required={!isLogin}
//                                             value={formData.nombreCompleto}
//                                             onChange={handleInputChange}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
//                                             placeholder="Dr. Juan Pérez"
//                                         />
//                                     </div>
//
//                                     <div>
//                                         <label htmlFor="nombreUsuario" className="block text-sm font-medium text-medico-gray mb-1">
//                                             Nombre de Usuario *
//                                         </label>
//                                         <input
//                                             id="nombreUsuario"
//                                             name="nombreUsuario"
//                                             type="text"
//                                             required={!isLogin}
//                                             value={formData.nombreUsuario}
//                                             onChange={handleInputChange}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
//                                             placeholder="juan.perez"
//                                         />
//                                         <p className="text-xs text-medico-gray mt-1">
//                                             Solo letras, números, puntos y guiones. Sin espacios.
//                                         </p>
//                                     </div>
//                                 </>
//                             )}
//
//                             {/* Email */}
//                             <div>
//                                 <label htmlFor="email" className="block text-sm font-medium text-medico-gray mb-1">
//                                     Email *
//                                 </label>
//                                 <input
//                                     id="email"
//                                     name="email"
//                                     type="email"
//                                     required
//                                     value={formData.email}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
//                                     placeholder="doctor@ejemplo.com"
//                                 />
//                             </div>
//
//                             {/* Password */}
//                             <div>
//                                 <label htmlFor="password" className="block text-sm font-medium text-medico-gray mb-1">
//                                     Contraseña *
//                                 </label>
//                                 <input
//                                     id="password"
//                                     name="password"
//                                     type="password"
//                                     required
//                                     value={formData.password}
//                                     onChange={handleInputChange}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
//                                     placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"}
//                                 />
//                             </div>
//
//                             {/* Confirm Password */}
//                             {!isLogin && (
//                                 <div>
//                                     <label htmlFor="confirmPassword" className="block text-sm font-medium text-medico-gray mb-1">
//                                         Confirmar Contraseña *
//                                     </label>
//                                     <input
//                                         id="confirmPassword"
//                                         name="confirmPassword"
//                                         type="password"
//                                         required={!isLogin}
//                                         value={formData.confirmPassword}
//                                         onChange={handleInputChange}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
//                                         placeholder="Confirma tu contraseña"
//                                     />
//                                 </div>
//                             )}
//
//                             {/* Submit Button */}
//                             <button
//                                 type="submit"
//                                 disabled={loading}
//                                 className="w-full bg-medico-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 {loading ? (
//                                     <div className="flex items-center justify-center space-x-2">
//                                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                         <span>{isLogin ? 'Iniciando...' : 'Creando cuenta...'}</span>
//                                     </div>
//                                 ) : (
//                                     isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
//                                 )}
//                             </button>
//                         </form>
//
//                         {/* Footer */}
//                         <div className="mt-6 text-center">
//                             <p className="text-sm text-medico-gray">
//                                 {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
//                                 {' '}
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsLogin(!isLogin)}
//                                     className="text-medico-blue hover:text-blue-700 font-medium"
//                                 >
//                                     {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
//                                 </button>
//                             </p>
//
//                             <div className="mt-4 pt-4 border-t border-gray-200">
//                                 <Link to="/" className="text-sm text-medico-gray hover:text-medico-blue">
//                                     ← Volver al inicio
//                                 </Link>
//                             </div>
//                         </div>
//                     </div>
//
//                     {/* Demo Users Info */}
//                     {process.env.NODE_ENV === 'development' && (
//                         <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
//                             <h3 className="text-white font-medium mb-2">👨‍💻 Usuarios de Prueba:</h3>
//                             <div className="text-sm text-blue-100 space-y-1">
//                                 <p><strong>Admin:</strong> admin@med.com / admin123</p>
//                                 <p><strong>Estudiante:</strong> test@test.com / test123</p>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </Layout>
//     )
// }
//
// export default LoginPage


// src/pages/LoginPage1.jsx - CORREGIDO para redirección por rol
import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'
import Layout from '../utils/Layout'

const LoginPage = ({ mode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(mode === 'login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const { isAuthenticated, isAdmin, isInstructor, login, register } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombreCompleto: '',
        nombreUsuario: ''
    })

    // ✅ FUNCIÓN PARA DETERMINAR RUTA SEGÚN ROL
    const determineRedirectPath = () => {
        // Si hay una ruta específica en el state, usarla
        const fromPath = location.state?.from?.pathname
        if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
            return fromPath
        }

        // Determinar ruta por rol
        if (isAdmin) {
            return '/admin'
        } else if (isInstructor) {
            return '/dashboard' // Los instructores van a dashboard pero tienen acceso a admin
        } else {
            return '/dashboard' // Estudiantes
        }
    }

    // Redirigir si ya está autenticado
    useEffect(() => {
        if (isAuthenticated) {
            const redirectPath = determineRedirectPath()
            console.log('Usuario ya autenticado, redirigiendo a:', redirectPath)
            navigate(redirectPath, { replace: true })
        }
    }, [isAuthenticated, isAdmin, isInstructor, navigate, location])

    // Cambiar entre login y registro
    useEffect(() => {
        setIsLogin(mode === 'login')
        setError('')
        setSuccess('')
    }, [mode])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Email y contraseña son requeridos')
            return false
        }

        if (!isLogin) {
            if (!formData.nombreCompleto || !formData.nombreUsuario) {
                setError('Todos los campos son requeridos')
                return false
            }

            if (formData.password !== formData.confirmPassword) {
                setError('Las contraseñas no coinciden')
                return false
            }

            if (formData.password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres')
                return false
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(formData.email)) {
                setError('Formato de email inválido')
                return false
            }

            // Validar nombre de usuario (sin espacios, solo letras, números, puntos, guiones)
            const usernameRegex = /^[a-zA-Z0-9._-]+$/
            if (!usernameRegex.test(formData.nombreUsuario)) {
                setError('El nombre de usuario solo puede contener letras, números, puntos, guiones')
                return false
            }
        }

        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            let result

            if (isLogin) {
                // Login usando AuthContext
                console.log('Iniciando login...')
                result = await login(formData.email, formData.password)
            } else {
                // Registro usando AuthContext
                console.log('Iniciando registro...')
                result = await register({
                    email: formData.email,
                    password: formData.password,
                    nombreCompleto: formData.nombreCompleto,
                    nombreUsuario: formData.nombreUsuario
                })
            }

            console.log('Resultado:', result)

            if (result.success) {
                const successMessage = isLogin ? '¡Bienvenido de vuelta!' : '¡Cuenta creada exitosamente!'
                setSuccess(successMessage)

                // ✅ REDIRECCIÓN MEJORADA CON DELAY PARA QUE EL CONTEXT SE ACTUALICE
                setTimeout(() => {
                    const redirectPath = determineRedirectPath()
                    console.log('Redirigiendo a:', redirectPath)
                    navigate(redirectPath, { replace: true })
                }, 1500) // Aumentado el delay para asegurar que el context se actualice
            } else {
                setError(result.error || `Error al ${isLogin ? 'iniciar sesión' : 'crear cuenta'}`)
            }
        } catch (error) {
            console.error('Error en autenticación:', error)
            setError('Error de conexión. Verifica tu internet y que el servidor esté corriendo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-medico-blue via-blue-600 to-medico-green flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">

                    {/* Header */}
                    <div className="text-center">
                        <Link to="/" className="inline-flex items-center space-x-2 mb-6">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                                <span className="text-medico-blue font-bold text-lg">M</span>
                            </div>
                            <span className="text-2xl font-bold text-white">Mediconsa</span>
                        </Link>

                        <h2 className="text-3xl font-bold text-white">
                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h2>
                        <p className="mt-2 text-blue-100">
                            {isLogin
                                ? 'Accede a tu plataforma de preparación médica'
                                : 'Únete a la comunidad médica de Mediconsa'
                            }
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-2xl shadow-2xl p-8">

                        {/* Toggle Login/Register */}
                        <div className="flex bg-medico-light rounded-lg p-1 mb-6">
                            <button
                                type="button"
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                    isLogin
                                        ? 'bg-medico-blue text-white shadow-sm'
                                        : 'text-medico-gray hover:text-medico-blue'
                                }`}
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                                    !isLogin
                                        ? 'bg-medico-blue text-white shadow-sm'
                                        : 'text-medico-gray hover:text-medico-blue'
                                }`}
                            >
                                Registrarse
                            </button>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-green-600 text-sm">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* Campos de registro */}
                            {!isLogin && (
                                <>
                                    <div>
                                        <label htmlFor="nombreCompleto" className="block text-sm font-medium text-medico-gray mb-1">
                                            Nombre Completo *
                                        </label>
                                        <input
                                            id="nombreCompleto"
                                            name="nombreCompleto"
                                            type="text"
                                            required={!isLogin}
                                            value={formData.nombreCompleto}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            placeholder="Dr. Juan Pérez"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="nombreUsuario" className="block text-sm font-medium text-medico-gray mb-1">
                                            Nombre de Usuario *
                                        </label>
                                        <input
                                            id="nombreUsuario"
                                            name="nombreUsuario"
                                            type="text"
                                            required={!isLogin}
                                            value={formData.nombreUsuario}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            placeholder="juan.perez"
                                        />
                                        <p className="text-xs text-medico-gray mt-1">
                                            Solo letras, números, puntos y guiones. Sin espacios.
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-medico-gray mb-1">
                                    Email *
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                    placeholder="doctor@ejemplo.com"
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-medico-gray mb-1">
                                    Contraseña *
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                    placeholder={isLogin ? "Tu contraseña" : "Mínimo 6 caracteres"}
                                />
                            </div>

                            {/* Confirm Password */}
                            {!isLogin && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-medico-gray mb-1">
                                        Confirmar Contraseña *
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required={!isLogin}
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                        placeholder="Confirma tu contraseña"
                                    />
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-medico-blue text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>{isLogin ? 'Iniciando...' : 'Creando cuenta...'}</span>
                                    </div>
                                ) : (
                                    isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'
                                )}
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-medico-gray">
                                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                                {' '}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-medico-blue hover:text-blue-700 font-medium"
                                >
                                    {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                                </button>
                            </p>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link to="/" className="text-sm text-medico-gray hover:text-medico-blue">
                                    ← Volver al inicio
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Demo Users Info */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                            <h3 className="text-white font-medium mb-2">👨‍💻 Usuarios de Prueba:</h3>
                            <div className="text-sm text-blue-100 space-y-1">
                                <p><strong>Admin:</strong> admin@med.com / admin123 → <span className="text-yellow-200">/admin</span></p>
                                <p><strong>Instructor:</strong> instructor@med.com / inst123 → <span className="text-green-200">/dashboard</span></p>
                                <p><strong>Estudiante:</strong> test@test.com / test123 → <span className="text-blue-200">/dashboard</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default LoginPage
