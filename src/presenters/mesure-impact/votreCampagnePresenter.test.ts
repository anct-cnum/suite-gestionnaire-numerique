import { describe, expect, it } from 'vitest'

import { votreCampagnePresenter } from './votreCampagnePresenter'
import { VotreCampagneReadModel } from '@/use-cases/mesure-impact/RecupererVotreCampagne'

describe('votre campagne de mesure d’impact', () => {
  it('présente les détails de la campagne, le suivi des réponses et la diffusion', () => {
    // WHEN
    const viewModel = votreCampagnePresenter(readModel, DIFFUSION)

    // THEN
    expect(viewModel).toStrictEqual({
      adresseDuQuestionnaire: 'https://inclusion-numerique.anct.gouv.fr/questionnaire/sicoval',
      details: [
        { libelle: 'Territoire', valeur: 'Sicoval' },
        { libelle: 'Date de début de collecte', valeur: '16 novembre 2026' },
        { libelle: 'Dernière réponse', valeur: '11 décembre 2026' },
        // Séparateur des milliers : espace fine insécable
        { libelle: 'Réponses reçues', valeur: '1 148 réponses' },
        { libelle: 'Questionnaire', valeur: '26 questions' },
      ],
      lienResultats: '/mesure-impact/sicoval/resultats',
      lienSaisie: '/mesure-impact/sicoval/saisie',
      nom: 'Pilote Sicoval 2026',
      nomDuFichierQrCode: 'questionnaire-sicoval.png',
      ouverte: true,
      qrCode: 'data:image/png;base64,AAAA',
      titreFilAriane: 'Sicoval',
    })
  })

  it.each([
    { derniere: null, derniereAffichee: 'Aucune réponse pour l’instant', nombre: 0, nombreAffiche: 'Aucune réponse' },
    {
      derniere: new Date('2026-11-16T23:30:00.000Z'),
      derniereAffichee: '17 novembre 2026',
      nombre: 1,
      nombreAffiche: '1 réponse',
    },
  ])(
    'avec $nombre réponse(s), le suivi l’indique ; les dates sont celles de Paris',
    ({ derniere, derniereAffichee, nombre, nombreAffiche }) => {
      // WHEN
      const { details } = votreCampagnePresenter(
        { ...readModel, derniereReponse: derniere, nombreDeReponses: nombre },
        DIFFUSION
      )

      // THEN
      expect(details[2]).toStrictEqual({ libelle: 'Dernière réponse', valeur: derniereAffichee })
      expect(details[3]).toStrictEqual({ libelle: 'Réponses reçues', valeur: nombreAffiche })
    }
  )
})

const DIFFUSION = {
  adresseDuQuestionnaire: 'https://inclusion-numerique.anct.gouv.fr/questionnaire/sicoval',
  qrCode: 'data:image/png;base64,AAAA',
}

const readModel: VotreCampagneReadModel = {
  derniereReponse: new Date('2026-12-11T10:00:00.000Z'),
  identifiantPublic: 'sicoval',
  libelleTerritoire: 'Sicoval',
  nom: 'Pilote Sicoval 2026',
  nombreDeQuestions: 26,
  nombreDeReponses: 1148,
  ouverte: true,
  ouverture: new Date('2026-11-16T09:00:00.000Z'),
  questionnaireVersion: 'socle-v22',
}
