import { Prisma, PrismaClient } from '@prisma/client'

import { MesInformationsPersonnellesModifiees, ModificationUtilisateurGateway } from '@/use-cases/commands/ModifierMesInformationsPersonnelles'

export class PostgreModificationUtilisateurGateway implements ModificationUtilisateurGateway {
  readonly #activeRecord: Prisma.UtilisateurRecordDelegate

  constructor(dbClient: PrismaClient) {
    this.#activeRecord = dbClient.utilisateurRecord
  }

  async update(mesInformationsPersonnellesModifiees: MesInformationsPersonnellesModifiees): Promise<boolean> {
    return this.#activeRecord.update({
      data: {
        email: mesInformationsPersonnellesModifiees.modification.email,
        nom: mesInformationsPersonnellesModifiees.modification.nom,
        prenom: mesInformationsPersonnellesModifiees.modification.prenom,
        telephone: mesInformationsPersonnellesModifiees.modification.telephone,
      },
      where: {
        ssoId: mesInformationsPersonnellesModifiees.uid,
      },
    })
      .then(() => true)
      .catch(() => false)
  }
}
