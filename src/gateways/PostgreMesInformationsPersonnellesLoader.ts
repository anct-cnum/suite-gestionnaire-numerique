import { PrismaClient } from '@prisma/client'

import { toTypologieRole } from './roleMapper'
import { UtilisateurEtSesRelationsRecord } from './shared/RoleMapper'
import { UtilisateurNonTrouveError } from '@/use-cases/queries/RechercherUnUtilisateur'
import { MesInformationsPersonnellesReadModel, MesInformationsPersonnellesLoader } from '@/use-cases/queries/RecupererMesInformationsPersonnelles'

export class PostgreMesInformationsPersonnellesLoader implements MesInformationsPersonnellesLoader {
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
  const mesInformationsPersonnelles = {
    email: utilisateurRecord.email,
    nom: utilisateurRecord.nom,
    prenom: utilisateurRecord.prenom,
    role: toTypologieRole(utilisateurRecord.role),
    telephone: utilisateurRecord.telephone,
  }

  let structure = {}
  if (utilisateurRecord.relationStructure && utilisateurRecord.role === 'gestionnaire_structure') {
    const adresse = [
      utilisateurRecord.relationStructure.adresse.numero_voie,
      utilisateurRecord.relationStructure.adresse.indice_repetition_voie,
      utilisateurRecord.relationStructure.adresse.type_voie,
      utilisateurRecord.relationStructure.adresse.libelle_voie + ',',
      utilisateurRecord.relationStructure.adresse.code_postal,
      utilisateurRecord.relationStructure.adresse.libelle_commune,
    ]
    structure = {
      structure: {
        adresse: adresse.join(' '),
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

  return {
    ...mesInformationsPersonnelles,
    ...structure,
  }
}
