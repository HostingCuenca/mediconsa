// // src/components/VideoPlayer.jsx - SIMPLE CON CONTROLES BÁSICOS
// import React, { useState, useRef, useEffect } from 'react'
//
// const VideoPlayer = ({
//                          videoUrl,
//                          title,
//                          onProgress,
//                          onComplete,
//                          currentProgress = 0,
//                          autoplay = false,
//                          className = "",
//                          onTimeUpdate
//                      }) => {
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(false)
//     const [isPlaying, setIsPlaying] = useState(false)
//     const [duration, setDuration] = useState(0)
//     const [currentTime, setCurrentTime] = useState(0)
//     const [showControls, setShowControls] = useState(true)
//     const [volume, setVolume] = useState(1)
//     const [muted, setMuted] = useState(false)
//
//     const iframeRef = useRef(null)
//     const containerRef = useRef(null)
//     const controlsTimeoutRef = useRef(null)
//     const progressIntervalRef = useRef(null)
//     const playerRef = useRef(null)
//
//     // ========== EXTRACCIÓN DE VIDEO ID ==========
//     const extractVideoId = (url) => {
//         if (!url) return null
//
//         try {
//             const patterns = [
//                 /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
//                 /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
//                 /youtu\.be\/([a-zA-Z0-9_-]{11})/
//             ]
//
//             for (const pattern of patterns) {
//                 const match = url.match(pattern)
//                 if (match && match[1]) {
//                     return match[1]
//                 }
//             }
//
//             return null
//         } catch (error) {
//             console.error('Error extrayendo video ID:', error)
//             return null
//         }
//     }
//
//     // ========== URL SIN CONTROLES DE YOUTUBE ==========
//     const createEmbedUrl = (videoId) => {
//         if (!videoId) return null
//
//         const params = new URLSearchParams({
//             autoplay: '0',
//             mute: '1',
//             controls: '0',              // SIN controles de YouTube
//             showinfo: '0',
//             rel: '0',
//             modestbranding: '1',
//             iv_load_policy: '3',
//             playsinline: '1',
//             enablejsapi: '1',
//             disablekb: '1',
//             fs: '0',
//             origin: window.location.origin
//         })
//
//         return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
//     }
//
//     const videoId = extractVideoId(videoUrl)
//     const embedUrl = createEmbedUrl(videoId)
//
//     // ========== INICIALIZACIÓN DE YOUTUBE API ==========
//     useEffect(() => {
//         if (!embedUrl) {
//             setError(true)
//             setLoading(false)
//             return
//         }
//
//         if (!window.YT) {
//             const script = document.createElement('script')
//             script.src = 'https://www.youtube.com/iframe_api'
//             script.onload = () => {
//                 window.onYouTubeIframeAPIReady = initializePlayer
//             }
//             document.head.appendChild(script)
//         } else {
//             initializePlayer()
//         }
//
//         return () => {
//             if (progressIntervalRef.current) {
//                 clearInterval(progressIntervalRef.current)
//             }
//         }
//     }, [embedUrl])
//
//     // ========== INICIALIZAR PLAYER ==========
//     const initializePlayer = () => {
//         if (!window.YT || !videoId) return
//
//         try {
//             const playerDiv = document.createElement('div')
//             playerDiv.id = `youtube-player-${Date.now()}`
//
//             if (iframeRef.current && iframeRef.current.parentNode) {
//                 iframeRef.current.parentNode.replaceChild(playerDiv, iframeRef.current)
//             }
//
//             playerRef.current = new window.YT.Player(playerDiv, {
//                 height: '100%',
//                 width: '100%',
//                 videoId: videoId,
//                 playerVars: {
//                     controls: 0,
//                     modestbranding: 1,
//                     showinfo: 0,
//                     rel: 0,
//                     disablekb: 1,
//                     fs: 0,
//                     iv_load_policy: 3,
//                     enablejsapi: 1,
//                     origin: window.location.origin
//                 },
//                 events: {
//                     onReady: handlePlayerReady,
//                     onStateChange: handlePlayerStateChange,
//                     onError: handlePlayerError
//                 }
//             })
//         } catch (error) {
//             console.error('Error inicializando player:', error)
//             setError(true)
//             setLoading(false)
//         }
//     }
//
//     // ========== EVENTOS DEL PLAYER ==========
//     const handlePlayerReady = (event) => {
//         setLoading(false)
//         setDuration(event.target.getDuration())
//         startProgressTracking()
//     }
//
//     const handlePlayerStateChange = (event) => {
//         const state = event.data
//
//         switch (state) {
//             case window.YT.PlayerState.PLAYING:
//                 setIsPlaying(true)
//                 break
//             case window.YT.PlayerState.PAUSED:
//                 setIsPlaying(false)
//                 break
//             case window.YT.PlayerState.ENDED:
//                 setIsPlaying(false)
//                 if (onComplete) onComplete()
//                 break
//             default:
//                 break
//         }
//     }
//
//     const handlePlayerError = (event) => {
//         console.error('Error del player:', event.data)
//         setError(true)
//         setLoading(false)
//     }
//
//     // ========== TRACKING DE PROGRESO ==========
//     const startProgressTracking = () => {
//         if (progressIntervalRef.current) {
//             clearInterval(progressIntervalRef.current)
//         }
//
//         progressIntervalRef.current = setInterval(() => {
//             if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
//                 try {
//                     const current = playerRef.current.getCurrentTime()
//                     const total = playerRef.current.getDuration()
//
//                     if (current && total && total > 0) {
//                         setCurrentTime(current)
//                         setDuration(total)
//
//                         const progress = (current / total) * 100
//
//                         if (onProgress && progress > 0) {
//                             onProgress(Math.floor(progress))
//                         }
//
//                         if (onTimeUpdate) {
//                             onTimeUpdate(current, total)
//                         }
//
//                         if (onComplete && progress >= 95) {
//                             onComplete()
//                         }
//                     }
//                 } catch (error) {
//                     console.error('Error obteniendo progreso:', error)
//                 }
//             }
//         }, 1000)
//     }
//
//     // ========== CONTROLES SIMPLES ==========
//     const togglePlayPause = () => {
//         if (!playerRef.current) return
//
//         try {
//             if (isPlaying) {
//                 playerRef.current.pauseVideo()
//             } else {
//                 playerRef.current.playVideo()
//             }
//         } catch (error) {
//             console.error('Error controlando reproducción:', error)
//         }
//     }
//
//     const seekTo = (percentage) => {
//         if (!playerRef.current || !duration) return
//
//         try {
//             const seekTime = (percentage / 100) * duration
//             playerRef.current.seekTo(seekTime, true)
//             setCurrentTime(seekTime)
//         } catch (error) {
//             console.error('Error buscando posición:', error)
//         }
//     }
//
//     const toggleMute = () => {
//         if (!playerRef.current) return
//
//         try {
//             if (muted) {
//                 playerRef.current.unMute()
//                 setMuted(false)
//             } else {
//                 playerRef.current.mute()
//                 setMuted(true)
//             }
//         } catch (error) {
//             console.error('Error toggleando mute:', error)
//         }
//     }
//
//     // ========== MANEJO DE CONTROLES ==========
//     useEffect(() => {
//         if (showControls) {
//             controlsTimeoutRef.current = setTimeout(() => {
//                 if (isPlaying) {
//                     setShowControls(false)
//                 }
//             }, 3000)
//         }
//
//         return () => {
//             if (controlsTimeoutRef.current) {
//                 clearTimeout(controlsTimeoutRef.current)
//             }
//         }
//     }, [showControls, isPlaying])
//
//     const handleMouseMove = () => {
//         setShowControls(true)
//         if (controlsTimeoutRef.current) {
//             clearTimeout(controlsTimeoutRef.current)
//         }
//     }
//
//     const handleSeekBarClick = (e) => {
//         const rect = e.currentTarget.getBoundingClientRect()
//         const percentage = ((e.clientX - rect.left) / rect.width) * 100
//         seekTo(percentage)
//     }
//
//     // ========== UTILIDADES ==========
//     const formatTime = (seconds) => {
//         if (!seconds || !isFinite(seconds)) return '0:00'
//
//         const mins = Math.floor(seconds / 60)
//         const secs = Math.floor(seconds % 60)
//
//         return `${mins}:${secs.toString().padStart(2, '0')}`
//     }
//
//     const getProgressPercentage = () => {
//         if (!duration || !currentTime) return 0
//         return Math.min((currentTime / duration) * 100, 100)
//     }
//
//     // ========== RENDER ==========
//     if (!videoUrl || !videoId) {
//         return (
//             <div className={`relative bg-gray-900 flex items-center justify-center ${className} rounded-xl overflow-hidden`}>
//                 <div className="text-center text-white p-8">
//                     <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
//                     </svg>
//                     <h3 className="text-lg font-medium mb-2">Video no disponible</h3>
//                     <p className="text-gray-400">No se pudo cargar el contenido del video</p>
//                 </div>
//             </div>
//         )
//     }
//
//     if (error) {
//         return (
//             <div className={`relative bg-gray-900 flex items-center justify-center ${className} rounded-xl overflow-hidden`}>
//                 <div className="text-center text-white p-8">
//                     <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <h3 className="text-lg font-medium mb-2">Error cargando video</h3>
//                     <p className="text-gray-300 mb-4">No se pudo cargar el contenido</p>
//                     <button
//                         onClick={() => window.location.reload()}
//                         className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
//                     >
//                         Reintentar
//                     </button>
//                 </div>
//             </div>
//         )
//     }
//
//     return (
//         <div
//             ref={containerRef}
//             className={`relative bg-black group ${className} rounded-xl overflow-hidden`}
//             onMouseMove={handleMouseMove}
//             onMouseLeave={() => setShowControls(false)}
//             onContextMenu={(e) => e.preventDefault()}
//             style={{ userSelect: 'none' }}
//         >
//             {/* Loading */}
//             {loading && (
//                 <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
//                     <div className="text-center text-white">
//                         <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
//                         <p>Cargando video...</p>
//                     </div>
//                 </div>
//             )}
//
//             {/* Video Container */}
//             <div
//                 ref={iframeRef}
//                 className="w-full h-full"
//                 style={{ minHeight: '400px' }}
//             />
//
//             {/* Overlay de protección */}
//             <div
//                 className="absolute inset-0 z-10"
//                 onClick={togglePlayPause}
//                 onContextMenu={(e) => e.preventDefault()}
//                 style={{
//                     userSelect: 'none',
//                     pointerEvents: showControls ? 'none' : 'auto'
//                 }}
//             />
//
//             {/* CONTROLES PERSONALIZADOS */}
//             <div className={`absolute inset-0 transition-opacity duration-300 ${
//                 showControls ? 'opacity-100' : 'opacity-0'
//             } pointer-events-none`}>
//
//                 {/* Título */}
//                 <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-20">
//                     <h3 className="text-white font-medium text-lg truncate">
//                         {title}
//                     </h3>
//                 </div>
//
//                 {/* Botón de play grande cuando está pausado */}
//                 {!isPlaying && !loading && (
//                     <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
//                         <button
//                             onClick={togglePlayPause}
//                             className="w-16 h-16 bg-medico-blue hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-all"
//                         >
//                             <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
//                                 <path d="M8 5v14l11-7z"/>
//                             </svg>
//                         </button>
//                     </div>
//                 )}
//
//                 {/* BARRA DE CONTROLES */}
//                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20 pointer-events-auto">
//
//                     {/* Barra de progreso */}
//                     <div className="mb-3">
//                         <div
//                             className="w-full bg-white/20 rounded-full h-1.5 cursor-pointer hover:h-2 transition-all"
//                             onClick={handleSeekBarClick}
//                         >
//                             <div
//                                 className="bg-medico-blue h-full rounded-full transition-all"
//                                 style={{ width: `${getProgressPercentage()}%` }}
//                             ></div>
//                         </div>
//                     </div>
//
//                     {/* Controles */}
//                     <div className="flex items-center justify-between text-white">
//                         <div className="flex items-center space-x-4">
//                             {/* Play/Pause */}
//                             <button
//                                 onClick={togglePlayPause}
//                                 className="p-2 hover:bg-white/20 rounded-full transition-colors"
//                             >
//                                 {isPlaying ? (
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
//                                     </svg>
//                                 ) : (
//                                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                                         <path d="M8 5v14l11-7z"/>
//                                     </svg>
//                                 )}
//                             </button>
//
//                             {/* Volumen */}
//                             <button
//                                 onClick={toggleMute}
//                                 className="p-2 hover:bg-white/20 rounded-full transition-colors"
//                             >
//                                 {muted ? (
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
//                                     </svg>
//                                 ) : (
//                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
//                                     </svg>
//                                 )}
//                             </button>
//
//                             {/* Tiempo */}
//                             <div className="text-sm">
//                                 {formatTime(currentTime)} / {formatTime(duration)}
//                             </div>
//                         </div>
//
//                         {/* Progreso */}
//                         <div className="bg-medico-blue/20 text-medico-blue px-3 py-1 rounded-full text-sm">
//                             {Math.floor(getProgressPercentage())}%
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }
//
// export default VideoPlayer


// src/components/VideoPlayer.jsx - VERSIÓN COMPLETA CORREGIDA 100%
import React, { useState, useRef, useEffect } from 'react'

const VideoPlayer = ({
                         videoUrl,
                         title,
                         onProgress,
                         onComplete,
                         currentProgress = 0,
                         autoplay = false,
                         className = "",
                         onTimeUpdate
                     }) => {
    // ========== ESTADOS PRINCIPALES ==========
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [showControls, setShowControls] = useState(true)
    const [volume, setVolume] = useState(1)
    const [muted, setMuted] = useState(false)

    // ========== ESTADOS PARA RESETEO ==========
    const [playerInitialized, setPlayerInitialized] = useState(false)
    const [videoId, setVideoId] = useState(null)

    // ========== REFS ==========
    const iframeRef = useRef(null)
    const containerRef = useRef(null)
    const controlsTimeoutRef = useRef(null)
    const progressIntervalRef = useRef(null)
    const playerRef = useRef(null)
    const playerDivRef = useRef(null)

    // ========== EXTRACCIÓN DE VIDEO ID MEJORADA ==========
    const extractVideoId = (url) => {
        if (!url) return null

        try {
            const patterns = [
                /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
                /youtu\.be\/([a-zA-Z0-9_-]{11})/
            ]

            for (const pattern of patterns) {
                const match = url.match(pattern)
                if (match && match[1]) {
                    return match[1]
                }
            }

            return null
        } catch (error) {
            console.error('❌ Error extrayendo video ID:', error)
            return null
        }
    }

    // ========== EFECTO PRINCIPAL DE INICIALIZACIÓN ==========
    useEffect(() => {
        console.log('🎬 VideoPlayer: Inicializando con URL:', videoUrl)

        // Resetear todos los estados al cambiar URL
        setLoading(true)
        setError(false)
        setIsPlaying(false)
        setDuration(0)
        setCurrentTime(0)
        setPlayerInitialized(false)

        // Limpiar timers anteriores
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
        }
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }

        const newVideoId = extractVideoId(videoUrl)
        setVideoId(newVideoId)

        if (!newVideoId) {
            console.error('❌ No se pudo extraer video ID de:', videoUrl)
            setError(true)
            setLoading(false)
            return
        }

        console.log('✅ Video ID extraído:', newVideoId)

        // Destruir player anterior si existe
        if (playerRef.current && typeof playerRef.current.destroy === 'function') {
            try {
                console.log('🗑️ Destruyendo player anterior')
                playerRef.current.destroy()
                playerRef.current = null
            } catch (error) {
                console.error('Error destruyendo player anterior:', error)
            }
        }

        // Inicializar YouTube API
        if (!window.YT) {
            console.log('📦 Cargando YouTube API...')
            const script = document.createElement('script')
            script.src = 'https://www.youtube.com/iframe_api'
            script.onload = () => {
                console.log('✅ YouTube API cargada')
                window.onYouTubeIframeAPIReady = () => initializePlayer(newVideoId)
            }
            document.head.appendChild(script)
        } else if (window.YT.Player) {
            console.log('♻️ Reutilizando YouTube API existente')
            initializePlayer(newVideoId)
        } else {
            console.log('⏳ Esperando YouTube API...')
            window.onYouTubeIframeAPIReady = () => initializePlayer(newVideoId)
        }

        // Cleanup al desmontar
        return () => {
            if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current)
            }
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
        }
    }, [videoUrl]) // ✅ Solo depende de videoUrl

    // ========== INICIALIZAR PLAYER ==========
    const initializePlayer = (currentVideoId) => {
        if (!window.YT || !currentVideoId) {
            console.error('❌ YouTube API o videoId no disponible')
            setError(true)
            setLoading(false)
            return
        }

        try {
            console.log('🚀 Inicializando player para video:', currentVideoId)

            // Crear div único para el player
            const playerDiv = document.createElement('div')
            const uniqueId = `youtube-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            playerDiv.id = uniqueId

            // Reemplazar contenido anterior
            if (containerRef.current) {
                containerRef.current.innerHTML = ''
                containerRef.current.appendChild(playerDiv)
                playerDivRef.current = playerDiv
            }

            // Crear nuevo player de YouTube
            playerRef.current = new window.YT.Player(uniqueId, {
                height: '100%',
                width: '100%',
                videoId: currentVideoId,
                playerVars: {
                    controls: 0,           // Sin controles de YouTube
                    modestbranding: 1,     // Marca mínima
                    showinfo: 0,           // Sin info
                    rel: 0,                // Sin videos relacionados
                    disablekb: 1,          // Sin teclado
                    fs: 0,                 // Sin pantalla completa
                    iv_load_policy: 3,     // Sin anotaciones
                    enablejsapi: 1,        // Habilitar API JS
                    origin: window.location.origin,
                    playsinline: 1,        // Para móviles
                    autoplay: autoplay ? 1 : 0
                },
                events: {
                    onReady: handlePlayerReady,
                    onStateChange: handlePlayerStateChange,
                    onError: handlePlayerError
                }
            })

            console.log('✅ Player creado exitosamente')

        } catch (error) {
            console.error('❌ Error inicializando player:', error)
            setError(true)
            setLoading(false)
        }
    }

    // ========== EVENTOS DEL PLAYER ==========
    const handlePlayerReady = (event) => {
        console.log('🎉 Player listo!')
        setLoading(false)
        setPlayerInitialized(true)

        try {
            const videoDuration = event.target.getDuration()
            setDuration(videoDuration)
            console.log('⏱️ Duración del video:', videoDuration, 'segundos')

            // Configurar volumen inicial
            if (muted) {
                event.target.mute()
            } else {
                event.target.setVolume(volume * 100)
            }

            // Iniciar tracking de progreso
            startProgressTracking()

        } catch (error) {
            console.error('❌ Error en handlePlayerReady:', error)
        }
    }

    const handlePlayerStateChange = (event) => {
        if (!event || !event.target) return

        const state = event.data
        console.log('🔄 Estado del player cambió:', state)

        switch (state) {
            case window.YT.PlayerState.PLAYING:
                console.log('▶️ Video reproduciéndose')
                setIsPlaying(true)
                break
            case window.YT.PlayerState.PAUSED:
                console.log('⏸️ Video pausado')
                setIsPlaying(false)
                break
            case window.YT.PlayerState.ENDED:
                console.log('🏁 Video terminado')
                setIsPlaying(false)
                if (onComplete) {
                    console.log('📢 Ejecutando callback onComplete')
                    onComplete()
                }
                break
            case window.YT.PlayerState.BUFFERING:
                console.log('⏳ Video buffering')
                break
            case window.YT.PlayerState.CUED:
                console.log('📋 Video cargado')
                break
            default:
                console.log('❓ Estado desconocido:', state)
                break
        }
    }

    const handlePlayerError = (event) => {
        console.error('❌ Error del player:', event.data)
        const errorMessages = {
            2: 'ID de video inválido',
            5: 'Error de formato HTML5',
            100: 'Video no encontrado o privado',
            101: 'Video no permitido para reproducir embebido',
            150: 'Video no permitido para reproducir embebido'
        }

        const errorMessage = errorMessages[event.data] || `Error desconocido: ${event.data}`
        console.error('Detalle del error:', errorMessage)

        setError(true)
        setLoading(false)
    }

    // ========== TRACKING DE PROGRESO MEJORADO ==========
    const startProgressTracking = () => {
        console.log('📊 Iniciando tracking de progreso')

        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
        }

        progressIntervalRef.current = setInterval(() => {
            if (!playerRef.current || !playerInitialized) return

            try {
                const current = playerRef.current.getCurrentTime()
                const total = playerRef.current.getDuration()

                if (!current || !total || total <= 0) return

                setCurrentTime(current)
                setDuration(total)

                const progress = Math.min((current / total) * 100, 100)

                // Callback de progreso
                if (onProgress && progress > 0) {
                    onProgress(Math.floor(progress))
                }

                // Callback de tiempo
                if (onTimeUpdate) {
                    onTimeUpdate(current, total)
                }

                // Auto-completar cerca del final
                if (onComplete && progress >= 95 && !isPlaying) {
                    console.log('🎯 Auto-completando video (95%+ alcanzado)')
                    onComplete()
                }

            } catch (error) {
                console.error('❌ Error obteniendo progreso:', error)
            }
        }, 1000)
    }

    // ========== CONTROLES MEJORADOS ==========
    const togglePlayPause = () => {
        if (!playerRef.current || !playerInitialized) {
            console.warn('⚠️ Player no inicializado')
            return
        }

        try {
            if (isPlaying) {
                console.log('⏸️ Pausando video')
                playerRef.current.pauseVideo()
            } else {
                console.log('▶️ Reproduciendo video')
                playerRef.current.playVideo()
            }
        } catch (error) {
            console.error('❌ Error controlando reproducción:', error)
        }
    }

    const seekTo = (percentage) => {
        if (!playerRef.current || !duration || !playerInitialized) {
            console.warn('⚠️ No se puede buscar: player no listo')
            return
        }

        try {
            const seekTime = (percentage / 100) * duration
            console.log('⏭️ Buscando posición:', seekTime, 'segundos')
            playerRef.current.seekTo(seekTime, true)
            setCurrentTime(seekTime)
        } catch (error) {
            console.error('❌ Error buscando posición:', error)
        }
    }

    const toggleMute = () => {
        if (!playerRef.current || !playerInitialized) return

        try {
            if (muted) {
                console.log('🔊 Desmutear')
                playerRef.current.unMute()
                setMuted(false)
            } else {
                console.log('🔇 Mutear')
                playerRef.current.mute()
                setMuted(true)
            }
        } catch (error) {
            console.error('❌ Error toggleando mute:', error)
        }
    }

    // ========== MANEJO DE CONTROLES ==========
    useEffect(() => {
        if (showControls && isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false)
            }, 3000)
        }

        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current)
            }
        }
    }, [showControls, isPlaying])

    const handleMouseMove = () => {
        setShowControls(true)
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current)
        }
    }

    const handleSeekBarClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const percentage = ((e.clientX - rect.left) / rect.width) * 100
        seekTo(percentage)
    }

    // ========== UTILIDADES ==========
    const formatTime = (seconds) => {
        if (!seconds || !isFinite(seconds)) return '0:00'

        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)

        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getProgressPercentage = () => {
        if (!duration || !currentTime) return 0
        return Math.min((currentTime / duration) * 100, 100)
    }

    // ========== RENDER DE ESTADOS DE ERROR ==========
    if (!videoUrl || !videoId) {
        return (
            <div className={`relative bg-gray-900 flex items-center justify-center ${className} rounded-xl overflow-hidden`}>
                <div className="text-center text-white p-8">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">Video no disponible</h3>
                    <p className="text-gray-400">No se pudo cargar el contenido del video</p>
                    <p className="text-gray-500 text-sm mt-2">URL: {videoUrl}</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`relative bg-gray-900 flex items-center justify-center ${className} rounded-xl overflow-hidden`}>
                <div className="text-center text-white p-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium mb-2">Error cargando video</h3>
                    <p className="text-gray-300 mb-4">No se pudo cargar el contenido</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                    <p className="text-gray-500 text-xs mt-2">Video ID: {videoId}</p>
                </div>
            </div>
        )
    }

    // ========== RENDER PRINCIPAL ==========
    return (
        <div
            className={`relative bg-black group ${className} rounded-xl overflow-hidden`}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none' }}
        >
            {/* Loading mejorado */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-20">
                    <div className="text-center text-white">
                        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="mb-2">Cargando video...</p>
                        <p className="text-sm text-gray-400">{title}</p>
                        <p className="text-xs text-gray-500 mt-1">ID: {videoId}</p>
                    </div>
                </div>
            )}

            {/* Container del video */}
            <div
                ref={containerRef}
                className="w-full h-full"
                style={{ minHeight: '400px' }}
            />

            {/* Overlay de protección */}
            <div
                className="absolute inset-0 z-10"
                onClick={togglePlayPause}
                onContextMenu={(e) => e.preventDefault()}
                style={{
                    userSelect: 'none',
                    pointerEvents: showControls ? 'none' : 'auto'
                }}
            />

            {/* CONTROLES PERSONALIZADOS */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
            } pointer-events-none`}>

                {/* Título */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-20">
                    <h3 className="text-white font-medium text-lg truncate">
                        {title}
                    </h3>
                    {playerInitialized && (
                        <p className="text-white/80 text-sm mt-1">
                            Video ID: {videoId} | Duración: {formatTime(duration)}
                        </p>
                    )}
                </div>

                {/* Botón de play grande cuando está pausado */}
                {!isPlaying && !loading && playerInitialized && (
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto">
                        <button
                            onClick={togglePlayPause}
                            className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-all"
                        >
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                        </button>
                    </div>
                )}

                {/* BARRA DE CONTROLES */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20 pointer-events-auto">

                    {/* Barra de progreso */}
                    <div className="mb-3">
                        <div
                            className="w-full bg-white/20 rounded-full h-1.5 cursor-pointer hover:h-2 transition-all"
                            onClick={handleSeekBarClick}
                        >
                            <div
                                className="bg-red-600 h-full rounded-full transition-all"
                                style={{ width: `${getProgressPercentage()}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Controles */}
                    <div className="flex items-center justify-between text-white">
                        <div className="flex items-center space-x-4">
                            {/* Play/Pause */}
                            <button
                                onClick={togglePlayPause}
                                disabled={!playerInitialized}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                            >
                                {isPlaying ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                )}
                            </button>

                            {/* Volumen */}
                            <button
                                onClick={toggleMute}
                                disabled={!playerInitialized}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                            >
                                {muted ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    </svg>
                                )}
                            </button>

                            {/* Tiempo */}
                            <div className="text-sm">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </div>
                        </div>

                        {/* Progreso */}
                        <div className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm">
                            {Math.floor(getProgressPercentage())}%
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer