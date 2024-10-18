import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { clientContext } from '@/components/shared/ClientContext'
// eslint-disable-next-line import/no-restricted-paths
import { Roles } from '@/domain/Role'

export function matchWithoutMarkup(wording: string) {
  return function(_: string, element: Element | null): boolean {
    return element?.textContent === wording
  }
}

export const spiedNextNavigation = {
  useRouter: {
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    push: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
  },
}

export const clientContextProviderDefaultValue = {
  bandeauInformations: undefined,
  roles: Roles,
  router: spiedNextNavigation.useRouter,
  searchParams: new URLSearchParams(),
  sessionUtilisateurViewModel: {
    email: 'martin.tartempion@example.net',
    isSuperAdmin: true,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: {
      groupe: 'admin',
      libelle: 'Mednum',
      nom: 'Support animation',
      pictogramme: 'support-animation',
    },
    telephone: '0102030405',
    uid: 'fooId',
  },
  setBandeauInformations: vi.fn(),
  utilisateursParPage: 10,
}

export function renderComponent(
  children: ReactElement,
  clientContextProviderValue = clientContextProviderDefaultValue
): void {
  render(
    <clientContext.Provider value={clientContextProviderValue}>
      {children}
    </clientContext.Provider>
  )
}
