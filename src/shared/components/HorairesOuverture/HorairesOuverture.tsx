import { ReactElement } from 'react'

import styles from './HorairesOuverture.module.css'

export default function HorairesOuverture(props: Props): ReactElement {
  const { horaires } = props

  function parseHoraires(
    horaireString: string | undefined
  ): { comment: null | string; schedule: Array<{ heures: string; jour: string }> } {
    if (horaireString === undefined || horaireString === '') {
      return { comment: null, schedule: getEmptyWeekSchedule() }
    }

    return parseOsmOpeningHours(horaireString)
  }

  function getEmptyWeekSchedule(): Array<{ heures: string; jour: string }> {
    return [
      { heures: 'Non renseigné', jour: 'Lun.' },
      { heures: 'Non renseigné', jour: 'Mar.' },
      { heures: 'Non renseigné', jour: 'Mer.' },
      { heures: 'Non renseigné', jour: 'Jeu.' },
      { heures: 'Non renseigné', jour: 'Ven.' },
      { heures: 'Non renseigné', jour: 'Sam.' },
      { heures: 'Non renseigné', jour: 'Dim.' },
    ]
  }

  function parseOsmOpeningHours(
    horaireString: string
  ): { comment: null | string; schedule: Array<{ heures: string; jour: string }> } {
    const dayMapping = {
      Fr: 'Ven.',
      Mo: 'Lun.',
      Sa: 'Sam.',
      Su: 'Dim.',
      Th: 'Jeu.',
      Tu: 'Mar.',
      We: 'Mer.',
    } as const

    const daysOrder = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

    // Extraire les commentaires (avec ou sans guillemets)
    let comment: null | string = null
    let cleanedHoraireString = horaireString

    // D'abord chercher les commentaires entre guillemets
    const quotedCommentMatch = /"([^"]+)"/.exec(horaireString)
    if (quotedCommentMatch) {
      comment = quotedCommentMatch[1]
      cleanedHoraireString = horaireString.replace(/"[^"]+"/g, '').trim()
    } else {
      // Chercher les commentaires après les heures (texte libre à la fin)
      const segments = horaireString.split(';').map(segment => segment.trim()).filter(segment => segment !== '')
      const lastSegment = segments[segments.length - 1]

      // Détecter si c'est un commentaire : ne commence pas par un jour ET n'a pas le format standard "Jour HH:MM-HH:MM"
      const startsWithDay = /^(Mo|Tu|We|Th|Fr|Sa|Su|PH|SH)/i.test(lastSegment)
      const hasStandardScheduleFormat = /^(Mo|Tu|We|Th|Fr|Sa|Su|PH|SH).+\d{1,2}:\d{2}-\d{1,2}:\d{2}/i.test(lastSegment)

      if (lastSegment && !startsWithDay && !hasStandardScheduleFormat) {
        comment = lastSegment
        // Reconstruire la chaîne sans le commentaire
        const validSegments = segments.slice(0, -1)
        cleanedHoraireString = validSegments.join(';').trim()
      }
    }

    // Cas spéciaux
    if (cleanedHoraireString === '24/7') {
      return {
        comment,
        schedule: daysOrder.map(day => ({
          heures: '24h/24',
          jour: dayMapping[day as keyof typeof dayMapping],
        })),
      }
    }

    const scheduleMap = parseOsmSegments(cleanedHoraireString, daysOrder)
    return {
      comment,
      schedule: buildWeekSchedule(scheduleMap, daysOrder, dayMapping),
    }
  }

  function parseOsmSegments(horaireString: string, daysOrder: Array<string>): Map<string, string> {
    const scheduleMap = new Map<string, string>()
    const segments = horaireString.split(';').map(segment => segment.trim())

    for (const segment of segments) {
      if (segment !== '') {
        const spaceIndex = segment.indexOf(' ')
        if (spaceIndex > 0) {
          const daysPart = segment.slice(0, spaceIndex)
          const timesPart = segment.slice(spaceIndex + 1)
          const expandedDays = expandDaysPattern(daysPart, daysOrder)

          for (const dayKey of expandedDays) {
            const formattedTime = timesPart.includes('off') ? 'Fermé' : timesPart.replace(/,\s*/g, ' / ')
            scheduleMap.set(dayKey, formattedTime)
          }
        }
      }
    }

    return scheduleMap
  }

  function buildWeekSchedule(
    scheduleMap: Map<string, string>,
    daysOrder: Array<string>,
    dayMapping: Record<string, string>
  ): Array<{ heures: string; jour: string }> {
    const result: Array<{ heures: string; jour: string }> = []
    for (const day of daysOrder) {
      const frenchDay = dayMapping[day] ?? day
      const heures = scheduleMap.get(day) ?? 'Fermé'
      result.push({
        heures,
        jour: frenchDay,
      })
    }

    return result
  }

  function expandDaysPattern(daysPattern: string, dayOrder: Array<string>): Array<string> {
    const days: Array<string> = []
    const dayParts = daysPattern.split(',').map(part => part.trim())

    for (const part of dayParts) {
      if (part.includes('-')) {
        const [startDay, endDay] = part.split('-').map(dayValue => dayValue.trim())
        const startIndex = dayOrder.indexOf(startDay)
        const endIndex = dayOrder.indexOf(endDay)

        if (startIndex !== -1 && endIndex !== -1) {
          for (let index = startIndex; index <= endIndex; index += 1) {
            days.push(dayOrder[index])
          }
        }
      } else if (dayOrder.includes(part)) {
        days.push(part)
      }
    }

    return days
  }

  const { comment, schedule: horairesList } = parseHoraires(horaires)
  return (
    <div>
      <p className="fr-text--sm fr-mb-2w fr-text-mention--grey">
        Horaires d&apos;ouverture du lieu
      </p>
      {horairesList.length > 0 ? (
        <>
          <div className={styles.horairesTable}>
            <table>
              <tbody>
                {horairesList.map((horaire) => (
                  <tr key={`${horaire.jour}-${horaire.heures}`}>
                    <td className="fr-text--sm fr-text--bold">
                      {horaire.jour}
                    </td>
                    <td className="fr-text--sm">
                      {horaire.heures}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {comment !== null && comment !== '' ? (
            <p className="fr-text--xs fr-text-mention--grey fr-mt-1w">
              {comment}
            </p>
          ) : null}
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
