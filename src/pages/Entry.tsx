import type { CSSProperties } from 'react'
import { ArrowRight, FileSignature, MapPin, ShieldCheck } from 'lucide-react'
import { BENIN_CITIES, BENIN_PATH, BENIN_VIEWBOX } from '../lib/beninOutline'
import type { VilleCarte } from '../lib/beninOutline'
import './entry.css'

interface Props {
  onEnter: () => void
}

export interface Etiquette extends VilleCarte {
  lx: number
  ly: number
  anchor: 'start' | 'end'
  ordre: number
}

const ECART = 26 // distance minimale entre deux noms de villes

/**
 * Place les noms de villes dans deux colonnes (à gauche et à droite de la carte),
 * sans chevauchement, et ordonne l'apparition du sud vers le nord.
 */
export function placerEtiquettes(villes: VilleCarte[], largeur: number, hauteur: number): Etiquette[] {
  const centre = largeur / 2
  const ordre = new Map<string, number>(
    villes.slice().sort((a, b) => b.y - a.y).map((v, k) => [v.name, k] as [string, number]),
  )

  const cote = (liste: VilleCarte[], anchor: 'start' | 'end'): Etiquette[] => {
    const tri = liste.slice().sort((a, b) => a.y - b.y)
    const ys = tri.map((v) => v.y)
    for (let k = 1; k < ys.length; k++) ys[k] = Math.max(ys[k], ys[k - 1] + ECART)
    const bas = hauteur - 14
    if (ys.length > 0 && ys[ys.length - 1] > bas) {
      ys[ys.length - 1] = bas
      for (let k = ys.length - 2; k >= 0; k--) ys[k] = Math.min(ys[k], ys[k + 1] - ECART)
    }
    const lx = anchor === 'end' ? 118 : largeur - 118
    return tri.map((v, k) => ({ ...v, lx, ly: ys[k], anchor, ordre: ordre.get(v.name) ?? 0 }))
  }

  return [
    ...cote(villes.filter((v) => v.x < centre), 'end'),
    ...cote(villes.filter((v) => v.x >= centre), 'start'),
  ]
}

const delai = (nom: string, valeur: string | number): CSSProperties => ({ [nom]: valeur }) as CSSProperties

function Lettres({ texte, debut, classe }: { texte: string; debut: number; classe?: string }) {
  return (
    <>
      {Array.from(texte).map((c, k) => (
        <span key={k} className={'entry-char' + (classe ? ' ' + classe : '')} style={delai('--d', debut + k * 0.04 + 's')}>
          {c === ' ' ? '\u00A0' : c}
        </span>
      ))}
    </>
  )
}

const RAISONS = [
  {
    icone: MapPin,
    titre: 'Trouvez près de vous',
    texte: 'Les annonces sont géolocalisées : repérez les logements et les terrains sur la carte, près de vous ou dans la ville de votre choix.',
  },
  {
    icone: FileSignature,
    titre: 'En quelques minutes, en ligne',
    texte: 'Visite virtuelle, contrat de bail et signature électronique : pas de papier, pas de déplacement inutile.',
  },
  {
    icone: ShieldCheck,
    titre: 'Fiable et vérifié',
    texte: 'Les annonces sont vérifiées par l’agence, et le contrat affiche une estimation des taxes de location.',
  },
]

export default function Entry({ onEnter }: Props) {
  const { width, height } = BENIN_VIEWBOX
  const etiquettes = placerEtiquettes(BENIN_CITIES, width, height)
  const noms = BENIN_CITIES.map((v) => v.name)
  const marque = 'Altechinnov'
  const avant = 'Powered by '
  const apres = ', ALAO ABDEL HAFIZI CHAMSON DEEN'

  return (
    <div className="entry">
      <header className="entry-header">
        <div className="entry-flag" role="img" aria-label="Drapeau du Bénin">
          <span className="entry-flag-green" />
          <span className="entry-flag-yellow" />
          <span className="entry-flag-red" />
        </div>
        <span className="entry-brand">ALLOCA BENIN IMMO</span>
      </header>

      <main className="entry-main">
        <section className="entry-hero">
          <span className="entry-kicker">Bienvenue au Bénin</span>
          <h1>
            Votre location par géolocalisation, <em>en quelques minutes</em>, en ligne.
          </h1>
          <p className="entry-lead">
            Louez un logement ou trouvez un terrain dans toutes les villes du site, sans vous déplacer pour rien.
          </p>
          <button type="button" className="entry-cta" onClick={onEnter}>
            Entrer sur le site <ArrowRight size={20} aria-hidden="true" />
          </button>
        </section>

        <section className="entry-map-wrap" aria-label={'Carte du Bénin avec les villes : ' + noms.join(', ')}>
          <svg className="entry-map" viewBox={'0 0 ' + width + ' ' + height} role="img" aria-hidden="true">
            <defs>
              <clipPath id="entry-benin-clip">
                <path d={BENIN_PATH} />
              </clipPath>
            </defs>
            <g clipPath="url(#entry-benin-clip)" className="entry-map-fill">
              <rect x="0" y="0" width={width * 0.46} height={height} fill="#008751" />
              <rect x={width * 0.46} y="0" width={width * 0.54} height={height / 2} fill="#fcd116" />
              <rect x={width * 0.46} y={height / 2} width={width * 0.54} height={height / 2} fill="#e8112d" />
            </g>
            <path d={BENIN_PATH} className="entry-map-line" />
            {etiquettes.map((e) => (
              <g key={e.name} className="entry-city" style={delai('--i', e.ordre)}>
                <line
                  className="entry-leader"
                  x1={e.x}
                  y1={e.y}
                  x2={e.lx + (e.anchor === 'end' ? 5 : -5)}
                  y2={e.ly - 4}
                />
                <circle className="entry-ring" cx={e.x} cy={e.y} r="5" />
                <circle className="entry-dot" cx={e.x} cy={e.y} r="3.4" />
                <text className="entry-label" x={e.lx} y={e.ly} textAnchor={e.anchor}>
                  {e.name}
                </text>
              </g>
            ))}
          </svg>
        </section>

        <section className="entry-why">
          <h2>Pourquoi entrer ?</h2>
          <div className="entry-why-grid">
            {RAISONS.map((r) => (
              <article key={r.titre} className="entry-why-card">
                <r.icone size={22} aria-hidden="true" />
                <h3>{r.titre}</h3>
                <p>{r.texte}</p>
              </article>
            ))}
          </div>
          <button type="button" className="entry-cta entry-cta-bottom" onClick={onEnter}>
            Entrer sur le site <ArrowRight size={20} aria-hidden="true" />
          </button>
        </section>
      </main>

      <div className="entry-marquee" aria-hidden="true">
        <div className="entry-marquee-track">
          {[...noms, ...noms].map((n, k) => (
            <span key={k} className={k >= noms.length ? 'entry-dup' : undefined}>
              {n}
            </span>
          ))}
        </div>
      </div>

      <footer className="entry-credit" aria-label={avant + marque + apres}>
        <span aria-hidden="true">
          <Lettres texte={avant} debut={1.2} />
          <Lettres texte={marque} debut={1.2 + avant.length * 0.04} classe="entry-char-brand" />
          <Lettres texte={apres} debut={1.2 + (avant.length + marque.length) * 0.04} />
        </span>
      </footer>
    </div>
  )
}
