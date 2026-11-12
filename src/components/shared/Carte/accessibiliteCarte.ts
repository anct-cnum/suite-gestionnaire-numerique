import { Map } from 'maplibre-gl'

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

// La carte est une image dont le contenu est restitué ailleurs (recherche, liste des départements, tableau).
// MapLibre pose sur le canvas role="region", aria-label et tabindex="0" à la création : on les retire
// pour que le canvas ne soit ni un arrêt de tabulation ni une zone (RGAA 7.1, 12.6, 12.8).
// Seul le canvas est masqué : les boutons Zoomer / Dézoomer, hors du canvas, restent accessibles.
export function rendreCanevasMuet(carte: Pick<Map, 'getCanvas'>): void {
  const canevas = carte.getCanvas()
  canevas.removeAttribute('role')
  canevas.removeAttribute('aria-label')
  canevas.setAttribute('tabindex', '-1')
  canevas.setAttribute('aria-hidden', 'true')
}
