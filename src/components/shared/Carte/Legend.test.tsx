import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Legend from './Legend'

describe('légende de l’indice de fragilité numérique', () => {
  it('nomme chaque classe avec sa tranche, puis la donnée non disponible', () => {
    // WHEN
    render(<Legend />)

    // THEN
    const legende = screen.getByRole('list', { name: 'Légende : indice de fragilité numérique, sur 10' })
    const classes = within(legende).getAllByRole('listitem')
    expect(classes.map((classe) => classe.textContent)).toStrictEqual([
      '0 à 1,4 : Risque très faible',
      '1,5 à 2,8 : Risque faible',
      '2,9 à 4,2 : Risque assez faible',
      '4,3 à 5,7 : Risque moyen',
      '5,8 à 7,1 : Risque assez fort',
      '7,2 à 8,5 : Risque fort',
      '8,6 à 10 : Risque très fort',
      'Donnée non disponible',
    ])
  })
})
