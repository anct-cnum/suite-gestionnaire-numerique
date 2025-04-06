
export class FeuilleDeRoute {
  dateDeModification: Date
  readonly nom: string
  readonly perimetreGeographique: string
  readonly porteur: string
  readonly uidEditeur: string
  readonly uidGouvernance: string

  constructor(
    nom: string,
    perimetreGeographique: string,
    porteur: string,
    uidEditeur: string,
    uidGouvernance: string,
    dateDeModification: Date
  ) {
    this.nom = nom
    this.perimetreGeographique = perimetreGeographique
    this.porteur = porteur
    this.uidEditeur = uidEditeur
    this.uidGouvernance = uidGouvernance
    this.dateDeModification = dateDeModification
  }

  static create(
    nom: string,
    perimetreGeographique: string,
    porteur: string,
    uidEditeur: string,
    uidGouvernance: string,
    dateDeModification: Date
  ): FeuilleDeRoute {
    return new FeuilleDeRoute(
      nom,
      perimetreGeographique,
      porteur,
      uidEditeur,
      uidGouvernance,
      dateDeModification
    )
  }

  state(): {
    dateDeModification: Date
    nom: string
    perimetreGeographique: string
    porteur: string
    uidEditeur: string
    uidGouvernance: string
  } {
    return {
      dateDeModification: this.dateDeModification,
      nom: this.nom,
      perimetreGeographique: this.perimetreGeographique,
      porteur: this.porteur,
      uidEditeur: this.uidEditeur,
      uidGouvernance: this.uidGouvernance,
    }
  }
}
