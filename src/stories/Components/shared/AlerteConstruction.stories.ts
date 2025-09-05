import AlerteConstruction from '../../../components/shared/AlerteConstruction/AlerteConstruction'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof AlerteConstruction> = {
  component: AlerteConstruction,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/AlerteConstruction',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AvecClasseCustom: Story = {
  args: {
    className: 'fr-mt-8w',
  },
}