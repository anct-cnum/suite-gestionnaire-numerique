import { duDepartement } from './shared/grammaireDepartement'
import departements from '../../../ressources/departements.json'

export function noticeGouvernanceDepartementalePresenter(
  epci: Readonly<{ codeDepartement: string; nom: string }>
): NoticeGouvernanceDepartementaleViewModel | null {
  const departement = departements.find((unDepartement) => unDepartement.code === epci.codeDepartement)
  if (departement === undefined) {
    return null
  }
  return {
    description:
      'Il n’existe pas de gouvernance propre à une intercommunalité. Cette page présente la place' +
      ` ${deLIntercommunalite(epci.nom)} au sein de la gouvernance ${duDepartement(departement)}.`,
    titre: 'La gouvernance est pilotée à l’échelle départementale',
  }
}

type NoticeGouvernanceDepartementaleViewModel = Readonly<{
  description: string
  titre: string
}>

// Article devant un nom d’intercommunalité : « de la CC Saône-Beaujolais », « de l’Eurométropole de Strasbourg »,
// « d’Est Ensemble », « de Bordeaux Métropole ».
function deLIntercommunalite(nom: string): string {
  if (/^(?:CA|CC|CU|Métropole)(?:\s|$)/u.test(nom)) {
    return `de la ${nom}`
  }
  if (nom.startsWith('Eurométropole')) {
    return `de l’${nom}`
  }
  if (/^[AEÉIOUY]/u.test(nom)) {
    return `d’${nom}`
  }
  return `de ${nom}`
}
