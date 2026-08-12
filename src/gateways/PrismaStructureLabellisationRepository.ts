import prisma from '../../prisma/prismaClient'
import { StructureLabellisationRepository } from '@/use-cases/commands/AttesterLabellisationStructure'

export class PrismaStructureLabellisationRepository implements StructureLabellisationRepository {
  readonly #dataResource = prisma.main_conum_labellisation

  async attester(
    attestation: Readonly<{
      dateAttestation: Date
      structureId: number
      utilisateurId: number
    }>
  ): Promise<void> {
    await this.#dataResource.create({
      data: {
        date_attestation: attestation.dateAttestation,
        structure_id: attestation.structureId,
        utilisateur_id: attestation.utilisateurId,
      },
    })
  }

  async derniereAttestation(structureId: number): Promise<Date | null> {
    const attestation = await this.#dataResource.findFirst({
      orderBy: { date_attestation: 'desc' },
      select: { date_attestation: true },
      where: { structure_id: structureId },
    })
    return attestation?.date_attestation ?? null
  }
}
