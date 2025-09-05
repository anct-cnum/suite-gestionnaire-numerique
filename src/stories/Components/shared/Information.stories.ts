import Information from '../../../components/shared/Information/Information'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Information> = {
  component: Information,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Information',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Information complémentaire',
  },
}

export const LongLabel: Story = {
  args: {
    label: 'Ceci est une information détaillée qui explique le contexte et fournit des détails supplémentaires à l\'utilisateur',
  },
}

export const InformationCourte: Story = {
  args: {
    label: 'Aide',
  },
}