import prisma from '../../prisma/prismaClient'

export class PrismaAidantRepository {
  async modifierInformationsPersonnelles(
    aidantId: number,
    data: ModifierInformationsPersonnellesData,
    date: Date
  ): Promise<void> {
    const personne = await prisma.personne.findUniqueOrThrow({
      select: { contact: true },
      where: { id: aidantId },
    })

    const contactExistant = (personne.contact as null | Record<string, unknown>) ?? {}
    const coopExistant = (contactExistant.coop as null | Record<string, unknown>) ?? {}
    const idposteExistant = (contactExistant.idposte as null | Record<string, unknown>) ?? {}

    const contact = {
      ...contactExistant,
      coop: {
        ...coopExistant,
        email: data.emails[0] ?? '',
        telephone: data.telephone,
      },
      idposte: {
        ...idposteExistant,
        mail_perso: data.emails[2] ?? '',
        mail_pro: data.emails[1] ?? '',
      },
    }

    await prisma.personne.update({
      data: {
        contact,
        edited_by: 'min',
        nom: data.nom,
        prenom: data.prenom,
        updated_at: date,
      },
      where: { id: aidantId },
    })
  }
}

type ModifierInformationsPersonnellesData = Readonly<{
  emails: ReadonlyArray<string>
  nom: string
  prenom: string
  telephone: string
}>
