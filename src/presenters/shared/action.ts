import { StatutSubvention } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export const actionStatutViewModelByStatut: Record<StatutSubvention | 'nonSubventionnee', ActionStatutViewModel> = {
  acceptee: {
    background: 'purple',
    icon: 'flashlight-line',
    libelle: 'Subvention acceptée',
    variant: 'success',
  },
  deposee: {
    background: 'purple',
    icon: 'flashlight-line',
    libelle: 'Demande déposée',
    variant: 'new',
  },
  enCours: {
    background: 'green',
    icon: 'user-add-line',
    libelle: 'Instruction en cours',
    variant: 'info',
  },
  nonSubventionnee: {
    background: 'blue',
    icon: 'user-star-line',
    libelle: 'Non subventionnée',
    variant: 'warning',
  },
  refusee: {
    background: 'green',
    icon: 'user-star-line',
    libelle: 'Subvention refusée',
    variant: 'error',
  },
}

export type ActionStatutViewModel = Readonly<{
  background: 'purple' | 'green' | 'pink' | 'red' | 'white' | 'blue'
  icon: string
  libelle: string
  variant: 'success' | 'error' | 'info' | 'warning' | 'new'
}>
