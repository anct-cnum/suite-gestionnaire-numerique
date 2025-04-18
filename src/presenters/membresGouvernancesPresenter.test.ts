import { describe } from 'vitest'

import { toActionViewModel } from '@/presenters/membresGouvernancesPresenter'
import { MembreReadModel, Role, Statut } from '@/use-cases/queries/RecupererMesMembres'

const createMemberReadModel = (nom: string, id: string, roles: Array<Role>): MembreReadModel => ({
  adresse: '',
  contactReferent: {
    email: '',
    fonction: '',
    nom: '',
    prenom: '',
  },
  isDeletable: false,
  nom,
  roles,
  siret: '',
  statut: 'confirme' as Statut,
  suppressionDuMembreAutorise: false,
  typologie: '',
  uid: id,
})

function nomMembre(): string {
  return 'nom du membre'
}

function idMembre(): string {
  return 'id du membre'
}

function emptyRole(): Array<never> {
  return []
}

describe('test de membresGouvernancesPresenter', () => {
  it('test avec aucun membres de la gouvernance', () => {
    const readModel : ReadonlyArray<MembreReadModel> = []

    const viewModel = toActionViewModel(readModel)

    expect([]).toStrictEqual(viewModel)
  })

  it('test avec une membre simple sans role', () => {
    const readModel : ReadonlyArray<MembreReadModel> = [createMemberReadModel(nomMembre(),idMembre(),[])]

    const viewModel = toActionViewModel(readModel)

    expect([{ nom: nomMembre(), roles: emptyRole(), uid: idMembre() }]).toStrictEqual(viewModel)
  })

  it.each([
    [ 'beneficiaire' , {   color: 'purple-glycine', nom: 'Bénéficiaire'  }],
    [ 'cofinanceur' ,{  color: 'warning', nom: 'Co-financeur' } ],
    [ 'coporteur' , {  color: 'info', nom: 'Co-porteur'   }],
    [ 'observateur' , {  color: 'beige-gris-galet', nom: 'Observateur'  }],
    [ 'recipiendaire' , {  color: 'green-archipel', nom: 'Récipiendaire' }],
  ])('test avec une membre %s', (role, tag) => {
    const readModel : ReadonlyArray<MembreReadModel> = [createMemberReadModel(nomMembre(),idMembre(),[role as Role])]

    const viewModel = toActionViewModel(readModel)

    expect([{ nom: nomMembre(), roles: [ tag ], uid: idMembre() }]).toStrictEqual(viewModel)
  })
})
