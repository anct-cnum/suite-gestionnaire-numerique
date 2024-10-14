'use client'

import { Dispatch, FormEvent, ReactElement, SetStateAction, useContext, useId } from 'react'

import Checkbox from '../shared/Checkbox/Checkbox'
import { clientContext } from '../shared/ClientContext'

export default function FiltrerMesUtilisateurs({
  id,
  labelId,
  setIsOpen,
}: FiltrerMesUtilisateursProps): ReactElement {
  const { router, searchParams } = useContext(clientContext)
  const utilisateursActivesToggleId = useId()

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
        <Checkbox
          defaultChecked={searchParams.get('utilisateursActives') === 'on'}
          // Stryker disable next-line BooleanLiteral
          hasSeparator={true}
          id={utilisateursActivesToggleId}
          name="utilisateursActives"
        >
          Uniquement les utilisateurs activés
        </Checkbox>
        <hr />
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
    const utilisateursActives = form.get('utilisateursActives') as string

    const url = new URL('/mes-utilisateurs', process.env.NEXT_PUBLIC_HOST)

    if (utilisateursActives === 'on') {
      url.searchParams.append('utilisateursActives', utilisateursActives)
    }

    router.push(url.toString())
  }
}

type FiltrerMesUtilisateursProps = Readonly<{
  id: string
  labelId: string
  setIsOpen: Dispatch<SetStateAction<boolean>>
}>
