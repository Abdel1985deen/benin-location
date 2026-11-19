import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Building2, CalendarDays, Check, CheckCircle2, Clock, Eye, FileSignature,
  ShieldCheck, Users, X,
} from 'lucide-react'
import DashboardShell, { agencyLinks } from '../components/DashboardShell'
import { useStore } from '../lib/store'
import { dateFR, shortMoney } from '../lib/utils'

export default function AgencyDashboard() {
  const { currentUser, users, listings, visits, contracts, setListingStatus, setVisitStatus } = useStore()
  const navigate = useNavigate()

  useEffect(() => { if (!currentUser) navigate('/connexion?role=agency') }, [currentUser, navigate])
  if (!currentUser) return null

  const pending = listings.filter((l) => l.status === 'pending')
  const confirmed = visits.filter((v) => v.status === 'pending')
  const totalValue = listings.filter((l) => l.status === 'approved').reduce((s, l) => s + l.price, 0)

  return (
    <DashboardShell
      title="Espace agence"
      subtitle="Pilotez les annonces, visites et contrats du portefeuille."
      links={agencyLinks}
      action={<span className="agency-badge"><ShieldCheck size={15} /> Compte agence vérifié</span>}
    >
      <div id="overview" className="dash-stats">
        <div className="stat-card"><span className="stat-icon teal"><Building2 size={20} /></span><div><strong>{listings.length}</strong><small>Annonces suivies</small></div></div>
        <div className="stat-card"><span className="stat-icon gold"><Clock size={20} /></span><div><strong>{pending.length}</strong><small>À valider</small></div></div>
        <div className="stat-card"><span className="stat-icon blue"><CalendarDays size={20} /></span><div><strong>{confirmed.length}</strong><small>Visites à organiser</small></div></div>
        <div className="stat-card"><span className="stat-icon coral"><Users size={20} /></span><div><strong>{users.filter((u) => u.role !== 'agency').length}</strong><small>Utilisateurs inscrits</small></div></div>
      </div>

      <div className="agency-chart">
        <div className="chart-head"><div><h3>Valeur du portefeuille</h3><p>{shortMoney(totalValue)} de loyers mensuels suivis · {contracts.length} contrat(s) signé(s)</p></div><span className="badge badge-green">En croissance</span></div>
        <div className="chart-bars">
          {[45, 62, 54, 78, 69, 88, 74, 95, 82, 100].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
        </div>
        <div className="chart-months"><span>Janv.</span><span>Févr.</span><span>Mars</span><span>Avril</span><span>Mai</span><span>Juin</span><span>Juil.</span><span>Août</span><span>Sept.</span><span>Oct.</span></div>
      </div>

      <section id="validation" className="dash-section">
        <div className="dash-section-head"><div><h2>Annonces à valider</h2><p>Vérifiez les nouvelles publications avant mise en ligne.</p></div></div>
        {pending.length ? (
          <div className="validation-grid">
            {pending.map((l) => (
              <div className="validation-card" key={l.id}>
                <img src={l.images[0]} alt="" />
                <div className="validation-body">
                  <span className="badge badge-muted">En attente</span>
                  <h3>{l.title}</h3>
                  <p><Eye size={14} /> {l.city} · {l.type} · {l.surface} m²</p>
                  <p><strong>{shortMoney(l.price)}</strong> {l.sale ? '' : '/ mois'}</p>
                  <small>Publiée le {dateFR(l.createdAt)} par {users.find((u) => u.id === l.ownerId)?.name}</small>
                  <div className="validation-actions">
                    <Link to={`/annonce/${l.id}`} className="btn btn-outline btn-xs">Examiner</Link>
                    <button className="btn btn-success btn-xs" onClick={() => setListingStatus(l.id, 'approved')}><Check size={14} /> Approuver</button>
                    <button className="btn btn-outline btn-xs" onClick={() => setListingStatus(l.id, 'rented')}><X size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="dash-empty"><CheckCircle2 size={26} /><p>Toutes les annonces ont été validées.</p></div>}
      </section>

      <section id="visites" className="dash-section">
        <div className="dash-section-head"><div><h2>Planning des visites</h2><p>Coordonnez les rendez-vous entre clients et propriétaires.</p></div></div>
        {visits.length ? (
          <div className="dash-table">
            <div className="table-head"><span>Bien</span><span>Client</span><span>Rendez-vous</span><span>Statut</span><span>Action</span></div>
            {visits.map((v) => {
              const l = listings.find((x) => x.id === v.listingId)
              return <div className="table-row" key={v.id}>
                <span><strong>{l?.title}</strong><small>{l?.city}</small></span>
                <span><strong>{users.find((u) => u.id === v.clientId)?.name}</strong></span>
                <span><strong>{dateFR(v.date)}</strong><small>{v.time}</small></span>
                <span className={`status-pill ${v.status}`}>
                  {v.status === 'pending' ? <Clock size={13} /> : v.status === 'confirmed' ? <CheckCircle2 size={13} /> : <X size={13} />}
                  {v.status === 'pending' ? 'En attente' : v.status === 'confirmed' ? 'Confirmée' : 'Refusée'}
                </span>
                <span className="row-actions">
                  {v.status === 'pending' && <button className="btn btn-success btn-xs" onClick={() => setVisitStatus(v.id, 'confirmed')}><Check size={14} /> Confirmer</button>}
                </span>
              </div>
            })}
          </div>
        ) : <div className="dash-empty"><CalendarDays size={26} /><p>Aucune visite planifiée.</p></div>}
      </section>

      <section id="contrats" className="dash-section">
        <div className="dash-section-head"><div><h2>Contrats signés</h2><p>Archives des baux électroniques.</p></div></div>
        {contracts.length ? contracts.map((c) => {
          const l = listings.find((x) => x.id === c.listingId)
          return <div className="contract-item" key={c.id}>
            <span className="contract-icon"><FileSignature size={21} /></span>
            <div><strong>{l?.title}</strong><small>{users.find((u) => u.id === c.clientId)?.name} · {dateFR(c.createdAt)} · {c.duration} mois</small></div>
            <strong>{shortMoney(c.rent)}/mois</strong>
            <span className="status-pill confirmed"><CheckCircle2 size={13} /> Signé</span>
            <Link to={`/contrat-signe/${c.id}`} className="btn btn-ghost btn-sm">Voir</Link>
          </div>
        }) : <div className="dash-empty"><FileSignature size={26} /><p>Aucun contrat signé pour le moment.</p></div>}
      </section>
    </DashboardShell>
  )
}
