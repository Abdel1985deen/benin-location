export const FRAIS_OUVERTURE_COMPTE = 12000; // FCFA, une seule fois
export const TAUX_COMMISSION_VENTE_PCT = 10; // % de l'offre acceptée

export function repartitionVente(offre: number) {
  const commission = Math.round((offre * TAUX_COMMISSION_VENTE_PCT) / 100);
  return { offre, commission, netProprietaire: offre - commission };
}
