import { describe, expect, it } from 'vitest'

import { pointsVigilanceLieuxPresenter } from './pointsVigilanceLieuxPresenter'

describe('points de vigilance des lieux : presenter', () => {
  it('affiche les deux lignes avec compteur, pastille, texte et lien filtré', () => {
    // WHEN
    const viewModel = pointsVigilanceLieuxPresenter({ nbLieuxAActualiser: 120, nbLieuxAVerifier: 34 })

    // THEN
    expect(viewModel.lignes).toStrictEqual([
      {
        compteur: '120 lieux',
        pastille: '🔴',
        texte: 'à actualiser (informations de plus de 18 mois)',
        url: '/liste-lieux-inclusion?fraicheur=a-actualiser',
      },
      {
        compteur: '34 lieux',
        pastille: '🟠',
        texte: 'à vérifier (informations de 12 à 18 mois)',
        url: '/liste-lieux-inclusion?fraicheur=a-verifier',
      },
    ])
  })

  it('accorde le mot lieu au singulier quand le compteur vaut 1', () => {
    // WHEN
    const viewModel = pointsVigilanceLieuxPresenter({ nbLieuxAActualiser: 1, nbLieuxAVerifier: 0 })

    // THEN
    expect(viewModel.lignes[0].compteur).toBe('1 lieu')
  })

  it('masque une ligne dont le compteur est nul', () => {
    // WHEN
    const viewModel = pointsVigilanceLieuxPresenter({ nbLieuxAActualiser: 0, nbLieuxAVerifier: 5 })

    // THEN
    expect(viewModel.lignes).toHaveLength(1)
    expect(viewModel.lignes[0].texte).toBe('à vérifier (informations de 12 à 18 mois)')
  })

  it('ne retourne aucune ligne quand les deux compteurs sont nuls', () => {
    // WHEN
    const viewModel = pointsVigilanceLieuxPresenter({ nbLieuxAActualiser: 0, nbLieuxAVerifier: 0 })

    // THEN
    expect(viewModel.lignes).toHaveLength(0)
  })

  it('transmet le code département dans les liens quand il est fourni', () => {
    // WHEN
    const viewModel = pointsVigilanceLieuxPresenter({ nbLieuxAActualiser: 2, nbLieuxAVerifier: 3 }, '69')

    // THEN
    expect(viewModel.lignes[0].url).toBe('/liste-lieux-inclusion?fraicheur=a-actualiser&codeDepartement=69')
    expect(viewModel.lignes[1].url).toBe('/liste-lieux-inclusion?fraicheur=a-verifier&codeDepartement=69')
  })
})
