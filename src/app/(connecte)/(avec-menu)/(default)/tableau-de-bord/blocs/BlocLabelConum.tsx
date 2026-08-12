import { ReactElement } from 'react'

import BandeauLabelConum from '@/components/TableauDeBord/BandeauLabelConum'
import BandeauLabelConumActif from '@/components/TableauDeBord/BandeauLabelConumActif'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'
import { estLabelConumActif } from '@/use-cases/commands/AttesterLabellisationStructure'

export default async function BlocLabelConum({ structureId }: Props): Promise<null | ReactElement> {
  if (structureId === 0) {
    return null
  }

  const loader = new PrismaEligibiliteLabelConumLoader()

  // Les deux bandeaux sont exclusifs : label actif prioritaire sur l'éligibilité.
  const derniereAttestation = await loader.derniereAttestation(structureId)
  if (estLabelConumActif(derniereAttestation, new Date())) {
    return <BandeauLabelConumActif structureId={structureId} />
  }

  const estEligible = await loader.estEligible(structureId)

  if (!estEligible) {
    return null
  }

  return <BandeauLabelConum />
}

type Props = Readonly<{
  structureId: number
}>
