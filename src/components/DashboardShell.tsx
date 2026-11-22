import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell, ChevronRight, FileText, Heart, Home, LayoutDashboard, LogOut,
  Menu, MessageCircle, Plus, Receipt, Settings, Truck, X,
} from 'lucide-react'
import { useStore } from '../lib/store'

export interface DashLink {
  id: string
  label: string
  icon: typeof Home
  to?: string
}

export default function DashboardShell({
  title, subtitle, links, children, action,
}: {
  title: string
  subtitle: string
  links: DashLink[]
  children: ReactNode
  action?: ReactNode
}) {
  const { currentUser, logout, notifications, messages, markAllRead } = useStore()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(links[0]?.id)
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()

  const myNotifs = currentUser ? notifications.filter((n) => n.userId === currentUser.id) : []
  const unread = myNotifs.filter((n) => !n.read).length
  const unreadMsg = currentUser ? messages.filter((m) => m.receiverId === currentUser.id && !m.read).length : 0

  const go = (link: DashLink) => {
    setActive(link.id); setOpen(false)
    if (link.to) navigate(link.to)
    else {
      const el = document.getElementById(link.id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (!el) navigate('/')
    }
  }

  return (
    <div className="dash-page">
      <div className="dash-topbar">
        <div className="container dash-topbar-inner">
          <button className="dash-menu" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
          <div><strong>{title}</strong><span>{subtitle}</span></div>
          <div className="dash-top-actions">
            <div className="notif-wrap">
              <button className="icon-btn notif-btn" onClick={() => { const next = !notifOpen; setNotifOpen(next); if (next) markAllRead() }}>
                <Bell size={18} />{unread > 0 && <span className="notif-dot">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-head"><strong>Notifications</strong><small>{myNotifs.length === 0 ? 'Aucune' : `${myNotifs.length} au total`}</small></div>
                  {myNotifs.length === 0 ? <div className="notif-empty">Vous êtes à jour.</div> : myNotifs.slice(0, 8).map((n) => (
                    <button key={n.id} className={`notif-item ${n.type}`} onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link) }}>
                      <strong>{n.title}</strong><span>{n.body}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="avatar small">{currentUser?.name.charAt(0)}</span>
          </div>
        </div>
      </div>

      <div className="container dash-layout">
        <aside className={`dash-sidebar ${open ? 'open' : ''}`}>
          <div className="dash-sidebar-user">
            <span className="avatar lg">{currentUser?.name.charAt(0)}</span>
            <div><strong>{currentUser?.name}</strong><small>{currentUser?.email}</small></div>
          </div>
          <nav>
            <span className="dash-nav-label">MENU PRINCIPAL</span>
            {links.map((l) => (
              <button key={l.id} className={active === l.id ? 'active' : ''} onClick={() => go(l)}>
                <l.icon size={18} /> {l.label} <ChevronRight size={14} className="nav-chevron" />
              </button>
            ))}
            <span className="dash-nav-label">AUTRES</span>
            <Link to="/annonces"><Home size={18} /> Voir les annonces</Link>
            <Link to="/messages"><MessageCircle size={18} /> Messages {unreadMsg > 0 && <b className="nav-badge">{unreadMsg}</b>}</Link>
            <Link to="/connexion"><Settings size={18} /> Changer de compte</Link>
            <button className="logout" onClick={() => { logout(); navigate('/') }}><LogOut size={18} /> Déconnexion</button>
          </nav>
          <div className="dash-help">
            <FileText size={18} /><strong>Besoin d'aide ?</strong>
            <p>Notre équipe vous accompagne à chaque étape.</p>
            <a href="mailto:contact@allocabenin.bj">Nous contacter →</a>
          </div>
        </aside>

        <div className="dash-content">
          <div className="dash-content-head">
            <div><h1>{title}</h1><p>{subtitle}</p></div>
            {action}
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export const clientLinks: DashLink[] = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'favoris', label: 'Mes favoris', icon: Heart },
  { id: 'visites', label: 'Mes visites', icon: FileText },
  { id: 'contrats', label: 'Mes contrats', icon: LayoutDashboard },
  { id: 'transactions', label: 'Suivi des transactions', icon: Receipt, to: '/transactions' },
  { id: 'demenagement', label: 'Déménagement', icon: Truck },
]

export const ownerLinks: DashLink[] = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'annonces', label: 'Mes annonces', icon: Home },
  { id: 'visites', label: 'Demandes de visite', icon: FileText },
  { id: 'contrats', label: 'Contrats', icon: LayoutDashboard },
  { id: 'transactions', label: 'Suivi des transactions', icon: Receipt, to: '/transactions' },
  { id: 'publier', label: 'Publier une annonce', icon: Plus, to: '/publier' },
]

export const agencyLinks: DashLink[] = [
  { id: 'overview', label: 'Vue d’ensemble', icon: LayoutDashboard },
  { id: 'validation', label: 'Annonces à valider', icon: Home },
  { id: 'visites', label: 'Planning des visites', icon: FileText },
  { id: 'contrats', label: 'Contrats signés', icon: LayoutDashboard },
  { id: 'transactions', label: 'Suivi des transactions', icon: Receipt, to: '/transactions' },
  { id: 'diaspora', label: 'Projets diaspora', icon: Receipt, to: '/agence#diaspora' },
]
