import { expect, test } from 'vitest';
import { addition } from '../src/app/addition';

test('devrait retourner 3 quand on additionne 1 et 2', () => {
  expect(addition(1, 2)).toBe(3);
})
