import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, FileSignature, LockKeyhole,
  MapPin, ShieldCheck, UserRound, Users,
} from 'lucide-react'
import SignaturePad from '../components/SignaturePad'
import { useStore } from '../lib/store'
import { dateFR, money, todayISO } from '../lib/utils'

const steps = ['Le bail', 'Le locataire', 'Le garant', 'Signature']

export default function Contract() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listings, users, currentUser, addContract } = useStore()
  const listing = listings.find((l) => l.id === id)
  const [step, setStep] = useState(0)
  const [signature, setSignature] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    startDate: todayISO(), duration: '12', deposit: listing ? String(listing.price) : '',
    firstName: '', lastName: '', birthDate: '', birthPlace: '', nationality: 'Béninoise',
    phone: '', email: '', job: '', guarantorName: '', guarantorPhone: '', guarantorRelation: '',
  })

  useEffect(() => {
    if (currentUser) {
      const parts = currentUser.name.split(' ')
      setForm((f) => ({
        ...f,
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' ') || currentUser.name,
        phone: currentUser.phone, email: currentUser.email,
      }))
    }
  }, [currentUser])

  useEffect(() => { if (!currentUser) navigate(`/connexion?next=/contrat/${id}`) }, [currentUser, navigate, id])
  if (!currentUser || !listing) return null
  if (listing.sale || listing.status !== 'approved') {
    return (
      <div className="page not-found">
        <h1>Contrat indisponible</h1>
        <p>{listing.sale ? 'Ce bien est proposé à la vente, pas à la location.' : 'Ce bien n’est pas disponible pour la signature en ce moment.'}</p>
        <Link to={`/annonce/${listing.id}`} className="btn btn-primary">Retour à l'annonce</Link>
      </div>
    )
  }

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const nextStep = () => {
    setError('')
    if (step === 1 && (!form.firstName || !form.lastName || !form.phone || !form.email)) {
      return setError('Renseignez le nom, le téléphone et l’e-mail du locataire.')
    }
    if (step === 2 && (!form.guarantorName || !form.guarantorPhone)) {
      return setError('Renseignez le garant et son téléphone.')
    }
    setStep((s) => Math.min(3, s + 1))
  }

  const sign = () => {
    if (!signature) return setError('Veuillez signer dans le cadre pour finaliser le contrat.')
    const contract = addContract({
      listingId: listing.id, clientId: currentUser.id, ownerId: listing.ownerId,
      startDate: form.startDate, duration: Number(form.duration), rent: listing.price,
      deposit: Number(form.deposit),
      tenant: {
        firstName: form.firstName, lastName: form.lastName, birthDate: form.birthDate,
        birthPlace: form.birthPlace, nationality: form.nationality, phone: form.phone,
        email: form.email, job: form.job,
      },
      guarantor: { name: form.guarantorName, phone: form.guarantorPhone, relation: form.guarantorRelation },
      signature,
    })
    navigate(`/demenagement/${contract.id}`)
  }

  return (
    <div className="page contract-page">
      <div className="contract-head">
        <div className="container">
          <Link to={`/annonce/${listing.id}`} className="back-link"><ArrowLeft size={16} /> Retour à l'annonce</Link>
          <span className="section-kicker"><FileSignature size={14} /> Contrat de location en ligne</span>
          <h1>Finalisez votre location, sans papier.</h1>
          <p>Le bail est généré automatiquement à partir de l'annonce et de vos informations.</p>
        </div>
      </div>

      <div className="container contract-layout">
        <div className="contract-main">
          <div className="stepper">
            {steps.map((s, i) => <button key={s} className={i === step ? 'active' : i < step ? 'done' : ''} onClick={() => i < step && setStep(i)}>
              <span>{i < step ? <Check size={14} /> : i + 1}</span><small>{s}</small>
            </button>)}
          </div>

          <div className="contract-card">
            {error && <div className="form-error">{error}</div>}

            {step === 0 && <>
              <h2>Paramètres du bail</h2>
              <p className="muted">Vérifiez les informations du logement et ajustez la durée.</p>
              <div className="lease-summary">
                <img src={listing.images[0]} alt="" />
                <div><strong>{listing.title}</strong><small><MapPin size={13} /> {listing.city}, {listing.neighborhood}</small><span>{money(listing.price)} / mois</span></div>
              </div>
              <div className="field-row">
                <label className="field"><span>Date de prise d'effet</span><input type="date" value={form.startDate} min={todayISO()} onChange={(e) => set('startDate', e.target.value)} /></label>
                <label className="field"><span>Durée du bail (mois)</span><select value={form.duration} onChange={(e) => set('duration', e.target.value)}>{[6, 12, 24, 36].map((d) => <option key={d} value={d}>{d} mois</option>)}</select></label>
              </div>
              <label className="field"><span>Dépôt de garantie (FCFA)</span><input type="number" value={form.deposit} onChange={(e) => set('deposit', e.target.value)} /></label>
              <div className="info-box"><ShieldCheck size={17} /> Le dépôt de garantie correspond généralement à un mois de loyer. Il sera consigné auprès de l'agence.</div>
            </>}

            {step === 1 && <>
              <h2>Identité du locataire</h2>
              <p className="muted">Ces informations apparaîtront sur le contrat signé.</p>
              <div className="field-row">
                <label className="field"><span>Prénom *</span><input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} /></label>
                <label className="field"><span>Nom *</span><input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} /></label>
              </div>
              <div className="field-row">
                <label className="field"><span>Date de naissance</span><input type="date" value={form.birthDate} onChange={(e) => set('birthDate', e.target.value)} /></label>
                <label className="field"><span>Lieu de naissance</span><input value={form.birthPlace} onChange={(e) => set('birthPlace', e.target.value)} placeholder="Cotonou" /></label>
              </div>
              <div className="field-row">
                <label className="field"><span>Nationalité</span><input value={form.nationality} onChange={(e) => set('nationality', e.target.value)} /></label>
                <label className="field"><span>Profession</span><input value={form.job} onChange={(e) => set('job', e.target.value)} placeholder="Enseignant(e), commerçant(e)…" /></label>
              </div>
              <div className="field-row">
                <label className="field"><span>Téléphone *</span><input value={form.phone} onChange={(e) => set('phone', e.target.value)} /></label>
                <label className="field"><span>E-mail *</span><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></label>
              </div>
            </>}

            {step === 2 && <>
              <h2>Garant du locataire</h2>
              <p className="muted">Une personne physique ou morale qui se porte garante des obligations du bail.</p>
              <label className="field"><span>Nom complet du garant *</span><div className="input-icon"><Users size={17} /><input value={form.guarantorName} onChange={(e) => set('guarantorName', e.target.value)} placeholder="Ex. Jean Dossou" /></div></label>
              <div className="field-row">
                <label className="field"><span>Téléphone *</span><input value={form.guarantorPhone} onChange={(e) => set('guarantorPhone', e.target.value)} placeholder="+229 97 00 00 00" /></label>
                <label className="field"><span>Lien avec le locataire</span><input value={form.guarantorRelation} onChange={(e) => set('guarantorRelation', e.target.value)} placeholder="Père, ami, employeur…" /></label>
              </div>
              <div className="info-box"><UserRound size={17} /> Le garant recevra une notification lors de la signature du contrat.</div>
            </>}

            {step === 3 && <>
              <h2>Signature électronique</h2>
              <p className="muted">En signant, vous confirmez avoir lu et accepté les conditions du bail.</p>
              <div className="contract-preview">
                <h3>CONTRAT DE LOCATION D'IMMEUBLE</h3>
                <p><strong>Logement :</strong> {listing.title}, {listing.address}, {listing.city}</p>
                <p><strong>Locataire :</strong> {form.firstName} {form.lastName} — {form.phone}</p>
                <p><strong>Propriétaire :</strong> {users.find((u) => u.id === listing.ownerId)?.name}</p>
                <p><strong>Durée :</strong> {form.duration} mois à compter du {dateFR(form.startDate)}</p>
                <p><strong>Loyer :</strong> {money(listing.price)} par mois · <strong>Dépôt :</strong> {money(Number(form.deposit))}</p>
                <p><strong>Garant :</strong> {form.guarantorName} ({form.guarantorPhone})</p>
                <p className="preview-legal">Le present contrat est établi en application des dispositions du Code civil et de la loi relative à la location immobilière en vigueur au Bénin. Le locataire s'engage à respecter les clauses du bail et à entretenir le bien.</p>
              </div>
              <span className="field-label">Votre signature</span>
              <SignaturePad value={signature} onChange={setSignature} />
              <div className="info-box"><LockKeyhole size={17} /> Signature enregistrée avec horodatage dans votre espace client.</div>
            </>}

            <div className="contract-nav">
              {step > 0 ? <button className="btn btn-outline" onClick={() => setStep(step - 1)}><ArrowLeft size={16} /> Retour</button> : <span />}
              {step < 3
                ? <button className="btn btn-primary" onClick={nextStep}>Continuer <ArrowRight size={16} /></button>
                : <button className="btn btn-accent btn-lg" onClick={sign}><CheckCircle2 size={18} /> Signer et finaliser</button>}
            </div>
          </div>
        </div>

        <aside className="contract-aside">
          <div className="aside-card">
            <h3><ShieldCheck size={17} /> Contrat sécurisé</h3>
            <p>Les données du bail sont conservées dans votre espace et accessibles à l'agence et au propriétaire.</p>
            <ul>
              <li><Check size={15} /> Génération automatique</li>
              <li><Check size={15} /> Signature électronique</li>
              <li><Check size={15} /> Accès permanent dans votre espace</li>
            </ul>
          </div>
          <div className="aside-card dark">
            <h3>Et après ?</h3>
            <p>Une fois le contrat signé, vous accéderez directement au module de déménagement et d'aménagement avec une checklist personnalisée.</p>
            <span className="aside-arrow">→</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
