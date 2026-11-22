export type Role = 'client' | 'owner' | 'agency'
export type PropertyType = 'Appartement' | 'Maison' | 'Studio' | 'Villa' | 'Terrain'
export type ListingStatus = 'pending' | 'approved' | 'reserved' | 'rented' | 'suspended'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: Role
  city: string
  createdAt: string
  agency?: string
}

export interface Listing {
  id: string
  title: string
  type: PropertyType
  city: string
  neighborhood: string
  address: string
  price: number
  sale: boolean
  /** Logement meublé / non meublé (sans objet pour un terrain). */
  furnished?: boolean
  surface: number
  rooms: number
  bathrooms: number
  images: string[]
  panorama: string
  description: string
  amenities: string[]
  lat: number
  lng: number
  ownerId: string
  status: ListingStatus
  featured: boolean
  availableFrom: string
  createdAt: string
}

export interface VisitRequest {
  id: string
  listingId: string
  clientId: string
  date: string
  time: string
  message: string
  status: 'pending' | 'confirmed' | 'declined'
  createdAt: string
}

export interface TenantInfo {
  firstName: string
  lastName: string
  birthDate: string
  birthPlace: string
  nationality: string
  phone: string
  email: string
  job: string
}

export interface Contract {
  id: string
  listingId: string
  clientId: string
  ownerId: string
  createdAt: string
  startDate: string
  duration: number
  rent: number
  deposit: number
  tenant: TenantInfo
  guarantor: { name: string; phone: string; relation: string }
  signature: string
  status: 'signed'
}

export interface MovingPlan {
  id: string
  contractId: string
  clientId: string
  moveDate: string
  currentAddress: string
  services: string[]
  notes: string
  steps: Record<string, boolean>
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: 'info' | 'success' | 'warning'
  read: boolean
  link?: string
  createdAt: string
}

export interface Message {
  id: string
  listingId: string
  senderId: string
  receiverId: string
  body: string
  createdAt: string
  read: boolean
}

export interface GeoPoint {
  lat: number
  lng: number
}

/** Demande d'accès au service foncier pour un projet depuis l'étranger. */
export interface DiasporaRequest {
  id: string
  name: string
  country: string
  city: string
  budget: string
  project: string
  whatsapp: string
  email: string
  status: 'received' | 'forwarded'
  createdAt: string
}

/** Étapes d'une transaction immobilière simulée (aucun paiement réel). */
export type TransactionStatus =
  | 'request'
  | 'advance_paid'
  | 'confirmed'
  | 'rent_paid'
  | 'receipt_generated'

export interface TransactionEvent {
  status: TransactionStatus
  label: string
  by: string
  at: string
}

export interface Transaction {
  id: string
  listingId: string
  clientId: string
  ownerId: string
  agencyId?: string
  rent: number
  monthsAdvance: number
  status: TransactionStatus
  createdAt: string
  updatedAt: string
  receiptNumber?: string
  events: TransactionEvent[]
}
