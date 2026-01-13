import { createDefaultStructureViewModel, createStructureViewModelWithMinimalData } from './StructureTestData'
import StructureRole from '@/components/Structure/StructureRole'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureRole> = {
  argTypes: {
    role: {
      description: 'Informations sur le rôle de la structure',
    },
  },
  component: StructureRole,
  parameters: {
    layout: 'padded',
  },
  title: 'Components/Structure/StructureRole',
}

export default meta
type Story = StoryObj<typeof meta>

const defaultViewModel = createDefaultStructureViewModel()

export const Default: Story = {
  args: {
    role: defaultViewModel.role,
  },
}

export const SansGouvernances: Story = {
  args: {
    role: createStructureViewModelWithMinimalData().role,
  },
}

export const AvecUneSeuleGouvernance: Story = {
  args: {
    role: {
      ...defaultViewModel.role,
      gouvernances: [defaultViewModel.role.gouvernances[0]],
    },
  },
}

export const AvecUnSeulRoleParGouvernance: Story = {
  args: {
    role: {
      ...defaultViewModel.role,
      gouvernances: defaultViewModel.role.gouvernances.map((gouvernance) => ({
        ...gouvernance,
        roles: [gouvernance.roles[0]],
      })),
    },
  },
}

export const AvecTousLesTypesDeRoles: Story = {
  args: {
    role: {
      ...defaultViewModel.role,
      gouvernances: [
        {
          code: '75',
          nom: 'Paris (75)',
          roles: [
            {
              color: 'info',
              nom: 'Co-porteur',
            },
            {
              color: 'warning',
              nom: 'Co-financeur',
            },
            {
              color: 'purple-glycine',
              nom: 'Bénéficiaire',
            },
            {
              color: 'green-tilleul-verveine',
              nom: 'Formation',
            },
            {
              color: 'beige-gris-galet',
              nom: 'Observateur',
            },
            {
              color: 'green-archipel',
              nom: 'Récipiendaire',
            },
          ],
        },
      ],
    },
  },
}
