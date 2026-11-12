import { useEffect, useState } from 'react'

import { AccompagnementsRealisesEtat } from './AccompagnementsRealisesView'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

// Un seul chargement des accompagnements pour l'histogramme et pour son tableau (chiffres clés) :
// soit la promesse résolue côté serveur, soit l'appel à la route du tableau de bord.
export default function useAccompagnementsRealises(source: SourceAccompagnements): AccompagnementsRealisesEtat {
  const [etat, setEtat] = useState<AccompagnementsRealisesEtat>({ statut: 'chargement' })
  const cle = 'promesse' in source ? source.promesse : urlDeLaSource(source)

  useEffect(() => {
    let annule = false
    setEtat({ statut: 'chargement' })

    const promesse =
      typeof cle === 'string'
        ? fetch(cle).then(async (reponse) => reponse.json() as Promise<AccompagnementsRealisesResult | ErrorViewModel>)
        : cle

    void promesse
      .then((donnees) => {
        if (annule) {
          return
        }
        if (isErrorViewModel(donnees)) {
          setEtat({ message: donnees.message, statut: 'erreur' })
        } else {
          setEtat({ resultat: donnees, statut: 'charge' })
        }
      })
      .catch(() => {
        if (annule) {
          return
        }
        setEtat({ message: 'Erreur de récupération des données', statut: 'erreur' })
      })

    return (): void => {
      annule = true
    }
  }, [cle])

  return etat
}

export type SourceAccompagnements =
  | Readonly<{ promesse: Promise<AccompagnementsRealisesResult | ErrorViewModel> }>
  | Readonly<{ structureId: number }>
  | Readonly<{ territoire: string }>

function urlDeLaSource(source: Readonly<{ structureId: number }> | Readonly<{ territoire: string }>): string {
  const parametre =
    'structureId' in source
      ? `structureId=${encodeURIComponent(String(source.structureId))}`
      : `territoire=${encodeURIComponent(source.territoire)}`
  return `/api/tableau-de-bord/accompagnements-realises?${parametre}`
}
