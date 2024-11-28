import { PrismaClient } from '@prisma/client'

import { UtilisateurEtSesRelationsRecord, toTypologieRole } from './shared/RoleMapper'
import { UtilisateurNonTrouveError } from '@/use-cases/queries/RechercherUnUtilisateur'
import { MesInformationsPersonnellesReadModel, MesInformationsPersonnellesLoader } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

export class PrismaMesInformationsPersonnellesLoader implements MesInformationsPersonnellesLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async findByUid(uid: string): Promise<MesInformationsPersonnellesReadModel> {
    const utilisateurRecord = await this.#prisma.utilisateurRecord.findUnique({
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

    if (utilisateurRecord === null) {
      throw new UtilisateurNonTrouveError()
    }

    return transform(utilisateurRecord)
  }
}

function transform(utilisateurRecord: UtilisateurEtSesRelationsRecord): MesInformationsPersonnellesReadModel {
  let mesInformationsPersonnelles: MesInformationsPersonnellesReadModel = {
    emailDeContact: utilisateurRecord.email,
    nom: utilisateurRecord.nom,
    prenom: utilisateurRecord.prenom,
    role: toTypologieRole(utilisateurRecord.role),
    telephone: utilisateurRecord.telephone,
  }

  if (utilisateurRecord.relationStructure && utilisateurRecord.role === 'gestionnaire_structure') {
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
