// eslint-disable-next-line import/no-restricted-paths
import { AidantDetailsData } from '@/components/AidantDetails/AidantDetails'
import { AidantDetailsReadModel } from '@/use-cases/queries/RecupererAidantDetails'

export function presentAidantDetails(readModel: AidantDetailsReadModel, today: Date): AidantDetailsData {
  const graphiqueRempli = fillGraphiqueData(readModel.graphiqueAccompagnements, today)

  return {
    header: {
      modificationAutheur: '-',
      modificationDate: '-',
      nom: readModel.nom,
      tags: readModel.tags,
    },
    informationsPersonnelles: {
      email: readModel.email || undefined,
      nom: readModel.nom,
      prenom: readModel.prenom,
      telephone: readModel.telephone || undefined,
    },
    lieuxActivite: readModel.lieuxActivite.map(lieu => ({
      adresse: lieu.adresse,
      idCoopCarto: lieu.idCoopCarto,
      nom: lieu.nom,
      nombreAccompagnements: Number(lieu.nombreAccompagnements),
    })),
    statistiquesActivites: {
      accompagnements: {
        avecAidantsConnect: readModel.accompagnements.avecAidantsConnect,
        individuels: readModel.accompagnements.individuels,
        nombreAteliers: readModel.accompagnements.nombreAteliers,
        participationsAteliers: readModel.accompagnements.participationsAteliers,
        total: readModel.accompagnements.total,
      },
      beneficiaires: {
        anonymes: 0,
        suivis: 0,
        total: 0,
      },
      graphique: {
        backgroundColor: graphiqueRempli.labels.map(() => '#009099'),
        data: graphiqueRempli.data,
        labels: graphiqueRempli.labels,
      },
    },
    structuresEmployeuses: [{
      adresse: readModel.structureEmployeuse.adresse,
      departement: readModel.structureEmployeuse.departement || undefined,
      nom: readModel.structureEmployeuse.nom,
      referent: {
        email: readModel.structureEmployeuse.contactReferent.email,
        nom: readModel.structureEmployeuse.contactReferent.nom,
        post: readModel.structureEmployeuse.contactReferent.post,
        prenom: readModel.structureEmployeuse.contactReferent.prenom,
        telephone: readModel.structureEmployeuse.contactReferent.telephone,
      },
      region: readModel.structureEmployeuse.region || undefined,
      siret: readModel.structureEmployeuse.siret || undefined,
      type: readModel.structureEmployeuse.type,
    }],
  }
}

/**
 * Remplit les données du graphique avec des zéros pour les périodes manquantes
 */
function fillGraphiqueData(
  graphiqueData: ReadonlyArray<Readonly<{ date: string; totalAccompagnements: number }>> | undefined,
  today: Date
): { data: ReadonlyArray<number>; labels: ReadonlyArray<string> } {
  // Si pas de données du tout, générer 12 mois par défaut avec des zéros
  if (!graphiqueData || graphiqueData.length === 0) {
    return fillMensuelData([], today)
  }

  // Détecter le type de période en regardant le format de la première date
  const firstDate = graphiqueData[0].date
  const isJournalier = firstDate.length === 10 && firstDate.includes('-') && firstDate.split('-').length === 3

  if (isJournalier) {
    // Période journalière : remplir les 30 derniers jours
    return fillJournalierData(graphiqueData, today)
  }

  // Période mensuelle : remplir les 12 derniers mois
  return fillMensuelData(graphiqueData, today)
}

/**
 * Remplit les 30 derniers jours avec des zéros pour les jours manquants
 */
function fillJournalierData(
  graphiqueData: ReadonlyArray<Readonly<{ date: string; totalAccompagnements: number }>>,
  today: Date
): { data: ReadonlyArray<number>; labels: ReadonlyArray<string> } {
  const dataMap = new Map(graphiqueData.map(item => [item.date, item.totalAccompagnements]))

  const labels: Array<string> = []
  const data: Array<number> = []

  // Générer les 30 derniers jours
  for (let dayIndex = 29; dayIndex >= 0; dayIndex -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - dayIndex)
    const dateStr = date.toISOString().split('T')[0] // Format YYYY-MM-DD

    labels.push(dateStr)
    data.push(dataMap.get(dateStr) ?? 0)
  }

  return { data, labels }
}

/**
 * Remplit les 12 derniers mois avec des zéros pour les mois manquants
 */
function fillMensuelData(
  graphiqueData: ReadonlyArray<Readonly<{ date: string; totalAccompagnements: number }>>,
  today: Date
): { data: ReadonlyArray<number>; labels: ReadonlyArray<string> } {
  const dataMap = new Map(graphiqueData.map(item => [item.date, item.totalAccompagnements]))

  const labels: Array<string> = []
  const data: Array<number> = []

  // Générer les 12 derniers mois
  for (let monthIndex = 11; monthIndex >= 0; monthIndex -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - monthIndex, 1)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const dateStr = `${year}-${month}` // Format YYYY-MM

    labels.push(dateStr)
    data.push(dataMap.get(dateStr) ?? 0)
  }

  return { data, labels }
}
