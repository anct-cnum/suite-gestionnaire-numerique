'use client'

import type { ReactElement } from 'react'
import { useCallback, useState } from 'react'

import styles from './DateRangePicker.module.css'

const MOIS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const
const JOURS_ABREV = ['L', 'M', 'M', 'J', 'V', 'S', 'D'] as const
const JOURS_ARIA = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] as const

type DayCell = Readonly<{ date: Date; isOutside: boolean }>

function addMois(annee: number, mois: number, delta: number): Readonly<{ annee: number; mois: number }> {
  const date = new Date(annee, mois + delta, 1)
  return { annee: date.getFullYear(), mois: date.getMonth() }
}

function semainsDuMois(annee: number, mois: number): ReadonlyArray<ReadonlyArray<DayCell>> {
  const premier = new Date(annee, mois, 1)
  const dernier = new Date(annee, mois + 1, 0)
  const debutSemaine = (premier.getDay() + 6) % 7 // lundi = 0

  const semaines: Array<Array<DayCell>> = []
  let semaine: Array<DayCell> = []

  // Cellules de remplissage au début (jours du mois précédent)
  for (let index = 0; index < debutSemaine; index++) {
    semaine.push({ date: new Date(annee, mois, index - debutSemaine + 1), isOutside: true })
  }

  for (let jour = 1; jour <= dernier.getDate(); jour++) {
    semaine.push({ date: new Date(annee, mois, jour), isOutside: false })
    if (semaine.length === 7) {
      semaines.push(semaine)
      semaine = []
    }
  }

  if (semaine.length > 0) {
    let nextDay = 1
    while (semaine.length < 7) {
      semaine.push({ date: new Date(annee, mois + 1, nextDay++), isOutside: true })
    }
    semaines.push(semaine)
  }

  return semaines
}

function memeJour(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function entreInclus(date: Date, debut: Date, fin: Date): boolean {
  return date >= debut && date <= fin
}

function isoJour(date: Date): string {
  return date.toISOString().slice(0, 10)
}

type CalendrierMoisProps = Readonly<{
  annee: number
  debut: Date | null
  fin: Date | null
  maxDate: Date
  minDate: Date
  mois: number
  onAnneeChange: (annee: number) => void
  onClick: (date: Date) => void
  onMoisChange: (mois: number) => void
}>

function CalendrierMois({
  annee,
  debut,
  fin,
  maxDate,
  minDate,
  mois,
  onAnneeChange,
  onClick,
  onMoisChange,
}: CalendrierMoisProps): ReactElement {
  const semaines = semainsDuMois(annee, mois)
  const aujourdhui = new Date()

  const anneesOptions: Array<number> = []
  for (let ay = minDate.getFullYear(); ay <= maxDate.getFullYear(); ay++) {
    anneesOptions.push(ay)
  }

  return (
    <div className="fr-flex fr-direction-column fr-flex-gap-1v">
      <div className="fr-flex fr-justify-content-center">
        <div className="fr-flex fr-flex-gap-1v fr-align-items-center">
          <select
            aria-label="Choisir le mois"
            className={styles.dropdown}
            onChange={(ev) => {
              onMoisChange(Number(ev.target.value))
            }}
            value={mois}
          >
            {MOIS_FR.map((label, index) => (
              <option
                disabled={
                  (annee === minDate.getFullYear() && index < minDate.getMonth()) ||
                  (annee === maxDate.getFullYear() && index > maxDate.getMonth())
                }
                key={label}
                value={index}
              >
                {label}
              </option>
            ))}
          </select>
          <select
            aria-label="Choisir l'année"
            className={styles.dropdown}
            onChange={(ev) => {
              onAnneeChange(Number(ev.target.value))
            }}
            value={annee}
          >
            {anneesOptions.map((ay) => (
              <option key={ay} value={ay}>
                {ay}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table
        aria-label={`${MOIS_FR[mois]} ${annee}`}
        aria-multiselectable="true"
        className="rdp-month_grid"
        role="grid"
      >
        <thead aria-hidden="true">
          <tr className="fr-flex">
            {JOURS_ABREV.map((abrev, index) => (
              <th
                aria-label={JOURS_ARIA[index]}
                className={`fr-flex fr-align-items-center fr-justify-content-center fr-text--bold fr-text--uppercase ${styles.weekday}`}
                key={JOURS_ARIA[index]}
                scope="col"
              >
                {abrev}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="fr-flex fr-direction-column">
          {semaines.map((semaine, si) => (
            <tr className="fr-flex" key={si}>
              {semaine.map(({ date: jour, isOutside }) => {
                const estAujourdhui = !isOutside && memeJour(jour, aujourdhui)
                const estDebut = !isOutside && debut !== null && memeJour(jour, debut)
                const estFin = !isOutside && fin !== null && memeJour(jour, fin)
                const estMilieu =
                  debut !== null && fin !== null && !estDebut && !estFin && entreInclus(jour, debut, fin)
                const estSelectionne = estDebut || estFin || estMilieu
                const estDesactive = !isOutside && (jour < minDate || jour > maxDate)

                const dayClasses = [
                  'fr-flex',
                  'fr-align-items-center',
                  'fr-justify-content-center',
                  styles.day,
                  estDebut ? styles.rangeStart : '',
                  estFin ? styles.rangeEnd : '',
                  estMilieu ? styles.rangeMiddle : '',
                  estAujourdhui ? styles.today : '',
                  isOutside ? styles.outside : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                if (isOutside) {
                  return (
                    <td
                      className={dayClasses}
                      data-day={isoJour(jour)}
                      data-outside="true"
                      key={`outside-${isoJour(jour)}`}
                      role="gridcell"
                    />
                  )
                }

                const labelJour = jour.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  weekday: 'long',
                  year: 'numeric',
                })

                return (
                  <td
                    aria-selected={estSelectionne}
                    className={dayClasses}
                    data-day={isoJour(jour)}
                    key={isoJour(jour)}
                    role="gridcell"
                  >
                    <button
                      aria-label={`${estAujourdhui ? "Aujourd'hui, " : ''}${labelJour}${estSelectionne ? ', sélectionné' : ''}`}
                      className={styles.dayButton}
                      disabled={estDesactive}
                      onClick={() => {
                        onClick(jour)
                      }}
                      tabIndex={estDesactive ? -1 : 0}
                      type="button"
                    >
                      {jour.getDate()}
                    </button>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function DateRangePicker({
  debut,
  fin,
  maxDate,
  minDate,
  onChange,
  onValider,
  onEffacer,
}: Props): ReactElement {
  const today = new Date()
  const initial = debut ?? today
  const [moisGauche, setMoisGauche] = useState({ annee: initial.getFullYear(), mois: initial.getMonth() })

  const moisDroite = addMois(moisGauche.annee, moisGauche.mois, 1)

  const peutReculer = moisGauche.annee > minDate.getFullYear() || moisGauche.mois > minDate.getMonth()
  const peutAvancer = moisDroite.annee < maxDate.getFullYear() || moisDroite.mois < maxDate.getMonth()

  const handleClick = useCallback(
    (date: Date) => {
      if (debut === null || fin !== null) {
        onChange({ debut: date, fin: null })
      } else if (memeJour(date, debut)) {
        onChange({ debut: null, fin: null })
      } else if (date > debut) {
        onChange({ debut, fin: date })
      } else {
        onChange({ debut: date, fin: debut })
      }
    },
    [debut, fin, onChange]
  )

  function allerAuDebut(): void {
    if (debut === null) return
    setMoisGauche({ annee: debut.getFullYear(), mois: debut.getMonth() })
  }

  function allerAlaFin(): void {
    if (fin === null) return
    const moisFin = addMois(fin.getFullYear(), fin.getMonth(), -1)
    setMoisGauche(moisFin)
  }

  return (
    <div className={`${styles.root} fr-position-relative`} data-mode="range" data-multiple-months="true">
      <div className="fr-flex fr-flex-gap-6v">
        <nav
          className="fr-flex fr-justify-content-space-between fr-width-full fr-position-absolute fr-text-label--blue-france"
          style={{ pointerEvents: 'none' }}
        >
          <div style={{ pointerEvents: 'auto' }}>
            <button
              aria-label="Aller au début de la sélection"
              disabled={debut === null}
              onClick={allerAuDebut}
              type="button"
            >
              <span aria-hidden className="ri-arrow-left-double-line ri-lg" />
            </button>
            <button
              aria-label="Mois précédent"
              disabled={!peutReculer}
              onClick={() => {
                setMoisGauche((prev) => addMois(prev.annee, prev.mois, -1))
              }}
              type="button"
            >
              <span aria-hidden className="ri-arrow-left-s-line ri-lg" />
            </button>
          </div>
          <div style={{ pointerEvents: 'auto' }}>
            <button
              aria-label="Mois suivant"
              disabled={!peutAvancer}
              onClick={() => {
                setMoisGauche((prev) => addMois(prev.annee, prev.mois, 1))
              }}
              type="button"
            >
              <span aria-hidden className="ri-arrow-right-s-line ri-lg" />
            </button>
            <button
              aria-label="Aller à la fin de la sélection"
              disabled={fin === null}
              onClick={allerAlaFin}
              type="button"
            >
              <span aria-hidden className="ri-arrow-right-double-line ri-lg" />
            </button>
          </div>
        </nav>

        <CalendrierMois
          annee={moisGauche.annee}
          debut={debut}
          fin={fin}
          maxDate={maxDate}
          minDate={minDate}
          mois={moisGauche.mois}
          onAnneeChange={(annee) => {
            setMoisGauche((prev) => ({ ...prev, annee }))
          }}
          onClick={handleClick}
          onMoisChange={(mois) => {
            setMoisGauche((prev) => ({ ...prev, mois }))
          }}
        />

        <CalendrierMois
          annee={moisDroite.annee}
          debut={debut}
          fin={fin}
          maxDate={maxDate}
          minDate={minDate}
          mois={moisDroite.mois}
          onAnneeChange={(annee) => {
            setMoisGauche(addMois(annee, moisDroite.mois, -1))
          }}
          onClick={handleClick}
          onMoisChange={(mois) => {
            setMoisGauche(addMois(moisDroite.annee, mois, -1))
          }}
        />
      </div>

      <form
        onSubmit={(ev) => {
          ev.preventDefault()
          onValider()
        }}
      >
        <hr className="fr-separator-1px fr-my-6v fr-mx-n8v" />
        <div className="fr-flex fr-flex-gap-4v fr-align-items-center fr-justify-content-end">
          <button className="fr-btn fr-btn--secondary" onClick={onEffacer} type="button">
            Effacer
          </button>
          <button className="fr-btn" disabled={debut === null || fin === null} type="submit">
            Valider
          </button>
        </div>
      </form>
    </div>
  )
}

type Props = Readonly<{
  debut: Date | null
  fin: Date | null
  maxDate: Date
  minDate: Date
  onChange: (range: Readonly<{ debut: Date | null; fin: Date | null }>) => void
  onEffacer: () => void
  onValider: () => void
}>
