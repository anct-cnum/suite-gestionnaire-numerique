import { Gouvernance } from './Gouvernance'
import { utilisateurFactory } from './testHelper'

describe('gouvernance', () => {
  it.each([
    {
      intention: 'un administrateur dispositif peut gérer une gouvernance',
      utilisateur: utilisateurFactory({ role: 'Administrateur dispositif' }),
    },
    {
      intention: 'un instructeur peut gérer une gouvernance',
      utilisateur: utilisateurFactory({ role: 'Instructeur' }),
    },
    {
      intention: 'un pilote politique publique peut gérer une gouvernance',
      utilisateur: utilisateurFactory({ role: 'Pilote politique publique' }),
    },
    {
      intention: 'un support animation peut gérer une gouvernance',
      utilisateur: utilisateurFactory({ role: 'Support animation' }),
    },
    {
      intention: 'un gestionnaire département ayant le même département que celui de la gourvernance peut la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }),
    },
    {
      intention: 'un gestionnaire région dont le département de la gouvernance appartient à celle-ci peut la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '11', role: 'Gestionnaire région' }),
    },
  ])('$intention', ({ utilisateur }) => {
    // GIVEN
    const gouvernance = Gouvernance.create({
      departement: {
        code: '75',
        codeRegion: '11',
        nom: 'Paris',
      },
      noteDeContexte: undefined,
      uid: 'gouvernanceFooId',
    })

    // WHEN
    const result = gouvernance.peutEtreGerePar(utilisateur)

    // THEN
    expect(result).toBe(true)
  })

  it.each([
    {
      intention: 'un gestionnaire structure ne peut pas la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '', role: 'Gestionnaire structure' }),
    },
    {
      intention: 'un gestionnaire groupement ne peut pas la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '', role: 'Gestionnaire groupement' }),
    },
  ])('$intention', ({ utilisateur }) => {
    // GIVEN
    const gouvernance = Gouvernance.create({
      departement: {
        code: '75',
        codeRegion: '11',
        nom: 'Paris',
      },
      noteDeContexte: undefined,
      uid: 'gouvernanceFooId',
    })

    // WHEN
    const result = gouvernance.peutEtreGerePar(utilisateur)

    // THEN
    expect(result).toBe(false)
  })
})
