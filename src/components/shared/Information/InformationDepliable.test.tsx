import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import InformationDepliable, { BoutonInformation, TexteInformation } from './InformationDepliable'

describe('« i » qui déplie son texte dans la page (RGAA 7.1, 7.3, 10.13)', () => {
  it('fermé, le bouton nommé annonce son état et le texte n’est pas rendu', () => {
    // WHEN
    afficherUneInformation()

    // THEN
    const bouton = boutonInformation()
    expect(bouton).toHaveAttribute('type', 'button')
    expect(bouton).toHaveClass('fr-btn', 'fr-btn--tertiary-no-outline', 'fr-icon-information-line')
    expect(bouton).toHaveAttribute('aria-expanded', 'false')
    expect(bouton.getAttribute('aria-controls')).not.toBe('')
    expect(bouton).not.toHaveAttribute('title')
    expect(bouton).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByText(TEXTE)).not.toBeInTheDocument()
    expect(screen.queryByRole('tooltip', { hidden: true })).not.toBeInTheDocument()
  })

  it('appuyer sur Entrée sur le bouton déplie le texte qu’il contrôle, et le focus reste sur le bouton', async () => {
    // GIVEN
    afficherUneInformation()
    await userEvent.tab()

    // WHEN
    await userEvent.keyboard('{Enter}')

    // THEN
    const bouton = boutonInformation()
    expect(bouton).toHaveFocus()
    expect(bouton).toHaveAttribute('aria-expanded', 'true')
    const texte = screen.getByText(TEXTE)
    expect(texte.id).toBe(bouton.getAttribute('aria-controls'))
    expect(texte).toHaveClass('fr-text--sm', 'fr-text-mention--grey')
  })

  it('appuyer sur Espace sur le bouton replie le texte déplié, et le focus reste sur le bouton', async () => {
    // GIVEN
    afficherUneInformation()
    await userEvent.tab()
    await userEvent.keyboard('{Enter}')

    // WHEN
    await userEvent.keyboard(' ')

    // THEN
    const bouton = boutonInformation()
    expect(bouton).toHaveFocus()
    expect(bouton).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(TEXTE)).not.toBeInTheDocument()
  })

  it('appuyer sur Espace déplie aussi le texte, et un clic le replie', async () => {
    // GIVEN
    afficherUneInformation()
    await userEvent.tab()
    await userEvent.keyboard(' ')
    expect(screen.getByText(TEXTE)).toBeInTheDocument()

    // WHEN
    await userEvent.click(boutonInformation())

    // THEN
    expect(boutonInformation()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText(TEXTE)).not.toBeInTheDocument()
  })

  it('deux « i » de la même page déplient chacun leur propre texte', async () => {
    // GIVEN
    render(
      <>
        <InformationDepliable>
          <BoutonInformation libelle="Plus d'information sur les lieux" />
          <TexteInformation>Texte des lieux</TexteInformation>
        </InformationDepliable>
        <InformationDepliable>
          <BoutonInformation libelle="Plus d'information sur les médiateurs" />
          <TexteInformation>Texte des médiateurs</TexteInformation>
        </InformationDepliable>
      </>
    )
    const boutonLieux = screen.getByRole('button', { name: "Plus d'information sur les lieux" })
    const boutonMediateurs = screen.getByRole('button', { name: "Plus d'information sur les médiateurs" })

    // WHEN
    await userEvent.click(boutonMediateurs)

    // THEN
    expect(boutonLieux.getAttribute('aria-controls')).not.toBe(boutonMediateurs.getAttribute('aria-controls'))
    expect(boutonLieux).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Texte des lieux')).not.toBeInTheDocument()
    expect(screen.getByText('Texte des médiateurs').id).toBe(boutonMediateurs.getAttribute('aria-controls'))
  })

  it('un bouton placé hors d’une information dépliable est une erreur de programmation', () => {
    // GIVEN
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    // WHEN
    const afficherUnBoutonSeul = (): void => {
      render(<BoutonInformation libelle="Plus d'information" />)
    }

    // THEN
    expect(afficherUnBoutonSeul).toThrow(
      'Le bouton et le texte d’information doivent être placés dans un InformationDepliable'
    )
  })
})

const LIBELLE = "Plus d'information sur l'indice de fragilité numérique"
const TEXTE = 'Issu des données de la Mednum'

function afficherUneInformation(): void {
  render(
    <InformationDepliable>
      <h3>Indice de fragilité numérique</h3>
      <BoutonInformation libelle={LIBELLE} />
      <TexteInformation>{TEXTE}</TexteInformation>
    </InformationDepliable>
  )
}

function boutonInformation(): HTMLElement {
  return screen.getByRole('button', { name: LIBELLE })
}
