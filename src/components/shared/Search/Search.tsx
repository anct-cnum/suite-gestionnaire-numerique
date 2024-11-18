import { ReactElement } from 'react'

export default function Search({ labelBouton, placeholder }: SearchProps): ReactElement {
  return (
    <div
      className="fr-search-bar"
      id="header-search"
      role="search"
    >
      <label
        className="fr-label"
        htmlFor="search-784-input"
      >
        {placeholder}
      </label>
      <input
        className="fr-input"
        id="search-784-input"
        name="search-784-input"
        placeholder={placeholder}
        type="search"
      />
      <button
        className="fr-btn"
        title={labelBouton}
        type="button"
      >
        {labelBouton}
      </button>
    </div>
  )
}

type SearchProps = Readonly<{
  labelBouton: string
  placeholder: string
}>
