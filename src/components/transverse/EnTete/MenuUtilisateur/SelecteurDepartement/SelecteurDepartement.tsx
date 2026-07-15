'use client'

import { ReactElement, useContext } from 'react'

import departements from '../../../../../../ressources/departements.json'
import { clientContext } from '@/components/shared/ClientContext'
import Select from '@/components/shared/Select/Select'

export default function SelecteurDepartement({ ariaControlsId }: Props): ReactElement {
  const { changerMonDepartementAction, pathname, router, sessionUtilisateurViewModel } = useContext(clientContext)

  return (
    <Select
      ariaControlsId={ariaControlsId}
      id="departement"
      name="departement"
      onChange={(option) => {
        if (option !== null) {
          void changerDeDepartement(option.value)
        }
      }}
      options={departements.map((departement) => ({
        id: departement.code,
        isSelected: departement.code === sessionUtilisateurViewModel.codeDepartement,
        label: `(${departement.code}) ${departement.nom}`,
        value: departement.code,
      }))}
    >
      Département
    </Select>
  )

  async function changerDeDepartement(nouveauCodeDepartement: string): Promise<void> {
    const result = await changerMonDepartementAction({ nouveauCodeDepartement, path: pathname })
    if (result[0] === 'OK') {
      router.refresh()
    }
  }
}

type Props = Readonly<{
  ariaControlsId: string
}>
