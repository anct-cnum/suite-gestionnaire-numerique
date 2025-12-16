'use client'

import { FormEvent, ReactElement, useContext, useRef, useState } from 'react'
// eslint-disable-next-line import/no-unresolved
import Select from 'react-select/dist/declarations/src/Select'

import FiltrerParRoles from './FiltrerParRoles'
import ZonesGeographiques from './FiltrerParZonesGeographiques'
import OrganisationInput, { OrganisationOption } from './OrganisationInput'
import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import Toggle from '../shared/Toggle/Toggle'
import { toutesLesRegions, urlDeFiltrage, ZoneGeographique, zoneGeographiqueToURLSearchParams } from '@/presenters/filtresUtilisateurPresenter'

export default function FiltrerMesUtilisateurs({
  closeDrawer,
  id,
  labelId,
  resetSearch,
}: Props): ReactElement {
  const { roles, router, searchParams } = useContext(clientContext)
  const ref = useRef<Select>(null)
  const areUtilisateursActivesChecked = searchParams.get('utilisateursActives') === 'on'
  const [structuresSearchParams, setStructuresSearchParams] = useState<URLSearchParams>(new URLSearchParams())
  const [structure, setStructure] = useState<null | OrganisationOption>(null)

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
          extraSearchParams={structuresSearchParams}
          label="Par structure"
          options={[]}
          organisation={structure}
          placeholder="Nom de la structure"
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
          <SubmitButton
            ariaControls={id}
            className="fr-col-5"
          >
            Afficher les utilisateurs
          </SubmitButton>
        </div>
      </form>
    </>
  )

  function handleZoneGeographiqueChange(zoneGeographique: ZoneGeographique): void {
    setStructure(null)
    setStructuresSearchParams(zoneGeographiqueToURLSearchParams(zoneGeographique))
  }

  function reinitialiser(): void {
    // Stryker disable next-line OptionalChaining
    ref.current?.setValue(toutesLesRegions, 'select-option')
    setStructure(null)
    router.push('/mes-utilisateurs')
    resetSearch()
  }

  function filtrer(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    closeDrawer()

    const form = new FormData(event.currentTarget)

    const url = urlDeFiltrage(form, roles.length)
    router.push(url.toString())
  }
}

type Props = Readonly<{
  closeDrawer(): void
  id: string
  labelId: string
  resetSearch(): void
}>
