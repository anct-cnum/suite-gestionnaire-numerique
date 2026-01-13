import { createDefaultStructureViewModel } from './StructureTestData'
import StructureHeader from '@/components/Structure/StructureHeader'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureHeader> = {
  argTypes: {
    gouvernances: {
      description: 'Liste des gouvernances avec leurs rôles',
    },
    identite: {
      description: 'Informations d\'identité de la structure',
    },
  },
  component: StructureHeader,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureHeader',
}

export default meta
type Story = StoryObj<typeof meta>

const defaultViewModel = createDefaultStructureViewModel()

export const Default: Story = {
  args: {
    gouvernances: defaultViewModel.role.gouvernances,
    identite: defaultViewModel.identite,
  },
}

export const SansRoles: Story = {
  args: {
    gouvernances: [],
    identite: defaultViewModel.identite,
  },
}

export const AvecUneSeuleGouvernance: Story = {
  args: {
    gouvernances: [defaultViewModel.role.gouvernances[0]],
    identite: defaultViewModel.identite,
  },
}

export const SansDateEdition: Story = {
  args: {
    gouvernances: defaultViewModel.role.gouvernances,
    identite: {
      ...defaultViewModel.identite,
      editeur: '-',
      edition: '-',
    },
  },
}
