/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @stylistic/quote-props */
'use client'
import { AddLayerObject, DataDrivenPropertyValueSpecification, LngLatBounds, Map, Popup } from 'maplibre-gl'
import { ReactElement, useEffect, useRef, useState } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

import Legend from './Legend'
import styles from './Map.module.css'
import { FRAGILITE_COLORS } from '@/presenters/tableauDeBord/indiceFragilitePresenter'

const EMPTY_STYLE = {
  glyphs: 'https://openmaptiles.geo.data.gouv.fr/fonts/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      paint: {
        'background-color': '#f5f5fe',
      },
      type: 'background' as const,
    },
  ],
  sources: {},
  version: 8 as const,
}

// Configuration des DOM-TOM avec leurs bounds réels
const DOM_TOM_CONFIG = {
  '971': { 
    bounds: new LngLatBounds([-61.85, 15.85], [-61.0, 16.55]), 
    name: 'Guadeloupe',
  },
  '972': { 
    bounds: new LngLatBounds([-61.25, 14.35], [-60.75, 14.95]), 
    name: 'Martinique',
  },
  '973': { 
    bounds: new LngLatBounds([-54.6, 2.1], [-51.6, 5.8]), 
    name: 'Guyane',
  },
  '974': { 
    bounds: new LngLatBounds([55.2, -21.4], [55.85, -20.85]), 
    name: 'La Réunion',
  },
  '976': { 
    bounds: new LngLatBounds([45.0, -13.05], [45.35, -12.6]), 
    name: 'Mayotte',
  },
}

export default function CarteFranceAvecInsets({ departementsFragilite }: Props): ReactElement {
  const mainMapContainer = useRef<HTMLDivElement>(null)
  const mainMap = useRef<Map | null>(null)
  const domTomMaps = useRef<Record<string, Map>>({})
  const domTomContainers = useRef<Record<string, HTMLDivElement | null>>({})
  const popup = useRef<null | Popup>(null)
  // eslint-disable-next-line react/hook-use-state
  const [, setMapsReady] = useState(0)

  function initializeMainMap(): void {
    if (!mainMap.current) {return}

    const bounds = new LngLatBounds(
      [-5.0, 41.0], // Sud-Ouest France métropolitaine
      [10.0, 51.5]  // Nord-Est France métropolitaine
    )
    
    mainMap.current.fitBounds(bounds, {
      duration: 0,
      maxZoom: 5,
      padding: 50,
    })
  }

  function initializeDomTomMap(code: string, map: Map): void {
    const config = DOM_TOM_CONFIG[code as keyof typeof DOM_TOM_CONFIG]
    
    map.fitBounds(config.bounds, {
      duration: 0,
      padding: 20,
    })
  }

  function addLayersToMap(map: Map, isDomTom = false, domTomCode?: string): void {
    // Ajouter la source si elle n'existe pas déjà
    if (!map.getSource('decoupage')) {
      map.addSource('decoupage', {
        tiles: [
          'https://openmaptiles.geo.data.gouv.fr/data/decoupage-administratif/{z}/{x}/{y}.pbf',
        ],
        type: 'vector',
      })
    }

    // Créer la configuration de base de la couche
    const baseConfig = {
      id: 'departements-layer',
      paint: {
        'fill-color': [
          'match',
          ['get', 'code'],
          ...departementsFragilite.flatMap((dept) => [
            dept.codeDepartement,
            dept.couleur,
          ]),
          '#ffffff',
        ] as unknown as DataDrivenPropertyValueSpecification<string>,
        'fill-opacity': 0.8,
        'fill-outline-color': '#000000',
      },
      source: 'decoupage',
      'source-layer': 'departements',
      type: 'fill' as const,
    }
    
    // Ajouter le filter seulement si c'est un DOM-TOM
    const layerConfig = isDomTom && domTomCode !== undefined && domTomCode 
      ? { ...baseConfig, filter: ['==', 'code', domTomCode] }
      : baseConfig

    // Ajouter la couche
    map.addLayer(layerConfig as unknown as AddLayerObject)

    // Événements de survol
    map.on('mousemove', 'departements-layer', (event) => {
      if (event.features && event.features.length > 0) {
        const canvas = map.getCanvas()
        canvas.style.cursor = 'pointer'

        const feature = event.features[0]
        const coordinates = event.lngLat
        const departement = departementsFragilite.find((dept) => dept.codeDepartement === feature.properties.code)

        if (popup.current) {
          const domTomConfig = DOM_TOM_CONFIG[feature.properties.code as keyof typeof DOM_TOM_CONFIG]
          const isCurrentDomTom = isDomTom || domTomConfig
           
          //  @typescript-eslint/strict-boolean-expressions 
          //  @typescript-eslint/no-unnecessary-condition
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          const nomDepartement = domTomConfig && domTomConfig.name || (feature.properties.nom as string)
          
          // Popup simplifié pour les DOM-TOM
          if (isCurrentDomTom === true && departement) {
            popup.current
              .setLngLat(coordinates)
              .setHTML(`
                <div style="font-size: 14px;">
                  <strong>${departement.score}/10</strong>
                </div>
              `)
              .addTo(map)
          } else {
            // Popup complet pour la métropole
            popup.current
              .setLngLat(coordinates)
              .setHTML(`
                <div style="font-size: 14px;">
                  <div class="fr-text--bold fr-mb-1w">${nomDepartement}</div>
                  ${departement ? `<div style="font-size: 14px;">${departement.score}/10</div>` : ''}
                </div>
              `)
              .addTo(map)
          }
        }
      }
    })

    map.on('mouseleave', 'departements-layer', () => {
      const canvas = map.getCanvas()
      canvas.style.cursor = ''
      if (popup.current) {
        popup.current.remove()
      }
    })
  }

  useEffect(() => {
    if (!mainMapContainer.current) {return undefined}

    // Vérifier le support WebGL
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')
    
    if (!gl) {
      mainMapContainer.current.innerHTML = '<div class="fr-alert fr-alert--error fr-m-2w"><p>Votre navigateur ne supporte pas WebGL, nécessaire pour afficher la carte.</p></div>'
      return undefined
    }

    // Créer le popup partagé
    popup.current = new Popup({
      closeButton: false,
      closeOnClick: false,
    })

    // Initialiser la carte principale
    mainMap.current = new Map({
      boxZoom: false,
      container: mainMapContainer.current,
      doubleClickZoom: false,
      dragPan: false,
      dragRotate: false,
      keyboard: false,
      maxZoom: 7,
      minZoom: 4,
      scrollZoom: false,
      style: EMPTY_STYLE,
      touchZoomRotate: false,
    })

    mainMap.current.on('load', () => {
      if (!mainMap.current) {return}
      addLayersToMap(mainMap.current)
      initializeMainMap()
      setMapsReady(prev => prev + 1)
    })

    // Initialiser les cartes DOM-TOM
    Object.entries(DOM_TOM_CONFIG).forEach(([code]) => {
      const container = domTomContainers.current[code]
      if (!container) {return}

      const domTomMap = new Map({
        attributionControl: false,
        boxZoom: false,
        container,
        doubleClickZoom: false,
        dragPan: false,
        dragRotate: false,
        interactive: true, // Garder pour les survols/popups
        keyboard: false,
        maxZoom: 10,
        minZoom: 3,
        scrollZoom: false,
        style: EMPTY_STYLE,
        touchZoomRotate: false,
      })

      domTomMap.on('load', () => {
        addLayersToMap(domTomMap, true, code)
        initializeDomTomMap(code, domTomMap)
        setMapsReady(prev => prev + 1)
      })

      domTomMaps.current[code] = domTomMap
    })

    return (): void => {
      mainMap.current?.remove()
      Object.values(domTomMaps.current).forEach(map => { map.remove() })
    }
  }, [departementsFragilite])

  return (
    <div style={{ height: '100%', position: 'relative', width: '100%' }}>
      {/* Carte principale */}
      <div
        className={styles.mapWrapper}
        data-testid="carte-france-wrapper"
        style={{
          marginLeft: '12%', // Décaler la carte vers la droite pour compenser les insets DOM/TOM
          width: '88%', // Réduire la largeur pour maintenir la carte dans les limites
        }}
      >
        <div
          className={styles.mapContainer}
          data-testid="carte-france-container"
          ref={mainMapContainer}
        />
        <div
          className={styles.legendWrapper}
          data-testid="legend-wrapper"
          style={{ width: '90%' }}
        >
          <Legend />
        </div>
      </div>

      {/* Conteneur des insets DOM-TOM */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '460px',
          justifyContent: 'space-between',
          left: '2%',
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '15%',
        }}
      >
        {(Object.keys(DOM_TOM_CONFIG) as Array<keyof typeof DOM_TOM_CONFIG>).map((code) => {
          const config = DOM_TOM_CONFIG[code]
          return (
            <div
              key={code}
              style={{
                backgroundColor: '#f5f5fe',
                height: '85px', // Augmenté pour réduire l'espace
                overflow: 'visible',
                position: 'relative',
              }}
            >
              {/* Label du DOM-TOM au-dessus de l'inset */}
              <div
                style={{
                  color: '#000',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  left: 0,
                  position: 'absolute',
                  right: 0,
                  textAlign: 'center',
                  top: '-16px',
                  zIndex: 10,
                }}
              >
                {config.name}
              </div>
              {/* Conteneur de la carte */}
              <div
                ref={(el) => { domTomContainers.current[code] = el }}
                style={{ 
                  height: '100%', 
                  width: '100%',
                }}
              />
            </div>
          )})}
      </div>
    </div>
  )
}

export function getDepartementFragiliteColor(score: number): string {
  const nombreDeCouleurs = Object.keys(FRAGILITE_COLORS).length
  const nombreDIndice = 10

  const indiceDeCouleur = Math.max(1, Math.ceil(score * nombreDeCouleurs / nombreDIndice))

  return FRAGILITE_COLORS[indiceDeCouleur as keyof typeof FRAGILITE_COLORS] || '#ffffff'
}

export type DepartementFragilite = Readonly<{
  codeDepartement: string
  couleur: string
  score: number
}>

type Props = Readonly<{
  departementsFragilite: Array<DepartementFragilite>
}>