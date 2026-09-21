// components/QuestionRenderer.jsx - COMPONENTE FRAGMENTADO
import React, { useState, useEffect } from 'react'
import { Lightbulb, Info, CheckCircle2, AlertTriangle, ArrowUp, ArrowDown, ListChecks, ToggleLeft, CheckSquare, PenLine, Hash, FileText, TextCursorInput, Link2, ArrowUpDown } from 'lucide-react'

const QuestionRenderer = ({
                              pregunta,
                              respuestaActual,
                              onRespuestaChange,
                              modoSimulacro = 'estudio',
                              mostrarExplicacion = false
                          }) => {
    // Estados locales para tipos complejos
    const [matchingPairs, setMatchingPairs] = useState({})
    const [orderingItems, setOrderingItems] = useState([])
    const [fillBlankValues, setFillBlankValues] = useState({})

    // Inicializar estados complejos cuando cambia la pregunta
    useEffect(() => {
        if (pregunta.tipo_pregunta === 'matching') {
            initializeMatching()
        } else if (pregunta.tipo_pregunta === 'ordering') {
            initializeOrdering()
        } else if (pregunta.tipo_pregunta === 'fill_blanks') {
            initializeFillBlanks()
        }
    }, [pregunta.id])

    // ==================== INICIALIZACIÓN DE TIPOS COMPLEJOS ====================

    const initializeMatching = () => {
        if (respuestaActual?.respuestaCompleja) {
            setMatchingPairs(respuestaActual.respuestaCompleja)
        } else {
            setMatchingPairs({})
        }
    }

    const initializeOrdering = () => {
        if (respuestaActual?.respuestaCompleja) {
            setOrderingItems(respuestaActual.respuestaCompleja)
        } else {
            // Crear orden aleatorio inicial
            const items = pregunta.opciones?.map((op, index) => ({
                id: op.id,
                texto: op.texto_opcion,
                orden_original: op.orden,
                orden_actual: index
            })).sort(() => Math.random() - 0.5) || []
            setOrderingItems(items)
        }
    }

    const initializeFillBlanks = () => {
        if (respuestaActual?.respuestaCompleja) {
            setFillBlankValues(respuestaActual.respuestaCompleja)
        } else {
            setFillBlankValues({})
        }
    }

    // ==================== MANEJADORES DE RESPUESTA ====================

    const handleSimpleResponse = (valor, esMultiple = false) => {
        if (esMultiple) {
            // Para multiple_respuesta
            const respuestasActuales = respuestaActual?.opcionesSeleccionadas || []
            let nuevasRespuestas

            if (respuestasActuales.includes(valor)) {
                nuevasRespuestas = respuestasActuales.filter(id => id !== valor)
            } else {
                nuevasRespuestas = [...respuestasActuales, valor]
            }

            onRespuestaChange({
                opcionesSeleccionadas: nuevasRespuestas,
                timestamp: Date.now()
            })
        } else {
            // Para multiple y true_false
            onRespuestaChange({
                opcionSeleccionadaId: valor,
                timestamp: Date.now()
            })
        }
    }

    const handleTextResponse = (texto) => {
        onRespuestaChange({
            respuestaTexto: texto,
            timestamp: Date.now()
        })
    }

    const handleComplexResponse = (respuestaCompleja) => {
        onRespuestaChange({
            respuestaCompleja,
            timestamp: Date.now()
        })
    }

    const handleMatchingChange = (conceptoId, definicionId) => {
        const nuevaRespuesta = { ...matchingPairs }
        if (definicionId) {
            nuevaRespuesta[conceptoId] = definicionId
        } else {
            delete nuevaRespuesta[conceptoId]
        }
        setMatchingPairs(nuevaRespuesta)
        handleComplexResponse(nuevaRespuesta)
    }

    const handleOrderingChange = (fromIndex, toIndex) => {
        const newItems = [...orderingItems]
        const [removed] = newItems.splice(fromIndex, 1)
        newItems.splice(toIndex, 0, removed)

        // Actualizar orden_actual
        const updatedItems = newItems.map((item, index) => ({
            ...item,
            orden_actual: index
        }))

        setOrderingItems(updatedItems)
        handleComplexResponse(updatedItems)
    }

    const handleFillBlankChange = (blankIndex, value) => {
        const nuevosValores = { ...fillBlankValues }
        nuevosValores[blankIndex] = value
        setFillBlankValues(nuevosValores)
        handleComplexResponse(nuevosValores)
    }

    // ==================== RENDERIZADORES POR TIPO ====================

    const renderMultipleChoice = (permitirMultiples = false) => {
        const opcionesSeleccionadas = permitirMultiples
            ? (respuestaActual?.opcionesSeleccionadas || [])
            : (respuestaActual?.opcionSeleccionadaId ? [respuestaActual.opcionSeleccionadaId] : [])

        return (
            <div className="space-y-3">
                {pregunta.opciones?.map((opcion, index) => {
                    const isSelected = opcionesSeleccionadas.includes(opcion.id)

                    return (
                        <label
                            key={opcion.id}
                            className={`ent-opcion ent-entrada ent-retraso-${Math.min(4, index + 1)} flex items-start gap-3 md:gap-4 p-3 sm:p-4 md:p-5 border-2 rounded-2xl cursor-pointer transition-colors select-none ${
                                isSelected
                                    ? 'border-medico-blue bg-blue-50 ring-2 ring-medico-blue/30'
                                    : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                        >
                            <input
                                type={permitirMultiples ? "checkbox" : "radio"}
                                name={permitirMultiples ? undefined : `pregunta-${pregunta.id}`}
                                checked={isSelected}
                                onChange={() => handleSimpleResponse(opcion.id, permitirMultiples)}
                                className="sr-only"
                            />
                            <span className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs md:text-sm font-bold flex items-center justify-center transition-colors ${isSelected ? 'bg-medico-blue text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className="flex-1 text-[15px] sm:text-base md:text-lg leading-snug md:leading-normal text-gray-900 pt-0.5">{opcion.texto_opcion}</span>
                        </label>
                    )
                })}

                {permitirMultiples && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center text-sm text-blue-800">
                            <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>Puedes seleccionar varias respuestas</span>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderShortAnswer = () => {
        const respuestaTexto = respuestaActual?.respuestaTexto || ''

        return (
            <div className="space-y-3">
                <input
                    type="text"
                    value={respuestaTexto}
                    onChange={(e) => handleTextResponse(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Escribe tu respuesta aquí..."
                    maxLength={200}
                />
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Respuesta corta (máximo 200 caracteres)</span>
                    <span>{respuestaTexto.length}/200</span>
                </div>

                {/* Mostrar opciones correctas como ayuda en modo estudio */}
                {modoSimulacro === 'estudio' && pregunta.opciones && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-green-800">
                            <span className="font-medium inline-flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Respuestas válidas:</span>
                            <div className="mt-1">
                                {pregunta.opciones.map((opcion, index) => (
                                    <span key={opcion.id} className="inline-block mr-2 px-2 py-1 bg-green-100 rounded text-xs">
                                        {opcion.texto_opcion}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderNumerical = () => {
        const respuestaTexto = respuestaActual?.respuestaTexto || ''

        const handleNumericInput = (value) => {
            // Permitir solo números, puntos, comas y signo negativo
            const cleanValue = value.replace(/[^\d.,-]/g, '')
            handleTextResponse(cleanValue)
        }

        return (
            <div className="space-y-3">
                <input
                    type="text"
                    value={respuestaTexto}
                    onChange={(e) => handleNumericInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-lg"
                    placeholder="Ingresa el valor numérico..."
                    inputMode="decimal"
                />
                <div className="text-sm text-gray-500 text-center">
                    <span className="font-medium inline-flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Consejo:</span> Usa punto (.) para decimales. Ejemplo: 1050 o 15.5
                </div>

                {/* Mostrar respuesta correcta en modo estudio */}
                {modoSimulacro === 'estudio' && pregunta.opciones?.[0] && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="text-sm text-green-800 text-center">
                            <span className="font-medium inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Respuesta correcta:</span> {pregunta.opciones[0].texto_opcion}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderEssay = () => {
        const respuestaTexto = respuestaActual?.respuestaTexto || ''

        return (
            <div className="space-y-3">
                <textarea
                    value={respuestaTexto}
                    onChange={(e) => handleTextResponse(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                    placeholder="Desarrolla tu respuesta de manera detallada..."
                />
                <div className="flex justify-between text-sm text-gray-500">
                    <span>Respuesta de ensayo (evaluación manual)</span>
                    <span>{respuestaTexto.length} caracteres</span>
                </div>

                {modoSimulacro === 'estudio' && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="text-sm text-yellow-800">
                            <span className="font-medium inline-flex items-center gap-1"><Info className="w-4 h-4" /> Nota:</span> Las preguntas de ensayo son evaluadas manualmente por el instructor.
                        </div>
                    </div>
                )}
            </div>
        )
    }

    const renderMatching = () => {
        const conceptos = pregunta.opciones?.filter(op =>
            op.texto_opcion.toLowerCase().includes('concepto:') ||
            op.es_correcta === true
        ) || []

        const definiciones = pregunta.opciones?.filter(op =>
            op.texto_opcion.toLowerCase().includes('definicion:') ||
            op.es_correcta === false
        ) || []

        return (
            <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Instrucciones:</span> Relaciona cada concepto con su definición correspondiente.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Conceptos */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Conceptos</h4>
                        <div className="space-y-2">
                            {conceptos.map((concepto, index) => (
                                <div key={concepto.id} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="font-medium text-blue-900">
                                        {index + 1}. {concepto.texto_opcion.replace(/concepto:\s*/i, '')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Definiciones */}
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Definiciones</h4>
                        <div className="space-y-2">
                            {definiciones.map((definicion, index) => {
                                const conceptoAsociado = Object.keys(matchingPairs).find(
                                    conceptoId => matchingPairs[conceptoId] === definicion.id
                                )

                                return (
                                    <div key={definicion.id} className="p-3 border-2 rounded-lg bg-gray-50">
                                        <div className="text-gray-900 mb-2">
                                            {String.fromCharCode(65 + index)}. {definicion.texto_opcion.replace(/definicion:\s*/i, '')}
                                        </div>
                                        <select
                                            value={conceptoAsociado || ''}
                                            onChange={(e) => handleMatchingChange(e.target.value, definicion.id)}
                                            className="w-full text-sm border-gray-300 rounded"
                                        >
                                            <option value="">Seleccionar concepto...</option>
                                            {conceptos.map((concepto, idx) => (
                                                <option key={concepto.id} value={concepto.id}>
                                                    {idx + 1}. {concepto.texto_opcion.replace(/concepto:\s*/i, '')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const renderOrdering = () => {
        return (
            <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Instrucciones:</span> Ordena los elementos usando los botones de subir/bajar.
                </div>

                <div className="space-y-2">
                    {orderingItems.map((item, index) => (
                        <div
                            key={item.id}
                            className="flex items-center p-3 bg-white border border-gray-100 rounded-2xl hover:border-gray-300"
                        >
                            <div className="flex flex-col mr-3">
                                <button
                                    onClick={() => index > 0 && handleOrderingChange(index, index - 1)}
                                    disabled={index === 0}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 mb-1"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => index < orderingItems.length - 1 && handleOrderingChange(index, index + 1)}
                                    disabled={index === orderingItems.length - 1}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1">
                                <span className="font-medium text-blue-600 mr-2">{index + 1}.</span>
                                <span className="text-gray-900">{item.texto}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderFillBlanks = () => {
        const texto = pregunta.enunciado
        const partes = texto.split(/(_____)/g)
        let blankIndex = 0

        return (
            <div className="space-y-4">
                <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">Instrucciones:</span> Completa los espacios en blanco.
                </div>

                <div className="text-lg leading-relaxed p-4 bg-gray-50 rounded-lg">
                    {partes.map((parte, index) => {
                        if (parte === '_____') {
                            const currentBlankIndex = blankIndex++
                            return (
                                <input
                                    key={`blank-${currentBlankIndex}`}
                                    type="text"
                                    value={fillBlankValues[currentBlankIndex] || ''}
                                    onChange={(e) => handleFillBlankChange(currentBlankIndex, e.target.value)}
                                    className="inline-block mx-1 px-2 py-1 border-b-2 border-blue-500 focus:outline-none focus:border-blue-700 bg-white rounded-t min-w-[100px]"
                                    placeholder="..."
                                />
                            )
                        }
                        return <span key={index}>{parte}</span>
                    })}
                </div>
            </div>
        )
    }

    // ==================== RENDER PRINCIPAL ====================

    const getTipoPreguntaInfo = () => {
        const tipos = {
            'multiple': { nombre: 'Opción múltiple', Icono: ListChecks, color: 'bg-blue-100 text-blue-700' },
            'true_false': { nombre: 'Verdadero / falso', Icono: ToggleLeft, color: 'bg-green-100 text-green-700' },
            'multiple_respuesta': { nombre: 'Respuesta múltiple', Icono: CheckSquare, color: 'bg-purple-100 text-purple-700' },
            'short_answer': { nombre: 'Respuesta corta', Icono: PenLine, color: 'bg-yellow-100 text-yellow-700' },
            'numerical': { nombre: 'Numérica', Icono: Hash, color: 'bg-indigo-100 text-indigo-700' },
            'essay': { nombre: 'Ensayo', Icono: FileText, color: 'bg-gray-100 text-gray-700' },
            'fill_blanks': { nombre: 'Completar espacios', Icono: TextCursorInput, color: 'bg-orange-100 text-orange-700' },
            'matching': { nombre: 'Emparejamiento', Icono: Link2, color: 'bg-pink-100 text-pink-700' },
            'ordering': { nombre: 'Ordenamiento', Icono: ArrowUpDown, color: 'bg-cyan-100 text-cyan-700' }
        }
        return tipos[pregunta.tipo_pregunta] || tipos['multiple']
    }

    const renderPreguntaContent = () => {
        switch (pregunta.tipo_pregunta) {
            case 'multiple':
            case 'true_false':
                return renderMultipleChoice(false)
            case 'multiple_respuesta':
                return renderMultipleChoice(true)
            case 'short_answer':
                return renderShortAnswer()
            case 'numerical':
                return renderNumerical()
            case 'essay':
                return renderEssay()
            case 'fill_blanks':
                return renderFillBlanks()
            case 'matching':
                return renderMatching()
            case 'ordering':
                return renderOrdering()
            default:
                return (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-sm">
                        <AlertTriangle className="w-4 h-4" /> Tipo de pregunta no soportado: {pregunta.tipo_pregunta}
                    </div>
                )
        }
    }

    const tipoInfo = getTipoPreguntaInfo()

    return (
        <div className="space-y-5">
            {/* Tipo de pregunta (solo si no es la opción múltiple habitual, para no repetir ruido) */}
            {pregunta.tipo_pregunta !== 'multiple' && (
                <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${tipoInfo.color}`}>
                        <tipoInfo.Icono className="w-3.5 h-3.5" /> {tipoInfo.nombre}
                    </span>
                </div>
            )}

            {/* Enunciado */}
            <div className="space-y-4">
                <div className="prose max-w-none">
                    <h2 className="font-sans text-[15px] sm:text-base md:text-[21px] font-medium md:font-semibold text-gray-900 leading-relaxed whitespace-pre-line">
                        {pregunta.enunciado}
                    </h2>
                </div>

                {/* Imagen si existe */}
                {pregunta.imagen_url && (
                    <div>
                        <img
                            src={pregunta.imagen_url}
                            alt="Imagen de la pregunta"
                            className="max-w-full h-auto rounded-lg border border-gray-200 shadow-sm"
                            onError={(e) => {
                                e.target.style.display = 'none'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Contenido de la pregunta */}
            <div>
                {renderPreguntaContent()}
            </div>

            {/* Explicación (solo en modo estudio y si está disponible) */}
            {mostrarExplicacion && pregunta.explicacion && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                        <Lightbulb className="w-5 h-5 text-medico-blue mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-medium text-blue-900 mb-1">Explicación:</div>
                            <div className="text-blue-800 text-sm leading-relaxed">
                                {pregunta.explicacion}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default QuestionRenderer