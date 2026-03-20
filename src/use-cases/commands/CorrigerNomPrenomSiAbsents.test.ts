import { beforeEach, describe, expect, it } from 'vitest'

import { CorrigerNomPrenomSiAbsents } from './CorrigerNomPrenomSiAbsents'
import {
  GetUtilisateurRepository,
  UpdateUtilisateurRepository,
} from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur, UtilisateurUidState } from '@/domain/Utilisateur'

describe('corriger nom prenom si absents', () => {
  beforeEach(() => {
    spiedUidToFind = null
    spiedUtilisateurToUpdate = null
  })

  const valeurNomOuPrenomAbsent = '~'

  it('le nom et le prénom sont présents : aucune mise à jour n’est effectuée', async () => {
    // GIVEN
    const nom = 'Tartempion'
    const prenom = 'Michel'
    const utilisateurRepository = new UtilisateurRepositorySpy()

    // WHEN
    const result = await new CorrigerNomPrenomSiAbsents(utilisateurRepository).handle({
      actuels: {
        nom,
        prenom,
      },
      corriges: {
        nom: 'Dugenoux',
        prenom: 'Micheline',
      },
      uidUtilisateurCourant: 'fooId',
    })

    // THEN
    expect(result).toBe('okSansMiseAJour')
    expect(spiedUidToFind).toBeNull()
    expect(spiedUtilisateurToUpdate).toBeNull()
  })

  it.each([
    {
      correctionNom: valeurNomOuPrenomAbsent,
      correctionPrenom: 'Micheline',
      desc: 'le nom est absent',
      nomAvantCorrection: valeurNomOuPrenomAbsent,
      prenomAvantCorrection: 'Michel',
    },
    {
      correctionNom: 'Dugenoux',
      correctionPrenom: valeurNomOuPrenomAbsent,
      desc: 'le prénom est absent',
      nomAvantCorrection: 'Tartempion',
      prenomAvantCorrection: valeurNomOuPrenomAbsent,
    },
    {
      correctionNom: valeurNomOuPrenomAbsent,
      correctionPrenom: valeurNomOuPrenomAbsent,
      desc: 'le prénom et le nom sont absents',
      nomAvantCorrection: valeurNomOuPrenomAbsent,
      prenomAvantCorrection: valeurNomOuPrenomAbsent,
    },
  ])(
    '$desc, mais la mise à jour est invalide : la notification d’invalidité est émise et aucune mise à jour n’est effectuée',
    async ({ correctionNom, correctionPrenom, nomAvantCorrection, prenomAvantCorrection }) => {
      // GIVEN
      const nom = nomAvantCorrection
      const prenom = prenomAvantCorrection
      const utilisateurRepository = new UtilisateurRepositorySpy()

      // WHEN
      const result = await new CorrigerNomPrenomSiAbsents(utilisateurRepository).handle({
        actuels: {
          nom,
          prenom,
        },
        corriges: {
          nom: correctionNom,
          prenom: correctionPrenom,
        },
        uidUtilisateurCourant: 'fooId',
      })

      // THEN
      expect(result).toBe('miseAJourInvalide')
      expect(spiedUidToFind).toBe('fooId')
      expect(spiedUtilisateurToUpdate).toBeNull()
    }
  )

  it.each([
    {
      correctionNom: 'Dugenoux',
      correctionPrenom: valeurNomOuPrenomAbsent,
      desc: 'le nom est absent : il est corrigé',
      nomApresCorrection: 'Dugenoux',
      nomAvantCorrection: valeurNomOuPrenomAbsent,
      prenomApresCorrection: 'Michel',
      prenomAvantCorrection: 'Michel',
    },
    {
      correctionNom: valeurNomOuPrenomAbsent,
      correctionPrenom: 'Micheline',
      desc: 'le prénom est absent : il est corrigé',
      nomApresCorrection: 'Tartempion',
      nomAvantCorrection: 'Tartempion',
      prenomApresCorrection: 'Micheline',
      prenomAvantCorrection: valeurNomOuPrenomAbsent,
    },
    {
      correctionNom: 'Dugenoux',
      correctionPrenom: 'Micheline',
      desc: 'le prénom et le nom sont absents : ils sont corrigés',
      nomApresCorrection: 'Dugenoux',
      nomAvantCorrection: valeurNomOuPrenomAbsent,
      prenomApresCorrection: 'Micheline',
      prenomAvantCorrection: valeurNomOuPrenomAbsent,
    },
  ])(
    '$desc',
    async ({
      correctionNom,
      correctionPrenom,
      nomApresCorrection,
      nomAvantCorrection,
      prenomApresCorrection,
      prenomAvantCorrection,
    }) => {
      // GIVEN
      const nom = nomAvantCorrection
      const prenom = prenomAvantCorrection
      const utilisateurRepository = new UtilisateurRepositorySpy()

      // WHEN
      const result = await new CorrigerNomPrenomSiAbsents(utilisateurRepository).handle({
        actuels: {
          nom,
          prenom,
        },
        corriges: {
          nom: correctionNom,
          prenom: correctionPrenom,
        },
        uidUtilisateurCourant: 'fooId',
      })

      // THEN
      expect(result).toBe('okAvecMiseAJour')
      expect(spiedUidToFind).toBe('fooId')
      expect(spiedUtilisateurToUpdate?.state).toStrictEqual(utilisateurFactory({
        nom: nomApresCorrection,
        prenom: prenomApresCorrection,
      }).state)
    }
  )
})

let spiedUidToFind: null | string
let spiedUtilisateurToUpdate: null | Utilisateur

class UtilisateurRepositorySpy implements GetUtilisateurRepository, UpdateUtilisateurRepository {
  async get(uid: UtilisateurUidState['value']): Promise<Utilisateur> {
    spiedUidToFind = uid
    return Promise.resolve(utilisateurFactory({ nom: 'Tartempion', prenom: 'Michel' }))
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}
