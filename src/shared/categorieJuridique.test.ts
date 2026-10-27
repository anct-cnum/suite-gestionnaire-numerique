import { describe, expect, it } from 'vitest'

import { classerParCategorieJuridique } from './categorieJuridique'

describe('classement d’une structure par catégorie juridique', () => {
  it.each([
    {
      code: '7172',
      famille: 'etat',
      intention: 'une préfecture est un service de l’État',
      libelle: 'Services de l’État',
    },
    {
      code: '7120',
      famille: 'etat',
      intention: 'tout code 71xx est un service de l’État',
      libelle: 'Services de l’État',
    },
    { code: '7210', famille: 'collectivite', intention: 'une commune', libelle: 'Communes' },
    { code: '7343', famille: 'collectivite', intention: 'une communauté urbaine', libelle: 'EPCI' },
    { code: '7344', famille: 'collectivite', intention: 'une métropole', libelle: 'EPCI' },
    { code: '7346', famille: 'collectivite', intention: 'une communauté de communes', libelle: 'EPCI' },
    { code: '7347', famille: 'collectivite', intention: 'une communauté de villes', libelle: 'EPCI' },
    { code: '7348', famille: 'collectivite', intention: 'une communauté d’agglomération', libelle: 'EPCI' },
    { code: '7220', famille: 'collectivite', intention: 'un département', libelle: 'Conseils départementaux' },
    {
      code: '7229',
      famille: 'collectivite',
      intention: 'une collectivité à statut particulier',
      libelle: 'Régions et collectivités à statut particulier',
    },
    {
      code: '7230',
      famille: 'collectivite',
      intention: 'une région',
      libelle: 'Régions et collectivités à statut particulier',
    },
    { code: '9220', famille: 'autreStructure', intention: 'une association', libelle: 'Associations et fondations' },
    { code: '9300', famille: 'autreStructure', intention: 'une fondation', libelle: 'Associations et fondations' },
    { code: '7354', famille: 'autreStructure', intention: 'un syndicat mixte', libelle: 'Syndicats' },
    { code: '7345', famille: 'autreStructure', intention: 'un SIVOM', libelle: 'Syndicats' },
    {
      code: '8110',
      famille: 'autreStructure',
      intention: 'une caisse de sécurité sociale',
      libelle: 'Organismes de sécurité sociale',
    },
    { code: '5710', famille: 'autreStructure', intention: 'une SAS', libelle: 'Entreprises et coopératives' },
    {
      code: '1000',
      famille: 'autreStructure',
      intention: 'un entrepreneur individuel',
      libelle: 'Entreprises et coopératives',
    },
    { code: '6316', famille: 'autreStructure', intention: 'une coopérative', libelle: 'Entreprises et coopératives' },
    { code: '7410', famille: 'autreStructure', intention: 'un GIP', libelle: 'GIP' },
    { code: '7361', famille: 'autreStructure', intention: 'un CCAS', libelle: 'CCAS / CIAS' },
    { code: '7381', famille: 'autreStructure', intention: 'une chambre consulaire', libelle: 'Chambres consulaires' },
    {
      code: '7379',
      famille: 'autreStructure',
      intention: 'un autre établissement 73xx',
      libelle: 'Établissements publics',
    },
    {
      code: '4110',
      famille: 'autreStructure',
      intention: 'un établissement public 4xxx',
      libelle: 'Établissements publics',
    },
    {
      code: '7490',
      famille: 'autreStructure',
      intention: 'une autre personne morale de droit public',
      libelle: 'Autres',
    },
    { code: '7225', famille: 'autreStructure', intention: 'une collectivité 72xx non listée', libelle: 'Autres' },
    { code: null, famille: 'autreStructure', intention: 'une catégorie inconnue', libelle: 'Autres' },
    { code: '', famille: 'autreStructure', intention: 'une catégorie vide', libelle: 'Autres' },
  ])('$intention ($code) est classée « $libelle »', ({ code, famille, libelle }) => {
    // WHEN
    const classement = classerParCategorieJuridique(code)

    // THEN
    expect(classement).toStrictEqual({ famille, libelle })
  })
})
