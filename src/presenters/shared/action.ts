import { StatutSubvention } from '@/domain/DemandeDeSubvention'

export const actionStatutViewModelByStatut: Record<'nonSubventionnee'|StatutSubvention, ActionStatutViewModel> = {
  acceptee: {
    background: 'purple',
    display : true,
    icon: 'flashlight-line',
    libelle: 'Subvention validée',
    variant: 'success',
  },
  deposee: {
    background: 'purple',
    display : true,
    icon: 'flashlight-line',
    libelle: 'Demande envoyée',
    variant: 'new',
  },
  enCours: {
    background: 'green',
    display : true,
    icon: 'user-add-line',
    libelle: 'Demande en cours d\'instruction',
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
