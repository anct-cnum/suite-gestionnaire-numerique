'use client'

import maplibregl from 'maplibre-gl'
import { ReactElement, useEffect, useRef } from 'react'
import 'maplibre-gl/dist/maplibre-gl.css'

import styles from './Map.module.css'

const DEPARTEMENTS_CENTERS: Record<string, [number, number]> = {
  11: [2.4012, 43.1832], // Aude
  69: [4.8357, 45.7578], // Lyon
  75: [2.3522, 48.8566], // Paris
}

const EMPTY_STYLE = {
  layers: [
    {
      id: 'background',
      paint: {
        'background-color': '#ffffff',
      },
      type: 'background',
    },
  ],
  sources: {},
  version: 8,
}

export default function Map({ departement }: Props): ReactElement {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const popup = useRef<maplibregl.Popup | null>(null)

  useEffect(() => {
    if (!mapContainer.current) {return}

    // Initialiser la carte
    map.current = new maplibregl.Map({
      center: DEPARTEMENTS_CENTERS[departement] || [2.3522, 48.8566],
      container: mapContainer.current,
      style: EMPTY_STYLE,
      zoom: 9,
    })

    // Créer le popup
    popup.current = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    })

    // Ajouter la source pour le découpage administratif
    map.current.on('load', () => {
      if (!map.current) {return}

      map.current.addSource('decoupage', {
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

      // Ajouter une couche pour les communes
      map.current.addLayer({
        filter: ['==', 'departement', departement],
        id: 'communes-layer',
        paint: {
          'fill-color': '#ffffff',
          'fill-opacity': 1,
          'fill-outline-color': '#000000',
        },
        source: 'decoupage',
        'source-layer': 'communes',
        type: 'fill',
      })

      // Ajouter les noms des communes
      map.current.addLayer({
        filter: ['==', 'departement', departement],
        id: 'communes-labels',
        layout: {
          'text-allow-overlap': false,
          'text-field': ['get', 'nom'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#000000',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
        source: 'decoupage',
        'source-layer': 'communes',
        type: 'symbol',
      })

      // Gérer le mouseover sur les communes
      map.current.on('mousemove', 'communes-layer', (e) => {
        if (e.features && e.features.length > 0 && map.current) {
          const canvas = map.current.getCanvas()
          if (canvas) {
            canvas.style.cursor = 'pointer'
          }

          const feature = e.features[0]
          const coordinates = e.lngLat

          // Mettre à jour le popup
          if (popup.current && map.current) {
            popup.current
              .setLngLat(coordinates)
              .setHTML(`<strong>${feature.properties.nom}</strong>`)
              .addTo(map.current)
          }
        }
      })

      // Gérer le mouseout
      map.current.on('mouseleave', 'communes-layer', () => {
        if (map.current) {
          const canvas = map.current.getCanvas()
          if (canvas) {
            canvas.style.cursor = ''
          }
        }
        if (popup.current) {
          popup.current.remove()
        }
      })

      // Ajouter les contrôles de navigation
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [departement])

  return (
    <div 
      className={styles.mapContainer} 
      ref={mapContainer}
    />
  )
}

type Props = Readonly<{
  departement: string
}> 