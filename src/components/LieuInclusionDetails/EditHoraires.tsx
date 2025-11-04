'use client'

import {
  CLOSED_SCHEDULE,
  type DaySchedule,
  fromTimetableOpeningHours,
  OSM_DAYS_OF_WEEK,
  type Schedule,
  toTimetableOpeningHours,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import { type ReactElement, useState } from 'react'

import styles from './EditHoraires.module.css'
import TimeInput from './TimeInput'
import { useDateService } from '@/components/shared/DateProvider'

const JOURS_SEMAINE = {
  Fr: 'Vendredi',
  Mo: 'Lundi',
  Sa: 'Samedi',
  Su: 'Dimanche',
  Th: 'Jeudi',
  Tu: 'Mardi',
  We: 'Mercredi',
} as const

/**
 * Transforme les données du formulaire en horaires OSM opening hours
 */
export function transformHoraires(formData: FormData): string {
  const schedule: Schedule = {} as Schedule

  for (const day of OSM_DAYS_OF_WEEK) {
    schedule[day] = createDaySchedule(formData, day)
  }

  const osmHours = fromTimetableOpeningHours(schedule)
  const comment = formData.get('detail-horaires') as string

  return addCommentToOsm(osmHours, comment)
}

export default function EditHoraires(props: Props): ReactElement {
  const { horaires } = props
  const dateService = useDateService()

  // Extraire le commentaire des horaires OSM
  const detailHoraires = horaires ? extractCommentFromOsm(horaires) : ''

  // Conversion des horaires OSM vers le format timetable
  const timetable: Schedule = horaires
    ? toTimetableOpeningHours(dateService.now())(horaires)
    : CLOSED_SCHEDULE

  // État local pour gérer l'ouverture/fermeture de chaque période
  const [openPeriods, setOpenPeriods] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    OSM_DAYS_OF_WEEK.forEach((day) => {
      initial[`${day}-am`] = timetable[day].am.isOpen
      initial[`${day}-pm`] = timetable[day].pm.isOpen
    })
    return initial
  })

  function handleToggleChange(day: string, period: PeriodKey, isOpen: boolean): void {
    setOpenPeriods((prev) => ({ ...prev, [`${day}-${period}`]: isOpen }))
  }

  function renderPeriodCard(
    day: (typeof OSM_DAYS_OF_WEEK)[number],
    period: PeriodKey,
    label: string
  ): ReactElement {
    const periodKey = `${day}-${period}`
    const isOpen = openPeriods[periodKey] ?? false
    const periodData = timetable[day][period]
    const isWeekend = day === 'Sa' || day === 'Su'

    return (
      <div key={periodKey}>
        <p
          className="fr-text--sm fr-mb-1w"
          style={{ textAlign: 'center' }}
        >
          {JOURS_SEMAINE[day]}
          {' '}
          {label}
        </p>
        <div
          className={isWeekend ? styles.periodCardClosed : styles.periodCard}
        >
          <div className={styles.timeInputs}>
            <TimeInput
              defaultValue={periodData.startTime ?? ''}
              disabled={!isOpen}
              name={`${day}-${period}-start`}
              placeholder="HH:MM"
            />
            <div className={styles.separator} />
            <TimeInput
              defaultValue={periodData.endTime ?? ''}
              disabled={!isOpen}
              name={`${day}-${period}-end`}
              placeholder="HH:MM"
            />
          </div>
          <div className={styles.toggleContainer}>
            <label
              className={styles.toggleLabel}
              htmlFor={`${day}-${period}-open`}
            >
              {isOpen ? 'Ouvert' : 'Fermé'}
            </label>
            <div className="fr-toggle">
              <input
                checked={isOpen}
                className="fr-toggle__input"
                id={`${day}-${period}-open`}
                name={`${day}-${period}-open`}
                onChange={(event): void => {
                  handleToggleChange(day, period, event.target.checked)
                }}
                type="checkbox"
              />
              <label
                className="fr-toggle__label"
                htmlFor={`${day}-${period}-open`}
              >
                {' '}
              </label>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="fr-text--sm fr-mb-2w fr-text-mention--grey">
        Horaires d&apos;ouverture du lieu
      </p>
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 fr-col-md-6">
          {OSM_DAYS_OF_WEEK.map((day) => renderPeriodCard(day, 'am', 'matin'))}
        </div>
        <div className="fr-col-12 fr-col-md-6">
          {OSM_DAYS_OF_WEEK.map((day) => renderPeriodCard(day, 'pm', 'après-midi'))}
        </div>
      </div>

      <div className="fr-mt-4w">
        <h3 className="fr-h6 fr-mb-2w">
          Détail horaires
        </h3>
        <p className="fr-text--xs fr-text-mention--grey fr-mb-2w">
          Vous pouvez enregistrer ici des informations spécifiques concernant les horaires.
        </p>
        <textarea
          className="fr-input"
          defaultValue={detailHoraires}
          name="detail-horaires"
          placeholder="Ex : Fermé les jours fériés"
          rows={3}
        />
      </div>
    </div>
  )
}

type PeriodKey = 'am' | 'pm'

type Props = Readonly<{
  horaires: string
}>

/**
 * Extrait le commentaire d'une chaîne OSM opening_hours
 * Format OSM : "Mo-Fr 09:00-18:00 \"commentaire ici\""
 */
function extractCommentFromOsm(osmString: string): string {
  const match = /"([^"]*)"\s*$/.exec(osmString)
  return match?.[1] ?? ''
}

/**
 * Ajoute un commentaire à une chaîne OSM opening_hours
 */
function addCommentToOsm(osmString: string, comment: string): string {
  if (!comment || comment.trim() === '') {
    return osmString
  }

  // Échapper les guillemets dans le commentaire
  const escapedComment = comment.replace(/"/gu, '\\"')

  return `${osmString} "${escapedComment}"`
}

/**
 * Crée un objet DaySchedule pour un jour donné à partir des données du formulaire
 */
function createDaySchedule(formData: FormData, day: (typeof OSM_DAYS_OF_WEEK)[number]): DaySchedule {
  const amOpen = formData.get(`${day}-am-open`) === 'on'
  const pmOpen = formData.get(`${day}-pm-open`) === 'on'

  const amStart = formData.get(`${day}-am-start`) as null | string
  const amEnd = formData.get(`${day}-am-end`) as null | string
  const pmStart = formData.get(`${day}-pm-start`) as null | string
  const pmEnd = formData.get(`${day}-pm-end`) as null | string

  const amStartTime = amOpen && (amStart ?? '').trim() !== '' ? amStart : null
  const amEndTime = amOpen && (amEnd ?? '').trim() !== '' ? amEnd : null
  const pmStartTime = pmOpen && (pmStart ?? '').trim() !== '' ? pmStart : null
  const pmEndTime = pmOpen && (pmEnd ?? '').trim() !== '' ? pmEnd : null

  return {
    am: {
      endTime: amEndTime as DaySchedule['am']['endTime'],
      isOpen: amOpen && amStartTime !== null && amEndTime !== null,
      startTime: amStartTime as DaySchedule['am']['startTime'],
    },
    pm: {
      endTime: pmEndTime as DaySchedule['pm']['endTime'],
      isOpen: pmOpen && pmStartTime !== null && pmEndTime !== null,
      startTime: pmStartTime as DaySchedule['pm']['startTime'],
    },
  }
}
