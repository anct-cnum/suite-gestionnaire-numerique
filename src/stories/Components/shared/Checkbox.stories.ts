import Checkbox from '../../../components/shared/Checkbox/Checkbox'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Checkbox> = {
  argTypes: {
    isSelected: {
      control: 'boolean',
    },
  },
  component: Checkbox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Checkbox',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Option à cocher',
    id: 'checkbox-1',
    isSelected: false,
    label: 'option',
    value: 'value-1',
  },
}

export const Coche: Story = {
  args: {
    children: 'Option cochée',
    id: 'checkbox-2',
    isSelected: true,
    label: 'option-selected',
    value: 'value-2',
  },
}

export const LongTexte: Story = {
  args: {
    children: 'Cette option contient un texte beaucoup plus long pour tester l\'affichage sur plusieurs lignes',
    id: 'checkbox-3',
    isSelected: false,
    label: 'option-long',
    value: 'value-3',
  },
}