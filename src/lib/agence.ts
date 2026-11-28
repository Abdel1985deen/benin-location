import { verifierAvance, type Ligne } from "./alloca-fiscal";

// Conditions de l'agence
export const TAUX_COMMISSION_PCT = 2; // % du loyer, retenu sur le propriétaire
export const PART_AVANCE_PCT = 50; // % d'UN loyer, prélevé sur les avances

export function commissionLoyer(loyerMensuel: number): Ligne {
  return {
    code: "COMMISSION",
    libelle: "Commission de l'agence (retenue sur le propriétaire)",
    base: loyerMensuel,
    tauxPct: TAUX_COMMISSION_PCT / 100,
    montant: Math.round((loyerMensuel * TAUX_COMMISSION_PCT) / 100),
    periodicite: "mensuelle",
    statut: "fixé par l'agence",
    source: "Conditions de l'agence",
  };
}

export function fraisAvance(loyerMensuel: number): Ligne {
  return {
    code: "FRAIS_AVANCE",
    libelle: "Frais de service de l'agence sur les avances",
    base: loyerMensuel,
    tauxPct: PART_AVANCE_PCT / 100,
    montant: Math.round((loyerMensuel * PART_AVANCE_PCT) / 100),
    periodicite: "une fois",
    statut: "fixé par l'agence",
    source: "Conditions de l'agence",
  };
}

/** Versement mensuel : loyer - retenue fiscale - commission. */
export function versementMensuel(loyerMensuel: number, retenueMensuelle: number) {
  const commission = commissionLoyer(loyerMensuel);
  return {
    commission,
    netProprietaire: loyerMensuel - retenueMensuelle - commission.montant,
  };
}

/** Répartition d'une avance (ex. 2 mois) : total, frais agence, net propriétaire. */
export function repartitionAvance(loyerMensuel: number, moisAvance: number) {
  const totalAvance = loyerMensuel * moisAvance;
  const controle = verifierAvance(loyerMensuel, totalAvance);
  const frais = fraisAvance(loyerMensuel);
  return {
    ok: controle.ok,
    maximum: controle.maximum,
    totalAvance,
    frais,
    netProprietaire: totalAvance - frais.montant,
  };
}
