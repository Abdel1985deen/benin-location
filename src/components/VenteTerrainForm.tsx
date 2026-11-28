import { useState, type CSSProperties } from "react";
import { formaterFCFA, normaliserTelephone, validerNPI } from "../lib/alloca-fiscal";
import { FRAIS_OUVERTURE_COMPTE, TAUX_COMMISSION_VENTE_PCT, repartitionVente } from "../lib/vente-terrain";

const champ: CSSProperties = {
  width: "100%", padding: 10, margin: "4px 0 12px", borderRadius: 8,
  border: "1px solid rgba(128,128,128,.5)", background: "transparent",
  color: "inherit", boxSizing: "border-box",
};
const boite: CSSProperties = {
  border: "1px solid rgba(128,128,128,.35)", borderRadius: 12, padding: 12, margin: "12px 0",
};

type Etat = {
  nom: string; telephone: string; npi: string;
  commune: string; quartier: string; superficie: string; prix: string; video: string;
  acte: boolean; geometre: boolean; titreFoncier: boolean; accepte: boolean;
};

export default function VenteTerrainForm() {
  const [f, setF] = useState<Etat>({
    nom: "", telephone: "", npi: "", commune: "", quartier: "",
    superficie: "", prix: "", video: "",
    acte: false, geometre: false, titreFoncier: false, accepte: false,
  });
  const [erreurs, setErreurs] = useState<string[]>([]);
  const [envoye, setEnvoye] = useState(false);
  const maj = (k: keyof Etat, v: string | boolean) => setF({ ...f, [k]: v });
  const prix = Number(f.prix) || 0;
  const r = repartitionVente(prix);

  function envoyer() {
    const e: string[] = [];
    if (!f.nom.trim()) e.push("Nom du propriétaire requis.");
    if (!normaliserTelephone(f.telephone).valide) e.push("Numéro de téléphone invalide.");
    if (!validerNPI(f.npi).valide) e.push("NPI invalide (démo : utilisez un NPI fictif).");
    if (!f.commune.trim()) e.push("Commune requise.");
    if (!(Number(f.superficie) > 0)) e.push("Superficie invalide.");
    if (!(prix > 0)) e.push("Prix demandé invalide.");
    if (!f.accepte) e.push("Vous devez accepter les conditions financières.");
    setErreurs(e);
    if (!e.length) setEnvoye(true);
  }

  const texte = (k: keyof Etat, label: string, type = "text") => (
    <label>
      {label}
      <input style={champ} type={type} value={f[k] as string}
        onChange={(ev) => maj(k, ev.target.value)} />
    </label>
  );
  const case_ = (k: keyof Etat, label: string) => (
    <label style={{ display: "block", margin: "6px 0" }}>
      <input type="checkbox" checked={f[k] as boolean}
        onChange={(ev) => maj(k, ev.target.checked)} /> {label}
    </label>
  );

  if (envoye) {
    return (
      <div style={boite}>
        <strong>Demande enregistrée (démonstration)</strong>
        <p>Pour lancer la communication sur votre terrain, réglez les frais d’ouverture de compte : {formaterFCFA(FRAIS_OUVERTURE_COMPTE)}.</p>
        <p>L’agence vérifie ensuite vos pièces avant la mise en ligne.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Mettre un terrain en vente</h2>

      <div style={boite}>
        <strong>Conditions financières</strong>
        <p style={{ margin: "6px 0" }}>
          Ouverture de compte : {formaterFCFA(FRAIS_OUVERTURE_COMPTE)}, une seule fois, pour lancer la communication sur la plateforme.
        </p>
        <p style={{ margin: "6px 0" }}>
          Commission de l’agence : {TAUX_COMMISSION_VENTE_PCT} % de l’offre acceptée, retenue sur votre versement.
        </p>
        <p style={{ margin: "6px 0" }}>Aucune avance n’est demandée pour un terrain.</p>
        {prix > 0 && (
          <p style={{ margin: "6px 0", fontWeight: 700 }}>
            Exemple pour {formaterFCFA(prix)} : commission {formaterFCFA(r.commission)}, vous recevez {formaterFCFA(r.netProprietaire)}.
          </p>
        )}
      </div>

      <h3>Propriétaire</h3>
      {texte("nom", "Nom et prénom")}
      {texte("telephone", "Téléphone (+229 …)", "tel")}
      {texte("npi", "NPI (démo : NPI fictif)")}

      <h3>Terrain</h3>
      {texte("commune", "Commune")}
      {texte("quartier", "Quartier ou lieu-dit")}
      {texte("superficie", "Superficie (m²)", "number")}
      {texte("prix", "Prix demandé (FCFA)", "number")}
      {texte("video", "Lien de la vidéo de visite (optionnel)")}

      <h3>Pièces à remettre à l’agence</h3>
      <p style={{ opacity: 0.8, margin: "0 0 6px" }}>
        Elles sont envoyées à l’agence, jamais au client.
      </p>
      {case_("acte", "Acte de propriété")}
      {case_("geometre", "Localisation faite par un géomètre")}
      {case_("titreFoncier", "Titre foncier")}

      {case_("accepte", "J’accepte les conditions financières ci-dessus")}

      {erreurs.map((m) => (
        <p key={m} style={{ color: "#d33", margin: "4px 0" }}>{m}</p>
      ))}
      <button onClick={envoyer} style={{ ...champ, fontWeight: 700, cursor: "pointer" }}>
        Envoyer ma demande
      </button>
    </div>
  );
}
