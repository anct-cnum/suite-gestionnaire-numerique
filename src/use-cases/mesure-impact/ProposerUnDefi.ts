import { QueryHandler } from '../QueryHandler'
import { DefiAProposer, defiAProposer } from '@/domain/mesure-impact/AntiAbus'
import { heureDeDepot } from '@/domain/mesure-impact/Reponse'

// Défi à résoudre par le navigateur avant d'envoyer un questionnaire en ligne, plus difficile quand la
// campagne reçoit une rafale de réponses. Les réponses sont comptées depuis le début de l'heure, seule
// précision gardée pour leur heure de dépôt.
export class ProposerUnDefi implements QueryHandler<Query, string> {
  readonly #date: Date
  readonly #fabrique: FabriqueDeDefi
  readonly #loader: ReponsesDeLHeureLoader

  constructor(loader: ReponsesDeLHeureLoader, fabrique: FabriqueDeDefi, date: Date) {
    this.#loader = loader
    this.#fabrique = fabrique
    this.#date = date
  }

  async handle({ identifiantPublic }: Query): Promise<string> {
    const reponsesDeLHeure = await this.#loader.nombreDepuis(identifiantPublic, heureDeDepot(this.#date))
    return this.#fabrique.creer({ ...defiAProposer(reponsesDeLHeure, this.#date), identifiantPublic })
  }
}

export interface ReponsesDeLHeureLoader {
  nombreDepuis(identifiantPublic: string, depuis: Date): Promise<number>
}

// Le défi est un jeton opaque, signé, transmis tel quel au navigateur
export interface FabriqueDeDefi {
  creer(defi: DefiAProposer & Readonly<{ identifiantPublic: string }>): Promise<string>
}

type Query = Readonly<{
  identifiantPublic: string
}>
