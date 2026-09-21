// src/biblioteca/Lector.jsx - Lector de PDF dentro de la plataforma (PDF.js)
// El archivo llega por el API con el token del alumno: no hay URL que copiar ni botón de descarga.
// Cada página lleva una marca de agua con el nombre y correo del alumno. Guarda página y tiempo de lectura.
// Vistas: continua (scroll) o libro (dos páginas). Miniaturas, búsqueda de texto con resaltado y notas por página.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist/build/pdf'
import {
    ArrowLeft, ZoomIn, ZoomOut, Maximize2, Clock, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Lock, AlertCircle,
    CheckCircle2, Search, StickyNote, LayoutGrid, ScrollText, BookOpen, X, Trash2, Pencil, Plus, Loader2
} from 'lucide-react'
import Layout from '../utils/Layout'
import { useAuth } from '../utils/AuthContext'
import bibliotecaService from '../services/biblioteca'
import { Button, Pill, ProgressBar, Card, EmptyState } from '../simulador/ui'
import { actualizarCache } from '../simulador/useCached'
import { limpiarTitulo } from './Biblioteca'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString()

const ZOOMS = [0.5, 0.65, 0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2, 2.5]
const ZOOM_BASE = 4                // índice de ZOOMS que equivale a "ajustar"
const MARGEN_RENDER = 900          // px alrededor del viewport que se renderizan
const INTERVALO_PROGRESO_MS = 45000   // cada envío acumula los segundos leídos; menos frecuencia = menos escrituras
const ANCHO_MINIATURA = 112
const MAX_RESULTADOS = 300
const PREF_KEY = 'biblioteca_lector_prefs'

const leerPrefs = () => { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {} } catch { return {} } }
const guardarPrefs = (p) => { try { localStorage.setItem(PREF_KEY, JSON.stringify(p)) } catch { /* noop */ } }

// Normaliza carácter a carácter (misma longitud que el original) para buscar sin tildes ni mayúsculas
const normalizar = (s) => Array.from(s, c => (c.normalize('NFD')[0] || c).toLowerCase()[0] || c).join('')
const primeraPaginaPliego = (n) => n - ((n - 1) % 2)

// Actualiza la caché de la Biblioteca con la lectura más reciente: al volver, la lista sale al instante y ya actualizada
const reflejarEnBiblioteca = (materialId, lectura) => actualizarCache('biblioteca', (data) => {
    const conLectura = (m) => m.id === materialId ? { ...m, lectura } : m
    const grupos = data.grupos.map(g => ({ ...g, materiales: g.materiales.map(conLectura) }))
    const todos = grupos.flatMap(g => g.materiales)
    const enCurso = todos.filter(m => m.lectura && !m.lectura.completado)
        .sort((a, b) => new Date(b.lectura.ultimaVez) - new Date(a.lectura.ultimaVez)).slice(0, 4)
    const segundos = todos.reduce((acc, m) => acc + (m.lectura?.segundosLectura || 0), 0)
    return {
        ...data, grupos, enCurso,
        resumen: { ...data.resumen, iniciados: todos.filter(m => m.lectura).length, completados: todos.filter(m => m.lectura?.completado).length, minutosLectura: Math.round(segundos / 60) }
    }
})

const Lector = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()
    const prefs = useMemo(leerPrefs, [])

    const [material, setMaterial] = useState(null)
    const [estado, setEstado] = useState({ fase: 'cargando', progreso: null, error: '', status: null })
    const [numPaginas, setNumPaginas] = useState(0)
    const [dimBase, setDimBase] = useState(null)          // { w, h } de la página 1 a escala 1
    const [medidas, setMedidas] = useState({ w: 0, h: 0 })
    const [zoomIdx, setZoomIdx] = useState(ZOOM_BASE)
    const [modo, setModo] = useState(prefs.modo === 'libro' ? 'libro' : 'continuo')
    const [pliego, setPliego] = useState(1)               // primera página del pliego (modo libro)
    const [paginaActual, setPaginaActual] = useState(1)
    const [inputPagina, setInputPagina] = useState('1')
    const [segundosSesion, setSegundosSesion] = useState(0)
    const [lectura, setLectura] = useState(null)
    const [miniaturas, setMiniaturas] = useState(!!prefs.miniaturas)
    const [panel, setPanel] = useState(prefs.panel || null)   // null | 'buscar' | 'notas'

    // búsqueda
    const [termino, setTermino] = useState('')
    const [busqueda, setBusqueda] = useState({ resultados: [], activo: -1, indexando: 0, hecha: '' })
    const [resaltados, setResaltados] = useState({})       // pagina → [{left, top, width, height, idx}]

    // notas
    const [notas, setNotas] = useState([])
    const [notaNueva, setNotaNueva] = useState('')
    const [notaPagina, setNotaPagina] = useState(1)
    const [editando, setEditando] = useState(null)         // { id, texto }
    const [confirmarBorrar, setConfirmarBorrar] = useState(null)
    const [guardandoNota, setGuardandoNota] = useState(false)

    const docRef = useRef(null)
    const contenedorRef = useRef(null)
    const wrappersRef = useRef([])
    const canvasesRef = useRef([])
    const renderRef = useRef({})
    const visiblesRef = useRef(new Set())
    const escalaRef = useRef(1)
    const paginaRef = useRef(1)
    const ultimoEnvioRef = useRef(Date.now())
    const saltoPendienteRef = useRef(null)
    const textosRef = useRef({})                           // pagina → { original, normalizado, items }
    const thumbsRef = useRef([])
    const thumbsHechasRef = useRef(new Set())
    const panelMiniaturasRef = useRef(null)
    const busquedaIdRef = useRef(0)
    const lecturaRef = useRef(null)
    lecturaRef.current = lectura

    useEffect(() => { guardarPrefs({ modo, miniaturas, panel }) }, [modo, miniaturas, panel])

    // ---------- carga ----------
    useEffect(() => {
        let cancelado = false
        ;(async () => {
            const det = await bibliotecaService.detalle(id)
            if (cancelado) return
            if (!det.success) { setEstado({ fase: 'error', error: det.error, status: det.status }); return }
            setMaterial(det.data.material)
            setLectura(det.data.material.lectura)
            if (det.data.material.tipoArchivo !== 'pdf') { setEstado({ fase: 'error', error: 'Este material no es un PDF; por ahora el lector solo abre PDF.' }); return }

            bibliotecaService.notas(id).then(r => { if (!cancelado && r.success) setNotas(r.data.notas) })

            const arch = await bibliotecaService.archivo(id, (pct) => !cancelado && setEstado(s => ({ ...s, progreso: pct })))
            if (cancelado) return
            if (!arch.success) { setEstado({ fase: 'error', error: arch.error, status: arch.status }); return }

            try {
                const doc = await pdfjsLib.getDocument({ data: arch.data }).promise
                if (cancelado) { doc.destroy(); return }
                docRef.current = doc
                const p1 = await doc.getPage(1)
                const vp = p1.getViewport({ scale: 1 })
                setDimBase({ w: vp.width, h: vp.height })
                setNumPaginas(doc.numPages)
                const inicio = det.data.material.lectura?.ultimaPagina && !det.data.material.lectura.completado ? det.data.material.lectura.ultimaPagina : 1
                saltoPendienteRef.current = inicio
                paginaRef.current = inicio
                setPaginaActual(inicio); setInputPagina(String(inicio)); setNotaPagina(inicio)
                setPliego(primeraPaginaPliego(inicio))
                setEstado({ fase: 'listo', progreso: 100, error: '' })
                bibliotecaService.progreso(id, { pagina: inicio, totalPaginas: doc.numPages, segundos: 0, abrir: true })
                    .then(r => r.success && setLectura(r.data.lectura))
            } catch (e) {
                console.error('PDF:', e)
                setEstado({ fase: 'error', error: 'No se pudo abrir el PDF. Intenta de nuevo en unos minutos.' })
            }
        })()
        return () => { cancelado = true; docRef.current?.destroy(); docRef.current = null }
    }, [id])

    // ---------- medidas del contenedor ----------
    useEffect(() => {
        const el = contenedorRef.current
        if (!el) return undefined
        const medir = () => setMedidas({ w: el.clientWidth, h: el.clientHeight })
        medir()
        const ro = new ResizeObserver(medir)
        ro.observe(el)
        return () => ro.disconnect()
    }, [estado.fase])

    const escalaAjuste = useMemo(() => {
        if (!dimBase || !medidas.w) return 1
        const margen = medidas.w < 640 ? 16 : 64
        if (modo === 'libro') {
            const porAncho = (medidas.w - margen - 8) / (2 * dimBase.w)
            const porAlto = (medidas.h - 40) / dimBase.h
            return Math.min(3, Math.max(0.2, Math.min(porAncho, porAlto)))
        }
        return Math.min(3, Math.max(0.3, (medidas.w - margen) / dimBase.w))
    }, [dimBase, medidas, modo])
    const escala = escalaAjuste * ZOOMS[zoomIdx]
    escalaRef.current = escala

    // ---------- render de páginas ----------
    const renderizar = useCallback(async (num) => {
        const doc = docRef.current
        const canvas = canvasesRef.current[num]
        if (!doc || !canvas) return
        const esc = escalaRef.current
        const actual = renderRef.current[num]
        if (actual?.scale === esc && actual.done) return
        if (actual?.task) { try { actual.task.cancel() } catch (_) { /* ya terminó */ } }
        const page = await doc.getPage(num)
        if (escalaRef.current !== esc || !visiblesRef.current.has(num) || canvasesRef.current[num] !== canvas) return
        const vp = page.getViewport({ scale: esc })
        const wrapper = wrappersRef.current[num]
        if (wrapper) { wrapper.style.width = `${Math.floor(vp.width)}px`; wrapper.style.height = `${Math.floor(vp.height)}px` }
        const dpr = Math.min(window.devicePixelRatio || 1, 2)
        canvas.width = Math.floor(vp.width * dpr)
        canvas.height = Math.floor(vp.height * dpr)
        canvas.style.width = `${Math.floor(vp.width)}px`
        canvas.style.height = `${Math.floor(vp.height)}px`
        const ctx = canvas.getContext('2d', { alpha: false })
        const task = page.render({ canvasContext: ctx, viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null })
        renderRef.current[num] = { scale: esc, task, done: false }
        try {
            await task.promise
            if (renderRef.current[num]?.task === task) renderRef.current[num] = { scale: esc, done: true }
        } catch (e) {
            if (e?.name !== 'RenderingCancelledException') console.error('render', num, e)
        }
    }, [])

    const liberar = useCallback((num) => {
        const canvas = canvasesRef.current[num]
        const r = renderRef.current[num]
        if (r?.task) { try { r.task.cancel() } catch (_) { /* noop */ } }
        delete renderRef.current[num]
        if (canvas) { canvas.width = 0; canvas.height = 0 }
    }, [])

    // Refs de página con identidad estable (si cambiaran en cada render, React las desmontaría y montaría a cada rato).
    // Al desmontar una página (cambio de pliego/modo) se olvida su render.
    const refsRef = useRef({})
    const refWrapper = (num) => {
        const k = `w${num}`
        if (!refsRef.current[k]) refsRef.current[k] = (el) => {
            if (!el) { delete renderRef.current[num]; visiblesRef.current.delete(num) }
            wrappersRef.current[num] = el
        }
        return refsRef.current[k]
    }
    const refCanvas = (num) => {
        const k = `c${num}`
        if (!refsRef.current[k]) refsRef.current[k] = (el) => { canvasesRef.current[num] = el }
        return refsRef.current[k]
    }
    const refThumb = (num) => {
        const k = `t${num}`
        if (!refsRef.current[k]) refsRef.current[k] = (el) => { thumbsRef.current[num] = el }
        return refsRef.current[k]
    }

    const paginasEnPantalla = useMemo(() => {
        if (!numPaginas) return []
        if (modo === 'libro') return [pliego, pliego + 1].filter(n => n <= numPaginas)
        return Array.from({ length: numPaginas }, (_, i) => i + 1)
    }, [modo, pliego, numPaginas])

    // Observador: qué páginas están cerca del viewport
    useEffect(() => {
        if (estado.fase !== 'listo' || !contenedorRef.current) return undefined
        const io = new IntersectionObserver((entries) => {
            entries.forEach(en => {
                const num = parseInt(en.target.dataset.pagina, 10)
                if (en.isIntersecting) { visiblesRef.current.add(num); renderizar(num) }
                else { visiblesRef.current.delete(num); liberar(num) }
            })
        }, { root: contenedorRef.current, rootMargin: `${MARGEN_RENDER}px 0px` })
        paginasEnPantalla.forEach(n => wrappersRef.current[n] && io.observe(wrappersRef.current[n]))
        return () => io.disconnect()
    }, [estado.fase, paginasEnPantalla, renderizar, liberar])

    // Cambio de escala → re-render de las visibles
    useEffect(() => {
        if (estado.fase !== 'listo') return
        visiblesRef.current.forEach(num => renderizar(num))
    }, [escala, estado.fase, renderizar])

    // ---------- navegación ----------
    const irAPagina = useCallback((n, behavior = 'smooth') => {
        const num = Math.min(numPaginas, Math.max(1, n))
        if (!num) return
        if (modo === 'libro') {
            setPliego(primeraPaginaPliego(num))
            paginaRef.current = num; setPaginaActual(num); setInputPagina(String(num)); setNotaPagina(num)
            return
        }
        const w = wrappersRef.current[num]
        const el = contenedorRef.current
        if (!w || !el) return
        el.scrollTo({ top: w.offsetTop - 12, behavior })
    }, [numPaginas, modo])

    // Salto a la última página leída, cuando ya hay layout
    useEffect(() => {
        if (estado.fase !== 'listo' || !dimBase || !medidas.w || saltoPendienteRef.current === null) return
        const destino = saltoPendienteRef.current
        saltoPendienteRef.current = null
        if (destino > 1 && modo === 'continuo') requestAnimationFrame(() => irAPagina(destino, 'auto'))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [estado.fase, dimBase, medidas.w])

    // Al cambiar de modo, mantener la página actual
    const cambiarModo = (nuevo) => {
        if (nuevo === modo) return
        const actual = paginaRef.current
        setModo(nuevo)
        setZoomIdx(ZOOM_BASE)
        if (nuevo === 'libro') setPliego(primeraPaginaPliego(actual))
        else saltoPendienteRef.current = actual
    }
    useEffect(() => {
        if (modo === 'continuo' && saltoPendienteRef.current !== null && estado.fase === 'listo') {
            const destino = saltoPendienteRef.current
            saltoPendienteRef.current = null
            requestAnimationFrame(() => irAPagina(destino, 'auto'))
        }
    }, [modo, estado.fase, irAPagina])

    // Página actual por scroll (modo continuo)
    useEffect(() => {
        const el = contenedorRef.current
        if (!el || estado.fase !== 'listo' || modo !== 'continuo') return undefined
        let raf = null
        const onScroll = () => {
            if (raf) return
            raf = requestAnimationFrame(() => {
                raf = null
                const marca = el.scrollTop + el.clientHeight * 0.35
                let mejor = 1
                for (let i = 1; i <= numPaginas; i++) {
                    const w = wrappersRef.current[i]
                    if (!w) continue
                    if (w.offsetTop <= marca) mejor = i; else break
                }
                if (mejor !== paginaRef.current) { paginaRef.current = mejor; setPaginaActual(mejor); setInputPagina(String(mejor)); setNotaPagina(mejor) }
            })
        }
        el.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => { el.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf) }
    }, [estado.fase, numPaginas, modo])

    const pliegoAnterior = () => irAPagina(pliego - 2)
    const pliegoSiguiente = () => irAPagina(pliego + 2)

    // ---------- progreso y tiempo ----------
    const enviarProgreso = useCallback(async (extra = {}) => {
        if (!docRef.current) return
        const ahora = Date.now()
        const segundos = Math.min(120, Math.round((ahora - ultimoEnvioRef.current) / 1000))
        ultimoEnvioRef.current = ahora
        const r = await bibliotecaService.progreso(id, { pagina: paginaRef.current, totalPaginas: docRef.current.numPages, segundos, ...extra })
        if (r.success) { setLectura(r.data.lectura); reflejarEnBiblioteca(id, r.data.lectura) }
    }, [id])

    useEffect(() => {
        if (estado.fase !== 'listo') return undefined
        ultimoEnvioRef.current = Date.now()
        const tick = setInterval(() => {
            if (document.visibilityState !== 'visible') { ultimoEnvioRef.current = Date.now(); return }
            setSegundosSesion(s => s + 1)
        }, 1000)
        const envio = setInterval(() => { if (document.visibilityState === 'visible') enviarProgreso() }, INTERVALO_PROGRESO_MS)
        const onHide = () => { if (document.visibilityState === 'hidden') enviarProgreso() }
        document.addEventListener('visibilitychange', onHide)
        // Al cerrar la pestaña: fetch normal se cancela; keepalive deja salir la petición
        const onPageHide = () => {
            if (!docRef.current) return
            const segundos = Math.min(120, Math.round((Date.now() - ultimoEnvioRef.current) / 1000))
            ultimoEnvioRef.current = Date.now()
            try {
                const token = localStorage.getItem('mediconsa_token')
                fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5001/med-api'}/biblioteca/${id}/progreso`, {
                    method: 'POST', keepalive: true, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ pagina: paginaRef.current, totalPaginas: docRef.current.numPages, segundos })
                }).catch(() => {})
            } catch (_) { /* noop */ }
        }
        window.addEventListener('pagehide', onPageHide)
        return () => {
            clearInterval(tick); clearInterval(envio)
            document.removeEventListener('visibilitychange', onHide)
            window.removeEventListener('pagehide', onPageHide)
            // Al salir: la Biblioteca muestra al instante la página y el avance actuales (optimista); el API confirma después
            const l = lecturaRef.current
            const total = l?.totalPaginas || docRef.current?.numPages || null
            const maxima = Math.max(l?.paginaMaxima || 0, paginaRef.current)
            reflejarEnBiblioteca(id, {
                ...(l || {}), ultimaPagina: paginaRef.current, totalPaginas: total, paginaMaxima: maxima,
                porcentaje: total ? Math.min(100, Math.round((100 * maxima) / total)) : 0,
                completado: !!(l?.completado || (total && maxima >= total)), ultimaVez: new Date().toISOString()
            })
            enviarProgreso()
        }
    }, [estado.fase, enviarProgreso, id])

    // ---------- teclado ----------
    useEffect(() => {
        const onKey = (e) => {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
            const paso = modo === 'libro' ? 2 : 1
            if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); irAPagina(paginaRef.current + paso) }
            else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); irAPagina(paginaRef.current - paso) }
            else if (e.key === '+' || e.key === '=') setZoomIdx(z => Math.min(ZOOMS.length - 1, z + 1))
            else if (e.key === '-') setZoomIdx(z => Math.max(0, z - 1))
            else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') { e.preventDefault(); setPanel('buscar') }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [irAPagina, modo])

    // ---------- miniaturas ----------
    useEffect(() => {
        if (!miniaturas || estado.fase !== 'listo' || !dimBase || !panelMiniaturasRef.current) return undefined
        const doc = docRef.current
        const io = new IntersectionObserver((entries) => {
            entries.forEach(async (en) => {
                if (!en.isIntersecting) return
                const num = parseInt(en.target.dataset.thumb, 10)
                if (thumbsHechasRef.current.has(num)) return
                thumbsHechasRef.current.add(num)
                const canvas = thumbsRef.current[num]
                if (!canvas || !doc) return
                try {
                    const page = await doc.getPage(num)
                    const vp = page.getViewport({ scale: ANCHO_MINIATURA / page.getViewport({ scale: 1 }).width })
                    canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height)
                    await page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport: vp }).promise
                } catch (e) { thumbsHechasRef.current.delete(num) }
            })
        }, { root: panelMiniaturasRef.current, rootMargin: '400px 0px' })
        thumbsRef.current.forEach(c => c && io.observe(c.parentElement))
        return () => io.disconnect()
    }, [miniaturas, estado.fase, dimBase, numPaginas])

    // Mantener la miniatura de la página actual a la vista (scroll solo dentro del panel)
    useEffect(() => {
        if (!miniaturas) return
        const panelEl = panelMiniaturasRef.current
        const btn = thumbsRef.current[paginaActual]?.parentElement
        if (!panelEl || !btn) return
        const top = btn.offsetTop
        const fueraArriba = top < panelEl.scrollTop + 8
        const fueraAbajo = top + btn.offsetHeight > panelEl.scrollTop + panelEl.clientHeight - 8
        if (fueraArriba || fueraAbajo) panelEl.scrollTo({ top: top - panelEl.clientHeight / 2 + btn.offsetHeight / 2, behavior: 'smooth' })
    }, [paginaActual, miniaturas])

    // ---------- búsqueda ----------
    const obtenerTexto = useCallback(async (num) => {
        if (textosRef.current[num]) return textosRef.current[num]
        const doc = docRef.current
        if (!doc) return null
        const page = await doc.getPage(num)
        const tc = await page.getTextContent()
        const vp1 = page.getViewport({ scale: 1 })
        let original = ''
        const items = []
        tc.items.forEach(it => {
            if (!it.str) return
            const inicio = original.length
            original += it.str
            const tx = pdfjsLib.Util.transform(vp1.transform, it.transform)
            const alto = Math.hypot(tx[2], tx[3]) || 10
            items.push({ inicio, fin: original.length, rect: { left: tx[4], top: tx[5] - alto, width: it.width || alto, height: alto * 1.15 } })
            original += it.hasEOL ? '\n' : ' '
        })
        const entrada = { original, normalizado: normalizar(original), items }
        textosRef.current[num] = entrada
        return entrada
    }, [])

    const buscar = useCallback(async (texto) => {
        const t = normalizar(texto.trim())
        const idBusqueda = ++busquedaIdRef.current
        if (t.length < 2 || !docRef.current) { setBusqueda({ resultados: [], activo: -1, indexando: 0, hecha: '' }); setResaltados({}); return }
        setBusqueda(b => ({ ...b, indexando: 1, hecha: texto.trim() }))
        const resultados = []
        const rects = {}
        const total = docRef.current.numPages
        for (let num = 1; num <= total; num++) {
            if (busquedaIdRef.current !== idBusqueda) return
            const tx = await obtenerTexto(num)
            if (!tx) continue
            let pos = tx.normalizado.indexOf(t)
            while (pos !== -1 && resultados.length < MAX_RESULTADOS) {
                const idx = resultados.length
                const ini = Math.max(0, pos - 45)
                const fragmento = tx.original.slice(ini, pos + t.length + 60).replace(/\s+/g, ' ')
                resultados.push({ pagina: num, fragmento, antes: tx.original.slice(ini, pos).replace(/\s+/g, ' '), coincidencia: tx.original.slice(pos, pos + t.length), despues: tx.original.slice(pos + t.length, pos + t.length + 60).replace(/\s+/g, ' '), idx })
                const ini2 = pos, fin2 = pos + t.length
                for (const it of tx.items) {
                    if (it.fin > ini2 && it.inicio < fin2) {
                        if (!rects[num]) rects[num] = []
                        rects[num].push({ ...it.rect, idx })
                    }
                }
                pos = tx.normalizado.indexOf(t, pos + t.length)
            }
            if (num % 10 === 0) setBusqueda(b => ({ ...b, indexando: Math.round((100 * num) / total) }))
            if (resultados.length >= MAX_RESULTADOS) break
        }
        if (busquedaIdRef.current !== idBusqueda) return
        setResaltados(rects)
        setBusqueda({ resultados, activo: resultados.length ? 0 : -1, indexando: 0, hecha: texto.trim() })
        if (resultados.length) irAPagina(resultados[0].pagina)
    }, [obtenerTexto, irAPagina])

    const irAResultado = (i) => {
        if (!busqueda.resultados.length) return
        const n = (i + busqueda.resultados.length) % busqueda.resultados.length
        setBusqueda(b => ({ ...b, activo: n }))
        irAPagina(busqueda.resultados[n].pagina)
    }

    // ---------- notas ----------
    const notasPorPagina = useMemo(() => {
        const m = {}
        notas.forEach(n => { m[n.pagina] = (m[n.pagina] || 0) + 1 })
        return m
    }, [notas])

    const guardarNota = async () => {
        if (!notaNueva.trim()) return
        setGuardandoNota(true)
        const r = await bibliotecaService.crearNota(id, { pagina: notaPagina, texto: notaNueva })
        setGuardandoNota(false)
        if (r.success) { setNotas(ns => [...ns, r.data.nota].sort((a, b) => a.pagina - b.pagina || new Date(a.creadaEn) - new Date(b.creadaEn))); setNotaNueva('') }
    }
    const guardarEdicion = async () => {
        if (!editando?.texto.trim()) return
        setGuardandoNota(true)
        const r = await bibliotecaService.actualizarNota(editando.id, { texto: editando.texto })
        setGuardandoNota(false)
        if (r.success) { setNotas(ns => ns.map(n => n.id === editando.id ? r.data.nota : n)); setEditando(null) }
    }
    const borrarNota = async (notaId) => {
        const r = await bibliotecaService.eliminarNota(notaId)
        if (r.success) setNotas(ns => ns.filter(n => n.id !== notaId))
        setConfirmarBorrar(null)
    }

    // ---------- marca de agua ----------
    const marcaAgua = useMemo(() => {
        const nombre = user?.nombreCompleto || user?.nombre_completo || user?.nombreUsuario || user?.nombre_usuario || ''
        const texto = `${nombre} · ${user?.email || ''} · Mediconsa`.replace(/</g, '')
        // Texto más grande y algo más visible (se repite en diagonal por toda la página)
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='560' height='340'><text x='0' y='185' font-family='Inter, Arial, sans-serif' font-size='22' font-weight='600' fill='%231e293b' fill-opacity='0.13' transform='rotate(-28 280 170)'>${encodeURIComponent(texto)}</text></svg>`
        return `url("data:image/svg+xml;utf8,${svg}")`
    }, [user])

    const porcentaje = numPaginas ? Math.round((100 * paginaActual) / numPaginas) : 0
    const fmtSesion = (s) => s < 60 ? `${s} s` : `${Math.floor(s / 60)} min`
    const togglePanel = (p) => setPanel(actual => actual === p ? null : p)

    // ---------- estados de carga / error ----------
    if (estado.fase === 'error') {
        const sinAcceso = estado.status === 403
        return (
            <Layout showSidebar navMovil={false}>
                <div className="p-6 md:p-8">
                    <Button variant="ghost" size="sm" to="/biblioteca" className="mb-4 -ml-2"><ArrowLeft className="w-4 h-4" /> Volver a la biblioteca</Button>
                    <EmptyState icon={sinAcceso ? Lock : AlertCircle} title={sinAcceso ? 'Material bloqueado' : 'No se pudo abrir el material'} description={estado.error}
                                action={sinAcceso ? <Button to="/mis-cursos">Ver mis cursos</Button> : <Button onClick={() => window.location.reload()}>Reintentar</Button>} />
                </div>
            </Layout>
        )
    }

    const listo = estado.fase === 'listo'

    const renderPagina = (num) => (
        <div key={num} data-pagina={num} ref={refWrapper(num)}
             className="relative bg-white shadow-[0_2px_24px_rgba(15,23,42,0.12)] rounded-sm overflow-hidden flex-shrink-0"
             style={{ width: Math.floor(dimBase.w * escala), height: Math.floor(dimBase.h * escala) }}>
            <canvas ref={refCanvas(num)} className="block" />
            {resaltados[num]?.map((r, i) => (
                <div key={i} className={`absolute rounded-[2px] pointer-events-none ${busqueda.activo === r.idx ? 'bg-orange-400/45 ring-1 ring-orange-500' : 'bg-yellow-300/45'}`}
                     style={{ left: r.left * escala, top: r.top * escala, width: r.width * escala, height: r.height * escala }} />
            ))}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: marcaAgua }} aria-hidden="true" />
            {notasPorPagina[num] && (
                <button onClick={() => { setPanel('notas'); setNotaPagina(num) }} title={`${notasPorPagina[num]} nota${notasPorPagina[num] > 1 ? 's' : ''} en esta página`}
                        className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold shadow-sm">
                    <StickyNote className="w-3 h-3" /> {notasPorPagina[num]}
                </button>
            )}
            <span className="absolute bottom-1.5 right-2 text-[10px] text-gray-400 pointer-events-none">{num}</span>
        </div>
    )

    return (
        <Layout showSidebar navMovil={false}>
            <div className="h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-5rem)] supports-[height:100dvh]:h-[calc(100dvh-3.5rem)] lg:supports-[height:100dvh]:h-[calc(100dvh-5rem)] flex flex-col">
                {/* ===== Barra del lector ===== */}
                <header className="bg-white border-b border-gray-100 px-3 md:px-4 py-2 flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <button onClick={() => navigate('/biblioteca')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" title="Volver a la biblioteca"><ArrowLeft className="w-5 h-5" /></button>
                    <div className="min-w-0 flex-1 basis-40">
                        <p className="text-sm md:text-base font-semibold text-gray-900 truncate">{material ? limpiarTitulo(material.titulo) : 'Cargando…'}</p>
                        <p className="text-[11px] md:text-xs text-medico-gray truncate">{limpiarTitulo(material?.curso?.titulo || material?.categoria || 'Biblioteca Mediconsa')}</p>
                    </div>

                    {listo && (
                        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            <Pill className="hidden md:inline-flex bg-blue-50 text-medico-blue border-blue-100"><Clock className="w-3.5 h-3.5" /> {fmtSesion(segundosSesion)} hoy</Pill>
                            {lectura?.completado && <Pill className="hidden md:inline-flex bg-emerald-50 text-medico-green border-emerald-100"><CheckCircle2 className="w-3.5 h-3.5" /> Leído</Pill>}

                            <BotonBarra activo={miniaturas} onClick={() => setMiniaturas(m => !m)} title="Miniaturas de páginas"><LayoutGrid className="w-4 h-4" /></BotonBarra>

                            <div className="inline-flex rounded-full border border-gray-200 bg-white p-0.5">
                                <button onClick={() => cambiarModo('continuo')} title="Vista continua" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${modo === 'continuo' ? 'bg-medico-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}><ScrollText className="w-4 h-4" /><span className="hidden lg:inline">Continua</span></button>
                                <button onClick={() => cambiarModo('libro')} title="Vista libro (dos páginas)" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${modo === 'libro' ? 'bg-medico-blue text-white' : 'text-gray-600 hover:bg-gray-100'}`}><BookOpen className="w-4 h-4" /><span className="hidden lg:inline">Libro</span></button>
                            </div>

                            <div className="flex items-center gap-0.5 rounded-full border border-gray-200 bg-white px-1 py-0.5">
                                <button onClick={() => irAPagina(paginaActual - (modo === 'libro' ? 2 : 1))} disabled={paginaActual <= 1} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-40" title="Anterior (←)"><ChevronUp className="w-4 h-4" /></button>
                                <form onSubmit={e => { e.preventDefault(); irAPagina(parseInt(inputPagina, 10) || 1) }} className="flex items-center gap-1 text-sm">
                                    <input value={inputPagina} onChange={e => setInputPagina(e.target.value.replace(/\D/g, ''))} onBlur={() => setInputPagina(String(paginaActual))}
                                           className="w-10 text-center rounded-lg border border-gray-200 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-medico-blue" aria-label="Ir a la página" title="Ir a la página (Enter)" />
                                    <span className="text-medico-gray text-xs whitespace-nowrap">/ {numPaginas}</span>
                                </form>
                                <button onClick={() => irAPagina(paginaActual + (modo === 'libro' ? 2 : 1))} disabled={paginaActual >= numPaginas} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-40" title="Siguiente (→)"><ChevronDown className="w-4 h-4" /></button>
                            </div>

                            <div className="hidden sm:flex items-center gap-0.5 rounded-full border border-gray-200 bg-white px-1 py-0.5">
                                <button onClick={() => setZoomIdx(z => Math.max(0, z - 1))} disabled={zoomIdx === 0} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-40" title="Alejar (−)"><ZoomOut className="w-4 h-4" /></button>
                                <span className="text-xs text-gray-700 w-10 text-center tabular-nums">{Math.round(ZOOMS[zoomIdx] * 100)}%</span>
                                <button onClick={() => setZoomIdx(z => Math.min(ZOOMS.length - 1, z + 1))} disabled={zoomIdx === ZOOMS.length - 1} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-40" title="Acercar (+)"><ZoomIn className="w-4 h-4" /></button>
                                <button onClick={() => setZoomIdx(ZOOM_BASE)} className="p-1.5 rounded-full hover:bg-gray-100" title="Ajustar"><Maximize2 className="w-4 h-4" /></button>
                            </div>

                            <BotonBarra activo={panel === 'buscar'} onClick={() => togglePanel('buscar')} title="Buscar en el documento (Ctrl+F)"><Search className="w-4 h-4" /></BotonBarra>
                            <BotonBarra activo={panel === 'notas'} onClick={() => togglePanel('notas')} title="Mis notas">
                                <StickyNote className="w-4 h-4" />
                                {notas.length > 0 && <span className="ml-1 text-[11px] font-semibold">{notas.length}</span>}
                            </BotonBarra>
                        </div>
                    )}
                </header>
                {listo && <ProgressBar value={porcentaje} height="h-1" className="rounded-none flex-shrink-0" color={lectura?.completado ? 'bg-medico-green' : 'bg-medico-blue'} />}

                {/* ===== Cuerpo: miniaturas | páginas | panel ===== */}
                <div className="flex-1 flex min-h-0 relative">
                    {/* Miniaturas */}
                    {listo && miniaturas && dimBase && (
                        <aside ref={panelMiniaturasRef} className="absolute inset-y-0 left-0 z-20 lg:relative lg:inset-auto w-40 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
                            <div className="flex items-center justify-between px-3 pt-3 pb-1 lg:hidden">
                                <span className="text-xs font-semibold text-gray-700">Páginas</span>
                                <button onClick={() => setMiniaturas(false)} className="p-1 rounded-full hover:bg-gray-100"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-3 flex flex-col items-center gap-3">
                                {Array.from({ length: numPaginas }, (_, i) => i + 1).map(num => (
                                    <button key={num} data-thumb={num} onClick={() => irAPagina(num)}
                                            className={`relative rounded-sm bg-white shadow-sm ring-2 transition-all ${num === paginaActual ? 'ring-medico-blue' : 'ring-transparent hover:ring-gray-300'}`}
                                            style={{ width: ANCHO_MINIATURA, height: Math.floor((ANCHO_MINIATURA * dimBase.h) / dimBase.w) }} title={`Página ${num}`}>
                                        <canvas ref={refThumb(num)} className="block w-full h-full" />
                                        {notasPorPagina[num] && <StickyNote className="absolute top-1 right-1 w-3.5 h-3.5 text-amber-500 fill-amber-200" />}
                                        <span className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 translate-y-1/2 px-1.5 rounded text-[10px] font-semibold ${num === paginaActual ? 'bg-medico-blue text-white' : 'bg-gray-100 text-gray-600'}`}>{num}</span>
                                    </button>
                                ))}
                            </div>
                        </aside>
                    )}

                    {/* Páginas */}
                    <div ref={contenedorRef} className="flex-1 min-w-0 overflow-y-auto bg-gray-200/70 select-none relative" onContextMenu={e => e.preventDefault()}>
                        {estado.fase === 'cargando' && (
                            <div className="h-full flex items-center justify-center p-6">
                                <Card className="p-8 w-full max-w-sm text-center">
                                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-medico-blue" />
                                    <p className="mt-4 font-semibold text-gray-900">Abriendo tu material</p>
                                    <p className="text-sm text-medico-gray mt-1">{estado.progreso !== null ? `Descargando… ${estado.progreso}%` : 'Preparando…'}</p>
                                    {estado.progreso !== null && <ProgressBar value={estado.progreso} className="mt-4" />}
                                </Card>
                            </div>
                        )}
                        {listo && dimBase && modo === 'continuo' && (
                            <div className="py-3 md:py-6 flex flex-col items-center gap-3 md:gap-4">
                                {paginasEnPantalla.map(renderPagina)}
                                <p className="text-xs text-medico-gray py-4">Fin del documento · Mediconsa</p>
                            </div>
                        )}
                        {listo && dimBase && modo === 'libro' && (
                            <div className="min-h-full flex items-center justify-center py-4 px-2">
                                <button onClick={pliegoAnterior} disabled={pliego <= 1} className="hidden md:flex absolute left-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-md items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-30" title="Pliego anterior (←)"><ChevronLeft className="w-6 h-6" /></button>
                                <div className="flex items-stretch gap-0 shadow-[0_12px_40px_rgba(15,23,42,0.18)] rounded-sm">
                                    {paginasEnPantalla.map(renderPagina)}
                                    {paginasEnPantalla.length === 1 && <div className="flex-shrink-0 bg-gray-100/60" style={{ width: Math.floor(dimBase.w * escala), height: Math.floor(dimBase.h * escala) }} />}
                                </div>
                                <button onClick={pliegoSiguiente} disabled={pliego + 1 >= numPaginas} className="hidden md:flex absolute right-2 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white shadow-md items-center justify-center text-gray-700 hover:bg-gray-50 disabled:opacity-30" title="Pliego siguiente (→)"><ChevronRight className="w-6 h-6" /></button>
                                <div className="md:hidden absolute bottom-3 inset-x-0 flex justify-center gap-3">
                                    <button onClick={pliegoAnterior} disabled={pliego <= 1} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-30"><ChevronLeft className="w-5 h-5" /></button>
                                    <button onClick={pliegoSiguiente} disabled={pliego + 1 >= numPaginas} className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center disabled:opacity-30"><ChevronRight className="w-5 h-5" /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Panel derecho: buscar / notas */}
                    {listo && panel && (
                        <aside className="absolute inset-y-0 right-0 z-20 lg:static w-full max-w-sm lg:w-80 xl:w-96 flex-shrink-0 bg-white border-l border-gray-200 flex flex-col">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                                <button onClick={() => setPanel('buscar')} className={`px-3 py-1.5 rounded-full text-sm font-medium ${panel === 'buscar' ? 'bg-blue-50 text-medico-blue' : 'text-gray-600 hover:bg-gray-100'}`}><Search className="w-4 h-4 inline mr-1.5 -mt-0.5" />Buscar</button>
                                <button onClick={() => setPanel('notas')} className={`px-3 py-1.5 rounded-full text-sm font-medium ${panel === 'notas' ? 'bg-amber-50 text-amber-800' : 'text-gray-600 hover:bg-gray-100'}`}><StickyNote className="w-4 h-4 inline mr-1.5 -mt-0.5" />Notas{notas.length > 0 && ` (${notas.length})`}</button>
                                <button onClick={() => setPanel(null)} className="ml-auto p-1.5 rounded-full hover:bg-gray-100 text-gray-500" title="Cerrar panel"><X className="w-4 h-4" /></button>
                            </div>

                            {panel === 'buscar' && (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <form onSubmit={e => { e.preventDefault(); buscar(termino) }} className="p-4 border-b border-gray-100">
                                        <div className="relative">
                                            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                            <input autoFocus value={termino} onChange={e => setTermino(e.target.value)} placeholder="Buscar en el documento…"
                                                   className="w-full pl-10 pr-3 py-2.5 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-medico-blue focus:border-transparent" />
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-xs text-medico-gray">
                                            {busqueda.indexando > 0
                                                ? <span className="inline-flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Leyendo el documento… {busqueda.indexando}%</span>
                                                : busqueda.hecha
                                                    ? <span>{busqueda.resultados.length === 0 ? 'Sin coincidencias' : `${busqueda.resultados.length}${busqueda.resultados.length >= MAX_RESULTADOS ? '+' : ''} coincidencias`} para "{busqueda.hecha}"</span>
                                                    : <span>Enter para buscar. Funciona en PDF con texto (no escaneados).</span>}
                                            {busqueda.resultados.length > 1 && (
                                                <span className="inline-flex items-center gap-0.5">
                                                    <button type="button" onClick={() => irAResultado(busqueda.activo - 1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronUp className="w-4 h-4" /></button>
                                                    <span className="tabular-nums">{busqueda.activo + 1}/{busqueda.resultados.length}</span>
                                                    <button type="button" onClick={() => irAResultado(busqueda.activo + 1)} className="p-1 rounded-full hover:bg-gray-100"><ChevronDown className="w-4 h-4" /></button>
                                                </span>
                                            )}
                                        </div>
                                    </form>
                                    <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
                                        {busqueda.resultados.map((r, i) => (
                                            <li key={i}>
                                                <button onClick={() => irAResultado(i)} className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${busqueda.activo === i ? 'bg-blue-50' : ''}`}>
                                                    <span className="text-[11px] font-semibold text-medico-blue">Página {r.pagina}</span>
                                                    <p className="text-sm text-gray-700 leading-snug mt-0.5">…{r.antes}<mark className="bg-yellow-200 rounded-[2px] px-0.5">{r.coincidencia}</mark>{r.despues}…</p>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {panel === 'notas' && (
                                <div className="flex-1 flex flex-col min-h-0">
                                    <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-semibold text-gray-700">Nueva nota</label>
                                            <span className="inline-flex items-center gap-1 text-xs text-medico-gray">en la página
                                                <input value={notaPagina} onChange={e => setNotaPagina(Math.min(numPaginas, Math.max(1, parseInt(e.target.value, 10) || 1)))} type="number" min={1} max={numPaginas}
                                                       className="w-14 text-center rounded-lg border border-gray-200 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-medico-blue" />
                                            </span>
                                        </div>
                                        <textarea value={notaNueva} onChange={e => setNotaNueva(e.target.value)} rows={3} placeholder="Escribe una idea, un resumen o algo que quieras recordar…"
                                                  className="w-full rounded-2xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-medico-blue focus:border-transparent resize-none" />
                                        <div className="flex justify-end mt-2">
                                            <Button size="sm" onClick={guardarNota} disabled={!notaNueva.trim()} loading={guardandoNota}><Plus className="w-4 h-4" /> Guardar nota</Button>
                                        </div>
                                    </div>
                                    <ul className="flex-1 overflow-y-auto divide-y divide-gray-100">
                                        {notas.length === 0 && <li className="px-4 py-10 text-center text-sm text-medico-gray">Aún no tienes notas en este material.<br />Anota lo importante mientras lees: quedarán guardadas aquí.</li>}
                                        {notas.map(n => (
                                            <li key={n.id} className="px-4 py-3">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <button onClick={() => irAPagina(n.pagina)} className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold hover:bg-amber-200">Pág. {n.pagina}</button>
                                                    <span className="text-[11px] text-medico-gray">{new Date(n.actualizadaEn).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}</span>
                                                    <span className="ml-auto inline-flex gap-0.5">
                                                        <button onClick={() => { setEditando({ id: n.id, texto: n.texto }); setConfirmarBorrar(null) }} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500" title="Editar"><Pencil className="w-3.5 h-3.5" /></button>
                                                        {confirmarBorrar === n.id
                                                            ? <button onClick={() => borrarNota(n.id)} className="px-2 py-0.5 rounded-full bg-red-50 text-medico-red text-[11px] font-semibold hover:bg-red-100">¿Borrar?</button>
                                                            : <button onClick={() => setConfirmarBorrar(n.id)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500" title="Eliminar"><Trash2 className="w-3.5 h-3.5" /></button>}
                                                    </span>
                                                </div>
                                                {editando?.id === n.id ? (
                                                    <div>
                                                        <textarea autoFocus value={editando.texto} onChange={e => setEditando(ed => ({ ...ed, texto: e.target.value }))} rows={3}
                                                                  className="w-full rounded-2xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-medico-blue resize-none" />
                                                        <div className="flex justify-end gap-2 mt-2">
                                                            <Button size="sm" variant="ghost" onClick={() => setEditando(null)}>Cancelar</Button>
                                                            <Button size="sm" onClick={guardarEdicion} loading={guardandoNota}>Guardar</Button>
                                                        </div>
                                                    </div>
                                                ) : <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{n.texto}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </aside>
                    )}
                </div>
            </div>
        </Layout>
    )
}

const BotonBarra = ({ activo, children, ...rest }) => (
    <button {...rest} className={`inline-flex items-center px-2.5 py-2 rounded-full border text-sm transition-colors ${activo ? 'bg-blue-50 border-blue-200 text-medico-blue' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
        {children}
    </button>
)

export default Lector
