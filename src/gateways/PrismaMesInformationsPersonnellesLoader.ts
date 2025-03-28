import { toTypologieRole, UtilisateurEtSesRelationsRecord } from './shared/RoleMapper'
import prisma from '../../prisma/prismaClient'
import { MesInformationsPersonnellesLoader, MesInformationsPersonnellesReadModel } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

export class PrismaMesInformationsPersonnellesLoader implements MesInformationsPersonnellesLoader {
  readonly #dataResource = prisma.utilisateurRecord

  async byUid(uid: string): Promise<MesInformationsPersonnellesReadModel> {
    const utilisateurRecord = await this.#dataResource.findUniqueOrThrow({
      include: {
        relationDepartement: true,
        relationGroupement: true,
        relationRegion: true,
        relationStructure: true,
      },
      where: {
        ssoId: uid,
      },
    })

    return transform(utilisateurRecord)
  }
}

function transform(utilisateurRecord: UtilisateurEtSesRelationsRecord): MesInformationsPersonnellesReadModel {
  let mesInformationsPersonnelles: MesInformationsPersonnellesReadModel = {
    emailDeContact: utilisateurRecord.emailDeContact,
    nom: utilisateurRecord.nom,
    prenom: utilisateurRecord.prenom,
    role: toTypologieRole(utilisateurRecord.role),
    telephone: utilisateurRecord.telephone,
  }

  if (utilisateurRecord.relationStructure) {
    const { adresse, codePostal, commune } = utilisateurRecord.relationStructure
    mesInformationsPersonnelles = {
      ...mesInformationsPersonnelles,
      structure: {
        adresse: `${adresse}, ${codePostal} ${commune}`,
        contact: {
          email: utilisateurRecord.relationStructure.contact.email,
          fonction: utilisateurRecord.relationStructure.contact.fonction,
          nom: utilisateurRecord.relationStructure.contact.nom,
          prenom: utilisateurRecord.relationStructure.contact.prenom,
        },
        numeroDeSiret: utilisateurRecord.relationStructure.identifiantEtablissement,
        raisonSociale: utilisateurRecord.relationStructure.nom,
        typeDeStructure: utilisateurRecord.relationStructure.type,
      },
    }
  }

  return mesInformationsPersonnelles
}
