'use client'

import maplibregl from 'maplibre-gl'
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

export default function Map({ communesFragilite, departement }: Props): ReactElement {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const popup = useRef<maplibregl.Popup | null>(null)

  useEffect(() => {
    if (!mapContainer.current) {return}

    // Initialiser la carte
    map.current = new maplibregl.Map({
      center: [2.3522, 48.8566], // Position par défaut (Paris)
      container: mapContainer.current,
      maxZoom: 12, 
      minZoom: 6,
      style: EMPTY_STYLE,
      zoom: 6,
    })

    // Créer le popup
    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    })

    // Ajouter la source pour le découpage administratif
    map.current.on('load', () => {
      console.log('...on load')
      if (!mapContainer.current || !map.current) {return}

      console.log('Carte chargée, ajout de la source...')
      
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
        paint: {
          'fill-color': '#f0f0f0',
          'fill-opacity': 1,
          'fill-outline-color': '#000000',
        },
        source: 'decoupage',
        'source-layer': 'departements',
        type: 'fill',
      })

      // Ajouter les contrôles de navigation
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

      // Fonction pour chercher les features
      const searchFeatures = () => {
        if (!map.current) {return}
        
        console.log('Recherche des features...')
        console.log('Niveau de zoom actuel:', map.current.getZoom())
        
        const allSourceFeatures = map.current.querySourceFeatures('decoupage', {
          sourceLayer: 'departements',
        })
        
        const allFeatures = map.current.querySourceFeatures('decoupage', {
          filter: ['==', 'code', departement],
          sourceLayer: 'departements',
        })
        
        if (allFeatures.length > 0) {
          const bounds = new maplibregl.LngLatBounds()
          const geometry = allFeatures[0].geometry as GeoJSON.Polygon
          geometry.coordinates[0].forEach((coord) => {
            bounds.extend(coord as [number, number])
          })
          map.current.fitBounds(bounds, { 
            duration: 1000, // Animation de 1 seconde
            maxZoom: 10, // Limite le zoom maximum pour garder une vue d'ensemble
            padding: 50,
          })
        } else {
          console.log('Aucune feature trouvée pour le département:', departement)
          // Si aucune feature n'est trouvée, on reste sur la position par défaut
          console.log('Utilisation de la position par défaut')
        }
      }

      // Fonction pour initialiser les couches
      const initializeLayers = () => {
        if (!map.current) {return}
        console.log('Initialisation des couches...')

        // Ajouter une couche pour les communes avec l'indice de fragilité
        map.current.addLayer({
          filter: ['==', 'departement', departement],
          id: 'communes-layer',
          paint: {
            'fill-color': [
              'match',
              ['get', 'code'],
              ...communesFragilite.flatMap((commune) => [
                commune.codeInsee,
                commune.couleur,
              ]),
              '#ffffff', // Couleur par défaut
            ] as any,
            'fill-opacity': 1,
            'fill-outline-color': '#000000',
          },
          source: 'decoupage',
          'source-layer': 'communes',
          type: 'fill',
        })

        // Chercher les features
        searchFeatures()
      }

      // Vérifier périodiquement si la source est chargée
      const checkSourceLoaded = () => {
        if (!map.current) {return}
        
        if (map.current.isSourceLoaded('decoupage')) {
          initializeLayers()
        } else {
          setTimeout(checkSourceLoaded, 100)
        }
      }

      // Démarrer la vérification
      checkSourceLoaded()
    })

    // Gérer le mouseover sur les communes
    map.current.on('mousemove', 'communes-layer', (e) => {
      if (e.features && e.features.length > 0 && map.current) {
        const canvas = map.current.getCanvas()
        canvas.style.cursor = 'pointer'

        const feature = e.features[0]
        const coordinates = e.lngLat
        const commune = communesFragilite.find((c) => c.codeInsee === feature.properties.code)

        // Mettre à jour le popup
        if (popup.current && map.current) {
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

    // Gérer le mouseout
    map.current.on('mouseleave', 'communes-layer', () => {
      if (map.current) {
        const canvas = map.current.getCanvas()
        canvas.style.cursor = ''
      }
      if (popup.current) {
        popup.current.remove()
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [departement, communesFragilite])

  return (
    <div
      className={styles.mapWrapper}
      id="bli"
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