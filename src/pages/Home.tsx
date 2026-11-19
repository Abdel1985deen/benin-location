import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Building2, Check, ChevronRight, Compass, FileSignature,
  HeartHandshake, MapPin, MoveRight, Navigation, PackageCheck, Play, Search,
  ShieldCheck, Sparkles, Star, Truck, UserRoundPlus,
} from 'lucide-react'
import PropertyCard from '../components/PropertyCard'
import { IMG, cityOptions } from '../lib/data'
import { useStore } from '../lib/store'
import { getPosition } from '../lib/utils'

const budgets = [
  { value: '', label: 'Tous les budgets' },
  { value: '100000', label: 'Moins de 100 000 FCFA' },
  { value: '200000', label: 'Moins de 200 000 FCFA' },
  { value: '400000', label: 'Moins de 400 000 FCFA' },
]

export default function Home() {
  const { listings } = useStore()
  const navigate = useNavigate()
  const [deal, setDeal] = useState<'rent' | 'buy'>('rent')
  const [city, setCity] = useState('')
  const [type, setType] = useState('')
  const [budget, setBudget] = useState('')
  const [locating, setLocating] = useState(false)

  const featured = listings.filter((l) => l.featured && l.status === 'approved').slice(0, 3)

  const search = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (deal === 'buy') p.set('sale', '1')
    if (city) p.set('city', city)
    if (type) p.set('type', type)
    if (budget) p.set('max', budget)
    navigate(`/annonces?${p.toString()}`)
  }

  const nearMe = async () => {
    setLocating(true)
    const point = await getPosition()
    setLocating(false)
    if (point) {
      sessionStorage.setItem('kado-point', JSON.stringify(point))
      navigate('/annonces?near=1')
    } else {
      navigate('/annonces?map=1')
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> La location immobilière, repensée au Bénin</div>
            <h1>Le bon logement au Bénin,<br /><em>sans détour.</em></h1>
            <p className="hero-lead">
              Annonces vérifiées, visites virtuelles, contrats signés en ligne et accompagnement jusqu'au déménagement.
              Votre chez-vous est à quelques clics — où que vous soyez à Cotonou, Parakou ou ailleurs.
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
            </form>

            <div className="hero-trust">
              <button className="geo-link" onClick={nearMe} disabled={locating}>
                <Navigation size={16} /> {locating ? 'Localisation…' : 'Voir les biens autour de moi'}
              </button>
              <span className="trust-divider" />
              <div className="avatar-stack">
                <span>KM</span><span>AS</span><span>DB</span>
              </div>
              <p><strong>2 400+</strong> personnes ont trouvé leur chez-vous</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-photo-main">
              <img src={IMG.living1} alt="Appartement lumineux à Cotonou" />
              <div className="photo-gradient" />
              <div className="photo-caption">
                <span><MapPin size={13} /> Haie Vive, Cotonou</span>
                <strong>Appartement 3 pièces</strong>
              </div>
              <Link to="/annonce/l1" className="virtual-chip"><Play size={13} fill="currentColor" /> Visite virtuelle 360°</Link>
            </div>
            <div className="hero-photo-small">
              <img src={IMG.house1} alt="Villa au Bénin" />
            </div>
            <div className="floating-card float-verified">
              <span className="float-icon green"><BadgeCheck size={20} /></span>
              <div><strong>Annonce vérifiée</strong><small>Par l'agence partenaire</small></div>
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
            {featured.map((l) => <PropertyCard key={l.id} listing={l} />)}
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
              Autorisez la localisation : Kado Immo identifie votre position, calcule les distances réelles
              et vous propose les appartements, maisons et terrains réellement disponibles autour de vous.
            </p>
            <ul className="check-list">
              <li><Check size={16} /> Résultats triés par distance depuis votre position</li>
              <li><Check size={16} /> Rayon de recherche et carte interactive</li>
              <li><Check size={16} /> Repli manuel par ville si la localisation est refusée</li>
            </ul>
            <button className="btn btn-accent" onClick={nearMe} disabled={locating}>
              <Navigation size={17} /> {locating ? 'Localisation en cours…' : 'Découvrir les biens autour de moi'}
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
          <div className="section-head center"><div><span className="section-kicker">Ils ont franchi le pas</span><h2>Des histoires de chez-vous.</h2></div></div>
          <div className="testimonial-grid">
            {[
              { name: 'Chantal S.', role: 'Locataire à Cotonou', text: "J'ai trouvé mon appartement en deux jours. La visite virtuelle m'a permis de visiter avant de quitter Parakou, et le contrat a été signé depuis mon téléphone.", initials: 'CS' },
              { name: 'Amédée D.', role: 'Propriétaire à Abomey-Calavi', text: "Avant, je perdais des semaines à répondre aux appels. Aujourd'hui je reçois des demandes sérieuses et je vois tout le suivi dans mon espace.", initials: 'AD' },
              { name: 'Mariam A.', role: 'Agence partenaire', text: "Le tableau de bord nous fait gagner un temps fou. Tout est tracé : annonces, visites, contrats. C'est exactement ce qu'il nous manquait.", initials: 'MA' },
            ].map((t) => (
              <div className="testimonial" key={t.name}>
                <div className="stars">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                <p>« {t.text} »</p>
                <div className="testimonial-author"><span>{t.initials}</span><div><strong>{t.name}</strong><small>{t.role}</small></div></div>
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
            <p>Rejoignez Kado Immo, gratuitement, et trouvez aujourd'hui le bien qui vous correspond.</p>
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
