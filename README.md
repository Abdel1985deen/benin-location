# Kado Immo — application de location immobilière au Bénin 🇧🇯

Application web complète (React + TypeScript + Vite) qui met en relation **clients**, **propriétaires** et **agence de location**, avec géolocalisation, visite virtuelle 360°, contrat signé en ligne et suivi du déménagement / aménagement.

## Démarrer

```bash
cd ~/benin-location
npm install
npm run dev
```

Ouvrez `http://localhost:5173`. Pour un build de production :

```bash
npm run build
npm run preview
```

> Sur Termux, les scripts utilisent directement les binaires Node (`node node_modules/...`) car le shebang `/usr/bin/env` n'existe pas dans cet environnement.

## Comptes de démonstration

| Espace | E-mail | Mot de passe |
| --- | --- | --- |
| Client | `client@demo.bj` | `demo1234` |
| Propriétaire | `proprio@demo.bj` | `demo1234` |
| Agence | `agence@demo.bj` | `demo1234` |

Des boutons « Client / Propriétaire / Agence » sur la page de connexion permettent d'y accéder en un clic. Vous pouvez aussi créer un nouveau compte (les rôles sont choisis à l'inscription).

## Fonctionnalités

### Espace client
- Recherche avec filtres (ville, type, budget, transaction, texte, rayon géographique).
- Géolocalisation navigateur → tri par distance, rayon ajustable et carte OpenStreetMap.
- Fiches détaillées, galerie et **visite virtuelle 360°** (glisser pour explorer).
- Favoris persistants, demandes de visite avec créneau et suivi du statut.
- **Messagerie** avec le propriétaire/agence depuis une annonce, fil de discussion centralisé dans `/messages`.
- **Contrat de location en ligne** en 4 étapes : bail, locataire, garant, signature manuscrite sur canvas.
- **Déménagement & aménagement** : date, ancienne adresse, prestations (camion, emballage, montage, peinture, nettoyage, internet), estimation et checklist de progression.

### Espace propriétaire
- Tableau de bord : biens, demandes de visite, contrats, revenus estimés.
- Publication guidée d'une annonce (localisation, coordonnées GPS, équipements, photos).
- Validation / mise hors ligne des biens, réponse aux demandes de visite.
- Notifications lors des nouvelles demandes, messages, validations et signatures.

### Espace agence
- Validation des annonces en attente.
- Planning des visites, confirmation des rendez-vous.
- Vue d'ensemble du portefeuille et archives des contrats signés.
- Notifications centralisées (cloche) pour les actions clés.

### Général
- Design responsive, identité visuelle dédiée (vert béninois, or, corail).
- Données de démonstration ancrées dans des villes réelles : Cotonou, Abomey-Calavi, Porto-Novo, Ouidah, Bohicon, Parakou, Natitingou.
- Persistance locale (`localStorage`) des comptes, annonces, visites, contrats, déménagements, messages et notifications.
- Jeu de démo pré-rempli (visite confirmée, contrat signé, plan de déménagement, messages et notifications) pour explorer les parcours sans configuration.

## Structure

```
src/
  components/   Layout, PropertyCard, MapView (Leaflet), SignaturePad, DashboardShell
  lib/          data (jeu de données + villes), store (contexte + persistance), utils
  pages/        Home, Explore, PropertyDetail, Auth, ClientDashboard, OwnerDashboard,
                AgencyDashboard, Publish, Contract, Moving
  styles.css    design system complet
```

## Limites de ce prototype

- L'authentification est simulée côté client (mot de passe stocké localement) : à remplacer par un backend avec hachage et JWT/HttpOnly cookies avant production.
- Les photos sont des images de démonstration chargées depuis Unsplash ; l'upload réel nécessite un stockage cloud.
- La signature est une image canvas horodatée localement ; un flux de signature certifié nécessite un prestataire dédié.
- Les paiements (loyers, dépôts, prestations de déménagement) ne sont pas encore intégrés.
- Les cartes utilisent les tuiles OpenStreetMap et nécessitent une connexion internet.

## Prochaines étapes suggérées

1. Backend (API REST/GraphQL), base de données PostgreSQL/PostGIS et vraie authentification.
2. Stockage d'images (S3/Cloudinary) et upload depuis l'espace propriétaire.
3. Paiement mobile money (MTN MoMo, Orange Money) et mutuelle de cautions.
4. Notifications SMS/e-mail pour visites et contrats.
5. Application mobile (PWA ou React Native) pour le déménagement sur le terrain.
