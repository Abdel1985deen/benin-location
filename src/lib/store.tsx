import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { seedListings, seedUsers } from './data'
import { GEO_STORAGE_KEY, SITE_NAME, STORAGE_KEY } from './site'
import { distanceKm, uid } from './utils'
import type {
  Contract, GeoPoint, Listing, ListingStatus, Message, MovingPlan, Notification, Role, User, VisitRequest,
} from '../types'

const KEY = STORAGE_KEY

export type GeoStatus = 'prompt' | 'locating' | 'granted' | 'denied' | 'unsupported'

interface GeoState {
  point: GeoPoint | null
  status: GeoStatus
}

interface Persisted {
  users: User[]
  currentUserId: string | null
  listings: Listing[]
  visits: VisitRequest[]
  contracts: Contract[]
  movingPlans: MovingPlan[]
  favorites: Record<string, string[]>
  notifications: Notification[]
  messages: Message[]
}

const initialState: Persisted = {
  users: seedUsers,
  currentUserId: null,
  listings: seedListings.map((l) => l.id === 'l3' ? { ...l, status: 'reserved' as const } : l),
  visits: [
    {
      id: 'v-demo1', listingId: 'l1', clientId: 'u-client',
      date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
      time: '10:00', message: 'Bonjour, je souhaite visiter cet appartement en fin de matinée.',
      status: 'confirmed', createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  contracts: [
    {
      id: 'c-demo1', listingId: 'l3', clientId: 'u-client', ownerId: 'u-owner',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      startDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      duration: 12, rent: 95000, deposit: 95000,
      tenant: {
        firstName: 'Chantal', lastName: 'Sossou', birthDate: '1995-04-12', birthPlace: 'Cotonou',
        nationality: 'Béninoise', phone: '+229 97 12 34 56', email: 'client@demo.bj', job: 'Commerçante',
      },
      guarantor: { name: 'Kossi Sossou', phone: '+229 96 00 11 22', relation: 'Frère' },
      signature: '', status: 'signed',
    },
  ],
  movingPlans: [
    {
      id: 'm-demo1', contractId: 'c-demo1', clientId: 'u-client',
      moveDate: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
      currentAddress: 'Akpakpa, Cotonou',
      services: ['transport', 'cartons', 'internet'],
      notes: 'Studio meublé, peu de cartons.',
      steps: {
        'Confirmer la date avec le propriétaire': true,
        'Résilier les anciens abonnements (eau, électricité)': true,
        'Préparer les cartons et étiqueter': true,
        'Organiser le transport le jour J': false,
        'Faire l’état des lieux d’entrée': false,
        'Mettre en service l’eau et l’électricité': false,
        'Installer les meubles et électroménager': false,
        'Vérifier les finitions et signaler les problèmes': false,
      },
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
  ],
  favorites: { 'u-client': ['l1', 'l2'] },
  notifications: [
    {
      id: 'n-demo1', userId: 'u-client', title: `Bienvenue sur ${SITE_NAME}`,
      body: 'Explorez les annonces autour de vous, planifiez une visite et signez votre contrat en ligne.',
      type: 'info', read: false, link: '/annonces', createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'n-demo2', userId: 'u-client', title: 'Visite confirmée',
      body: 'Votre visite pour « Appartement lumineux à Haie Vive » a été confirmée.',
      type: 'success', read: false, link: '/client#visites', createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'n-demo3', userId: 'u-owner', title: 'Demande de visite confirmée',
      body: 'La visite de « Appartement lumineux à Haie Vive » a été confirmée avec le client.',
      type: 'success', read: false, link: '/proprietaire#visites', createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'n-demo4', userId: 'u-agency', title: 'Annonce à valider',
      body: '« Duplex neuf à Gbégamey » attend votre validation avant mise en ligne.',
      type: 'warning', read: false, link: '/agence#validation', createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'n-demo5', userId: 'u-client', title: 'Contrat signé',
      body: 'Votre bail pour « Studio meublé près de l’Université » est signé. Organisez votre déménagement.',
      type: 'success', read: false, link: '/client#contrats', createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
  messages: [
    {
      id: 'msg-demo1', listingId: 'l1', senderId: 'u-client', receiverId: 'u-owner',
      body: 'Bonjour, le stationnement est-il inclus dans le loyer ?', createdAt: new Date(Date.now() - 5 * 3600000).toISOString(), read: true,
    },
    {
      id: 'msg-demo2', listingId: 'l1', senderId: 'u-owner', receiverId: 'u-client',
      body: 'Bonjour Chantal, oui une place de parking est bien incluse et sécurisée.', createdAt: new Date(Date.now() - 4 * 3600000).toISOString(), read: false,
    },
  ],
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<Persisted>
    return {
      users: parsed.users ?? initialState.users,
      currentUserId: parsed.currentUserId ?? null,
      listings: parsed.listings ?? initialState.listings,
      visits: parsed.visits ?? initialState.visits,
      contracts: parsed.contracts ?? initialState.contracts,
      movingPlans: parsed.movingPlans ?? initialState.movingPlans,
      favorites: parsed.favorites ?? initialState.favorites,
      notifications: parsed.notifications ?? initialState.notifications,
      messages: parsed.messages ?? initialState.messages,
    }
  } catch {
    return initialState
  }
}

type RegisterInput = Omit<User, 'id' | 'createdAt'>
type ListingInput = Pick<Listing, 'title' | 'type' | 'city' | 'neighborhood' | 'address' | 'price' | 'sale' | 'surface' | 'rooms' | 'bathrooms' | 'description' | 'amenities' | 'lat' | 'lng' | 'availableFrom' | 'images'> & { furnished?: boolean }

interface StoreValue extends Persisted {
  currentUser: User | null
  /** Position du visiteur et état de la demande de géolocalisation. */
  geoPoint: GeoPoint | null
  geoStatus: GeoStatus
  requestLocation: () => void
  clearLocation: () => void
  /** Toutes les annonces, triées du plus proche au plus éloigné quand la position est connue. */
  sortedListings: Listing[]
  register: (input: RegisterInput) => User
  login: (email: string, password: string) => User | null
  demoLogin: (role: Role) => void
  logout: () => void
  addListing: (input: ListingInput) => Listing
  setListingStatus: (id: string, status: ListingStatus) => void
  toggleFavorite: (id: string) => void
  addVisit: (input: Omit<VisitRequest, 'id' | 'createdAt' | 'status'>) => void
  setVisitStatus: (id: string, status: VisitRequest['status']) => void
  addContract: (input: Omit<Contract, 'id' | 'createdAt' | 'status'>) => Contract
  addMovingPlan: (input: Omit<MovingPlan, 'id' | 'createdAt'>) => void
  toggleMovingStep: (planId: string, step: string) => void
  notify: (userId: string, title: string, body: string, type?: Notification['type'], link?: string) => void
  markAllRead: () => void
  sendMessage: (listingId: string, receiverId: string, body: string) => void
  markThreadRead: (listingId: string, otherId: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  // Géolocalisation : demande automatique au premier chargement, avec mémorisation du refus.
  const [geo, setGeo] = useState<GeoState>(() => {
    try {
      const raw = sessionStorage.getItem(GEO_STORAGE_KEY)
      if (raw) return JSON.parse(raw) as GeoState
    } catch { /* stockage indisponible */ }
    return { point: null, status: 'prompt' }
  })
  const geoRequested = useRef(false)

  const requestLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const next: GeoState = { point: null, status: 'unsupported' }
      try { sessionStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(next)) } catch { /* noop */ }
      setGeo(next)
      return
    }
    setGeo((current) => ({ ...current, status: 'locating' }))
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next: GeoState = {
          point: { lat: position.coords.latitude, lng: position.coords.longitude },
          status: 'granted',
        }
        try { sessionStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(next)) } catch { /* noop */ }
        setGeo(next)
      },
      (error) => {
        // Un refus est mémorisé pour ne pas ré-interroger le visiteur à chaque page.
        const status: GeoStatus = error.code === error.PERMISSION_DENIED ? 'denied' : 'prompt'
        const next: GeoState = { point: null, status }
        try {
          if (status === 'denied') sessionStorage.setItem(GEO_STORAGE_KEY, JSON.stringify(next))
          else sessionStorage.removeItem(GEO_STORAGE_KEY)
        } catch { /* noop */ }
        setGeo(next)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  const clearLocation = useCallback(() => {
    try { sessionStorage.removeItem(GEO_STORAGE_KEY) } catch { /* noop */ }
    setGeo({ point: null, status: 'prompt' })
  }, [])

  useEffect(() => {
    if (geoRequested.current) return
    geoRequested.current = true
    try {
      if (!sessionStorage.getItem(GEO_STORAGE_KEY)) requestLocation()
    } catch {
      requestLocation()
    }
  }, [requestLocation])

  const sortedListings = useMemo(() => [...state.listings].sort((a, b) => {
    if (geo.point) return distanceKm(geo.point, a) - distanceKm(geo.point, b)
    return Number(b.featured) - Number(a.featured) || b.createdAt.localeCompare(a.createdAt)
  }), [state.listings, geo.point])

  const value = useMemo<StoreValue>(() => {
    const currentUser = state.users.find((u) => u.id === state.currentUserId) ?? null

    const register = (input: RegisterInput) => {
      const user: User = { ...input, id: uid('u'), createdAt: new Date().toISOString() }
      setState((s) => ({
        ...s,
        users: [...s.users, user],
        currentUserId: user.id,
        favorites: { ...s.favorites, [user.id]: [] },
      }))
      return user
    }

    const login = (email: string, password: string) => {
      const user = state.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password)
      if (user) setState((s) => ({ ...s, currentUserId: user.id }))
      return user ?? null
    }

    const demoLogin = (role: Role) => {
      const user = state.users.find((u) => u.role === role)
      if (user) setState((s) => ({ ...s, currentUserId: user.id }))
    }

    const logout = () => setState((s) => ({ ...s, currentUserId: null }))

    const addListing = (input: ListingInput) => {
      const listing: Listing = {
        ...input,
        panorama: input.images[0],
        id: uid('l'),
        ownerId: currentUser?.id ?? 'u-owner',
        status: 'pending',
        featured: false,
        createdAt: new Date().toISOString(),
      }
      setState((s) => {
        let next: Persisted = { ...s, listings: [listing, ...s.listings] }
        next = notifyState(next, listing.ownerId, 'Annonce soumise', `« ${listing.title} » est en attente de validation par l’agence.`, 'info', '/proprietaire#annonces')
        s.users.filter((u) => u.role === 'agency').forEach((a) => {
          next = notifyState(next, a.id, 'Annonce à valider', `Nouvelle annonce : « ${listing.title} ».`, 'warning', '/agence#validation')
        })
        return next
      })
      return listing
    }

    const setListingStatus = (id: string, status: ListingStatus) =>
      setState((s) => {
        const listing = s.listings.find((l) => l.id === id)
        let next: Persisted = { ...s, listings: s.listings.map((l) => (l.id === id ? { ...l, status } : l)) }
        if (listing) {
          const labels: Record<ListingStatus, string> = {
            pending: 'en attente de validation',
            approved: 'approuvée et mise en ligne',
            reserved: 'réservée',
            rented: 'marquée comme louée',
          }
          const kind = status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'info'
          next = notifyState(next, listing.ownerId, 'Statut de votre annonce', `« ${listing.title} » est ${labels[status]}.`, kind, '/proprietaire#annonces')
        }
        return next
      })

    const toggleFavorite = (id: string) => {
      if (!currentUser) return
      setState((s) => {
        const list = s.favorites[currentUser.id] ?? []
        return {
          ...s,
          favorites: {
            ...s.favorites,
            [currentUser.id]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id],
          },
        }
      })
    }

    const notifyState = (s: Persisted, userId: string, title: string, body: string, type: Notification['type'] = 'info', link?: string): Persisted => ({
      ...s,
      notifications: [{ id: uid('n'), userId, title, body, type, read: false, link, createdAt: new Date().toISOString() }, ...s.notifications].slice(0, 80),
    })

    const notify = (userId: string, title: string, body: string, type: Notification['type'] = 'info', link?: string) =>
      setState((s) => notifyState(s, userId, title, body, type, link))

    const markAllRead = () => {
      if (!currentUser) return
      setState((s) => ({
        ...s,
        notifications: s.notifications.map((n) => n.userId === currentUser.id ? { ...n, read: true } : n),
      }))
    }

    const addVisit = (input: Omit<VisitRequest, 'id' | 'createdAt' | 'status'>) =>
      setState((s) => {
        const listing = s.listings.find((l) => l.id === input.listingId)
        const visit: VisitRequest = { ...input, id: uid('v'), status: 'pending', createdAt: new Date().toISOString() }
        let next: Persisted = { ...s, visits: [visit, ...s.visits] }
        next = notifyState(next, input.clientId, 'Visite demandée', `Votre demande pour « ${listing?.title ?? 'ce bien'} » a été envoyée.`, 'info', '/client#visites')
        const agency = s.users.find((u) => u.role === 'agency')
        if (agency) next = notifyState(next, agency.id, 'Nouvelle demande de visite', `Une visite est demandée pour « ${listing?.title ?? 'un bien'} ».`, 'warning', '/agence#visites')
        if (listing) next = notifyState(next, listing.ownerId, 'Nouvelle demande de visite', `Un client souhaite visiter « ${listing.title} ».`, 'warning', '/proprietaire#visites')
        return next
      })

    const setVisitStatus = (id: string, status: VisitRequest['status']) =>
      setState((s) => {
        const visit = s.visits.find((v) => v.id === id)
        const listing = visit ? s.listings.find((l) => l.id === visit.listingId) : undefined
        let next: Persisted = { ...s, visits: s.visits.map((v) => (v.id === id ? { ...v, status } : v)) }
        if (visit) {
          const label = status === 'confirmed' ? 'confirmée' : 'refusée'
          next = notifyState(next, visit.clientId, `Visite ${label}`, `Votre visite pour « ${listing?.title ?? 'ce bien'} » a été ${label}.`, status === 'confirmed' ? 'success' : 'warning', '/client#visites')
        }
        return next
      })

    const addContract = (input: Omit<Contract, 'id' | 'createdAt' | 'status'>) => {
      const contract: Contract = { ...input, id: uid('c'), createdAt: new Date().toISOString(), status: 'signed' }
      setState((s) => {
        const listing = s.listings.find((l) => l.id === input.listingId)
        let next: Persisted = {
          ...s,
          contracts: [contract, ...s.contracts],
          listings: s.listings.map((l) => (l.id === input.listingId ? { ...l, status: 'reserved' } : l)),
        }
        next = notifyState(next, input.clientId, 'Contrat signé', `Votre bail pour « ${listing?.title ?? 'le bien'} » est signé.`, 'success', '/client#contrats')
        next = notifyState(next, input.ownerId, 'Contrat signé', `Un bail a été signé pour « ${listing?.title ?? 'votre bien'} ».`, 'success', '/proprietaire#contrats')
        const agency = s.users.find((u) => u.role === 'agency')
        if (agency) next = notifyState(next, agency.id, 'Contrat signé', `Un contrat vient d'être signé pour « ${listing?.title ?? 'un bien'} ».`, 'success', '/agence#contrats')
        return next
      })
      return contract
    }

    const addMovingPlan = (input: Omit<MovingPlan, 'id' | 'createdAt'>) =>
      setState((s) => {
        const existing = s.movingPlans.find((m) => m.contractId === input.contractId)
        const plan: MovingPlan = existing
          ? { ...existing, ...input }
          : { ...input, id: uid('m'), createdAt: new Date().toISOString() }
        let next: Persisted = {
          ...s,
          movingPlans: existing
            ? s.movingPlans.map((m) => (m.contractId === input.contractId ? plan : m))
            : [plan, ...s.movingPlans],
        }
        next = notifyState(next, input.clientId, 'Plan de déménagement enregistré', `Votre installation est prévue le ${new Date(input.moveDate).toLocaleDateString('fr-FR')}.`, 'success', '/client#demenagement')
        const agency = s.users.find((u) => u.role === 'agency')
        if (agency) next = notifyState(next, agency.id, 'Déménagement planifié', 'Un client a enregistré son plan de déménagement.', 'info', '/agence')
        return next
      })

    const toggleMovingStep = (planId: string, step: string) =>
      setState((s) => ({
        ...s,
        movingPlans: s.movingPlans.map((m) =>
          m.id === planId ? { ...m, steps: { ...m.steps, [step]: !m.steps[step] } } : m,
        ),
      }))

    const sendMessage = (listingId: string, receiverId: string, body: string) => {
      if (!currentUser || !body.trim()) return
      setState((s) => {
        const listing = s.listings.find((l) => l.id === listingId)
        const msg: Message = {
          id: uid('msg'), listingId, senderId: currentUser.id, receiverId,
          body: body.trim(), createdAt: new Date().toISOString(), read: false,
        }
        let next: Persisted = { ...s, messages: [...s.messages, msg] }
        next = notifyState(next, receiverId, 'Nouveau message', `${currentUser.name} : « ${listing?.title ?? 'Annonce'} »`, 'info', '/messages')
        return next
      })
    }

    const markThreadRead = (listingId: string, otherId: string) => {
      if (!currentUser) return
      setState((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.listingId === listingId && m.senderId === otherId && m.receiverId === currentUser.id ? { ...m, read: true } : m,
        ),
      }))
    }

    return {
      ...state,
      currentUser,
      geoPoint: geo.point,
      geoStatus: geo.status,
      requestLocation,
      clearLocation,
      sortedListings,
      register, login, demoLogin, logout, addListing, setListingStatus,
      toggleFavorite, addVisit, setVisitStatus, addContract, addMovingPlan, toggleMovingStep,
      notify, markAllRead, sendMessage, markThreadRead,
    }
  }, [state, geo, requestLocation, clearLocation, sortedListings])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export const defaultCity = 'Cotonou'
