import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Building2, Check, ChevronRight, Compass, FileSignature,
  HeartHandshake, MapPin, MoveRight, Navigation, PackageCheck, Play, Search,
  ShieldCheck, Sparkles, Star, Truck, UserRoundPlus,
} from 'lucide-react'
import BeninMap from '../components/BeninMap'
import PropertyCard from '../components/PropertyCard'
import { IMG, cityOptions } from '../lib/data'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { useStore } from '../lib/store'

const budgets = [
  { value: '', label: 'Tous les budgets' },
  { value: '100000', label: 'Moins de 100 000 FCFA' },
  { value: '200000', label: 'Moins de 200 000 FCFA' },
  { value: '400000', label: 'Moins de 400 000 FCFA' },
]

export default function Home() {
  const { sortedListings, geoPoint, requestLocation } = useStore()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<'rent' | 'buy'>('rent')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [budget, setBudget] = useState('')
  const [furnishedOnly, setFurnishedOnly] = useState(false)

  const featured = sortedListings.filter((l) => l.featured && l.status === 'approved').slice(0, 3)
  const lands = sortedListings.filter((l) => l.type === 'Terrain' && l.sale && l.status === 'approved').slice(0, 3)
  const people = [
    { name: 'Chantal S.', city: 'Cotonou', photo: IMG.person1 },
    { name: 'Amédée D.', city: 'Abomey-Calavi', photo: IMG.person2 },
    { name: 'Mariam A.', city: 'Porto-Novo', photo: IMG.person3 },
  ]

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (deal === 'buy') p.set('sale', '1')
    if (city) p.set('city', city)
    if (type) p.set('type', type)
    if (budget) p.set('max', budget)
    if (furnishedOnly && deal === 'rent' && type !== 'Terrain') p.set('furnished', '1')
    navigate(`/annonces?${p.toString()}`)
  }

  const nearMe = () => {
    requestLocation()
    navigate('/annonces')
  }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> {SITE_NAME} · {SITE_TAGLINE}</div>
            <h1>Le bon logement au Bénin,<br /><em>sans détour.</em></h1>
            <p className="hero-lead">
              Louez partout au Bénin facilement et rapidement via votre position : annonces vérifiées,
              visites virtuelles, contrats en ligne et accompagnement jusqu'au déménagement.
            </p>

            <form className="search-panel" onSubmit={search}>
              <div className="search-tabs">
                <button type="button" className={deal === 'rent' ? 'active' : ''} onClick={() => setDeal('rent')}>Louer</button>
                <button type="button" className={deal === 'buy' ? 'active' : ''} onClick={() => setDeal('buy')}>Acheter</button>
                <span className="search-tabs-line" />
              </div>
              <div className="search-fields">
                <label className="search-field">
                  <MapPin size={18} />
                  <span><small>Où ?</small>
                    <select value={city} onChange={(e) => setCity(e.target.value)}>
                      <option value="">Toutes les villes</option>
                      {cityOptions.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </span>
                </label>
                <label className="search-field">
                  <Building2 size={18} />
                  <span><small>Type de bien</small>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                      <option value="">Tous les biens</option>
                      {['Appartement', 'Maison', 'Studio', 'Villa', 'Terrain'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </span>
                </label>
                <label className="search-field">
                  <span className="field-icon-currency">FCFA</span>
                  <span><small>Budget max.</small>
                    <select value={budget} onChange={(e) => setBudget(e.target.value)}>
                      {budgets.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                    </select>
                  </span>
                </label>
                <button className="btn btn-primary search-submit" type="submit"><Search size={18} /> Rechercher</button>
              </div>
              <div className="search-extra">
                {deal === 'rent' && type !== 'Terrain' ? (
                  <label className="check-option">
                    <input type="checkbox" checked={furnishedOnly} onChange={(e) => setFurnishedOnly(e.target.checked)} />
                    Logement meublé uniquement
                  </label>
                ) : <span />}
                <span>Garantie : avance de 3 mois affichée sur chaque annonce</span>
              </div>
            </form>

            <div className="hero-trust">
              <button className="geo-link" onClick={nearMe}>
                <Navigation size={16} /> {geoPoint ? 'Voir les biens autour de moi' : 'Activer ma position et voir les biens'}
              </button>
              <span className="trust-divider" />
              <div className="avatar-stack photo-stack">
                {people.map((p) => <img key={p.name} src={p.photo} alt={`Client satisfait : ${p.name}`} />)}
              </div>
              <p><strong>2 400+</strong> personnes ont trouvé leur chez-vous</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-photo-main hero-map-main">
              <span className="map-card-label"><span className="flag-dots"><i /><i /><i /></span> Le Bénin, de la côte au nord</span>
              <BeninMap className="hero-benin-map" />
              <div className="photo-gradient" />
              <div className="photo-caption">
                <span><MapPin size={13} /> Cotonou · Parakou · Natitingou</span>
                <strong>Des biens partout au Bénin</strong>
              </div>
            </div>
            <div className="hero-photo-small">
              <img src={IMG.living1} alt="Logement proposé sur ALLOCA BENIN" />
            </div>
            <div className="floating-card float-verified">
              <span className="float-icon green"><BadgeCheck size={20} /></span>
              <div><strong>Annonce vérifiée</strong><small>Garantie : 3 mois d'avance</small></div>
            </div>
            <div className="floating-card float-price">
              <small>Loyer mensuel moyen</small>
              <strong>165 000 <span>FCFA</span></strong>
              <div className="mini-bars"><i /><i /><i /><i /><i /><i /></div>
            </div>
            <div className="hero-shape" />
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="value-strip">
        <div className="container value-grid">
          <div><ShieldCheck size={22} /><span><strong>Annonces vérifiées</strong><small>Contrôle qualité par l'agence</small></span></div>
          <div><Compass size={22} /><span><strong>Visite virtuelle</strong><small>Explorez avant de vous déplacer</small></span></div>
          <div><FileSignature size={22} /><span><strong>Contrat en ligne</strong><small>Signature électronique sécurisée</small></span></div>
          <div><Truck size={22} /><span><strong>Déménagement inclus</strong><small>Jusqu'à l'aménagement final</small></span></div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section" id="annonces-populaires">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker"><Sparkles size={14} /> Sélection du moment</span>
              <h2>Des biens à découvrir<br />près de chez vous</h2>
            </div>
            <Link to="/annonces" className="btn btn-outline">Voir toutes les annonces <ArrowRight size={16} /></Link>
          </div>
          <div className="property-grid">
            {featured.map((l) => <PropertyCard key={l.id} listing={l} userPoint={geoPoint} />)}
          </div>
        </div>
      </section>

      {/* TERRAINS À ACHETER */}
      <section className="section section-tint" id="terrains">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="section-kicker"><Building2 size={14} /> Nouvelle rubrique</span>
              <h2>Terrains à acheter<br />partout au Bénin</h2>
              <p>Parcelles viabilisées, titres fonciers et emplacements à fort potentiel, triés selon votre position.</p>
            </div>
            <Link to="/terrains" className="btn btn-primary">Voir tous les terrains <ArrowRight size={16} /></Link>
          </div>
          <div className="property-grid">
            {lands.map((l) => <PropertyCard key={l.id} listing={l} userPoint={geoPoint} />)}
          </div>
        </div>
      </section>

      {/* GEO BAND */}
      <section className="geo-band">
        <div className="container geo-band-grid">
          <div className="geo-copy">
            <span className="section-kicker light"><MapPin size={14} /> Géolocalisation intelligente</span>
            <h2>Votre emplacement devient<br />votre meilleur critère de recherche.</h2>
            <p>
              Autorisez la localisation : ALLOCA BENIN identifie votre position, calcule les distances réelles
              et vous propose les appartements, maisons et terrains réellement disponibles autour de vous.
            </p>
            <ul className="check-list">
              <li><Check size={16} /> Résultats triés par distance depuis votre position</li>
              <li><Check size={16} /> Rayon de recherche et carte interactive</li>
              <li><Check size={16} /> Sans position ? Toutes les annonces restent visibles</li>
            </ul>
            <button className="btn btn-accent" onClick={nearMe}>
              <Navigation size={17} /> Découvrir les biens autour de moi
            </button>
          </div>
          <div className="geo-visual">
            <div className="geo-radar">
              <span className="radar-ring r1" /><span className="radar-ring r2" /><span className="radar-ring r3" />
              <span className="radar-center"><MapPin size={22} /></span>
              <span className="radar-dot d1"><Building2 size={14} /></span>
              <span className="radar-dot d2"><Building2 size={14} /></span>
              <span className="radar-dot d3"><Building2 size={14} /></span>
            </div>
            <div className="geo-result">
              <span className="geo-result-icon"><MapPin size={16} /></span>
              <div><small>Autour de vous</small><strong>6 biens disponibles</strong></div>
              <span className="geo-result-distance">2,4 km</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="fonctionnement">
        <div className="container">
          <div className="section-head center">
            <div>
              <span className="section-kicker"><Compass size={14} /> Parcours simplifié</span>
              <h2>De la recherche aux clés,<br />une seule application.</h2>
              <p>Quatre étapes claires, zéro paperasse inutile.</p>
            </div>
          </div>
          <div className="steps-grid">
            {[
              { n: '01', icon: UserRoundPlus, title: 'Créez votre compte', text: 'Client, propriétaire ou agence : chaque espace est pensé pour votre rôle.' },
              { n: '02', icon: Play, title: 'Explorez et visitez', text: 'Filtrez, géolocalisez, explorez la visite virtuelle puis planifiez une visite réelle.' },
              { n: '03', icon: FileSignature, title: 'Signez en ligne', text: 'Renseignez le contrat, ajoutez votre garant et signez électroniquement.' },
              { n: '04', icon: PackageCheck, title: 'Déménagez sereinement', text: 'Planifiez le déménagement et l’aménagement avec une checklist suivie.' },
            ].map((s) => (
              <div className="step-card" key={s.n}>
                <span className="step-number">{s.n}</span>
                <span className="step-icon"><s.icon size={23} /></span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TWO AUDIENCES */}
      <section className="section section-tint">
        <div className="container audience-grid">
          <div className="audience-card audience-owner">
            <span className="audience-icon"><Building2 size={24} /></span>
            <span className="section-kicker">Pour les propriétaires</span>
            <h2>Vos biens, enfin<br />bien valorisés.</h2>
            <p>Publiez en quelques minutes, suivez les demandes de visite, validez les locataires et laissez l'agence gérer la visibilité.</p>
            <ul className="check-list compact">
              <li><Check size={15} /> Publication guidée du bien</li>
              <li><Check size={15} /> Demandes de visite centralisées</li>
              <li><Check size={15} /> Contrats et versements suivis</li>
            </ul>
            <Link to="/devenir-proprietaire" className="btn btn-primary">Publier une annonce <MoveRight size={16} /></Link>
            <img src={IMG.terrace} alt="Terrasse d'une propriété" className="audience-img" />
          </div>
          <div className="audience-card audience-agency">
            <span className="audience-icon"><HeartHandshake size={24} /></span>
            <span className="section-kicker">Pour les agences</span>
            <h2>Le pilotage de<br />vos locations.</h2>
            <p>Un tableau de bord unique pour valider les annonces, orchestrer les visites et garder une trace de chaque contrat signé.</p>
            <ul className="check-list compact">
              <li><Check size={15} /> Validation des annonces en attente</li>
              <li><Check size={15} /> Planning des visites</li>
              <li><Check size={15} /> Vue d'ensemble du portefeuille</li>
            </ul>
            <Link to="/connexion?role=agency" className="btn btn-dark">Accéder à l'espace agence <MoveRight size={16} /></Link>
            <img src={IMG.office} alt="Espace de travail de l'agence" className="audience-img" />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="container">
          <div className="section-head center"><div><span className="section-kicker">Clients satisfaits</span><h2>Des histoires de chez-vous.</h2><p>Des visages, des parcours réussis partout au Bénin.</p></div></div>
          <div className="testimonial-grid">
            {people.map((person, i) => (
              <div className="testimonial" key={person.name}>
                <div className="stars">{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={14} fill="currentColor" />)}</div>
                <p>« {[
                  "J'ai trouvé mon appartement en deux jours. La visite virtuelle m'a permis de visiter avant de quitter Parakou, et le contrat a été signé depuis mon téléphone.",
                  "Avant, je perdais des semaines à répondre aux appels. Aujourd'hui je reçois des demandes sérieuses et je vois tout le suivi dans mon espace.",
                  "Le tableau de bord nous fait gagner un temps fou. Tout est tracé : annonces, visites, contrats. C'est exactement ce qu'il nous manquait.",
                ][i]} »</p>
                <div className="testimonial-author">
                  <img className="testimonial-photo" src={person.photo} alt={`Portrait de ${person.name}, client satisfait`} />
                  <div><strong>{person.name}</strong><small>{['Locataire à Cotonou', 'Propriétaire à Abomey-Calavi', 'Agence immobilière partenaire'][i]}</small></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="container final-cta-inner">
          <div>
            <span className="section-kicker light"><Sparkles size={14} /> Prêt à commencer ?</span>
            <h2>Votre prochain chez-vous<br />vous attend au Bénin.</h2>
            <p>Rejoignez {SITE_NAME}, gratuitement : {SITE_TAGLINE.toLowerCase()}.</p>
          </div>
          <div className="final-cta-actions">
            <Link to="/connexion?mode=register" className="btn btn-accent btn-lg">Créer mon compte gratuitement <ArrowRight size={18} /></Link>
            <Link to="/annonces" className="btn btn-ghost-light btn-lg">Explorer les annonces <ChevronRight size={18} /></Link>
          </div>
          <img src={IMG.city} alt="Vue de Cotonou" className="final-cta-bg" />
        </div>
      </section>
    </>
  )
}
