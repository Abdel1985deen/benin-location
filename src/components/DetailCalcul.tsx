import { formaterFCFA, type ResultatLocation } from "../lib/alloca-fiscal";
import { repartitionAvance, versementMensuel } from "../lib/agence";

export default function DetailCalcul({
  fiscal,
  moisAvance,
}: {
  fiscal: ResultatLocation;
  moisAvance?: number;
}) {
  const loyer = fiscal.entrees.loyerMensuel;
  const retenue = fiscal.resume.retenueMensuelle;
  const v = versementMensuel(loyer, retenue);
  const av = moisAvance ? repartitionAvance(loyer, moisAvance) : null;

  const ligne = (label: string, valeur: string, fort = false) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "3px 0",
        fontWeight: fort ? 700 : 400,
      }}
    >
      <span>{label}</span>
      <span>{valeur}</span>
    </div>
  );

  return (
    <div
      style={{
        border: "1px solid rgba(128,128,128,.35)",
        borderRadius: 12,
        padding: 12,
        margin: "12px 0",
      }}
    >
      <strong>Comment c’est calculé</strong>

      <p style={{ margin: "8px 0 4px" }}>Chaque mois</p>
      {ligne("Loyer payé par le locataire", formaterFCFA(loyer))}
      {ligne("Retenue à la source (estimation)", "− " + formaterFCFA(retenue))}
      {ligne(
        "Commission de l’agence (" + v.commission.tauxPct! * 100 + " %)",
        "− " + formaterFCFA(v.commission.montant),
      )}
      {ligne("Reçu par le propriétaire", formaterFCFA(v.netProprietaire), true)}

      <p style={{ margin: "10px 0 4px" }}>Détail des taxes (estimations)</p>
      {fiscal.lignes.map((l) =>
        ligne(
          l.libelle +
            (l.tauxPct !== null ? " · " + +(l.tauxPct * 100).toFixed(2) + " %" : "") +
            " (" + l.statut + ")",
          formaterFCFA(l.montant),
        ),
      )}

      {av && (
        <>
          <p style={{ margin: "10px 0 4px" }}>
            Avance de {moisAvance} mois
          </p>
          {ligne("Versée par le locataire", formaterFCFA(av.totalAvance))}
          {ligne(
            "Frais de service de l’agence (50 % d’un loyer)",
            "− " + formaterFCFA(av.frais.montant),
          )}
          {ligne("Reste pour le propriétaire", formaterFCFA(av.netProprietaire), true)}
          {!av.ok && (
            <p style={{ color: "#d33", margin: "6px 0 0" }}>
              Cette avance dépasse le maximum autorisé ({formaterFCFA(av.maximum)}).
            </p>
          )}
        </>
      )}

      <p style={{ fontSize: 12, opacity: 0.7, margin: "10px 0 0" }}>
        Estimations à confirmer avec l’administration fiscale.
      </p>
    </div>
  );
}
