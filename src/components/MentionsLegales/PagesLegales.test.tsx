import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import MentionsLegales from './MentionsLegales'
import Accessibilite from '../Accessibilite/Accessibilite'
import ConditionsGeneralesUtilisation from '../ConditionsGeneralesUtilisation/ConditionsGeneralesUtilisation'
import PolitiqueConfidentialite from '../PolitiqueConfidentialite/PolitiqueConfidentialite'

describe('pages légales', () => {
  it.each([
    { intention: 'la déclaration d’accessibilité', page: <Accessibilite />, titre: "Déclaration d'accessibilité" },
    { intention: 'les mentions légales', page: <MentionsLegales />, titre: 'Mentions légales' },
    {
      intention: 'les conditions générales d’utilisation',
      page: <ConditionsGeneralesUtilisation />,
      titre: "Conditions générales d'utilisation",
    },
    {
      intention: 'la politique de confidentialité',
      page: <PolitiqueConfidentialite />,
      titre: /^Politique de confidentialité/,
    },
  ])('l’article de $intention est nommé par le titre de la page', ({ page, titre }) => {
    // WHEN
    render(page)

    // THEN
    const article = screen.getByRole('article', { name: titre })
    expect(article).toBeInTheDocument()
  })

  it('la section de signalement des mentions légales est nommée par son titre', () => {
    // WHEN
    render(<MentionsLegales />)

    // THEN
    const section = screen.getByRole('region', { name: 'Signaler un dysfonctionnement' })
    expect(section).toBeInTheDocument()
  })

  it('le contact de la déclaration d’accessibilité est une liste', () => {
    // WHEN
    render(<Accessibilite />)

    // THEN
    const [liste] = screen
      .getAllByRole('list')
      .filter((element) => within(element).queryByRole('link', { name: 'societe.numerique@anct.gouv.fr' }) !== null)
    const contacts = within(liste).getAllByRole('listitem')
    expect(contacts.map((contact) => contact.textContent)).toStrictEqual([
      'E-mail\u00a0: societe.numerique@anct.gouv.fr',
      'Adresse\u00a0: 20 avenue de Ségur, 75007 Paris',
    ])
  })

  it('la politique de confidentialité ne double pas les puces de ses listes par des tirets tapés', () => {
    // WHEN
    render(<PolitiqueConfidentialite />)

    // THEN
    screen.getAllByRole('listitem').forEach((element) => {
      expect(element.textContent.trim()).not.toMatch(/^-/)
    })
  })
})
