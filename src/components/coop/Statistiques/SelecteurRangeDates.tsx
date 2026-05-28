'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CSSProperties, ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import DateRangePicker from './DateRangePicker'
import styles from './SelecteurRangeDates.module.css'

const DATE_DEBUT_DISPOSITIF = '2020-11-07'

export default function SelecteurRangeDates({ dateFin, dateDebut }: Props): ReactElement {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({})

  const isFilled = dateDebut !== DATE_DEBUT_DISPOSITIF || dateFin !== new Date().toISOString().slice(0, 10)

  const [isOpen, setIsOpen] = useState(false)
  const [debut, setDebut] = useState<Date | null>(isFilled ? new Date(dateDebut) : null)
  const [fin, setFin] = useState<Date | null>(isFilled ? new Date(dateFin) : null)

  useEffect(() => {
    setDebut(isFilled ? new Date(dateDebut) : null)
    setFin(isFilled ? new Date(dateFin) : null)
  }, [dateDebut, dateFin, isFilled])

  const calculerPosition = useCallback(() => {
    if (buttonRef.current === null) return
    const rect = buttonRef.current.getBoundingClientRect()
    const top = rect.bottom + 8
    const spaceRight = window.innerWidth - rect.left - 8
    const spaceLeft = rect.right - 8
    const maxHeight = `${window.innerHeight - top - 8}px`
    if (spaceRight >= spaceLeft) {
      setPopoverStyle({ left: rect.left, maxHeight, maxWidth: `${spaceRight}px`, top })
    } else {
      setPopoverStyle({ maxHeight, maxWidth: `${spaceLeft}px`, right: window.innerWidth - rect.right, top })
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('resize', calculerPosition)
    window.addEventListener('scroll', calculerPosition, true)
    return () => {
      window.removeEventListener('resize', calculerPosition)
      window.removeEventListener('scroll', calculerPosition, true)
    }
  }, [calculerPosition, isOpen])

  const appliquer = useCallback(
    (selectedDebut: Date | null, selectedFin: Date | null) => {
      const params = new URLSearchParams(searchParams.toString())

      if (selectedDebut !== null) {
        const iso = selectedDebut.toISOString().slice(0, 10)
        if (iso !== DATE_DEBUT_DISPOSITIF) {
          params.set('du', iso)
        } else {
          params.delete('du')
        }
      } else {
        params.delete('du')
      }

      if (selectedFin !== null) {
        const iso = selectedFin.toISOString().slice(0, 10)
        const aujourdhui = new Date().toISOString().slice(0, 10)
        if (iso !== aujourdhui) {
          params.set('au', iso)
        } else {
          params.delete('au')
        }
      } else {
        params.delete('au')
      }

      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
      setIsOpen(false)
    },
    [pathname, router, searchParams]
  )

  const valider = useCallback(() => {
    appliquer(debut, fin)
  }, [appliquer, debut, fin])

  const effacer = useCallback(() => {
    setDebut(null)
    setFin(null)
    appliquer(null, null)
  }, [appliquer])

  const labelBouton =
    debut !== null && fin !== null ? `${formaterDateCourte(debut)} - ${formaterDateCourte(fin)}` : 'Période'

  return (
    <div className={styles.container}>
      <button
        ref={buttonRef}
        aria-expanded={isOpen}
        className={`fr-btn ${isFilled ? 'fr-btn--secondary' : 'fr-btn--tertiary'} fr-border-radius--4 ${isFilled ? styles.filled : ''} ${isOpen ? styles.open : ''}`}
        onClick={() => {
          if (!isOpen) {
            calculerPosition()
          }
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
          <div className={styles.popover} style={popoverStyle}>
            <DateRangePicker
              debut={debut}
              fin={fin}
              maxDate={new Date()}
              minDate={new Date(DATE_DEBUT_DISPOSITIF)}
              onChange={({ debut: d, fin: f }) => {
                setDebut(d)
                setFin(f)
              }}
              onEffacer={effacer}
              onValider={valider}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}

type Props = Readonly<{
  dateDebut: string
  dateFin: string
}>

function formaterDateCourte(date: Date): string {
  const jour = String(date.getDate()).padStart(2, '0')
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const annee = String(date.getFullYear()).slice(2)
  return `${jour}.${mois}.${annee}`
}
