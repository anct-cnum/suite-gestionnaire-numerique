import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ModaleSuppressionLieu from './ModaleSuppressionLieu'

describe('modale de suppression d’un lieu', () => {
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
