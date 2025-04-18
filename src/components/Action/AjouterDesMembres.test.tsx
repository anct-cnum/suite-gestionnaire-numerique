import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RefObject } from 'react'
import { vi } from 'vitest'

import AjouterDesMembres from '@/components/Action/AjouterDesMembres'
import { MembresGouvernancesViewModel } from '@/presenters/membresGouvernancesPresenter'

vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return {
    ...actual,
    useParams: (): { codeDepartement: string } => ({ codeDepartement: '75' }),
  }
})

describe('test du composant AjouterDesMembres', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(async () =>
      Promise.resolve({
        json: async () =>
          Promise.resolve([
            { nom: 'Alice', roles: [], uid: '0218b298-8e23-4a53-a3a4-0add4a10cd7a' },
            { nom: 'Bob', roles: [], uid: '203d5783-a3a0-4f0e-9a5e-7ebe746a562e' },
          ]as Array<MembresGouvernancesViewModel>),
      })))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function dummyEnregistrer(_fieldset: RefObject<HTMLFieldSetElement | null>) : () => void {
    return (): void => {}
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function dummyToutEffacer(_fieldset: RefObject<HTMLFieldSetElement | null>) {
    return (): void => {}
  }

  it('le composant devrait afficher la list des membres quand j affiche la drawer',async () => {
    const { container } = render(
      <AjouterDesMembres
        checkboxName="porteurs"
        drawerId="drawerAjouterDesPorteursId"
        enregistrer={dummyEnregistrer}
        labelPluriel="porteurs"
        preSelectedMembers={[]}
        titre="Ajouter le(s) porteur(s)"
        toutEffacer={dummyToutEffacer}
        urlGouvernance="urlGouvernance"
      />
    )

    const element = container.querySelector('.spinner')
    expect(element).toBeInTheDocument()

    const bouton = screen.getByRole('button', { name: /ajouter/i })
    await userEvent.click(bouton)

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeInTheDocument()
    })
  })
})
