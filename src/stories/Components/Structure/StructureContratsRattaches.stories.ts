import { createDefaultStructureViewModel } from './StructureTestData'
import StructureContratsRattaches from '@/components/Structure/StructureContratsRattaches'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureContratsRattaches> = {
  argTypes: {
    contratsRattaches: {
      description: 'Liste des contrats rattachés à la structure',
    },
  },
  component: StructureContratsRattaches,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureContratsRattaches',
}

export default meta
type Story = StoryObj<typeof meta>

const defaultViewModel = createDefaultStructureViewModel()

export const Default: Story = {
  args: {
    contratsRattaches: defaultViewModel.contratsRattaches,
  },
}

export const SansContrats: Story = {
  args: {
    contratsRattaches: [],
  },
}

export const AvecUnSeulContrat: Story = {
  args: {
    contratsRattaches: [defaultViewModel.contratsRattaches[0]],
  },
}

export const AvecPlusieursContratsEnCours: Story = {
  args: {
    contratsRattaches: [
      {
        contrat: 'CDI',
        dateDebut: '01/01/2023',
        dateFin: '31/12/2025',
        dateRupture: '-',
        mediateur: 'Sophie Martin',
        role: 'Médiateur numérique',
        statut: {
          libelle: 'En cours',
          variant: 'success',
        },
      },
      {
        contrat: 'CDI',
        dateDebut: '01/03/2023',
        dateFin: '28/02/2026',
        dateRupture: '-',
        mediateur: 'Pierre Dubois',
        role: 'Coordinateur',
        statut: {
          libelle: 'En cours',
          variant: 'success',
        },
      },
      {
        contrat: 'CDD',
        dateDebut: '15/09/2024',
        dateFin: '14/09/2025',
        dateRupture: '-',
        mediateur: 'Marie Lefebvre',
        role: 'Aidant numérique',
        statut: {
          libelle: 'En cours',
          variant: 'success',
        },
      },
    ],
  },
}

export const TousContratsExpires: Story = {
  args: {
    contratsRattaches: defaultViewModel.contratsRattaches.map((contrat) => ({
      ...contrat,
      statut: {
        libelle: 'Expirée',
        variant: 'error',
      },
    })),
  },
}
