// eslint-disable-next-line import/no-restricted-paths
import { AidantDetailsData } from '@/components/AidantDetails/AidantDetails'
import { AidantDetailsReadModel } from '@/use-cases/queries/RecupererAidantDetails'

export function presentAidantDetails(readModel: AidantDetailsReadModel): AidantDetailsData {
  return {
    header: {
      modificationAutheur: '-',
      modificationDate: '-',
      nom: readModel.nom,
      prenom: readModel.prenom,
      tags: readModel.tags,
    },
    informationsPersonnelles: {
      emails: readModel.emails,
      nom: readModel.nom,
      prenom: readModel.prenom,
      telephone: readModel.telephone || undefined,
    },
    lieuxActivite: readModel.lieuxActivite.map((lieu) => ({
      adresse: lieu.adresse,
      idCoopCarto: lieu.idCoopCarto,
      nom: lieu.nom,
    })),
    structuresEmployeuses: [
      {
        adresse: readModel.structureEmployeuse.adresse,
        departement: readModel.structureEmployeuse.departement || undefined,
        nom: readModel.structureEmployeuse.nom,
        referent:
          readModel.structureEmployeuse.contactReferent.nom !== '' ||
          readModel.structureEmployeuse.contactReferent.prenom !== ''
            ? {
                email: readModel.structureEmployeuse.contactReferent.email,
                nom: readModel.structureEmployeuse.contactReferent.nom,
                post: readModel.structureEmployeuse.contactReferent.post,
                prenom: readModel.structureEmployeuse.contactReferent.prenom,
                telephone: readModel.structureEmployeuse.contactReferent.telephone,
              }
            : undefined,
        region: readModel.structureEmployeuse.region || undefined,
        siret: readModel.structureEmployeuse.siret || undefined,
        type: readModel.structureEmployeuse.type,
      },
    ],
  }
}
