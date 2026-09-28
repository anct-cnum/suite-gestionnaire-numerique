import { createDefaultStructureViewModel, createStructureViewModelWithMinimalData } from './StructureTestData'
import StructureConventions from '@/components/Structure/StructureConventions'
import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from '@/presenters/shared/enveloppe'
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
type Story = StoryObj

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
          color: obtenirCouleurEnveloppe('Formation Aidant Numérique/Aidants Connect - 2024 - État'),
          couleurGraphique: obtenirCouleurGraphique(
            obtenirCouleurEnveloppe('Formation Aidant Numérique/Aidants Connect - 2024 - État')
          ),
          libelle: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
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
