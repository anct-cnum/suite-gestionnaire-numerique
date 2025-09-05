import Select from '../../../components/shared/Select/Select'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

const meta: Meta<typeof Select> = {
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    isPlaceholderSelectable: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
  component: Select,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  title: 'Components/Shared/Select',
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Choisir une option',
    id: 'select-exemple',
    name: 'exemple',
    options: [
      { isSelected: false, label: 'Option 1', value: '1' },
      { isSelected: false, label: 'Option 2', value: '2' },
      { isSelected: false, label: 'Option 3', value: '3' },
    ],
  },
}

export const AvecSelection: Story = {
  args: {
    children: 'Option pré-sélectionnée',
    id: 'select-selected',
    name: 'selected',
    options: [
      { isSelected: false, label: 'Option 1', value: '1' },
      { isSelected: true, label: 'Option 2', value: '2' },
      { isSelected: false, label: 'Option 3', value: '3' },
    ],
  },
}

export const Obligatoire: Story = {
  args: {
    children: 'Sélection obligatoire',
    id: 'select-required',
    name: 'required',
    options: [
      { isSelected: false, label: 'Oui', value: 'oui' },
      { isSelected: false, label: 'Non', value: 'non' },
    ],
    required: true,
  },
}

export const Desactive: Story = {
  args: {
    children: 'Sélection désactivée',
    disabled: true,
    id: 'select-disabled',
    name: 'disabled',
    options: [
      { isSelected: false, label: 'Option 1', value: '1' },
      { isSelected: true, label: 'Option 2', value: '2' },
    ],
  },
}

export const PlaceholderSelectable: Story = {
  args: {
    children: 'Avec placeholder sélectionnable',
    id: 'select-placeholder',
    isPlaceholderSelectable: true,
    name: 'placeholder',
    options: [
      { isSelected: false, label: 'Rouge', value: 'rouge' },
      { isSelected: false, label: 'Vert', value: 'vert' },
      { isSelected: false, label: 'Bleu', value: 'bleu' },
    ],
    placeholder: 'Aucune sélection',
  },
}

export const AvecNombres: Story = {
  args: {
    children: 'Sélection numérique',
    id: 'select-numbers',
    name: 'numbers',
    options: [
      { isSelected: false, label: 'Un', value: 1 },
      { isSelected: false, label: 'Deux', value: 2 },
      { isSelected: true, label: 'Trois', value: 3 },
      { isSelected: false, label: 'Quatre', value: 4 },
    ],
  },
}