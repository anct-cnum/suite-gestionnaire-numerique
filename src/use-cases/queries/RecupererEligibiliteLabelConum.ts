export interface EligibiliteLabelConumLoader {
  estEligible(structureId: number): Promise<boolean>
}
