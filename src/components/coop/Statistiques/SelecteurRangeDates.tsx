'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ReactElement, useCallback, useId, useRef, useState } from 'react'

import styles from './SelecteurRangeDates.module.css'

const DATE_DEBUT_DISPOSITIF = '2020-11-07'

export default function SelecteurRangeDates({ dateFin, dateDebut }: Props): ReactElement {
  const id = useId()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const [dateDebutLocale, setDateDebutLocale] = useState(dateDebut)
  const [dateFinLocale, setDateFinLocale] = useState(dateFin)
  const [isOpen, setIsOpen] = useState(false)

  const formaterDateCourte = useCallback((dateIso: string): string => {
    const [annee, mois, jour] = dateIso.split('-')
    return `${jour}.${mois}.${annee?.slice(2)}`
  }, [])

  const ouvrirDialog = useCallback(() => {
    dialogRef.current?.showModal()
    setIsOpen(true)
  }, [])

  const fermerDialog = useCallback(() => {
    dialogRef.current?.close()
    setIsOpen(false)
  }, [])

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
    fermerDialog()
  }, [dateDebutLocale, dateFinLocale, fermerDialog, pathname, router, searchParams])

  const reinitialiser = useCallback(() => {
    const aujourdhui = new Date().toISOString().slice(0, 10)
    setDateDebutLocale(DATE_DEBUT_DISPOSITIF)
    setDateFinLocale(aujourdhui)
  }, [])

  return (
    <div className={styles.selecteurRangeDates}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="fr-btn fr-btn--tertiary fr-btn--sm"
        onClick={ouvrirDialog}
        type="button"
      >
        {formaterDateCourte(dateDebut)}
        {' - '}
        {formaterDateCourte(dateFin)}
      </button>

      <dialog
        className={styles.dialog}
        id={`${id}-dialog`}
        ref={dialogRef}
      >
        <div className={styles.dialogContent}>
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-6">
              <label
                className="fr-label"
                htmlFor={`${id}-debut`}
              >
                Du
              </label>
              <input
                className="fr-input"
                id={`${id}-debut`}
                max={dateFinLocale}
                min={DATE_DEBUT_DISPOSITIF}
                onChange={(e) => setDateDebutLocale(e.target.value)}
                type="date"
                value={dateDebutLocale}
              />
            </div>
            <div className="fr-col-6">
              <label
                className="fr-label"
                htmlFor={`${id}-fin`}
              >
                Au
              </label>
              <input
                className="fr-input"
                id={`${id}-fin`}
                max={new Date().toISOString().slice(0, 10)}
                min={dateDebutLocale}
                onChange={(e) => setDateFinLocale(e.target.value)}
                type="date"
                value={dateFinLocale}
              />
            </div>
          </div>
          <div className="fr-btns-group fr-btns-group--inline fr-btns-group--right fr-mt-2w">
            <button
              className="fr-btn fr-btn--secondary fr-btn--sm"
              onClick={reinitialiser}
              type="button"
            >
              Réinitialiser
            </button>
            <button
              className="fr-btn fr-btn--sm"
              onClick={appliquerFiltres}
              type="button"
            >
              Appliquer
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

type Props = Readonly<{
  dateDebut: string
  dateFin: string
}>
