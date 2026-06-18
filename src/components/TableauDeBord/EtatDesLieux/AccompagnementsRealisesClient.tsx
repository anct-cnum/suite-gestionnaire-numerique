'use client'

import { ReactElement, useEffect, useState } from 'react'

import AccompagnementsRealisesView, { AccompagnementsRealisesEtat } from './AccompagnementsRealisesView'
import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesResult } from '@/use-cases/queries/fetchAccompagnementsRealises'

export default function AccompagnementsRealisesClient(props: Props): ReactElement {
  const [etat, setEtat] = useState<AccompagnementsRealisesEtat>({ statut: 'chargement' })

  const queryParam =
    'structureId' in props
      ? `structureId=${encodeURIComponent(String(props.structureId))}`
      : `territoire=${encodeURIComponent(props.territoire)}`

  useEffect(() => {
    let annule = false
    setEtat({ statut: 'chargement' })

    void fetch(`/api/tableau-de-bord/accompagnements-realises?${queryParam}`)
      .then((reponse) => reponse.json() as Promise<AccompagnementsRealisesResult | ErrorViewModel>)
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

    return () => {
      annule = true
    }
  }, [queryParam])

  return <AccompagnementsRealisesView etat={etat} />
}

type Props = Readonly<{ structureId: number }> | Readonly<{ territoire: string }>
