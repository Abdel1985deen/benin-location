import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Ban, Building2, Check, CheckCircle2, Clock, Download, Globe2, Home, Info, Pencil, Plus, Receipt,
  Send, ShieldCheck, Trash2, Users, Wallet, X,
} from 'lucide-react'
import AdminListingEditor from '../components/AdminListingEditor'
import { GUARANTEE_MONTHS } from '../lib/site'
import { useStore, type AdminListingInput } from '../lib/store'
import { FEE_RULES, STATUS_LABELS, transactionBreakdown } from '../lib/transactions'
import { dateFR, money, shortMoney } from '../lib/utils'
import type { Listing, ListingStatus, User } from '../types'

const LISTING_LABELS: Record<ListingStatus, string> = {
  pending: 'En validation',
  approved: 'En ligne',
  reserved: 'Réservée',
  rented: 'Louée',
  suspended: 'Suspendue',
}

function UserGroup({ title, icon: Icon, people, listingCount }: {
  title: string
  icon: typeof Users
  people: User[]
  listingCount?: (id: string) => number
}) {
  return (
    <div className="admin-user-group">
      <h3><Icon size={16} /> {title} <span>({people.length})</span></h3>
      {people.length ? (
        <div className="dash-table">
          <div className="table-head admin-user-head">
            <span>Nom</span><span>Contact</span><span>Ville</span><span>Inscrit le</span><span>Détail</span>
          </div>
          {people.map((u) => (
            <div className="table-row admin-user-row" key={u.id}>
              <span className="admin-user-cell">
                <span className="avatar small">{u.name.charAt(0)}</span>
                <span><strong>{u.name}</strong><small>{u.role === 'agency' ? u.agency ?? 'Agence' : u.role === 'owner' ? 'Propriétaire' : 'Client'}</small></span>
              </span>
              <span><strong>{u.email}</strong><small>{u.phone}</small></span>
              <span><strong>{u.city}</strong></span>
              <span><strong>{dateFR(u.createdAt)}</strong></span>
              <span><strong>{listingCount ? `${listingCount(u.id)} annonce(s)` : '—'}</strong></span>
            </div>
          ))}
        </div>
      ) : <div className="dash-empty"><Users size={24} /><p>Aucun compte dans cette catégorie.</p></div>}
    </div>
  )
}

/**
 * Console d'administration de démonstration.
 * Accès libre par conception : aucune authentification, aucun identifiant ni secret n'est stocké ici.
 */
export default function Admin() {
  const {
    users, listings, transactions, diasporaRequests,
    setListingStatus, forwardDiasporaRequest, upsertListing, deleteListing,
  } = useStore()
  const [editing, setEditing] = useState<Listing | 'new' | null>(null)
  const [notice, setNotice] = useState('')

  const clients = users.filter((u) => u.role === 'client')
  const owners = users.filter((u) => u.role === 'owner')
  const agencies = users.filter((u) => u.role === 'agency')

  const flash = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 6000)
  }

  const saveListing = (input: AdminListingInput) => {
    const saved = upsertListing(input)
    setEditing(null)
    flash(`« ${saved.title} » enregistrée${saved.status === 'approved' ? ' et visible sur le site' : ''}.`)
  }

  const removeListing = (listing: Listing) => {
    if (!window.confirm(`Supprimer définitivement « ${listing.title} » ?`)) return
    deleteListing(listing.id)
    if (editing && editing !== 'new' && editing.id === listing.id) setEditing(null)
    flash(`« ${listing.title} » supprimée.`)
  }

  const exportListings = () => {
    const blob = new Blob([JSON.stringify(listings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'alloca-benin-annonces.json'
    link.click()
    URL.revokeObjectURL(url)
    flash(`${listings.length} annonce(s) exportée(s) en JSON.`)
  }

  const totals = transactions.reduce((acc, t) => {
    const b = transactionBreakdown(t.rent, t.monthsAdvance)
    acc.rentFees += b.rentFee
    acc.advances += b.advance
    acc.agency += b.agencyShare
    acc.shared += b.sharedCommission
    return acc
  }, { rentFees: 0, advances: 0, agency: 0, shared: 0 })

  const listingCount = (id: string) => listings.filter((l) => l.ownerId === id).length

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div className="container admin-hero-inner">
          <div>
            <span className="admin-kicker"><ShieldCheck size={14} /> Console de démonstration</span>
            <h1>Administration ALLOCA BENIN</h1>
            <p>Vue globale des annonces, des comptes, des transactions simulées et des projets diaspora.</p>
          </div>
          <span className="admin-mode-pill"><Info size={15} /> Mode démo</span>
        </div>
      </div>

      <div className="container admin-content">
        <div className="admin-demo-banner" role="status">
          <span><Info size={22} /></span>
          <div>
            <strong>Mode démo</strong>
            <p>Cette page est ouverte à tous pour la démonstration : aucun identifiant, aucun mot de passe et aucun secret n’est demandé ou enregistré. Les validations, suspensions et transmissions ci-dessous ne font que modifier des données locales simulées.</p>
          </div>
          <Link to="/annonces" className="btn btn-outline btn-sm">Voir le site</Link>
        </div>

        <div className="dash-stats admin-stats">
          <div className="stat-card"><span className="stat-icon teal"><Home size={20} /></span><div><strong>{listings.length}</strong><small>Annonces</small></div></div>
          <div className="stat-card"><span className="stat-icon blue"><Users size={20} /></span><div><strong>{users.length}</strong><small>Utilisateurs</small></div></div>
          <div className="stat-card"><span className="stat-icon gold"><Building2 size={20} /></span><div><strong>{agencies.length}</strong><small>Agences</small></div></div>
          <div className="stat-card"><span className="stat-icon coral"><Receipt size={20} /></span><div><strong>{transactions.length}</strong><small>Transactions</small></div></div>
          <div className="stat-card"><span className="stat-icon teal"><Wallet size={20} /></span><div><strong title={money(totals.rentFees)}>{shortMoney(totals.rentFees)}</strong><small>Commissions loyers ({FEE_RULES.rentFeeRate * 100} %)</small></div></div>
          <div className="stat-card"><span className="stat-icon gold"><ShieldCheck size={20} /></span><div><strong title={money(totals.advances)}>{shortMoney(totals.advances)}</strong><small>Avances ({GUARANTEE_MONTHS} mois)</small></div></div>
        </div>

        <div className="admin-fee-strip">
          <span><strong>{FEE_RULES.rentFeeRate * 100} % du loyer</strong> prélevés sur le loyer reçu par le propriétaire · {money(totals.rentFees)}</span>
          <span><strong>{FEE_RULES.agencyAdvanceRate * 100} % de l’avance</strong> pour l’agence · {money(totals.agency)}</span>
          <span><strong>Solde 50 / 50</strong> client et propriétaire · {money(totals.shared)}</span>
        </div>

        <section id="admin-annonces" className="dash-section admin-section">
          <div className="dash-section-head">
            <div>
              <h2>Annonces</h2>
              <p>{listings.filter((l) => l.status === 'pending').length} en validation · {listings.filter((l) => l.status === 'suspended').length} suspendue(s). Créez, modifiez ou supprimez une annonce sans toucher au code.</p>
            </div>
            <div className="admin-section-actions">
              <button className="btn btn-outline btn-sm" onClick={exportListings}><Download size={15} /> Exporter</button>
              <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}><Plus size={15} /> Nouvelle annonce</button>
            </div>
          </div>

          <p className="admin-storage-note"><Info size={14} /> Démo sans serveur : les annonces créées ici sont enregistrées dans ce navigateur et apparaissent aussitôt sur le site depuis cet appareil. Une base de données serait nécessaire pour les rendre visibles à tous les visiteurs.</p>

          {notice && (
            <div className="admin-notice" role="status">
              <CheckCircle2 size={16} /> <span>{notice}</span>
              <button onClick={() => setNotice('')} aria-label="Masquer le message"><X size={14} /></button>
            </div>
          )}

          {editing && (
            <AdminListingEditor
              listing={editing === 'new' ? null : editing}
              owners={owners}
              onSave={saveListing}
              onCancel={() => setEditing(null)}
            />
          )}

          <div className="dash-table">
            <div className="table-head admin-listing-head">
              <span>Bien</span><span>Propriétaire</span><span>Prix</span><span>Statut</span><span>Actions démo</span>
            </div>
            {listings.map((l) => (
              <div className="table-row admin-listing-row" key={l.id}>
                <span className="listing-cell">
                  <img src={l.images[0]} alt="" loading="lazy" />
                  <span><strong>{l.title}</strong><small>{l.city} · {l.type} · {dateFR(l.createdAt)}</small></span>
                </span>
                <span><strong>{users.find((u) => u.id === l.ownerId)?.name ?? 'Propriétaire'}</strong></span>
                <span><strong>{shortMoney(l.price)}</strong><small>{l.sale ? 'vente' : '/ mois'}</small></span>
                <span className={`status-pill ${l.status === 'approved' ? 'confirmed' : l.status === 'suspended' || l.status === 'rented' ? 'declined' : 'pending'}`}>
                  {l.status === 'approved' ? <CheckCircle2 size={13} /> : l.status === 'suspended' ? <Ban size={13} /> : <Clock size={13} />}
                  {LISTING_LABELS[l.status]}
                </span>
                <span className="row-actions">
                  <button
                    className="btn btn-success btn-xs"
                    disabled={l.status === 'approved'}
                    onClick={() => setListingStatus(l.id, 'approved')}
                  ><Check size={14} /> Valider</button>
                  <button
                    className="btn btn-outline btn-xs"
                    disabled={l.status === 'suspended'}
                    onClick={() => setListingStatus(l.id, 'suspended')}
                  ><Ban size={14} /> Suspendre</button>
                  <button className="btn btn-outline btn-xs" onClick={() => setEditing(l)}><Pencil size={14} /> Modifier</button>
                  <button className="btn btn-danger btn-xs" onClick={() => removeListing(l)}><Trash2 size={14} /> Supprimer</button>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="admin-comptes" className="dash-section admin-section">
          <div className="dash-section-head">
            <div><h2>Comptes</h2><p>Propriétaires, clients et agences inscrits (aucun mot de passe n’est affiché).</p></div>
          </div>
          <UserGroup title="Propriétaires" icon={Home} people={owners} listingCount={listingCount} />
          <UserGroup title="Clients" icon={Users} people={clients} />
          <UserGroup title="Agences" icon={Building2} people={agencies} />
        </section>

        <section id="admin-transactions" className="dash-section admin-section">
          <div className="dash-section-head">
            <div><h2>Transactions simulées</h2><p>Demande → avance de {GUARANTEE_MONTHS} mois → confirmation → loyer → reçu. Aucun paiement réel.</p></div>
            <Link to="/transactions" className="btn btn-outline btn-sm"><Receipt size={15} /> Suivi détaillé</Link>
          </div>
          <div className="dash-table">
            <div className="table-head admin-txn-head">
              <span>Bien</span><span>Client / propriétaire</span><span>Loyer</span><span>Commission 5 %</span><span>Statut</span><span>Mise à jour</span>
            </div>
            {transactions.map((t) => {
              const listing = listings.find((l) => l.id === t.listingId)
              const b = transactionBreakdown(t.rent, t.monthsAdvance)
              return (
                <div className="table-row admin-txn-row" key={t.id}>
                  <span><strong>{listing?.title ?? 'Bien'}</strong><small>{listing?.city ?? 'Bénin'} · {t.id}</small></span>
                  <span><strong>{users.find((u) => u.id === t.clientId)?.name ?? 'Client'}</strong><small>{users.find((u) => u.id === t.ownerId)?.name ?? 'Propriétaire'}</small></span>
                  <span><strong>{shortMoney(t.rent)}</strong><small>avance {t.monthsAdvance} mois</small></span>
                  <span><strong>{money(b.rentFee)}</strong><small>net propriétaire : {shortMoney(b.ownerNetRent)}</small></span>
                  <span className={`tx-status status-${t.status}`}>
                    {t.status === 'receipt_generated' ? <CheckCircle2 size={14} /> : t.status === 'confirmed' ? <ShieldCheck size={14} /> : <Clock size={14} />}
                    {STATUS_LABELS[t.status]}
                  </span>
                  <span><strong>{dateFR(t.updatedAt)}</strong>{t.receiptNumber && <small>{t.receiptNumber}</small>}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section id="admin-diaspora" className="dash-section admin-section">
          <div className="dash-section-head">
            <div><h2>Demandes diaspora</h2><p>Projets d’achat de terrain depuis l’étranger, à transmettre aux agences. Aucune pièce d’identité n’est téléversée.</p></div>
          </div>
          {diasporaRequests.length ? (
            <div className="admin-diaspora-grid">
              {diasporaRequests.map((d) => (
                <article className="admin-diaspora-card" key={d.id}>
                  <header>
                    <span className="stat-icon gold"><Globe2 size={19} /></span>
                    <div><strong>{d.name}</strong><small>{dateFR(d.createdAt)}</small></div>
                    <span className={`badge ${d.status === 'forwarded' ? 'badge-green' : 'badge-warn'}`}>
                      {d.status === 'forwarded' ? 'Transmise' : 'À transmettre'}
                    </span>
                  </header>
                  <h3>{d.project}</h3>
                  <p><strong>{d.city}</strong> · {d.country} · Budget : {d.budget}</p>
                  <p className="admin-diaspora-contact">{d.whatsapp}<br />{d.email}</p>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={d.status === 'forwarded'}
                    onClick={() => forwardDiasporaRequest(d.id)}
                  >
                    <Send size={15} /> {d.status === 'forwarded' ? 'Déjà transmise' : 'Transmettre à l’agence'}
                  </button>
                </article>
              ))}
            </div>
          ) : <div className="dash-empty"><Globe2 size={26} /><p>Aucune demande diaspora reçue.</p></div>}
        </section>
      </div>
    </div>
  )
}
