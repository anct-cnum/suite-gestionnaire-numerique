import { CoFinancement, CoFinancementFailure } from '@/domain/CoFinancement'

export function creationDesCoFinancements(
  coFinancementsCommand: Array<CoFinancementCommand>,
  uidAction: string
): Array<CoFinancement> | CoFinancementFailure {
  const coFinancements: Array<CoFinancement> = []

  if (coFinancementsCommand.length > 0) {
    for (const financement of coFinancementsCommand) {
      const coFinancement = CoFinancement.create({
        montant: Number(financement.montant),
        uid: {
          value: 'identifiantCoFinancementPourLaCreation',
        },
        uidAction: {
          value: uidAction,
        },
        uidMembre: financement.membreId,
      })

      if (!(coFinancement instanceof CoFinancement)) {
        return coFinancement
      }

      coFinancements.push(coFinancement)
    }
  }
  return coFinancements
}

export type CoFinancementCommand = Readonly<{
  membreId: string
  montant: number
}>
  