'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'

import type { DepartementOption } from './FiltreDepartement'
import type { CommuneOption } from '@/gateways/PrismaCommunesCoopLoader'
import type { LieuCoopOption } from '@/gateways/PrismaLieuxCoopLoader'
import type { MediateurCoopOption } from '@/gateways/PrismaMediateursCoopLoader'
import type { StructureEmployeuseOption } from '@/gateways/PrismaStructuresEmployeusesCoopLoader'

export default function FilterTags({
  communesSelectionnees,
  departementsOptions,
  lieuxSelectionnes,
  mediateursSelectionnes,
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
  const communesRaw = searchParams.get('communes')
  const departementsRaw = searchParams.get('departements')
  const lieuxRaw = searchParams.get('lieux')
  const mediateursRaw = searchParams.get('mediateurs')
  const structuresEmployeusesRaw = searchParams.get('structuresEmployeuses')
  const typesRaw = searchParams.get('types')
  const thematiqueNonAdminRaw = searchParams.get('thematiqueNonAdministratives')
  const thematiqueAdminRaw = searchParams.get('thematiqueAdministratives')

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
    ...(departementsRaw
      ? departementsRaw
          .split(',')
          .filter(Boolean)
          .map((code) => ({
            key: `dep-${code}`,
            label: departementsOptions.find((dep) => dep.code === code)?.nom ?? code,
            param: 'departements',
            value: code,
          }))
      : []),
    ...(communesRaw
      ? communesRaw
          .split(',')
          .filter(Boolean)
          .map((codeInsee) => ({
            key: `commune-${codeInsee}`,
            label: communesSelectionnees.find((commune) => commune.codeInsee === codeInsee)?.nom ?? codeInsee,
            param: 'communes',
            value: codeInsee,
          }))
      : []),
    ...(structuresEmployeusesRaw
      ? structuresEmployeusesRaw
          .split(',')
          .filter(Boolean)
          .map((id) => ({
            key: `str-${id}`,
            label: structuresEmployeusesSelectionnees.find((str) => str.id === id)?.nom ?? id,
            param: 'structuresEmployeuses',
            value: id,
          }))
      : []),
    ...(lieuxRaw
      ? lieuxRaw
          .split(',')
          .filter(Boolean)
          .map((id) => ({
            key: `lieu-${id}`,
            label: lieuxSelectionnes.find((lieu) => lieu.id === id)?.nom ?? id,
            param: 'lieux',
            value: id,
          }))
      : []),
    ...(mediateursRaw
      ? mediateursRaw
          .split(',')
          .filter(Boolean)
          .map((idString) => ({
            key: `med-${idString}`,
            label: mediateursSelectionnes.find((med) => String(med.id) === idString)?.label ?? idString,
            param: 'mediateurs',
            value: idString,
          }))
      : []),
    ...(typesRaw
      ? typesRaw
          .split(',')
          .filter(Boolean)
          .map((value) => ({
            key: `type-${value}`,
            label: typesOptions.find((opt) => opt.value === value)?.label ?? value,
            param: 'types',
            value,
          }))
      : []),
    ...(thematiqueNonAdminRaw
      ? thematiqueNonAdminRaw
          .split(',')
          .filter(Boolean)
          .map((value) => ({
            key: `thm-${value}`,
            label: thematiqueNonAdminOptions.find((opt) => opt.value === value)?.label ?? value,
            param: 'thematiqueNonAdministratives',
            value,
          }))
      : []),
    ...(thematiqueAdminRaw
      ? thematiqueAdminRaw
          .split(',')
          .filter(Boolean)
          .map((value) => ({
            key: `thd-${value}`,
            label: thematiqueAdminOptions.find((opt) => opt.value === value)?.label ?? value,
            param: 'thematiqueAdministratives',
            value,
          }))
      : []),
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
    params.delete('mediateurs')
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
      <hr className="fr-separator-1px" />
      <div className="fr-flex fr-justify-content-space-between fr-align-items-center fr-my-4v fr-flex-gap-4v fr-flex-wrap">
        <ul className="fr-flex fr-flex-wrap fr-flex-gap-2v fr-pl-0" style={{ listStyle: 'none' }}>
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

type ActiveTag = Readonly<{
  key: string
  label: string
  param: string
  value: string
}>

type LabelValueOption = Readonly<{ label: string; value: string }>

type Props = Readonly<{
  communesSelectionnees: ReadonlyArray<CommuneOption>
  departementsOptions: ReadonlyArray<DepartementOption>
  lieuxSelectionnes: ReadonlyArray<LieuCoopOption>
  mediateursSelectionnes: ReadonlyArray<MediateurCoopOption>
  structuresEmployeusesSelectionnees: ReadonlyArray<StructureEmployeuseOption>
  thematiqueAdminOptions: ReadonlyArray<LabelValueOption>
  thematiqueNonAdminOptions: ReadonlyArray<LabelValueOption>
  typesOptions: ReadonlyArray<LabelValueOption>
}>

function formaterDateCourte(dateIso: string): string {
  const [annee, mois, jour] = dateIso.split('-')
  return `${jour}.${mois}.${annee.slice(2)}`
}
