'use client'

import { Dispatch, FormEvent, ReactElement, SetStateAction, useContext, useId, useRef } from 'react'
// eslint-disable-next-line import/no-unresolved
import Select from 'react-select/dist/declarations/src/Select'

import FiltrerParRoles from './FiltrerParRoles'
import ZonesGeographiques from './FiltrerParZonesGeographiques'
import { clientContext } from '../shared/ClientContext'
import Interrupteur from '../shared/Interrupteur/Interrupteur'
import { toutesLesRegions, urlDeFiltrage } from '@/presenters/zonesGeographiquesPresenter'

export default function FiltrerMesUtilisateurs({
  id,
  labelId,
  setIsOpen,
}: FiltrerMesUtilisateursProps): ReactElement {
  const { roles, router, searchParams } = useContext(clientContext)
  const ref = useRef<Select>(null)
  const utilisateursActivesToggleId = useId()
  const areUtilisateursActivesChecked = searchParams.get('utilisateursActives') === 'on'

  return (
    <>
      <h1
        className="fr-h3 color-blue-france"
        id={labelId}
      >
        Filtrer
      </h1>
      <form
        aria-label="Filtrer"
        method="dialog"
        onSubmit={filtrer}
      >
        <Interrupteur
          defaultChecked={areUtilisateursActivesChecked}
          // Stryker disable next-line BooleanLiteral
          hasSeparator={true}
          id={utilisateursActivesToggleId}
          name="utilisateursActives"
        >
          Uniquement les utilisateurs activés
        </Interrupteur>
        <hr />
        <ZonesGeographiques ref={ref} />
        <hr />
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

  function reinitialiser() {
    // Stryker disable next-line OptionalChaining
    ref.current?.setValue(toutesLesRegions, 'select-option')
    router.push('/mes-utilisateurs')
  }

  function filtrer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Stryker disable next-line BooleanLiteral
    setIsOpen(false)

    const form = new FormData(event.currentTarget)

    router.push(urlDeFiltrage(form, roles.length))
  }
}

type FiltrerMesUtilisateursProps = Readonly<{
  id: string
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
}>
