import { createDefaultStructureViewModel } from './StructureTestData'
import StructureIdentite from '@/components/Structure/StructureIdentite'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureIdentite> = {
  argTypes: {
    identite: {
      description: 'Informations d\'identité de la structure',
    },
  },
  component: StructureIdentite,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureIdentite',
}

export default meta
type Story = StoryObj<typeof meta>

const defaultViewModel = createDefaultStructureViewModel()

export const Default: Story = {
  args: {
    identite: defaultViewModel.identite,
  },
}

export const TypologieCollectiviteTerritoriale: Story = {
  args: {
    identite: {
      ...defaultViewModel.identite,
      nom: 'Mairie de Lyon',
      typologie: 'Collectivité territoriale',
    },
  },
}

export const TypologieEntreprise: Story = {
  args: {
    identite: {
      ...defaultViewModel.identite,
      nom: 'Entreprise d\'insertion numérique',
      typologie: 'Entreprise',
    },
  },
}
