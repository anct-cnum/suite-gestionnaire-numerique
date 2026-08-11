import prisma from '../../prisma/prismaClient'

export class PrismaDocumentFeuilleDeRouteLoader {
  readonly #dataResource = prisma.feuilleDeRouteDocumentRecord

  async recupererNom(chemin: string): Promise<string | undefined> {
    const document = await this.#dataResource.findUnique({
      select: { nom: true },
      where: { chemin },
    })
    return document?.nom
  }
}
