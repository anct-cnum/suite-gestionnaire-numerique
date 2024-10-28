export interface MesInformationsPersonnellesLoader {
  findByUid: (uid: string) => Promise<MesInformationsPersonnellesReadModel>
}

export type MesInformationsPersonnellesReadModel = Readonly<{
  email: string
  nom: string
  prenom: string
  role: string
  structure?: Readonly<{
    adresse: string
    contact: Readonly<{
      email: string
      fonction: string
      nom: string
      prenom: string
    }>
    numeroDeSiret: string
    raisonSociale: string
    typeDeStructure: string
  }>
  telephone: string
}>
