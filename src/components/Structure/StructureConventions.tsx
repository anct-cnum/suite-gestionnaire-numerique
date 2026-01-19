'use client'

import { ReactElement } from 'react'

import ConventionsEtFinancements, {
  type ConventionsEtFinancementsViewModel,
} from '@/components/shared/ConventionsEtFinancements/ConventionsEtFinancements'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureConventions({ conventionsEtFinancements }: Props): ReactElement {
  // Convertir les données de la structure vers le format du composant shared
  const data: ConventionsEtFinancementsViewModel = {
    conventions: conventionsEtFinancements.conventions.map((convention) => ({
      dateDebut: convention.dateDebut,
      dateFin: convention.dateFin,
      id: convention.id,
      libelle: convertirLibelleConvention(convention.libelle),
      montantBonification: convention.montantBonification,
      montantTotal: convention.montantTotal,
      montantVerse: convention.montantSubvention,
      statut: convention.statut,
    })),
    creditsEngagesParLEtat: conventionsEtFinancements.creditsEngagesParLEtat,
    enveloppes: conventionsEtFinancements.enveloppes,
  }

  return (
    <ConventionsEtFinancements data={data} />
  )
}

function convertirLibelleConvention(libelle: string): string {
  if (libelle === 'DGCL') {
    return 'Initiale (V1)'
  }
  if (libelle === 'DITP' || libelle === 'DGE') {
    return 'Renouvellement (V2)'
  }
  return libelle
}

type Props = Readonly<{
  conventionsEtFinancements: StructureViewModel['conventionsEtFinancements']
}>
