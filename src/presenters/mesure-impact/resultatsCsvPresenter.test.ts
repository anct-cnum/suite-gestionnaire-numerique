import { describe, expect, it } from 'vitest'

import { resultatsCsvPresenter } from './resultatsCsvPresenter'
import { ResultatsReadModel } from '@/use-cases/mesure-impact/RecupererLesResultats'

describe('export CSV des résultats d’une campagne de mesure d’impact', () => {
  it('donne une ligne par réponse de chaque question, dans l’ordre du questionnaire, avec son effectif, sa part et la base', () => {
    // WHEN
    const { contenu } = resultatsCsvPresenter(readModel)

    // THEN
    expect(contenu.split('\n')).toStrictEqual([
      '\uFEFFPartie,Numéro,Question,Réponse,Effectif,Pourcentage,Base',
      'Le contexte,1,"Pour quoi faire, avec le numérique ?",Travailler,1,33,3',
      'Le contexte,1,"Pour quoi faire, avec le numérique ?",Me soigner,2,67,3',
      'Le bilan,9,Avez-vous eu ce que vous attendiez ?,Oui tout à fait,81,55,148',
      'Le bilan,9,Avez-vous eu ce que vous attendiez ?,Non pas du tout,67,45,148',
      'Le bilan,10,Avant ?,1 (Pas du tout à l’aise),3,75,4',
      'Le bilan,10,Avant ?,2,1,25,4',
      'Le bilan,10,Avant ?,3 (Très à l’aise),0,0,4',
      'Le bilan,11,Après ?,1 (Pas du tout à l’aise),0,0,4',
      'Le bilan,11,Après ?,2,1,25,4',
      'Le bilan,11,Après ?,3 (Très à l’aise),3,75,4',
      'Le bilan,14,Mieux maîtriser les équipements ?,Tablette : Plutôt oui,3,75,4',
      'Le bilan,14,Mieux maîtriser les équipements ?,Tablette : Plutôt non,1,25,4',
      'Le bilan,14,Mieux maîtriser les équipements ?,Imprimante 3D : Plutôt oui,0,,0',
      'Le bilan,14,Mieux maîtriser les équipements ?,Imprimante 3D : Plutôt non,0,,0',
      'À propos de vous,26,Votre code postal ?,31670,0,,0',
      '',
      'Partie,Numéro,Question,Champ,Texte,Effectif',
      'Le contexte,1,"Pour quoi faire, avec le numérique ?","Autre, précisez","Jardiner, bricoler",2',
      'Le bilan,7,Un équipement ?,Lequel/lesquels ?,Une liseuse,1',
      "Le bilan,9,Avez-vous eu ce que vous attendiez ?,Pourquoi ?,'=SOMME(A1),1",
    ])
  })

  it('sans texte libre, le fichier s’arrête aux résultats', () => {
    // WHEN
    const { contenu } = resultatsCsvPresenter({ ...readModel, resultats: { ...readModel.resultats, textesLibres: [] } })

    // THEN
    expect(contenu.split('\n').at(-1)).toBe('À propos de vous,26,Votre code postal ?,31670,0,,0')
  })

  it('nomme le fichier d’après la campagne, et les filtres appliqués', () => {
    // WHEN
    const sansFiltre = resultatsCsvPresenter(readModel)
    const filtre = resultatsCsvPresenter({
      ...readModel,
      filtres: { canal: 'papier', codePostal: '31670', mois: '2026-11' },
    })

    // THEN
    expect(sansFiltre.nomDuFichier).toBe('resultats-sicoval.csv')
    expect(filtre.nomDuFichier).toBe('resultats-sicoval-31670-2026-11-papier.csv')
  })
})

const readModel: ResultatsReadModel = {
  campagne: {
    identifiantPublic: 'sicoval',
    libelleTerritoire: 'Sicoval',
    nom: 'Pilote Sicoval 2026',
    ouverture: new Date('2026-11-16T09:00:00.000Z'),
  },
  filtres: {},
  optionsDeFiltre: { codesPostaux: ['31670'], mois: ['2026-11'] },
  parties: [
    { code: 'contexte', intro: '', libelle: 'Le contexte', titre: '' },
    { code: 'bilan', intro: '', libelle: 'Le bilan', titre: '' },
    { code: 'vous', intro: '', libelle: 'À propos de vous', titre: '' },
  ],
  resultats: {
    chiffresCles: {
      nouvellesChoses: { base: 0, nombre: 0 },
      plusALAise: { base: 0, nombre: 0 },
      progres: { base: 0, nombre: 0 },
    },
    questions: [
      {
        base: 3,
        code: 'q1',
        condition: undefined,
        multiple: true,
        numero: 1,
        options: [
          { code: 'travailler', libelle: 'Travailler', nombre: 1 },
          { code: 'me-soigner', libelle: 'Me soigner', nombre: 2 },
        ],
        partie: 'contexte',
        titre: 'Pour quoi faire, avec le numérique ?',
        type: 'repartition',
      },
      {
        base: 148,
        code: 'q9',
        condition: undefined,
        multiple: false,
        numero: 9,
        options: [
          { code: 'oui-tout-a-fait', libelle: 'Oui tout à fait', nombre: 81 },
          { code: 'non-pas-du-tout', libelle: 'Non pas du tout', nombre: 67 },
        ],
        partie: 'bilan',
        titre: 'Avez-vous eu ce que vous attendiez ?',
        type: 'repartition',
      },
      {
        base: 4,
        codes: ['q10', 'q11'],
        niveaux: [
          { apres: 0, avant: 3, niveau: '1' },
          { apres: 1, avant: 1, niveau: '2' },
          { apres: 3, avant: 0, niveau: '3' },
        ],
        numeros: [10, 11],
        partie: 'bilan',
        poles: { maximum: 'Très à l’aise', minimum: 'Pas du tout à l’aise' },
        titres: ['Avant ?', 'Après ?'],
        type: 'avant-apres',
      },
      {
        code: 'q14',
        lignes: [
          {
            base: 4,
            code: 'tablette',
            libelle: 'Tablette',
            options: [
              { code: 'plutot-oui', libelle: 'Plutôt oui', nombre: 3 },
              { code: 'plutot-non', libelle: 'Plutôt non', nombre: 1 },
            ],
          },
          {
            base: 0,
            code: 'imprimante-3d',
            libelle: 'Imprimante 3D',
            options: [
              { code: 'plutot-oui', libelle: 'Plutôt oui', nombre: 0 },
              { code: 'plutot-non', libelle: 'Plutôt non', nombre: 0 },
            ],
          },
        ],
        numero: 14,
        partie: 'bilan',
        titre: 'Mieux maîtriser les équipements ?',
        type: 'grille',
      },
      {
        base: 0,
        code: 'q26',
        condition: undefined,
        multiple: false,
        numero: 26,
        options: [{ code: '31670', libelle: '31670', nombre: 0 }],
        partie: 'vous',
        titre: 'Votre code postal ?',
        type: 'repartition',
      },
    ],
    textesLibres: [
      {
        champ: 'autre',
        nombre: 2,
        numero: 1,
        partie: 'contexte',
        texte: 'Jardiner, bricoler',
        titre: 'Pour quoi faire, avec le numérique ?',
      },
      { champ: 'lequelTexte', nombre: 1, numero: 7, partie: 'bilan', texte: 'Une liseuse', titre: 'Un équipement ?' },
      {
        champ: 'pourquoi',
        nombre: 1,
        numero: 9,
        partie: 'bilan',
        texte: '=SOMME(A1)',
        titre: 'Avez-vous eu ce que vous attendiez ?',
      },
    ],
    total: 148,
  },
}
