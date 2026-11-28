import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import {
  ArrowRight, BadgeCheck, Building2, CalendarDays, Check, FileSignature,
  Search, TrendingUp, Truck,
} from 'lucide-react'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Entry from './pages/Entry'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Lands from './pages/Lands'
import PropertyDetail from './pages/PropertyDetail'
import Auth from './pages/Auth'
import ClientDashboard from './pages/ClientDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import AgencyDashboard from './pages/AgencyDashboard'
import Publish from './pages/Publish'
import Contract from './pages/Contract'
import Moving from './pages/Moving'
import Messages from './pages/Messages'
import Transactions from './pages/Transactions'
import Admin from './pages/Admin'
import ContractView from './pages/ContractView'
import { IMG } from './lib/data'

function OwnerLanding() {
  return (
    <div className="page">
      <section className="owner-hero">
        <div className="container owner-hero-grid">
          <div>
            <span className="section-kicker"><Building2 size={14} /> Espace propriétaire</span>
            <h1>Faites travailler<br />votre patrimoine.</h1>
            <p>Publiez votre bien, recevez des demandes sérieuses et laissez l'agence gérer la visibilité, les visites et le suivi du contrat.</p>
            <div className="owner-hero-actions">
              <Link to="/publier" className="btn btn-primary btn-lg">Publier une annonce <ArrowRight size={17} /></Link>
              <Link to="/connexion?role=owner" className="btn btn-outline btn-lg">J'ai déjà un compte</Link>
            </div>
            <div className="owner-hero-points">
              <span><Check size={15} /> Publication gratuite</span>
              <span><Check size={15} /> Visibilité géolocalisée</span>
              <span><Check size={15} /> Suivi en temps réel</span>
            </div>
          </div>
          <div className="owner-hero-visual">
            <img src={IMG.house1} alt="Propriété mise en location" />
            <div className="floating-card float-verified"><span className="float-icon green"><BadgeCheck size={20} /></span><div><strong>Annonce vérifiée</strong><small>Validée par l'agence</small></div></div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-head center"><div><span className="section-kicker">Accompagnement complet</span><h2>De la publication à la signature.</h2></div></div>
          <div className="steps-grid four">
            {[
              { icon: Search, title: 'Publiez', text: 'Décrivez votre bien, ajoutez des photos et géolocalisez-le.' },
              { icon: BadgeCheck, title: 'L’agence valide', text: 'Nous vérifions l’annonce avant sa mise en ligne.' },
              { icon: CalendarDays, title: 'Recevez des visites', text: 'Gérez les demandes et confirmez les créneaux.' },
              { icon: FileSignature, title: 'Signez', text: 'Le contrat et le suivi sont centralisés dans votre espace.' },
            ].map((s, i) => <div className="step-card" key={s.title}><span className="step-number">0{i + 1}</span><span className="step-icon"><s.icon size={23} /></span><h3>{s.title}</h3><p>{s.text}</p></div>)}
          </div>
        </div>
      </section>
      <section className="section section-tint">
        <div className="container owner-benefits">
          {[
            { icon: TrendingUp, title: '+35% de visibilité', text: 'Vos annonces apparaissent dans les recherches géolocalisées de tous les clients.' },
            { icon: CalendarDays, title: 'Visites organisées', text: 'L’agence filtre et coordonne les rendez-vous à votre place.' },
            { icon: FileSignature, title: 'Contrats tracés', text: 'Chaque bail signé reste accessible dans votre tableau de bord.' },
            { icon: Truck, title: 'Location jusqu’au bout', text: 'Le nouveau locataire est accompagné jusque dans son aménagement.' },
          ].map((b) => <div key={b.title}><span><b.icon size={22} /></span><h3>{b.title}</h3><p>{b.text}</p></div>)}
        </div>
      </section>
    </div>
  )
}

function NotFound() {
  return <div className="page not-found"><span className="not-found-code">404</span><h1>Cette page n'existe pas</h1><p>Le lien est peut-être obsolète. Revenez à l'accueil pour continuer votre recherche.</p><Link to="/" className="btn btn-primary">Retour à l'accueil <ArrowRight size={16} /></Link></div>
}

const CLE_ENTREE = 'alloca-entree'

export default function App() {
  const [entre, setEntre] = useState(() => {
    try { return sessionStorage.getItem(CLE_ENTREE) === '1' } catch { return false }
  })
  const entrer = () => {
    try { sessionStorage.setItem(CLE_ENTREE, '1') } catch { /* navigation privée */ }
    setEntre(true)
  }
  if (!entre) return <Entry onEnter={entrer} />

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/connexion" element={<div className="route-fade"><Auth /></div>} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/annonces" element={<Explore />} />
          <Route path="/terrains" element={<Lands />} />
          <Route path="/annonce/:id" element={<PropertyDetail />} />
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/proprietaire" element={<OwnerDashboard />} />
          <Route path="/agence" element={<AgencyDashboard />} />
          <Route path="/publier" element={<Publish />} />
          <Route path="/devenir-proprietaire" element={<OwnerLanding />} />
          <Route path="/contrat/:id" element={<Contract />} />
          <Route path="/contrat-signe/:contractId" element={<ContractView />} />
          <Route path="/demenagement/:contractId" element={<Moving />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
