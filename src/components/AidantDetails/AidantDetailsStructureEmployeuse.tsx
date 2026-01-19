import { ReactElement } from 'react'

import { StructureEmployeuseData } from './AidantDetails'
import StructureInfo, { type StructureInfoData } from '@/components/shared/StructureInfo/StructureInfo'

export default function AidantDetailsStructureEmployeuse({ data }: Props): ReactElement {
  const structureData: StructureInfoData = {
    adresse: data.adresse,
    departement: data.departement ?? '',
    nom: data.nom,
    referent: data.referent === undefined ? undefined : {
      email: data.referent.email,
      fonction: data.referent.post,
      nom: `${data.referent.prenom} ${data.referent.nom}`.trim(),
      telephone: data.referent.telephone,
    },
    region: data.region ?? '',
    siret: data.siret ?? '',
    typologie: data.type,
  }

  return (
    <StructureInfo
      data={structureData}
      sectionId="structure-employeuse"
      titre="Structure employeuse"
    />
  )
}

type Props = Readonly<{
  data: StructureEmployeuseData
}>
