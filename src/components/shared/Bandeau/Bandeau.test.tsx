import { screen } from '@testing-library/react'

import Bandeau from './Bandeau'
import { matchWithoutMarkup, renderComponent } from '../../testHelper'

describe('bandeau', () => {
  it('quand il y a un titre et une description, alors le bandeau est affiché avec un titre et une description', () => {
    // GIVEN
    const context = { bandeauInformations: { description: 'bar', titre: 'foo' } }

    // WHEN
    renderComponent(<Bandeau />, context)

    // THEN
    const description = screen.getByText('bar')
    expect(description).toBeInTheDocument()
    const titre = screen.getByText('foo')
    expect(titre).toBeInTheDocument()
  })

  it('quand il y a un titre et pas de description, alors le bandeau est affiché juste avec le titre', () => {
    // GIVEN
    const context = { bandeauInformations: { titre: 'foo' } }

    // WHEN
    renderComponent(<Bandeau />, context)

    // THEN
    const titre = screen.getByText(matchWithoutMarkup('foo'), { selector: 'p' })
    expect(titre).toBeInTheDocument()
  })

  it('quand il y a une description et pas de titre, alors le bandeau est affiché juste avec la description', () => {
    // GIVEN
    const context = { bandeauInformations: { description: 'bar' } }

    // WHEN
    renderComponent(<Bandeau />, context)

    // THEN
    const description = screen.getByText(matchWithoutMarkup('bar'), { selector: 'p' })
    expect(description).toBeInTheDocument()
  })

  it('quand il n’y a ni titre ni description, alors le bandeau n’est pas affiché', () => {
    // WHEN
    const { container } = renderComponent(<Bandeau />)

    // THEN
    expect(container).toBeEmptyDOMElement()
  })
})
