import { describe, expect, it, vi } from 'vitest'

import { Optional } from './Optional'

describe('optional', () => {
  describe('optional.empty()', () => {
    const empty = Optional.empty<number>()

    it('isEmpty() should return true', () => {
      expect(empty.isEmpty()).toBe(true)
    })

    it('isPresent() should return false', () => {
      expect(empty.isPresent()).toBe(false)
    })

    it('map() should return empty', () => {
      expect(empty.map(value => value * 2).isEmpty()).toBe(true)
    })

    it('flatMap() should return empty', () => {
      expect(empty.flatMap(value => Optional.of(value * 2)).isEmpty()).toBe(true)
    })

    it('filter() should return empty', () => {
      expect(empty.filter(value => value > 0).isEmpty()).toBe(true)
    })

    it('ifPresent() should do nothing', () => {
      const callback = vi.fn<() => void>()
      empty.ifPresent(callback)
      expect(callback).not.toHaveBeenCalled()
    })

    it('or() should return fallback Optional', () => {
      const fallback = Optional.of(42)
      expect(empty.or(() => fallback)).toBe(fallback)
    })

    it('orElse() should return default value', () => {
      expect(empty.orElse(99)).toBe(99)
    })

    it('orElseGet() should return factory value', () => {
      expect(empty.orElseGet(() => 123)).toBe(123)
    })

    it('orElseThrow() should throw default error', () => {
      expect(() => empty.orElseThrow()).toThrow("Can't get value from an empty optional")
    })

    it('orElseThrow() should throw custom error', () => {
      expect(() => empty.orElseThrow(() => new TypeError('custom'))).toThrow('custom')
    })

    it('toArray() should return empty array', () => {
      expect(empty.toArray()).toStrictEqual([])
    })
  })

  describe('optional.of(value)', () => {
    const opt = Optional.of(10)

    it('isEmpty() should return false', () => {
      expect(opt.isEmpty()).toBe(false)
    })

    it('isPresent() should return true', () => {
      expect(opt.isPresent()).toBe(true)
    })

    it('map() should transform the value', () => {
      const result = opt.map(value => value * 2)
      expect(result.orElse(0)).toBe(20)
    })

    it('flatMap() should transform to another Optional', () => {
      const result = opt.flatMap(value => Optional.of(value + 5))
      expect(result.orElse(0)).toBe(15)
    })

    it('filter(true) should keep the value', () => {
      expect(opt.filter(value => value === 10).isPresent()).toBe(true)
    })

    it('filter(false) should return empty', () => {
      expect(opt.filter(value => value !== 10).isEmpty()).toBe(true)
    })

    it('ifPresent() should call the consumer', () => {
      const callback = vi.fn<() => void>()
      opt.ifPresent(callback)
      expect(callback).toHaveBeenCalledWith(10)
    })

    it('or() should ignore fallback', () => {
      const fallback = Optional.of(999)
      expect(opt.or(() => fallback)).toStrictEqual(opt)
    })

    it('orElse() should return the value', () => {
      expect(opt.orElse(0)).toBe(10)
    })

    it('orElseGet() should return the value', () => {
      expect(opt.orElseGet(() => 999)).toBe(10)
    })

    it('orElseThrow() should return the value', () => {
      expect(opt.orElseThrow()).toBe(10)
    })

    it('toArray() should return an array with the value', () => {
      expect(opt.toArray()).toStrictEqual([10])
    })
  })

  describe('optional.ofNullable()', () => {
    it('should return empty for null', () => {
      expect(Optional.ofNullable(null).isEmpty()).toBe(true)
    })

    it('should return empty for undefined', () => {
      expect(Optional.ofNullable(undefined).isEmpty()).toBe(true)
    })

    it('should return empty for NaN', () => {
      expect(Optional.ofNullable(NaN).isEmpty()).toBe(true)
    })

    it('should return optional for valid value', () => {
      expect(Optional.ofNullable(123).orElse(0)).toBe(123)
    })
  })
})
