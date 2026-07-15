// Stryker disable all
import { ReactElement } from 'react'

import Select from '@/components/shared/Select/Select'
import SelectAsync from '@/components/shared/Select/SelectAsync'
import { makeSearchParams, toStructureSearchViewModels } from '@/presenters/rechercheStructuresPresenter'

export default function OrganisationInput({
  extraSearchParams,
  label,
  options,
  organisation,
  placeholder,
  required,
  setOrganisation,
}: Props): ReactElement {
  const labelContent = (
    <>
      {label}
      {required ? (
        <>
          {' '}
          <span className="color-red">*</span>
        </>
      ) : null}
    </>
  )

  return options.length ? (
    <Select<OrganisationOption>
      formatOptionLabel={formatOptionLabel}
      id="organisation"
      isClearable={true}
      menuPlacement="top"
      name="organisation"
      onChange={setOrganisation}
      options={options}
      placeholder={placeholder}
      required={required}
      value={organisation?.value ?? null}
    >
      {labelContent}
    </Select>
  ) : (
    <SelectAsync<OrganisationOption>
      formatOptionLabel={formatOptionLabel}
      id="organisation"
      isClearable={true}
      loadingMessage="Chargement des structures..."
      loadOptions={onSearch}
      menuPlacement="top"
      name="organisation"
      noOptionsMessage={() => 'Rechercher une structure'}
      onChange={setOrganisation}
      placeholder={placeholder}
      required={required}
      value={organisation}
    >
      {labelContent}
    </SelectAsync>
  )

  async function onSearch(search: string): Promise<Array<OrganisationOption>> {
    if (search.length < 3) {
      return []
    }
    return fetch(`/api/structures?${makeSearchParams(search, extraSearchParams).toString()}`)
      .then(async (result) => result.json() as Promise<Parameters<typeof toStructureSearchViewModels>[0]>)
      .then((structures) => [...toStructureSearchViewModels(structures)])
  }
}

export type OrganisationOption = Readonly<{
  isMembre?: boolean
  label: string
  value: string
}>

type Props = Readonly<{
  extraSearchParams?: URLSearchParams
  label: string
  options: ReadonlyArray<OrganisationOption>
  organisation: null | OrganisationOption
  placeholder: string
  required: boolean
  setOrganisation(organisation: null | OrganisationOption): void
}>

function formatOptionLabel(option: OrganisationOption): ReactElement {
  return (
    <span style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
      {option.isMembre === true ? (
        <span
          aria-label="Membre de la gouvernance"
          className="fr-icon-team-line"
          role="img"
          style={{ color: 'var(--text-default-info)' }}
          title="Membre de la gouvernance"
        />
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
