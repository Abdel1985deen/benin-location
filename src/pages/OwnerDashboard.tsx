import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Building2, CalendarDays, Check, CheckCircle2, Clock, Eye,
  FileSignature, Plus, Receipt, TrendingUp, X, XCircle,
} from 'lucide-react'
import DashboardShell, { ownerLinks } from '../components/DashboardShell'
import { GUARANTEE_MONTHS } from '../lib/site'
import { useStore } from '../lib/store'
import { dateFR, shortMoney } from '../lib/utils'

export default function OwnerDashboard() {
  const { currentUser, users, listings, visits, contracts, transactions, setVisitStatus, setListingStatus } = useStore()
  const navigate = useNavigate()

  useEffect(() => { if (!currentUser) navigate('/connexion?role=owner') }, [currentUser, navigate])
  if (!currentUser) return null

  const mine = listings.filter((l) => l.ownerId === currentUser.id)
  const ids = mine.map((l) => l.id)
  const myVisits = visits.filter((v) => ids.includes(v.listingId))
  const myContracts = contracts.filter((c) => ids.includes(c.listingId))
  const revenue = myContracts.reduce((sum, c) => sum + c.rent, 0)
  const myTxns = transactions.filter((t) => t.ownerId === currentUser.id)

  return (
    <DashboardShell
      title="Espace propriétaire"
      subtitle={`Bonjour ${currentUser.name.split(' ')[0]}, gardez un œil sur vos biens.`}
      links={ownerLinks}
      action={<Link to="/publier" className="btn btn-primary btn-sm"><Plus size={16} /> Publier une annonce</Link>}
    >
      <div id="overview" className="dash-stats">
        <div className="stat-card"><span className="stat-icon teal"><Building2 size={20} /></span><div><strong>{mine.length}</strong><small>Biens publiés</small></div></div>
        <div className="stat-card"><span className="stat-icon blue"><CalendarDays size={20} /></span><div><strong>{myVisits.length}</strong><small>Demandes de visite</small></div></div>
        <div className="stat-card"><span className="stat-icon gold"><FileSignature size={20} /></span><div><strong>{myContracts.length}</strong><small>Contrats actifs</small></div></div>
        <div className="stat-card"><span className="stat-icon coral"><TrendingUp size={20} /></span><div><strong>{shortMoney(revenue)}</strong><small>Revenus mensuels estimés</small></div></div>
      </div>

      <div className="dash-banner owner-banner">
        <span><CheckCircle2 size={22} /></span>
        <div><strong>Vos annonces sont visibles par toute l'agence</strong><p>ALLOCA BENIN vérifie chaque annonce avant sa mise en ligne et gère les demandes pour vous.</p></div>
        <Link to="/publier" className="btn btn-accent btn-sm">Ajouter un bien <ArrowRight size={15} /></Link>
      </div>

      <section id="annonces" className="dash-section">
        <div className="dash-section-head"><div><h2>Mes annonces</h2><p>État et visibilité de vos biens.</p></div></div>
        {mine.length ? (
          <div className="dash-table">
            <div className="table-head listing-head"><span>Bien</span><span>Prix</span><span>Statut</span><span>Action</span></div>
            {mine.map((l) => (
              <div className="table-row listing-row" key={l.id}>
                <span className="listing-cell"><img src={l.images[0]} alt="" /><span><strong>{l.title}</strong><small>{l.city} · {l.type}</small></span></span>
                <span><strong>{shortMoney(l.price)}</strong><small>{l.sale ? 'vente' : '/ mois'} · garantie {GUARANTEE_MONTHS} mois</small></span>
                <span className={`status-pill ${l.status === 'approved' ? 'confirmed' : l.status === 'reserved' ? 'pending' : l.status === 'rented' ? 'declined' : 'pending'}`}>
                  {l.status === 'approved' ? <Check size={13} /> : l.status === 'reserved' ? <Clock size={13} /> : <Eye size={13} />}
                  {l.status === 'approved' ? 'En ligne' : l.status === 'pending' ? 'En validation' : l.status === 'reserved' ? 'Réservé' : 'Loué'}
                </span>
                <span className="row-actions">
                  <Link to={`/annonce/${l.id}`} className="icon-btn" title="Voir"><Eye size={16} /></Link>
                  {l.status === 'pending' && <button className="icon-btn" title="Marquer comme disponible" onClick={() => setListingStatus(l.id, 'approved')}><Check size={16} /></button>}
                  {l.status === 'approved' && <button className="icon-btn" title="Marquer comme loué" onClick={() => setListingStatus(l.id, 'rented')}><X size={16} /></button>}
                </span>
              </div>
            ))}
          </div>
        ) : <div className="dash-empty"><Building2 size={26} /><p>Vous n'avez pas encore de bien publié.</p><Link to="/publier" className="btn btn-primary btn-sm">Publier mon premier bien</Link></div>}
      </section>

      <section id="visites" className="dash-section">
        <div className="dash-section-head"><div><h2>Demandes de visite</h2><p>Acceptez ou refusez les créneaux proposés par les clients.</p></div></div>
        {myVisits.length ? (
          <div className="dash-table">
            <div className="table-head"><span>Bien / Client</span><span>Créneau souhaité</span><span>Statut</span><span>Réponse</span></div>
            {myVisits.map((v) => {
              const l = listings.find((x) => x.id === v.listingId)
              const client = users.find((u) => u.id === v.clientId)?.name ?? 'Client'
              return (
                <div className="table-row" key={v.id}>
                  <span><strong>{l?.title}</strong><small>{client}</small></span>
                  <span><strong>{dateFR(v.date)} · {v.time}</strong><small>{v.message || 'Aucun message'}</small></span>
                  <span className={`status-pill ${v.status}`}>
                    {v.status === 'pending' ? <Clock size={13} /> : v.status === 'confirmed' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {v.status === 'pending' ? 'À traiter' : v.status === 'confirmed' ? 'Confirmée' : 'Refusée'}
                  </span>
                  <span className="row-actions">
                    {v.status === 'pending' ? <>
                      <button className="btn btn-success btn-xs" onClick={() => setVisitStatus(v.id, 'confirmed')}><Check size={14} /> Confirmer</button>
                      <button className="btn btn-outline btn-xs" onClick={() => setVisitStatus(v.id, 'declined')}><X size={14} /></button>
                    </> : <span className="muted">Traité</span>}
                  </span>
                </div>
              )
            })}
          </div>
        ) : <div className="dash-empty"><CalendarDays size={26} /><p>Aucune demande de visite pour le moment.</p></div>}
      </section>

      <section id="contrats" className="dash-section">
        <div className="dash-section-head"><div><h2>Contrats en cours</h2><p>Les baux signés par vos locataires.</p></div></div>
        {myContracts.length ? myContracts.map((c) => {
          const l = listings.find((x) => x.id === c.listingId)
          return <div className="contract-item" key={c.id}>
            <span className="contract-icon"><FileSignature size={21} /></span>
            <div><strong>{l?.title}</strong><small>Signé le {dateFR(c.createdAt)} · {c.duration} mois · {shortMoney(c.rent)}/mois</small></div>
            <span className="status-pill confirmed"><CheckCircle2 size={13} /> Actif</span>
            <Link to={`/contrat-signe/${c.id}`} className="btn btn-ghost btn-sm">Voir</Link>
          </div>
        }) : <div className="dash-empty"><FileSignature size={26} /><p>Aucun contrat signé pour vos biens.</p></div>}
      </section>

      <section id="transactions" className="dash-section">
        <div className="dash-section-head">
          <div><h2>Suivi des transactions</h2><p>Demande, avance de 3 mois, confirmation, loyer et reçu — simulation sans paiement réel.</p></div>
          <Link to="/transactions" className="btn btn-outline btn-sm"><Receipt size={15} /> Ouvrir le suivi</Link>
        </div>
        <div className="dash-stats compact-stats">
          <div className="stat-card"><span className="stat-icon teal"><Receipt size={20} /></span><div><strong>{myTxns.length}</strong><small>Transactions</small></div></div>
          <div className="stat-card"><span className="stat-icon gold"><Clock size={20} /></span><div><strong>{myTxns.filter((t) => t.status !== 'receipt_generated').length}</strong><small>En cours</small></div></div>
          <div className="stat-card"><span className="stat-icon blue"><CheckCircle2 size={20} /></span><div><strong>{myTxns.filter((t) => t.status === 'receipt_generated').length}</strong><small>Reçus générés</small></div></div>
        </div>
      </section>
    </DashboardShell>
  )
}
