import { ReactElement, SyntheticEvent, useId } from 'react'

export default function BarreRecherche({ label, rechercher, valeurInitiale }: Props): ReactElement {
  const inputId = useId()

  function soumettreLaRecherche(event: SyntheticEvent<HTMLFormElement>): void {
    event.preventDefault()
    const valeur = new FormData(event.currentTarget).get('recherche')
    rechercher(typeof valeur === 'string' ? valeur.trim() : '')
  }

  return (
    <form className="fr-search-bar" onSubmit={soumettreLaRecherche} role="search">
      <label className="fr-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        className="fr-input"
        defaultValue={valeurInitiale}
        id={inputId}
        key={valeurInitiale}
        name="recherche"
        placeholder={label}
        type="search"
      />
      <button className="fr-btn" title="Rechercher" type="submit">
        Rechercher
      </button>
    </form>
  )
}

type Props = Readonly<{
  label: string
  rechercher(valeur: string): void
  valeurInitiale: string
}>
