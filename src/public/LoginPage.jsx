import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../utils/AuthContext'
import Layout from '../utils/Layout'
import authService from '../services/auth'
import { GOOGLE_ENABLED } from '../config/google'
import { MOTIVOS_SESION } from '../utils/dispositivo'

const LoginPage = ({ mode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(mode === 'login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Verificación de correo pendiente (cuando el backend exige confirmar antes de entrar)
    const [unverifiedEmail, setUnverifiedEmail] = useState('')
    const [resendLoading, setResendLoading] = useState(false)
    const [resendMessage, setResendMessage] = useState('')

    const { isAuthenticated, isAdmin, isInstructor, login, register, loginWithGoogle } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Form data
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        nombreCompleto: '',
        nombreUsuario: '',
        telefono: ''
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

    // Sesión cerrada por el servidor (otro dispositivo, límite, caducidad): explicar por qué
    const [avisoSesion, setAvisoSesion] = useState('')
    useEffect(() => {
        const motivo = new URLSearchParams(location.search).get('motivo')
        if (motivo && MOTIVOS_SESION[motivo]) setAvisoSesion(MOTIVOS_SESION[motivo])
    }, [location.search])

    const handleInputChange = (e) => {
        const { name, value } = e.target

        // Si es el campo de teléfono, solo permitir números, espacios, guiones y símbolo +
        if (name === 'telefono') {
            const cleanedValue = value.replace(/[^0-9+\s-]/g, '')
            setFormData(prev => ({
                ...prev,
                [name]: cleanedValue
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
        setError('')
    }

    const validateForm = () => {
        if (!formData.email || !formData.password) {
            setError('Email y contraseña son requeridos')
            return false
        }

        if (!isLogin) {
            if (!formData.nombreCompleto || !formData.nombreUsuario || !formData.telefono) {
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

            // Validar teléfono (al menos 10 dígitos)
            const phoneDigits = formData.telefono.replace(/[^0-9]/g, '')
            if (phoneDigits.length < 10) {
                setError('El teléfono debe tener al menos 10 dígitos')
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
                    nombreUsuario: formData.nombreUsuario,
                    telefono: formData.telefono
                })
            }

            console.log('Resultado:', result)

            if (result.success) {
                // Registro con verificación obligatoria: no hay sesión, se pide confirmar el correo
                if (!isLogin && result.data?.requiresEmailVerification) {
                    setSuccess(result.message || 'Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.')
                    setUnverifiedEmail(formData.email)
                    setIsLogin(true)
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
                    return
                }

                const successMessage = isLogin
                    ? '¡Bienvenido de vuelta!'
                    : (result.data?.verificationSent
                        ? '¡Cuenta creada! Te enviamos un correo para confirmar tu cuenta.'
                        : '¡Cuenta creada exitosamente!')
                setSuccess(successMessage)

                // ✅ REDIRECCIÓN MEJORADA CON DELAY PARA QUE EL CONTEXT SE ACTUALICE
                setTimeout(() => {
                    const redirectPath = determineRedirectPath()
                    console.log('Redirigiendo a:', redirectPath)
                    navigate(redirectPath, { replace: true })
                }, 1500) // Aumentado el delay para asegurar que el context se actualice
            } else {
                setError(result.error || `Error al ${isLogin ? 'iniciar sesión' : 'crear cuenta'}`)
                if (result.code === 'EMAIL_NOT_VERIFIED') {
                    setUnverifiedEmail(formData.email)
                }
            }
        } catch (error) {
            console.error('Error en autenticación:', error)
            setError('Error de conexión. Verifica tu internet y que el servidor esté corriendo.')
        } finally {
            setLoading(false)
        }
    }

    // Reenviar correo de verificación
    const handleResendVerification = async () => {
        setResendLoading(true)
        setResendMessage('')
        try {
            const result = await authService.resendVerification(unverifiedEmail)
            setResendMessage(result.success ? result.message : (result.error || 'No se pudo reenviar el correo'))
        } finally {
            setResendLoading(false)
        }
    }

    // Login / registro con Google (credential = ID token)
    const handleGoogleSuccess = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
            setError('Google no devolvió una credencial válida')
            return
        }

        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const result = await loginWithGoogle(credentialResponse.credential)

            if (result.success) {
                setSuccess(result.data?.isNewUser ? '¡Cuenta creada con Google!' : '¡Bienvenido de vuelta!')
                setTimeout(() => {
                    navigate(determineRedirectPath(), { replace: true })
                }, 1200)
            } else {
                setError(result.error || 'No se pudo iniciar sesión con Google')
            }
        } catch (err) {
            console.error('Error con Google:', err)
            setError('Error de conexión. Verifica tu internet y que el servidor esté corriendo.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleError = () => {
        setError('No se pudo completar el inicio de sesión con Google. Intenta de nuevo.')
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
                        {avisoSesion && !error && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <p className="text-amber-800 text-sm">{avisoSesion}</p>
                            </div>
                        )}
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

                        {unverifiedEmail && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                <p>
                                    Tu correo <strong>{unverifiedEmail}</strong> aún no está confirmado. Revisa tu bandeja de entrada o spam.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    disabled={resendLoading}
                                    className="mt-1 font-medium text-medico-blue hover:text-blue-700 disabled:opacity-50"
                                >
                                    {resendLoading ? 'Enviando...' : 'Reenviar correo de verificación'}
                                </button>
                                {resendMessage && <p className="mt-1 text-yellow-700">{resendMessage}</p>}
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

                                    <div>
                                        <label htmlFor="telefono" className="block text-sm font-medium text-medico-gray mb-1">
                                            Teléfono *
                                        </label>
                                        <input
                                            id="telefono"
                                            name="telefono"
                                            type="tel"
                                            required={!isLogin}
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medico-blue focus:border-transparent transition-colors"
                                            placeholder="+593 99 999 9999"
                                            maxLength="20"
                                        />
                                        <p className="text-xs text-medico-gray mt-1">
                                            Mínimo 10 dígitos. Solo números, espacios, + y guiones.
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
                                {isLogin && (
                                    <div className="mt-2 text-right">
                                        <Link
                                            to="/recuperar-contrasena"
                                            className="text-sm text-medico-blue hover:text-blue-700 font-medium"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                )}
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

                        {/* Google Sign-In */}
                        {GOOGLE_ENABLED && (
                            <div className="mt-6">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-white px-3 text-medico-gray">o continúa con</span>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={handleGoogleError}
                                        text={isLogin ? 'signin_with' : 'signup_with'}
                                        locale="es"
                                        shape="rectangular"
                                        size="large"
                                        width="320"
                                    />
                                </div>
                            </div>
                        )}

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
                    {/*{process.env.NODE_ENV === 'development' && (*/}
                    {/*    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">*/}
                    {/*        <h3 className="text-white font-medium mb-2">👨‍💻 Usuarios de Prueba:</h3>*/}
                    {/*        <div className="text-sm text-blue-100 space-y-1">*/}
                    {/*            <p><strong>Admin:</strong> admin@med.com / admin123 → <span className="text-yellow-200">/admin</span></p>*/}
                    {/*            <p><strong>Instructor:</strong> instructor@med.com / inst123 → <span className="text-green-200">/dashboard</span></p>*/}
                    {/*            <p><strong>Estudiante:</strong> test@test.com / test123 → <span className="text-blue-200">/dashboard</span></p>*/}
                    {/*        </div>*/}
                    {/*    </div>*/}
                    {/*)}*/}
                </div>
            </div>
        </Layout>
    )
}

export default LoginPage
