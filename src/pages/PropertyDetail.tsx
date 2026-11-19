import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Bath, BedDouble, CalendarDays, Check, ChevronLeft, ChevronRight,
  Clock, Compass, FileSignature, Heart, MapPin, Maximize2, MessageCircle, Play, Send, ShieldCheck,
  Sparkles, UserRound, X,
} from 'lucide-react'
import MapView from '../components/MapView'
import PropertyCard from '../components/PropertyCard'
import { useStore } from '../lib/store'
import { dateFR, money, nearestCity, todayISO } from '../lib/utils'

function VirtualTour({ image, title }: { image: string; title: string }) {
  const [offset, setOffset] = useState(50)
  const drag = useRef<{ x: number; start: number } | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setOffset((o) => (o >= 100 ? 0 : o + 0.6)), 40)
    return () => window.clearInterval(id)
  }, [playing])

  return (
    <div className="tour360" style={{ backgroundImage: `url(${image})`, backgroundPosition: `${offset}% center` }}
      onPointerDown={(e) => { drag.current = { x: e.clientX, start: offset }; setPlaying(false); e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={(e) => { if (!drag.current) return; const w = e.currentTarget.clientWidth; setOffset(Math.max(0, Math.min(100, drag.current.start - ((e.clientX - drag.current.x) / w) * 130))) }}
      onPointerUp={() => { drag.current = null }}
    >
      <div className="tour360-top">
        <span className="tour360-badge"><Compass size={15} /> Visite virtuelle 360°</span>
        <span className="tour360-title">{title}</span>
      </div>
      <div className="tour360-controls">
        <button onClick={() => setOffset(Math.max(0, offset - 12))}><ChevronLeft size={18} /></button>
        <button className="play" onClick={() => setPlaying(!playing)}>{playing ? <X size={16} /> : <Play size={16} fill="currentColor" />}</button>
        <button onClick={() => setOffset(Math.min(100, offset + 12))}><ChevronRight size={18} /></button>
      </div>
      <span className="tour360-hint">Glissez pour explorer la pièce</span>
      <div className="tour360-progress"><span style={{ width: `${offset}%` }} /></div>
    </div>
  )
}

export default function PropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listings, users, currentUser, favorites, toggleFavorite, addVisit, messages, sendMessage } = useStore()
  const listing = listings.find((l) => l.id === id)
  const [photo, setPhoto] = useState(0)
  const [tour, setTour] = useState(false)
  const [sent, setSent] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [time, setTime] = useState('10:00')
  const [message, setMessage] = useState('')
  const [ask, setAsk] = useState('')
  const [askSent, setAskSent] = useState(false)

  if (!listing) {
    return <div className="page not-found"><h1>Annonce introuvable</h1><Link to="/annonces" className="btn btn-primary">Retour aux annonces</Link></div>
  }

  const owner = users.find((u) => u.id === listing.ownerId)
  const isFav = currentUser ? (favorites[currentUser.id] ?? []).includes(listing.id) : false
  const similar = listings.filter((l) => l.id !== listing.id && l.city === listing.city && l.status === 'approved').slice(0, 3)

  const requestVisit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { navigate(`/connexion?next=/annonce/${listing.id}`); return }
    addVisit({ listingId: listing.id, clientId: currentUser.id, date, time, message })
    setSent(true)
  }

  const contactOwner = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) { navigate(`/connexion?next=/annonce/${listing.id}`); return }
    if (!ask.trim()) return
    sendMessage(listing.id, listing.ownerId, ask)
    setAsk('')
    setAskSent(true)
    setTimeout(() => setAskSent(false), 2500)
  }

  const threadWithOwner = currentUser
    ? messages.filter((m) => m.listingId === listing.id && ((m.senderId === currentUser.id && m.receiverId === listing.ownerId) || (m.senderId === listing.ownerId && m.receiverId === currentUser.id)))
    : []

  return (
    <div className="page detail-page">
      <div className="container">
        <div className="detail-topbar">
          <Link to="/annonces" className="back-link"><ArrowLeft size={16} /> Toutes les annonces</Link>
          <div className="detail-actions">
            <button className={`btn btn-outline btn-sm ${isFav ? 'fav-active' : ''}`} onClick={() => currentUser ? toggleFavorite(listing.id) : navigate('/connexion')}>
              <Heart size={16} fill={isFav ? 'currentColor' : 'none'} /> {isFav ? 'Enregistré' : 'Enregistrer'}
            </button>
            <span className="detail-ref">Réf. {listing.id.toUpperCase()}</span>
          </div>
        </div>

        <div className="detail-heading">
          <div>
            <div className="detail-tags">
              <span className="badge badge-primary">{listing.sale ? 'À vendre' : 'À louer'}</span>
              <span className="badge badge-soft">{listing.type}</span>
              <span className="badge badge-green"><ShieldCheck size={13} /> Vérifié</span>
            </div>
            <h1>{listing.title}</h1>
            <p><MapPin size={16} /> {listing.address}, {listing.city} · {nearestCity(listing).city.name}</p>
          </div>
          <div className="detail-price"><strong>{money(listing.price)}</strong><span>{listing.sale ? 'prix de vente' : '/ mois, charges incluses'}</span></div>
        </div>

        <div className="detail-gallery">
          <div className="gallery-main">
            {tour ? <VirtualTour image={listing.panorama} title={listing.title} /> : <img src={listing.images[photo]} alt={listing.title} />}
            {!tour && <button className="gallery-tour-btn" onClick={() => setTour(true)}><Compass size={16} /> Visite virtuelle 360°</button>}
            {tour && <button className="gallery-exit-tour" onClick={() => setTour(false)}><X size={15} /> Quitter la visite 360°</button>}
          </div>
          <div className="gallery-thumbs">
            {listing.images.map((img, i) => (
              <button key={i} className={photo === i && !tour ? 'active' : ''} onClick={() => { setPhoto(i); setTour(false) }}>
                <img src={img} alt={`Vue ${i + 1}`} />
              </button>
            ))}
            <button className="thumb-tour" onClick={() => setTour(true)}><Compass size={18} /><span>360°</span></button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-stats">
              <div><Maximize2 size={20} /><strong>{listing.surface} m²</strong><span>Surface</span></div>
              {listing.rooms > 0 && <div><BedDouble size={20} /><strong>{listing.rooms}</strong><span>Chambres</span></div>}
              {listing.bathrooms > 0 && <div><Bath size={20} /><strong>{listing.bathrooms}</strong><span>Salles d'eau</span></div>}
              <div><CalendarDays size={20} /><strong>{new Date(listing.availableFrom).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</strong><span>Disponible dès</span></div>
            </div>

            <section className="detail-block">
              <h2>À propos de ce bien</h2>
              <p>{listing.description}</p>
            </section>

            <section className="detail-block">
              <h2>Équipements & services</h2>
              <div className="amenities-grid">
                {listing.amenities.map((a) => <span key={a}><Check size={16} /> {a}</span>)}
              </div>
            </section>

            <section className="detail-block">
              <h2>Localisation</h2>
              <p className="muted">{listing.address}, {listing.city}. Les commodités et transports à proximité sont visibles sur la carte.</p>
              <MapView listings={[listing]} height={320} selectedId={listing.id} />
            </section>

            <section className="detail-block">
              <h2>Comment se passe la visite ?</h2>
              <div className="visit-steps">
                <div><span>1</span><strong>Choisissez un créneau</strong><p>Envoyez une demande de visite avec votre disponibilité.</p></div>
                <div><span>2</span><strong>Explorez en 360°</strong><p>Visitez déjà le bien à distance avant de vous déplacer.</p></div>
                <div><span>3</span><strong>Visite sur place</strong><p>L'agence confirme le rendez-vous et vous accompagne.</p></div>
              </div>
            </section>
          </div>

          <aside className="detail-sidebar">
            <div className="side-card">
              <h3>{listing.sale ? 'Acheter ce bien' : 'Louer ce bien'}</h3>
              <div className="side-price">{money(listing.price)} <span>{listing.sale ? '' : '/ mois'}</span></div>
              {sent ? (
                <div className="success-box">
                  <span><Check size={22} /></span>
                  <strong>Demande envoyée !</strong>
                  <p>L'agence vous confirmera le créneau du {dateFR(date)} à {time} par e-mail ou téléphone.</p>
                  <button className="btn btn-outline btn-block btn-sm" onClick={() => setSent(false)}>Envoyer une autre demande</button>
                </div>
              ) : (
                <form onSubmit={requestVisit} className="visit-form">
                  <label>Date souhaitée<input type="date" min={todayISO()} value={date} onChange={(e) => setDate(e.target.value)} required /></label>
                  <label>Heure<select value={time} onChange={(e) => setTime(e.target.value)}>
                    {['09:00', '10:00', '11:30', '14:00', '15:30', '17:00'].map((t) => <option key={t}>{t}</option>)}
                  </select></label>
                  <label>Message (facultatif)<textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Une question sur le bien ?" /></label>
                  <button className="btn btn-primary btn-block" type="submit"><CalendarDays size={17} /> Demander une visite</button>
                  <p className="form-note"><Clock size={13} /> Réponse sous 24h ouvrées</p>
                </form>
              )}
              {!listing.sale && listing.status === 'approved' ? (
                <Link to={`/contrat/${listing.id}`} className="btn btn-accent btn-block"><FileSignature size={17} /> Remplir le contrat en ligne</Link>
              ) : !listing.sale && listing.status === 'reserved' ? (
                <div className="info-box"><ShieldCheck size={17} /> Ce bien est actuellement réservé.</div>
              ) : null}
            </div>

            <div className="side-card agent-card">
              <h3>Votre interlocuteur</h3>
              <div className="agent-row">
                <span className="agent-avatar"><UserRound size={22} /></span>
                <div><strong>{owner?.name ?? 'Agence Kado Immo'}</strong><small>{owner?.role === 'agency' ? 'Agence partenaire' : 'Propriétaire'}</small></div>
              </div>
              <div className="agent-contact"><span>{owner?.phone ?? '+229 21 30 45 67'}</span><span>{owner?.email ?? 'contact@kadoimmo.bj'}</span></div>
              <div className="agent-badge"><ShieldCheck size={15} /> Identité vérifiée par Kado Immo</div>
              {currentUser?.id !== listing.ownerId ? (
                <>
                  <form onSubmit={contactOwner} className="contact-form">
                    <label>Une question sur ce bien ?</label>
                    <textarea rows={3} value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="Ex. Le stationnement est-il inclus ?" />
                    <button className="btn btn-outline btn-block btn-sm" type="submit" disabled={!ask.trim()}><Send size={15} /> Envoyer un message</button>
                    {askSent && <p className="form-note success-note"><Check size={13} /> Message envoyé. <Link to={`/messages?listing=${listing.id}&with=${listing.ownerId}`} className="text-link">Ouvrir la messagerie</Link></p>}
                  </form>
                  {threadWithOwner.length > 0 && (
                    <Link to={`/messages?listing=${listing.id}&with=${listing.ownerId}`} className="text-link"><MessageCircle size={14} /> Voir la conversation ({threadWithOwner.length})</Link>
                  )}
                </>
              ) : (
                <p className="form-note">Ceci est votre annonce.</p>
              )}
            </div>

            <div className="side-card reassurance">
              <h3><Sparkles size={17} /> Pourquoi passer par Kado ?</h3>
              <p><Check size={15} /> Bien contrôlé par notre agence partenaire</p>
              <p><Check size={15} /> Contrat clair, sans frais cachés</p>
              <p><Check size={15} /> Accompagnement jusqu'au déménagement</p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="section similar">
            <div className="section-head"><div><h2>Autres biens à {listing.city}</h2></div><Link to={`/annonces?city=${listing.city}`} className="btn btn-outline btn-sm">Voir tout <ChevronRight size={15} /></Link></div>
            <div className="property-grid">{similar.map((l) => <PropertyCard key={l.id} listing={l} />)}</div>
          </section>
        )}
      </div>
    </div>
  )
}
