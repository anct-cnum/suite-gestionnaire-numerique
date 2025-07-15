import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PiedDePage from './PiedDePage'

describe('pied de page', () => {
  it('afficher le pied de page', () => {
    // WHEN
    render(<PiedDePage />)

    // THEN
    const piedDePage = screen.getByRole('contentinfo')
    const lienAccueil = within(piedDePage).getByRole('link', { name: 'République Française' })
    expect(lienAccueil).toHaveAttribute('href', '/tableau-de-bord')
    expect(lienAccueil).toHaveAttribute('title', 'Accueil')

    const lists = within(piedDePage).getAllByRole('list')

    const liensEtat = within(lists[0]).getAllByRole('listitem')
    expect(liensEtat).toHaveLength(4)

    const lienLegifrance = within(liensEtat[0]).getByRole('link', { name: 'legifrance.gouv.fr' })
    expect(lienLegifrance).toHaveAttribute('href', 'https://legifrance.gouv.fr')
    expect(lienLegifrance).toOpenInNewTab('legifrance.gouv.fr')

    const lienGouvernement = within(liensEtat[1]).getByRole('link', { name: 'gouvernement.fr' })
    expect(lienGouvernement).toHaveAttribute('href', 'https://gouvernement.fr')
    expect(lienGouvernement).toOpenInNewTab('gouvernement.fr')

    const lienServicePublic = within(liensEtat[2]).getByRole('link', { name: 'service-public.fr' })
    expect(lienServicePublic).toHaveAttribute('href', 'https://service-public.fr')
    expect(lienServicePublic).toOpenInNewTab('service-public.fr')

    const lienDataGouv = within(liensEtat[3]).getByRole('link', { name: 'data.gouv.fr' })
    expect(lienDataGouv).toHaveAttribute('href', 'https://data.gouv.fr')
    expect(lienDataGouv).toOpenInNewTab('data.gouv.fr')

    const liensReglementaires = within(lists[1]).getAllByRole('listitem')
    expect(liensReglementaires).toHaveLength(3)

    const lienAccessibilite = within(liensReglementaires[0]).getByRole('link', { name: 'Accessibilité : partiellement conforme' })
    expect(lienAccessibilite).toHaveAttribute('href', '/accessibilite')

    const lienMentionsLegales = within(liensReglementaires[1]).getByRole('link', { name: 'Mentions légales' })
    expect(lienMentionsLegales).toHaveAttribute('href', '/mentions-legales')

    const lienDonneesPersonnelles = within(liensReglementaires[2]).getByRole('link', { name: 'Données personnelles' })
    expect(lienDonneesPersonnelles).toHaveAttribute('href', '/donnees-personnelles')

    const licence = within(piedDePage).getByText('Sauf mention explicite de propriété intellectuelle détenue par des tiers, les contenus de ce site sont proposés sous', { selector: 'p' })
    const lienLicence = within(licence).getByRole('link', { name: 'licence etalab-2.0' })
    expect(lienLicence).toHaveAttribute('href', 'https://github.com/etalab/licence-ouverte/blob/master/LO.md')
    expect(lienLicence).toOpenInNewTab('licence etalab-2.0')
  })
})
