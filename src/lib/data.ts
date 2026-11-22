import type { Listing, User } from '../types'

const photo = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=82`

export const IMG = {
  living1: photo('1600585154340-be6161a56a0c'),
  living2: photo('1600607687939-ce8a6c25118c'),
  living3: photo('1600566753190-17f0baa2a6c3'),
  living4: photo('1600210492486-724fe5c67fb0'),
  kitchen1: photo('1600607687920-4e2a09cf159d'),
  bedroom1: photo('1600566753086-00f18fb6b3ea'),
  bedroom2: photo('1600566752355-35792bedcfea'),
  house1: photo('1600047509807-ba8f99d2cdde'),
  house2: photo('1512917774080-9991f1c4c750'),
  house3: photo('1583608205776-bfd35f0d9f83'),
  terrace: photo('1600607688969-a5bfcd646154'),
  land1: photo('1500382017468-9049fed747ef'),
  land2: photo('1592595896551-12b371d546d5'),
  city: photo('1519501025264-65ba15a82390'),
  office: photo('1497366754035-f200968a6e72'),
  panorama: photo('1600607687939-ce8a6c25118c', 2400),
  panorama2: photo('1600210492486-724fe5c67fb0', 2400),
  // Portraits libres de droits (Unsplash) pour les clients satisfaits.
  person1: photo('1544005313-94ddf0286df2', 240),
  person2: photo('1500648767791-00dcc994a43e', 240),
  person3: photo('1534528741775-53994a69daeb', 240),
}

export interface City {
  name: string
  lat: number
  lng: number
  region: string
}

export const CITIES: City[] = [
  { name: 'Cotonou', lat: 6.3703, lng: 2.3912, region: 'Littoral' },
  { name: 'Abomey-Calavi', lat: 6.4425, lng: 2.3565, region: 'Atlantique' },
  { name: 'Porto-Novo', lat: 6.4969, lng: 2.6038, region: 'Ouémé' },
  { name: 'Ouidah', lat: 6.3572, lng: 2.0878, region: 'Atlantique' },
  { name: 'Bohicon', lat: 7.1967, lng: 2.0633, region: 'Zou' },
  { name: 'Abomey', lat: 7.1881, lng: 2.0169, region: 'Zou' },
  { name: 'Parakou', lat: 9.3406, lng: 2.7541, region: 'Borgou' },
  { name: 'Djougou', lat: 9.7, lng: 1.1667, region: 'Donga' },
  { name: 'Natitingou', lat: 10.2667, lng: 1.3667, region: 'Atacora' },
]

export const cityOptions = CITIES.map((c) => c.name)

export const seedUsers: User[] = [
  {
    id: 'u-client', name: 'Chantal Sossou', email: 'client@demo.bj', phone: '+229 97 12 34 56',
    password: 'demo1234', role: 'client', city: 'Cotonou', createdAt: '2026-09-12T09:00:00Z',
  },
  {
    id: 'u-owner', name: 'Amédée Dossou', email: 'proprio@demo.bj', phone: '+229 96 45 78 90',
    password: 'demo1234', role: 'owner', city: 'Abomey-Calavi', createdAt: '2026-07-04T09:00:00Z',
  },
  {
    id: 'u-agency', name: 'Agence ALLOCA BENIN', email: 'agence@demo.bj', phone: '+229 21 30 45 67',
    password: 'demo1234', role: 'agency', city: 'Cotonou', createdAt: '2026-01-15T09:00:00Z',
    agency: 'ALLOCA BENIN',
  },
  {
    id: 'u-owner2', name: 'Mariam Alassane', email: 'mariam@demo.bj', phone: '+229 95 66 12 44',
    password: 'demo1234', role: 'owner', city: 'Cotonou', createdAt: '2026-08-20T09:00:00Z',
  },
]

const daysFromNow = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

export const seedListings: Listing[] = [
  {
    id: 'l1',
    title: 'Appartement lumineux à Haie Vive',
    type: 'Appartement', city: 'Cotonou', neighborhood: 'Haie Vive', address: 'Rue des Cocotiers, Haie Vive',
    price: 185000, sale: false, furnished: false, surface: 92, rooms: 3, bathrooms: 2,
    images: [IMG.living1, IMG.kitchen1, IMG.bedroom1, IMG.terrace],
    panorama: IMG.panorama,
    description: "Un appartement moderne et baigné de lumière, à deux pas des commerces et de l'ambassade. Grand séjour ouvert sur une terrasse, cuisine équipée et chambres climatisées. Idéal pour une famille ou un couple en quête de confort.",
    amenities: ['Climatisation', 'Terrasse', 'Cuisine équipée', 'Parking', 'Eau courante', 'Sécurité 24h/24'],
    lat: 6.3487, lng: 2.3921, ownerId: 'u-owner', status: 'approved', featured: true,
    availableFrom: daysFromNow(12), createdAt: daysFromNow(-8),
  },
  {
    id: 'l2',
    title: 'Villa avec piscine à Fidjrossè',
    type: 'Villa', city: 'Cotonou', neighborhood: 'Fidjrossè', address: 'Fidjrossè-Plage, Cotonou',
    price: 420000, sale: false, furnished: false, surface: 240, rooms: 5, bathrooms: 4,
    images: [IMG.house1, IMG.living2, IMG.bedroom2, IMG.terrace],
    panorama: IMG.panorama2,
    description: "Superbe villa familiale à 300 m de la plage. Piscine privative, vaste jardin ombragé, cinq chambres dont une suite parentale. Une adresse rare pour vivre Cotonou autrement.",
    amenities: ['Piscine', 'Jardin', 'Climatisation', 'Parking 2 voitures', 'Groupe électrogène', 'Sécurité'],
    lat: 6.3298, lng: 2.3742, ownerId: 'u-owner2', status: 'approved', featured: true,
    availableFrom: daysFromNow(30), createdAt: daysFromNow(-15),
  },
  {
    id: 'l3',
    title: 'Studio meublé près de l’Université',
    type: 'Studio', city: 'Abomey-Calavi', neighborhood: 'Calavi-Akassato', address: 'Campus universitaire, Abomey-Calavi',
    price: 95000, sale: false, furnished: true, surface: 32, rooms: 1, bathrooms: 1,
    images: [IMG.living3, IMG.bedroom1, IMG.kitchen1],
    panorama: IMG.panorama,
    description: "Studio entièrement meublé et prêt à habiter, à 5 minutes du campus. Internet inclus, compteur électrique prépayé, commerces et transport à proximité.",
    amenities: ['Meublé', 'Internet', 'Climatisation', 'Eau courante', 'Proche campus'],
    lat: 6.4432, lng: 2.3541, ownerId: 'u-owner', status: 'approved', featured: true,
    availableFrom: daysFromNow(3), createdAt: daysFromNow(-4),
  },
  {
    id: 'l4',
    title: 'Terrain viabilisé à Calavi-Sô-Ava',
    type: 'Terrain', city: 'Abomey-Calavi', neighborhood: 'Sô-Ava', address: 'Route de Sô-Ava, Abomey-Calavi',
    price: 12500000, sale: true, furnished: false, surface: 600, rooms: 0, bathrooms: 0,
    images: [IMG.land1, IMG.land2], panorama: IMG.land1,
    description: "Terrain plat et viabilisé, titre foncier disponible, à proximité immédiate du lac. Idéal pour une résidence ou une maison individuelle.",
    amenities: ['Titre foncier', 'Viabilisé', 'Bord de lac', 'Accès route'],
    lat: 6.4703, lng: 2.3895, ownerId: 'u-owner', status: 'approved', featured: false,
    availableFrom: daysFromNow(0), createdAt: daysFromNow(-22),
  },
  {
    id: 'l5',
    title: 'Maison familiale à Porto-Novo',
    type: 'Maison', city: 'Porto-Novo', neighborhood: 'Ouando', address: 'Quartier Ouando, Porto-Novo',
    price: 145000, sale: false, furnished: false, surface: 130, rooms: 4, bathrooms: 2,
    images: [IMG.house2, IMG.living4, IMG.bedroom2], panorama: IMG.panorama2,
    description: "Maison spacieuse dans un quartier résidentiel calme. Grande cour, quatre chambres et une véranda ombragée. À deux pas des écoles et du marché.",
    amenities: ['Cour privative', 'Véranda', 'Parking', 'Eau courante', 'Quartier calme'],
    lat: 6.4947, lng: 2.6072, ownerId: 'u-owner2', status: 'approved', featured: false,
    availableFrom: daysFromNow(20), createdAt: daysFromNow(-11),
  },
  {
    id: 'l6',
    title: 'Appartement standing à Parakou',
    type: 'Appartement', city: 'Parakou', neighborhood: 'Centre-ville', address: 'Avenue du Niger, Parakou',
    price: 165000, sale: false, furnished: false, surface: 105, rooms: 3, bathrooms: 2,
    images: [IMG.living2, IMG.kitchen1, IMG.bedroom1], panorama: IMG.panorama,
    description: "Appartement haut de gamme au cœur de Parakou. Finitions soignées, ascenseur, sécurité et commerces au pied de l'immeuble.",
    amenities: ['Ascenseur', 'Climatisation', 'Sécurité', 'Parking', 'Commerces à proximité'],
    lat: 9.3406, lng: 2.7541, ownerId: 'u-owner', status: 'approved', featured: false,
    availableFrom: daysFromNow(9), createdAt: daysFromNow(-6),
  },
  {
    id: 'l7',
    title: 'Duplex neuf à Gbégamey',
    type: 'Appartement', city: 'Cotonou', neighborhood: 'Gbégamey', address: 'Gbégamey, Cotonou',
    price: 220000, sale: false, furnished: true, surface: 118, rooms: 4, bathrooms: 3,
    images: [IMG.house3, IMG.living1, IMG.terrace], panorama: IMG.panorama2,
    description: "Duplex neuf avec toit-terrasse et vue dégagée. Deux niveaux, quatre chambres, une cuisine ouverte et un garage. Livré peint et prêt à occuper.",
    amenities: ['Toit-terrasse', 'Garage', 'Climatisation', 'Neuf', 'Sécurité'],
    lat: 6.3642, lng: 2.3834, ownerId: 'u-owner2', status: 'pending', featured: false,
    availableFrom: daysFromNow(25), createdAt: daysFromNow(-1),
  },
  {
    id: 'l8',
    title: 'Terrain d’angle à Ouidah',
    type: 'Terrain', city: 'Ouidah', neighborhood: 'Kpassè', address: 'Quartier Kpassè, Ouidah',
    price: 4800000, sale: true, furnished: false, surface: 450, rooms: 0, bathrooms: 0,
    images: [IMG.land2, IMG.land1], panorama: IMG.land2,
    description: "Parcelle d'angle à 10 minutes de la plage de Ouidah. Papiers en règle, quartier en pleine expansion, forte plus-value à la revente.",
    amenities: ['Papiers en règle', 'Angle de rue', 'Proche plage', 'Quartier en expansion'],
    lat: 6.3572, lng: 2.0878, ownerId: 'u-owner', status: 'approved', featured: false,
    availableFrom: daysFromNow(0), createdAt: daysFromNow(-18),
  },
  {
    id: 'l9',
    title: 'Studio cosy à Bohicon',
    type: 'Studio', city: 'Bohicon', neighborhood: 'Agbang', address: 'Agbang, Bohicon',
    price: 75000, sale: false, furnished: true, surface: 28, rooms: 1, bathrooms: 1,
    images: [IMG.living4, IMG.bedroom2], panorama: IMG.panorama,
    description: "Petit studio propre et abordable, idéal pour un étudiant ou un jeune actif. Cuisine équipée et salle d'eau rénovée.",
    amenities: ['Meublé', 'Eau courante', 'Rénové', 'Transport à proximité'],
    lat: 7.1967, lng: 2.0633, ownerId: 'u-owner2', status: 'approved', featured: false,
    availableFrom: daysFromNow(5), createdAt: daysFromNow(-9),
  },
  {
    id: 'l10',
    title: 'Maison avec cour à Natitingou',
    type: 'Maison', city: 'Natitingou', neighborhood: 'Pépori', address: 'Quartier Pépori, Natitingou',
    price: 110000, sale: false, furnished: false, surface: 150, rooms: 4, bathrooms: 2,
    images: [IMG.house2, IMG.living3, IMG.land1], panorama: IMG.panorama2,
    description: "Maison traditionnelle rénovée au climat agréable du nord. Grande cour ombragée, quatre chambres et cuisine externe.",
    amenities: ['Grande cour', 'Rénovée', 'Cuisine externe', 'Eau courante'],
    lat: 10.2667, lng: 1.3667, ownerId: 'u-owner', status: 'approved', featured: false,
    availableFrom: daysFromNow(14), createdAt: daysFromNow(-25),
  },
  {
    id: 'l11',
    title: 'Grand terrain à bâtir à Parakou',
    type: 'Terrain', city: 'Parakou', neighborhood: 'Nikki', address: 'Route de Nikki, Parakou',
    price: 6800000, sale: true, furnished: false, surface: 800, rooms: 0, bathrooms: 0,
    images: [IMG.land1, IMG.land2], panorama: IMG.land1,
    description: "Vaste parcelle plate et viabilisée en périphérie de Parakou, à proximité des axes commerciaux. Papiers en règle, idéale pour une résidence ou un projet d'habitation.",
    amenities: ['Titre foncier', 'Viabilisé', 'Accès route', 'Quartier en expansion'],
    lat: 9.312, lng: 2.776, ownerId: 'u-owner2', status: 'approved', featured: false,
    availableFrom: daysFromNow(0), createdAt: daysFromNow(-7),
  },
  {
    id: 'l12',
    title: 'Terrain viabilisé à Bohicon',
    type: 'Terrain', city: 'Bohicon', neighborhood: 'Agbang', address: 'Agbang, Bohicon',
    price: 3900000, sale: true, furnished: false, surface: 500, rooms: 0, bathrooms: 0,
    images: [IMG.land2, IMG.land1], panorama: IMG.land2,
    description: "Parcelle viabilisée à quelques minutes du centre de Bohicon. Accès facile, eau et électricité à proximité, papiers disponibles.",
    amenities: ['Viabilisé', 'Papiers en règle', 'Accès route', 'Eau courante à proximité'],
    lat: 7.193, lng: 2.059, ownerId: 'u-owner', status: 'approved', featured: false,
    availableFrom: daysFromNow(0), createdAt: daysFromNow(-13),
  },
]
