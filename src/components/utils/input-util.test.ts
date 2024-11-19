import { debounce } from './input-util'

describe('debounce', () => {
  it('la fonction devrait s’exécuter une fois quand on l’appelle 100 fois dans l’intervalle du timeout', () => {
    // GIVEN
    vi.useFakeTimers()
    const func = vi.fn()
    const debouncedFunc = debounce(func, 1000)

    // WHEN
    for (let i = 0; i < 100; i++) {
      debouncedFunc('', vi.fn())
    }
    vi.runAllTimers()

    // THEN
    expect(func).toHaveBeenCalledTimes(1)
  })
})
