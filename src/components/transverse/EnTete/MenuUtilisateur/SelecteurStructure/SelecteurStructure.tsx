'use client'

import { ReactElement, useContext, useState } from 'react'
import AsyncSelect from 'react-select/async'

import { clientContext } from '@/components/shared/ClientContext'
import { UneStructureReadModel } from '@/use-cases/queries/RechercherLesStructures'

export default function SelecteurStructure({ ariaControlsId }: Props): ReactElement {
  const { changerMaStructureAction, pathname, router } = useContext(clientContext)
  const [structure, setStructure] = useState<null | StructureOption>(null)

  return (
    <div className="fr-select-group">
      <label className="fr-label" htmlFor="structure">
        Structure
      </label>
      <AsyncSelect<StructureOption>
        aria-controls={ariaControlsId}
        formatOptionLabel={formatOptionLabel}
        inputId="structure"
        instanceId="structure"
        isClearable={true}
        loadOptions={chargerLesStructures}
        loadingMessage={() => 'Chargement des structures...'}
        noOptionsMessage={() => 'Rechercher une structure'}
        onChange={(option) => {
          setStructure(option)
          void changerMaStructureAction({ idStructure: option?.value ?? null, path: pathname }).then((result) => {
            if (result[0] === 'OK') {
              router.refresh()
            }
          })
        }}
        placeholder="Choisir une structure"
        value={structure}
      />
    </div>
  )
}

async function chargerLesStructures(search: string): Promise<ReadonlyArray<StructureOption>> {
  if (search.length < 3) {
    return []
  }
  const response = await fetch(`/api/structures?search=${encodeURIComponent(search)}`)
  if (!response.ok) {
    return []
  }
  const structures = (await response.json()) as ReadonlyArray<UneStructureReadModel>
  return structures.map((uneStructure) => ({
    isFne: uneStructure.isFne,
    label: uneStructure.nom + (uneStructure.commune ? ` — ${uneStructure.commune}` : ''),
    value: Number(uneStructure.uid),
  }))
}

function formatOptionLabel(option: StructureOption): ReactElement {
  return (
    <span style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
      {option.isFne ? (
        <span className="fr-badge fr-badge--blue-cumulus fr-badge--no-icon fr-badge--sm fr-mb-0">FNE</span>
      ) : (
        <span
          aria-label="Structure"
          className="fr-icon-building-line"
          role="img"
          style={{ color: 'var(--text-mention-grey)' }}
          title="Structure"
        />
      )}
      <span>{option.label}</span>
    </span>
  )
}

type Props = Readonly<{
  ariaControlsId: string
}>

type StructureOption = Readonly<{
  isFne: boolean
  label: string
  value: number
}>
