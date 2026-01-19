import { ReactElement } from 'react'

import StructureInfo, { type StructureInfoData } from '@/components/shared/StructureInfo/StructureInfo'

export default function PosteStructureConventionnee({ structure }: Props): ReactElement {
  return (
    <StructureInfo
      data={structure}
      sectionId="structure-conventionnee"
      showSiretLink
      titre="Structure conventionnée"
    />
  )
}

type Props = Readonly<{
  structure: StructureInfoData
}>
