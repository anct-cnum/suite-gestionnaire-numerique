import Toggle from '../../../components/shared/Toggle/Toggle'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Toggle> = {
  argTypes: {
    defaultChecked: {
      control: 'boolean',
    },
    hasSeparator: {
      control: 'boolean',
    },
  },
  component: Toggle,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Toggle',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Activer cette option',
    name: 'toggle-exemple',
  },
}

export const Coche: Story = {
  args: {
    children: 'Option activée par défaut',
    defaultChecked: true,
    name: 'toggle-checked',
  },
}

export const AvecSeparateur: Story = {
  args: {
    children: 'Toggle avec séparateur',
    hasSeparator: true,
    name: 'toggle-separator',
  },
}

export const CocheAvecSeparateur: Story = {
  args: {
    children: 'Toggle activé avec séparateur',
    defaultChecked: true,
    hasSeparator: true,
    name: 'toggle-checked-separator',
  },
}

export const LongTexte: Story = {
  args: {
    children: 'Ceci est un toggle avec un texte beaucoup plus long pour tester l\'affichage sur plusieurs lignes',
    name: 'toggle-long',
  },
}