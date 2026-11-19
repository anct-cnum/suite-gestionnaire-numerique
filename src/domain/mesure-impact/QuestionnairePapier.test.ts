import { describe, expect, it } from 'vitest'

import { Questionnaire } from './Questionnaire'
import { QuestionPapier, versionPapier } from './QuestionnairePapier'
import { questionnaireDeVersion } from './questionnaires'

describe('version papier du questionnaire (socle v22)', () => {
  const papier = versionPapier(questionnaireDeVersion('socle-v22') as Questionnaire)
  const questions = papier.parties.flatMap((partie) => partie.questions)

  it('reprend les parties dans l’ordre, et toutes les questions numérotées de 1 à 26', () => {
    // THEN
    expect(papier.parties.map(({ intro, titre }) => ({ intro, titre }))).toStrictEqual([
      {
        intro: 'Tout d’abord, nous nous intéressons au contexte de vos accompagnements à l’utilisation du numérique.',
        titre: 'Le contexte de vos accompagnements',
      },
      {
        intro: 'Nous allons maintenant nous intéresser au bilan de vos accompagnements à l’utilisation du numérique.',
        titre: 'Le bilan de vos accompagnements',
      },
      { intro: 'Et pour terminer, simplement quelques informations à propos de vous.', titre: 'À propos de vous' },
    ])
    expect(questions.map((question) => question.numero)).toStrictEqual(
      Array.from({ length: 26 }, (_, index) => index + 1)
    )
  })

  it('une question conditionnelle dit à qui elle s’adresse, par le numéro et les réponses de la question qui la commande', () => {
    // THEN
    expect(question(13)).toMatchObject({
      aide: 'Vous pouvez sélectionner plusieurs réponses.',
      condition: { numero: 12, reponses: ['Oui tout à fait', 'Plutôt oui'] },
      multiple: true,
      titre: 'Dans quels domaines en particulier ?',
      type: 'choix',
    })
    expect(question(12)).not.toHaveProperty('condition')
  })

  it('propose toutes les options, même celles qu’une réponse écarterait en ligne', () => {
    // THEN
    expect(question(8)).toMatchObject({
      options: expect.arrayContaining([
        {
          exclusive: false,
          libelle: 'L’utilisation de logiciels sur ordinateur (traitement de texte, tableur, messagerie, etc.)',
          precisez: false,
        },
      ]) as unknown,
    })
  })

  it('laisse de la place pour préciser « Autre », et signale une option qui exclut les autres', () => {
    // THEN
    expect(question(5)).toMatchObject({
      options: expect.arrayContaining([
        { exclusive: true, libelle: 'Aucun', precisez: false },
        { exclusive: false, libelle: 'Autre', precisez: true },
        { exclusive: false, libelle: 'Tablette', precisez: false },
      ]) as unknown,
    })
  })

  it('demande pourquoi après les réponses négatives qui l’appellent', () => {
    // THEN
    expect(question(9)).toMatchObject({ multiple: false, pourquoi: ['Plutôt non', 'Non pas du tout'], type: 'choix' })
    expect(question(1)).not.toHaveProperty('pourquoi')
  })

  it('« Si Oui, lequel ? » propose tous les équipements', () => {
    // THEN
    expect(question(7)).toMatchObject({
      lequel: {
        options: [
          'Ordinateur fixe',
          'Ordinateur portable',
          'Tablette',
          'Téléphone portable',
          'Imprimante papier',
          'Imprimante 3D',
          'Console de jeux vidéo',
        ],
        siReponse: 'Oui',
      },
    })
  })

  it('une échelle va de 1 à 5, avec le sens de ses extrémités', () => {
    // THEN
    expect(question(10)).toMatchObject({
      niveaux: ['1', '2', '3', '4', '5'],
      poles: { maximum: 'Très à l’aise', minimum: 'Pas du tout à l’aise' },
      type: 'echelle',
    })
  })

  it('une grille propose tous ses équipements en lignes, à remplir selon les réponses à une autre question', () => {
    // THEN
    expect(question(14)).toMatchObject({
      colonnes: ['Plutôt oui', 'Plutôt non'],
      lignes: [
        'Ordinateur portable',
        'Tablette',
        'Téléphone portable',
        'Ordinateur fixe',
        'Imprimante papier',
        'Imprimante 3D',
        'Console de jeux vidéo',
      ],
      selon: 6,
      type: 'grille',
    })
  })

  it('une grille dit en clair quelles lignes remplir, quand sa définition le précise, plutôt que de renvoyer à une autre question', () => {
    // THEN
    expect(question(14)).toMatchObject({
      consigne: 'Répondez seulement pour les équipements que vous avez utilisés pendant vos accompagnements.',
    })
  })

  it('le code postal est à écrire', () => {
    // THEN
    expect(question(26)).toStrictEqual({
      aide: '5 chiffres, par exemple 31670',
      numero: 26,
      titre: 'Quel est votre code postal ?',
      type: 'code-postal',
    })
  })

  function question(numero: number): QuestionPapier {
    return questions[numero - 1]
  }
})
