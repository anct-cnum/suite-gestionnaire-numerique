import { describe, expect } from 'vitest'

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
      intention: 'un gestionnaire département ayant le même département que celui de la gouvernance peut la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '75', role: 'Gestionnaire département' }),
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
      intention: 'un gestionnaire structure ne peut pas la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '', role: 'Gestionnaire structure' }),
    },
    {
      intention: 'un gestionnaire groupement ne peut pas la gérer',
      utilisateur: utilisateurFactory({ codeOrganisation: '', role: 'Gestionnaire groupement' }),
    },
    {
      intention: 'un gestionnaire région dont le département de la gouvernance appartient à celle-ci ne peut pas la gérer',
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
    {
      intention: 'un instructeur ne peut pas gérer une note privée',
      utilisateur: utilisateurFactory({ role: 'Instructeur' }),
    },
    {
      intention: 'un pilote politique publique ne peut pas gérer une note privée',
      utilisateur: utilisateurFactory({ role: 'Pilote politique publique' }),
    },
    {
      intention: 'un support animation ne peut pas gérer une note privée',
      utilisateur: utilisateurFactory({ role: 'Support animation' }),
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
