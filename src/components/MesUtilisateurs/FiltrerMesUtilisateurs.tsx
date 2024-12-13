'use client'

import { Dispatch, FormEvent, ReactElement, SetStateAction, useContext, useId, useRef, useState } from 'react'
// eslint-disable-next-line import/no-unresolved
import Select from 'react-select/dist/declarations/src/Select'

import FiltrerParRoles from './FiltrerParRoles'
import ZonesGeographiques from './FiltrerParZonesGeographiques'
import OrganisationInput from './OrganisationInput'
import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import Toggle from '../shared/Toggle/Toggle'
import { toutesLesRegions, urlDeFiltrage, ZoneGeographique, zoneGeographiqueToURLSearchParams } from '@/presenters/filtresUtilisateurPresenter'

export default function FiltrerMesUtilisateurs({
  id,
  labelId,
  setIsOpen,
}: Props): ReactElement {
  const { roles, router, searchParams } = useContext(clientContext)
  const ref = useRef<Select>(null)
  const utilisateursActivesToggleId = useId()
  const areUtilisateursActivesChecked = searchParams.get('utilisateursActives') === 'on'
  const [structuresSearchParams, setStructuresSearchParams] = useState<URLSearchParams>(new URLSearchParams())
  const [structure, setStructure] = useState('')

  return (
    <>
      <DrawerTitle id={labelId}>
        Filtrer
      </DrawerTitle>
      <form
        aria-label="Filtrer"
        method="dialog"
        onSubmit={filtrer}
      >
        <Toggle
          defaultChecked={areUtilisateursActivesChecked}
          // Stryker disable next-line BooleanLiteral
          hasSeparator={true}
          id={utilisateursActivesToggleId}
          name="utilisateursActives"
        >
          Uniquement les utilisateurs activés
        </Toggle>
        <hr />
        <ZonesGeographiques
          ref={ref}
          setZoneGeographique={handleZoneGeographiqueChange}
        />
        <hr />
        <OrganisationInput
          additionalSearchParams={structuresSearchParams}
          label="Par structure"
          options={[]}
          organisation={structure}
          required={false}
          setOrganisation={setStructure}
        />
        <FiltrerParRoles />
        <div className="fr-btns-group fr-btns-group--space-between">
          <button
            className="fr-btn fr-btn--secondary fr-col-5"
            onClick={reinitialiser}
            type="reset"
          >
            Réinitialiser les filtres
          </button>
          <button
            aria-controls={id}
            className="fr-btn fr-col-5"
            type="submit"
          >
            Afficher les utilisateurs
          </button>
        </div>
      </form>
    </>
  )

  function handleZoneGeographiqueChange(zoneGeographique: ZoneGeographique): void {
    setStructure('')
    setStructuresSearchParams(zoneGeographiqueToURLSearchParams(zoneGeographique))
  }

  function reinitialiser(): void {
    // Stryker disable next-line OptionalChaining
    ref.current?.setValue(toutesLesRegions, 'select-option')
    setStructure('')
    router.push('/mes-utilisateurs')
  }

  function filtrer(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    // Stryker disable next-line BooleanLiteral
    setIsOpen(false)

    const form = new FormData(event.currentTarget)

    const url = urlDeFiltrage(form, roles.length)
    router.push(url.toString())
  }
}

type Props = Readonly<{
  id: string
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
}>
