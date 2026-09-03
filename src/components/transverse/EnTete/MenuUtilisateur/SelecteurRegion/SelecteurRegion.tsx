'use client'

import { ReactElement, useContext } from 'react'

import regions from '../../../../../../ressources/regions.json'
import { clientContext } from '@/components/shared/ClientContext'
import Select from '@/components/shared/Select/Select'

export default function SelecteurRegion({ ariaControlsId }: Props): ReactElement {
  const { changerMaRegionAction, pathname, router, sessionUtilisateurViewModel } = useContext(clientContext)

  return (
    <Select
      ariaControlsId={ariaControlsId}
      id="region"
      name="region"
      onChange={(option) => {
        if (option !== null) {
          void changerDeRegion(option.value)
        }
      }}
      options={regions
        .filter((region) => region.code !== '00')
        .map((region) => ({
          id: region.code,
          isSelected: region.code === sessionUtilisateurViewModel.codeRegion,
          label: `(${region.code}) ${region.nom}`,
          value: region.code,
        }))}
    >
      Région
    </Select>
  )

  async function changerDeRegion(nouveauCodeRegion: string): Promise<void> {
    const result = await changerMaRegionAction({ nouveauCodeRegion, path: pathname })
    if (result[0] === 'OK') {
      router.refresh()
    }
  }
}

type Props = Readonly<{
  ariaControlsId: string
}>
