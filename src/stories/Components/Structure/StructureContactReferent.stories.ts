import { createDefaultStructureViewModel, createStructureViewModelWithMinimalData } from './StructureTestData'
import StructureContactReferent from '@/components/Structure/StructureContactReferent'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureContactReferent> = {
  argTypes: {
    contactReferent: {
      description: 'Informations du contact référent de la structure',
    },
  },
  component: StructureContactReferent,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureContactReferent',
}

export default meta
type Story = StoryObj<typeof meta>

const defaultViewModel = createDefaultStructureViewModel()

export const Default: Story = {
  args: {
    contactReferent: defaultViewModel.contactReferent,
    structureId: defaultViewModel.structureId,
  },
}

export const SansInformations: Story = {
  args: {
    contactReferent: createStructureViewModelWithMinimalData().contactReferent,
    structureId: createStructureViewModelWithMinimalData().structureId,
  },
}

export const AvecFonctionLongue: Story = {
  args: {
    contactReferent: {
      ...defaultViewModel.contactReferent,
      fonction: 'Directeur adjoint en charge de l\'inclusion numérique et de la médiation sociale',
    },
    structureId: defaultViewModel.structureId,
  },
}
