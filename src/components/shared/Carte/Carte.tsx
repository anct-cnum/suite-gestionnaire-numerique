'use client'
import { DataDrivenPropertyValueSpecification, LngLatBounds, Map, NavigationControl, Popup } from 'maplibre-gl'
import { ReactElement, useEffect, useRef } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

import Legend from './Legend'
import styles from './Map.module.css'
import { CommuneFragilite } from '@/presenters/indiceFragilitePresenter'

const EMPTY_STYLE = {
  glyphs: 'https://openmaptiles.geo.data.gouv.fr/fonts/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      paint: {
        'background-color': '#e8edff',
      },
      type: 'background' as const,
    },
  ],
  sources: {},
  version: 8 as const,
}

export default function Carte({ communesFragilite, departement }: Props): ReactElement {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<Map | null>(null)
  const popup = useRef<null | Popup>(null)

  function searchFeatures(): void {
    if (!map.current) {return}
    
    console.log('🔍 Calcul des bounds approximatifs pour le département:', departement)
    
    // Coordonnées approximatives du centre de chaque département
    const departementCenters: Record<string, [number, number]> = {
      '01': [5.2, 46.2], // Ain
      '02': [3.6, 49.6], // Aisne
      '03': [3.2, 46.3], // Allier
      '04': [6.1, 44.1], // Alpes-de-Haute-Provence
      '05': [6.1, 44.7], // Hautes-Alpes
      '06': [7.2, 43.7], // Alpes-Maritimes
      '07': [4.6, 44.7], // Ardèche
      '08': [4.8, 49.6], // Ardennes
      '09': [1.6, 42.9], // Ariège
      10: [4.1, 48.3], // Aube
      11: [2.4, 43.2], // Aude
      12: [2.6, 44.3], // Aveyron
      13: [5.4, 43.3], // Bouches-du-Rhône
      14: [-0.4, 49.2], // Calvados
      15: [2.6, 45.0], // Cantal
      16: [0.2, 45.7], // Charente
      17: [-1.1, 45.7], // Charente-Maritime
      18: [2.4, 47.1], // Cher
      19: [1.6, 45.3], // Corrèze
      21: [4.9, 47.3], // Côte-d'Or
      22: [-2.8, 48.5], // Côtes-d'Armor
      23: [2.0, 46.0], // Creuse
      24: [0.7, 45.2], // Dordogne
      25: [6.4, 47.1], // Doubs
      26: [5.0, 44.8], // Drôme
      27: [1.1, 49.0], // Eure
      28: [1.4, 48.4], // Eure-et-Loir
      29: [-4.1, 48.2], // Finistère
      '2A': [9.0, 41.9], // Corse-du-Sud
      '2B': [9.2, 42.3], // Haute-Corse
      30: [4.4, 43.8], // Gard
      31: [1.4, 43.6], // Haute-Garonne
      32: [0.6, 43.6], // Gers
      33: [-0.6, 44.8], // Gironde
      34: [3.9, 43.6], // Hérault
      35: [-1.7, 48.1], // Ille-et-Vilaine
      36: [1.7, 46.8], // Indre
      37: [0.7, 47.2], // Indre-et-Loire
      38: [5.7, 45.2], // Isère
      39: [5.6, 46.7], // Jura
      40: [-0.9, 44.0], // Landes
      41: [1.6, 47.6], // Loir-et-Cher
      42: [4.1, 45.7], // Loire
      43: [3.9, 45.0], // Haute-Loire
      44: [-1.6, 47.2], // Loire-Atlantique
      45: [2.4, 47.9], // Loiret
      46: [1.6, 44.6], // Lot
      47: [0.6, 44.3], // Lot-et-Garonne
      48: [3.4, 44.5], // Lozère
      49: [-0.6, 47.5], // Maine-et-Loire
      50: [-1.4, 49.1], // Manche
      51: [4.0, 49.0], // Marne
      52: [5.4, 48.1], // Haute-Marne
      53: [-0.6, 48.1], // Mayenne
      54: [6.2, 48.7], // Meurthe-et-Moselle
      55: [5.4, 49.1], // Meuse
      56: [-3.0, 47.7], // Morbihan
      57: [6.7, 49.1], // Moselle
      58: [3.6, 47.0], // Nièvre
      59: [3.0, 50.6], // Nord
      60: [2.4, 49.4], // Oise
      61: [0.4, 48.6], // Orne
      62: [2.3, 50.5], // Pas-de-Calais
      63: [3.1, 45.7], // Puy-de-Dôme
      64: [-0.6, 43.3], // Pyrénées-Atlantiques
      65: [0.2, 43.0], // Hautes-Pyrénées
      66: [2.9, 42.5], // Pyrénées-Orientales
      67: [7.8, 48.6], // Bas-Rhin
      68: [7.3, 47.9], // Haut-Rhin
      69: [4.8, 45.8], // Rhône
      70: [6.0, 47.6], // Haute-Saône
      71: [4.8, 46.8], // Saône-et-Loire
      72: [0.2, 47.9], // Sarthe
      73: [6.4, 45.6], // Savoie
      74: [6.5, 46.0], // Haute-Savoie
      75: [2.4, 48.9], // Paris
      76: [1.1, 49.5], // Seine-Maritime
      77: [2.9, 48.6], // Seine-et-Marne
      78: [2.0, 48.8], // Yvelines
      79: [-0.3, 46.5], // Deux-Sèvres
      80: [2.3, 49.9], // Somme
      81: [2.2, 43.7], // Tarn
      82: [1.4, 44.0], // Tarn-et-Garonne
      83: [6.1, 43.4], // Var
      84: [5.2, 44.0], // Vaucluse
      85: [-1.5, 46.7], // Vendée
      86: [0.4, 46.6], // Vienne
      87: [1.3, 45.8], // Haute-Vienne
      88: [6.6, 48.2], // Vosges
      89: [3.6, 47.8], // Yonne
      90: [6.9, 47.6], // Territoire de Belfort
      91: [2.2, 48.6], // Essonne
      92: [2.2, 48.9], // Hauts-de-Seine
      93: [2.5, 48.9], // Seine-Saint-Denis
      94: [2.5, 48.8], // Val-de-Marne
      95: [2.3, 49.0], // Val-d'Oise
      971: [-61.6, 16.3], // Guadeloupe
      972: [-61.0, 14.6], // Martinique
      973: [-53.2, 3.9], // Guyane
      974: [55.5, -21.1], // La Réunion
      975: [-56.3, 46.8], // Saint-Pierre-et-Miquelon
      976: [45.2, -12.8], // Mayotte
      977: [-62.8, 17.9], // Saint-Barthélemy
      978: [-63.1, 18.1], // Saint-Martin
      988: [165.5, -20.9], // Nouvelle-Calédonie
    }
    
    const center = departementCenters[departement]
    if (!center) {
      console.log('❌ Département non trouvé:', departement)
      return
    }
    
    console.log('🎯 Centre du département:', center)
    
    // Calculer les bounds approximatifs (15000 km² ≈ 123 km x 123 km)
    // 1 degré de latitude ≈ 111 km, 1 degré de longitude ≈ 111 km * cos(latitude)
    const latDelta = 0.55 // ~61 km au nord et au sud
    const lngDelta = 0.55 / Math.cos(center[1] * Math.PI / 180) // Ajuster pour la longitude
    
    const bounds = new LngLatBounds(
      [center[0] - lngDelta, center[1] - latDelta],
      [center[0] + lngDelta, center[1] + latDelta]
    )
    
    // Ajouter un padding de 120% aux bounds pour plus d'espace de navigation
    const padding = 1.2
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const latPadding = (ne.lat - sw.lat) * padding
    const lngPadding = (ne.lng - sw.lng) * padding
    
    const paddedBounds = new LngLatBounds(
      [sw.lng - lngPadding, sw.lat - latPadding],
      [ne.lng + lngPadding, ne.lat + latPadding]
    )
    
    // Centrer la carte sur les bounds avec animation
    map.current.fitBounds(bounds, {
      maxZoom: 10,
      padding: 50,
      zoom: 7,
    })
    map.current.setMaxBounds(paddedBounds)
  }

  function initializeLayers(): void {
    if (!map.current) {return}

    console.log('🏗️ Ajout de la couche des communes...')

    // Ajouter une couche pour les communes avec l'indice de fragilité
    map.current.addLayer({
      filter: ['==', 'departement', departement],
      id: 'communes-layer',
      maxzoom: 14, // Limiter le zoom maximum
      minzoom: 0, // S'assurer que les communes sont visibles dès le niveau 0
      paint: {
        'fill-color': [
          'match',
          ['get', 'code'],
          ...communesFragilite.flatMap((commune) => [
            commune.codeInsee,
            commune.couleur,
          ]),
          '#ffffff', 
        ] as unknown as DataDrivenPropertyValueSpecification<string>,
        'fill-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0,
          0.7, // Plus transparent au zoom bas
          8,
          1,   // Complètement opaque au zoom élevé
        ],
        'fill-outline-color': '#000000',
      },
      source: 'decoupage',
      'source-layer': 'communes',
      type: 'fill',
    })

    console.log('✅ Couche des communes ajoutée')

    searchFeatures()
  }

  function checkSourceLoaded(): void {
    if (!map.current) {return}
    
    if (map.current.isSourceLoaded('decoupage')) {
      initializeLayers()
    } else {
      setTimeout(checkSourceLoaded, 100)
    }
  }

  useEffect(() => {
    if (!mapContainer.current) {return undefined}

    map.current = new Map({
      center: [2.3522, 48.8566], // Position par défaut (Paris)
      container: mapContainer.current,
      maxZoom: 11, 
      minZoom: 6,
      style: EMPTY_STYLE,
      zoom: 6,
    })

    popup.current = new Popup({
      closeButton: false,
      closeOnClick: false,
    })

    map.current.on('load', () => {
      if (!mapContainer.current || !map.current) {return}
      
      map.current.addSource('decoupage', {
        maxzoom: 14,
        minzoom: 0,
        tiles: [
          'https://openmaptiles.geo.data.gouv.fr/data/decoupage-administratif/{z}/{x}/{y}.pbf',
        ],
        type: 'vector',
      })

      // Ajouter une couche pour le département
      map.current.addLayer({
        filter: ['==', 'code', departement],
        id: 'departement-layer',
        minzoom: 0, // S'assurer que le département est visible dès le niveau 0
        paint: {
          'fill-color': '#f0f0f0',
          'fill-opacity': 1,
          'fill-outline-color': '#000000',
        },
        source: 'decoupage',
        'source-layer': 'departements',
        type: 'fill',
      })

      map.current.addControl(new NavigationControl(), 'top-right')

      // Événements pour détecter l'affichage/masquage des couches
      map.current.on('sourcedata', (e) => {
        if (e.sourceId === 'decoupage' && e.isSourceLoaded) {
          console.log('🔄 Source decoupage chargée, données disponibles')
        }
      })

      map.current.on('idle', () => {
        if (map.current) {
          const communesLayer = map.current.getLayer('communes-layer')
          if (communesLayer) {
            const isVisible = map.current.isStyleLoaded() && 
                             map.current.getZoom() >= (communesLayer.minzoom || 0) &&
                             map.current.getZoom() <= (communesLayer.maxzoom || 24)
            
            console.log('👁️ Couche communes:', isVisible ? 'VISIBLE' : 'MASQUÉE', 'Zoom:', map.current.getZoom())
          }else{
            console.log('❌ Couche communes non trouvée Zoom:', map.current.getZoom())
          }
        }
      })

      checkSourceLoaded()
    })

    map.current.on('mousemove', 'communes-layer', (event) => {
      if (event.features && event.features.length > 0 && map.current) {
        const canvas = map.current.getCanvas()
        canvas.style.cursor = 'pointer'

        const feature = event.features[0]
        const coordinates = event.lngLat
        const commune = communesFragilite.find((commune) => commune.codeInsee === feature.properties.code)

        if (popup.current) {
          popup.current
            .setLngLat(coordinates)
            .setHTML(`
              <strong>${feature.properties.nom}</strong>
              ${commune ? `<br/>Indice de fragilité : ${commune.indice}/10` : ''}
            `)
            .addTo(map.current)
        }
      }
    })

    map.current.on('mouseleave', 'communes-layer', () => {
      if (map.current) {
        const canvas = map.current.getCanvas()
        canvas.style.cursor = ''
      }
      if (popup.current) {
        popup.current.remove()
      }
    })

    return (): void => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [departement, communesFragilite])

  return (
    <div
      className={styles.mapWrapper}
    >
      <div 
        className={styles.mapContainer} 
        ref={mapContainer}
      />
      <div className={styles.legendWrapper}>
        <Legend />
      </div>
    </div>
  )
}

type Props = Readonly<{
  communesFragilite: Array<CommuneFragilite>
  departement: string
}> 