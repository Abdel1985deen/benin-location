/**
 * ALLOCA BENIN IMMO - Module fiscal de la location (v1.0.0, version TypeScript)
 *
 * ATTENTION
 * - Les taux viennent d'une recherche documentaire (dossier investisseur, section 7).
 *   Chaque paramètre porte un statut "confirmé" ou "à confirmer".
 * - Ce module PRÉPARE les calculs. La validation et l'encaissement restent à l'administration.
 * - En production, refaites le calcul côté serveur : un calcul fait dans le navigateur peut être modifié.
 */

export const VERSION = "1.0.0";

export interface Parametre<T = number> {
  valeur: T;
  statut: string;
  source: string;
  actif?: boolean;
}

export interface Parametres {
  version: string;
  irf_pb: Parametre;
  retenue_pb: Parametre;
  retenue_habitation_particulier: Parametre<boolean>;
  droit_bail_pb: Parametre;
  redevance_ortb: Parametre;
  avance_max_mois: Parametre;
  tfu_fourchette_pb: { min: number; max: number; statut: string; source: string };
  npi_regex: Parametre<string>;
}

export type TypeBien = "habitation" | "commerce" | "terrain";
export type TypeLocataire = "particulier" | "entreprise";

export interface EntreesLocation {
  loyerMensuel: number;
  dureeMois?: number;
  chargesTotales?: number;
  typeBien?: TypeBien;
  locataireType?: TypeLocataire;
  tauxTFUpb?: number;
  valeurLocativeAnnuelle?: number;
}

export interface Ligne {
  code: string;
  libelle: string;
  base: number | null;
  tauxPct: number | null;
  montant: number;
  periodicite: string;
  statut: string;
  source: string;
}

export interface ResultatLocation {
  ok: true;
  erreurs: string[];
  version: string;
  parametresVersion: string;
  calculeLe: string;
  entrees: Required<Pick<EntreesLocation, "dureeMois" | "chargesTotales" | "typeBien" | "locataireType">> & EntreesLocation;
  lignes: Ligne[];
  resume: {
    loyerBrutDuree: number;
    retenueMensuelle: number;
    loyerNetMensuel: number;
    irfDuree: number;
    droitBail: number;
    redevanceOrtb: number;
    dueAnnee1: number;
    avanceMaximale: number;
  };
  tfu: {
    valeurLocative: number;
    tauxPct?: number;
    montantAnnuel?: number;
    illustratif?: boolean;
    minAnnuel?: number;
    maxAnnuel?: number;
    statut: string;
  } | null;
  avertissements: string[];
}

export interface ResultatInvalide {
  ok: false;
  erreurs: string[];
}

export interface PersonneContrat {
  npi?: string;
  telephone?: string;
}

export interface ContratAValider {
  bailleur?: PersonneContrat;
  locataire?: PersonneContrat;
  loyerMensuel?: number;
  dureeMois?: number;
  avance?: number;
}

export interface Echeance {
  numero: number;
  date: string;
  loyerBrut: number;
  retenue: number;
  loyerNet: number;
}

// Taux en points de base : 100 pb = 1 %. Aucun taux n'est écrit ailleurs dans le code.
const PARAMS_DEFAUT: Parametres = {
  version: "2026-11-26",
  irf_pb: { valeur: 1200, statut: "confirmé", source: "CGI 2026, art. 104" },
  retenue_pb: { valeur: 1200, statut: "confirmé (texte)", source: "CGI, art. 106 ; rescrit DGI 2026" },
  retenue_habitation_particulier: {
    valeur: true,
    statut: "à confirmer",
    source: "Application de la retenue quand le locataire est un particulier qui loue un logement",
  },
  droit_bail_pb: { valeur: 100, statut: "à confirmer", source: "Source secondaire ; à vérifier dans le CGI 2026" },
  redevance_ortb: { valeur: 4000, actif: false, statut: "à confirmer", source: "CGI version 2021, art. 104" },
  avance_max_mois: { valeur: 2, statut: "confirmé", source: "Loi 2018-12, art. 9" },
  tfu_fourchette_pb: { min: 400, max: 800, statut: "illustratif", source: "Présentation sur la TFU (2023)" },
  npi_regex: { valeur: "^\\d{10}$", statut: "à confirmer", source: "Format du NPI à confirmer auprès de l'organisme national" },
};

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

let params: Parametres = clone(PARAMS_DEFAUT);

/** Remplace certains paramètres, par exemple après une nouvelle loi de finances. */
export function configurer(modifs: { [K in keyof Parametres]?: Partial<Parametres[K]> | Parametres[K] }): Parametres {
  const cible = params as unknown as Record<string, unknown>;
  Object.keys(modifs).forEach((k) => {
    if (!(k in cible)) throw new Error("Paramètre inconnu : " + k);
    const nouveau = (modifs as Record<string, unknown>)[k];
    const actuel = cible[k];
    if (typeof actuel === "object" && actuel !== null && typeof nouveau === "object" && nouveau !== null) {
      Object.assign(actuel, nouveau);
    } else {
      cible[k] = nouveau;
    }
  });
  return clone(params);
}
export function parametres(): Parametres {
  return clone(params);
}
export function reinitialiser(): void {
  params = clone(PARAMS_DEFAUT);
}

// ---------- Utilitaires
function montant(base: number, pb: number): number {
  return Math.round((base * pb) / 10000); // FCFA sans centimes
}
export function formaterFCFA(n: number): string {
  const signe = n < 0 ? "-" : "";
  return signe + String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0") + "\u00A0F\u00A0CFA";
}
function entierPositif(x: unknown): x is number {
  return typeof x === "number" && isFinite(x) && x > 0;
}

// ---------- Identité : téléphone et NPI
/** Accepte +229..., 00229..., 8 chiffres ou 10 chiffres (01 + 8 chiffres). */
export function normaliserTelephone(saisie: unknown): { valide: boolean; e164: string | null; affichage: string | null } {
  let d = String(saisie ?? "").replace(/\D/g, "");
  if (d.indexOf("00229") === 0) d = d.slice(5);
  else if (d.indexOf("229") === 0 && d.length >= 11) d = d.slice(3);
  if (d.length === 8) d = "01" + d;
  const valide = d.length === 10 && d.indexOf("01") === 0;
  if (!valide) return { valide: false, e164: null, affichage: null };
  return {
    valide: true,
    e164: "+229" + d,
    affichage: "+229 " + d.slice(0, 2) + " " + d.slice(2, 4) + " " + d.slice(4, 6) + " " + d.slice(6, 8) + " " + d.slice(8, 10),
  };
}
/** Contrôle de FORMAT uniquement. L'existence du NPI doit être vérifiée côté serveur. */
export function validerNPI(saisie: unknown): { valide: boolean; npi: string | null } {
  const d = String(saisie ?? "").replace(/\s/g, "");
  const ok = new RegExp(params.npi_regex.valeur).test(d);
  return { valide: ok, npi: ok ? d : null };
}
export function masquerNPI(npi: unknown): string {
  const d = String(npi ?? "");
  return d.length <= 3 ? "***" : "*".repeat(d.length - 3) + d.slice(-3);
}

// ---------- Règles de la loi de 2018
export function verifierAvance(loyerMensuel: number, avance: number): { ok: boolean; maximum: number } {
  const maximum = params.avance_max_mois.valeur * loyerMensuel;
  return { ok: avance <= maximum, maximum };
}

/** Vérifie les données d'un contrat avant tout calcul. */
export function validerContrat(c: ContratAValider): { ok: boolean; erreurs: string[] } {
  const e: string[] = [];
  (["bailleur", "locataire"] as const).forEach((r) => {
    const p = c[r] ?? {};
    if (!validerNPI(p.npi).valide) e.push("NPI invalide pour le " + r + ".");
    if (!normaliserTelephone(p.telephone).valide) e.push("Numéro de téléphone invalide pour le " + r + ".");
  });
  if (!entierPositif(c.loyerMensuel)) e.push("Le loyer mensuel doit être un nombre positif.");
  if (!(Number.isInteger(c.dureeMois) && (c.dureeMois as number) >= 1)) e.push("La durée du bail doit être d'au moins 1 mois.");
  if (c.avance !== undefined && entierPositif(c.loyerMensuel) && !verifierAvance(c.loyerMensuel, c.avance).ok) {
    e.push("L'avance dépasse " + params.avance_max_mois.valeur + " mois de loyer (loi 2018-12, art. 9).");
  }
  return { ok: e.length === 0, erreurs: e };
}

// ---------- Calcul fiscal
export function calculerLocation(entrees: EntreesLocation): ResultatLocation | ResultatInvalide {
  const e = {
    dureeMois: 12,
    chargesTotales: 0,
    typeBien: "habitation" as TypeBien,
    locataireType: "particulier" as TypeLocataire,
    ...entrees,
  };
  const erreurs: string[] = [];
  if (!entierPositif(e.loyerMensuel)) erreurs.push("Loyer mensuel invalide.");
  if (!(Number.isInteger(e.dureeMois) && e.dureeMois >= 1)) erreurs.push("Durée invalide.");
  if (erreurs.length) return { ok: false, erreurs };

  const avert: string[] = [];
  const loyerDuree = e.loyerMensuel * e.dureeMois;
  const moisAn1 = Math.min(12, e.dureeMois);
  const lignes: Ligne[] = [];

  // 1) IRF 12 % sur les loyers bruts
  const irfDuree = montant(loyerDuree, params.irf_pb.valeur);
  const irfAn1 = montant(e.loyerMensuel * moisAn1, params.irf_pb.valeur);
  lignes.push({ code: "IRF", libelle: "Impôt sur les revenus fonciers", base: loyerDuree, tauxPct: params.irf_pb.valeur / 100,
    montant: irfDuree, periodicite: "durée du bail", statut: params.irf_pb.statut, source: params.irf_pb.source });

  // 2) Retenue à la source mensuelle
  const retenueOK = !(e.typeBien === "habitation" && e.locataireType === "particulier" && !params.retenue_habitation_particulier.valeur);
  const retenueMensuelle = retenueOK ? montant(e.loyerMensuel, params.retenue_pb.valeur) : 0;
  if (retenueOK) {
    lignes.push({ code: "RETENUE", libelle: "Retenue à la source sur le loyer", base: e.loyerMensuel, tauxPct: params.retenue_pb.valeur / 100,
      montant: retenueMensuelle, periodicite: "mensuelle", statut: params.retenue_pb.statut, source: params.retenue_pb.source });
  }
  if (e.typeBien === "habitation" && e.locataireType === "particulier") {
    avert.push("Retenue à la source : application aux locataires particuliers d'habitation à confirmer avec la DGI.");
  }

  // 3) Droit de bail sur les loyers cumulés + charges
  const baseBail = loyerDuree + e.chargesTotales;
  const droitBail = montant(baseBail, params.droit_bail_pb.valeur);
  lignes.push({ code: "DROIT_BAIL", libelle: "Droit de bail (enregistrement)", base: baseBail, tauxPct: params.droit_bail_pb.valeur / 100,
    montant: droitBail, periodicite: "à l'enregistrement", statut: params.droit_bail_pb.statut, source: params.droit_bail_pb.source });
  if (params.droit_bail_pb.statut.indexOf("confirmer") >= 0) avert.push("Taux du droit de bail à confirmer.");

  // 4) Redevance ORTB (désactivée par défaut)
  let ortb = 0;
  if (params.redevance_ortb.actif) {
    ortb = params.redevance_ortb.valeur * Math.ceil(e.dureeMois / 12);
    lignes.push({ code: "ORTB", libelle: "Redevance ORTB", base: null, tauxPct: null, montant: ortb, periodicite: "annuelle",
      statut: params.redevance_ortb.statut, source: params.redevance_ortb.source });
  }

  // 5) TFU : à la charge du propriétaire, calculée à part
  let tfu: ResultatLocation["tfu"] = null;
  if (e.typeBien !== "terrain") {
    const vl = e.valeurLocativeAnnuelle ?? e.loyerMensuel * 12;
    if (typeof e.tauxTFUpb === "number") {
      tfu = { valeurLocative: vl, tauxPct: e.tauxTFUpb / 100, montantAnnuel: montant(vl, e.tauxTFUpb), statut: "taux communal fourni" };
    } else {
      tfu = { valeurLocative: vl, illustratif: true,
        minAnnuel: montant(vl, params.tfu_fourchette_pb.min), maxAnnuel: montant(vl, params.tfu_fourchette_pb.max),
        statut: "illustratif : taux de la commune à renseigner" };
      avert.push("TFU : fourchette illustrative ; renseignez le taux de la commune.");
    }
  } else {
    avert.push("Terrain : vérifier le régime fiscal applicable.");
  }

  return {
    ok: true, erreurs: [], version: VERSION, parametresVersion: params.version,
    calculeLe: new Date().toISOString(), entrees: e, lignes,
    resume: {
      loyerBrutDuree: loyerDuree, retenueMensuelle, loyerNetMensuel: e.loyerMensuel - retenueMensuelle,
      irfDuree, droitBail, redevanceOrtb: ortb,
      dueAnnee1: irfAn1 + droitBail + (params.redevance_ortb.actif ? params.redevance_ortb.valeur : 0),
      avanceMaximale: params.avance_max_mois.valeur * e.loyerMensuel,
    },
    tfu, avertissements: avert,
  };
}

/** Échéancier mensuel : loyer brut, retenue et loyer net pour chaque mois. */
export function echeancier(
  entrees: EntreesLocation,
  dateDebut?: string,
): { ok: true; echeances: Echeance[]; avertissements: string[] } | ResultatInvalide {
  const r = calculerLocation(entrees);
  if (!r.ok) return r;
  const d0 = dateDebut ? new Date(dateDebut + "T00:00:00Z") : new Date();
  const echeances: Echeance[] = [];
  for (let i = 0; i < r.entrees.dureeMois; i++) {
    const an = d0.getUTCFullYear();
    const mois = d0.getUTCMonth() + i;
    const an2 = an + Math.floor(mois / 12);
    const m2 = ((mois % 12) + 12) % 12;
    const dernierJour = new Date(Date.UTC(an2, m2 + 1, 0)).getUTCDate();
    const jour = Math.min(d0.getUTCDate(), dernierJour);
    echeances.push({
      numero: i + 1,
      date: an2 + "-" + String(m2 + 1).padStart(2, "0") + "-" + String(jour).padStart(2, "0"),
      loyerBrut: r.entrees.loyerMensuel,
      retenue: r.resume.retenueMensuelle,
      loyerNet: r.resume.loyerNetMensuel,
    });
  }
  return { ok: true, echeances, avertissements: r.avertissements };
}

// ---------- Journal d'audit (sans NPI en clair)
function empreinte(texte: string): string {
  // Somme de contrôle simple (FNV-1a) : détecte les erreurs, pas les falsifications.
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return ("00000000" + h.toString(16)).slice(-8);
}

export interface EntreeJournal {
  horodatage: string;
  contratId: string | null;
  bailleurNpi: string;
  locataireNpi: string;
  moduleVersion: string;
  parametresVersion: string;
  entrees: ResultatLocation["entrees"];
  resume: ResultatLocation["resume"];
  avertissements: string[];
  empreinte: string;
}

export function journaliser(
  resultat: ResultatLocation,
  contexte: { contratId?: string; bailleurNpi?: string; locataireNpi?: string } = {},
): EntreeJournal {
  const base = {
    horodatage: new Date().toISOString(),
    contratId: contexte.contratId ?? null,
    bailleurNpi: masquerNPI(contexte.bailleurNpi),
    locataireNpi: masquerNPI(contexte.locataireNpi),
    moduleVersion: VERSION,
    parametresVersion: resultat.parametresVersion,
    entrees: resultat.entrees,
    resume: resultat.resume,
    avertissements: resultat.avertissements,
  };
  return { ...base, empreinte: empreinte(JSON.stringify(base)) };
}
