import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Building2, Check, Crosshair, FileSignature, MapPin, ShieldCheck, Sparkles,
} from 'lucide-react'
import BeninMap from '../components/BeninMap'
import PropertyCard from '../components/PropertyCard'
import { cityOptions } from '../lib/data'
import { GUARANTEE_MONTHS, SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { useStore } from '../lib/store'

export default function Lands() {
  const { sortedListings, geoPoint, geoStatus, requestLocation } = useStore()
  const [city, setCity] = useState('')

  const lands = sortedListings.filter((l) =>
    l.type === 'Terrain' && l.sale && l.status === 'approved' && (!city || l.city === city),
  )

  return (
    <div className="page lands-page">
      <section className="lands-hero">
        <div className="container lands-hero-grid">
          <div>
            <span className="section-kicker"><Building2 size={14} /> Terrains à acheter</span>
            <h1>Investissez dans un terrain,<br /><em>partout au Bénin.</em></h1>
            <p>{SITE_TAGLINE}. Parcelles viabilisées, titres fonciers et emplacements en expansion, présentés du plus proche au plus éloigné de votre position.</p>
            <div className="lands-hero-actions">
              <Link to="/publier" className="btn btn-primary btn-lg">Vendre mon terrain <ArrowRight size={17} /></Link>
              <Link to="/annonces?sale=1&type=Terrain" className="btn btn-outline btn-lg">Voir sous forme de liste</Link>
            </div>
            <ul className="check-list compact">
              <li><Check size={15} /> Garantie : avance de {GUARANTEE_MONTHS} mois affichée sur chaque annonce</li>
              <li><Check size={15} /> Tri par distance automatique après géolocalisation</li>
              <li><Check size={15} /> Sans position : tous les terrains restent visibles</li>
            </ul>
          </div>
          <div className="lands-map-card">
            <span className="map-card-label"><span className="flag-dots"><i /><i /><i /></span> {SITE_NAME}</span>
            <BeninMap className="lands-benin-map" />
            <button className="btn btn-accent btn-sm lands-locate" onClick={requestLocation} disabled={geoStatus === 'locating'}>
              <Crosshair size={15} /> {geoPoint ? 'Position activée · actualiser' : 'Me géolocaliser'}
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="terrains-disponibles">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker"><Sparkles size={14} /> Sélection foncière</span>
              <h2>Terrains disponibles</h2>
              <p>{geoPoint
                ? 'Classés du plus proche au plus éloigné de votre position.'
                : 'Classés par date de publication. Activez la géolocalisation pour un tri par distance.'}
              </p>
            </div>
            <label className="lands-city-select">
              <MapPin size={15} />
              <select value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">Toutes les villes</option>
                {cityOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>

          {geoStatus === 'denied' && (
            <div className="explore-geo-notice lands-notice">
              <ShieldCheck size={16} />
              <span>Position désactivée : tous les terrains sont affichés. Activez la géolocalisation pour les trier de la plus proche à la plus éloignée.</span>
              <button className="text-link" onClick={requestLocation}>Activer ma position</button>
            </div>
          )}

          {lands.length > 0 ? (
            <div className="property-grid">
              {lands.map((l) => <PropertyCard key={l.id} listing={l} userPoint={geoPoint} />)}
            </div>
          ) : (
            <div className="empty-state">
              <span><Building2 size={30} /></span>
              <h3>Aucun terrain dans cette ville pour le moment</h3>
              <p>Essayez une autre ville ou publiez votre propre terrain.</p>
              <Link to="/publier" className="btn btn-primary">Publier un terrain</Link>
            </div>
          )}
        </div>
      </section>

      <section className="section section-tint">
        <div className="container owner-benefits">
          {[
            { icon: ShieldCheck, title: 'Papiers vérifiés', text: 'Titres fonciers et documents contrôlés avant mise en ligne.' },
            { icon: Crosshair, title: 'Emplacement clair', text: 'Coordonnées GPS et ville renseignées pour chaque parcelle.' },
            { icon: FileSignature, title: 'Garantie 3 mois', text: `Une avance de ${GUARANTEE_MONTHS} mois est affichée sur chaque annonce.` },
            { icon: ArrowRight, title: 'Accompagnement', text: "L'équipe ALLOCA BENIN vous suit jusqu'à la finalisation." },
          ].map((b) => <div key={b.title}><span><b.icon size={22} /></span><h3>{b.title}</h3><p>{b.text}</p></div>)}
        </div>
      </section>
    </div>
  )
}
