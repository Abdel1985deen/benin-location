import { MessageCircle, Sparkles } from 'lucide-react'
import { SUPPORT_WHATSAPP } from '../lib/site'

const ALTECHINNOV_WHATSAPP = 'https://wa.me/22941186899'
const ALTECHINNOV_TEXT = "Altechinnov, c'est Docteur Shams pour tout besoin en progiciel. Disponible 24h/24. Votre solution informatique à plein nez ! La senteur de la réussite..."

/**
 * Emplacement publicitaire réutilisable.
 * `featured=true` affiche la publicité animée d'Altechinnov ; sinon l'emplacement
 * est proposé aux partenaires. Aucun asset distant : compatible /benin-location/.
 */
export default function AdSlot({
  placement = 'inline',
  featured = false,
}: {
  placement?: 'top' | 'inline' | 'bottom'
  featured?: boolean
}) {
  return (
    <aside
      className={`ad-slot ad-slot-${placement} ${featured ? 'ad-slot-featured' : ''}`.trim()}
      aria-label={featured ? 'Publicité Altechinnov' : 'Espace publicitaire partenaire'}
    >
      <span className="ad-label">{featured ? 'Publicité' : 'Partenaire'}</span>
      <span className="ad-shimmer" aria-hidden="true" />

      {featured ? (
        <div className="ad-inner">
          <span className="ad-icon" aria-hidden="true"><Sparkles size={23} /></span>
          <div className="ad-copy">
            <strong>Altechinnov</strong>
            <p>{ALTECHINNOV_TEXT}</p>
          </div>
          <a href={ALTECHINNOV_WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-sm ad-cta">
            <MessageCircle size={15} /> Contacter sur WhatsApp
          </a>
        </div>
      ) : (
        <div className="ad-inner">
          <span className="ad-icon ad-icon-muted" aria-hidden="true"><Sparkles size={21} /></span>
          <div className="ad-copy">
            <strong>Espace publicitaire - Devenez partenaire</strong>
            <p>Visibilité auprès des clients, propriétaires et agences partout au Bénin.</p>
          </div>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm ad-cta">
            <MessageCircle size={15} /> Nous contacter
          </a>
        </div>
      )}
    </aside>
  )
}
