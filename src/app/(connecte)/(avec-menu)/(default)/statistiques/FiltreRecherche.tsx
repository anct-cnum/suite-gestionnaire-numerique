'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useCallback, useEffect, useId, useRef, useState } from 'react'

import styles from './FiltrePopover.module.css'
import Select from '@/components/shared/Select/Select'
import SelectAsync from '@/components/shared/Select/SelectAsync'

export type FiltreOption = Readonly<{
  label: string
  value: string
}>

export default function FiltreRecherche({
  libelle,
  libelleBouton,
  libellePluriel,
  libelleSingulier,
  options,
  param,
  placeholder,
  selection,
  urlRecherche,
}: Props): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const inputId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [pending, setPending] = useState(selection)

  const selectionKey = searchParams.get(param) ?? ''
  useEffect(() => {
    setPending(selection)
  }, [selectionKey])

  const isFilled = pending.length > 0
  const labelBouton = isFilled ? `${libelle} · ${pending.length}` : libelleBouton

  const appliquer = useCallback(
    (nouvelleSelection: ReadonlyArray<FiltreOption>) => {
      const params = new URLSearchParams(searchParams.toString())
      if (nouvelleSelection.length > 0) {
        params.set(param, nouvelleSelection.map((opt) => opt.value).join(','))
      } else {
        params.delete(param)
      }
      const queryString = params.toString().replaceAll('%2C', ',')
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
      setIsOpen(false)
    },
    [param, pathname, router, searchParams]
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

  const ajouter = useCallback((option: FiltreOption | null) => {
    if (option !== null) {
      setPending((prev) => (prev.some((opt) => opt.value === option.value) ? prev : [...prev, option]))
    }
  }, [])

  const chargerOptions = useCallback(
    async (recherche: string) =>
      new Promise<Array<FiltreOption>>((resolve) => {
        clearTimeout(timerRef.current)
        if (urlRecherche === undefined || recherche.length < 2) {
          resolve([])
          return
        }
        timerRef.current = setTimeout(() => {
          void fetch(`${urlRecherche}?q=${encodeURIComponent(recherche)}`)
            .then(async (res) => res.json() as Promise<ReadonlyArray<FiltreOption>>)
            .then((data) => {
              resolve(data.filter((opt) => !pending.some((sel) => sel.value === opt.value)))
            })
        }, 300)
      }),
    [pending, urlRecherche]
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
              {urlRecherche === undefined ? (
                <Select<FiltreOption>
                  id={inputId}
                  onChange={ajouter}
                  options={(options ?? []).filter((opt) => !pending.some((sel) => sel.value === opt.value))}
                  placeholder={placeholder}
                  value={null}
                >
                  <span className="fr-text--bold">Filtrer par&nbsp;:</span>
                </Select>
              ) : (
                <SelectAsync<FiltreOption>
                  id={inputId}
                  loadOptions={chargerOptions}
                  noOptionsMessage={(inputValue) =>
                    inputValue.length < 2 ? 'Saisissez au moins 2 caractères' : 'Pas de résultat'
                  }
                  onChange={ajouter}
                  placeholder={placeholder}
                  value={null}
                >
                  <span className="fr-text--bold">Filtrer par&nbsp;:</span>
                </SelectAsync>
              )}

              {isFilled ? (
                <>
                  <hr className="fr-separator-1px fr-my-6v" />
                  <span className="fr-text--bold fr-text--sm">
                    {pending.length}&nbsp;{pending.length > 1 ? libellePluriel : libelleSingulier}
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

type Props = Readonly<{
  libelle: string
  libelleBouton: string
  libellePluriel: string
  libelleSingulier: string
  options?: ReadonlyArray<FiltreOption>
  param: string
  placeholder: string
  selection: ReadonlyArray<FiltreOption>
  urlRecherche?: string
}>
