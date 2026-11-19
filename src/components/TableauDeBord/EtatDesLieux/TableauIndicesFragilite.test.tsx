import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import TableauIndicesFragilite from './TableauIndicesFragilite'
import {
  indiceFragiliteDepartementsPresenter,
  indiceFragilitePresenter,
} from '@/presenters/tableauDeBord/indicesPresenter'

describe('tableau des indices de fragilité d’un territoire', () => {
  it('titre le tableau des communes avec leur nombre', () => {
    // WHEN
    render(
      <TableauIndicesFragilite
        fragilite={indiceFragilitePresenter([
          { codeInsee: '69001', ifn: 5, nom: 'Affoux' },
          { codeInsee: '69002', ifn: 4, nom: 'Aigueperse' },
        ])}
        maille="commune"
      />
    )

    // THEN
    expect(
      screen.getByRole('table', { name: 'Indice de fragilité numérique par commune (2 communes)' })
    ).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /^Commune/ })).toBeInTheDocument()
  })

  it('titre au singulier le tableau d’un seul département', () => {
    // WHEN
    render(
      <TableauIndicesFragilite
        fragilite={indiceFragiliteDepartementsPresenter([{ codeDepartement: '69', ifn: 4.7, nom: 'Rhône' }])}
        maille="département"
      />
    )

    // THEN
    expect(
      screen.getByRole('table', { name: 'Indice de fragilité numérique par département (1 département)' })
    ).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /^Département/ })).toBeInTheDocument()
  })

  it('affiche le message d’erreur quand les indices n’ont pas pu être chargés', () => {
    // WHEN
    render(
      <TableauIndicesFragilite
        fragilite={{ message: 'Impossible de récupérer les données des indices de fragilité', type: 'error' }}
        maille="commune"
      />
    )

    // THEN
    expect(screen.getByText('Impossible de récupérer les données des indices de fragilité')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
