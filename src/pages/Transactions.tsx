import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Building2, Check, CheckCircle2, Clock, FileText, Info,
  Printer, ShieldCheck, UserRound,
} from 'lucide-react'
import DashboardShell, { agencyLinks, clientLinks, ownerLinks } from '../components/DashboardShell'
import { GUARANTEE_MONTHS } from '../lib/site'
import { useStore } from '../lib/store'
import {
  FEE_RULES, STATUS_LABELS, TRANSACTION_STEPS, nextActor, nextStatus, transactionBreakdown,
} from '../lib/transactions'
import { dateFR, money } from '../lib/utils'
import type { Transaction, TransactionStatus } from '../types'

function Timeline({ txn, names }: { txn: Transaction; names: Record<string, string> }) {
  return (
    <ol className="tx-timeline">
      {TRANSACTION_STEPS.map((step) => {
        const event = txn.events.find((e) => e.status === step.status)
        const done = Boolean(event)
        const current = txn.status === step.status
        return (
          <li key={step.status} className={`${done ? 'done' : ''} ${current ? 'current' : ''}`}>
            <span className="tx-dot">{done ? <Check size={13} /> : <Clock size={12} />}</span>
            <span className="tx-step-label"><strong>{step.label}</strong><small>{step.hint}</small></span>
            <span className="tx-step-date">
              {event ? dateFR(event.at) : 'À venir'}
              {event && <small>{names[event.by] ?? 'Utilisateur'}</small>}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function Transactions() {
  const { currentUser, users, listings, transactions, advanceTransactionStep } = useStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'done'>('all')

  useEffect(() => {
    if (!currentUser) navigate('/connexion?next=/transactions')
  }, [currentUser, navigate])

  if (!currentUser) return null

  const role = currentUser.role
  const links = role === 'client' ? clientLinks : role === 'agency' ? agencyLinks : ownerLinks
  const dashPath = role === 'client' ? '/client' : role === 'agency' ? '/agence' : '/proprietaire'
  const names = Object.fromEntries(users.map((u) => [u.id, u.name])) as Record<string, string>

  const mine = transactions.filter((t) =>
    role === 'agency' || (role === 'client' ? t.clientId === currentUser.id : t.ownerId === currentUser.id),
  )
  const visible = mine.filter((t) =>
    filter === 'all'
      || (filter === 'ongoing' && t.status !== 'receipt_generated')
      || (filter === 'done' && t.status === 'receipt_generated'),
  )

  const actionFor = (txn: Transaction): { label: string; run: () => void } | null => {
    const following = nextStatus(txn.status)
    if (!following) return null
    const actor = nextActor(txn.status)
    const isClientAction = actor === 'client' && role === 'client'
    const isOwnerAction = actor === 'owner' && (role === 'owner' || role === 'agency')
    if (!isClientAction && !isOwnerAction) return null

    let label = ''
    if (following === 'advance_paid') label = `Simuler le paiement de l’avance (${money(txn.rent * GUARANTEE_MONTHS)})`
    else if (following === 'confirmed') label = 'Confirmer la transaction'
    else if (following === 'rent_paid') label = `Simuler le paiement du loyer (${money(txn.rent)})`
    else label = 'Générer le reçu'

    return { label, run: () => advanceTransactionStep(txn.id) }
  }

  const waitingFor = (txn: Transaction): string => {
    const actor = nextActor(txn.status)
    if (!actor) return 'Transaction terminée'
    if (actor === 'client') return role === 'client' ? 'À vous de continuer' : 'En attente du client'
    return role === 'client' ? 'En attente du propriétaire ou de l’agence' : 'À vous de confirmer'
  }

  const statusPill = (status: TransactionStatus) => (
    <span className={`tx-status status-${status}`}>
      {status === 'receipt_generated' ? <CheckCircle2 size={14} /> : status === 'request' || status === 'advance_paid' ? <Clock size={14} /> : <ShieldCheck size={14} />}
      {STATUS_LABELS[status]}
    </span>
  )

  return (
    <DashboardShell
      title="Suivi des transactions"
      subtitle="Client → propriétaire ou agence · version démo, aucun paiement réel."
      links={links}
      action={<Link to={dashPath} className="btn btn-outline btn-sm">Mon espace <ArrowRight size={15} /></Link>}
    >
      <div className="tx-demo-banner">
        <Info size={18} />
        <div>
          <strong>Version démo : paiements simulés</strong>
          <p>Les étapes et les montants sont enregistrés localement. Aucun virement, aucune carte bancaire et aucune clé de paiement ne sont utilisés.</p>
        </div>
      </div>

      <div className="tx-fee-grid">
        <div className="tx-fee-card">
          <span className="tx-fee-icon teal"><Building2 size={20} /></span>
          <strong>{FEE_RULES.rentFeeRate * 100} % sur le loyer</strong>
          <p>Frais prélevés sur le loyer reçu par le propriétaire.</p>
        </div>
        <div className="tx-fee-card">
          <span className="tx-fee-icon gold"><UserRound size={20} /></span>
          <strong>Commission d’avance 50 / 50</strong>
          <p>Le solde de l’avance après part agence est partagé à parts égales entre le client et le propriétaire.</p>
        </div>
        <div className="tx-fee-card">
          <span className="tx-fee-icon coral"><ShieldCheck size={20} /></span>
          <strong>{FEE_RULES.agencyAdvanceRate * 100} % pour les agences</strong>
          <p>Prélèvement sur l’avance de {GUARANTEE_MONTHS} mois pour l’agence qui accompagne la transaction.</p>
        </div>
      </div>

      <section className="dash-section" id="transactions">
        <div className="dash-section-head">
          <div><h2>Mes transactions</h2><p>Chaque étape est validée successivement par le client, puis par le propriétaire ou l’agence.</p></div>
          <label className="tx-filter">
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">Toutes ({mine.length})</option>
              <option value="ongoing">En cours</option>
              <option value="done">Terminées</option>
            </select>
          </label>
        </div>

        {visible.length ? (
          <div className="tx-list">
            {visible.map((txn) => {
              const listing = listings.find((l) => l.id === txn.listingId)
              const b = transactionBreakdown(txn.rent, txn.monthsAdvance)
              const action = actionFor(txn)
              const other = role === 'client'
                ? `${names[txn.ownerId] ?? 'Propriétaire'} · ${txn.agencyId ? names[txn.agencyId] ?? 'Agence' : 'Agence'}`
                : names[txn.clientId] ?? 'Client'

              return (
                <article className="tx-card" key={txn.id}>
                  <header className="tx-card-head">
                    <span className="tx-property-icon"><FileText size={21} /></span>
                    <div className="tx-property">
                      <strong>{listing?.title ?? 'Bien'}</strong>
                      <small>{listing?.city ?? 'Bénin'} · {money(txn.rent)}/mois · avance {txn.monthsAdvance} mois</small>
                      <small>{role === 'client' ? 'Client → ' : ''}{other}</small>
                    </div>
                    <div className="tx-head-right">
                      {statusPill(txn.status)}
                      <small>Mise à jour le {dateFR(txn.updatedAt)}</small>
                    </div>
                  </header>

                  <Timeline txn={txn} names={names} />

                  <div className="tx-card-body">
                    <div className="tx-breakdown">
                      <h4>Répartition simulée</h4>
                      <dl>
                        <div><dt>Loyer mensuel</dt><dd>{money(b.monthlyRent)}</dd></div>
                        <div><dt>Avance de garantie ({txn.monthsAdvance} mois)</dt><dd>{money(b.advance)}</dd></div>
                        <div><dt>Frais plateforme ({FEE_RULES.rentFeeRate * 100} % du loyer)</dt><dd>- {money(b.rentFee)}</dd></div>
                        <div className="highlight"><dt>Loyer net pour le propriétaire</dt><dd>{money(b.ownerNetRent)}</dd></div>
                        <div><dt>Part agence ({FEE_RULES.agencyAdvanceRate * 100} % de l’avance)</dt><dd>{money(b.agencyShare)}</dd></div>
                        <div><dt>Commission d’avance restante</dt><dd>{money(b.sharedCommission)}</dd></div>
                        <div><dt>· Part client (50 %)</dt><dd>{money(b.clientShare)}</dd></div>
                        <div><dt>· Part propriétaire (50 %)</dt><dd>{money(b.ownerShare)}</dd></div>
                      </dl>
                      <p className="form-note">Simulation indicative. Aucun montant n’est débité ou crédité réellement.</p>
                    </div>

                    <div className="tx-action-area">
                      {txn.status === 'receipt_generated' ? (
                        <div className="tx-receipt">
                          <span><CheckCircle2 size={26} /></span>
                          <div><strong>Reçu {txn.receiptNumber}</strong><small>Émis le {dateFR(txn.updatedAt)} · {money(txn.rent)} de loyer · {money(b.advance)} d’avance</small></div>
                          <button className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={15} /> Imprimer</button>
                        </div>
                      ) : action ? (
                        <>
                          <button className="btn btn-primary btn-block" onClick={action.run}>{action.label}</button>
                          <p className="form-note"><ShieldCheck size={13} /> Action simulée, sans paiement réel.</p>
                        </>
                      ) : (
                        <div className="tx-waiting"><Clock size={18} /><strong>{waitingFor(txn)}</strong><p>La prochaine étape se débloquera automatiquement ici.</p></div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="dash-empty"><FileText size={26} /><p>Aucune transaction dans cette catégorie.</p><Link to="/annonces" className="btn btn-primary btn-sm">Explorer les annonces</Link></div>
        )}
      </section>
    </DashboardShell>
  )
}
