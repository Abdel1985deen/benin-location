import { CITIES } from './data'
import type { GeoPoint } from '../types'

export const uid = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`

export const money = (value: number) =>
  new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'

export const shortMoney = (value: number) =>
  value >= 1_000_000
    ? (value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1).replace('.', ',') + ' M FCFA'
    : new Intl.NumberFormat('fr-FR').format(value) + ' FCFA'

export const dateFR = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value))

export const todayISO = () => new Date().toISOString().slice(0, 10)

export function distanceKm(a: GeoPoint, b: GeoPoint) {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function nearestCity(point: GeoPoint) {
  return CITIES.map((city) => ({ city, km: distanceKm(point, city) })).sort((a, b) => a.km - b.km)[0]
}

export const cityOptions = CITIES.map((c) => c.name)

export function getPosition(): Promise<GeoPoint | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  })
}
