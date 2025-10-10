import { Prisma } from '@prisma/client'

import { toTypologieRole } from './shared/RoleMapper'
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
        relationStructure: {
          include: {
            adresse: true,
          },
        },
      },
      where: {
        ssoId: uid,
      },
    })

    return transform(utilisateurRecord)
  }
}

type UtilisateurAvecStructureEtAdresse = Prisma.UtilisateurRecordGetPayload<{
  include: {
    relationDepartement: true
    relationGroupement: true
    relationRegion: true
    relationStructure: {
      include: {
        adresse: true
      }
    }
  }
}>

function transform(utilisateurRecord: UtilisateurAvecStructureEtAdresse): MesInformationsPersonnellesReadModel {
  let mesInformationsPersonnelles: MesInformationsPersonnellesReadModel = {
    emailDeContact: utilisateurRecord.emailDeContact,
    nom: utilisateurRecord.nom,
    prenom: utilisateurRecord.prenom,
    role: toTypologieRole(utilisateurRecord.role),
    telephone: utilisateurRecord.telephone,
  }

  if (utilisateurRecord.relationStructure) {
    const structure = utilisateurRecord.relationStructure

    // Construire l'adresse depuis la relation adresse uniquement
    const adresseComplete = structure.adresse
      ? `${structure.adresse.nom_voie ?? ''} ${structure.adresse.code_postal ?? ''} ${structure.adresse.nom_commune ?? ''}`.trim()
      : ''

    // Lire le contact JSON au format:
    // { nom, prenom, courriels: { mail_gestionnaire } }
    const contact = structure.contact as {
      courriels?: {
        mail_gestionnaire?: string
      }
      nom?: string
      prenom?: string
    } | null

    const email = contact?.courriels?.mail_gestionnaire ?? ''

    mesInformationsPersonnelles = {
      ...mesInformationsPersonnelles,
      structure: {
        adresse: adresseComplete,
        contact: {
          email,
          fonction: '',
          nom: contact?.nom ?? '',
          prenom: contact?.prenom ?? '',
        },
        numeroDeSiret: structure.siret ?? '',
        raisonSociale: structure.nom,
        typeDeStructure: structure.typologies?.[0] ?? '',
      },
    }
  }

  return mesInformationsPersonnelles
}
