export function feuilleDeRoutePresenter(codeDepartement: string): FeuilleDeRouteViewModel {
  return {
    codeDepartement,
    contratPreexistant: false,
    infosActions: '3 actions, 5 bénéficiaires, 3 co-financeurs',
    infosDerniereEdition: 'Modifiée le 23/11/2024 par Lucie Brunot',
    perimetre: 'Périmètre départemental',
    porteur: 'CC des Monts du Lyonnais',
  }
}

export type FeuilleDeRouteViewModel = Readonly<{
  codeDepartement: string
  porteur: string
  perimetre: string
  infosActions: string
  infosDerniereEdition: string
  contratPreexistant: boolean
}>
