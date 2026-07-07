import { describe, expect, it } from 'vitest'

import { lieuDetailsPresenter } from './LieuDetailsPresenter'
import { LieuDetailsReadModel } from '@/use-cases/queries/RecupererLieuDetails'

describe('lieu details presenter', () => {
  const now = new Date('2025-01-01')

  it.each([
    {
      couleurAttendue: 'blue',
      intention: 'moins de 6 mois : à jour',
      libelleAttendu: 'À jour',
      miseAJourLe: new Date('2024-11-23'),
    },
    {
      couleurAttendue: 'yellow',
      intention: 'entre 6 et 12 mois : à surveiller',
      libelleAttendu: 'À surveiller',
      miseAJourLe: new Date('2024-04-01'),
    },
    {
      couleurAttendue: 'orange',
      intention: 'entre 12 et 18 mois : à vérifier',
      libelleAttendu: 'À vérifier',
      miseAJourLe: new Date('2023-10-01'),
    },
    {
      couleurAttendue: 'red',
      intention: 'plus de 18 mois : à actualiser',
      libelleAttendu: 'À actualiser',
      miseAJourLe: new Date('2023-01-01'),
    },
  ])('$intention', ({ couleurAttendue, libelleAttendu, miseAJourLe }) => {
    // GIVEN
    const readModel = createReadModel({ miseAJourLe })

    // WHEN
    const viewModel = lieuDetailsPresenter(readModel, false, now)

    // THEN
    expect(viewModel.header.fraicheur?.couleur).toBe(couleurAttendue)
    expect(viewModel.header.fraicheur?.libelle).toBe(libelleAttendu)
  })

  it('devrait afficher la date formatée et le nom de l\u2019application source', () => {
    // GIVEN
    const readModel = createReadModel({ editeur: 'coop', miseAJourLe: new Date('2024-11-23') })

    // WHEN
    const viewModel = lieuDetailsPresenter(readModel, false, now)

    // THEN
    expect(viewModel.header.fraicheur?.date).toBe('23/11/2024')
    expect(viewModel.header.fraicheur?.source).toBe('la Coop')
  })

  it.each([
    { editeur: 'carto', intention: 'carto', sourceAttendue: 'la Cartographie nationale' },
    { editeur: 'sonum', intention: 'sonum', sourceAttendue: 'Mon Inclusion Numérique' },
    { editeur: 'app_python', intention: 'éditeur technique inconnu', sourceAttendue: '-' },
    { editeur: undefined, intention: 'éditeur absent', sourceAttendue: '-' },
  ])('source affichée pour $intention', ({ editeur, sourceAttendue }) => {
    // GIVEN
    const readModel = createReadModel({ editeur, miseAJourLe: new Date('2024-11-23') })

    // WHEN
    const viewModel = lieuDetailsPresenter(readModel, false, now)

    // THEN
    expect(viewModel.header.fraicheur?.source).toBe(sourceAttendue)
  })

  it('devrait omettre la fraîcheur quand la date de mise à jour est inconnue', () => {
    // GIVEN
    const readModel = createReadModel({})

    // WHEN
    const viewModel = lieuDetailsPresenter(readModel, false, now)

    // THEN
    expect(viewModel.header.fraicheur).toBeUndefined()
  })
})

function createReadModel(header: Partial<LieuDetailsReadModel['header']>): LieuDetailsReadModel {
  return {
    header: {
      nom: 'Association Connect 69',
      tags: ['FRR'],
      ...header,
    },
    informationsGenerales: {
      adresse: '123 Rue de la République, 75001 Paris',
      nomStructure: 'Association Connect 69',
    },
    lieuAccueilPublic: {},
    personnesTravaillant: [],
    servicesInclusionNumerique: [],
    structureId: 1,
  }
}
