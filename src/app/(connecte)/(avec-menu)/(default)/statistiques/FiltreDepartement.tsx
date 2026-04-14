'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, ReactElement, useCallback, useEffect, useState } from 'react'

import styles from './FiltrePopover.module.css'

export type DepartementOption = Readonly<{
  code: string
  nom: string
}>

export default function FiltreDepartement({ departements, options }: Props): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const selectOptions: ReadonlyArray<SelectOption> = options.map(({ code, nom }) => ({
    label: nom,
    value: code,
  }))

  const [pending, setPending] = useState<ReadonlyArray<SelectOption>>(
    selectOptions.filter((opt) => departements.includes(opt.value))
  )

  const departementsKey = departements.join(',')
  useEffect(() => {
    setPending(selectOptions.filter((opt) => departements.includes(opt.value)))
  }, [departementsKey])

  const isFilled = pending.length > 0
  const labelBouton = isFilled ? `Département · ${pending.length}` : 'Départements'

  const appliquer = useCallback(
    (selection: ReadonlyArray<SelectOption>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (selection.length > 0) {
        params.set('departements', selection.map((opt) => opt.value).join(','))
      } else {
        params.delete('departements')
      }
      const queryString = params.toString().replaceAll('%2C', ',')
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
      setIsOpen(false)
    },
    [pathname, router, searchParams]
  )

  const valider = useCallback(() => {
    appliquer(pending)
  }, [appliquer, pending])

  const effacer = useCallback(() => {
    setPending([])
    appliquer([])
  }, [appliquer])

  const retirer = useCallback((valeur: string) => {
    setPending((prev) => prev.filter((opt) => opt.value !== valeur))
  }, [])

  const onInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const val = event.target.value
      setInputValue(val)
      const inputType = (event.nativeEvent as InputEvent).inputType
      const estSelectionDepuisListe = inputType === 'insertReplacementText' || inputType === ''
      if (estSelectionDepuisListe) {
        const matched = selectOptions.find(
          (opt) => opt.label === val && !pending.some((sel) => sel.value === opt.value)
        )
        if (matched !== undefined) {
          setPending((prev) => [...prev, matched])
          setInputValue('')
        }
      }
    },
    [pending, selectOptions]
  )

  return (
    <div className={styles.container}>
      <button
        aria-expanded={isOpen}
        className={`fr-btn ${isFilled ? 'fr-btn--secondary' : 'fr-btn--tertiary'} fr-border-radius--4 ${isFilled ? styles.filled : ''} ${isOpen ? styles.open : ''}`}
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        type="button"
      >
        {labelBouton}
        <span
          aria-hidden
          className={`fr-ml-1v fr-icon--sm ${isOpen ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'}`}
        />
      </button>

      {isOpen ? (
        <>
          <div
            aria-hidden
            className={styles.backdrop}
            onMouseDown={() => {
              setIsOpen(false)
            }}
          />
          <div className={styles.popover}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                valider()
              }}
            >
              <label className="fr-label fr-mb-1v fr-text--bold" htmlFor="departement-filter-select">
                Filtrer par&nbsp;:
              </label>
              <input
                autoComplete="off"
                className="fr-input fr-mb-2v fr-mt-3v"
                id="departement-filter-select"
                list="departement-filter-datalist"
                onChange={onInputChange}
                placeholder="Chercher un département"
                value={inputValue}
              />
              <datalist id="departement-filter-datalist">
                {selectOptions
                  .filter((opt) => !pending.some((sel) => sel.value === opt.value))
                  .map((opt) => (
                    <option key={opt.value} value={opt.label} />
                  ))}
              </datalist>

              {isFilled ? (
                <>
                  <hr className="fr-separator-1px fr-my-6v" />
                  <span className="fr-text--bold fr-text--sm">
                    {pending.length}&nbsp;{pending.length > 1 ? 'départements sélectionnés' : 'département sélectionné'}
                  </span>
                  <ul className="fr-mt-2v fr-pl-0" style={{ listStyle: 'none' }}>
                    {pending.map((opt) => (
                      <li key={opt.value} className="fr-pb-1v">
                        <button
                          className="fr-tag fr-tag--sm"
                          onClick={() => {
                            retirer(opt.value)
                          }}
                          type="button"
                        >
                          <span aria-hidden className="fr-icon-close-line fr-icon--xs" />
                          &nbsp;{opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <hr className="fr-separator-1px fr-my-6v" />
              <div className="fr-flex fr-flex-gap-4v fr-align-items-center fr-justify-content-end">
                <button className="fr-btn fr-btn--secondary" onClick={effacer} type="button">
                  Effacer
                </button>
                <button className="fr-btn" type="submit">
                  Valider
                </button>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </div>
  )
}

type SelectOption = Readonly<{
  label: string
  value: string
}>

type Props = Readonly<{
  departements: ReadonlyArray<string>
  options: ReadonlyArray<DepartementOption>
}>
