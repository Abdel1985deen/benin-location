import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Bell, Building2, ChevronDown, Heart, LayoutDashboard, LogOut, Menu,
  MessageCircle, Search, ShieldCheck, UserRound, X,
} from 'lucide-react'
import { useStore } from '../lib/store'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className={`logo ${light ? 'logo-light' : ''}`} aria-label="Kado Immo, accueil">
      <span className="logo-mark"><span></span><span></span><span></span></span>
      <span className="logo-text">Kado<span>Immo</span></span>
    </Link>
  )
}

export default function Layout({ children }: { children?: React.ReactNode }) {
  const { currentUser, logout, favorites, notifications, messages, markAllRead } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()

  const favCount = currentUser ? (favorites[currentUser.id] ?? []).length : 0
  const dashPath = currentUser?.role === 'owner' ? '/proprietaire' : currentUser?.role === 'agency' ? '/agence' : '/client'
  const myNotifs = currentUser ? notifications.filter((n) => n.userId === currentUser.id) : []
  const unread = myNotifs.filter((n) => !n.read).length
  const unreadMsg = currentUser ? messages.filter((m) => m.receiverId === currentUser.id && !m.read).length : 0

  const openNotifs = () => {
    const next = !notifOpen
    setNotifOpen(next)
    setUserOpen(false)
    if (next) markAllRead()
  }

  const goAuth = (mode: 'login' | 'register') => {
    setMenuOpen(false)
    navigate(`/connexion?mode=${mode}`)
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
            <NavLink to="/annonces" onClick={() => setMenuOpen(false)}>Annonces</NavLink>
            <NavLink to="/annonces?map=1" onClick={() => setMenuOpen(false)}>Carte</NavLink>
            <NavLink to="/#fonctionnement" onClick={() => setMenuOpen(false)}>Comment ça marche</NavLink>
            <NavLink to="/devenir-proprietaire" onClick={() => setMenuOpen(false)}>Propriétaires</NavLink>
            {currentUser && <NavLink to="/messages" onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-messages ${isActive ? 'active' : ''}`}>Messages {unreadMsg > 0 && <span className="nav-badge">{unreadMsg}</span>}</NavLink>}
            <div className="mobile-only nav-extra">
              {currentUser ? (
                <>
                  <Link to={dashPath} onClick={() => setMenuOpen(false)}>Mon espace</Link>
                  <Link to="/messages" onClick={() => setMenuOpen(false)}>Messages {unreadMsg > 0 && <b>({unreadMsg})</b>}</Link>
                  {currentUser.role === 'client' && <Link to="/client#favoris" onClick={() => setMenuOpen(false)}>Mes favoris ({favCount})</Link>}
                  <button className="link-btn" onClick={() => { logout(); setMenuOpen(false); navigate('/') }}>Déconnexion</button>
                </>
              ) : (
                <>
                  <button className="link-btn" onClick={() => goAuth('login')}>Connexion</button>
                  <button className="btn btn-primary btn-sm" onClick={() => goAuth('register')}>S'inscrire <ArrowRight size={15} /></button>
                </>
              )}
            </div>
          </nav>
          <div className="header-actions">
            {currentUser ? (
              <>
                <div className="notif-wrap">
                  <button className="icon-btn notif-btn" onClick={openNotifs} aria-label="Notifications">
                    <Bell size={18} />{unread > 0 && <span className="notif-dot">{unread}</span>}
                  </button>
                  {notifOpen && (
                    <div className="notif-dropdown">
                      <div className="notif-head"><strong>Notifications</strong><small>{myNotifs.length === 0 ? 'Aucune' : `${myNotifs.length} au total`}</small></div>
                      {myNotifs.length === 0 ? (
                        <div className="notif-empty">Vous êtes à jour.</div>
                      ) : myNotifs.slice(0, 8).map((n) => (
                        <button key={n.id} className={`notif-item ${n.type}`} onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link) }}>
                          <strong>{n.title}</strong>
                          <span>{n.body}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="user-menu-wrap">
                  <button className="user-pill" onClick={() => { setUserOpen(!userOpen); setNotifOpen(false) }} aria-expanded={userOpen}>
                    <span className="avatar">{currentUser.name.charAt(0)}</span>
                    <span className="user-pill-name">{currentUser.name.split(' ')[0]}</span>
                    <ChevronDown size={15} />
                  </button>
                  {userOpen && (
                    <div className="user-dropdown">
                      <div className="dropdown-head">
                        <strong>{currentUser.name}</strong>
                        <small>{currentUser.email}</small>
                        <span className="role-chip">{currentUser.role === 'client' ? 'Client' : currentUser.role === 'owner' ? 'Propriétaire' : 'Agence'}</span>
                      </div>
                      <Link to={dashPath} onClick={() => setUserOpen(false)}><LayoutDashboard size={16} /> Mon espace</Link>
                      <Link to="/messages" onClick={() => setUserOpen(false)}><MessageCircle size={16} /> Messages {unreadMsg > 0 && <b>{unreadMsg}</b>}</Link>
                      {currentUser.role === 'client' && <Link to="/client#favoris" onClick={() => setUserOpen(false)}><Heart size={16} /> Mes favoris {favCount > 0 && <b>{favCount}</b>}</Link>}
                      <button onClick={() => { logout(); setUserOpen(false); navigate('/') }}><LogOut size={16} /> Déconnexion</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button className="btn btn-ghost btn-sm desktop-only" onClick={() => goAuth('login')}><UserRound size={16} /> Connexion</button>
                <button className="btn btn-primary btn-sm desktop-only" onClick={() => goAuth('register')}>S'inscrire <ArrowRight size={15} /></button>
              </>
            )}
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <main>{children ?? <Outlet />}</main>

      <footer className="site-footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <Logo light />
            <p>La plateforme immobilière qui rapproche les propriétaires, les locataires et les agences au Bénin.</p>
            <div className="footer-trust"><ShieldCheck size={16} /> Annonces vérifiées par l'agence partenaire</div>
          </div>
          <div className="footer-col">
            <h4>Explorer</h4>
            <Link to="/annonces"><Search size={14} /> Toutes les annonces</Link>
            <Link to="/annonces?map=1"><Building2 size={14} /> Carte des biens</Link>
            <Link to="/annonces?type=Terrain">Terrains à vendre</Link>
            <Link to="/devenir-proprietaire">Publier une annonce</Link>
          </div>
          <div className="footer-col">
            <h4>Espaces</h4>
            <Link to="/connexion?role=client">Espace client</Link>
            <Link to="/connexion?role=owner">Espace propriétaire</Link>
            <Link to="/connexion?role=agency">Espace agence</Link>
            <Link to="/client#contrats">Mes contrats</Link>
          </div>
          <div className="footer-cta">
            <h4>Prêt à trouver votre chez-vous ?</h4>
            <p>Recevez les nouvelles annonces correspondant à votre recherche.</p>
            <Link to="/connexion?mode=register" className="btn btn-accent btn-sm">Créer mon compte <ArrowRight size={15} /></Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Kado Immo · Déployé d'abord au Bénin 🇧🇯</span>
          <span>Cotonou · Porto-Novo · Parakou · Abomey-Calavi</span>
        </div>
      </footer>
    </div>
  )
}
