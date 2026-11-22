import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Check, ImagePlus, MapPin, Navigation, Save, Trash2, X } from 'lucide-react'
import { CITIES, IMG } from '../lib/data'
import { GUARANTEE_MONTHS } from '../lib/site'
import type { AdminListingInput } from '../lib/store'
import { todayISO } from '../lib/utils'
import type { Listing, ListingStatus, PropertyType, User } from '../types'

const presetImages = [...new Set(Object.values(IMG))]
const commonAmenities = [
  'Climatisation', 'Parking', 'Terrasse', 'Jardin', 'Piscine', 'Meublé', 'Internet',
  'Eau courante', 'Sécurité 24h/24', 'Ascenseur', 'Groupe électrogène', 'Titre foncier',
]
const statuses: { value: ListingStatus; label: string }[] = [
  { value: 'approved', label: 'En ligne (publiée)' },
  { value: 'pending', label: 'En attente de validation' },
  { value: 'reserved', label: 'Réservée' },
  { value: 'rented', label: 'Louée' },
  { value: 'suspended', label: 'Suspendue' },
]

/** Réduit les photos uploadées pour rester sous la limite de localStorage. */
function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Lecture impossible'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Image invalide'))
      img.onload = () => {
        const max = 1200
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas indisponible'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.76))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

type FormState = {
  title: string
  type: PropertyType
  sale: boolean
  furnished: boolean
  city: string
  neighborhood: string
  address: string
  price: string
  surface: string
  rooms: string
  bathrooms: string
  description: string
  availableFrom: string
  lat: string
  lng: string
  ownerId: string
  status: ListingStatus
  featured: boolean
}

function initialForm(listing: Listing | null, owners: User[]): FormState {
  return {
    title: listing?.title ?? '',
    type: listing?.type ?? 'Appartement',
    sale: listing?.sale ?? false,
    furnished: listing?.furnished ?? false,
    city: listing?.city ?? 'Cotonou',
    neighborhood: listing?.neighborhood ?? '',
    address: listing?.address ?? '',
    price: listing ? String(listing.price) : '',
    surface: listing ? String(listing.surface) : '',
    rooms: listing ? String(listing.rooms) : '1',
    bathrooms: listing ? String(listing.bathrooms) : '1',
    description: listing?.description ?? '',
    availableFrom: listing?.availableFrom?.slice(0, 10) ?? todayISO(),
    lat: listing ? String(listing.lat) : '',
    lng: listing ? String(listing.lng) : '',
    ownerId: listing?.ownerId ?? owners[0]?.id ?? 'u-owner',
    status: listing?.status ?? 'approved',
    featured: listing?.featured ?? false,
  }
}

export default function AdminListingEditor({
  listing, owners, onSave, onCancel,
}: {
  listing: Listing | null
  owners: User[]
  onSave: (input: AdminListingInput) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(() => initialForm(listing, owners))
  const [amenities, setAmenities] = useState<string[]>(listing?.amenities ?? [])
  const [customAmenities, setCustomAmenities] = useState('')
  const [images, setImages] = useState<string[]>(listing?.images.length ? listing.images : [presetImages[0]])
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const set = (key: keyof FormState, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const pickType = (value: PropertyType) =>
    setForm((f) => ({
      ...f,
      type: value,
      sale: value === 'Terrain' ? true : f.sale,
      furnished: value === 'Terrain' ? false : f.furnished,
    }))

  const pickCity = (city: string) => {
    const c = CITIES.find((x) => x.name === city)
    setForm((f) => ({ ...f, city, lat: c ? String(c.lat) : f.lat, lng: c ? String(c.lng) : f.lng }))
  }

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => {
        setForm((f) => ({ ...f, lat: String(p.coords.latitude), lng: String(p.coords.longitude) }))
      },
      () => setError('Localisation refusée. Saisissez les coordonnées manuellement.'),
    )
  }

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith('image/'))
    if (!files.length) return
    setUploading(true)
    setError('')
    try {
      const urls = await Promise.all(files.map(optimizeImage))
      setImages((current) => [...current, ...urls])
    } catch {
      setError('Impossible de lire certaines images. Réessayez avec des fichiers JPEG ou PNG.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const toggleImage = (src: string) =>
    setImages((current) => current.includes(src)
      ? current.length > 1 ? current.filter((x) => x !== src) : current
      : [...current, src])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.price || !form.surface || !form.address.trim()) {
      setError('Renseignez au minimum le titre, le prix, la surface et l’adresse.')
      return
    }
    const extra = customAmenities.split(',').map((s) => s.trim()).filter(Boolean)
    onSave({
      ...(listing ? { id: listing.id } : {}),
      title: form.title.trim(),
      type: form.type,
      city: form.city,
      neighborhood: form.neighborhood.trim() || form.city,
      address: form.address.trim(),
      price: Number(form.price),
      sale: form.sale,
      furnished: form.type === 'Terrain' ? false : form.furnished,
      surface: Number(form.surface),
      rooms: Number(form.rooms) || 0,
      bathrooms: Number(form.bathrooms) || 0,
      description: form.description.trim() || 'Bien à découvrir.',
      amenities: [...new Set([...amenities, ...extra])],
      images: images.length ? images : [presetImages[0]],
      lat: Number(form.lat) || 6.3703,
      lng: Number(form.lng) || 2.3912,
      availableFrom: form.availableFrom || todayISO(),
      ownerId: form.ownerId,
      status: form.status,
      featured: form.featured,
    })
  }

  return (
    <form className="admin-editor" onSubmit={submit}>
      <div className="admin-editor-head">
        <div>
          <span className="section-kicker">{listing ? 'Modifier l’annonce' : 'Nouvelle annonce'}</span>
          <h3>{listing ? listing.title : 'Créer une annonce sans toucher au code'}</h3>
        </div>
        <button type="button" className="icon-btn" onClick={onCancel} aria-label="Fermer l’éditeur"><X size={18} /></button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="publish-card">
        <h2><span>1</span> Informations principales</h2>
        <label className="field"><span>Titre de l’annonce *</span>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex. Appartement lumineux à Haie Vive" />
        </label>
        <div className="field-row">
          <label className="field"><span>Type de bien</span>
            <select value={form.type} onChange={(e) => pickType(e.target.value as PropertyType)}>
              {(['Appartement', 'Maison', 'Studio', 'Villa', 'Terrain'] as PropertyType[]).map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label className="field"><span>Transaction</span>
            <select value={form.sale ? 'sale' : 'rent'} onChange={(e) => set('sale', e.target.value === 'sale')}>
              <option value="rent">À louer</option><option value="sale">À vendre</option>
            </select>
          </label>
        </div>
        <div className="field-row three">
          <label className="field"><span>Prix (FCFA) *</span><input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} /></label>
          <label className="field"><span>Surface (m²) *</span><input type="number" value={form.surface} onChange={(e) => set('surface', e.target.value)} /></label>
          <label className="field"><span>Disponible à partir du</span><input type="date" value={form.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Chambres</span><input type="number" min="0" value={form.rooms} onChange={(e) => set('rooms', e.target.value)} /></label>
          <label className="field"><span>Salles d’eau</span><input type="number" min="0" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} /></label>
        </div>
        {form.type !== 'Terrain' && (
          <label className="check-option">
            <input type="checkbox" checked={form.furnished} onChange={(e) => set('furnished', e.target.checked)} />
            Logement meublé · garantie affichée : avance de {GUARANTEE_MONTHS} mois
          </label>
        )}
      </div>

      <div className="publish-card">
        <h2><span>2</span> Localisation et publication</h2>
        <div className="field-row">
          <label className="field"><span>Ville</span>
            <select value={form.city} onChange={(e) => pickCity(e.target.value)}>{CITIES.map((c) => <option key={c.name}>{c.name}</option>)}</select>
          </label>
          <label className="field"><span>Quartier</span><input value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Haie Vive" /></label>
        </div>
        <label className="field"><span>Adresse précise *</span><input value={form.address} onChange={(e) => set('address', e.target.value)} /></label>
        <div className="field-row">
          <label className="field"><span>Latitude</span><input value={form.lat} onChange={(e) => set('lat', e.target.value)} /></label>
          <label className="field"><span>Longitude</span><input value={form.lng} onChange={(e) => set('lng', e.target.value)} /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Propriétaire</span>
            <select value={form.ownerId} onChange={(e) => set('ownerId', e.target.value)}>
              {owners.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Statut</span>
            <select value={form.status} onChange={(e) => set('status', e.target.value as ListingStatus)}>
              {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <label className="check-option"><input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} /> Mettre en avant sur l’accueil</label>
        <button type="button" className="btn btn-outline btn-sm" onClick={locate}><Navigation size={15} /> Utiliser ma position actuelle</button>
        <p className="form-note"><MapPin size={13} /> Les coordonnées servent au tri « autour de moi ».</p>
      </div>

      <div className="publish-card">
        <h2><span>3</span> Description et équipements</h2>
        <label className="field"><span>Description</span><textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} /></label>
        <span className="field-label">Équipements courants</span>
        <div className="chip-group">
          {commonAmenities.map((a) => (
            <button type="button" key={a} className={amenities.includes(a) ? 'active' : ''}
              onClick={() => setAmenities((list) => list.includes(a) ? list.filter((x) => x !== a) : [...list, a])}>{a}</button>
          ))}
        </div>
        <label className="field admin-extra-field"><span>Autres équipements (séparés par une virgule)</span>
          <input value={customAmenities} onChange={(e) => setCustomAmenities(e.target.value)} placeholder="Ex. Cave, Buanderie, Forage" />
        </label>
      </div>

      <div className="publish-card">
        <h2><span>4</span> Photos</h2>
        <p className="muted">Choisissez les photos locales ou importez les vôtres depuis cet appareil.</p>
        {images.length > 0 && (
          <div className="admin-selected-images">
            {images.map((src, i) => (
              <div key={`${src.slice(0, 40)}-${i}`} className="admin-image-item">
                <img src={src} alt={`Photo ${i + 1}`} />
                <button type="button" onClick={() => setImages((list) => list.filter((_, idx) => idx !== i))} aria-label="Retirer cette photo"><Trash2 size={14} /></button>
                {i === 0 && <span>Principale</span>}
              </div>
            ))}
          </div>
        )}
        <div className="image-picker">
          {presetImages.map((src) => (
            <button type="button" key={src} className={images.includes(src) ? 'active' : ''} onClick={() => toggleImage(src)}>
              <img src={src} alt="Photo disponible" />{images.includes(src) && <span><Check size={14} /></span>}
            </button>
          ))}
        </div>
        <label className="btn btn-outline btn-sm admin-upload">
          <ImagePlus size={15} /> {uploading ? 'Traitement…' : 'Importer des photos'}
          <input type="file" accept="image/*" multiple onChange={upload} disabled={uploading} />
        </label>
        <p className="form-note">Les imports sont redimensionnés et enregistrés dans ce navigateur (démo, pas de serveur).</p>
      </div>

      <div className="admin-editor-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Annuler</button>
        <button type="submit" className="btn btn-primary" disabled={uploading}><Save size={16} /> {listing ? 'Enregistrer les modifications' : 'Publier l’annonce'}</button>
      </div>
    </form>
  )
}
