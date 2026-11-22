# Reprise du projet ALLOCA BENIN

## Emplacement
- Projet : `~/benin-location`
- Sauvegarde source (sans `node_modules`/`dist`) : `~/benin-location-save.tar.gz`

## Relancer
```bash
cd ~/benin-location
npm run dev
```
Puis ouvrir http://localhost:5173 (ou l'URL "Network" affichée par Vite).

Si `node_modules` manque (après restauration de l'archive) : `npm install` puis `npm run dev`.
Build prod : `npm run build` puis `npm run preview`.

## Comptes démo
- `client@demo.bj` / `demo1234`
- `proprio@demo.bj` / `demo1234`
- `agence@demo.bj` / `demo1234`

## État actuel
- App React + TypeScript + Vite (ALLOCA BENIN, Bénin) — « Louer partout au Bénin facilement et rapidement via votre position ».
- Parcours : annonces triées par distance, visite 360°, demande de visite, contrat en ligne + signature, déménagement/aménagement, messagerie, notifications.
- Nouveautés : carte du Bénin tricolore en accueil, garantie 3 mois affichée, meublé/non meublé, rubrique `/terrains`, inscription « Agence immobilière ».
- Espaces client / propriétaire / agence.
- Données de démo pré-remplies (visite confirmée, contrat signé `c-demo1`, plan de déménagement, messages, notifications).

## Notes
- Les données créées dans le navigateur sont dans `localStorage` (clé `alloca-benin-v2`) et la position dans `sessionStorage` (clé `alloca-benin-geo`) : utiliser le même navigateur/profil pour les retrouver.
- Pour réinitialiser la démo : vider le stockage du site pour localhost:5173 puis recharger.
- Détails complets : `README.md`.
