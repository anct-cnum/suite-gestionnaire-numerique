'use client'

import { ReactElement } from 'react'

import AnchorNavigation, { type AnchorSection } from '../../shared/components/AnchorNavigation'
import useStickyPosition from '../../shared/hooks/useStickyPosition'

export type MenuCollantSection = AnchorSection

export default function MenuCollant(props: Props): ReactElement {
  const { sections } = props
  const { topPosition } = useStickyPosition({ enabled: true })

  return (
    <AnchorNavigation
      className="fr-ml-10w"
      sections={sections}
      sticky={true}
      style={{ top: topPosition }}
      title="Sections"
    />
  )
}

type Props = Readonly<{
  sections: ReadonlyArray<MenuCollantSection>
}>
