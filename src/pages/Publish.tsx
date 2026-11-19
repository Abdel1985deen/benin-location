import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, Check, ImagePlus, MapPin, Navigation, Plus, Sparkles, X,
} from 'lucide-react'
import { CITIES, IMG } from '../lib/data'
import { useStore } from '../lib/store'
import { todayISO } from '../lib/utils'
import type { PropertyType } from '../types'

const presetImages = [IMG.living1, IMG.living2, IMG.living3, IMG.house1, IMG.house2, IMG.terrace, IMG.land1]
const availableAmenities = ['Climatisation', 'Parking', 'Terrasse', 'Jardin', 'Piscine', 'Meublé', 'Internet', 'Eau courante', 'Sécurité 24h/24', 'Ascenseur', 'Groupe électrogène', 'Titre foncier']

export default function Publish() {
  const { currentUser, addListing } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) navigate('/connexion?role=owner&next=/publier')
  }, [currentUser, navigate])

  const [form, setForm] = useState({
    title: '', type: 'Appartement' as PropertyType, sale: false, city: 'Cotonou',
    neighborhood: '', address: '', price: '', surface: '', rooms: '1', bathrooms: '1',
    description: '', availableFrom: todayISO(), lat: '', lng: '',
  })
  const [amenities, setAmenities] = useState<string[]>([])
  const [images, setImages] = useState<string[]>([IMG.living1])
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }))

  const pickCity = (city: string) => {
    const c = CITIES.find((x) => x.name === city)
    setForm((f) => ({ ...f, city, lat: c ? String(c.lat) : f.lat, lng: c ? String(c.lng) : f.lng }))
  }

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: String(p.coords.latitude), lng: String(p.coords.longitude) })),
      () => setError('Localisation refusée. Saisissez les coordonnées manuellement.'),
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.price || !form.surface || !form.address) {
      return setError('Renseignez au minimum le titre, le prix, la surface et l’adresse.')
    }
    addListing({
      title: form.title, type: form.type, city: form.city, neighborhood: form.neighborhood || form.city,
      address: form.address, price: Number(form.price), sale: form.sale, surface: Number(form.surface),
      rooms: Number(form.rooms), bathrooms: Number(form.bathrooms), description: form.description || 'Bien à découvrir.',
      amenities, images, lat: Number(form.lat) || 6.3703, lng: Number(form.lng) || 2.3912,
      availableFrom: form.availableFrom,
    })
    setDone(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (done) return (
    <div className="page publish-success">
      <div className="success-hero">
        <span><Check size={34} /></span>
        <h1>Votre annonce est en ligne de validation</h1>
        <p>L'agence Kado Immo va vérifier les informations et la publier sous peu. Vous recevrez les demandes de visite directement dans votre espace.</p>
        <div className="success-actions">
          <Link to="/proprietaire" className="btn btn-primary">Voir mon espace <ArrowLeft size={16} className="flip" /></Link>
          <button className="btn btn-outline" onClick={() => { setDone(false); setForm({ title: '', type: 'Appartement', sale: false, city: 'Cotonou', neighborhood: '', address: '', price: '', surface: '', rooms: '1', bathrooms: '1', description: '', availableFrom: todayISO(), lat: '', lng: '' }) }}>Publier un autre bien</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page publish-page">
      <div className="publish-head">
        <div className="container">
          <Link to="/proprietaire" className="back-link"><ArrowLeft size={16} /> Mon espace</Link>
          <span className="section-kicker"><Sparkles size={14} /> Nouvelle annonce</span>
          <h1>Publiez votre bien en quelques minutes</h1>
          <p>Plus votre annonce est détaillée, plus elle attire de locataires sérieux.</p>
        </div>
      </div>
      <div className="container publish-layout">
        <form onSubmit={submit} className="publish-form">
          {error && <div className="form-error">{error}</div>}

          <div className="publish-card">
            <h2><span>1</span> Informations principales</h2>
            <label className="field"><span>Titre de l'annonce *</span><input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex. Appartement lumineux à Haie Vive" /></label>
            <div className="field-row">
              <label className="field"><span>Type de bien</span><select value={form.type} onChange={(e) => set('type', e.target.value)}>{['Appartement', 'Maison', 'Studio', 'Villa', 'Terrain'].map((t) => <option key={t}>{t}</option>)}</select></label>
              <label className="field"><span>Transaction</span><select value={form.sale ? 'sale' : 'rent'} onChange={(e) => set('sale', e.target.value === 'sale')}><option value="rent">À louer</option><option value="sale">À vendre</option></select></label>
            </div>
            <div className="field-row">
              <label className="field"><span>Prix ({form.sale ? 'vente' : 'mensuel'}) en FCFA *</span><input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="185000" /></label>
              <label className="field"><span>Surface (m²) *</span><input type="number" value={form.surface} onChange={(e) => set('surface', e.target.value)} placeholder="92" /></label>
            </div>
            <div className="field-row three">
              <label className="field"><span>Chambres</span><input type="number" min="0" value={form.rooms} onChange={(e) => set('rooms', e.target.value)} /></label>
              <label className="field"><span>Salles d'eau</span><input type="number" min="0" value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} /></label>
              <label className="field"><span>Disponible à partir du</span><input type="date" value={form.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} /></label>
            </div>
          </div>

          <div className="publish-card">
            <h2><span>2</span> Localisation</h2>
            <div className="field-row">
              <label className="field"><span>Ville</span><select value={form.city} onChange={(e) => pickCity(e.target.value)}>{CITIES.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
              <label className="field"><span>Quartier</span><input value={form.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Haie Vive" /></label>
            </div>
            <label className="field"><span>Adresse précise *</span><input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Rue des Cocotiers, Haie Vive" /></label>
            <div className="field-row">
              <label className="field"><span>Latitude</span><input value={form.lat} onChange={(e) => set('lat', e.target.value)} placeholder="6.3703" /></label>
              <label className="field"><span>Longitude</span><input value={form.lng} onChange={(e) => set('lng', e.target.value)} placeholder="2.3912" /></label>
            </div>
            <button type="button" className="btn btn-outline btn-sm" onClick={locate}><Navigation size={15} /> Utiliser ma position actuelle</button>
            <p className="form-note"><MapPin size={13} /> Les coordonnées servent à proposer votre bien aux clients situés à proximité.</p>
          </div>

          <div className="publish-card">
            <h2><span>3</span> Description & équipements</h2>
            <label className="field"><span>Description</span><textarea rows={5} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Décrivez le bien, son état, ses atouts, le quartier…" /></label>
            <span className="field-label">Équipements</span>
            <div className="chip-group">
              {availableAmenities.map((a) => <button type="button" key={a} className={amenities.includes(a) ? 'active' : ''} onClick={() => setAmenities((list) => list.includes(a) ? list.filter((x) => x !== a) : [...list, a])}>{a}</button>)}
            </div>
          </div>

          <div className="publish-card">
            <h2><span>4</span> Photos</h2>
            <p className="muted">Choisissez une ou plusieurs photos de démonstration pour votre annonce.</p>
            <div className="image-picker">
              {presetImages.map((img) => (
                <button type="button" key={img} className={images.includes(img) ? 'active' : ''} onClick={() => setImages((list) => list.includes(img) ? (list.length > 1 ? list.filter((x) => x !== img) : list) : [...list, img])}>
                  <img src={img} alt="Photo" />{images.includes(img) && <span><Check size={14} /></span>}
                </button>
              ))}
            </div>
            <p className="form-note"><ImagePlus size={13} /> {images.length} photo(s) sélectionnée(s). L'upload de fichiers réels sera activé avec le stockage cloud.</p>
          </div>

          <button className="btn btn-primary btn-lg btn-block" type="submit">Envoyer mon annonce à validation <Plus size={17} /></button>
        </form>

        <aside className="publish-tips">
          <div className="tips-card">
            <span><Building2 size={20} /></span>
            <h3>Les clés d'une bonne annonce</h3>
            <ul>
              <li><Check size={15} /> Un titre précis avec le quartier</li>
              <li><Check size={15} /> Au moins 3 photos lumineuses</li>
              <li><Check size={15} /> Une description honnête et détaillée</li>
              <li><Check size={15} /> Un prix cohérent avec le marché</li>
            </ul>
          </div>
          <div className="tips-card accent">
            <span><Sparkles size={20} /></span>
            <h3>Visibilité garantie</h3>
            <p>Votre annonce est diffusée à tous les clients Kado Immo et géolocalisée pour apparaître dans les recherches « autour de moi ».</p>
          </div>
          <button className="tips-close" onClick={() => navigate('/proprietaire')}><X size={14} /> Quitter</button>
        </aside>
      </div>
    </div>
  )
}
