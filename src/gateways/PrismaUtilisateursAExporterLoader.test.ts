import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PrismaUtilisateursAExporterLoader } from './PrismaUtilisateursAExporterLoader'
import {
  creerUnDepartement,
  creerUneGouvernance,
  creerUneRegion,
  creerUneStructure,
  creerUnMembre,
  creerUnUtilisateur,
} from './testHelper'
import prisma from '../../prisma/prismaClient'
import { epochTime } from '@/shared/testHelper'

describe('prisma utilisateurs à exporter loader', () => {
  beforeEach(async () => prisma.$queryRaw`START TRANSACTION`)

  afterEach(async () => prisma.$queryRaw`ROLLBACK TRANSACTION`)

  it('je récupère les gestionnaires de département et les utilisateurs des structures membres validées, triés par nom', async () => {
    // GIVEN
    await creerUneRegion({ code: '84', nom: 'Auvergne-Rhône-Alpes' })
    await creerUnDepartement({ code: '69', nom: 'Rhône', regionCode: '84' })
    await creerUnDepartement({ code: '75', nom: 'Paris', regionCode: '84' })
    await creerUneGouvernance({ departementCode: '69' })
    await creerUneGouvernance({ departementCode: '75' })
    await creerUneStructure({ id: 1, nom: 'Structure Coporteuse', siret: '11111111111111' })
    await creerUneStructure({
      denomination_antenne: 'Antenne Lyon',
      id: 2,
      nom: 'Structure Membre',
      siret: '22222222222222',
    })
    await creerUneStructure({ id: 3, nom: 'Structure Candidate', siret: '33333333333333' })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'membre-coporteur', isCoporteur: true, structureId: 1 })
    await creerUnMembre({ gouvernanceDepartementCode: '75', id: 'membre-simple', structureId: 2 })
    await creerUnMembre({ gouvernanceDepartementCode: '69', id: 'membre-candidat', statut: 'candidat', structureId: 3 })
    await creerUnUtilisateur({
      departementCode: '69',
      emailDeContact: 'harpagon.avare@example.net',
      nom: 'Avare',
      prenom: 'Harpagon',
      role: 'gestionnaire_departement',
      ssoEmail: 'harpagon.avare@example.net',
      ssoId: 'gestionnaire69',
    })
    await creerUnUtilisateur({
      emailDeContact: 'paul.bernard@example.net',
      nom: 'Bernard',
      prenom: 'Paul',
      ssoEmail: 'paul.bernard@example.net',
      ssoId: 'coporteur1',
      structureId: 1,
    })
    await creerUnUtilisateur({
      derniereConnexion: null,
      emailDeContact: 'marie.chollet@example.net',
      nom: 'Chollet',
      prenom: 'Marie',
      ssoEmail: 'marie.chollet@example.net',
      ssoId: 'membre2',
      structureId: 2,
    })
    await creerUnUtilisateur({
      nom: 'Candidat',
      ssoEmail: 'candidat@example.net',
      ssoId: 'candidat3',
      structureId: 3,
    })
    await creerUnUtilisateur({
      isSupprime: true,
      nom: 'Supprime',
      ssoEmail: 'supprime@example.net',
      ssoId: 'supprime1',
      structureId: 1,
    })
    await creerUnUtilisateur({
      nom: 'SansStructure',
      ssoEmail: 'sans.structure@example.net',
      ssoId: 'sansStructure',
    })

    // WHEN
    const utilisateurs = await new PrismaUtilisateursAExporterLoader().get()

    // THEN
    expect(utilisateurs).toStrictEqual([
      {
        departements: ['Rhône'],
        derniereConnexion: epochTime,
        email: 'harpagon.avare@example.net',
        isActive: true,
        nom: 'Avare',
        prenom: 'Harpagon',
        role: 'gestionnaire département',
        siret: '',
        structure: '',
        telephone: '0102030405',
      },
      {
        departements: ['Rhône'],
        derniereConnexion: epochTime,
        email: 'paul.bernard@example.net',
        isActive: true,
        nom: 'Bernard',
        prenom: 'Paul',
        role: 'coporteur',
        siret: '11111111111111',
        structure: 'Structure Coporteuse',
        telephone: '0102030405',
      },
      {
        departements: ['Paris'],
        derniereConnexion: null,
        email: 'marie.chollet@example.net',
        isActive: false,
        nom: 'Chollet',
        prenom: 'Marie',
        role: 'membre',
        siret: '22222222222222',
        structure: 'Antenne Lyon',
        telephone: '0102030405',
      },
    ])
  })

  it('quand il n’y a ni gestionnaire de département ni structure membre validée alors je récupère une liste vide', async () => {
    // WHEN
    const utilisateurs = await new PrismaUtilisateursAExporterLoader().get()

    // THEN
    expect(utilisateurs).toStrictEqual([])
  })
})
