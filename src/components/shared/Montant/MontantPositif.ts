import { Optional } from '@/shared/Optional'

export class MontantPositif {
  static get Zero(): MontantPositif {
    return new MontantPositif(0)
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

  static of(valeur: string): Optional<MontantPositif> {
    const cleaned = valeur
      .replace(/\s/g, '')
      .replace(/\u202f/g, '')
      .trim()

    if (!/^\d+$/.test(cleaned)) {
      return Optional.empty()
    }
    const val = Number(cleaned)
    if (!Number.isFinite(val) || !Number.isInteger(val) || val < 0) {
      return Optional.empty()
    }

    const safeVal = Math.min(val, Number.MAX_SAFE_INTEGER)
    return Optional.of(new MontantPositif(safeVal))
  }

  static ofZero(): Optional<MontantPositif> {
    return Optional.of(new MontantPositif(0))
  }

  add(autre: Optional<MontantPositif>): Optional<MontantPositif> {
    return Optional.of(new MontantPositif(this.valeur + autre.orElse(MontantPositif.Zero).valeur))
  }

  equals(autre: Optional<MontantPositif>): boolean {
    return this.valeur === autre.orElse(MontantPositif.Zero).valeur
  }

  format(): string {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
      useGrouping: true,
    }).format(this.valeur)
  }

  greaterThan(autre: Optional<MontantPositif>): boolean {
    return this.valeur > autre.orElse(MontantPositif.Zero).valeur
  }

  lessThan(autre: Optional<MontantPositif>): boolean {
    return this.valeur < autre.orElse(MontantPositif.Zero).valeur
  }

  subtract(autre: Optional<MontantPositif>): Optional<MontantPositif> {
    const result = this.valeur - autre.orElse(MontantPositif.Zero).valeur
    if (result < 0) {
      return Optional.empty()
    }
    return Optional.of(new MontantPositif(result))
  }
}
