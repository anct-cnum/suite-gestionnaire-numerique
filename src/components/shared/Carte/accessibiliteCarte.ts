import { Map } from 'maplibre-gl'

import departements from '../../../../ressources/departements.json'

// Textes de MapLibre traduits en français (RGAA 8.7). Les cartes n'affichent aucun contrôle MapLibre (le zoom passe
// par des boutons DSFR), mais tout est traduit pour qu'aucun texte anglais ne réapparaisse si un contrôle est ajouté.
export const LOCALE_CARTE_FR: Readonly<Record<string, string>> = {
  'AttributionControl.MapFeedback': 'Signaler une erreur sur la carte',
  'AttributionControl.ToggleAttribution': 'Afficher les sources de la carte',
  'CooperativeGesturesHandler.MacHelpText': 'Utilisez ⌘ + molette pour zoomer sur la carte',
  'CooperativeGesturesHandler.MobileHelpText': 'Utilisez deux doigts pour déplacer la carte',
  'CooperativeGesturesHandler.WindowsHelpText': 'Utilisez Ctrl + molette pour zoomer sur la carte',
  'FullscreenControl.Enter': 'Afficher la carte en plein écran',
  'FullscreenControl.Exit': 'Quitter le plein écran',
  'GeolocateControl.FindMyLocation': 'Me localiser',
  'GeolocateControl.LocationNotAvailable': 'Position non disponible',
  'GlobeControl.Disable': 'Désactiver le globe',
  'GlobeControl.Enable': 'Activer le globe',
  'LogoControl.Title': 'Logo MapLibre',
  'Map.Title': 'Carte',
  'Marker.Title': 'Repère sur la carte',
  'NavigationControl.ResetBearing': 'Réinitialiser l’orientation de la carte',
  'NavigationControl.ZoomIn': 'Zoomer',
  'NavigationControl.ZoomOut': 'Dézoomer',
  'Popup.Close': 'Fermer',
  'ScaleControl.Feet': 'pi',
  'ScaleControl.Kilometers': 'km',
  'ScaleControl.Meters': 'm',
  'ScaleControl.Miles': 'mi',
  'ScaleControl.NauticalMiles': 'mn',
  'TerrainControl.Disable': 'Désactiver le relief',
  'TerrainControl.Enable': 'Activer le relief',
}

// Le canvas d'une carte est une image porteuse d'information (RGAA 1.1, Arya Access 16/11/2026) : role="img" et un
// nom explicite, à la place de role="region", aria-label="Carte" et tabindex="0" posés par MapLibre à la création.
// Il reste hors tabulation (#2247) : le zoom passe par les boutons DSFR, les données par le tableau des chiffres clés.
export function decrireCanevas(carte: Pick<Map, 'getCanvas'>, nomAccessible: string): void {
  const canevas = carte.getCanvas()
  canevas.removeAttribute('aria-hidden')
  canevas.setAttribute('role', 'img')
  canevas.setAttribute('aria-label', nomAccessible)
  canevas.setAttribute('tabindex', '-1')
}

// Nom de la carte de l'indice de fragilité d'un territoire : les communes sont colorées pour un département ou un EPCI,
// les départements pour une région.
export function nomAccessibleCarteFragilite(territoire: TerritoireNomme): string {
  if (territoire.type === 'region') {
    return `${NOM_CARTE_FRAGILITE} par département, ${territoire.nom}`
  }
  const nom = territoire.type === 'epci' ? territoire.nom : nomDuDepartement(territoire.code)
  return `${NOM_CARTE_FRAGILITE} par commune, ${nom}`
}

export const NOM_CARTE_FRAGILITE = "Carte de l'indice de fragilité numérique"

type TerritoireNomme =
  | Readonly<{ code: string; type: 'departement' }>
  | Readonly<{ nom: string; type: 'epci' }>
  | Readonly<{ nom: string; type: 'region' }>

function nomDuDepartement(code: string): string {
  return (
    (departements as ReadonlyArray<Readonly<{ code: string; nom: string }>>).find(
      (departement) => departement.code === code
    )?.nom ?? code
  )
}
