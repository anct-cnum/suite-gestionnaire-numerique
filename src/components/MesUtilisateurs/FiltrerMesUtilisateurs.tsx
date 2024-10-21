'use client'

import { Dispatch, FormEvent, ReactElement, SetStateAction, useContext, useId } from 'react'

import FiltrerParRoles from './FiltrerParRoles'
import { clientContext } from '../shared/ClientContext'
import Interrupteur from '../shared/Interrupteur/Interrupteur'

export default function FiltrerMesUtilisateurs({
  id,
  labelId,
  setIsOpen,
}: FiltrerMesUtilisateursProps): ReactElement {
  const { roles, router, searchParams } = useContext(clientContext)
  const utilisateursActivesToggleId = useId()
  const areUtilisateursActivesChecked = searchParams.get('utilisateursActives') === 'on'
  const totalDesRoles = roles.length

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
        <FiltrerParRoles />
        <div className="fr-btns-group fr-btns-group--space-between">
          <button
            className="fr-btn fr-btn--secondary fr-col-5"
            onClick={() => {
              router.push('/mes-utilisateurs')
            }}
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

  function filtrer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // Stryker disable next-line BooleanLiteral
    setIsOpen(false)

    const form = new FormData(event.currentTarget)
    const utilisateursActives = form.get('utilisateursActives')
    const isUtilisateursActivesChecked = utilisateursActives === 'on'
    const roles = form.getAll('roles')
    const shouldFilterByRoles = roles.length < totalDesRoles

    const url = new URL('/mes-utilisateurs', process.env.NEXT_PUBLIC_HOST)

    if (isUtilisateursActivesChecked) {
      url.searchParams.append('utilisateursActives', utilisateursActives)
    }

    if (shouldFilterByRoles) {
      url.searchParams.append('roles', roles.join(','))
    }

    router.push(url.toString())
  }
}

type FiltrerMesUtilisateursProps = Readonly<{
  id: string
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
}>
