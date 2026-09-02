import { afterEach, describe, expect, it } from 'vitest'

import { PrismaRecupererLieuDetailsLoader } from './PrismaRecupererLieuDetailsLoader'
import prisma from '../../prisma/prismaClient'
import { LieuDetailsReadModel } from '@/use-cases/queries/RecupererLieuDetails'

const LIEU_ID = 991881

describe('détails d’un lieu d’inclusion (loader Prisma)', () => {
  afterEach(async () => {
    await prisma.main_lieu_inclusion.deleteMany({ where: { id: LIEU_ID } })
  })

  it('désérialise les colonnes array d’enums Postgres en vrais tableaux (#1881)', async () => {
    // GIVEN
    // $queryRaw renvoie les arrays d'enums custom en string littérale '{...}' sans cast ::text[] :
    // chaque champ enum-array est renseigné pour garantir que la fiche ne retombe pas en 404.
    await prisma.main_lieu_inclusion.create({
      data: {
        dispositif_programmes_nationaux: ['ConseillersNumeriques'],
        frais_a_charge: ['Gratuit'],
        id: LIEU_ID,
        itinerance: ['Fixe'],
        modalites_acces: ['SePresenter', 'Telephoner'],
        modalites_accompagnement: ['EnAutonomie', 'AccompagnementIndividuel'],
        nom: 'Lieu test enum arrays',
      },
    })

    // WHEN
    const readModel = await new PrismaRecupererLieuDetailsLoader().recuperer(String(LIEU_ID))

    // THEN
    expect(readModel).not.toHaveProperty('type')
    const details = readModel as LieuDetailsReadModel
    expect(details.lieuAccueilPublic.modalitesAccueil).toBe('En autonomie, Accompagnement individuel')
    expect(details.lieuAccueilPublic.modalitesAcces).toStrictEqual(['Se présenter', 'Téléphoner'])
    expect(details.lieuAccueilPublic.fraisACharge).toStrictEqual(['Gratuit'])
    expect(details.lieuAccueilPublic.itinerance).toStrictEqual(['Fixe'])
    expect(details.lieuAccueilPublic.conseillerNumeriqueLabellePhase2).toBe(true)
  })
})
