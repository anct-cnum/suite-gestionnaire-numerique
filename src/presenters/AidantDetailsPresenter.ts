// eslint-disable-next-line import/no-restricted-paths
import { AidantDetailsData } from '@/components/AidantDetails/AidantDetails'
import { AidantDetailsReadModel } from '@/use-cases/queries/RecupererAidantDetails'

export function presentAidantDetails(readModel: AidantDetailsReadModel): AidantDetailsData {
  return {
    header: {
      modificationAuther: '-',
      modificationDate: '-',
      nom: readModel.nom,
      prenom: readModel.prenom,
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
        total: readModel.accompagnements.total,
      },
      beneficiaires: {
        anonymes: 0,
        suivis: 0,
        total: 0,
      },
      graphique: {
        backgroundColor: readModel.graphiqueAccompagnements.map(() => '#009099'),
        data: readModel.graphiqueAccompagnements.map(item => item.totalAccompagnements),
        labels: readModel.graphiqueAccompagnements.map(item => item.date),
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
