import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowUpDown, Building2, Crosshair, Grid2X2, Map as MapIcon, MapPin,
  RotateCcw, SlidersHorizontal, X,
} from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import MapView from '../components/MapView'
import { cityOptions } from '../lib/data'
import { useStore } from '../lib/store'
import { distanceKm, getPosition, shortMoney } from '../lib/utils'
import type { GeoPoint, PropertyType } from '../types'

const types: PropertyType[] = ['Appartement', 'Maison', 'Studio', 'Villa', 'Terrain']

export default function Explore() {
  const { listings } = useStore()
  const [params, setParams] = useSearchParams()
  const [point, setPoint] = useState<GeoPoint | null>(() => {
    try { return JSON.parse(sessionStorage.getItem('kado-point') || 'null') } catch { return null }
  })
  const [radius, setRadius] = useState(10)
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [sort, setSort] = useState('recent')
  const [mobileFilters, setMobileFilters] = useState(false)
  const [locating, setLocating] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const city = params.get('city') ?? ''
  const type = params.get('type') ?? ''
  const max = params.get('max') ?? ''
  const sale = params.get('sale') === '1'
  const showMap = params.get('map') === '1'

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value); else next.delete(key)
    setParams(next, { replace: true })
  }

  useEffect(() => {
    if (params.get('near') === '1') {
      getPosition().then((p) => { if (p) { setPoint(p); sessionStorage.setItem('kado-point', JSON.stringify(p)) } })
    }
  }, [])

  const locate = async () => {
    setLocating(true)
    const p = await getPosition()
    setLocating(false)
    if (p) { setPoint(p); sessionStorage.setItem('kado-point', JSON.stringify(p)); setParam('near', '1') }
  }

  const filtered = useMemo(() => {
    const list = listings.filter((l) => {
      if (l.status !== 'approved' && l.status !== 'reserved') return false
      if (sale !== l.sale) return false
      if (city && l.city !== city) return false
      if (type && l.type !== type) return false
      if (max && l.price > Number(max)) return false
      if (query && !`${l.title} ${l.city} ${l.neighborhood}`.toLowerCase().includes(query.toLowerCase())) return false
      if (point && distanceKm(point, l) > radius) return false
      return true
    })
    if (point && sort === 'distance') list.sort((a, b) => distanceKm(point, a) - distanceKm(point, b))
    else if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt))
    return list
  }, [listings, sale, city, type, max, query, point, radius, sort])

  const reset = () => {
    setParams(new URLSearchParams(), { replace: true })
    setQuery(''); setPoint(null); setRadius(10); sessionStorage.removeItem('kado-point')
  }

  const activeFilters = [city, type, max].filter(Boolean).length + (point ? 1 : 0)

  return (
    <div className="page explore-page">
      <div className="explore-head">
        <div className="container">
          <div className="breadcrumb">Accueil <span>/</span> Annonces</div>
          <h1>{sale ? 'Biens à vendre' : 'Biens à louer'} <span>au Bénin</span></h1>
          <p>Trouvez le bien qui vous correspond, près de chez vous.</p>
        </div>
      </div>

      <div className="container explore-layout">
        <aside className={`filters ${mobileFilters ? 'open' : ''}`}>
          <div className="filters-title"><span><SlidersHorizontal size={18} /> Filtres</span><button onClick={reset}><RotateCcw size={14} /> Réinitialiser</button></div>

          <div className="filter-group">
            <label>Recherche</label>
            <div className="filter-search"><MapPin size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Quartier, ville, mot-clé…" /></div>
          </div>

          <div className="filter-group">
            <label>Type de transaction</label>
            <div className="segmented">
              <button className={!sale ? 'active' : ''} onClick={() => setParam('sale', '')}>Louer</button>
              <button className={sale ? 'active' : ''} onClick={() => setParam('sale', '1')}>Acheter</button>
            </div>
          </div>

          <div className="filter-group">
            <label>Ville</label>
            <select value={city} onChange={(e) => setParam('city', e.target.value)}>
              <option value="">Toutes les villes</option>
              {cityOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Type de bien</label>
            <div className="chip-group">
              {types.map((t) => (
                <button key={t} className={type === t ? 'active' : ''} onClick={() => setParam('type', type === t ? '' : t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Budget maximum</label>
            <select value={max} onChange={(e) => setParam('max', e.target.value)}>
              <option value="">Sans limite</option>
              {[75000, 100000, 150000, 200000, 400000, 1000000, 5000000, 15000000].map((v) => (
                <option key={v} value={v}>{shortMoney(v)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group geo-filter">
            <label><Crosshair size={15} /> Autour de moi</label>
            {point ? (
              <>
                <div className="geo-active"><span className="pulse" /> Position détectée</div>
                <input type="range" min="1" max="50" value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
                <div className="range-label">Rayon : <strong>{radius} km</strong></div>
                <button className="text-danger" onClick={() => { setPoint(null); setParam('near', ''); sessionStorage.removeItem('kado-point') }}><X size={14} /> Désactiver</button>
              </>
            ) : (
              <button className="btn btn-outline btn-block btn-sm" onClick={locate} disabled={locating}>
                <Crosshair size={15} /> {locating ? 'Localisation…' : 'Me gélocaliser'}
              </button>
            )}
          </div>

          <button className="btn btn-primary btn-block mobile-only" onClick={() => setMobileFilters(false)}>Voir {filtered.length} biens</button>
        </aside>

        <div className="explore-results">
          <div className="results-toolbar">
            <div className="results-count">
              <strong>{filtered.length}</strong> bien{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
              {point && <span className="near-label"><Crosshair size={13} /> près de vous</span>}
            </div>
            <div className="toolbar-right">
              <button className="btn btn-outline btn-sm mobile-only" onClick={() => setMobileFilters(true)}><SlidersHorizontal size={15} /> Filtres {activeFilters > 0 && <b>{activeFilters}</b>}</button>
              <label className="sort-select"><ArrowUpDown size={15} />
                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="recent">Plus récents</option>
                  <option value="distance">Distance</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </label>
              <div className="view-toggle">
                <button className={!showMap ? 'active' : ''} onClick={() => setParam('map', '')} title="Grille"><Grid2X2 size={17} /></button>
                <button className={showMap ? 'active' : ''} onClick={() => setParam('map', '1')} title="Carte"><MapIcon size={17} /></button>
              </div>
            </div>
          </div>

          {activeFilters > 0 && (
            <div className="active-chips">
              {city && <button onClick={() => setParam('city', '')}>{city} <X size={12} /></button>}
              {type && <button onClick={() => setParam('type', '')}>{type} <X size={12} /></button>}
              {max && <button onClick={() => setParam('max', '')}>{shortMoney(Number(max))} <X size={12} /></button>}
              {point && <button onClick={() => { setPoint(null); sessionStorage.removeItem('kado-point') }}>Autour de moi <X size={12} /></button>}
              <button className="clear-all" onClick={reset}>Tout effacer</button>
            </div>
          )}

          {showMap ? (
            <div className="map-split">
              <div className="map-list">
                {filtered.map((l) => (
                  <div key={l.id} className={selected === l.id ? 'selected' : ''} onMouseEnter={() => setSelected(l.id)}>
                    <PropertyCard listing={l} userPoint={point} compact />
                  </div>
                ))}
                {filtered.length === 0 && <Empty onReset={reset} />}
              </div>
              <div className="map-sticky"><MapView listings={filtered} userPoint={point} selectedId={selected} onSelect={setSelected} height={640} /></div>
            </div>
          ) : (
            <>
              {filtered.length > 0 ? (
                <div className="property-grid explore-grid">
                  {filtered.map((l) => <PropertyCard key={l.id} listing={l} userPoint={point} />)}
                </div>
              ) : <Empty onReset={reset} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Empty({ onReset }: { onReset: () => void }) {
  return (
    <div className="empty-state">
      <span><Building2 size={30} /></span>
      <h3>Aucun bien ne correspond à votre recherche</h3>
      <p>Essayez d'élargir votre rayon, de changer de ville ou de retirer un filtre.</p>
      <button className="btn btn-primary" onClick={onReset}>Réinitialiser les filtres</button>
    </div>
  )
}
