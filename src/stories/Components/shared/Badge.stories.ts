import Badge from '../../../components/shared/Badge/Badge'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Badge> = {
  argTypes: {
    color: {
      control: 'select',
      options: ['success', 'error', 'warning', 'info', 'new', 'purple-glycine'],
    },
    icon: {
      control: 'boolean',
    },
    small: {
      control: 'boolean',
    },
  },
  component: Badge,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Badge',
}

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    children: 'Succès',
    color: 'success',
  },
}

export const ErrorState: Story = {
  args: {
    children: 'Erreur',
    color: 'error',
  },
}

export const Warning: Story = {
  args: {
    children: 'Attention',
    color: 'warning',
  },
}

export const Info: Story = {
  args: {
    children: 'Information',
    color: 'info',
  },
}

export const New: Story = {
  args: {
    children: 'Nouveau',
    color: 'new',
  },
}

export const AvecIcon: Story = {
  args: {
    children: 'Avec icône',
    color: 'success',
    icon: true,
  },
}

export const Petit: Story = {
  args: {
    children: 'Petit badge',
    color: 'info',
    small: true,
  },
}

export const PetitAvecIcon: Story = {
  args: {
    children: 'Petit avec icône',
    color: 'success',
    icon: true,
    small: true,
  },
}