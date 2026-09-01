import { duDepartement } from './shared/grammaireDepartement'
import departements from '../../../ressources/departements.json'

export function noticeEpciMultiDepartementsPresenter(
  epci: Readonly<{ codeDepartement: null | string; nombreDepartements: number }>
): NoticeEpciMultiDepartementsViewModel | null {
  if (epci.nombreDepartements < 2 || epci.codeDepartement === null) {
    return null
  }
  const departement = departements.find((unDepartement) => unDepartement.code === epci.codeDepartement)
  if (departement === undefined) {
    return null
  }
  return {
    description:
      'Les données présentées couvrent l’ensemble de ses communes,' +
      ` y compris celles situées hors ${duDepartement(departement)}.`,
    titre: `Cette intercommunalité s’étend sur ${epci.nombreDepartements} départements.`,
  }
}

type NoticeEpciMultiDepartementsViewModel = Readonly<{
  description: string
  titre: string
}>
