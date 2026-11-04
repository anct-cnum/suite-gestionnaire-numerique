import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ModaleSuppressionLieu from './ModaleSuppressionLieu'

describe('modale de suppression d’un lieu', () => {
  // Le délai est passé de ~5 h à une dizaine de minutes le 27/10/2026 (#2027) : la copie de la
  // modale annonçait encore 24 heures, au moment d'un geste irréversible (#2226).
  it('annonce le délai réel de retrait de la carte, pas les 24 heures d’avant #2027', () => {
    // WHEN
    afficherLaModale(false)

    // THEN
    expect(
      screen.getByText(/Le retrait du lieu de la cartographie nationale, sous une dizaine de minutes/)
    ).toBeInTheDocument()
    expect(screen.queryByText(/sous 24 heures/)).toBeNull()
  })

  it('pour un lieu géré dans la Coop, prévient qu’il y reste et qu’une mise à jour par un médiateur le fera revenir (#2105)', () => {
    // WHEN
    afficherLaModale(true)

    // THEN
    expect(
      screen.getByText('Le lieu reste dans la Coop numérique, où ses médiateurs continuent de saisir leurs activités')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Si un médiateur met à jour ce lieu dans la Coop numérique, il réapparaîtra')
    ).toBeInTheDocument()
    expect(screen.queryByText('Le lieu ne sera plus disponible dans la COOP pour saisir des activités')).toBeNull()
  })

  it('pour un lieu hors Coop, annonce qu’il ne sera plus disponible dans la Coop', () => {
    // WHEN
    afficherLaModale(false)

    // THEN
    expect(
      screen.getByText('Le lieu ne sera plus disponible dans la COOP pour saisir des activités')
    ).toBeInTheDocument()
    expect(screen.queryByText('Si un médiateur met à jour ce lieu dans la Coop numérique, il réapparaîtra')).toBeNull()
  })
})

function afficherLaModale(estLieuCoop: boolean): void {
  render(
    <ModaleSuppressionLieu
      adresse="1 rue de la Paix, 75001 Paris"
      estLieuCoop={estLieuCoop}
      id="modaleSuppressionLieuTest"
      isOpen={true}
      nom="Mon lieu"
      onCancel={() => undefined}
      onConfirm={() => undefined}
    />
  )
}
