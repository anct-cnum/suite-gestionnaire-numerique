export function feuilleDeRoutePresenter(): FeuilleDeRouteViewModel {
  return {
    contratPreexistant: false,
    formulaire: {
      contratPreexistant: [
        {
          id: 'oui',
          isChecked: false,
          label: 'Oui',
        },
        {
          id: 'non',
          isChecked: true,
          label: 'Non',
        },
      ],
      membres: [
        {
          isSelected: false,
          label: 'Choisir',
          uid: '',
        },
        {
          isSelected: false,
          label: 'Croix Rouge Française',
          uid: 'membre1FooId',
        },
        {
          isSelected: true,
          label: 'La Poste',
          uid: 'membre2FooId',
        },
      ],
      perimetres: [
        {
          id: 'regional',
          isChecked: false,
          label: 'Régional',
        },
        {
          id: 'departemental',
          isChecked: true,
          label: 'Départemental',
        },
        {
          id: 'epci_groupement',
          isChecked: false,
          label: 'EPCI ou groupement de communes',
        },
      ],
    },
    infosActions: '3 actions, 5 bénéficiaires, 3 co-financeurs',
    infosDerniereEdition: 'Modifiée le 23/11/2024 par Lucie Brunot',
    nom: 'Feuille de route FNE',
    perimetre: 'Périmètre départemental',
    porteur: 'CC des Monts du Lyonnais',
    uidFeuilleDeRoute: 'feuilleDeRouteFooId',
    uidGouvernance: 'gouvernanceFooId',
  }
}

export type FeuilleDeRouteViewModel = Readonly<{
  contratPreexistant: boolean
  formulaire: Readonly<{
    contratPreexistant: ReadonlyArray<{
      id: 'oui' | 'non'
      isChecked: boolean
      label: string
    }>
    membres: ReadonlyArray<{
      isSelected: boolean
      label: string
      uid: string
    }>
    perimetres: ReadonlyArray<{
      id: 'regional' | 'departemental' | 'epci_groupement'
      isChecked: boolean
      label: string
    }>
  }>
  infosActions: string
  infosDerniereEdition: string
  nom: string
  perimetre: string
  porteur: string
  uidFeuilleDeRoute: string
  uidGouvernance: string
}>
