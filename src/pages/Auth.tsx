import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight, Building2, Check, HeartHandshake, LockKeyhole, Mail, MapPin,
  Phone, ShieldCheck, UserRound,
} from 'lucide-react'
import { Logo } from '../components/Layout'
import { IMG, cityOptions } from '../lib/data'
import { SITE_NAME, SITE_TAGLINE } from '../lib/site'
import { useStore } from '../lib/store'
import type { Role } from '../types'

const roles: { id: Role; label: string; icon: typeof UserRound; text: string }[] = [
  { id: 'client', label: 'Client', icon: UserRound, text: 'Trouver, visiter et signer' },
  { id: 'owner', label: 'Propriétaire', icon: Building2, text: 'Publier et gérer mes biens' },
  { id: 'agency', label: 'Agence immobilière', icon: HeartHandshake, text: 'Piloter les locations' },
]

export default function Auth() {
  const { register, login, demoLogin } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const initialMode = params.get('mode') === 'register' ? 'register' : 'login'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [role, setRole] = useState<Role>((params.get('role') as Role) || 'client')
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: 'Cotonou', password: '', agency: '' })
  const [error, setError] = useState('')
  const next = params.get('next')

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
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
          </div>
        </div>
        <div className="auth-aside-photo"><img src={IMG.living2} alt="Intérieur moderne" /></div>
      </div>

      <div className="auth-main">
        <div className="auth-top"><Link to="/">← Retour à l'accueil</Link></div>
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError('') }}>Connexion</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError('') }}>Inscription</button>
          </div>
          <h1>{mode === 'login' ? 'Bon retour parmi nous 👋' : 'Créez votre compte'}</h1>
          <p className="auth-subtitle">{mode === 'login' ? 'Connectez-vous pour accéder à votre espace.' : `Rejoignez la communauté ${SITE_NAME} en une minute.`}</p>

          {mode === 'register' && (
            <div className="role-picker">
              {roles.map((r) => (
                <button key={r.id} className={role === r.id ? 'active' : ''} onClick={() => setRole(r.id)}>
                  <r.icon size={19} /><strong>{r.label}</strong><small>{r.text}</small>
                </button>
              ))}
            </div>
          )}

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
        </div>
      </div>
    </div>
  )
}
