import { Gouvernance } from './Gouvernance'
import { utilisateurFactory } from './testHelper'
import { UtilisateurUid } from './Utilisateur'
import { epochTime } from '@/shared/testHelper'

describe('gouvernance', () => {
  it.each([
    {
      intention: 'un administrateur dispositif peut gérer une gouvernance',
      utilisateur: utilisateurFactory({ role: 'Administrateur dispositif' }),
    },
    {
      intention: 'un gestionnaire département ayant le même département que celui de la gouvernance peut la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }),
    },
    {
      intention: 'un gestionnaire structure dont la structure est membre co-porteur de la gouvernance peut la gérer',
      membresCoporteurs: [{ isCoporteur: true, structureUid: 79227291600034 }],
      utilisateur: utilisateurFactory({ codeOrganisation: '79227291600034', role: 'Gestionnaire structure' }),
    },

  ])('$intention', ({ membresCoporteurs, utilisateur }) => {
    // GIVEN
    const gouvernance = Gouvernance.create({
      departement: {
        code: '75',
        codeRegion: '11',
        nom: 'Paris',
      },
      membresCoporteurs,
      noteDeContexte: undefined,
      notePrivee: undefined,
      uid: 'gouvernanceFooId',
    })

    // WHEN
    const result = gouvernance.peutEtreGereePar(utilisateur)

    // THEN
    expect(result).toBe(true)
  })

  it.each([
    {
      intention: 'un gestionnaire structure dont la structure n\'est pas membre de la gouvernance ne peut pas la gérer',
      membresCoporteurs: [],
      utilisateur: utilisateurFactory({ codeOrganisation: '79227291600034', role: 'Gestionnaire structure' }),
    },
    {
      intention: 'un gestionnaire structure dont la structure est membre mais pas co-porteur (isCoporteur: false) ne peut pas la gérer',
      membresCoporteurs: [{ isCoporteur: false, structureUid: 79227291600034 }],
      utilisateur: utilisateurFactory({ codeOrganisation: '79227291600034', role: 'Gestionnaire structure' }),
    },
    {
      intention: 'un gestionnaire structure dont la structure est membre mais isCoporteur non défini (= false par défaut) ne peut pas la gérer',
      membresCoporteurs: [{ structureUid: 79227291600034 }],
      utilisateur: utilisateurFactory({ codeOrganisation: '79227291600034', role: 'Gestionnaire structure' }),
    },
    {
      intention: 'un gestionnaire groupement ne peut pas la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '', role: 'Gestionnaire groupement' }),
    },
    {
      intention: 'un gestionnaire région dont le département de la gouvernance appartient à celle-ci ne peut pas la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '11', role: 'Gestionnaire région' }),
    },
  ])('$intention', ({ membresCoporteurs, utilisateur }) => {
    // GIVEN
    const gouvernance = Gouvernance.create({
      departement: {
        code: '75',
        codeRegion: '11',
        nom: 'Paris',
      },
      membresCoporteurs,
      noteDeContexte: undefined,
      notePrivee: undefined,
      uid: 'gouvernanceFooId',
    })

    // WHEN
    const result = gouvernance.peutEtreGereePar(utilisateur)

    // THEN
    expect(result).toBe(false)
  })

  it.each([
    {
      intention: 'un administrateur dispositif ne peut pas gérer une note privée',
      utilisateur: utilisateurFactory({ role: 'Administrateur dispositif' }),
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
      notePrivee: {
        contenu: 'contenu',
        dateDeModification: epochTime,
        uidEditeur: new UtilisateurUid(
          utilisateurFactory({ uid: { email: 'martin.tartempion@example.com', value: 'userFooId' } }).state.uid
        ),
      },
      uid: 'gouvernanceFooId',
    })

    // WHEN
    const result = gouvernance.laNotePriveePeutEtreGereePar(utilisateur)

    // THEN
    expect(result).toBe(false)
  })
})
