'use client'

import { ReactElement, SyntheticEvent, useContext, useState } from 'react'

import FiltrerParRoles from './FiltrerParRoles'
import ZonesGeographiques from './FiltrerParZonesGeographiques'
import OrganisationInput, { OrganisationOption } from './OrganisationInput'
import { clientContext } from '../shared/ClientContext'
import DrawerTitle from '../shared/DrawerTitle/DrawerTitle'
import SubmitButton from '../shared/SubmitButton/SubmitButton'
import Toggle from '../shared/Toggle/Toggle'
import { urlDeFiltrage } from '@/presenters/filtresUtilisateurPresenter'
import { territoireDepuisCodes, TerritoireViewModel } from '@/presenters/rechercheTerritoiresPresenter'

export default function FiltrerMesUtilisateurs({ closeDrawer, id, labelId, resetSearch }: Props): ReactElement {
  const { roles, router, searchParams } = useContext(clientContext)
  const areUtilisateursActivesChecked = searchParams.get('utilisateursActives') === 'on'
  const territoireInitial = territoireDepuisCodes({
    codeDepartement: searchParams.get('codeDepartement'),
    codeEpci: searchParams.get('codeEpci'),
    codeRegion: searchParams.get('codeRegion'),
  })
  const [territoire, setTerritoire] = useState(territoireInitial)
  const [cleReinitialisation, setCleReinitialisation] = useState(0)
  const [structuresSearchParams, setStructuresSearchParams] = useState(new URLSearchParams())
  const [structure, setStructure] = useState<null | OrganisationOption>(null)

  return (
    <>
      <DrawerTitle id={labelId}>Filtrer</DrawerTitle>
      <form aria-label="Filtrer" method="dialog" onSubmit={filtrer}>
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
          key={cleReinitialisation}
          onSelectionner={handleZoneGeographiqueChange}
          valeurInitiale={territoire}
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
          <button className="fr-btn fr-btn--secondary fr-col-5" onClick={reinitialiser} type="reset">
            Réinitialiser les filtres
          </button>
          <SubmitButton ariaControls={id} className="fr-col-5">
            Afficher les utilisateurs
          </SubmitButton>
        </div>
      </form>
    </>
  )

  function handleZoneGeographiqueChange(territoireSelectionne: null | TerritoireViewModel): void {
    setTerritoire(territoireSelectionne)
    // Effacer la zone élargit le périmètre : la structure sélectionnée reste valide.
    if (territoireSelectionne !== null) {
      setStructure(null)
    }
    // La recherche de structures ne sait restreindre que par région ou département (pas par EPCI).
    const zoneParams = new URLSearchParams()
    if (territoireSelectionne !== null && territoireSelectionne.type !== 'epci') {
      zoneParams.set(territoireSelectionne.type, territoireSelectionne.code)
    }
    setStructuresSearchParams(zoneParams)
  }

  function reinitialiser(): void {
    setCleReinitialisation((cle) => cle + 1)
    setTerritoire(null)
    setStructuresSearchParams(new URLSearchParams())
    setStructure(null)
    router.push('/mes-utilisateurs')
    resetSearch()
  }

  function filtrer(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault()

    closeDrawer()

    const form = new FormData(event.currentTarget)

    const url = urlDeFiltrage(form, roles.length, territoire)
    router.push(url.toString())
  }
}

type Props = Readonly<{
  closeDrawer(): void
  id: string
  labelId: string
  resetSearch(): void
}>
