import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { shortMoney } from '../lib/utils'
import type { GeoPoint, Listing } from '../types'

export default function MapView({
  listings, userPoint, selectedId, onSelect, height = 460,
}: {
  listings: Listing[]
  userPoint?: GeoPoint | null
  selectedId?: string | null
  onSelect?: (id: string) => void
  height?: number
}) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const markers = useRef<Record<string, L.Marker>>({})

  useEffect(() => {
    if (!el.current || map.current) return
    map.current = L.map(el.current, { zoomControl: false, scrollWheelZoom: false }).setView(
      userPoint ? [userPoint.lat, userPoint.lng] : [6.42, 2.32], userPoint ? 11 : 8,
    )
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap', maxZoom: 19,
    }).addTo(map.current)
    L.control.zoom({ position: 'bottomright' }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    setTimeout(() => map.current?.invalidateSize(), 120)
    return () => { map.current?.remove(); map.current = null }
  }, [])

  useEffect(() => {
    if (!layer.current || !map.current) return
    layer.current.clearLayers()
    markers.current = {}
    listings.forEach((l) => {
      const active = l.id === selectedId
      const icon = L.divIcon({
        className: 'kado-pin-wrap',
        html: `<div class="kado-pin ${active ? 'active' : ''}"><span>${l.sale ? '◆' : '⌂'}</span></div>`,
        iconSize: [36, 44], iconAnchor: [18, 40],
      })
      const m = L.marker([l.lat, l.lng], { icon }).addTo(layer.current!)
      m.bindPopup(`
        <div class="map-popup">
          <img src="${l.images[0]}" alt="" />
          <div>
            <small>${l.city} · ${l.type}</small>
            <strong>${l.title}</strong>
            <b>${shortMoney(l.price)}${l.sale ? '' : ' / mois'}</b>
            <a href="/annonce/${l.id}">Voir l'annonce →</a>
          </div>
        </div>`)
      m.on('click', () => onSelect?.(l.id))
      markers.current[l.id] = m
    })
    if (listings.length && !selectedId) {
      map.current.fitBounds(L.latLngBounds(listings.map((l) => [l.lat, l.lng] as [number, number])), { padding: [50, 50], maxZoom: 12 })
    }
  }, [listings, selectedId, onSelect])

  useEffect(() => {
    if (!map.current || !userPoint) return
    L.circleMarker([userPoint.lat, userPoint.lng], {
      radius: 9, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1,
    }).addTo(map.current)
    L.circle([userPoint.lat, userPoint.lng], {
      radius: 5000, color: '#2563eb', weight: 1, fillColor: '#2563eb', fillOpacity: 0.07, dashArray: '5 6',
    }).addTo(map.current)
  }, [userPoint])

  useEffect(() => {
    if (!map.current || !selectedId || !markers.current[selectedId]) return
    const l = listings.find((x) => x.id === selectedId)
    if (l) map.current.flyTo([l.lat, l.lng], 13, { duration: 0.7 })
  }, [selectedId, listings])

  return <div className="map-container" ref={el} style={{ height }} />
}
