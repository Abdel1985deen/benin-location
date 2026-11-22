import { BENIN_MAP_PLAIN_URL, BENIN_MAP_URL } from '../lib/site'

/**
 * Carte du Bénin générée depuis le vrai contour du pays (ISO 204, world-atlas
 * 50m), projeté en Mercator via d3-geo. Voir scripts/generate-benin-map.mjs.
 */
export default function BeninMap({
  className = '',
  showCities = true,
}: { className?: string; showCities?: boolean }) {
  return (
    <img
      className={`benin-map ${className}`}
      src={showCities ? BENIN_MAP_URL : BENIN_MAP_PLAIN_URL}
      alt={showCities
        ? 'Vrai contour du Bénin aux couleurs du drapeau, avec Cotonou, Abomey-Calavi, Porto-Novo, Parakou et Natitingou'
        : 'Vrai contour du Bénin aux couleurs du drapeau'}
    />
  )
}
