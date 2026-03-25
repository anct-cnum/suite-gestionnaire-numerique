import {
  createDefaultStructureViewModel,
  createStructureViewModelWithMinimalData,
} from './StructureTestData'
import StructureContactReferent from '@/components/Structure/StructureContactReferent'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureContactReferent> = {
  argTypes: {
    contacts: {
      description: 'Liste des contacts de la structure',
    },
  },
  component: StructureContactReferent,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureContactReferent',
}

export default meta
type Story = StoryObj

const defaultViewModel = createDefaultStructureViewModel()

export const Default: Story = {
  args: {
    contacts: defaultViewModel.contacts,
    structureId: defaultViewModel.structureId,
  },
}

export const SansInformations: Story = {
  args: {
    contacts: createStructureViewModelWithMinimalData().contacts,
    structureId: createStructureViewModelWithMinimalData().structureId,
  },
}

export const AvecFonctionLongue: Story = {
  args: {
    contacts: [
      {
        ...defaultViewModel.contacts[0],
        fonction: "Directeur adjoint en charge de l'inclusion numérique et de la médiation sociale",
      },
    ],
    structureId: defaultViewModel.structureId,
  },
}

export const PlusieursContacts: Story = {
  args: {
    contacts: [
      ...defaultViewModel.contacts,
      {
        email: 'marie.martin@structure-exemple.fr',
        estReferentFNE: false,
        fonction: 'Responsable technique',
        id: 2,
        nom: 'Martin',
        prenom: 'Marie',
        telephone: '01 98 76 54 32',
      },
    ],
    structureId: defaultViewModel.structureId,
  },
}
