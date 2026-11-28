// Génère src/lib/beninOutline.ts : contour du Bénin + position des villes, avec UNE seule projection.
// Usage (depuis ~/benin-location) :  node scripts/generate-entry-map.mjs
import fs from 'node:fs'
import { feature } from 'topojson-client'
import { geoContains, geoMercator, geoPath } from 'd3-geo'

const LARGEUR = 460
const HAUTEUR = 420
const MARGE_X = 130 // espace laissé de chaque côté pour les noms de villes
const MARGE_Y = 12

// Villes du site (src/lib/data.ts). Pour en ajouter, complétez cette liste puis relancez le script.
const VILLES = [
  { name: 'Cotonou', lat: 6.3703, lng: 2.3912, region: 'Littoral' },
  { name: 'Abomey-Calavi', lat: 6.4425, lng: 2.3565, region: 'Atlantique' },
  { name: 'Porto-Novo', lat: 6.4969, lng: 2.6038, region: 'Ouémé' },
  { name: 'Ouidah', lat: 6.3572, lng: 2.0878, region: 'Atlantique' },
  { name: 'Bohicon', lat: 7.1967, lng: 2.0633, region: 'Zou' },
  { name: 'Abomey', lat: 7.1881, lng: 2.0169, region: 'Zou' },
  { name: 'Parakou', lat: 9.3406, lng: 2.7541, region: 'Borgou' },
  { name: 'Djougou', lat: 9.7, lng: 1.1667, region: 'Donga' },
  { name: 'Natitingou', lat: 10.2667, lng: 1.3667, region: 'Atacora' },
]

const fichier = 'node_modules/world-atlas/countries-50m.json'
if (!fs.existsSync(fichier)) {
  console.error('Fichier introuvable : ' + fichier + ' (lancez la commande depuis ~/benin-location)')
  process.exit(1)
}
const topo = JSON.parse(fs.readFileSync(fichier, 'utf8'))
const pays = feature(topo, topo.objects.countries).features.find(
  (f) => (f.properties && f.properties.name === 'Benin') || String(f.id) === '204',
)
if (!pays) {
  console.error('Le Bénin est introuvable dans ' + fichier)
  process.exit(1)
}

const projection = geoMercator().fitExtent(
  [[MARGE_X, MARGE_Y], [LARGEUR - MARGE_X, HAUTEUR - MARGE_Y]],
  pays,
)
const chemin = geoPath(projection)
if (typeof chemin.digits === 'function') chemin.digits(1)
const d = chemin(pays)
if (!d) { console.error('Impossible de dessiner le contour.'); process.exit(1) }

const villes = VILLES.map((v) => {
  const p = projection([v.lng, v.lat])
  if (!p) { console.error('Projection impossible pour ' + v.name); process.exit(1) }
  if (!geoContains(pays, [v.lng, v.lat])) {
    console.warn('Note : ' + v.name + ' est tout près du bord du contour (normal pour une ville côtière).')
  }
  return { name: v.name, region: v.region, x: Math.round(p[0] * 10) / 10, y: Math.round(p[1] * 10) / 10 }
})

const [[x0, y0], [x1, y1]] = chemin.bounds(pays)
const sortie =
  '// Fichier généré par scripts/generate-entry-map.mjs : ne pas modifier à la main.\n' +
  'export interface VilleCarte {\n  name: string\n  region: string\n  x: number\n  y: number\n}\n\n' +
  'export const BENIN_VIEWBOX = { width: ' + LARGEUR + ', height: ' + HAUTEUR + ' }\n\n' +
  'export const BENIN_PATH = ' + JSON.stringify(d) + '\n\n' +
  'export const BENIN_CITIES: VilleCarte[] = ' + JSON.stringify(villes, null, 2) + '\n'
fs.writeFileSync('src/lib/beninOutline.ts', sortie)
console.log('OK : src/lib/beninOutline.ts écrit (' + villes.length + ' villes, contour de ' +
  Math.round(x1 - x0) + ' x ' + Math.round(y1 - y0) + ').')
