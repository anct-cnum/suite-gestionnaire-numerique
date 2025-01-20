import { ReactElement } from 'react'

import SubmitButton from '../SubmitButton/SubmitButton'

export default function Search({
  labelBouton,
  reinitialiserBouton,
  placeholder,
  soumettreLaRecherche,
  rechercher,
  reinitialiserLesTermesDeRechercheNomOuEmail,
  termesDeRechercheNomOuEmail,
}: Props): ReactElement {
  return (
    <form
      className="fr-search-bar"
      id="header-search"
      onSubmit={soumettreLaRecherche}
      role="search"
    >
      <label
        className="fr-label"
        htmlFor="search-784-input"
      >
        {placeholder}
      </label>
      <div className="fr-input-group fr-col-11">
        <div className="fr-input-wrap">
          <input
            className="fr-input"
            id="search-784-input"
            name="search-784-input"
            onChange={rechercher}
            placeholder={placeholder}
            type="search"
            value={termesDeRechercheNomOuEmail}
          />
          {termesDeRechercheNomOuEmail ?
            <button
              className="fr-btn--icon-right fr-icon-close-circle-fill reset-button"
              onClick={reinitialiserLesTermesDeRechercheNomOuEmail}
              title={reinitialiserBouton}
              type="button"
            >
              <span className="fr-sr-only">
                {reinitialiserBouton}
              </span>
            </button> : null}
        </div>
      </div>
      <SubmitButton
        label={labelBouton}
        title={labelBouton}
      />
    </form>
  )
}

type Props = Readonly<{
  labelBouton: string
  reinitialiserBouton: string
  placeholder: string
  termesDeRechercheNomOuEmail: string
  reinitialiserLesTermesDeRechercheNomOuEmail(): void
  soumettreLaRecherche(event: React.FormEvent<HTMLFormElement>): void
  rechercher(event: React.ChangeEvent<HTMLInputElement>): void
}>
