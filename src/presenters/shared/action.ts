import { StatutSubvention } from '@/use-cases/queries/shared/ActionReadModel'

export const actionStatutViewModelByStatut: Record<StatutSubvention, ActionStatutViewModel> = {
  acceptee: {
    background: 'purple',
    display : true,
    icon: 'flashlight-line',
    libelle: 'Subvention acceptée',
    variant: 'success',
  },
  deposee: {
    background: 'purple',
    display : true,
    icon: 'flashlight-line',
    libelle: 'Demande déposée',
    variant: 'new',
  },
  enCours: {
    background: 'green',
    display : true,
    icon: 'user-add-line',
    libelle: 'Instruction en cours',
    variant: 'info',
  },
  nonSubventionnee: {
    background: 'blue',
    display : false,
    icon: 'user-star-line',
    libelle: 'Non subventionnée',
    variant: 'warning',
  },
  refusee: {
    background: 'green',
    display : true,
    icon: 'user-star-line',
    libelle: 'Subvention refusée',
    variant: 'error',
  },
}

export type ActionStatutViewModel = Readonly<{
  background: 'blue' | 'green' | 'pink' | 'purple' | 'red' | 'white'
  display: boolean
  icon: string
  libelle: string
  variant: 'error' | 'info' | 'new' | 'success' | 'warning'
}>
