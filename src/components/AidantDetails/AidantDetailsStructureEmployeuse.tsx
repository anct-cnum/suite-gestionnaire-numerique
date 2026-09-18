import { ReactElement } from 'react'

import { StructureEmployeuseData } from './AidantDetails'
import StructureInfo, { type StructureInfoData } from '@/components/shared/StructureInfo/StructureInfo'

export default function AidantDetailsStructureEmployeuse({ data }: Props): ReactElement {
  const structureData: StructureInfoData = {
    adresse: data.adresse,
    contacts: data.contacts,
    departement: data.departement ?? '',
    nom: data.nom,
    region: data.region ?? '',
    siret: data.siret ?? '',
    typologie: data.type,
  }

  return <StructureInfo data={structureData} sectionId="structure-employeuse" titre="Structure employeuse" />
}

type Props = Readonly<{
  data: StructureEmployeuseData
}>
