import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, MessageCircle, Send } from 'lucide-react'
import { useStore } from '../lib/store'
import { dateFR } from '../lib/utils'

interface ThreadKey { listingId: string; otherId: string }

export default function Messages() {
  const { currentUser, listings, users, messages, sendMessage, markThreadRead } = useStore()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [draft, setDraft] = useState('')
  const [active, setActive] = useState<ThreadKey | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (!currentUser) navigate('/connexion?next=/messages') }, [currentUser, navigate])

  const threads = useMemo(() => {
    if (!currentUser) return []
    const map = new Map<string, { listingId: string; otherId: string; last: string; unread: number }>()
    messages.forEach((m) => {
      if (m.senderId !== currentUser.id && m.receiverId !== currentUser.id) return
      const otherId = m.senderId === currentUser.id ? m.receiverId : m.senderId
      const key = `${m.listingId}::${otherId}`
      const prev = map.get(key)
      const unread = prev?.unread ?? 0
      map.set(key, {
        listingId: m.listingId, otherId, last: m.createdAt,
        unread: unread + (m.receiverId === currentUser.id && !m.read ? 1 : 0),
      })
    })
    const list = Array.from(map.values()).sort((a, b) => b.last.localeCompare(a.last))
    const pListing = params.get('listing')
    const pWith = params.get('with')
    if (pListing && pWith && !list.some((t) => t.listingId === pListing && t.otherId === pWith)) {
      list.unshift({ listingId: pListing, otherId: pWith, last: new Date().toISOString(), unread: 0 })
    }
    return list
  }, [messages, currentUser, params])

  useEffect(() => {
    const pListing = params.get('listing')
    const pWith = params.get('with')
    if (pListing && pWith) {
      setActive({ listingId: pListing, otherId: pWith })
    }
  }, [params])

  useEffect(() => {
    const pListing = params.get('listing')
    const pWith = params.get('with')
    if (!pListing && !pWith && !active && threads.length > 0) {
      setActive({ listingId: threads[0].listingId, otherId: threads[0].otherId })
    }
  }, [threads, active, params])

  useEffect(() => {
    if (active) markThreadRead(active.listingId, active.otherId)
  }, [active, markThreadRead, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [active, messages.length])

  if (!currentUser) return null

  const activeMessages = active
    ? messages.filter((m) => m.listingId === active.listingId && ((m.senderId === currentUser.id && m.receiverId === active.otherId) || (m.senderId === active.otherId && m.receiverId === currentUser.id)))
    : []
  const activeListing = active ? listings.find((l) => l.id === active.listingId) : undefined
  const activeUser = active ? users.find((u) => u.id === active.otherId) : undefined

  const onSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!active || !draft.trim()) return
    sendMessage(active.listingId, active.otherId, draft)
    setDraft('')
  }

  return (
    <div className="page messages-page">
      <div className="explore-head">
        <div className="container">
          <div className="breadcrumb">Accueil <span>/</span> Messagerie</div>
          <h1>Vos <span>conversations</span></h1>
          <p>Échangez avec les propriétaires, les clients et l'agence autour de vos annonces.</p>
        </div>
      </div>

      <div className="container messages-layout">
        <aside className="threads-panel">
          <div className="threads-head"><MessageCircle size={18} /> Conversations</div>
          {threads.length === 0 ? (
            <div className="threads-empty">Aucune conversation pour le moment. Écrivez depuis une annonce pour démarrer.</div>
          ) : threads.map((t) => {
            const l = listings.find((x) => x.id === t.listingId)
            const u = users.find((x) => x.id === t.otherId)
            const isActive = active?.listingId === t.listingId && active?.otherId === t.otherId
            return (
              <button key={`${t.listingId}-${t.otherId}`} className={`thread-item ${isActive ? 'active' : ''}`} onClick={() => setActive({ listingId: t.listingId, otherId: t.otherId })}>
                <span className="avatar small">{u?.name.charAt(0) ?? '?'}</span>
                <span className="thread-body">
                  <strong>{u?.name ?? 'Utilisateur'}</strong>
                  <small>{l?.title ?? 'Annonce'}</small>
                </span>
                {t.unread > 0 && <b className="thread-unread">{t.unread}</b>}
              </button>
            )
          })}
        </aside>

        <div className="chat-panel">
          {!active ? (
            <div className="chat-empty"><MessageCircle size={30} /><p>Sélectionnez une conversation.</p><Link to="/annonces" className="btn btn-outline btn-sm">Voir les annonces</Link></div>
          ) : (
            <>
              <div className="chat-head">
                <Link to={activeListing ? `/annonce/${activeListing.id}` : '/annonces'} className="chat-back"><ArrowLeft size={16} /></Link>
                <span className="avatar small">{activeUser?.name.charAt(0) ?? '?'}</span>
                <div>
                  <strong>{activeUser?.name ?? 'Utilisateur'}</strong>
                  <small><Building2 size={12} /> {activeListing?.title ?? 'Annonce'}</small>
                </div>
                {activeListing && <Link to={`/annonce/${activeListing.id}`} className="btn btn-outline btn-xs" style={{ marginLeft: 'auto' }}>Voir l'annonce</Link>}
              </div>
              <div className="chat-messages">
                {activeMessages.length === 0 ? <div className="chat-empty-inline">Démarrez la conversation.</div> : [...activeMessages].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((m) => {
                  const mine = m.senderId === currentUser.id
                  return (
                    <div key={m.id} className={`chat-bubble ${mine ? 'mine' : ''}`}>
                      <p>{m.body}</p>
                      <time>{dateFR(m.createdAt)} · {new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input" onSubmit={onSend}>
                <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Écrire un message…" />
                <button className="btn btn-primary btn-sm" type="submit" disabled={!draft.trim()}><Send size={15} /> Envoyer</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}