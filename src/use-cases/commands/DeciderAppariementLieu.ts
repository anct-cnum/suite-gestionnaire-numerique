import { CommandHandler, ResultAsync } from '../CommandHandler'

// Décision humaine sur une paire record carto × lieu coop (#1845) : valider ou
// rejeter TOUS les segments de la paire encore « a_valider ». La décision est
// tracée (decide_par / decide_le) et n'est jamais écrasée par les runs du DAG
// dataspace lieu-appariement. La fusion effective des paires validées est un
// chaînon séparé côté Entrepôt (#1724 étapes 5.2-5.4), hors périmètre.
export class DeciderAppariementLieu implements CommandHandler<Command, DeciderAppariementFailure> {
  readonly #date: Date
  readonly #repository: AppariementLieuRepository

  constructor(repository: AppariementLieuRepository, date: Date) {
    this.#date = date
    this.#repository = repository
  }

  async handle(command: Command): ResultAsync<DeciderAppariementFailure> {
    const nombreDeSegments = await this.#repository.decider({
      cartoRecordId: command.cartoRecordId,
      decideLe: this.#date,
      decidePar: command.decidePar,
      lieuId: command.lieuId,
      statut: command.decision,
    })

    // Aucun segment « a_valider » : paire inconnue, ou déjà tranchée (course entre deux relecteurs).
    return nombreDeSegments === 0 ? 'appariementIntrouvable' : 'OK'
  }
}

export interface AppariementLieuRepository {
  // Renvoie le nombre de segments passés au statut décidé.
  decider(decision: DecisionAppariement): Promise<number>
}

export type DeciderAppariementFailure = 'appariementIntrouvable'

export type DecisionAppariementLieu = 'rejete' | 'valide'

export type DecisionAppariement = Readonly<{
  cartoRecordId: string
  decideLe: Date
  decidePar: string
  lieuId: number
  statut: DecisionAppariementLieu
}>

type Command = Readonly<{
  cartoRecordId: string
  decidePar: string
  decision: DecisionAppariementLieu
  lieuId: number
}>
