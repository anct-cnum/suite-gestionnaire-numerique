import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import CarteFragiliteDepartement from './CarteFragiliteDepartement'
import CarteIndicesFrance from './CarteIndicesFrance'

describe('titre des cartes de l’indice de fragilité numérique', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it.each([
    {
      carte: <CarteIndicesFrance departementsFragilite={{ message: 'Erreur indices', type: 'error' }} />,
      intention: 'de la France',
    },
    {
      carte: (
        <CarteFragiliteDepartement
          fragilite={{ message: 'Erreur indices', type: 'error' }}
          territoire={{ code: '69', type: 'departement' }}
        />
      ),
      intention: 'd’un département',
    },
  ])('la carte $intention est introduite par un titre de niveau 3', ({ carte }) => {
    // GIVEN
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect = vi.fn<() => void>()
        observe = vi.fn<() => void>()
        unobserve = vi.fn<() => void>()
      }
    )

    // WHEN
    render(carte)

    // THEN
    const titre = screen.getByRole('heading', { level: 3, name: 'Indice de Fragilité numérique' })
    expect(titre).toBeInTheDocument()
  })
})
