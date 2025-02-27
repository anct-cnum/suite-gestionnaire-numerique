import { FeuillesDeRouteReadModel } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export const actionStatutViewModelByStatut: Record<FeuillesDeRouteReadModel['feuillesDeRoute'][number]['actions'][number]['statut'], ActionStatutViewModel> = {
  deposee: {
    background: 'purple',
    icon: 'flashlight-line',
    iconStyle: 'pin-action--deposee',
    libelle: 'Demande déposée',
    variant: 'new',
  },
  enCours: {
    background: 'green',
    icon: 'user-add-line',
    iconStyle: 'pin-action--en-cours',
    libelle: 'Instruction en cours',
    variant: 'info',
  },
  subventionAcceptee: {
    background: 'purple',
    icon: 'flashlight-line',
    iconStyle: 'pin-action-acceptee',
    libelle: 'Subvention acceptée',
    variant: 'success',
  },
  subventionRefusee: {
    background: 'green',
    icon: 'user-star-line',
    iconStyle: 'pin-action--refusee',
    libelle: 'Subvention refusée',
    variant: 'error',
  },
}

export type ActionStatutViewModel = Readonly<{
  background: 'purple' | 'green' | 'pink' | 'red' | 'white' | 'blue'
  icon: string
  libelle: string
  variant: 'success' | 'error' | 'info' | 'warning' | 'new'
  iconStyle: string
}>
