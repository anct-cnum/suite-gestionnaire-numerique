
export interface RepartitionSubventionGouvernanceLoader {
  get(uidGouvernance: string): Promise<ReadonlyMap<string, number>>
}

