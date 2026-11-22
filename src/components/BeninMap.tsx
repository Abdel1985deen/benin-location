import { useId } from 'react'
import { CITIES } from '../lib/data'

/**
 * Carte stylisée du Bénin aux couleurs du drapeau (vert / jaune / rouge).
 * Le tracé est volontairement simplifié : il s'agit d'une illustration,
 * pas d'un fond de carte administratif précis.
 */

type LngLat = [number, number]

const BOUNDS = { minLng: 0.6, maxLng: 3.65, minLat: 6.0, maxLat: 12.5 }
const W = 260
const H = 420

const project = ([lng, lat]: LngLat): [number, number] => [
  ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W,
  ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H,
]

// Pourtour approximatif du Bénin, de l'extrême nord-ouest vers la côte, puis retour par l'ouest.
const OUTLINE: LngLat[] = [
  [1.20, 12.25], [1.75, 12.40], [2.20, 12.36], [2.60, 12.10],
  [3.05, 12.05], [3.15, 11.55], [2.85, 11.20], [2.75, 10.70],
  [2.95, 10.25], [2.80, 9.75], [2.70, 9.35], [2.85, 8.95],
  [2.65, 8.55], [2.45, 8.25], [2.35, 7.95], [2.65, 7.70],
  [2.85, 7.35], [2.75, 7.00], [2.95, 6.65], [2.80, 6.25],
  [2.45, 6.10], [2.15, 6.10], [1.85, 6.25], [1.65, 6.55],
  [1.45, 6.85], [1.25, 7.10], [1.05, 7.35], [0.95, 7.75],
  [1.15, 8.10], [1.00, 8.45], [0.80, 8.75], [0.75, 9.15],
  [0.95, 9.55], [0.85, 9.95], [1.05, 10.35], [1.15, 10.75],
  [1.05, 11.15], [1.25, 11.55], [1.10, 11.95],
]

const shapePath = OUTLINE.map((p, i) => {
  const [x, y] = project(p)
  return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
}).join(' ') + ' Z'

const PINNED = ['Cotonou', 'Parakou', 'Natitingou']

export default function BeninMap({
  className = '',
  showCities = true,
}: { className?: string; showCities?: boolean }) {
  const rawId = useId()
  const clipId = `benin-shape-${rawId.replace(/:/g, '')}`
  const shineId = `benin-shine-${rawId.replace(/:/g, '')}`

  return (
    <svg
      className={`benin-map ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Carte illustrée du Bénin aux couleurs verte, jaune et rouge, avec les principales villes"
    >
      <defs>
        <clipPath id={clipId}><path d={shapePath} /></clipPath>
        <linearGradient id={shineId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".26" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity=".14" />
        </linearGradient>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width={W / 3} height={H} fill="#0f9d58" />
        <rect x={W / 3} y="0" width={W / 3} height={H} fill="#f7c948" />
        <rect x={(2 * W) / 3} y="0" width={W / 3} height={H} fill="#d8402f" />
        <rect x="0" y="0" width={W} height={H} fill={`url(#${shineId})`} />
      </g>

      <path d={shapePath} fill="none" stroke="#072e28" strokeOpacity=".45" strokeWidth="2.5" strokeLinejoin="round" />

      {showCities && CITIES.filter((c) => PINNED.includes(c.name)).map((city) => {
        const [x, y] = project([city.lng, city.lat])
        const left = x > W * 0.62
        return (
          <g className="benin-city" key={city.name} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
            <circle className="benin-city-halo" r="7" />
            <circle className="benin-city-dot" r="3.4" />
            <text className="benin-city-label" x={left ? -10 : 10} y="3.5" textAnchor={left ? 'end' : 'start'}>
              {city.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
