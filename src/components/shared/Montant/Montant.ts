import { Optional } from '@/shared/Optional'

export class Montant {
  static get Zero(): Montant {
    return new Montant(0)
  }

  readonly valeur: number

  get get(): number {
    return this.valeur
  }

  private constructor(valeur: number) {
    if (valeur < 0) {
      throw new Error('Le montant ne peut pas être négatif')
    }
    this.valeur = valeur
  }

  static of(valeur: string): Optional<Montant> {
    const cleaned = valeur
      .replace(/\s/g, '')
      .replace(/\u202f/g, '')
      .replace(/[^\d]/g, '')

    if (!/^\d+$/.test(cleaned)) {
      return Optional.empty()
    }
    const val = Number(cleaned)
    if (!Number.isFinite(val) || !Number.isInteger(val) || val < 0) {
      return Optional.empty()
    }

    const safeVal = Math.min(val, Number.MAX_SAFE_INTEGER)
    return Optional.of(new Montant(safeVal))
  }

  static ofZero(): Optional<Montant> {
    return Optional.of(new Montant(0))
  }

  add(autre: Optional<Montant>): Optional<Montant> {
    return Optional.of(new Montant(this.valeur + autre.orElse(Montant.Zero).valeur))
  }

  equals(autre: Optional<Montant>): boolean {
    return this.valeur === autre.orElse(Montant.Zero).valeur
  }

  format(): string {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(this.valeur)
  }

  greaterThan(autre: Optional<Montant>): boolean {
    return this.valeur > autre.orElse(Montant.Zero).valeur
  }

  lessThan(autre: Optional<Montant>): boolean {
    return this.valeur < autre.orElse(Montant.Zero).valeur
  }

  subtract(autre: Optional<Montant>): Optional<Montant> {
    const result = this.valeur - autre.orElse(Montant.Zero).valeur
    if (result < 0) {
      return Optional.empty()
    }
    return Optional.of(new Montant(result))
  }
}
