import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import GouvernancesHearder from '@/components/Gouvernances/GouvernancesHeader'
import { FilterType } from '@/components/Gouvernances/GouvernancesList'

describe('en-tête de la liste des gouvernances', () => {
  it('quand l’utilisateur peut exporter les contacts des membres, alors un lien télécharge l’export de toutes les gouvernances', () => {
    // WHEN
    afficherEnTete(true)

    // THEN
    const lien = screen.getByRole('link', { name: 'Exporter les contacts des membres' })
    expect(lien.getAttribute('href')).toBe('/api/export/contacts-membres-csv')
    expect(lien.hasAttribute('download')).toBe(true)
  })

  it('quand l’utilisateur ne peut pas exporter les contacts des membres, alors le lien d’export n’est pas affiché', () => {
    // WHEN
    afficherEnTete(false)

    // THEN
    expect(screen.queryByRole('link', { name: 'Exporter les contacts des membres' })).not.toBeInTheDocument()
  })
})

function afficherEnTete(peutExporterLesContactsDesMembres: boolean): void {
  render(
    <GouvernancesHearder
      drawerId="drawerFiltreGouvernances"
      filterAvance={{ libeller: '', onRemove: () => undefined, value: FilterType.NO_FILTRE }}
      filtreGeographique={{ onRemove: () => undefined, value: '' }}
      onFilterClick={() => undefined}
      peutExporterLesContactsDesMembres={peutExporterLesContactsDesMembres}
    />
  )
}
