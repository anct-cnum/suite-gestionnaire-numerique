import prisma from '../../prisma/prismaClient'
import { ContactReferentFne, ContactReferentFneLoader } from '@/use-cases/commands/InviterContactsReferentsFne'

export class PrismaContactReferentFneLoader implements ContactReferentFneLoader {
  async getContactsReferentFne(structureId: number): Promise<ReadonlyArray<ContactReferentFne>> {
    const contactStructures = await prisma.contact_structure.findMany({
      include: {
        contact: true,
      },
      where: {
        contact: {
          est_referent_fne: true,
        },
        structure_id: structureId,
      },
    })

    return contactStructures.map((cs) => ({
      email: cs.contact.email,
      nom: cs.contact.nom,
      prenom: cs.contact.prenom,
      telephone: cs.contact.telephone,
    }))
  }
}
