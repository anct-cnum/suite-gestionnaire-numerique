import { render, RenderResult } from '@testing-library/react'
import { ReactElement } from 'react'
import { ToastContainer } from 'react-toastify'
import { Mock } from 'vitest'

import departements from '../../ressources/departements.json'
import groupements from '../../ressources/groupements.json'
import regions from '../../ressources/regions.json'
import { clientContext, ClientContextProviderValue } from '@/components/shared/ClientContext'
// eslint-disable-next-line import/no-restricted-paths
import { Roles } from '@/domain/Role'
import { RolesAvecStructure } from '@/presenters/mesUtilisateursPresenter'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

export function matchWithoutMarkup(wording: string) {
  return (_: string, element: Element | null): boolean => element?.textContent === wording
}

export function renderComponent(
  children: ReactElement,
  clientContextProviderValueOverride?: Partial<ClientContextProviderValue>
): RenderResult {
  const clientContextProviderDefaultValue = {
    ajouterUnComiteAction: vi.fn(),
    changerMonRoleAction: vi.fn(),
    inviterUnUtilisateurAction: vi.fn(),
    modifierMesInformationsPersonnellesAction: vi.fn(),
    pathname: '/',
    reinviterUnUtilisateurAction: vi.fn(),
    roles: Roles,
    router: {
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
      push: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
    },
    searchParams: new URLSearchParams(),
    sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory(),
    supprimerMonCompteAction: vi.fn(),
    supprimerUnUtilisateurAction: vi.fn(),
    utilisateursParPage: 10,
  }

  return render(
    <clientContext.Provider value={{
      ...clientContextProviderDefaultValue,
      ...clientContextProviderValueOverride,
    }}
    >
      <ToastContainer />
      {children}
    </clientContext.Provider>
  )
}

export async function structuresFetch(): Promise<Response> {
  return Promise.resolve({
    async json() {
      return Promise.resolve([
        { commune: '', nom: 'ABC FORMATION', uid: '5001' },
        { commune: 'PARIS 18', nom: 'AGIRabcd Délégation des Pyrénées Orientales', uid: '1154' },
        { commune: 'GRASSE', nom: 'TETRIS', uid: '14' },
      ])
    },
  } as Response)
}

export const rolesAvecStructure: RolesAvecStructure = {
  'Gestionnaire département': {
    label: 'Département',
    options: departements.map((departement) => ({ label: departement.nom, value: departement.code })),
    placeholder: 'Nom du département',
  },
  'Gestionnaire groupement': {
    label: 'Groupement',
    options: groupements.map((groupement) => ({ label: groupement.nom, value: `${groupement.id}` })),
    placeholder: 'Nom du groupement',
  },
  'Gestionnaire région': {
    label: 'Région',
    options: regions.map((region) => ({ label: region.nom, value: region.code })),
    placeholder: 'Nom de la région',
  },
  'Gestionnaire structure': {
    label: 'Structure',
    options: [],
    placeholder: 'Nom de la structure',
  },
}

export class FrozenDate extends Date {
  constructor() {
    super('1996-04-15T03:24:00')
  }
}

export function stubbedConceal() {
  return (): { modal: { conceal: Mock } } => ({
    modal: {
      conceal: vi.fn(),
    },
  })
}
