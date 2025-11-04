import { Fragment, ReactElement } from 'react'

import { getComment, parseWeekOsmOpeningHours, type WeekDay, type WeekOpeningHours } from './opening-hours.presenter'

export default function TimeTable(props: TimeTableProps): null | ReactElement {
  const { daysOfWeek, osmOpeningHours } = props
  // eslint-disable-next-line no-restricted-syntax
  const weekOpeningHours: undefined | WeekOpeningHours = parseWeekOsmOpeningHours(new Date())(osmOpeningHours)
  const comment: string | undefined = getComment(osmOpeningHours)

  return weekOpeningHours === undefined ? null : (
    <>
      <table className="fr-my-2v">
        <tbody>
          {daysOfWeek.map(([dayLabel, dayIndex]) => (
            <tr key={dayLabel}>
              <td className="fr-text--sm fr-text--bold fr-pr-3w">
                {dayLabel}
              </td>
              {weekOpeningHours[dayIndex].length === 0 && (
                <>
                  <td className="fr-text--sm fr-text-mention--grey">
                    Fermé
                  </td>
                  <td className="fr-text--sm fr-px-2w">
                    /
                  </td>
                  <td className="fr-text--sm fr-text-mention--grey">
                    Fermé
                  </td>
                </>
              )}
              {weekOpeningHours[dayIndex].length === 1 && (
                <>
                  {weekOpeningHours[dayIndex][0].startAM ? (
                    <td className="fr-text--sm">
                      {weekOpeningHours[dayIndex][0].start.replace(':', 'h')}
                      {' '}
                      –
                      {' '}
                      {weekOpeningHours[dayIndex][0].end.replace(':', 'h')}
                    </td>
                  ) : (
                    <td className="fr-text--sm fr-text-mention--grey">
                      Fermé
                    </td>
                  )}
                  <td className="fr-text--sm fr-px-2w">
                    /
                  </td>
                  {weekOpeningHours[dayIndex][0].startAM ? (
                    <td className="fr-text--sm fr-text-mention--grey">
                      Fermé
                    </td>
                  ) : (
                    <td className="fr-text--sm">
                      {weekOpeningHours[dayIndex][0].start.replace(':', 'h')}
                      {' '}
                      –
                      {' '}
                      {weekOpeningHours[dayIndex][0].end.replace(':', 'h')}
                    </td>
                  )}
                </>
              )}
              {weekOpeningHours[dayIndex].length > 1 &&
                weekOpeningHours[dayIndex].map((period, index) => (
                  <Fragment key={`${period.start}-${period.end}`}>
                    {index > 0 && (
                      <td className="fr-text--sm fr-px-2w">
                        /
                      </td>
                    )}
                    <td className="fr-text--sm">
                      {period.start.replace(':', 'h')}
                      {' '}
                      –
                      {period.end.replace(':', 'h')}
                    </td>
                  </Fragment>
                ))}
            </tr>
          ))}
        </tbody>
      </table>
      {comment !== undefined && comment !== '' && (
        <p className="fr-text--xs fr-text-mention--grey">
          {comment}
        </p>
      )}
    </>
  )
}

type TimeTableProps = Readonly<{
  daysOfWeek: ReadonlyArray<readonly [string, WeekDay]>
  osmOpeningHours: string
}>
