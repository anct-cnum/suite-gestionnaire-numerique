'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'

import type { FiltreOption } from './FiltreRecherche'

export default function FilterTags({
  communesSelectionnees,
  departementsOptions,
  lieuxSelectionnes,
  structuresEmployeusesSelectionnees,
  thematiqueAdminOptions,
  thematiqueNonAdminOptions,
  typesOptions,
}: Props): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const du = searchParams.get('du')
  const au = searchParams.get('au')

  const tags: ReadonlyArray<ActiveTag> = [
    ...(du !== null || au !== null
      ? [
          {
            key: 'periode',
            label: `${formaterDateCourte(du ?? DATE_DEBUT_DISPOSITIF)} - ${formaterDateCourte(au ?? new Date().toISOString().slice(0, 10))}`,
            param: 'periode',
            value: 'periode',
          },
        ]
      : []),
    ...tagsDepuisParam(searchParams.get('departements'), 'departements', 'dep', departementsOptions),
    ...tagsDepuisParam(searchParams.get('communes'), 'communes', 'commune', communesSelectionnees),
    ...tagsDepuisParam(
      searchParams.get('structuresEmployeuses'),
      'structuresEmployeuses',
      'str',
      structuresEmployeusesSelectionnees
    ),
    ...tagsDepuisParam(searchParams.get('lieux'), 'lieux', 'lieu', lieuxSelectionnes),
    ...tagsDepuisParam(searchParams.get('types'), 'types', 'type', typesOptions),
    ...tagsDepuisParam(
      searchParams.get('thematiqueNonAdministratives'),
      'thematiqueNonAdministratives',
      'thm',
      thematiqueNonAdminOptions
    ),
    ...tagsDepuisParam(
      searchParams.get('thematiqueAdministratives'),
      'thematiqueAdministratives',
      'thd',
      thematiqueAdminOptions
    ),
  ]

  function retirerFiltre(tag: ActiveTag): void {
    const params = new URLSearchParams(searchParams.toString())

    if (tag.param === 'periode') {
      params.delete('au')
      params.delete('du')
    } else {
      const values = (params.get(tag.param) ?? '').split(',').filter((val) => val !== tag.value)
      if (values.length > 0) {
        params.set(tag.param, values.join(','))
      } else {
        params.delete(tag.param)
      }
    }

    const queryString = params.toString().replaceAll('%2C', ',')
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  function effacerTous(): void {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('au')
    params.delete('communes')
    params.delete('departements')
    params.delete('du')
    params.delete('lieux')
    params.delete('structuresEmployeuses')
    params.delete('thematiqueAdministratives')
    params.delete('thematiqueNonAdministratives')
    params.delete('types')
    const queryString = params.toString().replaceAll('%2C', ',')
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  if (tags.length === 0) {
    return <hr className="fr-separator-1px" />
  }

  return (
    <>
      <hr className="fr-separator-1px fr-pb-0" />
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-4v fr-flex-gap-4v fr-flex-wrap">
        <ul className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-pl-0 fr-my-0" style={{ listStyle: 'none' }}>
          {tags.map((tag) => (
            <li key={tag.key} style={{ lineHeight: 1, padding: 0 }}>
              <button
                className="fr-tag fr-tag--sm"
                onClick={() => {
                  retirerFiltre(tag)
                }}
                type="button"
              >
                <span aria-hidden className="fr-icon-close-line fr-icon--xs" />
                &nbsp;{tag.label}
              </button>
            </li>
          ))}
        </ul>
        <button className="fr-btn fr-btn--tertiary-no-outline" onClick={effacerTous} type="button">
          <span aria-hidden className="ri-close-circle-line" />
          &nbsp;Effacer les filtres
        </button>
      </div>
      <hr className="fr-separator-1px" />
    </>
  )
}

const DATE_DEBUT_DISPOSITIF = '2020-11-07'

function tagsDepuisParam(
  raw: null | string,
  param: string,
  prefixe: string,
  options: ReadonlyArray<FiltreOption>
): ReadonlyArray<ActiveTag> {
  if (raw === null || raw === '') {
    return []
  }
  return raw
    .split(',')
    .filter(Boolean)
    .map((value) => ({
      key: `${prefixe}-${value}`,
      label: options.find((opt) => opt.value === value)?.label ?? value,
      param,
      value,
    }))
}

type ActiveTag = Readonly<{
  key: string
  label: string
  param: string
  value: string
}>

type Props = Readonly<{
  communesSelectionnees: ReadonlyArray<FiltreOption>
  departementsOptions: ReadonlyArray<FiltreOption>
  lieuxSelectionnes: ReadonlyArray<FiltreOption>
  structuresEmployeusesSelectionnees: ReadonlyArray<FiltreOption>
  thematiqueAdminOptions: ReadonlyArray<FiltreOption>
  thematiqueNonAdminOptions: ReadonlyArray<FiltreOption>
  typesOptions: ReadonlyArray<FiltreOption>
}>

function formaterDateCourte(dateIso: string): string {
  const [annee, mois, jour] = dateIso.split('-')
  return `${jour}.${mois}.${annee.slice(2)}`
}
