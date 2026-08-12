import prisma from '../../prisma/prismaClient'
import { StructureLabelLoader, StructureLabelReadModel } from '@/use-cases/queries/RecupererStructureLabel'

export class PrismaStructureLabelLoader implements StructureLabelLoader {
  readonly #dataResource = prisma.main_structure_administrative

  async get(structureId: number): Promise<StructureLabelReadModel> {
    const structureRecord = await this.#dataResource.findUniqueOrThrow({
      include: {
        adresse: true,
        categories_juridiques: {
          select: {
            nom: true,
          },
        },
        contact_structures: {
          include: {
            contact: true,
          },
          orderBy: [
            { contact: { est_referent_fne: 'desc' } },
            { contact: { nom: 'asc' } },
            { contact: { prenom: 'asc' } },
          ],
        },
      },
      where: {
        id: structureId,
      },
    })

    // Département et région : jointures hors périmètre Prisma (schéma admin), donc SQL brut.
    const departementRegionResult = await prisma.$queryRaw<
      Array<{
        departement_nom: null | string
        region_nom: null | string
      }>
    >`
      SELECT
        admin.departement.nom as departement_nom,
        admin.region.nom as region_nom
      FROM main.structure_administrative
      LEFT JOIN main.adresse ON main.adresse.id = main.structure_administrative.adresse_id
      LEFT JOIN admin.departement ON admin.departement.code = main.adresse.departement
      LEFT JOIN admin.region ON admin.region.id = admin.departement.region_id
      WHERE main.structure_administrative.id = ${structureId}
    `

    const derniereAttestation = await prisma.main_conum_labellisation.findFirst({
      orderBy: { date_attestation: 'desc' },
      select: { date_attestation: true },
      where: { structure_id: structureId },
    })

    return {
      contacts: structureRecord.contact_structures.map((contactStructure) => ({
        email: contactStructure.contact.email,
        estReferentFNE: contactStructure.contact.est_referent_fne,
        fonction: contactStructure.contact.fonction,
        id: contactStructure.contact.id,
        nom: contactStructure.contact.nom,
        prenom: contactStructure.contact.prenom,
        telephone: contactStructure.contact.telephone,
      })),
      derniereAttestation: derniereAttestation?.date_attestation ?? null,
      identite: {
        adresse: this.#formatAdresse(structureRecord.adresse),
        departement: departementRegionResult[0]?.departement_nom ?? '',
        nom: structureRecord.denomination_antenne ?? structureRecord.denomination_sirene ?? '',
        region: departementRegionResult[0]?.region_nom ?? '',
        siret: structureRecord.siret ?? '',
        typologie: structureRecord.categories_juridiques?.nom ?? '',
      },
      structureId,
    }
  }

  #formatAdresse(
    adresse: {
      code_postal: string
      nom_commune: string
      nom_voie: null | string
      numero_voie: null | number
      repetition: null | string
    } | null
  ): string {
    if (adresse === null) {
      return ''
    }

    const parts: Array<string> = []
    if (adresse.numero_voie !== null && adresse.numero_voie !== 0) {
      parts.push(String(adresse.numero_voie))
    }
    if (adresse.repetition !== null && adresse.repetition !== '') {
      parts.push(adresse.repetition)
    }
    if (adresse.nom_voie !== null && adresse.nom_voie !== '') {
      parts.push(adresse.nom_voie)
    }

    const rue = parts.join(' ')
    return `${rue}, ${adresse.code_postal} ${adresse.nom_commune}`.trim()
  }
}
