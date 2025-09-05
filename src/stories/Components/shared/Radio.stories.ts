import Radio from '../../../components/shared/Radio/Radio'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Radio> = {
  argTypes: {
    isChecked: {
      control: 'boolean',
    },
  },
  component: Radio,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Radio',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Option 1',
    id: 'radio-1',
    isChecked: false,
    nomGroupe: 'exemple',
  },
}

export const Selectionne: Story = {
  args: {
    children: 'Option sélectionnée',
    id: 'radio-2',
    isChecked: true,
    nomGroupe: 'exemple',
  },
}

export const LongTexte: Story = {
  args: {
    children: 'Cette option radio contient un texte beaucoup plus long pour tester l\'affichage',
    id: 'radio-3',
    isChecked: false,
    nomGroupe: 'exemple',
  },
}