// src/components/VideoPlayer.jsx - REPRODUCTOR YOUTUBE COMPLETO
import React, { useState, useEffect, useRef } from 'react'
import progressService from '../services/progress'

const VideoPlayer = ({
                         clase,
                         onProgressUpdate,
                         onClassComplete,
                         autoplay = false
                     }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [progress, setProgress] = useState(clase?.porcentaje_visto || 0)
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)

    const playerRef = useRef(null)
    const progressUpdateRef = useRef(null)

    // Extraer ID del video de YouTube
    const getYouTubeVideoId = (url) => {
        if (!url) return null
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const videoId = getYouTubeVideoId(clase?.video_youtube_url)

    // Limpiar timer cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (progressUpdateRef.current) {
                clearInterval(progressUpdateRef.current)
            }
        }
    }, [])

    // Actualizar progreso cuando cambie la clase
    useEffect(() => {
        if (clase) {
            setProgress(clase.porcentaje_visto || 0)
            setCurrentTime(0)
            setIsPlaying(false)
            setIsLoading(true)
            setHasError(false)
        }
    }, [clase?.id])

    // Cargar API de YouTube cuando se monte el componente
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
            const firstScriptTag = document.getElementsByTagName('script')[0]
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

            window.onYouTubeIframeAPIReady = initializePlayer
        } else {
            initializePlayer()
        }
    }, [videoId])

    const initializePlayer = () => {
        if (!videoId || !playerRef.current) return

        try {
            const player = new window.YT.Player(playerRef.current, {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    autoplay: autoplay ? 1 : 0,
                    controls: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    fs: 1,
                    cc_load_policy: 0,
                    iv_load_policy: 3,
                    autohide: 0
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                    onError: onPlayerError
                }
            })

            window.currentPlayer = player
        } catch (error) {
            console.error('Error inicializando reproductor:', error)
            setHasError(true)
            setIsLoading(false)
        }
    }

    const onPlayerReady = (event) => {
        setIsLoading(false)
        setDuration(event.target.getDuration())

        // Si hay progreso previo, posicionar el video
        if (progress > 0 && duration > 0) {
            const startTime = (progress / 100) * duration
            event.target.seekTo(startTime)
        }
    }

    const onPlayerStateChange = (event) => {
        const player = event.target

        switch (event.data) {
            case window.YT.PlayerState.PLAYING:
                setIsPlaying(true)
                startProgressTracking(player)
                break
            case window.YT.PlayerState.PAUSED:
            case window.YT.PlayerState.ENDED:
                setIsPlaying(false)
                stopProgressTracking()

                if (event.data === window.YT.PlayerState.ENDED) {
                    handleVideoEnded()
                }
                break
            default:
                break
        }
    }

    const onPlayerError = (event) => {
        console.error('Error del reproductor YouTube:', event.data)
        setHasError(true)
        setIsLoading(false)
        stopProgressTracking()
    }

    const startProgressTracking = (player) => {
        if (progressUpdateRef.current) {
            clearInterval(progressUpdateRef.current)
        }

        progressUpdateRef.current = setInterval(async () => {
            try {
                const current = player.getCurrentTime()
                const total = player.getDuration()

                if (total > 0) {
                    const newProgress = Math.min(Math.round((current / total) * 100), 100)
                    const newCurrentTime = current

                    setCurrentTime(newCurrentTime)

                    // Solo actualizar si hay un cambio significativo (cada 2%)
                    if (Math.abs(newProgress - progress) >= 2) {
                        setProgress(newProgress)

                        // Actualizar progreso en el backend
                        await progressService.updateClassProgress(
                            clase.id,
                            newProgress,
                            newProgress >= 95
                        )

                        // Notificar al componente padre
                        if (onProgressUpdate) {
                            onProgressUpdate(clase.id, newProgress, newProgress >= 95)
                        }
                    }
                }
            } catch (error) {
                console.error('Error actualizando progreso:', error)
            }
        }, 2000) // Actualizar cada 2 segundos
    }

    const stopProgressTracking = () => {
        if (progressUpdateRef.current) {
            clearInterval(progressUpdateRef.current)
            progressUpdateRef.current = null
        }
    }

    const handleVideoEnded = async () => {
        try {
            setProgress(100)

            // Marcar como completada
            await progressService.markClassAsCompleted(clase.id)

            // Notificar al componente padre
            if (onClassComplete) {
                onClassComplete(clase.id)
            }

            if (onProgressUpdate) {
                onProgressUpdate(clase.id, 100, true)
            }
        } catch (error) {
            console.error('Error marcando clase como completada:', error)
        }
    }

    const formatTime = (seconds) => {
        if (!seconds) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const formatDuration = (minutes) => {
        if (!minutes) return ''
        if (minutes < 60) return `${minutes} min`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return `${hours}h ${mins}min`
    }

    // Si no hay video
    if (!clase?.video_youtube_url || !videoId) {
        return (
            <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Video no disponible</h3>
                    <p className="text-gray-600">Esta clase no tiene video asociado</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Reproductor de video */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                        <div className="text-center text-white">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Cargando video...</p>
                        </div>
                    </div>
                )}

                {hasError && (
                    <div className="absolute inset-0 bg-red-900 flex items-center justify-center z-10">
                        <div className="text-center text-white">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="text-lg font-medium mb-2">Error cargando video</h3>
                            <p className="text-sm opacity-75">No se pudo cargar el video de YouTube</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

                <div ref={playerRef} className="w-full h-full" />
            </div>

            {/* Información del video */}
            <div className="mt-4 space-y-3">
                {/* Título y duración */}
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900">{clase.titulo}</h2>
                        {clase.descripcion && (
                            <p className="text-gray-600 mt-1">{clase.descripcion}</p>
                        )}
                    </div>
                    <div className="ml-4 text-sm text-gray-500">
                        {clase.duracion_minutos && formatDuration(clase.duracion_minutos)}
                    </div>
                </div>

                {/* Barra de progreso personalizada */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progreso de la clase</span>
                        <span className="font-medium text-gray-900">{progress}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-medico-blue h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Tiempo transcurrido */}
                    {duration > 0 && (
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    )}
                </div>

                {/* Estado de la clase */}
                <div className="flex items-center space-x-4">
                    {clase.completada ? (
                        <div className="flex items-center text-green-600">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">Clase completada</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-blue-600">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-medium">
                                {progress > 0 ? 'En progreso' : 'No iniciada'}
                            </span>
                        </div>
                    )}

                    {isPlaying && (
                        <div className="flex items-center text-red-600">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
                            <span className="text-sm">Reproduciendo</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VideoPlayer