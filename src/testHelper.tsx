import { render } from '@testing-library/react'
import { ReactElement } from 'react'

import { Groupe, TypologieRole } from './domain/Role'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'

export function matchWithoutMarkup(wording: string) {
  return function(_: string, element: Element | null): boolean {
    return element?.textContent === wording
  }
}

export const infosSessionUtilisateurContext = {
  session: {
    email: 'martin.tartempion@example.net',
    nom: 'Tartempion',
    prenom: 'Martin',
    role: {
      groupe: 'admin' as Groupe,
      libelle: 'Mednum',
      nom: 'Support animation' as TypologieRole,
      pictogramme: 'support-animation',
    },
    uid: 'fooId',
  },
}

export function renderComponent(
  children: ReactElement,
  sessionUtilisateurContextProvider = infosSessionUtilisateurContext
): void {
  render(
    <sessionUtilisateurContext.Provider value={sessionUtilisateurContextProvider}>
      {children}
    </sessionUtilisateurContext.Provider>
  )
}
