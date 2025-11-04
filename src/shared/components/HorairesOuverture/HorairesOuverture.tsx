import { ReactElement } from 'react'

import { WeekDay } from './opening-hours.presenter'
import OpeningState from './OpeningState'
import TimeTable from './TimeTable'

const JOURS_SEMAINE: Array<[string, WeekDay]> = [
  ['Lun.', WeekDay.Monday],
  ['Mar.', WeekDay.Tuesday],
  ['Mer.', WeekDay.Wednesday],
  ['Jeu.', WeekDay.Thursday],
  ['Ven.', WeekDay.Friday],
  ['Sam.', WeekDay.Saturday],
  ['Dim.', WeekDay.Sunday],
]

export default function HorairesOuverture(props: Props): ReactElement {
  const { horaires } = props

  const detailHoraires = horaires === undefined ? '' : extractCommentFromOsm(horaires)

  return (
    <div>
      <p className="fr-text--sm fr-mb-2w fr-text-mention--grey">
        Horaires d&apos;ouverture du lieu
      </p>

      {horaires !== undefined && horaires !== '' ? (
        <>
          <OpeningState osmOpeningHours={horaires} />
          <TimeTable
            daysOfWeek={JOURS_SEMAINE}
            osmOpeningHours={horaires}
          />
          {detailHoraires !== '' && (
            <div className="fr-mt-3w">
              <h3 className="fr-h6 fr-mb-1w">
                Détail horaires
              </h3>
              <p className="fr-text--sm">
                {detailHoraires}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="fr-text--sm">
          Horaires non renseignés
        </p>
      )}
    </div>
  )
}

type Props = Readonly<{
  horaires: string | undefined
}>

/**
 * Extrait le commentaire d'une chaîne OSM opening_hours
 * Format OSM : "Mo-Fr 09:00-18:00 \"commentaire ici\""
 */
function extractCommentFromOsm(osmString: string): string {
  const regex = /"([^"]*)"\s*$/
  const match = regex.exec(osmString)
  return match?.[1] ?? ''
}
