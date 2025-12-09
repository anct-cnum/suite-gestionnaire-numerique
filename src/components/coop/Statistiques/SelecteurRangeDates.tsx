'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useCallback, useEffect, useId, useRef, useState } from 'react'

import styles from './SelecteurRangeDates.module.css'

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ')

const DATE_DEBUT_DISPOSITIF = '2020-11-07'

export default function SelecteurRangeDates({ dateFin, dateDebut }: Props): ReactElement {
  const id = useId()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)

  const [dateDebutLocale, setDateDebutLocale] = useState(dateDebut)
  const [dateFinLocale, setDateFinLocale] = useState(dateFin)
  const [isOpen, setIsOpen] = useState(false)

  const formaterDateCourte = useCallback((dateIso: string): string => {
    const [annee, mois, jour] = dateIso.split('-')
    return `${jour}.${mois}.${annee?.slice(2)}`
  }, [])

  const isFilled = dateDebut !== DATE_DEBUT_DISPOSITIF || dateFin !== new Date().toISOString().slice(0, 10)

  const appliquerFiltres = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (dateDebutLocale !== DATE_DEBUT_DISPOSITIF) {
      params.set('du', dateDebutLocale)
    } else {
      params.delete('du')
    }

    const aujourdhui = new Date().toISOString().slice(0, 10)
    if (dateFinLocale !== aujourdhui) {
      params.set('au', dateFinLocale)
    } else {
      params.delete('au')
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
    setIsOpen(false)
  }, [dateDebutLocale, dateFinLocale, pathname, router, searchParams])

  const effacerFiltres = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('du')
    params.delete('au')

    const aujourdhui = new Date().toISOString().slice(0, 10)
    setDateDebutLocale(DATE_DEBUT_DISPOSITIF)
    setDateFinLocale(aujourdhui)

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
    setIsOpen(false)
  }, [pathname, router, searchParams])

  // Fermer le popover quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isOpen) {
          appliquerFiltres()
        }
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        appliquerFiltres()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, appliquerFiltres])

  return (
    <div
      className={styles.container}
      ref={containerRef}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={cx(
          'fr-btn',
          isFilled ? 'fr-btn--secondary' : 'fr-btn--tertiary',
          'fr-border-radius--4',
          isFilled && styles.filled,
          isOpen && styles.open
        )}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {formaterDateCourte(dateDebut)}
        {' - '}
        {formaterDateCourte(dateFin)}
        <span
          aria-hidden
          className={cx(
            'fr-ml-1v fr-icon--sm',
            isOpen ? 'fr-icon-arrow-up-s-line' : 'fr-icon-arrow-down-s-line'
          )}
        />
      </button>

      {isOpen ? (
        <div
          className={styles.popover}
          id={`${id}-popover`}
        >
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-6">
              <h4 className="fr-text--bold fr-text--md fr-mb-2v" style={{ textAlign: 'center' }}>
                Début
              </h4>
              <input
                className={cx('fr-input', styles.dateInput)}
                id={`${id}-debut`}
                max={dateFinLocale}
                min={DATE_DEBUT_DISPOSITIF}
                onChange={(e) => setDateDebutLocale(e.target.value)}
                type="date"
                value={dateDebutLocale}
              />
            </div>
            <div className="fr-col-6">
              <h4 className="fr-text--bold fr-text--md fr-mb-2v" style={{ textAlign: 'center' }}>
                Fin
              </h4>
              <input
                className={cx('fr-input', styles.dateInput)}
                id={`${id}-fin`}
                max={new Date().toISOString().slice(0, 10)}
                min={dateDebutLocale}
                onChange={(e) => setDateFinLocale(e.target.value)}
                type="date"
                value={dateFinLocale}
              />
            </div>
          </div>
          <hr className="fr-separator-1px fr-my-3v" />
          <div className="fr-flex fr-flex-gap-4v" style={{ justifyContent: 'flex-end' }}>
            <button
              className="fr-btn fr-btn--secondary"
              onClick={effacerFiltres}
              type="button"
            >
              Effacer
            </button>
            <button
              className="fr-btn"
              onClick={appliquerFiltres}
              type="button"
            >
              Valider
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

type Props = Readonly<{
  dateDebut: string
  dateFin: string
}>
