import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeCheck, BedDouble, Bath, Heart, MapPin, Maximize2, MoveRight, Ruler, ShieldCheck } from 'lucide-react'
import { GUARANTEE_MONTHS } from '../lib/site'
import { useStore } from '../lib/store'
import { distanceKm, shortMoney } from '../lib/utils'
import type { GeoPoint, Listing } from '../types'

export default function PropertyCard({
  listing, userPoint, compact = false,
}: { listing: Listing; userPoint?: GeoPoint | null; compact?: boolean }) {
  const { currentUser, favorites, toggleFavorite } = useStore()
  const navigate = useNavigate()
  const [img, setImg] = useState(0)
  const isFav = currentUser ? (favorites[currentUser.id] ?? []).includes(listing.id) : false
  const km = userPoint ? distanceKm(userPoint, listing) : null

  return (
    <article className={`property-card ${compact ? 'compact' : ''}`}>
      <Link to={`/annonce/${listing.id}`} className="card-media">
        <img src={listing.images[img]} alt={listing.title} loading="lazy" />
        <div className="card-media-top">
          <span className="badge badge-primary">{listing.sale ? 'À vendre' : 'À louer'}</span>
          {listing.status === 'reserved' && <span className="badge badge-warn">Réservé</span>}
          {listing.status === 'pending' && <span className="badge badge-muted">En validation</span>}
        </div>
        <button
          className={`fav-btn ${isFav ? 'active' : ''}`}
          aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          onClick={(e) => { e.preventDefault(); if (currentUser) toggleFavorite(listing.id); else navigate(`/connexion?next=/annonce/${listing.id}`) }}
        >
          <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        <div className="card-dots">
          {listing.images.map((_, i) => (
            <button key={i} className={i === img ? 'active' : ''} onClick={(e) => { e.preventDefault(); setImg(i) }} aria-label={`Photo ${i + 1}`} />
          ))}
        </div>
      </Link>
      <div className="card-body">
        <div className="card-location"><MapPin size={14} /> {listing.neighborhood}, {listing.city} {km !== null && <span className="distance">· {km < 1 ? 'à moins de 1 km' : `à ${km.toFixed(1)} km`}</span>}</div>
        <Link to={`/annonce/${listing.id}`} className="card-title">{listing.title}</Link>
        <div className="card-meta">
          <span><Maximize2 size={15} /> {listing.surface} m²</span>
          {listing.rooms > 0 && <span><BedDouble size={15} /> {listing.rooms} ch.</span>}
          {listing.bathrooms > 0 && <span><Bath size={15} /> {listing.bathrooms} sdb</span>}
          <span className="type-tag"><Ruler size={14} /> {listing.type}</span>
          {listing.type !== 'Terrain' && <span className="furnish-tag">{listing.furnished ? 'Meublé' : 'Non meublé'}</span>}
        </div>
        <div className="card-footer">
          <div className="card-price">
            <strong>{shortMoney(listing.price)}</strong>
            <small>{listing.sale ? 'prix de vente' : '/ mois'}</small>
          </div>
          <Link to={`/annonce/${listing.id}`} className="card-link">Voir <MoveRight size={16} /></Link>
        </div>
        {!compact && listing.featured && (
          <div className="card-verified"><BadgeCheck size={14} /> Annonce vérifiée par l'agence</div>
        )}
        <div className="guarantee-chip">
          <ShieldCheck size={14} /> Garantie : avance de {GUARANTEE_MONTHS} mois
        </div>
      </div>
    </article>
  )
}
