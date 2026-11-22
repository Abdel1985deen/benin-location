import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, FileSignature, MapPin, Printer, ShieldCheck, UserRound } from 'lucide-react'
import { useStore } from '../lib/store'
import { dateFR, money } from '../lib/utils'

export default function ContractView() {
  const { contractId } = useParams()
  const { contracts, listings, users } = useStore()
  const contract = contracts.find((c) => c.id === contractId)
  const listing = listings.find((l) => l.id === contract?.listingId)
  const owner = users.find((u) => u.id === contract?.ownerId)
  const client = users.find((u) => u.id === contract?.clientId)

  if (!contract) {
    return <div className="page not-found"><h1>Contrat introuvable</h1><Link to="/" className="btn btn-primary">Retour à l'accueil</Link></div>
  }

  return (
    <div className="page contract-page">
      <div className="contract-head">
        <div className="container">
          <Link to={client ? '/client#contrats' : '/'} className="back-link"><ArrowLeft size={16} /> Retour</Link>
          <span className="section-kicker"><FileSignature size={14} /> Contrat signé</span>
          <h1>Bail de location</h1>
          <p>Référence {contract.id.toUpperCase()} · Signé le {dateFR(contract.createdAt)}</p>
        </div>
      </div>

      <div className="container contract-layout">
        <div className="contract-main">
          <div className="contract-card print-card">
            <div className="contract-view-status">
              <span className="status-pill confirmed"><CheckCircle2 size={13} /> Signé électroniquement</span>
              <button className="btn btn-outline btn-sm no-print" onClick={() => window.print()}><Printer size={15} /> Imprimer</button>
            </div>

            <div className="contract-preview large">
              <h3>CONTRAT DE LOCATION D'IMMEUBLE</h3>
              <p><strong>Référence :</strong> {contract.id.toUpperCase()}</p>
              <p><strong>Date de signature :</strong> {dateFR(contract.createdAt)}</p>
              <p><strong>Logement :</strong> {listing?.title ?? 'Bien'} — {listing?.address}, {listing?.city}</p>
              <p><strong>Type :</strong> {listing?.type} · <strong>Surface :</strong> {listing?.surface} m²</p>
              <p><strong>Propriétaire / Bailleur :</strong> {owner?.name ?? '—'} {owner?.phone ? `(${owner.phone})` : ''}</p>
              <p><strong>Locataire :</strong> {contract.tenant.firstName} {contract.tenant.lastName}</p>
              <p><strong>Naissance :</strong> {contract.tenant.birthDate ? dateFR(contract.tenant.birthDate) : '—'} à {contract.tenant.birthPlace || '—'} · {contract.tenant.nationality}</p>
              <p><strong>Contact locataire :</strong> {contract.tenant.phone} · {contract.tenant.email}</p>
              <p><strong>Profession :</strong> {contract.tenant.job || '—'}</p>
              <p><strong>Prise d'effet :</strong> {dateFR(contract.startDate)} · <strong>Durée :</strong> {contract.duration} mois</p>
              <p><strong>Loyer mensuel :</strong> {money(contract.rent)} · <strong>Dépôt de garantie :</strong> {money(contract.deposit)}</p>
              <p><strong>Garant :</strong> {contract.guarantor.name} ({contract.guarantor.phone}) {contract.guarantor.relation ? `— ${contract.guarantor.relation}` : ''}</p>
              <p className="preview-legal">Le présent contrat est établi en application des dispositions du Code civil et de la réglementation relative à la location immobilière en vigueur au Bénin. Le locataire s'engage à payer le loyer aux échéances convenues, à user paisiblement des lieux loués et à les entretenir en bon état. Le bailleur s'engage à délivrer un logement décent et à assurer la jouissance paisible du bien.</p>
            </div>

            <div className="signature-view">
              <div>
                <span className="field-label"><UserRound size={14} /> Signature du locataire</span>
                {contract.signature ? (
                  <img src={contract.signature} alt="Signature du locataire" className="signature-image" />
                ) : (
                  <div className="signature-placeholder">Signature enregistrée électroniquement le {dateFR(contract.createdAt)}</div>
                )}
                <small>{contract.tenant.firstName} {contract.tenant.lastName}</small>
              </div>
              <div className="signature-meta">
                <p><ShieldCheck size={15} /> Document horodaté et conservé dans l'espace ALLOCA BENIN.</p>
                <p><MapPin size={15} /> {listing?.city}, Bénin</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="contract-aside no-print">
          <div className="aside-card">
            <h3><FileSignature size={17} /> Actions</h3>
            <div className="aside-actions">
              <Link to={`/demenagement/${contract.id}`} className="btn btn-primary btn-block btn-sm">Déménagement & aménagement</Link>
              {listing && <Link to={`/annonce/${listing.id}`} className="btn btn-outline btn-block btn-sm">Voir l'annonce</Link>}
              <Link to="/client#contrats" className="btn btn-ghost btn-block btn-sm">Mes contrats</Link>
            </div>
          </div>
          <div className="aside-card">
            <h3><ShieldCheck size={17} /> Contrat sécurisé</h3>
            <p>Ce bail est accessible à tout moment par le locataire, le propriétaire et l'agence partenaire.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}