import { Prisma } from '@prisma/client'

import { toTypologieRole } from './shared/RoleMapper'
import prisma from '../../prisma/prismaClient'
import {
  MesInformationsPersonnellesLoader,
  MesInformationsPersonnellesReadModel,
} from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

export class PrismaMesInformationsPersonnellesLoader implements MesInformationsPersonnellesLoader {
  readonly #dataResource = prisma.utilisateurRecord

  async byUid(uid: string): Promise<MesInformationsPersonnellesReadModel> {
    const utilisateurRecord = await this.#dataResource.findUniqueOrThrow({
      include: {
        relationDepartement: true,
        relationGroupement: true,
        relationRegion: true,
        relationStructureAdministrative: {
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
    relationStructureAdministrative: {
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

  if (utilisateurRecord.relationStructureAdministrative) {
    const structure = utilisateurRecord.relationStructureAdministrative

    // Construire l'adresse depuis la relation adresse uniquement
    const adresseComplete = structure.adresse
      ? `${structure.adresse.nom_voie ?? ''} ${structure.adresse.code_postal} ${structure.adresse.nom_commune}`.trim()
      : ''

    // Lire le contact JSON au format:
    // { nom, prenom, email, fonction, telephone, adresse, codePostal, commune }
    const contact = structure.contact as {
      adresse?: string
      codePostal?: string
      commune?: string
      email?: string
      fonction?: string
      nom?: string
      prenom?: string
      telephone?: string
    } | null

    const email = contact?.email ?? ''

    mesInformationsPersonnelles = {
      ...mesInformationsPersonnelles,
      structure: {
        adresse: adresseComplete,
        contact: {
          email,
          fonction: contact?.fonction ?? '',
          nom: contact?.nom ?? '',
          prenom: contact?.prenom ?? '',
        },
        numeroDeSiret: structure.siret ?? '',
        raisonSociale: structure.denomination_sirene ?? '',
        // Refonte 2026 : typologies vit sur main.lieu_inclusion, plus sur SA.
        // L'utilisateur etant rattache a une SA (entite legale), on n'a plus
        // de typologie directe ici. A reconstruire via les lieux affectes si besoin.
        typeDeStructure: '',
      },
    }
  }

  return mesInformationsPersonnelles
}
