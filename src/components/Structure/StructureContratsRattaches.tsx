import { ReactElement } from 'react'

import ContratsRattaches from '@/components/shared/ContratsRattaches/ContratsRattaches'
import { StructureViewModel } from '@/presenters/structurePresenter'

export default function StructureContratsRattaches({ contratsRattaches }: Props): ReactElement {
  return (
    <ContratsRattaches contrats={contratsRattaches} />
  )
}

type Props = Readonly<{
  contratsRattaches: StructureViewModel['contratsRattaches']
}>
