export interface EligibiliteLabelConumLoader {
  derniereAttestation(structureId: number): Promise<Date | null>
  estEligible(structureId: number): Promise<boolean>
}
