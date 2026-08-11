import { ReactElement } from 'react'

import BandeauLabelConum from '@/components/TableauDeBord/BandeauLabelConum'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'

export default async function BlocLabelConum({ structureId }: Props): Promise<null | ReactElement> {
  if (structureId === 0) {
    return null
  }

  const estEligible = await new PrismaEligibiliteLabelConumLoader().estEligible(structureId)

  if (!estEligible) {
    return null
  }

  return <BandeauLabelConum />
}

type Props = Readonly<{
  structureId: number
}>
