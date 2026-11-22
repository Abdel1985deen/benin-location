import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, Building2, Check, Globe2, HeartHandshake, LockKeyhole, Mail, MapPin,
  Phone, Send, ShieldCheck, UserRound,
} from 'lucide-react'
import { Logo } from '../components/Layout'
import { IMG, cityOptions } from '../lib/data'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { useStore } from '../lib/store'
import type { Role } from '../types'

type AccessType = Role | 'diaspora'

const roles: { id: AccessType; label: string; icon: typeof UserRound; text: string }[] = [
  { id: 'client', label: 'Client', icon: UserRound, text: 'Trouver, visiter et signer' },
  { id: 'owner', label: 'Propriétaire', icon: Building2, text: 'Publier et gérer mes biens' },
  { id: 'agency', label: 'Agence immobilière', icon: HeartHandshake, text: 'Piloter les locations' },
  {
    id: 'diaspora',
    label: 'Je suis hors du Bénin : acheter un terrain et construire',
    icon: Globe2,
    text: 'Confier mon projet à l’agence',
  },
]

const countries = ['France', 'Belgique', 'Suisse', 'Canada', 'États-Unis', 'Côte d’Ivoire', 'Ghana', 'Nigeria', 'Togo', 'Sénégal', 'Autre pays']
const budgets = ['Moins de 5 000 000 FCFA', '5 000 000 – 10 000 000 FCFA', '10 000 000 – 20 000 000 FCFA', 'Plus de 20 000 000 FCFA']
const projects = ['Terrain seul', 'Maison individuelle', 'Villa avec cour', 'Résidence / plusieurs lots', 'Projet commercial']

export default function Auth() {
  const { register, login, demoLogin, submitDiasporaRequest } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialMode = params.get('mode') === 'register' || params.get('type') === 'diaspora' ? 'register' : 'login'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [role, setRole] = useState<AccessType>(
    params.get('type') === 'diaspora' ? 'diaspora' : (params.get('role') as AccessType) || 'client',
  )
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: 'Cotonou', password: '', agency: '' })
  const [diaspora, setDiaspora] = useState({
    name: '', country: 'France', city: 'Cotonou', budget: budgets[1], project: projects[1],
    whatsapp: '', email: '',
  })
  const [diasporaSent, setDiasporaSent] = useState(false)
  const [error, setError] = useState('')
  const next = params.get('next')

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))
  const setDiasporaField = (key: string, value: string) => setDiaspora((f) => ({ ...f, [key]: value }))

  const pickRole = (value: AccessType) => {
    setRole(value)
    setDiasporaSent(false)
    setError('')
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (role === 'diaspora') return
    if (mode === 'login') {
      const user = login(form.email, form.password)
      if (!user) return setError('E-mail ou mot de passe incorrect.')
      navigate(next || (user.role === 'owner' ? '/proprietaire' : user.role === 'agency' ? '/agence' : '/client'))
      return
    }
    if (!form.name.trim() || !form.phone.trim() || form.password.length < 6) {
      return setError('Renseignez votre nom, votre téléphone et un mot de passe d’au moins 6 caractères.')
    }
    register({
      name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(),
      city: form.city, password: form.password, role,
      ...(role === 'agency' ? { agency: form.agency || form.name } : {}),
    })
    navigate(next || (role === 'owner' ? '/proprietaire' : role === 'agency' ? '/agence' : '/client'))
  }

  const submitDiaspora = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!diaspora.name.trim() || !diaspora.country.trim() || !diaspora.budget || !diaspora.project || !diaspora.whatsapp.trim() || !diaspora.email.trim()) {
      return setError('Renseignez tous les champs. Aucune pièce d’identité n’est demandée dans cette version.')
    }
    submitDiasporaRequest({
      name: diaspora.name.trim(), country: diaspora.country.trim(), city: diaspora.city,
      budget: diaspora.budget, project: diaspora.project,
      whatsapp: diaspora.whatsapp.trim(), email: diaspora.email.trim(),
    })
    setDiasporaSent(true)
  }

  const quickDemo = (r: Role) => {
    demoLogin(r)
    navigate(next || (r === 'owner' ? '/proprietaire' : r === 'agency' ? '/agence' : '/client'))
  }

  return (
    <div className="auth-page">
      <div className="auth-aside">
        <Logo light />
        <div className="auth-aside-content">
          <span className="section-kicker light"><ShieldCheck size={14} /> Espace sécurisé</span>
          <h2>Tout votre parcours immobilier, au même endroit.</h2>
          <p>{SITE_TAGLINE}. Annonces, visites, contrats et déménagement : {SITE_NAME} vous accompagne à chaque étape.</p>
          <div className="auth-features">
            <div><Check size={16} /> Annonces vérifiées par l'agence</div>
            <div><Check size={16} /> Visite virtuelle 360°</div>
            <div><Check size={16} /> Signature électronique du contrat</div>
            <div><Check size={16} /> Suivi du déménagement et de l'aménagement</div>
            <div><Check size={16} /> Projet foncier diaspora confié à l'agence</div>
          </div>
        </div>
        <div className="auth-aside-photo"><img src={IMG.living2} alt="Intérieur moderne" /></div>
      </div>

      <div className="auth-main">
        <div className="auth-top"><Link to="/">← Retour à l'accueil</Link></div>
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); pickRole('client') }}>Connexion</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Inscription</button>
          </div>
          <h1>{mode === 'login' ? 'Bon retour parmi nous 👋' : role === 'diaspora' ? 'Votre projet au Bénin' : 'Créez votre compte'}</h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Connectez-vous pour accéder à votre espace.'
              : role === 'diaspora'
                ? 'Décrivez votre projet : l’agence ALLOCA BENIN vous rappelle et s’occupe de la suite.'
                : `Rejoignez la communauté ${SITE_NAME} en une minute.`}
          </p>

          {mode === 'register' && (
            <div className="role-picker">
              {roles.map((r) => (
                <button
                  key={r.id}
                  className={`${role === r.id ? 'active' : ''} ${r.id === 'diaspora' ? 'role-diaspora' : ''}`}
                  onClick={() => pickRole(r.id)}
                >
                  <r.icon size={19} /><strong>{r.label}</strong><small>{r.text}</small>
                </button>
              ))}
            </div>
          )}

          {mode === 'register' && role === 'diaspora' ? (
            diasporaSent ? (
              <div className="success-box diaspora-success">
                <span><Check size={24} /></span>
                <strong>Demande transmise à l’agence ✅</strong>
                <p>Merci {diaspora.name.split(' ')[0]}. Votre projet à {diaspora.city} est enregistré. L’agence {SITE_NAME} vous contactera sur le WhatsApp indiqué.</p>
                <p className="form-note">Aucune pièce d’identité n’est demandée dans cette version.</p>
                <Link to="/" className="btn btn-outline btn-sm">Retour à l’accueil</Link>
              </div>
            ) : (
              <form onSubmit={submitDiaspora} className="auth-form diaspora-form">
                <label><span>Nom complet</span><div className="input-icon"><UserRound size={17} /><input value={diaspora.name} onChange={(e) => setDiasporaField('name', e.target.value)} placeholder="Ex. Kofi Mensah" required /></div></label>
                <label><span>Pays de résidence</span><div className="input-icon"><Globe2 size={17} /><input list="pays-diaspora" value={diaspora.country} onChange={(e) => setDiasporaField('country', e.target.value)} placeholder="Ex. France" required /></div></label>
                <datalist id="pays-diaspora">{countries.map((c) => <option key={c} value={c} />)}</datalist>
                <label><span>Ville visée au Bénin</span><div className="input-icon"><MapPin size={17} /><select value={diaspora.city} onChange={(e) => setDiasporaField('city', e.target.value)}>{cityOptions.map((c) => <option key={c}>{c}</option>)}</select></div></label>
                <label><span>Budget prévu</span><div className="input-icon"><Building2 size={17} /><select value={diaspora.budget} onChange={(e) => setDiasporaField('budget', e.target.value)}>{budgets.map((b) => <option key={b}>{b}</option>)}</select></div></label>
                <label><span>Type de projet</span><div className="input-icon"><Building2 size={17} /><select value={diaspora.project} onChange={(e) => setDiasporaField('project', e.target.value)}>{projects.map((p) => <option key={p}>{p}</option>)}</select></div></label>
                <label><span>WhatsApp</span><div className="input-icon"><Phone size={17} /><input type="tel" value={diaspora.whatsapp} onChange={(e) => setDiasporaField('whatsapp', e.target.value)} placeholder="+33 6 00 00 00 00" required /></div></label>
                <label><span>Adresse e-mail</span><div className="input-icon"><Mail size={17} /><input type="email" value={diaspora.email} onChange={(e) => setDiasporaField('email', e.target.value)} placeholder="vous@exemple.com" required /></div></label>
                <p className="form-note"><ShieldCheck size={13} /> Accès confié à l’agence. Aucune pièce d’identité à téléverser dans cette version.</p>
                {error && <div className="form-error">{error}</div>}
                <button className="btn btn-primary btn-block btn-lg" type="submit"><Send size={17} /> Envoyer mon projet à l’agence</button>
              </form>
            )
          ) : (
            <>
              <form onSubmit={submit} className="auth-form">
                {mode === 'register' && (
                  <>
                    <label><span>Nom complet</span><div className="input-icon"><UserRound size={17} /><input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex. Kofi Mensah" required /></div></label>
                    {role === 'agency' && <label><span>Nom de l'agence immobilière</span><div className="input-icon"><Building2 size={17} /><input value={form.agency} onChange={(e) => set('agency', e.target.value)} placeholder="Ex. Agence ALLOCA" /></div></label>}
                    <label><span>Téléphone</span><div className="input-icon"><Phone size={17} /><input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+229 97 00 00 00" required /></div></label>
                    <label><span>Ville</span><div className="input-icon"><MapPin size={17} /><select value={form.city} onChange={(e) => set('city', e.target.value)}>{cityOptions.map((c) => <option key={c}>{c}</option>)}</select></div></label>
                  </>
                )}
                <label><span>Adresse e-mail</span><div className="input-icon"><Mail size={17} /><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="vous@exemple.bj" required /></div></label>
                <label><span>Mot de passe</span><div className="input-icon"><LockKeyhole size={17} /><input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="6 caractères minimum" required /></div></label>
                {error && <div className="form-error">{error}</div>}
                <button className="btn btn-primary btn-block btn-lg" type="submit">{mode === 'login' ? 'Se connecter' : 'Créer mon compte'} <ArrowRight size={17} /></button>
              </form>

              <div className="demo-block">
                <span>Ou essayez avec un compte démo</span>
                <div className="demo-buttons">
                  <button onClick={() => quickDemo('client')}><UserRound size={15} /> Client</button>
                  <button onClick={() => quickDemo('owner')}><Building2 size={15} /> Propriétaire</button>
                  <button onClick={() => quickDemo('agency')}><HeartHandshake size={15} /> Agence immobilière</button>
                </div>
                <small>Identifiants démo : client@demo.bj / proprio@demo.bj / agence@demo.bj — mot de passe <b>demo1234</b></small>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
