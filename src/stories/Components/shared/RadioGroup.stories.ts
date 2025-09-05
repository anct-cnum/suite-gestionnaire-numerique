import RadioGroup from '../../../components/shared/Radio/RadioGroup'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/RadioGroup',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    nomGroupe: 'choix',
    options: [
      { isSelected: false, label: 'Option 1', value: 'option1' },
      { isSelected: false, label: 'Option 2', value: 'option2' },
      { isSelected: false, label: 'Option 3', value: 'option3' },
    ],
  },
}

export const AvecSelection: Story = {
  args: {
    nomGroupe: 'choix-selectionne',
    options: [
      { isSelected: false, label: 'Option 1', value: 'option1' },
      { isSelected: true, label: 'Option 2', value: 'option2' },
      { isSelected: false, label: 'Option 3', value: 'option3' },
    ],
    value: 'option2',
  },
}

export const OuiNon: Story = {
  args: {
    nomGroupe: 'oui-non',
    options: [
      { isSelected: true, label: 'Oui', value: 'oui' },
      { isSelected: false, label: 'Non', value: 'non' },
    ],
    value: 'oui',
  },
}

export const PlusieursOptions: Story = {
  args: {
    nomGroupe: 'taille',
    options: [
      { isSelected: false, label: 'Très petite', value: 'xs' },
      { isSelected: false, label: 'Petite', value: 's' },
      { isSelected: true, label: 'Moyenne', value: 'm' },
      { isSelected: false, label: 'Grande', value: 'l' },
      { isSelected: false, label: 'Très grande', value: 'xl' },
    ],
  },
}