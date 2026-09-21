// src/components/VideoPlayer.jsx - VERSIÓN COMPLETA CORREGIDA 100%
import React, { useState, useRef, useEffect } from 'react'

// ========== CARGADOR ÚNICO DE LA YOUTUBE IFRAME API ==========
// YouTube invoca window.onYouTubeIframeAPIReady apenas termina de cargar www-widgetapi.js;
// si el callback se define después (p. ej. en script.onload) y el script viene de caché,
// el aviso se pierde y el player nunca se inicializa. Por eso: callback ANTES de insertar
// el script, una sola promesa compartida y un sondeo de respaldo.
const VELOCIDADES = [0.75, 1, 1.25, 1.5, 1.75, 2]
let youtubeApiPromise = null
const loadYouTubeApi = () => {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT)
    if (youtubeApiPromise) return youtubeApiPromise
    youtubeApiPromise = new Promise((resolve) => {
        let resuelto = false
        let sondeo = null
        const listo = () => {
            if (resuelto || !window.YT || !window.YT.Player) return
            resuelto = true
            if (sondeo) clearInterval(sondeo)
            resolve(window.YT)
        }
        const previo = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            if (typeof previo === 'function') { try { previo() } catch (e) { /* noop */ } }
            listo()
        }
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const script = document.createElement('script')
            script.src = 'https://www.youtube.com/iframe_api'
            script.async = true
            document.head.appendChild(script)
        }
        sondeo = setInterval(listo, 250)
    })
    return youtubeApiPromise
}

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
    // Velocidad de reproducción (se recuerda entre clases): los alumnos la pedían para repasar más rápido
    const [velocidad, setVelocidad] = useState(() => { try { const v = parseFloat(localStorage.getItem('video_velocidad')); return VELOCIDADES.includes(v) ? v : 1 } catch { return 1 } })
    const [menuVelocidad, setMenuVelocidad] = useState(false)
    // Subtítulos (CC) de YouTube: se recuerdan; al activarlos el video se reduce un poco para que queden por encima de la barra
    const [subtitulos, setSubtitulos] = useState(() => { try { return localStorage.getItem('video_subtitulos') === '1' } catch { return false } })

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
    // Vigilante de "onReady": si YouTube no avisa, se detecta el player listo por sondeo
    // o se recrea; nunca se queda en "Cargando video..." para siempre.
    const readyRef = useRef(false)
    // Callbacks siempre actuales: el intervalo y los handlers de YouTube se crean una sola vez y, sin esto,
    // quedaban con la versión del primer render (closure obsoleto) → progreso enviado cada segundo
    const cbRef = useRef({})
    cbRef.current = { onProgress, onComplete, onTimeUpdate }
    const watchdogRef = useRef(null)
    const readyPollRef = useRef(null)
    const retryRef = useRef(0)
    const READY_TIMEOUT_MS = 6000
    const MAX_REINTENTOS = 2
    const limpiarVigilante = () => {
        if (watchdogRef.current) { clearTimeout(watchdogRef.current); watchdogRef.current = null }
        if (readyPollRef.current) { clearInterval(readyPollRef.current); readyPollRef.current = null }
    }
    // Porcentaje de recorte arriba/abajo para ocultar la marca de YouTube (ver render)
    const RECORTE_PCT = 12

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
        readyRef.current = false
        retryRef.current = 0
        limpiarVigilante()

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

        // Inicializar cuando la API esté disponible (cancelable si cambia el video antes)
        let cancelado = false
        loadYouTubeApi().then(() => {
            if (!cancelado) initializePlayer(newVideoId)
        })

        // Cleanup al desmontar / cambiar de video
        return () => {
            cancelado = true
            limpiarVigilante()
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

            // Crear nuevo player de YouTube (dominio "privacy-enhanced" nocookie)
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
                    autoplay: autoplay ? 1 : 0,
                    cc_lang_pref: 'es',
                    hl: 'es',
                    cc_load_policy: subtitulos ? 1 : 0   // 1 = mostrar subtítulos desde el inicio
                },
                events: {
                    onReady: handlePlayerReady,
                    onStateChange: handlePlayerStateChange,
                    onError: handlePlayerError
                }
            })

            console.log('✅ Player creado exitosamente')
            readyRef.current = false
            limpiarVigilante()

            // 1) Sondeo: si el player ya responde a la API, darlo por listo aunque onReady no haya llegado
            readyPollRef.current = setInterval(() => {
                const p = playerRef.current
                if (readyRef.current || !p || typeof p.getPlayerState !== 'function') return
                try {
                    const estado = p.getPlayerState()
                    const dur = typeof p.getDuration === 'function' ? p.getDuration() : 0
                    if ((typeof estado === 'number' && estado !== -1) || dur > 0) {
                        console.warn('⚠️ onReady no llegó; player detectado listo por sondeo')
                        handlePlayerReady({ target: p })
                    }
                } catch (e) { /* aún no responde */ }
            }, 500)

            // 2) Watchdog: si en READY_TIMEOUT_MS sigue sin estar listo, recrear (máx. MAX_REINTENTOS) o mostrar error
            watchdogRef.current = setTimeout(() => {
                if (readyRef.current) return
                limpiarVigilante()
                if (retryRef.current < MAX_REINTENTOS) {
                    retryRef.current += 1
                    console.warn(`🔁 Player no respondió; reintento ${retryRef.current}/${MAX_REINTENTOS}`)
                    try { playerRef.current?.destroy?.() } catch (e) { /* noop */ }
                    playerRef.current = null
                    initializePlayer(currentVideoId)
                } else {
                    console.error('❌ El reproductor de YouTube no respondió')
                    setError(true)
                    setLoading(false)
                }
            }, READY_TIMEOUT_MS)

        } catch (error) {
            console.error('❌ Error inicializando player:', error)
            setError(true)
            setLoading(false)
        }
    }

    // ========== EVENTOS DEL PLAYER ==========
    const handlePlayerReady = (event) => {
        if (readyRef.current) return
        readyRef.current = true
        limpiarVigilante()
        console.log('🎉 Player listo!')
        setLoading(false)
        setPlayerInitialized(true)

        try {
            const videoDuration = event.target.getDuration()
            setDuration(videoDuration)
            console.log('⏱️ Duración del video:', videoDuration, 'segundos')

            // Velocidad recordada
            if (velocidad !== 1) { try { event.target.setPlaybackRate(velocidad) } catch { /* noop */ } }
            // Subtítulos recordados
            try { if (subtitulos) { event.target.loadModule('captions'); event.target.setOption('captions', 'track', { languageCode: 'es' }) } else { event.target.unloadModule('captions') } } catch { /* noop */ }

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
                // Al pausar se guarda el avance real (flush) aunque no haya pasado el intervalo del throttle
                try {
                    const cur = event.target.getCurrentTime?.(), tot = event.target.getDuration?.()
                    if (cur && tot && cbRef.current.onProgress) cbRef.current.onProgress(Math.floor(Math.min((cur / tot) * 100, 100)), { flush: true })
                } catch (_) { /* noop */ }
                break
            case window.YT.PlayerState.ENDED:
                console.log('🏁 Video terminado')
                setIsPlaying(false)
                if (cbRef.current.onComplete) cbRef.current.onComplete()
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
            if (!playerRef.current || !readyRef.current) return

            try {
                const current = playerRef.current.getCurrentTime()
                const total = playerRef.current.getDuration()

                if (!current || !total || total <= 0) return

                setCurrentTime(current)
                setDuration(total)

                const progress = Math.min((current / total) * 100, 100)

                // Callbacks (versión actual, vía ref). El padre decide cuándo guardar (throttle).
                // El "auto-completar" por intervalo se quitó: lo hace el evento ENDED una sola vez.
                if (cbRef.current.onProgress && progress > 0) cbRef.current.onProgress(Math.floor(progress))
                if (cbRef.current.onTimeUpdate) cbRef.current.onTimeUpdate(current, total)

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

    const cambiarVelocidad = (v) => {
        setMenuVelocidad(false)
        if (!VELOCIDADES.includes(v)) return
        setVelocidad(v)
        try { localStorage.setItem('video_velocidad', String(v)) } catch { /* noop */ }
        if (playerRef.current && playerInitialized) {
            try { playerRef.current.setPlaybackRate(v) } catch { /* noop */ }
        }
    }

    const toggleSubtitulos = () => {
        const on = !subtitulos
        setSubtitulos(on)
        try { localStorage.setItem('video_subtitulos', on ? '1' : '0') } catch { /* noop */ }
        const p = playerRef.current
        if (!p || !playerInitialized) return
        try {
            if (on) { p.loadModule('captions'); p.setOption('captions', 'track', { languageCode: 'es' }); p.setOption('captions', 'reload', true) }
            else p.unloadModule('captions')
        } catch { /* noop */ }
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
                        onClick={() => { setError(false); setLoading(true); retryRef.current = 0; initializePlayer(videoId) }}
                        className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
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
            onMouseLeave={() => { setShowControls(false); setMenuVelocidad(false) }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ userSelect: 'none', minHeight: 240 }}
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

            {/* Container del video. Se renderiza un 24% más alto que el visor y desplazado
                hacia arriba (-12%): con el visor en 16:9 el video queda exactamente en el
                área visible y la barra superior de YouTube (título / "Ver en YouTube") y el
                logo inferior caen fuera del recorte (el wrapper tiene overflow-hidden). */}
            {/* Con subtítulos activos el video se reduce al 86 % (centrado, 16:9) y deja una franja negra
                abajo para los controles: así los subtítulos de YouTube, que van pegados al borde inferior
                del video, quedan más arriba y nunca tapados por la barra. */}
            <div
                className="absolute overflow-hidden bg-black"
                style={subtitulos
                    ? { top: 0, left: '50%', transform: 'translateX(-50%)', height: '86%', aspectRatio: '16 / 9' }
                    : { inset: 0 }}
            >
                <div
                    ref={containerRef}
                    className="absolute left-0 w-full"
                    style={{ top: `-${RECORTE_PCT}%`, height: `${100 + RECORTE_PCT * 2}%` }}
                />
            </div>

            {/* Overlay de protección: SIEMPRE captura el puntero (incluso con los
                controles visibles) para que el mouse nunca llegue al iframe real de
                YouTube; si no, al pasar el mouse (showControls=true) el hover exponía
                el overlay nativo de YouTube ("Watch on YouTube") por debajo. */}
            <div
                className="absolute inset-0 z-10"
                onClick={togglePlayPause}
                onContextMenu={(e) => e.preventDefault()}
                style={{ userSelect: 'none', pointerEvents: 'auto' }}
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
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-auto" style={{ bottom: subtitulos ? '14%' : 0 }}>
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

                        <div className="flex items-center gap-2">
                            {/* Subtítulos */}
                            <button
                                onClick={toggleSubtitulos}
                                disabled={!playerInitialized}
                                title={subtitulos ? 'Ocultar subtítulos' : 'Mostrar subtítulos'}
                                className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide transition-colors disabled:opacity-50 ${subtitulos ? 'bg-white text-gray-900' : 'bg-white/15 hover:bg-white/25 text-white'}`}
                            >
                                CC
                            </button>
                            {/* Velocidad */}
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setMenuVelocidad(m => !m) }}
                                    disabled={!playerInitialized}
                                    title="Velocidad de reproducción"
                                    className="px-2.5 py-1 rounded-full text-sm font-semibold tabular-nums bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-50"
                                >
                                    {velocidad}x
                                </button>
                                {menuVelocidad && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 rounded-xl py-1 min-w-[6.5rem] shadow-lg" onClick={(e) => e.stopPropagation()}>
                                        {VELOCIDADES.map(v => (
                                            <button key={v} onClick={() => cambiarVelocidad(v)} className={`w-full text-left px-4 py-1.5 text-sm tabular-nums hover:bg-white/10 ${v === velocidad ? 'text-red-400 font-semibold' : 'text-white'}`}>
                                                {v === 1 ? 'Normal' : `${v}x`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Progreso */}
                            <div className="bg-red-600/20 text-red-400 px-3 py-1 rounded-full text-sm">
                                {Math.floor(getProgressPercentage())}%
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer