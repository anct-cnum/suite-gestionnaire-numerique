'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChangeEvent, ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import styles from './FiltrePopover.module.css'
import type { MediateurCoopOption } from '@/gateways/PrismaMediateursCoopLoader'

export default function FiltreMediateursStats({ mediateurs, mediateursSelectionnes }: Props): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [searchResults, setSearchResults] = useState<ReadonlyArray<SelectOption>>([])

  const [pending, setPending] = useState<ReadonlyArray<SelectOption>>(
    mediateursSelectionnes.map(({ id, label }) => ({ label, value: String(id) }))
  )

  const mediateursKey = mediateurs.join(',')
  useEffect(() => {
    setPending(mediateursSelectionnes.map(({ id, label }) => ({ label, value: String(id) })))
  }, [mediateursKey])

  const isFilled = pending.length > 0
  const labelBouton = isFilled ? `Médiateur · ${pending.length}` : 'Médiateurs'

  const appliquer = useCallback(
    (selection: ReadonlyArray<SelectOption>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (selection.length > 0) {
        params.set('mediateurs', selection.map((opt) => opt.value).join(','))
      } else {
        params.delete('mediateurs')
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
      clearTimeout(timerRef.current)

      const inputType = (event.nativeEvent as InputEvent).inputType
      const estSelectionDepuisListe = inputType === 'insertReplacementText' || inputType === ''
      if (estSelectionDepuisListe) {
        const matched = searchResults.find(
          (opt) => opt.label === val && !pending.some((sel) => sel.value === opt.value)
        )
        if (matched !== undefined) {
          setPending((prev) => [...prev, matched])
          setInputValue('')
          setSearchResults([])
        }
        return
      }

      if (val.length < 2) {
        setSearchResults([])
        return
      }

      timerRef.current = setTimeout(() => {
        void fetch(`/api/statistiques/mediateurs?q=${encodeURIComponent(val)}`)
          .then((res) => res.json())
          .then((data: ReadonlyArray<MediateurCoopOption>) => {
            setSearchResults(data.map(({ id, label }) => ({ label, value: String(id) })))
          })
      }, 300)
    },
    [pending, searchResults]
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
              appliquer(pending)
            }}
          />
          <div className={styles.popover}>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                valider()
              }}
            >
              <label className="fr-label fr-mb-1v fr-text--bold" htmlFor="mediateur-filter-select">
                Filtrer par&nbsp;:
              </label>
              <input
                autoComplete="off"
                className="fr-input fr-mb-2v fr-mt-3v"
                id="mediateur-filter-select"
                list="mediateur-filter-datalist"
                onChange={onInputChange}
                placeholder="Choisir un médiateur numérique"
                value={inputValue}
              />
              <datalist id="mediateur-filter-datalist">
                {searchResults
                  .filter((opt) => !pending.some((sel) => sel.value === opt.value))
                  .map((opt) => (
                    <option key={opt.value} value={opt.label} />
                  ))}
              </datalist>

              {isFilled ? (
                <>
                  <hr className="fr-separator-1px fr-my-6v" />
                  <span className="fr-text--bold fr-text--sm">
                    {pending.length}&nbsp;{pending.length > 1 ? 'médiateurs sélectionnés' : 'médiateur sélectionné'}
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
              <div className="fr-flex fr-flex-gap-4v" style={{ alignItems: 'center', flexDirection: 'row-reverse' }}>
                <button className="fr-btn" type="submit">
                  Valider
                </button>
                <button className="fr-btn fr-btn--secondary" onClick={effacer} type="button">
                  Effacer
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
  mediateurs: ReadonlyArray<string>
  mediateursSelectionnes: ReadonlyArray<MediateurCoopOption>
}>
