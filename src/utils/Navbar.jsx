//
// import React, { useState, useEffect, useRef } from 'react'
// import { Link, useNavigate, useLocation } from 'react-router-dom'
// import { useAuth } from './AuthContext'
//
// const Navbar = () => {
//     const { user, isAuthenticated, logout, isAdmin, isInstructor, perfil } = useAuth()
//     const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
//     const [cartCount, setCartCount] = useState(0)
//     const navigate = useNavigate()
//     const location = useLocation()
//     const userMenuRef = useRef(null)
//
//     // Monitorear carrito
//     useEffect(() => {
//         const updateCartCount = () => {
//             const savedCart = localStorage.getItem('mediconsa_cart')
//             if (savedCart) {
//                 try {
//                     const cart = JSON.parse(savedCart)
//                     const count = cart.reduce((total, item) => total + item.cantidad, 0)
//                     setCartCount(count)
//                 } catch (error) {
//                     setCartCount(0)
//                 }
//             } else {
//                 setCartCount(0)
//             }
//         }
//
//         updateCartCount()
//         window.addEventListener('storage', updateCartCount)
//         window.addEventListener('cartUpdated', updateCartCount)
//
//         return () => {
//             window.removeEventListener('storage', updateCartCount)
//             window.removeEventListener('cartUpdated', updateCartCount)
//         }
//     }, [])
//
//     // Cerrar menús al hacer click fuera
//     useEffect(() => {
//         const handleClickOutside = (event) => {
//             if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
//                 setIsUserMenuOpen(false)
//             }
//         }
//
//         document.addEventListener('mousedown', handleClickOutside)
//         return () => document.removeEventListener('mousedown', handleClickOutside)
//     }, [])
//
//     // Cerrar menús al cambiar de ruta
//     useEffect(() => {
//         setIsUserMenuOpen(false)
//         setIsMobileMenuOpen(false)
//     }, [location])
//
//     const handleLogout = async () => {
//         await logout()
//         navigate('/login')
//     }
//
//     const getDefaultRoute = () => {
//         if (isAdmin) return '/admin'
//         if (isInstructor) return '/admin/cursos'
//         return '/dashboard'
//     }
//
//     // ==================== OBTENER DATOS DEL USUARIO ====================
//     const getUserData = () => {
//         const userData = perfil || user || {}
//
//         return {
//             nombreCompleto: userData.nombreCompleto ||
//                 userData.nombre_completo ||
//                 userData.name ||
//                 userData.displayName ||
//                 'Usuario',
//             email: userData.email || userData.correo || '',
//             tipoUsuario: userData.tipoUsuario ||
//                 userData.tipo_usuario ||
//                 userData.role ||
//                 (isAdmin ? 'admin' : isInstructor ? 'instructor' : 'estudiante'),
//             id: userData.id || userData.user_id || userData.userId,
//             username: userData.username || userData.nombre_usuario || userData.userName
//         }
//     }
//
//     const userData = getUserData()
//
//     const getUserInitials = () => {
//         const name = userData.nombreCompleto
//         if (name && name.trim()) {
//             return name.split(' ')
//                 .map(n => n.charAt(0))
//                 .join('')
//                 .substring(0, 2)
//                 .toUpperCase()
//         }
//         return userData.email?.charAt(0).toUpperCase() || 'U'
//     }
//
//     const getUserDisplayName = () => {
//         return userData.nombreCompleto || userData.email?.split('@')[0] || 'Usuario'
//     }
//
//     const getUserRole = () => {
//         const role = userData.tipoUsuario
//         const roleLabels = {
//             'admin': 'Administrador',
//             'instructor': 'Instructor',
//             'estudiante': 'Estudiante',
//             'student': 'Estudiante'
//         }
//         return roleLabels[role] || 'Usuario'
//     }
//
//     // ==================== CLASES CSS ====================
//     const navbarClasses = `bg-white shadow-sm border-b border-gray-200 ${
//         isAuthenticated ? 'sticky top-0 z-40' : 'relative'
//     }`
//
//     return (
//         <nav className={navbarClasses}>
//             <div className={`${isAuthenticated ? 'pl-0' : 'px-4 sm:px-6 lg:px-8'}`}>
//                 <div className="flex justify-between items-center h-16">
//
//                     {/* Logo */}
//                     <div className={`flex items-center ${isAuthenticated ? 'px-4 sm:px-6 lg:px-8' : ''}`}>
//                         <Link
//                             to={isAuthenticated ? getDefaultRoute() : "/"}
//                             className="flex items-center space-x-3 group"
//                         >
//                             <div className="relative">
//                                 <div className="w-10 h-10 bg-gradient-to-br from-medico-blue to-blue-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
//                                     <span className="text-white font-bold text-lg">M</span>
//                                 </div>
//                                 {isAuthenticated && (
//                                     <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
//                                 )}
//                             </div>
//                             <div className="flex flex-col">
//                                 <span className="text-xl font-bold text-medico-blue group-hover:text-blue-700 transition-colors">
//                                     Mediconsa
//                                 </span>
//                                 <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
//                                     Educación Médica
//                                 </span>
//                             </div>
//                         </Link>
//                     </div>
//
//                     {/* Navegación Pública */}
//                     {!isAuthenticated && (
//                         <div className="flex items-center">
//                             {/* Desktop Navigation */}
//                             <div className="hidden md:flex items-center space-x-6">
//                                 <Link
//                                     to="/cursos"
//                                     className="text-gray-600 hover:text-medico-blue transition-colors font-medium"
//                                 >
//                                     Cursos
//                                 </Link>
//                                 <Link
//                                     to="/materiales"
//                                     className="text-gray-600 hover:text-medico-blue transition-colors font-medium relative"
//                                 >
//                                     MyMateriales
//                                     {cartCount > 0 && (
//                                         <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                                             {cartCount}
//                                         </span>
//                                     )}
//                                 </Link>
//                                 {cartCount > 0 && (
//                                     <Link
//                                         to="/carrito"
//                                         className="text-gray-600 hover:text-medico-blue transition-colors font-medium relative flex items-center space-x-1"
//                                     >
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
//                                         </svg>
//                                         <span>Carrito</span>
//                                         <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                                             {cartCount}
//                                         </span>
//                                     </Link>
//                                 )}
//                                 <Link
//                                     to="/login"
//                                     className="text-gray-600 hover:text-medico-blue transition-colors font-medium"
//                                 >
//                                     Iniciar Sesión
//                                 </Link>
//                                 <Link
//                                     to="/registro"
//                                     className="bg-gradient-to-r from-medico-blue to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
//                                 >
//                                     Registrarse
//                                 </Link>
//                             </div>
//
//                             {/* Mobile menu button */}
//                             <div className="md:hidden">
//                                 <button
//                                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                                     className="p-2 rounded-md text-gray-600 hover:text-medico-blue hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-medico-blue focus:ring-offset-2 transition-colors relative"
//                                 >
//                                     {cartCount > 0 && (
//                                         <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
//                                             {cartCount}
//                                         </span>
//                                     )}
//                                     <svg
//                                         className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
//                                         fill="none"
//                                         stroke="currentColor"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         {isMobileMenuOpen ? (
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                                         ) : (
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                                         )}
//                                     </svg>
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//
//                     {/* Usuario Autenticado */}
//                     {isAuthenticated && (
//                         <div className="flex items-center px-4 sm:px-6 lg:px-8">
//                             {/* Desktop User Menu */}
//                             <div className="hidden md:block relative" ref={userMenuRef}>
//                                 <button
//                                     onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
//                                     className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-transparent hover:border-gray-200"
//                                 >
//                                     <div className="relative">
//                                         <div className="w-9 h-9 bg-gradient-to-br from-medico-blue to-blue-700 rounded-full flex items-center justify-center shadow-md">
//                                             <span className="text-white text-sm font-semibold">
//                                                 {getUserInitials()}
//                                             </span>
//                                         </div>
//                                         <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
//                                     </div>
//                                     <div className="text-left">
//                                         <p className="text-sm font-medium text-gray-900 truncate max-w-32">
//                                             {getUserDisplayName()}
//                                         </p>
//                                         <p className="text-xs text-gray-500">{getUserRole()}</p>
//                                     </div>
//                                     <svg
//                                         className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
//                                         fill="none"
//                                         stroke="currentColor"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                                     </svg>
//                                 </button>
//
//                                 {/* Dropdown Menu */}
//                                 {isUserMenuOpen && (
//                                     <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
//                                         <div className="py-2">
//                                             {/* User Info */}
//                                             <div className="px-4 py-3 border-b border-gray-100">
//                                                 <div className="flex items-center space-x-3">
//                                                     <div className="w-10 h-10 bg-gradient-to-br from-medico-blue to-blue-700 rounded-full flex items-center justify-center">
//                                                         <span className="text-white text-sm font-semibold">
//                                                             {getUserInitials()}
//                                                         </span>
//                                                     </div>
//                                                     <div className="flex-1 min-w-0">
//                                                         <p className="text-sm font-medium text-gray-900 truncate">
//                                                             {getUserDisplayName()}
//                                                         </p>
//                                                         <p className="text-xs text-gray-500 truncate">{userData.email}</p>
//                                                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
//                                                             {getUserRole()}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//
//                                             {/* Menu Items según rol */}
//                                             {isAdmin && (
//                                                 <Link
//                                                     to="/admin"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                                     </svg>
//                                                     Administración
//                                                 </Link>
//                                             )}
//
//                                             {isInstructor && (
//                                                 <Link
//                                                     to="/admin/cursos"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                                                     </svg>
//                                                     Mis Cursos
//                                                 </Link>
//                                             )}
//
//                                             {!isAdmin && !isInstructor && (
//                                                 <Link
//                                                     to="/perfil"
//                                                     className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                                                     onClick={() => setIsUserMenuOpen(false)}
//                                                 >
//                                                     <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                                     </svg>
//                                                     Mi Perfil
//                                                 </Link>
//                                             )}
//
//                                             <div className="border-t border-gray-100 mt-2 pt-2">
//                                                 <button
//                                                     onClick={handleLogout}
//                                                     className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
//                                                 >
//                                                     <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                                                     </svg>
//                                                     Cerrar Sesión
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//
//                             {/* Mobile User Menu Button */}
//                             <div className="md:hidden">
//                                 <button
//                                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                                     className="p-2 rounded-md text-gray-600 hover:text-medico-blue hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-medico-blue focus:ring-offset-2 transition-colors"
//                                 >
//                                     <div className="w-8 h-8 bg-gradient-to-br from-medico-blue to-blue-700 rounded-full flex items-center justify-center">
//                                         <span className="text-white text-sm font-semibold">
//                                             {getUserInitials()}
//                                         </span>
//                                     </div>
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//
//                 {/* Mobile menu - No autenticado */}
//                 {!isAuthenticated && isMobileMenuOpen && (
//                     <div className="md:hidden border-t border-gray-200">
//                         <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
//                             <Link
//                                 to="/cursos"
//                                 className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-medico-blue hover:bg-gray-100 rounded-lg transition-colors"
//                                 onClick={() => setIsMobileMenuOpen(false)}
//                             >
//                                 <div className="flex items-center space-x-3">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                                     </svg>
//                                     <span>Cursos</span>
//                                 </div>
//                             </Link>
//                             <Link
//                                 to="/materiales"
//                                 className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-medico-blue hover:bg-gray-100 rounded-lg transition-colors"
//                                 onClick={() => setIsMobileMenuOpen(false)}
//                             >
//                                 <div className="flex items-center space-x-3">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                     </svg>
//                                     <span>MyMateriales</span>
//                                     {cartCount > 0 && (
//                                         <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto">
//                                             {cartCount}
//                                         </span>
//                                     )}
//                                 </div>
//                             </Link>
//                             {cartCount > 0 && (
//                                 <Link
//                                     to="/carrito"
//                                     className="block px-4 py-3 text-base font-medium text-medico-blue hover:bg-blue-50 rounded-lg transition-colors"
//                                     onClick={() => setIsMobileMenuOpen(false)}
//                                 >
//                                     <div className="flex items-center space-x-3">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
//                                         </svg>
//                                         <span>Mi Carrito ({cartCount})</span>
//                                     </div>
//                                 </Link>
//                             )}
//                             <Link
//                                 to="/login"
//                                 className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-medico-blue hover:bg-gray-100 rounded-lg transition-colors"
//                                 onClick={() => setIsMobileMenuOpen(false)}
//                             >
//                                 <div className="flex items-center space-x-3">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
//                                     </svg>
//                                     <span>Iniciar Sesión</span>
//                                 </div>
//                             </Link>
//                             <Link
//                                 to="/registro"
//                                 className="block px-4 py-3 text-base font-medium text-medico-blue hover:bg-blue-50 rounded-lg transition-colors"
//                                 onClick={() => setIsMobileMenuOpen(false)}
//                             >
//                                 <div className="flex items-center space-x-3">
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
//                                     </svg>
//                                     <span>Registrarse</span>
//                                 </div>
//                             </Link>
//                         </div>
//                     </div>
//                 )}
//
//                 {/* Mobile menu - Autenticado */}
//                 {isAuthenticated && isMobileMenuOpen && (
//                     <div className="md:hidden border-t border-gray-200">
//                         <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50">
//                             {/* User Info Mobile */}
//                             <div className="px-4 py-4 bg-white rounded-lg mx-2 mb-3 border border-gray-200">
//                                 <div className="flex items-center space-x-3">
//                                     <div className="w-12 h-12 bg-gradient-to-br from-medico-blue to-blue-700 rounded-full flex items-center justify-center">
//                                        <span className="text-white font-semibold">
//                                            {getUserInitials()}
//                                        </span>
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                         <p className="text-sm font-semibold text-gray-900 truncate">
//                                             {getUserDisplayName()}
//                                         </p>
//                                         <p className="text-xs text-gray-500 truncate">{userData.email}</p>
//                                         <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
//                                            {getUserRole()}
//                                        </span>
//                                     </div>
//                                 </div>
//                             </div>
//
//                             {/* Menu Items según rol */}
//                             {isAdmin && (
//                                 <Link
//                                     to="/admin"
//                                     className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-medico-blue hover:bg-gray-100 rounded-lg transition-colors mx-2"
//                                     onClick={() => setIsMobileMenuOpen(false)}
//                                 >
//                                     <div className="flex items-center space-x-3">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                                         </svg>
//                                         <span>Administración</span>
//                                     </div>
//                                 </Link>
//                             )}
//
//                             {isInstructor && (
//                                 <Link
//                                     to="/admin/cursos"
//                                     className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-medico-blue hover:bg-gray-100 rounded-lg transition-colors mx-2"
//                                     onClick={() => setIsMobileMenuOpen(false)}
//                                 >
//                                     <div className="flex items-center space-x-3">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
//                                         </svg>
//                                         <span>Mis Cursos</span>
//                                     </div>
//                                 </Link>
//                             )}
//
//                             {!isAdmin && !isInstructor && (
//                                 <Link
//                                     to="/perfil"
//                                     className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-medico-blue hover:bg-gray-100 rounded-lg transition-colors mx-2"
//                                     onClick={() => setIsMobileMenuOpen(false)}
//                                 >
//                                     <div className="flex items-center space-x-3">
//                                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                         </svg>
//                                         <span>Mi Perfil</span>
//                                     </div>
//                                 </Link>
//                             )}
//
//                             {/* Logout Button Mobile */}
//                             <div className="pt-3 mt-3 border-t border-gray-200">
//                                 <button
//                                     onClick={handleLogout}
//                                     className="flex items-center w-full px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors rounded-lg mx-2"
//                                 >
//                                     <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                                     </svg>
//                                     <span>Cerrar Sesión</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </nav>
//     )
// }
//
// export default Navbar



import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
// Importa tu logo
import logoBlanco from '../assets/logoblancotexto.PNG'

const Navbar = () => {
    const { user, isAuthenticated, logout, isAdmin, isInstructor, perfil } = useAuth()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()
    const userMenuRef = useRef(null)

    // Monitorear carrito
    useEffect(() => {
        const updateCartCount = () => {
            const savedCart = localStorage.getItem('mediconsa_cart')
            if (savedCart) {
                try {
                    const cart = JSON.parse(savedCart)
                    const count = cart.reduce((total, item) => total + item.cantidad, 0)
                    setCartCount(count)
                } catch (error) {
                    setCartCount(0)
                }
            } else {
                setCartCount(0)
            }
        }

        updateCartCount()
        window.addEventListener('storage', updateCartCount)
        window.addEventListener('cartUpdated', updateCartCount)

        return () => {
            window.removeEventListener('storage', updateCartCount)
            window.removeEventListener('cartUpdated', updateCartCount)
        }
    }, [])

    // Cerrar menús al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Cerrar menús al cambiar de ruta
    useEffect(() => {
        setIsUserMenuOpen(false)
        setIsMobileMenuOpen(false)
    }, [location])

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const getDefaultRoute = () => {
        if (isAdmin) return '/admin'
        if (isInstructor) return '/admin/cursos'
        return '/dashboard'
    }

    // ==================== OBTENER DATOS DEL USUARIO ====================
    const getUserData = () => {
        const userData = perfil || user || {}

        return {
            nombreCompleto: userData.nombreCompleto ||
                userData.nombre_completo ||
                userData.name ||
                userData.displayName ||
                'Usuario',
            email: userData.email || userData.correo || '',
            tipoUsuario: userData.tipoUsuario ||
                userData.tipo_usuario ||
                userData.role ||
                (isAdmin ? 'admin' : isInstructor ? 'instructor' : 'estudiante'),
            id: userData.id || userData.user_id || userData.userId,
            username: userData.username || userData.nombre_usuario || userData.userName
        }
    }

    const userData = getUserData()

    const getUserInitials = () => {
        const name = userData.nombreCompleto
        if (name && name.trim()) {
            return name.split(' ')
                .map(n => n.charAt(0))
                .join('')
                .substring(0, 2)
                .toUpperCase()
        }
        return userData.email?.charAt(0).toUpperCase() || 'U'
    }

    const getUserDisplayName = () => {
        return userData.nombreCompleto || userData.email?.split('@')[0] || 'Usuario'
    }

    const getUserRole = () => {
        const role = userData.tipoUsuario
        const roleLabels = {
            'admin': 'Administrador',
            'instructor': 'Instructor',
            'estudiante': 'Estudiante',
            'student': 'Estudiante'
        }
        return roleLabels[role] || 'Usuario'
    }

    // ==================== CLASES CSS ====================
    const navbarClasses = `bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border-b border-blue-800 ${
        isAuthenticated ? 'sticky top-0 z-40' : 'relative'
    }`

    return (
        <nav className={navbarClasses}>
            <div className={`${isAuthenticated ? 'pl-0' : 'px-4 sm:px-6 lg:px-8'}`}>
                <div className="flex justify-between items-center h-16">

                    {/* Logo */}
                    <div className={`flex items-center ${isAuthenticated ? 'px-4 sm:px-6 lg:px-8' : ''}`}>
                        <Link
                            to={isAuthenticated ? getDefaultRoute() : "/"}
                            className="flex items-center space-x-3 group"
                        >
                            <div className="relative">
                                <img
                                    src={logoBlanco}
                                    alt="Logo Mediconsa"
                                    className="h-10 w-auto transition-all duration-300 group-hover:scale-105 filter drop-shadow-md"
                                />
                                {isAuthenticated && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* Navegación Pública */}
                    {!isAuthenticated && (
                        <div className="flex items-center">
                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center space-x-6">
                                <Link
                                    to="/cursos"
                                    className="text-blue-100 hover:text-white transition-colors font-medium hover:bg-blue-600/50 px-3 py-2 rounded-lg"
                                >
                                    Cursos
                                </Link>
                                <Link
                                    to="/materiales"
                                    className="text-blue-100 hover:text-white transition-colors font-medium relative hover:bg-blue-600/50 px-3 py-2 rounded-lg"
                                >
                                    Materiales
                                    {cartCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                                {cartCount > 0 && (
                                    <Link
                                        to="/carrito"
                                        className="text-blue-100 hover:text-white transition-colors font-medium relative flex items-center space-x-1 hover:bg-blue-600/50 px-3 py-2 rounded-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
                                        </svg>
                                        <span>Carrito</span>
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                                            {cartCount}
                                        </span>
                                    </Link>
                                )}
                                <Link
                                    to="/login"
                                    className="text-blue-100 hover:text-white transition-colors font-medium hover:bg-blue-600/50 px-3 py-2 rounded-lg"
                                >
                                    Iniciar Sesión
                                </Link>
                                <Link
                                    to="/registro"
                                    className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium border border-blue-200"
                                >
                                    Registrarse
                                </Link>
                            </div>

                            {/* Mobile menu button */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-600/50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-colors relative"
                                >
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                                            {cartCount}
                                        </span>
                                    )}
                                    <svg
                                        className={`w-6 h-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        {isMobileMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Usuario Autenticado */}
                    {isAuthenticated && (
                        <div className="flex items-center px-4 sm:px-6 lg:px-8">
                            {/* Desktop User Menu */}
                            <div className="hidden md:block relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-600/50 transition-colors duration-200 border border-transparent hover:border-blue-500"
                                >
                                    <div className="relative">
                                        <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md border border-white/30">
                                            <span className="text-white text-sm font-semibold">
                                                {getUserInitials()}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-medium text-white truncate max-w-32">
                                            {getUserDisplayName()}
                                        </p>
                                        <p className="text-xs text-blue-100">{getUserRole()}</p>
                                    </div>
                                    <svg
                                        className={`w-4 h-4 text-blue-200 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-in slide-in-from-top-2 duration-200">
                                        <div className="py-2">
                                            {/* User Info */}
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-sm font-semibold">
                                                            {getUserInitials()}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {getUserDisplayName()}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">{userData.email}</p>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                                                            {getUserRole()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Menu Items según rol */}
                                            {isAdmin && (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Administración
                                                </Link>
                                            )}

                                            {isInstructor && (
                                                <Link
                                                    to="/admin/cursos"
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    Mis Cursos
                                                </Link>
                                            )}

                                            {!isAdmin && !isInstructor && (
                                                <Link
                                                    to="/perfil"
                                                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                    Mi Perfil
                                                </Link>
                                            )}

                                            <div className="border-t border-gray-100 mt-2 pt-2">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Cerrar Sesión
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Mobile User Menu Button */}
                            <div className="md:hidden">
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="p-2 rounded-md text-blue-100 hover:text-white hover:bg-blue-600/50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 transition-colors"
                                >
                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                        <span className="text-white text-sm font-semibold">
                                            {getUserInitials()}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile menu - No autenticado */}
                {!isAuthenticated && isMobileMenuOpen && (
                    <div className="md:hidden border-t border-blue-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700/50 backdrop-blur-sm">
                            <Link
                                to="/cursos"
                                className="block px-4 py-3 text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    <span>Cursos</span>
                                </div>
                            </Link>
                            <Link
                                to="/materiales"
                                className="block px-4 py-3 text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Materiales</span>
                                    {cartCount > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center ml-auto shadow-md">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                            </Link>
                            {cartCount > 0 && (
                                <Link
                                    to="/carrito"
                                    className="block px-4 py-3 text-base font-medium text-white hover:bg-blue-600/70 rounded-lg transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13h10m-10 0L5.5 7M17 13l1.5 6" />
                                        </svg>
                                        <span>Mi Carrito ({cartCount})</span>
                                    </div>
                                </Link>
                            )}
                            <Link
                                to="/login"
                                className="block px-4 py-3 text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Iniciar Sesión</span>
                                </div>
                            </Link>
                            <Link
                                to="/registro"
                                className="block px-4 py-3 text-base font-medium text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition-colors mx-2 shadow-md"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <div className="flex items-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span>Registrarse</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Mobile menu - Autenticado */}
                {isAuthenticated && isMobileMenuOpen && (
                    <div className="md:hidden border-t border-blue-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 bg-blue-700/50 backdrop-blur-sm">
                            {/* User Info Mobile */}
                            <div className="px-4 py-4 bg-white/10 backdrop-blur-sm rounded-lg mx-2 mb-3 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                                       <span className="text-white font-semibold">
                                           {getUserInitials()}
                                       </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {getUserDisplayName()}
                                        </p>
                                        <p className="text-xs text-blue-100 truncate">{userData.email}</p>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white mt-1 border border-white/30">
                                           {getUserRole()}
                                       </span>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Items según rol */}
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className="block px-4 py-3 text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors mx-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Administración</span>
                                    </div>
                                </Link>
                            )}

                            {isInstructor && (
                                <Link
                                    to="/admin/cursos"
                                    className="block px-4 py-3 text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors mx-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <span>Mis Cursos</span>
                                    </div>
                                </Link>
                            )}

                            {!isAdmin && !isInstructor && (
                                <Link
                                    to="/perfil"
                                    className="block px-4 py-3 text-base font-medium text-blue-100 hover:text-white hover:bg-blue-600/50 rounded-lg transition-colors mx-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Mi Perfil</span>
                                    </div>
                                </Link>
                            )}

                            {/* Logout Button Mobile */}
                            <div className="pt-3 mt-3 border-t border-blue-800/50">
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-4 py-3 text-base font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors rounded-lg mx-2"
                                >
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Cerrar Sesión</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar