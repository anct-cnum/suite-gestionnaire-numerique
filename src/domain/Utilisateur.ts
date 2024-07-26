import { type Categorisation, Role, type RoleState } from './Role'
import { Model } from './shared/Model'

export class Utilisateur implements Model {
  readonly #role: Role
  readonly #nom: string
  readonly #prenom: string
  readonly #email: string

  constructor(role: Role, nom: string, prenom: string, email: string) {
    this.#role = role
    this.#nom = nom
    this.#prenom = prenom
    this.#email = email
  }

  state(): UtilisateurState {
    return {
      email: this.#email,
      nom: this.#nom,
      prenom: this.#prenom,
      role: this.#role.state(),
    }
  }

  categorie(): Categorisation {
    return this.#role.categorie()
  }
}

type UtilisateurState = Readonly<{
  nom: string
  prenom: string
  email: string
  role: RoleState
}>
