import { describe, expect, it } from 'vitest'

import { questionnairePapierPresenter } from './questionnairePapierPresenter'
import { QuestionnairePapierReadModel } from '@/use-cases/mesure-impact/RecupererLeQuestionnairePapier'

describe('présentation du questionnaire papier', () => {
  it('présente le document : titre, territoire, consignes et nom du fichier', () => {
    // WHEN
    const viewModel = questionnairePapierPresenter(readModel([]))

    // THEN
    expect(viewModel).toMatchObject({
      consignes: [
        'Le questionnaire dure environ 15 minutes.',
        'Il est anonyme : n’écrivez ni votre nom, ni votre adresse.',
        'Il n’existe pas de mauvaise réponse. Répondez le plus sincèrement possible.',
        'Cochez les cases qui correspondent à votre situation.',
      ],
      fin: 'Merci pour vos réponses ! Remettez ce questionnaire à votre médiateur ou à votre médiatrice numérique.',
      nomDuFichier: 'questionnaire-papier-sicoval.pdf',
      territoire: 'Sicoval',
      titre: 'Votre avis sur vos accompagnements au numérique',
    })
  })

  it('numérote les questions et dit à qui s’adresse une question conditionnelle', () => {
    // WHEN
    const viewModel = questionnairePapierPresenter(
      readModel([
        {
          aide: 'Vous pouvez sélectionner plusieurs réponses.',
          condition: { numero: 12, reponses: ['Oui tout à fait', 'Plutôt oui'] },
          multiple: true,
          numero: 13,
          options: [
            { exclusive: false, libelle: 'Les démarches', precisez: false },
            { exclusive: true, libelle: 'Aucun', precisez: false },
            { exclusive: false, libelle: 'Autre', precisez: true },
          ],
          titre: 'Dans quels domaines en particulier ?',
          type: 'choix',
        },
      ])
    )

    // THEN
    expect(premiereQuestion(viewModel)).toStrictEqual({
      aide: 'Vous pouvez sélectionner plusieurs réponses.',
      consigne: 'Répondez seulement si vous avez répondu « Oui tout à fait » ou « Plutôt oui » à la question 12.',
      reponse: {
        cases: [
          { libelle: 'Les démarches', precisez: false },
          { libelle: 'Aucun (ne cochez alors aucune autre case)', precisez: false },
          { libelle: 'Autre, précisez :', precisez: true },
        ],
        forme: 'carre',
        type: 'cases',
      },
      titre: '13. Dans quels domaines en particulier ?',
    })
  })

  it('une question à réponse unique se coche dans des ronds, demande pourquoi et « lequel ? » si besoin', () => {
    // WHEN
    const viewModel = questionnairePapierPresenter(
      readModel([
        {
          lequel: { options: ['Tablette', 'Téléphone portable'], siReponse: 'Oui' },
          multiple: false,
          numero: 7,
          options: [
            { exclusive: false, libelle: 'Oui', precisez: false },
            { exclusive: false, libelle: 'Non', precisez: false },
          ],
          pourquoi: ['Non'],
          titre: 'Avez-vous utilisé un équipement qui vous appartient ?',
          type: 'choix',
        },
      ])
    )

    // THEN
    expect(premiereQuestion(viewModel)).toStrictEqual({
      aide: 'Cochez une seule réponse.',
      reponse: {
        cases: [
          { libelle: 'Oui', precisez: false },
          { libelle: 'Non', precisez: false },
        ],
        forme: 'rond',
        lequel: { cases: ['Tablette', 'Téléphone portable'], titre: 'Si « Oui », lequel ou lesquels ?' },
        pourquoi: 'Si vous avez répondu « Non », pourquoi ?',
        type: 'cases',
      },
      titre: '7. Avez-vous utilisé un équipement qui vous appartient ?',
    })
  })

  it('une échelle se lit de 1 à 5, avec le sens de ses extrémités', () => {
    // WHEN
    const viewModel = questionnairePapierPresenter(
      readModel([
        {
          niveaux: ['1', '2', '3', '4', '5'],
          numero: 10,
          poles: { maximum: 'Très à l’aise', minimum: 'Pas du tout à l’aise' },
          titre: 'Avant, comment vous sentiez-vous ?',
          type: 'echelle',
        },
      ])
    )

    // THEN
    expect(premiereQuestion(viewModel)).toStrictEqual({
      aide: 'Cochez un seul chiffre, de 1 (Pas du tout à l’aise) à 5 (Très à l’aise).',
      reponse: { niveaux: ['1', '2', '3', '4', '5'], type: 'echelle' },
      titre: '10. Avant, comment vous sentiez-vous ?',
    })
  })

  it('une grille se remplit seulement pour les réponses cochées à la question qui la commande', () => {
    // WHEN
    const viewModel = questionnairePapierPresenter(
      readModel([
        {
          colonnes: ['Plutôt oui', 'Plutôt non'],
          lignes: ['Tablette', 'Téléphone portable'],
          numero: 14,
          selon: 6,
          titre: 'Mieux maîtriser les équipements suivants ?',
          type: 'grille',
        },
      ])
    )

    // THEN
    expect(premiereQuestion(viewModel)).toStrictEqual({
      aide: 'Cochez une case par ligne.',
      consigne: 'Répondez seulement pour les réponses que vous avez cochées à la question 6.',
      reponse: { colonnes: ['Plutôt oui', 'Plutôt non'], lignes: ['Tablette', 'Téléphone portable'], type: 'grille' },
      titre: '14. Mieux maîtriser les équipements suivants ?',
    })
  })

  it('une grille reprend la consigne de sa définition, quand elle en a une, à la place du renvoi', () => {
    // WHEN
    const viewModel = questionnairePapierPresenter(
      readModel([
        {
          colonnes: ['Plutôt oui', 'Plutôt non'],
          consigne: 'Répondez seulement pour les équipements que vous avez utilisés pendant vos accompagnements.',
          lignes: ['Tablette', 'Téléphone portable'],
          numero: 14,
          selon: 6,
          titre: 'Mieux maîtriser les équipements suivants ?',
          type: 'grille',
        },
      ])
    )

    // THEN
    expect(premiereQuestion(viewModel)).toMatchObject({
      consigne: 'Répondez seulement pour les équipements que vous avez utilisés pendant vos accompagnements.',
    })
  })

  it('le code postal s’écrit dans cinq cases', () => {
    // WHEN
    const viewModel = questionnairePapierPresenter(
      readModel([
        {
          aide: '5 chiffres, par exemple 31670',
          numero: 26,
          titre: 'Quel est votre code postal ?',
          type: 'code-postal',
        },
      ])
    )

    // THEN
    expect(premiereQuestion(viewModel)).toStrictEqual({
      aide: '5 chiffres, par exemple 31670',
      reponse: { type: 'code-postal' },
      titre: '26. Quel est votre code postal ?',
    })
  })
})

function readModel(
  questions: QuestionnairePapierReadModel['questionnaire']['parties'][number]['questions']
): QuestionnairePapierReadModel {
  return {
    identifiantPublic: 'sicoval',
    libelleTerritoire: 'Sicoval',
    questionnaire: { parties: [{ intro: 'Introduction', questions, titre: 'Le bilan de vos accompagnements' }] },
  }
}

function premiereQuestion(viewModel: ReturnType<typeof questionnairePapierPresenter>): unknown {
  return viewModel.parties[0].questions[0]
}
