import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { 
  NOTES_5THS_ES, NOTES_5THS_ES_ENHARM, NOTES_5THS_EN, NOTES_5THS_EN_ENHARM,
  REL_MINOR_ES_ENHARM, REL_MINOR_EN_ENHARM, 
  degToRad, getMajorScale, getMajorKeyChordsEnglish, getMajorKeyChordsSpanish, 
  toTitle 
} from '../wheel'
import { NotationToggle, type NotationType } from './NotationToggle'
import './wheel.css'

const STEP_DEG = 360 / 12

type Size = { width: number; height: number }

function polarToCartesian(cx: number, cy: number, r: number, angleFromTopDeg: number) {
  const rad = degToRad(angleFromTopDeg - 90)
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function WheelUI() {
  const [rotation, setRotation] = useState(0)
  const [notation, setNotation] = useState<NotationType>('spanish')
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [size, setSize] = useState<Size>({ width: 760, height: 900 })

  // Responsive sizing using ResizeObserver
  useEffect(() => {
    const el = svgRef.current?.parentElement
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
    const w = Math.min(1000, e.contentRect.width)
    setSize({ width: w, height: w })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cx = size.width / 2
  // Hacemos el radio independiente de height para que el SVG sea compacto
  const topRadius = size.width * 0.34
  // Small margin above circle (no banner)
  const cyTop = topRadius + 16
  const outerStroke = Math.max(2, topRadius * 0.012)
  // Altura efectiva del SVG, ajustada al disco + margen para números romanos
  const svgHeight = Math.ceil(cyTop + topRadius + 50)

  const onPointerDown = useCallback((e: React.PointerEvent<SVGElement>) => {
    const svg = svgRef.current!
    svg.setPointerCapture(e.pointerId)
  }, [])

  const updateAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current!
      const rect = svg.getBoundingClientRect()
      const x = clientX - (rect.left + cx)
      const y = clientY - (rect.top + cyTop)
      const raw = Math.atan2(y, x)
  let deg = (raw * 180) / Math.PI
  deg = (deg + 90 + 360) % 360 // 0º arriba
  // Fluid rotation while dragging; snapping happens on release
  setRotation(deg)
    },
    [cx, cyTop],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<SVGElement>) => {
      if (!(e.buttons & 1)) return
      updateAngleFromEvent(e.clientX, e.clientY)
    },
    [updateAngleFromEvent],
  )

  const onPointerUp = useCallback((e: React.PointerEvent<SVGElement>) => {
    const svg = svgRef.current!
    if (svg.hasPointerCapture(e.pointerId)) svg.releasePointerCapture(e.pointerId)
    // Snap to nearest step on release
    setRotation((prev) => (Math.round(prev / STEP_DEG) * STEP_DEG) % 360)
  }, [])

  // Safari/iOS passive touch move
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onTouchMove = (ev: TouchEvent) => {
      if (ev.touches.length) {
        updateAngleFromEvent(ev.touches[0].clientX, ev.touches[0].clientY)
      }
    }
    const onTouchEnd = () => {
      setRotation((prev) => (Math.round(prev / STEP_DEG) * STEP_DEG) % 360)
    }
    svg.addEventListener('touchmove', onTouchMove, { passive: false })
    svg.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      svg.removeEventListener('touchmove', onTouchMove)
      svg.removeEventListener('touchend', onTouchEnd)
    }
  }, [updateAngleFromEvent])

  // indices para ventanas (rueda gira, puntero fijo) -> invertir signo
  const rootIdx = useMemo(() => {
    const steps = Math.round(rotation / STEP_DEG)
    return ((-steps % 12) + 12) % 12
  }, [rotation])
  const fourthIdx = (rootIdx + 11) % 12
  const fifthIdx = (rootIdx + 1) % 12

  // Choose the appropriate arrays based on notation
  const notesArray = notation === 'spanish' ? NOTES_5THS_ES : NOTES_5THS_EN
  const notesEnharmArray = notation === 'spanish' ? NOTES_5THS_ES_ENHARM : NOTES_5THS_EN_ENHARM
  const relMinorArray = notation === 'spanish' ? REL_MINOR_ES_ENHARM : REL_MINOR_EN_ENHARM

  const [root, fourth, fifth] = [
    notesArray[rootIdx],
    notesArray[fourthIdx],
    notesArray[fifthIdx],
  ]

  // Palette inspired by Mapuche colors
  const colors = {
    bg: '#1b1e22',
    ring: '#2a2f35',
    mapuGreen: '#2f9e68',
    mapuBlue: '#2b86d3',
    mapuRed: '#d63a3a',
    mapuYellow: '#ffcc33',
    ivory: '#fff7e6',
  }

  const rOuter = topRadius * 0.84
  const rMid = topRadius * 0.60
  // rInner ya no es necesario directamente aquí (se conserva cálculo en máscaras locales)

  // Amplitud del wedge (cubre aprox. IV..III alrededor del tope)
  const wedgeWidth = 120

  // Helper to set rotation from a desired root index (0..11)
  const setKeyByIndex = useCallback((idx: number) => {
    const steps = ((-idx % 12) + 12) % 12
    setRotation((steps * STEP_DEG) % 360)
  }, [])

  function ringSectorPath(
    cx: number,
    cy: number,
    rOuter: number,
    rInner: number,
    centerDeg: number,
    widthDeg: number,
  ) {
    const a0 = centerDeg - widthDeg / 2
    const a1 = centerDeg + widthDeg / 2
    const pOuter0 = polarToCartesian(cx, cy, rOuter, a0)
    const pOuter1 = polarToCartesian(cx, cy, rOuter, a1)
    const pInner1 = polarToCartesian(cx, cy, rInner, a1)
    const pInner0 = polarToCartesian(cx, cy, rInner, a0)
    const laf = widthDeg > 180 ? 1 : 0
    return [
      `M ${pOuter0.x} ${pOuter0.y}`,
      `A ${rOuter} ${rOuter} 0 ${laf} 1 ${pOuter1.x} ${pOuter1.y}`,
      `L ${pInner1.x} ${pInner1.y}`,
      `A ${rInner} ${rInner} 0 ${laf} 0 ${pInner0.x} ${pInner0.y}`,
      'Z',
    ].join(' ')
  }

  return (
    <div className="wheel-wrap">
      <div className="ui-layout">
        <aside className="summary">
          <h3>Tonalidad: {toTitle(notesArray[rootIdx], notation)} mayor</h3>
          <ul>
            {getMajorScale(notesArray[rootIdx]).map((n, i) => (
              <li key={i}><span className="deg">{['I','II','III','IV','V','VI','VII'][i]}</span><span className="note">{toTitle(n, notation)}</span></li>
            ))}
          </ul>
        </aside>

        <div className="wheel-col">
        <svg
          ref={svgRef}
          width={size.width}
          height={svgHeight}
          viewBox={`0 0 ${size.width} ${svgHeight}`}
          className="wheel-svg noselect"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
        <defs>
          <radialGradient id="gradTop" cx="50%" cy="50%" r="72%">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="55%" stopColor="#f1eddc" />
            <stop offset="100%" stopColor="#e6e1cc" />
          </radialGradient>
          <pattern id="mapuPattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#efe9d6" />
            <path d="M0 8 L8 0 L16 8 L8 16 Z" fill={colors.mapuGreen} opacity="0.18" />
            <path d="M8 0 L16 8 L8 16 L0 8 Z" fill={colors.mapuBlue} opacity="0.15" />
            <circle cx="8" cy="8" r="1.6" fill={colors.mapuYellow} opacity="0.7" />
          </pattern>

          {/* Máscara que recorta ventanas dentro del trozo de pizza */}
          <mask id="wedgeCut" maskUnits="userSpaceOnUse">
            {/* Solo el wedge en blanco (visible) */}
            <path d={ringSectorPath(cx, cyTop, topRadius * 0.98, topRadius * 0.37, 0, wedgeWidth)} fill="white" />
            {/* Ventanas en negro (agujeros) para I–VII a lo largo del eje central */}
            {(() => {
              // Definir dónde están las notas reales en los anillos para cada grado (sectores de la rueda)
              const degs = [
                { idx: rootIdx,           ring: 'outer' }, // I -> mayor raíz
                { idx: (rootIdx + 11)%12, ring: 'mid'   }, // ii -> rel menor de IV (Rem)
                { idx: (rootIdx + 1)%12,  ring: 'mid'   }, // iii -> rel menor de V (Mim)
                { idx: (rootIdx + 11)%12, ring: 'outer' }, // IV -> mayor de IV (Fa)
                { idx: (rootIdx + 1)%12,  ring: 'outer' }, // V -> mayor de V (Sol)
                { idx: rootIdx,           ring: 'mid'   }, // vi -> rel menor de I (Lam)
                { idx: (rootIdx + 2)%12,  ring: 'mid'   }, // vii° -> rel menor de II (Sim)
              ] as const
              const holeSizeFor = (ring: 'outer'|'mid') => ring==='outer' ? { w: 100, h: 38, rx: 12 } : { w: 86, h: 32, rx: 10 }
              const radiusFor = (ring: 'outer'|'mid') => ring==='outer' ? rOuter : rMid
              return (
                <>
                  {degs.map((d, i) => {
                    const angle = d.idx * STEP_DEG + rotation
                    const r = radiusFor(d.ring)
                    const p = polarToCartesian(cx, cyTop, r, angle)
                    const { w, h, rx } = holeSizeFor(d.ring)
                    return <rect key={`hole-${i}`} x={p.x - w/2} y={p.y - h/2} rx={rx} ry={rx} width={w} height={h} fill="black" />
                  })}
                </>
              )
            })()}
          </mask>

          {/* ClipPath con solo los agujeros, para que las notas no floten fuera del wedge */}
          <clipPath id="holesOnly" clipPathUnits="userSpaceOnUse">
            {(() => {
              const degs = [
                { idx: rootIdx,           ring: 'outer' },
                { idx: (rootIdx + 11)%12, ring: 'mid'   },
                { idx: (rootIdx + 1)%12,  ring: 'mid'   },
                { idx: (rootIdx + 11)%12, ring: 'outer' },
                { idx: (rootIdx + 1)%12,  ring: 'outer' },
                { idx: rootIdx,           ring: 'mid'   },
                { idx: (rootIdx + 2)%12,  ring: 'mid'   },
              ] as const
              const holeSizeFor = (ring: 'outer'|'mid') => ring==='outer' ? { w: 100, h: 38, rx: 12 } : { w: 86, h: 32, rx: 10 }
              const radiusFor = (ring: 'outer'|'mid') => ring==='outer' ? rOuter : rMid
              return (
                <>
                  {degs.map((d, i) => {
                    const angle = d.idx * STEP_DEG + rotation
                    const r = radiusFor(d.ring)
                    const p = polarToCartesian(cx, cyTop, r, angle)
                    const { w, h, rx } = holeSizeFor(d.ring)
                    return <rect key={`clip-hole-${i}`} x={p.x - w/2} y={p.y - h/2} rx={rx} ry={rx} width={w} height={h} />
                  })}
                </>
              )
            })()}
          </clipPath>

          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Top wheel: geometry rotates, labels permanecen verticales */}
        <g id="topWheelGeom" filter="url(#shadow)" transform={`rotate(${rotation} ${cx} ${cyTop})`}>
          <circle cx={cx} cy={cyTop} r={topRadius} fill="url(#gradTop)" stroke={colors.mapuBlue} strokeWidth={outerStroke} />
          <circle cx={cx} cy={cyTop} r={topRadius} fill="url(#mapuPattern)" opacity="0.16" />
          <circle cx={cx} cy={cyTop} r={topRadius * 0.86} fill="none" stroke={colors.mapuYellow} strokeWidth={outerStroke * 0.6} />
          {notesArray.map((_, i) => {
            const p1 = polarToCartesian(cx, cyTop, topRadius * 0.9, i * STEP_DEG)
            const p2 = polarToCartesian(cx, cyTop, topRadius * 0.2, i * STEP_DEG)
            return (
              <line key={`spoke-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors.ring} strokeWidth={outerStroke * 0.6} />
            )
          })}

          {/* Quitamos texto adicional bajo los hoyos: ahora los hoyos muestran las etiquetas reales de la rueda de atrás */}
        </g>

    {/* Upright labels positioned with rotation offset; show enharmonic display for outer ring.
        Only two visible rings now (outer I, middle IV). */}
        {notesArray.map((_, i) => {
          const angle = i * STEP_DEG + rotation
          const pRoot = polarToCartesian(cx, cyTop, rOuter, angle)
          const pFourth = polarToCartesian(cx, cyTop, rMid, angle)
          // Middle ring now shows the relative minor as in the reference image
          const nFourth = relMinorArray[i]
          return (
            <g key={`labels-${i}`} className="note-labels">
              <text x={pRoot.x} y={pRoot.y} textAnchor="middle" dominantBaseline="middle" className="note-root">{notesEnharmArray[i]}</text>
              <text x={pFourth.x} y={pFourth.y} textAnchor="middle" dominantBaseline="middle" className="note-sub">{nFourth}</text>
            </g>
          )
        })}


        {/* Trozo de pizza (puntero) con ventanas: fijo al frente */}
        <g>
          <path d={ringSectorPath(cx, cyTop, topRadius * 0.98, topRadius * 0.37, 0, wedgeWidth)} fill={colors.ivory} stroke={colors.bg} strokeWidth={1.5} mask="url(#wedgeCut)" />
        </g>

        {/* Roman numerals for each hole (I–VII), stacked from outer to inner */}
        {(() => {
          const romanInfo = [
            { idx: rootIdx,           ring: 'outer', label: 'I'   },
            { idx: (rootIdx + 11)%12, ring: 'mid',   label: 'ii'  },
            { idx: (rootIdx + 1)%12,  ring: 'mid',   label: 'iii' },
            { idx: (rootIdx + 11)%12, ring: 'outer', label: 'IV'  },
            { idx: (rootIdx + 1)%12,  ring: 'outer', label: 'V'   },
            { idx: rootIdx,           ring: 'mid',   label: 'vi'  },
            { idx: (rootIdx + 2)%12,  ring: 'mid',   label: 'vii°'},
          ] as const
          const holeSizeFor = (ring: 'outer'|'mid') => ring==='outer' ? { w: 100, h: 38 } : { w: 86, h: 32 }
          const radiusFor = (ring: 'outer'|'mid') => ring==='outer' ? rOuter : rMid
          return (
            <g className="roman-by-window">
              {romanInfo.map((d, i) => {
                const angle = d.idx * STEP_DEG + rotation
                const { h } = holeSizeFor(d.ring)
                const r = radiusFor(d.ring)
                const p = polarToCartesian(cx, cyTop, r, angle)
                const y = p.y - (h/2 + 8)
                return <text key={`rm-${i}`} x={p.x} y={y} textAnchor="middle">{d.label}</text>
              })}
            </g>
          )
        })()}

        {/* Title kept for accessibility only */}
        <title>{`Tónica: ${root} · Subdominante: ${fourth} · Dominante: ${fifth}`}</title>
        </svg>

        {/* Controles para navegar entre notas, pegados a la rueda */}
        <div className="controls">
          <label className="picker">
            <span>Nota:</span>
            <select value={rootIdx} onChange={(e) => setKeyByIndex(parseInt(e.target.value, 10))}>
              {notesArray.map((n, idx) => (
                <option key={n} value={idx}>{n}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              const s = Math.round(rotation / STEP_DEG) - 1
              const next = ((s * STEP_DEG) % 360 + 360) % 360
              setRotation(next)
            }}
            aria-label="Anterior"
          >
            ◄
          </button>
          <div className="current-key">I: {root}</div>
          <button
            onClick={() => {
              const s = Math.round(rotation / STEP_DEG) + 1
              const next = ((s * STEP_DEG) % 360 + 360) % 360
              setRotation(next)
            }}
            aria-label="Siguiente"
          >
            ►
          </button>
          <button
            className="reset"
            onClick={() => setRotation(0)}
            aria-label="Reset a DO"
          >
            Reset
          </button>
        </div>

        {/* Notation toggle */}
        <NotationToggle notation={notation} onChange={setNotation} />

        {/* Tabla dinámica de acordes en la tonalidad actual (como en la imagen) */}
        <div className="chord-table-wrap">
          <table className="chord-table" aria-label="Acordes en mayor">
            <thead>
              <tr>
                {['I','ii','iii','IV','V','vi','vii°'].map((d) => (<th key={d}>{d}</th>))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {(() => {
                  const chords = notation === 'spanish' 
                    ? getMajorKeyChordsSpanish(notesArray[rootIdx])
                    : getMajorKeyChordsEnglish(notesArray[rootIdx], rootIdx>=6)
                  return chords.map((c, i) => (
                    <td key={i}>{c}</td>
                  ))
                })()}
              </tr>
            </tbody>
          </table>
        </div>
        </div>{/* /.wheel-col */}

      </div>
    </div>
  )
}
