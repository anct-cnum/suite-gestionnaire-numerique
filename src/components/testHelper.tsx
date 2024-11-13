import { render, RenderResult } from '@testing-library/react'
import { ReactElement } from 'react'
import { ToastContainer } from 'react-toastify'

import { clientContext, ClientContextProviderValue } from '@/components/shared/ClientContext'
// eslint-disable-next-line import/no-restricted-paths
import { Roles } from '@/domain/Role'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

export function matchWithoutMarkup(wording: string) {
  return function(_: string, element: Element | null): boolean {
    return element?.textContent === wording
  }
}

export function renderComponent(
  children: ReactElement,
  clientContextProviderValueOverride?: Partial<ClientContextProviderValue>
): RenderResult {
  const clientContextProviderDefaultValue = {
    bandeauInformations: {},
    pathname: '/' as __next_route_internal_types__.StaticRoutes,
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
    setBandeauInformations: vi.fn(),
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
