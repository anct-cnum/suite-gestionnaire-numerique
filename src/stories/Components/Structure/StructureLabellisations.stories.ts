import StructureLabellisations from '@/components/Structure/StructureLabellisations'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof StructureLabellisations> = {
  component: StructureLabellisations,
  title: 'Components/Structure/StructureLabellisations',
}

export default meta
type Story = StoryObj

export const LabelActifEtHabilitee: Story = {
  args: {
    labellisations: {
      estHabiliteeAidantsConnect: true,
      labelConum: {
        estActif: true,
        statut: "Jusqu'au 12/12/2026",
      },
    },
  },
}

export const LabelSuspendu: Story = {
  args: {
    labellisations: {
      estHabiliteeAidantsConnect: false,
      labelConum: {
        estActif: false,
        statut: 'Suspendu',
      },
    },
  },
}

export const HabilitationSeule: Story = {
  args: {
    labellisations: {
      estHabiliteeAidantsConnect: true,
      labelConum: undefined,
    },
  },
}
