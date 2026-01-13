import { createDefaultStructureViewModel, createStructureViewModelWithMinimalData } from './StructureTestData'
import Structure from '@/components/Structure/Structure'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Structure> = {
  argTypes: {
    viewModel: {
      description: 'Données complètes de la structure',
    },
  },
  component: Structure,
  parameters: {
    layout: 'fullscreen',
  },
  title: 'Components/Structure/Structure',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    viewModel: createDefaultStructureViewModel(),
  },
}

export const AvecDonneesMinimales: Story = {
  args: {
    viewModel: createStructureViewModelWithMinimalData(),
  },
}

export const StructureLabelliseeFranceServices: Story = {
  args: {
    viewModel: {
      ...createDefaultStructureViewModel(),
      identite: {
        ...createDefaultStructureViewModel().identite,
        nom: 'France Services de Lyon',
        typologie: 'France Services',
      },
      role: {
        ...createDefaultStructureViewModel().role,
        gouvernances: [
          {
            code: '69',
            nom: 'Rhône (69)',
            roles: [
              {
                color: 'blue-france',
                nom: 'France Services',
              },
            ],
          },
        ],
      },
    },
  },
}

export const StructureAvecBeaucoupDeContrats: Story = {
  args: {
    viewModel: {
      ...createDefaultStructureViewModel(),
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
        {
          contrat: 'CDD',
          dateDebut: '15/06/2022',
          dateFin: '14/06/2023',
          dateRupture: '01/03/2023',
          mediateur: 'Thomas Bernard',
          role: 'Aidant numérique',
          statut: {
            libelle: 'Expirée',
            variant: 'error',
          },
        },
      ],
    },
  },
}
