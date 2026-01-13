import { createDefaultStructureViewModel, createStructureViewModelWithMinimalData } from './StructureTestData'
import StructureConventions from '@/components/Structure/StructureConventions'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureConventions> = {
  argTypes: {
    conventionsEtFinancements: {
      description: 'Informations sur les conventions et financements de la structure',
    },
  },
  component: StructureConventions,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureConventions',
}

export default meta
type Story = StoryObj<typeof meta>

const defaultViewModel = createDefaultStructureViewModel()

export const Default: Story = {
  args: {
    conventionsEtFinancements: defaultViewModel.conventionsEtFinancements,
  },
}

export const SansConventions: Story = {
  args: {
    conventionsEtFinancements: createStructureViewModelWithMinimalData().conventionsEtFinancements,
  },
}

export const AvecUneSeuleConvention: Story = {
  args: {
    conventionsEtFinancements: {
      ...defaultViewModel.conventionsEtFinancements,
      conventions: [defaultViewModel.conventionsEtFinancements.conventions[0]],
    },
  },
}

export const AvecPlusieursEnveloppes: Story = {
  args: {
    conventionsEtFinancements: {
      ...defaultViewModel.conventionsEtFinancements,
      enveloppes: [
        ...defaultViewModel.conventionsEtFinancements.enveloppes,
        {
          color: 'france',
          libelle: 'Aide exceptionnelle',
          montant: 50000,
          montantFormate: '50 000 €',
        },
      ],
    },
  },
}

export const ToutesConventionsExpirees: Story = {
  args: {
    conventionsEtFinancements: {
      ...defaultViewModel.conventionsEtFinancements,
      conventions: defaultViewModel.conventionsEtFinancements.conventions.map((convention) => ({
        ...convention,
        statut: {
          libelle: 'Expirée',
          variant: 'error',
        },
      })),
    },
  },
}
