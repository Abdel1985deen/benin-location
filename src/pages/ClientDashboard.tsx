import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, CalendarDays, CheckCircle2, Clock, FileSignature, Heart,
  MapPin, PackageCheck, Plus, Truck, XCircle,
} from 'lucide-react'
import DashboardShell, { clientLinks } from '../components/DashboardShell'
import PropertyCard from '../components/PropertyCard'
import { useStore } from '../lib/store'
import { dateFR } from '../lib/utils'

export default function ClientDashboard() {
  const { currentUser, listings, favorites, visits, contracts, movingPlans } = useStore()
  const navigate = useNavigate()

  useEffect(() => { if (!currentUser) navigate('/connexion?role=client') }, [currentUser, navigate])
  if (!currentUser) return null

  const favs = (favorites[currentUser.id] ?? []).map((id) => listings.find((l) => l.id === id)).filter(Boolean)
  const myVisits = visits.filter((v) => v.clientId === currentUser.id)
  const myContracts = contracts.filter((c) => c.clientId === currentUser.id)
  const myMoves = movingPlans.filter((m) => m.clientId === currentUser.id)

  return (
    <DashboardShell
      title="Mon espace client"
      subtitle={`Bonjour ${currentUser.name.split(' ')[0]}, voici votre parcours immobilier.`}
      links={clientLinks}
      action={<Link to="/annonces" className="btn btn-primary btn-sm"><Plus size={16} /> Nouvelle recherche</Link>}
    >
      <div id="overview" className="dash-stats">
        <div className="stat-card"><span className="stat-icon teal"><Heart size={20} /></span><div><strong>{favs.length}</strong><small>Biens en favoris</small></div></div>
        <div className="stat-card"><span className="stat-icon blue"><CalendarDays size={20} /></span><div><strong>{myVisits.length}</strong><small>Visites demandées</small></div></div>
        <div className="stat-card"><span className="stat-icon gold"><FileSignature size={20} /></span><div><strong>{myContracts.length}</strong><small>Contrats signés</small></div></div>
        <div className="stat-card"><span className="stat-icon coral"><Truck size={20} /></span><div><strong>{myMoves.length}</strong><small>Déménagements suivis</small></div></div>
      </div>

      {myContracts.length === 0 && (
        <div className="dash-banner">
          <span><MapPin size={22} /></span>
          <div><strong>Prêt à trouver votre chez-vous ?</strong><p>Explorez les annonces géolocalisées et planifiez une visite en quelques clics.</p></div>
          <Link to="/annonces" className="btn btn-accent btn-sm">Explorer les annonces <ArrowRight size={15} /></Link>
        </div>
      )}

      <section id="favoris" className="dash-section">
        <div className="dash-section-head"><div><h2>Mes favoris</h2><p>Les biens que vous avez enregistrés.</p></div></div>
        {favs.length ? <div className="property-grid dash-grid">{favs.map((l) => l && <PropertyCard key={l.id} listing={l} compact />)}</div>
          : <div className="dash-empty"><Heart size={26} /><p>Aucun favori pour l'instant. Explorez les annonces et cliquez sur le cœur.</p><Link to="/annonces" className="btn btn-outline btn-sm">Voir les annonces</Link></div>}
      </section>

      <section id="visites" className="dash-section">
        <div className="dash-section-head"><div><h2>Mes visites</h2><p>Suivi de vos demandes auprès de l'agence.</p></div></div>
        {myVisits.length ? (
          <div className="dash-table">
            <div className="table-head"><span>Bien</span><span>Date & heure</span><span>Statut</span></div>
            {myVisits.map((v) => {
              const l = listings.find((x) => x.id === v.listingId)
              return (
                <div className="table-row" key={v.id}>
                  <span><strong>{l?.title ?? 'Bien supprimé'}</strong><small>{l?.city}</small></span>
                  <span><strong>{dateFR(v.date)}</strong><small>{v.time}</small></span>
                  <span className={`status-pill ${v.status}`}>
                    {v.status === 'pending' ? <Clock size={13} /> : v.status === 'confirmed' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    {v.status === 'pending' ? 'En attente' : v.status === 'confirmed' ? 'Confirmée' : 'Refusée'}
                  </span>
                </div>
              )
            })}
          </div>
        ) : <div className="dash-empty"><CalendarDays size={26} /><p>Aucune visite demandée.</p></div>}
      </section>

      <section id="contrats" className="dash-section">
        <div className="dash-section-head"><div><h2>Mes contrats</h2><p>Vos baux signés électroniquement.</p></div></div>
        {myContracts.length ? (
          <div className="contract-list">
            {myContracts.map((c) => {
              const l = listings.find((x) => x.id === c.listingId)
              return (
                <div className="contract-item" key={c.id}>
                  <span className="contract-icon"><FileSignature size={21} /></span>
                  <div><strong>{l?.title ?? 'Bien'}</strong><small>Signé le {dateFR(c.createdAt)} · Durée {c.duration} mois · {c.rent.toLocaleString('fr-FR')} FCFA/mois</small></div>
                  <span className="status-pill confirmed"><CheckCircle2 size={13} /> Signé</span>
                  <Link to={`/contrat-signe/${c.id}`} className="btn btn-ghost btn-sm">Voir le contrat</Link>
                  <Link to={`/demenagement/${c.id}`} className="btn btn-outline btn-sm">Déménagement <ArrowRight size={14} /></Link>
                </div>
              )
            })}
          </div>
        ) : <div className="dash-empty"><FileSignature size={26} /><p>Aucun contrat signé. Remplissez le contrat depuis la fiche d'un bien.</p></div>}
      </section>

      <section id="demenagement" className="dash-section">
        <div className="dash-section-head"><div><h2>Déménagement & aménagement</h2><p>Votre checklist après la signature.</p></div></div>
        {myMoves.length ? myMoves.map((m) => (
          <Link to={`/demenagement/${m.contractId}`} className="move-summary" key={m.id}>
            <span className="stat-icon coral"><PackageCheck size={20} /></span>
            <div><strong>Déménagement prévu le {dateFR(m.moveDate)}</strong><small>{m.services.length} services demandés · {Object.values(m.steps).filter(Boolean).length} étapes terminées</small></div>
            <ArrowRight size={17} />
          </Link>
        )) : <div className="dash-empty"><Truck size={26} /><p>Le suivi du déménagement apparaîtra ici après la signature d'un contrat.</p></div>}
      </section>
    </DashboardShell>
  )
}
