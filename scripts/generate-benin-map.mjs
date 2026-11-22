/**
 * Génère les SVG du Bénin à partir du vrai contour du pays (ISO 3166-1 : 204).
 *
 * Source : world-atlas/countries-50m.json (Natural Earth, domaine public).
 * Projection : d3-geo geoMercator + fitSize, puis léger décalage pour laisser
 * de la place aux étiquettes des villes.
 *
 * Sorties :
 *   public/benin-map.svg       → carte avec les 5 villes épinglées
 *   public/benin-map-plain.svg → contour seul (showCities={false})
 *   public/logo.svg            → logo dérivé du même contour
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { feature } from 'topojson-client'
import { geoMercator, geoPath } from 'd3-geo'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const topo = JSON.parse(readFileSync(resolve(ROOT, 'node_modules/world-atlas/countries-50m.json'), 'utf8'))
const countries = feature(topo, topo.objects.countries)
const benin = countries.features.find((item) => Number(item.id) === 204)
if (!benin) throw new Error('Pays 204 (Bénin) introuvable dans world-atlas')

/** Coordonnées réelles des villes demandées, avec placement des étiquettes. */
const CITIES = [
  { name: 'Cotonou', lng: 2.3912, lat: 6.3703, dx: -18, dy: 16, anchor: 'end' },
  { name: 'Abomey-Calavi', lng: 2.3565, lat: 6.4425, dx: -18, dy: -12, anchor: 'end' },
  { name: 'Porto-Novo', lng: 2.6038, lat: 6.4969, dx: 18, dy: -10, anchor: 'start' },
  { name: 'Parakou', lng: 2.7541, lat: 9.3406, dx: 18, dy: 5, anchor: 'start' },
  { name: 'Natitingou', lng: 1.3667, lat: 10.2667, dx: -18, dy: 5, anchor: 'end' },
]

/** Épingle : la pointe est exactement sur la coordonnée de la ville. */
const PIN_PATH = 'M0 0 C-5 -7 -8 -11 -8 -15 A8 8 0 1 1 8 -15 C8 -11 5 -7 0 0 Z'

const round = (value) => Number(value).toFixed(1)
const clean = (path) => path.replace(/-?\d+(?:\.\d+)?/g, (value) => round(Number(value)))

function makeProjection(width, height, padX, padY) {
  const projection = geoMercator().fitSize([width - 2 * padX, height - 2 * padY], benin)
  const [tx, ty] = projection.translate()
  projection.translate([tx + padX, ty + padY])
  return projection
}

function flagGradient(x0, x1, id = 'benin-flag') {
  return `<linearGradient id="${id}" x1="${round(x0)}" y1="0" x2="${round(x1)}" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0f9d58" />
      <stop offset="32%" stop-color="#0f9d58" />
      <stop offset="34%" stop-color="#f7c948" />
      <stop offset="65%" stop-color="#f7c948" />
      <stop offset="67%" stop-color="#d8402f" />
      <stop offset="100%" stop-color="#d8402f" />
    </linearGradient>`
}

function mapSvg(withCities) {
  const W = 300
  const H = 460
  const projection = makeProjection(W, H, 40, 24)
  const path = geoPath(projection)
  const d = clean(path(benin))
  const [[x0], [x1]] = path.bounds(benin)

  // Animation des points de géolocalisation : uniquement opacity + transform (scale).
  const pulseStyle = withCities
    ? `    <style>
      .pin-pulse { transform-box: fill-box; transform-origin: center; animation: pin-pulse 2.8s ease-out infinite; }
      @keyframes pin-pulse {
        0% { opacity: .7; transform: scale(.45); }
        70%, 100% { opacity: 0; transform: scale(2.4); }
      }
      @media (prefers-reduced-motion: reduce) { .pin-pulse { animation: none; opacity: 0; } }
    </style>`
    : ''

  const pins = withCities
    ? CITIES.map((city) => {
      const [x, y] = projection([city.lng, city.lat])
      return `      <g transform="translate(${round(x)} ${round(y)})">
        <circle class="pin-pulse" cx="0" cy="-15" r="8" fill="#fff" />
        <line x1="0" y1="0" x2="${city.dx}" y2="${city.dy}" stroke="#072e28" stroke-opacity=".55" stroke-width="1" />
        <path d="${PIN_PATH}" fill="#073b34" stroke="#fff" stroke-width="1.6" stroke-linejoin="round" />
        <circle cx="0" cy="-15" r="3.1" fill="#fff" />
        <text x="${city.dx}" y="${city.dy}" dy=".32em" text-anchor="${city.anchor}" fill="#072e28" stroke="#fff" stroke-opacity=".92" stroke-width="2.6" paint-order="stroke" font-family="Arial, sans-serif" font-size="9" font-weight="700">${city.name}</text>
      </g>`
    }).join('\n')
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="benin-map-title benin-map-desc">
  <title id="benin-map-title">Carte du Bénin</title>
  <desc id="benin-map-desc">Contour réel du Bénin aux couleurs verte, jaune et rouge${withCities ? ', avec Cotonou, Abomey-Calavi, Porto-Novo, Parakou et Natitingou' : ''}.</desc>
  <defs>
    ${flagGradient(x0, x1)}
    <linearGradient id="benin-shine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity=".26" />
      <stop offset="55%" stop-color="#fff" stop-opacity="0" />
      <stop offset="100%" stop-color="#000" stop-opacity=".14" />
    </linearGradient>
${pulseStyle}
  </defs>

  <path d="${d}" fill="url(#benin-flag)" />
  <path d="${d}" fill="url(#benin-shine)" />
  <path d="${d}" fill="none" stroke="#072e28" stroke-opacity=".5" stroke-width="2" stroke-linejoin="round" />
${pins}
</svg>
`
}

function logoSvg() {
  const S = 64
  const projection = makeProjection(S, S, 10, 6)
  const path = geoPath(projection)
  const d = clean(path(benin))
  const [[x0], [x1]] = path.bounds(benin)

  const pins = CITIES.map((city) => {
    const [x, y] = projection([city.lng, city.lat])
    return `      <g transform="translate(${round(x)} ${round(y)}) scale(.4)">
        <path d="${PIN_PATH}" fill="#fff" stroke="#073b34" stroke-width="2.4" stroke-linejoin="round" />
        <circle cx="0" cy="-15" r="3.4" fill="#d8402f" />
      </g>`
  }).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="alloca-logo-title">
  <title id="alloca-logo-title">ALLOCA BENIN</title>
  <defs>
    ${flagGradient(x0, x1)}
  </defs>
  <rect width="64" height="64" rx="15" fill="#073b34" />
  <path d="${d}" fill="url(#benin-flag)" stroke="#fff" stroke-opacity=".85" stroke-width="1.1" stroke-linejoin="round" />
${pins}
</svg>
`
}

const outputs = [
  ['public/benin-map.svg', mapSvg(true)],
  ['public/benin-map-plain.svg', mapSvg(false)],
  ['public/logo.svg', logoSvg()],
]

for (const [relativePath, content] of outputs) {
  writeFileSync(resolve(ROOT, relativePath), content, 'utf8')
  console.log(`✓ ${relativePath}`)
}
