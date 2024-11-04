import { CorrigerNomPrenomSiAbsents } from './CorrigerNomPrenomSiAbsents'
import { FindUtilisateurRepository, UpdateUtilisateurRepository } from './shared/UtilisateurRepository'
import { utilisateurFactory } from '@/domain/testHelper'
import { Utilisateur } from '@/domain/Utilisateur'

describe('corriger nom prenom si absents', () => {
  afterEach(() => {
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
    const result = await new CorrigerNomPrenomSiAbsents(utilisateurRepository).execute({
      actuels: {
        nom,
        prenom,
      },
      corriges: {
        nom: 'Dugenoux',
        prenom: 'Micheline',
      },
      uid: 'fooId',
    })

    // THEN
    expect(result).toBe('okSansMiseAJour')
    expect(spiedUidToFind).toBeNull()
    expect(spiedUtilisateurToUpdate).toBeNull()
  })

  it.each([
    {
      desc: 'le nom est absent',
      nomAvantCorrection: valeurNomOuPrenomAbsent,
      prenomAvantCorrection: 'Michel',
    },
    {
      desc: 'le prénom est absent',
      nomAvantCorrection: 'Tartempion',
      prenomAvantCorrection: valeurNomOuPrenomAbsent,
    },
    {
      desc: 'le prénom et le nom sont absents',
      nomAvantCorrection: valeurNomOuPrenomAbsent,
      prenomAvantCorrection: valeurNomOuPrenomAbsent,
    },
  ])(
    '$desc, mais l’utilisateur est introuvable : la notification de compte inexistant est émise et aucune' +
      ' mise à jour n’est effectuée',
    async ({ nomAvantCorrection, prenomAvantCorrection }) => {
      // GIVEN
      const nom = nomAvantCorrection
      const prenom = prenomAvantCorrection
      const utilisateurRepository = new UtilisateurRepositoryUtilisateurIntrouvableSpy()

      // WHEN
      const result = await new CorrigerNomPrenomSiAbsents(utilisateurRepository).execute({
        actuels: {
          nom,
          prenom,
        },
        corriges: {
          nom: 'Dugenoux',
          prenom: 'Micheline',
        },
        uid: 'fooId',
      })

      // THEN
      expect(result).toBe('compteInexistant')
      expect(spiedUidToFind).toBe('fooId')
      expect(spiedUtilisateurToUpdate).toBeNull()
    }
  )

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
    '$desc, mais la mise à jour est invalide : la notification d’invalidité est émise et aucune' +
      ' mise à jour n’est effectuée',
    async ({ nomAvantCorrection, prenomAvantCorrection, correctionNom, correctionPrenom }) => {
      // GIVEN
      const nom = nomAvantCorrection
      const prenom = prenomAvantCorrection
      const utilisateurRepository = new UtilisateurRepositorySpy()

      // WHEN
      const result = await new CorrigerNomPrenomSiAbsents(utilisateurRepository).execute({
        actuels: {
          nom,
          prenom,
        },
        corriges: {
          nom: correctionNom,
          prenom: correctionPrenom,
        },
        uid: 'fooId',
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
      nomAvantCorrection,
      prenomAvantCorrection,
      nomApresCorrection,
      prenomApresCorrection,
      correctionNom,
      correctionPrenom,
    }) => {
      // GIVEN
      const nom = nomAvantCorrection
      const prenom = prenomAvantCorrection
      const utilisateurRepository = new UtilisateurRepositorySpy()

      // WHEN
      const result = await new CorrigerNomPrenomSiAbsents(utilisateurRepository).execute({
        actuels: {
          nom,
          prenom,
        },
        corriges: {
          nom: correctionNom,
          prenom: correctionPrenom,
        },
        uid: 'fooId',
      })

      // THEN
      expect(result).toBe('okAvecMiseAJour')
      expect(spiedUidToFind).toBe('fooId')
      expect(
        spiedUtilisateurToUpdate?.equals(
          utilisateurFactory({ nom: nomApresCorrection, prenom: prenomApresCorrection })
        )
      ).toBe(true)
    }
  )
})

let spiedUidToFind: string | null = null
let spiedUtilisateurToUpdate: Utilisateur | null = null

class UtilisateurRepositorySpy implements FindUtilisateurRepository, UpdateUtilisateurRepository {
  async find(uid: string): Promise<Utilisateur> {
    spiedUidToFind = uid
    return Promise.resolve(utilisateurFactory({ nom: 'Tartempion', prenom: 'Michel' }))
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}

class UtilisateurRepositoryUtilisateurIntrouvableSpy
implements FindUtilisateurRepository, UpdateUtilisateurRepository {
  async find(uid: string): Promise<null> {
    spiedUidToFind = uid
    return Promise.resolve(null)
  }

  async update(utilisateur: Utilisateur): Promise<void> {
    spiedUtilisateurToUpdate = utilisateur
    return Promise.resolve()
  }
}
