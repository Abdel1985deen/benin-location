import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight, Box, Check, CheckCircle2, Drill, FileSignature, Home,
  Lightbulb, Paintbrush, PackageCheck, PlugZap, Sparkles, Truck, Wifi,
} from 'lucide-react'
import { useStore } from '../lib/store'
import { dateFR, money, todayISO } from '../lib/utils'

const services = [
  { id: 'transport', label: 'Camion de déménagement', icon: Truck, price: '45 000 FCFA' },
  { id: 'cartons', label: 'Cartons & Emballage', icon: Box, price: '12 000 FCFA' },
  { id: 'montage', label: 'Montage des meubles', icon: Drill, price: '25 000 FCFA' },
  { id: 'peinture', label: 'Peinture & rafraîchissement', icon: Paintbrush, price: '80 000 FCFA' },
  { id: 'menage', label: 'Nettoyage complet', icon: Sparkles, price: '18 000 FCFA' },
  { id: 'internet', label: 'Installation internet', icon: Wifi, price: '20 000 FCFA' },
]

const defaultSteps: Record<string, boolean> = {
  'Confirmer la date avec le propriétaire': false,
  'Résilier les anciens abonnements (eau, électricité)': false,
  'Préparer les cartons et étiqueter': false,
  'Organiser le transport le jour J': false,
  'Faire l’état des lieux d’entrée': false,
  'Mettre en service l’eau et l’électricité': false,
  'Installer les meubles et électroménager': false,
  'Vérifier les finitions et signaler les problèmes': false,
}

export default function Moving() {
  const { contractId } = useParams()
  const { currentUser, contracts, listings, movingPlans, addMovingPlan, toggleMovingStep } = useStore()
  const contract = contracts.find((c) => c.id === contractId)
  const listing = listings.find((l) => l.id === contract?.listingId)
  const existing = movingPlans.find((m) => m.contractId === contractId)
  const [form, setForm] = useState({
    moveDate: existing?.moveDate ?? (contract ? contract.startDate : todayISO()),
    currentAddress: existing?.currentAddress ?? '',
    notes: existing?.notes ?? '',
  })
  const [selected, setSelected] = useState<string[]>(existing?.services ?? ['transport', 'cartons'])
  const [created, setCreated] = useState(!!existing)

  if (!contract || !listing) return <div className="page not-found"><h1>Contrat introuvable</h1><Link to="/client" className="btn btn-primary">Mon espace</Link></div>

  const toggleService = (id: string) => setSelected((list) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addMovingPlan({
      contractId: contract.id, clientId: currentUser?.id ?? contract.clientId,
      moveDate: form.moveDate, currentAddress: form.currentAddress,
      services: selected, notes: form.notes, steps: defaultSteps,
    })
    setCreated(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const plan = movingPlans.find((m) => m.contractId === contractId)
  const done = plan ? Object.values(plan.steps).filter(Boolean).length : 0
  const progress = plan ? Math.round((done / Object.keys(plan.steps).length) * 100) : 0
  const estimate = selected.reduce((sum, id) => {
    const s = services.find((x) => x.id === id)
    return sum + Number(s?.price.replace(/\D/g, '') ?? 0)
  }, 0)

  return (
    <div className="page moving-page">
      <div className="moving-head">
        <div className="container">
          <Link to="/client" className="back-link"><ArrowRight size={16} className="flip" /> Mon espace client</Link>
          <span className="section-kicker"><PackageCheck size={14} /> Après la signature</span>
          <h1>Organisez votre déménagement<br />et votre aménagement.</h1>
          <p>Tout ce qu'il faut faire, du carton à la prise électrique, dans un seul parcours.</p>
        </div>
      </div>

      <div className="container moving-layout">
        <div className="moving-main">
          <div className="moving-contract-banner">
            <span><FileSignature size={20} /></span>
            <div><strong>{listing.title}</strong><small>Contrat signé · Bail de {contract.duration} mois · {money(contract.rent)}/mois</small></div>
            <span className="status-pill confirmed"><CheckCircle2 size={13} /> Signé</span>
          </div>

          {!created ? (
            <form onSubmit={submit} className="moving-form">
              <div className="publish-card">
                <h2><span>1</span> Votre déménagement</h2>
                <div className="field-row">
                  <label className="field"><span>Date du déménagement *</span><input type="date" value={form.moveDate} min={todayISO()} onChange={(e) => setForm({ ...form, moveDate: e.target.value })} required /></label>
                  <label className="field"><span>Adresse actuelle</span><input value={form.currentAddress} onChange={(e) => setForm({ ...form, currentAddress: e.target.value })} placeholder="Ancienne adresse ou quartier" /></label>
                </div>
                <label className="field"><span>Précisions utiles</span><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Ex. 2 chambres, accès difficile, ascenseur…" /></label>
              </div>

              <div className="publish-card">
                <h2><span>2</span> Services souhaités</h2>
                <p className="muted">Sélectionnez les prestations qui vous aideront à vous installer sereinement.</p>
                <div className="service-grid">
                  {services.map((s) => (
                    <button type="button" key={s.id} className={`service-card ${selected.includes(s.id) ? 'active' : ''}`} onClick={() => toggleService(s.id)}>
                      <span className="service-check">{selected.includes(s.id) && <Check size={13} />}</span>
                      <s.icon size={22} />
                      <strong>{s.label}</strong>
                      <small>{s.price}</small>
                    </button>
                  ))}
                </div>
                <div className="estimate"><span>Estimation indicative des prestations</span><strong>{money(estimate)}</strong></div>
              </div>

              <button className="btn btn-primary btn-lg btn-block" type="submit">Valider mon plan de déménagement <ArrowRight size={17} /></button>
            </form>
          ) : plan && (
            <>
              <div className="moving-success">
                <span><CheckCircle2 size={26} /></span>
                <div><strong>Votre plan est prêt !</strong><p>Déménagement prévu le {dateFR(plan.moveDate)} vers {listing.city}. L'agence peut vous accompagner pour les prestations choisies.</p></div>
              </div>
              <div className="checklist-card">
                <div className="checklist-head"><div><h2>Checklist d'installation</h2><p>{done} étape(s) terminée(s) sur {Object.keys(plan.steps).length}</p></div><strong>{progress}%</strong></div>
                <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
                <div className="checklist-items">
                  {Object.entries(plan.steps).map(([label, checked]) => (
                    <button key={label} className={checked ? 'done' : ''} onClick={() => toggleMovingStep(plan.id, label)}>
                      <span>{checked && <Check size={14} />}</span><small>{label}</small>
                    </button>
                  ))}
                </div>
              </div>
              <div className="selected-services">
                <h2>Prestations retenues</h2>
                <div className="service-pills">
                  {plan.services.map((id) => {
                    const s = services.find((x) => x.id === id)
                    return s ? <span key={id}><s.icon size={15} /> {s.label} <b>{s.price}</b></span> : null
                  })}
                </div>
                <div className="estimate"><span>Estimation totale</span><strong>{money(plan.services.reduce((sum, id) => sum + Number(services.find((x) => x.id === id)?.price.replace(/\D/g, '') ?? 0), 0))}</strong></div>
                <button className="btn btn-outline btn-sm" onClick={() => setCreated(false)}>Modifier mes choix</button>
              </div>
            </>
          )}
        </div>

        <aside className="moving-aside">
          <div className="aside-card">
            <h3><Home size={17} /> Votre nouveau chez-vous</h3>
            <img src={listing.images[0]} alt="" className="aside-photo" />
            <p><strong>{listing.title}</strong><br />{listing.address}, {listing.city}</p>
            <div className="aside-actions">
              <Link to={`/annonce/${listing.id}`} className="text-link">Revoir l'annonce <ArrowRight size={14} /></Link>
              <Link to={`/contrat-signe/${contract.id}`} className="text-link">Voir le contrat signé <ArrowRight size={14} /></Link>
            </div>
          </div>
          <div className="aside-card accent">
            <h3><Lightbulb size={17} /> Le saviez-vous ?</h3>
            <p>Au Bénin, pensez à faire l'état des lieux d'entrée avec le propriétaire et à relever les compteurs le jour de la remise des clés.</p>
          </div>
          <div className="aside-card">
            <h3><PlugZap size={17} /> Besoin d'un coup de main ?</h3>
            <p>Notre équipe peut coordonner les prestataires et suivre l'avancement avec vous.</p>
            <a href="mailto:contact@allocabenin.bj" className="text-link">Contacter l'agence <ArrowRight size={14} /></a>
          </div>
        </aside>
      </div>
    </div>
  )
}
