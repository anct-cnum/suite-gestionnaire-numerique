import { addition } from '../src/app/addition'

describe('addition', () => {
  it('devrait retourner 3 quand on additionne 1 et 2', () => {
    expect(addition(1, 2)).toBe(3)
  })
})
